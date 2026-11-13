# Screen Reference Map

Nine functional pages, each built once and made responsive. Every page has all three references.
Primary visual reference = `screen.png`; implementation guidance = `code.html`; `10-design-guidelines/DESIGN.md` = supporting only (see DESIGN_REFERENCE_INVENTORY.md section 4).
`10-design-guidelines` is not a page and gets no route.

Suggested routes (App Router, `src/app/`): `/`, `/products`, `/products/[slug]`, `/cart`, `/checkout`, `/order-confirmation`, `/wishlist`, `/account/orders`, `/account/orders/[id]`.

Common to all screens: Plus Jakarta Sans + Inter, emerald `#006948` CTAs, `#f8f9ff` canvas, white cards, trust/footer content, SAR currency with 15 % VAT included, Arabic/English bilingual touches. Wording and sample data differ between viewport exports (noted per screen); implement one consistent content set.

---

## 01 Homepage

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/01-homepage/` |
| Tablet | `design-references/tablet/01-homepage/` |
| Mobile | `design-references/mobile/01-homepage/` |

**Shared components:** StorefrontHeader, CategoryNav, HeroCard, PromoCard, CategoryCard, ProductCard/ProductGrid, DealBanner (countdown + claimed progress), TrustStrip, StorefrontFooter, PaymentMethodsStrip, MobileBottomNav.

**Layout differences**
- Desktop: utility bar + 80 px header + category row; trust strip at top; hero card (about 2/3 width) with two image tiles and CTAs beside **two stacked promo cards** (MacBook, Sony); "Shop by Department" row of 7 icon tiles; "Trending Across the Kingdom" 4-column product grid with filter tabs (All Flagships, Mobiles, Computing, Audio & Wearables); light "Deal of the Day" card with countdown boxes and stock bar; two trust bands; 4-column footer.
- Tablet: two-row header; hero card with product render and a right column of two stacked promo cards; trust strip; **dark navy deal banner**; 6 department tiles; 4-column trending grid (compact cards); concierge band; 3-block footer.
- Mobile: one-row header + horizontal category chips; hero card (badges, product image, price, two CTAs); a single compact promo strip; trending as **2 x 2 grid**; deal card; trust 2 x 2; support hotline; payment chips; fixed bottom nav.

**Responsive behaviour to preserve:** promo cards go from side column to a single strip; department tiles become a horizontally scrolling row on mobile; product grid 4 -> 4 -> 2 (3 at mid widths is acceptable); deal banner stacks image under copy on mobile.
**Primary interactions:** search, category navigation, Explore Flagships, Add to Cart, wishlist heart, Claim Deal, department and tab filtering.
**Visual notes / inconsistencies:** hero copy differs ("Flagship Era Unleashed." desktop/mobile vs "Pure Titanium. Zero Compromise." tablet); deal banner colour differs (light desktop, dark navy tablet, light mobile). Pick one. The desktop header logo is a broken image in the PNG.

---

## 02 Product Catalog

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/02-product-catalog/` |
| Tablet | `design-references/tablet/02-product-catalog/` |
| Mobile | `design-references/mobile/02-product-catalog/` |

**Shared components:** StorefrontHeader, Breadcrumb, ActiveFilterChips, ProductFilters, SortSelect, ProductCard, ProductGrid, Pagination / LoadMore, ConciergeBanner, TrustStrip, Footer.

**Layout differences**
- Desktop: breadcrumb + title + "Showing 48 verified models" pill; active-filter chips with Clear All; **sticky left filter sidebar** (about 25 % width, `sticky top-44`: Brand checkboxes with counts, Price min/max, Internal Storage pills, Delivery toggle, "100 % Genuine" note); toolbar (Sort select + grid-density toggle); **4-column** cards; numbered pagination; expert-help band.
- Tablet: title + warranty chip; "Filters (3)" button + Sort select; active chips; **inline expanded filter panel** (price slider, brand pills, storage pills, Express Dispatch toggle); **3-column** large cards with spec snippet and delivery speed; numbered pagination; green concierge banner.
- Mobile: title + count; Filters (3) and Sort buttons; active chips; **2-column** compact cards with short "Add" button; progress "Showing 6 of 48" + **Load More**; concierge card; **bottom-sheet filter drawer** (price slider, brand checkboxes, storage pills, availability toggles, Reset + "Show 48 Results" sticky footer) captured open below the nav in the PNG.

**Grid behaviour:** 2 columns below 768, 3 at 768-1279 (with a collapsible/inline filter panel), 4 columns at `xl` with the sidebar; on `lg` (1024) the sidebar can sit beside a 3-column grid. The filter UI is **one `ProductFilters` component** rendered as sidebar (>= lg), collapsible panel (md) or drawer (< md).
**Primary interactions:** filter/sort, wishlist heart, Add to Cart, pagination vs load-more (pick numbered pagination on >= md and load-more on mobile, or one pattern with URL page params).
**Visual notes:** card spec lines, stock/low-stock indicators ("4 left" red) and badges (2-Yr GCC Warranty, Free Buds, Foldable) are the repeating pattern. Desktop nav "Deals &" label is clipped in the export (overflow bug; ignore). Mobile PNG shows the open drawer as static content; implement as a dismissible overlay.

---

## 03 Product Detail

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/03-product-detail/` |
| Tablet | `design-references/tablet/03-product-detail/` |
| Mobile | `design-references/mobile/03-product-detail/` |

**Shared components:** Breadcrumb, ProductGallery (badges, wishlist/share, thumbnails), ProductPrice (price, strike-through, discount pill, VAT, instalment box), VariantSelector (finish swatches, storage tiles), QuantitySelector, AddToCart, stock/dispatch status, TrustBadges, FrequentlyBoughtTogether, ProductSpecifications, Tabs/Accordion.

**Layout differences**
- Desktop: two-column (gallery about 58 %, purchase panel about 42 %); gallery card with badges, spec strip under the image and 5 thumbnails below; purchase panel: model code, rating, price with "Save 300 SAR", e-tax-invoice note, Tabby/Tamara box, swatches, storage tiles, stock line, quantity + **Add to Cart** + dark **Instant Buy with Apple Pay**, trust trio; full-width Frequently Bought Together strip with bundle total and Add Bundle; **tabs** (Technical Specifications, Overview, Reviews, Shipping) with specs as 2 x 2 grouped tables.
- Tablet: single centered column (about 768 px); back-to-catalog link; **very tall gallery** (about 380 px image area plus captions on 4 thumbnails) above the panel; panel full width; trust trio; FBT; specs as 2 x 2 cards.
- Mobile: full-bleed gallery with pagination dots and back/share/heart overlays; title, rating, price card with instalment box, swatches, storage tiles, stock with dispatch estimate, quantity + Add to Bag, trust trio; FBT with checkboxes ("Add 3 Items"); **accordions** for Specs, Shipping/Warranty, Reviews; **fixed bottom buy bar** (variant summary + price + Add to Bag) above the fixed bottom nav.

**Responsive notes to preserve:** desktop two-column -> stacked; thumbnails below the main image on all sizes; specs tabs -> accordion on mobile; FBT row -> stacked list on mobile.
**Problems to avoid:** (a) tablet gallery is excessively tall, pushing price and Add to Cart far below the fold: cap main image height (for example `max-h` about 60vh / aspect 4:3) and, from `lg`, use the two-column layout; (b) mobile has **three competing fixed/primary controls** (in-page Add to Bag, fixed buy bar, fixed bottom nav). Show the sticky buy bar only when the in-page CTA is out of view, and hide the bottom nav on this page (or stack nav + bar without overlap).
**Primary interactions:** variant selection updates price and SKU, quantity, Add to Cart, Apple Pay (visual only in this phase), wishlist, share, bundle add, tab/accordion open.
**Visual notes:** sample data differs (price breakdown "169 SAR adapter" mobile vs "149 SAR" elsewhere). Gallery hero images in the exports are AI-generated and sometimes show the wrong device.

---

## 04 Shopping Cart

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/04-shopping-cart/` |
| Tablet | `design-references/tablet/04-shopping-cart/` |
| Mobile | `design-references/mobile/04-shopping-cart/` |

**Shared components:** CartItem (thumbnail, badges, brand/meta, QuantitySelector, line price, remove), PromoCodeField, OrderSummary (subtotal, savings, shipping, VAT, grand total), Proceed to Checkout, Continue Shopping, trust/payment strip, ReservationTimer.

**Layout differences**
- Desktop: header with category links and SAR; "Your Shopping Cart (3 items)" with stock-reserved timer; **two columns** (item list about 2/3 with divider rows + promo/gift-card row; **Order Summary** about 1/3, `sticky top-24`) ; benefit cards below; 4-column footer.
- Tablet: centered column; reservation + free-delivery progress banner; item cards (thumbnail, details, qty, price with "SAR" suffix); voucher "Applied" row; **Order Summary stacked below**; trust trio and payment channels.
- Mobile: compact header (back, "Cart", SSL pill, avatar), reservation chip and free-delivery chip; item cards with qty stepper left and price right; promo code; summary; full-width **Proceed to Checkout**; payment logos. No bottom nav.

**Primary CTA:** Proceed to Checkout, inside the summary (desktop sticky side card, tablet/mobile in flow after the summary). Consider a sticky bottom CTA on mobile only if it does not collide with other fixed UI.
**Visual notes:** counts differ (tablet "4 items" vs 3 elsewhere; line-item sample prices identical: 5,199 / 1,149 / 298; subtotal 6,646, savings -150, shipping free, VAT 847.30 included, total 6,496). Quantity control is pill-shaped on tonal background with +/- buttons.

---

## 05 Checkout

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/05-checkout/` |
| Tablet | `design-references/tablet/05-checkout/` |
| Mobile | `design-references/mobile/05-checkout/` |

**Shared components:** **CheckoutHeader (simplified: logo, SSL pill, back link; no category nav, no bottom nav, minimal footer)**, CheckoutStepper (Cart - Checkout - Confirmation), numbered form sections (Contact, Delivery Address, Payment), Input/Select/Checkbox, DeliverySelector (Express Free / Scheduled), PaymentMethodSelector (Card, Apple Pay, Cash on Delivery) with card fields, OrderSummary, Place Order button, trust trio.

**Layout differences**
- Desktop: header with SSL pill and "Return to Bag"; inline stepper; **two columns** (forms about 60 %, **sticky summary** about 40 %: item rows, subtotal/voucher/shipping, total, Place Order, terms, trust trio); delivery options side by side; payment as radio list with the card form revealed under "Card Payment".
- Tablet: centered stepper card; two columns again (forms + summary with coupon "Applied" row); payment as **three tile selectors** (Mada/Card, Apple Pay, Pay on Delivery) then the card form; Place Order in summary.
- Mobile: back + "Secure Checkout" header; compact stepper; **collapsed "Order Overview - 3 items, 6,496 SAR - Details"**; stacked sections; delivery options stacked; payment as radio cards; **bottom block with Grand Total + Place Order**.

**Preserve:** simplified checkout navigation (no catalog nav, no footer links); numbered sections; summary always reachable (sticky side card on desktop, collapsed overview + bottom total on mobile).
**Primary CTA:** Place Order (6,496 SAR) with lock icon.
**Visual notes / inconsistencies:** COD fee differs (SAR 20 desktop/mobile vs +15 tablet); order items differ (tablet lists two different products and "TECHVIP150"); a "Simulated prototype checkout" notice appears in desktop; prefilled card number/CVV fields are mock data. Do not carry prototype copy or raw card collection into production; card data entry should come from a payment provider's hosted fields (decision for the payment milestone).

---

## 06 Order Confirmation

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/06-order-confirmation/` |
| Tablet | `design-references/tablet/06-order-confirmation/` |
| Mobile | `design-references/mobile/06-order-confirmation/` |

**Shared components:** CheckoutHeader (simplified), SuccessHeader (check badge, headline, thank-you copy), OrderMeta strip (reference, timestamp, ETA), OrderStatus pill, FulfillmentProgress (4 steps), OrderItemRow, PriceBreakdown, AddressCard, PaymentSummaryCard, action buttons, SupportCard.

**Layout differences**
- Desktop: centered single column (about 1000 px): check badge, "Your Order Is Confirmed", metadata card (reference, placed, arrival, status pill); **two columns**: ordered items + totals on the left; shipping destination, settlement method, compact fulfilment progress ("Step 2 of 4") on the right; three actions (Continue Shopping primary, Track Live Shipment, Tax Invoice PDF); trust trio.
- Tablet: stacked cards: success card with metadata strip; **Dispatch Pipeline** (4 steps, horizontal); package contents; delivery address + payment settled side by side; actions; help card.
- Mobile: stacked: confirmation card, fulfilment status (4-step compact), package contents with subtotal rows, shipping destination, payment settled, full-width **Track Live Shipment** + Download Tax Invoice + Continue link, help card.

**Primary CTA:** Track Live Shipment / Continue Shopping (desktop makes Continue Shopping primary; tablet and mobile make Track primary; choose one: recommend Track primary, Continue secondary).
**Visual notes:** order reference `#MOS-89421-KSA`, total 6,496 SAR consistent; tablet items show different unit prices (1,099 / 198) than desktop/mobile (1,149 / 298). Sample date "24 Oct 2024" vs footer "(c) 2025".

---

## 07 Wishlist

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/07-wishlist/` |
| Tablet | `design-references/tablet/07-wishlist/` |
| Mobile | `design-references/mobile/07-wishlist/` |

**Shared components:** Breadcrumb, page title with "4 items saved" badge, WishlistProductCard (image, heart toggle, status badge, brand, title, spec, price, stock status, Add to Cart, Remove), "Move All to Cart" action, trust band, footer.

**Layout differences**
- Desktop: title row with **Explore More Tech** and **Move All In Stock to Cart** buttons; **4-column** grid of cards (image well, brand, title, short spec, price + stock chip, Add to Cart, text "Remove"); guarantee band; trust strip; full footer.
- Tablet: centered column; title + "Cloud Synced" chip; "All Ready to Ship - 4 eligible items" bar with Move All to Cart + Explore More; **2-column** large-image cards; benefit trio.
- Mobile: title + share icon; ready-to-ship bar with Move All to Cart; **2-column** compact cards with a tonal **Remove** button; "Looking for more tech?" card; guarantee list; bottom nav (Wishlist active).

**Primary interaction:** Add to Cart per item and Move All; remove; heart toggles off. Bulk action moves to a bar under the title below `lg`.
**Visual notes:** product images in tablet/mobile PNGs include screenshots of the design (wrong content); card layout is the same as the catalog `ProductCard` with the action pair swapped (Add to Cart + Remove). Reuse the same card with a `variant`.

---

## 08 My Orders

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/08-my-orders/` |
| Tablet | `design-references/tablet/08-my-orders/` |
| Mobile | `design-references/mobile/08-my-orders/` |

**Shared components:** AccountBreadcrumb, page header, OrderFilterTabs (All, In Transit, Delivered, Processing with counts), OrderSearch, OrderCard (meta + status + progress + items + actions), StatusBadge, "older orders" archive banner, footer / bottom nav.

**Layout differences**
- Desktop: header with account nav (My Orders active, My Wishlist); breadcrumb and page title with order-questions card; filter tabs + search; **dense cards**: top meta row (Order Placed, Total, Ship To / Payment, order ref), status row with ETA, **progress bar with latest scan**, item mini-cards in a row, and a **right action column** (View Tracking / Download Invoice / Buy Again / View Details / Help); archive banner; trust strip; footer.
- Tablet: search + filter pills in one card; each order card has a **header band** (ref, badge, total), status/ETA block, progress bar, item cards, and an actions row at the bottom right (Download Invoice + View Tracking).
- Mobile: title with "1 Active" badge; search; horizontally scrolling filter pills; **compact cards**: ref + total, placed date, coloured status block, **3-item thumbnail strip with "1x" badges**, two full-width buttons; assistance card; bottom nav (Orders active).

**Primary actions per status:** In Transit -> View Tracking; Delivered -> Buy Again / View Details; Processing -> View Order / Help.
**Order-card density:** desktop high (all metadata inline), tablet medium, mobile low (thumbnails only, details behind View Order). Same `OrderCard` with responsive layout.
**Visual notes:** totals consistent (6,496 / 8,499 / 3,298); item pricing in the tablet export differs slightly (1,129 and 168 SAR vs 1,149 / 298).

---

## 09 Order Details & Tracking

| Viewport | Reference |
|---|---|
| Desktop | `design-references/desktop/09-order-details-tracking/` |
| Tablet | `design-references/tablet/09-order-details-tracking/` |
| Mobile | `design-references/mobile/09-order-details-tracking/` |

**Shared components:** Breadcrumb (Home > My Orders > Order #...), OrderHeader (ref, placed date, status badge), **OrderTrackingTimeline** (4 steps: Order Placed, Processing, In Transit, Delivered), EstimatedArrival banner with tracking/waybill code + copy, OrderItemRow list, PaymentBreakdown, AddressCard, PaymentMethodCard, OrderActions (Download Tax Invoice, Track Courier, Chat with Concierge).

**Layout differences**
- Desktop: breadcrumb, title "Order Details & Tracking" with order ref and Back to My Orders; **full-width horizontal timeline** card with an ETA banner and tracking code; **two columns**: left = items (3) + payment breakdown with total; right = delivery address, payment method, order actions.
- Tablet: centered column; header card with status badges; horizontal timeline with courier info and assigned courier avatar; two columns (items + payment summary / delivery destination with **map tile**, payment method, actions).
- Mobile: back + "My Orders" + "LIVE DISPATCH"; order reference card; **green arrival card with waybill and Copy button**; **vertical timeline** ("Step 3 of 4", current step expanded with courier detail); package contents, delivery destination, payment summary, then full-width **Track Courier Vehicle Live** and Download ZATCA invoice, help card; bottom nav (Orders active).

**Responsive behaviour to preserve:** horizontal timeline (>= md) vs vertical timeline (< md), same data and step states; items and totals stay together; delivery/payment cards move beneath items on mobile; actions become full-width buttons at the end on mobile.
**Visual notes:** voucher code, courier name and item prices vary by viewport; map tile in tablet needs a map provider decision (or a static placeholder).

---

## Cross-screen consistency matrix

| Element | Desktop | Tablet | Mobile |
|---|---|---|---|
| Main nav | utility bar + search row + category row | two rows (search + tabs) | one row + bottom tab bar |
| Focus header (checkout / confirmation) | logo, SSL pill, back link | same | back arrow + title |
| Footer | 4 columns | 3 blocks | 3 blocks |
| Product grid | 4 | 3-4 | 2 |
| Summary (cart/checkout) | sticky side card | stacked / side card (checkout) | stacked / collapsed overview |
| Timeline | horizontal | horizontal | vertical |
