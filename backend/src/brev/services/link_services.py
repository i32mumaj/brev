from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from brev.models import Link
from brev.schemas import LinkCreate, LinkCreated, LinkStats
from brev.services.click_services import count_clicks
from brev.services.utils import generate_unique_code

MAX_CREATE_ATTEMPTS = 5


def find_link(db: Session, short_code: str) -> Link | None:
    return db.scalar(select(Link).where(Link.short_code == short_code))


def get_link_by_code(db: Session, short_code: str) -> Link:
    link = find_link(db, short_code)

    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

    return link


def create_link(db: Session, payload: LinkCreate, base_url: str) -> LinkCreated:
    url_str = str(payload.url)

    for _ in range(MAX_CREATE_ATTEMPTS):
        short_code = generate_unique_code(db, url_str)
        db.add(Link(short_code=short_code, original_url=url_str))
        try:
            db.commit()
        except IntegrityError:
            # A concurrent request took the same code between the check and the
            # insert; the next attempt sees it as taken and chains past it.
            db.rollback()
            continue
        return LinkCreated(short_url=f"{base_url}{short_code}")

    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Could not allocate a short code")


def get_link_stats(db: Session, link: Link) -> LinkStats:
    return LinkStats(
        original_url=link.original_url,
        short_code=link.short_code,
        created_at=link.created_at,
        click_count=count_clicks(db, link),
    )


def delete_link(db: Session, link: Link) -> None:
    db.delete(link)
    db.commit()
