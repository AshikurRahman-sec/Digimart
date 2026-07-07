"""Auth endpoints owned by the identity service."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_correlation_id, get_current_user, get_identity_publisher
from app.core.config import Settings, get_settings
from app.db.session import get_session
from app.models import User
from app.publishers.identity_publisher import IdentityEventPublisher
from app.schemas.auth import LoginRequest, LogoutRequest, RefreshRequest, RegisterRequest, TokenPair, UserRead
from app.service_layer.auth_service import AuthService


router = APIRouter(prefix="/auth", tags=["auth"])


def serialize_user(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        email=user.email,
        roles=user.role_values,
        is_active=user.is_active,
        email_verified=user.email_verified,
        created_at=user.created_at,
    )


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
    publisher: IdentityEventPublisher = Depends(get_identity_publisher),
    correlation_id: UUID | None = Depends(get_correlation_id),
) -> UserRead:
    user = await AuthService(session, settings, publisher).register(body, correlation_id=correlation_id)
    return serialize_user(user)


@router.post("/login", response_model=TokenPair)
async def login(
    body: LoginRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
    publisher: IdentityEventPublisher = Depends(get_identity_publisher),
    correlation_id: UUID | None = Depends(get_correlation_id),
) -> TokenPair:
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    return await AuthService(session, settings, publisher).login(
        body.email,
        body.password,
        ip_address=ip_address,
        user_agent=user_agent,
        correlation_id=correlation_id,
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh(
    body: RefreshRequest,
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
    publisher: IdentityEventPublisher = Depends(get_identity_publisher),
) -> TokenPair:
    return await AuthService(session, settings, publisher).refresh(body.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    body: LogoutRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
    publisher: IdentityEventPublisher = Depends(get_identity_publisher),
) -> None:
    await AuthService(session, settings, publisher).logout(current_user, body.refresh_token)


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)) -> UserRead:
    return serialize_user(current_user)

