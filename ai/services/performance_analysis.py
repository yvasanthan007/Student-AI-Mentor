from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from statistics import mean
from typing import Any

from ai.gemini import ask_gemini


def _to_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
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


def _derive_summary(records: list[dict[str, Any]], student_name: str | None = None) -> dict[str, Any]:
    normalized = []
    for row in records:
        normalized.append(
            {
                "student_name": _first_present(row, ["student_name", "Student", "student", "name", "Name"], "Unknown Student"),
                "subject": _first_present(row, ["subject", "Subject", "course", "Course"], "Unknown"),
                "test1": _to_float(row.get("Test1", row.get("test1"))),
                "test2": _to_float(row.get("Test2", row.get("test2"))),
                "assignment": _to_float(row.get("Assignment", row.get("assignment"))),
                "attendance": _to_float(row.get("Attendance", row.get("attendance"))),
            }
        )

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
    daily_plan = [f"Revise {subject} for 45 minutes using active recall." for subject in study_focus]
    daily_plan.append("Finish one timed practice set and review every mistake.")

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
        "weekly_goal": [
            "Increase the weakest subject score by 8 to 10 marks.",
            "Complete one full revision cycle before the next LMS deadline.",
            "Maintain attendance above 90 percent for the week.",
        ],
        "career_guidance": [
            "Build a portfolio project around your strongest subject.",
            "Use your top-performing subjects to guide electives and internships.",
            "If scores are mixed, prioritize consistency and problem-solving roles.",
        ],
    }


def load_prompt() -> str:
    prompt_path = Path(__file__).resolve().parent.parent / "prompts" / "performance_prompt.txt"
    return prompt_path.read_text(encoding="utf-8")


def analyze_student(records: list[dict[str, Any]], student_name: str | None = None) -> dict[str, Any]:
    summary = _derive_summary(records, student_name=student_name)
    prompt = load_prompt() + "\n\n" + json.dumps(summary, indent=2)

    try:
        ai_text = ask_gemini(prompt, model="gemini-2.5-flash")
        source = "gemini"
    except Exception:
        ai_text = "\n".join(
            [
                f"MentorAI Performance Analysis for {summary['student_name']}",
                f"Overall average: {summary['overall_average']}%",
                f"Attendance average: {summary['attendance_average']}%",
                f"Risk level: {summary['risk_level']}",
            ]
        )
        source = "local"

    return {"summary": summary, "analysis": ai_text, "source": source}
