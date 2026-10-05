/* SQLite implementation of the table-store interface used by services.js
   (all · get · find · filter · insert · upsert · update · remove · tx · count).
   Uses Node's built-in node:sqlite (Node 22.5+). For PostgreSQL, implement the
   same interface with `pg` and run schema.sql — the services do not change. */
'use strict';
const { DatabaseSync } = require('node:sqlite');
const schema = require('../assets/js/biz/schema.js');
const gen = require('./gen-schema.js');

class SqliteDB {
  constructor(file) {
    this.db = new DatabaseSync(file || ':memory:');
    this.db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = OFF; PRAGMA busy_timeout = 5000;');
    gen.sqlite().forEach(s => this.db.exec(s));
    this.cols = {};
    for (const [t, def] of Object.entries(schema.tables)) this.cols[t] = Object.fromEntries(Object.entries(def.cols).map(([c, d]) => [c, gen.parse(d).type]));
    this.depth = 0; this.stmts = new Map();
  }
  st(sql) { let s = this.stmts.get(sql); if (!s) { s = this.db.prepare(sql); this.stmts.set(sql, s); } return s; }
  enc(t, row) {
    const out = {}; const cols = this.cols[t];
    for (const [k, v] of Object.entries(row)) {
      const ty = cols[k]; if (!ty) continue;             // unknown keys are ignored (schema is authoritative)
      out[k] = v == null ? null : ty === 'json' ? JSON.stringify(v) : ty === 'bool' ? (v ? 1 : 0) : (ty === 'num' || ty === 'int') ? Number(v) : String(v);
    }
    return out;
  }
  dec(t, r) {
    if (!r) return null; const cols = this.cols[t]; const o = {};
    for (const [k, v] of Object.entries(r)) { const ty = cols[k]; o[k] = v == null ? null : ty === 'json' ? JSON.parse(v) : ty === 'bool' ? !!v : v; }
    return o;
  }
  all(t) { return this.st(`SELECT * FROM ${t}`).all().map(r => this.dec(t, r)); }
  count(t) { return this.st(`SELECT COUNT(*) AS n FROM ${t}`).get().n; }
  get(t, id) { return this.dec(t, this.st(`SELECT * FROM ${t} WHERE id = ?`).get(String(id))); }
  find(t, fn) { for (const r of this.all(t)) if (fn(r)) return r; return null; }
  filter(t, fn) { return this.all(t).filter(fn); }
  insert(t, row) {
    if (!row.id) throw new Error('insert: id required');
    const e = this.enc(t, row); const keys = Object.keys(e);
    this.st(`INSERT INTO ${t} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`).run(...keys.map(k => e[k]));
    return this.get(t, row.id);
  }
  upsert(t, row) { return this.get(t, row.id) ? this.update(t, row.id, row) : this.insert(t, row); }
  update(t, id, patch) {
    const e = this.enc(t, patch); delete e.id; const keys = Object.keys(e);
    if (!this.get(t, id)) throw new Error(`update: ${t}.${id} not found`);
    if (keys.length) this.db.prepare(`UPDATE ${t} SET ${keys.map(k => `${k} = ?`).join(', ')} WHERE id = ?`).run(...keys.map(k => e[k]), String(id));
    return this.get(t, id);
  }
  remove(t, id) { return this.st(`DELETE FROM ${t} WHERE id = ?`).run(String(id)).changes > 0; }
  async tx(fn) {
    if (this.depth) return fn();
    this.depth++; this.db.exec('BEGIN IMMEDIATE');
    try { const r = await fn(); this.db.exec('COMMIT'); return r; }
    catch (e) { try { this.db.exec('ROLLBACK'); } catch (x) { /* already rolled back */ } throw e; }
    finally { this.depth--; }
  }
  load(data) { Object.entries(data).forEach(([t, rows]) => (rows || []).forEach(r => this.upsert(t, r))); }
  takeDirty() { return []; }
}
module.exports = SqliteDB;
