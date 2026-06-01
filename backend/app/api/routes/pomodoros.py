"""Pomodoro session routes"""

from typing import List, Optional
from datetime import datetime, UTC
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.auth import get_current_user
from app.schemas.pomodoros import (
    PomodoroSession,
    PomodoroCreate,
    PomodoroUpdate,
    PomodoroTaskAssociation,
    PomodoroTaskAssociationCreate,
)
from app.db.repositories import pomodoros as pomodoros_repository
from app.db.repositories import tasks as tasks_repository
from app.schemas.users import User
from app.db.repositories import users as users_repository

# NATIVE EMAIL IMPORTS (Built into standard Python runtime)
import smtplib
import os
from email.mime.text import MIMEText
from email.header import Header
# Pull cache map to cross-reference custom settings flags
from app.api.routes.settings import VOLATILE_SETTINGS_CACHE

router = APIRouter(prefix="/pomodoros", tags=["pomodoros"])


def send_native_completion_email(recipient_email: str, session_type: str, duration_seconds: Optional[int]):
    """
    Sends an email notification natively using Python's built-in smtplib.
    No extra pip dependencies required.
    """
    # 1. Credentials (Configure these using environment variables or hardcoded values)
    smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER", "your-email@gmail.com")
    smtp_password = os.environ.get("SMTP_PASSWORD", "your-app-password")  # Use an email App Password here

    if not smtp_user or "your-email" in smtp_user:
        print("SMTP config skipped: update credentials to route real notification emails.")
        return

    # Calculate duration string cleanly
    duration_str = f"{int(duration_seconds / 60)} minutes" if duration_seconds else "a standard focus interval"

    # 2. Structure message content
    subject = "🍅 Pomodoro Session Successfully Completed!"
    body = (
        f"Fantastic focus! You successfully recorded your '{session_type.replace('_', ' ')}' session.\n"
        f"Total Logged Duration: {duration_str}.\n\n"
        f"Keep up the great work and maintain your momentum!"
    )

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = Header(subject, "utf-8")
    msg["From"] = smtp_user
    msg["To"] = recipient_email

    # 3. Securely transmit via standard secure SMTP channel loops
    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Secure connection using TLS
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, [recipient_email], msg.as_string())
        print(f"Notification email dispatched natively to {recipient_email}")
    except Exception as e:
        print(f"Native email dispatch runtime exception warning: {str(e)}")


@router.post("/", response_model=PomodoroSession, status_code=status.HTTP_201_CREATED)
def create_pomodoro(
    pomodoro: PomodoroCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new pomodoro session"""
    return pomodoros_repository.create_pomodoro(db, pomodoro, current_user.id)


@router.get("/", response_model=List[PomodoroSession])
def read_pomodoros(
    completed: Optional[bool] = None,
    session_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all pomodoro sessions"""
    return pomodoros_repository.get_pomodoros(
        db,
        user_id=current_user.id,
        completed=completed,
        session_type=session_type,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit,
    )


@router.get("/{pomodoro_id}", response_model=PomodoroSession)
def read_pomodoro(
    pomodoro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific pomodoro session"""
    pomodoro = pomodoros_repository.get_pomodoro(db, pomodoro_id, current_user.id)
    if not pomodoro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pomodoro session not found"
        )
    return pomodoro


@router.patch("/{pomodoro_id}", response_model=PomodoroSession)
def update_pomodoro(
    pomodoro_id: int,
    pomodoro_update: PomodoroUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a pomodoro session, including interruption details"""
    return pomodoros_repository.update_pomodoro(
        db, pomodoro_id, current_user.id, pomodoro_update
    )


@router.post("/{pomodoro_id}/complete", response_model=PomodoroSession)
def complete_pomodoro(
    pomodoro_id: int,
    end_time: Optional[datetime] = None,
    actual_duration: Optional[int] = None,
    interruption_reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Complete a pomodoro session and handle notification preference flags natively"""
    completed_pomodoro = pomodoros_repository.complete_pomodoro(
        db,
        pomodoro_id,
        current_user.id,
        end_time=end_time,
        actual_duration=actual_duration,
        interruption_reason=interruption_reason,
    )
    if not completed_pomodoro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pomodoro session not found"
        )

    # === AUTOMATED EMAIL SELECTION GATEWAY ===
    user_id = current_user.id
    # Cross-reference user_id within your active volatile cache framework
    if user_id in VOLATILE_SETTINGS_CACHE:
        user_config = VOLATILE_SETTINGS_CACHE[user_id]
        
        # Pull preferences cleanly from your existing cache schema setup
        is_enabled = user_config.get("notification_enabled", True)
        user_email = user_config.get("email", "fnsn@gmail.com")

        # If user enabled the setting, trigger the native SMTP dispatch process
        if is_enabled and user_email:
            # Fallback to model values if parameter values aren't explicitly provided by front-end client
            session_type = getattr(completed_pomodoro, "session_type", "work")
            duration = actual_duration or getattr(completed_pomodoro, "duration", 1500)
            
            send_native_completion_email(
                recipient_email=user_email,
                session_type=session_type,
                duration_seconds=duration
            )

    return completed_pomodoro


@router.delete("/{pomodoro_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pomodoro(
    pomodoro_id: int,
    permanent: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a pomodoro session"""
    success = pomodoros_repository.delete_pomodoro(
        db, pomodoro_id, current_user.id, soft_delete=not permanent
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pomodoro session not found"
        )
    return {"detail": "Pomodoro session deleted successfully"}


@router.post("/{pomodoro_id}/tasks", response_model=PomodoroTaskAssociation)
def associate_task_with_pomodoro(
    pomodoro_id: int,
    association: PomodoroTaskAssociationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Associate a task with a pomodoro session"""
    if association.pomodoro_session_id != pomodoro_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pomodoro ID in path must match the one in request body",
        )

    result = pomodoros_repository.associate_task_with_pomodoro(
        db, association, current_user.id
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pomodoro session or task not found",
        )

    return result


@router.get("/{pomodoro_id}/tasks", response_model=List[PomodoroTaskAssociation])
def get_pomodoro_tasks(
    pomodoro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all tasks associated with a pomodoro session"""
    pomodoro = pomodoros_repository.get_pomodoro(db, pomodoro_id, current_user.id)
    if not pomodoro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pomodoro session not found"
        )

    return pomodoros_repository.get_tasks_for_pomodoro(db, pomodoro_id, current_user.id)


@router.get("/task/{task_id}", response_model=List[PomodoroSession])
def get_task_pomodoros(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all pomodoro sessions associated with a task"""
    task = tasks_repository.get_task(db, task_id, current_user.id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    return pomodoros_repository.get_pomodoros_for_task(db, task_id, current_user.id)


@router.post("/{pomodoro_id}/pause", response_model=PomodoroSession)
def pause_pomodoro(
    pomodoro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pause a pomodoro session"""
    result = pomodoros_repository.pause_pomodoro(db, pomodoro_id, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pomodoro session not found or already completed",
        )
    return result


@router.post("/{pomodoro_id}/resume", response_model=PomodoroSession)
def resume_pomodoro(
    pomodoro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Resume a paused pomodoro session"""
    result = pomodoros_repository.resume_pomodoro(db, pomodoro_id, current_user.id)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pomodoro session not found or already completed",
        )
    return result


@router.get("/{pomodoro_id}/pause-stats", response_model=dict)
def get_pomodoro_pause_stats(
    pomodoro_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get pause statistics for a pomodoro session"""
    pomodoro = pomodoros_repository.get_pomodoro(db, pomodoro_id, current_user.id)
    if not pomodoro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pomodoro session not found"
        )

    return pomodoros_repository.get_pomodoro_pause_stats(db, pomodoro_id)


@router.post(
    "/preset", response_model=PomodoroSession, status_code=status.HTTP_201_CREATED
)
def create_preset_pomodoro(
    session_type: str = Query(..., pattern="^(work|short_break|long_break)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new pomodoro session with preset duration based on type and user settings"""
    user_settings = users_repository.get_user_settings(db, current_user.id)
    if not user_settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User settings not found"
        )

    duration_map = {
        "work": user_settings.pomodoro_duration,
        "short_break": user_settings.short_break_duration,
        "long_break": user_settings.long_break_duration,
    }

    pomodoro = PomodoroCreate(
        start_time=datetime.now(UTC),
        duration=duration_map[session_type],  
        session_type=session_type,
    )

    return pomodoros_repository.create_pomodoro(db, pomodoro, current_user.id)