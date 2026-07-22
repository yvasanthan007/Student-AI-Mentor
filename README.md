# Student-AI-Mentor

MentorAI is an AI-powered student mentor that analyzes LMS performance, creates personalized study plans, tracks progress, and provides career guidance.

## Tech stack

- Frontend: React + Vite + Chart.js
- Backend: FastAPI
- AI: Gemini 2.5 Flash
- Database: SQLite
- Excel: Pandas + OpenPyXL
- Authentication: demo login / JWT-ready

## Run locally

One-shot launch from the repo root:

```bash
python main.py
```

The launcher builds the React app, starts FastAPI, and serves everything from one localhost link.
By default it reads student data from `sample_data/CYBER_Students_Combined.xlsx`.

Open:

```text
http://127.0.0.1:8003/
```

## Environment

Create `backend/.env` with:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```
