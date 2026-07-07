# DigiMart — Folder Structure

Complete directory layout for the monorepo. **AI agents must place new files in the correct folder.** Do not create files outside this structure without updating this document first.

---

## Root layout

```
digimart/
├── .cursor/
│   └── rules/
│       └── project.mdc           # Cursor AI rules
├── .github/
│   └── workflows/
│       ├── backend-ci.yml        # pytest, ruff, mypy on PR
│       └── frontend-ci.yml       # lint, typecheck, test on PR
├── docs/                         # Architecture & specs (read-only for agents)
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── CODING_STANDARDS.md
│   ├── DATABASE.md
│   ├── DEVELOPMENT_PHASES.md
│   ├── EVENTS.md                 # RabbitMQ event contracts
│   ├── FOLDER_STRUCTURE.md       # this file
│   └── SECURITY.md
├── backend/                      # FastAPI microservices
├── frontend/                     # React + Next.js application
├── scripts/                      # DevOps & utility scripts
├── AGENTS.md                     # AI agent instructions
├── README.md
├── docker-compose.yml            # Local: postgres, redis, rabbitmq, minio
└── .env.example
```

---

## Backend microservices (`backend/`)

```
backend/
├── shared/                       # Shared contracts only; no business logic
│   ├── digimart_shared/
│   │   ├── __init__.py
│   │   ├── events.py             # Event envelope, event names, versions
│   │   ├── messaging.py          # RabbitMQ publisher/consumer helpers
│   │   ├── logging.py            # request_id/correlation_id logging
│   │   └── settings.py           # common pydantic settings base
│   └── pyproject.toml
│
├── gateway/                      # API Gateway / BFF, browser-facing only
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── deps.py           # auth forwarding, request context
│   │   │   └── routes/           # thin proxy/composition routes
│   │   ├── core/
│   │   ├── schemas/
│   │   └── clients/              # typed HTTP clients to backend services
│   ├── tests/
│   ├── Dockerfile
│   └── pyproject.toml
│
├── services/
│   ├── identity/
│   ├── catalog/
│   ├── content/
│   ├── media-worker/
│   ├── payment/
│   ├── entitlement/
│   ├── playback/
│   ├── notification/
│   └── audit/
│
├── docker/                       # service Docker helpers if needed
├── pyproject.toml                # workspace/tooling config
└── README.md
```

Each service under `backend/services/{service-name}/` follows this shape:

```
backend/services/{service-name}/
├── alembic/
│   ├── versions/                 # Service-owned migrations only
│   └── env.py
├── app/
│   ├── main.py                   # FastAPI app factory, router includes, exception handlers
│   ├── api/
│   │   ├── deps.py
│   │   └── routes/               # HTTP endpoints owned by this service
│   ├── core/
│   │   ├── config.py
│   │   ├── exceptions.py
│   │   └── security.py           # only if this service owns security behavior
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/                   # Tables owned by this service
│   ├── schemas/                  # Pydantic request/response models
│   ├── service_layer/            # Business logic for this bounded context
│   ├── consumers/                # RabbitMQ consumers
│   ├── publishers/               # RabbitMQ event publishers
│   └── clients/                  # Typed clients to other services, if needed
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/                 # Event/API contract tests
├── alembic.ini
├── Dockerfile
└── pyproject.toml
```

### Backend microservice placement rules

| If you are adding… | Put it in… |
|--------------------|------------|
| Browser-facing route | `backend/gateway/app/api/routes/{domain}.py` |
| Service-owned HTTP endpoint | `backend/services/{service}/app/api/routes/{domain}.py` |
| Business logic | `backend/services/{service}/app/service_layer/{domain}_service.py` |
| DB table model | `backend/services/{service}/app/models/{name}.py` |
| Request/response shape | `backend/services/{service}/app/schemas/{domain}.py` |
| RabbitMQ event contract | `docs/EVENTS.md` + `backend/shared/digimart_shared/events.py` |
| RabbitMQ publisher | `backend/services/{service}/app/publishers/{domain}_publisher.py` |
| RabbitMQ consumer | `backend/services/{service}/app/consumers/{event_name}_consumer.py` |
| DB migration | `backend/services/{service}/alembic/versions/` |
| Test for one service | `backend/services/{service}/tests/unit/` |
| API endpoint test | `backend/services/{service}/tests/integration/` |
| Event contract test | `backend/services/{service}/tests/contract/` |

### Service boundary rules

- A service may write only to its own tables.
- Cross-service state changes happen through RabbitMQ events or commands.
- Cross-service reads use typed HTTP clients from `clients/` only when an immediate response is required.
- Do not import code from another service's `app/` package.
- `backend/shared/` may contain event envelopes, logging helpers, settings primitives, and typed client base classes only. It must not contain product, payment, entitlement, or content business logic.
- Redis is for cache, rate limiting, and playback/session state. RabbitMQ is for interprocess communication.

---

## Frontend (`frontend/`)

The frontend uses **React.js with Next.js App Router**. Build UI as React components, React hooks, and typed Next.js route files.

```
frontend/
├── public/
│   ├── favicon.ico
│   └── legal/                    # Static legal HTML/PDF if needed
│
├── src/
│   ├── app/                      # Next.js App Router using React components
│   │   ├── layout.tsx            # root layout, providers
│   │   ├── page.tsx              # marketplace home
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/               # route group — no URL segment
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (marketplace)/        # public browsing
│   │   │   ├── products/
│   │   │   │   ├── page.tsx      # product listing + search
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # product detail
│   │   │   └── creators/
│   │   │       └── [slug]/
│   │   │           └── page.tsx  # creator storefront
│   │   │
│   │   ├── (buyer)/              # authenticated buyer routes
│   │   │   ├── library/
│   │   │   │   └── page.tsx      # purchased content
│   │   │   ├── checkout/
│   │   │   │   ├── success/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── cancel/
│   │   │   │       └── page.tsx
│   │   │   └── watch/
│   │   │       └── [contentId]/
│   │   │           └── page.tsx  # video/PDF player
│   │   │
│   │   ├── (creator)/            # creator dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   ├── content/
│   │   │   │   ├── page.tsx      # content library
│   │   │   │   └── upload/
│   │   │   │       └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx      # profile, Stripe Connect
│   │   │
│   │   ├── (admin)/              # admin panel (Phase 6)
│   │   │   └── admin/
│   │   │       ├── page.tsx
│   │   │       ├── users/
│   │   │       │   └── page.tsx
│   │   │       └── content/
│   │   │           └── page.tsx
│   │   │
│   │   └── (legal)/
│   │       ├── terms/
│   │       │   └── page.tsx
│   │       ├── privacy/
│   │       │   └── page.tsx
│   │       └── dmca/
│   │           └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                   # generic: Button, Input, Modal, Card, Spinner
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── layout/               # Header, Footer, Sidebar, Nav
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── auth/                 # LoginForm, RegisterForm
│   │   ├── marketplace/          # ProductCard, ProductGrid, SearchBar
│   │   ├── creator/              # UploadForm, ProductForm, ContentList
│   │   ├── player/               # VideoPlayer, PdfViewer, WatermarkOverlay
│   │   └── checkout/             # BuyButton, PricingCard
│   │
│   ├── hooks/
│   │   ├── useAuth.ts            # current user, login/logout (calls api)
│   │   ├── useProducts.ts
│   │   └── useUpload.ts          # presigned upload flow
│   │
│   ├── lib/
│   │   ├── api.ts                # SINGLE HTTP client — all API calls here
│   │   ├── auth.ts               # token storage, refresh logic
│   │   ├── format.ts             # price, date formatting (no duplicates)
│   │   ├── constants.ts          # API URLs, enums mirrored from backend
│   │   └── types.ts              # TypeScript interfaces matching schemas/
│   │
│   └── providers/
│       └── AuthProvider.tsx      # context wrapper
│
├── .env.local                    # gitignored
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── eslint.config.mjs
```

### Frontend file placement rules

| If you are adding… | Put it in… |
|--------------------|------------|
| Page/route | `app/{route-group}/{path}/page.tsx` |
| Reusable UI atom | `components/ui/` |
| Domain-specific component | `components/{domain}/` |
| API call | `lib/api.ts` — never raw fetch in components |
| Shared TypeScript type | `lib/types.ts` |
| React hook | `hooks/use{Name}.ts` |
| Auth/token logic | `lib/auth.ts` only |
| Format helper | `lib/format.ts` only |

---

## Scripts (`scripts/`)

```
scripts/
├── check-duplicates.sh           # CI: fail on duplicate service function names
├── seed_dev_data.py              # local test users, sample products
└── init_minio.sh                 # create buckets (alternative to docker init)
```

---

## Storage keys (S3 — not local folders)

Logical layout inside the `digimart-content` bucket (managed by `storage_service.py`):

```
digimart-content/
├── raw/{creator_id}/{content_id}/original.{ext}
├── processed/{content_id}/video/master.m3u8
├── processed/{content_id}/video/seg_*.ts
├── processed/{content_id}/pdf/output.pdf
├── processed/{content_id}/thumb.jpg
└── assets/products/{product_id}/cover.jpg
```

---

## What NOT to create

| Avoid | Reason |
|-------|--------|
| `backend/app/` as a new monolith | Use `backend/gateway/` or `backend/services/{service}/` |
| `backend/services/{service}/app/utils/` with random helpers | Use the correct `service_layer/`, `core/`, or `shared/` module |
| `frontend/src/services/` duplicating `lib/api.ts` | Single API client |
| `frontend/src/utils/permissions.ts` enforcing access | Backend only |
| `backend/services/*/app/helpers/entitlement.py` | Use the entitlement service boundary |
| Business logic in `api/routes/` | Routes must stay thin |
| Multiple `storage*.py` files | Storage operations belong to the Content service |
| Direct imports from another service's `app/` package | Use RabbitMQ events or typed HTTP clients |

---

## Phase 0 scaffold checklist

When scaffolding, create at minimum:

**Backend:**
- [ ] `backend/shared/digimart_shared/events.py`
- [ ] `backend/shared/digimart_shared/messaging.py`
- [ ] `backend/gateway/app/main.py`, `backend/gateway/app/api/routes/`
- [ ] `backend/services/identity/app/main.py`, `core/config.py`, `core/permissions.py`, `core/exceptions.py`
- [ ] `backend/services/identity/app/service_layer/permission_service.py` (stub)
- [ ] `backend/services/identity/app/db/session.py`, `db/base.py`
- [ ] `backend/services/{catalog,content,payment,entitlement,playback,notification,audit}/app/main.py`
- [ ] `backend/services/media-worker/app/consumers/`
- [ ] `tests/conftest.py` for each scaffolded service

**Frontend:**
- [ ] `src/app/layout.tsx`, `src/app/page.tsx`
- [ ] `src/lib/api.ts`, `src/lib/types.ts`, `src/lib/auth.ts`
- [ ] `src/components/ui/` (Button stub)
- [ ] `src/providers/AuthProvider.tsx`

---

## Related documents

- [CODING_STANDARDS.md](CODING_STANDARDS.md) — where logic must live
- [DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md) — when to create each folder
- [EVENTS.md](EVENTS.md) — RabbitMQ exchanges, routing keys, message contracts
- [AGENTS.md](../AGENTS.md) — AI agent workflow
