from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.schemas import LoginRequest

router = APIRouter()

DEMO_EMAIL = "demo@mentor.ai"
DEMO_PASSWORD = "mentor123"


@router.post("/login")
def login(payload: LoginRequest):
    if payload.password != DEMO_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid demo credentials.")

    email = payload.email or DEMO_EMAIL
    token = f"demo-token-{email}-{int(datetime.utcnow().timestamp())}"

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": email,
            "role": "student",
            "display_name": "Demo Student",
        },
    }

