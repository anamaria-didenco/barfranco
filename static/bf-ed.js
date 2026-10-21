/* Bar Franco · bf-ed.js — the editorial system's behaviour, on every page. Plain JS, no dependencies.
   Load it last in <body> with defer. Every part is driven by markup (ids, classes, data attributes) and does
   nothing where its markup is absent, so one file serves every page. Without it each page still reads:
   photographs show, Menu jumps to the footer's page list, the first slide shows, the accordions open natively.

   Parts: 0 the motion gate and the Motion control · 1 motion (entrance fade, hero glide, rule draw, parallax) · 2 year · 3 current page · 4 compact band · 5 the Menu screen · 6 slides ·
   7 tabs · 8 chapters & questions (deep links, landing, print) · 8b questions one at a time (.faqx) ·
   9 contact form (FormSubmit) ·
   10 VenueFlow (loading note, height) · 11 events: room finder, calendar, held date, prefill, December strip.
   Google Ads lives in /static/vf-tracking.js (in <head>); nothing here touches it. */
(function () {
  'use strict';
  var D = document, R = D.documentElement, W = window;
  R.classList.add('js');
  function $(s, c) { return (c || D).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || D).querySelectorAll(s)); }
  function lget(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } }
  function lset(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fp() { return parseFloat(getComputedStyle(R).getPropertyValue('--fp')) || 30; }
  /* each part runs on its own: one failing never stops the rest */
  function part(name, fn) { try { fn(); } catch (e) { if (W.console) console.warn('[bf-ed] ' + name + ':', e); } }

  /* 0 · the motion gate (DESIGN-EDITORIAL.md §9): html.mo only while the device allows motion (not prefers-reduced-motion:
     reduce) and the visitor has not chosen Calm (localStorage bf-motion = calm). Every motion rule in bf-ed.css sits under
     html.mo, so without it everything is simply there, at rest. Both are watched live; parts that move listen with onMo. */
  var mqR = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : null, moFns = [], gated = false;
  function sysCalm() { return !!(mqR && mqR.matches); }
  function chosenCalm() { return lget('bf-motion', '') === 'calm'; }
  function mo() { return R.classList.contains('mo'); }
  function onMo(fn) { moFns.push(fn); }
  function gate() {
    var on = !sysCalm() && !chosenCalm();
    if (gated && on === mo()) { moFns.forEach(function (f) { if (f.sync) f(on); }); return; }
    gated = true;
    R.classList.toggle('mo', on);
    moFns.forEach(function (f) { try { f(on); } catch (e) { if (W.console) console.warn('[bf-ed] motion:', e); } });
  }
  gate();
  if (mqR) { if (mqR.addEventListener) mqR.addEventListener('change', gate); else if (mqR.addListener) mqR.addListener(gate); }
  W.addEventListener('storage', function (e) { if (e.key === 'bf-motion') gate(); });

  /* 0b · the Motion control: a few words beside the © in the footer and at the Menu's foot, "Motion: on" / "Motion: calm".
     It switches live; Calm stops everything at once. Under the device's reduced motion it reads Motion: calm and stays so. */
  part('motion-control', function () {
    var btns = [];
    [[$('.bf-foot-base > span'), ' · '], [$('.bf-menu-foot .bf-menu-tag'), '']].forEach(function (x) {
      if (!x[0]) return;
      var b = D.createElement('button');
      b.type = 'button'; b.className = 'bf-motion';
      x[0].appendChild(x[1] ? D.createTextNode(x[1]) : D.createElement('br'));
      x[0].appendChild(b); btns.push(b);
      b.addEventListener('click', function () {
        if (sysCalm()) return;
        lset('bf-motion', chosenCalm() ? 'on' : 'calm');
        gate();
      });
    });
    function sync(on) {
      btns.forEach(function (b) {
        b.textContent = 'Motion: ' + (on ? 'on' : 'calm');
        b.setAttribute('aria-pressed', String(on));
        if (sysCalm()) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
      });
    }
    sync.sync = true; onMo(sync); sync(mo());
  });

  /* 1 · motion. Every photograph (.ph, .slides, .bandph, [data-rv]; not the Menu's, not one inside another) is tagged .rv
     and fades in once as its top reaches the foot of the screen (the first screen's on load), on a 0 / .25 / .5s beat by
     its order in its section. The page's header photograph (the first visible one) glides right to left over 60s. On a
     story page (.blank) the band's hairline draws in. Parallax: each photograph drifts inside its frame as its section
     passes (block-based, so a section's photographs move together), shift = clamp(delta / range, -1, 1) × maxShift, with
     delta = viewport centre − section centre (the header: scrollY), range = (viewport + section height) / 2 (the header:
     its own foot, so it reaches its full shift as it leaves the screen),
     maxShift = 0.10 × frame height × speed / 0.7, and a scale that keeps every edge covered. Speeds: header .3; one
     photograph in a section .5; two .4 / .2; three .4; four or more .5 / .1 / .2 / .5; data-speed overrides. One
     requestAnimationFrame per scroll, on cached geometry, only near the screen. */
  var menuOpen = false, menuFns = [];
  part('motion', function () {
    var page = $('.bf-page') || D.body, io = null;
    var els = $$('.ph, .slides, .bandph, [data-rv]', page).filter(function (e) {
      return !(e.parentElement && e.parentElement.closest('.ph, .slides')) && !e.closest('.bf-menu');
    });
    function blockOf(e) {
      var p = e.parentElement, b = p && p.closest('section, [class*="sec"]');
      if (b && page.contains(b) && b !== page) return b;
      return (p && p !== page && !p.matches('main, body')) ? p : e;
    }
    var groups = [];
    els.forEach(function (e) {
      e.__blk = blockOf(e);
      var g = groups.filter(function (x) { return x.b === e.__blk; })[0];
      if (!g) { g = { b: e.__blk, n: 0 }; groups.push(g); }
      var k = g.n++ % 3;
      e.classList.add('rv'); if (k) e.classList.add('rv-' + k);
    });

    /* the entrance fade */
    function show(e, now) {
      if (e.classList.contains('in')) return;
      e.classList.add('in');
      if (now || !mo()) e.classList.add('done');
    }
    function arrive(e) {
      if (e.__wait || e.classList.contains('in')) return;
      if (!mo()) { show(e, true); return; }
      var img = e.matches('img') ? e : $('img.on, img', e);
      if (!img || img.complete) { show(e); return; }
      /* wait for the picture (at most 1.2s), so it is the photograph that fades in, not its empty frame */
      e.__wait = 1;
      var t = 0, go = function () { clearTimeout(t); img.removeEventListener('load', go); img.removeEventListener('error', go); e.__wait = 0; show(e); };
      t = setTimeout(go, 1200);
      img.addEventListener('load', go); img.addEventListener('error', go);
    }
    D.addEventListener('animationend', function (ev) {
      var t = ev.target;
      if (ev.animationName !== 'bf-fade' || !t.classList) return;
      if (t.classList.contains('rv')) t.classList.add('done');
      if (t.classList.contains('fx')) t.classList.remove('fx');
    });
    if ('IntersectionObserver' in W) {
      io = new IntersectionObserver(function (es) {
        es.forEach(function (x) {
          var e = x.target;
          if (x.isIntersecting) { arrive(e); io.unobserve(e); }
          /* already above the screen (a jump to an anchor): simply there */
          else if (x.boundingClientRect.height > 0 && x.boundingClientRect.bottom <= 0) { show(e, true); io.unobserve(e); }
        });
      }, { rootMargin: '0px 0px -6% 0px' });
      els.forEach(function (e) { io.observe(e); });
    } else els.forEach(function (e) { show(e, true); });
    W.addEventListener('beforeprint', function () { els.forEach(function (e) { show(e, true); }); });

    /* the rule draw, on story pages */
    var band = $('.blank') && $('.bf-band.slim');
    if (band) band.classList.add('draw');

    /* the hero glide and the parallax */
    var items = els.filter(function (e) { return !e.matches('.slides, [data-slides]'); }).map(function (e) {
      var img = e.matches('img') ? e : $('img', e);
      if (img) img.classList.add('bf-px');
      return img ? { ph: e, img: img, blk: e.__blk, s: NaN } : null;
    }).filter(Boolean);
    var head = null, vh = W.innerHeight || 800, ticking = 0, mT = 0;
    function pickHead() {
      var h = null;
      for (var i = 0; i < els.length; i++) {
        var e = els[i], r = e.getBoundingClientRect();
        if (!r.height || !r.width) continue;
        if (r.top + W.scrollY < vh * 1.5 && !e.matches('.slides, [data-slides]')) h = $('img', e) || (e.matches('img') ? e : null);
        break;
      }
      if (head && head !== h) head.classList.remove('bf-glide');
      head = h;
      if (head) head.classList.add('bf-glide');
    }
    var SP = { 1: [.5], 2: [.4, .2], 3: [.4, .4, .4] };
    function measure() {
      mT = 0;
      vh = W.innerHeight || D.documentElement.clientHeight || 800;
      var y = W.scrollY || W.pageYOffset || 0, byB = [];
      pickHead();
      items.forEach(function (it) {
        it.h = it.ph.getBoundingClientRect().height;
        it.head = it.img === head;
        if (!it.h || it.head) return;
        var g = byB.filter(function (x) { return x.b === it.blk; })[0];
        if (!g) { g = { b: it.blk, a: [] }; byB.push(g); }
        g.a.push(it);
      });
      byB.forEach(function (g) { var sp = SP[g.a.length] || [.5, .1, .2, .5]; g.a.forEach(function (it, k) { it.sp = sp[k % sp.length]; }); });
      items.forEach(function (it) {
        if (!it.h) { it.max = 0; return; }
        var ds = it.ph.getAttribute('data-speed') || it.img.getAttribute('data-speed');
        var sp = (ds !== null && ds !== '' && !isNaN(+ds)) ? +ds : it.head ? .3 : it.sp;
        var r = (it.head ? it.ph : it.blk).getBoundingClientRect();
        it.top = r.top + y; it.bot = it.top + r.height; it.mid = it.top + r.height / 2;
        /* the header is at rest at load and reaches its full shift as it leaves the top of the screen */
        it.range = Math.max(1, it.head ? it.bot : (vh + r.height) / 2);
        it.max = .1 * it.h * clamp(sp, 0, 1) / .7;
        it.img.style.setProperty('--ps', (1 + 2 * it.max / it.h + .01).toFixed(4));
        it.s = NaN;
      });
      els.forEach(function (e) { if (!e.classList.contains('in')) { var r = e.getBoundingClientRect(); e.__bot = r.height ? r.bottom + y : Infinity; } });
      kick();
    }
    function frame() {
      ticking = 0;
      if (!mo() || menuOpen) return;
      var y = W.scrollY || W.pageYOffset || 0, lo = y - vh, hi = y + 2 * vh;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.max || it.bot < lo || it.top > hi) continue;
        var d = it.head ? y : (y + vh / 2) - it.mid, s = clamp(d / it.range, -1, 1) * it.max;
        if (Math.abs(s - it.s) < .05) continue;
        it.s = s;
        it.img.style.setProperty('--py', s.toFixed(2) + 'px');
      }
      /* a photograph the page jumped past is simply there */
      for (var j = 0; j < els.length; j++) { var e = els[j]; if (!e.classList.contains('in') && e.__bot < y) show(e, true); }
    }
    function kick() { if (!ticking && mo() && !menuOpen) { ticking = 1; requestAnimationFrame(frame); } }
    function later() { if (!mT) mT = requestAnimationFrame(measure); }
    W.addEventListener('scroll', kick, { passive: true });
    W.addEventListener('resize', later);
    W.addEventListener('load', later);
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(later);
    if ('ResizeObserver' in W) new ResizeObserver(later).observe(page);
    D.addEventListener('toggle', later, true);
    menuFns.push(function (open) { if (!open) kick(); });
    onMo(function (on) {
      if (on) {
        /* back on: what was seen while calm stays put; what is above the screen is simply there; the rest fades as it comes */
        els.forEach(function (e) { if (!e.classList.contains('in') && e.getBoundingClientRect().bottom < 0) show(e, true); });
        measure();
      } else {
        els.forEach(function (e) { if (e.classList.contains('in')) e.classList.add('done'); });
        $$('.fx').forEach(function (e) { e.classList.remove('fx'); });
      }
    });
    measure();
  });

  /* 2 · the year in the footer */
  part('year', function () { $$('[data-bf-year]').forEach(function (e) { e.textContent = String(new Date().getFullYear()); }); });

  /* 3 · the open page is marked in the Menu sheet and the footer (markup may already carry aria-current) */
  part('current', function () {
    var here = location.pathname.replace(/index\.html$/, '');
    $$('.bf-menu nav a[href], .bf-foot-nav a[href]').forEach(function (a) {
      var p; try { p = new URL(a.getAttribute('href'), location.href).pathname; } catch (e) { return; }
      if (p === here && !a.hasAttribute('aria-current')) a.setAttribute('aria-current', 'page');
    });
  });

  /* 3b · on phones the footer's page list folds behind one line ("All pages"); the Menu lists them anyway */
  part('footfold', function () {
    var nav = $('.bf-foot-nav'); if (!nav || nav.querySelector('details')) return;
    var cols = $$(':scope > div', nav); if (!cols.length) return;
    var d = D.createElement('details'), sm = D.createElement('summary'), box = D.createElement('div');
    sm.textContent = 'All pages';
    cols.forEach(function (c) { box.appendChild(c); });
    d.appendChild(sm); d.appendChild(box); nav.appendChild(d);
    /* desktop shows the columns as before: the CSS hides <details> there and shows its columns in place */
  });

  /* 4 · the compact band: inside the frame's top once the band has scrolled away, gone again at the top */
  var sticky = $('.bf-sticky');
  function stickyOn(on) {
    if (!sticky) return;
    sticky.classList.toggle('on', on);
    sticky.setAttribute('aria-hidden', on ? 'false' : 'true');
    if ('inert' in sticky) sticky.inert = !on;
  }
  part('sticky', function () {
    var band = $('.bf-band');
    if (!sticky || !band) return;
    stickyOn(false);
    if (!('IntersectionObserver' in W)) { stickyOn(true); return; }
    new IntersectionObserver(function (es) {
      var e = es[es.length - 1];
      stickyOn(!e.isIntersecting && e.boundingClientRect.top < 0);
    }, { rootMargin: '-' + Math.round(fp()) + 'px 0px 0px 0px' }).observe(band);
  });

  /* 5 · the Menu sheet: opens from any Menu control, Close or Esc shuts it, focus stays inside, the page holds still */
  part('menu', function () {
    var ov = $('#bf-menu');
    var openers = $$('.bf-mbtn');
    if (!ov || !openers.length) return;
    var closeBtn = $('.bf-mclose', ov), last = null, page = $('.bf-page'), skip = $('.bf-skip');
    openers.forEach(function (b) {
      if (b.tagName === 'A') b.setAttribute('role', 'button');
      b.setAttribute('aria-haspopup', 'dialog');
      b.addEventListener('click', function (e) { e.preventDefault(); open(b); });
      b.addEventListener('keydown', function (e) { if (b.tagName === 'A' && (e.key === ' ' || e.key === 'Spacebar')) { e.preventDefault(); open(b); } });
    });
    function focusables() {
      return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', ov)
        .filter(function (x) { return x.offsetParent !== null || x === D.activeElement; });
    }
    function setInert(on) {
      [page, skip].forEach(function (x) { if (x && 'inert' in x) x.inert = on; });
      if (sticky && 'inert' in sticky) sticky.inert = on || !sticky.classList.contains('on');
    }
    /* it fades in over 1s and out over 1s (html.mo); closing waits for the fade, then hides the sheet and gives the page
       back. Calm: at once. While it is open the page's galleries and parallax rest. */
    var closing = null;
    function tell(on) { menuOpen = on; menuFns.forEach(function (f) { f(on); }); }
    function open(from) {
      if (closing) { closing.cancel(); ov.classList.add('on'); openers.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); }); return; }
      if (!ov.hidden) return;
      last = from || D.activeElement;
      ov.hidden = false;
      R.classList.add('bf-lock');
      openers.forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
      setInert(true);
      tell(true);
      void ov.offsetWidth; /* the sheet is laid out at opacity 0 first, so the fade runs */
      ov.classList.add('on');
      (closeBtn || focusables()[0] || ov).focus({ preventScroll: true });
    }
    function close(noFocus, now) {
      if (ov.hidden) return;
      if (closing) { if (now) closing.end(); return; }
      ov.classList.remove('on');
      openers.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      var t = 0, end = function () {
        if (closing !== c) return;
        closing = null; clearTimeout(t); ov.removeEventListener('transitionend', te);
        ov.hidden = true;
        R.classList.remove('bf-lock');
        setInert(false);
        tell(false);
        if (!noFocus && last && last.focus) {
          /* the opener may be the compact band's Menu, which can have gone while the sheet was open */
          var tgt = (last.closest('.bf-sticky') && !sticky.classList.contains('on')) ? $('.bf-band .bf-mbtn') : last;
          if (tgt) tgt.focus({ preventScroll: true });
        }
      }, te = function (e) { if (e.target === ov && e.propertyName === 'opacity') end(); };
      var c = closing = { end: end, cancel: function () { closing = null; clearTimeout(t); ov.removeEventListener('transitionend', te); } };
      if (now || !mo()) { end(); return; }
      ov.addEventListener('transitionend', te);
      t = setTimeout(end, 1150);
    }
    onMo(function (on) { if (!on && closing) closing.end(); });
    if (closeBtn) closeBtn.addEventListener('click', function () { close(); });
    ov.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      /* a link to a place on this page closes the sheet first, so the page can scroll to it */
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.pathname === location.pathname && u.hash) close(true, true);
    });
    D.addEventListener('keydown', function (e) {
      if (ov.hidden || closing) return;
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var fs = focusables(); if (!fs.length) return;
      var i = fs.indexOf(D.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); fs[fs.length - 1].focus(); }
      else if (!e.shiftKey && (i === fs.length - 1 || i === -1)) { e.preventDefault(); fs[0].focus(); }
    });
    W.addEventListener('pageshow', function (e) { if (e.persisted) close(true, true); });
  });

  /* 6 · slides: a tall photograph that turns over (01 02 03). Markup: <div class="ph slides" data-slides> with the
     photographs as <img> (the first with class="on"); the numbers are added here. A slow dissolve: each photograph holds
     4.5s, then the next fades in over it for 1.5s (html.mo; Calm: no turning). Only one gallery plays at a time, the one
     most on screen; all of them rest while the Menu is open; one stops for good once someone picks a number. */
  part('slides', function () {
    var all = [];
    function conduct() {
      var best = null;
      if (mo() && !menuOpen) all.forEach(function (g) { if (!g.held && g.ratio > 0 && (!best || g.ratio > best.ratio)) best = g; });
      all.forEach(function (g) { if (g === best) g.play(); else g.stop(); });
    }
    $$('[data-slides]').forEach(function (s) {
      var im = $$(':scope > img', s);
      if (im.length < 2) return;
      var nav = $('.slides-n', s);
      if (!nav) {
        nav = D.createElement('div'); nav.className = 'slides-n'; nav.setAttribute('role', 'group');
        nav.setAttribute('aria-label', 'Photographs');
        im.forEach(function (x, k) {
          var b = D.createElement('button'); b.type = 'button';
          b.textContent = (k < 9 ? '0' : '') + (k + 1);
          b.setAttribute('aria-label', 'Photograph ' + (k + 1) + ' of ' + im.length);
          nav.appendChild(b);
        });
        s.appendChild(nav);
      }
      var nb = $$('button', nav), i = 0, wT = 0;
      var g = { ratio: 'IntersectionObserver' in W ? 0 : 1, held: false, t: 0 };
      function show(n) {
        var prev = im[i];
        i = n;
        clearTimeout(wT);
        im.forEach(function (x, k) { x.classList.toggle('on', k === n); if (x !== prev) x.classList.remove('was'); });
        /* the outgoing photograph holds under the incoming one until the dissolve is done */
        if (prev && prev !== im[n] && mo()) { prev.classList.add('was'); wT = setTimeout(function () { prev.classList.remove('was'); }, 1600); }
        else if (prev) prev.classList.remove('was');
        nb.forEach(function (x, k) { x.setAttribute('aria-pressed', String(k === n)); });
      }
      g.play = function () { if (!g.t) g.t = setInterval(function () { show((i + 1) % im.length); }, 6000); };
      g.stop = function () { clearInterval(g.t); g.t = 0; };
      nb.forEach(function (b, k) { b.addEventListener('click', function () { g.held = true; g.stop(); show(k); conduct(); }); });
      show(0);
      all.push(g);
      if ('IntersectionObserver' in W) new IntersectionObserver(function (es) {
        var x = es[es.length - 1]; g.ratio = x.isIntersecting ? x.intersectionRatio || .01 : 0; conduct();
      }, { threshold: [0, .25, .5, .75, 1] }).observe(s);
    });
    if (!all.length) return;
    menuFns.push(conduct);
    onMo(conduct);
    conduct();
  });

  /* 7 · tabs: any role="tablist" (.tabs, .mn-tabs, .pkgs-tabs) with <button role="tab" aria-controls="panel-id">.
     Each tab shows its own panel; arrow keys move along; a link to a panel (/menus/#sheet-events) opens its tab and
     lands on it; with data-hash on the tablist, picking a tab also puts its panel in the address. */
  part('tabs', function () {
    $$('[role="tablist"]').forEach(function (list) {
      var tabs = $$('[role="tab"][aria-controls]', list);
      if (!tabs.length) return;
      function panel(t) { return D.getElementById(t.getAttribute('aria-controls')); }
      function show(t, focus) {
        tabs.forEach(function (x) {
          var on = x === t, p = panel(x);
          x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
          if (p) p.hidden = !on;
        });
        if (focus) t.focus();
      }
      function land() { var top = list.getBoundingClientRect().top + W.scrollY - fp() - 72; W.scrollTo({ top: Math.max(0, top), behavior: mo() ? 'smooth' : 'auto' }); }
      function fromHash(scroll) {
        var h = location.hash.slice(1), t = h && tabs.filter(function (x) { return x.getAttribute('aria-controls') === h; })[0];
        if (t) { show(t); if (scroll) setTimeout(land, 80); return true; }
        return false;
      }
      tabs.forEach(function (t, k) {
        t.addEventListener('click', function () {
          show(t);
          /* data-hash on the tablist: the open panel goes into the address, so it can be shared (the Menus page) */
          if (list.hasAttribute('data-hash') && history.replaceState) history.replaceState(null, '', '#' + t.getAttribute('aria-controls'));
        });
        t.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (d) { e.preventDefault(); show(tabs[(k + d + tabs.length) % tabs.length], true); }
        });
      });
      if (!fromHash(true)) show(tabs.filter(function (x) { return x.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
      W.addEventListener('hashchange', function () { fromHash(true); });
    });
  });

  /* 8 · chapters and questions (<details>): a link to one (or to anything inside one) opens it and lands on it; a
     chapter someone opens (.chap) brings its title up under the compact band; printing opens every one and puts
     them back afterwards. One open at a time comes from the browser (<details name="pack">). */
  part('details', function () {
    var all = $$('details');
    if (!all.length) return;
    var intent = 0;
    function land(d, instant) {
      var s = $('summary', d) || d;
      var y = s.getBoundingClientRect().top + W.scrollY - fp() - 64;
      W.scrollTo({ top: Math.max(0, y), behavior: (!mo() || instant) ? 'auto' : 'smooth' });
    }
    function openFor(id) {
      var t = id && D.getElementById(id); if (!t) return null;
      var d = t.matches('details') ? t : (t.closest('details') || $('details', t));
      for (var p = d; p; p = p.parentElement && p.parentElement.closest('details')) p.open = true;
      return d;
    }
    D.addEventListener('click', function (e) {
      if (e.target.closest && (e.target.closest('details.chap > summary') || e.target.closest('a[href^="#"]'))) intent = Date.now();
    }, true);
    W.addEventListener('hashchange', function () { intent = Date.now(); var d = openFor(location.hash.slice(1)); if (d) requestAnimationFrame(function () { land(d); }); });
    $$('details.chap').forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open || Date.now() - intent > 1500) return;
        intent = 0; requestAnimationFrame(function () { land(d); });
      });
    });
    var d0 = openFor(location.hash.slice(1));
    if (d0) W.addEventListener('load', function () { setTimeout(function () { land(d0, true); }, 60); });
    W.addEventListener('beforeprint', function () {
      all.forEach(function (d) {
        d.setAttribute('data-was', d.open ? '1' : '');
        if (d.hasAttribute('name')) { d.setAttribute('data-name', d.getAttribute('name')); d.removeAttribute('name'); }
        d.open = true;
      });
    });
    W.addEventListener('afterprint', function () {
      all.forEach(function (d) { d.open = d.getAttribute('data-was') === '1'; d.removeAttribute('data-was'); });
      all.forEach(function (d) { if (d.hasAttribute('data-name')) { d.setAttribute('name', d.getAttribute('data-name')); d.removeAttribute('data-name'); } });
    });
  });

  /* 8b · questions one at a time (.faqx): every question stays in the HTML (the FAQPage schema reads it); the script shows
     one, adds Prev / Next (the incoming question fades in over 1s; Calm: at once), keeps the box at the tallest answer so
     nothing jumps, and opens the one a link points to. Without the script they simply stack. */
  part('faqx', function () {
    $$('.faqx').forEach(function (f) {
      var list = $('.faqx-list', f); if (!list) return;
      var qs = $$(':scope > .qa', list); if (qs.length < 2) return;
      var box = $('.faqx-q', f) || list.parentNode, i = 0;
      f.classList.add('one');
      var nav = D.createElement('div'); nav.className = 'faqx-nav'; nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'Questions');
      nav.innerHTML = '<button type="button" data-d="-1">Prev</button><span aria-hidden="true">/</span><button type="button" data-d="1">Next</button><span class="sr-only" aria-live="polite"></span>';
      box.appendChild(nav);
      var live = $('[aria-live]', nav);
      function show(n, say) {
        i = (n + qs.length) % qs.length;
        qs.forEach(function (x, k) { x.hidden = k !== i; x.classList.remove('fx'); });
        if (say && mo()) { void qs[i].offsetWidth; qs[i].classList.add('fx'); }
        if (say) live.textContent = 'Question ' + (i + 1) + ' of ' + qs.length + ': ' + ($('h3', qs[i]) || qs[i]).textContent;
      }
      function fit() {
        list.style.minHeight = '';
        var h = 0;
        qs.forEach(function (x) { var was = x.hidden; x.hidden = false; h = Math.max(h, x.offsetHeight); x.hidden = was; });
        list.style.minHeight = h + 'px';
      }
      nav.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(i + (+b.getAttribute('data-d')), true); });
      function fromHash() { var h = location.hash.slice(1), t = h && D.getElementById(h); var k = t ? qs.findIndex(function (x) { return x === t || x.contains(t); }) : -1; if (k > -1) show(k); return k > -1; }
      if (!fromHash()) show(0);
      W.addEventListener('hashchange', fromHash);
      fit();
      var rT = 0; W.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(fit, 150); });
      if (D.fonts && D.fonts.ready) D.fonts.ready.then(fit);
    });
  });

  /* 9 · contact form: <form class="form" data-email="ciao@barfranco.nz" data-subject="…"> with no action.
     The message goes to the address through FormSubmit (AJAX, form-encoded: keep it that way, a JSON body is blocked by
     CORS), a hidden honeypot catches bots, and a sent message fires the Google Ads email conversion. If it fails, the
     note offers the same message as a ready-made email, so nothing typed is lost. data-mode="mailto" skips FormSubmit and
     opens the email straight away (how the live Contact page behaved before the rebuild). */
  part('form', function () {
    $$('form[data-email]').forEach(function (f) {
      var honey = D.createElement('input');
      honey.type = 'text'; honey.name = '_honey'; honey.hidden = true; honey.tabIndex = -1;
      honey.setAttribute('autocomplete', 'off'); honey.setAttribute('aria-hidden', 'true');
      f.appendChild(honey);
      function val(n) { var el = f.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; }
      function mailto() {
        var body = val('message') + '\n\n— ' + val('name') + (val('email') ? ' (' + val('email') + ')' : '') + (val('phone') ? ' · ' + val('phone') : '');
        return 'mailto:' + f.getAttribute('data-email') + '?subject=' + encodeURIComponent(f.getAttribute('data-subject') || 'Message') + '&body=' + encodeURIComponent(body);
      }
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (honey.value) return;
        if (f.getAttribute('data-mode') === 'mailto') { location.href = mailto(); return; }
        var btn = f.querySelector('button[type="submit"], .btn'), label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        var payload = new URLSearchParams();
        payload.append('_subject', f.getAttribute('data-subject') || 'Enquiry — Bar Franco');
        payload.append('_template', 'table');
        payload.append('_captcha', 'false');
        $$('input, textarea, select', f).forEach(function (el) {
          if (el === honey || !el.value || el.type === 'submit') return;
          var lab = el.id ? f.querySelector('label[for="' + el.id + '"]') : null;
          payload.append(lab ? lab.textContent.replace('*', '').trim() : (el.name || el.id || 'Field'), el.value);
        });
        fetch('https://formsubmit.co/ajax/' + encodeURIComponent(f.getAttribute('data-email')), {
          method: 'POST', headers: { Accept: 'application/json' }, body: payload
        }).then(function (r) { return r.json(); }).then(function (res) {
          if (!res || (res.success !== true && res.success !== 'true')) throw new Error('not sent');
          try { if (typeof W.gtag === 'function') W.gtag('event', 'conversion', { send_to: 'AW-18456342571/6V9ICIfV1_ocEKvg1eBE', value: 1.0, currency: 'NZD' }); } catch (x) {}
          var ok = D.createElement('p'); ok.className = 'form-note'; ok.setAttribute('role', 'status');
          ok.textContent = 'Grazie. We’ll come straight back to you.';
          f.innerHTML = ''; f.appendChild(ok);
        }).catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          var err = f.querySelector('.form-note.err');
          if (!err) { err = D.createElement('p'); err.className = 'form-note err'; err.setAttribute('role', 'alert'); f.appendChild(err); }
          err.innerHTML = 'Sorry, that didn’t send. <a href="">Send it as an email instead</a>, or write to <a href="mailto:' + f.getAttribute('data-email') + '">' + f.getAttribute('data-email') + '</a>.';
          err.querySelector('a').setAttribute('href', mailto());
        });
      });
    });
  });

  /* 10 · VenueFlow enquiry forms: a note while the form loads (and where to write instead), then the frame takes the
     height the form reports, so there is never an empty band under it. Only venueflowhq.com is listened to. */
  function vfFrames() { return $$('iframe[src*="venueflowhq.com"]'); }
  part('venueflow', function () {
    vfFrames().forEach(function (f) {
      var p = D.createElement('p'); p.className = 'vf-wait';
      p.innerHTML = 'Loading the enquiry form… or email <a href="mailto:events@barfranco.nz">events@barfranco.nz</a>';
      f.parentNode.insertBefore(p, f);
      var done = function () { if (p.parentNode) p.parentNode.removeChild(p); };
      f.addEventListener('load', done);
      setTimeout(function () { if (p.parentNode) p.firstChild.nodeValue = 'The form is taking a while… '; }, 8000);
    });
    W.addEventListener('message', function (e) {
      var host = ''; try { host = new URL(e.origin).hostname; } catch (x) { return; }
      if (!/(^|\.)venueflowhq\.com$/.test(host)) return;
      var d = e.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (x) { return; } }
      if (!d || d.type !== 'vf-embed-height' || !(d.height > 0)) return;
      var fs = vfFrames(), mine = fs.filter(function (f) { return f.contentWindow === e.source; });
      (mine.length ? mine : fs).forEach(function (f) { f.style.height = Math.max(420, Math.ceil(d.height)) + 'px'; });
    });
  });

  /* 11 · events pages: the room finder (#sdFind / #sdRow), the calendar (#sdHold), the held date and the December strip
     (#sdAvailD). Ported from the previous events script without the dogs, the banner or the index, and with every piece
     optional. The picked date (and, with a finder, the guests and seated/standing) goes into the VenueFlow form as
     prefillDate / prefillGuests / prefillFormat. Choices are remembered on this device (bf-sdf-*). */
  part('events', function () {
    var MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    function nz() {
      var p = {};
      try { new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; }); }
      catch (e) { var d = new Date(); p = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }; }
      return { y: +p.year, m: +p.month - 1, d: +p.day };
    }
    function U(y, m, d) { return Date.UTC(y, m, d); }
    function wd(y, m, d) { return new Date(U(y, m, d)).getUTCDay(); }
    function iso(y, m, d) { return y + '-' + (m < 9 ? '0' : '') + (m + 1) + '-' + (d < 10 ? '0' : '') + d; }
    function parse(s) { var p = s.split('-'); return { y: +p[0], m: +p[1] - 1, d: +p[2] }; }
    function fmt(s) { var q = parse(s); return DAY[wd(q.y, q.m, q.d)] + ' ' + q.d + ' ' + MON[q.m]; }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function txt(id, v) { var e = D.getElementById(id); if (e) e.textContent = v; }
    var T = nz(), TU = U(T.y, T.m, T.d);

    /* the December strip (Christmas): edit the dates inside <b id="sdAvailD" data-year="2026">Fri 11 &amp; Fri 18</b>;
       Fridays that have passed (NZ time) drop off, and when none are left the line says so (data-none) */
    (function () {
      var b = D.getElementById('sdAvailD'); if (!b) return;
      var Y = +(b.getAttribute('data-year') || T.y);
      var days = (b.textContent.match(/\d+/g) || []).map(Number).filter(function (d) { return U(Y, 11, d) >= TU; });
      if (!days.length) { b.parentNode.innerHTML = b.getAttribute('data-none') || 'December Fridays: fully booked · Midweek &amp; lunch dates open.'; return; }
      var f = days.map(function (d) { return 'Fri ' + d; });
      b.textContent = f.length > 1 ? f.slice(0, -1).join(', ') + ' & ' + f[f.length - 1] : f[0];
    })();

    var find = D.getElementById('sdFind'), row = D.getElementById('sdRow'), hold = D.getElementById('sdHold');
    var nIn = D.getElementById('sdN');
    if (!hold && !nIn) return;
    var HASF = !!nIn;
    var cfg = (row && row.hasAttribute('data-seat')) ? row : find;
    var VC = cfg && cfg.getAttribute('data-seat') ? { seat: +cfg.getAttribute('data-seat'), stand: +cfg.getAttribute('data-stand') } : { seat: 165, stand: 240 };
    var cards = row ? $$('[data-room]', row) : [];
    var st = { n: clamp(+lget('bf-sdf-n', '40') || 40, 10, 240), s: lget('bf-sdf-s', 'seat'), d: lget('bf-sdf-d', 'fs'), date: lget('bf-sdf-date', '') };
    if (st.s !== 'seat' && st.s !== 'stand') st.s = 'seat';
    if (st.d !== 'wk' && st.d !== 'fs') st.d = 'fs';
    var phone = function () { return W.matchMedia && W.matchMedia('(max-width:760px)').matches; };
    var mins = { bar: '$4,000', rest: '$7,500', all: '$15,000' };
    function press(sel, key, v) { $$(sel).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-' + key) === v)); }); }
    function fits() { return st.n <= VC[st.s === 'seat' ? 'seat' : 'stand']; }
    function line() {
      var how = st.s === 'seat' ? 'seated' : 'standing';
      if (!fits()) return 'More than ' + VC.seat + ' seated? Go standing: up to ' + VC.stand + '.';
      if (phone()) return '<b>' + st.n + ' ' + how + '</b>: you fit.';
      return '<b>' + st.n + ' ' + how + '</b>: you fit. Seated up to ' + VC.seat + ', standing up to ' + VC.stand + '. ' +
        (st.d === 'wk' ? 'Sunday to Thursday: usually no minimum spend, and never a hire fee.' : 'Fri &amp; Sat minimum spend from $4,000. No hire fee.');
    }
    function finder() {
      if (!HASF) { summary(); return; }
      txt('sdNo', String(st.n));
      press('#sdStyle button', 's', st.s); press('#sdDay button', 'd', st.d);
      var ok = fits();
      cards.forEach(function (c) { c.classList.toggle('fit', ok); c.classList.toggle('nofit', !ok); });
      var res = D.getElementById('sdRes'); if (res) res.innerHTML = line();
      var go = D.getElementById('sdResGo');
      if (go) { var over = !ok && st.s === 'seat'; go.textContent = 'Check dates for ' + st.n + (st.s === 'seat' && !over ? ' seated' : ' standing'); go.toggleAttribute('data-stand', over); }
      summary();
    }
    if (nIn) { nIn.value = st.n; nIn.addEventListener('input', function () { st.n = +nIn.value; lset('bf-sdf-n', st.n); finder(); }); }
    var sty = D.getElementById('sdStyle'), day = D.getElementById('sdDay');
    if (sty) sty.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.s = b.getAttribute('data-s'); lset('bf-sdf-s', st.s); finder(); });
    if (day) day.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.d = b.getAttribute('data-d'); lset('bf-sdf-d', st.d); finder(); });
    /* too many to sit down: the button already says standing, and taking it switches the finder (and the form) to standing */
    var rgo = D.getElementById('sdResGo');
    if (rgo) rgo.addEventListener('click', function () { if (!rgo.hasAttribute('data-stand')) return; st.s = 'stand'; lset('bf-sdf-s', st.s); finder(); });

    /* the calendar: the next four months (or only data-months="10,11"), opening on data-mo="11" if set; past days and the
       closed days (data-close="24" → 24 December to 5 January) can't be picked; Fridays and Saturdays are marked */
    var G = D.getElementById('sdG'), MO = D.getElementById('sdMo');
    var MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (i) { var m = T.m + i; return { y: T.y + Math.floor(m / 12), m: m % 12 }; }), mi = 0;
    var ONLY = hold && hold.getAttribute('data-months') ? hold.getAttribute('data-months').split(',').map(Number) : null;
    MONTHS = (ONLY ? MONTHS.filter(function (x) { return ONLY.indexOf(x.m) > -1; }) : MONTHS).slice(0, ONLY ? ONLY.length : 4);
    var CLOSE = +(hold && hold.getAttribute('data-close')) || 24;
    function shut(m, d) { return (m === 11 && d >= CLOSE) || (m === 0 && d <= 5); }
    if (st.date) { var q = parse(st.date), k = MONTHS.findIndex(function (x) { return x.y === q.y && x.m === q.m; }); if (k < 0 || U(q.y, q.m, q.d) < TU || shut(q.m, q.d)) st.date = ''; else mi = k; }
    if (hold && hold.getAttribute('data-mo')) { var k2 = MONTHS.findIndex(function (x) { return x.m === +hold.getAttribute('data-mo'); }); if (k2 > -1) mi = k2; }
    function build() {
      if (!G || !MONTHS.length) return;
      var Y = MONTHS[mi].y, m = MONTHS[mi].m, lead = (wd(Y, m, 1) + 6) % 7, n = new Date(U(Y, m + 1, 0)).getUTCDate(), h = '', i;
      for (i = 0; i < lead; i++) h += '<span class="x" aria-hidden="true"></span>';
      for (var d = 1; d <= n; d++) {
        var w = wd(Y, m, d), k = iso(Y, m, d), cl = shut(m, d), off = U(Y, m, d) < TU || cl;
        h += '<button type="button" class="d' + (w === 5 || w === 6 ? ' fs' : '') + '" data-iso="' + k + '" aria-pressed="' + (k === st.date) + '" aria-label="' + DAY[w] + ' ' + d + ' ' + MON[m] + (cl ? ', closed' : '') + '"' + (off ? ' disabled' : '') + '>' + d + '</button>';
      }
      G.innerHTML = h;
      $$('button', MO).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-i') === mi)); });
    }
    if (MO) {
      MO.innerHTML = MONTHS.map(function (x, i) { return '<button type="button" data-i="' + i + '">' + MON[x.m] + '</button>'; }).join('');
      MO.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; mi = +b.getAttribute('data-i'); build(); });
    }
    function isFS() { if (!st.date) return st.d === 'fs'; var q = parse(st.date), w = wd(q.y, q.m, q.d); return w === 5 || w === 6; }
    function summary() {
      var how = st.s === 'seat' ? 'seated' : 'standing';
      txt('sdSumN', HASF ? st.n + ', ' + how : String(st.n));
      var room = cards.length === 1 ? cards[0].getAttribute('data-room') : null;
      txt('sdSumR', fits() ? 'either floor' : 'the whole building, standing');
      txt('sdSumD', st.date ? fmt(st.date) : 'pick one');
      txt('sdSumM', !st.date ? 'pick a date' : isFS() ? 'from ' + (room ? mins[room] : '$4,000') : 'usually none');
      txt('sdHoldBtn', st.date ? 'Hold ' + fmt(st.date) : 'Pick a date to hold');
      syncForm();
    }
    var vfT = 0;
    function syncForm() {
      clearTimeout(vfT);
      vfT = setTimeout(function () {
        vfFrames().forEach(function (f) {
          var u; try { u = new URL(f.getAttribute('src'), location.href); } catch (x) { return; }
          var before = u.href;
          ['prefillDate', 'prefillGuests', 'prefillFormat'].forEach(function (k) { u.searchParams.delete(k); });
          if (st.date) u.searchParams.set('prefillDate', st.date);
          if (HASF) { u.searchParams.set('prefillGuests', String(st.n)); u.searchParams.set('prefillFormat', st.s === 'seat' ? 'seated' : 'standing'); }
          if (u.href !== before) f.setAttribute('src', u.href);
        });
      }, 600);
    }
    if (G) G.addEventListener('click', function (e) {
      var b = e.target.closest('.d'); if (!b || b.disabled) return;
      st.date = b.getAttribute('data-iso'); lset('bf-sdf-date', st.date);
      $$('.d', G).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      txt('sdHeld', '');
      summary();
    });
    var hb = D.getElementById('sdHoldBtn');
    if (hb) hb.addEventListener('click', function (e) {
      if (!st.date) { e.preventDefault(); txt('sdHeld', 'Pick a date first.'); return; }
      txt('sdHeld', 'Holding ' + fmt(st.date) + (hold && hold.getAttribute('data-guests') === '0' ? '' : ' for ' + st.n + ' guests') + '. Send it below and Jenna or Ana-Maria will pencil it in.');
    });
    build(); finder();
    var rT = 0; W.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (HASF) { var res = D.getElementById('sdRes'); if (res) res.innerHTML = line(); } }, 200); });
  });
})();
