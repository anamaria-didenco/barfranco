var BF_BASE=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
/* barfranco.nz 2.0 — shared behaviour. Reveal-on-scroll, nav hide, marquee, live hours, dachshund progress walker, counters. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal: auto-tag the page's blocks and stagger siblings */
  var sel = '.paper, .table .head, body > section > *, .page-hero > *, .levels > *, .gallery > *, .gal > *, .types > div, .steps > div, .sheet > section, .faq details, .stats > div, .ehero > *, .cta-band > *, .moments > *, .events > *, .contact > *';
  var groups = {};
  document.querySelectorAll(sel).forEach(function (el) {
    if (el.closest('.hero') || el.closest('nav') || el.closest('footer') || el.closest('.ciao') || el.closest('.stackwrap') || el.classList.contains('reveal')) return;
    var k = el.parentNode; groups[k] = groups[k] || 0;
    el.classList.add('reveal'); el.style.setProperty('--i', Math.min(groups[k]++, 8));
  });
  if (reduce) { document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* poster takeover menu */
  var tk = document.querySelector('.takeover');
  if (tk) {
    tk.querySelectorAll('li').forEach(function (li, i) { li.style.setProperty('--i', i); });
    var open = function (o) { tk.classList.toggle('open', o); document.body.style.overflow = o ? 'hidden' : ''; };
    document.querySelectorAll('[data-menu]').forEach(function (b) { b.addEventListener('click', function () { open(true); }); });
    tk.querySelector('.close').addEventListener('click', function () { open(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
  }

  /* nav hides on the way down, returns on the way up */
  var nav = document.querySelector('.nav'), last = 0;
  window.addEventListener('scroll', function () { var y = window.scrollY; if (nav) nav.classList.toggle('hidden', y > last && y > 240); last = y; }, { passive: true });

  /* marquee: duplicate the strip so it loops seamlessly */
  document.querySelectorAll('.strip').forEach(function (s) {
    var t = s.querySelector('.track'); if (!t) { t = document.createElement('span'); t.className = 'track'; t.textContent = s.textContent.trim(); s.textContent = ''; s.appendChild(t); }
    for (var i = 0; i < 3; i++) s.appendChild(t.cloneNode(true));
  });

  /* live hours (NZ time): bar 4pm, kitchen 5pm */
  var live = document.getElementById('open-now');
  if (live) {
    try {
      var h = parseInt(new Intl.DateTimeFormat('en-NZ', { hour: 'numeric', hour12: false, timeZone: 'Pacific/Auckland' }).format(new Date()), 10);
      live.textContent = h >= 17 || h < 1 ? 'Open now · kitchen serving' : h >= 16 ? 'Bar open now · kitchen from 5pm' : 'Opens 4pm today';
    } catch (e) {}
  }

  /* counters */
  if (!reduce) {
    var co = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      var el = e.target, m = el.textContent.match(/^\d+$/); if (!m) return;
      var target = +m[0], t0 = null; (function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 1100, 1); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now());
    }); }, { threshold: 0.6 });
    document.querySelectorAll('.stats .n, .line + .line > span:last-child').forEach(function (el) { co.observe(el); });
  }

  /* dachshund walker — scroll progress along the top edge */
  var w = document.createElement('div'); w.className = 'walker'; w.setAttribute('aria-hidden', 'true');
  w.innerHTML = '<i></i><img src="'+BF_BASE+'illustrations/dachshund.png" alt="">';
  document.body.appendChild(w);
  var dog = w.querySelector('img'), moveT, lastY = window.scrollY;
  function walk() {
    var max = document.documentElement.scrollHeight - window.innerHeight, p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    w.style.setProperty('--p', (p * 100).toFixed(2) + '%');
    dog.style.transform = 'translateX(-50%) scaleX(' + (window.scrollY >= lastY ? -1 : 1) + ')'; lastY = window.scrollY;
    if (!reduce) { dog.classList.add('trot'); clearTimeout(moveT); moveT = setTimeout(function () { dog.classList.remove('trot'); }, 180); }
  }
  window.addEventListener('scroll', walk, { passive: true }); walk();
})();

/* ---- Contact / enquiry forms -> FormSubmit (AJAX) ----------------------
   Restored: the pages carry <form data-email="…"> with no action/method, but
   this handler lived only in the old root site.js, which the rebuilt pages no
   longer load. Without it a submit did nothing at all — no email, no error.
   Live on Contact.html (ciao@) and weddings/ (anamaria@). */
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
