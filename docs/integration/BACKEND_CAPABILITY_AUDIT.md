# Backend Capability Audit

Audit date: 2026-11-14. Read-only. No application source, database, credential, environment or deployment state was changed.

Evidence labels used throughout the six integration documents:

- **Verified** - read directly in code, SQL or documentation at the revision below.
- **Recommended** - a proposal this audit makes; not implemented anywhere.
- **Decision required** - needs an owner decision before work starts.
- **Blocked by missing evidence** - could not be established from the available sources.

## 1. Revisions inspected

| Repository | Revision (verified) | How it was read |
|---|---|---|
| MerchantOS Storefront | `cdb35eb43c5ac0476a74657dd8244bcf26852772` (`main`, clean) | Local checkout |
| MerchantOS POS | `17a9ad5a86fa67c0c775300a294fefa8c8214375` | Fresh shallow public clone of `danishirfan21/MerchantOS-POS`, read-only |
| MerchantOS Admin | `acba9861886a201027469a74713608809828422f` | Fresh shallow public clone of `danishirfan21/MerchantOS-Admin`, read-only |

**Access limitation (verified):** the local copies of POS (`7e73c87`) and Admin (`e1add78`) on this machine were about 50 commits behind the public repositories. They were not used, and were not updated, reset or cleaned. Findings describe the public revisions above. CI results for those revisions were not re-run or checked in this audit; claims about CI come only from what the POS/Admin documents state.

**Not inspected (blocked by missing evidence):** the contents of `services/merchant-api.Tests` beyond test names (62 lines across five files), the Admin `.NET` test project internals, the POS Angular front end (`src/app`), live behaviour of any running service, and the real deployment infrastructure (none is described as existing).

## 2. What the POS backend is (verified)

- ASP.NET Core minimal API in `services/merchant-api` (`Program.cs`, `CheckoutEndpoints.cs`, `ManagementEndpoints.cs`, `ReportingEndpoints.cs`, `Security/`, `Operations/`), Npgsql with a thin EF Core model, one PostgreSQL database.
- Identity is native: `auth_users`, `auth_sessions` (30-minute absolute, non-sliding), cookie `MerchantPOS`, `PasswordHasher`, two roles only (`Administrator`, `Cashier`), mandatory TOTP MFA for administrators, antiforgery token header `X-CSRF-TOKEN`, fixed-window rate limiting on login, `Cache-Control: no-store`.
- Cookie is HttpOnly and SameSite=Strict, so it is intended for same-site use through the POS edge (Caddy) where the Angular app and `/api/*` share one origin.
- Money is integer halalas everywhere. Checkout VAT is computed on the server: discount `(subtotal*pct+50)/100`, VAT `((subtotal-discount)*15+50)/100`, payable `subtotal-discount+vat`. **Unit prices are therefore ex-VAT** and VAT is added on top.
- Roles are enforced per endpoint with named policies. Every new endpoint must opt into a policy or `AllowAnonymous` (comment in `AuthSecurity.cs`).

## 3. Endpoint inventory (verified from code)

| Endpoint | Policy / roles | Notes |
|---|---|---|
| `GET /api/health/live`, `/api/health/ready`, `/api/health` | Anonymous | Health only |
| `GET /api/ops/metrics` | `Reporting` (Administrator) | Operational metrics |
| `GET /api/products?search=&category=` | `Catalog` (Administrator, Cashier) | **Not anonymous.** Returns `ProductDto` including stock |
| `GET /api/products/{id}` | `Catalog` | Same DTO |
| `GET /api/categories` | `Catalog` | Category list |
| `GET /api/inventory/{productId}` | `Catalog` | Stock quantity |
| `POST /api/checkout` | `Checkout` (**Cashier only**) | Transactional; idempotent |
| `GET /api/orders` | `Reporting` (Administrator) | Last 100 orders, all orders, no filter |
| `GET /api/orders/{id}` | `Catalog` (Administrator, Cashier) | Administrator sees any order; others only where `orders.created_by` equals the caller, else 404 |
| `GET /api/receipts` | `Checkout` (Cashier) | Caller's own orders only (`created_by = @user`), last 100 |
| `POST /api/admin/products/{id}`, `GET /api/admin/products/{id}` | `ProductManagement` (Administrator) | Versioned edits; audited |
| `POST /api/admin/inventory/{id}/adjustments` | `InventoryManagement` (Administrator) | Versioned, idempotent per actor, audited |
| `GET /api/admin/audit` | `AuditRead` (Administrator) | Append-only history |
| `GET /api/admin/reports/orders`, `orders.csv`, `sales` | `HistoricalReporting` (Administrator) | Statuses limited to completed / cancelled / failed |
| `GET /api/admin/security-events` | Administrator-gated identity endpoint | Security events |
| `/api/auth/*` (login, logout, MFA enroll/complete/cancel, password, recovery regenerate, csrf) | Mixed; login anonymous + rate limited | Staff identity only |

**Consequence:** the POS exposes no anonymous catalog, no customer authentication, and no endpoint a customer could legitimately call. Every business endpoint requires a staff session.

## 3a. Checkout behaviour (verified)

- Request: `{ items:[{productId, quantity}], discountPercent, paymentMethod, cashTenderedHalalas?, cardScenario?, idempotencyKey }`.
- Validation: 1-100 distinct lines, quantity 1-1000, `discountPercent` is exactly 0, 5 or 10, `paymentMethod` is `cash` or `card` only, `cardScenario` is `success` or `decline` (simulated card), idempotency key up to 128 chars.
- Prices are always read from `products` inside the transaction; the client sends no price. Stock is checked per line under a row lock; shortage returns `409 insufficient_stock` with `available`.
- Idempotency: key is scoped to the user (`SHA256(userId:key)`), request hash stored in `checkout_idempotency`, advisory lock serializes duplicates.
- Result: order row (`status` is effectively `completed`), `order_items` snapshots of sku/name/unit price, one `payments` row, stock decremented, `created_by` set to the staff user.
- There is no "pending", "paid", "shipped", or "cancelled" lifecycle written by checkout. A cash/card decline returns an error and creates no order.

## 4. What is reusable for the Storefront

| Capability | Reusable as-is? | Verified basis |
|---|---|---|
| Server-authoritative pricing, VAT and halala arithmetic | Yes, as logic to mirror | `CheckoutEndpoints.cs` |
| Transactional stock decrement with row locks | Yes, concept; endpoint no | Checkout transaction |
| Idempotency design (scoped key + request hash + advisory lock) | Yes, pattern | `checkout_idempotency` |
| Immutable line snapshots (`order_items`) | Yes | Schema |
| Antiforgery, rate limiting, no-store, absolute session expiry | Pattern only | `AuthSecurity.cs` |
| Append-only audit and security events | Pattern only | Migrations 005, 008, 009 |
| Product catalog endpoints | **No** (staff-only, no images/descriptions/variants) | `Catalog` policy and `ProductDto` |
| Checkout endpoint | **No** (Cashier-only, cash/card, in-store semantics) | `Checkout` policy |
| Order read endpoints | **No** (ownership = staff creator) | `created_by` |

## 5. Capabilities unsuitable for public exposure (verified)

1. Any `/api/admin/*` route and `/api/ops/metrics`, `/api/admin/security-events`: administrator data and operational detail.
2. `GET /api/orders` (all orders) and the reporting/CSV endpoints: cross-customer data.
3. The whole `/api/auth/*` surface as a customer login: it authenticates staff, with admin MFA and operator-managed recovery.
4. `POST /api/checkout` as-is: Cashier role, in-store discount percentages and simulated card/cash tender semantics.
5. The POS database role and connection: must never be reachable from a browser or from Next.js client code.

**Do not grant customers the Cashier role (Recommended, and binding per the brief).** A Cashier can call `POST /api/checkout` with discounts of 5%/10%, read `/api/products` with stock counts, and `/api/receipts`. Reusing it would collapse customer and staff identity, put customers into `orders.created_by` alongside staff, and make staff sessions and customer sessions indistinguishable in audit.

## 4a. Deployment posture (verified from POS docs)

- `docs/operations/readiness.md` and `docs/retail/readiness.md`: isolated **staging/demo** can be GO only when specific CI checks pass for an exact revision. **Public production is NO-GO** (off-host backup durability, independent audit witness, live alerting and on-call ownership unverified; a staging-only `go-jose/v3` high-severity exception expiring 2026-12-01).
- The edge (`deploy/Caddyfile`) serves the Angular app and proxies only `/api/*` to the POS API over TLS on the same origin, with HSTS, `X-Content-Type-Options`, `Referrer-Policy: same-origin`, `X-Frame-Options: DENY`, and a strict CSP (`connect-src 'self'`). A second listener fronts Admin. Request bodies are capped at 64KB.
- `AllowedHosts` is `localhost;127.0.0.1`; production-style config refuses wildcard hosts.
- No CORS configuration was found in the POS API source (grep for `cors` returned nothing), so cross-origin browser calls from a separate Storefront origin would be rejected. This is **verified by absence in code**, not by a live test.
- Real payments, HA, PITR and distributed rate limiting are explicitly not implemented.

This distinction must be preserved: the Storefront integration is an isolated-demo exercise and must not be described as production-ready or publicly approved.

## 6. Admin application (verified)

- `MerchantOS.Admin` is an ASP.NET MVC (Razor, Bootstrap, jQuery) back-office acting as a **BFF**: the browser talks only to Admin; Admin's `PosClient` calls POS with a server-held ticket. Admin tickets are held server-side in `AdminTicketStore` and revalidated against POS.
- POS calls it makes: `GET api/products`, `api/products/{id}`, `api/orders`, `api/orders/{id}`, `api/admin/reports/orders`, `.../orders.csv`, `.../sales`, plus management calls (`ManagementClient`).
- Admin contracts (`Models/Contracts.cs`) mirror the POS DTOs: `ProductDto(Id, Sku, Name, NameAr, Category, PriceHalalas, Stock, Color, Icon, Badge)` and `OrderDto(... Status, Subtotal/Discount/Vat/Payable, PaymentMethod, ChangeHalalas, Items)`.
- Order status handling: the order filter offers exactly `completed`, `cancelled`, `failed`. Payment display only knows `card` ("Simulated Card") and `cash`; any other string is shown raw.
- Sales-channel information: **none** in the POS schema, Admin contracts or reports.
- Thumbnails are chosen by a hard-coded map of POS ids (`p01`, `p02`, `p06`, `p08`, `p13`) with category SVG fallbacks.
- Inventory is edited only through Admin to POS management endpoints with versions and reasons.

**Would online orders require Admin changes?** Yes (Verified from the contracts). Admin would display an online order as an ordinary completed order with "Cash"/"Simulated Card" and no customer, delivery, channel or fulfilment information; filtering by status cannot express `pending`, `paid`, `shipped`, `delivered`. Whether to change Admin is a decision (see `OPEN_DECISIONS.md`).

## 7. Storefront boundaries (verified)

The Storefront is wholly self-contained: `src/lib/api` and `src/lib/auth` exist but are **empty**; there is no `fetch` to any backend. Replacement points:

| Module | Today | Replacement point |
|---|---|---|
| `src/lib/fixtures/products.ts` | 25 fictional products (`p1`-`p25`), prices in whole SAR, `stock` enum plus optional `stockCount` | Source behind a catalog adapter |
| `src/lib/products.ts` | Synchronous lookups: `getProductById`, `getProductBySlug`, `getRelatedProducts`, `allProductSlugs`; slug from name | Becomes the adapter interface (would turn async) |
| `src/lib/catalog.ts` | Category names/filters over the fixture | Category adapter |
| `src/lib/shopping.ts` | Cart/wishlist model, `resolveCart`, `summarizeCart`, `toHalalas`; keys `merchantos.storefront.cart.v1` / `wishlist.v1` | Cart validation call; stays the local draft store |
| `src/lib/shopping-store.ts` | `useSyncExternalStore` over localStorage | Unchanged UI binding |
| `src/lib/checkout.ts` | Form validation, `checkCartLines`, `cartSignature`, delivery/payment option constants (SA only, 8 cities) | Server must re-validate everything |
| `src/lib/checkout-submit.ts` | `submitDemoOrder` is fully local: checks signature, creates `DemoOrder` | Replaced by a server submission with the same idempotency `submissionId` |
| `src/lib/demo-orders.ts` | `DemoOrder` snapshot (`DEMO-XXXXXXXX`, no PII, status `demo-created`, subtotal only, no VAT/shipping) | Superseded by a server order DTO |
| `src/lib/demo-order-store.ts` | localStorage store (max 25 orders, 200k chars) | Replaced by an order-history adapter |
| `src/lib/order-history.ts` | Sorting/search/timeline over `DemoOrder` | Reusable once it consumes a view model instead of `DemoOrder` |
| `src/proxy.ts` | Rewrites unknown product slugs to a 404 using the fixture | Must use the catalog adapter |
| `next.config.ts` | `cacheComponents`, `partialPrefetching`; no rewrites, headers or env | Would need headers/CSP and possibly rewrites |
| `.github/workflows/quality.yml` | typegen, tsc, lint, unit, build, Playwright; no secrets, no backend | Needs a backend job for integration tests |

Tests (verified): Vitest unit/component tests and Playwright e2e under `tests/`; all assume the fixtures and localStorage.

## 8. Summary of the central mismatches

1. The POS has **no public or customer-facing surface**; every route needs a staff session.
2. The POS **product contract is much thinner** than the Storefront's (no images, descriptions, specs, variants, brand, compare-at price).
3. The **catalogs are different** (25 fictional brands vs 30 branded POS products with different ids, categories and names).
4. The POS **has no customer, channel, fulfilment, delivery or payment-status concept**; order ownership is a staff foreign key.
5. Admin **cannot represent** online orders without changes.
6. Production exposure is **out of scope by the POS project's own policy**.

See `API_INTEGRATION_MATRIX.md`, `SECURITY_AND_IDENTITY_BOUNDARIES.md`, `DATA_MODEL_GAP_ANALYSIS.md`, `INTEGRATION_ROADMAP.md` and `OPEN_DECISIONS.md`.
