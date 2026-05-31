"""Analytics routes for productivity insights"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List

from app.db.database import get_db
from app.db.models import User, PomodoroSession, Task
from app.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def get_analytics_overview(
    time_period: str = "week",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get analytics overview for different time periods"""
    today = date.today()
    
    # Determine date range based on time period
    if time_period == "week":
        start_date = today - timedelta(days=6)
    elif time_period == "month":
        start_date = today - timedelta(days=29)
    else:  # all_time
        start_date = date(2000, 1, 1)
    
    # Get pomodoro sessions in the period
    sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.session_type == 'work',
        PomodoroSession.completed == True,
        func.date(PomodoroSession.start_time) >= start_date
    ).all()
    
    # Calculate totals
    total_pomodoros = len(sessions)
    total_focus_seconds = sum(s.actual_duration for s in sessions if s.actual_duration)
    total_focus_hours = total_focus_seconds / 3600
    
    # Get completed tasks in the period
    completed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == 'completed',
        func.date(Task.completed_at) >= start_date if hasattr(Task, 'completed_at') else True
    ).count()
    
    # Calculate current streak
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
            check_date -= timedelta(days=1)
        else:
            break
    
    return {
        "total_pomodoros": total_pomodoros,
        "focus_time_hours": round(total_focus_hours, 1),
        "tasks_completed": completed_tasks,
        "current_streak": streak
    }


@router.get("/weekly")
def get_weekly_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get daily breakdown for the past week"""
    today = date.today()
    week_data = []
    
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    
    for i in range(6, -1, -1):  # Last 7 days
        day_date = today - timedelta(days=i)
        day_name = days[day_date.weekday()]
        
        # Get sessions for this day
        day_sessions = db.query(PomodoroSession).filter(
            PomodoroSession.user_id == current_user.id,
            PomodoroSession.session_type == 'work',
            PomodoroSession.completed == True,
            func.date(PomodoroSession.start_time) == day_date
        ).all()
        
        pomodoros_count = len(day_sessions)
        focus_seconds = sum(s.actual_duration for s in day_sessions if s.actual_duration)
        focus_hours = focus_seconds / 3600
        
        week_data.append({
            "day": day_name,
            "pomodoros": pomodoros_count,
            "focus_hours": round(focus_hours, 2)
        })
    
    return week_data
