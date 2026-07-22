from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class UploadRecord(Base):
    __tablename__ = "upload_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    student_name: Mapped[str] = mapped_column(String(255), default="Unknown Student")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    row_count: Mapped[int] = mapped_column(Integer, default=0)
    summary_json: Mapped[str] = mapped_column(Text, default="{}")
    preview_json: Mapped[str] = mapped_column(Text, default="[]")
