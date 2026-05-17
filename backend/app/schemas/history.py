from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class AssociatedTaskSchema(BaseModel):
    task_id: int
    title: str
    time_spent: Optional[int] = 0
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class SessionHistoryResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: int
    actual_duration: Optional[int] = 0
    session_type: str  
    completed: bool
    interruption_reason: Optional[str] = None
    tasks: List[AssociatedTaskSchema] = []

    class Config:
        from_attributes = True