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

  /* ---- form → email (mailto) ---- */
  document.querySelectorAll('form[data-email]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var to = f.getAttribute('data-email');
      var subj = f.getAttribute('data-subject') || 'Enquiry — Bar Franco';
      var lines = [];
      f.querySelectorAll('input, textarea, select').forEach(function (el) {
        if (!el.id || !el.value) return;
        var lab = f.querySelector('label[for="' + el.id + '"]');
        var name = lab ? lab.textContent.replace('*', '').trim() : el.id;
        lines.push(name + ': ' + el.value);
      });
      var href = 'mailto:' + to + '?subject=' + encodeURIComponent(subj) +
                 '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;
      var btn = f.querySelector('button[type="submit"], .btn');
      if (btn) btn.textContent = 'Opening your email…';
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
