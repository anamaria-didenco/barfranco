# Composition ideas: brief for Claude Code

Visual reference: the design canvas https://claude.ai/artifact/D8zXr3xh7CKGZASRKpHmwz
(boards 01–04 are the wireframes, "Ideas applied to Home" is the full-size mockup, "Nav bar ideas" is the nav).

Before starting, read `CLAUDE.md` and `DESIGN-FIXES.md`. Everything below must obey them: one stylesheet
(`static/franco.css`), only the four tokens, no shadows, no gradients, no arrows, Marsha never below 24px,
text never over a photograph (except Home's hero and the editorial `.pg-hero`), one photograph per page,
page-specific CSS in the page's own `/* ==== page ==== */` block prefixed by its `<main class="pg-…">`.
Use the site's existing copy exactly. Do not write new copy. Verify the real class names in `franco.css`
before editing; the names below come from CLAUDE.md, not from reading the stylesheet.

## 01 Vary the photograph, not just the edge
**Problem:** chapters end in the same full-bleed 2.39:1 strip (`.ph.full.r-169`), so the scroll has one rhythm.
**Do:** per page, use at most one cinema strip. Pair the next chapter's text with a 4:5 portrait set to one side
and offset down (≈56px) from the text's first line. Where a third picture exists, a 3:2 that bleeds off one
edge at roughly 60% width. Keep the existing phone rule: odd chapters bleed right, even chapters bleed left.
**Don't:** add photographs or reuse one on another page. Re-crop the ones already on the page.
**Try first on:** Home chapter 03 "Host at Franco".

## 02 One object per section, with air around it
**Problem:** on dining and event pages the framed menu cover, a sentence and two asks are packed together.
**Do:** let the framed menu cover (`.frame`: letterspaced name, which menu, one line, one `.btn.fill`) stand alone in its
section, centred, with generous Almond space (about half the band empty on desktop). Remove the duplicate
asks from that section; the closing section already carries Book a table · Plan an event.
**Don't:** add text under the cover.
**Pages:** aperitivo, negroni-bar, fresh-pasta, pre-stadium-dining (`.pg-dine`).

## 03 Draw the building (the two-levels pair)
**Problem:** the `.two` pair already staggers (downstairs lower than upstairs) but nothing joins the photographs.
**Do:** add two hairline floors under each photograph: a Deep Red 1px rule under the downstairs photo, a
`--hairline` rule under the upstairs photo, both running the content width. Beneath each, a Marsha label
and the existing italic line, using the site's words: "Level 1 · The bars / Spritz & Negroni Bar." and
"Level 2 · The kitchen / Open Kitchen Restaurant." Downstairs stays lower. Nothing sits on the photographs, and they stay unframed.
**Phones:** keep the existing alternating-edge rule; the floor rules become full-width hairlines between the two.
**Pages:** Home, Our story ("Two levels. One world."). Check the three-chapter strips (`.fn-three`, `.x-three`, `.ev-three`) still put 02 Upstairs highest.

## 04 Sign off on the centre axis
**Problem:** closing bands hang from the left margin.
**Do:** desktop only. Centre the closing word (`.word.close`), the two `.line` asks (Book a table … 4pm till late,
Plan an event … up to 240; event pages Call · Check your date) and the emblem
(`static/logos/emblem/deep-red.svg`, about 120px wide) on one axis, the emblem last at the foot. Asks
share a measure of about 560px.
**Phones:** keep the left reading margin; just add the emblem at the foot. The dock still carries the ask.
**Rule check:** the band before the footer must not be Night; no more than two `ch-aframe`/`ch-night`/`ch-poster` chapters per page.

## Nav bar (pick one; recommendation: B on desktop, E on phones)
Current links: Menus · Restaurant · Functions · Christmas · Vouchers · Contact + Book a table.
- **A** centred wordmark: three links left, BAR FRANCO letterspaced in the centre, Christmas · Contact · Book a table right.
- **B** grouped: italic heads over hairlines, "Eat & drink" (Menus, Restaurant), "Host" (Functions, Christmas, Vouchers), "Visit" (Contact), then Book a table.
- **C** two asks: Menus · Restaurant · Functions · More on the left, Plan an event + Book a table on the right (Christmas, Vouchers, Contact under More).
- **D** over the hero photograph in Almond with the running line "(upstairs) · 166 Cashel St, Christchurch" in the centre.
- **E** phone Index as a full Deep Red sheet: every destination in Marsha at one size, hairlines between, "Book a table · Plan an event" as the last line.

The masthead is repeated on every page (no templating), so any nav change must be made on every page, including
`christmas-functions` (campaign masthead) and `404.html`. Keep `aria-current="page"` and the dachshund under the open page, and the
`vf-tracking.js` line in every `<head>`.

## Order of work and checks
1. Idea 03 and 01 on Home first, then review at 1440, 1024 and 375 wide.
2. Idea 04 across all pages, then idea 02 on the four dining pages.
3. Nav last, after choosing a variant.
4. For each change: no raw hex outside tokens, no `<style>` or inline `style=""`, descending heading levels, photograph used on one page only
   (`grep -l 'images/<name>.jpg' index.html */index.html`), reduced-motion unaffected, `sitemap.xml`/JSON-LD untouched.
