from pydantic import BaseModel


class DashboardSummary(BaseModel):
    user_name: str
    today_focus_minutes: int
    completed_pomodoros_today: int
    current_streak: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    total_tasks: int