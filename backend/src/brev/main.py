from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from brev.database.database import Base, engine, get_db
from brev.database.models import Click, Link
from brev.schemas.schemas import (
    ErrorDetail,
    LinkCreate,
    LinkCreated,
    LinkOut,
    LinkStats,
    Message,
)
from brev.services.utils import generate_unique_code

Base.metadata.create_all(bind=engine)

app = FastAPI()

DB = Depends(get_db)

NOT_FOUND: dict[int | str, dict[str, Any]] = {status.HTTP_404_NOT_FOUND: {"model": ErrorDetail}}


def resolve_link(short_code: str, db: Session = DB) -> Link:
    link = db.query(Link).filter(Link.short_code == short_code).first()

    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

    return link


LINK = Depends(resolve_link)


@app.get(
    "/{short_code}",
    response_class=RedirectResponse,
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    responses=NOT_FOUND,
)
def redirect_link(link: Link = LINK, db: Session = DB):
    db.add(Click(link_id=link.id))
    db.commit()
    return RedirectResponse(url=link.original_url)


@app.post("/api/links")
def shorten_link(payload: LinkCreate, request: Request, db: Session = DB) -> LinkCreated:
    url_str = str(payload.url)
    short_code = generate_unique_code(db, url_str)

    db.add(Link(short_code=short_code, original_url=url_str))
    db.commit()

    return LinkCreated(short_url=f"{request.base_url}{short_code}")


@app.get("/api/links")
def list_links(db: Session = DB) -> list[LinkOut]:
    return [LinkOut.model_validate(link) for link in db.query(Link).all()]


@app.get("/api/links/{short_code}", responses=NOT_FOUND)
def read_link(link: Link = LINK) -> LinkOut:
    return LinkOut.model_validate(link)


@app.get("/api/links/{short_code}/stats", responses=NOT_FOUND)
def read_link_stats(link: Link = LINK, db: Session = DB) -> LinkStats:
    return LinkStats(
        original_url=link.original_url,
        short_code=link.short_code,
        created_at=link.created_at,
        click_count=db.query(Click).filter(Click.link_id == link.id).count(),
    )


@app.delete("/api/links/{short_code}", responses=NOT_FOUND)
def remove_link(link: Link = LINK, db: Session = DB) -> Message:
    db.delete(link)
    db.commit()
    return Message(message="Link deleted successfully")
