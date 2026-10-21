# Bar Franco · the editorial system (bf-ed)

The guide for rebuilding every page in the design the owner approved. Read it all before you touch a page.
`/index.html` (the homepage) and `/restaurant/` (a content page) are the finished examples: copy from them.

## 0 · The three owner rules that come before everything

1. **Content is copied verbatim from each live page; only the design changes.** Every heading, paragraph, list item,
   fact, price, quote, link text, button text, alt text and photograph on your page must be the one on the live page
   now (`git show origin/main:<folder>/index.html`). Do not trim, rewrite, merge, reorder within a sentence or add copy.
   You choose the layout (which component each live section goes into, and in what visual form); the words stay.
   - Allowed: splitting a heading into a Marsha line and an italic turn at a natural break ("Two floors," / *one
     building.*), turning a live eyebrow into a `.label` (its brackets are drawn by CSS, the words stay as written),
     setting a live line on a photograph, dropping the old design's own furniture (marquee bullets, the Level 1 · Level 2
     toggle, the dog's speech, "Hover a chapter to open it", decorative curtain text).
   - Not allowed: new sentences, new section names, new captions, "(eventi)"-style labels that the live page doesn't
     have, shortened paragraphs, a different photograph.
   - Check it: `python3 /tmp/claude-0/-home-user/8f152fd2-a406-5441-ba85-eb9b6bae9f0a/scratchpad/rb/tools/verbatim.py <folder>/index.html`
     (run from `/home/user/rb`) lists live text missing from your page and text on your page that isn't live. Both lists
     must be empty, chrome aside.
2. **Italics in two places only** (owner: "you're using italics far too often"). Affairs italic is used for the turn
   line under a Marsha title (`.h1 i`, `.h2 i`, `.on-ph i`, the footer sign-off) and for quotations (`blockquote`,
   `q`, `.quote p`, `.bandph-q`). Everything else is Affairs regular: links, labels, captions and sublines, ledes,
   lists, facts, hours, address and contact lines, the Menu, the footer, buttons. `em`, `i` and `cite` are set upright by
   the stylesheet. Never add `font-style:italic`. (The printed menu sheets on /menus/ keep the PDF's italic drink
   descriptions as a facsimile; that is the only exception, and it is the owner's call to keep it.)
3. **One button for every primary ask** (Book a table, Check your date, Enquire now, Plan an event, Hold this date,
   Send). It echoes the menu's frame: paper ground, Bright Red words in Affairs regular (never italic, never capitals),
   a thin double Bright Red rule, square corners, ~10px 18px padding, 44px tall on phones. Hover and focus fill it
   Bright Red with Almond words; the inner rule turns Almond so the double rule stays. On a dark photograph or the Deep
   Red footer use `.btn.al` (Almond rules and words; hover fills Almond with Deep Red words). Secondary asks are plain
   underlined links (`.go`). There is no other button style.
   ```html
   <a class="btn" href="/bookings/">Book a table</a>
   <a class="btn al" href="#enquire">Check your date</a>          <!-- on a photograph / the footer -->
   <p class="btns"><a class="btn" href="/bookings/">Book a table</a><a class="go" href="/functions/#enquire">Plan an event</a></p>
   ```
   (The outer rule is the 1px border and the inner rule a 1px line 3px inside it, drawn by `::before`, rather than an
   `outline`: the outline is kept for the Spritz focus ring, so keyboard focus stays visible and the two rules stay.)

## The idea, in a few lines

- **The printed menu, on a screen.** The page sits on paper (`#F1EEE6`) inside two thin Bright Red rules, like the
  menu card. Nothing is ever seen outside the inner rule.
- **Airy and editorial.** One idea per screen, lots of paper, small refined labels, big photographs. Say it once.
- **Words.** VTC Marsha capitals for the few big lines (never below 24px), Affairs regular for everything else, with
  an Affairs italic turn under a Marsha title. Section labels are Bright Red words in brackets: (01 · The room).
- **Book a table is always to hand:** in the band, then in the compact band once the band has scrolled away, and in
  the Menu screen as (book a table).

Brand rules (unchanged): Deep Red `#6C0600` ink · Bright Red `#AF0F00` labels and buttons · Almond `#FAD7C3` ·
paper `#F1EEE6` ground · Spritz `#F00000` focus ring only. No black or grey, radius 0, no shadows, no gradients
except the photo scrims (tinted `rgba(30,3,0,…)`). Affairs never in capitals, never fake bold (`font-synthesis:none`).
**No arrows anywhere** (the live Functions page has an SVG arrow after "Terms": drop the arrow, keep the words).

---

## 1 · The head rule

Keep each page's `<head>` **byte for byte** (title, meta, canonical, Open Graph, Twitter, JSON-LD, font preloads, the
`vf-tracking.js` line). Change exactly one thing: the old stylesheet tags become

```html
<link href="/static/bf-ed.css" rel="stylesheet"/>
```

So `<link href="/static/styles.css" …/><link href="/static/editorial.css" …/>` (and `hm-experience.css`,
`sd-events.css` where present) are replaced by that one line. Nothing else in the head moves.

- `<script src="/static/vf-tracking.js"></script>` stays exactly where it is. **Never edit vf-tracking.js.**
- Inline scripts of the old design go (`sd-calm` / `sd-pre` in the head, the `walking-in` script in `<body>`).
- Christmas keeps its inline `bf_*` dataLayer script and every `data-track` attribute, verbatim (put the script just
  before `bf-ed.js`).
- `404.html` keeps its inline casing-redirect script verbatim (first thing in `<body>` is fine).
- Check: `diff <(git show origin/main:F | sed -n '1,/<\/head>/p') <(sed -n '1,/<\/head>/p' F)` shows only that line.

## 2 · The scripts each page loads

| Page kind | At the end of `<body>` |
|---|---|
| Every page | `<script src="/static/bf-ed.js" defer></script>` |
| Christmas | its inline `bf_*` dataLayer script, then `bf-ed.js` |
| 404 | its inline redirect script, then `bf-ed.js` |

That is all. **Do not load** `editorial.js`, `hm-experience.js`, `sd-events.js`, `functions.js`, `events-pack.js`,
`franco.js` or `chrome.js` on a rebuilt page: everything functional in them now lives in `bf-ed.js` (the audit, §12).

**Events pages decision:** the calendar, room finder, held date, December strip and VenueFlow prefill were **ported**
into `bf-ed.js` (part 11), not kept in `sd-events.js`. The old script hard-required its dogs, banner and hover index
(`new Dog($('#dogB'))`, `$('#sdIdx').addEventListener`…) and throws without them; the port keeps the ids and data
attributes the owner already edits (`#sdHold data-months data-mo data-close data-guests`, `#sdRow data-seat
data-stand`, `<b id="sdAvailD">`), with every piece optional.

---

## 3 · The page skeleton

```html
<body class="pg-NAME">
<a class="bf-skip" href="#main">Skip to content</a>
<div class="bf-page">
  <header class="bf-band slim"> … </header>      <!-- inner pages (§4); Home has its cover + band + script instead -->
  <main id="main">
    the page's sections, starting with the archetype's opening (§5)
  </main>
  <footer class="bf-foot" id="footer"> … </footer>
</div>
<div class="bf-sticky" aria-hidden="true"> … </div>
<div class="bf-menu" id="bf-menu" role="dialog" aria-modal="true" aria-label="Menu" hidden> … </div>
<script src="/static/bf-ed.js" defer></script>
</body>
```

- `.bf-page` is the size container: the layout unit `--u` is 1/1440 of its width on desktop and 1/390 on phones.
  Every position and size in the components is written in it (the reference's own pixel geometry, measured at 1440
  and 390), so a composition keeps its proportions at any width. **Keep the compact band and the Menu outside it.**
- `body class="pg-…"` names the page (`pg-menus`, `pg-functions`, …); your page CSS hangs off it (§10).

### The frame (CSS only)
Nothing to add: `body::before` paints the paper margin (30px desktop, 15px phones) and `body::after` draws the two
Bright Red rules (12px / 16.5px in, 1.5px; phones 6px / 9px, 1px). Above everything, `pointer-events:none`, gone when
printing. Never put anything `position:fixed` above `z-index:2147483000`.

## 4 · The chrome (identical on every page; copy it whole from /restaurant/index.html)

### Inner pages: the slim band
No cover photograph. A slim band at the very top: the script small at left (links home), Menu and the page's ask at
right, one hairline under it. The page then opens straight into its first section.
```html
<header class="bf-band slim">
<a class="bf-logo-s" href="/" aria-label="Bar Franco, home"><img src="/static/logos/bar-franco-script-incline/deep-red.svg" alt="" width="709" height="496"></a>
<div class="bf-band-r"><a class="bf-mbtn" href="#footer" aria-controls="bf-menu" aria-expanded="false">Menu</a><a class="btn" href="#book">Book a table</a></div>
</header>
```
- **The ask:** dining pages `Book a table` → `/bookings/`; a page holding the NowBookIt widget points at its own `#book`
  (Bookings, Restaurant); event pages `Check your date` → `#enquire` (Christmas: its live words, e.g. `Hold a date`);
  the Events pack and Robbie → `/functions/#enquire`. Same words and href in the band and in the compact band.
- **Form pages** lay the band over their photograph: `<header class="bf-band slim over">` and the logo carries both
  scripts (`<img class="dr" src="…/deep-red.svg"><img class="al" src="…/almond.svg">`); see §5.3.

### Home only: cover, band, script
```html
<header class="bf-top">
<figure class="ph cover scrim"><img …><p class="on-ph cover-k">(upstairs) · 166 Cashel St, Christchurch</p></figure>
<div class="bf-band">
<h1 class="bf-tag">Modern Italian restaurant<br>&amp; Negroni bar.</h1>
<a class="bf-mbtn" href="#footer" aria-controls="bf-menu" aria-expanded="false">Menu</a>
<a class="btn" href="/bookings/">Book a table</a>
</div>
<p class="bf-script"><img src="/static/logos/bar-franco-script-incline/deep-red.svg" alt="Bar Franco" width="709" height="496"></p>
</header>
```

### The compact band (after `</div>` of `.bf-page`)
Shows inside the frame's top once `.bf-band` has scrolled away; hides at the top. Same ask as the band.
```html
<div class="bf-sticky" aria-hidden="true">
<a class="bf-logo-s" href="/" aria-label="Bar Franco, home"><img src="/static/logos/bar-franco-script-incline/deep-red.svg" alt="" width="709" height="496"></a>
<div class="bf-band-r"><a class="bf-mbtn" href="#footer" aria-controls="bf-menu" aria-expanded="false">Menu</a><a class="btn" href="/bookings/">Book a table</a></div>
</div>
```

### The Menu screen (after the compact band; copy it whole, never edit per page)
Copied from the reference's own Menu screen: paper at left with the script large, the pages in three groups
(Home, Our story · Menus, Restaurant, Functions with Christmas, Corporate events, Private dining, Weddings and Events
pack indented under it, Aperitivo, Negroni bar, Pasta fresca, Before the stadium · Vouchers, Contact), a small portrait
floating beside the list, the hours and address at the foot with four small icons; one tall photograph filling the
right half with (book a table) on it. On phones the list stacks on paper with the small portrait beside it, the tall
photograph is dropped and (book a table) follows the list in Bright Red. Opened by any `.bf-mbtn`; Close or Esc shuts
it; focus stays inside; the page holds still behind it; the open page is marked (`aria-current="page"`). Without JS,
Menu jumps to the footer's page list. Its two photographs (`aperitivo-table-overhead`, `pack-2026/spritz-tray-sunlit`)
are reserved for it.

### The footer (copy it from /restaurant/index.html)
Deep Red, with the live footer's own words: the two page columns at right ((More) and (Franco)), BAR FRANCO centred
in Almond, the sign-off at left as a Marsha line with its turn (TI ASPETTIAMO, / *we're waiting for you.*), then the
base line (© Bar Franco 2026 · the emblem · Instagram · Facebook). Pages whose live footer has the **Find us** column
keep it (`<div class="bf-foot-find">`, under the sign-off); Home and Contact, whose live footers leave it out because
the page shows those details, leave it out. The year fills itself (`data-bf-year`); the open page is underlined.

---

## 5 · The page archetypes (from the reference's inner pages)

Every inner page is one of three archetypes. Pick the one that fits, map the live page's sections into its
components **in the live order**, and leave out any slot you have no live photograph or words for (never invent
one). The homepage keeps its own composition (§6). Geometry below is the reference's, in `u` at 1440 (phones at 390).

### 5.1 Content page = the reference's Services page
For Menus, Functions, Christmas, Corporate events, Private dining, Weddings, the four dining pages, Vouchers,
Bookings. `/restaurant/` is the worked example.

**head-ph** (optional): a photograph across the page under the band, with up to two small two-line captions at its foot.
```html
<figure class="ph head-ph scrim"><img …><div class="head-cap"><p>Two short<br>lines</p><p>Two more<br>lines</p></div></figure>
```
**intro** (the opening): a tall portrait at left (16, 419×605); at right the page's h1 (Marsha with its turn), one line
under it, up to two short columns, and the page's ask at the bottom right.
```html
<section class="intro" aria-labelledby="h1">
<figure class="ph intro-ph"><img … fetchpriority="high"></figure>
<div class="intro-txt">
<h1 class="h1" id="h1">The restaurant. <i>Level&nbsp;2.</i></h1>
<p class="intro-sub">Fresh pasta made in view, in an open kitchen you can&nbsp;watch.</p>
<div class="intro-cols"><p>Bar from 4pm</p><p>Kitchen from 5pm</p></div>
<p class="intro-ask"><a class="btn" href="/bookings/">Book a table</a></p>
</div>
</section>
```
Phones: the h1 first, then the portrait full width, then the words, the ask at right.

**testi**: a quote centred-left (395, 419 wide), one small photograph at the left edge, three at the right.
```html
<section class="testi" aria-label="What our guests say">
<figure class="ph"><img …></figure>
<blockquote class="quote"><p>“…”</p><cite>Name, occasion</cite></blockquote>
<div class="testi-ph"><figure class="ph"><img …></figure><figure class="ph"><img …></figure><figure class="ph"><img …></figure></div>
</section>
```
**pkgs** (the "( offerings )" section): a label, one wide photograph to the right edge, four numbered headings that work
as tabs, the ask at right; the open tab's paragraph and price sit under its own heading. Use it for packages and menus
(Functions: Canapés · Grazing · Shared Franco · Tutto Franco with their live prices). Fewer than four tabs is fine.
```html
<section class="pkgs" aria-labelledby="h-off">
<p class="label" id="h-off">offerings</p>
<figure class="ph pkgs-ph"><img …></figure>
<div class="pkgs-tabs" role="tablist" aria-label="Menus">
<button type="button" role="tab" id="t-1" aria-controls="p-1" aria-selected="true">01. Canapés</button>
<button type="button" role="tab" id="t-2" aria-controls="p-2" aria-selected="false">02. Grazing</button>
</div>
<a class="btn" href="#enquire">Check your date</a>
<div class="pkgs-panels">
<div role="tabpanel" id="p-1" aria-labelledby="t-1"><p>…live words…</p><p class="price">from $9pp</p></div>
<div role="tabpanel" id="p-2" aria-labelledby="t-2" hidden><p>…</p><p class="price">$40pp</p></div>
</div>
</section>
```
Phones: the headings stacked at left, the open panel beside them behind a hairline, the ask under them.

**port**: small captioned photographs down the left (optional), a large photograph (395, 651×879) with a title set on
it, the words and a link at the right.
```html
<section class="port" aria-labelledby="h-room">
<div class="port-s"><div class="r5"><figure class="ph"><img …></figure><span class="r5-t">Name</span><span class="r5-s">One line</span></div></div>
<figure class="ph port-ph scrim"><img …><h2 class="on-ph" id="h-room"><span class="mh">Nothing happens</span><i>behind a&nbsp;door</i></h2></figure>
<div class="port-txt stack"><p class="label">01 · The room</p><p>…</p><p class="go"><a …>…</a></p></div>
</section>
```
**faqx** (the "( common questions )" section): a label and two photographs at left, one question at a time at right
with Prev / Next, a photograph under it, the ask at the foot. **Every question and answer stays in the HTML** (the
FAQPage JSON-LD must match what the page shows); `bf-ed.js` shows one at a time, keeps the box at the tallest answer,
and opens the one a link points to. Without the script they stack. Photographs are optional.
```html
<section class="faqx" id="questions" aria-labelledby="h-q">
<p class="label" id="h-q">common questions</p>
<div class="faqx-l"><figure class="ph"><img …></figure><figure class="ph"><img …></figure><a class="btn" href="#enquire">Check your date</a></div>
<div class="faqx-r">
<div class="faqx-q"><div class="faqx-list">
<div class="qa" id="q-lunch"><h3>Can we have lunch?</h3><div><p>Yes…</p></div></div>
<div class="qa" id="q-hire"><h3>Is there a venue hire fee?</h3><div><p>No…</p></div></div>
</div></div>
<figure class="ph"><img …></figure>
</div>
</section>
```
(The `<details class="faq">` list in §7 is the stacked alternative; either keeps every question on the page.)

**photo-break**: `bandph` (§6), with or without the three small quotes.

### 5.2 Story page = the reference's About page
For Our story and Robbie.

**blank** (the opening): a wide empty paper field under the band with only the page's h1, low in the middle; at most
one line under it; a link at the bottom right.
```html
<section class="blank" aria-labelledby="h1">
<h1 class="h1" id="h1">Our story <i>…its live turn…</i></h1>
<p>One live line, if the page has it.</p>
<p class="go"><a href="#…">…</a></p>
</section>
```
**intro2**: two small photographs top left (16 and 175, 146×202), a big portrait at the right edge (841, 599×827), the
words at left (379 wide).
```html
<section class="intro2" aria-label="…">
<figure class="ph intro2-s1"><img …></figure><figure class="ph intro2-s2"><img …></figure>
<figure class="ph intro2-big"><img …></figure>
<div class="intro2-txt"><p>…</p><p>…</p></div>
</section>
```
**seen** (the "( as seen in )" section): the label over a portrait centred-left (531, 379×548), a small photograph
further left, a list at right (1114), a link. For us: the page's press or mentions list if it has one, else its facts.
```html
<section class="seen" aria-labelledby="h-seen">
<p class="label" id="h-seen">as seen in</p>
<figure class="ph seen-ph"><img …></figure><figure class="ph seen-s"><img …></figure>
<ul class="seen-list"><li>…</li></ul>           <!-- or <ul class="facts seen-list"> -->
<p class="go"><a …>…</a></p>
</section>
```
**cta2**: a photograph filling the top left to the page edge (904×543), two small photographs at right, a heading and
the words at left, the ask.
```html
<section class="cta2" aria-labelledby="h-cta">
<figure class="ph cta2-big"><img …></figure>
<div class="cta2-txt stack"><h2 class="h3" id="h-cta">…</h2><p>…</p><p>…</p></div>
<a class="btn" href="…">…</a>
<div class="cta2-s"><figure class="ph"><img …></figure><figure class="ph"><img …></figure></div>
</section>
```
Then a photo-break and the footer.

### 5.3 Form page = the reference's Contact page
For Contact (and the enquiry section of an events page, if it reads better that way). A portrait fills the left half
from the top of the page with the band laid over it (`.bf-band.slim.over`); at right the label, a short intro and the
form: labels above, hairline fields in two columns, full-width rows, the send button centred.
```html
<header class="bf-band slim over"> … (logo with .dr and .al scripts) … </header>
<main id="main">
<section class="fpage" aria-labelledby="h1">
<figure class="ph fpage-ph"><img … fetchpriority="high"></figure>
<div class="fpage-txt"><p class="label">Contact</p><h1 class="h1" id="h1">…</h1><p>…live intro…</p></div>
<div class="fpage-form">
<form class="form two" data-email="ciao@barfranco.nz" data-subject="Message from barfranco.nz">
<div class="field"><label for="c-name">Your name</label><input id="c-name" name="name" type="text" autocomplete="name" required></div>
<div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
<div class="field full"><label for="c-msg">Message</label><textarea id="c-msg" name="message" required></textarea></div>
<button class="btn" type="submit">Send</button>
</form>
</div>
</section>
```
Keep the live form's fields, labels and button text exactly; only the layout changes. (`.field` is the form-field
wrapper; the story page's opening is `.blank`.) On phones the photograph runs
across the top with the band (Almond) over it, and the fields stack.

---

## 6 · Homepage components (the reference's home, as fluid sections)

The homepage maps the live homepage, section by section, into these. They are available to any page.

```html
<!-- pair: two portraits (335 and 726, 379×548); under them a paragraph and a link, or each one's own words -->
<section class="pair floors" id="climb" aria-labelledby="h-floors">
<h2 class="h2 pair-h" id="h-floors">Two floors, <i>one building.</i></h2>
<figure class="ph"><img …></figure><figure class="ph"><img …></figure>
<div class="pair-txt stack" id="bars"><p class="label">Level 1 · The bars</p><h3 class="h3 m">Spritz &amp; Negroni Bar.</h3><p>…</p><p class="btns"><a class="go" …>Drinks menu</a></p></div>
<div class="pair-txt stack" id="dine">…</div>
</section>
<!-- .pair.solo: one portrait, its words beside it in the second slot -->

<!-- words: up to five words scattered along the row's own offsets (the homepage strip) -->
<p class="words"><span>Pasta fresca</span><span>Pizza</span><span>Negroni</span><span>Aperitivo</span><span>Vino</span></p>

<!-- row5: up to five small captioned photographs on one line (.n3/.n4 for fewer; .scroll on phones) -->
<section class="row5" aria-label="…"><a class="r5" href="…"><figure class="ph"><img …></figure><span class="r5-t">Name</span><span class="r5-s">One line</span></a></section>

<!-- feature: label, a wide photograph from 23% to the right edge with its title, two text columns, a link (.flip mirrors) -->
<section class="feature" aria-labelledby="h-x"><p class="label">…</p>
<div class="ph feature-ph scrim"><img …><h2 class="on-ph" id="h-x"><span class="mh">…</span><i>…</i></h2></div>
<div class="feature-txt"><p>…</p><p>…</p></div><p class="go r"><a …>…</a></p></section>

<!-- slides: a tall photograph that turns over (01 02 03; bf-ed.js adds the numbers), a quote beside it -->
<section class="slides-s" aria-label="…"><div class="ph slides" data-slides><img class="on" …><img …><img …><p class="label al">…</p></div>
<blockquote class="quote"><p>“…”</p><cite>Name, occasion</cite></blockquote></section>

<!-- tall: the slides' geometry with one photograph (a label on it) and a column of words (.flip mirrors) -->
<section class="tall" id="host" aria-labelledby="h-host">
<figure class="ph tall-ph scrim"><img …><p class="label">Private events · Both levels</p></figure>
<div class="tall-txt stack"><h2 class="h2" id="h-host">Host at Franco.</h2><p class="lead">…</p><ul class="facts">…</ul>
<blockquote class="quote"><p>“…”</p><cite>…</cite></blockquote><p class="btns"><a class="btn" …>Plan an event</a></p></div></section>

<!-- strip: a text column, three tall photographs running off the right edge -->
<section class="strip" aria-label="…"><p class="label">…</p><div class="strip-txt"><p>…</p><p class="go"><a …>…</a></p></div>
<div class="strip-ph"><figure class="ph"><img …></figure><figure class="ph"><img …></figure><figure class="ph"><img …></figure></div></section>

<!-- bandph: the photo-break. A full-width photograph; optional three small quotes and a title; .plain = photograph alone -->
<figure class="ph bandph plain"><img …></figure>
<section class="ph bandph" aria-labelledby="h-y"><img …><div class="bandph-q"><p>“…”</p><p>“…”</p><p>“…”</p></div><h2 class="on-ph" id="h-y"><span class="mh">…</span><i>…</i></h2></section>

<!-- scatter: small photograph top right, label, big photograph, small one bottom left, words, a link -->
<section class="scatter" aria-label="…"><figure class="ph sc-s1"><img …></figure><p class="label">…</p><figure class="ph sc-big"><img …></figure>
<figure class="ph sc-s2"><img …></figure><div class="sc-txt"><p>…</p></div><p class="go"><a …>…</a></p></section>

<!-- host: a centred landscape photograph with a name on it, a two-line sub, a paragraph, a link -->
<section class="host" aria-labelledby="h-h"><figure class="ph host-ph scrim"><img …><h2 class="on-ph" id="h-h">…</h2></figure>
<p class="host-sub">…<br>…</p><p>…</p><p class="go r"><a …>…</a></p></section>
```
Words on a photograph always need `.scrim` on the `.ph` (or the band's own gradient).

---

## 7 · Functional pieces (same language)

### Words, sections, text
```html
<p class="label">01 · The room</p>          <!-- Bright Red, regular; the CSS draws the brackets: (01 · The room). .label.al on a photograph -->
<h1 class="h1">The restaurant. <i>Level&nbsp;2.</i></h1>   <!-- the page title, Marsha 34–64px, italic turn -->
<h2 class="h2">Take the lift, or the&nbsp;stairs</h2>       <!-- Marsha 28–44px; <i> for a turn; <span class="pre">(Upstairs)</span> for a small line above -->
<h3 class="h3 m">Spritz &amp; Negroni Bar.</h3>           <!-- a small Marsha head (≥24px); .h3 alone is Affairs -->
<p class="lead">A larger opening sentence.</p>
<p class="small">A small aside.</p>
<p class="go"><a href="/menus/">See the menus</a></p>     <!-- the underlined link; .go.r right, .go.c centre; or <a class="go"> -->
<div class="stack">…</div>                                <!-- label, title, words, facts, asks at the reference's spacing -->

<section class="sec">…</section>              <!-- the reference's air: 120u above and below (phones 64u); .tight 64u; .flush no top -->
<section class="sec prose">…</section>        <!-- a text column on the 335 line; .at-395 (the quote line), .at-l, .at-r, .at-c -->
<section class="sec cols"><div class="stack">…</div><ul class="facts">…</ul></section>   <!-- words left, facts/frame/embed right -->
```
Never type a label's brackets yourself, or it reads ((upstairs)).

### facts: label · fact rows on hairlines
```html
<ul class="facts">
<li><span>The lift</span><i></i><em>by H&amp;M and KOOKAÏ</em></li>
<li><span>Telephone</span><i></i><a href="tel:+64212211307">021 221 1307</a></li>
</ul>
```
The `<i>` draws the leader dots low on the baseline (owner's rule); phones drop them. `.facts.price` for prices.

### frame: the printed menu's double rule
```html
<div class="frame">
<p class="frame-h">Pasta</p>
<ul class="facts price"><li><span>Pici cacio e pepe, pecorino romano, black pepper</span><i></i><em class="v">33</em></li></ul>
<p class="frame-s">Gluten-free on request.</p>
<p class="frame-go"><a class="btn" href="/menus/#sheet-food">See the full menu</a></p>
</div>
<div class="frame mcover"><p class="mcover-n">FRANCO</p><p class="mcover-k">…</p><p>…</p><a class="btn" href="/menus/#sheet-food">…</a></div>
```
(`#sheet-food`, `#sheet-drink`, `#sheet-events` open that tab on /menus/.) Use a menu cover only where the live page has one.

### quote, steps, questions, chapters
```html
<blockquote class="quote"><p>“…”</p><cite>Name, occasion</cite></blockquote>     <!-- the quote italic, the name regular -->
<ol class="steps"><li><span class="n">01</span><h3>Pick a date</h3><p>One line.</p></li></ol>
<div class="faq"><details><summary>Can we have lunch?</summary><div><p>Yes…</p></div></details></div>
<details class="chap" name="pack" id="ch-food" open><summary><span class="n">03</span><span class="t">Food</span></summary><div class="chap-b">…</div></details>
```
`name="pack"` keeps one chapter open at a time (native). `bf-ed.js`: a link to a chapter or question (or anything inside
one) opens it and lands under the compact band; printing opens every `<details>` and every hidden `.faqx` answer.

### Embeds (keep each `src` exactly as the live page has it)
```html
<div class="embed book"><iframe src="https://bookings.nowbookit.com/?accountid=e9d59bc3-73d5-4e64-a6e7-32a753b7dd3a&amp;venueid=12388&amp;theme=light&amp;colors=hex,AF0F00,6C0600" title="Book a table at Bar Franco" loading="lazy"></iframe></div>
<div class="embed vf"><iframe src="https://venueflowhq.com/enquire/bar-franco?embed=1&amp;accent=AF0F00" title="Plan your event — Bar Franco" loading="lazy"></iframe></div>
<div class="embed map"><iframe src="https://www.google.com/maps?q=166+Cashel+Street,+Christchurch+Central&amp;output=embed" title="Map to Bar Franco, 166 Cashel Street" loading="lazy"></iframe></div>
```
VenueFlow: `bf-ed.js` shows a loading note and sizes the frame to the height the form reports (venueflowhq.com only);
`vf-tracking.js` adds the ad-click parameters and fires the conversions. Put the enquiry form inside `id="enquire"`.

### Contact form (FormSubmit)
`<form class="form" data-email="ciao@barfranco.nz" data-subject="Message from barfranco.nz">` (or `.form.two` on a form
page, §5.3), no `action`/`method`, `<button class="btn" type="submit">Send</button>`. `bf-ed.js` adds a honeypot, posts
form-encoded to FormSubmit's AJAX endpoint (never JSON: CORS blocks it), fires the Google Ads email conversion on
success, says Grazie in place of the form, and on failure offers the message as a ready-made email. `data-mode="mailto"`
opens the email straight away. **Never submit it while testing**; stub `**/formsubmit.co/**`.

### Tabs (Menus, and `.pkgs`)
Any `[role=tablist]` with `<button role="tab" aria-controls="panel-id">` works (`.tabs`, the old `.mn-tabs`,
`.pkgs-tabs`). Arrow keys move; a link to `/menus/#sheet-events` opens that tab and lands on it; add `data-hash` to the
tablist (the Menus page) to write the open panel into the address. The printed-menu sheets keep their markup and
classes (`.pm .pm-food .pm-drink .pm-title .course .card-h .pm-d .pm-p .pm-n .pm-two .card-em`, `.evm-*`, `#sheets`):
food stays the printed page scaled (phones too), drinks drop to reading size on phones.

### Events: room finder, calendar, held date, December strip
Keep the ids; style with the new classes. Everything is optional.
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
<div class="hold" id="sdHold" data-close="24">   <!-- Christmas: data-months="10,11" data-mo="11"; Private dining: data-guests="0" -->
<div><div class="hold-mo" id="sdMo" role="group" aria-label="Month"></div>
<div class="hold-wk" aria-hidden="true"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
<div class="hold-g" id="sdG" role="group" aria-label="Choose a date"></div>
<p class="hold-key"><span class="k-fs">Fri &amp; Sat, minimum spend applies</span><span>Closed 24 December to 5 January</span></p></div>
<div class="hold-sum"><ul class="facts"><li><span>Date</span><i></i><em id="sdSumD">pick one</em></li><li><span>Guests</span><i></i><em id="sdSumN">40, seated</em></li><li><span>Floor</span><i></i><em id="sdSumR">either floor</em></li><li><span>Minimum spend</span><i></i><em id="sdSumM">pick a date</em></li></ul>
<a class="btn" id="sdHoldBtn" href="#sdForm">Hold this date</a><p class="hold-msg" id="sdHeld" role="status" aria-live="polite"></p></div>
</div>
```
- Limits from `data-seat`/`data-stand` on `#sdRow` or `#sdFind` (165 / 240). The calendar shows the next four months (or
  only `data-months`), opens on `data-mo`, greys out past and closed days (`data-close="24"` → 24 Dec to 5 Jan), marks
  Fri/Sat. A picked date (with a finder, also guests and seated/standing) goes into every VenueFlow iframe as
  `prefillDate` / `prefillGuests` / `prefillFormat`. `#sdAvailD`: past Fridays drop off (NZ time).
- The owner's October 2026 events rules still hold (one capacity, `$` prices, minimum spends $4,000 / $7,500 / $15,000,
  open until 23 December, the proof directly above the enquiry form) because they are the live pages' words.

---

## 8 · Phones (≤760px)

The reference's own phone composition, measured at 390: recomposed, not shrunk. The unit becomes 1/390 of the width;
the frame tightens (15px margin, rules at 6 and 9px). Inner bands keep the script left and Menu + the ask right (the ask
44px tall). The Menu stacks on paper. intro: the h1 first, then the portrait, then the words. testi: three small
photographs in a row, the quote under them. pkgs: headings stacked at left, the open panel beside them. port: two small
photographs side by side, the big one bleeding right, words under it. faqx: label, two photographs, Prev / Next, the
question. blank: the h1 low in a shorter field. intro2: two small photographs, the words, the portrait full width.
seen: the portrait, the list in two columns. cta2: the photograph bleeding left, the words, two small photographs.
fpage: the photograph across the top with the band over it, the form in one column. Homepage components follow the
reference's phone home. Functional pieces take the full measure with a 13.4u margin; leader dots go. Tap targets are at
least 44px. Test at 390×844 and 360×780; desktop at 1440×900 and 1024×768.

## 9 · Motion

Only this: photographs below the first screen settle in once (fade + 12px), at 2.5s everything is on regardless; slides
crossfade; the compact band slides in; the Menu fades. Under `prefers-reduced-motion` nothing moves (and smooth anchor
scrolling is off). Add no other motion.

## 10 · Page CSS: the marker blocks

Build with the components first. When a page truly needs its own rules, append them **inside your group's block at
the end of `static/bf-ed.css`**, every selector prefixed with the page's body class (`.pg-menus …`). Never edit
another group's block or the shared rules above them (ask the foundation owner instead):

```
/* ---- P1 · menus, bookings, vouchers, contact ---- */          … /* end P1 */
/* ---- P2 · functions, corporate-events, private-dining ---- */ … /* end P2 */
/* ---- P3 · christmas-functions, weddings, events-pack, robbie ---- */ … /* end P3 */
/* ---- P4 · aperitivo, negroni-bar, fresh-pasta, pre-stadium-dining ---- */ … /* end P4 */
/* ---- P5 · our-story, 404 ---- */                              … /* end P5 */
/* ---- P0 · home, restaurant (the foundation's own pages) ---- */ … /* end P0 */
```
No `<style>` blocks, no `style=""` except `object-position` on an `<img>`. No new JS files: behaviour belongs in
`bf-ed.js`, generic and data-attribute driven (ask the foundation owner).

## 11 · Photographs

- **Use exactly the photographs your live page shows** (rule 0), each with its live `alt`. Choose crops with
  `object-position` (the one inline style allowed). If an archetype slot has no live photograph, leave the slot out.
  The same picture in a wider or taller file of the same shot is acceptable only where the live file cannot fill the
  slot; say so in your report.
- **Do not add photographs** a page doesn't have now, and never use the Menu screen's two (`aperitivo-table-overhead`,
  `pack-2026/spritz-tray-sunlit`) on a page.
- **Repeats that already exist on the live site** (the same picture on two live pages: e.g. `bar-negroni-scales` on Home
  and Private dining, `open-kitchen` on Restaurant and Private dining, `level2-dining-room` on Home and Christmas,
  `negroni-tray-hands` on Home and the Events pack, `event-service` on Home and Corporate events,
  `pack-2026/curtained-table-for-twenty` and `guests-in-the-booth` on Functions and Corporate events) stay as they are
  under the verbatim rule; list them in your report for the owner rather than swapping a photograph.
- Twins under other names: `hero-table` = `aperitivo-table-cheers` = `aperitivo-table-menus`; `dining-pasta` =
  `pasta-marble-table`; `server-tray` = `level-negroni-graded`; `bar-dancing` = `party-dancing-bar`;
  `restaurant-room-daylight` = `restaurant-plants-sky` ⊃ `restaurant-room-hero`; `cocktail-tray` = `fig3-the-kitchen` ≈
  `negroni-tray-hands`; `fig2-the-table-web` = `waiter-wine-service`; `parmigiana-flat` ≈ `parmigiana-spritz`.
- **Banned:** the old yellow artichoke pendant lamps (also in `level1-event-setup`, `level1-bar`, `level1-bar-crowd`,
  `room-pendants-crowd`, `pack-2026/restaurant-long-tables-artichoke-lamp`, `pack-2026/guests-candlelit-long-table`),
  the bartender in the striped shirt (`bar-spritz-pour`, `pack-2026/bartender-pouring-spritzes`), the chef with the
  steel bowl. If a live page shows one, flag it for the owner.
- Every `<img>`: `width`, `height`, the live `alt`, `loading="lazy" decoding="async"` (only the first photograph is
  eager, `fetchpriority="high"`).

## 12 · What the old scripts did, and where it went (the audit)

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
| Menus tabs + `#sheet-…` deep links (`editorial.js`, `franco.js`) | yes | part 7 (generic `[role=tablist]`, `data-hash`) |
| Events pack chapters: deep link opens and lands, opened chapter lands, print opens all (`events-pack.js`, `editorial.js` openHash) | yes | part 8 (`details.chap`, all `<details>` for print) |
| Phone chapter accordions on Functions/Christmas (`editorial.js` `data-chapters`) | yes (UX) | replaced by `details.chap`, `.faq`, `.faqx` |
| 404 casing redirect (inline in 404.html) | yes | stays inline, verbatim |
| Skip link (`editorial.js`) | yes | static `.bf-skip` in the markup |
| Phone menu with focus trap, Esc, Book/Call/Directions/hours (`editorial.js`) | yes | the Menu screen, part 5 |
| Top bar ask matched to the page (`editorial.js`) | yes | written in the markup (band and compact band) |
| Book a table always reachable (top bar states) (`editorial.js`) | yes | the compact band, part 4 |
| Footer year (`chrome.js` `data-bf-year`) | yes | part 2 |
| Photos settle in (`editorial.js` `.rv`) | decorative, kept | part 1 |
| Questions one at a time (new, from the reference) | yes | part 8b (`.faqx`) |
| Night mode / lights, live clock `#openH` (`editorial.js`) | decorative | dropped |
| Lead curtain, swipeable dog on a lead (`editorial.js`) | decorative | dropped |
| Page-turn walk between pages (`editorial.js`, inline `walking-in`) | decorative | dropped |
| Floors + dog on the seam, eased scroll, Level 1 · Level 2 toggle (`editorial.js`) | decorative | dropped (both floors shown side by side) |
| Header tone sampling (`editorial.js` mastTick) | decorative | dropped |
| Sticky conversion CTA `.sticky-cta` (`editorial.js`) | replaced | the compact band |
| Home: arrival curtain, marquee strip, word-by-word intro, zoom, host dog, Book-a-table sheet (`hm-experience.js`) | decorative | dropped (Book a table goes to /bookings/) |
| Events: dogs, banner lettering, hover index, night steps, masthead band, cover check (`sd-events.js`) | decorative | dropped |
| Functions: nameplate fit, coaster flip, chapter folds (`functions.js`) | decorative / dead on the live page | dropped |
| Menus inline `.mp-sheet` reader (no `.mp-sheet` on the page any more) | dead | dropped |


## Addenda (coordinator, after review)
- The footer carries the hours line (`.bf-foot-ad`) on every page (snippet above).
- Room finder: use `.rooms` > `.room[data-room]` cards; bf-ed.js toggles `.fit` / `.nofit` on them (styled in the shared CSS).
- The calendar's default close is the 24th (open until 23 December).
- FAQPage parity: every Question/Answer in a page's JSON-LD must appear visibly on the page, word for word.
- Christmas: carry `data-track` onto the band ask, the compact band ask and every `#enquire` button.
- The printed-menu facsimile on /menus/ (`.pm .card-h`) is the one sanctioned exception to Marsha ≥24px.
- CLAUDE.md describes the old system; where it conflicts with this guide, this guide wins for pages on bf-ed.css.
