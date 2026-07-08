from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.deps import get_identity_publisher, require_permission
from app.core.config import Settings, get_settings
from app.core.permissions import Permission
from app.db.base import Base
from app.db.session import get_session
from app.main import create_app


class RecordingPublisher:
    def __init__(self) -> None:
        self.events = []

    async def publish(self, event) -> None:
        self.events.append(event)


@pytest.fixture
async def client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    Session = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_session():
        async with Session() as session:
            yield session

    settings = Settings(
        database_url="sqlite+aiosqlite:///:memory:",
        access_token_secret="test-access-secret-long-enough",
    )
    publisher = RecordingPublisher()

    app = create_app()

    @app.get("/admin-only")
    async def admin_only(_user=__import__("fastapi").Depends(require_permission(Permission.ADMIN_DASHBOARD))):
        return {"status": "ok"}

    app.dependency_overrides[get_session] = override_session
    app.dependency_overrides[get_settings] = lambda: settings
    app.dependency_overrides[get_identity_publisher] = lambda: __import__(
        "app.publishers.identity_publisher",
        fromlist=["IdentityEventPublisher"],
    ).IdentityEventPublisher(publisher)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        test_client.recorded_events = publisher.events
        yield test_client

    await engine.dispose()


async def test_register_login_me_refresh_and_logout(client: AsyncClient) -> None:
    register_response = await client.post(
        "/api/v1/auth/register",
        json={"email": "Buyer@Example.com", "password": "very-secret-password", "role": "user"},
    )
    assert register_response.status_code == 201
    assert register_response.json()["email"] == "buyer@example.com"
    assert register_response.json()["roles"] == ["user"]

    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "buyer@example.com", "password": "very-secret-password"},
    )
    assert login_response.status_code == 200
    tokens = login_response.json()
    assert tokens["token_type"] == "bearer"
    assert tokens["expires_in"] == 900

    me_response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "buyer@example.com"

    refresh_response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert refresh_response.status_code == 200
    rotated_tokens = refresh_response.json()
    assert rotated_tokens["refresh_token"] != tokens["refresh_token"]

    reused_response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]},
    )
    assert reused_response.status_code == 401

    logout_response = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": rotated_tokens["refresh_token"]},
        headers={"Authorization": f"Bearer {rotated_tokens['access_token']}"},
    )
    assert logout_response.status_code == 204

    assert [event.event_type for event in client.recorded_events] == [
        "user.registered",
        "auth.login_succeeded",
    ]


async def test_login_invalid_credentials_returns_401(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "wrong"},
    )
    assert response.status_code == 401
    assert response.json()["code"] == "AUTHENTICATION_FAILED"


async def test_register_short_password_returns_422(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "buyer@example.com", "password": "short", "role": "user"},
    )
    assert response.status_code == 422


async def test_protected_endpoint_requires_auth(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert response.json()["code"] == "AUTHENTICATION_FAILED"


async def test_admin_permission_endpoint_denies_user(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "buyer@example.com", "password": "very-secret-password", "role": "user"},
    )
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": "buyer@example.com", "password": "very-secret-password"},
    )
    token = login_response.json()["access_token"]

    response = await client.get(
        "/admin-only",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert response.json()["code"] == "FORBIDDEN"
