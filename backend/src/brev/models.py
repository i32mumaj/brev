import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from brev.db import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class Link(Base):
    __tablename__ = "links"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid7)
    short_code: Mapped[str] = mapped_column(String, unique=True)
    original_url: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    clicks: Mapped[list[Click]] = relationship(back_populates="link", cascade="all, delete-orphan")


class Click(Base):
    __tablename__ = "clicks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid7)
    link_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("links.id", ondelete="CASCADE"), index=True)
    clicked_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)

    link: Mapped[Link] = relationship(back_populates="clicks")
