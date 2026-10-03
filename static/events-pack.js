/* Bar Franco — Events Pack: eight chapters that open underneath their row (Welcome, The spaces and Pricing open on
   load), opened by click / tap only, #ch-… deep links, and the three food tabs.
   Runs alongside static/franco.js (motion). Without JS every chapter and menu shows (franco.css hides closed
   chapters only under html.fx). */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chapters = [].slice.call(document.querySelectorAll('.pk-ch'));
  var byId = {};
  chapters.forEach(function (ch) { byId[ch.id.replace(/^ch-/, '')] = ch; });

  function head(ch) { return ch.querySelector('.pk-row'); }
  function setOpen(ch, on) {
    ch.setAttribute('data-open', on ? 'true' : 'false');
    var h = head(ch);
    if (h) h.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  function open(id) {
    chapters.forEach(function (ch) { setOpen(ch, ch === byId[id]); });
  }
  function jump(ch) {
    var h = head(ch) || ch, mast = document.querySelector('.bf-mast');
    var off = (mast ? mast.getBoundingClientRect().height : 72) + 8;   // clear of the sticky masthead
    window.scrollTo({ top: h.getBoundingClientRect().top + window.scrollY - off, behavior: reduce ? 'auto' : 'smooth' });
  }

  // click / tap a chapter row: open it, or close it if it's already open. Hovering does nothing.
  chapters.forEach(function (ch) {
    var h = head(ch); if (!h) return;
    var id = ch.id.replace(/^ch-/, '');
    h.addEventListener('click', function () {
      if (ch.getAttribute('data-open') === 'true') { setOpen(ch, false); return; }
      open(id); jump(ch);
    });
  });

  // "see the minimum spends"-style links inside the chapters: open the chapter they point to, then land on it
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-ep-open]');
    if (!a) return;
    var ch = byId[a.getAttribute('data-ep-open')]; if (!ch) return;
    e.preventDefault();
    open(a.getAttribute('data-ep-open')); jump(ch);
    if (history.replaceState) history.replaceState(null, '', '#' + ch.id);
  });

  // on load: Welcome open; a deep link (/events-pack/#ch-drinks) opens its chapter instead
  function fromHash(first) {
    var id = (location.hash || '').replace(/^#ch-/, '');
    if (byId[id]) { open(id); setTimeout(function () { jump(byId[id]); }, 60); }
    else if (first === true) ['welcome', 'spaces', 'pricing'].forEach(function (k) { if (byId[k]) setOpen(byId[k], true); });
  }
  fromHash(true);
  window.addEventListener('hashchange', fromHash);

  // the three ways to feed the room
  var tabs = [].slice.call(document.querySelectorAll('[data-ep-tab]'));
  function show(t) {
    tabs.forEach(function (x) {
      var on = x === t, p = document.getElementById(x.getAttribute('aria-controls'));
      x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
      if (p) p.hidden = !on;
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (k) { e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; show(n); n.focus(); }
    });
  });
  if (tabs.length) show(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);

  // print: every chapter open
  window.addEventListener('beforeprint', function () { chapters.forEach(function (ch) { ch.setAttribute('data-print', ch.getAttribute('data-open')); setOpen(ch, true); }); });
  window.addEventListener('afterprint', function () { chapters.forEach(function (ch) { setOpen(ch, ch.getAttribute('data-print') === 'true'); }); });
})();
