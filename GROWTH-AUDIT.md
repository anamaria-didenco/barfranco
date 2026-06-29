# Bar Franco — Growth Audit & 12-Month Strategy

**Prepared as if by your retained agency (SEO · Local SEO · CRO · Brand · Content · Revenue).**
Scope: the live static site in this repo (`index.html`, `Bookings.html`, `Functions.html`, `Menus.html`, `Vouchers.html`, `Contact.html`, `christmas-functions/`, `Bar Franco Events Pack.html`) plus Google Business Profile, social and revenue systems.

> **How to read this.** Findings are grounded in the actual code, not generic advice. Every recommendation states **why it matters**, the **search intent or behaviour** behind it, and the **expected business impact**. Where I need a fact only you have (real closing times, current review count, GA4 ID), it's flagged **`[OWNER INPUT]`** — I will not invent it, because fabricated hours/reviews/prices get you penalised by Google and erode trust.

---

## 0. Executive summary — the five things that move revenue

The site is genuinely good: clean build, strong brand, schema on most pages, a Christmas landing page, keyword-aware titles. You're already ahead of most Christchurch hospitality sites. The gap between "nice site" and "booking machine" comes down to five things:

1. **You're capturing almost no social proof.** There is not a single review, star rating, or testimonial anywhere on the site, and no `aggregateRating` schema. For a restaurant *and* a $5k–$20k event venue, this is the single biggest conversion leak. **Impact: HIGH.**
2. **Your highest-value page leaks leads.** The Functions enquiry runs through an external `venueflowhq.com/enquire` iframe (`Functions.html:206`), while your Christmas page uses a reliable FormSubmit form that lands in Ana-Maria's inbox. One of these is your money path — it must be bullet-proof and verified. **Impact: HIGH.**
3. **Your menus and prices are invisible to Google.** `Menus.html` links to two PDFs; the real, sellable function pricing ($40pp grazing, $9 canapés, $80/$110 seated set menus) is buried in `Bar Franco Events Pack.html`, which has **no meta description, no canonical, no schema, and isn't in the sitemap**. Google can't read PDFs well and can't rank a page that isn't crawlable. **Impact: HIGH.**
4. **Weddings are a stated goal with no home.** You want wedding enquiries, but there is no `/weddings/` page — weddings are one line on `Functions.html`. "wedding venue Christchurch" is a high-intent, high-value query you currently cannot rank for. **Impact: HIGH.**
5. **You can't measure or remarket.** No GA4, no Google Tag Manager, no Meta Pixel, no conversion tracking, no email capture. You're flying blind and leaving every warm visitor un-retargetable. **Impact: HIGH (foundational).**

Fix these five and everything else compounds. The rest of this document is the full audit and the roadmap.

---

# PHASE 1 — BUSINESS AUDIT (ranked findings)

### 🔴 HIGH IMPACT

| # | Finding | Evidence | Why it costs you money |
|---|---------|----------|------------------------|
| H1 | **No social proof anywhere** — zero reviews, testimonials, star ratings, or `aggregateRating` schema | All pages | Diners and (especially) event organisers spending $5k+ need proof other people trusted you. Reviews also drive rich-result stars in Google and lift CTR. |
| H2 | **Two different, inconsistent enquiry mechanisms** — Functions uses an external `venueflowhq.com` iframe; Christmas uses a native FormSubmit form to `anamaria@` | `Functions.html:206`, `christmas-functions/index.html:161` | If the VenueFlow widget isn't fully configured/monitored, event leads silently vanish. Your single most valuable lead type runs through the least controllable path. **Verify it end-to-end today.** |
| H3 | **Function pricing & menus not crawlable** — real prices live only in a no-SEO PDF-style page; `Menus.html` is just two PDF links | `Bar Franco Events Pack.html` (no `<meta description>`, `lang="en"`, no canonical, no schema, absent from `sitemap.xml`); `Menus.html:93-108` | "bar franco menu", "italian set menu christchurch", "function menu prices christchurch" can't find you. PDFs rank poorly, are bad on mobile, and kill the on-page CRO you'd get from HTML. |
| H4 | **No dedicated Weddings page** | `Functions.html:154` (one line) | Weddings are your highest-margin event. No page = no ranking for wedding queries = no enquiries from the channel you explicitly want to grow. |
| H5 | **No analytics / tag manager / pixel / conversion tracking** | All pages (no GA4/GTM/Pixel scripts) | You cannot see what converts, can't prove ROI, can't run efficient ads, can't retarget the 95%+ who leave without booking. |
| H6 | **No email capture anywhere** | All pages | No list = no cheap repeat revenue, no Christmas/Valentine's/Mother's Day pushes, no nurturing of event enquiries that aren't ready yet. |
| H7 | **Schema opening hours likely wrong** — every page declares `opens 16:00, closes 22:00` but copy says "till late" | `index.html:89`, `Bookings.html:63` | Google may surface "Closes 10 PM" to searchers; if you're open later you lose the late crowd, and inconsistent hours hurt trust + GBP matching. `[OWNER INPUT: real per-day hours]` |

### 🟠 MEDIUM IMPACT

| # | Finding | Evidence | Why it matters |
|---|---------|----------|----------------|
| M1 | **Images lack `width`/`height` and responsive `srcset`; no WebP/AVIF** | e.g. `index.html:201,225-227` | Causes layout shift (CLS) and slower LCP on mobile = worse Core Web Vitals = lower rankings + higher bounce. |
| M2 | **2–3 MB unoptimised originals shipped in `/uploads/`** | `uploads/5DIV2742.jpg` (2.7 MB) etc. | If linked or crawled they tank performance and waste crawl budget. They're dead weight in the deploy. |
| M3 | **Events Pack opens in a new tab and isn't a true page** | `Functions.html:121` | Splits authority, confuses crawlers, and the best sales content (the space finder, menus, pricing, "how it works") never helps your SEO. |
| M4 | **Homepage contact form is generic** — name/phone/email/message only, routes to `ciao@` | `index.html:361-383` | An event lead landing here gives you no date, headcount or event type, slowing response and lowering close rate. |
| M5 | **No `aggregateRating`/`Review` schema, no breadcrumb schema, no `Event` schema for ticketed nights** | All pages | Missing rich-result opportunities (stars, breadcrumbs, event listings) that lift CTR for free. |
| M6 | **"Christmas" nav link missing on the Christmas page itself and 404** | `christmas-functions/index.html:68-76`, `404.html:24-31` | Minor inconsistency; seasonal page should cross-link the rest of the funnel and vice-versa. |
| M7 | **Single shared `og-image.jpg` for all pages** | every page `og:image` | Functions/Weddings/Christmas deserve tailored share images for higher social CTR. |
| M8 | **No FAQ targeting weddings/corporate specifically** | `Functions.html:191` (generic FAQ) | Misses "People also ask" real estate and pre-empts the questions that stall enquiries. |

### 🟡 LOW IMPACT (polish)

- "Best Italian Restaurant" in the homepage title (`index.html:11`) — superlatives aren't penalised but aren't credited either; lead with the searched terms instead.
- Vanity redirect folders (`contact-barfranco/`, `our-menus/`, etc.) are fine but better handled as host-level 301s.
- No `humans`/author signals or `Person` schema for the chef/owner (minor E-E-A-T).
- Marquee strip and dachshund walker are charming and on-brand — keep, but ensure they respect `prefers-reduced-motion` (they do — good).

### Every reason a visitor leaves without booking or enquiring

1. **"Is it any good?"** — no reviews to reassure them. *(H1)*
2. **"What's on the menu / what does it cost?"** — menu is a PDF, prices hidden. *(H3)*
3. **"Can it actually do my wedding/30th/work do, and roughly what will it cost?"** — no dedicated page, no price guidance, "pricing on application" reads as "expensive/hassle." *(H3, H4)*
4. **"I filled the form — did it even send?"** — if the VenueFlow widget hiccups, no fallback confidence. *(H2)*
5. **"What does the room look like full?"** — gallery is good but no real-event social proof / "as seen" weddings.
6. **Mobile friction** — PDF menus and a tall iframe are awkward on phones, where most restaurant searches happen.
7. **No urgency / no reason to act now** — no "December books out," no limited offers, no email capture to catch the not-ready-yet.

---

# PHASE 2 — SEO STRATEGY

### Keyword map by intent (target → page)

**Restaurant / high-intent transactional**
- italian restaurant christchurch · best italian restaurant christchurch · pasta christchurch · restaurants christchurch cbd · restaurants open now christchurch · cocktail bar christchurch · negroni bar christchurch → **Home + Menus**
- book a table christchurch / italian → **Bookings**

**Local "near me" & district**
- restaurants near me / restaurants the crossing / cashel street restaurants / dinner christchurch central → **Home + GBP**

**Events / functions (highest value)**
- venue hire christchurch · function venue christchurch · private dining christchurch · cocktail function venue · party venue christchurch · 21st / 30th / 40th birthday venue christchurch · engagement party venue christchurch → **Functions + new occasion pages**

**Weddings (new)**
- wedding venue christchurch · small wedding venue christchurch · intimate wedding venue christchurch · city wedding reception venue · rehearsal dinner venue christchurch → **new `/weddings/`**

**Corporate**
- corporate function venue christchurch · work christmas party christchurch · end of year function · team dinner venue · client dinner christchurch cbd · conference dinner venue → **`christmas-functions/` + new `/corporate-events/`**

**Informational / content (top-of-funnel)**
- best negroni in christchurch · where to eat before a show christchurch · best date night restaurants christchurch · how much does it cost to hire a venue in christchurch → **blog**

### Prioritised SEO roadmap — realistic ranking timeline

> Brand new domains don't outrank established competitors in week one. This is sequenced for compounding wins.

- **30 days (brand + low-competition):** "bar franco", "bar franco christchurch", "bar franco menu", "bar franco bookings/functions/vouchers". *Get the GBP verified and fix hours/menus so brand SERP is flawless.* Quick wins on long-tail like "negroni bar christchurch cbd".
- **90 days:** "function venue christchurch cbd", "christmas party venue christchurch", "private dining christchurch", "cocktail function venue christchurch", "21st/30th birthday venue christchurch" — these are winnable with the dedicated pages + reviews + a few local citations.
- **6 months:** "venue hire christchurch", "wedding venue christchurch (long-tail: intimate/small/city)", "italian restaurant christchurch cbd", "best italian restaurant christchurch (page 1 contention)", "corporate function venue christchurch".
- **12 months:** "italian restaurant christchurch", "venue hire christchurch", "restaurants christchurch" (head terms) — top-3 contention, driven by review velocity, content depth, and links.

### Recommended new pages (priority order)

1. **`/weddings/`** — intimate city weddings & receptions, rehearsal dinners. *(stated goal, high margin)*
2. **HTML `/menus/` content** — full food + drinks menus as real, crawlable HTML with `Menu`/`MenuItem` schema (keep the PDF as a "download/print" option). Add **prices**.
3. **`/functions/` upgrade** — pull the Events Pack content (space finder, pricing tiers, "how it works") into the indexable Functions page.
4. **`/corporate-events/`** — client dinners, team events, conference dinners.
5. **Occasion pages:** `/birthday-parties/` (21st/30th/40th), `/engagement-party-venue/`.
6. **Blog/journal hub** `/journal/` for the content calendar in Phase 5.

---

# PHASE 3 — LOCAL SEO & GOOGLE BUSINESS PROFILE

Local is where a CBD restaurant + venue wins fastest. The Map Pack drives more covers than organic for "near me" searches.

### GBP audit checklist & action plan `[OWNER INPUT: current GBP state]`

**Categories**
- Primary: **Italian restaurant**. Secondaries: *Cocktail bar, Event venue, Function room facility, Wedding venue, Bar, Fine dining restaurant.* (Secondary categories are a top-3 local ranking factor — fill all relevant ones.)

**Services** — add structured services with descriptions: Dine-in, Private dining, Venue hire, Cocktail functions, Corporate events, Weddings, Gift vouchers, Walk-ins welcome.

**Attributes** — set every true one: "Great cocktails", "Cosy", "Romantic", "Group-friendly", "Accepts reservations", "Wheelchair accessible" (if true), "Free Wi-Fi", "Vegetarian/Vegan options", "Late-night food" (if applicable).

**Photos** — this is huge for local CTR. Upload **20–30** high-quality shots, then add **2–3 weekly** (Google favours active profiles): food, cocktails, both levels, a full event, the open kitchen, exterior at The Crossing, staff. Name files descriptively before upload. Add a logo + cover.

**Description** — 750 chars, lead with "Modern Italian restaurant, cocktail bar and private event venue in central Christchurch (The Crossing, 166 Cashel St)…" Include weddings/functions/Negroni naturally.

**Reviews — the priority lever.** `[OWNER INPUT: current count & rating]`
- Build a system: a **QR code on every table/bill** and a short link (`g.page/r/...`) that opens the review box.
- Train staff to ask at the high point of the meal.
- **Reply to every review within 48h** (Google rewards owner responses; it's also brand voice gold — "Grazie, Sarah! The Negroni misses you already.").
- Target: **+8–15 reviews/month**. Velocity matters more than total. This is the #1 driver of moving from page 2 to the Map Pack.

**Posts** — publish weekly: events ("December books out — enquire now"), seasonal menus, "this week's special Negroni". Free reach, freshness signal.

**Products** — add gift vouchers and signature dishes/cocktails as Products with photos and prices (shows in the profile, drives the Vouchers page).

**Q&A** — seed 8–10 owner questions & answers (parking, dietaries, can you do a 30th, is there a hire fee, BYO?, dog-friendly?). Pre-empts objections in the place people ask them.

**Booking link** — connect the NowBookIt reservation link as the GBP "Reserve a table" action so people book straight from the Map Pack.

**Citations/NAP** — ensure identical Name/Address/Phone on: Yelp, TripAdvisor, Restaurant Hub/First Table, Neat Places, Heart of Christchurch, ChristchurchNZ, Eventfinda, local wedding directories. Consistency = trust = rankings.

---

# PHASE 4 — WEBSITE CONVERSION OPTIMISATION (by audience)

For each persona: friction → fix → exact copy/structure.

### A. The restaurant guest ("dinner tonight / Friday")
- **Friction:** can't see the menu without opening a PDF; can't see prices; no reviews; hours ambiguous ("till late" vs schema 10pm).
- **Fixes:** HTML menu with prices; a review strip near the top of Home and on Bookings ("4.8★ from 300+ diners" `[OWNER INPUT]`); a sticky **"Book a table"** button on mobile; confirm real hours.
- **Copy block (Home, above the fold or just under hero):**
  > ★★★★★ "The closest thing to Rome in Christchurch." — *Verified diner.* `[OWNER INPUT: real quote]`

### B. The bride planning a wedding
- **Friction:** no wedding page; can't picture a wedding here; no capacity-for-weddings, no styling, no price guide, no "real weddings" proof.
- **Fixes:** dedicated `/weddings/` (drafted in this repo — see `weddings/index.html`) with: intimate city-wedding positioning, both-levels capacities framed for weddings (ceremony + reception flow), set-menu price guidance, a wedding-specific enquiry form (date, guest count, ceremony y/n), and a "say ciao" personal host note from Ana-Maria.
- **Questions to answer on-page:** Can we have our ceremony here? How many for a seated reception vs cocktail? Is there a dance floor / can we move furniture? Minimum spend? Can you do dietaries & a cake table? Accommodation/parking nearby?

### C. The corporate event organiser
- **Friction:** wants speed, capacity, AV, invoicing, a clear price-per-head, and confidence it'll be professional.
- **Fixes:** `/corporate-events/` page; "How it works" 4-step (you already have this in the Events Pack — surface it); explicit per-head packages; "we invoice / PO friendly"; fast-response promise ("we reply within one business day").

### D. Someone planning a 30th / 21st / milestone birthday
- **Friction:** "will it feel special and is it in my budget?"
- **Fixes:** `/birthday-parties/` with the space finder, grazing-table hero ($40pp), "no venue hire fee" front and centre, and a gallery of a full, lit room.

### E. "Just searching for a venue"
- **Friction:** comparison shopper; bounces if price/capacity isn't instantly clear.
- **Fixes:** capacity table (Standing/Seated per level + full venue 240), "no venue hire fee" badge, price-from guidance, one-click enquiry. Reduce "pricing on application" — give a **"from $X pp"** anchor so they self-qualify instead of leaving.

### Cross-cutting CRO wins
- **Sticky mobile CTA bar** ("Book" + "Enquire") on every page.
- **Trust row** site-wide: reviews ★, "No venue hire fee", "Up to 240", "In the CBD at The Crossing".
- **Form upgrade:** every enquiry form should capture *event type, date, guest count* (the Christmas form already does this well — replicate it).
- **One reliable enquiry pipeline** with an instant on-page "Grazie!" confirmation and an autoresponder email.

---

# PHASE 5 — 12-MONTH CONTENT STRATEGY

Goal: rank for intent, feed social, and build authority. Every idea below states intent + impact.

### Blog / journal (2–4 posts/month)
| Topic | Intent | Business impact |
|-------|--------|-----------------|
| "The 9 best work Christmas party venues in Christchurch" (you, honestly framed) | Commercial research, Aug–Nov | Captures the highest-volume seasonal event query; funnels to `christmas-functions/`. |
| "How much does it cost to hire a venue in Christchurch?" | Informational → commercial | Ranks for price queries competitors avoid; you answer with "from $X pp, no hire fee" and win the click. |
| "Where to eat before the [Town Hall / theatre / Apollo] in Christchurch" | Local informational | Pre-show diner intent; high conversion to Bookings. |
| "An intimate city wedding at Bar Franco: what it looks like" | Wedding research | Feeds `/weddings/`; long-tail wedding queries. |
| "What is a Negroni — and where to find the best one in Christchurch" | Informational + local | Owns your signature drink as a brand term. |
| "Planning a 30th birthday in Christchurch: a venue checklist" | Commercial research | Funnels to birthday page. |
| Seasonal menu reveals (4×/year) | Brand + freshness | Reason to re-book; GBP post fuel. |

### Landing pages — see Phase 2 list (weddings, corporate, birthdays, HTML menus).

### Video (cheap, high-leverage)
- 15–30s vertical: "A night at Franco" (arrival → Negroni → pasta → full room), pasta being rolled in the open kitchen, a Negroni stirred to order, a venue transform timelapse for an event. Repurpose to Reels/TikTok/Shorts + embed on relevant pages (also helps dwell time/SEO).

### Instagram (see Phase 6).

### TikTok
- "POV: the best Negroni in Christchurch", "How we set up for a 240-person party", chef plating, "Italian grandmother reacts to our tiramisù" — lean into faces, process, humour. The dachshund is a built-in mascot — use it.

### Email campaigns (once list exists)
- Welcome + 10% off first booking; monthly "what's pouring & plating"; seasonal events (Christmas in Sept, Valentine's, Mother's/Father's Day, Melbourne Cup); "your event enquiry" nurture sequence; birthday-of-subscriber offer.

---

# PHASE 6 — SOCIAL MEDIA STRATEGY

You have IG `@bar__franco` and FB `barfranco.chch`. `[OWNER INPUT: current follower/engagement baseline]`

**Content gaps to close:** events/venue content (you sell it but rarely show it), behind-the-scenes faces, UGC/reviews reshared, weddings, and a consistent "book/enquire" CTA.

**Five content pillars (weekly rotation):**
1. **Food & drink hero shots** — pasta, the Negroni ritual, grazing tables. (Saves & shares → reach.)
2. **The room, full** — real events, long tables, a packed Friday. (Sells functions.)
3. **Behind the scenes / people** — chef rolling pasta, Ana-Maria hosting, the dachshund. (Trust + brand love.)
4. **Occasions / sell** — "Booking your work do?", "Weddings at Franco", "Vouchers for the food lover". (Direct response.)
5. **Hospitality storytelling** — why the Negroni, the two-levels story, supplier shout-outs. (Authority + warmth.)

**Specific posts:**
- Reel: "Two levels, one very good night" — Negroni bar → open kitchen → full event room.
- Carousel: "5 reasons Franco is the easiest yes on your December list" → link in bio to `christmas-functions/`.
- Before/after: empty Level 2 → styled wedding long table.
- UGC repost campaign: incentivise guests to tag (monthly voucher draw → also grows reviews).
- Always end captions with one clear CTA + the relevant link.

**Cadence:** 4–5 feed/Reels per week + daily stories (specials, BTS, countdowns). Stories drive the "tonight" decision; Reels drive reach; feed sells events.

---

# PHASE 7 — REVENUE GROWTH

Think in revenue streams, not posts.

| Opportunity | What | Est. impact `[ranges — validate with your numbers]` |
|-------------|------|------------------------------------------------------|
| **Reviews → Map Pack** | Systematic review generation | Moving into the local 3-pack can lift covers 15–30%. Highest ROI, ~$0 cost. |
| **Weddings page + directories** | New channel | Even 1–2 weddings/month at $6k–$15k each = **$70k–$300k/yr** new revenue. |
| **Surface function pricing & one reliable enquiry path** | CRO | A 20–30% lift in enquiry→booking on existing traffic is realistic; events are your margin engine. |
| **Email list + seasonal campaigns** | Retention | Restaurants typically see 15–25× ROAS on email. Drives repeat covers at near-zero cost. |
| **Gift vouchers push (Christmas/Mother's/Father's/Valentine's)** | Cash up front | Vouchers = pre-paid revenue + breakage + new-customer acquisition. Promote hard in Nov–Dec. |
| **Average spend per guest** | Upsell | Negroni flight / aperitivo package, "make it a feast" set-menu prompt at booking, paired wine, dolci & limoncello to finish. Menu engineering on the HTML menu (highlight high-margin signatures). |
| **Aperitivo hour / midweek occupancy** | Yield | "Negroni Hour" 4–6pm, "Pasta & a glass" midweek set, long-table community dinners on quiet nights. |
| **Memberships / "Friends of Franco"** | Recurring + data | Birthday perk, early event dates, members' Negroni — grows the list and loyalty. |
| **Partnerships** | Referral | Nearby hotels (concierge referrals), theatres/Town Hall (pre-show dining), wedding planners/photographers, corporate EA networks. |
| **Ticketed events** | New nights + PR | Negroni masterclass, pasta-making class, Italian wine dinners, opera/film nights → `Event` schema + Eventfinda exposure. |

---

# PHASE 8 — IMPLEMENTATION ROADMAP (impact × effort × ROI)

### ⚡ Next 7 days (highest ROI, low effort)
1. **Verify the Functions enquiry path end-to-end** (submit a test; confirm it reaches the inbox). If shaky, switch Functions to the proven FormSubmit form like Christmas. *(H2)*
2. **Claim/optimise GBP**: categories, services, attributes, 20+ photos, booking link, description. *(Phase 3)*
3. **Launch the review engine**: table QR → review link; staff script; reply to all existing reviews. *(H1)*
4. **Fix opening hours** in copy + schema to the real per-day times. *(H7)* `[OWNER INPUT]`
5. **Install GA4 + GTM + Meta Pixel**; set Bookings & enquiry submits as conversions. *(H5)* `[OWNER INPUT: account access]`

### 🗓️ 30 days (high impact, medium effort)
6. **Publish `/weddings/`** (draft in repo) and add to nav + sitemap. *(H4)*
7. **Build HTML menus with prices + `Menu` schema**; keep PDFs as downloads. *(H3)*
8. **Surface Events Pack content** (space finder, pricing tiers, how-it-works) into `Functions.html` and make the Events Pack a proper indexed page. *(M3)*
9. **Add a site-wide trust row + review strip** once you have quotes/rating. *(H1)*
10. **Add email capture** (footer + post-booking) into a tool (Mailchimp/Flodesk). *(H6)*
11. **Sticky mobile CTA bar.** *(CRO)*

### 📈 90 days (compounding)
12. `/corporate-events/`, `/birthday-parties/`, `/engagement-party-venue/`. *(Phase 2)*
13. Launch `/journal/` + first 4–6 blog posts (Christmas + price + pre-show + weddings). *(Phase 5)*
14. Image pipeline: WebP + `srcset` + `width`/`height`; purge/relocate `/uploads/` heavyweights. *(M1, M2)*
15. Citations/NAP across 10+ directories; wedding directory listings. *(Phase 3)*
16. First Google Ads + Meta retargeting once tracking has data. *(Phase 9)*

### 🌱 12 months
17. Review velocity to 100+ new reviews; aim for local 3-pack on head terms.
18. Content depth (24–40 posts), internal linking, earn local press links.
19. Ticketed events series + `Event` schema; membership launch.
20. Quarterly CRO testing on enquiry forms and booking flow.

---

# PHASE 9 — ONGOING MARKETING-DIRECTOR MODE

From here I operate as your retained Marketing Director / SEO Manager / Growth Consultant. My standing brief:

- **Measure everything to revenue.** Bookings, enquiries by type, enquiry→booking rate, average spend, repeat rate — not likes.
- **Challenge assumptions.** Two examples now: (1) "Pricing on application" is costing you self-qualifying leads — a "from $X pp" anchor will likely *increase* quality enquiries, not cheapen the brand. (2) Two enquiry systems is a silent-failure risk — consolidate to one you can monitor.
- **Always state the why + expected impact before recommending.**
- **Monthly rhythm:** review GA4 + GBP insights + review velocity → ship the next highest-ROI change → report against revenue/bookings.

**Digital advertising (once tracking is live):**
- **Google Search Ads** on high-intent event terms ("function venue christchurch", "christmas party venue", "wedding venue christchurch") — these convert because intent is explicit.
- **Meta/IG retargeting** of site visitors + lookalikes of past event enquirers; seasonal voucher campaigns Nov–Dec.
- **Performance Max** for vouchers/Christmas with strong creative.
- Start small, let GA4 conversion data guide spend; events ROAS will dwarf brand-awareness spend.

---

## Owner inputs I need to execute (so I never guess)
1. Real opening hours per day (esp. close time).
2. Current GBP status, review count & rating.
3. Confirm where Functions enquiries currently land (and is VenueFlow live?).
4. Access to GA4/Google Ads/GBP + which email platform you prefer.
5. Confirm function/wedding minimum spends or a "from $X pp" you're happy to publish.
6. 3–5 real guest quotes we can feature (or point me to your best reviews).

> Tell me which items to build next and I'll implement them directly in this repo on the `claude/bar-franco-growth-audit-5g34s` branch. A starter `/weddings/` page is included with this audit as a working example of the execution standard.
