/* Bar Franco — shared site behaviour */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll reveal ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { io.observe(el); });

  /* ---- dachshund scroll-progress walker ---- */
  var dog = document.getElementById('dog'), track = document.getElementById('track');
  if (dog && track) {
    var moveT, lastY = window.scrollY;
    var onWalk = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(Math.max(window.scrollY / h, 0), 1) : 0;
      var pct = (p * 100).toFixed(2) + '%';
      dog.style.left = pct;
      track.style.setProperty('--p', pct);
      var dir = window.scrollY >= lastY ? -1 : 1;
      dog.style.transform = 'translateX(-50%) scaleX(' + dir + ')';
      lastY = window.scrollY;
      if (!reduce) {
        dog.classList.add('trot');
        clearTimeout(moveT);
        moveT = setTimeout(function () { dog.classList.remove('trot'); }, 180);
      }
    };
    window.addEventListener('scroll', onWalk, { passive: true });
    onWalk();
  }

  /* ---- nav hide on scroll down + mobile toggle ---- */
  var nav = document.getElementById('nav');
  if (nav) {
    var navLast = 0;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > navLast && y > 220) nav.classList.add('hidden');
      else nav.classList.remove('hidden');
      navLast = y;
    }, { passive: true });

    var burger = nav.querySelector('.nav-burger');
    if (burger) {
      burger.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
      nav.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('open'); });
      });
    }
  }

  /* ---- form → email via FormSubmit (AJAX: delivers to data-email, stays on page) ---- */
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

      /* form-encoded (URLSearchParams) keeps this a "simple" cross-origin request —
         no CORS preflight — which is what FormSubmit's AJAX endpoint needs to accept
         it from a browser. (JSON triggers a preflight that gets blocked.) */
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
        f.innerHTML = '<h3>Grazie! 🎉</h3>' +
          '<p class="fnote">Thanks for reaching out — your message is on its way and we\'ll be in touch very soon.</p>' +
          '<p class="fnote">Anything urgent? Email <a href="mailto:' + to + '">' + to + '</a>.</p>';
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        var err = f.querySelector('.form-error');
        if (!err) {
          err = document.createElement('p');
          err.className = 'fnote form-error';
          err.style.color = 'var(--red)';
          f.appendChild(err);
        }
        var fallbackEmail = 'anamaria@barfranco.nz'; /* failures route to Ana-Maria's inbox */
        err.innerHTML = 'Sorry — that didn\'t send. Please email us directly at <a href="mailto:' + fallbackEmail + '">' + fallbackEmail + '</a> and we\'ll come straight back to you.';
      });
    });
  });

  /* ---- legacy acknowledgement (no email target) ---- */
  document.querySelectorAll('form[data-ack]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type="submit"], .btn');
      if (btn) btn.textContent = "Thanks — we'll be in touch";
    });
  });
})();
