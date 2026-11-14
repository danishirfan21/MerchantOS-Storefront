# MerchantOS Storefront

### Premium Ecommerce. Connected Retail Engineering.

**MerchantOS Storefront** is a premium, responsive electronics ecommerce app built with **Next.js 16, React, TypeScript and Tailwind CSS**.

Shoppers can browse and search products, filter and sort the catalogue, choose variants, save a wishlist, manage a cart, check out and track their orders, across nine pages designed for desktop, tablet and mobile.

It is the customer-facing app of the MerchantOS retail ecosystem, alongside an Angular-based Point of Sale application and an ASP.NET Core management platform. It can show live product data from the POS backend, served through the Next.js server.

**Project status: Active Development**

---

## The MerchantOS Ecosystem

MerchantOS demonstrates how different frontend architectures can serve distinct business operations while sharing authoritative backend services.

| Application                                                           | Technology                              | Responsibility                            |
| --------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------- |
| [MerchantOS POS](https://github.com/danishirfan21/MerchantOS-POS)     | Angular 22, TypeScript, ASP.NET Core 10 | Cashier operations, sales and inventory   |
| [MerchantOS Admin](https://github.com/danishirfan21/MerchantOS-Admin) | ASP.NET Core MVC, Razor, Bootstrap      | Products, inventory, orders and reporting |
| **MerchantOS Storefront**                                             | Next.js, React, TypeScript              | Customer-facing ecommerce                 |

The POS and Admin applications are completed for their portfolio and isolated-staging scope.

Storefront is the third application, connecting to the same ASP.NET Core API and PostgreSQL database.

---

## Technology Stack

| Category                    | Technology                                    |
| --------------------------- | --------------------------------------------- |
| Framework                   | Next.js 16, App Router                        |
| UI                          | React 19                                      |
| Language                    | TypeScript 5, strict mode                     |
| Styling                     | Tailwind CSS 4                                |
| Icons                       | Lucide React                                  |
| Typography                  | Plus Jakarta Sans, Inter                      |
| Architecture                | React Server Components and Client Components |
| Backend integration         | ASP.NET Core 10 Web API                       |
| Shared retail database      | PostgreSQL 17, through backend services       |

The application uses reusable React components, semantic design tokens and responsive layouts to maintain consistent interfaces across devices.

---

## Current Implementation

The application foundation, responsive Homepage, Product Catalog, Product Detail, Shopping Cart, Wishlist, Checkout, Order Confirmation, My Orders and Order Details are implemented, with an automated test suite.

### Implemented

- Next.js App Router project structure with TypeScript strict mode
- Responsive storefront header, navigation and mobile navigation disclosure
- Simplified checkout header component and shared footer
- Reusable buttons, inputs and navigation controls
- ProductCard, ProductGrid and ProductPrice components
- Typed fictional product fixtures shared by the Homepage and Catalog
- Homepage hero, departments, featured products and deal presentation
- **Product Catalog** at `/products`:
  - Header search that navigates to the catalog
  - Filters for category, brand, price range, storage and availability
  - Sorting by featured, price and name
  - Removable active-filter chips and a clear-all action
  - Filter and sort state kept in the URL, so views are shareable
  - Desktop sidebar and an accessible mobile filter drawer sharing one filter state
  - Empty state and live result count
- **Product Detail** at `/products/[slug]`:
  - One reusable page that serves all 25 catalogue products, prerendered at build time
  - Gallery with selectable thumbnails, price with compare-at discount, availability, variants, quantity selector, overview, specifications, delivery note and related products
  - Product cards on the Homepage and Catalog link to it, and "Back to catalog" restores the filters the shopper came from
- **Shopping Cart** at `/cart` and **Wishlist** at `/wishlist`, with header counts, working add-to-cart controls and browser persistence (see Shopping Cart and Wishlist below)
- Responsive design tokens and typography

The Homepage and Catalog have been browser-checked at desktop, tablet and mobile sizes, down to 320px. TypeScript, ESLint and the production build pass.

Product imagery currently uses temporary placeholders (see Known limitations). Accounts and backend integrations are not implemented, and checkout is a browser-local demo with no real payment.

---

## Responsive Design

The interface is based on **27 approved Google Stitch screen designs**, covering nine customer-facing pages at three reference viewport sizes.

| Device  | Reference viewport |
| ------- | ------------------ |
| Desktop | 1440 × 900         |
| Tablet  | 768 × 1024         |
| Mobile  | 390 × 844          |

The implementation uses reusable components and responsive CSS rather than maintaining separate applications for each device.

The approved design direction emphasizes emerald-green branding, premium electronics presentation, clear purchasing actions, accessible controls and restrained visual styling.

Screenshots of the current implementation are in [`docs/visual-reviews/`](docs/visual-reviews/). They may contain temporary imagery.

---

## Customer Experience

The Storefront is built around nine core customer-facing pages:

1. **Homepage:** Flagship products, departments and promotions. _Implemented._
2. **Product Catalog:** Product search, filtering and sorting. _Implemented._
3. **Product Detail:** Image galleries, specifications and variants. _Implemented._
4. **Shopping Cart:** Product selection, quantities and totals. _Implemented._
5. **Checkout:** Customer details, delivery information and simulated payment. _Implemented (demo)._
6. **Order Confirmation:** Purchase summary and confirmation. _Implemented (demo)._
7. **Wishlist:** Saved products and shopping actions. _Implemented._
8. **My Orders:** Customer purchase history. _Implemented (browser-local demo orders)._
9. **Order Details & Tracking:** Order information and fulfillment status. _Implemented (no real fulfilment events)._

The development strategy uses deterministic fictional fixtures before introducing secure backend integration.

---

## Product Detail

### Routing

Product URLs are derived from the product name by one function, `productSlug()` in `src/lib/products.ts`, for example `/products/flagship-smartphone-256gb`. Lookup (`getProductBySlug`), related products and quantity rules live in the same module, and the same product records feed the Homepage, Catalog and detail pages, so nothing is duplicated.

All slugs are prerendered with `generateStaticParams`. Because Cache Components streams the response for unknown params, `src/proxy.ts` rewrites unknown slugs to a path that does not exist, so they return a genuine HTTP 404.

### Fixture-driven data

Variants, specifications and stock all come from the `Product` records in `src/lib/fixtures/products.ts`:

- **Variants** are optional and only exist where a record defines them (for example finish or colour). They are presentational: they never change price or stock, because a variant with its own price or stock would need its own record.
- **Specifications** are taken from an explicit `specGroups` field when present; otherwise a table is derived from the record's brand, category, storage and feature line.
- **Quantity** is limited by the known `stockCount` for low-stock items, by a per-order limit of 10 otherwise, and is disabled for out-of-stock items.

All catalogue data is fictional sample data, not live inventory.

### Known limitations

- Product imagery is placeholder only. No authorized photography exists yet, so each gallery shows four clearly labelled placeholder slots rather than reusing one picture as different angles.
- Authentication and any backend integration are deferred. Checkout is a browser-local demo.
- Reviews, warranty or certification claims, bundles and delivery promises from the design references are intentionally not reproduced, because there is no data behind them.
- Below roughly 313px of available width the header would overflow. This only matters at 320px on browsers with a permanent scrollbar.

---

## Shopping Cart and Wishlist

**Routes:** `/cart` and `/wishlist`. Add to cart works on Product Detail (selected variants and quantity), on Homepage, Catalog and related-product cards, and from the Wishlist. Cards for products with variants link to the detail page ("Choose options") instead of guessing a configuration.

### Local demo state
Cart and wishlist live in the browser's `localStorage` (`merchantos.storefront.cart.v1`, `merchantos.storefront.wishlist.v1`). This is demo state, not an account, an order or authoritative inventory; it is per browser and per device.

- A cart line stores only `productId`, the selected variant option ids and `quantity`. Name, price, compare-at price and availability are always derived from the catalogue, so prices are never persisted.
- A line is identified by product id plus variant selection (independent of key order). Adding the same configuration merges and raises the quantity up to the limit; a different variant is a separate line.
- The wishlist is a list of product ids without duplicates, independent of the cart. Adding a wishlist item to the cart (default variants, quantity 1) does not remove it from the wishlist, and out-of-stock products are never added.
- Stored data is validated on load: unknown or out-of-stock products are dropped, variants are repaired against the catalogue, quantities are clamped and duplicate configurations merged. Corrupt or unavailable storage degrades to an in-memory session.
- The store is read with `useSyncExternalStore`: the server and first client render are empty, then stored state appears, so there is no hydration mismatch and the initial empty state never overwrites stored data. Other tabs are followed through the `storage` event.
- The logic is in pure functions (`src/lib/shopping.ts`); the browser store is `src/lib/shopping-store.ts`.

### Quantity and availability rules
Quantity is at least 1 and at most the known fixture `stockCount` for low-stock products, otherwise 10 per order line. Out-of-stock products cannot be added. Limits are enforced on repeated additions, and a refused addition is reported as a message rather than a success.

### Totals
Amounts are computed in integer halalas. The summary shows item count, subtotal in SAR, savings measured only against explicit compare-at prices (already included in the subtotal) and an **estimated total**, which equals the subtotal. Shipping, tax and discount codes are not modelled and the summary says so. These figures come from fictional fixtures, are not a final payable amount, and do not reflect live inventory or any real order.

### Functional and deferred
Functional: add, merge, change quantity, remove, wishlist save and remove, move to cart, header counts, persistence, empty states, and the demo checkout below. Deferred: real payments, accounts, promotion codes, shipping and tax, order history, live stock, and anything server-side.

---

## Checkout and Order Confirmation

**Routes:** `/checkout` and `/order-confirmation/[id]`. Both use a focused route-group layout (`src/app/(checkout)`) with the simplified `CheckoutHeader` instead of the full storefront header and footer. The cart's "Proceed to checkout" link is enabled whenever the cart has items; an empty cart shows an empty state with a way back.

**This is a demo.** No payment is taken, no order is placed with anyone, nothing is shipped or reserved, and no email is sent. The pages say so, and the confirmation uses wording such as "Demo order created".

### Flow
Review the cart, enter contact and delivery details, choose a demo delivery method and a simulated payment option, review the estimated summary, and place the demo order. The confirmation page shows the stored order and survives a reload.

### Form and validation
Validation is client-side and pure (`src/lib/checkout.ts`): required fields, email format, Saudi mobile format (`05XXXXXXXX`, `5XXXXXXXX` or `+9665XXXXXXXX`), 5-digit postal code, length limits and valid delivery, payment, country and city selections. Errors are tied to fields with `aria-invalid` and `aria-describedby`, an alert summarises the count, and focus moves to the first invalid field. Fields carry autocomplete attributes and the delivery and payment choices are native radio groups.

### Demo payment
Options are "Demo cash on delivery" and "Simulated card payment". There are no card number, expiry, security code or bank fields, and no payment provider. Nothing is described as authorised, captured or settled.

### Order summary
The review reuses the cart maths in integer halalas: item count, subtotal, savings measured only against explicit compare-at prices, and an estimated total equal to the subtotal. Shipping and tax are not modelled and the page says the figure is not a final payable amount.

### Demo order record
`src/lib/demo-orders.ts` (pure) and `src/lib/demo-order-store.ts` (browser store) are isolated from the components so they can later be replaced by a backend API. A record is a snapshot taken at submission, so later cart edits do not change it:

```
schemaVersion, id (DEMO-XXXXXXXX), submissionId, createdAt, status ("demo-created"),
paymentMethod {id, label}, deliveryMethod {id, label},
lines [{ productId, name, variants, variantLabels, quantity, unitHalalas, lineTotalHalalas }],
itemCount, subtotalHalalas, savingsHalalas, estimatedTotalHalalas
```

Stored data is validated on read: wrong schema versions, malformed records and records whose totals do not add up are rejected rather than repaired, labels come from the app rather than from storage, and the store is capped by count and size. Orders live in `localStorage` (`merchantos.storefront.demo-orders.v1`) in this browser only. They are not shared between browsers or devices and disappear if site data is cleared.

### Privacy
Name, email, phone, street address, recipient and any payment data are held in component state while the form is open and are never stored, put in a URL, logged or written into the order record. Neither `localStorage` nor `sessionStorage` receives them. The confirmation shows only the non-sensitive delivery and payment option labels. Do not enter real personal details.

### Submission and cart clearing
Before creating anything the cart is reloaded from storage and revalidated (products exist, are in stock, variants are valid, quantities are within limits, totals are recalculated from the catalogue) and compared with what the shopper was shown. If it changed or cannot be ordered, submission is blocked with an explanation and a link back to the cart. The order is saved and read back first; only then are the purchased quantities removed from the cart. Items added in another tab meanwhile stay, and the wishlist is untouched. If the order cannot be saved (storage blocked or full), nothing is created, the cart is unchanged and a recoverable error is shown.

Repeated submission is blocked while processing, and each checkout visit has a submission id so a repeated submit returns the order already created instead of a second one. Refreshing or revisiting the confirmation only reads the stored record. This protection is client-side only: it cannot stop a deliberate second checkout in another tab or browser, and a real backend must enforce its own idempotency keys.

### Differences from the design references
The layout, step indicator, section structure and order review follow the designs. These elements are intentionally not reproduced because nothing real stands behind them: encryption or security-compliance claims, card entry fields, Apple Pay, mada and other payment brands, VAT amounts, free or priced delivery and delivery times, vouchers, warranty and returns promises, phone support, settlement and tax-invoice statements, tracking and invoice actions, and the shipping destination block with personal details.

### Future backend requirements
A real implementation needs server-side cart and price authority, transactional stock reservation, a payment provider integration with server-confirmed capture, server-enforced idempotency, authenticated customers, stored addresses with consent, and transactional email. The order-history pages read the existing records without personal data, because each already carries a reference, timestamp, status, line snapshots and totals, and lookup is by order id.

---

## My Orders and Order Details

**Routes:** `/account/orders` (My Demo Orders) and `/account/orders/[id]` (Order Details & Tracking), inside the shared storefront shell. They read the same browser-local demo-order records created by checkout (`merchantos.storefront.demo-orders.v1`) with `useSyncExternalStore`, so nothing is written while browsing history and changes in another tab are picked up.

**This is not an account.** There is no sign-in or cross-device sync. My Orders shows the demo orders saved in this browser only, not authenticated customer order history. Clearing site data removes them, and the store keeps at most 25 orders (and a size cap), dropping the oldest.

### My Orders
- Newest first. Orders with the same timestamp are ordered by reference, so the order is deterministic.
- Each card shows the reference, created time, status, a product preview, item count, the saved estimated total and a link to the details.
- Local search matches the demo reference or any purchased product name (case-insensitive, partial). It only searches records in this browser and never changes them.
- There are no status filters or tabs: the only status that exists is "Demo order created", so none are invented.
- Distinct states: loading, "No demo orders yet" with a Browse products link, "no match" with Clear search, and "Demo orders can't be read" when storage is blocked (never reported as an empty history).

### Order Details
- Shows the exact stored order from the URL: reference, created time, status, items with variants, quantities, unit prices and line totals, subtotal, savings and estimated total, and the simulated delivery and payment options.
- Amounts come from the saved snapshot, never from the current catalogue, so later price changes do not alter history. Products still in the catalogue link to their product page; removed products keep their saved name and amounts without a link.
- Unknown, malformed or unreadable ids show a missing-order state, and nothing is created.

### Tracking limitations
The progress timeline is real only for the first stage. "Demo order created" carries the actual creation time. Processing, Shipped, Out for delivery and Delivered are drawn inactive and labelled "Not available in this demo" in text, with no timestamps. There are no tracking numbers, couriers, delivery dates, maps or notifications, no status ever advances, and nothing in storage is changed to simulate fulfilment. A note on the page says that no payment, stock reservation, shipping or delivery has occurred.

### Navigation
The header orders icon, the mobile menu and the footer link to `/account/orders`. The confirmation page links to View order details and View my demo orders. Details link back to My orders and to the catalogue.

### Differences from the design references
Kept: the page structure, order cards, product preview, summary and timeline hierarchy (horizontal on wider screens, vertical on mobile). Not reproduced because nothing real stands behind them: shipment statuses and tabs, tracking codes, courier and arrival estimates, invoices, buy-again and support actions, warranty, voucher, VAT and delivery-address details, masked card details and the signed-in customer profile.

---

## Live Catalogue Preview

By default the storefront runs entirely on its fictional demo catalogue, exactly as described above. An optional **live catalogue preview** can instead read a small set of real products from the MerchantOS POS backend through a server-side request. It lives at `/catalog-preview` and `/catalog-preview/[slug]`, separate from `/products`, and is **not** purchasable.

**Enabling it** (server-only environment variables, never `NEXT_PUBLIC_`):

| Variable | Meaning |
| -------- | ------- |
| `MERCHANTOS_CATALOG_SOURCE` | `fixture` (default) or `api`. Anything else is rejected at startup. |
| `MERCHANTOS_CATALOG_API_URL` | Origin of the POS API, required when the source is `api`. `https` only, except `http` for localhost. No credentials, path or query. |
| `MERCHANTOS_CATALOG_API_TIMEOUT_MS` | Optional request timeout, 500 to 15000 (default 4000). |

**What it does.** The page fetches the POS Storefront catalog (`GET /api/storefront/products` and `/{slug}`) on the server, parses only the documented fields, and shows names, integer-halala prices rendered as SAR, and customer-safe availability (in stock, low stock, out of stock). A banner on every preview page states that the data is live POS data, that prices **exclude VAT**, and that the products cannot be added to the cart or purchased.

**What it deliberately does not do.** The demo cart, wishlist and checkout only know the fictional catalogue, so API products have no Add to cart, wishlist or checkout path. If the POS is unreachable, slow, rate limiting or returns malformed data, the preview shows an error state; it never substitutes demo products as if they were live. No staff credential, cookie, SKU, internal id or exact stock quantity reaches the browser, and no real order, payment or stock change is possible.

**Security headers.** All responses carry a baseline Content Security Policy (same-origin only; `'unsafe-inline'` for scripts and styles is still required because the prerendered shell uses Next.js inline bootstrap scripts), `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` and `Permissions-Policy`. HSTS is left to the deployment. This is a development baseline, not deployment approval.

The POS side of this contract, its allow-listed fields and its tests are documented in [`docs/integration/CATALOG_INTEGRATION_SLICE.md`](docs/integration/CATALOG_INTEGRATION_SLICE.md). This does not make the storefront production-ready, and customers still cannot place real orders.

---

## Architecture

MerchantOS Storefront is designed to use a shared retail backend rather than creating independent authoritative product, inventory and order databases.

**Customers → Next.js Storefront → Customer-facing API contracts → ASP.NET Core API → PostgreSQL**

The existing POS and Admin applications also communicate with the MerchantOS backend.

### Key Engineering Principles

- Server Components for suitable server-rendered content
- Client Components for interactive shopping experiences
- Reusable and accessible UI components
- Strictly typed application data
- Responsive layouts using shared design tokens
- Search-engine-friendly product pages
- Backend-authoritative pricing and inventory
- Customer-specific authorization boundaries
- Idempotent order processing
- Automated verification
- English and Arabic localization, including RTL support

Customer-facing authorization and checkout endpoints will be introduced or adapted securely when backend integration begins. Privileged cashier and Administrator APIs must not be exposed to public customers.

---

## Getting Started

### Prerequisites

- Node.js 20.9 or later, using a version supported by the installed Next.js release
- npm
- Git

### Local Development

1. Clone the repository.
2. Enter the project directory.
3. Run `npm ci` to install locked dependencies.
4. Run `npm run dev` to start the development server.
5. Open `http://localhost:3000`.

### Quality Checks

- `npx next typegen` generates Next.js route types.
- `npx tsc --noEmit` checks TypeScript.
- `npm run lint` runs ESLint.
- `npm run build` verifies the production build.

Standalone TypeScript checking requires generated Next.js route types.

### Automated Tests

| Layer | Tools | Location | Command |
| ----- | ----- | -------- | ------- |
| Unit and component | Vitest, React Testing Library, jsdom | `tests/unit`, `tests/components` | `npm test` |
| Browser | Playwright (Chromium) | `tests/e2e` | `npm run test:e2e` |

- `npm run typecheck` generates route types and runs the TypeScript check.
- Browser tests run against a production build: run `npm run build` first. Install the browser once with `npx playwright install chromium`.
- Tests use the deterministic fixtures and cover slug generation, lookup, variants, quantity and availability rules, the gallery, quantity and variant controls, cart and wishlist logic (merging, limits, totals, validation of stored data), the cart and wishlist components, checkout validation, demo-order snapshots, storage corruption and unavailability, idempotent submission, the checkout and confirmation components, order sorting, search and lookup, the My Orders and Order Details components, and browser journeys from Homepage to Catalog to Product Detail to Cart and Wishlist, including reload persistence, corrupt storage, cross-tab sync and the 404 for unknown products.
- A GitHub Actions workflow (`.github/workflows/quality.yml`) runs type generation, TypeScript, ESLint, the unit tests, the build and the browser tests on pull requests and pushes to `main`.

---

## Security and Demo Scope

MerchantOS Storefront currently uses fictional retail information and local presentation fixtures. It does not provide live payment processing, real orders, shipments or production customer checkout. The checkout is a simulated, browser-local demo.

Future integrations are intended to enforce:

- Backend-authoritative product prices
- Transactional inventory updates
- Customer-specific access controls
- Secure session management
- Server-enforced checkout idempotency
- Appropriate audit and error handling

The project is intended for development, testing and portfolio demonstrations, not unrestricted public production use.

---

## Related Projects

- [MerchantOS POS](https://github.com/danishirfan21/MerchantOS-POS)
- [MerchantOS Admin](https://github.com/danishirfan21/MerchantOS-Admin)

---

## Project Vision

MerchantOS is intended to demonstrate more than three independent user interfaces.

The long-term engineering objective is a connected retail workflow where a purchase initiated through the Storefront is processed by the shared backend, reflected in inventory, and visible to cashiers and store managers through their respective applications.

**One retail ecosystem. Three frontend architectures. Shared business operations.**
