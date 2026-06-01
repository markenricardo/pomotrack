from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import User, PomodoroSession, Task
from app.core.auth import get_current_user

router = APIRouter()

@router.get("/achievements")
def get_user_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch ALL historical completed work sessions
    all_sessions = db.query(PomodoroSession).filter(
        PomodoroSession.user_id == current_user.id,
        PomodoroSession.session_type == 'work',
        PomodoroSession.completed == True
    ).all()

    total_sessions = len(all_sessions)
    total_focus_seconds = sum(s.actual_duration for s in all_sessions if s.actual_duration)
    total_focus_hours = total_focus_seconds / 3600

    # 2. Fetch completed tasks count
    completed_tasks_count = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.status == 'completed'
    ).count()

    # 3. Gamification Math
    xp = total_focus_seconds // 60  # 1 XP per minute of focus
    level = (xp // 100) + 1         # Level 1 by default, Level up every 100 XP
    xp_to_next_level = 100 - (xp % 100)

    # 4. Dynamic Badges Evaluation
    # These flags turn True once the user hits the threshold
    badges = {
        "first_session": total_sessions >= 1,
        "completed_5_pomodoros": total_sessions >= 5,
        "focused_10_hours": total_focus_hours >= 10,
        "task_finisher": completed_tasks_count >= 10
    }

    # Generate title based on level
    titles = {1: "Novice", 3: "Focus Learner", 5: "Productivity Ninja", 10: "Deep Work Master"}
    current_title = "Beginner"
    for lvl_req, title in titles.items():
        if level >= lvl_req:
            current_title = title

    return {
        "level": level,
        "title": current_title,
        "total_xp": xp,
        "xp_progress": {
            "current_level_xp": xp % 100,
            "required_for_next": 100,
            "remaining": xp_to_next_level
        },
        "stats": {
            "total_pomodoros": total_sessions,
            "total_hours": round(total_focus_hours, 1)
        },
        "badges": badges
    }