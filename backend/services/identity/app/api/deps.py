"""FastAPI dependencies for identity auth and authorization."""

from __future__ import annotations

from collections.abc import AsyncIterator, Callable
from uuid import UUID

from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from digimart_shared.messaging import NoopEventPublisher, RabbitMQEventPublisher

from app.core.config import Settings, get_settings
from app.core.exceptions import AuthenticationError
from app.core.permissions import Permission, Role
from app.core.security import decode_access_token
from app.db.session import get_session
from app.models import User
from app.publishers.identity_publisher import IdentityEventPublisher
from app.service_layer.permission_service import permission_service


bearer_scheme = HTTPBearer(auto_error=False)


def get_correlation_id(x_correlation_id: str | None = Header(default=None)) -> UUID | None:
    if not x_correlation_id:
        return None
    try:
        return UUID(x_correlation_id)
    except ValueError as exc:
        raise AuthenticationError("Invalid correlation id") from exc


def get_identity_publisher(settings: Settings = Depends(get_settings)) -> IdentityEventPublisher:
    if settings.rabbitmq_url:
        return IdentityEventPublisher(RabbitMQEventPublisher(settings.rabbitmq_url))
    return IdentityEventPublisher(NoopEventPublisher())


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> User:
    if credentials is None:
        raise AuthenticationError("Authentication required")
    payload = decode_access_token(credentials.credentials, settings)
    user = await session.scalar(select(User).where(User.id == UUID(str(payload["sub"]))))
    if not user or not user.is_active:
        raise AuthenticationError("Authentication required")
    return user


def require_permission(permission: Permission) -> Callable[..., AsyncIterator[User]]:
    async def _dep(current_user: User = Depends(get_current_user)) -> User:
        permission_service.require_permission(current_user, permission)
        return current_user

    return _dep


def require_role(role: Role) -> Callable[..., AsyncIterator[User]]:
    async def _dep(current_user: User = Depends(get_current_user)) -> User:
        permission_service.require_role(current_user, role)
        return current_user

    return _dep


RequireCreator = require_role(Role.CREATOR)
RequireAdmin = require_role(Role.ADMIN)

