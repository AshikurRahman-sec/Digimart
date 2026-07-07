# DigiMart

Subscription marketplace for digital learning content: video tutorials, presentations, and notes.

Creators upload and monetize content. Buyers purchase access via one-time purchase or subscription. Content is protected against casual sharing and leakage.

## Documentation (read in order)

| Document | Purpose |
|----------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, services, data flow, deployment |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | DRY rules, no duplicate functions, backend permissions |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Complete folder layout — where every file goes |
| [docs/EVENTS.md](docs/EVENTS.md) | RabbitMQ exchanges, routing keys, event contracts |
| [docs/SECURITY.md](docs/SECURITY.md) | Anti-leak model, DRM, watermarking, policies |
| [docs/DATABASE.md](docs/DATABASE.md) | PostgreSQL schema and relationships |
| [docs/API.md](docs/API.md) | REST API contract |
| [docs/DEVELOPMENT_PHASES.md](docs/DEVELOPMENT_PHASES.md) | Phased build plan for humans and AI agents |
| [AGENTS.md](AGENTS.md) | Instructions for AI agents building this project |

## Tech stack (recommended)

- **Frontend:** React.js with Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** FastAPI microservices (Python 3.12), SQLAlchemy, Alembic
- **Database:** PostgreSQL 16
- **Cache:** Redis
- **Interprocess communication:** RabbitMQ
- **Storage:** S3-compatible (AWS S3 or Cloudflare R2)
- **Video:** Mux or AWS MediaConvert + CloudFront signed URLs
- **Payments:** Stripe (Checkout + Billing)
- **Auth:** JWT via backend (or Clerk/Auth0 for faster MVP)

## Docker Quick Start

```bash
docker compose up --build frontend
```

The UI runs at `http://localhost:3000`. It starts the identity service, PostgreSQL,
and RabbitMQ through Docker Compose dependencies. The identity service runs at
`http://localhost:8001` and applies its Alembic migrations on startup.

Useful checks:

```bash
curl http://localhost:8001/health
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"buyer@example.com","password":"very-secret-password","role":"buyer"}'
```

RabbitMQ management is available at `http://localhost:15672` with
`digimart` / `digimart`.

## Project structure

See **[docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md)** for the full layout.

```
digimart/
├── docs/                  # Architecture, API, security, folder structure
├── backend/               # FastAPI microservices — gateway/, services/, shared/
├── frontend/              # React + Next.js — app/, components/, hooks/, lib/
├── scripts/               # CI checks, seed data
├── AGENTS.md
├── docker-compose.yml
└── .env.example
```
