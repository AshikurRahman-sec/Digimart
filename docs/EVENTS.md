# DigiMart — RabbitMQ Event Contracts

RabbitMQ is the required interprocess communication layer for DigiMart backend services. This document is the source of truth for exchanges, routing keys, event names, and payload contracts.

---

## 1. Broker topology

| Name | Type | Purpose |
|------|------|---------|
| `digimart.events` | topic exchange | Domain events that already happened |
| `digimart.commands` | direct exchange | Commands targeted at one service |
| `digimart.retry` | topic exchange | Delayed/retry message flow |
| `digimart.dlx` | topic exchange | Dead-lettered messages |

Queues are owned by consumers, not producers. Queue names use:

```text
{service}.{purpose}.q
{service}.{purpose}.retry.q
{service}.{purpose}.dlq
```

Examples:

```text
media-worker.content-processing.q
entitlement.payment-events.q
notification.email-events.q
audit.domain-events.q
```

---

## 2. Message envelope

Every event and command must use this envelope:

```json
{
  "event_id": "uuid",
  "event_type": "payment.completed",
  "event_version": 1,
  "occurred_at": "2026-07-07T12:00:00Z",
  "producer": "payment-service",
  "correlation_id": "uuid",
  "payload": {}
}
```

Rules:

- `event_id` is globally unique and used for idempotency.
- `event_type` must match this document.
- `event_version` starts at `1`; increment for breaking payload changes.
- `correlation_id` must flow from the gateway request when available.
- Payloads must not include secrets, refresh tokens, card data, raw S3 URLs, or private storage keys unless the consuming service explicitly owns that storage workflow.

---

## 3. Routing keys

Use event type as the routing key for domain events:

```text
user.registered
content.upload_completed
content.ready
payment.completed
subscription.changed
entitlement.invalidated
playback.started
```

Use command names for direct command routing:

```text
media.process_content
notification.send_email
```

---

## 4. Required events

### `user.registered`

Producer: identity service

Consumers: audit service, notification service

```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "roles": ["buyer"]
}
```

### `auth.login_succeeded`

Producer: identity service

Consumers: audit service

```json
{
  "user_id": "uuid",
  "ip_address": "203.0.113.10",
  "user_agent": "browser user agent"
}
```

### `user.role_changed`

Producer: identity service

Consumers: gateway cache, audit service

```json
{
  "user_id": "uuid",
  "old_roles": ["buyer"],
  "new_roles": ["buyer", "creator"]
}
```

### `content.upload_completed`

Producer: content service

Consumers: media-worker service, audit service

```json
{
  "content_id": "uuid",
  "creator_id": "uuid",
  "content_type": "video",
  "storage_key_raw": "raw/{creator_id}/{content_id}/original.mp4",
  "file_size_bytes": 104857600,
  "mime_type": "video/mp4"
}
```

### `content.ready`

Producer: media-worker service

Consumers: content service, catalog service, entitlement service, notification service, audit service

```json
{
  "content_id": "uuid",
  "storage_key_processed": "processed/{content_id}/video/master.m3u8",
  "duration_seconds": 3600,
  "thumbnail_url": "processed/{content_id}/thumb.jpg"
}
```

### `content.failed`

Producer: media-worker service

Consumers: content service, notification service, audit service

```json
{
  "content_id": "uuid",
  "failure_stage": "virus_scan",
  "error_code": "MALWARE_DETECTED",
  "error_message": "Upload failed security scan"
}
```

### `product.published`

Producer: catalog service

Consumers: entitlement service, notification service, audit service

```json
{
  "product_id": "uuid",
  "creator_id": "uuid",
  "slug": "python-masterclass",
  "content_ids": ["uuid"]
}
```

### `payment.completed`

Producer: payment service

Consumers: entitlement service, notification service, audit service

```json
{
  "purchase_id": "uuid",
  "user_id": "uuid",
  "product_id": "uuid",
  "amount_cents": 4999,
  "currency": "USD",
  "stripe_checkout_session_id": "cs_test_..."
}
```

### `payment.refunded`

Producer: payment service

Consumers: entitlement service, notification service, audit service

```json
{
  "purchase_id": "uuid",
  "user_id": "uuid",
  "product_id": "uuid",
  "stripe_payment_intent_id": "pi_..."
}
```

### `subscription.changed`

Producer: payment service

Consumers: entitlement service, notification service, audit service

```json
{
  "subscription_id": "uuid",
  "user_id": "uuid",
  "plan_id": "uuid",
  "status": "active",
  "current_period_end": "2026-08-07T12:00:00Z"
}
```

### `entitlement.invalidated`

Producer: entitlement service

Consumers: playback service, gateway cache, audit service

```json
{
  "user_id": "uuid",
  "content_id": "uuid",
  "reason": "payment.completed"
}
```

### `playback.started`

Producer: playback service

Consumers: audit service

```json
{
  "user_id": "uuid",
  "content_id": "uuid",
  "session_id": "uuid"
}
```

### `playback.ended`

Producer: playback service

Consumers: audit service

```json
{
  "user_id": "uuid",
  "content_id": "uuid",
  "session_id": "uuid",
  "duration_seconds": 1200
}
```

---

## 5. Required commands

### `media.process_content`

Producer: content service

Consumer: media-worker service

Use this command only when an explicit command is clearer than the `content.upload_completed` event. Prefer events for normal upload processing.

```json
{
  "content_id": "uuid",
  "force_reprocess": false
}
```

### `notification.send_email`

Producer: any service

Consumer: notification service

Prefer domain events when the notification is a reaction to business state. Use this command for direct operational emails.

```json
{
  "to_user_id": "uuid",
  "template": "content_ready",
  "data": {}
}
```

---

## 6. Consumer requirements

- Validate the envelope and payload before processing.
- Store or otherwise guard processed `event_id` values for idempotency when side effects matter.
- Acknowledge messages only after the local transaction or side effect succeeds.
- Retry transient failures through retry queues.
- Send poison messages to a DLQ with enough logging to debug.
- Include `event_id` and `correlation_id` in every log line.

---

## 7. Change process

When changing events:

1. Update this document.
2. Update `backend/shared/digimart_shared/events.py`.
3. Add or update producer contract tests.
4. Add or update consumer contract tests.
5. Keep backward compatibility unless all consumers are migrated in the same change.
