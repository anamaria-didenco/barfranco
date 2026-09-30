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

  var st = document.querySelector('[data-bf-status]'), ck = document.querySelector('[data-bf-clock]');
  if (!st || !ck) return;
  var fmt;
  try { fmt = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }); }
  catch (e) { return; }
  function tick() {
    var p = {};
    fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var h = +p.hour;
    var s = h < 16 ? 'Opening at 4pm' : h < 17 ? 'Open, kitchen at 5pm' : 'Open till late';
    if (st.textContent !== s) st.textContent = s;
    ck.textContent = p.hour + ':' + p.minute + ':' + p.second;
  }
  tick();
  document.querySelectorAll('[data-bf-live]').forEach(function (e) { e.hidden = false; });
  setInterval(tick, 1000);
  var y = document.querySelector('[data-bf-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
