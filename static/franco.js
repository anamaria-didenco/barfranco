/* Bar Franco — franco.js · the three movements (set, unmask, settle) and the phone Index.
   Masthead, dock and the live footer clock stay in chrome.js. Plain JS, no dependencies;
   without it every page is complete and still (motion is gated on html.fx, set in <head>). */
(function () {
  var d = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- set · unmask · settle: each element moves once, the first time it is seen ---- */
  var movers = [].slice.call(d.querySelectorAll('[data-set],[data-unmask],[data-settle]'));
  function on(e) { e.setAttribute('data-on', ''); }
  /* the first screen is simply there: whatever is already in view when the page arrives shows at once,
     without its movement, so the title and the lead photograph never wait on a transition */
  var vh = window.innerHeight || 800;
  movers = movers.filter(function (e) {
    var r = e.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= vh) return true;
    e.setAttribute('data-now', ''); on(e); return false;
  });
  if (reduce || !('IntersectionObserver' in window)) {
    movers.forEach(on);
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { on(x.target); io.unobserve(x.target); } });
    }, { threshold: 0.18 });
    movers.forEach(function (e) { io.observe(e); });
    // background tabs and print previews never scroll: show everything rather than leave it blank
    setTimeout(function () { if (d.hidden) movers.forEach(on); }, 2500);
  }

  /* ---- phone Index ---- */
  var ix = d.getElementById('ora-index'), last = null;
  function open() {
    if (!ix) return;
    last = d.activeElement; ix.hidden = false; d.body.style.overflow = 'hidden';
    var c = ix.querySelector('[data-ora="menu-close"]'); if (c) c.focus();
  }
  function close() {
    if (!ix || ix.hidden) return;
    ix.hidden = true; d.body.style.overflow = '';
    if (last && last.focus) last.focus();
  }
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-ora]');
    if (!t) return;
    var k = t.getAttribute('data-ora');
    if (k === 'menu-open') open();
    if (k === 'menu-close') close();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  if (ix) ix.addEventListener('click', function (e) { if (e.target.closest('a[href]')) close(); });
})();

/* ---- tabs: <div class="tabs" role="tablist"><button role="tab" aria-controls="panel-id" aria-selected="true">…
   Each button shows its own panel (role="tabpanel", the others get hidden). Arrow keys move along the row. ---- */
(function () {
  [].forEach.call(document.querySelectorAll('.tabs[role="tablist"]'), function (list) {
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"][aria-controls]'));
    function show(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t, p = document.getElementById(x.getAttribute('aria-controls'));
        x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1;
        if (p) p.hidden = !on;
      });
      if (focus) t.focus();
      list.dispatchEvent(new CustomEvent('bf-tab', { detail: t.getAttribute('aria-controls'), bubbles: true }));
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); show(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
    /* a link to a panel (e.g. /menus/#sheet-events) opens its tab */
    var hashed = tabs.filter(function (t) { return '#' + t.getAttribute('aria-controls') === location.hash; })[0];
    var first = hashed || tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    if (first) show(first);
    if (hashed) setTimeout(function () { var p = document.getElementById(hashed.getAttribute('aria-controls')); if (p) p.scrollIntoView(); }, 60);
  });
})();

/* ---- Contact / enquiry forms -> FormSubmit (AJAX) ----------------------
   <form data-email="…"> with no action/method: the page stays put, the
   message goes to the address in data-email, and a success fires the Google
   Ads conversion. Live on the Contact page (ciao@). */
(function () {
  document.querySelectorAll('form[data-email]').forEach(function (f) {
    /* invisible honeypot field to catch spam bots */
    var honey = document.createElement('input');
    honey.type = 'text'; honey.name = '_honey';
    honey.hidden = true; honey.style.display = 'none'; honey.tabIndex = -1;  /* never rendered, never focused, never announced */
    honey.setAttribute('autocomplete', 'off');
    honey.setAttribute('aria-hidden', 'true');
    f.appendChild(honey);

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (honey.value) return; /* bot filled the hidden field */

      var to = f.getAttribute('data-email');
      var subj = f.getAttribute('data-subject') || 'Enquiry — Bar Franco';
      var btn = f.querySelector('button[type="submit"], .btn');
      var btnText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      /* form-encoded (URLSearchParams) keeps this a "simple" cross-origin
         request — no CORS preflight — which is what FormSubmit's AJAX endpoint
         needs to accept it from a browser. JSON triggers a preflight that gets
         blocked. Do not "tidy" this into a JSON body. */
      var payload = new URLSearchParams();
      payload.append('_subject', subj);
      payload.append('_template', 'table');
      payload.append('_captcha', 'false');
      f.querySelectorAll('input, textarea, select').forEach(function (el) {
        if (el === honey || !el.value) return;
        var lab = el.id ? f.querySelector('label[for="' + el.id + '"]') : null;
        var key = lab ? lab.textContent.replace('*', '').trim() : (el.name || el.id || 'Field');
        payload.append(key, el.value);
      });

      fetch('https://formsubmit.co/ajax/' + encodeURIComponent(to), {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: payload
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || (res.success !== true && res.success !== 'true')) throw new Error('not ok');
        /* Report to Google Ads. Without this an ad click that converts through
           this form is recorded as a failure, so the campaign optimises away
           from whatever produced it. */
        try {
          gtag('event', 'conversion', {
            send_to: 'AW-18456342571/6V9ICIfV1_ocEKvg1eBE',
            value: 1.0,
            currency: 'NZD'
          });
        } catch (err) {}
        f.innerHTML = '<p class="form-note">Grazie. We\'ll come straight back to you.</p>';
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        var err = f.querySelector('.form-note.err');
        if (!err) {
          err = document.createElement('p');
          err.className = 'form-note err';
          f.appendChild(err);
        }
        /* failures point to the inbox the form sends to */
        err.innerHTML = 'Sorry — that didn\'t send. Please email us at ' +
          '<a href="mailto:ciao@barfranco.nz">ciao@barfranco.nz</a> and we\'ll come straight back to you.';
      });
    });
  });
})();

/* ---- VenueFlow enquiry: the widget posts its height, so the frame fits the form (no blank card under it).
   It measures itself as at least as tall as its frame, so the frame starts at the form's own height (460px)
   and only ever grows. ---- */
[].forEach.call(document.querySelectorAll('iframe[src*="venueflowhq.com"]'), function (f) {
  /* while the form is on its way the card says so (and where to write instead), rather than sitting empty */
  var box = document.createElement('div'), p = document.createElement('p');
  box.className = 'vf';
  p.className = 'vf-wait a4';
  p.innerHTML = 'Loading the enquiry form… <em>or email <a href="mailto:events@barfranco.nz">events@barfranco.nz</a></em>';
  f.parentNode.insertBefore(box, f);
  box.appendChild(p); box.appendChild(f);
  var done = function () { if (p.parentNode) p.parentNode.removeChild(p); };
  f.addEventListener('load', done);
  setTimeout(function () { if (p.parentNode) p.firstChild.nodeValue = 'The form is taking a while… '; }, 8000);
});
window.addEventListener('message', function (e) {
  if (e.origin !== 'https://venueflowhq.com' || !e.data) return;
  var d = e.data;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch (err) { return; } }
  if (!d || d.type !== 'vf-embed-height' || !(d.height > 0)) return;
  [].forEach.call(document.querySelectorAll('iframe[src*="venueflowhq.com"]'), function (f) {
    if (f.contentWindow === e.source) f.style.height = Math.ceil(d.height) + 'px';
  });
});
