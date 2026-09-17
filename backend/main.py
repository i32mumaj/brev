import os

from fastapi import FastAPI, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from utils import hash_7_chars
from database import Base, engine, get_db
from schemas import LinkCreate
from models import Link, Click

Base.metadata.create_all(bind=engine)

app = FastAPI()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def not_implemented():
    raise HTTPException(status_code=501, detail="Not Implemented")

#this one should redirect to the original url if the shortened url is found in the database, otherwise it should return a 404 error

@app.get("/{short_code}")
async def get_link(short_code: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    # Record the click
    new_click = Click(link_id=link.id)
    db.add(new_click)
    db.commit()

    return RedirectResponse(url=link.original_url)
    
    

@app.post("/api/links")
def create_link(payload: LinkCreate, request: Request, db: Session = Depends(get_db)):
    url_str = str(payload.url)

    short_code = hash_7_chars(url_str)
    while db.query(Link).filter(Link.short_code == short_code).first() is not None:
        short_code = hash_7_chars(url_str + short_code)

    new_link = Link(short_code=short_code, original_url=url_str)
    db.add(new_link)
    db.commit()
    db.refresh(new_link)

    return {"short_url": f"{request.base_url}{short_code}"}

@app.get("/api/links")
async def get_links(db: Session = Depends(get_db)):
    links = db.query(Link).all()
    return links

@app.get("/api/links/{short_code}")
async def get_link_by_code(short_code: str, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    return link

@app.get("/api/links/{short_code}/stats")
async def get_link_stats(short_code: str, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    click_count = db.query(Click).filter(Click.link_id == link.id).count()
    return {
        "original_url": link.original_url,
        "short_code": link.short_code,
        "created_at": link.created_at,
        "click_count": click_count
    }

@app.delete("/api/links/{short_code}")
async def delete_link(short_code: str, request: Request, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    db.delete(link)
    db.commit()
    return {"message": "Link deleted successfully"}

    
