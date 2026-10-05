/* ==========================================================================
   BUSINESS SERVICES — every read/write of the store-management system goes
   through call(token, method, args).  The same file runs:
     • on the Node API server (server/server.js)  ← authoritative in production
     • in the browser for the offline demo (assets/js/biz/local.js)
   Each method declares the permission it needs; call() authenticates the
   session, re-reads the role's permissions from the DB on EVERY call (so a
   permission change takes effect immediately), validates input, runs the
   method inside a transaction and writes the audit log.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./schema.js'));
  else { root.ROKN = root.ROKN || {}; root.ROKN.biz = root.ROKN.biz || {}; root.ROKN.biz.createServices = factory(root.ROKN.biz.schema); }
})(typeof self !== 'undefined' ? self : this, function (schema) {
  'use strict';

  class BizError extends Error { constructor(code, msg, extra) { super(msg || code); this.code = code; Object.assign(this, extra || {}); } }
  const r3 = n => Math.round((Number(n) || 0) * 1000) / 1000;
  const num = (v, d) => { const n = Number(v); return isFinite(n) ? n : (d === undefined ? 0 : d); };
  const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max || 500);
  const pad = (n, w) => String(n).padStart(w, '0');
  const dayKey = d => { const x = new Date(d); return `${x.getFullYear()}-${pad(x.getMonth() + 1, 2)}-${pad(x.getDate(), 2)}`; };
  const inRange = (iso, from, to) => { const k = dayKey(iso); return (!from || k >= from) && (!to || k <= to); };
  const SALE_STATUSES = ['completed', 'pending', 'processing', 'preparing', 'shipped', 'delivered', 'partially_refunded', 'refunded'];
  const isSale = o => SALE_STATUSES.includes(o.status);
  const need = (cond, code, msg) => { if (!cond) throw new BizError(code || 'invalid', msg); };
  const pick = (o, keys) => { const r = {}; keys.forEach(k => { if (o[k] !== undefined) r[k] = o[k]; }); return r; };
  const strip = u => { if (!u) return u; const c = Object.assign({}, u); delete c.password_hash; return c; };

  function createServices(opts) {
    const db = opts.db, crypto = opts.crypto;
    const clock = opts.now || (() => new Date());
    const now = () => clock().toISOString();
    const hooks = opts.hooks || {};
    let seq = 0;
    const uid = p => `${p}_${Date.now().toString(36)}${(++seq).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

    /* ------------------------- settings ------------------------- */
    function settings() {
      const out = JSON.parse(JSON.stringify(schema.settingsDefaults));
      db.all('settings').forEach(r => { out[r.id] = Object.assign({}, out[r.id] || {}, r.value || {}); });
      return out;
    }
    function nextNumber(kind) {
      const s = settings().invoice;
      const prefix = { invoice: s.prefix, quote: s.quote_prefix, po: s.po_prefix, expense: s.expense_prefix, held: 'HLD-' }[kind] || '';
      const key = 'seq_' + kind;
      const cur = db.get('meta', key);
      const start = kind === 'invoice' ? num(s.next_number, 1001) : 1001;
      const n = Math.max(cur ? cur.value : start - 1, kind === 'invoice' ? start - 1 : 0) + 1;
      db.upsert('meta', { id: key, value: n });
      return prefix + n;
    }

    /* ------------------------- auth / RBAC ------------------------- */
    async function hashPassword(pw) {
      const iter = 210000, salt = await crypto.randomBytes(16);
      return `pbkdf2$sha256$${iter}$${salt}$${await crypto.pbkdf2(pw, salt, iter)}`;
    }
    async function verifyPassword(pw, stored) {
      const parts = String(stored || '').split('$');
      if (parts[0] !== 'pbkdf2' || parts.length !== 5) return false;
      const h = await crypto.pbkdf2(pw, parts[3], Number(parts[2]));
      return crypto.safeEqual(h, parts[4]);
    }
    function checkPasswordPolicy(pw) {
      const sec = settings().security;
      need(typeof pw === 'string' && pw.length >= num(sec.min_password_length, 8), 'weak_password', `Password must be at least ${sec.min_password_length} characters`);
      if (sec.require_strong_password) need(/[A-Za-z]/.test(pw) && /\d/.test(pw), 'weak_password', 'Password must contain letters and numbers');
    }
    function permsFor(user) {
      if (!user) return {};
      const role = db.get('roles', user.role_id); if (!role) return {};
      if (role.id === 'super_admin') { const all = {}; schema.modules.forEach(m => { all[m] = schema.actions.slice(); }); return all; }
      const out = {};
      db.filter('role_permissions', rp => rp.role_id === role.id).forEach(rp => {
        const p = db.get('permissions', rp.permission_id); if (!p) return;
        (out[p.module] = out[p.module] || []).push(p.action);
      });
      return out;
    }
    const can = (perms, module, action) => !!(perms[module] && perms[module].includes(action));

    async function sessionUser(token) {
      if (!token) return null;
      const sid = await crypto.sha256(token);
      const s = db.get('sessions', sid); if (!s) return null;
      if (s.expires_at < now()) { db.remove('sessions', sid); return null; }
      const u = db.get('users', s.user_id);
      if (!u || u.status !== 'active') { db.remove('sessions', sid); return null; }
      db.update('sessions', sid, { last_seen_at: now() });
      return u;
    }

    /* ------------------------- audit + notifications ------------------------- */
    function log(ctx, action, module, record_id, summary, before, after) {
      db.insert('activity_logs', { id: uid('log'), created_at: now(), user_id: ctx.user ? ctx.user.id : 'system', user_name: ctx.user ? ctx.user.name : 'System',
        action, module, record_id: record_id || null, summary: summary || '', before: before || null, after: after || null, ip: ctx.ip || '', device: ctx.device || '' });
    }
    function notify(type, level, title, body, link) {
      const s = settings().notifications; if (s[type] === false) return;
      db.insert('notifications', { id: uid('ntf'), created_at: now(), type, level: level || 'info', title_en: title.en, title_ar: title.ar,
        body_en: body ? body.en : '', body_ar: body ? body.ar : '', link: link || '', read_by: [] });
    }

    /* ------------------------- inventory core ------------------------- */
    function variantInfo(variant_id) {
      const v = db.get('product_variants', variant_id); need(v, 'not_found', 'Variant not found: ' + variant_id);
      const p = db.get('products', v.product_id);
      const inv = db.get('inventory', variant_id) || db.insert('inventory', { id: variant_id, variant_id, product_id: v.product_id, warehouse_id: 'main',
        available_m: 0, reserved_m: 0, sold_m: 0, damaged_m: 0, min_stock_m: v.min_stock_m || settings().inventory.default_min_stock, updated_at: now() });
      return { v, p, inv };
    }
    /* Signed qty changes AVAILABLE metres; side buckets (sold/damaged/reserved) follow the type */
    function move(ctx, o) {
      const { v, p, inv } = variantInfo(o.variant_id);
      const qty = r3(o.qty);
      const before = r3(inv.available_m), after = r3(before + qty);
      if (after < 0 && !o.allowNegative && !settings().pos.allow_negative_stock) throw new BizError('insufficient_stock', `Not enough stock for ${v.sku}: ${before} m available`, { sku: v.sku, available: before });
      const patch = { available_m: after, updated_at: now() };
      if (o.type === 'sale') patch.sold_m = r3(inv.sold_m - qty);
      if (o.type === 'return') patch.sold_m = r3(Math.max(0, inv.sold_m - qty));
      if (o.type === 'damage') patch.damaged_m = r3(inv.damaged_m - qty);
      if (o.type === 'reservation') patch.reserved_m = r3(inv.reserved_m - qty);
      if (o.type === 'release') patch.reserved_m = r3(Math.max(0, inv.reserved_m - qty));
      db.update('inventory', inv.id, patch);
      if (o.roll_id) {
        const roll = db.get('fabric_rolls', o.roll_id);
        if (roll) {
          const rem = r3(roll.remaining_m + qty);
          need(rem >= 0 || o.allowNegative, 'roll_short', `Roll ${roll.barcode} has only ${roll.remaining_m} m`);
          const status = o.type === 'damage' && rem <= 0 ? 'damaged' : rem <= 0 ? 'finished' : rem < roll.original_m ? 'partial' : (roll.status === 'reserved' ? 'reserved' : 'available');
          db.update('fabric_rolls', roll.id, { remaining_m: Math.max(0, rem), status });
        }
      }
      db.insert('inventory_transactions', { id: uid('itx'), created_at: o.at || now(), variant_id: v.id, product_id: p.id, roll_id: o.roll_id || null, type: o.type,
        qty_m: qty, before_m: before, after_m: after, reason: str(o.reason, 300), ref_type: o.ref_type || null, ref_id: o.ref_id || null,
        user_id: ctx.user ? ctx.user.id : 'system', user_name: ctx.user ? ctx.user.name : 'System', demo: !!o.demo });
      if (!o.silent) {
        const min = num(inv.min_stock_m, settings().inventory.default_min_stock);
        const name = { en: `${p.name_en} — ${v.color}`, ar: `${p.name_ar} — ${v.color}` };
        if (after <= 0 && before > 0) notify('out_of_stock', 'danger', { en: 'Out of stock', ar: 'نفد من المخزون' }, { en: `${name.en} (${v.sku}) is out of stock.`, ar: `${name.ar} (${v.sku}) نفد من المخزون.` }, 'inventory');
        else if (after <= min && before > min && settings().inventory.low_stock_alerts) notify('low_stock', 'warning', { en: 'Low stock', ar: 'مخزون منخفض' }, { en: `${name.en} (${v.sku}): ${after} m left (minimum ${min} m).`, ar: `${name.ar} (${v.sku}): متبقٍ ${after} م (الحد الأدنى ${min} م).` }, 'inventory');
      }
      return after;
    }

    /* ------------------------- orders core ------------------------- */
    function priceLines(items, allowDiscountPct) {
      const st = settings();
      const step = num(st.inventory.meter_step, 0.5);
      return items.map(it => {
        const { v, p } = variantInfo(it.variant_id);
        need(p.status !== 'archived', 'invalid', 'Product archived: ' + p.name_en);
        const meters = r3(num(it.meters));
        need(meters > 0 && meters <= 10000, 'invalid_qty', 'Invalid metres');
        need(Math.abs(meters / step - Math.round(meters / step)) < 1e-6 || it.anyQty, 'invalid_qty', `Metres must be in steps of ${step}`);
        const price = r3(v.price_per_meter || p.price_per_meter);       // price ALWAYS comes from the database
        const cost = r3(v.cost_per_meter || p.cost_per_meter || 0);
        const gross = r3(meters * price);
        const disc = r3(Math.min(gross, Math.max(0, num(it.discount))));
        if (allowDiscountPct != null) need(disc <= gross * allowDiscountPct / 100 + 0.0005, 'discount_limit', `Line discount above ${allowDiscountPct}% needs a manager`);
        return { v, p, meters, price, cost, gross, disc, total: r3(gross - disc), roll_id: it.roll_id || null };
      });
    }
    function totalsFor(lines, orderDiscount, shipping) {
      const st = settings();
      const subtotal = r3(lines.reduce((s, l) => s + l.gross, 0));
      const discount = r3(Math.min(subtotal, lines.reduce((s, l) => s + l.disc, 0) + Math.max(0, num(orderDiscount))));
      const base = r3(subtotal - discount);
      let tax = 0;
      if (st.tax.enabled && num(st.tax.rate) > 0) tax = st.tax.inclusive ? r3(base - base / (1 + st.tax.rate / 100)) : r3(base * st.tax.rate / 100);
      const ship = r3(num(shipping));
      const total = r3(base + (st.tax.inclusive ? 0 : tax) + ship);
      return { subtotal, discount, tax, shipping: ship, total, cost_total: r3(lines.reduce((s, l) => s + l.meters * l.cost, 0)) };
    }
    function resolveCustomer(ctx, a) {
      if (a.customer_id) { const c = db.get('customers', a.customer_id); need(c, 'not_found', 'Customer not found'); return c; }
      if (a.new_customer && (a.new_customer.name || a.new_customer.phone)) {
        const nc = a.new_customer;
        const phone = str(nc.phone, 20).replace(/[^\d+]/g, '');
        const existing = phone && db.find('customers', c => c.phone && c.phone.replace(/[^\d+]/g, '') === phone);
        if (existing) return existing;
        const c = db.insert('customers', { id: uid('cus'), created_at: now(), name: str(nc.name, 120) || phone, phone, email: str(nc.email, 160).toLowerCase(),
          addresses: nc.address ? [nc.address] : [], notes: '', lang: nc.lang || '', source: a.channel || 'pos', tags: [] });
        notify('new_customer', 'info', { en: 'New customer', ar: 'عميل جديد' }, { en: c.name, ar: c.name }, 'customers');
        log(ctx, 'create', 'customers', c.id, `Customer ${c.name}`, null, c);
        return c;
      }
      return null;
    }
    function writeOrder(ctx, o, lines) {
      db.insert('orders', o);
      lines.forEach(l => db.insert('order_items', { id: uid('itm'), created_at: o.created_at, order_id: o.id, product_id: l.p.id, variant_id: l.v.id, roll_id: l.roll_id,
        name_en: l.p.name_en, name_ar: l.p.name_ar, color: l.v.color, sku: l.v.sku, meters: l.meters, price_per_meter: l.price, cost_per_meter: l.cost,
        discount: l.disc, total: l.total, returned_m: 0 }));
    }
    function fullOrder(id) {
      const o = db.get('orders', id); need(o, 'not_found', 'Order not found');
      o.items = db.filter('order_items', i => i.order_id === id);
      o.payments = db.filter('payments', p => p.order_id === id);
      o.refunds = db.filter('refunds', r => r.order_id === id);
      o.customer = o.customer_id ? db.get('customers', o.customer_id) : null;
      return o;
    }
    function deductStock(ctx, o, items, demo) {
      items.forEach(i => move(ctx, { variant_id: i.variant_id, qty: -i.meters, type: 'sale', roll_id: i.roll_id, ref_type: 'order', ref_id: o.id, reason: o.number, at: o.created_at, demo }));
    }
    function storePayment(ctx, o, method, amount, extra) {
      db.insert('payments', Object.assign({ id: uid('pay'), created_at: o.created_at, order_id: o.id, method, amount: r3(amount), tendered: null, change: null,
        reference: '', status: 'captured', user_id: ctx.user ? ctx.user.id : 'system', demo: !!o.demo }, extra || {}));
      if (!o.demo) notify('payment', 'success', { en: 'Payment received', ar: 'تم استلام دفعة' }, { en: `${o.number}: KWD ${r3(amount).toFixed(3)} (${method})`, ar: `${o.number}: ${r3(amount).toFixed(3)} د.ك (${method})` }, 'sales');
    }
    const enabledMethods = (channel) => {
      const p = settings().payments;
      return ['cash', 'knet', 'card', 'bank_transfer', 'other', 'cod', 'applepay'].filter(m => p[m] && (channel === 'web' ? m !== 'cash' : m !== 'cod'));
    };

    /* ------------------------- reports core ------------------------- */
    function salesIn(from, to, f) {
      f = f || {};
      return db.filter('orders', o => isSale(o) && inRange(o.created_at, from, to)
        && (!f.channel || o.channel === f.channel) && (!f.user || o.salesperson_id === f.user)
        && (!f.payment || o.payment_method === f.payment) && (!f.customer || o.customer_id === f.customer));
    }
    function metrics(from, to, f) {
      f = f || {};
      let orders = salesIn(from, to, f);
      const itemsBy = {};
      db.filter('order_items', () => true).forEach(i => { (itemsBy[i.order_id] = itemsBy[i.order_id] || []).push(i); });
      if (f.product || f.category) {
        orders = orders.filter(o => (itemsBy[o.id] || []).some(i => (!f.product || i.product_id === f.product) && (!f.category || (db.get('products', i.product_id) || {}).category === f.category)));
      }
      const ids = new Set(orders.map(o => o.id));
      const refunds = db.filter('refunds', r => inRange(r.created_at, from, to) && (!f.payment || r.method === f.payment) && (!(f.channel || f.user || f.customer || f.product || f.category) || ids.has(r.order_id)));
      const refundTotal = r3(refunds.reduce((s, r) => s + r.amount, 0));
      const expenses = db.filter('expenses', e => (!from || e.date >= from) && (!to || e.date <= to));
      const expenseTotal = r3(expenses.reduce((s, e) => s + e.amount, 0));
      const gross = r3(orders.reduce((s, o) => s + o.total, 0));
      const discounts = r3(orders.reduce((s, o) => s + (o.discount || 0), 0));
      const tax = r3(orders.reduce((s, o) => s + (o.tax || 0), 0));
      const shipping = r3(orders.reduce((s, o) => s + (o.shipping || 0), 0));
      let meters = 0, cogs = 0, revenueGoods = 0, lines = 0;
      const byProduct = {}, byCategory = {}, byColor = {};
      orders.forEach(o => {
        const its = itemsBy[o.id] || [];
        const itemsSum = its.reduce((s, i) => s + i.total, 0) || 1;
        const orderDisc = Math.max(0, (o.discount || 0) - its.reduce((s, i) => s + (i.discount || 0), 0));
        its.forEach(i => {
          const kept = Math.max(0, i.meters - (i.returned_m || 0)); if (!kept) return;
          const share = kept / i.meters;
          const rev = (i.total - orderDisc * (i.total / itemsSum)) * share;
          meters += kept; cogs += kept * (i.cost_per_meter || 0); revenueGoods += rev; lines++;
          const p = db.get('products', i.product_id) || { category: '?' };
          const bp = byProduct[i.product_id] = byProduct[i.product_id] || { id: i.product_id, name_en: i.name_en, name_ar: i.name_ar, meters: 0, revenue: 0, orders: 0, cost: 0 };
          bp.meters += kept; bp.revenue += rev; bp.orders++; bp.cost += kept * (i.cost_per_meter || 0);
          const bc = byCategory[p.category] = byCategory[p.category] || { id: p.category, meters: 0, revenue: 0 };
          bc.meters += kept; bc.revenue += rev;
          const bk = byColor[i.color] = byColor[i.color] || { id: i.color, meters: 0, revenue: 0 }; bk.meters += kept; bk.revenue += rev;
        });
      });
      const pays = db.filter('payments', p => ids.has(p.order_id));
      const byPayment = {};
      pays.forEach(p => { byPayment[p.method] = r3((byPayment[p.method] || 0) + p.amount); });
      refunds.forEach(r => { byPayment[r.method] = r3((byPayment[r.method] || 0) - r.amount); });
      const round = o => { Object.values(o).forEach(x => { ['meters', 'revenue', 'cost'].forEach(k => { if (x[k] != null) x[k] = r3(x[k]); }); }); return Object.values(o).sort((a, b) => b.revenue - a.revenue); };
      const netSales = r3(gross - refundTotal);
      const grossProfit = r3(revenueGoods - cogs);
      return {
        from, to, orders: orders.length, gross, discounts, tax, shipping, refunds: refundTotal, netSales, expenses: expenseTotal,
        grossProfit, netProfit: r3(grossProfit - expenseTotal), meters: r3(meters), lines, cogs: r3(cogs),
        aov: orders.length ? r3(gross / orders.length) : 0,
        byProduct: round(byProduct), byCategory: round(byCategory), byColor: round(byColor), byPayment,
        byStaff: Object.values(orders.reduce((a, o) => { const k = o.salesperson_id || 'web'; a[k] = a[k] || { id: k, name: o.salesperson_name || 'Website', orders: 0, revenue: 0 }; a[k].orders++; a[k].revenue = r3(a[k].revenue + o.total); return a; }, {})).sort((a, b) => b.revenue - a.revenue),
        byChannel: orders.reduce((a, o) => { a[o.channel] = r3((a[o.channel] || 0) + o.total); return a; }, {}),
        orderList: orders
      };
    }
    function series(from, to, gran) {
      const out = {}; const orders = salesIn(from, to);
      const keyOf = iso => {
        const d = new Date(iso);
        if (gran === 'year') return String(d.getFullYear());
        if (gran === 'month') return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}`;
        if (gran === 'week') { const t = new Date(d); t.setDate(d.getDate() - ((d.getDay() + 1) % 7)); return dayKey(t); } // week starts Saturday
        return dayKey(d);
      };
      // pre-fill buckets so charts have continuous axes
      if (from && to) {
        const a = new Date(from + 'T00:00:00'), b = new Date(to + 'T00:00:00');
        for (let d = new Date(a); d <= b; d.setDate(d.getDate() + 1)) out[keyOf(d)] = out[keyOf(d)] || { key: keyOf(d), sales: 0, orders: 0 };
      }
      orders.forEach(o => { const k = keyOf(o.created_at); out[k] = out[k] || { key: k, sales: 0, orders: 0 }; out[k].sales = r3(out[k].sales + o.total); out[k].orders++; });
      return Object.values(out).sort((a, b) => a.key.localeCompare(b.key));
    }
    function stockRows() {
      return db.all('product_variants').map(v => {
        const p = db.get('products', v.product_id) || {};
        const inv = db.get('inventory', v.id) || { available_m: 0, reserved_m: 0, sold_m: 0, damaged_m: 0, min_stock_m: 0 };
        const price = v.price_per_meter || p.price_per_meter || 0, cost = v.cost_per_meter || p.cost_per_meter || 0;
        const rolls = db.filter('fabric_rolls', r => r.variant_id === v.id && r.remaining_m > 0 && r.status !== 'damaged').length;
        return { id: v.id, product_id: p.id, product_en: p.name_en, product_ar: p.name_ar, status: p.status, category: p.category, fabric_type: p.fabric_type,
          material: p.material, pattern: p.pattern, width_cm: p.width_cm, color: v.color, sku: v.sku, barcode: v.barcode, price, cost,
          available: r3(inv.available_m), reserved: r3(inv.reserved_m), sold: r3(inv.sold_m), damaged: r3(inv.damaged_m), min: r3(inv.min_stock_m), rolls,
          value_cost: r3(inv.available_m * cost), value_retail: r3(inv.available_m * price), image: (p.images && p.images.drapeSm) || null,
          state: inv.available_m <= 0 ? 'out' : inv.available_m <= inv.min_stock_m ? 'low' : 'ok' };
      });
    }

    /* ------------------------- public catalogue snapshot ------------------------- */
    function publicCatalog() {
      const st = settings();
      const products = db.filter('products', p => p.status === 'active' || p.status === 'draft').map(p => {
        const rec = Object.assign({}, p);
        ['cost_per_meter', 'demo', 'updated_at', 'barcode'].forEach(k => delete rec[k]);
        rec.sold_count = r3(db.filter('order_items', i => i.product_id === p.id).reduce((s, i) => s + i.meters, 0));
        rec.variants = db.filter('product_variants', v => v.product_id === p.id && v.status !== 'archived').map(v => {
          const inv = db.get('inventory', v.id) || { available_m: 0, reserved_m: 0 };
          const o = { color: v.color, sku: v.sku, stock_m: Math.max(0, r3(inv.available_m - (inv.reserved_m || 0))) };
          if (v.price_per_meter && v.price_per_meter !== p.price_per_meter) o.price_per_meter = v.price_per_meter;
          return o;
        });
        return rec;
      });
      const pub = {}; schema.publicSettings.forEach(k => { pub[k] = st[k]; });
      return {
        version: now(), seed: (db.get('meta', 'seed_version') || {}).value || 1, products,
        categories: db.all('categories').filter(c => c.status !== 'archived').sort((a, b) => (a.sort || 0) - (b.sort || 0)),
        collections: db.all('collections').filter(c => c.status !== 'archived').sort((a, b) => (a.sort || 0) - (b.sort || 0)),
        colors: db.all('colors'),
        coupons: db.filter('coupons', c => c.active).map(c => pick(c, ['code', 'type', 'value', 'min'])),
        settings: pub
      };
    }

    /* =====================================================================
       METHOD REGISTRY   [module, action] = permission; null = public
       ===================================================================== */
    const M = {};
    const def = (name, perm, fn, o) => { M[name] = Object.assign({ perm, fn, write: true }, o || {}); };
    const read = (name, perm, fn) => def(name, perm, fn, { write: false });

    /* ---------- auth ---------- */
    def('auth.login', null, async (ctx, a) => {
      const sec = settings().security;
      const username = str(a.username, 80).toLowerCase();
      need(username && a.password, 'invalid', 'Username and password required');
      const u = db.find('users', x => x.username.toLowerCase() === username || (x.email && x.email.toLowerCase() === username));
      const fail = () => { throw new BizError('bad_credentials', 'Incorrect username or password'); };
      if (!u) { await crypto.pbkdf2(a.password, 'AAAAAAAAAAAAAAAAAAAAAA==', 210000); fail(); } // constant-ish time
      if (u.locked_until && u.locked_until > now()) throw new BizError('locked', 'Account temporarily locked after failed attempts', { until: u.locked_until });
      if (u.status !== 'active') throw new BizError('inactive', 'This account is ' + u.status);
      if (!(await verifyPassword(a.password, u.password_hash))) {
        const n = (u.failed_attempts || 0) + 1;
        const patch = { failed_attempts: n };
        if (n >= num(sec.max_failed_logins, 5)) { patch.locked_until = new Date(clock().getTime() + num(sec.lockout_minutes, 15) * 60000).toISOString(); patch.failed_attempts = 0; }
        db.update('users', u.id, patch);
        log(Object.assign({}, ctx, { user: u }), 'login_failed', 'users', u.id, 'Failed login');
        fail();
      }
      const token = await crypto.randomBytes(32);
      const sid = await crypto.sha256(token);
      db.insert('sessions', { id: sid, created_at: now(), user_id: u.id, expires_at: new Date(clock().getTime() + num(sec.session_hours, 8) * 3600000).toISOString(),
        last_seen_at: now(), ip: ctx.ip || '', device: ctx.device || '' });
      db.update('users', u.id, { failed_attempts: 0, locked_until: null, last_login_at: now() });
      log(Object.assign({}, ctx, { user: u }), 'login', 'users', u.id, 'Signed in');
      return { token, user: strip(db.get('users', u.id)), perms: permsFor(u) };
    }, { noTx: true });   // failed-attempt counters must persist even though the call throws
    def('auth.logout', 'self', async (ctx) => { if (ctx.sid) db.remove('sessions', ctx.sid); log(ctx, 'logout', 'users', ctx.user.id, 'Signed out'); return true; });
    read('auth.me', 'self', ctx => { const st = settings(); return { user: strip(ctx.user), perms: ctx.perms, mode: opts.mode || 'server',
      settings: { business: st.business, languages: st.languages, currency: st.currency, receipt: st.receipt, invoice: st.invoice, tax: st.tax, pos: st.pos, inventory: st.inventory, payments: st.payments, whatsapp: st.whatsapp },
      printers: db.filter('printers', p => p.is_default && p.status !== 'inactive'), demo: !!(db.get('meta', 'demo') || {}).value,
      unread: db.filter('notifications', n => visibleNotif(ctx, n) && !(n.read_by || []).includes(ctx.user.id)).length }; });
    def('auth.changePassword', 'self', async (ctx, a) => {
      const u = db.get('users', ctx.user.id);
      need(await verifyPassword(a.current || '', u.password_hash), 'bad_credentials', 'Current password is incorrect');
      checkPasswordPolicy(a.next);
      db.update('users', u.id, { password_hash: await hashPassword(a.next), must_change_password: false, updated_at: now() });
      db.filter('sessions', s => s.user_id === u.id && s.id !== ctx.sid).forEach(s => db.remove('sessions', s.id));
      log(ctx, 'password_change', 'users', u.id, 'Changed own password');
      return true;
    });
    def('auth.setLang', 'self', (ctx, a) => { need(['en', 'ar'].includes(a.lang), 'invalid'); db.update('users', ctx.user.id, { lang: a.lang }); return true; }, { noAudit: true });

    /* ---------- dashboard ---------- */
    read('dashboard.summary', ['dashboard', 'view'], (ctx, a) => {
      const today = dayKey(clock());
      const from = a.from || today, to = a.to || today;
      const m = metrics(from, to);
      const stock = stockRows().filter(r => r.status === 'active');
      const ordersIn = db.filter('orders', o => inRange(o.created_at, from, to));
      const gran = a.granularity || 'day';
      const span = { day: 13, week: 7 * 11, month: 365, year: 365 * 5 }[gran];
      const sFrom = dayKey(new Date(new Date(to + 'T12:00:00').getTime() - span * 86400000));
      const recentTx = db.all('inventory_transactions').sort((x, y) => y.created_at.localeCompare(x.created_at)).slice(0, 8);
      return {
        from, to, kpi: {
          sales: m.gross, orders: m.orders, productsSold: m.lines, meters: m.meters, grossProfit: m.grossProfit, expenses: m.expenses, netSales: m.netSales,
          refunds: m.refunds, aov: m.aov, lowStock: stock.filter(r => r.state === 'low').length, outOfStock: stock.filter(r => r.state === 'out').length,
          pending: db.filter('orders', o => ['pending', 'processing', 'preparing'].includes(o.status)).length,
          cancelled: ordersIn.filter(o => o.status === 'cancelled').length
        },
        trend: series(sFrom, to, gran), granularity: gran,
        topProducts: m.byProduct.slice(0, 6), topCategories: m.byCategory.slice(0, 6), byPayment: m.byPayment, byChannel: m.byChannel,
        recentOrders: db.all('orders').filter(o => o.status !== 'held').sort((x, y) => y.created_at.localeCompare(x.created_at)).slice(0, 8),
        recentTx, lowStock: stock.filter(r => r.state !== 'ok').sort((x, y) => x.available - y.available).slice(0, 8)
      };
    });

    /* ---------- sales / orders ---------- */
    const listOrders = (a, channel) => {
      const qq = str(a.q, 80).toLowerCase();
      return db.filter('orders', o => (!channel || o.channel === channel) && (a.status ? (a.status === 'open' ? ['pending', 'processing', 'preparing', 'shipped'].includes(o.status) : o.status === a.status) : !['held', 'quote'].includes(o.status))
        && inRange(o.created_at, a.from, a.to) && (!a.payment || o.payment_method === a.payment) && (!a.user || o.salesperson_id === a.user)
        && (!a.channel || o.channel === a.channel) && (!a.payment_status || o.payment_status === a.payment_status)
        && (!qq || [o.number, o.customer_name, o.customer_phone, o.customer_email].join(' ').toLowerCase().includes(qq)))
        .sort((x, y) => y.created_at.localeCompare(x.created_at))
        .map(o => { const its = db.filter('order_items', i => i.order_id === o.id); return Object.assign(o, { item_count: its.length, meters: r3(its.reduce((s, i) => s + i.meters, 0)), products: its.map(i => i.name_en).join(', '), products_ar: its.map(i => i.name_ar).join('، ') }); });
    };
    read('sales.list', ['sales', 'view'], (ctx, a) => listOrders(a || {}, null));
    read('orders.list', ['orders', 'view'], (ctx, a) => listOrders(a || {}, 'web'));
    read('sales.get', ['sales', 'view'], (ctx, a) => fullOrder(a.id));
    read('orders.get', ['orders', 'view'], (ctx, a) => fullOrder(a.id));
    def('sales.update', ['sales', 'edit'], (ctx, a) => {
      const before = db.get('orders', a.id); need(before, 'not_found');
      const patch = pick(a.patch || {}, ['notes', 'customer_name', 'customer_phone', 'customer_email', 'payment_status']);
      if (patch.payment_status) need(schema.enums.paymentStatus.includes(patch.payment_status), 'invalid');
      const after = db.update('orders', a.id, Object.assign(patch, { updated_at: now() }));
      log(ctx, 'update', 'sales', a.id, `Edited ${before.number}`, pick(before, Object.keys(patch)), pick(after, Object.keys(patch)));
      return after;
    });
    def('orders.setStatus', ['orders', 'edit'], (ctx, a) => {
      const o = db.get('orders', a.id); need(o, 'not_found');
      need(schema.enums.fulfilment.concat(['completed']).includes(a.status), 'invalid', 'Invalid status');
      need(!['cancelled', 'refunded'].includes(o.status), 'invalid', 'Order is ' + o.status);
      const after = db.update('orders', o.id, { status: a.status, updated_at: now(), completed_at: a.status === 'delivered' ? now() : o.completed_at });
      log(ctx, 'status', 'orders', o.id, `${o.number}: ${o.status} → ${a.status}`, { status: o.status }, { status: a.status });
      return after;
    });
    def('sales.cancel', ['sales', 'delete'], (ctx, a) => {
      const o = fullOrder(a.id);
      need(!['cancelled', 'refunded', 'partially_refunded'].includes(o.status), 'invalid', 'Order already ' + o.status);
      if (!['held', 'quote'].includes(o.status)) {
        o.items.forEach(i => { const back = r3(i.meters - (i.returned_m || 0)); if (back > 0) move(ctx, { variant_id: i.variant_id, qty: back, type: 'return', roll_id: i.roll_id, ref_type: 'cancel', ref_id: o.id, reason: 'Cancelled ' + o.number }); });
        const paid = r3(o.payments.reduce((s, p) => s + p.amount, 0) - o.refunds.reduce((s, r) => s + r.amount, 0));
        if (paid > 0) db.insert('refunds', { id: uid('rfd'), created_at: now(), order_id: o.id, return_id: null, amount: paid, method: o.payment_method, reason: 'Cancelled: ' + str(a.reason, 200), user_id: ctx.user.id });
      }
      db.update('orders', o.id, { status: 'cancelled', payment_status: o.payments.length ? 'refunded' : 'unpaid', updated_at: now(), notes: [o.notes, 'Cancelled: ' + str(a.reason, 200)].filter(Boolean).join('\n') });
      log(ctx, 'cancel', 'sales', o.id, `Cancelled ${o.number}`, { status: o.status }, { status: 'cancelled' });
      return fullOrder(o.id);
    });
    def('sales.refund', ['sales', 'edit'], (ctx, a) => {
      const o = fullOrder(a.id);
      need(isSale(o) && o.status !== 'refunded', 'invalid', 'Order cannot be refunded');
      const lines = (a.lines || []).map(l => { const it = o.items.find(i => i.id === l.item_id); need(it, 'invalid', 'Item not on order'); const m = r3(l.meters); need(m > 0 && m <= r3(it.meters - (it.returned_m || 0)), 'invalid_qty', `Max ${r3(it.meters - (it.returned_m || 0))} m for ${it.sku}`); return { it, m }; });
      need(lines.length, 'invalid', 'Choose at least one line');
      const itemsSum = o.items.reduce((s, i) => s + i.total, 0) || 1;
      const orderDisc = Math.max(0, (o.discount || 0) - o.items.reduce((s, i) => s + (i.discount || 0), 0));
      let amount = r3(lines.reduce((s, { it, m }) => s + (it.total - orderDisc * it.total / itemsSum) * (m / it.meters), 0));
      if (a.amount != null) { need(num(a.amount) >= 0 && num(a.amount) <= amount + 0.001, 'invalid', 'Refund amount above returned value'); amount = r3(a.amount); }
      const ret = db.insert('returns', { id: uid('ret'), created_at: now(), order_id: o.id, items: lines.map(({ it, m }) => ({ item_id: it.id, sku: it.sku, meters: m })), reason: str(a.reason, 300), restock: a.restock !== false, user_id: ctx.user.id });
      lines.forEach(({ it, m }) => {
        db.update('order_items', it.id, { returned_m: r3((it.returned_m || 0) + m) });
        if (a.restock !== false) move(ctx, { variant_id: it.variant_id, qty: m, type: 'return', ref_type: 'return', ref_id: ret.id, reason: `Return ${o.number}` });
        else move(ctx, { variant_id: it.variant_id, qty: 0, type: 'damage', ref_type: 'return', ref_id: ret.id, reason: `Returned damaged ${m} m — ${o.number}`, silent: true });
      });
      const method = enabledMethods('pos').concat(['cash', 'other']).includes(a.method) ? a.method : o.payment_method;
      const rf = db.insert('refunds', { id: uid('rfd'), created_at: now(), order_id: o.id, return_id: ret.id, amount, method, reason: str(a.reason, 300), user_id: ctx.user.id });
      const items = db.filter('order_items', i => i.order_id === o.id);
      const full = items.every(i => r3(i.meters - (i.returned_m || 0)) <= 0);
      db.update('orders', o.id, { status: full ? 'refunded' : 'partially_refunded', payment_status: full ? 'refunded' : o.payment_status, refunded: r3((o.refunded || 0) + amount), updated_at: now() });
      notify('refund', 'warning', { en: 'Refund issued', ar: 'تم إصدار استرداد' }, { en: `${o.number}: KWD ${amount.toFixed(3)}`, ar: `${o.number}: ${amount.toFixed(3)} د.ك` }, 'sales');
      log(ctx, 'refund', 'sales', o.id, `Refund ${amount.toFixed(3)} on ${o.number}`, null, { lines: lines.map(({ it, m }) => `${it.sku} ${m}m`), amount, method });
      return Object.assign(fullOrder(o.id), { refund: rf });
    });

    /* ---------- POS ---------- */
    read('pos.catalog', ['pos', 'view'], () => {
      const st = settings();
      return {
        products: db.filter('products', p => p.status === 'active').map(p => pick(p, ['id', 'sku', 'name_en', 'name_ar', 'category', 'fabric_type', 'material', 'pattern', 'price_per_meter', 'images', 'width_cm', 'barcode'])),
        variants: db.filter('product_variants', v => v.status !== 'archived').map(v => Object.assign(pick(v, ['id', 'product_id', 'color', 'sku', 'barcode', 'price_per_meter']), { stock: r3((db.get('inventory', v.id) || {}).available_m || 0) })),
        rolls: db.filter('fabric_rolls', r => r.remaining_m > 0 && ['available', 'partial'].includes(r.status)).map(r => pick(r, ['id', 'barcode', 'variant_id', 'remaining_m', 'batch', 'location'])),
        held: db.filter('orders', o => o.status === 'held').map(o => Object.assign(pick(o, ['id', 'number', 'customer_name', 'total', 'created_at', 'salesperson_name']), { items: db.filter('order_items', i => i.order_id === o.id).map(i => pick(i, ['variant_id', 'meters', 'discount', 'roll_id'])) })),
        quotes: db.filter('orders', o => o.status === 'quote').sort((x, y) => y.created_at.localeCompare(x.created_at)).slice(0, 30).map(o => Object.assign(pick(o, ['id', 'number', 'customer_name', 'total', 'created_at']), { items: db.filter('order_items', i => i.order_id === o.id).map(i => pick(i, ['variant_id', 'meters', 'discount', 'roll_id'])) })),
        methods: enabledMethods('pos'), settings: { pos: st.pos, tax: st.tax, inventory: st.inventory, currency: st.currency }
      };
    });
    function posOrder(ctx, a, status) {
      need(Array.isArray(a.items) && a.items.length, 'invalid', 'Cart is empty');
      const isManager = can(ctx.perms, 'sales', 'edit');
      const lines = priceLines(a.items, isManager ? 100 : num(settings().pos.max_line_discount_pct, 20));
      const t = totalsFor(lines, a.discount, 0);
      if (!isManager) need(t.discount <= t.subtotal * num(settings().pos.max_line_discount_pct, 20) / 100 + 0.001, 'discount_limit', 'Discount above the cashier limit');
      const cust = resolveCustomer(ctx, Object.assign({ channel: 'pos' }, a));
      if (settings().pos.require_customer && status === 'completed') need(cust, 'invalid', 'Customer required');
      const created = now();
      const o = Object.assign({ id: uid('ord'), created_at: created, number: nextNumber(status === 'quote' ? 'quote' : status === 'held' ? 'held' : 'invoice'), channel: 'pos', status,
        customer_id: cust ? cust.id : null, customer_name: cust ? cust.name : (a.customer_name || settings().pos.walk_in_label_en), customer_phone: cust ? cust.phone : '', customer_email: cust ? cust.email : '',
        salesperson_id: ctx.user.id, salesperson_name: ctx.user.name, branch_id: ctx.user.branch_id || 'main', paid: 0, refunded: 0, payment_method: null,
        payment_status: 'unpaid', ship_method: 'pickup', address: null, coupon: null, notes: str(a.notes, 500), updated_at: created, completed_at: null }, t);
      return { o, lines };
    }
    def('pos.checkout', ['pos', 'create'], (ctx, a) => {
      const { o, lines } = posOrder(ctx, a, 'completed');
      const pay = a.payment || {};
      need(enabledMethods('pos').includes(pay.method), 'invalid', 'Payment method not enabled');
      let tendered = null, change = null;
      if (pay.method === 'cash' && pay.tendered != null) { tendered = r3(pay.tendered); need(tendered + 0.0005 >= o.total, 'invalid', 'Cash tendered is less than total'); change = r3(tendered - o.total); }
      Object.assign(o, { paid: o.total, payment_method: pay.method, payment_status: 'paid', completed_at: o.created_at });
      // check every line's stock BEFORE writing anything (transaction also rolls back on error)
      writeOrder(ctx, o, lines);
      deductStock(ctx, o, db.filter('order_items', i => i.order_id === o.id));
      storePayment(ctx, o, pay.method, o.total, { tendered, change, reference: str(pay.reference, 80) });
      if (a.held_id) { const h = db.get('orders', a.held_id); if (h && h.status === 'held') { db.filter('order_items', i => i.order_id === h.id).forEach(i => db.remove('order_items', i.id)); db.remove('orders', h.id); } }
      if (a.quote_id) { const qd = db.get('orders', a.quote_id); if (qd && qd.status === 'quote') db.update('orders', qd.id, { notes: [qd.notes, 'Converted to ' + o.number].filter(Boolean).join('\n'), status: 'cancelled' }); }
      log(ctx, 'sale', 'pos', o.id, `POS sale ${o.number} KWD ${o.total.toFixed(3)} (${pay.method})`, null, { total: o.total, items: lines.map(l => `${l.v.sku} ${l.meters}m`) });
      return fullOrder(o.id);
    });
    def('pos.hold', ['pos', 'create'], (ctx, a) => {
      if (a.held_id) { const h = db.get('orders', a.held_id); if (h && h.status === 'held') { db.filter('order_items', i => i.order_id === h.id).forEach(i => db.remove('order_items', i.id)); db.remove('orders', h.id); } }
      const { o, lines } = posOrder(ctx, a, 'held'); writeOrder(ctx, o, lines);
      log(ctx, 'hold', 'pos', o.id, `Held sale ${o.number}`); return fullOrder(o.id);
    });
    def('pos.quote', ['pos', 'create'], (ctx, a) => {
      const { o, lines } = posOrder(ctx, a, 'quote'); writeOrder(ctx, o, lines);
      log(ctx, 'quote', 'pos', o.id, `Quotation ${o.number}`); return fullOrder(o.id);
    });
    def('pos.discardHeld', ['pos', 'create'], (ctx, a) => {
      const h = db.get('orders', a.id); need(h && ['held', 'quote'].includes(h.status), 'not_found');
      db.filter('order_items', i => i.order_id === h.id).forEach(i => db.remove('order_items', i.id)); db.remove('orders', h.id);
      log(ctx, 'discard', 'pos', h.id, `Discarded ${h.number}`); return true;
    });

    /* ---------- public storefront (no login) ---------- */
    read('public.catalog', null, () => publicCatalog());
    def('public.placeOrder', null, (ctx, a) => {
      need(Array.isArray(a.lines) && a.lines.length && a.lines.length <= 50, 'invalid', 'Empty order');
      need(str(a.name, 120) && str(a.phone, 20), 'invalid', 'Name and phone required');
      if (a.number && db.find('orders', o => o.number === a.number)) return { duplicate: true };
      const lines = priceLines(a.lines.map(l => ({ variant_id: `${l.id}:${l.color}`, meters: l.qty })));
      const st = settings();
      const fee = { standard: st.shipping.standard_fee, express: st.shipping.express_fee, pickup: st.shipping.pickup_fee }[a.shipMethod] || 0;
      let disc = 0;
      if (a.coupon) { const c = db.find('coupons', x => x.code === str(a.coupon, 30).toUpperCase() && x.active); if (c) { const sub = lines.reduce((s, l) => s + l.gross, 0); if (sub >= (c.min || 0)) disc = c.type === 'percent' ? r3(sub * c.value / 100) : Math.min(sub, c.value); db.update('coupons', c.id, { used: (c.used || 0) + 1 }); } }
      const freeShip = st.shipping.free_threshold && a.shipMethod === 'standard' && lines.reduce((s, l) => s + l.gross, 0) - disc >= st.shipping.free_threshold;
      const t = totalsFor(lines, disc, freeShip ? 0 : fee);
      const cust = resolveCustomer(ctx, { channel: 'web', new_customer: { name: a.name, phone: a.phone, email: a.email, address: a.address } });
      const created = a.date && !isNaN(Date.parse(a.date)) ? new Date(a.date).toISOString() : now();
      const method = ['knet', 'card', 'applepay', 'cod'].includes(a.payment) ? a.payment : 'cod';
      const o = Object.assign({ id: uid('ord'), created_at: created, number: a.number && /^[A-Z0-9-]{4,20}$/.test(a.number) ? a.number : nextNumber('invoice'), channel: 'web', status: 'pending',
        customer_id: cust ? cust.id : null, customer_name: str(a.name, 120), customer_phone: str(a.phone, 20), customer_email: str(a.email, 160),
        salesperson_id: null, salesperson_name: 'Website', branch_id: 'main', paid: 0, refunded: 0, payment_method: method, payment_status: 'unpaid',
        ship_method: a.shipMethod || 'standard', address: a.address || null, coupon: a.coupon || null, notes: '', updated_at: created, completed_at: null }, t);
      writeOrder(ctx, o, lines);
      deductStock(ctx, o, db.filter('order_items', i => i.order_id === o.id));
      notify('new_order', 'info', { en: 'New website order', ar: 'طلب جديد من الموقع' }, { en: `${o.number} — ${o.customer_name} — KWD ${o.total.toFixed(3)}`, ar: `${o.number} — ${o.customer_name} — ${o.total.toFixed(3)} د.ك` }, 'orders');
      log(ctx, 'create', 'orders', o.id, `Website order ${o.number}`);
      return { number: o.number, total: o.total };
    });
    def('orders.markPaid', ['orders', 'edit'], (ctx, a) => {
      const o = fullOrder(a.id); need(o.payment_status !== 'paid', 'invalid', 'Already paid');
      const due = r3(o.total - o.payments.reduce((s, p) => s + p.amount, 0));
      storePayment(ctx, o, a.method || o.payment_method, due, { reference: str(a.reference, 80) });
      db.update('orders', o.id, { paid: o.total, payment_status: 'paid', updated_at: now() });
      log(ctx, 'payment', 'orders', o.id, `Marked paid ${o.number}`); return fullOrder(o.id);
    });

    /* ---------- products / categories / collections ---------- */
    read('products.list', ['products', 'view'], (ctx, a) => {
      a = a || {};
      const qq = str(a.q, 80).toLowerCase();
      return db.filter('products', p => (!a.status ? p.status !== 'archived' : p.status === a.status) && (!a.category || p.category === a.category)
        && (!qq || [p.name_en, p.name_ar, p.sku, p.barcode].join(' ').toLowerCase().includes(qq)))
        .map(p => { const vs = db.filter('product_variants', v => v.product_id === p.id); const stock = r3(vs.reduce((s, v) => s + ((db.get('inventory', v.id) || {}).available_m || 0), 0)); return Object.assign(p, { variant_count: vs.length, stock, colors: vs.map(v => v.color) }); })
        .sort((x, y) => (x.name_en || '').localeCompare(y.name_en || ''));
    });
    read('products.get', ['products', 'view'], (ctx, a) => {
      const p = db.get('products', a.id); need(p, 'not_found');
      p.variants = db.filter('product_variants', v => v.product_id === p.id).map(v => Object.assign(v, { inventory: db.get('inventory', v.id) }));
      return p;
    });
    /* New products show a neutral "photo coming soon" image until photos are added from the Media Library */
    const PH = 'assets/img/placeholder.webp', PH_SM = 'assets/img/placeholder-sm.webp';
    const placeholderImages = () => ({ drape: PH, drapeSm: PH_SM, closeup: PH, roll: PH, folded: PH, styled: PH, variations: PH, gallery: [{ src: PH, view: 'photo' }] });
    const isPh = v => !v || (typeof v === 'string' && /placeholder/.test(v));
    const PRODUCT_FIELDS = Object.keys(schema.tables.products.cols).filter(k => !['id', 'created_at', 'updated_at', 'demo', 'rating', 'review_count'].includes(k));
    def('products.save', 'self', (ctx, a) => {
      const isNew = !a.id || !db.get('products', a.id);
      need(can(ctx.perms, 'products', isNew ? 'create' : 'edit'), 'forbidden', 'Permission denied');
      const d = pick(a.data || {}, PRODUCT_FIELDS);
      need(str(d.name_en || (isNew ? '' : 'x')), 'invalid', 'English name required');
      if (d.price_per_meter != null) need(num(d.price_per_meter, -1) >= 0, 'invalid', 'Invalid price');
      if (d.status) need(['active', 'draft', 'archived'].includes(d.status), 'invalid');
      ['price_per_meter', 'compare_at_price', 'cost_per_meter', 'width_cm', 'weight_gsm'].forEach(k => { if (d[k] !== undefined) d[k] = d[k] === '' || d[k] == null ? null : r3(d[k]); });
      let id = a.id;
      if (isNew) {
        id = str(a.id || d.slug || d.name_en, 60).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || uid('prd');
        if (db.get('products', id)) id = id + '-' + Math.random().toString(36).slice(2, 5);
        need(d.category && db.get('categories', d.category), 'invalid', 'Choose a category');
        db.insert('products', Object.assign({ id, slug: id, created_at: now(), status: 'draft', currency: 'KWD', collections: [], rating: 0, review_count: 0, price_per_meter: 0, images: placeholderImages() }, d, { id, updated_at: now() }));
      } else {
        const before = db.get('products', id);
        db.update('products', id, Object.assign(d, { updated_at: now() }));
        const changed = Object.keys(d).filter(k => k !== 'updated_at' && JSON.stringify(before[k]) !== JSON.stringify(d[k]));
        log(ctx, 'update', 'products', id, `Edited ${before.name_en}: ${changed.join(', ')}`, pick(before, changed), pick(d, changed));
      }
      // variants: [{color, sku, barcode, price_per_meter, cost_per_meter, min_stock_m, opening_m}]
      if (Array.isArray(a.variants)) {
        const keep = new Set();
        a.variants.forEach(v => {
          const color = str(v.color, 40); need(color, 'invalid', 'Variant colour required');
          const vid = `${id}:${color}`; keep.add(vid);
          const sku = str(v.sku, 40) || `${(db.get('products', id).sku || id).toUpperCase()}-${color.slice(0, 3).toUpperCase()}`;
          const dupe = db.find('product_variants', x => x.sku === sku && x.id !== vid); need(!dupe, 'invalid', 'SKU already used: ' + sku);
          const row = { product_id: id, color, sku, barcode: str(v.barcode, 40) || sku, price_per_meter: v.price_per_meter === '' || v.price_per_meter == null ? null : r3(v.price_per_meter),
            cost_per_meter: v.cost_per_meter === '' || v.cost_per_meter == null ? null : r3(v.cost_per_meter), min_stock_m: v.min_stock_m === '' || v.min_stock_m == null ? settings().inventory.default_min_stock : r3(v.min_stock_m), status: 'active' };
          if (db.get('product_variants', vid)) db.update('product_variants', vid, row);
          else {
            db.insert('product_variants', Object.assign({ id: vid, created_at: now(), location: '' }, row));
            variantInfo(vid);
            if (num(v.opening_m) > 0) move(ctx, { variant_id: vid, qty: num(v.opening_m), type: 'opening', reason: 'Opening stock' });
          }
          db.update('inventory', vid, { min_stock_m: row.min_stock_m });
        });
        db.filter('product_variants', v => v.product_id === id && !keep.has(v.id)).forEach(v => db.update('product_variants', v.id, { status: 'archived' }));
      }
      if (isNew) log(ctx, 'create', 'products', id, `Created product ${d.name_en}`, null, d);
      return M['products.get'].fn(ctx, { id });
    });
    def('products.delete', ['products', 'delete'], (ctx, a) => {
      const p = db.get('products', a.id); need(p, 'not_found');
      const used = db.find('order_items', i => i.product_id === p.id);
      if (used || a.archive !== false) { db.update('products', p.id, { status: 'archived', updated_at: now() }); log(ctx, 'archive', 'products', p.id, `Archived ${p.name_en}`, { status: p.status }, { status: 'archived' }); return { archived: true }; }
      db.filter('product_variants', v => v.product_id === p.id).forEach(v => { db.remove('product_variants', v.id); db.remove('inventory', v.id); });
      db.remove('products', p.id); log(ctx, 'delete', 'products', p.id, `Deleted ${p.name_en}`, p, null); return { deleted: true };
    });
    read('lookups.all', ['products', 'view'], () => ({ categories: db.all('categories').sort((a, b) => (a.sort || 0) - (b.sort || 0)), collections: db.all('collections').sort((a, b) => (a.sort || 0) - (b.sort || 0)), colors: db.all('colors'), fabric_types: db.all('fabric_types'), suppliers: db.filter('suppliers', s => s.status !== 'archived') }));
    const simpleCrud = (table, module, fields, label, opts) => {
      opts = opts || {};
      read(`${table}.list`, [module, 'view'], (ctx, a) => db.all(table).filter(r => !opts.filter || opts.filter(r, a || {})).sort(opts.sort || ((x, y) => (x.sort || 0) - (y.sort || 0) || String(y.created_at || '').localeCompare(String(x.created_at || '')))).map(r => opts.decorate ? opts.decorate(r) : r));
      def(`${table}.save`, 'self', (ctx, a) => {
        const exists = a.id && db.get(table, a.id);
        need(can(ctx.perms, module, exists ? 'edit' : 'create'), 'forbidden', 'Permission denied');
        const d = pick(a.data || {}, fields);
        if (opts.validate) opts.validate(d, exists);
        if (exists) { const after = db.update(table, a.id, d); log(ctx, 'update', module, a.id, `${label} ${a.id}`, pick(exists, Object.keys(d)), d); return after; }
        const id = opts.makeId ? opts.makeId(d, a) : (a.id || uid(table.slice(0, 3)));
        need(!db.get(table, id), 'invalid', 'ID already exists: ' + id);
        const row = db.insert(table, Object.assign({ id, created_at: now() }, opts.defaults ? opts.defaults(ctx) : {}, d));
        log(ctx, 'create', module, id, `${label} ${row.name || row.name_en || id}`, null, d); if (opts.after) opts.after(ctx, row); return row;
      });
      def(`${table}.delete`, [module, 'delete'], (ctx, a) => {
        const r = db.get(table, a.id); need(r, 'not_found');
        if (opts.canDelete) opts.canDelete(r);
        db.remove(table, a.id); log(ctx, 'delete', module, a.id, `Deleted ${label} ${r.name || r.name_en || r.id}`, r, null); return true;
      });
    };
    const slugId = d => str(d.name_en, 60).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || uid('x');
    simpleCrud('categories', 'products', ['name_en', 'name_ar', 'desc_en', 'desc_ar', 'image', 'cover', 'home', 'sort', 'status'], 'Category', { makeId: slugId,
      validate: d => need(d.name_en === undefined || str(d.name_en), 'invalid', 'Name required'),
      canDelete: r => need(!db.find('products', p => p.category === r.id && p.status !== 'archived'), 'in_use', 'Category has products — move them first'),
      decorate: r => Object.assign(r, { products: db.filter('products', p => p.category === r.id && p.status !== 'archived').length }) });
    simpleCrud('collections', 'products', ['name_en', 'name_ar', 'desc_en', 'desc_ar', 'image', 'feature', 'editorial', 'sort', 'status'], 'Collection', { makeId: slugId,
      decorate: r => Object.assign(r, { products: db.filter('products', p => (p.collections || []).includes(r.id) && p.status !== 'archived').length }) });
    simpleCrud('colors', 'products', ['name_en', 'name_ar', 'hex', 'family'], 'Colour', { makeId: d => slugId(d).replace(/-/g, '') });
    simpleCrud('suppliers', 'suppliers', ['name', 'contact', 'phone', 'email', 'address', 'country', 'notes', 'status'], 'Supplier', {
      validate: d => need(d.name === undefined || str(d.name), 'invalid', 'Name required'),
      canDelete: r => need(!db.find('purchase_orders', p => p.supplier_id === r.id), 'in_use', 'Supplier has purchase orders — set status to inactive instead'),
      decorate: r => { const pos = db.filter('purchase_orders', p => p.supplier_id === r.id && p.status !== 'cancelled'); return Object.assign(r, { po_count: pos.length, purchased: r3(pos.reduce((s, p) => s + p.total, 0)), balance: r3(pos.reduce((s, p) => s + p.total - (p.paid || 0), 0)) }); },
      sort: (x, y) => x.name.localeCompare(y.name) });
    simpleCrud('coupons', 'coupons', ['code', 'type', 'value', 'min', 'active', 'starts_at', 'ends_at', 'max_uses'], 'Coupon', { makeId: d => str(d.code, 30).toUpperCase(),
      validate: d => { if (d.code !== undefined) d.code = str(d.code, 30).toUpperCase(); if (d.type) need(['percent', 'fixed'].includes(d.type), 'invalid'); if (d.value !== undefined) d.value = r3(d.value); if (d.min !== undefined) d.min = r3(d.min); } });
    simpleCrud('printers', 'printers', ['name', 'type', 'paper', 'paper_w_mm', 'connection', 'address', 'is_default', 'copies', 'header', 'footer', 'show_logo', 'show_address', 'show_phone', 'show_qr', 'show_barcode', 'status'], 'Printer', {
      validate: d => { if (d.type) need(schema.enums.printerTypes.includes(d.type), 'invalid'); if (d.copies !== undefined) d.copies = Math.max(1, Math.min(5, Math.round(num(d.copies, 1)))); },
      after: (ctx, row) => { if (row.is_default) db.filter('printers', p => p.id !== row.id && p.type === row.type && p.is_default).forEach(p => db.update('printers', p.id, { is_default: false })); } });
    simpleCrud('printer_profiles', 'printers', ['name', 'document', 'printer_id', 'paper', 'copies', 'lang', 'auto_print'], 'Printer profile');

    /* ---------- inventory & rolls ---------- */
    read('inventory.list', ['inventory', 'view'], (ctx, a) => {
      a = a || {}; const qq = str(a.q, 80).toLowerCase();
      return stockRows().filter(r => r.status !== 'archived' && (!a.state || (a.state === 'attention' ? r.state !== 'ok' : r.state === a.state)) && (!a.category || r.category === a.category)
        && (!qq || [r.product_en, r.product_ar, r.sku, r.barcode, r.color].join(' ').toLowerCase().includes(qq)));
    });
    def('inventory.adjust', ['inventory', 'edit'], (ctx, a) => {
      need(['adjustment', 'damage', 'transfer', 'reservation', 'release', 'return', 'purchase'].includes(a.type), 'invalid', 'Invalid type');
      let qty = r3(a.qty); need(qty !== 0 && isFinite(qty), 'invalid_qty', 'Enter metres');
      if (['damage', 'reservation', 'transfer'].includes(a.type)) qty = -Math.abs(qty);
      if (['release', 'return', 'purchase'].includes(a.type)) qty = Math.abs(qty);
      need(str(a.reason), 'invalid', 'A reason is required for every adjustment');
      const { v, p } = variantInfo(a.variant_id);
      const after = move(ctx, { variant_id: a.variant_id, qty, type: a.type, roll_id: a.roll_id || null, reason: a.reason, ref_type: 'manual' });
      notify('inventory_adjustment', 'info', { en: 'Inventory adjusted', ar: 'تعديل المخزون' }, { en: `${v.sku}: ${qty > 0 ? '+' : ''}${qty} m (${a.type}) by ${ctx.user.name}`, ar: `${v.sku}: ${qty > 0 ? '+' : ''}${qty} م (${a.type}) بواسطة ${ctx.user.name}` }, 'inventory');
      log(ctx, 'adjust', 'inventory', a.variant_id, `${p.name_en} ${v.color}: ${a.type} ${qty} m — ${a.reason}`, null, { qty, after });
      return { after };
    });
    read('inventory.transactions', ['inventory', 'view'], (ctx, a) => {
      a = a || {};
      return db.filter('inventory_transactions', x => (!a.variant_id || x.variant_id === a.variant_id) && (!a.type || x.type === a.type) && (!a.roll_id || x.roll_id === a.roll_id) && inRange(x.created_at, a.from, a.to))
        .sort((x, y) => y.created_at.localeCompare(x.created_at)).slice(0, a.limit || 500)
        .map(x => { const v = db.get('product_variants', x.variant_id) || {}; const p = db.get('products', x.product_id) || {}; return Object.assign(x, { sku: v.sku, color: v.color, product_en: p.name_en, product_ar: p.name_ar }); });
    });
    read('rolls.list', ['inventory', 'view'], (ctx, a) => {
      a = a || {}; const qq = str(a.q, 80).toLowerCase();
      return db.filter('fabric_rolls', r => (!a.status || r.status === a.status) && (!a.variant_id || r.variant_id === a.variant_id))
        .map(r => { const p = db.get('products', r.product_id) || {}; const s = r.supplier_id ? db.get('suppliers', r.supplier_id) : null; const v = db.get('product_variants', r.variant_id) || {}; return Object.assign(r, { product_en: p.name_en, product_ar: p.name_ar, sku: v.sku, supplier: s ? s.name : '' }); })
        .filter(r => !qq || [r.barcode, r.product_en, r.product_ar, r.batch, r.sku, r.location].join(' ').toLowerCase().includes(qq))
        .sort((x, y) => String(y.purchase_date).localeCompare(String(x.purchase_date)));
    });
    def('rolls.save', 'self', (ctx, a) => {
      const exists = a.id && db.get('fabric_rolls', a.id);
      need(can(ctx.perms, 'inventory', exists ? 'edit' : 'create'), 'forbidden', 'Permission denied');
      const d = pick(a.data || {}, ['batch', 'supplier_id', 'location', 'status', 'cost_per_meter', 'purchase_date', 'barcode']);
      if (d.status) need(schema.enums.rollStatus.includes(d.status), 'invalid');
      if (exists) {
        const after = db.update('fabric_rolls', a.id, d);
        if (d.status === 'reserved' && exists.status !== 'reserved') move(ctx, { variant_id: exists.variant_id, qty: -exists.remaining_m, type: 'reservation', ref_type: 'roll', ref_id: a.id, reason: 'Roll reserved ' + exists.barcode });
        if (exists.status === 'reserved' && d.status && d.status !== 'reserved') move(ctx, { variant_id: exists.variant_id, qty: exists.remaining_m, type: 'release', ref_type: 'roll', ref_id: a.id, reason: 'Roll released ' + exists.barcode });
        if (d.status === 'damaged' && exists.status !== 'damaged' && exists.remaining_m > 0) { move(ctx, { variant_id: exists.variant_id, qty: -exists.remaining_m, type: 'damage', ref_type: 'roll', ref_id: a.id, reason: 'Roll damaged ' + exists.barcode }); db.update('fabric_rolls', a.id, { status: 'damaged' }); }
        log(ctx, 'update', 'inventory', a.id, `Roll ${exists.barcode}`, pick(exists, Object.keys(d)), d); return db.get('fabric_rolls', a.id);
      }
      const vd = a.data || {}; const { v, p } = variantInfo(vd.variant_id);
      const len = r3(vd.original_m); need(len > 0, 'invalid_qty', 'Roll length required');
      const id = uid('roll'); const n = db.count('fabric_rolls') + 1;
      const row = db.insert('fabric_rolls', Object.assign({ id, created_at: now(), product_id: p.id, variant_id: v.id, color: v.color, original_m: len, remaining_m: 0, status: 'available',
        barcode: d.barcode || `R${pad(n, 6)}`, purchase_date: dayKey(clock()), cost_per_meter: r3(vd.cost_per_meter || v.cost_per_meter || p.cost_per_meter || 0), po_id: null }, d));
      move(ctx, { variant_id: v.id, qty: len, type: vd.counts_as_purchase ? 'purchase' : 'adjustment', roll_id: id, reason: 'New roll ' + row.barcode, ref_type: 'roll', ref_id: id });
      log(ctx, 'create', 'inventory', id, `Roll ${row.barcode} ${len} m`, null, row); return db.get('fabric_rolls', id);
    });

    /* ---------- purchases ---------- */
    read('purchases.list', ['purchases', 'view'], (ctx, a) => {
      a = a || {};
      return db.filter('purchase_orders', p => (!a.status || p.status === a.status) && (!a.supplier_id || p.supplier_id === a.supplier_id) && (!a.from || p.date >= a.from) && (!a.to || p.date <= a.to))
        .map(p => { const s = db.get('suppliers', p.supplier_id) || {}; const its = db.filter('purchase_items', i => i.po_id === p.id); return Object.assign(p, { supplier: s.name, meters: r3(its.reduce((x, i) => x + i.meters, 0)), qty: its.reduce((x, i) => x + (i.rolls || 0), 0), lines: its.length }); })
        .sort((x, y) => String(y.date).localeCompare(String(x.date)) || y.number.localeCompare(x.number));
    });
    read('purchases.get', ['purchases', 'view'], (ctx, a) => {
      const p = db.get('purchase_orders', a.id); need(p, 'not_found');
      p.items = db.filter('purchase_items', i => i.po_id === p.id).map(i => { const v = db.get('product_variants', i.variant_id) || {}; const pr = db.get('products', i.product_id) || {}; return Object.assign(i, { sku: v.sku, color: v.color, product_en: pr.name_en, product_ar: pr.name_ar }); });
      p.supplier = db.get('suppliers', p.supplier_id); return p;
    });
    def('purchases.save', 'self', (ctx, a) => {
      const exists = a.id && db.get('purchase_orders', a.id);
      need(can(ctx.perms, 'purchases', exists ? 'edit' : 'create'), 'forbidden', 'Permission denied');
      if (exists) need(['draft', 'ordered'].includes(exists.status), 'invalid', 'Received or cancelled orders cannot be edited');
      const d = a.data || {};
      need(db.get('suppliers', d.supplier_id), 'invalid', 'Choose a supplier');
      need(Array.isArray(d.items) && d.items.length, 'invalid', 'Add at least one line');
      const items = d.items.map(i => { const { v, p } = variantInfo(i.variant_id); const m = r3(i.meters); need(m > 0, 'invalid_qty', 'Metres required'); const c = r3(i.cost_per_meter); need(c >= 0, 'invalid'); return { product_id: p.id, variant_id: v.id, meters: m, rolls: Math.max(1, Math.round(num(i.rolls, 1))), cost_per_meter: c, total: r3(m * c) }; });
      const subtotal = r3(items.reduce((s, i) => s + i.total, 0));
      const id = exists ? exists.id : uid('po');
      const row = { supplier_id: d.supplier_id, date: str(d.date, 10) || dayKey(clock()), status: ['draft', 'ordered'].includes(d.status) ? d.status : 'ordered', payment_status: ['unpaid', 'partial', 'paid'].includes(d.payment_status) ? d.payment_status : 'unpaid', subtotal, total: subtotal, notes: str(d.notes, 500) };
      if (exists) { db.update('purchase_orders', id, row); db.filter('purchase_items', i => i.po_id === id).forEach(i => db.remove('purchase_items', i.id)); }
      else db.insert('purchase_orders', Object.assign({ id, created_at: now(), number: nextNumber('po'), paid: 0, created_by: ctx.user.name, received_at: null }, row));
      items.forEach(i => db.insert('purchase_items', Object.assign({ id: uid('pi'), created_at: now(), po_id: id }, i)));
      log(ctx, exists ? 'update' : 'create', 'purchases', id, `Purchase order ${db.get('purchase_orders', id).number} — KWD ${subtotal.toFixed(3)}`);
      return M['purchases.get'].fn(ctx, { id });
    });
    def('purchases.receive', ['purchases', 'edit'], (ctx, a) => {
      const po = M['purchases.get'].fn(ctx, { id: a.id });
      need(['draft', 'ordered'].includes(po.status), 'invalid', 'Purchase order already ' + po.status);
      po.items.forEach(i => {
        const per = r3(i.meters / i.rolls);
        for (let k = 0; k < i.rolls; k++) {
          const len = k === i.rolls - 1 ? r3(i.meters - per * (i.rolls - 1)) : per;
          const rid = uid('roll'); const n = db.count('fabric_rolls') + 1;
          db.insert('fabric_rolls', { id: rid, created_at: now(), barcode: `R${pad(n, 6)}`, product_id: i.product_id, variant_id: i.variant_id, color: i.color, batch: str(a.batch, 40) || po.number,
            supplier_id: po.supplier_id, original_m: len, remaining_m: 0, cost_per_meter: i.cost_per_meter, purchase_date: dayKey(clock()), location: str(a.location, 60), status: 'available', po_id: po.id });
          move(ctx, { variant_id: i.variant_id, qty: len, type: 'purchase', roll_id: rid, ref_type: 'purchase', ref_id: po.id, reason: `Received ${po.number}` });
        }
        // moving-average cost per metre
        const inv = db.get('inventory', i.variant_id), v = db.get('product_variants', i.variant_id);
        const oldQty = Math.max(0, inv.available_m - i.meters), oldCost = v.cost_per_meter || (db.get('products', i.product_id) || {}).cost_per_meter || i.cost_per_meter;
        db.update('product_variants', v.id, { cost_per_meter: r3((oldQty * oldCost + i.meters * i.cost_per_meter) / Math.max(inv.available_m, 0.001)) });
      });
      db.update('purchase_orders', po.id, { status: 'received', received_at: now() });
      log(ctx, 'receive', 'purchases', po.id, `Received ${po.number}: ${po.items.reduce((s, i) => s + i.meters, 0)} m`);
      return M['purchases.get'].fn(ctx, { id: po.id });
    });
    def('purchases.setPayment', ['purchases', 'edit'], (ctx, a) => {
      const po = db.get('purchase_orders', a.id); need(po, 'not_found');
      const paid = r3(Math.min(po.total, Math.max(0, num(a.paid))));
      const status = paid <= 0 ? 'unpaid' : paid + 0.0005 >= po.total ? 'paid' : 'partial';
      db.update('purchase_orders', po.id, { paid, payment_status: status }); log(ctx, 'payment', 'purchases', po.id, `${po.number} paid ${paid}`, { paid: po.paid }, { paid });
      return db.get('purchase_orders', po.id);
    });
    def('purchases.cancel', ['purchases', 'delete'], (ctx, a) => {
      const po = db.get('purchase_orders', a.id); need(po && po.status !== 'received', 'invalid', 'Received orders cannot be cancelled');
      db.update('purchase_orders', po.id, { status: 'cancelled' }); log(ctx, 'cancel', 'purchases', po.id, `Cancelled ${po.number}`); return true;
    });

    /* ---------- customers (CRM) ---------- */
    read('customers.list', ['customers', 'view'], (ctx, a) => {
      a = a || {}; const qq = str(a.q, 80).toLowerCase();
      const stats = {};
      db.filter('orders', isSale).forEach(o => { if (!o.customer_id) return; const s = stats[o.customer_id] = stats[o.customer_id] || { orders: 0, spent: 0, last: '' }; s.orders++; s.spent = r3(s.spent + o.total - (o.refunded || 0)); if (o.created_at > s.last) s.last = o.created_at; });
      return db.filter('customers', c => !qq || [c.name, c.phone, c.email].join(' ').toLowerCase().includes(qq))
        .map(c => Object.assign(c, stats[c.id] || { orders: 0, spent: 0, last: '' })).sort((x, y) => y.spent - x.spent || x.name.localeCompare(y.name));
    });
    read('customers.get', ['customers', 'view'], (ctx, a) => {
      const c = db.get('customers', a.id); need(c, 'not_found');
      const orders = db.filter('orders', o => o.customer_id === c.id && o.status !== 'held').sort((x, y) => y.created_at.localeCompare(x.created_at));
      const ids = new Set(orders.filter(isSale).map(o => o.id));
      const fav = {};
      db.filter('order_items', i => ids.has(i.order_id)).forEach(i => { const f = fav[i.product_id] = fav[i.product_id] || { id: i.product_id, name_en: i.name_en, name_ar: i.name_ar, meters: 0, colors: {} }; f.meters = r3(f.meters + i.meters); f.colors[i.color] = 1; });
      const sales = orders.filter(isSale);
      return Object.assign(c, { orders, favorites: Object.values(fav).sort((x, y) => y.meters - x.meters).slice(0, 6).map(f => Object.assign(f, { colors: Object.keys(f.colors) })),
        stats: { orders: sales.length, spent: r3(sales.reduce((s, o) => s + o.total - (o.refunded || 0), 0)), meters: r3(Object.values(fav).reduce((s, f) => s + f.meters, 0)), aov: sales.length ? r3(sales.reduce((s, o) => s + o.total, 0) / sales.length) : 0, first: sales.length ? sales[sales.length - 1].created_at : null, last: sales.length ? sales[0].created_at : null } });
    });
    def('customers.save', 'self', (ctx, a) => {
      const exists = a.id && db.get('customers', a.id);
      need(can(ctx.perms, 'customers', exists ? 'edit' : 'create'), 'forbidden', 'Permission denied');
      const d = pick(a.data || {}, ['name', 'phone', 'email', 'addresses', 'notes', 'lang', 'tags']);
      if (d.name !== undefined) need(str(d.name), 'invalid', 'Name required');
      if (d.email) need(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email), 'invalid', 'Invalid email');
      if (d.phone) { d.phone = str(d.phone, 20).replace(/[^\d+]/g, ''); const dup = db.find('customers', c => c.phone === d.phone && c.id !== a.id); need(!dup, 'invalid', 'Phone already belongs to ' + (dup && dup.name)); }
      if (exists) { const after = db.update('customers', a.id, d); log(ctx, 'update', 'customers', a.id, `Customer ${after.name}`, pick(exists, Object.keys(d)), d); return after; }
      const row = db.insert('customers', Object.assign({ id: uid('cus'), created_at: now(), addresses: [], tags: [], source: 'admin', notes: '' }, d));
      notify('new_customer', 'info', { en: 'New customer', ar: 'عميل جديد' }, { en: row.name, ar: row.name }, 'customers');
      log(ctx, 'create', 'customers', row.id, `Customer ${row.name}`, null, d); return row;
    });
    def('customers.delete', ['customers', 'delete'], (ctx, a) => {
      const c = db.get('customers', a.id); need(c, 'not_found');
      need(!db.find('orders', o => o.customer_id === c.id), 'in_use', 'Customer has orders and is kept for your records');
      db.remove('customers', c.id); log(ctx, 'delete', 'customers', c.id, `Deleted customer ${c.name}`, c, null); return true;
    });

    /* ---------- expenses ---------- */
    read('expenses.list', ['expenses', 'view'], (ctx, a) => {
      a = a || {}; const qq = str(a.q, 80).toLowerCase();
      return db.filter('expenses', e => (!a.from || e.date >= a.from) && (!a.to || e.date <= a.to) && (!a.category || e.category === a.category) && (!qq || [e.number, e.description].join(' ').toLowerCase().includes(qq)))
        .sort((x, y) => y.date.localeCompare(x.date) || y.number.localeCompare(x.number));
    });
    def('expenses.save', 'self', (ctx, a) => {
      const exists = a.id && db.get('expenses', a.id);
      need(can(ctx.perms, 'expenses', exists ? 'edit' : 'create'), 'forbidden', 'Permission denied');
      const d = pick(a.data || {}, ['date', 'category', 'description', 'amount', 'payment_method', 'attachment']);
      if (d.category !== undefined) need(schema.enums.expenseCategories.includes(d.category), 'invalid', 'Choose a category');
      if (d.amount !== undefined) { d.amount = r3(d.amount); need(d.amount > 0, 'invalid', 'Amount must be above zero'); }
      if (d.date !== undefined) need(/^\d{4}-\d{2}-\d{2}$/.test(d.date), 'invalid', 'Date required');
      if (d.attachment) need(String(d.attachment).length < 1500000, 'invalid', 'Attachment too large (max ~1 MB)');
      if (exists) { const after = db.update('expenses', a.id, d); log(ctx, 'update', 'expenses', a.id, `Expense ${exists.number}`, pick(exists, Object.keys(d).filter(k => k !== 'attachment')), pick(d, Object.keys(d).filter(k => k !== 'attachment'))); return after; }
      need(d.amount && d.category && d.date, 'invalid', 'Date, category and amount are required');
      const row = db.insert('expenses', Object.assign({ id: uid('exp'), created_at: now(), number: nextNumber('expense'), created_by: ctx.user.id, created_by_name: ctx.user.name, payment_method: 'cash', description: '' }, d));
      log(ctx, 'create', 'expenses', row.id, `Expense ${row.number} ${row.category} KWD ${row.amount.toFixed(3)}`); return row;
    });
    def('expenses.delete', ['expenses', 'delete'], (ctx, a) => { const e = db.get('expenses', a.id); need(e, 'not_found'); db.remove('expenses', e.id); log(ctx, 'delete', 'expenses', e.id, `Deleted expense ${e.number}`, e, null); return true; });

    /* ---------- reports ---------- */
    read('reports.sales', ['reports', 'view'], (ctx, a) => {
      a = a || {}; const m = metrics(a.from, a.to, a);
      m.trend = series(a.from, a.to, a.granularity || 'day');
      m.orderList = m.orderList.slice(0, 1000).map(o => pick(o, ['id', 'number', 'created_at', 'channel', 'customer_name', 'salesperson_name', 'payment_method', 'subtotal', 'discount', 'tax', 'total', 'status']));
      return m;
    });
    read('reports.inventory', ['reports', 'view'], (ctx, a) => {
      a = a || {}; const rows = stockRows().filter(r => r.status !== 'archived');
      const kind = a.kind || 'current';
      if (kind === 'movement' || kind === 'damaged') return { kind, rows: M['inventory.transactions'].fn(ctx, { from: a.from, to: a.to, type: kind === 'damaged' ? 'damage' : a.type, limit: 2000 }) };
      if (kind === 'rolls') return { kind, rows: M['rolls.list'].fn(ctx, {}) };
      if (kind === 'product_sales') return { kind, rows: metrics(a.from, a.to).byProduct };
      const filt = { current: () => true, low: r => r.state === 'low', out: r => r.state === 'out', valuation: () => true, reserved: r => r.reserved > 0 }[kind] || (() => true);
      const out = rows.filter(filt);
      return { kind, rows: out, totals: { available: r3(out.reduce((s, r) => s + r.available, 0)), value_cost: r3(out.reduce((s, r) => s + r.value_cost, 0)), value_retail: r3(out.reduce((s, r) => s + r.value_retail, 0)), reserved: r3(out.reduce((s, r) => s + r.reserved, 0)), damaged: r3(out.reduce((s, r) => s + r.damaged, 0)) } };
    });
    read('reports.daily', ['reports', 'view'], (ctx, a) => {
      const date = a && a.date || dayKey(clock());
      const m = metrics(date, date);
      const ids = new Set(m.orderList.map(o => o.id));
      const pays = db.filter('payments', p => inRange(p.created_at, date, date));
      const byM = k => r3(pays.filter(p => p.method === k).reduce((s, p) => s + p.amount, 0));
      const refunds = db.filter('refunds', r => inRange(r.created_at, date, date));
      const cashRefunds = r3(refunds.filter(r => r.method === 'cash').reduce((s, r) => s + r.amount, 0));
      const expenses = db.filter('expenses', e => e.date === date);
      const cashExpenses = r3(expenses.filter(e => e.payment_method === 'cash').reduce((s, e) => s + e.amount, 0));
      const saved = db.find('daily_reports', d => d.date === date);
      const prev = db.all('daily_reports').filter(d => d.date < date).sort((x, y) => y.date.localeCompare(x.date))[0];
      const opening = saved ? saved.opening_cash : (a && a.opening_cash != null ? r3(a.opening_cash) : (prev ? prev.counted_cash ?? prev.closing_cash : 0));
      const cash = byM('cash'), knet = byM('knet'), card = byM('card');
      const other = r3(pays.filter(p => !['cash', 'knet', 'card'].includes(p.method)).reduce((s, p) => s + p.amount, 0));
      const top = m.byProduct[0], topCat = m.byCategory[0];
      return { date, opening_cash: opening, cash, knet, card, other, total: r3(cash + knet + card + other), refunds: m.refunds, discounts: m.discounts, expenses: m.expenses,
        net: r3(cash + knet + card + other - m.refunds - m.expenses), expected_cash: r3(opening + cash - cashRefunds - cashExpenses), cash_refunds: cashRefunds, cash_expenses: cashExpenses,
        invoices: m.orders, products_sold: m.lines, meters: m.meters, aov: m.aov, gross_profit: m.grossProfit, top_product: top || null, top_category: topCat || null,
        invoices_list: m.orderList.map(o => pick(o, ['number', 'created_at', 'customer_name', 'payment_method', 'total', 'salesperson_name'])), expenses_list: expenses,
        closed: saved || null, ids: ids.size };
    });
    def('reports.closeDay', ['reports', 'export'], (ctx, a) => {
      const r = M['reports.daily'].fn(ctx, { date: a.date, opening_cash: a.opening_cash });
      need(!r.closed, 'invalid', 'This day is already closed');
      const counted = r3(a.counted_cash);
      const row = db.insert('daily_reports', { id: uid('day'), created_at: now(), date: r.date, opening_cash: r3(a.opening_cash != null ? a.opening_cash : r.opening_cash), counted_cash: counted,
        closing_cash: r.expected_cash, data: Object.assign({}, r, { invoices_list: undefined, expenses_list: undefined, closed: undefined }), notes: str(a.notes, 500), closed_by: ctx.user.name, closed_at: now() });
      notify('daily_report', 'success', { en: 'Daily report ready', ar: 'التقرير اليومي جاهز' }, { en: `${r.date}: net KWD ${r.net.toFixed(3)}, cash variance ${(counted - r.expected_cash).toFixed(3)}`, ar: `${r.date}: الصافي ${r.net.toFixed(3)} د.ك، فرق النقدية ${(counted - r.expected_cash).toFixed(3)}` }, 'daily');
      log(ctx, 'close_day', 'reports', row.id, `Closed ${r.date}`); return row;
    });

    /* ---------- users & roles ---------- */
    read('users.list', ['users', 'view'], () => db.all('users').map(strip).sort((x, y) => x.name.localeCompare(y.name)));
    def('users.save', 'self', async (ctx, a) => {
      const exists = a.id && db.get('users', a.id);
      need(can(ctx.perms, 'users', exists ? 'edit' : 'create'), 'forbidden', 'Permission denied');
      const d = pick(a.data || {}, ['name', 'username', 'email', 'phone', 'role_id', 'status', 'photo', 'lang', 'branch_id', 'must_change_password']);
      if (d.username !== undefined) { d.username = str(d.username, 40).toLowerCase(); need(/^[a-z0-9._-]{3,40}$/.test(d.username), 'invalid', 'Username: 3–40 letters, digits, . _ -'); need(!db.find('users', u => u.username === d.username && u.id !== a.id), 'invalid', 'Username already taken'); }
      if (d.email) { d.email = str(d.email, 160).toLowerCase(); need(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email), 'invalid', 'Invalid email'); }
      if (d.status) need(schema.enums.userStatus.includes(d.status), 'invalid');
      if (d.role_id) need(db.get('roles', d.role_id), 'invalid', 'Choose a role');
      const actorIsSuper = ctx.user.role_id === 'super_admin';
      if (d.role_id === 'super_admin' || (exists && exists.role_id === 'super_admin')) need(actorIsSuper, 'forbidden', 'Only a Super Admin can manage Super Admin accounts');
      if (exists && exists.id === ctx.user.id) { need(!d.status || d.status === 'active', 'invalid', 'You cannot deactivate your own account'); need(!d.role_id || d.role_id === exists.role_id, 'invalid', 'You cannot change your own role'); }
      if (exists && exists.role_id === 'super_admin' && d.role_id && d.role_id !== 'super_admin') need(db.filter('users', u => u.role_id === 'super_admin' && u.status === 'active').length > 1, 'invalid', 'At least one active Super Admin is required');
      if (a.password) { checkPasswordPolicy(a.password); d.password_hash = await hashPassword(a.password); }
      if (exists) {
        const after = db.update('users', a.id, Object.assign(d, { updated_at: now() }));
        if (d.password_hash || (d.status && d.status !== 'active')) db.filter('sessions', s => s.user_id === a.id && s.id !== ctx.sid).forEach(s => db.remove('sessions', s.id));
        const keys = Object.keys(d).filter(k => !['password_hash', 'updated_at', 'photo'].includes(k));
        log(ctx, a.password ? 'password_reset' : 'update', 'users', a.id, `User ${after.username}${a.password ? ' (password reset)' : ''}`, pick(exists, keys), pick(d, keys));
        return strip(after);
      }
      need(d.name && d.username && d.role_id && d.password_hash, 'invalid', 'Name, username, role and password are required');
      const row = db.insert('users', Object.assign({ id: uid('usr'), created_at: now(), status: 'active', lang: 'en', failed_attempts: 0, must_change_password: true, branch_id: 'main' }, d, { updated_at: now() }));
      db.insert('user_roles', { id: `${row.id}:${row.role_id}`, user_id: row.id, role_id: row.role_id });
      notify('new_user', 'info', { en: 'New user account', ar: 'حساب مستخدم جديد' }, { en: `${row.name} (${row.username}) — ${row.role_id}`, ar: `${row.name} (${row.username}) — ${row.role_id}` }, 'users');
      log(ctx, 'create', 'users', row.id, `Created user ${row.username} (${row.role_id})`, null, pick(row, ['name', 'username', 'email', 'role_id', 'status']));
      return strip(row);
    });
    def('users.delete', ['users', 'delete'], (ctx, a) => {
      const u = db.get('users', a.id); need(u, 'not_found'); need(u.id !== ctx.user.id, 'invalid', 'You cannot delete your own account');
      if (u.role_id === 'super_admin') need(ctx.user.role_id === 'super_admin' && db.filter('users', x => x.role_id === 'super_admin').length > 1, 'forbidden', 'Cannot delete the last Super Admin');
      const hasHistory = db.find('orders', o => o.salesperson_id === u.id) || db.find('activity_logs', l => l.user_id === u.id && l.action !== 'login');
      if (hasHistory) { db.update('users', u.id, { status: 'inactive' }); db.filter('sessions', s => s.user_id === u.id).forEach(s => db.remove('sessions', s.id)); log(ctx, 'deactivate', 'users', u.id, `Deactivated ${u.username} (has history)`); return { deactivated: true }; }
      db.filter('user_roles', r => r.user_id === u.id).forEach(r => db.remove('user_roles', r.id));
      db.filter('sessions', s => s.user_id === u.id).forEach(s => db.remove('sessions', s.id));
      db.remove('users', u.id); log(ctx, 'delete', 'users', u.id, `Deleted user ${u.username}`, strip(u), null); return { deleted: true };
    });
    read('roles.list', ['users', 'view'], () => db.all('roles').map(r => Object.assign(r, { users: db.filter('users', u => u.role_id === r.id).length, perms: permsFor({ role_id: r.id }) })));
    def('roles.save', 'self', (ctx, a) => {
      const exists = a.id && db.get('roles', a.id);
      need(can(ctx.perms, 'users', exists ? 'edit' : 'create'), 'forbidden', 'Permission denied');
      need(!exists || exists.id !== 'super_admin', 'forbidden', 'Super Admin always has full access');
      if (exists && ctx.user.role_id === exists.id) need(ctx.user.role_id === 'super_admin', 'forbidden', 'You cannot change your own role\'s permissions');
      const d = pick(a.data || {}, ['name_en', 'name_ar']);
      let id = a.id;
      if (!exists) { need(str(d.name_en), 'invalid', 'Role name required'); id = slugId(d).replace(/-/g, '_'); need(!db.get('roles', id), 'invalid', 'Role exists'); db.insert('roles', Object.assign({ id, key: id.toUpperCase(), created_at: now(), system: false }, d)); }
      else if (Object.keys(d).length) db.update('roles', id, Object.assign(d, { updated_at: now() }));
      if (a.perms) {
        const before = permsFor({ role_id: id });
        db.filter('role_permissions', rp => rp.role_id === id).forEach(rp => db.remove('role_permissions', rp.id));
        Object.keys(a.perms).forEach(m => { if (!schema.modules.includes(m)) return; (a.perms[m] || []).forEach(act => { if (schema.actions.includes(act)) db.insert('role_permissions', { id: `${id}:${m}:${act}`, role_id: id, permission_id: `${m}:${act}` }); }); });
        log(ctx, 'permissions', 'users', id, `Permissions updated for role ${id}`, before, permsFor({ role_id: id }));
      }
      return Object.assign(db.get('roles', id), { perms: permsFor({ role_id: id }) });
    });
    def('roles.delete', ['users', 'delete'], (ctx, a) => {
      const r = db.get('roles', a.id); need(r && !r.system, 'invalid', 'Built-in roles cannot be deleted');
      need(!db.find('users', u => u.role_id === r.id), 'in_use', 'Role is assigned to users');
      db.filter('role_permissions', rp => rp.role_id === r.id).forEach(rp => db.remove('role_permissions', rp.id)); db.remove('roles', r.id);
      log(ctx, 'delete', 'users', r.id, `Deleted role ${r.name_en}`); return true;
    });

    /* ---------- settings ---------- */
    read('settings.get', ['settings', 'view'], () => settings());
    def('settings.save', ['settings', 'edit'], (ctx, a) => {
      const sec = str(a.section, 40);
      need(schema.settingsDefaults[sec], 'invalid', 'Unknown settings section');
      const allowed = Object.keys(schema.settingsDefaults[sec]);
      const before = settings()[sec];
      const vals = {};
      allowed.forEach(k => {
        if (!a.values || a.values[k] === undefined) return;
        const dv = schema.settingsDefaults[sec][k], v = a.values[k];
        vals[k] = typeof dv === 'boolean' ? !!v : typeof dv === 'number' ? (v === '' || v == null ? null : num(v)) : (dv === null ? (v === '' || v == null ? null : (isFinite(Number(v)) ? Number(v) : v)) : str(v, 2000));
      });
      if (sec === 'security') { need(vals.min_password_length == null || vals.min_password_length >= 8, 'invalid', 'Minimum password length is 8'); need(vals.max_failed_logins == null || vals.max_failed_logins >= 3, 'invalid'); }
      if (sec === 'tax' && vals.rate != null) need(vals.rate >= 0 && vals.rate <= 50, 'invalid', 'Tax rate 0–50%');
      db.upsert('settings', { id: sec, value: Object.assign({}, (db.get('settings', sec) || {}).value || {}, vals), updated_at: now(), updated_by: ctx.user.name });
      const changed = Object.keys(vals).filter(k => JSON.stringify(before[k]) !== JSON.stringify(vals[k]));
      log(ctx, 'settings', 'settings', sec, `Settings · ${sec}: ${changed.join(', ') || 'no changes'}`, pick(before, changed), pick(vals, changed));
      return settings()[sec];
    });

    /* ---------- notifications / logs ---------- */
    function visibleNotif(ctx, n) { const map = { low_stock: 'inventory', out_of_stock: 'inventory', inventory_adjustment: 'inventory', new_order: 'orders', payment: 'sales', refund: 'sales', new_customer: 'customers', new_user: 'users', daily_report: 'reports' }; return can(ctx.perms, map[n.type] || 'notifications', 'view'); }
    read('notifications.list', 'self', (ctx, a) => db.filter('notifications', n => visibleNotif(ctx, n) && (!a || !a.unread || !(n.read_by || []).includes(ctx.user.id))).sort((x, y) => y.created_at.localeCompare(x.created_at)).slice(0, (a && a.limit) || 200).map(n => Object.assign(n, { read: (n.read_by || []).includes(ctx.user.id) })));
    def('notifications.read', 'self', (ctx, a) => {
      const ids = a.all ? db.filter('notifications', n => visibleNotif(ctx, n)).map(n => n.id) : [a.id];
      ids.forEach(id => { const n = db.get('notifications', id); if (n && !(n.read_by || []).includes(ctx.user.id)) db.update('notifications', id, { read_by: (n.read_by || []).concat(ctx.user.id) }); });
      return true;
    }, { noAudit: true });
    read('logs.list', ['logs', 'view'], (ctx, a) => {
      a = a || {}; const qq = str(a.q, 80).toLowerCase();
      return db.filter('activity_logs', l => (!a.user || l.user_id === a.user) && (!a.module || l.module === a.module) && (!a.action || l.action === a.action) && inRange(l.created_at, a.from, a.to)
        && (!qq || [l.summary, l.user_name, l.record_id, l.action, l.module].join(' ').toLowerCase().includes(qq)))
        .sort((x, y) => y.created_at.localeCompare(x.created_at)).slice(0, a.limit || 1000);
    });

    /* ---------- media library ---------- */
    read('media.list', ['media', 'view'], (ctx, a) => {
      a = a || {}; const qq = str(a.q, 80).toLowerCase();
      return db.filter('media', m => (!a.folder || m.folder === a.folder) && (!qq || [m.name, m.alt_en, m.alt_ar].join(' ').toLowerCase().includes(qq)))
        .sort((x, y) => (y.real ? 1 : 0) - (x.real ? 1 : 0) || y.created_at.localeCompare(x.created_at));
    });
    def('media.save', 'self', (ctx, a) => {
      const exists = a.id && db.get('media', a.id);
      need(can(ctx.perms, 'media', exists ? 'edit' : 'create'), 'forbidden', 'Permission denied');
      const d = pick(a.data || {}, ['folder', 'name', 'url', 'mime', 'size', 'width', 'height', 'alt_en', 'alt_ar']);
      if (d.folder) need(schema.enums.mediaFolders.includes(d.folder), 'invalid', 'Unknown folder');
      if (d.mime) need(/^image\/(jpeg|png|webp|svg\+xml|gif)$/.test(d.mime), 'invalid', 'Only JPG, PNG, WEBP or SVG');
      if (d.url && /^data:/.test(d.url)) need(d.url.length < 3000000, 'invalid', 'Image too large after optimisation');
      if (d.url && /^data:image\/svg/.test(d.url)) need(!/<script|on\w+=|javascript:/i.test(atobSafe(d.url)), 'invalid', 'SVG contains scripts');
      if (exists) { const after = db.update('media', a.id, d); log(ctx, d.url ? 'replace' : 'update', 'media', a.id, `${d.url ? 'Replaced' : 'Edited'} ${after.name}`); return after; }
      need(d.url && d.name, 'invalid', 'File required');
      const row = db.insert('media', Object.assign({ id: uid('med'), created_at: now(), folder: 'products', uses: [], uploaded_by: ctx.user.name, real: true, alt_en: '', alt_ar: '' }, d));
      log(ctx, 'upload', 'media', row.id, `Uploaded ${row.name} → ${row.folder}`); return row;
    });
    const atobSafe = u => { try { const b = u.split(',')[1] || ''; return typeof atob === 'function' ? atob(b) : Buffer.from(b, 'base64').toString(); } catch (e) { return ''; } };
    def('media.delete', ['media', 'delete'], (ctx, a) => { const m = db.get('media', a.id); need(m, 'not_found'); db.remove('media', m.id); log(ctx, 'delete', 'media', m.id, `Deleted ${m.name}`, pick(m, ['name', 'folder', 'uses']), null); return true; });
    def('media.use', ['media', 'edit'], (ctx, a) => {
      const m = db.get('media', a.id); need(m, 'not_found');
      const target = a.target, ref = a.ref;
      if (target === 'product' || target === 'product_featured') {
        need(can(ctx.perms, 'products', 'edit'), 'forbidden', 'Permission denied'); const p = db.get('products', ref); need(p, 'not_found', 'Choose a product');
        const imgs = Object.assign({}, p.images || {});
        const gal = (imgs.gallery || []).filter(g => (g.src || g) !== m.url && !isPh(g.src || g));
        if (target === 'product_featured') { imgs.drape = m.url; imgs.drapeSm = m.url; imgs.styled = m.url; gal.unshift({ src: m.url, view: 'photo' }); } else gal.push({ src: m.url, view: 'photo' });
        if (isPh(imgs.drape)) { imgs.drape = m.url; imgs.drapeSm = m.url; }
        ['closeup', 'roll', 'folded', 'variations', 'styled'].forEach(k => { if (isPh(imgs[k])) imgs[k] = (gal[1] || gal[0] || {}).src || m.url; });
        imgs.gallery = gal; db.update('products', p.id, { images: imgs, updated_at: now() });
      } else if (target === 'category' || target === 'collection') {
        need(can(ctx.perms, 'products', 'edit'), 'forbidden', 'Permission denied');
        const t = target === 'category' ? 'categories' : 'collections'; need(db.get(t, ref), 'not_found', 'Choose a ' + target);
        db.update(t, ref, { image: m.url });
      } else if (target === 'banner') {
        need(can(ctx.perms, 'website', 'edit'), 'forbidden', 'Permission denied');
        const w = settings().website; const list = String(w.hero_images || '').split('\n').filter(Boolean).filter(u => u !== m.url); list.unshift(m.url);
        db.upsert('settings', { id: 'website', value: Object.assign({}, (db.get('settings', 'website') || {}).value || {}, { hero_images: list.slice(0, 3).join('\n') }), updated_at: now(), updated_by: ctx.user.name });
      } else if (target === 'logo') {
        need(can(ctx.perms, 'settings', 'edit'), 'forbidden', 'Permission denied');
        db.upsert('settings', { id: 'business', value: Object.assign({}, (db.get('settings', 'business') || {}).value || {}, { logo: m.url }), updated_at: now(), updated_by: ctx.user.name });
      } else need(false, 'invalid', 'Unknown target');
      const uses = (m.uses || []).filter(u => !(u.target === target && u.ref === ref)).concat([{ target, ref: ref || null }]);
      db.update('media', m.id, { uses });
      log(ctx, 'use', 'media', m.id, `${m.name} set as ${target}${ref ? ' · ' + ref : ''}`); return true;
    });

    /* ---------- backup / demo ---------- */
    read('backup.export', ['settings', 'export'], (ctx, a) => {
      const out = {}; Object.keys(schema.tables).forEach(t => { if (t === 'sessions') return; out[t] = db.all(t); });
      out.users = out.users.map(u => Object.assign({}, u, { password_hash: (a && a.includeHashes) ? u.password_hash : undefined }));
      db.upsert('settings', { id: 'backup', value: { last_export_at: now() }, updated_at: now(), updated_by: ctx.user.name });
      log(ctx, 'export', 'settings', 'backup', 'Exported full backup');
      return { format: 'rokn-backup', version: 1, exported_at: now(), tables: out };
    });
    def('backup.import', ['settings', 'edit'], (ctx, a) => {
      need(ctx.user.role_id === 'super_admin', 'forbidden', 'Only a Super Admin can restore a backup');
      need(a && a.format === 'rokn-backup' && a.tables, 'invalid', 'Not a Rokn backup file');
      Object.keys(a.tables).forEach(t => {
        if (!schema.tables[t] || t === 'sessions' || t === 'users') return;
        db.all(t).forEach(r => db.remove(t, r.id)); (a.tables[t] || []).forEach(r => db.insert(t, r));
      });
      log(ctx, 'import', 'settings', 'backup', 'Restored backup (users kept)'); return true;
    });
    def('demo.clear', ['settings', 'delete'], (ctx) => {
      need(ctx.user.role_id === 'super_admin', 'forbidden', 'Only a Super Admin can clear demo data');
      let n = 0;
      ['orders', 'payments', 'refunds', 'returns', 'inventory_transactions', 'expenses', 'customers', 'suppliers', 'purchase_orders', 'fabric_rolls', 'notifications'].forEach(t => {
        const demoIds = new Set(db.filter(t, r => r.demo).map(r => r.id));
        db.filter(t, r => r.demo).forEach(r => { db.remove(t, r.id); n++; });
        if (t === 'orders') db.filter('order_items', i => demoIds.has(i.order_id)).forEach(i => db.remove('order_items', i.id));
        if (t === 'purchase_orders') db.filter('purchase_items', i => demoIds.has(i.po_id)).forEach(i => db.remove('purchase_items', i.id));
      });
      // stock levels: rebuild from what remains (opening stock + real movements)
      db.all('inventory').forEach(inv => {
        const tx = db.filter('inventory_transactions', x => x.variant_id === inv.id);
        const sum = tx.reduce((s, x) => s + x.qty_m, 0);
        db.update('inventory', inv.id, { available_m: r3(sum), sold_m: r3(-tx.filter(x => x.type === 'sale').reduce((s, x) => s + x.qty_m, 0)), damaged_m: r3(-tx.filter(x => x.type === 'damage').reduce((s, x) => s + x.qty_m, 0)), reserved_m: 0 });
      });
      db.filter('users', u => u.demo && u.id !== ctx.user.id).forEach(u => { db.update('users', u.id, { status: 'inactive' }); });
      db.upsert('meta', { id: 'demo', value: false });
      log(ctx, 'clear_demo', 'settings', 'demo', `Removed ${n} demo records; demo staff accounts deactivated`); return { removed: n };
    });

    /* =====================================================================
       DISPATCH
       ===================================================================== */
    let queue = Promise.resolve();
    async function call(token, method, args, meta) {
      const run = async () => {
        const def = M[method];
        if (!def) throw new BizError('not_found', 'Unknown method: ' + method);
        const ctx = { ip: meta && meta.ip, device: meta && meta.device, user: null, perms: {}, sid: null };
        if (def.perm !== null) {
          const u = await sessionUser(token);
          if (!u) throw new BizError('unauthenticated', 'Please sign in');
          ctx.user = u; ctx.perms = permsFor(u); ctx.sid = await crypto.sha256(token);
          if (u.must_change_password && !['auth.me', 'auth.changePassword', 'auth.logout', 'auth.setLang', 'notifications.list'].includes(method)) throw new BizError('password_change_required', 'Please change your password first');
          if (Array.isArray(def.perm) && !can(ctx.perms, def.perm[0], def.perm[1])) {
            log(ctx, 'denied', def.perm[0], null, `Denied: ${method}`);
            throw new BizError('forbidden', `Permission denied (${def.perm[0]} · ${def.perm[1]})`);
          }
        } else if (meta && meta.system) { ctx.user = { id: 'system', name: 'System', role_id: 'super_admin' }; ctx.perms = permsFor({ role_id: 'super_admin' }); }
        const result = def.write && !def.noTx ? await db.tx(() => def.fn(ctx, args || {})) : await def.fn(ctx, args || {});
        if (def.write && hooks.afterWrite) await hooks.afterWrite(method);
        return result;
      };
      const p = queue.then(run, run); queue = p.catch(() => {}); return p;
    }

    return { call, methods: M, BizError, settings, publicCatalog, hashPassword, permsFor, move, nextNumber, uid, dayKey, r3, _db: db, writeOrder, priceLines, totalsFor, storePayment, deductStock, notify };
  }
  createServices.BizError = BizError;
  return createServices;
});
