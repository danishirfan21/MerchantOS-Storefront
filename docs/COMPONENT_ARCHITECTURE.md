# Component Architecture

Recommendation only; no component code exists yet. Derived from repeated patterns in the 27 exports.
Locations follow the existing folder structure (`src/components/*`, `src/features/*`, `src/lib/*`, `src/stores/*`).

## 1. Principles

1. **One component, CSS-responsive.** Do not build desktop/tablet/mobile variants of the same thing. Use Tailwind mobile-first classes and container queries.
2. **Server Components by default** (App Router). Add `"use client"` only for state, effects, browser APIs or event handlers.
3. **Presentational components in `src/components`, domain logic in `src/features`.** Components receive data via props; features own data shaping, selectors and actions.
4. **Few, composable primitives** rather than many one-off components. A component exists only if it repeats in at least two screens or encapsulates real behaviour.
5. No new libraries are assumed here. (shadcn/ui, Zustand, React Hook Form, Zod are later decisions per the project brief.)

## 2. Component inventory (based on actual repetition)

Repetition counts refer to the nine screens across the three exports.

### 2.1 Layout (`src/components/layout`, `src/components/navigation`)

| Component | Used on | Type | Notes |
|---|---|---|---|
| `StorefrontHeader` | 01, 02, 03, 07, 08, 09 (and 04 desktop/tablet) | Server shell + client islands | Logo, search, wishlist/cart/account icons. Utility bar and category nav render at >= lg; tablet two-row arrangement via CSS. Cart badge and account menu are small client components. |
| `CategoryNav` | same | Server | Text tabs with active underline; horizontally scrollable on small screens. |
| `MobileBottomNav` | 01, 02, 03, 07, 08, 09 (< md only) | Client (active route via `usePathname`) | 5 tabs: Home, Catalog, Wishlist, Orders, Account. Hidden at `md` and above; hidden on PDP/checkout/cart/confirmation. |
| `CheckoutHeader` | 05, 06 (cart mobile uses a back-arrow variant) | Server | Logo, SSL pill, back link. Replaces the main header on the checkout route group. |
| `StorefrontFooter` | all non-checkout pages | Server | Responsive columns (4 -> 3 blocks), `PaymentMethodsStrip`, legal row. A minimal variant for cart/checkout/confirmation. |
| `ResponsiveContainer` | everywhere | Server | `max-w` + responsive inline padding. Replaces per-page `max-w-7xl px-6 lg:px-12` / `px-margin-sm`. |
| `PageHeader` | 02, 04, 07, 08, 09 | Server | Title, count badge, subtitle, optional actions slot, `Breadcrumb`. |

Route groups to separate shells: `(shop)` for header+footer+bottom nav; `(checkout)` for `CheckoutHeader` + minimal footer. This is how the "simplified checkout navigation" is preserved.

### 2.2 Products (`src/components/products`)

| Component | Used on | Type | Notes |
|---|---|---|---|
| `ProductCard` | 01, 02, 07 | Server (heart + add-to-cart as client islands) | One card, props for `variant: "catalog" \| "wishlist" \| "compact"` (action pair differs: Add to Cart vs Add to Cart + Remove). Title, badges, price stack, stock line, optional instalment line. |
| `ProductGrid` | 01, 02, 07 | Server | 2 / 3 / 4 column grid by breakpoint. |
| `ProductPrice` | cards, PDP, cart, summary | Server | Price + strike-through + discount pill + "SAR" suffix + VAT note. |
| `ProductBadge` / `Badge` | all | Server | Tinted pills (shared UI). |
| `StockStatus` | cards, PDP, wishlist | Server | In stock / low stock / dispatch hub. |
| `ProductGallery` | 03 | Client (thumbnail selection, swipe) | Main image with height cap, thumbnails, dots on mobile, badges/wishlist/share overlay. |
| `VariantSelector` | 03 | Client | Swatch group + storage tile group (radiogroup semantics). Drives price/SKU. |
| `ProductPurchasePanel` | 03 | Client | Composes price, variants, quantity, stock, CTAs. |
| `StickyBuyBar` | 03 (mobile) | Client | Appears when the main CTA scrolls out of view (IntersectionObserver). |
| `FrequentlyBoughtTogether` | 03 | Client (checkbox bundle total) | |
| `ProductSpecifications` | 03 | Server | Grouped definition lists; tabs on >= md, accordion below (see `Tabs`/`Accordion`). |
| `ProductFilters` | 02 | Client | **Single component**: sidebar (>= lg), inline panel (md), drawer (< md). Filter state lives in the URL (`searchParams`). |
| `ActiveFilterChips`, `SortSelect`, `Pagination`/`LoadMore` | 02 | Client where interactive | URL-driven. |
| `CategoryCard` / `CategoryGrid` | 01 | Server | |
| `PromoCard`, `HeroCard`, `DealBanner` | 01 | Server (`DealBanner` countdown is a small client island) | Homepage-specific; keep in `src/features/catalog` or `components/products` homepage subfolder, not generic UI. |

### 2.3 Cart and checkout (`src/components/cart`, `src/components/checkout`)

| Component | Used on | Type | Notes |
|---|---|---|---|
| `CartItem` | 04, 05 (compact), 06 (read-only) | Client in cart (quantity/remove); read-only variant is server | One component with `mode: "editable" \| "summary"`. |
| `QuantitySelector` | 03, 04 | Client | Shared UI. |
| `PromoCodeField` | 04, 05 | Client | |
| `OrderSummary` | 04, 05, 06, 09 | Server (pure) | Rows: subtotal, savings, shipping, VAT (included), grand total. Props decide whether CTA slot renders. |
| `CartReservationNotice` / free-delivery progress | 04 | Client (timer) | |
| `CheckoutStepper` | 05, 06 | Server | |
| `CheckoutSection` | 05 | Server | Numbered section card with title and status chip. |
| `DeliverySelector`, `PaymentMethodSelector` | 05 | Client | Radio-card pattern (shared `OptionCard`). |
| `AddressForm`, `ContactForm` | 05 | Client | Fields built from shared `Input`/`Select`. |
| `PlaceOrderBar` | 05 (mobile bottom) | Client | Total + CTA. |
| `TrustStrip`, `PaymentMethodsStrip` | many | Server | Data-driven (wording lives in one place). |

### 2.4 Orders and account (`src/components/orders`, `src/features/customer-account`)

| Component | Used on | Type | Notes |
|---|---|---|---|
| `OrderCard` | 08 | Server (actions are links/buttons) | Responsive density (desktop dense, mobile compact thumbnails). |
| `OrderStatus` (badge) | 06, 08, 09 | Server | Processing / In Transit / Delivered etc. |
| `OrderFilterTabs`, `OrderSearch` | 08 | Client | URL-driven. |
| `OrderTrackingTimeline` | 06 (compact), 09 | Server | One component; horizontal at >= md, vertical below, via CSS. Step states: complete / current / pending. |
| `OrderItemRow` | 06, 09, 08 | Server | |
| `AddressCard`, `PaymentMethodCard`, `OrderActions` | 06, 09 | Server | |
| `WishlistButton` | cards, PDP | Client | Heart toggle (optimistic). |
| `EstimatedArrival` banner with copy | 09 | Client (copy) | |

### 2.5 Shared UI (`src/components/ui`)

`Button` (variants: primary, dark, tonal, outline, ghost, icon; sizes), `Input`, `Select`, `Checkbox`, `Radio`, `Switch`, `OptionCard`, `Badge`, `Chip`, `Breadcrumb`, `Tabs`, `Accordion`, `Drawer` (bottom sheet / side panel), `Dialog`, `Toast`, `Icon` wrapper, `ProgressBar`, `Skeleton`. These are thin and token-driven. Build only what the first milestone needs (see IMPLEMENTATION_READINESS.md).

## 3. Server versus Client Components

| Server (default) | Client (`"use client"`) |
|---|---|
| Page shells, header/footer markup, `ProductGrid`, `ProductCard` shell, `ProductPrice`, `OrderSummary`, `OrderCard`, `OrderTrackingTimeline`, `Breadcrumb`, `PageHeader`, `TrustStrip`, specs lists | `MobileBottomNav` (route), `ProductFilters`, `ProductGallery`, `VariantSelector`, `QuantitySelector`, `WishlistButton`, add-to-cart button, `PromoCodeField`, checkout forms and selectors, `Drawer`/`Dialog`/`Toast`, countdown, `StickyBuyBar`, copy-to-clipboard, header cart badge |

Rule: keep client boundaries as small leaf "islands" inside server-rendered cards and pages so product lists stay server-rendered and SEO-friendly.

## 4. Shared state

| State | Where | Notes |
|---|---|---|
| Catalog filters, sort, page, order-status filter | URL `searchParams` | Shareable, server-readable, no store needed |
| Cart (items, quantity, promo) | client store (`src/stores`) persisted locally, later reconciled with the backend | Header badge, cart page, PDP "added" feedback, checkout summary all read it |
| Wishlist (saved product ids) | client store (`src/stores`), later backend | Hearts across cards, wishlist page count, header badge |
| Checkout form | local form state within the checkout route | Persist draft only if required |
| UI state (drawer open, toast, tab) | local component state | Avoid global |
| Server data (products, orders) | fetched in Server Components via `src/lib/api` | Fixtures first (`src/lib/fixtures`), no POS backend in this phase |

Store library choice is deferred to the implementation milestone; the architecture only requires that cart and wishlist be client-accessible and persistable.

## 5. Reusability strategy

- **Feature folders**: `src/features/catalog` (filters, queries, product mapping), `cart`, `wishlist`, `checkout`, `customer-account` own types, selectors, actions, formatting of domain data and compose the generic components.
- **Formatting** in `src/lib/formatting`: SAR currency, dates ("24 Oct 2024, 14:35 AST"), VAT-included display, order references.
- **Content that repeats** (trust bullets, payment methods, delivery promises, footer links) is data-driven from one source so copy and counts never diverge across pages (the exports show these diverging).
- **Variants over forks**: `ProductCard` variants, `OrderSummary` modes, `CartItem` modes, `CheckoutHeader` instead of a second layout tree.
- **Design tokens** live in `src/styles` (CSS variables / `@theme`), consumed by every component; no raw hex in components.

## 6. Responsive component strategy

| Component | Technique |
|---|---|
| Header | CSS: utility bar and category row `hidden lg:block`/`flex`; tablet's two-row look via flex-wrap/`md:` classes; search collapses to an icon on mobile |
| `ProductGrid` | `grid-cols-2 md:grid-cols-3 xl:grid-cols-4` (catalog with sidebar uses fewer columns at `lg`) |
| `ProductFilters` | one component; CSS decides sidebar vs panel; below `md` it renders inside `Drawer` (client toggle) |
| `ProductGallery` | height-capped main image, thumbnails scroll horizontally; dots on touch |
| PDP panel | two-column grid at `lg`, stacked otherwise; `Tabs` at `md+`, `Accordion` below (same content, two presentations, `hidden`/`md:block`) |
| `OrderSummary` | sticky side column at `lg` (`lg:sticky`), stacked below; checkout mobile adds a collapsible overview |
| `OrderTrackingTimeline` | `flex-col` below `md`, `flex-row` from `md`; connectors rotate with the same markup |
| `OrderCard` | CSS grid regions rearrange; meta row collapses, item chips become thumbnails |
| Bottom nav / sticky bars | `md:hidden` and fixed positioning with safe-area padding; coordinate z-index and spacing tokens so bars never stack on top of each other |
| Container queries | use `@container` for card internals (e.g. `ProductCard` in 2- vs 4-column grids) so cards adapt to their own width |

Avoid hard-coding 390 / 768 / 1440. Use fluid containers and the breakpoints from DESIGN_SYSTEM.md section 3.4.
