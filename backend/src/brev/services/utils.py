import hashlib

from sqlalchemy.orm import Session

from brev.database.models import Link


def hash_7_chars(url: str) -> str:
    hash_bytes = hashlib.sha256(url.encode('utf-8')).digest()
    hash_int = int.from_bytes(hash_bytes, 'big')

    chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result = ""
    while len(result) < 7:
        hash_int, rest = divmod(hash_int, 62)
        result += chars[rest]

    return result[:7]


def generate_unique_code(db: Session, url: str) -> str:
    # La misma URL puede acortarse varias veces, así que en colisión se
    # re-hashea encadenando el código anterior hasta dar con uno libre.
    short_code = hash_7_chars(url)
    while db.query(Link).filter(Link.short_code == short_code).first() is not None:
        short_code = hash_7_chars(url + short_code)
    return short_code
