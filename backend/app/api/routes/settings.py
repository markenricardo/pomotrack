from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
import datetime
from app.db.database import get_db
from app.core.auth import get_current_user  
from app.schemas.settings import UserSettings, UserSettingsUpdate, PasswordUpdatePayload
from app.schemas.users import User

router = APIRouter(prefix="/settings", tags=["settings"])

# Volatile in-memory cache mapped by user_id
VOLATILE_SETTINGS_CACHE: Dict[int, Dict[str, Any]] = {}
# Mock User Password database vault storage mapped by user_id
MOCK_PASSWORD_DB: Dict[int, str] = {}

@router.get("", response_model=UserSettings)
def get_user_settings(current_user: User = Depends(get_current_user)):
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
            "full_name": "First Name Surname",
            "email": "fnsn@gmail.com",
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
            "full_name": "First Name Surname",
            "email": "fnsn@gmail.com",
        }
        
    current_settings = VOLATILE_SETTINGS_CACHE[user_id]
    update_data = payload.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if value is not None:
            current_settings[key] = value
        
    current_settings["updated_at"] = datetime.datetime.now(datetime.timezone.utc)
    
    VOLATILE_SETTINGS_CACHE[user_id] = current_settings
    return current_settings


@router.put("/password", status_code=status.HTTP_200_OK)
def change_user_password(payload: PasswordUpdatePayload, current_user: User = Depends(get_current_user)):
    """
    Secure password modification pipeline evaluating user verification integrity rules.
    """
    user_id = current_user.id
    
    if user_id not in MOCK_PASSWORD_DB:
        MOCK_PASSWORD_DB[user_id] = "password123"

    if payload.current_password != MOCK_PASSWORD_DB[user_id]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The current password you entered is incorrect."
        )

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your new password cannot be identical to your current password."
        )

    MOCK_PASSWORD_DB[user_id] = payload.new_password
    return {"status": "success", "detail": "Password modified successfully."}