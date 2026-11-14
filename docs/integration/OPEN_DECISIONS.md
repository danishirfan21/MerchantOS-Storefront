# Open Decisions and Evidence Register

Each item carries one status: **Verified**, **Recommended**, **Decision required**, or **Blocked by missing evidence**. Audit date 2026-11-14; Storefront `cdb35eb`, POS `17a9ad5`, Admin `acba986`.

## A. Decisions required

| ID | Decision | Options | Recommendation | Why it matters |
|---|---|---|---|---|
| D1 | Which catalogue is authoritative? | (a) POS catalogue becomes the live catalogue and Storefront fixtures are retired; (b) create the Storefront products in POS through the audited Admin path; (c) keep fixtures as a separate demo | **Recommended:** (b) or (a); keep fixtures only as a labelled offline demo | The catalogues share no products (Verified); stock must have one authority |
| D2 | Public product identity | Public slug, stable public id, or reuse `p01` ids | **Recommended:** a backend-owned public id/slug distinct from `sku` | Avoids exposing SKUs and sequential internal ids |
| D3 | Variants | Order-line attribute only, or separate SKUs | **Recommended:** attribute only for the first slice, SKUs if per-variant stock is needed | Storefront variants are presentational; POS has none |
| D4 | Customer identity model | Guest only; registered accounts; both | **Recommended:** guest-only first, accounts later | Needs the largest net-new infrastructure; no email service exists |
| D5 | Ownership proof for guest orders | Order secret shown once; email magic link; phone OTP | **Recommended:** order secret shown once | No email/SMS infrastructure exists (Verified absent) |
| D6 | Payment semantics | Keep "demo cash on delivery" labelled demo; simulated card; real gateway | **Recommended:** keep labelled demo | POS supports only cash/card simulation; real payments NOT implemented (Verified) |
| D7 | Fulfilment states and who sets them | Add statuses and staff transitions; keep "created" only | **Recommended:** keep Storefront's honest unavailable stages until staff transitions exist | No fulfilment data exists (Verified) |
| D8 | Server-to-server credential for Storefront BFF | Scoped service token; mTLS; none (shared network only) | Mechanism not recommended without POS owner input | Must not be a staff session or Cashier |
| D9 | PII policy | Fields collected, retention, deletion, log redaction | Define before any PII is stored | Storefront stores no PII today (Verified) |
| D10 | Price display | VAT-inclusive vs exclusive display; shipping | Show backend amounts only; state VAT basis | POS prices are ex-VAT (Verified) |
| D11 | Admin changes for online orders | Add channel, statuses, PII-restricted view | Do after Phase E; own PR in Admin repo | Admin cannot represent online orders (Verified) |
| D12 | Where public catalog data lives | New columns on `products` vs new table | Table preferred to keep the staff contract stable | Affects migrations and staff DTOs |
| D13 | Authority to modify POS/Admin | Owner approval and branch policy | Obtain before Phase A | This repository cannot change them |

## B. Verified facts (reference)

| ID | Fact | Source |
|---|---|---|
| V1 | POS catalog, inventory, order and receipt endpoints all require a staff session; only health is anonymous | `Program.cs`, `CheckoutEndpoints.cs` |
| V2 | `POST /api/checkout` is Cashier-only; request has client-chosen `discountPercent` of 0/5/10, cash/card, simulated card scenario | `CheckoutEndpoints.cs`, `AuthSecurity.cs` |
| V3 | Order ownership is `orders.created_by` referencing a staff user; non-admin reads return 404 for unowned orders | `CheckoutEndpoints.cs`, migration 004 |
| V4 | `GET /api/orders` returns all orders (last 100) to Administrators only | `CheckoutEndpoints.cs` |
| V5 | No customer entity, channel, delivery, fulfilment or payment-status columns exist | Schema and migrations |
| V6 | `auth_users.role` is restricted to Administrator/Cashier | Migration 004 |
| V7 | Statuses seen by reporting/Admin: completed, cancelled, failed; payments: cash, card | `ReportingEndpoints.cs`, Admin `Orders.cshtml` |
| V8 | POS unit prices are ex-VAT; VAT 15% and discount rounding computed server-side in halalas | `CheckoutEndpoints.cs` |
| V9 | POS has no CORS configuration; cookie is HttpOnly/Secure/SameSite=Strict, sessions 30-minute absolute | Source grep, `AuthSecurity.cs` |
| V10 | Admin is a BFF using a server-held ticket and calls `api/products`, `api/orders`, `api/admin/reports/*` | Admin `PosClient.cs` |
| V11 | Product catalogues differ (ids, brands, categories, price units) | Seeds vs Storefront fixtures |
| V12 | POS readiness: isolated staging GO conditional on CI; public production NO-GO | `docs/operations/readiness.md`, `docs/retail/readiness.md` |
| V13 | Storefront `src/lib/api` and `src/lib/auth` are empty; no network calls; demo orders contain no PII | Storefront source |
| V14 | Storefront has no CSP or security headers configured | `next.config.ts` |

## C. Recommendations (not decisions)

| ID | Recommendation |
|---|---|
| R1 | Architecture Option B (Next.js BFF) with cached public catalog |
| R2 | New customer-safe endpoints; never relax staff policies or grant customers Cashier |
| R3 | Guest ownership key separate from `created_by`; 404 for non-owned |
| R4 | Server-authoritative totals in halalas; no client prices or discount |
| R5 | First milestone: catalog vertical slice (see roadmap) |
| R6 | Add Storefront CSP and security headers before any backend call |
| R7 | Add a backend job to Storefront CI only once an isolated POS stack is available |

## D. Blocked by missing evidence

| ID | Item | What would unblock it |
|---|---|---|
| B1 | Live behaviour of POS/Admin (nothing was run) | Running the repos' isolated compose stack, read-only checks |
| B2 | Contents of POS .NET test bodies and Admin test project | Reading them in a follow-up |
| B3 | POS Angular client's use of the API | Reading `src/app` |
| B4 | CI status for the inspected revisions | Checking GitHub Actions |
| B5 | Real data volumes, performance targets | Owner input |
| B6 | Privacy/legal retention requirements | Owner or legal input |
| B7 | Email/SMS capability for recovery | Infrastructure decision |
| B8 | Local POS/Admin copies 50 commits behind public repos | Owner decides whether to sync (not done here) |
