from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    register_number: str = Field(min_length=1)
    password: str = Field(min_length=4)
    confirm_password: str = Field(min_length=4)


class LoginResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: dict[str, Any]


class AnalyzeRequest(BaseModel):
    student_name: str | None = None
    records: list[dict[str, Any]] | None = None


class UploadResponse(BaseModel):
    id: int
    filename: str
    student_name: str
    uploaded_at: datetime
    row_count: int
    columns: list[str]
    preview: list[dict[str, Any]]
    dashboard: dict[str, Any]


class DashboardResponse(BaseModel):
    latest_upload: dict[str, Any] | None
    overview: dict[str, Any]
    metrics: dict[str, Any]
    subject_chart: dict[str, Any]
    progress_chart: dict[str, Any]
    study_plan: list[str]
    career_guidance: list[str]
    recent_uploads: list[dict[str, Any]]


class MentorResponse(BaseModel):
    title: str
    content: str
    bullets: list[str]
    source: str

