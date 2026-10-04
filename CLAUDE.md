# Bar Franco — Website (CLAUDE.md)

This file tells Claude Code how this site is built and how to edit it. Read it before making changes.

## One stylesheet
- **Every page loads `static/franco.css` + `static/franco.js` + `static/chrome.js`** and nothing else
  (the Events Pack adds `static/events-pack.js`, Functions adds `static/functions.js`). No `<style>` blocks, no `style=""` (except `object-position`
  on an `<img>`). The design brief behind it is `DESIGN-FIXES.md`.
- **Tokens** (top of franco.css): Deep Red `--deep #6C0600` (ink), Almond `--almond #FAD7C3`, Bright Red
  `--bright #AF0F00` (heads), Spritz `--spritz #F00000` (**focus rings only, never text**), Paper `--paper #F1EEE6`,
  `--hairline rgba(108,6,0,.15)`. No other colours: no black, greys, gradients or shadows. Never write a raw hex outside the tokens.
- **Chapters**: every section is one of `ch-menu` (Paper), `ch-aframe` (Almond), `ch-night` (Deep Red),
  `ch-poster` (Bright Red), which sets its ground and inks. Pages open on paper; at most two non-paper chapters
  plus the Night footer; never two of one colour adjacent; the band before the footer is never Night; one poster at most.
- **Type**: Marsha `.m1`–`.m4` only (never below 24px, always capitals); Affairs `.a1`–`.a4`, `.fine`.
  One `<h1>` per page; heading levels descend without skips.
- **Grammar**: `.wrap .grid` + column classes; photographs `.ph r-169|r-32|r-45` (no captions, no thumbnails);
  `.frame` (double rule) for printed objects; `.ml` menu lines (`.v.r` for prices/capacities); `.line` primary
  asks (`<span>words</span><i class="lead"></i><em class="v">fact</em>` — the leader runs to a short fact where a price
  would be: Book a table … 4pm till late · Plan an event … up to 240 · Read the full menus … food & drinks ·
  Christmas parties … December; the dock and Send are the words alone. **No arrows anywhere**), `.ask` secondary; `.btn` the square ask (`.fill` for the primary of a pair; the home page's asks); `.qa` questions; `.tabs` (franco.js wires `role=tab` buttons to their panels).
- Between pages the masthead holds still while the page turns (CSS view transitions; the inline `fx` script in each `<head>` carries their handler).
- **Motion** only via `data-set` (page title), `data-unmask` (a chapter's lead photo), `data-settle` (framed objects).
- Page-specific CSS lives at the end of franco.css, one `/* ==== page ==== */` block each, every selector
  prefixed by the page's `<main class="pg-…">`.

## URLs

- **One scheme: lowercase, folder-style, trailing slash.** `/`, `/menus/`, `/bookings/`, `/functions/`, `/contact/`,
  `/vouchers/`, `/christmas-functions/`, `/events-pack/`, `/weddings/` … Each page is `<folder>/index.html`.
- **Link with root paths** (`/menus/`, `/functions/#enquire`), never `Menus.html` or `../`, so a link reads the same
  at any depth. Every page carries `<link rel="canonical">` to its own address (not 404.html, which is noindex).
- **Hosting is GitHub Pages** (`CNAME` → www.barfranco.nz). It is case-sensitive and cannot send 301s, so:
  - the old addresses (`Menus.html`, `Bookings.html`, `Functions.html`, `Contact.html`, `Vouchers.html`, and the
    vanity folders `events/`, `reservations/`, `our-menus/` …) are stub pages: instant meta refresh + `location.replace`
    keeping `?query#hash`, canonical to the new address, `noindex, follow`;
  - `404.html` forwards any other casing or form (`/MENUS`, `/menus.html`, `/Functions`) to the canonical page;
  - `/menus` → `/menus/` is GitHub's own 301.
  Never point an internal link at a stub. Don't add `menus.html`-style lowercase files: a Mac checkout can't hold
  both `Menus.html` and `menus.html`.

## What this is
The **complete, production website for Bar Franco** — a modern Italian restaurant, cocktail bar
and private event venue in central Christchurch, NZ. It is a **static HTML site** (no build step,
no framework, no server). The files here ARE the site — what you edit is what deploys.

**Do not** convert this to React/Vue/Next/etc. unless explicitly asked. Edit the HTML/CSS directly.

## How to work on it
- Open any `.html` file and edit the markup directly. Build with franco.css classes before writing new CSS.
- **The chrome is repeated on every page** (there is no templating): the masthead `<header class="bf-mast">`
  (open page marked `aria-current="page"` with Franco the dachshund under it), the phone Index `#ora-index`,
  the Night footer (live open/closed clock in Ōtautahi time, run by chrome.js) and the phone dock.
  Change them on every page. Home and Contact use the lite footer (no address block, as they show it above).
  Christmas has its own campaign masthead (no nav; Call / Enquire; the Index button always shown).
- franco.js also runs the FormSubmit contact form (`<form data-email data-subject>`, honeypot, Ads conversion)
  and the VenueFlow iframe height.
- To preview: a static server from the repo root (`python3 -m http.server`) — pages use root paths.
- Keep the writing voice warm, witty, never corporate (see Brand below).

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Homepage — the claim and two asks, then cards (one photograph, a name, a number, an action): Your event and The work do on Night, pasta / the Negroni Bar / the Restaurant on Paper, what planners said on Almond, Come say ciao. Built to the Brand Conversion brief: every screen makes you want it and lets you act on it |
| `bookings/` | Reservations — embeds the NowBookIt booking widget |
| `functions/` | Private events — the nameplate cover, the coaster (turns over, cycles `images/coaster/`; the one drop-shadow on the site), the framed VenueFlow card `#enquire`, the five-chapter guide (`#why #spaces #occasions #food #questions`), the seasonal Christmas Poster band (remove after December). Behaviour in `static/functions.js` |
| `menus/` | Food & drinks menu overview (the folder also holds the printed menu PDFs) |
| `vouchers/` | Gift vouchers |
| `contact/` | Location, hours, contact details |
| `christmas-functions/` | Christmas landing page: campaign masthead (Call / Enquire), cover, four chapter tabs (Menu & prices · The rooms · The fine print · The night), the `#enquire` box below, Call / Enquire phone dock. Keep the Google Ads conversion tags and the `bf_*` dataLayer pushes verbatim |
| `aperitivo/`, `negroni-bar/`, `fresh-pasta/`, `pre-stadium-dining/`, `corporate-events/`, `weddings/`, `private-dining/` | SEO landing pages on the franco grammar (the four dining pages share `.pg-dine`; weddings, corporate and private dining & birthdays share the `.ev-*` template) |
| `404.html` | Not-found page (absolute `/` paths) |
| `events-pack/` | Events Pack 2026 — a masthead cover, then eight chapters that open underneath their title (tap or click to open; Welcome open on load; one open at a time; `#ch-food` etc. deep-link). Behaviour in `static/events-pack.js`; photos in `images/pack-2026/`. Uses the shared masthead, footer and dock like every page. The old `Bar Franco Events Pack.html` redirects here |
| `Brand Guide.html` | Internal one-page brand guide (not linked in site nav) |

`index.html` is the home page (named `index.html` so hosts serve it automatically). Internal links
point to `/`.

## Folder structure
- `index.html` + `<folder>/index.html` — the site pages
- `static/franco.css`, `static/franco.js`, `static/chrome.js` — the one stylesheet and the shared behaviour
- `static/events-pack.js` — the Events Pack chapters; `static/menu-data.js` — older menu data, not loaded by the pages
- `static/fonts/`, `static/logos/`, `static/illustrations/` — the brand kit the pages use
- `menus/BarFranco-*-Menu.pdf` and `menus/BarFranco-Event-Menus-2026.pdf` — the printed menus as PDFs (linked from the menus page; the Event menus are also its third tab, `/menus/#sheet-events`)
- `downloads/Bar-Franco-Events-Pack-2026.pdf` — the printable events pack ("View / Download the PDF pack").
  To update it, replace the file under the same name.
- `brand/` — fonts (.otf) + brand marks (wordmark, dachshund, Negroni glass)
- `brand-assets/` — organized brand kit (marks + fonts + README) for designers/printers
- `images/` — all website photography, optimized for web (~150–280KB each)
- `sitemap.xml`, `robots.txt` — SEO files
- `favicon.svg`, `favicon.png`, `apple-touch-icon.png`, `og-image.jpg` — icons + social share image

## Photos
All photos are **baked in** as `<img src="/images/….jpg" width height alt>` inside a `.ph` figure (ratios 16:9, 3:2 or 4:5). To change a photo:
1. Add the new image to `images/` (resize to ~1400px long edge, JPEG quality ~0.82 — keep files small).
2. Update the `src=""` on the relevant `<img>` and write a descriptive `alt=""` (good for SEO).

Two level photos (`images/level-negroni-graded.jpg`, `images/level-restaurant-graded.jpg`) were
**colour-graded** to match each other (warm, moody, matte blacks). If you swap them, try to keep a
consistent warm/low-key grade so the set stays cohesive. Originals like `server-tray.jpg` and
`dining-room.jpg` are kept in `images/` unmodified.

## Brand (keep edits on-brand)
- **Colours:** Deep Red `#6C0600` ink, Bright Red `#AF0F00` heads, Almond `#FAD7C3`, Paper `#F1EEE6`;
  Spritz `#F00000` is the focus ring only. Each chapter fixes its inks — see "One stylesheet" above.
- **Type:** VTC Marsha Bold (display, always UPPERCASE) + Affairs Regular/Italic (body; never set in
  capitals, never fake-bold). Radius 0 and no shadows anywhere.
- **Marks:** wordmark (the name), the dachshund (playful accent), the Negroni glass (the ritual).
- **Voice:** warm, direct, a little witty. "Come say ciao," not "Contact us."
- Full detail in `Brand Guide.html`.

## Key facts (keep accurate across pages if they change)
- Address: The Crossing, 166 Cashel Street, Christchurch Central 8011
- Hours (visible copy): bar from 4pm, kitchen from 5pm, daily, till late
- Hours (SEO schema in index/Bookings/Contact): opens 16:00, closes 22:00 — a safe default since
  real closing varies. Update the `openingHoursSpecification` blocks if this changes.
- Reservations email: ciao@barfranco.nz · phone 021 221 1307
- Events email: events@barfranco.nz · phone 021 221 1307 (the Contact page form goes to ciao@barfranco.nz)
- Instagram: @bar__franco · Facebook: barfranco.chch

## SEO — already set up, keep it intact
Each page has a unique `<title>`, meta description, Open Graph + Twitter card tags, canonical URL,
and JSON-LD structured data (Restaurant / Bar / LocalBusiness + FAQ on the homepage). When editing:
- Keep one unique `<title>` and meta description per page.
- If you add a page, add it to `sitemap.xml`.
- Don't remove the JSON-LD `<script type="application/ld+json">` blocks — they power rich results.

## Deploying
Static host, drag-and-drop:
- **Netlify:** drag this folder onto app.netlify.com/drop. `index.html` is served automatically.
- **GitHub Pages:** push to a repo, Settings → Pages → enable. Add a custom domain (barfranco.nz)
  via the DNS records the host provides.
After deploying once, future edits just need a re-upload (or a `git push` if using GitHub Pages).

## Golden rules
1. Edit the HTML/CSS directly — this is the real site, not a mockup.
2. Stay on-brand (the franco.css tokens and chapters, VTC Marsha + Affairs, witty warm voice).
3. Keep photos optimized and small.
4. Don't break the SEO tags or JSON-LD.
5. Keep facts (hours, address, contacts) consistent across all pages.
