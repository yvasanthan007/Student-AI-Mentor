from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

_client = None


def _get_client():
    global _client
    if _client is not None:
        return _client

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai

        _client = genai.Client(api_key=api_key)
        return _client
    except Exception:
        return None


def ask_gemini(prompt: str, model: str | None = None) -> str:
    client = _get_client()
    if client is None:
        raise RuntimeError("Gemini is not configured.")

    selected_model = model or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    try:
        response = client.models.generate_content(
            model=selected_model,
            contents=prompt,
        )
        return response.text or ""
    except Exception as exc:
        raise RuntimeError(f"Gemini API error: {exc}") from exc
