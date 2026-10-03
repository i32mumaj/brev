import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Por defecto la base de datos vive en backend/data/, se arranque desde donde se arranque.
DB_DIR = os.getenv("DB_DIR", Path(__file__).resolve().parents[3] / "data")
os.makedirs(DB_DIR, exist_ok=True)

DATABASE_URL = f"sqlite:///{DB_DIR}/link-shortener.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
