from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User

def get_current_user(db: Session = Depends(get_db)):
    """
    TEMPORARY MOCK AUTHENTICATION
    This bypasses the login screen so we can test the dashboard.
    """
    # Try to grab the very first user in your database
    user = db.query(User).first()
    
    # If your database is completely empty right now, return a fake test user
    if not user:
        return User(id=1, username="Developer", email="dev@pomotrack.com")
        
    return user