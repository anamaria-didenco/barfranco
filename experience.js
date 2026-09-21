/* ============================================================
   BAR FRANCO — experience.js
   Scroll storytelling, masked reveals, room nav, level switch.

   Deliberately dependency-free: no GSAP, no CDN. IntersectionObserver
   drives state, CSS does every animation. That keeps the page fast
   (nothing to download before it moves) and means one media query
   turns the whole thing off for prefers-reduced-motion.

   Nothing here hijacks the scroll. The browser scrolls; we only listen.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var phone = window.matchMedia('(max-width: 760px)');

  /* ---------- 1. Opening sequence ---------------------------------- */
  var leader = document.getElementById('leader');
  if (leader) {
    if (reduced.matches) {
      leader.remove();
    } else {
      // The CSS animation runs ~1.55s end to end; drop the node after so
      // it can never trap focus or sit over the page.
      window.setTimeout(function () {
        if (leader.parentNode) leader.parentNode.removeChild(leader);
      }, 1800);
    }
  }

  /* ---------- 2. Reveals ------------------------------------------- */
  var revealables = document.querySelectorAll('.rise, .curtain, .rise-self, .hero');

  if (!('IntersectionObserver' in window)) {
    // No observer: show everything. The page is fully readable without JS.
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        revealer.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(revealables, function (el) { revealer.observe(el); });
  }

  /* ---------- 3. Top bar ------------------------------------------- */
  var topbar = document.querySelector('.topbar');
  var hero = document.querySelector('.hero');
  if (topbar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      topbar.classList.toggle('solid', !entries[0].isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px' }).observe(hero);
  }

  /* ---------- 4. Full-screen room nav ------------------------------ */
  var toggle = document.querySelector('.menu-toggle');
  var roomnav = document.getElementById('roomnav');

  if (toggle && roomnav) {
    var bgs = roomnav.querySelectorAll('.bg img');
    var links = roomnav.querySelectorAll('li a');

    var setNav = function (open) {
      document.body.classList.toggle('nav-open', open);
      document.body.classList.toggle('is-locked', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      roomnav.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) {
        // Move focus into the panel so keyboard users land in the new room.
        window.setTimeout(function () { if (links[0]) links[0].focus(); }, 120);
      } else {
        toggle.focus();
      }
    };

    toggle.addEventListener('click', function () {
      setNav(!document.body.classList.contains('nav-open'));
    });

    roomnav.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) setNav(false);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && document.body.classList.contains('nav-open')) setNav(false);
    });

    // Hovering a nav item changes the room behind it.
    var showBg = function (key) {
      Array.prototype.forEach.call(bgs, function (img) {
        img.classList.toggle('show', img.getAttribute('data-key') === key);
      });
    };
    Array.prototype.forEach.call(links, function (a) {
      var key = a.getAttribute('data-bg');
      if (!key) return;
      a.addEventListener('mouseenter', function () { showBg(key); });
      a.addEventListener('focus', function () { showBg(key); });
    });
    var firstKey = links[0] && links[0].getAttribute('data-bg');
    if (firstKey) showBg(firstKey);
  }

  /* ---------- 5. The story: EAT / DRINK / CELEBRATE ---------------- */
  var story = document.getElementById('story');
  if (story && 'IntersectionObserver' in window) {
    var chapters = story.querySelectorAll('.ch');
    var plates = story.querySelectorAll('.plate img');
    var marks = story.querySelectorAll('.rail span');
    var beats = story.querySelectorAll('.track > div');
    var current = -1;

    var goTo = function (i) {
      if (i === current) return;
      current = i;
      story.setAttribute('data-tone', story.getAttribute('data-tone-' + i) || '');
      [chapters, plates, marks].forEach(function (set) {
        Array.prototype.forEach.call(set, function (el, n) {
          el.classList.toggle('on', n === i);
        });
      });
    };

    goTo(0);

    // On a phone the chapters are stacked cards, so there is nothing to drive.
    if (!phone.matches) {
      var beatWatcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) goTo(parseInt(e.target.getAttribute('data-ch'), 10) || 0);
        });
      }, { rootMargin: '-50% 0px -50% 0px' });
      Array.prototype.forEach.call(beats, function (b) { beatWatcher.observe(b); });
    } else {
      // Stacked view: every chapter and every plate is simply visible.
      Array.prototype.forEach.call(chapters, function (c) { c.classList.add('on'); });
      Array.prototype.forEach.call(plates, function (p) { p.classList.add('on'); });
    }
  }

  /* ---------- 6. Two levels, one world ----------------------------- */
  var levels = document.getElementById('levels');
  if (levels) {
    var tabs = levels.querySelectorAll('.switch button');
    var rooms = levels.querySelectorAll('.room');

    var pick = function (i) {
      Array.prototype.forEach.call(tabs, function (t, n) {
        t.setAttribute('aria-selected', n === i ? 'true' : 'false');
        t.setAttribute('tabindex', n === i ? '0' : '-1');
      });
      Array.prototype.forEach.call(rooms, function (r, n) {
        if (n === i) { r.removeAttribute('hidden'); } else { r.setAttribute('hidden', ''); }
      });
    };

    Array.prototype.forEach.call(tabs, function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (ev) {
        var next = null;
        if (ev.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (ev.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (next === null) return;
        ev.preventDefault();
        pick(next);
        tabs[next].focus();
      });
    });

    pick(0);
  }

  /* ---------- 7. Contact sheet: drag to scrub ---------------------- */
  var sheet = document.querySelector('.sheet');
  if (sheet && window.PointerEvent) {
    var dragging = false, startX = 0, startLeft = 0, moved = 0;

    sheet.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType !== 'mouse') return; // touch already scrolls natively
      dragging = true; moved = 0;
      startX = ev.clientX; startLeft = sheet.scrollLeft;
      sheet.style.cursor = 'grabbing';
    });
    sheet.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var dx = ev.clientX - startX;
      moved = Math.abs(dx);
      sheet.scrollLeft = startLeft - dx;
    });
    var endDrag = function () {
      if (!dragging) return;
      dragging = false;
      sheet.style.cursor = '';
    };
    sheet.addEventListener('pointerup', endDrag);
    sheet.addEventListener('pointerleave', endDrag);
    sheet.addEventListener('pointercancel', endDrag);
    // Suppress the click that ends a real drag, so a drag never opens a link.
    sheet.addEventListener('click', function (ev) {
      if (moved > 8) { ev.preventDefault(); ev.stopPropagation(); }
    }, true);
  }
})();
