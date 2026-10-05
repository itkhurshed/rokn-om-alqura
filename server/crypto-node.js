/* Node implementation of the crypto adapter used by services.js (same hash format as the browser). */
'use strict';
const crypto = require('crypto');
const b64 = b => Buffer.from(b).toString('base64');
module.exports = {
  randomBytes: async n => crypto.randomBytes(n).toString('base64url'),
  pbkdf2: (pw, salt, iter) => new Promise((res, rej) => crypto.pbkdf2(String(pw), Buffer.from(salt, 'base64url'), iter, 32, 'sha256', (e, k) => e ? rej(e) : res(k.toString('base64url')))),
  sha256: async s => crypto.createHash('sha256').update(String(s)).digest('hex'),
  safeEqual: (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); }
};
