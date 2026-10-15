import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from brev.models import Click
from brev.schemas import MAX_URL_LENGTH


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"message": "ok"}


def test_create_link_returns_short_url(client: TestClient) -> None:
    response = client.post("/api/links", json={"url": "https://example.com"})

    assert response.status_code == 201
    short_url = response.json()["short_url"]
    assert short_url.startswith("http://testserver/")
    assert len(short_url.rsplit("/", 1)[-1]) == 7


def test_same_url_gets_a_new_code_each_time(client: TestClient) -> None:
    first = client.post("/api/links", json={"url": "https://example.com"}).json()["short_url"]
    second = client.post("/api/links", json={"url": "https://example.com"}).json()["short_url"]

    assert first != second


@pytest.mark.parametrize(
    "url",
    ["not a url", "example.com", "ftp://example.com", f"https://example.com/{'a' * MAX_URL_LENGTH}"],
)
def test_create_link_rejects_invalid_urls(client: TestClient, url: str) -> None:
    assert client.post("/api/links", json={"url": url}).status_code == 422


def test_read_link(client: TestClient, short_code: str) -> None:
    read = client.get(f"/api/links/{short_code}").json()

    assert read["original_url"] == "https://example.com/some/long/path"
    assert read["created_at"].endswith("Z")


def test_redirect_registers_a_click(client: TestClient, short_code: str) -> None:
    assert client.get(f"/api/links/{short_code}/stats").json()["click_count"] == 0

    response = client.get(f"/{short_code}")

    assert response.status_code == 307
    assert response.headers["location"] == "https://example.com/some/long/path"
    assert client.get(f"/api/links/{short_code}/stats").json()["click_count"] == 1


def test_delete_link_removes_its_clicks(client: TestClient, db: Session, short_code: str) -> None:
    client.get(f"/{short_code}")

    response = client.delete(f"/api/links/{short_code}")

    assert response.status_code == 200
    assert client.get(f"/api/links/{short_code}").status_code == 404
    assert db.scalar(select(func.count()).select_from(Click)) == 0


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("GET", "/missing"),
        ("GET", "/api/links/missing"),
        ("GET", "/api/links/missing/stats"),
        ("GET", "/api/links/missing/clicks"),
        ("DELETE", "/api/links/missing"),
    ],
)
def test_unknown_code_returns_404(client: TestClient, method: str, path: str) -> None:
    response = client.request(method, path)

    assert response.status_code == 404
    assert response.json() == {"detail": "Link not found"}


def test_links_cannot_be_listed(client: TestClient, short_code: str) -> None:
    # Each browser only knows its own codes; there is no endpoint that reveals everyone's.
    assert client.get("/api/links").status_code == 405
