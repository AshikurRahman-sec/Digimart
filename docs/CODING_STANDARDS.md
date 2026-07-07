# DigiMart — Coding Standards

Mandatory rules for all contributors and AI agents. Violations block PR merge.

---

## 1. DRY — no duplicate functions or logic

### Rule

**Every piece of business logic exists in exactly one place.** Do not copy-paste functions, queries, or validation rules across files.

### Where logic lives

| Logic type | Single home | Never duplicate in |
|------------|-------------|-------------------|
| Permission checks | `backend/services/identity/app/core/permissions.py` + identity `permission_service.py` | routes, other services, frontend |
| Entitlement checks | `backend/services/entitlement/app/service_layer/entitlement_service.py` | routes, workers, frontend |
| DB queries for a resource | Owning service's `app/service_layer/{resource}_service.py` | routes, other services |
| Pydantic validation | Owning service's `app/schemas/` | routes (inline dicts) |
| API HTTP calls | `frontend/src/lib/api.ts` | components (raw fetch) |
| Auth token handling | `frontend/src/lib/auth.ts` | individual pages |
| Date/price formatting | `frontend/src/lib/format.ts` | components |
| S3/storage operations | `backend/services/content/app/service_layer/storage_service.py` | upload routes, workers |
| Stripe operations | `backend/services/payment/app/service_layer/payment_service.py` | checkout routes, webhooks |
| RabbitMQ contracts | `docs/EVENTS.md` + `backend/shared/digimart_shared/events.py` | service-local hard-coded strings |
| RabbitMQ publish/consume code | Owning service's `app/publishers/` and `app/consumers/` | routes, random helpers |

### Before writing a new function

1. **Search the codebase** for an existing function that does the same thing
2. If similar logic exists → **extend or reuse** it; do not create a parallel copy
3. If logic is used in 2+ places → **extract immediately** to the correct service module
4. If a route needs behavior → call a service; **never** put business logic in the route

### Examples

**Bad — duplicate entitlement check in route:**
```python
# routes/content.py
purchase = await db.execute(select(Purchase).where(...))  # DON'T
if not purchase:
    raise HTTPException(403)
```

**Good — single service call:**
```python
# routes/content.py
await permission_service.require_content_access(current_user, content_id)
```

**Bad — duplicate API fetch in component:**
```typescript
// components/ProductCard.tsx
const res = await fetch(`${API_URL}/products/${id}`);  // DON'T
```

**Good — shared API client:**
```typescript
// components/ProductCard.tsx
const product = await api.products.getById(id);
```

### Refactoring trigger

Extract to a shared function when:
- Same code block appears **twice**
- Same query pattern appears in **two routes**
- Same validation rule appears in **create and update** handlers → use one Pydantic schema or validator

### Naming duplicates

One canonical name per concept:

| Concept | Canonical function |
|---------|-------------------|
| Check content access | `permission_service.require_content_access()` |
| Check product ownership | `permission_service.require_product_owner()` |
| Check role | `permission_service.require_role()` |
| Has entitlement (bool) | `entitlement_service.has_access()` |
| Mint playback token | `playback_service.create_token()` |

Do not create aliases like `check_access`, `verify_access`, `can_view` for the same check — use the canonical name.

---

## 2. Permission management — backend only

### Rule

**The backend is the single source of truth for all authorization.** The frontend may hide buttons for UX, but must never enforce security. Every protected action is validated server-side before execution.

### Architecture

```
Request
  → JWT auth (who is the user?)
  → permission_service (are they allowed?)
  → service layer (business logic)
  → response
```

All permission logic is centralized in:

```
backend/services/identity/app/
  core/
    permissions.py          # Permission enum, role-permission map
  service_layer/
    permission_service.py   # All require_* and can_* functions
  api/
    deps.py                 # FastAPI dependencies that call permission_service
```

### Permission model

#### Roles (stored on user)

```python
class Role(str, Enum):
    BUYER = "buyer"
    CREATOR = "creator"
    ADMIN = "admin"
```

Users may hold multiple roles: `["buyer", "creator"]`.

#### Permissions (granular actions)

```python
class Permission(str, Enum):
    # Catalog
    PRODUCT_READ_PUBLIC = "product:read_public"
    PRODUCT_READ_OWN = "product:read_own"
    PRODUCT_CREATE = "product:create"
    PRODUCT_UPDATE_OWN = "product:update_own"
    PRODUCT_DELETE_OWN = "product:delete_own"
    PRODUCT_PUBLISH_OWN = "product:publish_own"

    # Content
    CONTENT_UPLOAD = "content:upload"
    CONTENT_READ_OWN = "content:read_own"
    CONTENT_DELETE_OWN = "content:delete_own"
    CONTENT_PLAYBACK = "content:playback"       # requires entitlement

    # Commerce
    CHECKOUT_CREATE = "checkout:create"
    PURCHASE_READ_OWN = "purchase:read_own"

    # Admin
    USER_SUSPEND = "user:suspend"
    PRODUCT_MODERATE = "product:moderate"
    ADMIN_DASHBOARD = "admin:dashboard"
```

#### Role → permission map (single definition)

```python
# core/permissions.py — ONLY place this map is defined
ROLE_PERMISSIONS: dict[Role, set[Permission]] = {
    Role.BUYER: {
        Permission.PRODUCT_READ_PUBLIC,
        Permission.CHECKOUT_CREATE,
        Permission.PURCHASE_READ_OWN,
        Permission.CONTENT_PLAYBACK,  # still requires entitlement check
    },
    Role.CREATOR: {
        Permission.PRODUCT_READ_PUBLIC,
        Permission.PRODUCT_CREATE,
        Permission.PRODUCT_READ_OWN,
        Permission.PRODUCT_UPDATE_OWN,
        Permission.PRODUCT_DELETE_OWN,
        Permission.PRODUCT_PUBLISH_OWN,
        Permission.CONTENT_UPLOAD,
        Permission.CONTENT_READ_OWN,
        Permission.CONTENT_DELETE_OWN,
        Permission.CHECKOUT_CREATE,
        Permission.PURCHASE_READ_OWN,
        Permission.CONTENT_PLAYBACK,
    },
    Role.ADMIN: set(Permission),  # all permissions
}
```

### Permission service (single implementation)

```python
# backend/services/identity/app/service_layer/permission_service.py

class PermissionService:
    def has_permission(self, user: User, permission: Permission) -> bool: ...

    def require_permission(self, user: User, permission: Permission) -> None:
        """Raises ForbiddenError if denied."""

    def require_role(self, user: User, role: Role) -> None: ...

    def require_product_owner(self, user: User, product_id: UUID) -> None:
        """Permission + resource ownership."""

    def require_content_owner(self, user: User, content_id: UUID) -> None: ...

    async def require_content_access(self, user: User, content_id: UUID) -> None:
        """Owner OR admin OR active entitlement. Single gate for playback."""
```

**Every route uses these functions.** No inline role checks like `if "creator" in user.roles`.

### FastAPI dependencies

```python
# api/deps.py

def require_permission(permission: Permission):
    async def _dep(current_user: User = Depends(get_current_user)):
        permission_service.require_permission(current_user, permission)
        return current_user
    return _dep

RequireCreator = require_role(Role.CREATOR)
RequireAdmin = require_role(Role.ADMIN)
```

**Route usage:**
```python
@router.post("/products")
async def create_product(
    body: ProductCreate,
    user: User = Depends(require_permission(Permission.PRODUCT_CREATE)),
):
    return await product_service.create(user, body)
```

### Resource ownership

Role alone is not enough. Creators may only modify **their own** resources:

```python
# Always chain: permission → ownership
permission_service.require_permission(user, Permission.PRODUCT_UPDATE_OWN)
await permission_service.require_product_owner(user, product_id)
```

Admins bypass ownership checks but still go through `permission_service` (never skip the service).

### Frontend rules

| Allowed | Not allowed |
|---------|-------------|
| Hide "Upload" button if user lacks creator role | Block upload purely on frontend |
| Show "Access denied" UI on 403 response | Decide access before API call |
| Read roles from `/me` for UI layout | Trust JWT payload without backend `/me` |
| Redirect to login on 401 | Store permissions in localStorage as authority |

Frontend pattern:
```typescript
// UX only — backend still enforces
const { user } = useAuth();
const canUpload = user?.roles.includes("creator");

{canUpload && <UploadButton />}  // OK for UX
// UploadButton always calls API; backend returns 403 if unauthorized
```

### API response codes (consistent)

| Code | When |
|------|------|
| 401 | Missing or invalid token |
| 403 | Authenticated but permission denied |
| 404 | Resource not found OR user has no access (don't leak existence) |

For content the user cannot access: return **403**, not 404, unless hiding existence from non-buyers is required (then 404 for unauthenticated, 403 for authenticated without purchase).

### Testing permissions

Every protected endpoint needs tests for:
- Unauthenticated → 401
- Wrong role → 403
- Wrong owner → 403
- Correct role + owner → 200
- Admin override → 200

---

## 3. Microservice and RabbitMQ standards

### Service boundaries

- Each domain service owns its data, migrations, business logic, and tests.
- A service may write only to its own tables.
- Do not import from another service's `app/` package.
- Shared code in `backend/shared/` is limited to contracts, messaging primitives, logging, settings bases, and typed client infrastructure.
- Browser clients call the gateway only. The gateway may compose service responses but must not own domain business logic.

### RabbitMQ

- Use RabbitMQ for interprocess communication and cross-service state changes.
- Define every exchange, routing key, event name, payload schema, and version in `docs/EVENTS.md`.
- Mirror event names and versions in `backend/shared/digimart_shared/events.py`.
- Publish domain events only after the local database transaction succeeds. Prefer the transactional outbox pattern for high-value events such as payments and entitlements.
- Consumers must be idempotent and safe to retry.
- Use durable exchanges, durable queues, persistent messages, retry queues, and dead-letter queues.
- Include `event_id`, `event_type`, `event_version`, `occurred_at`, `producer`, `correlation_id`, and `payload` in every message.
- Use `correlation_id` across gateway requests, service HTTP calls, RabbitMQ messages, and logs.
- Do not use RabbitMQ as a database. If state matters, persist it in the owning service database.
- Do not use Redis, direct database access, or shared files for service-to-service messaging.

### Event evolution

- Never silently change an existing event payload.
- Add optional fields for backward-compatible changes.
- Increment `event_version` for breaking changes.
- Keep old consumers working until all producers and consumers are migrated.
- Add contract tests when an event producer or consumer changes.

---

## 4. General coding standards

### Python (backend)

- **Type hints** on all function signatures
- **Async** for all I/O (DB, S3, HTTP)
- Max function length: **40 lines**; split if longer
- Max file length: **300 lines**; split into modules if longer
- Imports: stdlib → third-party → local (isort)
- Docstrings: public service methods only; code should be self-explanatory
- Exceptions: use custom exceptions in `core/exceptions.py`; map to HTTP in exception handlers
- No `print()`; use structured logging

### TypeScript / React (frontend)

- **Strict mode** enabled
- No `any`; use proper types from `lib/types.ts`
- Components: typed React components with PascalCase files; hooks: `use*.ts`
- Max component length: **150 lines**; extract sub-components
- Error handling: all API calls through `api.ts` with typed errors

### Database

- All schema changes via **Alembic migrations**; never manual SQL in production
- Queries live in **service layer**, not routes
- Use SQLAlchemy ORM; raw SQL only for complex reports with comments

### API design

- RESTful naming: plural nouns (`/products`, `/content`)
- Request/response via **Pydantic schemas** only
- Version prefix: `/api/v1/`
- Idempotent webhook handlers

### Git / PR

- One feature per PR
- PR must include tests for new permission checks
- PR description lists which `Permission` enums were added (if any)

---

## 5. File creation checklist

Before adding a new file, confirm:

- [ ] Logic doesn't already exist elsewhere (grep first)
- [ ] File belongs in the correct layer (service vs route vs schema)
- [ ] Permission checks use `permission_service`, not inline code
- [ ] Cross-service communication uses RabbitMQ events/commands or a typed service client
- [ ] RabbitMQ messages match `docs/EVENTS.md`
- [ ] No duplicate of an existing utility function

---

## 6. Linting (enforce in CI)

### Backend

```toml
# pyproject.toml tools
[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B", "SIM"]  # includes duplicate-code hints

[tool.mypy]
strict = true
```

### Frontend

```json
// eslint.config — no duplicate imports, no unused vars
"@typescript-eslint/no-explicit-any": "error"
```

### CI check script

```bash
# scripts/check-duplicates.sh — run in CI
# Fail if same function name defined in multiple service files
grep -rn "^def \|^async def " backend/services/*/app/service_layer/ | \
  awk -F: '{print $3}' | sort | uniq -d | \
  grep -v "^$" && exit 1 || exit 0
```

---

## 7. Related documents

- [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) — where to place files
- [EVENTS.md](EVENTS.md) — RabbitMQ event contracts
- [AGENTS.md](../AGENTS.md) — AI agent guide
- [SECURITY.md](SECURITY.md) — content protection
- [API.md](API.md) — endpoint contract
- [DATABASE.md](DATABASE.md) — schema
