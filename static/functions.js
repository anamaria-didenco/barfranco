/* Bar Franco — functions.js · the Functions page: the nameplate, the coaster and the five chapters (all open; each head folds its own).
   Plain JS, no dependencies. Without it the page is complete: every chapter shows, the coaster rests. */
(function () {
  var d = document, w = window, root = d.documentElement;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fine() { return !!(w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches); }
  root.classList.add('chx-js');

  /* ---- the nameplate: one size for every line, so the widest line fills the frame ---- */
  var np = d.querySelector('.np');
  function fit() {
    if (!np) return;
    var avail = np.clientWidth;
    if (!(avail > 0)) return;
    var probe = d.createElement('span'), max = 0;
    probe.className = 'np-probe';
    np.appendChild(probe);
    [].forEach.call(np.querySelectorAll('.np-l'), function (l) {
      probe.innerHTML = l.innerHTML;
      max = Math.max(max, probe.getBoundingClientRect().width);
    });
    np.removeChild(probe);
    /* …but never taller than a slice of the screen, so the cover and the strip under it fit the first view */
    var tall = (w.innerHeight || 800) * 0.15;
    if (max > 0) np.style.fontSize = Math.max(34, Math.min(230, tall, 99.5 * avail / max)).toFixed(2) + 'px';
  }
  var rt;
  function refit() { clearTimeout(rt); rt = setTimeout(fit, 100); }
  fit();
  w.addEventListener('resize', refit);
  if (np && 'ResizeObserver' in w) { var npW = 0; new ResizeObserver(function (es) { var cw = es[0].contentRect.width; if (Math.abs(cw - npW) > 0.5) { npW = cw; refit(); } }).observe(np); }
  w.addEventListener('load', fit);
  if (d.fonts) {
    if (d.fonts.load) d.fonts.load('700 100px "VTC Marsha"').then(fit, function () {});
    if (d.fonts.ready) d.fonts.ready.then(fit);
  }

  /* ---- the coaster: settles onto the table, turns over to a new photograph each time ---- */
  var co = d.querySelector('.coaster'), flip = co && co.querySelector('.co-flip');
  if (co && flip) {
    var backs = [].slice.call(co.querySelectorAll('.co-cg img')), idx = -1;
    var settle = function () { co.setAttribute('data-settled', ''); };
    if (reduce || !('IntersectionObserver' in w)) settle();
    else {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (x) { return x.isIntersecting; })) { settle(); io.disconnect(); }
      }, { threshold: 0.45 });
      io.observe(co);
      setTimeout(settle, 2600);
    }
    var turned = function () { return flip.getAttribute('data-turned') === 'true'; };
    var turn = function (on) {
      if (on) {
        idx = (idx + 1) % backs.length;
        backs.forEach(function (b, i) { if (i === idx) b.setAttribute('data-show', ''); else b.removeAttribute('data-show'); });
      }
      flip.setAttribute('data-turned', on ? 'true' : 'false');
    };
    flip.addEventListener('mouseenter', function () { if (fine() && !turned()) turn(true); });
    flip.addEventListener('mouseleave', function () { if (fine()) turn(false); });
    // mouse clicks are ignored (hover turns it); taps toggle; Enter and Space toggle everywhere
    flip.addEventListener('click', function (e) { if (fine() && e.detail !== 0) return; turn(!turned()); });
  }

  /* ---- the chapters: the first two open on arrival, the rest fold out on a tap (or from the index above).
     Each head folds its own away (and back). ---- */
  var IDS = ['why', 'spaces', 'occasions', 'food', 'questions'];
  var secs = IDS.map(function (id) { return d.getElementById(id); }).filter(Boolean);
  if (!secs.length) return;
  function setOne(s, on) {
    var b = s.querySelector('.chx-head');
    s.setAttribute('data-open', on ? 'true' : 'false');
    if (b) b.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  function jump(id) {
    var s = d.getElementById(id); if (!s) return;
    var t = s.querySelector('.chx-head') || s;
    var mast = d.querySelector('.bf-mast');
    var off = (mast ? mast.getBoundingClientRect().height : 64) + 8;
    w.scrollTo({ top: t.getBoundingClientRect().top + w.scrollY - off, behavior: reduce ? 'auto' : 'smooth' });
  }
  secs.forEach(function (s, i) {
    setOne(s, i < 2);
    var b = s.querySelector('.chx-head'); if (!b) return;
    b.addEventListener('click', function () { setOne(s, s.getAttribute('data-open') !== 'true'); });
  });
  function fromHash() {
    var h = (w.location.hash || '').slice(1);
    if (IDS.indexOf(h) > -1) { setOne(d.getElementById(h), true); setTimeout(function () { jump(h); }, 80); }
    else if (h === 'hook') setTimeout(function () { jump('hook'); }, 400);
    // any other anchor (#enquire from the home page): land on it again once the folded chapters have settled the page
    else if (h && d.getElementById(h)) setTimeout(function () { jump(h); }, 260);
  }
  fromHash();
  w.addEventListener('hashchange', fromHash);
})();
