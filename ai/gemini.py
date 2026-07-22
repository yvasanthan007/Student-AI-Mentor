from google import genai
from dotenv import load_dotenv
import os


load_dotenv()


api_key = os.getenv("GEMINI_API_KEY")


if not api_key:
    raise ValueError(
        "GEMINI_API_KEY not found. Check your .env file."
    )


client = genai.Client(
    api_key=api_key
)


def ask_gemini(prompt):

    try:

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )

        return response.text

    except Exception as exc:

        return f"Gemini API error: {exc}"