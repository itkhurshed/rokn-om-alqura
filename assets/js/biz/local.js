/* ==========================================================================
   API CLIENT for the admin.
   • PRODUCTION  (ROKN.config.apiBase set, e.g. '/api'): every call is sent to
     the Node server (server/server.js), which authenticates the session cookie
     and enforces permissions server-side. Nothing sensitive runs in the browser.
   • OFFLINE DEMO (no apiBase — e.g. this preview): the same services.js runs in
     the browser against an IndexedDB copy of the database, with PBKDF2-hashed
     passwords and the same permission checks, so every screen is fully working.
     Browser-side checks can be bypassed by anyone with dev-tools access to
     THEIR OWN copy — that is why production must use the server.
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const B = ROKN.biz;
  const enc = new TextEncoder();
  const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
  const subtle = window.crypto && window.crypto.subtle;
  const webCrypto = {
    randomBytes: async n => b64u(window.crypto.getRandomValues(new Uint8Array(n))),
    pbkdf2: async (pw, salt, iter) => {
      const key = await subtle.importKey('raw', enc.encode(String(pw)), 'PBKDF2', false, ['deriveBits']);
      return b64u(await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64u(salt), iterations: iter }, key, 256));
    },
    sha256: async s => [...new Uint8Array(await subtle.digest('SHA-256', enc.encode(String(s))))].map(b => b.toString(16).padStart(2, '0')).join(''),
    safeEqual: (a, b) => { a = String(a); b = String(b); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
  };

  /* ---------------- IndexedDB persistence ---------------- */
  const IDB_NAME = 'rokn-admin', IDB_VER = 1;
  const idb = {
    open() {
      return new Promise((res, rej) => {
        if (!window.indexedDB) return rej(new Error('no-idb'));
        const r = indexedDB.open(IDB_NAME, IDB_VER);
        r.onupgradeneeded = () => r.result.createObjectStore('tables');
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
      });
    },
    async loadAll(dbh) {
      return new Promise((res, rej) => {
        const out = {}; const tx = dbh.transaction('tables', 'readonly'); const st = tx.objectStore('tables');
        const req = st.openCursor();
        req.onsuccess = () => { const c = req.result; if (c) { out[c.key] = c.value; c.continue(); } else res(out); };
        req.onerror = () => rej(req.error);
      });
    },
    save(dbh, tables) {
      return new Promise((res, rej) => { const tx = dbh.transaction('tables', 'readwrite'); const st = tx.objectStore('tables'); tables.forEach(([k, v]) => st.put(v, k)); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    },
    wipe() { return new Promise(res => { try { const r = indexedDB.deleteDatabase(IDB_NAME); r.onsuccess = r.onerror = r.onblocked = () => res(); } catch (e) { res(); } }); }
  };

  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
  const ss = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) { /* */ } } };

  const api = ROKN.api = { mode: ROKN.config.apiBase ? 'server' : 'local', ready: null, persistent: true, token: ss.get('rokn:admin-token') };

  /* ---------------- server mode ---------------- */
  async function remoteCall(method, args) {
    const res = await fetch(`${ROKN.config.apiBase}/rpc/${encodeURIComponent(method)}`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'rokn-admin' }, body: JSON.stringify(args || {})
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) { const e = new Error((body.error && body.error.message) || res.statusText); e.code = (body.error && body.error.code) || 'http_' + res.status; throw e; }
    return body.result;
  }

  /* ---------------- local mode ---------------- */
  let svc = null, dbh = null, saveTimer = null;
  async function persist() {
    const dirty = svc._db.takeDirty();
    if (dbh && dirty.length) { try { await idb.save(dbh, dirty.map(t => [t, svc._db.all(t)])); } catch (e) { console.warn('[admin] save failed', e); } }
    publish();
  }
  function publish() {
    const pub = svc.publicCatalog();
    if (!ls.set('rokn:pub', pub)) {   // quota: drop inline uploaded images from the storefront snapshot
      console.warn('[admin] storefront snapshot too large for localStorage; uploaded images kept in admin only');
    }
  }
  async function bootLocal(onProgress) {
    if (!subtle) throw new Error('Secure context required (HTTPS) for password hashing.');
    const db = new B.MemoryDB(Object.keys(B.schema.tables));
    svc = B.createServices({ db, crypto: webCrypto, mode: 'local', hooks: { afterWrite: () => { publish(); clearTimeout(saveTimer); saveTimer = setTimeout(persist, 30); } } });
    let loaded = null;
    try { dbh = await idb.open(); loaded = await idb.loadAll(dbh); } catch (e) { api.persistent = false; dbh = null; }
    const metaOf = id => ((loaded && loaded.meta) || []).find(m => m.id === id);
    const stale = loaded && loaded.meta && loaded.meta.length && (metaOf('demo') || {}).value === true && ((metaOf('seed_version') || {}).value || 1) < B.seed.SEED_VERSION;
    if (stale) { try { await idb.save(dbh, Object.keys(loaded).map(t => [t, []])); } catch (e) { /* */ } try { localStorage.removeItem('rokn:pub'); } catch (e) { /* */ } }
    if (loaded && loaded.meta && loaded.meta.length && !stale) { db.load(loaded); db.takeDirty(); }
    else {
      onProgress && onProgress('seed');
      const src = { products: ROKN.data.baseProducts || ROKN.data.products, catalog: ROKN.catalog.base || ROKN.catalog, config: ROKN.config };
      B.seed.base(svc, src);
      await B.seed.demo(svc, {});
      await persist();
    }
    await importWebOrders();
    publish();
  }
  /* Website orders placed in this browser are queued in localStorage by the storefront;
     the admin ingests them through the same public.placeOrder service the API exposes. */
  async function importWebOrders() {
    const orders = ls.get('rokn:orders') || [];
    const done = new Set((svc._db.get('meta', 'imported_web_orders') || { value: [] }).value);
    let n = 0;
    for (const o of orders.slice().reverse()) {
      if (done.has(o.number)) continue;
      try {
        await svc.call(null, 'public.placeOrder', { number: o.number, date: o.date, name: o.name, phone: o.phone, email: o.email, address: o.address, shipMethod: o.shipMethod, payment: o.payment,
          coupon: o.coupon || null, lines: (o.lines || []).map(l => ({ id: l.id, color: l.color, qty: l.qty })) }, { ip: 'web', device: 'storefront' });
        n++;
      } catch (e) { console.warn('[admin] web order skipped', o.number, e.message); }
      done.add(o.number);
    }
    if (n || orders.length) { svc._db.upsert('meta', { id: 'imported_web_orders', value: [...done] }); await persist(); }
    return n;
  }

  api.init = function (onProgress) {
    if (!api.ready) api.ready = api.mode === 'server' ? Promise.resolve() : bootLocal(onProgress);
    return api.ready;
  };
  api.call = async function (method, args) {
    await api.init();
    if (api.mode === 'server') return remoteCall(method, args);
    return svc.call(api.token, method, args, { ip: 'local', device: navigator.userAgent.slice(0, 120) });
  };
  api.login = async function (username, password) {
    const r = await api.call('auth.login', { username, password });
    if (r.token) { api.token = r.token; ss.set('rokn:admin-token', r.token); }
    return r;
  };
  api.logout = async function () { try { await api.call('auth.logout'); } catch (e) { /* already gone */ } api.token = null; ss.set('rokn:admin-token', null); };
  api.resetLocal = async function () { await idb.wipe(); try { localStorage.removeItem('rokn:pub'); } catch (e) { /* */ } ss.set('rokn:admin-token', null); };
  api.syncWebOrders = () => api.mode === 'local' ? importWebOrders() : Promise.resolve(0);
})();
