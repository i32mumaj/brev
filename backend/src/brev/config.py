from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# backend/, regardless of the directory the app is started from.
BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    db_dir: Path = BACKEND_DIR / "data"
    cors_origins: Annotated[list[str], NoDecode] = []
    static_dir: Path | None = None
    enable_docs: bool = True

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def database_url(self) -> str:
        return f"sqlite:///{self.db_dir / 'link-shortener.db'}"


settings = Settings()
