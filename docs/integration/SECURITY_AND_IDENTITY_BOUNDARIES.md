# Security and Identity Boundaries

Read-only analysis. Nothing here is implemented. Labels: **Verified**, **Recommended**, **Decision required**, **Blocked**.

Scope guard: the POS project is an isolated demo; its own documents state **public production is NO-GO**. Everything below describes what an integration must do inside that boundary, and does not claim production readiness.

## 1. Trust boundaries

Verified today in the POS/Admin stack: `browser -> HTTPS edge (Caddy) -> POS API -> PostgreSQL`, and `browser -> Admin edge -> Admin BFF -> POS API -> PostgreSQL`. The POS cookie is HttpOnly/Secure/SameSite=Strict and is only meaningful on the POS edge origin.

The Storefront today has **no** boundary: all state is browser-local and no secret exists.

Rules that must hold in any integration (Recommended):

1. No admin credential, POS staff session, backend secret, database credential or service-account session ever reaches browser code, a `NEXT_PUBLIC_*` variable, a cache key or client-readable storage.
2. Customer identity is a separate identity domain from staff identity (separate store, separate cookie name and scope, separate roles).
3. The POS database is reachable only from the POS API (and operator tooling), never from the Storefront server directly.
4. The customer-facing surface is an explicit allow-list of new endpoints; no staff endpoint is made anonymous or dual-purpose.

## 2. Customer identity options (evaluation only)

| Option | Fit | Notes |
|---|---|---|
| **A. Guest checkout only** | Best first slice (Recommended) | No account, no password, no recovery burden. Ownership key is a high-entropy order lookup secret returned once at confirmation and stored by the shopper |
| **B. Registered accounts** | Later phase | Needs password hashing, email verification, recovery, lockout, MFA decision, data export/deletion; POS provides **no** customer account store, so this is net-new |
| **C. Separate "Customer" role in the existing `auth_users`** | Not recommended | `auth_users.role` has a CHECK constraint of `Administrator`/`Cashier`; the table carries MFA/operator-recovery machinery designed for staff; a customer row in staff tables makes staff audit, runtime guard triggers and restore reconciliation (migration 008/009) ambiguous |
| **D. Reuse Cashier role for customers** | **Rejected** | Cashier can call `POST /api/checkout` with 5%/10% discounts, read stock counts, and read `/api/receipts`. Customers would be staff for authorization purposes and land in `orders.created_by` |
| **E. Staff-issued service account in the browser** | **Rejected** | Would expose a staff session or credential to untrusted clients |

**Decision required:** guest-only first slice vs accounts (see `OPEN_DECISIONS.md`).

### 2a. Ownership model (Recommended)

- Add a nullable `customer_id` (future accounts) and a guest ownership proof to online orders, **separate from** `created_by`. `created_by` stays "staff who rang this up" and is null/ignored for online orders.
- Guest proof: a random 256-bit lookup secret generated server-side at order creation, only its hash stored; shown once with the confirmation; required (with the public order reference) to read the order. Never put the secret in a URL query that is logged or in `Referer`; prefer a header or POST body from a Next.js server component.
- Reads return `404` (not `403`) for any order the caller does not own, matching the existing POS `GET /api/orders/{id}` behaviour.
- Order references shown to customers must be unguessable. The Storefront `DEMO-XXXXXXXX` (8 chars from a 32-symbol alphabet, about 40 bits) and POS `MOS-` plus 12 hex chars (about 48 bits) are identifiers, **not** authorization secrets.

### 2b. Session, recovery, expiry, CSRF, cookies, rate limits

| Concern | Verified in POS (staff) | Recommended for customers |
|---|---|---|
| Session | Cookie `MerchantPOS`, DB-backed, absolute 30 min, non-sliding | Separate cookie name (e.g. `__Host-` prefixed), separate store, independent revocation; guests need none |
| Cookie flags | HttpOnly, Secure, SameSite=Strict | Same; `__Host-` prefix, `Path=/`, no `Domain`; use Lax only if a cross-site entry flow requires it (Decision) |
| CSRF | Antiforgery token via `/api/auth/csrf`, header `X-CSRF-TOKEN` | Required for every state-changing customer request; for a BFF, use the framework's origin checks plus a token |
| Rate limiting | Fixed window on login and factor routes | Per-IP and per-subject limits on catalog search, cart validation, order creation and order lookup; documented as demo-grade because POS notes distributed rate limiting is not implemented |
| Recovery | Operator-run, no email reset (staff) | Guest: none, with an explicit "keep your order secret" notice. Accounts: email-based recovery needs email infrastructure that does **not** exist in the ecosystem (Blocked) |
| Expiry | 30 min absolute | Order lookup secrets: bounded lifetime or revocable; accounts: sliding idle timeout (Decision) |
| Data isolation | None for customers | Every customer query filtered by ownership key in SQL, enforced server-side, covered by negative tests |

## 3. Integration architecture options

| | A. Browser -> ASP.NET directly | B. Next.js BFF -> ASP.NET | C. Hybrid |
|---|---|---|---|
| Browser trust | Browser holds a backend session and talks CORS | Browser talks only to Next.js; backend credential stays server-side | Public read via BFF/cache, writes via BFF |
| CORS | Needed; none exists in POS source (Verified) | Not needed | Not needed |
| Cookie scope | SameSite=Strict cookie breaks across origins; needs None/Lax + CSRF rework | Same-site first-party cookie on the Storefront origin | Same as B |
| Secrets | Risk of leaking tokens to the page | Server-only | Server-only |
| Caching | Browser-level, hard to control | Next.js caching (Cache Components is already enabled) for public catalog | Best for catalog |
| Fit with ecosystem | Poor: POS stack is built around a same-origin edge | Strong: Admin **already** uses this pattern (server-held ticket, BFF to POS) | Strong |
| New infrastructure | None, but unsafe | A server-to-server credential and network path | Same |

**Recommendation (Recommended, not decided): Option B** with catalog caching as in C. It matches how Admin already integrates (Verified: browser talks only to Admin, Admin holds the POS ticket), keeps the HttpOnly/Strict model intact, avoids adding CORS to a service with none, and keeps secrets off the client. The Next.js server calls a **new, narrow, customer-scoped API on the POS side** authenticated by a **server-to-server credential limited to those endpoints** (not a staff session, not Cashier). The exact credential mechanism is a **Decision required**.

Network: the Storefront server reaches the POS API on a private network only; the POS edge exposes only what is intended. No new public ports for POS/Admin/PostgreSQL.

## 4. Abuse-case analysis

Existing protections cite what was read in POS code/docs. "Missing control" refers to the future customer surface. Every row needs a test; the requirement is in the last column.

### 4a. Public-customer risks

| Risk | Scenario | Existing protection | Missing control | Mitigation | Test requirement |
|---|---|---|---|---|---|
| Unauthorized access | Anonymous caller hits staff endpoints | Every POS route needs a policy; anonymous only health | Customer endpoints do not exist | Separate allow-listed customer routes; deny by default | Anonymous request to each `/api/admin/*`, `/api/orders`, `/api/products` returns 401 |
| Role escalation | Customer obtains Cashier/Admin privileges | `auth_users.role` CHECK; runtime guard trigger blocks role/enabled changes by the app DB user | No customer role | Separate identity store; never write to `auth_users` from customer flows | Customer credential cannot satisfy any staff policy |
| IDOR on orders | Customer changes an order id/UUID in the URL | Staff reads return 404 unless `created_by` matches | Customer ownership key | Filter by ownership in SQL; unguessable references; 404 for non-owned | Two customers: A cannot read B's order by id, reference or number; identical 404 body |
| Enumeration | Iterate `MOS-` numbers or `p01`..`p30` ids | Catalog ids are public by design; `MOS-` has 48 bits | Rate limits and uniform errors on lookup | Rate limit lookups; do not reveal existence | Lookup of random valid-format ids returns indistinguishable 404 |
| Price manipulation | Client sends a lower price or `discountPercent` | POS checkout reads prices from DB; discount is limited to 0/5/10 but **client-chosen** | Online path must have no discount input | No price/discount in request; server recomputes | Tampered price/discount fields rejected or ignored |
| Quantity manipulation | Negative, huge or fractional quantities | POS: 1-1000 per line, 1-100 lines, distinct ids; Storefront caps at 10 | Customer cap should be the Storefront rule, enforced server-side | Enforce a lower public cap on the server | Boundary tests 0, -1, 11, 1001, float, string |
| Overselling | Concurrent checkouts for last unit | Row locks and stock check in transaction | Customer path must use the same transaction | Reuse locking pattern; never trust cart-time availability | Concurrent checkout test: exactly N succeed, stock never negative |
| Duplicate orders | Double click, retry, replay | Scoped idempotency key + request hash + advisory lock | Scope key to customer/guest, not staff user | Reuse Storefront `submissionId` as client key; hash scoped to ownership | Same key twice returns same order; same key different body is rejected |
| Idempotency abuse | Reusing another user's key | Key scoped by user id hash | Scope for guests | Include a per-browser random component | Key from session A cannot replay into session B |
| CSRF | Cross-site form posts an order | Antiforgery on POS; SameSite=Strict | Same for BFF | Origin check plus token; Lax/Strict cookies | Cross-origin POST without token rejected |
| XSS | Stored/reflected product or address text | CSP on POS edge (`script-src 'self'`); Admin escapes via Razor | Storefront has no CSP configured (`next.config.ts` has no headers) | Add a CSP and output encoding; never render backend HTML as raw | Injected `<script>` in name/address renders inert; CSP present |
| Rate limits | Scraping, order spam, search abuse | Fixed window on login only | Limits on public routes | Per-IP/subject limits; body size cap (edge already caps 64KB) | Burst test returns 429 with no state change |
| Credential exposure | API key in bundle or env | None applicable today | Server-only secret handling | Server env only; no `NEXT_PUBLIC_` secrets; secret scanning in CI | Build output and HTML grep finds no secret patterns |
| Data leakage | Over-broad DTO (stock, SKU, `created_by`, payment internals) | Staff DTOs are staff-only | Dedicated customer DTOs | Allow-list serializers; no ORM entity serialization | Contract test asserts exact field set |
| Sessions | Fixation, theft, long life | Absolute expiry, DB revocation, strict cookie | Customer session design | See 2b | Cookie flag assertions; expiry test |
| Untrusted browser state | Tampered localStorage cart/orders | Storefront `sanitize*` validators exist (client-only) | Server must not trust cart | Server revalidates everything; localStorage is a draft only | Tampered cart yields server-corrected totals |
| Caches | Personalized data cached publicly | POS sets `no-store` on auth/CSRF; Storefront Cache Components | Customer pages must not be statically cached | `no-store`/private for order and account responses; public cache only for catalog | Order responses carry no-store; catalog caching does not include user data |
| PII retention | Delivery address, email, phone stored indefinitely | Demo orders hold **no PII** today | Retention policy; PII appears for the first time | Minimize; retention and deletion policy before collecting; keep PII out of logs and out of `security_events` | Logs contain no address/email; deletion path exists |
| Replay | Resubmitting a captured request | Idempotency; antiforgery | Request freshness for guests | Short-lived tokens, idempotency | Replayed request produces no second order |
| Concurrency | Parallel edits and checkouts | Advisory locks, version columns | Same on the new path | Reuse patterns | Parallel stress test |

### 4b. Staff risks (existing or newly created by integration)

| Risk | Scenario | Existing protection | Missing / new control | Mitigation | Test requirement |
|---|---|---|---|---|---|
| Staff session theft | Cookie stolen from an admin | HttpOnly, Secure, Strict, 30-min absolute, MFA, DB revocation | Not extended to Storefront | Keep staff and customer cookies on different origins/names | Staff cookie never sent to Storefront origin |
| Online data in staff tools | Admin lists customers' addresses and phones | Admin shows no PII today | PII exposure to all administrators | Minimum fields, role-gated, audited access | Admin view shows only approved fields |
| Staff transitions on online orders | Staff set fulfilment status | Product/inventory edits are versioned, audited, append-only | No order state transitions exist | Audited, role-restricted status changes | Audit row written per transition |
| CSV/report integrity | Online data enters CSV export | CSV neutralises formulas | New free-text fields (names, notes) | Reuse formula neutralisation on every new text column | Formula payload in address exports as inert text |
| Reporting skew | Online orders distort POS sales reports | Reporting indexes assume completed SAR orders | No channel dimension | Add channel before enabling online inserts | Reports exclude/segment online orders as specified |
| Operator misuse | Restore or recovery affects identity | Quarantine and reconciliation (migration 008/009) | Customer data not covered by restore reconciliation | Extend runbooks before storing customer identity | Restore drill includes customer tables |
| Mixed audit | Staff and customer events interleaved | `security_events` fixed categories, no secrets | Customer categories | Separate categories; no PII in events | Event payloads contain identifiers only |

## 5. Status of controls (summary)

- **Verified present (staff only):** policies, antiforgery, rate limiting on login, absolute sessions, no-store, append-only audit, DB-enforced role guard.
- **Verified absent (customer):** any customer identity, ownership, CORS, public routes, PII retention policy, Storefront CSP.
- **Blocked by missing evidence:** actual runtime behaviour of any of the above (no service was run in this audit).
