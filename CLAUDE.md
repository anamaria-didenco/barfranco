# Bar Franco — Website (CLAUDE.md)

This file tells Claude Code how this site is built and how to edit it. Read it before making changes.

## What this is
The **complete, production website for Bar Franco** — a modern Italian restaurant, cocktail bar
and private event venue in central Christchurch, NZ. It is a **static HTML site** (no build step,
no framework, no server). The files here ARE the site — what you edit is what deploys.

**Do not** convert this to React/Vue/Next/etc. unless explicitly asked. Edit the HTML/CSS directly.

## How to work on it
- Open any `.html` file and edit the markup directly.
- Shared styling lives in `static/site.css` (one stylesheet for every page: fonts, tokens, header,
  footer, buttons, folios, the menu stack, page pieces). Shared behaviour is `static/site.js`.
- Every page shares the same header (sticky, Deep Red, Menu takeover under 1100px), footer and
  phone dock. If you change one, change it on every page — there is no templating.
- To preview: just open the file in a browser (e.g. `open index.html` on macOS). No server needed,
  though a simple static server (`python3 -m http.server`) avoids any file:// quirks.
- Keep the writing voice warm, witty, never corporate (see Brand below).

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Homepage — hero, about, the two levels, events band, moments gallery, contact form, footer |
| `Bookings.html` | Reservations — embeds the NowBookIt booking widget |
| `Functions.html` | Private events / venue hire — links to the Events Pack |
| `Menus.html` | Food & drinks menu overview |
| `Vouchers.html` | Gift vouchers |
| `Contact.html` | Location, hours, contact details |
| `christmas-functions/`, `aperitivo/`, `negroni-bar/`, `fresh-pasta/`, `pre-stadium-dining/`, `corporate-events/`, `weddings/` | SEO landing pages, all on one template (hero → heading → split + stats → Deep Red list band → flipped split → optional `#enquire` band → FAQ → Bright Red closing band) |
| `404.html` | Not-found page (absolute `/` paths) |
| `Bar Franco Events Pack.html` | Detailed function/venue-hire pack (opens from Functions). Still on the old design: loads `static/legacy.css` + `static/legacy.js` |
| `Brand Guide.html` | Internal one-page brand guide (not linked in site nav) |

`index.html` is the home page (named `index.html` so hosts serve it automatically). All internal
nav/footer links point to `index.html`, not `Home.html`.

## Folder structure
- `index.html` + other page `.html` files — the site pages (root level); landing pages in folders
- `static/site.css` — the stylesheet (tokens at the top: Deep Red `#6C0600`, Almond `#FAD7C3`,
  Bright Red `#AF0F00`, Paper `#F1EEE6`; gutter/section/band spacing; the two type faces)
- `static/site.js` — shared JS (Menu takeover, dachshund scroll-walker on the bottom edge, `#enquire`
  scroll with the 72px header offset, the Menus food/drinks swap, the FormSubmit contact form)
- `static/fonts/`, `static/logos/`, `static/illustrations/` — the brand kit the pages use
- `static/legacy.css`, `static/legacy.js`, `static/styles.css`, `static/tokens/` — the previous design,
  kept only for `Bar Franco Events Pack.html`. Don't load them on the redesigned pages.
- `menus/` — the printed menus as PDFs (linked from Menus.html)
- `home.css`, `fonts.css`, `site.js`, `events.css`, `image-slot.js` at the root — older passes, no
  longer loaded by any page. Safe to leave; harmless.
- `brand/` — fonts (.otf) + brand marks (wordmark, dachshund, Negroni glass)
- `brand-assets/` — organized brand kit (marks + fonts + README) for designers/printers
- `images/` — all website photography, optimized for web (~150–280KB each)
- `sitemap.xml`, `robots.txt` — SEO files
- `favicon.png`, `apple-touch-icon.png`, `og-image.jpg` — icons + social share image

## Photos
All photos are **baked in** as `<img class="photo" src="images/....jpg">`. To change a photo:
1. Add the new image to `images/` (resize to ~1400px long edge, JPEG quality ~0.82 — keep files small).
2. Update the `src=""` on the relevant `<img>` and write a descriptive `alt=""` (good for SEO).

Two level photos (`images/level-negroni-graded.jpg`, `images/level-restaurant-graded.jpg`) were
**colour-graded** to match each other (warm, moody, matte blacks). If you swap them, try to keep a
consistent warm/low-key grade so the set stays cohesive. Originals like `server-tray.jpg` and
`dining-room.jpg` are kept in `images/` unmodified.

## Brand (keep edits on-brand)
- **Colours** (CSS variables at the top of `static/site.css`) — nothing else, no black, no greys:
  - Deep Red `#6C0600` (body ink, header, dark bands, footer)
  - Almond `#FAD7C3` (page ground; type on red)
  - Bright Red `#AF0F00` (menu heads, frame rules, stat numerals, one red band per page)
  - Paper `#F1EEE6` (menu sheets, the voucher, framed panels)
- **Type:** VTC Marsha Bold (display, always UPPERCASE) + Affairs Regular/Italic (body; never set in
  capitals, never fake-bold). Radius 0 everywhere; shadows only on paper objects.
- **Marks:** wordmark (the name), the dachshund (playful accent), the Negroni glass (the ritual).
- **Voice:** warm, direct, a little witty. "Come say ciao," not "Contact us."
- Full detail in `Brand Guide.html`.

## Key facts (keep accurate across pages if they change)
- Address: The Crossing, 166 Cashel Street, Christchurch Central 8011
- Hours (visible copy): bar from 4pm, kitchen from 5pm, daily, till late
- Hours (SEO schema in index/Bookings/Contact): opens 16:00, closes 22:00 — a safe default since
  real closing varies. Update the `openingHoursSpecification` blocks if this changes.
- Reservations email: ciao@barfranco.nz · phone 021 221 1307
- Events email: anamaria@barfranco.nz · phone 021 221 1307 (the contact form also goes here)
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
2. Stay on-brand (red/charcoal/cream, VTC Marsha + Affairs, witty warm voice).
3. Keep photos optimized and small.
4. Don't break the SEO tags or JSON-LD.
5. Keep facts (hours, address, contacts) consistent across all pages.
