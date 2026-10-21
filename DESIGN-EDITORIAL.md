# Bar Franco · the editorial system (bf-ed)

The guide for rebuilding every page in the design the owner approved for the homepage. Read it all before you
touch a page. The homepage (`/index.html`) and `/restaurant/` are the two finished examples: copy from them.

## The idea, in a few lines

- **The printed menu, on a screen.** The page sits on paper (`#F1EEE6`) inside two thin Bright Red rules, like the
  menu card. Nothing is ever seen outside the inner rule.
- **Airy and editorial.** One idea per screen, lots of paper, tiny refined labels, big photographs. Say it once.
- **Words.** VTC Marsha capitals for the few big lines (never below 24px), Affairs for everything else, with an
  Affairs italic turn under a Marsha title: `FRESH PASTA` / *made in view.* Section labels are small Bright Red
  words in parentheses: (upstairs), (the room).
- **Italics, twice only (owner, October 2026: "you're using italics far too often").** Affairs italic is used in
  exactly two places: the turn line under a Marsha title (`.h2 i`, `.on-ph i`, `.bf-title h1 i`) and quotations
  (the band quotes). Everything else is Affairs regular: labels, links, captions, facts, the Menu, the footer,
  emphasis (`em`, `i`, `cite` are set upright). Do not add `font-style:italic` anywhere else. This rule supersedes
  the italics in the approved homepage mockup.
- **Photographs do the feeling, type does the facts.** Pairs of portraits, a wide photograph bleeding off one edge,
  a tall one that turns over (01 02 03), a strip running off the edge, a full band with three quotes on it.
- **Book a table is always to hand:** in the band, then in the compact band once the band has scrolled away.

Brand rules (unchanged): Deep Red `#6C0600` ink · Bright Red `#AF0F00` labels and buttons · Almond `#FAD7C3` ·
paper `#F1EEE6` ground · Spritz `#F00000` focus ring only. No black or grey, radius 0, no shadows, no gradients
except the photo scrims (tinted `rgba(30,3,0,…)`). Affairs never in capitals, never fake bold (the stylesheet sets
`font-synthesis:none`, so `<b>` and `<h1>` stay regular). **No arrows anywhere.** Facts: (upstairs) The Crossing,
166 Cashel St, Christchurch · bar from 4pm, kitchen from 5pm, daily till late · 021 221 1307 · ciao@barfranco.nz ·
events@barfranco.nz · @bar__franco · barfranco.chch · events Seated 165 · Standing 240.

---

## 1 · The head rule

Keep each page's `<head>` **byte for byte** (title, meta, canonical, Open Graph, Twitter, JSON-LD, the font
preloads, the `vf-tracking.js` line). Change exactly one thing: the old stylesheet tags become

```html
<link href="/static/bf-ed.css" rel="stylesheet"/>
```

So `<link href="/static/styles.css" …/><link href="/static/editorial.css" …/>` (and `hm-experience.css`,
`sd-events.css` where present) are replaced by that one line. Nothing else in the head moves.

- `<script src="/static/vf-tracking.js"></script>` stays exactly where it is. **Never edit vf-tracking.js.**
- Inline head scripts of the old design go (`sd-calm` / `sd-pre`, the `walking-in` session script in `<body>`).
- Christmas keeps its inline `bf_*` dataLayer script and every `data-track` attribute, verbatim (put the script just
  before `bf-ed.js`).
- `404.html` keeps its inline casing-redirect script verbatim (first thing in `<body>` is fine).

## 2 · The scripts each page loads

| Page kind | At the end of `<body>` |
|---|---|
| Every page | `<script src="/static/bf-ed.js" defer></script>` |
| Christmas | its inline `bf_*` dataLayer script, then `bf-ed.js` |
| 404 | its inline redirect script, then `bf-ed.js` |

That is all. **Do not load** `editorial.js`, `hm-experience.js`, `sd-events.js`, `functions.js`, `events-pack.js`,
`franco.js` or `chrome.js` on a rebuilt page: everything functional in them now lives in `bf-ed.js` (see the audit
at the end). The old files stay in the repo until the last old page is gone.

**Events pages decision:** the calendar, room finder, held date, December strip and VenueFlow prefill were
**ported** into `bf-ed.js` (part 11), not kept in `sd-events.js`. The old script hard-required its dogs, banner and
hover index (`new Dog($('#dogB'))`, `$('#sdIdx').addEventListener`…) and throws without them; the port keeps the
same ids and data attributes the owner already edits (`#sdHold data-months data-mo data-close data-guests`,
`#sdRow data-seat data-stand`, `<b id="sdAvailD">`), with every piece optional.

---

## 3 · The page skeleton

```html
<body class="pg-NAME">
<a class="bf-skip" href="#main">Skip to content</a>
<div class="bf-page">
  <header class="bf-top"> cover photograph + band (§4) </header>
  <main id="main">
    <div class="bf-title"> … </div>           <!-- inner pages -->
    sections…
  </main>
  <footer class="bf-foot" id="footer"> … </footer>
</div>
<div class="bf-sticky" aria-hidden="true"> … </div>
<div class="bf-menu" id="bf-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden> … </div>
<script src="/static/bf-ed.js" defer></script>
</body>
```

- `.bf-page` is the size container: the layout unit `--u` is 1/1440 of its width on desktop and 1/390 on phones.
  Everything inside scales with it. **Keep the compact band and the Menu sheet outside it** (they are fixed).
- `body class="pg-…"` names the page (`pg-menus`, `pg-functions`, …); your page CSS hangs off it (§9).

### The frame (CSS only)
Nothing to add: `body::before` paints the paper margin (30px desktop, 15px phones) and `body::after` draws the two
Bright Red rules (12px / 16.5px in, 1.5px; phones 6px / 9px, 1px). Above everything, `pointer-events:none`, gone
when printing. Never put anything `position:fixed` above `z-index:2147483000`.

## 4 · The chrome (identical on every page; copy it whole)

### Cover and band, inner pages
The cover photograph sits above the band on every page (the reference's rhythm). Then the band: the small script
logo left (links home), Menu in the middle, the page's ask right. Then the title.

```html
<header class="bf-top">
<figure class="ph cover"><img src="/images/PHOTO.jpg" alt="WHAT IS IN IT" width="W" height="H" style="object-position:50% 50%" fetchpriority="high" decoding="async"></figure>
<div class="bf-band">
<a class="bf-logo-s" href="/" aria-label="Bar Franco, home"><img src="/static/logos/bar-franco-script-incline/deep-red.svg" alt="" width="709" height="496"></a>
<a class="bf-mbtn" href="#footer" aria-controls="bf-menu" aria-expanded="false">Menu</a>
<a class="btn" href="/bookings/">Book a table</a>
</div>
</header>
<main id="main">
<div class="bf-title">
<h1>The restaurant. <i>Level&nbsp;2.</i></h1>
<p>Fresh pasta made in view, in an open kitchen you can&nbsp;watch.</p>
</div>
```

- **The ask:** dining pages `Book a table` → `/bookings/`; a page that holds the NowBookIt widget points at its own
  `#book` (Bookings, Restaurant); event pages `Check your date` → `#enquire` (Christmas may say `Hold a date`);
  the Events pack and Robbie → `/functions/#enquire`. Use the **same words and href** in the band and in the compact
  band.
- **The title:** one `<h1>` per page, Marsha capitals at a calm size (40–76px), optional `<i>` turn in Affairs
  italic (Bright Red), at most one short line `<p>` under it. Optional `<p class="label">level 2</p>` above the h1.
  Never a giant word.
- The cover is never text-on-photo on inner pages. Phones crop it portrait (`object-position` serves both).

### Home only
```html
<div class="bf-band home">
<h1 class="bf-tag">Modern Italian restaurant<br>&amp; Negroni bar</h1>
<a class="bf-mbtn" …>Menu</a>
<a class="btn" href="/bookings/">Book a table</a>
</div>
<p class="bf-script"><img src="/static/logos/bar-franco-script-incline/deep-red.svg" alt="Bar Franco" width="709" height="496"></p>
```

### The compact band (after `</div>` of `.bf-page`)
Shows inside the frame's top once `.bf-band` has scrolled away; hides at the top. Same ask as the band.
```html
<div class="bf-sticky" aria-hidden="true">
<a class="bf-logo-s" href="/" aria-label="Bar Franco, home"><img src="/static/logos/bar-franco-script-incline/deep-red.svg" alt="" width="709" height="496"></a>
<a class="bf-mbtn" href="#footer" aria-controls="bf-menu" aria-expanded="false">Menu</a>
<a class="btn" href="/bookings/">Book a table</a>
</div>
```

### The Menu sheet (after the compact band)
Opened by any `.bf-mbtn`; Close or Esc shuts it; focus stays inside; the page doesn't scroll behind it; the open
page is marked by `bf-ed.js` (`aria-current="page"`). Without JS, Menu simply jumps to the footer's page list.
Copy it from `/index.html` (between `<div class="bf-menu"` and its closing `</div>`); do not edit per page.

### The footer
Deep Red: the full page list right (two columns), BAR FRANCO centred in Almond, the address left, five icons
right, the base line (© year · emblem · Ti aspettiamo). Copy it from `/restaurant/index.html`. The year fills
itself (`data-bf-year`); the open page is underlined by `bf-ed.js`.
**Footer thumbnails** (`<div class="bf-foot-ph">` with three `figure.ph`, see Home) are optional and only with
photographs no other page uses; inner pages normally leave them out.

---

## 5 · Components (from the reference; fluid, they reflow on phones)

All widths are in `--u`, so a composition keeps its proportions at any width. Copy, then change words and
photographs. Every `<img>` carries `width`, `height`, a real `alt`, `loading="lazy" decoding="async"` (only the
cover is eager). Wrap photographs in `.ph` (it crops with `object-fit:cover`; set the crop with
`style="object-position:…"`, the one inline style allowed).

### Words
```html
<p class="label">upstairs</p>                          <!-- Bright Red; the CSS adds the parentheses: (upstairs). .label.al on a photograph -->
<h2 class="h2">Nothing happens behind a door <i>optional turn</i></h2>   <!-- Marsha 28–44px -->
<p class="lead">A larger opening sentence.</p>
<p class="small">A small aside, 15px.</p>
<p class="go"><a href="/menus/">See the menus</a></p>  <!-- the underlined link; .go.r right, .go.c centre -->
<a class="btn" href="/bookings/">Book a table</a>       <!-- the square ask; .btn.line for the quiet one -->
<div class="btns"><a class="btn" …>…</a><a class="btn line" …>…</a></div>
```
**Labels** are written without parentheses; `.label::before/::after` draw them, so a label can keep a number as
written: `<p class="label">01 · The room</p>` reads (01 · The room). Never type the parentheses yourself, or it reads
((upstairs)).

Words on a photograph (needs the scrim on the `.ph`):
```html
<div class="ph feature-ph scrim"><img …><h2 class="on-ph"><span class="mh">Fresh pasta</span><i>made in view.</i></h2></div>
```

### pair: two portrait photographs, a paragraph, a link
```html
<section class="pair" aria-label="…">
<p class="label">optional</p>
<figure class="ph"><img …></figure>
<figure class="ph"><img …></figure>
<p class="j">One paragraph under the first photograph (.j justifies, as the reference does).</p>
<p class="go r"><a href="…">A link</a></p>
</section>
```
Desktop: from 23% (335u), two 379u × 548u portraits. Phones: two 145u portraits, the paragraph full width.

### row5: up to five small captioned photographs on one line
```html
<section class="row5" aria-label="…">
<a class="r5" href="/aperitivo/"><figure class="ph"><img …></figure><span class="r5-t">Aperitivo</span><span class="r5-s">Level 1 · spritz first,<br>from 4pm</span></a>
… up to five …
</section>
```
Five items scatter as on Home. With three or four, add `.n3` / `.n4`. Items can be `<div class="r5">` (no link).
Phones show the first three; `.row5.scroll` scrolls all of them sideways instead.

### feature: label, wide photograph to the edge with its title, two text columns, a link
```html
<section class="feature" aria-labelledby="h-x">
<p class="label">upstairs</p>
<div class="ph feature-ph scrim"><img …><h2 class="on-ph" id="h-x"><span class="mh">Fresh pasta</span><i>made in view.</i></h2></div>
<div class="feature-txt"><p>First column.</p><p>Second column.</p></div>
<p class="go r"><a href="…">Dinner upstairs</a></p>
</section>
```
`.feature-txt.wide` makes one wide column. `.feature.flip` mirrors it (photograph from the left edge to 77%, title
at the right; on phones it bleeds left instead of right). Use the plain `.go` (not `.go r`) in a flip.

### slides: a tall photograph that turns over, with a quote beside it
```html
<section class="slides-s" aria-label="…">
<div class="ph slides" data-slides>
<img class="on" src="…" alt="…" width=… height=… loading="lazy" decoding="async">
<img src="…" alt="…" …><img src="…" alt="…" …>
<p class="label al">downstairs</p>
</div>
<blockquote class="quote"><p>“…”</p><cite>Name, occasion</cite></blockquote>
</section>
```
`bf-ed.js` adds the 01 02 03 buttons, turns every 4.5s while on screen (never under reduced motion), stops for
good once someone picks a number. The first image needs `class="on"`.

### strip: a text column, three tall photographs running off the right edge
```html
<section class="strip" aria-label="…">
<p class="label">eventi</p>
<div class="strip-txt"><p>…</p><p>…</p><p class="go"><a href="/functions/">Plan an event</a></p></div>
<div class="strip-ph"><figure class="ph"><img …></figure><figure class="ph"><img …></figure><figure class="ph"><img …></figure></div>
</section>
```
Phones show the second and third photographs stacked at the right (the first hides; with one photograph it stays).

### bandph: a full-width photograph, three small quotes, a title
```html
<section class="ph bandph" aria-labelledby="h-y"><img src="…" alt="…" …>
<div class="bandph-q"><p>“…”</p><p>“…”</p><p>“…”</p></div>
<h2 class="on-ph" id="h-y"><span class="mh">Not a bar.</span><i>A world.</i></h2></section>
```

### scatter: small photograph top right, label, big photograph, small one bottom left, words, a link
```html
<section class="scatter" aria-label="…">
<figure class="ph sc-s1"><img …></figure>
<p class="label">aperitivo</p>
<figure class="ph sc-big"><img …></figure>
<figure class="ph sc-s2"><img …></figure>
<div class="sc-txt j"><p>…</p></div>
<p class="go"><a href="…">…</a></p>
</section>
```

### host: a centred landscape photograph with the name on it
```html
<section class="host" aria-labelledby="h-host">
<figure class="ph host-ph scrim"><img …><h2 class="on-ph" id="h-host">Ciao, I’m Ana-Maria</h2></figure>
<p class="host-sub">Owner &amp; host<br><i>upstairs on Cashel Street</i></p>
<p>A short paragraph.</p>
<p class="go r"><a href="/our-story/">Our story</a></p>
</section>
```
The name is Marsha on desktop and Affairs (regular) on phones, where Marsha would not fit.

---

## 6 · Functional pieces (same language)

### Sections and text
```html
<section class="sec" …>…</section>          <!-- the reference's air: 120u above and below (phones 64u) -->
<section class="sec tight">…</section>       <!-- 64u -->
<section class="sec flush">…</section>       <!-- no top padding (the first section after .bf-title gets this anyway) -->

<section class="sec prose">                  <!-- a text column on the 23% line; .at-l (left edge), .at-r (right half), .at-c (centred) -->
<p class="label">the room</p><h2 class="h2">…</h2><p>…</p><p class="go"><a …>…</a></p>
</section>

<section class="sec cols">                   <!-- heading left, words (or a list, a card, an embed) right -->
<div><p class="label">getting here</p><h2 class="h2">Take the lift, or the stairs</h2><p>One line.</p></div>
<ul class="facts">…</ul>
</section>
```
Paragraphs: one short sentence or two. Reading size is fixed (17px desktop, 16px phones).

### facts: label · fact rows on hairlines
```html
<ul class="facts">
<li><span>The lift</span><i></i><em>by H&amp;M and KOOKAÏ</em></li>
<li><span>After 4.30pm</span><i></i><em>$9</em></li>
</ul>
```
The `<i>` draws the leader dots low on the baseline (owner's rule); phones drop the dots. `.facts.price` sets the
facts in the price style. `<p class="facts-h">` is a small Bright Red head above a list.

### frame: the printed menu's double rule (menus, cards)
```html
<div class="frame">
<p class="frame-h">Pasta</p>
<ul class="facts price"><li><span>Pici cacio e pepe, pecorino romano, black pepper</span><i></i><em class="v">33</em></li></ul>
<p class="frame-s">One small line.</p>
<p class="frame-go"><a class="btn" href="/menus/#sheet-food">See the full menu</a></p>
</div>
```
**Menu cover** (dining and event pages never print half a menu, except Restaurant's pasta by the owner's brief):
```html
<div class="frame mcover">
<p class="mcover-n">FRANCO</p>
<p class="mcover-k">The food menu</p>
<p>One line about it.</p>
<a class="btn" href="/menus/#sheet-food">Read the menu</a>
</div>
```
(`#sheet-food`, `#sheet-drink`, `#sheet-events` open that tab on /menus/.)

### quote, steps, questions, chapters
```html
<blockquote class="quote"><p>“…”</p><cite>Name, occasion</cite></blockquote>

<ol class="steps"><li><span class="n">01</span><h3>Pick a date</h3><p>One line.</p></li>…</ol>

<div class="faq">
<details><summary>Can we have lunch?</summary><div><p>Yes…</p></div></details>
</div>

<details class="chap" name="pack" id="ch-food" open>
<summary><span class="n">03</span><span class="t">Food</span></summary>
<div class="chap-b">…</div>
</details>
```
`name="pack"` keeps one chapter open at a time (native). `bf-ed.js`: a link to a chapter (or anything inside one)
opens it and lands under the compact band; a chapter someone opens brings its title up; printing opens every
`<details>` and restores them after. FAQPage JSON-LD only on pages that show the questions.

### Embeds
```html
<div class="embed book"><iframe src="https://bookings.nowbookit.com/?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&amp;venueid=12388&amp;theme=light&amp;colors=hex,AF0F00,6C0600" title="Book a table at Bar Franco" loading="lazy"></iframe></div>
<p class="embed-note">Widget not loading? <a href="https://bookings.nowbookit.com/?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&amp;venueid=12388">Open the booking page</a> or call <a href="tel:+64212211307">021&nbsp;221&nbsp;1307</a></p>

<div class="embed vf"><iframe src="https://venueflowhq.com/enquire/bar-franco?embed=1&amp;accent=AF0F00" title="Plan your event — Bar Franco" loading="lazy"></iframe></div>

<div class="embed map"><iframe src="https://www.google.com/maps?q=166+Cashel+Street,+Christchurch+Central&amp;output=embed" title="Map to Bar Franco, 166 Cashel Street" loading="lazy"></iframe></div>
```
Keep each iframe `src` exactly as the page has it now. VenueFlow: `bf-ed.js` shows a loading note (with
events@barfranco.nz) and sizes the frame to the height the form reports (messages from venueflowhq.com only);
`vf-tracking.js` adds the ad-click parameters and fires the conversions. Put the enquiry form inside the element
with `id="enquire"` (the band's ask lands there).

### Contact form (FormSubmit)
```html
<form class="form" data-email="ciao@barfranco.nz" data-subject="Message from barfranco.nz">
<div class="field"><label for="c-name">Your name</label><input id="c-name" name="name" type="text" autocomplete="name" required></div>
<div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
<div class="field"><label for="c-msg">Message</label><textarea id="c-msg" name="message" required></textarea></div>
<button class="btn" type="submit">Send</button>
</form>
```
No `action`/`method`. `bf-ed.js` adds a honeypot, posts form-encoded to FormSubmit's AJAX endpoint (do not turn it
into JSON: CORS blocks it), fires the Google Ads email conversion on success, says *Grazie* in place of the form, and
on failure offers the same message as a ready-made email. `data-mode="mailto"` skips FormSubmit and opens the email
straight away (what the live Contact page did before the rebuild). **Never submit it while testing**; stub the
request (`page.route('**/formsubmit.co/**', …)`).

### Tabs (Menus)
```html
<div class="tabs" role="tablist" aria-label="Menus">
<button type="button" role="tab" id="tab-food" aria-controls="sheet-food" aria-selected="true">Food menu</button>
<button type="button" role="tab" id="tab-drink" aria-controls="sheet-drink" aria-selected="false">Drinks menu</button>
<button type="button" role="tab" id="tab-events" aria-controls="sheet-events" aria-selected="false">Event menus</button>
</div>
<div role="tabpanel" id="sheet-food" aria-labelledby="tab-food">…</div>
```
Any `[role=tablist]` works (the old `.mn-tabs` too). Arrow keys move; a link to `/menus/#sheet-events` opens that tab
and lands on it; picking a tab writes its hash. The printed-menu sheets keep their markup and classes
(`.pm .pm-food .pm-drink .pm-title .course .card-h .pm-d .pm-p .pm-n .pm-two .card-em`, `.evm-*`, `#sheets`) and are
styled in bf-ed.css: food stays the printed page scaled (phones too), drinks drop to reading size on phones.

### Events: room finder, calendar, held date, December strip
Keep the ids; style with the new classes. Everything is optional: a page without a finder just has the calendar.
```html
<p class="avail" id="sdAvail">December Fridays: <b id="sdAvailD" data-year="2026">Fri 11 &amp; Fri 18</b> left in the Restaurant · Midweek &amp; lunch dates open.</p>

<div class="finder" id="sdFind" data-seat="165" data-stand="240">
<label class="finder-n"><span>How many of you?</span><output id="sdNo" for="sdN">40</output><input type="range" id="sdN" min="10" max="240" step="5" value="40" aria-describedby="sdRes"></label>
<div class="finder-opts">
<div class="seg" id="sdStyle" role="group" aria-label="Seated or standing"><button type="button" data-s="seat" aria-pressed="true">Seated</button><button type="button" data-s="stand" aria-pressed="false">Standing</button></div>
<div class="seg" id="sdDay" role="group" aria-label="Which night"><button type="button" data-d="wk" aria-pressed="false">Sun to Thu</button><button type="button" data-d="fs" aria-pressed="true">Fri &amp; Sat</button></div>
</div>
<p class="finder-res" id="sdRes" aria-live="polite"></p>
<p><a class="btn" id="sdResGo" href="#enquire">Check your date</a></p>
</div>

<div class="hold" id="sdHold" data-close="24">        <!-- Christmas: data-months="10,11" data-mo="11"; Private dining: data-guests="0" -->
<div>
<div class="hold-mo" id="sdMo" role="group" aria-label="Month"></div>
<div class="hold-wk" aria-hidden="true"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
<div class="hold-g" id="sdG" role="group" aria-label="Choose a date"></div>
<p class="hold-key"><span class="k-fs">Fri &amp; Sat, minimum spend applies</span><span>Closed 24 December to 5 January</span></p>
</div>
<div class="hold-sum">
<ul class="facts"><li><span>Date</span><i></i><em id="sdSumD">pick one</em></li><li><span>Guests</span><i></i><em id="sdSumN">40, seated</em></li><li><span>Floor</span><i></i><em id="sdSumR">either floor</em></li><li><span>Minimum spend</span><i></i><em id="sdSumM">pick a date</em></li></ul>
<a class="btn" id="sdHoldBtn" href="#sdForm">Hold this date</a>
<p class="hold-msg" id="sdHeld" role="status" aria-live="polite"></p>
</div>
</div>
```
- Seated/standing limits come from `data-seat`/`data-stand` on `#sdRow` or `#sdFind` (165 / 240). Optional room
  cards inside `#sdRow` with `data-room="bar|rest|all"` get `.fit`/`.nofit`.
- The calendar shows the next four months (or only `data-months`), opens on `data-mo`, greys out past days and the
  closed days (`data-close="24"` → 24 December to 5 January), marks Fridays and Saturdays.
- A picked date (and, with a finder, guests and seated/standing) goes into every VenueFlow iframe as
  `prefillDate` / `prefillGuests` / `prefillFormat`. Choices are remembered on the device (`bf-sdf-*`).
- `#sdAvailD`: edit the Fridays; past ones drop off (NZ time); none left → "fully booked" (or `data-none`).
- Keep the owner's October 2026 rules: one capacity (Seated 165 · Standing 240), prices with `$`, minimum spends
  $4,000 / $7,500 / $15,000, open until 23 December, "Private lunch functions available on request." on Functions
  and Christmas, the proof (Google reviews + three quotes) directly above the enquiry form.

---

## 7 · Phones (≤760px)

The reference's own phone composition, measured at 390: everything is recomposed, not shrunk. The unit becomes
1/390 of the width; the frame tightens (15px margin, rules at 6 and 9px). Pair: two small portraits and the words
under them; row5: three; feature: the photograph bleeds to the right edge from 18% (a flip bleeds left); slides:
centred small; strip: two photographs stacked at the right beside the words; scatter: small photo top right, big
photo, small photo bottom left beside right-aligned words; host: centred; footer: the page list in two columns, the
icons spread across. Functional pieces (`prose`, `cols`, `facts`, `frame`, embeds, forms, calendar) take the full
measure with a 13.4u margin; leader dots go. Tap targets are at least 44px (invisible hit areas on the small
controls). Test at 390×844 and 360×780.

Between 761px and desktop the desktop composition simply scales (as the reference does); narrow text columns keep a
210px floor so inner-page text stays readable at 1024.

## 8 · Motion

Only this: photographs (`.ph` below the first screen) settle in once as they arrive (fade + 12px), at 2.5s
everything is on regardless; slides crossfade; the compact band slides in; the Menu sheet fades. Under
`prefers-reduced-motion` none of it moves (and smooth anchor scrolling is off). Add no other motion.

## 9 · Page CSS: the marker blocks

Build with the components first. When a page truly needs its own rules, append them **inside your group's block at
the end of `static/bf-ed.css`**, every selector prefixed with the page's body class (`.pg-menus …`). Never edit
another group's block or the shared rules above them (ask the foundation owner instead), so the five builders
never touch the same lines:

```
/* ---- P1 · menus, bookings, vouchers, contact ---- */          … /* end P1 */
/* ---- P2 · functions, corporate-events, private-dining ---- */ … /* end P2 */
/* ---- P3 · christmas-functions, weddings, events-pack, robbie ---- */ … /* end P3 */
/* ---- P4 · aperitivo, negroni-bar, fresh-pasta, pre-stadium-dining ---- */ … /* end P4 */
/* ---- P5 · our-story, 404 ---- */                              … /* end P5 */
/* ---- P0 · home, restaurant (the foundation's own pages) ---- */ … /* end P0 */
```
No `<style>` blocks, no `style=""` except `object-position` on an `<img>`. No new JS files: if a page needs
behaviour, it should be generic and data-attribute driven in `bf-ed.js` (ask the foundation owner).

## 10 · Photographs

- **One photograph, one page.** Before using one: `grep -l 'images/NAME.jpg' index.html */index.html 404.html`, and
  compare the *pictures*, not the names: many files are the same shot (`hero-table` = `aperitivo-table-cheers` =
  `aperitivo-table-menus`; `dining-pasta` = `pasta-marble-table`; `server-tray` = `level-negroni-graded`;
  `bar-dancing` = `party-dancing-bar`; `restaurant-room-daylight` = `restaurant-plants-sky` ⊃ `restaurant-room-hero`;
  `event-guests` = `guests-in-the-booth`; `cocktail-tray` = `fig3-the-kitchen` ≈ `negroni-tray-hands`;
  `fig2-the-table-web` = `waiter-wine-service`; `parmigiana-flat` ≈ `parmigiana-spritz`;
  `bartender-pouring-spritzes` = `bar-spritz-pour`).
- **Banned:** the old yellow artichoke pendant lamps (also in `level1-event-setup`, `level1-bar`, `level1-bar-crowd`,
  `room-pendants-crowd`, `pack-2026/restaurant-long-tables-artichoke-lamp`, `pack-2026/guests-candlelit-long-table`),
  the bartender in the striped shirt (`bar-spritz-pour`, `pack-2026/bartender-pouring-spritzes`), the chef with the
  steel bowl.
- **Claimed by the foundation** (do not use these, or their twins, on your page):
  - Home: `aperitivo-table-overhead`, `bar-negroni-scales`, `level2-dining-room`, `negroni-tray-hands`,
    `pasta-marble-table`, `server-tray`, `burrata-lunch-overhead`, `event-service`, `restaurant-room-daylight`,
    `aperitivo-table-cheers`, `pack-2026/nebbiolo-chianti-bottles`, `parmigiana-spritz`,
    `pack-2026/long-table-end-of-night`, `pack-2026/curtained-table-for-twenty`, `pack-2026/server-pinstripe-plates`,
    `event-room-wide`, `waiter-wine-service`, `pack-2026/spritz-tray-sunlit`, `pack-2026/grazing-table-flowers`,
    `event-guests`, and in its footer `burrata-tomato-close`, `pack-2026/restaurant-long-tables-daytime`,
    `pack-2026/guest-dance-floor`.
  - Restaurant: `open-kitchen`, `server-pasta-candlelit`.
  - **Conflicts on the current pages that the builders must resolve** (they use a photograph now claimed above):
    private-dining (`bar-negroni-scales`, `open-kitchen`, `aperitivo-table-menus`), christmas-functions
    (`level2-dining-room`, `pack-2026/server-pinstripe-plates`, `pack-2026/grazing-table-flowers`), events-pack
    (`negroni-tray-hands`, `pack-2026/nebbiolo-chianti-bottles`, `pack-2026/long-table-end-of-night`,
    `pack-2026/restaurant-long-tables-daytime`), corporate-events (`event-service`,
    `pack-2026/curtained-table-for-twenty`, `guests-in-the-booth`), functions (`pack-2026/curtained-table-for-twenty`,
    `guests-in-the-booth`), our-story (`event-guests`), negroni-bar (`level-negroni-graded`).
  - The clean, unused pool is now empty: if a page runs short, drop a photograph (one idea per screen) or ask the
    owner for new ones; never repeat one.
- Size: ~1400px long edge, JPEG ~0.82. Every `<img>`: `width`, `height`, a real `alt`.

## 11 · What the old scripts did, and where it went (the audit)

| Behaviour (old file) | Functional? | Kept how |
|---|---|---|
| Google Ads tag, phone/email conversions, ad-click cookie, VenueFlow tracking and enquiry conversion (`vf-tracking.js`) | yes | unchanged, still in every `<head>` |
| Contact form → FormSubmit with honeypot + Ads conversion (`franco.js`); live page composed a mailto (`editorial.js`) | yes | `bf-ed.js` part 9: FormSubmit, mailto fallback on failure, `data-mode="mailto"` option |
| VenueFlow frame takes the reported height (`sd-events.js`, `franco.js`), loading note (`franco.js`) | yes | part 10 |
| Events calendar `#sdHold` (months, closed days, Fri/Sat, held date, summary) (`sd-events.js`) | yes | part 11 (same ids/data) |
| Room finder `#sdN/#sdStyle/#sdDay/#sdRes/#sdResGo`, `#sdRow data-seat/stand` (`sd-events.js`) | yes | part 11 |
| VenueFlow `prefillDate/Guests/Format` (`sd-events.js`) | yes | part 11 |
| Christmas December strip `#sdAvailD` (`sd-events.js`) | yes | part 11 |
| Christmas `bf_*` dataLayer pushes (inline) | yes | stays inline on Christmas, verbatim |
| NowBookIt booking iframe (markup) | yes | `.embed.book`, same src |
| Menus tabs + `#sheet-…` deep links (`editorial.js`, `franco.js`) | yes | part 7 (generic `[role=tablist]`) |
| Events pack chapters: deep link opens and lands, opened chapter lands, print opens all (`events-pack.js`, `editorial.js` openHash) | yes | part 8 (`details.chap`, all `<details>` for print) |
| Phone chapter accordions on Functions/Christmas (`editorial.js` `data-chapters`) | yes (UX) | replaced by the `details.chap` / `.faq` components |
| 404 casing redirect (inline in 404.html) | yes | stays inline, verbatim |
| Skip link (`editorial.js`) | yes | static `.bf-skip` in the markup |
| Phone menu with focus trap, Esc, Book/Call/Directions/hours (`editorial.js`) | yes | the Menu sheet, part 5 |
| Top bar ask matched to the page (`editorial.js`) | yes | written in the markup (band and compact band) |
| Book a table always reachable (top bar states) (`editorial.js`) | yes | the compact band, part 4 |
| Footer year (`chrome.js` `data-bf-year`) | yes | part 2 |
| Photos settle in (`editorial.js` `.rv`) | decorative, kept | part 1 |
| Night mode / lights, live clock `#openH` (`editorial.js`) | decorative | dropped |
| Lead curtain, swipeable dog on a lead (`editorial.js`) | decorative | dropped |
| Page-turn walk between pages (`editorial.js`, inline `walking-in`) | decorative | dropped |
| Floors + dog on the seam, eased scroll (`editorial.js`) | decorative | dropped |
| Header tone sampling (`editorial.js` mastTick) | decorative | dropped |
| Sticky conversion CTA `.sticky-cta` (`editorial.js`) | replaced | the compact band |
| Home: arrival curtain, marquee strip, word-by-word intro, zoom, host dog, Book-a-table sheet (`hm-experience.js`) | decorative | dropped (Book a table goes to /bookings/) |
| Events: dogs, banner lettering, hover index, night steps, masthead band, cover check (`sd-events.js`) | decorative | dropped |
| Functions: nameplate fit, coaster flip, chapter folds (`functions.js`) | decorative / dead on the live page | dropped |
| Menus inline `.mp-sheet` reader (no `.mp-sheet` on the page any more) | dead | dropped |
