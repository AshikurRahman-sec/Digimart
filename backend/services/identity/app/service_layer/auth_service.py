"""Identity authentication use cases."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import Settings
from app.core.exceptions import AuthenticationError, ConflictError
from app.core.permissions import Role
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models import RefreshToken, User
from app.publishers.identity_publisher import IdentityEventPublisher
from app.schemas.auth import RegisterRequest, TokenPair


class AuthService:
    def __init__(
        self,
        session: AsyncSession,
        settings: Settings,
        publisher: IdentityEventPublisher,
    ) -> None:
        self.session = session
        self.settings = settings
        self.publisher = publisher

    async def register(self, request: RegisterRequest, correlation_id: UUID | None = None) -> User:
        email = request.email.lower()
        existing = await self.session.scalar(select(User).where(User.email == email))
        if existing:
            raise ConflictError("A user with this email already exists")

        roles = [Role.USER.value]

        user = User(email=email, password_hash=hash_password(request.password), roles=roles)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        await self.publisher.publish_user_registered(user, correlation_id=correlation_id)
        return user

    async def login(
        self,
        email: str,
        password: str,
        *,
        ip_address: str | None = None,
        user_agent: str | None = None,
        correlation_id: UUID | None = None,
    ) -> TokenPair:
        user = await self.session.scalar(select(User).where(User.email == email.lower()))
        if not user or not user.is_active or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        token_pair = await self._issue_token_pair(user)
        await self.session.commit()
        await self.publisher.publish_login_succeeded(
            user,
            ip_address=ip_address,
            user_agent=user_agent,
            correlation_id=correlation_id,
        )
        return token_pair

    async def refresh(self, refresh_token: str) -> TokenPair:
        token_hash = hash_refresh_token(refresh_token)
        db_token = await self.session.scalar(
            select(RefreshToken)
            .options(selectinload(RefreshToken.user))
            .where(RefreshToken.token_hash == token_hash)
        )
        now = datetime.now(UTC)
        if (
            not db_token
            or db_token.revoked_at is not None
            or _as_aware_utc(db_token.expires_at) <= now
            or not db_token.user.is_active
        ):
            raise AuthenticationError("Invalid refresh token")

        db_token.revoked_at = now
        token_pair = await self._issue_token_pair(db_token.user)
        await self.session.commit()
        return token_pair

    async def logout(self, user: User, refresh_token: str | None = None) -> None:
        now = datetime.now(UTC)
        if refresh_token:
            token_hash = hash_refresh_token(refresh_token)
            db_token = await self.session.scalar(
                select(RefreshToken).where(
                    RefreshToken.user_id == user.id,
                    RefreshToken.token_hash == token_hash,
                    RefreshToken.revoked_at.is_(None),
                )
            )
            if db_token:
                db_token.revoked_at = now
        else:
            tokens = await self.session.scalars(
                select(RefreshToken).where(
                    RefreshToken.user_id == user.id,
                    RefreshToken.revoked_at.is_(None),
                )
            )
            for db_token in tokens:
                db_token.revoked_at = now
        await self.session.commit()

    async def _issue_token_pair(self, user: User) -> TokenPair:
        access_token, expires_in = create_access_token(user.id, user.role_values, self.settings)
        refresh_token = generate_refresh_token()
        expires_at = datetime.now(UTC) + timedelta(seconds=self.settings.refresh_token_ttl_seconds)
        self.session.add(
            RefreshToken(
                user_id=user.id,
                token_hash=hash_refresh_token(refresh_token),
                expires_at=expires_at,
            )
        )
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
        )


def _as_aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
