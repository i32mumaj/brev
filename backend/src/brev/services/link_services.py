from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from brev.database.models import Link
from brev.schemas.schemas import LinkCreate, LinkCreated, LinkOut, LinkStats
from brev.services.click_services import count_clicks
from brev.services.utils import generate_unique_code


def get_links(db: Session) -> list[LinkOut]:
    return [LinkOut.model_validate(link) for link in db.query(Link).all()]


def get_link_by_code(db: Session, short_code: str) -> Link:
    link = db.query(Link).filter(Link.short_code == short_code).first()

    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

    return link


def create_link(db: Session, payload: LinkCreate, base_url: str) -> LinkCreated:
    url_str = str(payload.url)
    short_code = generate_unique_code(db, url_str)

    db.add(Link(short_code=short_code, original_url=url_str))
    db.commit()

    return LinkCreated(short_url=f"{base_url}{short_code}")


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
