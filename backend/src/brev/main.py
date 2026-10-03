from typing import Any

from fastapi import Depends, FastAPI, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from brev.database.database import Base, engine, get_db
from brev.database.models import Link
from brev.schemas.schemas import (
    ErrorDetail,
    LinkCreate,
    LinkCreated,
    LinkOut,
    LinkStats,
    Message,
)
from brev.services.click_services import register_click
from brev.services.link_services import (
    create_link,
    delete_link,
    get_link_by_code,
    get_link_stats,
    get_links,
)

Base.metadata.create_all(bind=engine)

app = FastAPI()

DB = Depends(get_db)

NOT_FOUND: dict[int | str, dict[str, Any]] = {status.HTTP_404_NOT_FOUND: {"model": ErrorDetail}}


def resolve_link(short_code: str, db: Session = DB) -> Link:
    return get_link_by_code(db, short_code)


LINK = Depends(resolve_link)


@app.get(
    "/{short_code}",
    response_class=RedirectResponse,
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    responses=NOT_FOUND,
)
def redirect_link(link: Link = LINK, db: Session = DB):
    register_click(db, link)
    return RedirectResponse(url=link.original_url)


@app.post("/api/links")
def shorten_link(payload: LinkCreate, request: Request, db: Session = DB) -> LinkCreated:
    return create_link(db, payload, str(request.base_url))


@app.get("/api/links")
def list_links(db: Session = DB) -> list[LinkOut]:
    return get_links(db)


@app.get("/api/links/{short_code}", responses=NOT_FOUND)
def read_link(link: Link = LINK) -> LinkOut:
    return LinkOut.model_validate(link)


@app.get("/api/links/{short_code}/stats", responses=NOT_FOUND)
def read_link_stats(link: Link = LINK, db: Session = DB) -> LinkStats:
    return get_link_stats(db, link)


@app.delete("/api/links/{short_code}", responses=NOT_FOUND)
def remove_link(link: Link = LINK, db: Session = DB) -> Message:
    delete_link(db, link)
    return Message(message="Link deleted successfully")
