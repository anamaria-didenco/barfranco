# DESIGN-FIXES.md — Bar Franco digital grammar, every page

Implementation brief for Claude Code. Approved by Ana-Maria, 1 Oct 2026: **all packages P0–P10**, paper **#F1EEE6**.
Supersedes the previous DESIGN-FIXES.md (homepage only, 18 Sep).

The design source is `Creative Direction Audit.dc.html` (Omelette project). Everything it asks for is
encoded in two new files and one rebuilt page. Copy them in first, then re-plate every other page the same way:

| File | What it is |
|---|---|
| `static/franco.css` | **The** stylesheet: tokens, colour chapters, type scale, grid, photographs, frames, menu lines, buttons, masthead, phone Index, dock, footer, questions, tabs, motion |
| `static/franco.js` | The three movements (set · unmask · settle) and the phone Index. Replaces `static/ora.js` |
| `index.html` | **Reference implementation.** Home rebuilt on franco.css; copy its masthead, Index, footer and dock |

`static/chrome.js` stays, unchanged: it tightens `.bf-mast`, slides `.dock`, and runs the footer clock.

## Ground rules

1. Keep verbatim on every page: `<title>`, meta description/keywords, canonical, Open Graph/Twitter, every
   JSON-LD block, the gtag / Google Ads scripts and conversion labels, URLs, form endpoints, iframe `src`s.
2. Don't rewrite copy. The only copy changes are the ones listed below.
3. No new colours, fonts, radii, shadows or gradients. Inks: `#6C0600` Deep Red, `#FAD7C3` Almond,
   `#AF0F00` Bright Red, `#F00000` Spritz (focus ring only), paper `#F1EEE6`.
4. Styling lives in franco.css. Pages carry **no `<style>` block and no `style=""`** — except
   `object-position` on an `<img>` and the one `margin-top:var(--between)` before a Night chapter that follows paper.
5. Work in the order below and check each step against its acceptance criteria before moving on.

## The page head (every page; prefix `../` in folders)

Replace every stylesheet/script link after the JSON-LD with exactly:
```html
<script>document.documentElement.classList.add('fx')</script>
<link href="static/franco.css" rel="stylesheet"/>
<script defer src="static/franco.js"></script>
<script defer src="static/chrome.js"></script>
```
Remove: `static/styles.css`, `static/ora.css`, `static/chrome.css`, `static/site.css`, `static/site.js`,
`static/ora.js`, `static/tokens/fonts.css`, `static/pages/christmas-v5.css` and each page's `<style>` block.
The Events Pack also keeps `static/events-pack.js` (after step 1's edit).

## The grammar, as classes (see franco.css for values)

| Need | Use |
|---|---|
| A section | `<section class="sec ch-menu">` (paper) · `class="ch-aframe band"` (Almond) · `class="ch-night band"` (Deep Red) · `class="ch-poster band"` (Bright Red). Inner: `<div class="wrap grid">` |
| Ground rules | Page opens on paper; ≤ 2 non-paper chapters per page + the Night footer; never two of one colour adjacent; band before the footer is never Night; Poster max once, Marsha + one italic line + one ask |
| Columns | `.at-1` (1–6) · `.at-1-5` (1–5) · `.at-1-8` · `.at-7` (7–12) · `.at-8` · `.at-all`. Text starts on column 1 or 7 |
| Eyebrow | `<p class="eyebrow">Bar Franco · 03 · The spaces</p>` — every section numbered in order, or none |
| Type | `.m2.title` page title (h1) · `.m2` chapter opener / closing sign · `.m3` section head · `.m4` category head (24px, never smaller) · `.a1` the one statement · `.a2` ledes & lines · `.a3` body · `.a4` notes · `.fine` legal · `.sup` small AT/AND/ST inside `.m2` · `.aside` italic (upstairs) inside `.m2` |
| Primary ask | `<a class="line" href>Book a table</a>`; two stack inside `<div class="lines">`. Max one per section |
| Secondary ask | `<a class="ask" href>Read the full menus</a>` |
| Link in text | `<a class="link">` |
| Facts / prices / capacities | `<p class="ml"><span class="n">Seated</span><i class="lead"></i><span class="v r">90</span></p>` (`.v` italic and may wrap, `.v.r` roman and never wraps — use it for every price, capacity and number) inside `.lines-list` |
| Printed object (menu, card, voucher, enquiry, events index) | `<div class="frame menu">…</div>` — category heads `.m4`, lines `.ml`, emblem `.emb` at the foot |
| Photographs | `<div class="ph r-169 full">` full-bleed (one per page, `<img class="mark">` script in a corner) · `<div class="pair"><div class="ph r-32 p7 bleed-l">…<div class="ph r-45 p4">` editorial pair (`.flip` mirrors) · `.print` + `.mat` photo on the table (once per page). Ratios 16:9, 3:2, 4:5 only. No captions, no thumbnails |
| Questions | `<div class="qa"><details><summary>Question</summary><p>Answer</p></details>…</div>` |
| Tabs | `<div class="tabs" role="tablist"><button role="tab" aria-selected="true">Food menu</button>…</div>` |
| Motion | `data-set` on the page title / cover sign · `data-unmask` on a chapter's lead photograph · `data-settle` on framed objects. Nothing else moves |

## 1 · Fix first (P0)

**1a Events Pack freeze.** `events-pack/index.html`: `.pk-cols2{columns:2 280px}` freezes Chromium at ~920px
wide (multi-column + container-query children). Replace with a two-column grid:
`.pk-cols2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:clamp(24px,4vw,64px)}` and
one column under 900px. In `static/events-pack.js` delete the `mouseenter`/`mouseleave` hover-to-open block
(chapters open on click/tap only) and open `#ch-welcome` on load.
- [ ] The page loads and scrolls at 920, 1024, 1280, 1440 and 390px without stalling.
- [ ] Hovering a chapter does nothing; clicking opens it; Welcome is open on load; `#ch-drinks` deep links still work.

**1b Functions capacity leader.** On phones Level 2's "Standing … 120" leader collapses (`.g-right`).
Fixed by step 4's menu card; until then remove `g-right` from the Level 2 block.
- [ ] Both levels' leaders are the same length at 390px.

## 2 · Shared chrome on every page (P1 P2 P3 P4 P5 P10)

Pages: `index.html`, `Menus.html`, `Functions.html`, `Bookings.html`, `Vouchers.html`, `Contact.html`,
`christmas-functions/`, `events-pack/`, `weddings/`, `corporate-events/`, `aperitivo/`, `negroni-bar/`,
`fresh-pasta/`, `pre-stadium-dining/`, `404.html` (absolute `/` paths).

Copy from `index.html`, fixing paths and `aria-current`:
- **Masthead** `<header class="bf-mast">`: emblem · nav (dachshund `<img class="mast-dog">` under the open page) ·
  two written asks · Index button · `<div class="rule2">` (the double rule). On pages with an enquiry form,
  "Plan an event" points to `#enquire`. **Christmas**: same masthead, nav replaced by two asks
  `Call 021 221 1307` (tel:) and `Enquire` (#enquire).
- **Phone Index** `#ora-index.ch-aframe` with the framed card. Delete every `.tk` takeover and its markup.
- **Footer** `<footer class="bf-foot ch-night">` with `.foot-body` (two `.line` asks + the five fact lines,
  see Contact below) — `bf-lite` on Home and Contact. Delete the `.bf-pills` row; its links live in `.foot-more`.
- **Dock** `<nav class="dock ch-night">` with two `.line` asks. Delete `.m-dock`, `.x5-dock`, `.f-spacer`, `.ft-spacer`.
- Remove the dachshund scroll-walker (`.walk`, built by site.js) everywhere.

Acceptance:
- [ ] The masthead, Index, footer and dock markup is identical on every page apart from paths, `aria-current` and `#enquire`.
- [ ] No page contains `bf-pill`, `class="tk`, `x5-mast`, `m-dock`, `g-ask`, `class="lb`, `class="sb"`, `walk`.
- [ ] The footer is Deep Red with Almond type on every page; OPEN TILL LATE is never larger than the page's h1.
- [ ] Body background is `#F1EEE6` everywhere; `#FCFBF7` appears nowhere in the repo.

## 3 · Home (done — reference)

`index.html` is already re-plated: cover hero; 01 Dine & host; 02 The room (one editorial pair);
03 The menus (print on the table); 04 Host at Franco on Night; 05 The spaces; 06 on Almond headed
"(upstairs) 166 Cashel St"; Night footer (lite). Copy changes made: 06's head (was "Come say ciao", which now
belongs to Contact) and its line "The Crossing, Ōtautahi — down the laneway, from 4pm."
- [ ] Sections numbered 01–06 in order; every photo 16:9, 3:2 or 4:5; one full-bleed photograph.

## 4 · Page by page

**Menus (`Menus.html`)** — Chapter hero: eyebrow, `.m2.title` "The menus", lede, tabs; lead photograph
`images/parmigiana-cacio-overhead.jpg` (no longer Home's). The sheets section becomes `ch-aframe band`;
each sheet is `<article class="frame menu" data-settle>` with the spaced word-mark
`<p class="m1" aria-label="Franco"><span>F</span>…<span>O</span></p>` (sized inside frames by
`.frame .m1`), `.m4` section heads and the existing
centred lines (keep the "… price" ellipsis — it is the printed menu's grammar). Tabs use `.tabs`.
Move the "01 · The menus" eyebrow above the section. 02 Cooked with care: one `.pair` with
`chef-wink.jpg` + `burrata-tomato-close.jpg`. Closing "Hungry yet?" stays `ch-aframe band`.
- [ ] One tab style; sheets framed at inset 10 on Almond; no photo also leads another page.

**Functions (`Functions.html`)** — Keep h1 "No hire fee." and the framed "In this issue" index (as
`.frame` with `.ml` rows). Hero asks: one `.line` "Enquire now" + `.ask` "View the events pack"; the PDF link moves
into the enquiry card. 01 Enquire: `ch-aframe band`, the VenueFlow iframe inside `.frame`. 02 head becomes the
page's existing line **"From an intimate private dinner to a 240-strong cocktail party"**; delete the 240 / 2 / 0
statistics row. 03 The spaces: one `.frame menu` card — `.m4` "Level 1 · The Negroni Bar" (Standing … 120,
Seated … 80), `.m4` "Level 2 · The Restaurant" (Standing … 120, Seated … 90), "The whole building — both levels … 240",
`.fine` "A food and beverage minimum spend instead of a hire fee" — beside one `.pair`
(`cocktail-tray-branded.jpg`, `level2-event-table.jpg`). 04 Occasions unchanged in content, `.m4` heads in two
columns with hairlines. Delete the gallery section. The Christmas cross-sell becomes `ch-poster band`:
`.m2` "Booking the work do?", `.it` "December dates go first — lock yours in.", one `.line` "Christmas parties".
- [ ] "No hire fee" appears in the h1 and once as a fact line only (plus the FAQ answer).
- [ ] No level name is larger than its section head; no Marsha below 24px.
- [ ] ≤ 7 phone screens (390px) before the footer.

**Christmas (`christmas-functions/`)** — Move onto franco.css: the force-justified CHRISTMAS sign = `.m1`;
the card = `.frame menu` on `ch-aframe band`; the buttons = `.line`; the chapter row = `.tabs` (keep its
show-one-chapter script and dataLayer pushes); 04 The night opens on `ch-night`; the enquiry box = the framed
enquiry card. Shared masthead (Call · Enquire), dock and Night footer (lite). Keep the Google Ads tags verbatim.
- [ ] Looks as it does today, but every component comes from franco.css; christmas-v5.css is no longer loaded.

**Weddings · Corporate (`weddings/`, `corporate-events/`)** — Rebuild on the Functions structure: Chapter hero
(eyebrow, `.m2.title`, lede, one `.line` to #enquire, one `.ask` to Functions), lead photograph
`event-table-setting.jpg` (weddings) / `level2-corporate.jpg` (corporate) as `.ph r-169 full` with the script;
enquiry `ch-aframe band` + framed card; 01 Why Franco (`.m3` + body + one photo, no statistics);
02 formats as `.m4` heads with hairlines; 03 food as a `.frame menu` card with the existing prices as lines
(Seated shared menus from … 80pp · Grazing tables from … 40pp); 04 questions `.qa`; closing `ch-poster band`
("Amore, the Italian way" / "The work do, sorted") with one `.line`.
- [ ] No `.stats`; no Marsha under 24px; lead photographs unique.

**Aperitivo · Negroni Bar · Pasta fresca · Before the stadium** — Same template, dining version: hero ask is
`.line` "Book a table"; 02 "on the board" becomes a centred `.frame menu` card using the real menu lines
(drinks: `Name — <em>Ingredient, Ingredient</em> … price`; food: `Name, ingredients … price`); Aperitivo and
Negroni Bar set 01 on `ch-night`; closing `ch-aframe band` with `.line` "Book a table". Lead photographs:
`social-aperitivo.jpg`, `level-negroni-graded.jpg`, `pasta-marble-table.jpg`, `level1-bar-crowd.jpg`.
- [ ] Each page's lead photograph is used as a lead nowhere else.

**Bookings (`Bookings.html`)** — Remove the three hero thumbnails; title, one line and the widget sit in the
first screen. NowBookIt iframe inside `.frame` (`#book`) with a `.m4` "Reserve" label and `.a4` "Live availability".
Change `font=Lora` to the vendor's closest serif. Remove the photo caption; lead photograph `room-tables-bentwood.jpg`.
- [ ] No thumbnails, no captions; the widget is visible without scrolling at 1440×900.

**Contact (`Contact.html`)** — Keep h1 "Come say ciao". Details become `.lines-list` under `.m4` heads
FIND US · TABLES · EVENTS (same lines as the footer). The form goes inside `.frame` on `ch-aframe band`:
underline fields, italic labels, Send = `<button class="line" type="submit">Send</button>`; keep the FormSubmit
endpoint and messages. The map is full-bleed 16:9 with no rule above it.
- [ ] No Marsha below 24px; no solid button; the form still submits.

**Vouchers (`Vouchers.html`)** — Remove the two-item contents list. The voucher is `.frame menu` with
`data-settle` on `ch-aframe`; 01's head is dropped so the voucher leads; the closing "Give them a night at Franco"
becomes `ch-poster band` with one `.line`.
- [ ] One message, said once; one framed object.

**Events Pack (`events-pack/`)** — After step 1: rebuild its `<style>` block into franco.css components
(no `[style*=…]` selectors, no `!important` chains, no size declared twice). Chapter rows: number · `.m3`-sized
Marsha title (22–32px is too small; use `.m4` 24px minimum) · italic line · "Open ↓" — delete the 48px thumbnails.
Food tab heads in Bright Red, not `#F00000`. Night chapters and `#contact` stay `ch-night`.
- [ ] No `#F00000` text; no thumbnails; page weight of CSS ≤ the old block.

**404** — Utility opening on franco.css: `.m2.title`, one `.a2` line, two `.line` asks; delete the 96–240px numeral style.

## 5 · Global checks (grep the repo)

- [ ] `style="` only on `<img>` (object-position) and the Night margin; no `<style>` blocks in pages.
- [ ] No `#FCFBF7`, `#000`, `rgba(0,0,0`, `box-shadow`, `border-radius` (except the dock dot: none left), `text-shadow`.
- [ ] No `data-rv`, `.g-ph`, hover-to-open, `.walk`, heading shrink-to-fit script.
- [ ] Breakpoints only 640 / 900 / 1200 (franco.css also uses 1000 for the masthead nav).
- [ ] VenueFlow and NowBookIt iframes no longer request `font=Inter` / `font=Lora`.
- [ ] Lighthouse: no CLS regression (every `<img>` has width/height), hero not lazy-loaded.
- [ ] `prefers-reduced-motion`: nothing moves.

## 6 · Clean up

Delete (loaded by nothing): `home.css`, `events.css`, `events-page.css`, `fonts.css`, root `site.js`,
`image-slot.js`, `static/legacy.css`, `static/legacy.js`, then — once step 4 is done — `static/styles.css`,
`static/tokens/`, `static/ora.css`, `static/ora.js`, `static/chrome.css`, `static/site.css`, `static/site.js`,
`static/pages/christmas-v5.css`. Update `CLAUDE.md`: replace "Two systems are live" with "One stylesheet:
static/franco.css (+ franco.js, chrome.js)"; fix the colour names (Bright Red `#AF0F00`, Spritz `#F00000` focus only,
paper `#F1EEE6`) and delete "red/charcoal/cream" from the golden rules.

## 7 · Second pass — ask of every screen, at 1440 and 390

1. Is the page on paper `#F1EEE6`, with at most two other chapters and the Night footer?
2. Is every headline one of the four Marsha sizes, and nothing in Marsha under 24px?
3. Is every ask a menu line or a written ask with the drawn arrow?
4. Is every framed thing a printed object (menu, card, voucher, enquiry, index) — and nothing else framed?
5. Is every photograph 16:9, 3:2 or 4:5, uncaptioned, and leading only this page?
6. Do only the title, the lead photograph and the framed objects move?
7. **Could this only be Bar Franco?** If not, name the missing rule from the audit — don't add decoration.
