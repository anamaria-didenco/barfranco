/*
 * Bar Franco: Google Ads tag + VenueFlow enquiry form tracking.
 * One file for every page. Load it in <head> on all pages:
 *   <script src="/static/vf-tracking.js"></script>
 * It replaces the inline Google tag and message-listener blocks.
 *
 * What it does
 *  1. Loads the Google tag (AW-18456342571) once.
 *  2. Phone and email link clicks → their conversions (unchanged).
 *     Book a table clicks (any link to /bookings/ or to NowBookIt) → the
 *     bookClick conversion, once per page view.
 *  3. Keeps the ad click: gclid / gbraid / wbraid from the landing URL go in
 *     a first-party cookie (90 days) with the landing page and time.
 *  4. Adds those, plus this page's origin, to every VenueFlow form iframe.
 *  5. On a VenueFlow "enquiry submitted" message (from venueflowhq.com only):
 *     sets enhanced-conversion user data (email, +64 phone), then fires the
 *     enquiry conversion once per enquiry, with the enquiry ID as
 *     transaction_id. Repeats and reloads are ignored.
 *
 * Privacy: personal data is never logged, never put in a URL, and is only
 * handed to gtag for enhanced conversions (Google hashes it).
 */
(function () {
  'use strict';
  if (window.__bfVfTracking) return; // loaded twice → run once
  window.__bfVfTracking = true;

  var AW_ID = 'AW-18456342571';
  var LABELS = {
    phone: 'AW-18456342571/lqN6CITV1_ocEKvg1eBE',   // Phone click
    email: 'AW-18456342571/6V9ICIfV1_ocEKvg1eBE',   // Email click - events enquiry
    form:  'AW-18456342571/yIDxCPHLqfocEKvg1eBE',   // Enquiry submitted (VenueFlow)
    // Secondary action for a step-1 capture that never finishes: its own
    // conversion action, so it can never be counted against the form label.
    partial: 'AW-18456342571/sgcCCPbB4podEKvg1eBE', // Partial enquiry (VenueFlow). Fires on {type:'vf-partial-captured'}
    bookClick: 'AW-18456342571/KQwdCPnB4podEKvg1eBE' // Book a table click (NowBookIt)
  };
  var VF_ORIGINS = ['https://venueflowhq.com', 'https://www.venueflowhq.com'];
  var CLICK_PARAMS = ['gclid', 'gbraid', 'wbraid'];
  var CLICK_COOKIE = 'bf_ads_click';
  var CLICK_DAYS = 90;
  var SEEN_KEY = 'bf_vf_enquiries_counted';

  // Local testing only (never on barfranco.nz): a test page on localhost can
  // add an extra form origin and skip loading the real Google tag.
  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';
  var test = isLocal && window.BF_TRACKING_TEST ? window.BF_TRACKING_TEST : null;
  var formOrigins = VF_ORIGINS.concat(test && test.extraOrigins ? test.extraOrigins : []);
  var debug = /[?&]vf_debug=1\b/.test(location.search) || !!(test && test.debug);
  function note(msg) { if (debug && window.console) console.info('[bf-tracking] ' + msg); }

  // ── 1. Google tag ─────────────────────────────────────────────────────────
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () { window.dataLayer.push(arguments); };
  }
  if (!test || !test.noNetwork) {
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + AW_ID;
    (document.head || document.documentElement).appendChild(tag);
  }
  gtag('js', new Date());
  // debug_mode shows events in Tag Assistant / DebugView (add ?vf_debug=1).
  gtag('config', AW_ID, debug ? { allow_enhanced_conversions: true, debug_mode: true } : { allow_enhanced_conversions: true });

  function fire(label, value, extra) {
    if (!label) return;
    var params = { send_to: label, value: value || 1.0, currency: 'NZD' };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) params[k] = extra[k];
    try { gtag('event', 'conversion', params); } catch (e) { /* never break the page */ }
  }

  // ── 2. Phone, email and Book a table links anywhere on the page ───────────
  var bookCounted = false; // a Book a table click counts once per page view
  function isBookLink(href) {
    var u;
    try { u = new URL(href, location.href); } catch (e) { return false; }
    if (/(^|\.)nowbookit\.com$/.test(u.hostname)) return true;
    var ours = u.origin === location.origin || /(^|\.)barfranco\.nz$/.test(u.hostname);
    return ours && /^\/bookings\/?$/.test(u.pathname);
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var href = (a.getAttribute('href') || '').toLowerCase();
    if (href.indexOf('tel:') === 0) fire(LABELS.phone);
    if (href.indexOf('mailto:') === 0) fire(LABELS.email);
    if (!bookCounted && isBookLink(href)) { bookCounted = true; fire(LABELS.bookClick); note('book a table click'); }
  }, true);

  // ── 3. Keep the ad click (first-party cookie, 90 days) ────────────────────
  function readClick() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + CLICK_COOKIE + '=([^;]*)'));
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { return null; }
  }
  function writeClick(c) {
    var domain = /(^|\.)barfranco\.nz$/.test(host) ? '; Domain=barfranco.nz' : '';
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = CLICK_COOKIE + '=' + encodeURIComponent(JSON.stringify(c)) +
      '; Max-Age=' + (CLICK_DAYS * 86400) + '; Path=/; SameSite=Lax' + domain + secure;
  }
  (function captureClick() {
    var params;
    try { params = new URLSearchParams(location.search); } catch (e) { return; }
    for (var i = 0; i < CLICK_PARAMS.length; i++) {
      var v = params.get(CLICK_PARAMS[i]);
      if (v && /^[\w\-.~]{1,255}$/.test(v)) {
        // The newest click wins (it's the one that brought them back).
        var c = { landing: location.origin + location.pathname, ts: Date.now() };
        c[CLICK_PARAMS[i]] = v;
        writeClick(c);
        note('stored ' + CLICK_PARAMS[i]);
        return;
      }
    }
  })();

  // ── 4. Pass the click to every VenueFlow iframe ───────────────────────────
  function isFormSrc(src) {
    try { return formOrigins.indexOf(new URL(src, location.href).origin) !== -1; } catch (e) { return false; }
  }
  function tagIframe(f) {
    if (!f || f.getAttribute('data-bf-tracked') === '1') return;
    var src = f.getAttribute('src');
    if (!src || !isFormSrc(src)) return;
    var u;
    try { u = new URL(src, location.href); } catch (e) { return; }
    var c = readClick();
    if (c) {
      for (var i = 0; i < CLICK_PARAMS.length; i++) if (c[CLICK_PARAMS[i]]) u.searchParams.set(CLICK_PARAMS[i], c[CLICK_PARAMS[i]]);
      if (c.landing) u.searchParams.set('vf_landing', c.landing);
      if (c.ts) u.searchParams.set('vf_click_ts', String(c.ts));
    }
    // So the form can reply to this page's exact origin, never '*'.
    u.searchParams.set('parentOrigin', location.origin);
    f.setAttribute('data-bf-tracked', '1');
    if (u.href !== new URL(src, location.href).href) f.setAttribute('src', u.href);
  }
  function tagAll(root) {
    var list = (root || document).getElementsByTagName('iframe');
    for (var i = 0; i < list.length; i++) tagIframe(list[i]);
  }
  tagAll(document);
  document.addEventListener('DOMContentLoaded', function () { tagAll(document); });
  if (window.MutationObserver) {
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.tagName === 'IFRAME') tagIframe(n); else if (n.getElementsByTagName) tagAll(n);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  // ── 5. VenueFlow messages → conversions ───────────────────────────────────
  // Budget bracket becomes the conversion value, so a $10k enquiry is worth
  // more than a $2k one. (Unchanged.)
  function budgetToValue(b) {
    if (!b) return 1;
    var nums = String(b).replace(/,/g, '').match(/\d+/g);
    if (!nums) return 1;
    var n = parseInt(nums[0], 10);
    if (/k/i.test(String(b)) && n < 1000) n = n * 1000;
    return n > 0 ? n : 1;
  }
  // E.164 for NZ numbers: "021 123 4567" → "+64211234567". Null if unusable.
  function toE164(raw) {
    if (!raw) return null;
    var s = String(raw).trim();
    var plus = s.charAt(0) === '+';
    var d = s.replace(/\D/g, '');
    if (!d) return null;
    if (plus) { /* already international */ }
    else if (d.indexOf('00') === 0) d = d.slice(2);
    else if (d.charAt(0) === '0') d = '64' + d.slice(1);
    else if (d.indexOf('64') !== 0) d = '64' + d;
    var e = '+' + d;
    return /^\+[1-9]\d{7,14}$/.test(e) ? e : null;
  }
  function cleanEmail(raw) {
    var e = String(raw || '').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
  }
  // Enquiries already counted on this device (survives reloads).
  function counted() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]') || []; } catch (e) { return []; }
  }
  var countedThisPage = {};
  function alreadyCounted(id) {
    if (countedThisPage[id]) return true;
    return counted().indexOf(id) !== -1;
  }
  function markCounted(id) {
    countedThisPage[id] = true;
    try {
      var list = counted();
      list.push(id);
      localStorage.setItem(SEEN_KEY, JSON.stringify(list.slice(-50)));
    } catch (e) { /* private mode: this page's memory still blocks repeats */ }
  }
  var lastNoIdAt = 0;

  window.addEventListener('message', function (e) {
    if (formOrigins.indexOf(e.origin) === -1 || !e.data) return;
    var d = e.data;
    if (typeof d === 'string') { try { d = JSON.parse(d); } catch (err) { return; } }
    if (!d || typeof d !== 'object') return;

    if (d.type === 'vf-enquiry-submitted') {
      var id = d.enquiryId !== undefined && d.enquiryId !== null && d.enquiryId !== '' ? String(d.enquiryId) : null;
      if (id) {
        if (alreadyCounted(id)) { note('repeat for enquiry ' + id + ' ignored'); return; }
        markCounted(id);
      } else {
        // An older form without an ID: still count it, but not twice in a row.
        if (Date.now() - lastNoIdAt < 30000) { note('repeat (no id) ignored'); return; }
        lastNoIdAt = Date.now();
      }
      var ud = {};
      var email = cleanEmail(d.email);
      var phone = toE164(d.phone);
      if (email) ud.email = email;
      if (phone) ud.phone_number = phone;
      if (email || phone) { try { gtag('set', 'user_data', ud); } catch (err) {} }
      fire(LABELS.form, budgetToValue(d.budgetRange || d.budget_range || d.budget), id ? { transaction_id: 'vf-' + id } : null);
      note('enquiry conversion sent' + (id ? ' for enquiry ' + id : '') + (email || phone ? ' with user data' : ''));
    }
    if (d.type === 'vf-partial-captured' && LABELS.partial) {
      fire(LABELS.partial, budgetToValue(d.budgetRange || d.budget_range || d.budget));
    }
  });

  // For the test page only.
  if (test) window.__bfTrackingInternals = { toE164: toE164, cleanEmail: cleanEmail, readClick: readClick };
})();
