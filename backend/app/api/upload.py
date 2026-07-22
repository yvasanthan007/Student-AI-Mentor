from __future__ import annotations

from fastapi import APIRouter, HTTPException, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_excel(file: UploadFile):
    raise HTTPException(
        status_code=410,
        detail="Upload is disabled in this build. Search by roll number or name instead.",
    )

