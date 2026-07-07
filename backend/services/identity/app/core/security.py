"""Password, JWT, and refresh-token security helpers."""

from __future__ import annotations

import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import jwt
from pwdlib import PasswordHash

from app.core.config import Settings
from app.core.exceptions import AuthenticationError
from app.core.permissions import Role


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: UUID, roles: list[Role], settings: Settings) -> tuple[str, int]:
    expires_delta = timedelta(seconds=settings.access_token_ttl_seconds)
    now = datetime.now(UTC)
    expires_at = now + expires_delta
    payload = {
        "sub": str(user_id),
        "roles": [role.value for role in roles],
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(payload, settings.access_token_secret, algorithm=settings.access_token_algorithm)
    return token, settings.access_token_ttl_seconds


def decode_access_token(token: str, settings: Settings) -> dict[str, object]:
    try:
        payload = jwt.decode(
            token,
            settings.access_token_secret,
            algorithms=[settings.access_token_algorithm],
        )
    except jwt.PyJWTError as exc:
        raise AuthenticationError("Invalid or expired access token") from exc
    if not payload.get("sub"):
        raise AuthenticationError("Invalid access token subject")
    return payload


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

