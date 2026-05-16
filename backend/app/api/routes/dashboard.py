from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.core.auth import get_current_user
from app.schemas.dashboard import DashboardSummary
from app.db.models import User, Task, PomodoroSession


router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    total_tasks = (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .count()
    )

    pending_tasks = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == "pending"
        )
        .count()
    )

    in_progress_tasks = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == "in_progress"
        )
        .count()
    )

    completed_tasks = (
        db.query(Task)
        .filter(
            Task.user_id == current_user.id,
            Task.status == "completed"
        )
        .count()
    )

    completed_pomodoros_today = (
        db.query(PomodoroSession)
        .filter(
            PomodoroSession.user_id == current_user.id,
            PomodoroSession.status == "completed",
            func.date(PomodoroSession.completed_at) == today
        )
        .count()
    )

    today_focus_minutes = (
        db.query(func.coalesce(func.sum(PomodoroSession.duration_minutes), 0))
        .filter(
            PomodoroSession.user_id == current_user.id,
            PomodoroSession.status == "completed",
            func.date(PomodoroSession.completed_at) == today
        )
        .scalar()
    )

    current_streak = calculate_current_streak(db, current_user.id)

    return DashboardSummary(
        user_name=current_user.full_name or current_user.email,
        today_focus_minutes=today_focus_minutes,
        completed_pomodoros_today=completed_pomodoros_today,
        current_streak=current_streak,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks=completed_tasks,
        total_tasks=total_tasks
    )


def calculate_current_streak(db: Session, user_id: int) -> int:
    streak = 0
    check_date = date.today()

    while True:
        completed_count = (
            db.query(PomodoroSession)
            .filter(
                PomodoroSession.user_id == user_id,
                PomodoroSession.status == "completed",
                func.date(PomodoroSession.completed_at) == check_date
            )
            .count()
        )

        if completed_count == 0:
            break

        streak += 1
        check_date -= timedelta(days=1)

    return streak