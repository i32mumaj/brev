import uuid
from datetime import UTC, date, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, HttpUrl, UrlConstraints

MAX_URL_LENGTH = 2048


def _as_utc(value: datetime) -> datetime:
    # SQLite does not store the time zone: dates are written in UTC and come back
    # naive, so it is added back for the JSON to carry the "Z".
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


UtcDatetime = Annotated[datetime, AfterValidator(_as_utc)]


class LinkCreate(BaseModel):
    url: Annotated[HttpUrl, UrlConstraints(max_length=MAX_URL_LENGTH)]


class LinkCreated(BaseModel):
    short_url: str


class LinkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    short_code: str
    original_url: str
    created_at: UtcDatetime


class LinkStats(BaseModel):
    original_url: str
    short_code: str
    created_at: UtcDatetime
    click_count: int


class DailyClicks(BaseModel):
    date: date
    count: int


class Message(BaseModel):
    message: str


class ErrorDetail(BaseModel):
    detail: str
