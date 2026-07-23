from __future__ import annotations

from fastapi import APIRouter, Query

from app.services.lms import build_dashboard

router = APIRouter()


@router.get("/mentor")
def mentor(query: str | None = Query(default=None)):
    payload = build_dashboard(query)
    return {
        "student": payload.get("student"),
        "overview": payload.get("overview"),
        "subject_scores": payload.get("subject_scores"),
        "study_plan": payload.get("study_plan"),
        "recommended_for_you": payload.get("recommended_for_you"),
        "today_focus": payload.get("today_focus"),
        "ai_insight": payload.get("ai_insight"),
    }
