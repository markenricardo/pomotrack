from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List

# Adjust these imports based on your exact folder structure
from app.db.database import get_db
from app.db.models import User, PomodoroSession, Task
from app.dependencies import get_current_user # Assuming you have an auth dependency

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()

    # 1. Get today's completed focus sessions
    today_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.session_type == 'work',
        PomodoroSession.completed == True,
        func.date(PomodoroSession.start_time) == today
    ).all()

    # Calculate Focus Time & Completed Pomodoros
    # Handling None values safely in case actual_duration wasn't logged perfectly
    today_focus_seconds = sum(s.actual_duration for s in today_sessions if s.actual_duration)
    today_focus_minutes = today_focus_seconds // 60
    completed_pomodoros = len(today_sessions)

    # 2. Get Pending Tasks (Limit to 5 for the dashboard UI)
    pending_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status.in_(['pending', 'in_progress'])
    ).order_by(Task.priority).limit(5).all()

    # 3. Calculate Current Streak (Dynamic Calculation)
    # Finds consecutive days looking backward where at least 1 work session was completed
    streak = 0
    check_date = today
    
    while True:
        has_session = db.query(PomodoroSession).filter(
            PomodoroSession.user_id == current_user.id,
            PomodoroSession.session_type == 'work',
            PomodoroSession.completed == True,
            func.date(PomodoroSession.start_time) == check_date
        ).first()

        if has_session:
            streak += 1
            check_date -= timedelta(days=1)
        elif check_date == today:
            # If they haven't started today yet, check yesterday to keep streak alive
            check_date -= timedelta(days=1)
        else:
            break

    return {
        "user_name": current_user.username,
        "today_focus_minutes": today_focus_minutes,
        "completed_pomodoros": completed_pomodoros,
        "current_streak": streak,
        "pending_tasks": [
            {
                "id": t.id,
                "title": t.title,
                "priority": t.priority,
                "status": t.status,
                "estimated_duration": t.estimated_duration
            } for t in pending_tasks
        ]
    }