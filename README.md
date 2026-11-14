# MerchantOS Storefront

### Premium Ecommerce. Connected Retail Engineering.

**MerchantOS Storefront** is a modern, responsive electronics ecommerce application built with **Next.js, React, TypeScript and Tailwind CSS**.

It is the customer-facing experience of the MerchantOS retail ecosystem, alongside an Angular-based Point of Sale application and an ASP.NET Core management platform.

The goal is to connect product discovery, online shopping, inventory and order management through a unified retail backend.

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

Storefront is the third application, with future integration into the existing ASP.NET Core API and PostgreSQL database.

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
| Planned backend integration | ASP.NET Core 10 Web API                       |
| Shared retail database      | PostgreSQL 17, through backend services       |

The application uses reusable React components, semantic design tokens and responsive layouts to maintain consistent interfaces across devices.

---

## Current Implementation

The application foundation, responsive Homepage, Product Catalog, Product Detail, Shopping Cart and Wishlist are implemented, with an automated test suite.

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

Product imagery currently uses temporary placeholders (see Known limitations). Checkout, accounts and backend integrations are not implemented; the checkout button is shown disabled.

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

## Planned Customer Experience

The Storefront is being developed around nine core customer-facing pages:

1. **Homepage:** Flagship products, departments and promotions. _Implemented._
2. **Product Catalog:** Product search, filtering and sorting. _Implemented._
3. **Product Detail:** Image galleries, specifications and variants. _Implemented._
4. **Shopping Cart:** Product selection, quantities and totals. _Implemented._
5. **Checkout:** Customer details, delivery information and simulated payment.
6. **Order Confirmation:** Purchase summary and confirmation.
7. **Wishlist:** Saved products and shopping actions. _Implemented._
8. **My Orders:** Customer purchase history.
9. **Order Details & Tracking:** Order information and fulfillment status.

The development strategy uses deterministic fictional fixtures before introducing secure backend integration. Planned capabilities are not presented as completed functionality.

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
- Checkout, authentication and any backend integration are deferred.
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
Functional: add, merge, change quantity, remove, wishlist save and remove, move to cart, header counts, persistence, empty states. Deferred: checkout, payments, accounts, promotion codes, shipping and tax, order history, live stock, and anything server-side.

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
- Tests use the deterministic fixtures and cover slug generation, lookup, variants, quantity and availability rules, the gallery, quantity and variant controls, cart and wishlist logic (merging, limits, totals, validation of stored data), the cart and wishlist components, and browser journeys from Homepage to Catalog to Product Detail to Cart and Wishlist, including reload persistence, corrupt storage, cross-tab sync and the 404 for unknown products.
- A GitHub Actions workflow (`.github/workflows/quality.yml`) runs type generation, TypeScript, ESLint, the unit tests, the build and the browser tests on pull requests and pushes to `main`.

---

## Security and Demo Scope

MerchantOS Storefront currently uses fictional retail information and local presentation fixtures. It does not provide live payment processing or production customer checkout.

Future integrations are intended to enforce:

- Backend-authoritative product prices
- Transactional inventory updates
- Customer-specific access controls
- Secure session management
- Checkout idempotency
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
