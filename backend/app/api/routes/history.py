from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from datetime import datetime, timezone
from app.db.database import get_db
from app.core.auth import get_current_user  
from app.schemas.history import SessionHistoryResponse
from app.schemas.users import User

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/", response_model=List[SessionHistoryResponse])
def get_user_session_history(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user), 
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0)
):
    """
    Fetch the historical timeline of pomodoro focus blocks and rest sessions 
    completed by the logged-in user, including their associated tasks.
    """
    
    query = text("""
        SELECT 
            id, 
            start_time, 
            end_time, 
            duration, 
            actual_duration, 
            session_type, 
            completed, 
            interruption_reason
        FROM pomodoro_sessions
        WHERE user_id = :user_id AND deleted_at IS NULL
        ORDER BY id DESC
        LIMIT :limit OFFSET :offset
    """)
    
    result = db.execute(query, {
        "user_id": current_user.id, 
        "limit": limit, 
        "offset": offset
    }).fetchall()
    
    history_list = []
    
    for row in result:
        tasks_query = text("""
            SELECT 
                pta.task_id, 
                t.title, 
                pta.time_spent, 
                pta.notes
            FROM pomodoro_task_associations pta
            JOIN tasks t ON pta.task_id = t.id
            WHERE pta.pomodoro_session_id = :session_id AND pta.deleted_at IS NULL
        """)
        associated_tasks = db.execute(tasks_query, {"session_id": row.id}).fetchall()
        
        tasks_data = [
            {
                "task_id": task.task_id,
                "title": task.title,
                "time_spent": task.time_spent,
                "notes": task.notes
            } for task in associated_tasks
        ]
        
        history_list.append({
            "id": row.id,
            "start_time": row.start_time,
            "end_time": row.end_time,
            "duration": row.duration,
            "actual_duration": row.actual_duration,
            "session_type": row.session_type,
            "completed": row.completed,
            "interruption_reason": row.interruption_reason,
            "tasks": tasks_data
        })
        
    return history_list

@router.delete("/{session_id}", status_code=204)
def soft_delete_history_entry(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Soft delete an individual history timeline item from the dashboard view.
    """
    
    check_query = text("""
        SELECT id FROM pomodoro_sessions 
        WHERE id = :session_id AND user_id = :user_id AND deleted_at IS NULL
    """)
    session_exists = db.execute(check_query, {"session_id": session_id, "user_id": current_user.id}).fetchone()
    
    if not session_exists:
        raise HTTPException(status_code=404, detail="Session entry not found or access denied.")
        
    delete_query = text("""
        UPDATE pomodoro_sessions 
        SET deleted_at = :now 
        WHERE id = :session_id
    """)
    db.execute(delete_query, {"now": datetime.now(timezone.utc), "session_id": session_id})
    db.commit()
    
    return None