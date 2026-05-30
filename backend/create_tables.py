from app.db.database import engine
from app.db.models import Base

print("Dropping old tables...")
Base.metadata.drop_all(bind=engine)

print("Creating new, updated tables...")
Base.metadata.create_all(bind=engine)

print("Database reset successfully! All columns are up to date.")