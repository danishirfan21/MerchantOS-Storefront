# Implementation Readiness

Assessment of the Stitch reference library before frontend work begins. Verified 2026-11-13.

## 1. Reference completeness

| Check | Result |
|---|---|
| Viewport folders | 3 of 3 |
| Application screens at every viewport | **27 of 27** (9 screens x 3), each with `code.html` and `screen.png` |
| Reference folders | 30 (27 screens + 3 guideline folders) |
| `code.html` files | 27 (all screens) |
| `screen.png` files | 27 (all screens) |
| Guideline folders | 3, each containing one `DESIGN.md` (identical across viewports) instead of `code.html`/`screen.png` |
| Unreadable or empty files | none |
| Screen naming consistent across viewports | yes |

The brief expected 30 HTML + 30 PNG; the three guideline folders hold a `DESIGN.md` only. That is not a gap for implementation: the nine approved screens are complete at all three sizes.

## 2. Decisions that are already clear

- Nine functional pages, built once, responsive (not 27).
- Palette: the `#006948` emerald family on a `#f8f9ff` canvas with white cards and blue-tinted supporting surfaces; error red `#ba1a1a`.
- Typography: Plus Jakarta Sans (display/headline/price) + Inter (body/label), 15-token type scale.
- Spacing/radius/shadow language (card: 12-16 px radius, soft low shadow, tonal image wells).
- Shared header/footer/bottom-nav pattern; **simplified header for checkout and confirmation**.
- Catalog filter model: sidebar -> filter bar/panel -> bottom-sheet drawer.
- Product grid: 2 / 3 / 4 columns; wishlist 2 / 4.
- Order tracking: 4 steps, horizontal on larger screens, vertical on mobile.
- Currency and tax display: SAR, 15 % VAT included, total emphasised.
- Component set and Server/Client split (COMPONENT_ARCHITECTURE.md).

## 3. Inconsistencies to normalize (not blockers)

| # | Inconsistency | Proposed resolution |
|---|---|---|
| 1 | `DESIGN.md` prose palette (`#059669`, slate) contradicts tokens and screens | Use token palette from screens; ignore prose hex values |
| 2 | `DESIGN.md` radius scale vs tailwind config in HTML | Use the 4/8/12/16 px scale from DESIGN_SYSTEM.md |
| 3 | Desktop PNGs render serif headings; HTML specifies Plus Jakarta Sans | Plus Jakarta Sans everywhere |
| 4 | `DESIGN.md` says desktop >= 1280; desktop exports switch at 1024 | `md` 768, `lg` 1024 layouts, `xl` 1280 wide |
| 5 | Max width 1440 vs 1280 | 1280 container (revisit if hero art needs more) |
| 6 | Different header heights per page and per viewport | One header system with fixed height tokens per breakpoint |
| 7 | Different footers per viewport (4-column vs 3-block) | Responsive footer, one content source |
| 8 | Sample content differs across viewports (hero copy, deal banner theme, item lists/prices, COD fee 20 vs 15, "3 vs 4 items", voucher codes) | Use one fixture dataset (cart 6,646 - 150 = 6,496; VAT 847.30) |
| 9 | Micro text 9-10 px | Raise to the 11 px minimum |
| 10 | PDP: very tall tablet gallery; mobile has duplicate/competing sticky controls | Cap gallery height; sticky buy bar only when needed; hide bottom nav on PDP |
| 11 | Tertiary/primary near-duplicates, no success/warning tokens | Merge; add `warning` only |
| 12 | Prototype copy ("Simulated prototype checkout", "Prototype storefront") | Remove |
| 13 | Order confirmation primary CTA differs by viewport | Track Live Shipment primary, Continue Shopping secondary |
| 14 | Desktop nav label clipped ("Deals &"), logo images broken in PNGs | Layout bugs in exports; ignore |

## 4. Assets requiring attention

| Asset | Status | Action before faithful visuals |
|---|---|---|
| Product photography | 132 unique AI-generated Stitch URLs on `lh3.googleusercontent.com`; some show screenshots of the designs; unlicensed and possibly expiring | Obtain real product images (or neutral placeholders) |
| Logo | Image URL broken in desktop PNGs; text+icon wordmark elsewhere | Receive real logo/wordmark; interim: icon + text |
| Payment brand logos (mada, Visa, Mastercard, Apple Pay, Tabby, Tamara) | Drawn as styled text | Source official artwork per brand guidelines |
| Material Symbols | Remote Google font; 145 distinct glyphs | Choose: self-hosted subset or icon library |
| Inter / Plus Jakarta Sans | Remote Google Fonts | Self-host via `next/font` |
| Map tile (tracking) | Remote image | Static placeholder or a provider decision |
| Avatar | Remote image | Initials fallback |
| Tailwind CDN | Prototype runtime | Not used; project Tailwind 4 build |

No external asset was downloaded or copied during this analysis.

## 5. Blockers

**No major blockers.** The designs are complete, consistent enough, and sufficient to start building the shell and shared components.

Items that need a decision but do not block the first milestone:

1. Icon strategy (subset of Material Symbols vs another icon set).
2. Real brand logo and product imagery supply.
3. RTL/Arabic scope: the exports are English-only (`lang="en"`, no `dir`), with Arabic present only as isolated labels. The architecture should use logical CSS properties now; full RTL layouts are not designed in the references.
4. Payment data collection approach (hosted provider fields) before building the checkout payment step; the references show raw card fields as mock data.
5. Map provider for tracking (can use a static tile initially).

## 6. Recommended scope for the first UI implementation milestone

**Milestone 1: Foundation + shared shell + catalog slice**

1. Design tokens in `src/styles` (CSS variables / Tailwind 4 `@theme`) from DESIGN_SYSTEM.md; fonts via `next/font`.
2. Layout shell: `ResponsiveContainer`, `StorefrontHeader`, `CategoryNav`, `StorefrontFooter`, `MobileBottomNav`; route groups `(shop)` and `(checkout)` with `CheckoutHeader`.
3. Shared UI primitives actually needed: `Button`, `Input`, `Select`, `Checkbox`, `Badge`, `Chip`, `Breadcrumb`, `Drawer`, `QuantitySelector`.
4. Fixtures in `src/lib/fixtures` (products, categories, one consistent cart/order dataset) and SAR/date formatting helpers.
5. **Homepage** and **Product Catalog** (`ProductCard`, `ProductGrid`, `ProductFilters` with the three presentations, sort, pagination).
6. Verification at 390, 768, 1024 and 1440 widths plus in-between sizes (not only the three reference sizes).

Follow-up milestones, in order: Product Detail -> Cart (+ cart/wishlist stores) -> Checkout and Confirmation -> Wishlist -> My Orders and Order Details/Tracking.

## 7. Overall assessment

**Ready to start frontend implementation.** The reference set is complete for all nine approved screens, the design system is extractable and largely consistent, and the inconsistencies found are the normal result of generating three viewport exports separately.
