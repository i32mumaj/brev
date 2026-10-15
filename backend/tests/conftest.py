import os
import tempfile

# Importing brev creates the SQLite directory; keep it out of backend/data.
os.environ["DB_DIR"] = tempfile.mkdtemp(prefix="brev-tests-")

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from brev.db import Base, enable_foreign_keys, get_db
from brev.main import app


@pytest.fixture
def db() -> Iterator[Session]:
    # One in-memory database per test; StaticPool shares its single connection.
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    event.listen(engine, "connect", enable_foreign_keys)
    Base.metadata.create_all(engine)
    with sessionmaker(bind=engine, autoflush=False)() as session:
        yield session
    engine.dispose()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app, follow_redirects=False) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def short_code(client: TestClient) -> str:
    response = client.post("/api/links", json={"url": "https://example.com/some/long/path"})
    return str(response.json()["short_url"]).rsplit("/", 1)[-1]
