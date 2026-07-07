"""Common pydantic settings primitive for DigiMart services."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class DigimartBaseSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

