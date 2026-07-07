"""Identity-owned domain event publisher."""

from __future__ import annotations

from uuid import UUID

from digimart_shared.events import EventType, build_event
from digimart_shared.messaging import EventPublisher

from app.models import User


class IdentityEventPublisher:
    producer = "identity-service"

    def __init__(self, publisher: EventPublisher) -> None:
        self.publisher = publisher

    async def publish_user_registered(self, user: User, correlation_id: UUID | None = None) -> None:
        await self.publisher.publish(
            build_event(
                event_type=EventType.USER_REGISTERED,
                producer=self.producer,
                correlation_id=correlation_id,
                payload={
                    "user_id": str(user.id),
                    "email": user.email,
                    "roles": user.roles,
                },
            )
        )

    async def publish_login_succeeded(
        self,
        user: User,
        *,
        ip_address: str | None,
        user_agent: str | None,
        correlation_id: UUID | None = None,
    ) -> None:
        await self.publisher.publish(
            build_event(
                event_type=EventType.AUTH_LOGIN_SUCCEEDED,
                producer=self.producer,
                correlation_id=correlation_id,
                payload={
                    "user_id": str(user.id),
                    "ip_address": ip_address or "",
                    "user_agent": user_agent or "",
                },
            )
        )

