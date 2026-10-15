import pytest
from fastapi.testclient import TestClient
from starlette.requests import Request

from brev.main import app
from brev.rate_limit import client_key

URL = {"url": "https://example.com"}


def test_create_is_limited(client: TestClient) -> None:
    for _ in range(10):
        assert client.post("/api/links", json=URL).status_code == 201

    response = client.post("/api/links", json=URL)

    assert response.status_code == 429
    assert response.json() == {"detail": "Too many requests"}
    assert 0 < int(response.headers["retry-after"]) <= 60


def test_limits_are_per_client(client: TestClient) -> None:
    for _ in range(10):
        client.post("/api/links", json=URL)
    other = TestClient(app, client=("203.0.113.7", 50000))

    assert client.post("/api/links", json=URL).status_code == 429
    assert other.post("/api/links", json=URL).status_code == 201


def test_limit_is_checked_before_validation(client: TestClient) -> None:
    for _ in range(10):
        assert client.post("/api/links", json={"url": "not a url"}).status_code == 422

    assert client.post("/api/links", json={"url": "not a url"}).status_code == 429


def test_rejected_redirect_does_not_count_a_click(client: TestClient, short_code: str) -> None:
    for _ in range(60):
        assert client.get(f"/{short_code}").status_code == 307

    assert client.get(f"/{short_code}").status_code == 429
    assert client.get(f"/api/links/{short_code}/stats").json()["click_count"] == 60


def test_redirect_limit_applies_to_unknown_codes(client: TestClient) -> None:
    for _ in range(60):
        assert client.get("/missing").status_code == 404

    assert client.get("/missing").status_code == 429


def test_api_reads_allow_many_links_at_once(client: TestClient, short_code: str) -> None:
    # The list view fetches /stats for every saved link in parallel.
    for _ in range(300):
        assert client.get(f"/api/links/{short_code}/stats").status_code == 200

    assert client.get(f"/api/links/{short_code}/stats").status_code == 429
    assert client.delete(f"/api/links/{short_code}").status_code == 429


def test_scopes_are_independent(client: TestClient, short_code: str) -> None:
    for _ in range(10):
        client.post("/api/links", json=URL)

    assert client.post("/api/links", json=URL).status_code == 429
    assert client.get(f"/api/links/{short_code}/stats").status_code == 200
    assert client.get(f"/{short_code}").status_code == 307


def test_health_is_never_limited(client: TestClient) -> None:
    assert all(client.get("/api/health").status_code == 200 for _ in range(400))


@pytest.mark.parametrize(
    ("host", "key"),
    [
        ("203.0.113.7", "203.0.113.7"),
        ("2001:db8:1:2::1", "2001:db8:1:2::/64"),
        ("2001:db8:1:2:ffff::9", "2001:db8:1:2::/64"),
        ("2001:db8:1:3::1", "2001:db8:1:3::/64"),
        ("::ffff:203.0.113.7", "203.0.113.7"),
        ("testclient", "testclient"),
    ],
)
def test_client_key_groups_ipv6_by_64(host: str, key: str) -> None:
    assert client_key(Request({"type": "http", "client": (host, 1234)})) == key
