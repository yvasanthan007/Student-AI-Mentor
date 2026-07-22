from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from statistics import mean
from typing import Any

import pandas as pd

SUBJECT_ORDER = ["PDS", "ADS", "DAA", "DBMS", "AJP", "OOPS"]
SUBJECT_LABELS = {
    "PDS": "PDS",
    "ADS": "ADS",
    "DAA": "DAA",
    "DBMS": "DBMS",
    "AJP": "AJP",
    "OOPS": "OOPS",
}

ROOT_DIR = Path(__file__).resolve().parents[3]
WORKBOOK_PATH = ROOT_DIR / "sample_data" / "CYBER_Students_Combined.xlsx"


@lru_cache(maxsize=1)
def load_master_frame() -> pd.DataFrame:
    frame = pd.read_excel(WORKBOOK_PATH, sheet_name="Master", engine="openpyxl")
    frame = frame.fillna("")
    return frame


def _normalize(value: Any) -> str:
    return str(value).strip().lower().replace(" ", "")


def _subject_score_map(row: pd.Series) -> list[dict[str, Any]]:
    subject_scores: list[dict[str, Any]] = []
    for subject in SUBJECT_ORDER:
        mark_col = f"{subject} Mark"
        grade_col = f"{subject} Grade"
        percent_col = f"{subject} %"
        subject_scores.append(
            {
                "subject": SUBJECT_LABELS[subject],
                "score": float(row.get(percent_col, row.get(mark_col, 0)) or 0),
                "grade": str(row.get(grade_col, "")),
            }
        )
    return subject_scores


def _numeric_series(frame: pd.DataFrame, column: str) -> pd.Series:
    return pd.to_numeric(frame[column], errors="coerce").fillna(0.0)


def find_student(query: str | None) -> pd.Series | None:
    frame = load_master_frame()
    if query is None or not str(query).strip():
        return frame.iloc[0]

    normalized = _normalize(query)

    roll_matches = frame[frame["Roll No"].astype(str).str.lower().str.replace(" ", "") == normalized]
    if not roll_matches.empty:
        return roll_matches.iloc[0]

    name_matches = frame[frame["Name"].astype(str).str.lower().str.contains(normalized, regex=False)]
    if not name_matches.empty:
        return name_matches.iloc[0]

    return None


def build_dashboard(query: str | None = None) -> dict[str, Any]:
    frame = load_master_frame()
    student = find_student(query)
    if student is None:
        return {
            "found": False,
            "message": "No student found for that name or roll number.",
            "student": None,
            "overview": None,
            "metrics": None,
            "subject_scores": [],
            "performance_trend": [],
            "study_plan": [],
            "recommended_for_you": [],
            "today_focus": [],
            "upcoming_deadlines": [],
            "recent_achievements": [],
            "class_summary": {
                "total_students": int(len(frame)),
                "average_class_score": round(float(_numeric_series(frame, "Average %").mean()), 2),
            },
            "ai_insight": "No student matched the search query.",
            "right_rail": {
                "greeting": "AI Mentor",
                "message": "Search by roll number or name to load a student dashboard.",
            },
        }

    subject_scores = _subject_score_map(student)
    ordered_scores = [item["score"] for item in subject_scores]
    total_students = int(len(frame))
    average_series = _numeric_series(frame, "Average %")
    student_average_raw = pd.to_numeric(student["Average %"], errors="coerce")
    student_average = round(float(0.0 if pd.isna(student_average_raw) else student_average_raw), 2)
    average_class_score = round(float(average_series.mean()), 2)
    percentile = round((average_series < student_average).mean() * 100, 0)
    rank = int((average_series > student_average).sum() + 1)
    top_percent = max(1, int((rank / total_students) * 100 + 0.5))
    best_subject = max(subject_scores, key=lambda item: item["score"])
    weakest_subject = min(subject_scores, key=lambda item: item["score"])
    top_three = sorted(subject_scores, key=lambda item: item["score"], reverse=True)[:3]
    bottom_three = sorted(subject_scores, key=lambda item: item["score"])[:3]

    performance_trend = [
        {"label": item["subject"], "value": item["score"]}
        for item in subject_scores
    ]

    ai_readiness = round(min(100, student_average * 0.85 + best_subject["score"] * 0.15 + 6), 0)
    study_streak = max(7, int(student_average // 6))

    study_plan = [
        f"Revise {weakest_subject['subject']} for 45 minutes using active recall.",
        f"Solve 10 practice questions in {weakest_subject['subject']} and review errors.",
        f"Maintain momentum in {best_subject['subject']} with a 20-minute recap.",
        "Complete one mixed-subject mock test and compare it against the last attempt.",
    ]

    recommended_for_you = [
        f"Double down on {top_three[0]['subject']} to protect your strongest score.",
        f"Use {weakest_subject['subject']} as the priority subject until it crosses 70%.",
        "Convert each chapter into short notes and revise them twice a week.",
        "Attempt timed tests to improve speed and accuracy across all subjects.",
    ]

    today_focus = [
        f"Complete DBMS/DAA revision if your weakest technical subject is {weakest_subject['subject']}.",
        "Solve one full-length practice set before the end of the day.",
        "Review the mistakes from your last assignment and fix the weak concepts.",
        "Spend 15 minutes on quick recap notes before sleeping.",
    ]

    upcoming_deadlines = [
        {"title": f"{weakest_subject['subject']} revision checkpoint", "when": "Today", "flag": "critical"},
        {"title": f"{best_subject['subject']} reinforcement", "when": "Tomorrow", "flag": "warning"},
        {"title": "Weekly mock test", "when": "3 days left", "flag": "normal"},
    ]

    recent_achievements = [
        {"title": f"Highest in {best_subject['subject']}", "when": "Current semester", "icon": "up"},
        {"title": f"Passed core subjects", "when": student["Overall Result"] or "Updated", "icon": "medal"},
        {"title": f"Class percentile {percentile}%", "when": "Latest ranking", "icon": "star"},
    ]

    from ai.services.dashboard_analysis import analyze_dashboard

    ai_payload = analyze_dashboard(
        {
            "student_name": str(student["Name"]),
            "average_score": student_average,
            "rank_in_class": rank,
            "rank_label": f"Top {top_percent}%",
            "strongest_subject": best_subject["subject"],
            "weakest_subject": weakest_subject["subject"],
            "class_average": average_class_score,
            "study_focus": [weakest_subject["subject"], best_subject["subject"]],
            "daily_plan": study_plan,
            "recommended_for_you": recommended_for_you,
        }
    )

    return {
        "found": True,
        "message": "",
        "student": {
            "name": str(student["Name"]),
            "roll_no": str(student["Roll No"]),
            "department": str(student["Department"]),
            "category": str(student["Category"]),
            "valid_upto": str(student["Valid Upto"]),
            "blood_group": str(student["Blood Group"]),
            "dob": str(student["Date of Birth"]),
            "address": str(student["Residential Address"]),
            "mobile_no": str(student["Mobile No"]),
            "emergency_contact": str(student["Emergency Contact No"]),
            "overall_result": str(student["Overall Result"]),
        },
        "overview": {
            "greeting_name": str(student["Name"]),
            "average_score": student_average,
            "class_percentile": top_percent,
            "class_rank_percentile": percentile,
            "rank_in_class": rank,
            "rank_label": f"Top {top_percent}%",
            "ai_readiness": ai_readiness,
            "study_streak": study_streak,
            "class_average": average_class_score,
        },
        "metrics": {
            "overall_performance": student_average,
            "ai_readiness": ai_readiness,
            "study_streak": study_streak,
            "rank_in_class": rank,
        },
        "subject_scores": subject_scores,
        "performance_trend": performance_trend,
        "study_plan": study_plan,
        "recommended_for_you": recommended_for_you,
        "today_focus": today_focus,
        "upcoming_deadlines": upcoming_deadlines,
        "recent_achievements": recent_achievements,
        "class_summary": {
            "total_students": total_students,
            "average_class_score": average_class_score,
            "top_subject": best_subject["subject"],
            "weak_subject": weakest_subject["subject"],
        },
        "ai_insight": ai_payload["analysis"],
        "ai_source": ai_payload["source"],
        "right_rail": {
            "greeting": f"Good Morning, {str(student['Name']).split(' ')[0]}!",
            "message": "You're doing great. Keep pushing your strongest subjects and tighten the weak ones.",
        },
        "top_subjects": [item["subject"] for item in top_three],
        "bottom_subjects": [item["subject"] for item in bottom_three],
    }


def dump_dashboard_json(query: str | None = None) -> str:
    return json.dumps(build_dashboard(query), ensure_ascii=False)
