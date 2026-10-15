"""Create links and clicks.

Revision ID: 0001
Revises:
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "links",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("short_code", sa.String(), nullable=False),
        sa.Column("original_url", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("short_code"),
    )
    op.create_table(
        "clicks",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("link_id", sa.Uuid(), nullable=False),
        sa.Column("clicked_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["link_id"], ["links.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_clicks_link_id", "clicks", ["link_id"])
    op.create_index("ix_clicks_clicked_at", "clicks", ["clicked_at"])


def downgrade() -> None:
    op.drop_index("ix_clicks_clicked_at", table_name="clicks")
    op.drop_index("ix_clicks_link_id", table_name="clicks")
    op.drop_table("clicks")
    op.drop_table("links")
