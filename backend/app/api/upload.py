from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import UploadRecord
from app.services.lms import load_master_frame

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


def _parse_excel(file_path: Path) -> dict[str, Any]:
    df = pd.read_excel(file_path, sheet_name=0, engine="openpyxl")
    df = df.fillna("")

    columns = list(df.columns)
    preview = df.head(10).to_dict(orient="records")

    return {
        "columns": columns,
        "preview": preview,
        "row_count": len(df),
        "dataframe": df,
    }


def _derive_summary_from_excel(df: pd.DataFrame) -> dict[str, Any]:
    try:
        master_df = load_master_frame()

        if "Roll No" in df.columns:
            roll_col = "Roll No"
        elif "roll_no" in df.columns:
            roll_col = "roll_no"
        else:
            roll_col = None

        if roll_col and "Name" in df.columns:
            student_names = df["Name"].tolist()
        elif "Name" in master_df.columns:
            student_names = master_df["Name"].tolist()[:5]
        else:
            student_names = ["Unknown"]

        return {
            "student_name": str(student_names[0]) if student_names else "Unknown",
            "total_students": len(df),
            "columns_found": list(df.columns[:10]),
        }
    except Exception:
        return {"student_name": "Unknown", "total_students": len(df)}


@router.post("/upload")
async def upload_excel(file: UploadFile, db: Session = Depends(get_db)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    allowed = (".xlsx", ".xls")
    if not any(file.filename.lower().endswith(ext) for ext in allowed):
        raise HTTPException(status_code=400, detail="Only .xlsx and .xls files are supported")

    timestamp = int(datetime.utcnow().timestamp())
    safe_name = f"{timestamp}_{file.filename}"
    file_path = UPLOAD_DIR / safe_name

    try:
        content = await file.read()
        file_path.write_bytes(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    try:
        parsed = _parse_excel(file_path)
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=f"Failed to parse Excel file: {e}")

    summary = _derive_summary_from_excel(parsed["dataframe"])

    record = UploadRecord(
        filename=file.filename,
        student_name=summary.get("student_name", "Unknown"),
        row_count=parsed["row_count"],
        summary_json=json.dumps(summary),
        preview_json=json.dumps(parsed["preview"][:5]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "filename": record.filename,
        "student_name": record.student_name,
        "uploaded_at": record.uploaded_at.isoformat(),
        "row_count": record.row_count,
        "columns": parsed["columns"],
        "preview": parsed["preview"][:5],
        "dashboard": {
            "summary": summary,
            "message": f"Uploaded {file.filename} with {parsed['row_count']} rows.",
        },
    }
