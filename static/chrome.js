/* Bar Franco — shared masthead and footer behaviour, on every page.
   The masthead tightens to one line once scrolled; the footer tells you whether Franco is open,
   on a live Ōtautahi clock. */
(function () {
  var m = document.querySelector('.bf-mast');
  if (m) {
    var raf = 0, tight = false;
    var onScroll = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var y = window.scrollY || 0;
        // two thresholds, so the bar doesn't flicker as its own height changes
        if (!tight && y > 90) { tight = true; m.classList.add('bf-tight'); }
        else if (tight && y < 10) { tight = false; m.classList.remove('bf-tight'); }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // phones: the Book a table / Plan an event dock stays out of the way. It is hidden on the first
  // screen, rises once you're past it, tucks away while you scroll down to read and comes back
  // when you scroll up. It stays hidden while the footer, the enquiry form or the booking
  // widget is on screen, or the home page's own two buttons, because each of those already
  // has its own way to book or plan.
  var dock = document.querySelector('.m-dock, .dock');
  if (dock) {
    document.documentElement.classList.add('bf-dockjs');
    var lastY = window.scrollY || 0, drift = 0, dRaf = 0, blockers = 0;
    var stay = /^\/(functions|christmas-functions)\//.test(location.pathname);
    var always = location.pathname === '/' || location.pathname === '/index.html';   // Home is the store: on phones Book / Plan never leave the screen
    var calm = !always && !stay && !!document.querySelector('.pg-hero');   // every page on the editorial hero: the dock is the page's ask, on from the first screen, stepping aside only for a form or the footer
    var dockTargets = document.querySelectorAll('.bf-foot, #enquire, #book, .g-hero-ask');
    var setDock = function (on) {
      if (dock.classList.contains('bf-dock-on') === on) return;
      dock.classList.toggle('bf-dock-on', on);
      dock.setAttribute('aria-hidden', on ? 'false' : 'true');
      [].forEach.call(dock.querySelectorAll('a'), function (a) { a.tabIndex = on ? 0 : -1; });
    };
    var onDock = function () {
      if (dRaf) return;
      dRaf = requestAnimationFrame(function () {
        dRaf = 0;
        var y = window.scrollY || 0, dy = y - lastY; lastY = y;
        drift = (dy > 0) === (drift > 0) ? drift + dy : dy;   // distance travelled in the current direction
        if (always) setDock(true);
        else if (calm) setDock(blockers === 0);
        else if (y < window.innerHeight * 0.6 || blockers > 0) setDock(false);
        else if (stay) setDock(true);   // Functions and Christmas: once past the first screen, the ask stays
        else if (drift > 24) setDock(false);
        else if (drift < -24) setDock(true);
      });
    };
    if ('IntersectionObserver' in window && dockTargets.length) {
      var seen = new Map();
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { seen.set(e.target, e.isIntersecting); });
        blockers = 0; seen.forEach(function (v) { if (v) blockers++; });
        if (blockers && !always) setDock(false);
        else if (calm) setDock(blockers === 0);
      }, { rootMargin: '0px 0px -10% 0px' });
      [].forEach.call(dockTargets, function (t) { io.observe(t); });
    }
    setDock(always || calm);
    window.addEventListener('scroll', onDock, { passive: true });
  }

  var sts = document.querySelectorAll('[data-bf-status]'), cks = document.querySelectorAll('[data-bf-clock]');
  if (!sts.length) return;
  var fmt;
  try { fmt = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); }
  catch (e) { return; }
  function tick() {
    var p = {};
    fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var h = +p.hour;
    var s = h < 16 ? 'Opening at 4pm' : h < 17 ? 'Open, kitchen at 5pm' : 'Open till late';
    var t = p.hour + ':' + p.minute;
    sts.forEach(function (e) { if (e.textContent !== s) e.textContent = s; });
    cks.forEach(function (e) { if (e.textContent !== t) e.textContent = t; });
  }
  tick();
  document.querySelectorAll('[data-bf-live]').forEach(function (e) { e.hidden = false; });
  setInterval(tick, 30000);
  var ds = document.querySelectorAll('[data-bf-date]');
  if (ds.length) { try { var df = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', weekday: 'long', day: 'numeric', month: 'long' }); var dv = df.format(new Date()); ds.forEach(function (e) { e.textContent = dv; }); } catch (e) {} }
  var y = document.querySelector('[data-bf-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
