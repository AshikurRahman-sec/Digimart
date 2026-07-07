# DigiMart Agent Instructions

AI agents must treat the `docs/` folder as the source of truth for project development.

## Read first

Before changing code, read these documents:

1. `docs/ARCHITECTURE.md`
2. `docs/FOLDER_STRUCTURE.md`
3. `docs/EVENTS.md`
4. `docs/CODING_STANDARDS.md`
5. `docs/SECURITY.md`
6. `docs/API.md`
7. `docs/DATABASE.md`
8. `docs/DEVELOPMENT_PHASES.md`

## Architecture rule

DigiMart is microservice-first.

- Do not build a new single FastAPI monolith under `backend/app`.
- Browser-facing routes belong in `backend/gateway/`.
- Domain services belong in `backend/services/{service}/`.
- Shared code belongs in `backend/shared/` only when it is a contract or infrastructure primitive.
- A service must not import another service's `app/` package.

## Product domain rule

DigiMart is a subscription-capable marketplace for digital products. In code and docs, use the term **creator** for sellers and **buyer** for customers.

- Products are digital access bundles, not physical goods.
- Product content may include videos, presentations, notes, notebooks, and other approved digital files.
- Catalog owns creator profiles, products, pricing model, and product-content links.
- Content owns upload metadata and storage workflow; Media Worker owns processing jobs.
- Payment owns purchases, subscription plans, subscriptions, Stripe Checkout, Stripe Billing, and webhook idempotency.
- Entitlement owns access decisions. Payment events grant or revoke access; routes and frontend must not infer access directly from Stripe/client state.
- Playback owns secure delivery tokens and sessions. Never expose raw storage URLs to buyers.

## Frontend rule

Use **React.js with Next.js App Router** for the frontend.

- Build UI as typed React components.
- Put reusable UI in `frontend/src/components/`.
- Put React hooks in `frontend/src/hooks/`.
- Keep API calls centralized in `frontend/src/lib/api.ts`.

## RabbitMQ rule

RabbitMQ is the required interprocess communication layer.

- Cross-service state changes must use RabbitMQ events or commands.
- Event contracts must be defined in `docs/EVENTS.md`.
- Event names and versions must be mirrored in `backend/shared/digimart_shared/events.py`.
- Consumers must be idempotent and safe to retry.
- Use durable queues, retry queues, and dead-letter queues for production workflows.
- Redis is for cache/rate limiting/session state, not service-to-service messaging.

## Development order

Follow `docs/DEVELOPMENT_PHASES.md`. Complete each phase before starting the next unless the user explicitly changes the plan.

## Placement rule

Before creating a file, check `docs/FOLDER_STRUCTURE.md`. If the requested file does not fit the documented structure, update the docs first or ask the user.

## Security rule

Follow `docs/SECURITY.md`.

- Backend authorization is the source of truth.
- Never expose raw S3/object-storage URLs to buyers.
- Stripe webhooks must be signature-verified and idempotent.
- Playback tokens must be short-lived and entitlement-checked server-side.
- RabbitMQ messages must not contain secrets, card data, refresh tokens, or raw private file URLs.

## Testing rule

Add or update tests when behavior changes.

- Protected endpoints need `401`, `403`, owner, and success cases.
- RabbitMQ producers and consumers need contract tests.
- Consumers that cause side effects need idempotency tests.
