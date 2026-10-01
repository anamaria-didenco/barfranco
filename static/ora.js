/* Bar Franco — "Ora" pages: reveal motion, masthead, Index takeover, in-page jumps,
   the homepage running head, the Menus tabs and the Events Pack print button.
   Plain JS, no dependencies. Everything degrades to a static page without it. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal: [data-rv] fades/rises in (photos .g-ph reveal by clip-path) ---- */
  function show(e) {
    if (document.hidden) { e.style.transition = 'none'; e.setAttribute('data-instant', '1'); }
    e.setAttribute('data-in', '1');
  }
  function thaw() {
    if (!document.hidden) document.querySelectorAll('[data-instant]').forEach(function (e) { e.style.transition = ''; e.removeAttribute('data-instant'); });
  }
  function sweep() {
    var vh = window.innerHeight || 800;
    document.querySelectorAll('[data-rv]:not([data-in])').forEach(function (e) {
      var r = e.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) show(e);
    });
  }
  if (reduce) {
    document.querySelectorAll('[data-rv]').forEach(function (e) { e.setAttribute('data-in', '1'); });
  } else {
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
      document.querySelectorAll('[data-rv]').forEach(function (e) { io.observe(e); });
    }
    sweep();
    var rafR = 0;
    var onScrollR = function () { if (!rafR) rafR = requestAnimationFrame(function () { rafR = 0; sweep(); }); };
    window.addEventListener('scroll', onScrollR, { passive: true });
    window.addEventListener('resize', onScrollR);
    window.addEventListener('load', sweep);
    document.addEventListener('visibilitychange', function () { thaw(); sweep(); });
    // hidden documents (background tabs, captures) never scroll: reveal everything so nothing stays blank
    setTimeout(function () { if (document.hidden) document.querySelectorAll('[data-rv]:not([data-in])').forEach(show); }, 2500);
  }

  /* ---- masthead: 76px, condensing to 60px once scrolled ---- */
  var head = document.querySelector('[data-ora-masthead]');
  if (head) {
    var rafH = 0;
    var onScrollH = function () {
      if (!rafH) rafH = requestAnimationFrame(function () { rafH = 0; head.style.height = (window.scrollY || 0) > 32 ? '60px' : '76px'; });
    };
    window.addEventListener('scroll', onScrollH, { passive: true });
    onScrollH();
  }

  /* ---- Index takeover (phones and small tablets) ---- */
  var tk = document.getElementById('ora-index'), lastFocus = null;
  function openIndex() {
    if (!tk) return;
    lastFocus = document.activeElement;
    tk.hidden = false; document.body.style.overflow = 'hidden';
    var c = tk.querySelector('[data-ora="menu-close"]'); if (c) c.focus();
  }
  function closeIndex() {
    if (!tk || tk.hidden) return;
    tk.hidden = true; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-ora="menu-open"]').forEach(function (b) { b.addEventListener('click', openIndex); });
  document.querySelectorAll('[data-ora="menu-close"]').forEach(function (b) { b.addEventListener('click', closeIndex); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeIndex(); });
  if (tk) tk.addEventListener('click', function (e) { if (e.target.closest('a[href]')) closeIndex(); });

  /* ---- in-page jumps: land 84px down, under the masthead ---- */
  function go(id, smooth) {
    var el = document.getElementById(id); if (!el) return false;
    var top = el.getBoundingClientRect().top + window.scrollY - 84;
    window.scrollTo({ top: top, behavior: reduce || !smooth ? 'auto' : 'smooth' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (id && go(id, true)) { e.preventDefault(); if (history.replaceState) history.replaceState(null, '', '#' + id); }
  });
  if (location.hash.length > 1) {
    var h = decodeURIComponent(location.hash.slice(1));
    setTimeout(function () { go(h, true); }, 600);
  }

  /* ---- print (Events Pack) ---- */
  document.querySelectorAll('[data-ora="print"]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* ---- homepage running head follows the chapter past the viewport midpoint ---- */
  var run = document.getElementById('ora-run');
  if (run) {
    var heads = { home: 'Bar Franco · (upstairs) · down the laneway · 4pm till late', 'g-food': 'Bar Franco · 03 · The menus', 'g-ev': 'Bar Franco · Host at Franco · private events & venue hire', 'g-lv': 'Bar Franco · The spaces · pick a level, or take both', 'g-close': 'Bar Franco · 04 · Come say ciao' };
    var rafC = 0;
    var chapter = function () {
      rafC = 0;
      var mid = window.innerHeight * 0.5, c = 'home';
      ['g-food', 'g-ev', 'g-lv', 'g-close'].forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= mid) c = id; });
      if (run.textContent !== heads[c]) run.textContent = heads[c];
    };
    window.addEventListener('scroll', function () { if (!rafC) rafC = requestAnimationFrame(chapter); }, { passive: true });
    chapter();
  }

  /* ---- Menus: Food / Drinks tabs swap the sheet and the sticky photograph ---- */
  var tabs = document.querySelectorAll('[data-ora^="tab-"]');
  if (tabs.length) {
    var setTab = function (k, scroll) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-ora') === 'tab-' + k;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.style.color = on ? 'var(--spritz)' : 'var(--deep-red)';
        t.style.borderColor = on ? 'var(--spritz)' : 'transparent';
      });
      document.querySelectorAll('[data-ora-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-ora-panel') !== k; });
      var sec = document.getElementById('sheets'); if (sec) sec.setAttribute('data-tab', k);
      if (scroll && sec) {
        var top = sec.getBoundingClientRect().top + window.scrollY - 60;
        if (Math.abs(window.scrollY - top) > 40) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }
    };
    tabs.forEach(function (t) { t.addEventListener('click', function () { setTab(t.getAttribute('data-ora').slice(4), true); }); });
    document.querySelectorAll('[data-ora-tablink]').forEach(function (t) { t.addEventListener('click', function () { setTab(t.getAttribute('data-ora-tablink'), true); }); });
  }
})();

/* ---- display headings: no word wider than its column, never one word per line ----
   Shrinks a heading only as far as needed (never below 60% of its designed size to fit a long
   word, 70% to pair up words; a stacked heading may first use its column's full width), and re-runs on resize. Leaves every other heading untouched. */
(function () {
  var heads = [].slice.call(document.querySelectorAll('h1, h2'));
  function lines(el) {
    var r = document.createRange(); r.selectNodeContents(el);
    var tops = {}; [].forEach.call(r.getClientRects(), function (x) { if (x.width > 1) tops[Math.round(x.top / 4)] = 1; });
    return Object.keys(tops).length;
  }
  function fit() {
    heads.forEach(function (h) {
      // back to the heading's own inline values (the design sets many sizes inline), then measure
      if (!h.bfOrig) h.bfOrig = { fs: h.style.fontSize, mw: h.style.maxWidth, tw: h.style.textWrap };
      h.style.fontSize = h.bfOrig.fs; h.style.maxWidth = h.bfOrig.mw; h.style.textWrap = h.bfOrig.tw;
      if (!h.offsetWidth) return;
      var base = parseFloat(getComputedStyle(h).fontSize), size = base;
      var words = (h.textContent || '').trim().split(/\s+/).length;
      var over = function () { return h.scrollWidth > h.clientWidth + 1; };
      while (over() && size > base * 0.6) { size -= base * 0.04; h.style.fontSize = size + 'px'; }
      var stacked = function () { var n = lines(h); return words >= 3 && n >= 3 && n >= words * 0.75; };
      if (stacked()) { h.style.maxWidth = 'none'; h.style.textWrap = 'pretty'; }
      while (stacked() && size > base * 0.7) { size -= base * 0.04; h.style.fontSize = size + 'px'; }
    });
  }
  var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit); else window.addEventListener('load', fit);
  fit();
})();

/* ---- VenueFlow enquiry: the widget posts its height, so the frame fits the form (no blank card under it).
   It measures itself as at least as tall as its frame, so the frame starts at the form's own height (460px)
   and only ever grows. ---- */
window.addEventListener('message', function (e) {
  if (e.origin !== 'https://venueflowhq.com' || !e.data) return;
  var d = e.data;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch (err) { return; } }
  if (!d || d.type !== 'vf-embed-height' || !(d.height > 0)) return;
  [].forEach.call(document.querySelectorAll('iframe[src*="venueflowhq.com"]'), function (f) {
    if (f.contentWindow === e.source) f.style.height = Math.ceil(d.height) + 'px';
  });
});
