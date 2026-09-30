/* Bar Franco — Events Pack: eight chapters that open underneath their title (one at a time, all
   closed on load), hover-to-open on desktop, #ch-… deep links, and the three food tabs.
   Runs alongside static/ora.js, which handles the reveal motion and heading fit. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
  var chapters = [].slice.call(document.querySelectorAll('.pk-ch'));
  var byId = {};
  chapters.forEach(function (ch) { byId[ch.id.replace(/^ch-/, '')] = ch; });

  function head(ch) { return ch.querySelector('.pk-ch-head'); }
  function setOpen(ch, on) {
    ch.setAttribute('data-open', on ? 'true' : 'false');
    var h = head(ch), b = ch.querySelector('.pk-ch-body');
    if (h) h.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (b) b.hidden = !on;
  }
  function open(id) {
    chapters.forEach(function (ch) { setOpen(ch, ch === byId[id]); });
  }
  function jump(ch) {
    var h = head(ch) || ch;
    window.scrollTo({ top: h.getBoundingClientRect().top + window.scrollY - 64, behavior: reduce ? 'auto' : 'smooth' });
  }

  // click / tap a chapter head: open it, or close it if it's already open
  var hoverT;
  chapters.forEach(function (ch) {
    var h = head(ch); if (!h) return;
    var id = ch.id.replace(/^ch-/, '');
    h.addEventListener('click', function () {
      clearTimeout(hoverT);
      var isOpen = ch.getAttribute('data-open') === 'true';
      if (isOpen) { setOpen(ch, false); return; }
      open(id); jump(ch);
    });
    // desktop: resting on a closed head opens it; the head stays under the pointer while the one above closes
    h.addEventListener('mouseenter', function () {
      if (!fine || !fine.matches || ch.getAttribute('data-open') === 'true') return;
      clearTimeout(hoverT);
      hoverT = setTimeout(function () {
        var before = h.getBoundingClientRect().top;
        open(id);
        window.scrollBy(0, h.getBoundingClientRect().top - before);
      }, 350);
    });
    h.addEventListener('mouseleave', function () { clearTimeout(hoverT); });
  });

  // "see the menus"-style links inside the chapters: open the chapter they point to, then land on it
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-ep-open]');
    if (!a) return;
    var ch = byId[a.getAttribute('data-ep-open')]; if (!ch) return;
    e.preventDefault(); e.stopPropagation();   // capture phase: ora.js's own #anchor handler doesn't also run
    open(a.getAttribute('data-ep-open')); jump(ch);
    if (history.replaceState) history.replaceState(null, '', '#' + ch.id);
  }, true);

  // deep links: /events-pack/#ch-drinks opens Drinks
  function fromHash() {
    var id = (location.hash || '').replace(/^#ch-/, '');
    // ora.js also lands #links (84px down) 600ms after load; take the last word so the head sits 64px down
    if (byId[id]) { open(id); setTimeout(function () { jump(byId[id]); }, 60); setTimeout(function () { jump(byId[id]); }, 700); }
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);

  // the three ways to feed the room
  var tabs = [].slice.call(document.querySelectorAll('[data-ep-tab]'));
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var k = t.getAttribute('data-ep-tab');
      tabs.forEach(function (x) {
        var on = x === t, p = document.getElementById(x.getAttribute('aria-controls'));
        x.setAttribute('data-on', on ? 'true' : 'false'); x.setAttribute('aria-selected', on ? 'true' : 'false');
        if (p) p.setAttribute('data-on', on ? 'true' : 'false');
      });
    });
  });

  // print: every chapter open
  window.addEventListener('beforeprint', function () { chapters.forEach(function (ch) { ch.setAttribute('data-print', ch.getAttribute('data-open')); setOpen(ch, true); }); });
  window.addEventListener('afterprint', function () { chapters.forEach(function (ch) { setOpen(ch, ch.getAttribute('data-print') === 'true'); }); });
})();
