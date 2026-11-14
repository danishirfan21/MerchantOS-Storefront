# Data Model Gap Analysis

Read-only. No migration was run and no database file or connection was touched; schemas were read from `db/init/001_schema.sql`, `002_seed.sql` and `db/migrations/003`-`009` at POS `17a9ad5`. Labels: **Verified**, **Recommended**, **Decision required**, **Blocked**.

## 1. Existing PostgreSQL schema (verified)

| Table | Key columns | Notes |
|---|---|---|
| `products` | `id varchar(32)` PK, `sku` unique, `name`, `name_ar`, `category`, `price_halalas bigint >= 0`, `color`, `icon`, `badge`, `version` | No brand, description, images, specs, variants, compare-at price, slug, active flag |
| `inventory_levels` | `product_id` PK/FK, `quantity_on_hand int >= 0`, `version` (trigger-advanced) | Single authoritative stock, no reservations |
| `orders` | `id uuid`, `order_number` unique (`MOS-` + 12 hex), `created_at`, `currency` (default SAR), `status varchar(20)`, subtotal/discount/vat/payable halalas, `payment_method`, `change_halalas`, `created_by uuid` FK to `auth_users` | No channel, customer, delivery or fulfilment columns |
| `order_items` | `order_id`, `product_id`, `sku`, `name`, `quantity > 0`, `unit_price_halalas` | Immutable-style snapshot; no variant column; no FK on `product_id` |
| `payments` | `order_id` unique, `method`, `result`, `tendered_halalas`, `change_halalas` | One payment per order; cash/card only |
| `checkout_idempotency` | `key` PK (hashed with user id), `request_hash`, `order_id` unique | Staff-scoped |
| `auth_users`, `auth_sessions`, `auth_challenges`, `auth_recovery_codes`, `auth_restore_blocks`, `admin_ticket_sessions` | Staff identity with `role CHECK IN ('Administrator','Cashier')`, MFA, security version | Staff only |
| `admin_audit`, `inventory_adjustments` | Append-only (triggers raise on update/delete/truncate) | Product and inventory entity types only (`CHECK`) |
| `security_events`, `security_event_outbox`, `security_export_state`, `ops_security_signals` | Fixed categories, outbox, export chain | No PII by design |

Seed (verified): 30 products `p01`..`p30`, six categories (Phones, Audio, Wearables, Gaming, Power, Accessories), 5 each, with real-world brand names.

## 2. Fit assessment

| Need | Fit | Gap |
|---|---|---|
| Products | **Partial** | Missing brand, description, images, spec groups, compare-at price, slug, publish flag |
| Categories | **Partial** | Free-text column, no category table, no hierarchy; taxonomy differs from the Storefront |
| Variants | **None** | No variant concept |
| Inventory | **Good** | Authoritative, versioned, adjustment-audited; lacks reservation and "available to purchase online" notion |
| POS orders | **Good** | Native |
| Online orders | **Poor** | No channel, customer, delivery, payment-status or fulfilment columns; `status` values are constrained by reporting to completed/cancelled/failed |
| Customer identities | **None** | `auth_users` is staff-only |
| Guest ownership | **None** | `created_by` is a staff FK |
| Delivery info | **None** | No address/contact/delivery-method storage |
| Payment status | **Poor** | `payments.result` exists; only cash/card; real gateway not implemented |
| Fulfilment status | **None** | |
| Historical prices | **Good** | `order_items.unit_price_halalas` snapshots price and name; no product version link |
| Channel attribution | **None** | |
| Admin reporting | **Constrained** | Reports and partial indexes assume `status='completed'` and `currency='SAR'`; new statuses/channels change report meaning |

## 3. Product identity mapping (Storefront vs POS)

Verified mismatch:

| | Storefront | POS |
|---|---|---|
| Id | `p1`..`p25` | `p01`..`p30` (zero padded) |
| Catalogue | 25 fictional products, invented brands (Nova, Aurora, Vertex, Helix, Orbit) | 30 real-brand products (e.g. iPhone 15 Pro, Galaxy S24 Ultra) |
| Name | e.g. "Flagship smartphone 256GB" | e.g. "iPhone 15 Pro" |
| Category | smartphones, laptops, audio, tvs, gaming, wearables, cameras | Phones, Audio, Wearables, Gaming, Power, Accessories |
| Overlap | None by name; laptops, TVs and cameras have **no** POS category; Power and Accessories have **no** Storefront category | |
| Price | whole SAR (`5199`) | halalas (`429900` = SAR 4,299.00), ex-VAT |
| Stock | enum plus optional count | exact integer |
| Variants | presentational options | none |

Because the catalogues do not correspond, **a direct id mapping does not exist**. Even `p1` vs `p01` is a different product.

**Recommended mapping (not implemented):**

1. The POS `products.id`/`sku` remain the single authority for price and stock. Add a **public catalog layer** (new columns or a new table, Decision required which) holding public id/slug, brand, description, images, specs, category slug and a `published_online` flag, keyed to `products.id`.
2. The Storefront consumes only the public id/slug; it never sees `sku` or exact stock unless stock is low.
3. Fixture products without a POS counterpart are removed from the live catalog, or created as new POS products by an administrator through the existing audited management path. Which catalogue is authoritative is a **Decision required** (see `OPEN_DECISIONS.md`).
4. Do not keep a second stock figure in the Storefront database or fixtures once integrated. During transition fixtures may exist only as an offline demo mode and must not be shown as live.

## 4. Variants

The Storefront states variants never change price or stock. Options (Decision required): (a) store the chosen options as text on the order line (new nullable column or JSON on `order_items`), stock remains per product; (b) model colours/finishes as separate POS SKUs with their own stock. Option (a) matches current Storefront semantics but cannot prevent selling an out-of-stock colour; (b) is accurate but multiplies catalogue entries and requires Admin changes.

## 5. Money, VAT and price mismatch prevention

Verified: POS prices are ex-VAT; discount rounding `(x*pct+50)/100`; VAT 15% rounded `(x*15+50)/100`; payable = subtotal - discount + VAT. The Storefront today shows an "estimated total" that is the subtotal only (no tax, no shipping).

Recommended:

- The server returns every amount in halalas: line unit price, line total, subtotal, VAT, shipping (if any), payable. The Storefront formats them and **never computes totals that it submits**.
- Show whether the displayed unit price excludes VAT; label the final total as "includes VAT" only when the backend says so. Decision required: show prices VAT-inclusive (customer convention) by storing the inclusive price or computing it, and whether Saudi online pricing is quoted inclusive.
- Prevent price mismatch: cart validation returns current prices; checkout carries a `pricedAt`/`catalogVersion` or the list of expected line totals; if the server total differs from what the customer confirmed, the order is rejected with a conflict and the new amounts are shown for re-confirmation. The POS `products.version` column is the natural basis for a catalog version check.
- Never accept client prices or a discount percent on the online path.

## 6. Proposed additive schema direction (Recommended, no SQL written)

All additive, replay-safe in the style of migrations 003-009; **none is created by this audit**.

- Orders: nullable `channel` (default `pos`), `customer_id`, `guest_secret_hash`, `contact_name`, `contact_email`, `contact_phone`, delivery address fields or a separate `order_deliveries` table, `delivery_method`, `payment_status`, `fulfilment_status`, plus status history table. Prefer a separate table for PII so the retention and access policy can differ from the order ledger.
- `order_items`: nullable `variant_selection`.
- New `customers` table (only if accounts are chosen), **not** `auth_users`.
- `auth_users.role` CHECK must not be widened for customers (Recommended).
- Constraints that need care: `orders.status` free text (varchar 20) vs report filters; partial index `ix_orders_completed_sar` and report queries; `admin_audit.entity_type` CHECK only allows `product`/`inventory`, so order transitions need a new audit entity type; `created_by` stays nullable for online orders.
- Reporting: add `channel` to filters and summaries before online rows exist, or reports silently mix channels.

## 7. Impact on Admin (verified from contracts)

Admin `OrderDto` has no channel/customer/delivery; status filter lists three values; payment display knows only card/cash. New columns are ignored safely by JSON deserialization, but new statuses and payment methods would display raw. Any change to Admin is a separate decision.

## 8. Migration safety constraints (verified from POS docs)

Migrations are versioned SQL applied with `ON_ERROR_STOP=1`, additive and replay-safe, with backups and restore reconciliation. Schema changes touch identity-adjacent tables only through explicit operator privileges (`guard_runtime_identity_changes`). The app DB user cannot change roles; keep customer tables outside that trigger's scope and make sure restore/quarantine drills cover them.

## 9. Blocked by missing evidence

- Real data volumes and query performance for public catalog traffic.
- Whether the POS maintainers will accept customer-facing schema in the same database (organizational decision).
- The legal/privacy requirements for Saudi PII retention (no policy exists in any repo).
