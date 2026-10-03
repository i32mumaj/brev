import uuid
from datetime import UTC, datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, HttpUrl


def _as_utc(value: datetime) -> datetime:
    # SQLite no guarda la zona horaria: las fechas se escriben en UTC y vuelven
    # sin tzinfo, así que se la ponemos para que el JSON lleve la "Z".
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


UtcDatetime = Annotated[datetime, AfterValidator(_as_utc)]


class LinkCreate(BaseModel):
    url: HttpUrl


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


class Message(BaseModel):
    message: str


class ErrorDetail(BaseModel):
    detail: str
