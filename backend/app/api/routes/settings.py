from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import datetime
from app.db.database import get_db
from app.core.auth import get_current_user  
from app.schemas.settings import UserSettings, UserSettingsUpdate
from app.schemas.users import User

router = APIRouter(prefix="/settings", tags=["settings"])

# Volatile in-memory cache mapped by user_id
VOLATILE_SETTINGS_CACHE: Dict[int, Dict[str, Any]] = {}

@router.get("", response_model=UserSettings)
def get_user_settings(current_user: User = Depends(get_current_user)):
    """
    Retrieve personalized configuration settings parameters for the active user.
    """
    user_id = current_user.id
    
    if user_id not in VOLATILE_SETTINGS_CACHE:
        VOLATILE_SETTINGS_CACHE[user_id] = {
            "user_id": user_id,
            "pomodoro_duration": 1500,       
            "short_break_duration": 300,     
            "long_break_duration": 900,      
            "pomodoros_until_long_break": 4,
            "theme": "light",
            "notification_enabled": True,
            "updated_at": datetime.datetime.now(datetime.timezone.utc)
        }
        
    return VOLATILE_SETTINGS_CACHE[user_id]


@router.patch("", response_model=UserSettings)
def update_user_settings(payload: UserSettingsUpdate, current_user: User = Depends(get_current_user)):
    """
    Dynamically merge partial configurations on the backend server instantly.
    """
    user_id = current_user.id
    
    if user_id not in VOLATILE_SETTINGS_CACHE:
        VOLATILE_SETTINGS_CACHE[user_id] = {
            "user_id": user_id,
            "pomodoro_duration": 1500,
            "short_break_duration": 300,
            "long_break_duration": 900,
            "pomodoros_until_long_break": 4,
            "theme": "light",
            "notification_enabled": True,
        }
        
    current_settings = VOLATILE_SETTINGS_CACHE[user_id]
    update_data = payload.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        current_settings[key] = value
        
    current_settings["updated_at"] = datetime.datetime.now(datetime.timezone.utc)
    
    VOLATILE_SETTINGS_CACHE[user_id] = current_settings
    return current_settings