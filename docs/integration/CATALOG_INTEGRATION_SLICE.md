# Catalog Integration Slice (implemented, read-only)

Status: implemented locally and **uncommitted**, for review. This document records what was built on top of the original audit (`BACKEND_CAPABILITY_AUDIT.md` and the other five documents keep their original, audit-time conclusions). It claims only what was verified; "implemented" and "verified in a running service" are kept apart below.

## 1. Revisions used

| Repository | Base revision | Branch | State |
|---|---|---|---|
| Storefront | `959f936` (audit docs commit on `main`, which contains `cdb35eb`) | `feature/storefront-catalog-integration` | Uncommitted changes |
| POS | `17a9ad5a86fa67c0c775300a294fefa8c8214375` (current public `main` at the time) | `feature/storefront-catalog-api`, in a separate fresh clone | Uncommitted changes |
| Admin | `acba986` (not touched) | none | Unchanged |

The POS work is in a separate fresh clone, not the stale local POS working copy, which was left untouched.

## 2. POS public catalog API

Routes (anonymous, GET only, rate limited, disabled unless `Storefront:Catalog:Enabled=true`): `GET /api/storefront/products?search=&category=&page=&pageSize=` and `GET /api/storefront/products/{slug}`.

Allow-listed fields: `slug`, `name`, `category.slug`, `category.label`, `priceHalalas` (integer), `currency` (`SAR`), `vatTreatment` (`excluded`), `availability` (`in-stock`, `low-stock`, `out-of-stock`). List wrapper: `items`, `page`, `pageSize`, `total`. No description or image is returned because the POS has no source data for them.

Not exposed: SKU, internal product id, quantities, versions, Arabic name, badge, colour, icon, cost, audit or staff data.

Controls: explicit `AllowAnonymous` on exactly those two routes; fallback deny-by-default policy unchanged; separate DTO records (no EF entity or staff DTO); search at most 64 characters with no control characters; category and slug pattern checks; `pageSize` 1-50, `page` 1-1000; fixed-window rate limit per remote address (default 300/minute, configurable, clamped); consistent `{code, message}` errors; database failures become a sanitised 503; the read runs in a `READ ONLY` transaction; success is `Cache-Control: public, max-age=30`, errors `no-store`; no CORS added; HTTPS and loopback rules unchanged.

Existing endpoints and policies are unchanged (`/api/products`, `/api/inventory/{id}`, `/api/categories`, `/api/checkout`, `/api/orders`, management, reporting, auth).

Source files (POS clone): `services/merchant-api/Storefront/StorefrontCatalog.cs` (new), `Program.cs` (two registration lines and one using), `services/merchant-api.Tests/StorefrontCatalogTests.cs` (new), `docs/storefront-catalog.md` (new).

## 3. Product mapping (temporary)

An explicit server-side map of five POS products (`p01`, `p02`, `p06`, `p08`, `p11`) to public slugs and public categories (`smartphones`, `audio`, `wearables`). The POS ids stay private; price and stock are never copied. Slugs were chosen deliberately and are not derived from Storefront fixture ids (`p1`-`p25`), which are different products. This is expected to be replaced by an additive public-catalog table (see `DATA_MODEL_GAP_ANALYSIS.md`).

## 4. Storefront adapter

- `src/lib/catalog-api/config.ts`: validates `MERCHANTOS_CATALOG_SOURCE` (`fixture` default, `api`), `MERCHANTOS_CATALOG_API_URL` (https, or http for localhost only; no credentials, path or query) and an optional timeout. Errors name variables, never values. `next.config.ts` calls it at startup so misconfiguration fails fast.
- `parse.ts`: builds products only from listed fields, drops unexpected extras, rejects malformed data. `money.ts`: integer-halala formatting. `types.ts`: a narrow model, not the fixture `Product` type.
- `client.ts`: server-side `fetch` with timeout, `cache: no-store`, `redirect: error`, `credentials: omit`; returns a status union (`ok`, `not-found`, `invalid-request`, `rate-limited`, `unavailable`, `invalid-response`, `disabled`, `misconfigured`) and never throws to the UI or falls back to fixtures.
- Routes `/catalog-preview` and `/catalog-preview/[slug]` (Server Components inside Suspense) with `src/components/catalog-preview/`. Fixture catalogue, cart, wishlist, checkout and orders are untouched. In fixture mode the preview shows that it is off and makes no request.
- Safety boundary: API products have no Add to cart, wishlist or checkout control, and a forged cart line for an API slug resolves to an empty cart.

## 5. Price and VAT semantics

Prices are integer halalas from the POS database, shown as SAR with an explicit "Excludes VAT" label. The POS adds 15% VAT in its own checkout; nothing here labels a price VAT-inclusive.

## 6. Security headers (Storefront)

`next.config.ts` now sends a Content Security Policy (`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, same-origin `connect-src`, no wildcard), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and a restrictive `Permissions-Policy`. `script-src` and `style-src` need `'unsafe-inline'` because the prerendered shell (Cache Components) cannot carry a per-request nonce; this is a known weakness to revisit if the shell becomes dynamic. Development adds `'unsafe-eval'` and websockets only. HSTS is left to the deployment. Verified in a production build: no CSP violations were reported on the fixture pages or the preview pages in Chromium.

## 7. What was verified, and how

| Check | Result |
|---|---|
| POS full .NET suite, with an isolated PostgreSQL database for the DB-backed tests | 111 passed, 0 failed |
| POS new `StorefrontCatalogTests` alone, without a database | 61 passed, 2 skipped (the two database-backed tests, by design) |
| Storefront `npm run typecheck`, `npm run lint` | pass |
| Storefront `npm test` (Vitest + React Testing Library) | 215 passed (previous 150 plus 65 new) |
| Storefront `npm run build` | pass |
| Storefront Playwright, desktop and mobile | 65 passed, 5 skipped by design (previously 45 passed) |

Real integration (isolated environment on this machine): a fresh PostgreSQL 16 cluster on port 5544 in a scratch folder loaded with the POS schema, seed and migrations 003-009; the POS API ran in Development with loopback HTTP and the catalog flag on; the Storefront ran in API mode against it.

- Public list and detail returned the allow-listed JSON; `p01` and unknown slugs returned 404; `pageSize=999` returned 400.
- Anonymous requests to `/api/products`, `/api/products/p01`, `/api/categories`, `/api/inventory/p01`, `/api/orders`, `/api/receipts`, `/api/admin/audit`, `/api/admin/reports/sales`, `/api/ops/metrics` and `POST /api/checkout` returned 401; `POST` to the new route returned 401.
- A before/after fingerprint of orders, items, payments, idempotency rows, audit rows, stock totals, stock versions and product data was identical after browsing.
- The Storefront preview showed the database prices (for example 429900 halalas displayed as 4,299 SAR). Changing the price of one product and the stock of another directly in the isolated database changed what the Storefront showed (price and out of stock) and restoring them reverted it, proving the origin of both values.
- The rendered Storefront HTML contained no SKU, quantity, backend address, configuration variable name or session cookie name.
- Screenshots at 1440 and 390 px (no horizontal overflow, no CSP violations) are in `docs/visual-reviews/step-12-catalog/`.

Browser tests of API mode used a controlled stand-in backend (`tests/e2e/support/mock-pos.mjs`) that deliberately leaks extra fields (SKU, stock, id) to prove they never reach the page; the real POS integration above was exercised with curl and a Chromium script, not by the Playwright suite.

## 8. Differences and incidents to know about

- The scratch environment lives on `D:` (`D:\MerchantOS-Step12-work`) because the `C:` volume was full. It holds a .NET 10 SDK (downloaded with the user's approval), the POS clone, an isolated PostgreSQL cluster and tool caches. None of it is part of either repository.
- An existing POS test (`SecurityTests.CsrfCookieIsSecureHttpOnlyStrictAndNotCached`) failed early in the session, including on the untouched baseline; it passed in the final full run. It was not investigated further.
- Existing Playwright tests `checkout.spec.ts` and `orders.spec.ts` clicked a product card immediately after the navigation click and began failing deterministically in this environment. A `toHaveURL(/\/products$/)` wait was added before that click (no assertion weakened). Other journeys already had it.
- While investigating, `git worktree remove` followed a `node_modules` junction and emptied the Storefront's `node_modules`; it was restored with `npm ci` from the unchanged lockfile. `package.json` and `package-lock.json` are unchanged.

## 9. Known limitations

- Preview only; no cart, checkout, orders, accounts or fulfilment for API products.
- Five hard-coded published products; temporary mapping in code.
- No description, image, brand, variants or specs (the POS has none).
- `'unsafe-inline'` in the CSP; no HSTS; rate limiting is per remote address and in-memory (single process).
- The POS catalog flag is intended only for an isolated environment; public production remains NO-GO.
- No CI job runs the POS integration; the Storefront workflow was not changed.
- Remote CI was not run for either repository.

## 10. Recommended next step (not started)

Backend cart validation as a stateless, read-only endpoint (Phase D of `INTEGRATION_ROADMAP.md`), preceded by the decisions on catalogue authority, public ids and variants in `OPEN_DECISIONS.md`. Replace the code map with an additive public-catalog table and add a backend job to the Storefront CI once an isolated POS stack is available.
