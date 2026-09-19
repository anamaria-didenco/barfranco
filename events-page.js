/* Bar Franco — private events, immersive page.
   Cost planner: guests + menu -> recommended space + indicative food estimate.
   Vanilla, no deps. Every DOM lookup is guarded so a missing node can't throw.
   Prices confirmed by the venue: $40 grazing / $80 shared / $110 canapes + shared,
   canapes alone from $9 a person, drinks package $45 a head.
   Capacities: L1 120 standing / 75 seated · L2 120 standing / 90 seated ·
   both levels 240 standing / 165 seated. */
(function () {
  'use strict';

  var range = document.getElementById('im-guests');
  if (!range) return;

  var CANAPE_PER_CHOICE = 9;   /* canapes from $9 a person, per choice */
  var DRINKS_PACKAGE = 45;     /* $45 a head */

  var TIERS = [
    {
      name: 'Grazing table',
      price: 40,
      seated: false,
      desc: 'One long table of cheese, salumi, breads and pickles. Standing, help yourselves.'
    },
    {
      name: 'Shared menu',
      price: 80,
      seated: true,
      desc: 'Antipasti, pasta and secondi, shared down the middle. Seated, unhurried.'
    },
    {
      name: 'Canapés & shared',
      price: 110,
      seated: true,
      desc: 'Canapés with the first drink, then the full shared menu at the table. The whole night handled.'
    }
  ];

  var tier = 1;

  function $(id) { return document.getElementById(id); }

  function money(n) {
    var v = Math.round(n);
    try { return '$' + v.toLocaleString('en-NZ'); }
    catch (e) { return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  }

  function set(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  /* Recommended space — respects the real capacities on both levels. */
  function recommend(g, t) {
    if (t.seated) {
      if (g <= 40) {
        return ['Level 2 — the long table',
          'One table, courses down the middle, nobody ordering off a menu.'];
      }
      if (g <= 90) {
        return ['Level 2 — the restaurant',
          'The open kitchen in view and the room still feels like yours. Seats up to 90.'];
      }
      if (g <= 165) {
        return ['Both levels — seated',
          'Tables on both floors, seated for up to 165, and both bars pouring.'];
      }
      return ['Both levels — seated and standing',
        'Past 165 seated we mix it: tables for some, standing room and food that comes to you for the rest. 240 in the building.'];
    }
    if (g <= 75) {
      return ['Level 1 — the Negroni Bar',
        'Drinks in hand, cicchetti circulating, room to move — and seats for 75 when legs get tired.'];
    }
    if (g <= 120) {
      return ['Level 1 — the Negroni Bar, exclusively',
        'The downstairs bar to yourselves, standing for up to 120, nobody queueing.'];
    }
    return ['Both levels — the building to yourselves',
      'Two bars, two floors, standing for up to 240, and the doors closed to everyone else.'];
  }

  function render() {
    var g = parseInt(range.value, 10);
    if (!isFinite(g) || g < 10) g = 10;
    if (g > 240) g = 240;

    var t = TIERS[tier] || TIERS[1];
    var rec = recommend(g, t);
    var label = g + (g === 1 ? ' guest' : ' guests');

    set('im-guests-out', label);
    set('im-guests-label', label);
    set('im-space', rec[0]);
    set('im-note', rec[1]);
    set('im-tier-name', t.name);
    set('im-tier-desc', t.desc);
    set('im-tier-price', money(t.price) + ' a head');
    set('im-estimate', money(g * t.price));

    /* The add-on line changes with the tier — canapés are already in tier 3. */
    if (t.seated && t.price >= 110) {
      set('im-addon', 'Canapés are already in. Add the drinks package at ' + money(DRINKS_PACKAGE) +
        ' a head and the night lands around ' + money(g * (t.price + DRINKS_PACKAGE)) +
        '. Or keep drinks on consumption, or on a tab you cap — your call.');
    } else {
      set('im-addon', 'Add three canapés with the first drink and it\'s about ' +
        money(g * (t.price + CANAPE_PER_CHOICE * 3)) + '. Drinks on consumption, on a tab you cap, ' +
        'or a package at ' + money(DRINKS_PACKAGE) + ' a head — your call.');
    }

    var picks = document.querySelectorAll('[data-pick]');
    Array.prototype.forEach.call(picks, function (el) {
      el.setAttribute('aria-pressed', String(parseInt(el.getAttribute('data-pick'), 10) === tier));
    });
  }

  range.addEventListener('input', render);
  range.addEventListener('change', render);

  Array.prototype.forEach.call(document.querySelectorAll('[data-pick]'), function (el) {
    el.addEventListener('click', function () {
      var i = parseInt(el.getAttribute('data-pick'), 10);
      if (isFinite(i) && TIERS[i]) { tier = i; render(); }
    });
  });

  render();
})();
