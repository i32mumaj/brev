from typing import Annotated, Any

from fastapi import Depends, FastAPI, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from brev.config import settings
from brev.db import get_db
from brev.models import Link
from brev.schemas import (
    DailyClicks,
    ErrorDetail,
    LinkCreate,
    LinkCreated,
    LinkOut,
    LinkStats,
    Message,
)
from brev.services.click_services import clicks_per_day, register_click
from brev.services.link_services import (
    create_link,
    delete_link,
    get_link_by_code,
    get_link_stats,
)

app = FastAPI(
    title="brev",
    summary="URL shortener with click stats",
    docs_url="/docs" if settings.enable_docs else None,
    redoc_url="/redoc" if settings.enable_docs else None,
    openapi_url="/openapi.json" if settings.enable_docs else None,
)

if settings.cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["Content-Type"],
    )

DB = Depends(get_db)

NOT_FOUND: dict[int | str, dict[str, Any]] = {status.HTTP_404_NOT_FOUND: {"model": ErrorDetail}}


def resolve_link(short_code: str, db: Session = DB) -> Link:
    return get_link_by_code(db, short_code)


LINK = Depends(resolve_link)


@app.get("/api/health")
def health(db: Session = DB) -> Message:
    db.execute(text("SELECT 1"))
    return Message(message="ok")


@app.post("/api/links", status_code=status.HTTP_201_CREATED)
def shorten_link(payload: LinkCreate, request: Request, db: Session = DB) -> LinkCreated:
    return create_link(db, payload, str(request.base_url))


@app.get("/api/links/{short_code}", responses=NOT_FOUND)
def read_link(link: Link = LINK) -> LinkOut:
    return LinkOut.model_validate(link)


@app.get("/api/links/{short_code}/stats", responses=NOT_FOUND)
def read_link_stats(link: Link = LINK, db: Session = DB) -> LinkStats:
    return get_link_stats(db, link)


@app.get("/api/links/{short_code}/clicks", responses=NOT_FOUND)
def read_daily_clicks(
    days: Annotated[int, Query(ge=1, le=365)] = 30,
    link: Link = LINK,
    db: Session = DB,
) -> list[DailyClicks]:
    return clicks_per_day(db, link, days)


@app.delete("/api/links/{short_code}", responses=NOT_FOUND)
def remove_link(link: Link = LINK, db: Session = DB) -> Message:
    delete_link(db, link)
    return Message(message="Link deleted successfully")


if settings.static_dir:
    # Production build of the frontend, served from the same origin as the API.
    static_dir = settings.static_dir
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/", include_in_schema=False)
    def index() -> FileResponse:
        return FileResponse(static_dir / "index.html")

    @app.get("/favicon.svg", include_in_schema=False)
    def favicon() -> FileResponse:
        return FileResponse(static_dir / "favicon.svg")


# Catch-all for short codes: registered last so it never shadows the routes above.
@app.get(
    "/{short_code}",
    response_class=RedirectResponse,
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    responses=NOT_FOUND,
)
def redirect_link(link: Link = LINK, db: Session = DB) -> RedirectResponse:
    register_click(db, link)
    return RedirectResponse(url=link.original_url)
