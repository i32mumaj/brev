from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from brev.models import Click, Link
from brev.schemas import DailyClicks


def register_click(db: Session, link: Link) -> None:
    db.add(Click(link_id=link.id))
    db.commit()


def count_clicks(db: Session, link: Link) -> int:
    return db.scalar(select(func.count()).where(Click.link_id == link.id)) or 0


def clicks_per_day(db: Session, link: Link, days: int) -> list[DailyClicks]:
    """Clicks per UTC day over the last `days` days, today included, oldest first."""
    today = datetime.now(UTC).date()
    start = today - timedelta(days=days - 1)
    day = func.date(Click.clicked_at)

    rows = db.execute(
        select(day, func.count())
        .where(Click.link_id == link.id, Click.clicked_at >= datetime.combine(start, time.min))
        .group_by(day)
    ).all()
    counts = {date.fromisoformat(value): count for value, count in rows}

    # Days without clicks are missing from the query, so the series is filled in here.
    series = (start + timedelta(days=offset) for offset in range(days))
    return [DailyClicks(date=current, count=counts.get(current, 0)) for current in series]
