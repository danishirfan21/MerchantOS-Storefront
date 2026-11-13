# Design Reference Inventory

Scope: `design-references/` (Google Stitch exports). Read-only analysis; no reference file was modified.
Verified against the filesystem on 2026-11-13.

## 1. Summary

| Item | Expected (brief) | Actual |
|---|---|---|
| Viewport folders | 3 | 3 (`desktop`, `tablet`, `mobile`) |
| Reference folders | 30 | **30** (27 screen folders + 3 guideline folders) |
| `code.html` files | 30 | **27** (all in the nine screen folders per viewport) |
| `screen.png` files | 30 | **27** |
| `DESIGN.md` files | not expected | **3** (one per `10-design-guidelines`) |
| Total files | 60 | **57** |
| Missing files | - | 3 `code.html` + 3 `screen.png` that the brief expected in `10-design-guidelines`; those folders hold `DESIGN.md` instead |
| Empty / unreadable files | - | none (all 57 are non-empty and readable) |
| Duplicate files | - | the 3 `DESIGN.md` files are byte-identical (same SHA-256); no other duplicates |

There are no gaps in the nine approved screens: every screen exists at all three viewports with both `code.html` and `screen.png`. The 27 screen references are complete.

## 2. Screen naming consistency

All nine screen folder names are identical in `desktop/`, `tablet/` and `mobile/`:

`01-homepage`, `02-product-catalog`, `03-product-detail`, `04-shopping-cart`, `05-checkout`, `06-order-confirmation`, `07-wishlist`, `08-my-orders`, `09-order-details-tracking`.

`10-design-guidelines` is present in all three viewports and is **not** an application page. No route should be created for it.

## 3. File inventory (bytes)

| Screen | Viewport | code.html | screen.png | PNG size (px) |
|---|---|---:|---:|---|
| 01-homepage | desktop | 49,907 | 338,333 | 578 x 1600 |
| | tablet | 45,196 | 494,165 | 860 x 1600 |
| | mobile | 35,446 | 195,407 | 190 x 1600 |
| 02-product-catalog | desktop | 48,808 | 403,059 | 869 x 1600 |
| | tablet | 40,456 | 502,066 | 871 x 1600 |
| | mobile | 46,316 | 188,930 | 265 x 1600 |
| 03-product-detail | desktop | 60,784 | 317,369 | 742 x 1600 |
| | tablet | 39,598 | 263,087 | 701 x 1600 |
| | mobile | 44,754 | 188,518 | 280 x 1600 |
| 04-shopping-cart | desktop | 36,900 | 471,986 | 1455 x 1600 |
| | tablet | 33,155 | 286,254 | 950 x 1600 |
| | mobile | 26,769 | 192,499 | 419 x 1600 |
| 05-checkout | desktop | 30,079 | 282,127 | 1267 x 1600 |
| | tablet | 32,233 | 375,713 | 1367 x 1600 |
| | mobile | 25,878 | 161,423 | 334 x 1600 |
| 06-order-confirmation | desktop | 23,771 | 391,774 | 1505 x 1600 |
| | tablet | 23,880 | 287,311 | 1076 x 1600 |
| | mobile | 22,503 | 216,814 | 332 x 1600 |
| 07-wishlist | desktop | 42,669 | 440,516 | 1077 x 1600 |
| | tablet | 32,351 | 515,977 | 1043 x 1600 |
| | mobile | 27,520 | 320,808 | 415 x 1600 |
| 08-my-orders | desktop | 46,043 | 323,192 | 764 x 1600 |
| | tablet | 30,675 | 363,375 | 1061 x 1600 |
| | mobile | 33,559 | 237,147 | 414 x 1600 |
| 09-order-details-tracking | desktop | 38,933 | 340,161 | 873 x 1600 |
| | tablet | 31,281 | 398,344 | 1058 x 1600 |
| | mobile | 31,117 | 195,756 | 279 x 1600 |
| 10-design-guidelines | desktop / tablet / mobile | `DESIGN.md` 11,370 each | - | - |

### Screenshot dimension findings (important)

- **No PNG matches its stated viewport** (1440x900, 768x1024, 390x844). Every PNG is exactly **1600 px tall** with a variable width (190-1505 px). They are full-page captures that were scaled down so the long dimension is 1600, then possibly cropped; they are not viewport-sized frames.
- Consequences: pixel measurements from the PNGs are unreliable, and PNG widths cannot be used to infer the design width. The screenshots are useful for layout, hierarchy and visual style. **Use each `code.html` (Tailwind classes and config) for spacing, sizing and breakpoint values**, not pixel-peeping the PNGs.
- The tall, narrow mobile captures are scaled to roughly 0.3-0.5x, so small text there is hard to read. Text content was cross-checked against the HTML.

## 4. Design-guideline folders

`desktop/`, `tablet/` and `mobile/` `10-design-guidelines/` each contain only `DESIGN.md`, and **all three are byte-identical** (SHA-256 prefix `30332D4CEAC5`). They are not per-viewport guidance; they are one shared design-system document copied three times. Treat it as a single document.

It contains a YAML front matter (colour, typography, rounded and spacing tokens) plus prose sections: Brand & Style, Colors, Typography, Layout & Spacing, Elevation & Depth, Shapes, Components.

### Relationship to the approved screens

The `DESIGN.md` is **internally inconsistent** and only partly agrees with the approved screens:

| Topic | `DESIGN.md` front matter (tokens) | `DESIGN.md` prose | Approved screens (HTML + PNG) |
|---|---|---|---|
| Primary colour | `primary #006948`, `primary-container #00855d` | Primary Emerald `#059669`, hover `#047857` | Uses `#006948` / `#00855d` (token set). **`#059669` never appears.** |
| Surfaces | `surface #f8f9ff`, containers `#eff4ff`/`#e5eeff` | Canvas `#F8FAFC`, subdued `#F1F5F9` | Uses `#f8f9ff` and the blue-tinted containers. Slate prose palette not used. |
| Ink | `on-surface #0b1c30` | `#0F172A` / `#334155` | `#0b1c30` / `#3d4a42` |
| Border radius | `DEFAULT 0.5rem`, `md .75`, `lg 1rem`, `xl 1.5rem` | buttons 10 px, cards 12-16 px | The tailwind config in every HTML overrides to `DEFAULT .25rem`, `lg .5rem`, `xl .75rem`, `full 9999px` |
| Breakpoints | - | Desktop >= 1280, tablet 768-1279, mobile < 768 | Desktop exports switch layout at Tailwind `lg` (1024); see DESIGN_SYSTEM.md |
| Heading font | Plus Jakarta Sans | Plus Jakarta Sans | HTML declares Plus Jakarta Sans everywhere; **desktop PNGs render a serif** (see below) |
| Max width | - | 1440 px canvas | Desktop headers/pages use `max-w-7xl` (1280); only the cart uses `max-w-[1440px]` |

Resolution used in the rest of the docs: the **approved screens and the tailwind config embedded in every `code.html` win**. The `DESIGN.md` front matter is the same token set the HTML uses, so it is authoritative for token names. The prose hex palette (`#059669`, `#0F172A`, ...) is treated as generic and **not adopted**. Useful prose content that does not conflict (shadow levels, button heights, focus ring, chip/checkbox specs, trust-module idea) is kept as supporting guidance.

## 5. Typography rendering discrepancy (desktop PNGs)

All 27 HTML files declare headings in Plus Jakarta Sans and body in Inter (identical `fontFamily` config in desktop, tablet and mobile). The **desktop screenshots render headings, prices and some labels in a serif face** (visible on the catalog title, cart title, order totals, footer column titles). Tablet and mobile PNGs render Plus Jakarta Sans correctly. No HTML file references a serif font family, so the serif is almost certainly a capture-time web-font fallback, not a design decision. Recommendation: build with Plus Jakarta Sans + Inter everywhere. (Cause is inferred, not proven.)

## 6. External dependencies found in the HTML exports

All 27 `code.html` files are standalone prototypes. **Nothing is stored locally** except the HTML/PNG files themselves; no fonts, images, or stylesheets are bundled.

| Dependency | Where | Count | Status |
|---|---|---|---|
| Tailwind Play CDN `https://cdn.tailwindcss.com` | every HTML | 27 files | Externally hosted; prototype-only, not for production. Replace with the project's Tailwind 4 build. |
| Tailwind config (inline `tailwind.config = {...}`) | every HTML | 27 | Local (inside the HTML). Source of truth for tokens; port to CSS variables. |
| Google Fonts: Inter, Plus Jakarta Sans | `<link>` | 27 files (weight ranges vary: `100..900` or limited sets) | Externally hosted; replace with `next/font`. |
| Google Fonts: Material Symbols Outlined | `<link>` | 27 files | Externally hosted icon font; **145 distinct icon names** used. Replace with a local/subsetted set or an icon library (decision needed). |
| Product / hero / avatar images | `<img src>` | **149 references, 132 unique URLs**, all on `lh3.googleusercontent.com` | Externally hosted (Stitch-generated). Not licensed assets; treat as placeholders. May expire. |
| Map tile background | CSS `url()` | 1 (`tablet/09-order-details-tracking`) | Externally hosted, same host. |
| Inline `<svg>` | 1 file (`tablet/05-checkout`) | 1 | Local, inline. |
| Inline scripts | 27 config scripts + prototype behaviour scripts | 49 `<script>` blocks total without `src` | Prototype behaviour only (countdown, variant pricing, filter tabs, drawer toggle, payment switch, toast, cart recalculation). Not to be reused. |
| External stylesheets (non-font) | - | 0 | none |
| Fonts/images in repo | - | 0 | none |

Details:

- **Logo**: the desktop headers use `<img alt="MerchantOS Storefront Logo">` pointing at a Stitch-hosted URL; in desktop PNGs it renders as a **broken image**. Tablet/mobile use a Material `verified`/`storefront` icon + wordmark instead. The logo is not available as a file. Use a text wordmark + icon until the real logo is supplied.
- **All product photographs are AI-generated placeholders.** Several wishlist and catalog images (desktop/wishlist iPhone, mobile wishlist iPhone and Sony headphone) actually contain *screenshots of the Stitch designs themselves* rather than product photography. These cannot be reused.
- **Payment brand marks** (mada, Visa, Mastercard, Apple Pay, Tabby, Tamara) are drawn as styled text/boxes with a few brand hex values (for example `#1434cb` Visa blue and `#eb001b` Mastercard red in `desktop/05-checkout`, plus brand tints in `mobile/04-shopping-cart` and `mobile/01-homepage`). They are not official logos. Real logos need to be sourced under each brand's guidelines.
- **Stray non-token hex values** (`#1434cb`, `#eb001b`, `#005c30`, `#ea580c`, `#f59e0b`, `#00e599`, `#fa5252`) occur in only 3 files (`desktop/05-checkout`, `mobile/01-homepage`, `mobile/04-shopping-cart`), almost all in payment/brand marks. They are not part of the palette. A handful of other one-off grey/sand hex values also appear once each and are likewise ignorable.

### Asset classification

| Asset | Local | Externally hosted | Missing | Requires replacement | Reusable later (subject to licence/compat) |
|---|:-:|:-:|:-:|:-:|:-:|
| HTML structure/class patterns | yes | | | | yes (as guidance) |
| Tailwind token config | yes | | | convert to Tailwind 4 `@theme` | yes |
| Inter, Plus Jakarta Sans | | yes (Google Fonts) | | self-host via `next/font` | yes (OFL fonts) |
| Material Symbols | | yes (Google Fonts) | | local subset / icon library | yes (Apache 2.0) |
| Product photos (132 URLs) | | yes (lh3 host) | real catalogue photos | **yes** | **no** (generated, may expire) |
| Logo image | | yes (broken in PNG) | **real logo file** | **yes** | no |
| Payment brand logos | | | **official artwork** | **yes** | n/a |
| Avatar ("Tariq Al-Harbi") | | yes | | yes | no |
| Map tile (order tracking) | | yes | | yes (map provider decision) | no |
| Tailwind CDN script | | yes | | remove | no |

Per the brief, no external asset was downloaded or copied into `public/`.

## 7. Possible issues for faithful implementation

1. Screenshots are not at the stated viewport sizes; use HTML for measurements.
2. Desktop PNG serif headings vs. HTML Plus Jakarta Sans (resolved in favour of the HTML).
3. `DESIGN.md` palette/radius prose contradicts the tokens actually used (resolved in favour of tokens + screens).
4. Brand colour appears only as the `#006948` family; no separate "success" token exists (see DESIGN_SYSTEM.md).
5. No RTL/Arabic layout is exported (all HTML is `lang="en"`, no `dir`); Arabic strings appear only as isolated labels (language toggle, city/country names, "mada").
6. Sample data differs between viewport exports (hero copy, item names, some prices, COD fee). See SCREEN_REFERENCE_MAP.md. These are prototype inconsistencies, not blockers.
7. Real photography and a real logo are needed before visual parity is achievable.
