/* The site editor. The page being edited loads in a frame with scripts switched off, so what you see is the file
   itself; edits happen in that frame, and Save writes the changed files to GitHub as one commit. */
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const DEF = { owner: 'anamaria-didenco', repo: 'barfranco', branch: 'main', folder: 'savoy' };
const BASE_PAGES = [['', 'Home'], ['our-story', 'Our story'], ['menus', 'Menus'], ['bookings', 'Bookings'], ['restaurant', 'The restaurant'],
  ['negroni-bar', 'Negroni bar'], ['aperitivo', 'Aperitivo'], ['fresh-pasta', 'Pasta fresca'], ['pre-stadium-dining', 'Before the stadium'],
  ['functions', 'Functions'], ['private-dining', 'Private dining'], ['corporate-events', 'Corporate events'], ['weddings', 'Weddings'],
  ['christmas-functions', 'Christmas'], ['events-pack', 'Events pack'], ['vouchers', 'Gift vouchers'], ['contact', 'Contact']];
let PAGES = BASE_PAGES.concat(JSON.parse(localStorage.getItem('bf-admin-pages') || '[]'));
const BRAND = { ink: '#6C0600', paper: '#F1EEE6', accent: '#AF0F00' };
const LOCAL_FONTS = { display: 'VTC Marsha', body: 'Affairs' };
const GOOGLE_FONTS = ['Playfair Display', 'Cormorant Garamond', 'DM Serif Display', 'Fraunces', 'EB Garamond', 'Libre Caslon Text', 'Bodoni Moda',
  'Lora', 'Inter', 'Work Sans', 'Josefin Sans', 'Oswald', 'Bebas Neue', 'Montserrat', 'Raleway'];
const SITE = new URL('../', location.href);           /* the site root, where this editor lives under /admin/ */
const STATIC = new URL('static/', SITE);
const SIZES = [0.7, 0.85, 1, 1.15, 1.3, 1.5, 1.75, 2, 2.5];
const SPACES = { Tight: '40px', Normal: '', Roomy: '140px', Airy: '200px' };

let cfg = Object.assign({}, DEF, JSON.parse(localStorage.getItem('bf-admin-cfg') || '{}'));
let token = localStorage.getItem('bf-admin-token') || '';
let gh = null;
const files = new Map();      /* repo path -> {orig, base, text} for text files, {b64, label} for new binaries */
let page = null;              /* the open page: {slug, path, url} */
let fdoc = null;              /* its document in the frame */
let selected = null;
let css = null;               /* {orig, text} of the stylesheet, loaded on demand */
let fontsList = null, imagesList = null;
const blobURLs = new Map();   /* repo path of a pending upload -> object URL for previews */
const snaps = [];             /* body snapshots for Undo change */

/* ---------- small helpers ---------- */
const rp = rel => (cfg.folder ? cfg.folder.replace(/\/+$/, '') + '/' : '') + rel;
const pagePath = slug => rp((slug ? slug + '/' : '') + 'index.html');
const toast = (t, ms) => { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => el.hidden = true, ms || 3200); };
const status = t => { $('#status').textContent = t; };
const friendly = e => {
  if (!e) return 'Something went wrong.';
  if (e.status === 401) return 'GitHub did not accept the key. Sign out and paste it again.';
  if (e.status === 403) return 'The key is not allowed to write to the site. Check it has Contents: Read and write on the repository.';
  if (e.status === 404) return 'GitHub cannot find the site. Check the owner, repository and branch in Settings.';
  if (e.status === 409 || e.status === 422) return 'The site changed while you were editing. Reload the page and try again.';
  if (e.message === 'Failed to fetch') return 'No connection to GitHub right now.';
  return e.message || 'Something went wrong.';
};
const same = f => f.text === (f.base != null ? f.base : f.orig);
function dirtyPaths() { return [...files].filter(([p, f]) => f.b64 != null || (f.text != null && !same(f))).map(([p]) => p); }
function refreshDirty() {
  if (page && fdoc) { const f = files.get(page.path); if (f) f.text = serialize(fdoc); }
  const d = dirtyPaths();
  $('#save').disabled = !d.length;
  $$('#pages button').forEach(b => b.classList.toggle('dirty', d.includes(b.dataset.path)));
  status(d.length ? (d.length === 1 ? 'One change to save' : d.length + ' changes to save') : 'Everything is saved');
  $('#undo').disabled = !snaps.length;
  placeBars();
}
window.addEventListener('beforeunload', e => { if (dirtyPaths().length) { e.preventDefault(); e.returnValue = ''; } });

/* a text file: edited copy if we have one, else from GitHub, else from the site itself (no key) */
async function source(path, siteRel) {
  if (files.has(path) && files.get(path).text != null) return files.get(path).text;
  let text = null;
  if (gh) { const r = await gh.getText(path); if (r) text = r.text; }
  if (text == null) { const res = await fetch(new URL(siteRel, SITE), { cache: 'no-store' }); if (!res.ok) throw new Error('Cannot load ' + siteRel); text = await res.text(); }
  files.set(path, { orig: text, text });
  return text;
}
async function listFolder(path, siteRel) {
  if (gh) return gh.listDir(path);
  try { const res = await fetch(new URL(siteRel, SITE)); const html = await res.text(); return [...html.matchAll(/href="([^"?/]+)"/g)].map(m => decodeURIComponent(m[1])); } catch (e) { return []; }
}

/* ---------- sign in ---------- */
async function connect() {
  if (!token) { gh = null; return false; }
  gh = new GH(Object.assign({ token }, cfg));
  try { await gh.whoami(); await gh.checkRepo(); return true; }
  catch (e) { gh = null; throw e; }
}
async function boot() {
  $('#cfg-owner').value = cfg.owner; $('#cfg-repo').value = cfg.repo; $('#cfg-branch').value = cfg.branch; $('#cfg-folder').value = cfg.folder;
  let ok = false;
  try { ok = await connect(); } catch (e) { toast(friendly(e), 6000); }
  if (ok) openApp(); else { $('#gate').hidden = false; }
}
$('#signin').addEventListener('submit', async e => {
  e.preventDefault();
  const err = $('#signin-err'); err.hidden = true;
  cfg = { owner: $('#cfg-owner').value.trim() || DEF.owner, repo: $('#cfg-repo').value.trim() || DEF.repo, branch: $('#cfg-branch').value.trim() || DEF.branch, folder: $('#cfg-folder').value.trim() };
  localStorage.setItem('bf-admin-cfg', JSON.stringify(cfg));
  token = $('#token').value.trim();
  try { await connect(); localStorage.setItem('bf-admin-token', token); $('#gate').hidden = true; openApp(); }
  catch (e2) { err.textContent = friendly(e2); err.hidden = false; }
});
$('#try').onclick = () => { $('#gate').hidden = true; openApp(); };
$('#signout').onclick = () => { localStorage.removeItem('bf-admin-token'); location.reload(); };
$('#s-save').onclick = () => {
  cfg = { owner: $('#s-owner').value.trim(), repo: $('#s-repo').value.trim(), branch: $('#s-branch').value.trim(), folder: $('#s-folder').value.trim() };
  localStorage.setItem('bf-admin-cfg', JSON.stringify(cfg)); location.reload();
};

/* ---------- the editor ---------- */
function openApp() {
  $('#app').hidden = false;
  $('#s-owner').value = cfg.owner; $('#s-repo').value = cfg.repo; $('#s-branch').value = cfg.branch; $('#s-folder').value = cfg.folder;
  renderPages();
  $$('.tool').forEach(b => b.onclick = () => showView(b.dataset.view));
  $$('.sz').forEach(b => b.onclick = () => { $$('.sz').forEach(x => x.classList.toggle('on', x === b)); $('#frame').classList.toggle('phone', !!b.dataset.w); setTimeout(placeBars, 50); });
  if (!gh) toast('No key: you can try the editor, but nothing can be saved.', 6000);
  openPage('');
}
function renderPages() {
  const nav = $('#pages'); nav.innerHTML = '';
  PAGES.forEach(([slug, name]) => {
    const b = document.createElement('button'); b.textContent = name; b.dataset.slug = slug; b.dataset.path = pagePath(slug);
    b.onclick = () => openPage(slug); nav.appendChild(b);
  });
}
function showView(v) {
  $$('.view').forEach(x => x.hidden = x.id !== 'view-' + v);
  $$('.tool').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  $$('#pages button').forEach(b => b.classList.remove('on'));
  $('#crumb').textContent = { style: 'Colours, fonts & sizes', details: 'Site details', history: 'History', settings: 'Settings' }[v];
  $('#panel').style.visibility = 'hidden';
  if (v === 'style') loadStyle(); if (v === 'history') loadHistory(); if (v === 'details') loadDetails();
}
async function openPage(slug) {
  if (page && fdoc) { const f = files.get(page.path); if (f) f.text = serialize(fdoc); }
  $$('.view').forEach(x => x.hidden = true); $$('.tool').forEach(b => b.classList.remove('on'));
  $('#panel').style.visibility = '';
  $$('#pages button').forEach(b => b.classList.toggle('on', b.dataset.slug === slug));
  const rel = (slug ? slug + '/' : '') + 'index.html';
  page = { slug, path: pagePath(slug), url: new URL(slug ? slug + '/' : '', SITE).href };
  $('#crumb').textContent = (PAGES.find(p => p[0] === slug) || [, slug])[1];
  status('Loading…'); select(null); snaps.length = 0;
  let text;
  try { text = await source(page.path, rel); }
  catch (e) {
    if (!BASE_PAGES.some(b => b[0] === slug)) { PAGES = PAGES.filter(p => p[0] !== slug); localStorage.setItem('bf-admin-pages', JSON.stringify(PAGES.filter(p => !BASE_PAGES.some(b => b[0] === p[0])))); renderPages(); toast('That page was never saved, so it is gone from the list.', 5000); return openPage(''); }
    status(friendly(e)); return;
  }
  const frame = $('#frame');
  frame.onload = () => {
    fdoc = frame.contentDocument; prepare(fdoc);
    /* a photo uploaded earlier this session, not yet saved: show it from memory */
    fdoc.querySelectorAll('img').forEach(i => { const s = i.getAttribute('src') || ''; const u = blobURLs.get(rp('images/' + s.slice(s.lastIndexOf('/') + 1))); if (u && !s.startsWith('blob:')) { i.dataset.bfFinal = s; i.setAttribute('src', u); } });
    const f = files.get(page.path);
    if (f && f.base == null) { if (f.text === f.orig) { f.base = serialize(fdoc); f.text = f.base; } else f.base = norm(f.orig); }
    refreshDirty();
  };
  frame.srcdoc = text.replace(/<head>/i, '<head><base href="' + page.url + '" data-bf>');
}

/* what the frame needs so a script-free page looks finished and can be edited */
function prepare(doc) {
  const st = doc.createElement('style'); st.id = 'bf-style';
  st.textContent = `
    .rv,#ih,.split,.intro h2{opacity:1!important;transform:none!important}
    .intro h2 .rule{width:2.3em!important}
    .intro h2 .w::before{content:attr(data-w)}
    .intro h2 .w{outline:1px dashed rgba(175,15,0,.5);outline-offset:3px;cursor:pointer}
    .hero h1 span b{animation:none!important;transform:none!important}
    .split .md img{transform:none!important}
    .vf-wait{display:none}
    [data-bf-edit]{outline:1px dashed rgba(175,15,0,.45);outline-offset:2px;cursor:text;min-width:1ch}
    [data-bf-edit]:hover{outline-color:#AF0F00}
    [data-bf-edit]:focus{outline:2px solid #AF0F00;background:rgba(175,15,0,.06)}
    img{cursor:pointer}
    .bf-sel{outline:3px solid #AF0F00!important;outline-offset:-3px}
    .bf-blk{outline:2px solid #AF0F00!important;outline-offset:4px}
    .bf-sec{outline:2px dashed rgba(108,6,0,.8)!important;outline-offset:-2px}
    .bf-drag{opacity:.45}
    .lift{display:none!important}
    html{scroll-behavior:auto}
    .bf-bar{position:absolute;z-index:2147483000;display:flex;align-items:stretch;background:#AF0F00;color:#F1EEE6;font:12px/1 system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.25);user-select:none}
    .bf-bar.sec{background:#6C0600}
    .bf-bar span{padding:7px 10px;border-right:1px solid rgba(255,255,255,.25);letter-spacing:.04em;text-transform:uppercase;font-weight:700}
    .bf-bar b{padding:7px 10px;cursor:grab;border-right:1px solid rgba(255,255,255,.25);font-size:15px;line-height:12px}
    .bf-bar b:active{cursor:grabbing}
    .bf-bar button{all:unset;padding:7px 10px;cursor:pointer;border-right:1px solid rgba(255,255,255,.25);font:inherit}
    .bf-bar button:last-child{border-right:0}
    .bf-bar button:hover{background:rgba(255,255,255,.18)}`;
  doc.head.appendChild(st);
  applyTheme(doc);
  mark(doc);
  doc.addEventListener('click', e => {
    const t = e.target;
    if (t.closest && t.closest('[data-bf-ui]')) return;
    e.preventDefault();
    const img = t.closest && t.closest('img');
    if (img) return selectImage(img);
    const w = t.closest && t.closest('[data-w]');
    if (w) return selectWords(w);
    const ed = t.closest && t.closest('[data-bf-edit]');
    if (ed) return selectText(ed);
    const sec = t.closest && t.closest('section,footer');
    select(sec ? { el: sec, kind: 'Section', show: ['section'], block: null, section: sec } : null);
  }, true);
  doc.addEventListener('input', e => { const ed = e.target.closest && e.target.closest('[data-bf-edit]'); if (ed) keepParts(ed); refreshDirty(); });
  doc.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('[data-bf-edit]')) {
      if (e.key === 'Enter') { e.preventDefault(); if (e.shiftKey) doc.execCommand('insertLineBreak'); }
      if (e.key === 'Escape') { e.target.blur(); select(null); }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undoChange(); }
  });
  doc.addEventListener('paste', e => { e.preventDefault(); doc.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
  doc.addEventListener('drop', e => e.preventDefault());
  doc.defaultView.addEventListener('scroll', placeBars, { passive: true });
  doc.defaultView.addEventListener('resize', placeBars);
  $('#p-title').value = doc.title;
  const d = doc.querySelector('meta[name="description"]'); $('#p-desc').value = d ? d.content : '';
}
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEMPLATE', 'svg', 'SVG', 'INPUT', 'TEXTAREA', 'SELECT']);
function mark(doc) {
  (function walk(el) {
    if (SKIP.has(el.tagName) || el.namespaceURI !== 'http://www.w3.org/1999/xhtml' || el.hasAttribute('data-bf-ui')) return;
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
    if (hasText && el !== doc.body) {
      el.setAttribute('data-bf-edit', ''); el.setAttribute('contenteditable', 'true'); el.setAttribute('spellcheck', 'false');
      [...el.children].forEach(c => { if (!c.textContent.trim()) c.setAttribute('contenteditable', 'false'); });
      return;
    }
    [...el.children].forEach(walk);
  })(doc.body);
}
function unmark(doc) {
  doc.querySelectorAll('[data-bf-edit]').forEach(e => { e.removeAttribute('data-bf-edit'); e.removeAttribute('contenteditable'); e.removeAttribute('spellcheck'); });
  doc.querySelectorAll('[contenteditable]').forEach(e => e.removeAttribute('contenteditable'));
  doc.querySelectorAll('.bf-sel,.bf-blk,.bf-sec,.bf-drag').forEach(e => { e.classList.remove('bf-sel', 'bf-blk', 'bf-sec', 'bf-drag'); if (!e.getAttribute('class')) e.removeAttribute('class'); });
}
function keepParts(el) { if (el._parts) el._parts.forEach(p => { if (!el.querySelector(p.sel)) el.appendChild(p.node.cloneNode(true)); }); }
function remember(el) {
  if (el._parts) return;
  el._parts = [...el.children].filter(c => !c.textContent.trim()).map(c => ({ sel: c.className ? '.' + [...c.classList].join('.') : c.tagName, node: c.cloneNode(true) }));
}

/* a file as the browser would write it back, so untouched pages never look changed */
const norm = t => '<!doctype html>\n' + new DOMParser().parseFromString(t, 'text/html').documentElement.outerHTML + '\n';
/* the page as a file again: our editing marks removed, pending photos pointing at their final names */
function serialize(doc) {
  const base = doc.querySelector('base[data-bf]'); const st = doc.getElementById('bf-style'); const th = doc.getElementById('bf-theme');
  const ui = [...doc.querySelectorAll('[data-bf-ui]')]; ui.forEach(e => e.remove());
  if (base) base.remove(); if (st) st.remove(); if (th) th.remove();
  unmark(doc);
  const swaps = [...doc.querySelectorAll('img[data-bf-final]')].map(i => { const b = i.getAttribute('src'); i.setAttribute('src', i.dataset.bfFinal); i.removeAttribute('data-bf-final'); return [i, b, i.getAttribute('src')]; });
  doc.querySelectorAll('[style=""]').forEach(e => e.removeAttribute('style'));
  const out = '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
  swaps.forEach(([i, b, f]) => { i.setAttribute('src', b); i.dataset.bfFinal = f; });
  if (base) doc.head.prepend(base); if (st) doc.head.appendChild(st); if (th) doc.head.appendChild(th);
  ui.forEach(e => doc.body.appendChild(e));
  mark(doc);
  if (selected) { if (selected.el) selected.el.classList.add('bf-sel'); if (selected.block) selected.block.classList.add('bf-blk'); if (selected.section) selected.section.classList.add('bf-sec'); }
  return out;
}

/* ---------- selection and the side panel ---------- */
const LABELS = [['.hero .slide', 'Slide'], ['.rail button', 'Thumbnail'], ['.row', 'Line'], ['.card', 'Card'], ['.it', 'Item'], ['.tile', 'Tile'], ['li', 'List item'], ['.col > a', 'Link'], ['.col', 'Column'], ['.s', 'Panel'], ['.q', 'Question']];
const BLOCKY = new Set(['DIV', 'LI', 'ARTICLE', 'FIGURE', 'BUTTON', 'P', 'H2', 'H3', 'H4', 'UL', 'OL', 'BLOCKQUOTE', 'TR']);
const cls = e => e.className.replace(/\bbf-\w+/g, '').replace(/\bon\b/g, '').trim();
/* the smallest repeating unit around an element: something with a twin beside it */
function blockOf(el) {
  for (let e = el; e && e.tagName !== 'BODY' && e.tagName !== 'SECTION' && e.tagName !== 'FOOTER'; e = e.parentElement) {
    if (e.hasAttribute('data-bf-ui')) return null;
    if (!BLOCKY.has(e.tagName) && !e.matches('.col > a')) continue;   /* words inside a line are not a thing to move */
    const twins = [...e.parentElement.children].filter(c => c !== e && c.tagName === e.tagName && cls(c) === cls(e) && !c.hasAttribute('data-bf-ui'));
    if (twins.length) return e;
  }
  return null;
}
const labelOf = el => (LABELS.find(([s]) => el.matches(s)) || [, el.tagName === 'A' ? 'Link' : 'Item'])[1];
function select(sel) {
  if (selected) {
    [selected.el, selected.block, selected.section].forEach(e => { if (e) { e.classList.remove('bf-sel', 'bf-blk', 'bf-sec'); if (!e.getAttribute('class')) e.removeAttribute('class'); } });
  }
  selected = sel;
  $('#sel').hidden = !sel;
  ['text', 'link', 'words', 'img', 'size', 'section', 'block'].forEach(k => $('#sel-' + k).hidden = !sel || !sel.show.includes(k));
  if (!sel) { placeBars(); return; }
  if (sel.el && sel.el.tagName !== 'SECTION' && sel.el.tagName !== 'FOOTER') {
    sel.block = blockOf(sel.el); sel.section = sel.el.closest('section,footer');
    if (sel.block) { sel.show.push('block'); $('#blk-name').textContent = labelOf(sel.block); $('#sel-block').hidden = false; }
    if (sel.section) { sel.show.push('section'); $('#sel-section').hidden = false; }
  }
  if (sel.el) sel.el.classList.add('bf-sel');
  if (sel.block) sel.block.classList.add('bf-blk');
  if (sel.section) { sel.section.classList.add('bf-sec'); fillSection(sel.section); }
  $('#sel-kind').textContent = sel.kind;
  placeBars();
}
function selectText(el) {
  remember(el);
  const a = el.closest('a');
  select({ el, kind: a ? 'Words and a link' : 'Words', show: a ? ['text', 'link', 'size'] : ['text', 'size'], a });
  if (a) $('#l-href').value = a.getAttribute('href') || '';
  $('#sz-now').textContent = sizeLabel(el);
}
$('#l-href').addEventListener('input', () => { if (selected && selected.a) { selected.a.setAttribute('href', $('#l-href').value); refreshDirty(); } });
function selectWords(w) {
  select({ el: w, kind: 'Big words', show: ['words'] });
  $('#w-text').value = w.dataset.w; $('#w-text').focus();
}
$('#w-text').addEventListener('input', () => { if (selected && selected.show.includes('words')) { selected.el.dataset.w = $('#w-text').value; refreshDirty(); } });
$('#p-title').addEventListener('input', () => {
  if (!fdoc) return; const v = $('#p-title').value; fdoc.title = v;
  ['meta[property="og:title"]', 'meta[name="twitter:title"]'].forEach(s => { const m = fdoc.querySelector(s); if (m) m.setAttribute('content', v); });
  refreshDirty();
});
$('#p-desc').addEventListener('input', () => {
  if (!fdoc) return; const v = $('#p-desc').value;
  ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].forEach(s => { const m = fdoc.querySelector(s); if (m) m.setAttribute('content', v); });
  refreshDirty();
});
/* italic and links inside the words */
$('#t-italic').onclick = () => { if (fdoc) { fdoc.execCommand('italic'); refreshDirty(); } };
$('#t-link').onclick = () => {
  if (!fdoc) return; const sel = fdoc.getSelection(); if (!sel || sel.isCollapsed) { toast('Select the words first, then press Link.'); return; }
  const url = prompt('Where should these words link to? (a page like /bookings/ or a full web address)'); if (!url) return;
  fdoc.execCommand('createLink', false, url); refreshDirty();
};
$('#t-unlink').onclick = () => { if (fdoc) { fdoc.execCommand('unlink'); refreshDirty(); } };

/* bigger and smaller: a font-size on the element itself, in steps */
const sizeOf = el => parseFloat(el.style.fontSize) || 1;
const sizeLabel = el => { const s = sizeOf(el); return s === 1 ? 'Normal' : Math.round(s * 100) + '%'; };
function resize(dir) {
  if (!selected || !selected.el) return; const el = selected.el;
  const i = SIZES.indexOf(sizeOf(el)); const n = dir === 0 ? 2 : Math.max(0, Math.min(SIZES.length - 1, (i < 0 ? 2 : i) + dir));
  el.style.fontSize = SIZES[n] === 1 ? '' : SIZES[n] + 'em'; if (!el.getAttribute('style')) el.removeAttribute('style');
  $('#sz-now').textContent = sizeLabel(el); refreshDirty();
}
$('#sz-down').onclick = () => resize(-1); $('#sz-up').onclick = () => resize(1); $('#sz-reset').onclick = () => resize(0);

/* ---------- sections: light or dark, spacing ---------- */
function fillSection(sec) {
  const tone = sec.classList.contains('dark') ? 'dark' : 'light';
  $('#sec-tone').textContent = tone === 'dark' ? 'Make it light' : 'Make it dark';
  $('#sec-tone').hidden = !sec.matches('.split,.facts,.sheet,.quote,.intro,.hb,.unl,.steps,.faq,.letter,.enq');
  const pad = sec.style.paddingTop; $$('#sec-space button').forEach(b => b.classList.toggle('on', SPACES[b.dataset.sp] === pad));
}
$('#sec-tone').onclick = () => {
  if (!selected || !selected.section) return; snap(); const s = selected.section;
  if (s.classList.contains('dark')) { s.classList.remove('dark'); if (s.matches('.split')) s.classList.add('light'); }
  else { s.classList.remove('light'); s.classList.add('dark'); }
  fillSection(s); refreshDirty();
};
$$('#sec-space button').forEach(b => b.onclick = () => {
  if (!selected || !selected.section) return; snap(); const s = selected.section, v = SPACES[b.dataset.sp];
  s.style.paddingTop = v; s.style.paddingBottom = v; if (!s.getAttribute('style')) s.removeAttribute('style');
  fillSection(s); refreshDirty();
});

/* ---------- items and sections: move, duplicate, delete, drag ---------- */
function snap() { if (!fdoc) return; const ui = [...fdoc.querySelectorAll('[data-bf-ui]')]; ui.forEach(e => e.remove()); snaps.push(fdoc.body.innerHTML); ui.forEach(e => fdoc.body.appendChild(e)); if (snaps.length > 40) snaps.shift(); $('#undo').disabled = false; }
function undoChange() {
  if (!snaps.length || !fdoc) return;
  const ui = [...fdoc.querySelectorAll('[data-bf-ui]')]; ui.forEach(e => e.remove()); selected = null;
  fdoc.body.innerHTML = snaps.pop(); ui.forEach(e => fdoc.body.appendChild(e)); select(null); mark(fdoc); refreshDirty(); toast('Undone');
}
$('#undo').onclick = undoChange;
/* a hero slide and its thumbnail travel together */
function twin(el) {
  const doc = el.ownerDocument;
  if (el.matches('.hero .slide')) { const i = [...doc.querySelectorAll('.hero .slide')].indexOf(el); return doc.querySelectorAll('.rail button')[i] || null; }
  if (el.matches('.rail button')) { const i = [...doc.querySelectorAll('.rail button')].indexOf(el); return doc.querySelectorAll('.hero .slide')[i] || null; }
  return null;
}
function siblingsOf(el) { const secs = el.matches('section,footer'); return [...el.parentElement.children].filter(c => c.tagName === el.tagName && !c.hasAttribute('data-bf-ui') && (secs || cls(c) === cls(el))); }
function act(el, op) {
  if (!el) return; snap();
  const both = [el, twin(el)].filter(Boolean);
  both.forEach(e => {
    const sib = siblingsOf(e), i = sib.indexOf(e);
    if (op === 'up' && i > 0) sib[i - 1].before(e);
    if (op === 'down' && i < sib.length - 1) sib[i + 1].after(e);
    if (op === 'dup') { const c = e.cloneNode(true); c.classList.remove('bf-sel', 'bf-blk', 'bf-sec', 'on'); if (!c.getAttribute('class')) c.removeAttribute('class'); e.after(c); mark(e.ownerDocument); }
    if (op === 'del') { if (sib.length < 2 && !e.matches('section,footer')) { toast('That is the last one, so it stays.'); return; } e.remove(); }
  });
  if (op === 'del') select(null);
  refreshDirty();
}
['up', 'down', 'dup', 'del'].forEach(op => { $('#blk-' + op).onclick = () => act(selected && selected.block, op); $('#sec-' + op).onclick = () => act(selected && selected.section, op); });

/* floating bars in the frame, with a grab handle to drag an item or a section to a new place */
function bar(kind) {
  const doc = fdoc; let b = doc.querySelector('.bf-bar.' + kind);
  if (b) return b;
  b = doc.createElement('div'); b.className = 'bf-bar ' + kind; b.setAttribute('data-bf-ui', '');
  b.innerHTML = '<b title="Drag to move">⠿</b><span></span><button data-op="up" title="Move up">▲</button><button data-op="down" title="Move down">▼</button><button data-op="dup" title="Make a copy">Copy</button><button data-op="del" title="Remove">Remove</button>';
  b.querySelectorAll('button').forEach(x => x.onclick = e => { e.preventDefault(); act(kind === 'sec' ? selected.section : selected.block, x.dataset.op); });
  b.querySelector('b').addEventListener('pointerdown', e => startDrag(e, kind === 'sec' ? selected.section : selected.block));
  doc.body.appendChild(b); return b;
}
function placeBars() {
  if (!fdoc) return;
  const put = (kind, el) => {
    const b = bar(kind);
    if (!el || !el.isConnected) { b.style.display = 'none'; return; }
    const r = el.getBoundingClientRect(), w = fdoc.defaultView;
    b.querySelector('span').textContent = kind === 'sec' ? 'Section' : labelOf(el);
    b.style.display = 'flex'; b.style.left = Math.max(4, r.left + w.scrollX + (kind === 'sec' ? 4 : 0)) + 'px';
    b.style.top = Math.max(4, r.top + w.scrollY - (kind === 'sec' ? -4 : 30)) + 'px';
  };
  put('blk', selected && selected.block); put('sec', selected && selected.section);
}
function startDrag(e, el) {
  if (!el) return; e.preventDefault();
  const doc = fdoc, w = doc.defaultView, sib = () => siblingsOf(el);
  if (sib().length < 2) { toast('Nothing to swap it with here.'); return; }
  snap(); el.classList.add('bf-drag'); const t = twin(el); if (t) t.classList.add('bf-drag');
  const move = ev => {
    const list = sib(), y = ev.clientY, x = ev.clientX;
    let target = null, after = false;
    for (const s of list) {
      if (s === el) continue; const r = s.getBoundingClientRect();
      const horizontal = r.height < 200 && list.length > 1 && Math.abs(list[0].getBoundingClientRect().top - list[list.length - 1].getBoundingClientRect().top) < 20;
      if (horizontal ? (x > r.left && x < r.right) : (y > r.top && y < r.bottom)) { target = s; after = horizontal ? x > r.left + r.width / 2 : y > r.top + r.height / 2; break; }
    }
    if (!target) return;
    if (after) target.after(el); else target.before(el);
    const tw = twin(target), me = twin(el); if (tw && me) { if (after) tw.after(me); else tw.before(me); }
    if (y < 60) w.scrollBy(0, -12); else if (y > w.innerHeight - 60) w.scrollBy(0, 12);
    placeBars();
  };
  const up = () => { doc.removeEventListener('pointermove', move); doc.removeEventListener('pointerup', up); el.classList.remove('bf-drag'); if (t) t.classList.remove('bf-drag'); refreshDirty(); };
  doc.addEventListener('pointermove', move); doc.addEventListener('pointerup', up);
}

/* ---------- photographs ---------- */
function selectImage(img) {
  select({ el: img, kind: 'Photograph', show: ['img'] });
  $('#i-thumb').src = img.currentSrc || img.src; $('#i-alt').value = img.getAttribute('alt') || '';
  $$('#i-focus button').forEach(b => b.classList.toggle('on', (img.style.objectPosition || 'center') === b.dataset.pos));
}
$('#i-alt').addEventListener('input', () => { if (selected && selected.el.tagName === 'IMG') { selected.el.setAttribute('alt', $('#i-alt').value); mirror(selected.el); refreshDirty(); } });
$$('#i-focus button').forEach(b => b.onclick = () => {
  if (!selected || selected.el.tagName !== 'IMG') return; const img = selected.el;
  img.style.objectPosition = b.dataset.pos === 'center' ? '' : b.dataset.pos; if (!img.getAttribute('style')) img.removeAttribute('style');
  selectImage(img); refreshDirty();
});
const imgPrefix = img => { const s = img.getAttribute('src') || '../images/x.jpg'; const final = img.dataset.bfFinal || s; return final.slice(0, final.lastIndexOf('/') + 1); };
function mirror(img) {
  const holder = img.closest('.hero .slide, .rail button'); if (!holder) return;
  const other = twin(holder); if (!other) return; const o = other.querySelector('img'); if (!o) return;
  ['src', 'alt', 'data-bf-final'].forEach(a => { if (img.hasAttribute(a)) o.setAttribute(a, img.getAttribute(a)); else o.removeAttribute(a); });
  o.removeAttribute('srcset'); o.removeAttribute('sizes');
}
const BANNED = ['bar-bartender.jpg', 'chef-open-kitchen.jpg'];   /* the owner's call: never used again */
const isImage = n => /\.(jpe?g|png|webp|gif)$/i.test(n) && !/-(480|800)w\./.test(n);
async function library() {
  if (imagesList) return imagesList;
  imagesList = (await listFolder(rp('images'), 'images/')).filter(isImage).filter(n => !BANNED.includes(n)).sort();
  return imagesList;
}
$('#i-pick').onclick = async () => {
  const grid = $('#lib-grid'); grid.innerHTML = '<p class="hint" style="padding:20px">Loading the photographs…</p>';
  $('#lib').hidden = false;
  const names = await library();
  grid.innerHTML = '';
  names.forEach(n => {
    const b = document.createElement('button');
    const i = document.createElement('img'); i.loading = 'lazy'; i.alt = '';
    const pending = blobURLs.get(rp('images/' + n));
    i.src = pending || new URL('images/' + n.replace(/\.(\w+)$/, '-480w.$1'), SITE).href;
    i.onerror = () => { i.onerror = null; i.src = new URL('images/' + n, SITE).href; };
    const s = document.createElement('span'); s.textContent = n;
    b.append(i, s); b.onclick = () => usePhoto(n); grid.appendChild(b);
  });
};
$('#lib-close').onclick = () => $('#lib').hidden = true;
function usePhoto(name) {
  $('#lib').hidden = true;
  if (!selected || selected.el.tagName !== 'IMG') return;
  const img = selected.el, path = rp('images/' + name), pending = blobURLs.get(path), pre = imgPrefix(img);
  if (pending) { img.setAttribute('src', pending); img.dataset.bfFinal = pre + name; }
  else { img.removeAttribute('data-bf-final'); img.setAttribute('src', pre + name); }
  img.removeAttribute('srcset'); img.removeAttribute('sizes');
  if (!img.getAttribute('alt')) { img.setAttribute('alt', name.replace(/\.\w+$/, '').replace(/[-_]+/g, ' ')); $('#i-alt').value = img.getAttribute('alt'); }
  mirror(img); $('#i-thumb').src = img.src; refreshDirty();
}
$('#i-upload').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f || !selected || selected.el.tagName !== 'IMG') return;
  status('Preparing the photo…');
  try {
    const { blob, b64 } = await shrink(f, 1400, 0.82);
    const names = await library();
    let stem = f.name.replace(/\.\w+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'photo';
    let name = stem + '.jpg', n = 2; while (names.includes(name) || files.has(rp('images/' + name))) name = stem + '-' + (n++) + '.jpg';
    const path = rp('images/' + name), url = URL.createObjectURL(blob);
    files.set(path, { b64, label: 'New photo ' + name }); blobURLs.set(path, url); names.push(name); names.sort();
    const img = selected.el, pre = imgPrefix(img); img.setAttribute('src', url); img.dataset.bfFinal = pre + name; img.removeAttribute('srcset'); img.removeAttribute('sizes');
    mirror(img); $('#i-thumb').src = url; refreshDirty();
  } catch (err) { toast('That file could not be read as a photo.'); refreshDirty(); }
  e.target.value = '';
});
async function shrink(file, max, q) {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', q));
  return { blob, b64: await toB64(blob) };
}
const toB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });

/* ---------- colours, fonts, sizes and spacing (the whole site) ---------- */
const CSS_PATH = () => rp('static/savoy.css');
async function loadCSS() { if (!css) { await source(CSS_PATH(), 'static/savoy.css'); css = files.get(CSS_PATH()); } return css; }
const tok = (text, name) => (text.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{6})')) || [])[1];
const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
function setTokens(ink, paper, accent) {
  let t = css.text;
  const oldInk = tok(t, 'dark'), oldPaper = tok(t, 'ivory'), oldAccent = tok(t, 'accent');
  if (oldInk && oldInk.toLowerCase() !== ink.toLowerCase()) t = t.split(new RegExp(oldInk, 'ig')).join(ink).split('rgba(' + hexToRgb(oldInk) + ',').join('rgba(' + hexToRgb(ink) + ',');
  if (oldPaper && oldPaper.toLowerCase() !== paper.toLowerCase()) t = t.split(new RegExp(oldPaper, 'ig')).join(paper).split('rgba(' + hexToRgb(oldPaper) + ',').join('rgba(' + hexToRgb(paper) + ',');
  if (oldAccent && oldAccent.toLowerCase() !== accent.toLowerCase()) t = t.split(new RegExp(oldAccent, 'ig')).join(accent);
  css.text = t;
}
/* fonts: a local file swaps the @font-face source; a Google font changes the family token and adds an import */
const FONT_RE = { display: /(@font-face\{font-family:"VTC Marsha";src:url\(")([^"]+)("\)\s*format\(")([^"]+)("\))/g,
  body: /(@font-face\{font-family:"Affairs";src:url\(")([^"]+)("\)\s*format\(")([^"]+)("\)[^}]*font-style:normal)/g,
  italic: /(@font-face\{font-family:"Affairs";src:url\(")([^"]+)("\)\s*format\(")([^"]+)("\)[^}]*font-style:italic)/g };
const fmt = n => ({ otf: 'opentype', ttf: 'truetype', woff: 'woff', woff2: 'woff2' })[n.split('.').pop().toLowerCase()] || 'opentype';
const famRe = k => new RegExp('(--' + (k === 'display' ? 'display' : 'body') + ':)"([^"]+)"', '');
function currentFont(kind) {
  const fam = (css.text.match(famRe(kind)) || [])[2];
  if (kind !== 'italic' && fam && fam !== LOCAL_FONTS[kind]) return 'google:' + fam;
  const m = FONT_RE[kind].exec(css.text); FONT_RE[kind].lastIndex = 0; return m ? m[2].replace(/^fonts\//, '') : '';
}
function setFont(kind, value) {
  let t = css.text;
  if (value.startsWith('google:')) {
    const fam = value.slice(7); t = t.replace(famRe(kind), '$1"' + fam + '"'); t = withImports(t);
  } else {
    if (kind !== 'italic') t = t.replace(famRe(kind), '$1"' + LOCAL_FONTS[kind] + '"');
    t = t.replace(FONT_RE[kind], (m, a, old, b, oldf, c) => a + 'fonts/' + value + b + fmt(value) + c); t = withImports(t);
  }
  css.text = t;
}
/* one @import line at the top for whichever Google fonts are in use */
function withImports(t) {
  t = t.replace(/^@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);\n?/m, '');
  const fams = ['display', 'body'].map(k => (t.match(famRe(k)) || [])[2]).filter(f => f && !Object.values(LOCAL_FONTS).includes(f));
  if (!fams.length) return t;
  const q = fams.map(f => 'family=' + f.replace(/ /g, '+') + ':ital,wght@0,400;0,700;1,400;1,700').join('&');
  return '@import url("https://fonts.googleapis.com/css2?' + q + '&display=swap");\n' + t;
}
/* sizes and spacing live in one block at the end of the stylesheet that only the editor writes */
const ED_RE = /\n?\/\* ==== editor ==== \*\/[\s\S]*$/;
function edVals() { const m = css.text.match(/--ed-head:([\d.]+);--ed-text:([\d.]+);--ed-space:([\d.]+)/); return m ? { head: +m[1], text: +m[2], space: +m[3] } : { head: 1, text: 1, space: 1 }; }
function setEd(v) {
  let t = css.text.replace(ED_RE, '');
  if (v.head !== 1 || v.text !== 1 || v.space !== 1) t += `\n/* ==== editor ==== */\n:root{--ed-head:${v.head};--ed-text:${v.text};--ed-space:${v.space}}\n@media(min-width:641px){.t-xs{font-size:calc(12px*var(--ed-head))}.t-sm{font-size:calc(15px*var(--ed-head))}.t-md{font-size:calc(22px*var(--ed-head))}.t-ui{font-size:calc(17px*var(--ed-head))}.t-h1{font-size:calc(clamp(26px,2.35vw,40px)*var(--ed-head))}.t-giant{font-size:calc(clamp(40px,7.4vw,124px)*var(--ed-head))}.t-body{font-size:calc(21px*var(--ed-text))}.intro,.hb,.unl,.quote,.sheet,.steps,.faq,.letter{padding-top:calc(102.75px*var(--ed-space));padding-bottom:calc(102.75px*var(--ed-space))}.facts{padding-bottom:calc(102.75px*var(--ed-space))}.enq{padding-top:calc(96px*var(--ed-space));padding-bottom:calc(96px*var(--ed-space))}.cta{padding-top:calc(96px*var(--ed-space));padding-bottom:calc(60px*var(--ed-space))}}\n`;
  css.text = t;
}
/* the edited stylesheet, dropped into the frame so the page shows it at once */
function applyTheme(doc) {
  if (!css || same(css)) { const old = doc.getElementById('bf-theme'); if (old) old.remove(); return; }
  let t = css.text.replace(/url\((['"]?)(?!https?:|data:|\/)([^'")]+)\1\)/g, (m, q, p) => {
    const pending = blobURLs.get(rp('static/' + p)); return 'url("' + (pending || new URL(p, STATIC).href) + '")';
  });
  let el = doc.getElementById('bf-theme'); if (!el) { el = doc.createElement('style'); el.id = 'bf-theme'; doc.head.appendChild(el); }
  el.textContent = t;
}
function fontOptions(sel, withGoogle) {
  sel.innerHTML = '';
  const g1 = document.createElement('optgroup'); g1.label = 'Your font files';
  fontsList.forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n.replace(/\.\w+$/, ''); g1.appendChild(o); });
  sel.appendChild(g1);
  if (withGoogle) { const g2 = document.createElement('optgroup'); g2.label = 'Google fonts'; GOOGLE_FONTS.forEach(f => { const o = document.createElement('option'); o.value = 'google:' + f; o.textContent = f; g2.appendChild(o); }); sel.appendChild(g2); }
}
async function loadStyle() {
  status('Loading the stylesheet…');
  try { await loadCSS(); } catch (e) { status(friendly(e)); return; }
  $('#c-ink').value = tok(css.text, 'dark'); $('#c-paper').value = tok(css.text, 'ivory'); $('#c-accent').value = tok(css.text, 'accent');
  if (!fontsList) fontsList = (await listFolder(rp('static/fonts'), 'static/fonts/')).filter(n => /\.(otf|ttf|woff2?)$/i.test(n));
  fontOptions($('#f-display'), true); fontOptions($('#f-body'), true); fontOptions($('#f-italic'), false);
  ['display', 'body', 'italic'].forEach(k => $('#f-' + k).value = currentFont(k));
  $('#f-italic').closest('label').hidden = currentFont('body').startsWith('google:');
  const v = edVals(); $('#z-head').value = v.head; $('#z-text').value = v.text; $('#z-space').value = v.space; showZ();
  refreshDirty();
}
function showZ() { ['head', 'text', 'space'].forEach(k => $('#z-' + k + '-v').textContent = Math.round($('#z-' + k).value * 100) + '%'); }
['ink', 'paper', 'accent'].forEach(k => $('#c-' + k).addEventListener('input', () => { setTokens($('#c-ink').value, $('#c-paper').value, $('#c-accent').value); if (fdoc) applyTheme(fdoc); refreshDirty(); }));
$('#c-reset').onclick = () => { $('#c-ink').value = BRAND.ink; $('#c-paper').value = BRAND.paper; $('#c-accent').value = BRAND.accent; setTokens(BRAND.ink, BRAND.paper, BRAND.accent); if (fdoc) applyTheme(fdoc); refreshDirty(); };
['display', 'body', 'italic'].forEach(k => $('#f-' + k).addEventListener('change', () => {
  setFont(k, $('#f-' + k).value); $('#f-italic').closest('label').hidden = currentFont('body').startsWith('google:');
  if (fdoc) applyTheme(fdoc); refreshDirty();
}));
['head', 'text', 'space'].forEach(k => $('#z-' + k).addEventListener('input', () => { setEd({ head: +$('#z-head').value, text: +$('#z-text').value, space: +$('#z-space').value }); showZ(); if (fdoc) applyTheme(fdoc); refreshDirty(); }));
$('#z-reset').onclick = () => { ['head', 'text', 'space'].forEach(k => $('#z-' + k).value = 1); setEd({ head: 1, text: 1, space: 1 }); showZ(); if (fdoc) applyTheme(fdoc); refreshDirty(); };
$('#f-upload').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  const name = f.name.replace(/[^A-Za-z0-9._-]+/g, '-'), path = rp('static/fonts/' + name);
  files.set(path, { b64: await toB64(f), label: 'New font ' + name }); blobURLs.set(path, URL.createObjectURL(f));
  if (!fontsList.includes(name)) fontsList.push(name);
  const keep = ['display', 'body', 'italic'].map(k => $('#f-' + k).value);
  fontOptions($('#f-display'), true); fontOptions($('#f-body'), true); fontOptions($('#f-italic'), false);
  ['display', 'body', 'italic'].forEach((k, i) => $('#f-' + k).value = keep[i]);
  toast('Added. Pick it in one of the lists.'); e.target.value = ''; refreshDirty();
});

/* ---------- site details: the same facts on every page ---------- */
const DETAILS = [['phone', /0\d{2}(?:\s|&nbsp;)\d{3}(?:\s|&nbsp;)\d{4}/], ['tel', /tel:\+?[\d]+/],
  ['email', /ciao@[\w.-]+\.\w+/], ['events', /events@[\w.-]+\.\w+/],
  ['insta', /https:\/\/www\.instagram\.com\/[\w.]+\/?/], ['fb', /https:\/\/www\.facebook\.com\/[\w.]+\/?/]];
let detailsOld = null;
async function loadDetails() {
  status('Reading the site…');
  const home = await source(pagePath(''), 'index.html');
  detailsOld = {};
  DETAILS.forEach(([k, re]) => { const m = home.match(re); detailsOld[k] = m ? m[0].replace(/^tel:/, '') : ''; $('#d-' + k).value = detailsOld[k]; });
  status('');
}
$('#d-apply').onclick = async () => {
  if (!detailsOld) return;
  const repl = []; DETAILS.forEach(([k]) => { const o = detailsOld[k], n = $('#d-' + k).value.trim(); if (o && n && o !== n) repl.push([k === 'tel' ? 'tel:' + o : o, k === 'tel' ? 'tel:' + n : n]); });
  if (!repl.length) { toast('Nothing changed.'); return; }
  if (page && fdoc) { const f = files.get(page.path); if (f) f.text = serialize(fdoc); }
  let n = 0;
  for (const [slug] of PAGES) {
    const path = pagePath(slug); let t; try { t = await source(path, (slug ? slug + '/' : '') + 'index.html'); } catch (e) { continue; } const before = t;
    repl.forEach(([o, nw]) => { t = t.split(o).join(nw); t = t.split(o.replace(/ /g, '&nbsp;')).join(nw.replace(/ /g, '&nbsp;')); });
    if (t !== before) { files.get(path).text = t; n++; }
  }
  if (page) { const p = page.slug; page = null; fdoc = null; openPage(p); }
  await loadDetails(); refreshDirty(); toast('Changed on ' + n + ' page' + (n === 1 ? '' : 's') + '. Save to publish.', 5000);
};

/* ---------- a new page, copied from the open one ---------- */
$('#dup-page').onclick = async () => {
  if (!page || !fdoc) return;
  const name = prompt('What is the new page called? (for the list on the left and its title)'); if (!name) return;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug || PAGES.some(p => p[0] === slug)) { toast('That name is taken or empty.'); return; }
  const f = files.get(page.path); f.text = serialize(fdoc);
  let t = f.text;
  const oldPath = '/' + (page.slug ? page.slug + '/' : ''), newPath = '/' + slug + '/';
  t = t.split('https://www.barfranco.nz' + oldPath + '"').join('https://www.barfranco.nz' + newPath + '"');
  t = t.replace(/<title>[^<]*<\/title>/, '<title>' + name.replace(/</g, '&lt;') + ' | Bar Franco</title>');
  if (!page.slug) t = t.split('href="').join('href="../').split('src="').join('src="../').split('href="../http').join('href="http').split('src="../http').join('src="http').split('href="../#').join('href="#').split('href="../mailto').join('href="mailto').split('href="../tel').join('href="tel').split('href="..//').join('href="/').split('src="..//').join('src="/').split('src="../blob:').join('src="blob:');
  files.set(pagePath(slug), { orig: '', base: '', text: t });
  const sm = rp('sitemap.xml'); try { const s = await source(sm, 'sitemap.xml'); if (!s.includes(newPath + '</loc>')) files.get(sm).text = s.replace('</urlset>', '  <url><loc>https://www.barfranco.nz' + newPath + '</loc></url>\n</urlset>'); } catch (e) { }
  PAGES.push([slug, name]); localStorage.setItem('bf-admin-pages', JSON.stringify(PAGES.filter(p => !BASE_PAGES.some(b => b[0] === p[0]))));
  renderPages(); openPage(slug); toast('New page made. Link to it from a button or the footer so people can find it.', 7000);
};

/* ---------- save ---------- */
function describe() {
  const out = [];
  dirtyPaths().forEach(p => {
    const f = files.get(p);
    if (f.label) return out.push(f.label);
    if (p === CSS_PATH()) return out.push('Colours, fonts or sizes');
    if (p === rp('sitemap.xml')) return out.push('Sitemap');
    const pg = PAGES.find(x => pagePath(x[0]) === p);
    out.push(pg ? pg[1] + ' page' : p);
  });
  return out;
}
async function save() {
  refreshDirty();
  const list = describe(); if (!list.length) return;
  if (!gh) { toast('Sign in with your GitHub key to save.', 5000); return; }
  $('#confirm-list').innerHTML = list.map(t => '<li>' + t.replace(/</g, '&lt;') + '</li>').join('');
  $('#confirm-err').hidden = true; $('#confirm').hidden = false;
}
$('#save').onclick = save;
$('#confirm-close').onclick = $('#confirm-no').onclick = () => $('#confirm').hidden = true;
$('#confirm-go').onclick = async () => {
  const go = $('#confirm-go'); go.disabled = true; go.textContent = 'Publishing…';
  try {
    const changes = dirtyPaths().map(p => { const f = files.get(p); return f.b64 != null ? { path: p, b64: f.b64 } : { path: p, text: f.text }; });
    const label = describe().filter(t => !/^New (photo|font)/.test(t)).map(t => t.replace(/ page$/, '')); const extra = describe().length - label.length;
    const msg = 'Edit from the site: ' + (label.join(', ') || 'files') + (extra ? ' (+' + extra + ' file' + (extra > 1 ? 's' : '') + ')' : '');
    await gh.commit(msg, changes);
    dirtyPaths().forEach(p => { const f = files.get(p); if (f.b64 != null) files.delete(p); else { f.orig = f.text; f.base = f.text; } });
    $('#confirm').hidden = true; refreshDirty(); toast('Published. The live site shows it in about a minute.', 6000);
  } catch (e) { $('#confirm-err').textContent = friendly(e); $('#confirm-err').hidden = false; }
  go.disabled = false; go.textContent = 'Publish';
};
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
  if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); undoChange(); }
});

/* ---------- history ---------- */
async function loadHistory() {
  const ol = $('#hist'); ol.innerHTML = '<li class="hint">Loading…</li>';
  if (!gh) { ol.innerHTML = '<li class="hint">Sign in with your GitHub key to see the history.</li>'; return; }
  try {
    const list = await gh.history(cfg.folder || '', 30);
    ol.innerHTML = '';
    list.forEach(c => {
      const li = document.createElement('li');
      const when = document.createElement('span'); when.className = 'when'; when.textContent = new Date(c.date).toLocaleString('en-NZ', { dateStyle: 'medium', timeStyle: 'short' });
      const msg = document.createElement('span'); msg.className = 'msg' + (/^(Edit from the site|Undo:)/.test(c.message) ? ' ours' : ''); msg.textContent = c.message;
      li.append(when, msg);
      if (/^(Edit from the site|Undo:)/.test(c.message)) {
        const b = document.createElement('button'); b.className = 'btn out'; b.textContent = 'Undo';
        b.onclick = async () => {
          if (!confirm('Put the site back as it was before "' + c.message + '"?')) return;
          b.disabled = true; b.textContent = 'Undoing…';
          try { await gh.undo(c.sha); files.clear(); css = null; imagesList = null; toast('Undone. The live site shows it in about a minute.', 6000); loadHistory(); }
          catch (e) { toast(friendly(e), 6000); b.disabled = false; b.textContent = 'Undo'; }
        };
        li.appendChild(b);
      }
      ol.appendChild(li);
    });
    if (!list.length) ol.innerHTML = '<li class="hint">Nothing yet.</li>';
  } catch (e) { ol.innerHTML = '<li class="hint">' + friendly(e) + '</li>'; }
}

boot();
