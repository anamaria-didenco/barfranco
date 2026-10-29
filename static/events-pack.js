/* Bar Franco · Events Pack: eight chapters as one native accordion. Every chapter is <details class="pk-d" name="pack">,
   so the browser keeps one open at a time (Welcome is open on load; an older browser simply lets several open).
   This file adds only what the browser doesn't:
   - a chapter a person opens (tap on its title, or a link to #ch-…) brings its title up, just under the top bar,
     after the chapter above it has closed (instant under reduced motion);
   - a deep link (/events-pack/#ch-drinks) opens its chapter on load and lands on it;
   - printing opens every chapter, and puts them back afterwards.
   Without JS the accordion still works. Runs alongside static/editorial.js, which also opens a linked chapter. */
(function () {
  var D = document;
  var all = [].slice.call(D.querySelectorAll('details.pk-d'));
  if (!all.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var intent = 0;   // when a person last asked for a chapter; a toggle without one (load, print) never scrolls

  function bar() { var m = D.querySelector('.mast'); return m ? m.getBoundingClientRect().height : 72; }
  function land(d, instant) {
    var s = d.querySelector('summary'); if (!s) return;
    var y = s.getBoundingClientRect().top + window.scrollY - bar() - 8;
    window.scrollTo({ top: Math.max(0, y), behavior: (reduce || instant) ? 'auto' : 'smooth' });
  }
  function chapterOf(id) {
    var t = id && D.getElementById(id);
    if (!t) return null;
    return t.matches('details.pk-d') ? t : (t.querySelector('details.pk-d') || t.closest('details.pk-d'));
  }

  D.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : null;
    if (t && (t.closest('details.pk-d > summary') || t.closest('a[href^="#ch-"]'))) intent = Date.now();
  }, true);
  window.addEventListener('hashchange', function () { intent = Date.now(); });

  all.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open || Date.now() - intent > 1500) return;
      intent = 0;
      requestAnimationFrame(function () { land(d); });
    });
  });

  // a deep link opens its chapter (closing Welcome) before the page settles, then lands on it
  var d0 = chapterOf((location.hash || '').slice(1));
  if (d0) {
    d0.open = true;
    window.addEventListener('load', function () { setTimeout(function () { land(d0, true); }, 60); });
  }

  // print: every chapter open (the group is set aside so they can all be open), then back as they were
  window.addEventListener('beforeprint', function () {
    all.forEach(function (d) { d.setAttribute('data-was', d.open ? '1' : ''); d.removeAttribute('name'); d.open = true; });
  });
  window.addEventListener('afterprint', function () {
    all.forEach(function (d) { d.open = d.getAttribute('data-was') === '1'; d.removeAttribute('data-was'); });
    all.forEach(function (d) { d.setAttribute('name', 'pack'); });
  });
})();
