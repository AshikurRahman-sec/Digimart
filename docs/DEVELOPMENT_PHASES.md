# DigiMart — Development Phases

Phased plan for humans and AI agents. **Complete each phase fully before starting the next.** Run tests and security checklist after every phase.

---

## Phase 0 — Project scaffold (Week 1)

**Goal:** Runnable monorepo skeleton with CI.

### Tasks

- [ ] Initialize git repo in `digimart/`
- [ ] Create `docker-compose.yml`: PostgreSQL, Redis, MinIO (S3 local)
- [ ] Create folder structure per `docs/FOLDER_STRUCTURE.md` (Phase 0 scaffold checklist)
- [ ] Scaffold FastAPI backend:
  - `app/main.py`, `app/core/config.py`, `app/core/security.py`
  - `app/core/permissions.py`, `app/services/permission_service.py` (stubs)
  - `app/api/deps.py` (auth + permission dependency stubs)
  - Health check: `GET /health`
- [ ] Scaffold Next.js frontend with Tailwind
- [ ] Alembic init; first migration (users table only)
- [ ] GitHub Actions: lint + test on PR
- [ ] `.env.example` for all secrets

### Acceptance criteria

- `docker compose up` starts all services
- Backend returns 200 on `/health`
- Frontend loads at localhost:3000
- `pytest` runs (even if one smoke test)

### AI instruction

> Read `docs/FOLDER_STRUCTURE.md`, `docs/ARCHITECTURE.md`, `docs/CODING_STANDARDS.md`, and `docs/DATABASE.md`. Create the scaffold exactly as specified. Use FastAPI + SQLAlchemy 2.0 async. Implement permission_service stub per CODING_STANDARDS.md. Do not implement business features yet.

---

## Phase 1 — Auth & users (Week 2)

**Goal:** Register, login, JWT, role-based access.

### Tasks

- [ ] Implement `users` + `refresh_tokens` models and migrations
- [ ] Implement `core/permissions.py` (Permission enum, ROLE_PERMISSIONS map)
- [ ] Implement `services/permission_service.py` (require_role, require_permission)
- [ ] Implement `api/deps.py` (get_current_user, require_permission factory)
- [ ] POST /auth/register, /login, /refresh, /logout
- [ ] Password hashing (bcrypt), JWT access + refresh rotation
- [ ] Dependency: `get_current_user`, `require_role("creator")`
- [ ] Frontend: login/register pages, auth context, token storage (httpOnly cookie or secure memory)
- [ ] Audit log on login

### Acceptance criteria

- User can register as buyer, login, access protected route
- Expired access token refreshes automatically
- Invalid credentials return 401

### AI instruction

> Implement auth per `docs/API.md` Auth section and `docs/DATABASE.md` users/refresh_tokens tables. Follow `docs/CODING_STANDARDS.md` for permission_service and `docs/SECURITY.md` for password/JWT rules. Write integration tests for register/login/refresh and permission denied (403) cases.

---

## Phase 2 — Creator profiles & catalog (Week 3)

**Goal:** Creators can set up storefront; public product listing.

### Tasks

- [ ] `creator_profiles`, `products`, `product_content_items` models
- [ ] Creator onboarding flow (become a creator)
- [ ] CRUD products (draft state)
- [ ] Public GET /products, GET /creators/{slug}
- [ ] Frontend: marketplace home, product detail page, creator page
- [ ] Full-text search on product title/description

### Acceptance criteria

- Creator can create profile and product (without content yet)
- Buyer can browse and search products anonymously
- Unpublished products not visible publicly

---

## Phase 3 — Upload & processing (Week 4–5)

**Goal:** Creators upload video, PDF, notes; async processing pipeline.

### Tasks

- [ ] `content_items`, `transcode_jobs` models
- [ ] Presigned S3 upload flow (init → upload → complete)
- [ ] Celery worker + Redis queue
- [ ] Video: ffmpeg HLS transcode (or Mux integration)
- [ ] PDF/PPTX: convert to PDF, generate thumbnails
- [ ] Notes: store and render Markdown
- [ ] ClamAV scan in worker
- [ ] Attach content to products; publish validation
- [ ] Frontend: creator upload UI with progress

### Acceptance criteria

- Creator uploads 100MB video; status goes uploading → processing → ready
- Product with all ready content can be published
- Failed transcode shows error to creator

### AI instruction

> Implement upload pipeline per Architecture section 3.3. Use presigned URLs to MinIO/S3. Never return raw storage URLs to buyers. Worker must update content_items.status atomically.

---

## Phase 4 — Payments & entitlements (Week 6)

**Goal:** Stripe checkout; purchase and subscription grant access.

### Tasks

- [ ] `purchases`, `subscriptions`, `subscription_plans`, `stripe_webhook_events`
- [ ] Stripe Checkout session creation
- [ ] Webhook handler (signed, idempotent)
- [ ] Entitlement service with Redis cache
- [ ] Frontend: Buy button, success/cancel pages, My Library
- [ ] Stripe Connect for creator payouts (optional MVP: platform collects all)

### Acceptance criteria

- Test mode purchase grants access immediately via webhook
- Refund revokes access
- Subscription cancel removes access at period end
- User without purchase gets 403 on playback

---

## Phase 5 — Secure playback (Week 7–8)

**Goal:** Protected video streaming and document viewing.

### Tasks

- [ ] Playback token JWT (separate secret, short TTL)
- [ ] HLS player (video.js or hls.js) in frontend
- [ ] CDN or signed URL proxy for segments
- [ ] PDF.js viewer with watermark overlay
- [ ] Heartbeat endpoint + session tracking
- [ ] Concurrent stream limit (max 3)
- [ ] Audit logs: playback_token_issued, content_view

### Acceptance criteria

- Buyer with entitlement can watch video in browser
- Direct S3 URL without token returns 403
- Watermark shows buyer email on PDF viewer
- No download button in UI

### AI instruction

> Implement playback per `docs/SECURITY.md` sections 4 and 6. Entitlement check MUST happen before token mint. Read security checklist before marking complete.

---

## Phase 6 — Policies & admin (Week 9)

**Goal:** Legal pages, basic admin, content moderation.

### Tasks

- [ ] Static pages: Terms, Privacy, DMCA, Creator Agreement
- [ ] Accept ToS on registration (checkbox + timestamp in DB)
- [ ] Admin role: suspend user, unpublish product
- [ ] Report content endpoint
- [ ] Email notifications (purchase confirm, content ready)

### Acceptance criteria

- New users must accept ToS
- Admin can suspend infringing account; access revoked immediately
- DMCA page publicly accessible

---

## Phase 7 — Production hardening (Week 10)

**Goal:** Deploy to production with security controls.

### Tasks

- [ ] Deploy backend + workers to cloud
- [ ] Deploy frontend to Vercel/CloudFront
- [ ] Private S3 + CloudFront OAC
- [ ] WAF rate limiting
- [ ] Secrets in Secrets Manager
- [ ] DB backups automated
- [ ] Monitoring alerts (Sentry, uptime)
- [ ] Load test playback endpoint
- [ ] Disable FastAPI /docs in production

### Acceptance criteria

- HTTPS everywhere
- Security checklist in SECURITY.md all checked
- Stripe live mode tested with real $1 product

---

## Phase 8 — Enhancements (post-MVP)

Priority order:

1. **Forensic watermarking** on video (identify leaker from pirated copy)
2. **Widevine DRM** for premium tier
3. **Platform-wide subscription** (Netflix model for all creators)
4. **Reviews & ratings**
5. **Coupons and trials**
6. **Mobile apps** (React Native; reuse API)
7. **Analytics dashboard** for creators (views, revenue)
8. **GDPR export/delete**

---

## Testing strategy

| Layer | Tool | Coverage target |
|-------|------|-----------------|
| Unit | pytest | Services, entitlement logic |
| Integration | pytest + TestClient | API endpoints |
| E2E | Playwright | Register → buy → watch |
| Security | OWASP ZAP (staging) | Before launch |

Critical test cases:
- Entitlement denied without purchase
- Webhook idempotency (same event twice)
- Expired playback token rejected
- Upload of wrong MIME type rejected
- Creator cannot access another creator's content

---

## Definition of done (every PR)

- [ ] Matches API contract in `docs/API.md`
- [ ] Follows `docs/CODING_STANDARDS.md` (no duplicate functions; backend permissions)
- [ ] Migration included if schema changed
- [ ] Tests added/updated (including 401/403 permission tests for protected routes)
- [ ] No secrets in code
- [ ] README updated if setup changed
