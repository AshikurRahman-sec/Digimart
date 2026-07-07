"""Identity service configuration."""

from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="IDENTITY_", extra="ignore")

    app_name: str = "DigiMart Identity Service"
    database_url: str = "postgresql+asyncpg://digimart:digimart@localhost:5432/digimart"
    access_token_secret: str = Field(default="dev-access-secret-change-me", min_length=16)
    access_token_algorithm: str = "HS256"
    access_token_ttl_seconds: int = 900
    refresh_token_ttl_seconds: int = 604800
    rabbitmq_url: str | None = None
    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
