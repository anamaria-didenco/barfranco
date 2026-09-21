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

      /* Safety net: data-cc sends a copy to a second address. The events form
         posts to events@barfranco.nz, which is new — until that mailbox is
         confirmed live, a copy also reaches anamaria@ so no enquiry can be
         lost in the changeover. Delete the data-cc attribute once verified. */
      var cc = f.getAttribute('data-cc');
      if (cc) payload.append('_cc', cc);

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
        /* Google Ads conversion for a native form submit.
           main's fix was right that an unreported submit makes the campaign
           optimise away from whatever produced it — but it fired the EMAIL
           label for a form, and with a flat value of 1.

           So: dispatch a cancelable event first. Pages whose <head> carries the
           BF-ADS-CONVERSIONS block listen for it, fire the FORM label with the
           budget bracket as the value, and call preventDefault() to say
           "handled". If nothing handled it, fall back to firing here, so pages
           without that block still report. Either way it fires exactly once. */
        var budgetEl = f.querySelector('#budget');
        var budget = budgetEl ? budgetEl.value : '';
        var handled = false;
        try {
          var ev = new CustomEvent('bf-enquiry-submitted', { detail: { budgetRange: budget }, cancelable: true });
          handled = !document.dispatchEvent(ev);
        } catch (e) {}
        if (!handled) {
          try {
            gtag('event', 'conversion', {
              send_to: 'AW-18456342571/yIDxCPHLqfocEKvg1eBE',
              value: 1.0, currency: 'NZD'
            });
          } catch (e) {}
        }

        var name = (f.querySelector('#name') || {}).value || '';
        f.className += ' form-done';
        f.innerHTML =
          '<img class="fd-mark" src="brand/bf-emblem.svg" alt="" aria-hidden="true">' +
          '<h3>Grazie' + (name ? ', ' + name.split(' ')[0].replace(/[<>&]/g, '') : '') + '.</h3>' +
          '<p>That\'s with us. We read every enquiry ourselves and come back on all of them — usually within one business day.</p>' +
          '<p class="fnote">Something urgent in the meantime? Email <a href="mailto:' + to + '">' + to + '</a> or call <a href="tel:+64212211307">021 221 1307</a>.</p>';
        f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
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

  /* ---- reliable scroll to the #enquire form (fixes the anchor jump landing at top) ---- */
  function gotoEnquire() {
    var el = document.getElementById('enquire');
    if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  document.querySelectorAll('a[href$="#enquire"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (document.getElementById('enquire')) { e.preventDefault(); gotoEnquire(); history.replaceState(null, '', '#enquire'); }
    });
  });
  if (location.hash === '#enquire') {
    window.addEventListener('load', function () { setTimeout(gotoEnquire, 500); });
  }

  /* ---- legacy acknowledgement (no email target) ---- */
  document.querySelectorAll('form[data-ack]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = f.querySelector('button[type="submit"], .btn');
      if (btn) btn.textContent = "Thanks — we'll be in touch";
    });
  });
})();
