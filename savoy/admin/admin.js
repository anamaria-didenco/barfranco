/* The site editor. The page being edited loads in a frame with scripts switched off, so what you see is the file
   itself; edits happen in that frame, and Save writes the changed files to GitHub as one commit. */
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const DEF = { owner: 'anamaria-didenco', repo: 'barfranco', branch: 'main', folder: 'savoy' };
const PAGES = [['', 'Home'], ['our-story', 'Our story'], ['menus', 'Menus'], ['bookings', 'Bookings'], ['restaurant', 'The restaurant'],
  ['negroni-bar', 'Negroni bar'], ['aperitivo', 'Aperitivo'], ['fresh-pasta', 'Pasta fresca'], ['pre-stadium-dining', 'Before the stadium'],
  ['functions', 'Functions'], ['private-dining', 'Private dining'], ['corporate-events', 'Corporate events'], ['weddings', 'Weddings'],
  ['christmas-functions', 'Christmas'], ['events-pack', 'Events pack'], ['vouchers', 'Gift vouchers'], ['contact', 'Contact']];
const BRAND = { ink: '#6C0600', paper: '#F1EEE6', accent: '#AF0F00' };
const SITE = new URL('../', location.href);           /* the site root, where this editor lives under /admin/ */
const STATIC = new URL('static/', SITE);

let cfg = Object.assign({}, DEF, JSON.parse(localStorage.getItem('bf-admin-cfg') || '{}'));
let token = localStorage.getItem('bf-admin-token') || '';
let gh = null;
const files = new Map();      /* repo path -> {orig, text} for text files, {b64, label} for new binaries */
let page = null;              /* the open page: {slug, path, url} */
let fdoc = null;              /* its document in the frame */
let selected = null;
let css = null;               /* {orig, text} of the stylesheet, loaded on demand */
let fontsList = null, imagesList = null;
const blobURLs = new Map();   /* repo path of a pending upload -> object URL for previews */

/* ---------- small helpers ---------- */
const rp = rel => (cfg.folder ? cfg.folder.replace(/\/+$/, '') + '/' : '') + rel;
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
  /* without a key, the local preview server's folder listing will do */
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
  const nav = $('#pages');
  PAGES.forEach(([slug, name]) => {
    const b = document.createElement('button'); b.textContent = name; b.dataset.slug = slug; b.dataset.path = rp((slug ? slug + '/' : '') + 'index.html');
    b.onclick = () => openPage(slug); nav.appendChild(b);
  });
  $$('.tool').forEach(b => b.onclick = () => showView(b.dataset.view));
  $$('.sz').forEach(b => b.onclick = () => { $$('.sz').forEach(x => x.classList.toggle('on', x === b)); $('#frame').classList.toggle('phone', !!b.dataset.w); });
  if (!gh) toast('No key: you can try the editor, but nothing can be saved.', 6000);
  openPage('');
}
function showView(v) {
  $$('.view').forEach(x => x.hidden = x.id !== 'view-' + v);
  $$('.tool').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  $$('#pages button').forEach(b => b.classList.remove('on'));
  $('#crumb').textContent = { style: 'Colours & fonts', history: 'History', settings: 'Settings' }[v];
  $('#panel').style.visibility = 'hidden';
  if (v === 'style') loadStyle(); if (v === 'history') loadHistory();
}
async function openPage(slug) {
  if (page && fdoc) { const f = files.get(page.path); if (f) f.text = serialize(fdoc); }
  $$('.view').forEach(x => x.hidden = true); $$('.tool').forEach(b => b.classList.remove('on'));
  $('#panel').style.visibility = '';
  $$('#pages button').forEach(b => b.classList.toggle('on', b.dataset.slug === slug));
  const rel = (slug ? slug + '/' : '') + 'index.html';
  page = { slug, path: rp(rel), url: new URL(slug ? slug + '/' : '', SITE).href };
  $('#crumb').textContent = PAGES.find(p => p[0] === slug)[1];
  status('Loading…'); select(null);
  let text;
  try { text = await source(page.path, rel); } catch (e) { status(friendly(e)); return; }
  const frame = $('#frame');
  frame.onload = () => { fdoc = frame.contentDocument; prepare(fdoc);
    /* a photo uploaded earlier this session, not yet saved: show it from memory */
    fdoc.querySelectorAll('img').forEach(i => { const s = i.getAttribute('src') || ''; const u = blobURLs.get(rp('images/' + s.slice(s.lastIndexOf('/') + 1))); if (u && !s.startsWith('blob:')) { i.dataset.bfFinal = s; i.setAttribute('src', u); } }); const f = files.get(page.path); if (f && f.base == null) { f.base = serialize(fdoc); if (f.text === f.orig) f.text = f.base; } refreshDirty(); };
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
    .lift{display:none!important}
    html{scroll-behavior:auto}`;
  doc.head.appendChild(st);
  applyTheme(doc);
  mark(doc);
  doc.addEventListener('click', e => {
    const t = e.target;
    e.preventDefault();
    const img = t.closest && t.closest('img');
    if (img) return selectImage(img);
    const w = t.closest && t.closest('[data-w]');
    if (w) return selectWords(w);
    const ed = t.closest && t.closest('[data-bf-edit]');
    if (ed) return selectText(ed);
    select(null);
  }, true);
  doc.addEventListener('input', e => { const ed = e.target.closest && e.target.closest('[data-bf-edit]'); if (ed) keepParts(ed); refreshDirty(); });
  doc.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); if (e.shiftKey) doc.execCommand('insertLineBreak'); }
    if (e.key === 'Escape') { e.target.blur && e.target.blur(); select(null); }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
  });
  doc.addEventListener('paste', e => { e.preventDefault(); doc.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain')); });
  doc.addEventListener('drop', e => e.preventDefault());
  /* this page's title and description */
  $('#p-title').value = doc.title;
  const d = doc.querySelector('meta[name="description"]'); $('#p-desc').value = d ? d.content : '';
}
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEMPLATE', 'svg', 'SVG', 'INPUT', 'TEXTAREA', 'SELECT']);
function mark(doc) {
  (function walk(el) {
    if (SKIP.has(el.tagName) || el.namespaceURI !== 'http://www.w3.org/1999/xhtml') return;
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
  doc.querySelectorAll('.bf-sel').forEach(e => { e.classList.remove('bf-sel'); if (!e.getAttribute('class')) e.removeAttribute('class'); });
}
/* an arrow span or icon inside a button must survive the words around it being retyped */
function keepParts(el) {
  if (!el._parts) return;
  el._parts.forEach(p => { if (!el.querySelector(p.sel)) el.appendChild(p.node.cloneNode(true)); });
}
function remember(el) {
  if (el._parts) return;
  el._parts = [...el.children].filter(c => !c.textContent.trim()).map(c => ({ sel: c.className ? '.' + [...c.classList].join('.') : c.tagName, node: c.cloneNode(true) }));
}

/* the page as a file again: our editing marks removed, pending photos pointing at their final names */
function serialize(doc) {
  const base = doc.querySelector('base[data-bf]'); const st = doc.getElementById('bf-style'); const th = doc.getElementById('bf-theme');
  if (base) base.remove(); if (st) st.remove(); if (th) th.remove();
  unmark(doc);
  const swaps = [...doc.querySelectorAll('img[data-bf-final]')].map(i => { const b = i.getAttribute('src'); i.setAttribute('src', i.dataset.bfFinal); i.removeAttribute('data-bf-final'); return [i, b, i.getAttribute('src')]; });
  const out = '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
  swaps.forEach(([i, b, f]) => { i.setAttribute('src', b); i.dataset.bfFinal = f; });
  if (base) doc.head.prepend(base); if (st) doc.head.appendChild(st); if (th) doc.head.appendChild(th);
  mark(doc);
  if (selected && selected.el) selected.el.classList.add('bf-sel');
  return out;
}

/* ---------- selection and the side panel ---------- */
function select(sel) {
  if (selected && selected.el) { selected.el.classList.remove('bf-sel'); if (!selected.el.getAttribute('class')) selected.el.removeAttribute('class'); }
  selected = sel;
  $('#sel').hidden = !sel;
  ['text', 'link', 'words', 'img'].forEach(k => $('#sel-' + k).hidden = !sel || !sel.show.includes(k));
  if (!sel) return;
  sel.el.classList.add('bf-sel');
  $('#sel-kind').textContent = sel.kind;
}
function selectText(el) {
  remember(el);
  const a = el.closest('a');
  select({ el, kind: a ? 'Words and a link' : 'Words', show: a ? ['text', 'link'] : ['text'], a });
  if (a) $('#l-href').value = a.getAttribute('href') || '';
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

/* ---------- photographs ---------- */
function selectImage(img) {
  select({ el: img, kind: 'Photograph', show: ['img'] });
  $('#i-thumb').src = img.currentSrc || img.src; $('#i-alt').value = img.getAttribute('alt') || '';
}
$('#i-alt').addEventListener('input', () => { if (selected && selected.el.tagName === 'IMG') { selected.el.setAttribute('alt', $('#i-alt').value); mirror(selected.el); refreshDirty(); } });
const imgPrefix = img => { const s = img.getAttribute('src') || '../images/x.jpg'; const final = img.dataset.bfFinal || s; return final.slice(0, final.lastIndexOf('/') + 1); };
/* a hero slide and its thumbnail in the rail are the same picture: keep them together */
function mirror(img) {
  const slide = img.closest('.hero .slide'), thumb = img.closest('.rail button');
  const doc = img.ownerDocument; let other = null;
  if (slide) { const i = [...doc.querySelectorAll('.hero .slide')].indexOf(slide); other = doc.querySelectorAll('.rail button img')[i]; }
  if (thumb) { const i = [...doc.querySelectorAll('.rail button')].indexOf(thumb); other = doc.querySelectorAll('.hero .slide img')[i]; }
  if (!other) return;
  ['src', 'alt', 'data-bf-final'].forEach(a => { if (img.hasAttribute(a)) other.setAttribute(a, img.getAttribute(a)); else other.removeAttribute(a); });
  other.removeAttribute('srcset'); other.removeAttribute('sizes');
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

/* ---------- colours and fonts ---------- */
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
const FONT_RE = { display: /(@font-face\{font-family:"VTC Marsha";src:url\(")([^"]+)("\)\s*format\(")([^"]+)("\))/g,
  body: /(@font-face\{font-family:"Affairs";src:url\(")([^"]+)("\)\s*format\(")([^"]+)("\)[^}]*font-style:normal)/g,
  italic: /(@font-face\{font-family:"Affairs";src:url\(")([^"]+)("\)\s*format\(")([^"]+)("\)[^}]*font-style:italic)/g };
const fmt = n => ({ otf: 'opentype', ttf: 'truetype', woff: 'woff', woff2: 'woff2' })[n.split('.').pop().toLowerCase()] || 'opentype';
function currentFont(kind) { const m = FONT_RE[kind].exec(css.text); FONT_RE[kind].lastIndex = 0; return m ? m[2].replace(/^fonts\//, '') : ''; }
function setFont(kind, name) { css.text = css.text.replace(FONT_RE[kind], (m, a, old, b, oldf, c) => a + 'fonts/' + name + b + fmt(name) + c); }
/* the edited stylesheet, dropped into the frame so the page shows it at once */
function applyTheme(doc) {
  if (!css || same(css)) { const old = doc.getElementById('bf-theme'); if (old) old.remove(); return; }
  let t = css.text.replace(/url\((['"]?)(?!https?:|data:|\/)([^'")]+)\1\)/g, (m, q, p) => {
    const pending = blobURLs.get(rp('static/' + p)); return 'url("' + (pending || new URL(p, STATIC).href) + '")';
  });
  let el = doc.getElementById('bf-theme'); if (!el) { el = doc.createElement('style'); el.id = 'bf-theme'; doc.head.appendChild(el); }
  el.textContent = t;
}
async function loadStyle() {
  status('Loading the stylesheet…');
  try { await loadCSS(); } catch (e) { status(friendly(e)); return; }
  $('#c-ink').value = tok(css.text, 'dark'); $('#c-paper').value = tok(css.text, 'ivory'); $('#c-accent').value = tok(css.text, 'accent');
  if (!fontsList) fontsList = (await listFolder(rp('static/fonts'), 'static/fonts/')).filter(n => /\.(otf|ttf|woff2?)$/i.test(n));
  ['display', 'body', 'italic'].forEach(k => {
    const s = $('#f-' + k); s.innerHTML = '';
    fontsList.forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n.replace(/\.\w+$/, ''); s.appendChild(o); });
    s.value = currentFont(k);
  });
  refreshDirty();
}
['ink', 'paper', 'accent'].forEach(k => $('#c-' + k).addEventListener('input', () => { setTokens($('#c-ink').value, $('#c-paper').value, $('#c-accent').value); if (fdoc) applyTheme(fdoc); refreshDirty(); }));
$('#c-reset').onclick = () => { $('#c-ink').value = BRAND.ink; $('#c-paper').value = BRAND.paper; $('#c-accent').value = BRAND.accent; setTokens(BRAND.ink, BRAND.paper, BRAND.accent); if (fdoc) applyTheme(fdoc); refreshDirty(); };
['display', 'body', 'italic'].forEach(k => $('#f-' + k).addEventListener('change', () => { setFont(k, $('#f-' + k).value); if (fdoc) applyTheme(fdoc); refreshDirty(); }));
$('#f-upload').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  const name = f.name.replace(/[^A-Za-z0-9._-]+/g, '-'), path = rp('static/fonts/' + name);
  files.set(path, { b64: await toB64(f), label: 'New font ' + name }); blobURLs.set(path, URL.createObjectURL(f));
  if (!fontsList.includes(name)) fontsList.push(name);
  ['display', 'body', 'italic'].forEach(k => { const s = $('#f-' + k); const o = document.createElement('option'); o.value = name; o.textContent = name.replace(/\.\w+$/, ''); s.appendChild(o); });
  toast('Added. Pick it in one of the three lists.'); e.target.value = ''; refreshDirty();
});

/* ---------- save ---------- */
function describe() {
  const out = [];
  dirtyPaths().forEach(p => {
    const f = files.get(p);
    if (f.label) return out.push(f.label);
    if (p === CSS_PATH()) return out.push('Colours or fonts');
    const pg = PAGES.find(x => rp((x[0] ? x[0] + '/' : '') + 'index.html') === p);
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
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); } });

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
