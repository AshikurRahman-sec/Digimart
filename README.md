# DigiMart

Subscription marketplace for digital learning content: video tutorials, presentations, and notes.

Creators upload and monetize content. Buyers purchase access via one-time purchase or subscription. Content is protected against casual sharing and leakage.

## Documentation (read in order)

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, services, data flow, deployment |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | DRY rules, no duplicate functions, backend permissions |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Complete folder layout — where every file goes |
| [docs/SECURITY.md](docs/SECURITY.md) | Anti-leak model, DRM, watermarking, policies |
| [docs/DATABASE.md](docs/DATABASE.md) | PostgreSQL schema and relationships |
| [docs/API.md](docs/API.md) | REST API contract |
| [docs/DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md) | Phased build plan for humans and AI agents |
| [AGENTS.md](AGENTS.md) | Instructions for AI agents building this project |

## Tech stack (recommended)

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI (Python 3.12), SQLAlchemy, Alembic
- **Database:** PostgreSQL 16
- **Cache / queue:** Redis, Celery
- **Storage:** S3-compatible (AWS S3 or Cloudflare R2)
- **Video:** Mux or AWS MediaConvert + CloudFront signed URLs
- **Payments:** Stripe (Checkout + Billing)
- **Auth:** JWT via backend (or Clerk/Auth0 for faster MVP)

## Quick start (after Phase 1 scaffold exists)

```bash
docker compose up -d          # postgres, redis, minio
cd backend && uv sync && alembic upgrade head
cd backend && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

## Project structure

See **[docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md)** for the full layout.

```
digimart/
├── docs/                  # Architecture, API, security, folder structure
├── backend/               # FastAPI — api/, core/, models/, schemas/, services/, workers/
├── frontend/              # Next.js — app/, components/, hooks/, lib/
├── scripts/               # CI checks, seed data
├── AGENTS.md
├── docker-compose.yml
└── .env.example
```
