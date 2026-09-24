var BF_BASE=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
/* Bar Franco — shared behaviour. Takeover menu, dachshund walker, #enquire scroll, the Menus stack, the contact form. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- takeover menu (opened by the header's Menu button) ---- */
  var tk = document.querySelector('.tk'), menuBtn = document.querySelector('.hd-menu');
  if (tk && menuBtn) {
    var closeBtn = tk.querySelector('.tk-close');
    var openMenu = function () {
      tk.classList.add('open'); tk.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    };
    var closeMenu = function () {
      if (!tk.classList.contains('open')) return;
      tk.classList.remove('open'); tk.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      menuBtn.focus();
    };
    menuBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    tk.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { closeMenu(); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('pageshow', function () { document.body.style.overflow = ''; });
  }

  /* ---- dachshund walker — scroll progress along the bottom edge ---- */
  var w = document.createElement('div'); w.className = 'walk'; w.setAttribute('aria-hidden', 'true');
  w.innerHTML = '<i></i><img src="' + BF_BASE + 'illustrations/dachshund.png" alt="">';
  document.body.appendChild(w);
  var dog = w.querySelector('img'), moveT, lastY = window.scrollY;
  function walk() {
    var max = document.documentElement.scrollHeight - window.innerHeight, p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    w.style.setProperty('--p', (p * 100).toFixed(2) + '%');
    var dir = window.scrollY >= lastY ? -1 : 1;
    dog.style.setProperty('--dir', dir);
    dog.style.transform = 'translateX(-50%) scaleX(' + dir + ')'; lastY = window.scrollY;
    if (!reduce) { dog.classList.add('trot'); clearTimeout(moveT); moveT = setTimeout(function () { dog.classList.remove('trot'); }, 180); }
  }
  window.addEventListener('scroll', walk, { passive: true }); walk();

  /* ---- "Enquire" scrolls to the #enquire band (header offset 72px) ---- */
  function gotoEnquire() {
    var el = document.getElementById('enquire'); if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: reduce ? 'auto' : 'smooth' });
  }
  document.querySelectorAll('a[href$="#enquire"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (document.getElementById('enquire')) { e.preventDefault(); gotoEnquire(); history.replaceState(null, '', '#enquire'); }
    });
  });
  if (location.hash === '#enquire') window.addEventListener('load', function () { setTimeout(gotoEnquire, 300); });

  /* ---- Menus page: the tabs and the peeking back sheet swap which menu is in front ---- */
  var ms = document.querySelector('.ms[data-front]');
  if (ms) {
    var tabs = document.querySelectorAll('.tabs [data-sheet]');
    var front = function (k) {
      ms.setAttribute('data-front', k);
      tabs.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-sheet') === k ? 'true' : 'false'); });
    };
    tabs.forEach(function (b) { b.addEventListener('click', function () { front(b.getAttribute('data-sheet')); }); });
    ms.querySelectorAll('.ms-sheet').forEach(function (s) {
      s.addEventListener('click', function () {
        var k = s.classList.contains('drink') ? 'drink' : 'food';
        if (ms.getAttribute('data-front') !== k) front(k);
      });
    });
  }
})();

/* ---- Contact / enquiry forms -> FormSubmit (AJAX) ----------------------
   <form data-email="…"> with no action/method: the page stays put, the
   message goes to the address in data-email, and a success fires the Google
   Ads conversion. Live on Contact.html (ciao@). */
(function () {
  document.querySelectorAll('form[data-email]').forEach(function (f) {
    /* invisible honeypot field to catch spam bots */
    var honey = document.createElement('input');
    honey.type = 'text'; honey.name = '_honey';
    honey.style.display = 'none'; honey.tabIndex = -1;
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
        f.innerHTML = '<p class="form-done">Grazie. We\'ll come straight back to you.</p>';
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        var err = f.querySelector('.form-error');
        if (!err) {
          err = document.createElement('p');
          err.className = 'form-error';
          f.appendChild(err);
        }
        /* failures route to Ana-Maria's inbox */
        err.innerHTML = 'Sorry — that didn\'t send. Please email us at ' +
          '<a href="mailto:anamaria@barfranco.nz">anamaria@barfranco.nz</a> and we\'ll come straight back to you.';
      });
    });
  });
})();
