from __future__ import annotations

from fastapi import APIRouter, Query

from app.services.lms import build_dashboard

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(query: str | None = Query(default=None)):
    return build_dashboard(query)


@router.get("/student/search")
def search_student(query: str | None = Query(default=None)):
    return build_dashboard(query)
