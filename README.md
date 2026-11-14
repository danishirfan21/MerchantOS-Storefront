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

The application foundation, responsive Homepage and Product Catalog are implemented.

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
- Responsive design tokens and typography

The Homepage and Catalog have been browser-checked at desktop, tablet and mobile sizes, down to 320px. TypeScript, ESLint and the production build pass.

Product imagery currently uses temporary placeholders. Product links, cart actions and backend integrations are not yet implemented, and their controls are shown as disabled.

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
3. **Product Detail:** Image galleries, specifications and variants.
4. **Shopping Cart:** Product selection, quantities and totals.
5. **Checkout:** Customer details, delivery information and simulated payment.
6. **Order Confirmation:** Purchase summary and confirmation.
7. **Wishlist:** Saved products and shopping actions.
8. **My Orders:** Customer purchase history.
9. **Order Details & Tracking:** Order information and fulfillment status.

The development strategy uses deterministic fictional fixtures before introducing secure backend integration. Planned capabilities are not presented as completed functionality.

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

---

_MerchantOS Storefront is an independent software engineering portfolio project, currently under active development._
