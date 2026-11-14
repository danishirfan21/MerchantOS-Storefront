# Integration Roadmap

Proposal only. Nothing here is started. Labels: **Verified**, **Recommended**, **Decision required**, **Blocked**. All work stays inside the POS project's isolated-demo boundary (public production is NO-GO per its own readiness documents).

> **Status update:** the first coding milestone below (catalog vertical slice) has been implemented locally, uncommitted, with a narrower scope. See [`CATALOG_INTEGRATION_SLICE.md`](CATALOG_INTEGRATION_SLICE.md) for what was built and verified. The rest of this document is the original audit-time plan.

## 0. Standing assumptions (Recommended)

- Architecture Option B: Next.js server (BFF) -> narrow customer-scoped POS API. See `SECURITY_AND_IDENTITY_BOUNDARIES.md`.
- POS remains the only authority for price, stock and orders. Admin remains staff-only.
- Storefront keeps its current component architecture; data access moves behind adapters.
- Cross-repository changes (POS, Admin) need their own branches, CI and review by their owners; this repository cannot make them.

## 1. Phases

| Phase | Goal | Depends on | Blockers | Acceptance criteria |
|---|---|---|---|---|
| **A. Customer-safe catalog API** | Anonymous, read-only, cache-friendly product list/detail/categories/availability | Decision on catalogue authority and public id (D1, D2) | POS owner approval to add a public projection; no CORS needed under Option B | Endpoints return only allow-listed fields; no SKU or exact stock above low-stock threshold; staff endpoints unchanged and still 401 anonymously; rate limits and size caps; contract tests |
| **B. Product model alignment** | Public product data (brand, description, images, specs, slug, category) and mapped ids | A, D1, D2, D3 | Image asset ownership; taxonomy decision | Every live Storefront product maps to exactly one POS product; no duplicate stock; fixtures only as labelled offline mode |
| **C. Customer identity and ownership** | Ownership key for guests (and accounts if chosen) | D4, D5 | Email infrastructure if accounts; privacy policy | Customer A cannot read customer B's order (negative tests); no staff identity or credential reachable from the browser; separate cookie/session scope |
| **D. Backend cart validation** | Stateless server revalidation of lines, price, availability, VAT | A, B | Variant decision (D3) | Tampered price/quantity/id corrected server-side; mismatch surfaced to the shopper; no server cart persisted |
| **E. Transactional checkout** | Online order creation with idempotency, row-locked stock, server totals | C, D; additive schema | Schema migration approval; payment approach (D6) | Concurrency test never oversells; same idempotency key returns the same order; no client price/discount accepted; order stored with channel `online` |
| **F. Order history** | Customer-scoped list and detail with real statuses | C, E | Fulfilment states (D7) | Storefront My Orders reads server data; unowned ids give identical 404; no-store responses; honest timeline retained for unset stages |
| **G. Admin integration** | Admin shows online orders, channel, fulfilment, transitions | E, F; Admin change approval | Admin owner; reporting-impact review (383 reporting assertions) | Reports segment POS vs online; CSV neutralisation preserved; transitions audited; PII fields restricted |
| **H. Full ecosystem verification** | End-to-end verification across Storefront, POS, Admin | A-G | An isolated integration environment | Journey test from catalog to Admin visibility; security abuse-case tests all pass; documented isolated-demo GO/NO-GO; no public-production claim |

## 2. Recommended first coding milestone: "Catalog vertical slice"

Smallest end-to-end slice that proves the architecture without touching identity, checkout or Admin.

**Scope**

1. POS (separate repo/PR, owner-approved): one new anonymous, read-only, rate-limited endpoint pair for a customer-safe catalog projection (list + detail by public id), behind an explicit allow-list DTO. No change to existing policies.
2. Storefront: introduce a catalog adapter interface with two implementations, `fixture` (existing) and `api` (new), selected by a server-only setting; the product list, detail page, search results and `src/proxy.ts` slug check use the adapter. Cart, checkout and orders remain local and unchanged.
3. Data: map a small agreed set of products (for example 3 to 5) to POS products; flag the rest as fixture-only.
4. Tests: contract tests for the DTO field allow-list, anonymous staff-route denial, adapter parity tests (fixture vs api shape), Playwright catalog journey against a local POS.

**Explicitly out of scope:** customer authentication, cart validation, checkout, orders, Admin, schema changes beyond an additive public-catalog table or columns, deployment.

**Acceptance criteria**

- `GET` public list/detail returns 200 anonymously, returns only allow-listed fields (asserted by a test that fails on any extra field).
- `GET /api/products`, `/api/admin/*`, `/api/orders` remain 401 anonymously (regression test).
- Storefront renders catalog and detail from the API with no secret in the client bundle or HTML (grep test).
- Fallback behaviour: API failure shows an error state, not stale fixture data presented as live.
- Existing Storefront suites (150 unit/component, 45 e2e) still pass in fixture mode.
- No exact stock count or SKU is exposed above the low-stock threshold.
- POS CI baseline for the touched area passes; Admin contract unaffected.

**Prerequisite decisions:** D1, D2, D3 and approval to modify POS.

## 3. Other dependencies and risks

- Cross-repo coordination: Admin pins an exact POS revision in CI (its integration runs use a pinned POS); any POS change requires the Admin pin to be updated by its owner.
- POS schema changes need backups and the restore drills it documents; do not run migrations against any shared data without an owner.
- Environment: a realistic integration environment is the POS repo's own isolated compose stack (`deploy/compose.yml`, TLS edge) plus the Storefront running on the same private host/network; **not** exposed publicly and not deployed by this work (Recommended). Real deployment of the Storefront is a separate, unapproved topic.

## 4. What this roadmap does not promise

No phase makes the system production-approved. Real payments, HA, off-host backup durability, independent audit witness and alert routing are out of scope and are NO-GO items in the POS readiness policy.
