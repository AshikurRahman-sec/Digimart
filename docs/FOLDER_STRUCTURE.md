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
│   ├── FOLDER_STRUCTURE.md       # this file
│   └── SECURITY.md
├── backend/                      # FastAPI application
├── frontend/                     # Next.js application
├── scripts/                      # DevOps & utility scripts
├── AGENTS.md                     # AI agent instructions
├── README.md
├── docker-compose.yml            # Local: postgres, redis, minio
└── .env.example
```

---

## Backend (`backend/`)

```
backend/
├── alembic/
│   ├── versions/                 # One migration file per schema change
│   │   └── 001_initial_users.py
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app factory, router includes, exception handlers
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py               # get_current_user, require_permission(), get_db
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── auth.py           # register, login, refresh, logout
│   │       ├── creators.py       # creator profile CRUD
│   │       ├── products.py       # product catalog CRUD, publish
│   │       ├── content.py        # upload init/complete, metadata
│   │       ├── checkout.py       # Stripe checkout sessions
│   │       ├── playback.py       # playback-token, heartbeat, page URLs
│   │       ├── webhooks.py       # Stripe webhooks (signature verified)
│   │       └── admin.py          # suspend user, moderate content (Phase 6)
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py             # pydantic-settings; env vars
│   │   ├── security.py           # password hash, JWT encode/decode
│   │   ├── permissions.py        # Role, Permission enums; ROLE_PERMISSIONS map
│   │   ├── exceptions.py         # ForbiddenError, NotFoundError → HTTP mapping
│   │   └── logging.py            # structured JSON logger
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py            # async engine, get_session
│   │   └── base.py               # declarative Base
│   │
│   ├── models/
│   │   ├── __init__.py           # export all models for Alembic
│   │   ├── user.py
│   │   ├── creator_profile.py
│   │   ├── content_item.py
│   │   ├── product.py
│   │   ├── purchase.py
│   │   ├── subscription.py
│   │   ├── audit_log.py
│   │   └── stripe_webhook_event.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py               # RegisterRequest, TokenResponse
│   │   ├── user.py
│   │   ├── creator.py
│   │   ├── product.py
│   │   ├── content.py
│   │   ├── checkout.py
│   │   ├── playback.py
│   │   └── common.py             # Pagination, ErrorResponse
│   │
│   ├── services/                 # ALL business logic lives here
│   │   ├── __init__.py
│   │   ├── permission_service.py # require_role, require_permission, require_*_owner
│   │   ├── entitlement_service.py# has_access(), cache invalidation
│   │   ├── auth_service.py       # register, login, refresh, revoke
│   │   ├── creator_service.py
│   │   ├── product_service.py
│   │   ├── content_service.py    # upload init, metadata, attach to product
│   │   ├── storage_service.py    # S3 presigned URLs, key layout (single place)
│   │   ├── payment_service.py    # Stripe checkout, webhook handling
│   │   ├── playback_service.py   # mint playback JWT, heartbeat
│   │   ├── audit_service.py      # write audit_logs (single place)
│   │   └── admin_service.py
│   │
│   └── workers/
│       ├── __init__.py
│       ├── celery_app.py         # Celery instance, broker config
│       └── tasks/
│           ├── __init__.py
│           ├── transcode.py      # video → HLS
│           ├── document.py       # PPTX→PDF, thumbnail
│           └── scan.py           # ClamAV virus scan
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py               # test DB, async client, fixtures
│   ├── unit/
│   │   ├── test_permission_service.py
│   │   ├── test_entitlement_service.py
│   │   └── test_security.py
│   └── integration/
│       ├── test_auth.py
│       ├── test_products.py
│       ├── test_upload.py
│       ├── test_checkout.py
│       └── test_playback.py
│
├── alembic.ini
├── pyproject.toml                # deps, ruff, mypy, pytest config
└── .env                          # gitignored; copy from .env.example
```

### Backend file placement rules

| If you are adding… | Put it in… |
|--------------------|------------|
| HTTP endpoint | `api/routes/{domain}.py` — thin only |
| Auth/permission dependency | `api/deps.py` |
| Business logic | `services/{domain}_service.py` |
| DB table model | `models/{name}.py` |
| Request/response shape | `schemas/{domain}.py` |
| Permission enum or role map | `core/permissions.py` only |
| Background job | `workers/tasks/{job}.py` |
| DB migration | `alembic/versions/` |
| Test for one service | `tests/unit/test_{service}.py` |
| Test for API endpoint | `tests/integration/test_{domain}.py` |

---

## Frontend (`frontend/`)

```
frontend/
├── public/
│   ├── favicon.ico
│   └── legal/                    # Static legal HTML/PDF if needed
│
├── src/
│   ├── app/                      # Next.js App Router
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
| `backend/app/utils/` with random helpers | Use the correct `services/` or `core/` module |
| `frontend/src/services/` duplicating `lib/api.ts` | Single API client |
| `frontend/src/utils/permissions.ts` enforcing access | Backend only |
| `backend/app/helpers/entitlement.py` | Use `entitlement_service.py` |
| Business logic in `api/routes/` | Routes must stay thin |
| Multiple `storage*.py` files | One `storage_service.py` |

---

## Phase 0 scaffold checklist

When scaffolding, create at minimum:

**Backend:**
- [ ] `app/main.py`, `core/config.py`, `core/permissions.py`, `core/exceptions.py`
- [ ] `api/deps.py`, `api/routes/` (empty `__init__.py`)
- [ ] `services/permission_service.py` (stub)
- [ ] `db/session.py`, `db/base.py`
- [ ] `tests/conftest.py`

**Frontend:**
- [ ] `src/app/layout.tsx`, `src/app/page.tsx`
- [ ] `src/lib/api.ts`, `src/lib/types.ts`, `src/lib/auth.ts`
- [ ] `src/components/ui/` (Button stub)
- [ ] `src/providers/AuthProvider.tsx`

---

## Related documents

- [CODING_STANDARDS.md](CODING_STANDARDS.md) — where logic must live
- [DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md) — when to create each folder
- [AGENTS.md](../AGENTS.md) — AI agent workflow
