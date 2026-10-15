from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from brev.models import Link
from brev.services.utils import ALPHABET, generate_unique_code, hash_7_chars


def test_hash_is_deterministic_base62() -> None:
    code = hash_7_chars("https://example.com")

    assert code == hash_7_chars("https://example.com")
    assert len(code) == 7
    assert set(code) <= set(ALPHABET)


def test_collision_chains_the_previous_code(db: Session) -> None:
    url = "https://example.com"
    taken = hash_7_chars(url)
    db.add(Link(short_code=taken, original_url=url))
    db.commit()

    assert generate_unique_code(db, url) == hash_7_chars(url + taken)


def test_create_retries_when_a_concurrent_insert_wins(client: TestClient, db: Session) -> None:
    db.add(Link(short_code="taken00", original_url="https://other.example"))
    db.commit()

    # Simulate the race: the first generated code is already in the table by commit time.
    with patch("brev.services.link_services.generate_unique_code", side_effect=["taken00", "fresh00"]):
        response = client.post("/api/links", json={"url": "https://example.com"})

    assert response.status_code == 201
    assert response.json()["short_url"].endswith("/fresh00")
