# Bar Franco — Website Creative Direction

**Prepared against the Semibold *Bar Franco Visual Identity*, which is the sole authority for
palette, typography and marks.** The repo's `Brand Guide.html` is deliberately disregarded: it
lists Charcoal `#1D1D1B` and Cream `#F4EEE1`, neither of which is in the official palette.

This is a **re-plate of the live site, not a rebuild.** Two complete ground-up redesigns — the
"6a/7a" run and "Cinema Franco" — were built and then reverted on 20 September in favour of the
design that is live. The structure that survived is treated as the thing to elevate.

Everything marked ✅ is **already built, verified and in the pull request**. Everything marked ◻
is recommended and not yet done. Everything marked ⚠️ **needs a fact only you have** — nothing has
been invented.

---

## A. Audit of the existing site

### The single most expensive problem, now fixed

The homepage `h1` read *"Italian soul, vibrant dining, private events in Christchurch"* and ran
**seven lines**. It pushed the only booking button clean off the first screen:

| Viewport | "Reserve a table" sat | Now |
|---|---|---|
| Desktop 1440×900 | 224px below the fold | ✅ visible |
| Laptop 1366×768 | 341px below the fold | ✅ visible |
| iPhone 390×844 | 477px below the fold | ✅ visible |

On a phone the photograph was also pulled *above* the copy by `order:-1`, so the first screen was
a cropped image and nothing else. A visitor arriving from Google could not see what the place was
or book a table without scrolling twice.

The fix the brief asked for creatively — lead with *"Some places want to be seen. Bar Franco wants
to be felt."* — is the same change that fixes the commercial problem. That is the whole argument
for this pass.

### Keep — do not touch these

| What | Where | Why |
|---|---|---|
| The venue section copy | "the easy hum of a good crowd", "spritzes by the tray" | The best writing on the site. Specific, sensory, sounds like a person. |
| The red events band | homepage | The page's one crescendo, arriving at the right point in the scroll. |
| The hero stamp + marquee strip | homepage | Put the one fact a visitor needs — bar 4pm, kitchen 5pm — at the point of arrival. |
| Alt text, canonicals, FAQ schema, single-`h1` discipline | site-wide | Already better than most restaurant sites. |
| The 390px overflow handling | `home.css` | Every negative offset has already been contained, with comments explaining why. |
| The booking journey's widget + visible fallback link | `Bookings.html` | Two steps, unblockable, with an escape hatch. The model the enquiry path should copy. |
| The 16 redirect directories | `bar-hire/`, `our-spaces/` … | Not orphans — correctly `noindex`ed legacy-URL redirects. Right to be out of the sitemap. |

### Correct — factual and technical errors found

| Finding | Evidence | Status |
|---|---|---|
| **Two contradictory `Restaurant` schemas** on the homepage, one closing 22:00, the other 23:59 | `index.html` — duplicate JSON-LD blocks | ✅ duplicate removed |
| **A retired mobile number still published to Google** as the events contact | `+64-21-083-75416` in schema on 5 pages | ✅ purged site-wide |
| **The Events Pack — the only page publishing real pricing — was invisible to search**: no meta description, no canonical, `lang="en"`, absent from `sitemap.xml` | `Bar Franco Events Pack.html` | ✅ described, canonicalised, `EventVenue` schema, listed |
| **Every image lacked intrinsic dimensions**, and portrait photos were being declared as landscape | 37 images across both pages | ✅ all 37 now declare true size |
| **The Negroni mark carried a CSS drop-shadow on top of the one baked into the PNG** — a grey halo on paper, and against the identity's "no shadows on the marks" rule | `home.css` `.hero-negroni` | ✅ removed |
| **The watermark word sat behind hero body copy** at up to 260px, sliced mid-letter at both edges — read as a printing fault | `.ghost-word`, 13 pages | ✅ anchored to the baseline band, clear of text on all 13 |
| **VTC Marsha set in lowercase** — the one place on the site breaking the caps-only rule | `.hero-stamp .st-v` | ✅ set to caps |
| **`.reveal` left content at `opacity:0` with no fallback** — a JS failure hid most of every page from humans and crawlers | `home.css` + `site.js` | ✅ hidden state gated on a `.js` class |
| **Muted text failed WCAG AA on almond** (4.16:1) | `--muted` at `.64` alpha | ✅ `.70` — clears on both grounds |

### Refine

- **The two levels were one component rendered twice** — same card, same photo treatment, same
  type size, so "two levels, one world" was asserted but never shown. ✅ Now two full-width
  sections with different temperatures.
- **The homepage never showed the food.** For a restaurant whose pasta is its argument, the only
  plated dish was a thumbnail in a cluster. ✅ The restaurant section now leads with the kitchen.
- **The same sentence ran twice**, 42 lines apart — "delicious Italian food, curated cocktails and
  seamless hospitality" in both hero and About. ✅ Gone; three hollow adjectives with it.
- **Four of the five preserved brand lines never appeared on the homepage.** ✅ All five now do.
- **Three saturated red fields, two of them touching, in two different reds.** ✅ Resequenced so
  the page darkens like an evening: paper → almond → paper → deep red → paper → bright red → deep
  red → almond.

### Remove

- The `meta keywords` tag — ignored by every engine, and it published the target list to
  competitors. ✅ Removed from both rebuilt pages.
- The oversized hero wordmark — the nav already carries it, and at 116px it was costing the fold.
  ✅ Removed.
- The dachshund scroll-walker *on phones only* — once the sticky action bar exists, three floating
  elements compete for one corner. ✅ Desktop keeps it.

### Still outstanding ◻

- **No social proof anywhere** — not one review, rating or testimonial, and no `aggregateRating`.
  For a venue selling $5k–$20k events this is the largest remaining conversion gap.
- **12.8 MB of JPEG, 25 files over 250 KB, no `srcset`, no WebP.**
- **119 KB of uncompressed OTF with `font-display: block`** — text is invisible until the fonts
  land, behind a second stylesheet, with no `preload`.
- **The Christmas page is now the only enquiry still on the external VenueFlow iframe** — a
  consequence of this pass. It should move to the native form for consistency.

---

## B. Homepage — section by section

| # | Section | Ground | Headline | Job |
|---|---|---|---|---|
| 1 | Hero | Paper | **SOME PLACES WANT TO BE SEEN.** / *Bar Franco wants to be felt.* | State the feeling; offer both actions |
| 2 | Marquee | Almond | — | Say what the place serves, fast |
| 3 | About | Paper | **WE DON'T PERFORM. WE HOST.** / *An Italian restaurant and Negroni bar on two levels in central Christchurch.* | The brand line, plus the one honest keyword heading |
| 4 | Pull band | Almond | *Two levels. One world.* | The hinge between the two rooms |
| 5 | The Restaurant | Paper | **WE COOK LIKE SOMEONE'S COMING HOME.** | Pasta, season, open kitchen, the long meal |
| 6 | The Negroni Bar | **Deep red** | **THE NIGHT IS YOURS.** | Aperitivo, the ritual, the evening |
| 7 | Moments | Paper | **ANY GIVEN TUESDAY** | Proof it's like this normally |
| 8 | Private events | **Bright red** | **EVENTS WITH FLAVOUR. NIGHTS WITH FEELING.** / *We host. You stay.* | The commercial crescendo |
| 9 | Closer | **Deep red** | **COME AS YOU ARE. LEAVE SLOWER THAN YOU ARRIVED.** | The invitation |
| 10 | Contact | Almond | **COME SAY CIAO.** | The details |

### Typography hierarchy

| Role | Face | Size |
|---|---|---|
| Hero line 1 | VTC Marsha, **caps always** | `clamp(34px, 4.9vw, 68px)` |
| Hero line 2 | Affairs **italic**, sentence case | `clamp(27px, 3.7vw, 52px)` |
| Section `h2` | VTC Marsha caps | `clamp(28px, 3.5vw, 46px)` |
| Kicker / eyebrow | Affairs italic caps, `.30em` tracking | 12px |
| Body | Affairs regular | 18px / 1.6 |
| Caption, muted | Affairs italic, deep red at `.70` | 14–15px |

**The two-voice construction is the point.** Marsha declares, Affairs italic answers. The tension
between the two faces *is* the brand, and the hero and About heading are now built as deliberate
pairs rather than two fonts sharing a page.

### Photography

- Restaurant section: `chef-open-kitchen.jpg` — a person making the thing you're being sold.
- Negroni Bar: `level-negroni-graded.jpg` — the colour-graded frame, warm and low-key, on deep red.
- ◻ **Recommended reshoot rule:** night leads, day supports. Rooms and people on the homepage,
  plates on Menus. Shoot at 5pm, not noon. A hand or a back beats a face to camera. Only Franco
  glassware in frame — several existing daytime frames carry another brand's lockups.

### Interactions

Restrained, and each one earns its place: scroll-reveal fade-up (now with a no-JS fallback), the
marquee, the Negroni bob, the desktop scroll-walker, and a sticky two-action bar on phones.
`prefers-reduced-motion` disables all of it.

---

## C. Private events page

Rebuilt around the enquiry rather than around the venue.

1. **Opening** — *Events with flavour. Nights with feeling.* + two actions + three proof points.
2. **Not a function room. A long table.** — set as a pull statement beside the long-table photograph.
3. **The spaces** — three cards, each with its own photograph, description, verified capacity and
   its own enquiry link: Level 1 Spritz & Negroni Bar (120/75), Level 2 The Restaurant (120/90, up
   to 120 seated with hired furniture), Exclusive Whole Venue (240/165).
4. **Occasions** — six, each with a detail specific to *that* occasion rather than the same
   sentence reworded: private dining, birthdays, corporate, wedding receptions, cocktail functions,
   Christmas.
5. **Food & drink** — the real published rates: grazing from $40pp, canapés $9 (4–6 per guest),
   substantial canapés $11, seated shared menu $80pp, $110pp with three canapés on arrival.
6. **How it works** — the four steps, lifted from the Events Pack where they were buried.
7. **Practical information** — hire fee, minimum spend, holding a date, timings, getting here,
   sound/screens/access.
8. **Enquiry form** — name, email, phone, event type, preferred date, guests, preferred space,
   budget (optional), details.

### The enquiry experience

The third-party `venueflowhq.com` iframe is gone. Enquiries now post to a Bar Franco inbox with no
dependency on an external service staying configured — the risk your own growth audit flagged as
costing you your highest-value lead type.

**Conversion tracking is preserved.** `site.js` dispatches `bf-enquiry-submitted` and the existing
tag block listens, firing the *same* Google Ads label with the budget bracket as the conversion
value. Verified end to end: a test submission posts all nine fields and fires one conversion at
value 10000 NZD.

---

## D. Three visual directions

Three distinct compositions inside the same identity — same four colours, same two faces, same
marks. They differ in ground, type scale, photographic treatment and motion.

| | **Aperitivo Hour** | **After Dark** | **Tabloid** |
|---|---|---|---|
| Ground | Almond-led | Deep-red-led | Paper with hairline rules |
| Mood | Warm, generous, unhurried | Cinematic, intimate | Editorial, graphic, high-contrast |
| Type | Marsha moderate; Affairs italic does the talking at 28–42px | Marsha big and tight, almond reversed out | Marsha at two extremes only — enormous mastheads or tiny tracked labels |
| Photography | Framed like plates in a book, generous margins | Large, close-cropped, deep-red scrim | Strict columns with visible italic captions |
| Red | Punctuation — one filled action per screen | Small hot accents on deep red | Masthead bars and rules |
| Motion | Slow fade-up only | Gentle 1.06→1 scale; almond/deep-red cross-fades | Staggered column-by-column reveal |

Comps are in `design-directions/` — a gitignored folder, so they never deploy. **The live site
currently implements a blend: Aperitivo Hour's almond grounds with After Dark's deep-red evening
section.** That pairing is what makes "two levels, one world" visible rather than merely asserted.

---

## E. SEO

### Titles and descriptions

| Page | Title | Description |
|---|---|---|
| **Home** | Italian Restaurant & Negroni Bar, Christchurch CBD \| Bar Franco | House-made pasta, aperitivo and Negronis across two levels at The Crossing, central Christchurch. Bar from 4pm, kitchen from 5pm, daily. Book a table. |
| **Events** | Private Dining & Function Venue, Christchurch \| Bar Franco | Private dining, corporate events, birthdays and wedding receptions across two levels in central Christchurch. Up to 240 guests, no venue hire fee. Enquire today. |
| **Events Pack** | Function Menus & Pricing, Christchurch \| Bar Franco Events Pack | Grazing tables from $40pp, canapés from $9, seated shared menus from $80pp. Two levels, up to 240 guests, no venue hire fee. |

### Headings

Keywords come **off** the `h1` and into the title, the description and one honest descriptive
heading. The homepage `h1` now carries the entity ("Bar Franco"); the About `h2`'s second voice
carries *"An Italian restaurant and Negroni bar on two levels in central Christchurch."*

The events page needed no such device — its `h3`s **are** the target terms: Private Dining,
Corporate Events, Wedding Receptions, Cocktail Functions.

### Technical ✅

Duplicate `Restaurant` schema removed · retired phone purged from structured data · Events Pack
given description, canonical, `lang="en-NZ"`, `EventVenue` schema and a sitemap entry · `meta
keywords` dropped · 37 images given true intrinsic dimensions · `sitemap.xml` validated.

### Technical ◻

`srcset` + WebP across 12.8 MB of JPEG · `preload` the two OTFs and move `font-display` off
`block` · `aggregateRating` once reviews exist · per-page `og:image`.

**No search volumes, ranking claims or traffic estimates appear in this document, because none
have been measured.**

---

## F. Implementation priorities

### Shipped in this pass ✅

Palette aligned to the four official colours · hero rebuilt so both actions clear the fold on every
viewport · mobile leads with the message · restaurant and bar given distinct temperatures · section
rhythm resequenced · events page rebuilt with three spaces, six occasions, real pricing and a
nine-field native form · conversion tracking preserved and verified · sticky mobile action bar ·
nine correctness fixes · 31 pages × 1440 and 390 verified clean.

### Do next ◻ — days, high return

1. **Reviews.** A QR on the bill, a staff script, and a reply to every review within 48 hours.
   Then a rating strip on the homepage and `aggregateRating` schema. Biggest remaining gap.
2. **Move the Christmas page onto the native form** so one enquiry pipeline exists, not two.
3. **Image pipeline** — WebP + `srcset`. Largest single performance win available.
4. **Font loading** — `preload` both OTFs, move off `font-display: block`.

### Then ◻ — weeks

5. Surface the Events Pack's pricing tiers directly into the events page.
6. Per-page `og:image` for events, weddings and Christmas.
7. Email capture in the footer.

---

## ⚠️ Facts only you can confirm

Nothing below has been invented or guessed. Each is flagged in an HTML comment at the point in the
code where the real answer goes.

| # | What I need | Why it matters |
|---|---|---|
| 1 | **Is `events@barfranco.nz` a live, monitored mailbox?** | The brief says event enquiries must use it, so the form does. Until you confirm, a `_cc` copy also reaches `anamaria@` so nothing can be lost. Delete the `data-cc` attribute once verified. |
| 2 | **Real per-day closing times.** | Schema still says 16:00–22:00 while the copy says "till late". You are under-reporting yourself to Google and may be losing the late crowd. |
| 3 | **Minimum spends** by level, day and season. | Nothing is published anywhere, so nothing was stated. A real "from $X" anchor lets enquirers self-qualify and reliably raises enquiry quality. |
| 4 | **Deposit amount, payment timing, cancellation terms.** | Currently described only as "set out in your proposal". |
| 5 | **Sound, screens, step-free access, lift.** | Undocumented anywhere in the repo, so nothing has been claimed. These are exactly what corporate and wedding enquirers check before shortlisting. |
| 6 | **Do you still want VenueFlow?** | No longer embedded on the events page. Cancel it, or say the word and it comes back in one line. |
| 7 | **Are the published capacities still right?** | 120/75, 120/90, 240 total, ~165 seated — taken from your own Events Pack, not invented, but worth a look against the current floor plan. |
