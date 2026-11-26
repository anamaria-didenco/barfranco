/* A small GitHub client for the site editor: reads files, lists folders, and writes every change as one commit.
   Plain script in the browser (window.GH); also loads in Node for testing. */
(function (root) {
  'use strict';
  function GH(cfg) { this.cfg = cfg; }
  GH.prototype.api = async function (path, opts) {
    opts = opts || {};
    const res = await fetch('https://api.github.com' + path, {
      method: opts.method || 'GET',
      headers: Object.assign({
        Authorization: 'Bearer ' + this.cfg.token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }, opts.body ? { 'Content-Type': 'application/json' } : {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    if (res.status === 204) return null;
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) {
      const err = new Error((data && data.message) || ('GitHub answered ' + res.status));
      err.status = res.status; err.data = data; throw err;
    }
    return data;
  };
  GH.prototype.repo = function () { return '/repos/' + this.cfg.owner + '/' + this.cfg.repo; };
  GH.prototype.whoami = function () { return this.api('/user'); };
  GH.prototype.checkRepo = function () { return this.api(this.repo()); };
  /* a text file at the branch head: {text, sha} (null when it does not exist) */
  GH.prototype.getText = async function (path, ref) {
    let d;
    try { d = await this.api(this.repo() + '/contents/' + enc(path) + '?ref=' + encodeURIComponent(ref || this.cfg.branch)); }
    catch (e) { if (e.status === 404) return null; throw e; }
    return { text: b64ToUtf8(d.content), sha: d.sha };
  };
  /* a binary file as base64 (null when it does not exist) */
  GH.prototype.getBase64 = async function (path, ref) {
    let d;
    try { d = await this.api(this.repo() + '/contents/' + enc(path) + '?ref=' + encodeURIComponent(ref || this.cfg.branch)); }
    catch (e) { if (e.status === 404) return null; throw e; }
    if (d.content) return { b64: d.content.replace(/\n/g, ''), sha: d.sha };
    /* files over 1MB come without content: fetch the blob */
    const blob = await this.api(this.repo() + '/git/blobs/' + d.sha);
    return { b64: blob.content.replace(/\n/g, ''), sha: d.sha };
  };
  /* the names in a folder (files only) */
  GH.prototype.listDir = async function (path) {
    let d;
    try { d = await this.api(this.repo() + '/contents/' + enc(path) + '?ref=' + encodeURIComponent(this.cfg.branch)); }
    catch (e) { if (e.status === 404) return []; throw e; }
    return (Array.isArray(d) ? d : []).filter(x => x.type === 'file').map(x => x.name);
  };
  GH.prototype.head = async function () {
    const r = await this.api(this.repo() + '/git/ref/heads/' + this.cfg.branch);
    return r.object.sha;
  };
  /* changes: [{path, text}] or [{path, b64}] or [{path, remove:true}] -> one commit on the branch; returns its sha */
  GH.prototype.commit = async function (message, changes) {
    const parent = await this.head();
    const base = await this.api(this.repo() + '/git/commits/' + parent);
    const tree = [];
    for (const c of changes) {
      if (c.remove) { tree.push({ path: c.path, mode: '100644', type: 'blob', sha: null }); continue; }
      const blob = await this.api(this.repo() + '/git/blobs', { method: 'POST', body: c.b64 != null ? { content: c.b64, encoding: 'base64' } : { content: c.text, encoding: 'utf-8' } });
      tree.push({ path: c.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const t = await this.api(this.repo() + '/git/trees', { method: 'POST', body: { base_tree: base.tree.sha, tree } });
    const commit = await this.api(this.repo() + '/git/commits', { method: 'POST', body: { message, tree: t.sha, parents: [parent] } });
    await this.api(this.repo() + '/git/refs/heads/' + this.cfg.branch, { method: 'PATCH', body: { sha: commit.sha, force: false } });
    return commit.sha;
  };
  /* recent commits that touched the site folder */
  GH.prototype.history = async function (folder, n) {
    const q = '?sha=' + encodeURIComponent(this.cfg.branch) + '&per_page=' + (n || 25) + (folder ? '&path=' + encodeURIComponent(folder) : '');
    const list = await this.api(this.repo() + '/commits' + q);
    return list.map(c => ({ sha: c.sha, message: c.commit.message.split('\n')[0], date: c.commit.author.date, author: c.commit.author.name, parents: c.parents.map(p => p.sha) }));
  };
  /* undo one commit: put every file it touched back as it was before it, as a new commit */
  GH.prototype.undo = async function (sha) {
    const c = await this.api(this.repo() + '/commits/' + sha);
    if (!c.parents || !c.parents.length) throw new Error('That is the first commit; it cannot be undone.');
    const parent = c.parents[0].sha;
    const changes = [];
    for (const f of c.files || []) {
      if (f.status === 'added') { changes.push({ path: f.filename, remove: true }); continue; }
      const path = f.status === 'renamed' ? f.previous_filename : f.filename;
      const before = await this.getBase64(path, parent);
      if (!before) continue;
      changes.push({ path, b64: before.b64 });
      if (f.status === 'renamed') changes.push({ path: f.filename, remove: true });
    }
    return this.commit('Undo: ' + c.commit.message.split('\n')[0], changes);
  };
  function enc(path) { return path.split('/').map(encodeURIComponent).join('/'); }
  function b64ToUtf8(b) {
    const bin = (typeof atob === 'function') ? atob(b.replace(/\n/g, '')) : Buffer.from(b, 'base64').toString('binary');
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }
  GH.utf8ToB64 = function (s) {
    const bytes = new TextEncoder().encode(s);
    let bin = ''; for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return (typeof btoa === 'function') ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  };
  root.GH = GH;
  if (typeof module !== 'undefined' && module.exports) module.exports = GH;
})(typeof window !== 'undefined' ? window : globalThis);
