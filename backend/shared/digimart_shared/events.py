"""RabbitMQ event contract definitions shared by DigiMart services."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import StrEnum
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class EventType(StrEnum):
    USER_REGISTERED = "user.registered"
    AUTH_LOGIN_SUCCEEDED = "auth.login_succeeded"
    USER_ROLE_CHANGED = "user.role_changed"
    CONTENT_UPLOAD_COMPLETED = "content.upload_completed"
    CONTENT_READY = "content.ready"
    CONTENT_FAILED = "content.failed"
    PRODUCT_PUBLISHED = "product.published"
    PAYMENT_COMPLETED = "payment.completed"
    PAYMENT_REFUNDED = "payment.refunded"
    SUBSCRIPTION_CHANGED = "subscription.changed"
    ENTITLEMENT_INVALIDATED = "entitlement.invalidated"
    PLAYBACK_STARTED = "playback.started"
    PLAYBACK_ENDED = "playback.ended"


EVENT_VERSIONS: dict[EventType, int] = {
    event_type: 1 for event_type in EventType
}


class EventEnvelope(BaseModel):
    """Validated event envelope required by docs/EVENTS.md."""

    model_config = ConfigDict(use_enum_values=True)

    event_id: UUID = Field(default_factory=uuid4)
    event_type: EventType
    event_version: int = 1
    occurred_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    producer: str
    correlation_id: UUID = Field(default_factory=uuid4)
    payload: dict[str, Any]


def build_event(
    *,
    event_type: EventType,
    producer: str,
    payload: dict[str, Any],
    correlation_id: UUID | None = None,
) -> EventEnvelope:
    """Create an event envelope using the source-of-truth version map."""

    return EventEnvelope(
        event_type=event_type,
        event_version=EVENT_VERSIONS[event_type],
        producer=producer,
        correlation_id=correlation_id or uuid4(),
        payload=payload,
    )

