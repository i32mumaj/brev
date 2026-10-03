import uuid
from datetime import UTC, datetime

from sqlalchemy import UUID, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from brev.database.database import Base


class Link(Base):
    __tablename__ = "links"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid7)
    short_code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    original_url: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

    clicks = relationship("Click", back_populates="link", cascade="all, delete-orphan")

class Click(Base):
    __tablename__ = "clicks"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid7)
    link_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("links.id"), nullable=False)
    clicked_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))

    link = relationship("Link", back_populates="clicks")
