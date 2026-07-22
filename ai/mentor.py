from __future__ import annotations

from ai.gemini import ask_gemini


def mentor_insight(
    *,
    student_name: str,
    average: float,
    rank: int,
    weakest_subject: str,
    strongest_subject: str,
) -> str:
    prompt = f"""
You are MentorAI, a concise academic mentor.

Student: {student_name}
Average score: {average}
Class rank: {rank}
Strongest subject: {strongest_subject}
Weakest subject: {weakest_subject}

Write 4 short lines:
1. a supportive greeting
2. one strength
3. one weakness
4. one practical next step
"""
    try:
        return ask_gemini(prompt, model="gemini-2.5-flash")
    except Exception:
        return (
            f"Hi {student_name}. Your strongest subject is {strongest_subject}. "
            f"Your priority is {weakest_subject}. Focus on one timed revision block today."
        )

