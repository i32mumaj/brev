from collections.abc import Iterator
from typing import Any

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from brev.config import settings

settings.db_dir.mkdir(parents=True, exist_ok=True)

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False)


@event.listens_for(engine, "connect")
def enable_foreign_keys(dbapi_connection: Any, _: Any) -> None:
    # SQLite ignores foreign keys unless asked to, connection by connection.
    dbapi_connection.execute("PRAGMA foreign_keys = ON")


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
