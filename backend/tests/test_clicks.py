from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from brev.models import Click, Link


def add_clicks(db: Session, short_code: str, *days_ago: int) -> None:
    link = db.scalars(select(Link).where(Link.short_code == short_code)).one()
    now = datetime.now(UTC)
    db.add_all(Click(link_id=link.id, clicked_at=now - timedelta(days=days)) for days in days_ago)
    db.commit()


def test_daily_clicks_fill_missing_days_with_zero(client: TestClient, db: Session, short_code: str) -> None:
    add_clicks(db, short_code, 0, 0, 2, 40)

    series = client.get(f"/api/links/{short_code}/clicks", params={"days": 7}).json()

    today = datetime.now(UTC).date()
    assert [day["date"] for day in series] == [str(today - timedelta(days=n)) for n in range(6, -1, -1)]
    assert [day["count"] for day in series] == [0, 0, 0, 0, 1, 0, 2]


def test_daily_clicks_default_to_30_days(client: TestClient, short_code: str) -> None:
    series = client.get(f"/api/links/{short_code}/clicks").json()

    assert len(series) == 30
    assert all(day["count"] == 0 for day in series)


def test_daily_clicks_validate_the_range(client: TestClient, short_code: str) -> None:
    assert client.get(f"/api/links/{short_code}/clicks", params={"days": 0}).status_code == 422
    assert client.get(f"/api/links/{short_code}/clicks", params={"days": 366}).status_code == 422
