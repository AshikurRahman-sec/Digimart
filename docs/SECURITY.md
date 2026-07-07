# DigiMart — Security & Anti-Leak Model

## 1. Threat model

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| Share account credentials | High | Medium | Session limits, device fingerprint, anomaly alerts |
| Copy signed URL / hotlink | High | High | Short TTL tokens, bind to user+session, CDN validation |
| Screen record / screenshot | High | High | Watermark, policy, forensic watermark (Phase 3) |
| Download and redistribute file | Medium | Critical | No download API, encrypted HLS, PDF viewer-only |
| Stripe webhook forgery | Low | Critical | Signature verification, idempotency keys |
| Creator uploads malware | Medium | High | ClamAV scan, file type validation, sandboxed transcode |
| API abuse / scraping | Medium | Medium | Rate limits, WAF, bot detection |
| Broker abuse / forged internal events | Medium | High | RabbitMQ TLS, per-service credentials, signed/validated event schemas |
| Insider / DB leak | Low | Critical | Encrypt at rest, least-privilege IAM, no public buckets |

**Accept:** Determined attackers with dedicated screen capture hardware cannot be fully stopped on web. Goal is deterrence + traceability + legal recourse.

---

## 2. Defense layers (onion model)

```
Layer 7  Legal       Terms of Service, DMCA, account termination
Layer 6  Monitoring  Audit logs, anomaly detection, watermark tracing
Layer 5  Client UX   No download, disabled right-click (weak), viewer-only
Layer 4  Watermark   Visible (email + timestamp) on video/PDF
Layer 3  DRM         HLS AES-128; optional Widevine (Phase 4)
Layer 2  CDN Auth    Signed URLs, token binding, referrer checks
Layer 1  App Auth    JWT, entitlement checks, RBAC
Layer 0  Storage     Private S3, no public ACLs, encryption at rest
```

---

## 3. Authentication & session security

### 3.1 Password policy

- Minimum 10 characters; check against breached password list (HaveIBeenPwned API)
- bcrypt or argon2 for hashing (cost factor ≥ 12)

### 3.2 JWT design

**Access token claims:**
```json
{
  "sub": "user_uuid",
  "roles": ["buyer", "creator"],
  "iat": 1710000000,
  "exp": 1710000900
}
```

**Playback token claims (separate secret):**
```json
{
  "sub": "user_uuid",
  "content_id": "content_uuid",
  "session_id": "session_uuid",
  "ip_hash": "sha256_prefix",
  "exp": 1710000300
}
```

- Playback tokens: **2–5 minute** expiry; new token via heartbeat refresh
- Refresh tokens: stored hashed in DB; rotate on use; revoke on logout

### 3.3 Session controls (Phase 2+)

- Max **3 concurrent streams** per user (configurable)
- Optional: max **2 active devices** per account
- Force logout all sessions on password change

---

## 4. Content protection by type

### 4.1 Video

| Control | MVP | Production |
|---------|-----|------------|
| HLS adaptive streaming | Yes | Yes |
| AES-128 segment encryption | Yes | Yes |
| Signed manifest URL | Yes | Yes |
| Visible watermark (user email) | Yes | Yes |
| Forensic/invisible watermark | No | Phase 3 (Mux or custom ffmpeg) |
| Widevine/FairPlay DRM | No | Phase 4 (high-value tier) |
| Download button | Never | Never |

**Transcode pipeline must:**
1. Generate multiple renditions (360p, 720p, 1080p)
2. Encrypt segments with per-content key stored in Secrets Manager
3. Burn visible watermark during transcode: `{user_email} • {timestamp}` overlay on playback (dynamic watermark requires per-session transcode — use overlay at player level for MVP)

**MVP watermark approach:** Apply watermark in the **video player** (CSS overlay + canvas) and in **PDF viewer**. For stronger protection, burn into transcoded file per session (expensive) or use Mux dynamic watermarking.

### 4.2 Presentations & notes (PDF)

- Convert all uploads to PDF server-side
- Serve through **PDF.js** in a sandboxed iframe
- Disable: download, print (best-effort via PDF.js config)
- Apply **dynamic watermark** on each page render: buyer email + date + transaction ID
- Signed URL TTL: **60 seconds**; refresh on page turn
- Block `Content-Disposition: attachment` headers

### 4.3 Markdown notes

- Render to HTML server-side; sanitize with allowlist
- Never expose source `.md` file URL to buyer
- Same watermark header on every page view

---

## 5. Storage security

### 5.1 S3 bucket policy (principles)

```
- Block all public access: TRUE
- Default encryption: SSE-S3 or SSE-KMS
- Versioning: enabled (production)
- Lifecycle: move to Glacier after 90 days for raw uploads
- CORS: only allow PUT from presigned uploads; no browser GET from S3 directly
```

### 5.2 Key layout

```
s3://digimart-content/
  raw/{creator_id}/{content_id}/original.{ext}      # never served to buyers
  processed/{content_id}/video/master.m3u8
  processed/{content_id}/video/seg_*.ts
  processed/{content_id}/pdf/watermarked.pdf          # base; dynamic overlay preferred
  processed/{content_id}/thumb.jpg
```

### 5.3 IAM

- API server: read/write `raw/`, read `processed/`
- Worker: read `raw/`, write `processed/`
- CDN origin: read `processed/` only via OAC
- **No** IAM user with `s3:GetObject` on `raw/` for edge

---

## 6. CDN token validation

CloudFront signed cookies/URLs or Cloudflare Worker:

```python
# Pseudocode — edge validation
def validate_playback_token(token, request):
    claims = verify_jwt(token, PLAYBACK_SECRET)
    if claims.exp < now(): return 403
    if claims.content_id != request.content_id: return 403
    if rate_limit_exceeded(claims.sub): return 429
    return allow()
```

Additional checks:
- Referer must match `app.digimart.com`
- Single IP binding (soft — warn on mismatch, block on repeat abuse)

---

## 7. Upload security

1. **Validate MIME** with magic bytes, not just extension
2. **ClamAV scan** before processing
3. **Size limits** enforced at presigned URL policy
4. **Quarantine** failed scans; notify creator
5. **Strip metadata** from files (EXIF, author) before publishing

---

## 8. API security

| Control | Setting |
|---------|---------|
| HTTPS only | TLS 1.2+; HSTS |
| Rate limiting | 100 req/min general; 10 req/min auth; 5 playback tokens/min |
| CORS | Allow only frontend origin |
| Input validation | Pydantic schemas on all inputs |
| SQL injection | SQLAlchemy ORM; no raw SQL with user input |
| CSRF | SameSite cookies if using cookie auth; N/A for Bearer JWT |
| Security headers | CSP, X-Frame-Options DENY, X-Content-Type-Options |

---

## 9. Payment security

- Verify **Stripe webhook signatures** on every event
- Store webhook events with idempotency key; skip duplicates
- Never trust client-side payment success — only webhook grants entitlement
- Refund webhook revokes entitlement immediately
- PCI: never store card data; Stripe Checkout handles PCI scope

---

## 10. RabbitMQ security

- Use TLS for RabbitMQ outside local development.
- Use separate RabbitMQ credentials per service.
- Grant least-privilege permissions per vhost, exchange, and queue.
- Services may publish only the event types they own.
- Consumers must validate event envelope and payload schema before processing.
- Never put secrets, card data, JWT refresh tokens, or raw file URLs in RabbitMQ messages.
- Use durable queues and dead-letter queues so failed security-relevant events are not silently lost.
- Log `event_id` and `correlation_id` for every publish and consume operation.

---

## 11. Audit logging

Log every security-relevant event to `audit_logs` table (append-only):

| Event | Fields |
|-------|--------|
| `login` | user_id, ip, user_agent, success |
| `playback_token_issued` | user_id, content_id, session_id |
| `content_view` | user_id, content_id, duration_seconds |
| `purchase` | user_id, product_id, stripe_session_id |
| `upload` | creator_id, content_id, file_size |
| `admin_action` | admin_id, action, target_id |

Audit service consumes auditable RabbitMQ domain events and writes append-only records. Producers should include enough metadata for audit without leaking secrets.

Retain 2 years minimum. Export for legal requests.

---

## 12. Legal & policy framework

Ship these pages before public launch (Phase 2):

### 12.1 Terms of Service (key clauses)

- License is **personal, non-transferable, non-sublicensable**
- Prohibited: sharing credentials, redistributing content, screen recording for redistribution
- Platform may terminate account for violations without refund
- Creator retains IP; buyer gets limited access license

### 12.2 Privacy Policy

- Data collected: email, payment via Stripe, viewing analytics, device info
- GDPR/CCPA: data export and deletion requests

### 12.3 Creator Agreement

- Creator warrants they own or have rights to uploaded content
- DMCA takedown cooperation
- Revenue share terms

### 12.4 DMCA process

- Designated agent email
- Takedown request form
- Counter-notice workflow
- Repeat infringer policy (3 strikes → ban)

### 12.5 Acceptable Use Policy

- No pirated content, malware, illegal material
- Content moderation queue for new creators (Phase 2)

---

## 13. Incident response

1. **Detection:** anomaly alert (spike in playback tokens, same account many IPs)
2. **Containment:** revoke sessions, disable account, rotate content keys
3. **Investigation:** audit log review, watermark trace if available
4. **Recovery:** re-issue entitlements for legitimate users
5. **Post-mortem:** document and patch gap

---

## 13. Security checklist for AI agents

Before marking any phase complete, verify:

- [ ] No S3 bucket is public
- [ ] No raw content URLs returned in API responses
- [ ] All protected routes require authentication
- [ ] Entitlement checked before every playback token
- [ ] Stripe webhooks verify signatures
- [ ] File uploads validated by magic bytes
- [ ] Secrets loaded from env/secrets manager, not hardcoded
- [ ] Rate limiting enabled on auth and playback endpoints
- [ ] Audit logs written for purchases and playback
