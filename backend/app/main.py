import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from fastapi.responses import FileResponse, JSONResponse

ROOT_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIST_DIR = ROOT_DIR / "frontend" / "dist"
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.dashboard import router as dashboard_router
from app.api.mentor import router as mentor_router
from app.api.upload import router as upload_router
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MentorAI Backend", version="1.0.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:59286",
    "http://127.0.0.1:59286",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(upload_router, prefix="/api", tags=["upload"])
app.include_router(dashboard_router, prefix="/api", tags=["dashboard"])
app.include_router(mentor_router, prefix="/api", tags=["mentor"])
app.include_router(chat_router, prefix="/api", tags=["chat"])

@app.get("/api")
def root():
    return {
        "name": "MentorAI Backend",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health():
    return {"ok": True}

@app.get("/{path:path}")
def frontend_files(path: str):
    if not FRONTEND_DIST_DIR.exists():
        return JSONResponse(
            {
                "message": "Frontend build not found. Run python main.py from the repo root.",
                "frontend_dist": str(FRONTEND_DIST_DIR),
            }
        )

    if path.startswith("api"):
        raise HTTPException(status_code=404, detail="Not Found")

    target = FRONTEND_DIST_DIR / path
    if path and target.is_file():
        return FileResponse(target)

    return FileResponse(FRONTEND_DIST_DIR / "index.html")
