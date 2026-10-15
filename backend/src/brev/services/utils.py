import hashlib

from sqlalchemy import select
from sqlalchemy.orm import Session

from brev.models import Link

ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
CODE_LENGTH = 7


def hash_7_chars(url: str) -> str:
    hash_int = int.from_bytes(hashlib.sha256(url.encode("utf-8")).digest(), "big")

    result = ""
    while len(result) < CODE_LENGTH:
        hash_int, rest = divmod(hash_int, len(ALPHABET))
        result += ALPHABET[rest]

    return result


def generate_unique_code(db: Session, url: str) -> str:
    # The same URL can be shortened several times, so on a collision the code is
    # re-hashed chained to the previous one until a free one turns up.
    short_code = hash_7_chars(url)
    while db.scalar(select(Link.id).where(Link.short_code == short_code)) is not None:
        short_code = hash_7_chars(url + short_code)
    return short_code
