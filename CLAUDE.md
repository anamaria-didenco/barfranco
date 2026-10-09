# Bar Franco — Website (CLAUDE.md)

This file tells Claude Code how this site is built and how to edit it. Read it before making changes.

## One stylesheet
- **Every page loads `static/franco.css` + `static/franco.js` + `static/chrome.js`** and nothing else
  (the Events Pack adds `static/events-pack.js`, Functions adds `static/functions.js`). No `<style>` blocks, no `style=""` (except `object-position`
  on an `<img>`). The design brief behind it is `DESIGN-FIXES.md`.
- **Tokens** (top of franco.css): Deep Red `--deep #6C0600` (ink), Almond `--almond #FAD7C3`, Bright Red
  `--bright #AF0F00` (heads), Spritz `--spritz #F00000` (**focus rings only, never text**),
  `--hairline rgba(108,6,0,.15)`. These four are the brand's approved palette (BarFranco_VisualIdentity.pdf, p.12) and the only
  colours on the site; hairlines are tints of them. **There is no Paper**: every page sits on Almond. No black, white, greys,
  gradients or shadows. Never write a raw hex outside the tokens.
- **Chapters**: every section is one of `ch-menu` (Almond, the page ground), `ch-aframe` (Almond, set apart by the Deep Red masthead rule above and below), `ch-night` (Deep Red),
  `ch-poster` (Bright Red), which sets its ground and inks. Pages open on `ch-menu`; at most two `ch-aframe`/`ch-night`/`ch-poster` chapters
  plus the Night footer; never two of one colour adjacent; the band before the footer is never Night; one poster at most.
- **Type**: Marsha `.m1`–`.m4` only (never below 24px, always capitals); Affairs `.a1`–`.a4`, `.fine`.
  One `<h1>` per page; heading levels descend without skips.
- **Grammar**: `.wrap .grid` + column classes; photographs `.ph r-169|r-32|r-45` (no captions, no thumbnails);
  `.frame` (double rule) for printed objects; `.ml` menu lines (`.v.r` for prices/capacities); `.line` primary
  asks (`<span>words</span><i class="lead"></i><em class="v">fact</em>` — the leader runs to a short fact where a price
  would be: Book a table … 4pm till late · Plan an event … up to 240 · Read the full menus … food & drinks ·
  Christmas parties … December; the dock and Send are the words alone. **No arrows anywhere**), `.ask` secondary; `.btn` the square ask (`.fill` for the primary of a pair); `.card` (one photograph `.ph`, a `.card-row` with the `h2.m4` name and the `.card-num` fact where a price would be, one `.card-sub` line, one `.btn`), laid out by `.cards`; `.qa` questions; `.tabs` (franco.js wires `role=tab` buttons to their panels).
- **The Table** (the design the whole site is built on; brief in `DESIGN-PHILOSOPHY.md` of the handoff): one object per
  section, say it once, photographs do emotion and type does facts. Its pieces: `.word` (a Marsha statement with an
  Affairs-italic `<em>` turn; `.h1` for the page title, `.rules` on Almond, `.night` on Night, `.close` for the last
  word, `.deep` for Deep Red ink), `.quiet` (a centred statement with its `.lines`), `.two` (two photographs side by
  side, Downstairs then upstairs), `.hosts` (the hosts' line), `.runhead` (the one-line running head under the masthead
  on pages that have no cover). Every page ends on two asks: dining pages Book a table · Plan an event, event pages Call ·
  Check your date. Menus: food is `.dish`, drinks are `.ml` with a spaced en dash. Lines that stay: (upstairs) ·
  We host. You stay. · Not a bar. A world. · Some places want to be seen. Bar Franco wants to be felt. · Come as you
  are. Leave slower than you arrived. · Ti aspettiamo. Never: "Franco means frank", any country name, "the table is my
  grandmother's". The story facts live in `/our-story/` and nowhere else is allowed to contradict them.
- **Structure like Milan, behave like Italy.** The grammar above is the discipline; each page may add one deliberate act of
  misbehaviour, never more. The page follows the building: in every Level 1 / Level 2 pair (`.two`) downstairs sits
  lower than upstairs, and in the three-chapter strips (`.fn-three`, `.x-three`, `.ev-three`) 02 Upstairs sits highest.
  **Text never overlaps a photograph**, with one exception the owner chose: Home's hero (the editorial layout below). **No oversized words or numbers**
  (no giant 240, STAY or 17:00 spread across a page): the owner rejected them; facts stay at heading size or smaller.
  No checkerboards, Vespas, postcards or trattoria red-and-white.
- **Art direction, three standing rules.** Cinema: on desktop full-bleed photographs (`.ph.full.r-169`) are cut 2.39:1,
  film stills not banners (a map keeps its height). No watermark: photographs never carry the Franco script (`.mark` is retired);
  the Bar Franco script (`static/logos/bar-franco-script-incline/`) heads Home's hero above the running line. One grade: every photograph carries the same warm matte grade (`.ph>img` filter), so the library reads as one shoot.
- **Every page opens on a hero photograph** (`<div class="ph opener" data-unmask>` first in `<main>`, before the running
  head): full width, cut wide on desktop (`clamp(340px, 100svh - 300px, 760px)` tall), 4:5 on phones, no text on it.
  Home's hero is the table from above under the Bar Franco script. The hero counts toward one photograph, one page.
- **Editorial hero on every page (except Functions and Christmas, left as they were):** each page opens on `.pg-hero`, the
  hero photograph with the running line (`.pg-hero-k`) and the page title (`h1.pg-h1`) set on it; the masthead lies
  transparent over it in Almond (no rule, no dachshund). Chapter labels carry their number in `.ch-n`, which hangs in the
  left margin on wide screens. **On phones every page follows Home's phone layout** (the last block of franco.css): the chapter
  number and its rule sit in a narrow left margin, text is indented from it and reads left (no centred sections), photographs
  break out to alternate edges (odd chapters bleed right, even chapters bleed left; `.two` and the three-chapter strips
  alternate photo by photo), and frames and cards keep the full measure.
- **Less text (owner's call):** no "Good to know" / question sections on any page except Functions, Christmas and the
  Events pack, and so no FAQPage schema on those pages; event pages keep one quote and no "Set up your way" list.
  On phones the type is calm: two display sizes, one reading size (18px), one small italic (15px); menu lines drop
  their dotted leader so the fact sits right on the first line. Paragraphs are one short sentence. On a page that is not Menus, never print half a menu: the dining and event pages show a framed menu cover (the
  letterspaced name, which menu, one line, one `.btn.fill`) that opens the full typed menu on `/menus/#sheet-…`. On phones the
  dock carries the page's ask from the first screen (chrome.js `calm`), so the cover's and closing section's copies of it hide.
  Say it once and short: one lead sentence under the hero, no paragraph repeating a card or a heading, no line under
  a closing word or a poster title that the ask already says; chapter numbers run 01, 02, 03 with no gaps.
- Between pages the masthead holds still while the page turns (CSS view transitions; the inline `fx` script in each `<head>` carries their handler).
- **Motion** only via `data-set` (page title), `data-unmask` (a chapter's lead photo), `data-settle` (framed objects).
  franco.js shows whatever is on the first screen at once (`data-now`) and moves the rest once as it is seen; at 2.5 s
  everything is on regardless, and reduced-motion gets no movement at all.
  One scroll-driven movement lives in CSS only (where the browser supports `animation-timeline`, never under reduced
  motion): full-bleed photographs (`.ph.full`) drift a few percent inside their frames.
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
  (open page marked `aria-current="page"` with Franco the dachshund under it; on phones the nav hides and the
  Index button shows), the phone Index `#ora-index`, the Night footer (it opens on the sign-off "Ti aspettiamo, we're waiting for you."; **no live status,
  clock or date anywhere on the site**, the owner removed them; chrome.js fills `data-bf-year`) and the phone dock.
  Change them on every page. The footer (`.bf-foot.ft`) is curated: the sign-off set as a word, four quiet columns under one
  hairline (Find us · Say ciao · Franco · More, the open page underlined), then a base line (© · emblem · Instagram · Facebook);
  each fact once, no asks in it. Home and Contact use the lite footer (`.bf-lite`: no Find us / Say ciao, as they show them above).
  Functions and Christmas still carry the older footer until the owner says otherwise.
  Christmas has its own campaign masthead (`.mast-campaign`: Hold a date · Call; the Index button always shown).
  Pages without a cover photograph carry the `.runhead` line under the masthead instead.
  **Home is phone-first, the dock is the store:** on phones Home's dock (Book a table · Plan an event) shows from the first
  screen to the footer and never hides (chrome.js `always`); Home's inline copies of those two asks (`.g-hero-ask`, `.hm-dup`) hide on
  phones. Every phone screen passes the desire test (a photograph, a line or a colour moment, plus the dock); the first screen
  is script, photograph and Not a bar. A world. above the dock on phones from 375×667 up.
- franco.js also runs the FormSubmit contact form (`<form data-email data-subject>`, honeypot, Ads conversion)
  and the VenueFlow iframe height.
- To preview: a static server from the repo root (`python3 -m http.server`) — pages use root paths.
- Keep the writing voice warm, witty, never corporate (see Brand below).

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Homepage, on the owner's editorial reference layout with the live site's copy: **no masthead band on Home** (`.bf-mast` hidden); the tray hero (`cocktail-tray.jpg`) with the Bar Franco script, the nav and a boxed Book a table on it (Index on phones), `h1` Modern Italian restaurant & Negroni bar over the photograph, the note Aperitivo sempre; Dine & host (intro sentence, Book a table · Plan an event); numbered chapters 01 Dine at Franco (three dishes, Read the full menus), 02 The Negroni Bar (Deep Red, photograph right), 03 Host at Franco (wide photograph), 04 Come say ciao (details). JSON-LD Restaurant (`#restaurant`) + WebSite |
| `our-story/` | Our story: the approved copy from the handoff (cover, the rules on Almond, the letter, Two levels on Night, Come as you are). The only place the story facts are told; the press bio lives here too |
| `bookings/` | Reservations, on the Table: cover with the NowBookIt widget, Pick a level, the Planning something bigger? Poster |
| `functions/` | Private events, on the Table: the nameplate cover, At a glance `#hook`, The night on Night, `#spaces`, `#food` (the EVENTI card), `#questions` (six), `#enquire` (the VenueFlow card with the coaster beside it: turns over, cycles `images/coaster/`, the one drop-shadow on the site), the seasonal Christmas Poster band `#christmas` (remove after December). JSON-LD EventVenue `#venue` (the one the event pages reference). Behaviour in `static/functions.js` |
| `menus/` | Food & drinks menu overview (the folder also holds the printed menu PDFs) |
| `vouchers/` | Gift vouchers |
| `contact/` | Location, hours, contact details |
| `christmas-functions/` | Christmas landing page, on the Table: campaign masthead `.mast-nav.mast-campaign` (Hold a date · Call; phones show Hold a date only), the CHRISTMAS sign cover, `#menu` on Almond, `#night` on Night, `#rooms`, `#details`, `#enquire`, Call / Enquire phone dock. Keep the Google Ads conversion tags and the `bf_*` dataLayer pushes verbatim |
| `aperitivo/`, `negroni-bar/`, `fresh-pasta/`, `pre-stadium-dining/`, `corporate-events/`, `weddings/`, `private-dining/` | SEO landing pages on the Table (the four dining pages share `.pg-dine`: cover, the sign, the recipe card, nights, and Before the stadium keeps its Te Kaha fixtures lines by hand; weddings, corporate and private dining & birthdays share the `.ev-*` template) |
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

**Banned photographs (owner's call, never use again):** the bartender in the striped shirt at the back bar
(was `bar-bartender.jpg`), the chef with the steel bowl in the open kitchen (was `chef-open-kitchen.jpg`), and
any photo showing the old yellow artichoke pendant lamps; the site shows the new pendants only.

**Curated: one photograph, one page.** No photograph appears on two pages (the coaster set aside). Each page's
pictures are chosen as a set for its subject; before using a photo, check it isn't already on another page:
`grep -l 'images/<name>.jpg' index.html */index.html`. **Careful: many files are the same shot under another name**
(e.g. `hero-table` = `aperitivo-table-cheers` = `aperitivo-table-menus`; `dining-pasta` = `pasta-marble-table`;
`server-tray` = `level-negroni-graded`; `bar-dancing` = `party-dancing-bar`), so compare the pictures, not the names. The library
is close to used up: ask the owner for new photographs rather than repeating one. Header photographs never repeat across pages.

**Functions, Christmas, Private dining and Corporate events are on the owner's events design (from her Claude Design handoff, `Bar_Franco_xmas.zip`).** They
load `static/sd-events.css` after `editorial.css` and `static/sd-events.js` (`defer`, before `editorial.js`). The `<html>` class is the
switch: Christmas `sd`, Functions and Private dining `sd sd-lift` (letters rise instead of hanging on a thread). Both open on the cream cover
(`#sdCover[data-hero]`: a three-photo strip, the banner word in VTC Marsha with the dachshund, a subtitle, a facts line, the three
buttons, one quote), then a two-photo band, the hover index, the page's sections, the "Pick your night" calendar and the VenueFlow
form in the Eventi frame. **Keep on every edit:** the live `<title>` (the handoff's "Samuel Day ·" prefix was removed), the
`googletagmanager.com/gtag/js?id=AW-18456342571` loader line (the handoff dropped it) with its `gtag('config')` and conversion
calls, and Christmas's `bf_*` dataLayer pushes and `data-track` attributes. **Calendar and form:** `#sdHold` can carry `data-months="10,11"` (Christmas shows only November and December and opens on December via `data-mo="11"`). The picked date is appended to the VenueFlow iframe `src` as `prefillDate` (plus `prefillGuests` / `prefillFormat` where the room finder exists). Lunch is stated on all three pages (cover facts, lede, FAQ). Corporate events is a copy of Functions (`sd sd-lift`, the room finder, levels, questions, calendar) with Corporate's own head (title, meta, Ads tracking, no FAQPage schema), its wording and the photos moved around. Private dining has no room finder (the script copes
without one); its calendar closes 24 December to 5 January (`data-close="24"`) and `data-guests="0"` keeps the guest count out of
its held-date message. Functions keeps the room finder (a guest slider that lights the floors that fit); its opening photo is
`images/negroni-night-dancing.jpg`. All three calendars close from 24 December (the venue is open until the 23rd). Our story keeps one
small portrait of Ana‑Maria beside the title (`.st-open`). **Every other page keeps the layout it has on the live site**: the owner
asked for no changes beyond Functions, Christmas, Private dining and Our story.

Two level photos (`images/level-negroni-graded.jpg`, `images/level-restaurant-graded.jpg`) were
**colour-graded** to match each other (warm, moody, matte blacks). If you swap them, try to keep a
consistent warm/low-key grade so the set stays cohesive. Originals like `server-tray.jpg` and
`dining-room.jpg` are kept in `images/` unmodified.

## Brand (keep edits on-brand)
- **Colours:** Deep Red `#6C0600` ink, Bright Red `#AF0F00` heads, Almond `#FAD7C3` the ground,
  Spritz `#F00000` the focus ring only. Nothing else. Each chapter fixes its inks — see "One stylesheet" above.
- **Type:** VTC Marsha Bold (display, always UPPERCASE) + Affairs Regular/Italic (body; never set in
  capitals, never fake-bold). Radius 0 and no shadows anywhere.
- **Marks:** wordmark (the name), the dachshund (playful accent), the Negroni glass (the ritual).
- **Voice:** warm, direct, a little witty. "Come say ciao," not "Contact us."
- **Leader dots (owner's rule):** dots between a name and its price or fact sit LOW on the baseline,
  like full stops, never in the middle of the line. One rule in `static/editorial.css` draws every leader.
  On phones (≤620px) there are no leader dots at all (owner's call); the fact still sits at the end of the line.
- **Menus page = the printed menus.** The Food and Drinks sheets on `/menus/` are typed exactly as the
  printed PDFs in `menus/`: food centred, one dish per line, a short run of dots, then the price; drinks
  left-aligned, `Name – italic description`, dots across to the price; Birra and Non-alc side by side.
  Normal case (never capitals) for dishes and drinks. When the PDFs change, retype the sheets to match.
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
and JSON-LD structured data (Restaurant / EventVenue / WebSite on the homepage; FAQPage only on pages that show the Q&A, such as Functions). When editing:
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
