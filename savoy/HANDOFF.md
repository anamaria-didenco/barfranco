# Bar Franco — Savoy-layout rebuild · handoff

Static site, no build step. Open `index.html`, or serve the folder with any static server.

## Structure
- `index.html`, `<slug>/index.html` — one page per live URL on barfranco.nz (same slugs: /menus/, /functions/, /christmas-functions/, /corporate-events/, /private-dining/, /weddings/, /events-pack/, /aperitivo/, /negroni-bar/, /fresh-pasta/, /pre-stadium-dining/, /our-story/, /bookings/, /vouchers/, /contact/) plus `404.html`.
- `static/savoy.css` — the whole design: Savoy section measurements, Bar Franco palette (deep red #6c0600, paper #f1eee6, almond #fad7c3, menu red #a62026), VTC Marsha + Affairs.
- `static/savoy.js` — hero fade, lift menu, intro letter reveal, spotlight tabs, card carousel, pinned history grid, reveals. Every block is guarded, so a page without a section still runs.
- `static/fonts/`, `static/logos/`, `static/illustrations/`, `images/` — brand assets and colour-graded photography (web-sized).
- `_generator/` — `gen.py` (blocks + page shell), `pages.py` (all copy), `seo_heads.json` (the live site's heads). `python3 pages.py` regenerates every page.

## SEO — carried over from the live site, verbatim, per page
Each page's `<head>` keeps the live page's `<title>`, meta description, robots, canonical, Open Graph, Twitter card, geo/ICBM tags, JSON-LD schema, and the Google Ads gtag + conversion script (phone/email/VenueFlow labels). Links use the same slugs, so canonicals still match.
Still to do before go-live: `og:image` paths point at `/images/og/*.jpg` as on the live site (bring those files across); internal links are written as `menus/index.html` relative paths — rewrite to `/menus/` if deploying with clean URLs; add `sitemap.xml` and `robots.txt` from the current site; re-check `hreflang`/`lang` (set to en-NZ).

## Not yet wired
- Bookings and vouchers link out to NowBookIt (the live site embeds the widget). The VenueFlow enquiry iframe is not embedded; enquiry CTAs go to events@barfranco.nz.
- Contact form and newsletter form are static (no action).
- The Events Pack PDF download link is not included; the pack is rendered as a page.
- The lift menu is Bar Franco's own; the Savoy's menu was not copied.

## Copy
Facts (prices, capacities, hours, quotes, contacts) are from the live site. Prose was rewritten in the Savoy's register (third person, measured). Headlines in the giant intro blocks were condensed to fit two lines.
