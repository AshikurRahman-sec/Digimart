"""RabbitMQ publishing helpers.

The shared package contains infrastructure primitives only. Service-specific
event choices stay inside each owning service.
"""

from __future__ import annotations

import json
from typing import Protocol

from .events import EventEnvelope


DIGIMART_EVENTS_EXCHANGE = "digimart.events"
DIGIMART_COMMANDS_EXCHANGE = "digimart.commands"
DIGIMART_RETRY_EXCHANGE = "digimart.retry"
DIGIMART_DLX_EXCHANGE = "digimart.dlx"


class EventPublisher(Protocol):
    async def publish(self, event: EventEnvelope) -> None:
        """Publish a domain event."""


class NoopEventPublisher:
    """Publisher used in tests/local service runs without RabbitMQ configured."""

    async def publish(self, event: EventEnvelope) -> None:
        return None


class RabbitMQEventPublisher:
    """Small aio-pika publisher for durable topic events."""

    def __init__(self, rabbitmq_url: str, exchange_name: str = DIGIMART_EVENTS_EXCHANGE) -> None:
        self.rabbitmq_url = rabbitmq_url
        self.exchange_name = exchange_name

    async def publish(self, event: EventEnvelope) -> None:
        import aio_pika

        connection = await aio_pika.connect_robust(self.rabbitmq_url)
        async with connection:
            channel = await connection.channel()
            exchange = await channel.declare_exchange(
                self.exchange_name,
                aio_pika.ExchangeType.TOPIC,
                durable=True,
            )
            message = aio_pika.Message(
                body=json.dumps(event.model_dump(mode="json")).encode("utf-8"),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
                content_type="application/json",
                correlation_id=str(event.correlation_id),
                message_id=str(event.event_id),
                type=str(event.event_type),
            )
            await exchange.publish(message, routing_key=str(event.event_type))

