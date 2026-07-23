from __future__ import annotations

import os
import pandas as pd
from datetime import datetime
from pathlib import Path
 
from fastapi import APIRouter, Depends, HTTPException, status
import bcrypt
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.schemas import LoginRequest, RegisterRequest

router = APIRouter()

ROOT_DIR = Path(__file__).resolve().parents[3]
EXCEL_FILE = ROOT_DIR / "sample_data" / "CYBER_Students_Combined.xlsx"


def load_students_from_excel() -> dict[str, str]:
    try:
        if not EXCEL_FILE.exists():
            raise FileNotFoundError(f"Excel file not found: {EXCEL_FILE}")

        df = pd.read_excel(EXCEL_FILE)
        students = {}

        for _, row in df.iterrows():
            roll_no = str(row["Roll No"]).strip().lower()
            name = str(row["Name"]).strip()

            if roll_no and name:
                students[roll_no] = name

        print(f"Loaded {len(students)} students from Excel")
        return students
    except Exception as e:
        print(f"Error loading Excel file: {e}")
        return {}


STUDENTS_DB = load_students_from_excel()


def get_user_by_roll(db: Session, roll_number: str) -> User | None:
    return db.query(User).filter(User.roll_number == roll_number).first()


def create_user(db: Session, roll_number: str, name: str, password: str) -> User:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(roll_number=roll_number, name=name, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def authenticate_user(db: Session, roll_number: str, password: str) -> User | None:
    user = get_user_by_roll(db, roll_number)
    if user and verify_password(password, user.hashed_password):
        return user
    return None


def create_access_token(user: User) -> str:
    return f"token-{user.roll_number}-{int(datetime.utcnow().timestamp())}"


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    username = payload.username.strip().lower() if payload.username else ""
    password = payload.password.strip() if payload.password else ""

    if not username or not password:
        raise HTTPException(status_code=400, detail="Roll Number and password required")

    user = authenticate_user(db, username, password)
    if not user:
        existing = get_user_by_roll(db, username)
        if not existing:
            if username not in STUDENTS_DB:
                raise HTTPException(
                    status_code=401,
                    detail=f"Roll Number '{payload.username}' not found. Please sign up first.",
                )
            raise HTTPException(
                status_code=401,
                detail="Incorrect password. Please try again or sign up.",
            )
        raise HTTPException(
            status_code=401,
            detail="Incorrect password. Please try again.",
        )

    token = create_access_token(user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.roll_number.upper(),
            "name": user.name,
            "role": "student",
        },
    }


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    reg_number = payload.register_number.strip().lower() if payload.register_number else ""
    password = payload.password.strip() if payload.password else ""
    confirm_password = payload.confirm_password.strip() if payload.confirm_password else ""

    if not reg_number or not password or not confirm_password:
        raise HTTPException(status_code=400, detail="All fields required")

    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if len(password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")

    if reg_number not in STUDENTS_DB:
        raise HTTPException(
            status_code=401,
            detail=f"Roll Number '{payload.register_number}' not found in system. Please check your roll number.",
        )

    existing = get_user_by_roll(db, reg_number)
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An account with this roll number already exists. Please login.",
        )

    student_name = STUDENTS_DB[reg_number]
    user = create_user(db, reg_number, student_name, password)
    token = create_access_token(user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.roll_number.upper(),
            "name": user.name,
            "role": "student",
        },
        "message": f"Welcome {student_name}! Registration successful. You are logged in.",
    }
