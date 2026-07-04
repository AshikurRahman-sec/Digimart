# DigiMart — API Contract

Base URL: `https://api.digimart.com/api/v1`  
Auth: `Authorization: Bearer <access_token>`

All responses use JSON. Errors:

```json
{
  "detail": "Human-readable message",
  "code": "ENTITLEMENT_DENIED"
}
```

---

## Auth

### POST /auth/register

```json
// Request
{ "email": "user@example.com", "password": "...", "role": "buyer" }

// Response 201
{ "id": "uuid", "email": "...", "roles": ["buyer"] }
```

### POST /auth/login

```json
// Request
{ "email": "...", "password": "..." }

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### POST /auth/refresh

```json
// Request
{ "refresh_token": "..." }

// Response 200 — new token pair (rotation)
```

### POST /auth/logout

Requires auth. Revokes refresh token.

---

## Creator profile

### POST /creators/profile

Auth required. Creates creator profile (adds `creator` role).

```json
{ "display_name": "Jane Doe", "slug": "jane-doe", "bio": "..." }
```

### GET /creators/{slug}

Public. Returns creator storefront info + published products.

### PATCH /creators/profile

Auth + creator role. Update profile.

---

## Content upload

### POST /content/upload/init

Auth + creator. Start upload; returns presigned URL.

```json
// Request
{
  "title": "Intro to Python",
  "content_type": "video",
  "filename": "intro.mp4",
  "file_size_bytes": 104857600,
  "mime_type": "video/mp4"
}

// Response 201
{
  "content_id": "uuid",
  "upload_url": "https://s3.../presigned",
  "upload_headers": { "Content-Type": "video/mp4" },
  "expires_in": 3600
}
```

### POST /content/{content_id}/upload/complete

Auth + creator. Notify backend upload finished; triggers processing.

```json
// Response 202
{ "content_id": "uuid", "status": "processing" }
```

### GET /content/{content_id}

Auth + creator (owner) or admin. Returns content metadata + processing status.

### DELETE /content/{content_id}

Auth + creator (owner). Soft-delete; sets status `removed`.

---

## Products

### POST /products

Auth + creator.

```json
{
  "title": "Python Masterclass",
  "slug": "python-masterclass",
  "description": "...",
  "price_cents": 4999,
  "currency": "USD",
  "pricing_model": "both",
  "content_ids": ["uuid1", "uuid2"]
}
```

### GET /products

Public. Query params: `?creator_slug=`, `?q=search`, `?page=1&limit=20`.

### GET /products/{product_id}

Public. Product detail with content list (titles only; no playback URLs).

### PATCH /products/{product_id}

Auth + creator (owner).

### POST /products/{product_id}/publish

Auth + creator. Sets `is_published=true` after validation (has content, all ready).

---

## Subscription plans

### POST /products/{product_id}/plans

Auth + creator.

```json
{
  "name": "Monthly access",
  "price_cents": 999,
  "billing_interval": "month"
}
```

Creates Stripe Price; stores `stripe_price_id`.

---

## Checkout & payments

### POST /checkout/sessions

Auth required.

```json
// Request — one-time
{ "product_id": "uuid", "mode": "payment" }

// Request — subscription
{ "plan_id": "uuid", "mode": "subscription" }

// Response 200
{ "checkout_url": "https://checkout.stripe.com/..." }
```

### POST /webhooks/stripe

No auth (signature verified). Handles Stripe events. Internal only.

### GET /me/purchases

Auth. List user's purchases and subscriptions.

---

## Playback (protected)

### POST /content/{content_id}/playback-token

Auth required. **Must check entitlement server-side.**

```json
// Response 200
{
  "playback_url": "https://cdn.../manifest.m3u8",
  "token": "eyJ...",
  "expires_in": 300,
  "content_type": "video",
  "session_id": "uuid"
}

// Response 403
{ "detail": "No access to this content", "code": "ENTITLEMENT_DENIED" }
```

### POST /content/{content_id}/heartbeat

Auth. Extends session; returns new token if near expiry.

```json
{ "session_id": "uuid", "position_seconds": 120 }
```

### GET /content/{content_id}/view

Auth + entitlement. Returns viewer config (no raw S3 URL).

For PDF/notes:
```json
{
  "viewer_type": "pdf",
  "page_count": 42,
  "watermark_text": "buyer@email.com • 2026-07-04",
  "page_url_template": "/api/v1/content/{id}/pages/{page}?token=..."
}
```

---

## Admin (Phase 3)

### GET /admin/users

### POST /admin/users/{id}/suspend

### GET /admin/content/flagged

---

## Rate limits

| Endpoint group | Limit |
|----------------|-------|
| POST /auth/login | 10/min per IP |
| POST /content/*/playback-token | 30/min per user |
| GET /products | 60/min per IP |
| Upload init | 20/hour per creator |

---

## OpenAPI

Generate from FastAPI at `/docs` (dev only; disable in production or protect with auth).

Implementation file: `backend/app/main.py` — include routers:

```
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(creators_router, prefix="/api/v1/creators")
app.include_router(content_router, prefix="/api/v1/content")
app.include_router(products_router, prefix="/api/v1/products")
app.include_router(checkout_router, prefix="/api/v1/checkout")
app.include_router(webhooks_router, prefix="/api/v1/webhooks")
```
