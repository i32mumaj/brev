import random
from datetime import datetime, timedelta, timezone

from brev.database.database import Base, SessionLocal, engine
from brev.database.models import Click, Link
from brev.services.utils import generate_unique_code

Base.metadata.create_all(bind=engine)

db = SessionLocal()

db.query(Click).delete()
db.query(Link).delete()
db.commit()

urls = [
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

sample_links = []
for url in urls:
    code = generate_unique_code(db, url)
    sample_links.append(Link(short_code=code, original_url=url))

db.add_all(sample_links)
db.commit()

for link in sample_links:
    db.refresh(link)
    num_clicks = random.randint(0, 50)
    for _ in range(num_clicks):
        days_ago = random.randint(0, 30)
        clicked_at = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 23))
        db.add(Click(link_id=link.id, clicked_at=clicked_at))

db.commit()
db.close()

print(f"Base de datos poblada con {len(sample_links)} enlaces y clics de prueba.")
