from __future__ import annotations

import json
from collections import defaultdict
from statistics import mean
from typing import Any


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        if isinstance(value, str) and not value.strip():
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _first_present(row: dict[str, Any], keys: list[str], default: str = "") -> str:
    for key in keys:
        value = row.get(key)
        if value not in (None, ""):
            return str(value)
    return default


def normalize_records(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized: list[dict[str, Any]] = []
    for row in records:
        subject = _first_present(row, ["subject", "Subject", "course", "Course", "module", "Module"], "Unknown")
        student = _first_present(row, ["student_name", "Student", "student", "name", "Name"], "Unknown Student")
        normalized.append(
            {
                "student_name": student,
                "subject": subject,
                "test1": _to_float(row.get("Test1", row.get("test1", row.get("quiz1", row.get("Quiz1"))))),
                "test2": _to_float(row.get("Test2", row.get("test2", row.get("quiz2", row.get("Quiz2"))))),
                "assignment": _to_float(row.get("Assignment", row.get("assignment", row.get("lab", row.get("Lab"))))),
                "attendance": _to_float(row.get("Attendance", row.get("attendance", row.get("present", row.get("Present")))), 0.0),
            }
        )
    return normalized


def derive_summary(records: list[dict[str, Any]], student_name: str | None = None) -> dict[str, Any]:
    normalized = normalize_records(records)
    if not normalized:
        return {
            "student_name": student_name or "Unknown Student",
            "overall_average": 0,
            "attendance_average": 0,
            "risk_level": "High",
            "strength_subjects": [],
            "weak_subjects": [],
            "subject_scores": [],
            "study_focus": [],
            "daily_plan": [],
            "weekly_goal": [],
            "career_guidance": [],
        }

    grouped_scores: dict[str, list[float]] = defaultdict(list)
    attendance_values: list[float] = []
    student_values: list[str] = []

    for row in normalized:
        student_values.append(row["student_name"])
        attendance_values.append(row["attendance"])
        grouped_scores[row["subject"]].append(mean([row["test1"], row["test2"], row["assignment"]]))

    subject_scores = [
        {"subject": subject, "score": round(mean(values), 2)}
        for subject, values in sorted(grouped_scores.items(), key=lambda item: mean(item[1]), reverse=True)
    ]

    overall_average = round(mean([item["score"] for item in subject_scores]), 2)
    attendance_average = round(mean(attendance_values), 2)

    strength_subjects = [item["subject"] for item in subject_scores if item["score"] >= 80]
    weak_subjects = [item["subject"] for item in subject_scores if item["score"] < 70]
    study_focus = weak_subjects[:3] or [subject_scores[-1]["subject"]]

    if overall_average >= 80 and attendance_average >= 90:
        risk_level = "Low"
    elif overall_average >= 65 and attendance_average >= 75:
        risk_level = "Medium"
    else:
        risk_level = "High"

    student = student_name or max(set(student_values), key=student_values.count)

    daily_plan = [
        f"Spend 45 minutes revising {subject} using active recall and short notes."
        for subject in study_focus
    ]
    daily_plan.append("Finish one timed practice set and review every mistake immediately.")

    weekly_goal = [
        "Raise the weakest subject by at least 8 to 10 marks.",
        "Complete one full revision cycle before the next LMS deadline.",
        "Keep attendance above 90 percent for the next seven days.",
    ]

    career_guidance = [
        "Lean into subjects with the highest scores when choosing electives and projects.",
        "Build a small portfolio project that demonstrates your strongest technical skill.",
        "If your scores are mixed, prioritize internships that reward consistency and problem solving.",
    ]

    return {
        "student_name": student,
        "overall_average": overall_average,
        "attendance_average": attendance_average,
        "risk_level": risk_level,
        "strength_subjects": strength_subjects,
        "weak_subjects": weak_subjects,
        "subject_scores": subject_scores,
        "study_focus": study_focus,
        "daily_plan": daily_plan,
        "weekly_goal": weekly_goal,
        "career_guidance": career_guidance,
    }


def progress_series_from_uploads(upload_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    series = []
    for index, row in enumerate(upload_rows, start=1):
        summary = json.loads(row["summary_json"])
        series.append(
            {
                "label": f"Upload {index}",
                "average": summary.get("overall_average", 0),
                "attendance": summary.get("attendance_average", 0),
            }
        )
    return series
