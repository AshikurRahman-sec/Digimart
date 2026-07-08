# DigiMart — System Architecture

## 1. Problem statement

Build a marketplace where:

- **Creators** upload video tutorials, presentations (PDF/PPTX), and notes (PDF/Markdown).
- **Buyers** discover content, pay once or subscribe, and consume it in-browser.
- **Platform** enforces access control and reduces leakage via technical controls and legal policies.

No architecture eliminates piracy entirely. Goal: raise the cost of leakage high enough that casual sharing is blocked, and traceable when it happens.

---

## 2. High-level architecture

```mermaid
flowchart TB
    subgraph clients [Clients]
        Web[React + Next.js Web App]
        Admin[Admin Dashboard]
    end

    subgraph edge [Edge]
        CDN[CDN - CloudFront / Cloudflare]
        WAF[WAF + Rate Limiter]
    end

    subgraph api [Application Layer]
        Gateway[API Gateway / BFF]
        Identity[Identity Service]
        Catalog[Catalog Service]
        Content[Content Service]
        Entitlement[Entitlement Service]
        Payment[Payment Service]
        Playback[Playback Service]
        Notification[Notification Service]
        Worker[Media Worker Service]
        Rabbit[(RabbitMQ)]
    end

    subgraph data [Data Layer]
        PG[(PostgreSQL)]
        Redis[(Redis)]
        S3[(Object Storage)]
    end

    subgraph external [External Services]
        Stripe[Stripe Payments]
        Mux[Mux / MediaConvert]
        Email[Email - SES / Resend]
    end

    Web --> WAF --> CDN
    Web --> Gateway
    Admin --> Gateway
    CDN --> S3
    Gateway --> Identity
    Gateway --> Catalog
    Gateway --> Content
    Gateway --> Payment
    Gateway --> Playback
    Identity --> PG
    Catalog --> PG
    Content --> PG
    Entitlement --> PG
    Payment --> PG
    Playback --> PG
    Entitlement --> Redis
    Playback --> Redis
    Content --> S3
    Payment --> Stripe
    Content --> Mux
    Worker --> S3
    Worker --> Mux
    Worker --> PG
    Content --> Rabbit
    Payment --> Rabbit
    Entitlement --> Rabbit
    Worker --> Rabbit
    Notification --> Rabbit
    Notification --> Email
```

---

## 2.1 Microservice architecture rule

DigiMart is a **microservice-first** system. Each backend domain must be developed as an independently deployable FastAPI service with its own API routes, schemas, service layer, database access code, tests, and Docker entrypoint.

The frontend and admin dashboard call the **API Gateway / BFF** only. Services communicate with each other through:

1. Synchronous HTTP only for read/query operations that need an immediate response.
2. RabbitMQ events or commands for cross-service state changes and background workflows.

Do not create a new all-purpose backend module that bypasses these service boundaries.

### Service ownership

| Service | Owns | Publishes / consumes |
|---------|------|----------------------|
| Identity | users, roles, refresh tokens | Publishes `user.registered`, `user.role_changed` |
| Catalog | creator profiles, products, product-content links | Publishes `product.published`, consumes `content.ready` |
| Content | upload metadata, storage keys, content status | Publishes `content.upload_completed`; consumes `content.ready`, `content.failed` |
| Media Worker | virus scan, transcode, PDF conversion | Consumes `content.upload_completed`; publishes `content.ready`, `content.failed` |
| Payment | Stripe checkout, subscription plans, purchases, subscriptions, webhook idempotency | Publishes `payment.completed`, `payment.refunded`, `subscription.changed` |
| Entitlement | access decisions and Redis entitlement cache | Consumes payment/subscription/content events, publishes `entitlement.invalidated` |
| Playback | playback tokens, sessions, heartbeat, stream limits | Consumes `entitlement.invalidated`, publishes `playback.started`, `playback.ended` |
| Notification | email and in-app notifications | Consumes domain events, sends email |
| Audit | append-only security/event log | Consumes all auditable domain events |

### RabbitMQ rules

- RabbitMQ is the required interprocess communication broker.
- Use topic exchanges for domain events: `digimart.events`.
- Use direct exchanges for commands that target one service: `digimart.commands`.
- Every message must include `event_id`, `event_type`, `event_version`, `occurred_at`, `producer`, `correlation_id`, and `payload`.
- Consumers must be idempotent. Store processed `event_id` values for externally visible side effects.
- Use durable exchanges, durable queues, persistent messages, retry queues, and dead-letter queues.
- Do not use RabbitMQ as the source of truth. PostgreSQL remains the source of truth for each service-owned data model.
- Redis is for cache/rate-limit/session state, not service-to-service messaging.

---

## 3. Core services

### 3.1 Identity & access service

| Responsibility | Implementation |
|----------------|----------------|
| Registration / login | Email + password; optional OAuth (Google) |
| JWT access + refresh tokens | Access: 15 min; Refresh: 7 days, rotated |
| Roles | `user`, `admin` |
| MFA | TOTP for creators and admins (Phase 3+) |

**Rule:** Every protected endpoint validates JWT, loads user, checks role + resource ownership.

### 3.2 Catalog service

- Products bundle one or more **content items** (video, presentation, notes).
- Supports **one-time purchase** and **subscription** (monthly/yearly per product or platform-wide).
- Creator storefront pages at `/creator/{slug}`.
- Search via PostgreSQL full-text (Phase 1–2); Elasticsearch optional at scale.

### 3.3 Upload & ingest service

```
Creator uploads file
    → API validates type/size, creates ContentItem (status: uploading)
    → Presigned PUT URL returned; client uploads direct to S3
    → Content Service publishes content.upload_completed to RabbitMQ
    → Media Worker consumes event
    → Worker: virus scan, transcode (video), generate thumbnails, extract PDF pages
    → Worker publishes content.ready | content.failed
    → Content Service records final status
```

**Upload limits (defaults):**

| Type | Max size | Allowed formats |
|------|----------|-----------------|
| Video | 5 GB | mp4, mov, webm |
| Presentation | 200 MB | pdf, pptx |
| Notes | 50 MB | pdf, md, docx |

### 3.4 Entitlement service

Single source of truth for "can user X access content Y?"

```
has_access(user_id, content_id) =
    user is admin
    OR user is creator of content
    OR active Purchase for product containing content
    OR active Subscription covering product
    AND content.status == ready
    AND creator account not suspended
```

Cache entitlements in Redis (TTL 5 min); invalidate on purchase/refund/cancel.

### 3.5 Playback & delivery service

**Never expose raw S3 URLs to clients.**

| Content type | Delivery method |
|--------------|-----------------|
| Video | HLS (.m3u8) via CDN; AES-128 segment encryption; short-lived signed manifest URL |
| PDF / PPTX | Convert PPTX → PDF server-side; serve via signed URL + in-app PDF.js viewer |
| Notes (MD) | Render server-side to HTML; no raw file download in MVP |

Flow:

```
Buyer clicks Play
    → API checks entitlement + rate limits
    → API mints signed playback token (JWT, 2–5 min TTL, binds user_id + content_id + session_id)
    → CDN validates token at edge (Lambda@Edge or Cloudflare Worker)
    → Stream / render content
    → Audit log: view_started, view_heartbeat, view_ended
```

### 3.6 Payment service

- **Stripe Checkout** for one-time purchases.
- **Stripe Billing** for subscriptions.
- Webhooks: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`, `charge.refunded`.
- Payment Service publishes RabbitMQ events after signed, idempotent webhook handling.
- Platform fee: configurable % (e.g. 15%) via Stripe Connect (creators as connected accounts).

### 3.7 Notification service

- Email: purchase confirmation, subscription renewal, content ready, refund.
- In-app notifications table (Phase 2+).

---

## 4. Deployment topology

### MVP (single region)

```
┌─────────────────────────────────────────────┐
│  VPS / Railway / Fly.io / AWS ECS           │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐  │
│  │ React + │  │ Gateway │  │ Services    │  │
│  │ Next.js │  │         │  │             │  │
│  │         │  │         │  │ Workers     │  │
│  └─────────┘  └─────────┘  └─────────────┘  │
└─────────────────────────────────────────────┘
         │              │              │
    PostgreSQL       Redis       RabbitMQ     S3 + CDN
    (managed)      (managed)    (managed)    (managed)
```

### Production (recommended)

| Component | Service |
|-----------|---------|
| Frontend | React.js with Next.js on Vercel or CloudFront + S3 static |
| API | AWS ECS Fargate or Railway (2+ replicas) |
| Microservices | Separate ECS/Fly/Railway services per domain |
| Workers | Separate worker services, auto-scale on RabbitMQ queue depth |
| DB | RDS PostgreSQL Multi-AZ |
| Redis | ElastiCache |
| Broker | Amazon MQ for RabbitMQ, CloudAMQP, or RabbitMQ cluster |
| Storage | S3 private buckets |
| CDN | CloudFront with Origin Access Control |
| Secrets | AWS Secrets Manager / Doppler |
| CI/CD | GitHub Actions |

### Environments

- `development` — local Docker Compose
- `staging` — full stack, test Stripe keys
- `production` — live keys, WAF enabled

---

## 5. Data flow diagrams

### 5.1 Purchase flow

```mermaid
sequenceDiagram
    participant B as Buyer
    participant FE as Frontend
    participant API as Gateway
    participant P as Payment Service
    participant MQ as RabbitMQ
    participant E as Entitlement Service
    participant S as Stripe
    participant DB as PostgreSQL

    B->>FE: Click Buy
    FE->>API: POST /checkout/sessions
    API->>P: Forward checkout request
    P->>DB: Verify product active
    P->>S: Create Checkout Session
    S-->>P: session_url
    P-->>API: session_url
    API-->>FE: Redirect URL
    FE->>S: Stripe Checkout
    S->>P: Webhook payment succeeded
    P->>DB: Create Purchase
    P->>MQ: Publish payment.completed
    MQ->>E: Deliver payment.completed
    E->>DB: Recompute entitlement
    E->>DB: Invalidate entitlement cache
    S-->>B: Redirect success page
```

### 5.2 Video playback flow

```mermaid
sequenceDiagram
    participant B as Buyer
    participant FE as Frontend
    participant API as Gateway
    participant PB as Playback Service
    participant E as Entitlement Service
    participant CDN as CDN
    participant S3 as S3

    B->>FE: Click Play
    FE->>API: POST /content/{id}/playback-token
    API->>PB: Forward playback request
    PB->>E: Check entitlement
    PB->>PB: Mint signed JWT (user, content, exp)
    PB-->>API: playback_url + token
    API-->>FE: playback_url + token
    FE->>CDN: GET manifest.m3u8?token=...
    CDN->>CDN: Validate token
    CDN->>S3: Fetch segments
    S3-->>CDN: Encrypted segments
    CDN-->>FE: HLS stream
    FE->>API: POST /content/{id}/heartbeat (every 30s)
```

---

## 6. Key design decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monolith vs microservices | Microservice-first FastAPI services | Clear ownership, independent scaling, RabbitMQ workflows |
| Interprocess communication | RabbitMQ topic/direct exchanges | Reliable async communication between services |
| Direct-to-S3 upload | Presigned URLs | Keeps large files off API servers |
| Video host | Mux (MVP) or self-hosted ffmpeg | Mux reduces ops; self-host cuts cost at scale |
| PDF protection | Viewer-only + watermark; no download button | Download prevention is UX + policy, not absolute |
| Multi-tenancy | Row-level (creator_id on all content) | Simple; adequate for marketplace |
| Idempotency | Stripe webhook handlers must be idempotent | Prevent duplicate entitlements |

---

## 7. Non-functional requirements

| Requirement | Target |
|-------------|--------|
| API availability | 99.9% |
| Video start time | < 3s (p95) on broadband |
| Upload success rate | > 99% with retry |
| Concurrent viewers | 500 per product (MVP); scale with CDN |
| RPO / RTO | 24h backup; 4h recovery |
| GDPR | Export/delete user data endpoints (Phase 4) |

---

## 8. Observability

- **Logging:** Structured JSON (request_id, user_id, action)
- **Metrics:** Prometheus — request latency, queue depth, transcode failures, active streams
- **Tracing:** OpenTelemetry (optional Phase 3)
- **Alerts:** PagerDuty/Opsgenie on payment webhook failures, transcode error rate > 5%

---

## 9. Related documents

- [CODING_STANDARDS.md](CODING_STANDARDS.md) — DRY, permissions, code style
- [SECURITY.md](SECURITY.md) — content protection detail
- [DATABASE.md](DATABASE.md) — schema
- [API.md](API.md) — endpoints
- [DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md) — build order
