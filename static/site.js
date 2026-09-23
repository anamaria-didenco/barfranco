/* ============================================================
   BAR FRANCO — shared behaviour.
   Takeover menu, dachshund walker, menu tabs, in-page scrolling,
   and the contact form's FormSubmit flow.
   ============================================================ */
var BF_BASE = ((document.currentScript && document.currentScript.src) || '').replace(/[^\/]*$/, '');

(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Takeover menu -------------------------------------------------- */
  (function () {
    var tk = document.querySelector('.takeover');
    if (!tk) return;
    var openers = document.querySelectorAll('[data-menu-open]');
    var closer = tk.querySelector('[data-menu-close]');
    var lastOpener = null;

    function open(on) {
      tk.hidden = !on;
      document.body.style.overflow = on ? 'hidden' : '';
      if (on) { if (closer) closer.focus(); }
      else if (lastOpener) lastOpener.focus();
    }
    openers.forEach(function (b) {
      b.addEventListener('click', function () { lastOpener = b; open(true); });
    });
    if (closer) closer.addEventListener('click', function () { open(false); });
    tk.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { open(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !tk.hidden) open(false);
    });
  })();

  /* ---- Dachshund walker ----------------------------------------------- */
  (function () {
    if (document.querySelector('.walker')) return;
    var w = document.createElement('div');
    w.className = 'walker';
    w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<i></i>';
    var dog = document.createElement('img');
    dog.src = BF_BASE + 'illustrations/dachshund.png';
    dog.alt = '';
    w.appendChild(dog);
    document.body.appendChild(w);

    var fill = w.querySelector('i'), lastY = window.scrollY;
    function walk() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      var pct = (p * 100).toFixed(2) + '%';
      fill.style.width = pct;
      dog.style.left = pct;
      dog.style.transform = 'translateX(-50%) scaleX(' + (window.scrollY >= lastY ? -1 : 1) + ')';
      lastY = window.scrollY;
    }
    window.addEventListener('scroll', walk, { passive: true });
    window.addEventListener('resize', walk, { passive: true });
    walk();
  })();

  /* ---- In-page links: clear the 72px sticky header --------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });

  /* ---- Menu tabs (Menus page) ------------------------------------------
     The tabs and a click on the peeking back sheet both swap which sheet
     is in front. */
  (function () {
    var stack = document.querySelector('[data-stack]');
    if (!stack) return;
    var tabs = document.querySelectorAll('[data-tab]');
    function show(which) {
      stack.setAttribute('data-front', which);
      tabs.forEach(function (t) {
        t.setAttribute('aria-selected', t.getAttribute('data-tab') === which ? 'true' : 'false');
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { show(t.getAttribute('data-tab')); });
    });
    stack.querySelectorAll('[data-sheet]').forEach(function (s) {
      s.addEventListener('click', function () {
        if (stack.getAttribute('data-front') !== s.getAttribute('data-sheet')) {
          show(s.getAttribute('data-sheet'));
        }
      });
    });
  })();

  /* ---- Contact / enquiry forms -> FormSubmit (AJAX) ---------------------
     The pages carry <form data-email="…"> with no action and no method, so
     without this a submit does nothing at all: no email, no error. Live on
     Contact.html (ciao@) and weddings/ (anamaria@).
     Note: FormSubmit activates per domain, so a submit from localhost always
     answers {"success":"false","message":"This form needs Activation…"} —
     that is the error path working, not a bug in this code. */
  document.querySelectorAll('form[data-email]').forEach(function (f) {
    var honey = document.createElement('input');
    honey.type = 'text'; honey.name = '_honey';
    honey.style.display = 'none'; honey.tabIndex = -1;
    honey.setAttribute('autocomplete', 'off');
    honey.setAttribute('aria-hidden', 'true');
    f.appendChild(honey);

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (honey.value) return; /* a bot filled the hidden field */

      var to = f.getAttribute('data-email');
      var subj = f.getAttribute('data-subject') || 'Enquiry — Bar Franco';
      var btn = f.querySelector('button[type="submit"], .btn-solid');
      var btnText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      /* form-encoded keeps this a "simple" cross-origin request — no CORS
         preflight — which is what FormSubmit's AJAX endpoint needs. A JSON
         body triggers a preflight that gets blocked. Do not "tidy" this. */
      var payload = new URLSearchParams();
      payload.append('_subject', subj);
      payload.append('_template', 'table');
      payload.append('_captcha', 'false');
      f.querySelectorAll('input, textarea, select').forEach(function (el) {
        if (el === honey || !el.value) return;
        var lab = el.id ? f.querySelector('label[for="' + el.id + '"]') : el.closest('label');
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
        /* Report to Google Ads. Without this an ad click converting through
           this form is recorded as a failure, so the campaign optimises away
           from whatever produced it. */
        try {
          gtag('event', 'conversion', {
            send_to: 'AW-18456342571/6V9ICIfV1_ocEKvg1eBE',
            value: 1.0, currency: 'NZD'
          });
        } catch (err) {}
        f.innerHTML = '<p class="form-done">Grazie. We\'ll come straight back to you.</p>';
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        var err = f.querySelector('.form-error');
        if (!err) { err = document.createElement('p'); err.className = 'form-error'; f.appendChild(err); }
        err.innerHTML = 'Sorry — that didn\'t send. Please email us at ' +
          '<a href="mailto:anamaria@barfranco.nz">anamaria@barfranco.nz</a> and we\'ll come straight back to you.';
      });
    });
  });
})();
