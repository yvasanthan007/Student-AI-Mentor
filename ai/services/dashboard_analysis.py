from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from ai.gemini import ask_gemini


def load_prompt() -> str:
    prompt_path = Path(__file__).resolve().parent.parent / "prompts" / "dashboard_prompt.txt"
    return prompt_path.read_text(encoding="utf-8")


def analyze_dashboard(summary: dict[str, Any]) -> dict[str, Any]:
    prompt = load_prompt() + "\n\n" + json.dumps(summary, indent=2)

    try:
        ai_text = ask_gemini(prompt, model="gemini-2.5-flash")
        source = "gemini"
    except Exception:
        ai_text = (
            f"Focus on {', '.join(summary.get('study_focus', [])) or 'your weakest subject'} "
            f"and keep your attendance near {summary.get('attendance_average', 0)}%."
        )
        source = "local"

    return {
        "source": source,
        "analysis": ai_text,
    }
