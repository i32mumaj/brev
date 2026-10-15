import random
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete

from brev.db import SessionLocal
from brev.models import Click, Link
from brev.services.utils import generate_unique_code

URLS = [
    "https://www.youtube.com/watch?v=rGWF3ZsZPYs",
    "https://github.com",
    "https://fastapi.tiangolo.com",
    "https://docs.sqlalchemy.org",
    "https://react.dev",
    "https://www.python.org",
    "https://vitejs.dev",
    "https://developer.mozilla.org",
    "https://stackoverflow.com",
    "https://www.reddit.com/r/programming",
    "https://news.ycombinator.com",
    "https://www.wikipedia.org",
    "https://twitter.com",
    "https://www.linkedin.com",
    "https://www.netflix.com",
    "https://www.spotify.com",
    "https://www.twitch.tv",
    "https://www.amazon.com",
    "https://www.google.com",
    "https://www.notion.so",
    "https://www.figma.com",
    "https://www.docker.com",
    "https://kubernetes.io",
    "https://www.postgresql.org",
    "https://redis.io",
    "https://www.rust-lang.org",
    "https://go.dev",
    "https://nodejs.org",
    "https://www.typescriptlang.org",
    "https://tailwindcss.com",
]


def main() -> None:
    with SessionLocal() as db:
        db.execute(delete(Click))
        db.execute(delete(Link))
        db.commit()

        links = []
        for url in URLS:
            link = Link(short_code=generate_unique_code(db, url), original_url=url)
            db.add(link)
            db.flush()
            links.append(link)

        now = datetime.now(UTC)
        for link in links:
            for _ in range(random.randint(0, 50)):
                ago = timedelta(days=random.randint(0, 29), hours=random.randint(0, 23))
                db.add(Click(link_id=link.id, clicked_at=now - ago))

        db.commit()

    print(f"Seeded {len(links)} links with sample clicks.")


if __name__ == "__main__":
    main()
