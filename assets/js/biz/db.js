/* ==========================================================================
   MEMORY TABLE STORE with transactions — used by the browser admin (persisted
   to IndexedDB) and as the reference implementation of the DB interface the
   services expect. server/db-sqlite.js implements the same interface on SQL.

   Interface:  all(t) · get(t,id) · find(t,fn) · filter(t,fn) · insert(t,row)
               update(t,id,patch) · remove(t,id) · tx(fn) · count(t)
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.ROKN = root.ROKN || {}; root.ROKN.biz = root.ROKN.biz || {}; root.ROKN.biz.MemoryDB = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clone = v => (v == null || typeof v !== 'object') ? v : JSON.parse(JSON.stringify(v));

  function MemoryDB(tableNames, initial) {
    this.t = {};
    this.dirty = new Set();
    this.journal = null;
    (tableNames || []).forEach(n => { this.t[n] = new Map(); });
    if (initial) this.load(initial);
  }
  MemoryDB.prototype = {
    table(n) { if (!this.t[n]) this.t[n] = new Map(); return this.t[n]; },
    load(data) { Object.keys(data).forEach(n => { const m = this.table(n); m.clear(); (data[n] || []).forEach(r => m.set(r.id, r)); }); },
    dump() { const o = {}; Object.keys(this.t).forEach(n => { o[n] = [...this.t[n].values()]; }); return o; },
    all(n) { return [...this.table(n).values()].map(clone); },
    count(n) { return this.table(n).size; },
    get(n, id) { return clone(this.table(n).get(id) || null); },
    find(n, fn) { for (const r of this.table(n).values()) if (fn(r)) return clone(r); return null; },
    filter(n, fn) { const out = []; for (const r of this.table(n).values()) if (fn(r)) out.push(clone(r)); return out; },
    _touch(n, id) {
      this.dirty.add(n);
      if (this.journal && !this.journal.has(n + '\u0000' + id)) this.journal.set(n + '\u0000' + id, { n, id, prev: clone(this.table(n).get(id)) });
    },
    insert(n, row) {
      if (!row.id) throw new Error('insert: id required');
      if (this.table(n).has(row.id)) throw new Error(`insert: duplicate ${n}.${row.id}`);
      this._touch(n, row.id); this.table(n).set(row.id, clone(row)); return clone(row);
    },
    upsert(n, row) { return this.table(n).has(row.id) ? this.update(n, row.id, row) : this.insert(n, row); },
    update(n, id, patch) {
      const cur = this.table(n).get(id); if (!cur) throw new Error(`update: ${n}.${id} not found`);
      this._touch(n, id); const next = Object.assign({}, cur, clone(patch), { id }); this.table(n).set(id, next); return clone(next);
    },
    remove(n, id) { if (!this.table(n).has(id)) return false; this._touch(n, id); this.table(n).delete(id); return true; },
    /* All-or-nothing: on error every row touched inside fn is restored */
    async tx(fn) {
      if (this.journal) return fn();             // nested → join outer transaction
      this.journal = new Map();
      try { const r = await fn(); this.journal = null; return r; }
      catch (e) {
        for (const { n, id, prev } of this.journal.values()) { if (prev == null) this.table(n).delete(id); else this.table(n).set(id, prev); }
        this.journal = null; throw e;
      }
    },
    takeDirty() { const d = [...this.dirty]; this.dirty.clear(); return d; }
  };
  return MemoryDB;
});
