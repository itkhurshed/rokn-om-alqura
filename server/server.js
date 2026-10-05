#!/usr/bin/env node
/* ==========================================================================
   Rokn Om Alqura — API + website server (zero dependencies, Node 22.5+)

   • Serves the storefront and admin (static files from the project root)
   • POST /api/rpc/:method  → the SAME services.js the admin uses, but here the
     session (HttpOnly cookie), every permission check, validation, stock
     movements and the audit log run on the server — the browser cannot bypass
     them. Unknown methods and unauthorised calls are rejected (403/401).
   • GET  /api/public/catalog → products, live stock, categories, settings
   • POST /api/public/order   → website checkout (validated & priced server-side)
   • Security: PBKDF2-SHA256 password hashing (210k iterations), session tokens
     stored as SHA-256 hashes, account lockout, per-IP rate limits, CSRF header
     check + SameSite=Strict cookies, strict security headers, body size limits.

   Usage:
     ROKN_ADMIN_PASSWORD='Choose-A-Strong-1' node server/server.js           # first run creates the owner account
     node server/server.js --demo        # local trial with DEMO data and demo staff (password Rokn@2026)
     PORT=8080 ROKN_DB=/var/lib/rokn/rokn.db COOKIE_SECURE=1 node server/server.js
   ========================================================================== */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const schema = require('../assets/js/biz/schema.js');
const createServices = require('../assets/js/biz/services.js');
const seed = require('../assets/js/biz/seed.js');
const nodeCrypto = require('./crypto-node.js');
const SqliteDB = require('./db-sqlite.js');
const loadCatalog = require('./load-catalog.js');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 8080);
const DEMO = process.argv.includes('--demo');
const DB_FILE = process.env.ROKN_DB || (DEMO ? ':memory:' : path.join(__dirname, 'data', 'rokn.db'));
const COOKIE = 'rokn_sid';
const SECURE = process.env.COOKIE_SECURE === '1';
const MAX_BODY = 4 * 1024 * 1024;

if (DB_FILE !== ':memory:') fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new SqliteDB(DB_FILE);
let pubCache = null;
const svc = createServices({ db, crypto: nodeCrypto, mode: 'server', hooks: { afterWrite: () => { pubCache = null; } } });

/* ---------------- first run ---------------- */
async function bootstrap() {
  if (!db.get('meta', 'seeded_at')) {
    const src = loadCatalog(ROOT);
    seed.base(svc, src);
    console.log('[rokn] base data seeded (catalogue, roles, permissions, printers, media)');
    if (DEMO) { const r = await seed.demo(svc, {}); console.log(`[rokn] DEMO data: ${r.orders} sample orders, ${r.users} demo staff (password ${r.password})`); }
  }
  if (!db.count('users')) {
    const pw = process.env.ROKN_ADMIN_PASSWORD;
    if (!pw || pw.length < 10) { console.error('[rokn] No users yet. Start once with ROKN_ADMIN_PASSWORD (10+ chars) to create the owner account.'); process.exit(1); }
    const id = 'usr_owner';
    db.insert('users', { id, created_at: new Date().toISOString(), name: process.env.ROKN_ADMIN_NAME || 'Store Owner', username: (process.env.ROKN_ADMIN_USER || 'owner').toLowerCase(),
      email: process.env.ROKN_ADMIN_EMAIL || '', phone: '', password_hash: await svc.hashPassword(pw), role_id: 'super_admin', status: 'active', lang: 'en', branch_id: 'main',
      must_change_password: true, failed_attempts: 0, demo: false, updated_at: new Date().toISOString() });
    db.insert('user_roles', { id: `${id}:super_admin`, user_id: id, role_id: 'super_admin' });
    console.log(`[rokn] owner account "${process.env.ROKN_ADMIN_USER || 'owner'}" created — you will be asked to change the password at first sign-in`);
  }
}

/* ---------------- helpers ---------------- */
const limits = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now(); const b = limits.get(key) || { n: 0, reset: now + windowMs };
  if (now > b.reset) { b.n = 0; b.reset = now + windowMs; }
  b.n++; limits.set(key, b);
  return b.n <= max;
}
setInterval(() => { const now = Date.now(); for (const [k, b] of limits) if (now > b.reset) limits.delete(k); }, 60000).unref();
const ipOf = req => (process.env.TRUST_PROXY === '1' && req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : req.socket.remoteAddress) || '';
const cookies = req => Object.fromEntries(String(req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(p => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
const SEC_HEADERS = {
  'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()', 'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://wa.me mailto:"
};
function send(res, status, body, headers) {
  const isStr = typeof body === 'string' || Buffer.isBuffer(body);
  res.writeHead(status, Object.assign({}, SEC_HEADERS, { 'Content-Type': isStr ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers || {}));
  res.end(isStr ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error('Payload too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}
const STATUS = { unauthenticated: 401, bad_credentials: 401, forbidden: 403, password_change_required: 403, locked: 429, inactive: 403, not_found: 404, insufficient_stock: 409, in_use: 409 };
function sessionCookie(token, maxAge) {
  return `${COOKIE}=${token ? encodeURIComponent(token) : ''}; Path=/api; HttpOnly; SameSite=Strict${SECURE ? '; Secure' : ''}; Max-Age=${maxAge}`;
}

/* ---------------- static files ---------------- */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml' };
const PRIVATE = /^\/(server|tools|node_modules|\.git)(\/|$)|\/\./;
function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  if (PRIVATE.test(p)) return send(res, 404, 'Not found');
  const file = path.join(ROOT, path.normalize(p));
  if (!file.startsWith(ROOT)) return send(res, 403, 'Forbidden');
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not found');
    const ext = path.extname(file).toLowerCase();
    if (p === '/index.html') {   // inject the live public catalogue so the storefront shows admin prices & stock instantly
      let html = fs.readFileSync(file, 'utf8');
      const pub = pubCache || (pubCache = svc.publicCatalog());
      html = html.replace('<script src="assets/js/config.js"></script>', `<script src="assets/js/config.js"></script>\n<script>window.ROKN.config.apiBase='/api';window.ROKN_PUB=${JSON.stringify(pub).replace(/</g, '\\u003c')};</script>`);
      return send(res, 200, html, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache' });
    }
    res.writeHead(200, Object.assign({}, SEC_HEADERS, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': /\.(webp|png|jpg|svg)$/.test(ext) ? 'public, max-age=604800' : 'no-cache', 'Content-Length': st.size }));
    fs.createReadStream(file).pipe(res);
  });
}

/* ---------------- API ---------------- */
async function api(req, res, url) {
  const ip = ipOf(req), device = String(req.headers['user-agent'] || '').slice(0, 160);
  if (url.pathname === '/api/health') return send(res, 200, { ok: true });
  if (req.method === 'GET' && url.pathname === '/api/public/catalog') {
    if (!rateLimit('cat:' + ip, 120, 60000)) return send(res, 429, { error: { code: 'rate_limited', message: 'Too many requests' } });
    return send(res, 200, pubCache || (pubCache = svc.publicCatalog()), { 'Cache-Control': 'public, max-age=30' });
  }
  if (req.method !== 'POST') return send(res, 405, { error: { code: 'method', message: 'POST only' } });
  let method;
  if (url.pathname === '/api/public/order') method = 'public.placeOrder';
  else { const m = url.pathname.match(/^\/api\/rpc\/([a-z_]+\.[a-zA-Z]+)$/); if (!m) return send(res, 404, { error: { code: 'not_found', message: 'Unknown endpoint' } }); method = m[1]; }
  // CSRF: admin calls must carry the custom header (cannot be set cross-site without CORS) — plus SameSite=Strict cookie
  if (method !== 'public.placeOrder' && req.headers['x-requested-with'] !== 'rokn-admin') return send(res, 403, { error: { code: 'csrf', message: 'Missing request header' } });
  if (method === 'auth.login' && !rateLimit('login:' + ip, 10, 15 * 60000)) return send(res, 429, { error: { code: 'rate_limited', message: 'Too many sign-in attempts. Try again in 15 minutes.' } });
  if (method === 'public.placeOrder' && !rateLimit('order:' + ip, 20, 10 * 60000)) return send(res, 429, { error: { code: 'rate_limited', message: 'Too many orders from this address' } });
  if (!rateLimit('rpc:' + ip, 600, 60000)) return send(res, 429, { error: { code: 'rate_limited', message: 'Too many requests' } });
  if (!svc.methods[method] || method === 'public.catalog') return send(res, 404, { error: { code: 'not_found', message: 'Unknown method' } });
  let args;
  try { args = await readBody(req); } catch (e) { return send(res, e.status || 400, { error: { code: 'bad_request', message: e.message } }); }
  const token = cookies(req)[COOKIE] || null;
  try {
    let result = await svc.call(token, method, args, { ip, device });
    const headers = {};
    if (method === 'auth.login') {
      headers['Set-Cookie'] = sessionCookie(result.token, Number(svc.settings().security.session_hours || 8) * 3600);
      result = Object.assign({}, result, { token: undefined });            // token lives only in the HttpOnly cookie
    }
    if (method === 'auth.logout') headers['Set-Cookie'] = sessionCookie('', 0);
    send(res, 200, { result }, headers);
  } catch (e) {
    const status = STATUS[e.code] || (e.code ? 400 : 500);
    if (status === 500) console.error('[rokn]', method, e);
    send(res, status, { error: { code: e.code || 'server_error', message: status === 500 ? 'Server error' : e.message } }, e.code === 'unauthenticated' ? { 'Set-Cookie': sessionCookie('', 0) } : {});
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) return api(req, res, url).catch(e => { console.error(e); send(res, 500, { error: { code: 'server_error', message: 'Server error' } }); });
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  serveStatic(req, res);
});
server.headersTimeout = 15000; server.requestTimeout = 30000;

bootstrap().then(() => server.listen(PORT, () => console.log(`[rokn] http://localhost:${PORT}  (db: ${DB_FILE}${DEMO ? ', DEMO' : ''})`)));
module.exports = { server, svc, db };
