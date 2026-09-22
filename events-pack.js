/* Bar Franco — Events Pack behaviour: reveal-on-scroll with sibling stagger, dachshund scroll-progress walker. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* reveal: auto-tag the page's blocks and stagger siblings */
  var sel = 'body > section > *, .ehero > *, .cta-band > *, .moments > *, .events > *';
  var groups = new Map();
  document.querySelectorAll(sel).forEach(function (el) {
    if (el.closest('nav') || el.closest('footer') || el.classList.contains('reveal')) return;
    var k = el.parentNode, i = groups.get(k) || 0; groups.set(k, i + 1);
    el.classList.add('reveal'); el.style.setProperty('--i', Math.min(i, 8));
  });
  if (reduce || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* dachshund walker — scroll progress along the top edge */
  var w = document.createElement('div'); w.className = 'walker'; w.setAttribute('aria-hidden', 'true');
  w.innerHTML = '<i></i><img src="brand/franco-dog.png" alt="">';
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
