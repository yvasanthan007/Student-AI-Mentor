from __future__ import annotations

from datetime import datetime
import os
import pandas as pd
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.schemas import LoginRequest, RegisterRequest

router = APIRouter()

# Path to Excel file
ROOT_DIR = Path(__file__).resolve().parents[3]
EXCEL_FILE = ROOT_DIR / "sample_data" / "CYBER_Students_Combined.xlsx"

def load_students_from_excel():
    """Load students from Excel file - Maps Roll No to Name"""
    try:
        if not EXCEL_FILE.exists():
            raise FileNotFoundError(f"Excel file not found: {EXCEL_FILE}")
        
        df = pd.read_excel(EXCEL_FILE)
        students = {}
        
        # Map Roll No to Name
        for _, row in df.iterrows():
            roll_no = str(row['Roll No']).strip().lower()
            name = str(row['Name']).strip()
            
            if roll_no and name:
                students[roll_no] = name
        
        print(f"[OK] Loaded {len(students)} students from Excel")
        return students
    except Exception as e:
        print(f"[ERR] Error loading Excel file: {e}")
        return {}

# Load students once on startup
STUDENTS_DB = load_students_from_excel()

@router.post("/login")
def login(payload: LoginRequest):
    """
    Login endpoint - verify roll number and password
    
    Roll Number example: 24CY001
    Password: Any password (production should use hashing)
    """
    try:
        username = payload.username.strip().lower() if payload.username else ""
        password = payload.password.strip() if payload.password else ""
        
        if not username or not password:
            raise HTTPException(status_code=400, detail="Roll Number and password required")
        
        # Check if roll number exists in Excel
        if username not in STUDENTS_DB:
            raise HTTPException(
                status_code=401, 
                detail=f"Roll Number '{payload.username}' not found. Please sign up first."
            )
        
        student_name = STUDENTS_DB[username]
        
        # In production, implement proper password hashing and verification
        # For now, accept any non-empty password
        token = f"token-{username}-{int(datetime.utcnow().timestamp())}"
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "username": username.upper(),  # Show as uppercase (e.g., 24CY001)
                "name": student_name,
                "role": "student",
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/register")
def register(payload: RegisterRequest):
    """
    Register endpoint - verify roll number exists in Excel
    
    Roll Number: Must be from CYBER_Students_Combined.xlsx (e.g., 24CY001)
    Password: Create a password (min 4 characters)
    Confirm Password: Must match password
    """
    try:
        reg_number = payload.register_number.strip().lower() if payload.register_number else ""
        password = payload.password.strip() if payload.password else ""
        confirm_password = payload.confirm_password.strip() if payload.confirm_password else ""
        
        if not reg_number or not password or not confirm_password:
            raise HTTPException(status_code=400, detail="All fields required")
        
        if password != confirm_password:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        
        if len(password) < 4:
            raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
        
        # Check if roll number exists in Excel
        if reg_number not in STUDENTS_DB:
            raise HTTPException(
                status_code=401, 
                detail=f"Roll Number '{payload.register_number}' not found in system. Please check your roll number."
            )
        
        student_name = STUDENTS_DB[reg_number]
        
        # In production, store password securely with hashing
        # For now, just verify it's valid
        token = f"token-{reg_number}-{int(datetime.utcnow().timestamp())}"
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "username": reg_number.upper(),  # Show as uppercase (e.g., 24CY001)
                "name": student_name,
                "role": "student",
            },
            "message": f"Welcome {student_name}! Registration successful. You are logged in."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


