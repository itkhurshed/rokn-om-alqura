/* Generates SQL DDL from assets/js/biz/schema.js — the single source of truth.
   node server/gen-schema.js            → writes server/schema.sql (PostgreSQL)
   require('./gen-schema').sqlite()     → DDL used by the bundled SQLite store  */
'use strict';
const path = require('path'), fs = require('fs');
const schema = require('../assets/js/biz/schema.js');

const PG = { id: 'TEXT PRIMARY KEY', text: 'TEXT', int: 'INTEGER', num: 'NUMERIC(14,3)', bool: 'BOOLEAN NOT NULL DEFAULT FALSE', ts: 'TIMESTAMPTZ', date: 'DATE', json: 'JSONB' };
const SQ = { id: 'TEXT PRIMARY KEY', text: 'TEXT', int: 'INTEGER', num: 'REAL', bool: 'INTEGER NOT NULL DEFAULT 0', ts: 'TEXT', date: 'TEXT', json: 'TEXT' };
function parse(def) {                       // 'text->roles' (FK)  'text!' (unique)
  const m = String(def).match(/^(\w+)(!)?(?:->(\w+))?$/);
  return { type: m[1], unique: !!m[2], ref: m[3] || null };
}
function ddl(map, dialect) {
  const out = [];
  const fks = [];
  for (const [t, def] of Object.entries(schema.tables)) {
    const cols = Object.entries(def.cols).map(([c, d]) => {
      const p = parse(d);
      let s = `  ${c} ${map[p.type]}`;
      if (p.unique) s += ' UNIQUE';
      if (p.ref && dialect === 'pg') fks.push(`ALTER TABLE ${t} ADD CONSTRAINT fk_${t}_${c} FOREIGN KEY (${c}) REFERENCES ${p.ref}(id)${['order_items', 'payments', 'purchase_items', 'role_permissions', 'user_roles', 'sessions', 'inventory'].includes(t) ? ' ON DELETE CASCADE' : ''} DEFERRABLE INITIALLY DEFERRED;`);
      return s;
    });
    out.push(`CREATE TABLE IF NOT EXISTS ${t} (\n${cols.join(',\n')}\n);`);
    for (const [c, d] of Object.entries(def.cols)) { const p = parse(d); if (p.ref || ['created_at', 'date', 'status', 'variant_id', 'order_id', 'user_id', 'type', 'module'].includes(c)) out.push(`CREATE INDEX IF NOT EXISTS ix_${t}_${c} ON ${t}(${c});`); }
  }
  return { tables: out, fks };
}
function postgres() {
  const { tables, fks } = ddl(PG, 'pg');
  return `-- =====================================================================
-- Rokn Om Alqura — Store management database (PostgreSQL 14+)
-- GENERATED from assets/js/biz/schema.js by server/gen-schema.js — edit the
-- schema file, then regenerate. Money & metres: NUMERIC(14,3) (KWD has 3 decimals).
-- Passwords: users.password_hash = pbkdf2$sha256$<iterations>$<salt>$<hash>
-- (never plain text). Sessions store SHA-256 of the cookie token only.
-- =====================================================================
BEGIN;
${tables.join('\n')}

-- Foreign keys
${fks.join('\n')}

-- Reporting view: completed sales (POS + website)
CREATE OR REPLACE VIEW sales AS
  SELECT o.*, (o.total - COALESCE(o.refunded, 0)) AS net_total
  FROM orders o
  WHERE o.status IN ('completed','pending','processing','preparing','shipped','delivered','partially_refunded','refunded');

-- Integrity rules the services also enforce
ALTER TABLE inventory ADD CONSTRAINT ck_inventory_nonneg CHECK (reserved_m >= 0 AND damaged_m >= 0);
ALTER TABLE order_items ADD CONSTRAINT ck_items_meters CHECK (meters > 0 AND returned_m >= 0 AND returned_m <= meters);
ALTER TABLE fabric_rolls ADD CONSTRAINT ck_rolls_len CHECK (remaining_m >= 0 AND original_m > 0);
COMMIT;
`;
}
module.exports = { postgres, sqlite: () => ddl(SQ, 'sqlite').tables, parse };
if (require.main === module) {
  const file = path.join(__dirname, 'schema.sql');
  fs.writeFileSync(file, postgres());
  console.log('wrote', file);
}
