from sqlalchemy import func, select
from sqlalchemy.orm import Session

from brev.models import Click, Link


def register_click(db: Session, link: Link) -> None:
    db.add(Click(link_id=link.id))
    db.commit()


def count_clicks(db: Session, link: Link) -> int:
    return db.scalar(select(func.count()).where(Click.link_id == link.id)) or 0
