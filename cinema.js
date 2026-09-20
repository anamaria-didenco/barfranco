/* ============================================================
   BAR FRANCO — CINEMA FRANCO
   Motion system.

   Rules this file holds itself to:
   · transform and opacity only — never animate layout properties
   · one rAF loop for scroll-driven work, passive listeners
   · no scroll hijacking: scrolling always does what the user expects
   · prefers-reduced-motion disables every effect, not just some
   · the page is fully readable if this script never runs at all
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* Tells the head failsafe that motion booted, so it does not strip
     .js-motion and leave the reveals unanimated. */
  window.__cinemaReady = true;

  /* ---------- 1. Opening fade ---------- */
  function openReel() {
    var reel = document.querySelector('.reel-in');
    if (!reel) return;
    if (reduced) { reel.remove(); return; }
    requestAnimationFrame(function () {
      reel.classList.add('is-done');
      setTimeout(function () { reel.remove(); }, 1000);
    });
  }

  /* ---------- 2. Word splitter ----------
     Wraps each word so it can rise out of a mask. Walks child nodes so
     inline markup (<br>, <em>) survives intact. */
  function split(el) {
    if (el.dataset.splitDone) return;
    var nodes = Array.prototype.slice.call(el.childNodes);
    nodes.forEach(function (node) {
      if (node.nodeType !== 3) return;
      var words = node.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      words.forEach(function (w) {
        if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
        var span = document.createElement('span');
        span.className = 'word';
        var inner = document.createElement('i');
        inner.textContent = w;
        span.appendChild(inner);
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.dataset.splitDone = '1';

    /* Stagger each word slightly so the line choreographs rather than pops. */
    var words = el.querySelectorAll('.word > i');
    for (var i = 0; i < words.length; i++) {
      words[i].style.transitionDelay = (i * 52) + 'ms';
    }
  }

  /* ---------- 3. Reveal on enter ---------- */
  function observe() {
    var targets = document.querySelectorAll('.reveal, .dissolve');
    if (!targets.length) return;

    if (!reduced) {
      document.querySelectorAll('[data-split]').forEach(split);
    }

    if (!('IntersectionObserver' in window) || reduced) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  }

  /* ---------- 4. Nav ---------- */
  function nav() {
    var el = document.getElementById('nav');
    if (!el) return;

    var burger = el.querySelector('.nav-burger');
    var links = el.querySelector('.nav-links');

    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = el.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      links.addEventListener('click', function (e) {
        if (e.target.tagName !== 'A') return;
        el.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' || !el.classList.contains('is-open')) return;
        el.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.focus();
      });
    }

    /* The cut: transparent over the opening frame, solid black past it. */
    var threshold = parseInt(el.dataset.cutAt || '120', 10);
    var cut = false;
    return function () {
      var should = window.scrollY > threshold;
      if (should === cut) return;
      cut = should;
      el.classList.toggle('is-cut', should);
    };
  }

  /* ---------- 5. The Staircase ----------
     Two levels, one world. Scroll drives a seam between the restaurant
     above and the bar below; the two worlds counter-move as it passes. */
  function staircase() {
    var stair = document.querySelector('.stair');
    if (!stair) return null;

    if (reduced) { stair.classList.add('stair-static'); return null; }

    var rail = stair.querySelector('.stair-rail');
    var night = stair.querySelector('.stair-night');
    var seam = stair.querySelector('.stair-seam');
    var floor = stair.querySelector('.stair-floor');
    var dayImg = stair.querySelector('.stair-day img');
    var nightImg = stair.querySelector('.stair-night img');
    var dayCopy = stair.querySelector('.stair-day .stair-copy');
    var nightCopy = stair.querySelector('.stair-night .stair-copy');
    var title = stair.querySelector('.stair-title');
    if (!rail || !night || !seam) return null;

    var last = -1;
    return function () {
      var rect = rail.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      if (total <= 0) return;

      var p = -rect.top / total;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      if (Math.abs(p - last) < 0.0015) return;
      last = p;

      var open = (1 - p) * 100;

      /* Night rises from the bottom of the frame. */
      night.style.clipPath = 'inset(' + open.toFixed(2) + '% 0 0 0)';
      seam.style.top = open.toFixed(2) + '%';
      seam.style.opacity = p > 0.002 && p < 0.998 ? '1' : '0';

      /* Counter-motion: the two worlds slide past each other. */
      if (dayImg) dayImg.style.transform = 'translate3d(0,' + (-p * 60).toFixed(1) + 'px,0) scale(1.06)';
      if (nightImg) nightImg.style.transform = 'translate3d(0,' + ((1 - p) * 60).toFixed(1) + 'px,0) scale(1.06)';

      /* The held title is an establishing card: it holds while the shot
         settles, then dissolves so the two levels can speak for themselves.
         Without this it and the level copy share a band and both lose. */
      if (title) title.style.opacity = String(Math.max(0, 1 - Math.max(0, p - 0.06) * 3.4));

      /* Crossfade the typography across the seam, sequenced so nothing ever
         shares a band with the title: title holds, title dissolves, Level 2
         fades up, the seam rises, Level 1 takes over. */
      if (dayCopy) {
        var dayIn = Math.min(1, Math.max(0, (p - 0.14) * 5));
        var dayOut = Math.min(1, Math.max(0, 1 - (p - 0.52) * 3.4));
        dayCopy.style.opacity = String(Math.min(dayIn, dayOut));
      }
      if (nightCopy) nightCopy.style.opacity = String(Math.min(1, Math.max(0, (p - 0.46) * 3.2)));

      if (floor) {
        floor.textContent = p < 0.5 ? 'Level 2 — Restaurant' : 'Level 1 — Bar';
        floor.style.top = open.toFixed(2) + '%';
        /* Near the extremes the marker sits on the viewport edge, where it
           collides with the WhatsApp button. Hide it there rather than
           reposition the button. */
        floor.style.opacity = p > 0.1 && p < 0.9 ? '1' : '0';
      }
    };
  }

  /* ---------- 6. One scroll loop ---------- */
  function loop(handlers) {
    var live = handlers.filter(Boolean);
    if (!live.length) return;
    var ticking = false;

    function run() {
      for (var i = 0; i < live.length; i++) live[i]();
      ticking = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(run);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    run();
  }

  /* ---------- 7. Boot ---------- */
  function boot() {
    openReel();
    observe();
    loop([nav(), staircase()]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
