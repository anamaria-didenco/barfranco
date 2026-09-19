# DESIGN-FIXES.md — Bar Franco homepage (barfranco.nz)

Implementation brief for Claude Code. Source of truth for the design: option **6a** in
`Bar Franco - Website Critique & Pathways.dc.html` (the Omelette board, turn 6).
Approved by Ana-Maria, 18 Sep 2026.

**Scope: the homepage only** (`index.html` + `home.css`). Menus and Functions follow later —
do not restyle them in this pass, but do not break them either: any token or shared-component
change must keep those pages rendering.

**Ground rules**
- Keep the existing section order. This is a re-plate, not a rebuild.
- No new colours, fonts, radii or shadows beyond the tokens in §1.
- Everything inline-styled in the mockup should land as normal classes in `home.css`.
- Respect `prefers-reduced-motion` on every animation touched.

---

## 1. Tokens — align to the official Semibold palette

`home.css` currently runs approximations. Replace the values (keep the variable names so nothing
else breaks):

| Token | From | To | Name |
|---|---|---|---|
| `--red` | `#E51F1A` | `#F00000` | Franco Red / Bright Red |
| `--red-deep` | — (add) | `#AF0F00` | Red Deep / Spritz |
| `--oxblood` (`--charcoal`) | `#690500` | `#6C0600` | Oxblood / Deep Red |
| `--peach` (`--cream`) | `#FAD6C2` | `#FAD7C3` | Peach / Almond |
| `--paper` | `#FCFBF7` | `#FCFBF7` | unchanged |

Derived values must be **opacities of those four, never new hues**: hairline `oxblood/.16`,
muted text `oxblood/.62`, red rule `red/.32`, photo scrim `oxblood` gradient.

**Reverse to peach, never white.** Every `#fff` that sits on red or oxblood becomes `#FAD7C3`.
Filled buttons use `--red-deep` (`#AF0F00`) as the ground so peach labels at 15–17px clear
4.5:1 contrast; bright red is for headlines and marks only.

Button states: primary `#AF0F00` → `#6C0600` on hover; light (on dark) `#FAD7C3` → 86% peach;
ghost-light transparent/peach border → peach fill with `#AF0F00` text.

---

## 2. Nav — two rows, hours always visible

Replace the current single-row nav. Over the hero it is transparent; on scroll it collapses.

**Top row (84px):** script wordmark (`bf-script-flat-peach.svg`, 48px) · links
`Bookings · Functions · Menus · Vouchers · Contact` in Affairs italic 16.5px, current page carries
a 1.5px peach underline, others get `peach/.5` on hover · Instagram + Facebook circles (36px,
1.2px peach border, fill `#F00000` on hover) on the right.

**Second row (40px):** `oxblood/.42` band, 1px peach/.18 rules top and bottom —
left `The Crossing · 166 Cashel Street, Christchurch` (Affairs italic 13px) ·
centre `BAR FROM 4PM · KITCHEN FROM 5PM · DAILY TILL LATE` (VTC Marsha caps 12px, `.12em`) ·
right `03 925 9208 · @bar__franco`.

**Scrolled state (72px, `peach/.92` + 10px backdrop-blur, hairline bottom):** emblem
(`bf-emblem.svg`, 30px, red) + divider + `BAR 4PM · KITCHEN 5PM` left · links with a red
underline on the current page · **Reserve a table** (primary) right.
Keep the existing hide-on-scroll-down / show-on-scroll-up behaviour in `site.js`.

**No booking button over the hero** — the hero's own CTA covers it. The nav button exists only in
the scrolled state, so the page always has a booking in reach once you scroll.

**Mobile:** 60px nav row (wordmark + burger) with a 30px `oxblood/.45` strip beneath carrying
`BAR 4PM · KITCHEN 5PM · TILL LATE` in Marsha caps.

---

## 3. Hero — full-bleed photograph, one message, one CTA

- **Photograph:** `assets/photos/aperitivo-table-cheers.jpg`, `object-fit: cover`,
  `object-position: 50% 46%`, 880px tall desktop / 720px mobile. Alt text:
  *"Aperitivo at Bar Franco, Christchurch — a Negroni, a spritz and antipasti on a marble table"*.
- **Scrim:** `linear-gradient(180deg, oxblood/.42 0%, oxblood/.06 30%, oxblood/.5 62%, oxblood/.9 100%)`.
  (Ana-Maria may want the 62% stop softened to ~.3 — check before shipping.)
- **Copy, bottom-left:** eyebrow `MODERN ITALIAN · THE CROSSING, CHRISTCHURCH` (italic caps,
  `.34em`, peach/.85) → `h1` **SOME PLACES WANT TO BE SEEN.** (Marsha caps 54px) →
  *Bar Franco wants to be felt.* (Affairs italic 42px) → one body line
  "Italian restaurant and Negroni bar at The Crossing, in the middle of Christchurch." →
  **Reserve a table** (light) + "Have a look around ↓".
- **Remove** the old second headline and both SEO sentences from the hero — those move to meta (§7).
- **Hours stamp, bottom-right:** peach block, `OPEN DAILY` italic caps → `BAR 4PM / KITCHEN 5PM`
  (Marsha 20px, `#AF0F00`) → *Both till late*. Beside it, the Negroni mark at 110px using
  **`assets/marks/franco-negroni-peach-clear.png`** (peach line art, transparent glass, no baked
  shadow — supersedes `franco-negroni.png` on dark grounds; do not add a CSS drop-shadow).
- State the hours **twice at most per screen** (strip + stamp). No third mention in body copy.
- **Mobile order: message first, photo second** — wordmark, headline, hours strip, CTA all above
  the fold; never reorder the photo above the copy.
- Keep the dachshund scroll-progress walker (`franco-dog-peach.png` on a 3px red track).

---

## 4. Section rhythm and photography

Grounds cycle **paper → peach → oxblood → one red band → paper → oxblood → peach → oxblood**.
Max one red section on the page.

1. **Marquee strip** (peach, red Marsha caps, 32s linear) — unchanged, copy trimmed to
   `Pasta fresca · Aperitivo · Negroni bar · Private events · Cocktails · Two levels · Open kitchen · Till late`.
2. **About** (paper) — two columns. Left: a three-photo cluster —
   `chef-wink.jpg` (tall, spans two rows), `room-tables-bentwood.jpg`, `burrata-tomato-top.jpg`.
   Right: eyebrow → `h2` **WE DON'T PERFORM. WE HOST.** (60px) → *Well. Mostly.* (italic 28px) →
   two short paragraphs → **View our menu**.
3. **Two levels** (oxblood) — the existing two photo cards, full-bleed with an
   `oxblood 0% → .86` bottom gradient, Level 1 / Level 2 labels, 40px Marsha headings.
4. **Private events** (the one red band, `#AF0F00`) — `h2` **THE LONG TABLE IS YOURS.** + proof
   copy + **Plan your event** + a three-photo block (`event-long-table`, `event-bar-room`,
   `event-room-wide`).
5. **Moments** (paper) — `h2` **ANY GIVEN TUESDAY**. Replace the 4-up grid with a five-frame
   film strip (flex, `gap: 6px`, 430px tall, widths 1.1 / .85 / 1.6 / .85 / 1) plus italic
   captions beneath each frame, then a four-up 230px row.
   Strip: `host-wine`, `semifreddo-spritz-candle`, `open-kitchen`, `room-wide-golden`,
   `room-window-bistro`. Row: `burrata-tomato-close`, `dining-pasta`, `sommelier-wine`, `marble-spread`.
6. **Closer** (oxblood, centred) — **JOIN US. COME AS YOU ARE, LEAVE SLOWER THAN YOU ARRIVED.**
   \+ Reserve a table / Plan an event.
7. **Contact** (peach) + **footer** (oxblood) — as now, with the footer descriptor carrying the
   keyword sentence and `bf-emblem-peach.svg` centred in the bottom bar.

**Photography rule for future shoots:** night leads, day supports. Rooms and people on the
homepage, plates on Menus. Shoot at 5pm, not noon. A hand or a back in frame beats a face to
camera. Only our marks in shot — never another brand's glassware (several existing daytime
frames carry Aperol lockups and must not be used on the site).

**One mark per surface.** Keep the scroll-walking dachshund and the hero Negroni; drop the extra
dog stickers and the bobbing duplicate.

---

## 5. Type scale

One display scale, largest idea = largest type.

| Role | Face | Size |
|---|---|---|
| Hero `h1` | Marsha caps | 54px (31px mobile) |
| Hero second line | Affairs italic | 42px (27px mobile) |
| Section `h2` | Marsha caps | 44–64px |
| Level / card `h3` | Marsha caps | 40px |
| Eyebrow | Affairs italic caps, `.34em`, red | 12.5px |
| Body | Affairs | 18px / 1.6 |
| Caption | Affairs italic, `oxblood/.7` | 14–15px |

VTC Marsha is **only ever set in capitals** — never small, never underlined (fix any nav/footer
link that currently renders Marsha lowercase).

---

## 6. Copy changes (exact)

| Current | Replace with |
|---|---|
| `Italian soul, vibrant dining, private events in Christchurch` (h1) | `Some places want to be seen.` + *Bar Franco wants to be felt.* |
| `Delicious Italian food, curated cocktails and seamless hospitality…` | `Italian restaurant and Negroni bar at The Crossing, in the middle of Christchurch.` |
| `Discover the venue` | `Have a look around` |
| `Christchurch's spot for Italian food, fresh pasta, aperitivo, cocktails & private events` (h2) | `We don't perform. We host.` + *Well. Mostly.* |
| About body | `An Italian restaurant and cocktail bar on two levels at The Crossing. Pasta rolled by hand upstairs. Negronis stirred to order downstairs.` |
| `Book in for dinner, let us host your next celebration…` | `Come for dinner. Take the long table for a celebration. Or join us for a Negroni.` *Ti aspettiamo* — we're waiting for you. |
| `Made for the moments worth gathering for` | `The long table is yours.` |
| `Pricing on application` / `Enquire now` | `Up to 240 across two levels, no venue hire fee. Tell us the date and we'll tell you what's possible.` / `Plan your event` |
| `A taste of the room` | `Any given Tuesday` |
| `Come as you are. Leave slower than you arrived.` | `Join us. Come as you are, leave slower than you arrived.` |
| `Send us a message` / `Submit` | `Come say ciao` / `Tell us about it` / `Send` |
| `Thanks! Your message has been sent 🎉` | `Grazie. We'll come straight back to you.` — **no emoji, ever** |
| Contact intro | `Join us for dinner, for a function, or just for a Negroni. Ground floor of The Crossing, laneway side — the doors by H&M.` |
| Message placeholder | `Twelve of us, a Friday in November, somewhere upstairs…` |

Standing/seated capacities come off the homepage (the events proof line covers it) and live on
Functions. The primary button stays **Reserve a table** — not "pull up a stool", not "Join us".

---

## 7. SEO — move keywords off the headline

The `h1` is for the guest. Keywords go in `<title>`, meta description, one honest `h2`, the
footer descriptor and alt text.

```
<title>Bar Franco | Italian Restaurant & Negroni Bar, Christchurch</title>
<meta name="description" content="Handmade pasta, Negronis stirred to order and two levels at
The Crossing. Bar from 4pm, kitchen from 5pm, daily till late. Book a table.">
```

- The one keyword heading, in About: `An Italian restaurant and cocktail bar on two levels at The Crossing`.
- Footer descriptor: "Modern Italian restaurant, cocktail bar and private event venue at The
  Crossing, in the heart of Christchurch — fresh pasta, aperitivo and functions for up to 240."
- Alt text describes the frame and names the thing once — e.g. "Pici cacio e pepe, handmade at
  Bar Franco"; never a keyword list, never `image1.jpg`.
- Add `LocalBusiness`/`Restaurant` schema (address, geo, `openingHoursSpecification`, phone,
  `servesCuisine: Italian`, `priceRange`) if it isn't already present.
- Keep the Christmas and Vouchers pages — just out of the main nav, in the footer.

---

## 8. Assets to add

From the Omelette project (originals in `uploads/`, web-sized copies in `assets/`):

```
assets/photos/aperitivo-table-cheers.jpg     hero
assets/photos/chef-wink.jpg                  About cluster
assets/photos/room-tables-bentwood.jpg       About cluster
assets/photos/burrata-tomato-top.jpg         About cluster
assets/photos/host-wine.jpg                  Moments strip
assets/photos/semifreddo-spritz-candle.jpg   Moments strip
assets/photos/room-wide-golden.jpg           Moments strip
assets/photos/room-window-bistro.jpg         Moments strip
assets/photos/burrata-tomato-close.jpg       Moments row
assets/marks/franco-negroni-peach-clear.png  hero mark (replaces franco-negroni.png on dark)
```

All are ≤1800px on the long edge. Serve WebP alongside if the build allows, and set
`width`/`height` on every `<img>` to stop layout shift. `loading="lazy"` on everything below
the fold — **not** on the hero.

---

## 9. Definition of done

- [ ] Tokens are the official four; no `#fff` on red or oxblood anywhere.
- [ ] Hero: one headline, one body line, one CTA; hours stated twice at most.
- [ ] Mobile hero leads with the message, not the photograph.
- [ ] Nav: two rows over the hero, collapsed row with **Reserve a table** on scroll.
- [ ] Marsha renders in caps everywhere.
- [ ] Every image has descriptive alt text; hero is not lazy-loaded.
- [ ] No emoji in any copy, including form states.
- [ ] Lighthouse: no CLS regression; hero LCP no worse than today.
- [ ] `prefers-reduced-motion` disables marquee, scroll-reveal, the walker and the Negroni bob.
- [ ] Menus and Functions still render correctly after the token change.
