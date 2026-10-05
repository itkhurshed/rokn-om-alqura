# Rokn Om Alqura — API server & database

Zero-dependency Node.js server (Node 22.5+, built-in `node:sqlite`). It serves the website **and** runs every
store-management action (POS, sales, inventory, purchases, users…) on the server, so permissions cannot be bypassed
from the browser.

```
server/
  server.js        HTTP server: static site + /api (sessions, RBAC, rate limits, security headers)
  db-sqlite.js     SQLite table store (same interface as the browser demo store)
  gen-schema.js    Generates SQL from assets/js/biz/schema.js  →  schema.sql
  schema.sql       PostgreSQL schema (37 tables + `sales` view, FKs, checks, indexes)
  crypto-node.js   PBKDF2-SHA256 / SHA-256 / random tokens (Node crypto)
  load-catalog.js  Seeds the database from the storefront catalogue files
assets/js/biz/
  schema.js        Tables, permission modules, default role matrix, settings defaults  ← single source of truth
  services.js      All business logic (shared by server and offline demo)
  seed.js          Base data + optional, clearly-flagged DEMO data
```

## Run

```bash
# Production-style first start: creates the owner (Super Admin) account
ROKN_ADMIN_USER=owner ROKN_ADMIN_PASSWORD='a-long-unique-passphrase-1' node server/server.js
# → http://localhost:8080  ·  staff area: http://localhost:8080/#en.admin

# Local trial with DEMO data and demo staff accounts (password Rokn@2026, in-memory DB)
node server/server.js --demo
```

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | 8080 | HTTP port (put Nginx/Caddy with HTTPS in front) |
| `ROKN_DB` | `server/data/rokn.db` | SQLite file (back it up daily) |
| `COOKIE_SECURE` | – | Set `1` behind HTTPS so the session cookie is `Secure` |
| `TRUST_PROXY` | – | Set `1` behind a reverse proxy so rate limits use the real client IP |
| `ROKN_ADMIN_USER / _PASSWORD / _NAME / _EMAIL` | – | Owner account on first run (must change password at first sign-in) |

When the site is served by this server, `index.html` is delivered with `ROKN.config.apiBase = '/api'` and the live
catalogue already inlined, so the storefront shows admin prices and stock immediately and checkout posts to
`/api/public/order` (priced and stock-checked on the server).

## Security model

- **Passwords**: PBKDF2-SHA256, 210,000 iterations, per-user salt (`pbkdf2$sha256$iter$salt$hash`). Never stored or logged in plain text; hashes are never returned by the API.
- **Sessions**: 256-bit random token in an `HttpOnly; SameSite=Strict` cookie (+`Secure` with `COOKIE_SECURE=1`). Only the SHA-256 of the token is stored. Expiry from Settings → Security; password changes and deactivation revoke other sessions.
- **Authorisation**: every `/api/rpc/<method>` declares `[module, action]`; the role's permissions are re-read from the database on every call (changes apply instantly). Typing an admin URL without permission shows "Access denied" and the API returns 403. Super Admin accounts can only be managed by a Super Admin; the last Super Admin cannot be removed.
- **Brute force**: account lockout after N failed sign-ins (Settings → Security) + per-IP limits (10 sign-ins / 15 min, 20 web orders / 10 min, 600 API calls / min).
- **CSRF**: admin calls require the `X-Requested-With: rokn-admin` header and the cookie is `SameSite=Strict`.
- **Integrity**: prices always come from the database (client prices are ignored); stock can't go negative unless allowed in Settings; every write runs in a transaction; every change is written to `activity_logs` with user, IP/device, before/after.
- **Headers**: CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, COOP. `server/`, `tools/` and dotfiles are never served.

## PostgreSQL

`schema.sql` is generated from `assets/js/biz/schema.js` (`node server/gen-schema.js`). To move from SQLite to
PostgreSQL implement the 10-method store interface in `db-sqlite.js` with the `pg` driver (same table and column
names) — `services.js` does not change.

## Backups

Admin → Settings → Backup downloads a full JSON backup (password hashes excluded unless requested by the API).
For the server, also back up the SQLite file (`sqlite3 rokn.db ".backup rokn-$(date +%F).db"`).

## Before going live

1. Start without `--demo`, sign in as the owner and change the password.
2. Create staff accounts (Users) and review Roles & Permissions.
3. Confirm prices, stock (Inventory → adjust / receive purchase orders), delivery fees, payment methods, invoice numbering, tax.
4. Connect a Kuwait payment gateway (KNET / cards) and only then tick *Settings → Payment methods → gateway connected*.
5. Serve over HTTPS (`COOKIE_SECURE=1`, `TRUST_PROXY=1`).

## Ready to extend

The schema already has `branches` / `warehouses` (and `branch_id` on users and orders) for multi-branch stock,
`coupons`, `payments` (one row per tender → split payments / gateway callbacks), `returns` + `refunds`,
`purchase_orders` → supplier portal, and the RPC API can back a mobile app, accounting export or delivery integration.
