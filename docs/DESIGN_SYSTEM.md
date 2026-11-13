# MerchantOS Storefront - Unified Design System

Derived from all 27 approved screen references (HTML + PNG) and the shared `DESIGN.md`.
**Observed** = found in the exports. **Recommended** = normalized value for implementation.
Precedence: approved screens + embedded Tailwind config > `DESIGN.md` front matter > `DESIGN.md` prose (see DESIGN_REFERENCE_INVENTORY.md section 4).

## 1. Colour

The tailwind config in all 27 HTML files is the same Material-3-style token set, and it equals the `DESIGN.md` front matter. Usage counts below are class occurrences across all 27 files.

### 1.1 Observed core tokens

| Role | Token | Hex | Observed use |
|---|---|---|---|
| Primary emerald | `primary` | `#006948` | CTAs, links, active nav, prices (1,217 uses; the only hex repeated in body markup) |
| Secondary emerald (hover / fill) | `primary-container` | `#00855d` | `hover:bg-primary-container` (58), gradients, brand tiles |
| Emerald tint (badges, success chips) | `primary-fixed` | `#85f8c4` | badges, progress, "free" pills (67) |
| Emerald on dark | `primary-fixed-dim` / `inverse-primary` | `#68dba9` | dark-banner accents (deal of the day) |
| Text on emerald | `on-primary` | `#ffffff` | 292 |
| Primary text | `on-surface` | `#0b1c30` | 1,281 |
| Secondary text | `on-surface-variant` | `#3d4a42` | 839 |
| Muted text/placeholder/icons | `outline` | `#6d7a72` | 127 |
| Secondary slate | `secondary` | `#565e74` | meta text, supporting labels (389) |
| Background | `surface` / `background` | `#f8f9ff` | page canvas |
| Cards | `surface-container-lowest` | `#ffffff` | 580 |
| Supporting surface | `surface-container-low` | `#eff4ff` | image wells, info strips, inputs (526) |
| Supporting surface (stronger) | `surface-container` | `#e5eeff` | 206 |
| Selected/pressed surface | `surface-container-high` / `-highest` | `#dce9ff` / `#d3e4fe` | 62 / 17 |
| Border / divider | `outline-variant` | `#bccac0` | almost always with opacity (`/20`-`/50`), 189 |
| Secondary container | `secondary-container` | `#dae2fd` | cool-blue chips (11) |
| Dark surface | `inverse-surface` | `#213145` | deal banner, dark buttons (14) |
| Error | `error` / `error-container` / `on-error-container` | `#ba1a1a` / `#ffdad6` / `#93000a` | discounts, low stock, delete (73/26/10) |
| Warning | Tailwind default `amber-500` | `#f59e0b` | only 8 uses, **no token exists** |
| Success | (none) | - | success = `primary` / `tertiary` family |

### 1.2 Near-duplicates to merge

| Group | Values | Note |
|---|---|---|
| Emerald primary | `primary #006948`, `tertiary #006947`, `surface-tint #006c4a` | one pixel apart; treat as one colour |
| Emerald container | `primary-container #00855d`, `tertiary-container #00855b` | merge |
| Emerald light | `primary-fixed #85f8c4`, `tertiary-fixed #6ffbbe`; `primary-fixed-dim #68dba9`, `tertiary-fixed-dim #4edea3` | keep primary-fixed pair only |
| Cool container | `secondary-container #dae2fd` = `secondary-fixed #dae2fd` = `surface-container-high`-adjacent | identical hex, one token |
| Blue-grey surfaces | `surface-variant #d3e4fe` = `surface-container-highest #d3e4fe` | identical hex, one token |
| Ink on surface | `on-surface #0b1c30` = `on-background #0b1c30` | identical |
| Bright/base | `surface #f8f9ff` = `surface-bright #f8f9ff` = `background #f8f9ff` | identical |

### 1.3 Interaction and state colours (observed)

| State | Observed |
|---|---|
| Hover (text) | `hover:text-primary` (201), `hover:text-on-surface` (214), `hover:text-error` (50, delete/remove) |
| Hover (surface) | `hover:bg-surface-container-low` (93), `hover:bg-surface-container` (47), `hover:bg-surface-container-high` (19) |
| Hover (primary button) | `hover:bg-primary-container` (58) |
| Hover (card) | `hover:shadow-md` (52), `hover:scale-105` (41, images/icon buttons), `hover:scale-[1.02]` |
| Selected | filled chip `bg-primary text-on-primary`; selected option cards use `border-primary` (2 px) on a `primary-fixed`/`surface-container-low` tint; checked boxes `primary` |
| Focus | `focus:outline-none` (61) + `focus:ring-2 focus:ring-primary` (10) or `focus:shadow-[0_0_0_2px_#006948]` (11); search wrapper `focus-within:ring-2 ring-primary/40` |
| Success | emerald text/pill on `primary-fixed`/`surface-container-low` |
| Warning | amber-500 (rare) |
| Error | `error` text on `error-container` pill; "Only N left"/discount |

### 1.3b DESIGN.md prose colours (not adopted)

`#059669`, `#10B981`, `#047857`, `#0F172A`, `#334155`, `#64748B`, `#E2E8F0`, `#F8FAFC`, `#ECFDF5`, `#E11D48`, `#D97706` appear **only** in the prose of `DESIGN.md` and in no screen. Do not use as brand colours. `#D97706` could inform a warning token only if a real amber is needed (see 1.4).

### 1.4 Recommended semantic tokens (normalized)

Keep the observed hex values; add only what is genuinely missing.

| Semantic token | Value | Maps from |
|---|---|---|
| `--color-brand` | `#006948` | primary / tertiary / surface-tint |
| `--color-brand-hover` | `#00855d` | primary-container |
| `--color-brand-soft` | `#85f8c4` | primary-fixed (badges, progress) |
| `--color-brand-on` | `#ffffff` | on-primary |
| `--color-brand-on-dark` | `#68dba9` | primary-fixed-dim |
| `--color-text` | `#0b1c30` | on-surface |
| `--color-text-muted` | `#3d4a42` | on-surface-variant |
| `--color-text-subtle` | `#6d7a72` | outline |
| `--color-text-slate` | `#565e74` | secondary |
| `--color-bg` | `#f8f9ff` | surface |
| `--color-card` | `#ffffff` | surface-container-lowest |
| `--color-surface-1` | `#eff4ff` | surface-container-low |
| `--color-surface-2` | `#e5eeff` | surface-container |
| `--color-surface-3` | `#dce9ff` | surface-container-high / `#d3e4fe` highest |
| `--color-border` | `#bccac0` at 30-50 % | outline-variant/xx |
| `--color-inverse` | `#213145` | inverse-surface |
| `--color-danger` / `-soft` / `-on-soft` | `#ba1a1a` / `#ffdad6` / `#93000a` | error family |
| `--color-success` | alias of `--color-brand` | no separate token in designs |
| `--color-warning` | `#f59e0b` (observed amber-500), pair with a soft tint | **only new token**, genuinely missing |

Contrast notes (computed from the hex values): `#006948` on white is about 6.7:1 (passes AA); white on `#00855d` is about 4.7:1 (passes AA for normal text, so use `brand` rather than `brand-hover` as the resting fill); `#6d7a72` on white is about 4.5:1 (borderline; avoid for small text); `outline-variant` borders are decorative only.

## 2. Typography

### 2.1 Observed

- Families: **Plus Jakarta Sans** (headings, prices, brand) and **Inter** (body, labels). Identical in desktop, tablet and mobile configs.
- Named scale (identical in all three exports and in `DESIGN.md`): `display-hero` 48/56 w800 (-0.025em), `display-hero-mobile` 32/40 w800, `headline-xl` 36/44 w700, `headline-xl-mobile` 26/34 w700, `headline-lg` 28/36 w700, `headline-md` 22/30 w600, `headline-sm` 18/26 w600, `body-lg` 16/26, `body-md` 14/22, `body-sm` 13/18, `label-lg` 14/20 w600 (+0.01em), `label-md` 12/16 w600 (+0.02em), `label-sm` 11/14 w600 (+0.04em), `price-lg` 24/28 w700, `price-md` 18/24 w700.
- Class usage is dominated by the small tokens: `label-sm` 700, `body-sm` 455, `label-md` 448, `headline-sm` 267, `label-lg` 221, `body-md` 155 across the three viewports. **Product titles** are `headline-sm`/`body-md`/`label-lg`; **prices** `price-md`/`price-lg`; **buttons/nav labels** `label-lg`/`label-md`.
- Escape-hatch sizes: `text-[10px]` (100 uses) and `text-[9px]` (18) for micro labels and the mobile brand subtitle. Many `text-[16-22px]` are just Material icon sizes.
- Desktop PNGs render a serif (capture artefact; see inventory section 5). Tablet/mobile PNGs match the declared fonts.
- Mobile uses `headline-xl-mobile`/`display-hero-mobile`; desktop/tablet use `headline-xl`/`display-hero`. Mobile page titles render around 26-28 px; desktop catalog/cart titles around 36 px.

### 2.2 Recommended

- One system: **Plus Jakarta Sans** for display/headline/price, **Inter** for body/label. Load both with `next/font` (variable weights, `latin` + `arabic` fallback chain planned for RTL).
- Keep the 15 named tokens as-is. Make display/headline sizes **fluid** instead of `*-mobile` variants: `display-hero` 32 -> 48 px and `headline-xl` 26 -> 36 px with `clamp()` between the mobile and desktop values (same endpoints, no breakpoint jump).
- Minimum text size **11 px** (`label-sm`); replace `text-[10px]`/`[9px]` with `label-sm` (accessibility; the brand subtitle may stay as an uppercase wordmark detail).
- Prices: number in `price-*`, the "SAR" suffix in `label-sm`/`label-md`, tabular figures (`font-variant-numeric: tabular-nums`) for totals and tables.
- Letter spacing: tracked (+0.01 to +0.04em) for labels/uppercase eyebrows; negative for display/headline, as tokenized.

## 3. Spacing and layout

### 3.1 Observed spacing tokens (identical everywhere)

`space-xs .25rem`, `space-sm .5rem`, `space-md 1rem`, `space-lg 1.5rem`, `space-xl 2.5rem`, `gutter-sm 1rem`, `gutter 1.5rem`, `gutter-lg 2rem`, `margin-sm 1rem`, `margin 1.5rem`, `margin-lg 4rem`. In markup, raw Tailwind spacing (`px-2/3/4/5/6`, `gap-*`) is used far more than the named tokens (`px-margin` 43, `px-gutter` 9, `px-margin-sm` 42).

### 3.2 Container widths and gutters

| Viewport export | Observed container | Observed gutter |
|---|---|---|
| Desktop | `max-w-7xl` (1280 px) in 42 places, `px-6 lg:px-12` (24 -> 48 px); the desktop cart page uses `max-w-[1440px]`; `px-margin-lg` (64 px) appears 3 times | 24/48 px (64 px in places) |
| Tablet | full-width bar with `px-margin` (24 px); content pages in a **centered 768 px column** (`max-w-[768px]` on detail, cart, wishlist, order details; `max-w-4xl` elsewhere) | 24 px |
| Mobile | full-bleed with `px-margin-sm` (16 px); no max-width | 16 px |

Recommended: one `ResponsiveContainer` = `max-width 1280px` (use 1440 only if a page genuinely needs it), `padding-inline`: 16 px (< 768) / 24 px (768-1023) / 32-48 px (>= 1024). The 768 px centered-column pages are an *artefact of the tablet export*; at tablet widths the container already is about 768 px wide, so a natural fluid container reproduces them.

### 3.3 Header, footer, spacing rhythm

- **Desktop header** (fixed): 36 px utility bar (delivery promise, Help Center, SAR / Arabic toggle) + 80 px main row (logo, department select + search + search button, wishlist, cart with total, account) + category nav row. Checkout/confirmation use a simplified 64 px header.
- **Tablet header** (fixed): about 112 px, two rows: logo + search + wishlist/cart/account, then category tabs ("Smartphones, Computing, Audio, Offers") with "Express delivery" note right. Catalog/home add a thin promo strip.
- **Mobile header** (fixed): 64 px (logo tile + wordmark, search, wishlist, cart, account) and a **fixed 5-tab bottom nav** (Home, Catalog, Wishlist, Orders, Account) on home, catalog, PDP, wishlist, orders, tracking. Cart/checkout/confirmation use a back-arrow header instead and show no bottom nav.
- **Footer**: desktop 4 columns (brand blurb, Shop Categories, Customer Care, About/Account) + payment strip + legal row; tablet/mobile 3 compact blocks (Customer Care, Verified Standards, Legal & Trust) + "Saudi Certified Payments" strip + legal links. Cart/checkout/confirmation desktop use a minimal footer.
- **Vertical rhythm**: sections separated by `space-xl` (40 px) or more; card inner padding 16-24 px (`p-4`/`p-5`/`p-6`); card grid gaps 16 px (mobile), 20-24 px (tablet/desktop).

### 3.4 Grids and breakpoints

| Observed pattern | Desktop | Tablet | Mobile |
|---|---|---|---|
| Product grid | 4 col (`lg:grid-cols-4`), catalog with 4-col grid next to a sidebar | 3 col catalog, 4 col home (tight), 2 col wishlist | 2 col (`grid-cols-2`) |
| Page structure | 12-col (`lg:grid-cols-12`: 8/4 and 7/5 splits) | 1 col centered, some `md:grid-cols-12` | 1 col |
| Breakpoint prefixes used | `sm` 153, `lg` 126, `md` 58, `xl` 7 | `sm` 35, `md` 27, `lg` 5 | **none** (mobile export is mobile-only) |

- The desktop and tablet exports each use Tailwind's default breakpoints, with desktop layouts kicking in at **`lg` (1024 px)**, not at the 1280 px in `DESIGN.md`. The mobile export has no responsive prefixes at all.
- Deliberate responsive differences (preserve): filter sidebar -> filter bar -> bottom-sheet drawer; horizontal timeline -> vertical timeline; mobile bottom nav; order summary side column -> stacked; 4 -> 3 -> 2 product columns; footer 4 -> 3 blocks; two-row header -> one-row header.
- Generated inconsistencies (normalize): different header heights per page within an export (`h-14/16/20/24/28`), 768 px column vs 1280 px container, different footers per viewport, mismatched sample content.

Recommended breakpoints (mobile-first, Tailwind 4 defaults): base < 768 mobile; `md` 768 tablet; `lg` 1024 desktop layout (sidebars, 12-col pages); `xl` 1280 wide desktop (container max, 4 product columns). Do not key behaviour to 390/768/1440 exact widths.

## 4. Shape, elevation, outlines

### 4.1 Border radius

- **Observed tailwind override** (all 27 files): `DEFAULT 0.25rem`, `lg 0.5rem`, `xl 0.75rem`, `full 9999px` (note: no `2xl` override, so `rounded-2xl` = Tailwind default 1rem and `md` = 0.375rem). Usage: `rounded-xl` 484, `rounded-full` 488, `rounded-lg` 382, `rounded-2xl` 99, `rounded-md` 83, `rounded` 151; a few `rounded-[10px]`.
- `DESIGN.md` front matter lists a different scale (`DEFAULT .5rem`, `md .75rem`, `lg 1rem`, `xl 1.5rem`). The screens do not use it.
- **Recommended**: `--radius-sm 4px` (checkboxes, small chips), `--radius-md 8px` (inputs, small buttons), `--radius-lg 12px` (buttons, cards, option tiles - the dominant `rounded-xl`), `--radius-xl 16px` (hero/feature/promo cards, image wells - `rounded-2xl`), `--radius-full` (pills, badges, icon buttons, quantity steppers).

### 4.2 Shadows

- Observed: `shadow-sm` 469 (default card), `shadow` 186, `shadow-md` 115 (hover), `shadow-lg` 12, `shadow-xl` 13, `shadow-2xl` 4. Custom soft shadows with `rgba(11,28,48,.03-.07)` and `rgba(0,0,0,.02-.06)`; brand glow `rgba(0,105,72,.25)` under primary CTAs and the logo tile.
- Recommended three elevations: **card** `0 1px 3px rgba(11,28,48,.04), 0 4px 12px rgba(11,28,48,.03)`; **hover/raised** `0 8px 24px rgba(11,28,48,.06), 0 2px 6px rgba(11,28,48,.04)`; **overlay** `0 16px 36px rgba(11,28,48,.12), 0 4px 12px rgba(11,28,48,.06)` (drawer, dialog, sticky buy bar). This keeps the DESIGN.md elevation idea but uses the screens' ink colour.

### 4.3 Borders, dividers, focus

- Borders are mostly absent: surfaces are separated by tint (`surface-container-low` on white) and `shadow-sm`; where drawn, `outline-variant` at 20-50 % opacity. Selected option cards: 2 px `primary`.
- Focus: ring 2 px `primary` (search: `primary/40`), or `shadow [0_0_0_2px_#006948]`. `focus:outline-none` appears 61 times, so a visible replacement is always needed. Recommended: `:focus-visible` 2 px `brand` ring with 2 px offset, never remove it without a replacement.

## 5. Components (shared visual language)

| Component | Observed | Recommended spec |
|---|---|---|
| **Primary button** | `bg-primary` white `label-lg`, `rounded-xl`, height 44-56 px, shadow, `hover:bg-primary-container`; full width in cards/summary; arrow or lock icon | 48 px (44 px min touch target), radius 12, `brand` fill, `brand-hover` hover |
| Secondary / dark button | `inverse-surface`/dark navy fill for "Instant Buy with Apple Pay", "Apply" | `--color-inverse` fill |
| Tertiary / outline / tonal | white or `surface-container-low` fill, text `primary`/`on-surface`, no border or thin outline | tonal = `surface-1` fill |
| Icon button | 40-44 px square or circle, white, `shadow-sm`, favourite heart, badges (dot or count) | 44 px |
| **Product card** | white, `rounded-xl/2xl`, `shadow-sm`, image well `surface-container-low` (aspect about 4:3 to square, `aspect-[4/3]` x6), top-left badge, top-right heart, brand/spec line, 2-line title, rating, price with strike-through, instalment line, full-width Add to Cart | one shared component; spec/instalment lines optional |
| Category card | white tile, tinted icon square, name + count/brands; 6-7 across desktop, 3x2 on tablet, scroll row on mobile | |
| Promo / feature cards | gradient-tinted hero card (emerald glow), side promo cards with small image, dark navy deal banner with countdown + progress bar | |
| Navigation | text tabs with emerald underline/active; icon buttons for wishlist/cart/account; bottom tab bar with emerald active icon | |
| Search field | `surface-container-low` rounded-xl, leading icon, desktop with department select and attached "Search" button, focus ring | |
| Form controls | filled inputs on `surface-container-low`, label above (`label-md`), leading icon, `rounded-xl`, height about 48-52 px; selects with chevron; checkbox/radio in emerald; toggle switch for express dispatch | |
| Option/selector cards | radio cards (delivery speed, payment method), 2 px emerald when selected; storage pills; colour swatches 32-40 px with ring when selected | |
| Filter controls | brand checkboxes with counts, min/max price boxes + range slider, storage pills, delivery toggle (desktop sidebar); chips + "Filters (n)" + sort (tablet/mobile); bottom-sheet drawer with "Reset" and "Show 48 Results" (mobile) | |
| Chips / badges | pill (`rounded-full`), `label-sm`; emerald tint for warranty/in-stock/free; red tint for discount/low stock; blue-grey tint for neutral | |
| Order card | header row (placed, total, ship-to, ref), status pill, progress bar, item mini-cards, action stack/row | |
| Tracking timeline | 4 steps: Order Placed, Processing/Packing, In Transit/Shipped, Delivered; filled emerald circles with check, current step ringed, pending in tint; horizontal (desktop/tablet) and vertical (mobile) | |
| Breadcrumbs | `Home > Parent > Current`, `label-md`, chevron separators; present on every non-home page except checkout/confirmation | |
| Drawer / modal | mobile filter bottom sheet with drag area, close X, sticky footer actions; toast for add-to-cart (prototype script) | |
| Icons | Material Symbols Outlined, 145 distinct names, sizes 16-28 px, emerald or `on-surface-variant`, FILL for active favourites | single icon system; subset the used 145 glyphs |
| Image ratios | image wells mostly 1:1 to 4:3 with `object-contain`; gallery main image wide (about 4:3); thumbnails about 1:1; order/cart thumbs 56-80 px squares | `aspect-square` card images, `aspect-[4/3]` gallery |

## 6. Responsive behaviour summary

- **One responsive app**, nine pages; navigation, footer, cards and forms are shared components that change by CSS.
- True structural changes only where the exports show them: header (utility+nav rows -> two rows -> one row + bottom nav), catalog filtering (sidebar / inline panel / sheet), PDP (two-column / stacked / stacked with accordions + sticky bar), tracking timeline (horizontal / vertical), cart and checkout summary placement (sticky side column / below / collapsed overview).
- Everything else is grid-column and spacing change.

## 7. Component design principles

1. Tokens first: colours/typography/spacing/radius/shadow in CSS variables (Tailwind 4 `@theme`), no raw hex in components.
2. Mobile-first CSS; add `md`/`lg` layers; never fork markup per viewport unless the DOM truly differs.
3. Touch targets at least 44 px, visible `:focus-visible`, text at least 11 px.
4. Logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`, `start`/`end`, `text-start`) so RTL works.
5. Cards separated by tint + soft shadow, not heavy borders.
6. Price, status and CTA always visually dominant in their card; emerald is reserved for action, active, success and price emphasis.
7. Keep trust content (warranty, VAT, payment marks) as data-driven components so wording stays consistent.
