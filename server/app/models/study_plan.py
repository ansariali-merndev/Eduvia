from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, JSON, ForeignKey
from typing import Dict
from app import db

class StudyPlan(db.Model):

    __tablename__ = "study_plan"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    plan_title: Mapped[str] = mapped_column(String(255), nullable=False)
    deadline: Mapped[str] = mapped_column(String(50), nullable=False)
    class_val: Mapped[str] = mapped_column(String(50))
    stream: Mapped[str] = mapped_column(String(100))
    board: Mapped[str] = mapped_column(String(100))
    min_hours: Mapped[int] = mapped_column(Integer)
    max_hours: Mapped[int] = mapped_column(Integer)
    difficulty: Mapped[str] = mapped_column(String(50))
    subjects: Mapped[Dict] = mapped_column(JSON)