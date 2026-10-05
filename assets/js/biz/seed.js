/* ==========================================================================
   SEED — (1) base data every installation needs: roles & permissions, colours,
   categories, collections, the product catalogue, opening stock, printers,
   media library (the store's real photos).
   (2) OPTIONAL DEMO DATA so the dashboard can be explored before launch.
       Every demo row carries demo:true, demo people are named "Demo …" and
       Admin → Settings → Backup → "Remove demo data" deletes them.
       Nothing here is the store's real trading history.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./schema.js'));
  else { root.ROKN = root.ROKN || {}; root.ROKN.biz = root.ROKN.biz || {}; root.ROKN.biz.seed = factory(root.ROKN.biz.schema); }
})(typeof self !== 'undefined' ? self : this, function (schema) {
  'use strict';
  const r3 = n => Math.round(n * 1000) / 1000;

  /* Real store photos supplied by the business (assets/img/store/) */
  const STORE_PHOTOS = [
    ['storefront', 'store', 'Store front — Rokn Om Alqura', 'واجهة متجر ركن أم القرى', 640, 640],
    ['store-interior', 'store', 'Store interior with suiting shelves', 'داخل المتجر ورفوف أقمشة البدلات', 750, 765],
    ['store-shelves', 'store', 'Shelves of folded fabrics', 'رفوف الأقمشة المطوية', 1360, 1020],
    ['japan-green-forest', 'products', 'Green Forest Japanese dishdasha fabric', 'قماش دشاديش ياباني الغابة الخضراء', 740, 902],
    ['japan-yearn-9x9', 'products', 'YEARN 9×9 Japanese dishdasha fabric', 'قماش دشاديش يارن ٩×٩', 1020, 1020],
    ['japan-liquid-repellent', 'products', 'Liquid-repellent Japanese dishdasha fabric', 'خام ضد السوائل ياباني', 750, 741],
    ['dishdasha-whites-fan', 'collections', 'Fan of white and cream dishdasha fabrics', 'مروحة أقمشة دشاديش بيضاء وكريمية', 765, 1020],
    ['dishdasha-herringbone', 'products', 'Herringbone dishdasha fabric', 'قماش دشاديش عظم السمكة', 765, 1020],
    ['dishdasha-pinstripe', 'products', 'Pinstripe dishdasha fabric', 'قماش دشاديش مقلم', 765, 1020],
    ['dishdasha-cream-stripe', 'products', 'Cream self-stripe dishdasha fabric', 'قماش دشاديش كريمي مقلم', 765, 1020],
    ['dishdasha-cream-twill', 'products', 'Cream twill dishdasha fabric', 'قماش دشاديش تويل كريمي', 765, 1020],
    ['dishdasha-cream-diagonal', 'products', 'Cream diagonal-weave dishdasha fabric', 'قماش دشاديش كريمي بنسيج مائل', 765, 1020],
    ['suiting-colour-card', 'collections', 'Numbered suiting shade card', 'بطاقة ألوان أقمشة البدلات', 1020, 1020],
    ['suiting-colour-fan', 'products', 'Suiting shade fan', 'مروحة ألوان أقمشة البدلات', 765, 1020],
    ['suiting-grey-pinstripe', 'products', 'Grey pinstripe suiting', 'قماش بدلات رمادي مقلم', 765, 1020],
    ['suiting-pinstripe-book', 'products', 'Pinstripe suiting swatch book', 'دفتر عينات بدلات مقلمة', 574, 1020],
    ['wool-220s-blue', 'products', "220's wool suiting", 'صوف بدلات 220’s', 574, 1020],
    ['shirting-lilac-navy', 'social', 'Lilac shirting with navy suiting', 'قماش قمصان ليلكي مع بدلات كحلي', 574, 1020],
    ['shirting-lilac-suiting', 'products', 'Lilac shirting fabric', 'قماش قمصان ليلكي', 574, 1020]
  ];

  function permissionRows() {
    const out = [];
    schema.modules.forEach(m => schema.actions.forEach(a => out.push({ id: `${m}:${a}`, module: m, action: a })));
    return out;
  }

  /* src: { products:[records], catalog:{colors,categories,collections,fabricTypes}, config } */
  function base(svc, src, opts) {
    opts = opts || {};
    const db = svc._db, now = new Date().toISOString(), cfg = src.config || {};
    const openingAt = opts.openingAt || now;
    db.upsert('branches', { id: 'main', created_at: now, name_en: 'Kuwait City', name_ar: 'مدينة الكويت', address: 'XFJ+65H, Mubarak Al Kabeer St', phone: '+965 9735 8288', status: 'active' });
    db.upsert('warehouses', { id: 'main', created_at: now, branch_id: 'main', name_en: 'Store stockroom', name_ar: 'مخزن المتجر', status: 'active' });
    permissionRows().forEach(p => db.upsert('permissions', p));
    schema.roles.forEach(r => {
      db.upsert('roles', { id: r.id, key: r.key, name_en: r.name_en, name_ar: r.name_ar, system: r.system, created_at: now });
      if (r.perms === '*') return;
      Object.keys(r.perms).forEach(m => r.perms[m].split(' ').forEach(a => db.upsert('role_permissions', { id: `${r.id}:${m}:${a}`, role_id: r.id, permission_id: `${m}:${a}` })));
    });
    const C = src.catalog;
    Object.keys(C.colors).forEach(k => db.upsert('colors', { id: k, name_en: C.colors[k].en, name_ar: C.colors[k].ar, hex: C.colors[k].hex, family: C.colors[k].family }));
    Object.keys(C.fabricTypes).forEach(k => db.upsert('fabric_types', { id: k, name_en: C.fabricTypes[k].en, name_ar: C.fabricTypes[k].ar }));
    C.categories.forEach((c, i) => db.upsert('categories', { id: c.id, created_at: now, name_en: c.en, name_ar: c.ar, desc_en: c.desc ? c.desc.en : '', desc_ar: c.desc ? c.desc.ar : '', image: c.image || '', cover: c.cover || null, home: !!c.home, sort: i, status: 'active' }));
    C.collections.forEach((c, i) => db.upsert('collections', { id: c.id, created_at: now, name_en: c.en, name_ar: c.ar, desc_en: c.desc ? c.desc.en : '', desc_ar: c.desc ? c.desc.ar : '', image: c.image, feature: c.feature || '', editorial: c.editorial || [], sort: i, status: 'active' }));
    const cols = Object.keys(schema.tables.products.cols);
    src.products.forEach(r => {
      const row = {}; cols.forEach(k => { if (r[k] !== undefined) row[k] = r[k]; });
      Object.assign(row, { id: r.id, slug: r.slug || r.id, created_at: r.created_at ? new Date(r.created_at).toISOString() : now, updated_at: now, barcode: r.sku, demo: !r.real_photos });
      db.upsert('products', row);
      (r.variants || []).forEach(v => {
        const vid = `${r.id}:${v.color}`;
        db.upsert('product_variants', { id: vid, created_at: now, product_id: r.id, color: v.color, sku: v.sku, barcode: v.sku, price_per_meter: v.price_per_meter || null, cost_per_meter: null, min_stock_m: 20, location: '', status: 'active' });
        db.upsert('inventory', { id: vid, variant_id: vid, product_id: r.id, warehouse_id: 'main', available_m: v.stock_m, reserved_m: 0, sold_m: 0, damaged_m: 0, min_stock_m: 20, updated_at: now });
        db.upsert('inventory_transactions', { id: `itx_open_${vid}`, created_at: openingAt, variant_id: vid, product_id: r.id, roll_id: null, type: 'opening', qty_m: v.stock_m, before_m: 0, after_m: v.stock_m, reason: 'Opening stock (catalogue import)', ref_type: 'import', ref_id: null, user_id: 'system', user_name: 'System', demo: false });
      });
    });
    Object.keys(cfg.coupons || {}).forEach(code => { const c = cfg.coupons[code]; db.upsert('coupons', { id: code, code, created_at: now, type: c.type, value: c.value, min: c.min, active: true, used: 0, max_uses: null, starts_at: null, ends_at: null }); });
    [
      { id: 'prn_receipt', name: 'Counter receipt printer', type: 'receipt', paper: '80mm', paper_w_mm: 80, connection: 'browser', is_default: true, copies: 1 },
      { id: 'prn_a4', name: 'Office A4 printer', type: 'a4', paper: 'A4', paper_w_mm: 210, connection: 'browser', is_default: true, copies: 1 },
      { id: 'prn_label', name: 'Barcode label printer', type: 'label', paper: 'label-50x30', paper_w_mm: 50, connection: 'browser', is_default: true, copies: 1 }
    ].forEach(p => db.upsert('printers', Object.assign({ created_at: now, address: '', header: '', footer: '', show_logo: true, show_address: true, show_phone: true, show_qr: true, show_barcode: true, status: 'active' }, p)));
    [
      { id: 'pp_receipt', name: 'POS receipt', document: 'receipt', printer_id: 'prn_receipt', paper: '80mm', copies: 1, lang: 'both', auto_print: false },
      { id: 'pp_invoice', name: 'A4 tax invoice', document: 'invoice', printer_id: 'prn_a4', paper: 'A4', copies: 1, lang: 'both', auto_print: false },
      { id: 'pp_label', name: 'Fabric roll labels', document: 'label', printer_id: 'prn_label', paper: 'label-50x30', copies: 1, lang: 'en', auto_print: false },
      { id: 'pp_report', name: 'Reports (A4)', document: 'report', printer_id: 'prn_a4', paper: 'A4', copies: 1, lang: 'both', auto_print: false }
    ].forEach(p => db.upsert('printer_profiles', Object.assign({ created_at: now }, p)));
    STORE_PHOTOS.forEach(([n, folder, en, ar, w, h]) => db.upsert('media', { id: 'med_' + n, created_at: now, folder, name: n + '.webp', url: `assets/img/store/${n}.webp`, mime: 'image/webp', size: null, width: w, height: h, alt_en: en, alt_ar: ar, uses: [], uploaded_by: 'Store owner', real: true }));
    db.upsert('media', { id: 'med_logo_mark', created_at: now, folder: 'logo', name: 'favicon.svg', url: 'assets/img/favicon.svg', mime: 'image/svg+xml', size: null, width: 64, height: 64, alt_en: 'Rokn Om Alqura mark', alt_ar: 'شعار ركن أم القرى', uses: [{ target: 'logo', ref: null }], uploaded_by: 'System', real: false });
    db.upsert('meta', { id: 'schema_version', value: 1 });
    db.upsert('meta', { id: 'seeded_at', value: now });
  }

  /* ---------- deterministic PRNG so demo data is identical everywhere ---------- */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  async function demo(svc, opts) {
    opts = opts || {};
    const db = svc._db, R = rng(20261005), pickR = a => a[Math.floor(R() * a.length)];
    const today = opts.today ? new Date(opts.today) : new Date();
    const at = (daysAgo, h, m) => { const d = new Date(today); d.setDate(d.getDate() - daysAgo); d.setHours(h, m || 0, Math.floor(R() * 59), 0); return d.toISOString(); };
    const day = (daysAgo) => svc.dayKey(at(daysAgo, 12));
    const DAYS = opts.days || 75;
    const password = opts.password || 'Rokn@2026';

    // demo cost prices (≈55% of retail) so profit reports have something to show
    db.all('products').forEach(p => { if (p.cost_per_meter == null) db.update('products', p.id, { cost_per_meter: r3(p.price_per_meter * (0.5 + R() * 0.12)) }); });

    /* staff accounts — one per role */
    const staff = [
      ['usr_owner', 'Demo Owner', 'admin', 'super_admin'], ['usr_admin', 'Demo Admin', 'office', 'admin'], ['usr_manager', 'Demo Manager', 'manager', 'manager'],
      ['usr_sales', 'Demo Sales', 'sales', 'sales_staff'], ['usr_stock', 'Demo Inventory', 'inventory', 'inventory_staff'], ['usr_accounts', 'Demo Accountant', 'accountant', 'accountant'],
      ['usr_cashier', 'Demo Cashier', 'cashier', 'cashier'], ['usr_viewer', 'Demo Viewer', 'viewer', 'viewer']
    ];
    const hash = await svc.hashPassword(password);   // one hash (own salt) reused only for demo accounts to keep first load fast
    staff.forEach(([id, name, username, role]) => {
      db.upsert('users', { id, created_at: at(DAYS + 5, 9), name, username, email: `${username}@example.com`, phone: '', password_hash: hash, role_id: role, status: 'active', photo: '', lang: 'en', branch_id: 'main', must_change_password: false, failed_attempts: 0, locked_until: null, last_login_at: null, updated_at: at(DAYS + 5, 9), demo: true });
      db.upsert('user_roles', { id: `${id}:${role}`, user_id: id, role_id: role });
    });
    const sellers = staff.filter(s => ['manager', 'sales_staff', 'cashier'].includes(s[3]));

    /* customers */
    const customers = [];
    for (let i = 1; i <= 16; i++) {
      const id = 'cus_demo_' + i;
      customers.push(db.upsert('customers', { id, created_at: at(DAYS - i * 3 > 0 ? DAYS - i * 3 : 2, 11), name: `Demo Customer ${String(i).padStart(2, '0')}`, phone: `+9650000${String(i).padStart(4, '0')}`, email: `customer${i}@example.com`, addresses: i % 3 ? [{ city: 'Hawalli', area: 'Salmiya', block: String(i), street: '1' }] : [], notes: '', lang: i % 2 ? 'ar' : 'en', source: i % 4 ? 'pos' : 'web', tags: [], demo: true }));
    }
    /* suppliers */
    const suppliers = [
      ['sup_demo_1', 'Demo Supplier — Japanese Dishdasha', 'JP'], ['sup_demo_2', 'Demo Supplier — Suiting Mill', 'IT'],
      ['sup_demo_3', 'Demo Supplier — Silk & Satin', 'CN'], ['sup_demo_4', 'Demo Supplier — Cotton & Linen', 'EG']
    ].map(([id, name, country]) => db.upsert('suppliers', { id, created_at: at(DAYS + 10, 10), name, contact: 'Demo contact', phone: '+9650000' + id.slice(-1) + '999', email: `supplier${id.slice(-1)}@example.com`, address: '', country, notes: 'Demo record', status: 'active', demo: true }));

    /* -------- build events per variant, then write a consistent ledger -------- */
    const variants = db.all('product_variants');
    const products = Object.fromEntries(db.all('products').map(p => [p.id, p]));
    const finalStock = Object.fromEntries(db.all('inventory').map(i => [i.id, i.available_m]));
    const weight = v => { const p = products[v.product_id]; return (p.best_seller ? 4 : 1) + (p.featured ? 1 : 0) + (finalStock[v.id] > 100 ? 2 : finalStock[v.id] > 40 ? 1 : 0.3); };
    const pool = []; variants.forEach(v => { const w = Math.round(weight(v) * 2); for (let i = 0; i < w; i++) pool.push(v); });
    const meterChoices = [1, 1.5, 2, 2, 2.5, 3, 3, 3.5, 4, 5, 6, 8];
    const events = {}; variants.forEach(v => { events[v.id] = []; });
    const sys = { user: null, perms: {} };
    const orders = [];
    const methods = ['cash', 'cash', 'knet', 'knet', 'knet', 'card', 'card', 'bank_transfer'];
    for (let d = DAYS; d >= 0; d--) {
      const dow = new Date(at(d, 12)).getDay();             // Friday quieter, weekend busier
      const n = Math.max(1, Math.round((dow === 5 ? 2 : dow === 4 || dow === 6 ? 7 : 5) * (0.6 + R() * 0.8)));
      for (let k = 0; k < n; k++) {
        const web = R() < 0.22;
        const lines = 1 + (R() < 0.45 ? 1 : 0) + (R() < 0.15 ? 1 : 0);
        const items = []; const used = new Set();
        for (let l = 0; l < lines; l++) { const v = pickR(pool); if (used.has(v.id)) continue; used.add(v.id); items.push({ variant_id: v.id, meters: pickR(meterChoices) * (R() < 0.1 ? 3 : 1), discount: 0 }); }
        const priced = svc.priceLines(items);
        if (R() < 0.12 && !web) priced.forEach(pl => { pl.disc = r3(pl.gross * 0.05); pl.total = r3(pl.gross - pl.disc); });
        const seller = pickR(sellers);
        const cust = R() < (web ? 1 : 0.45) ? pickR(customers) : null;
        const hour = 10 + Math.floor(R() * 11);
        const created = at(d, hour, Math.floor(R() * 60));
        const ship = web ? 2 : 0;
        const t = svc.totalsFor(priced, 0, ship);
        const recent = d <= 3;
        const status = web ? (d === 0 ? 'pending' : d === 1 ? 'processing' : d === 2 ? 'preparing' : d <= 4 ? 'shipped' : 'delivered') : 'completed';
        const o = Object.assign({ id: `ord_demo_${d}_${k}`, created_at: created, number: '', channel: web ? 'web' : 'pos', status, customer_id: cust ? cust.id : null,
          customer_name: cust ? cust.name : 'Walk-in customer', customer_phone: cust ? cust.phone : '', customer_email: cust ? cust.email : '', salesperson_id: web ? null : seller[0], salesperson_name: web ? 'Website' : seller[1],
          branch_id: 'main', paid: 0, refunded: 0, payment_method: web ? pickR(['knet', 'knet', 'card', 'cod']) : pickR(methods), payment_status: 'paid', ship_method: web ? 'standard' : 'pickup',
          address: web && cust ? (cust.addresses[0] || null) : null, coupon: null, notes: '', updated_at: created, completed_at: web ? null : created, demo: true }, t);
        if (web && o.payment_method === 'cod' && !['delivered'].includes(status)) o.payment_status = 'unpaid';
        o.paid = o.payment_status === 'paid' ? o.total : 0;
        if (R() < 0.025 && !recent) o.status = 'cancelled';
        orders.push({ o, priced });
      }
    }
    orders.sort((a, b) => a.o.created_at.localeCompare(b.o.created_at));
    let inv = 1001;
    orders.forEach(({ o, priced }) => {
      o.number = 'INV-' + (inv++);
      svc.writeOrder(sys, o, priced);
      if (o.status !== 'cancelled') {
        db.filter('order_items', i => i.order_id === o.id).forEach(i => events[i.variant_id].push({ at: o.created_at, type: 'sale', qty: -i.meters, ref_type: 'order', ref_id: o.id, reason: o.number }));
        if (o.paid) db.insert('payments', { id: 'pay_' + o.id, created_at: o.created_at, order_id: o.id, method: o.payment_method, amount: o.total, tendered: null, change: null, reference: '', status: 'captured', user_id: o.salesperson_id || 'system', demo: true });
      }
    });
    db.upsert('meta', { id: 'seq_invoice', value: inv - 1 });
    // a few refunds (partial returns, restocked)
    orders.filter(x => x.o.status === 'completed' && R() < 0.03).slice(0, 5).forEach(({ o }) => {
      const it = db.filter('order_items', i => i.order_id === o.id)[0]; const m = Math.min(it.meters, 1);
      const amount = r3(it.total * m / it.meters);
      db.update('order_items', it.id, { returned_m: m });
      const created = new Date(new Date(o.created_at).getTime() + 86400000 * 2).toISOString();
      const ret = db.insert('returns', { id: 'ret_' + o.id, created_at: created, order_id: o.id, items: [{ item_id: it.id, sku: it.sku, meters: m }], reason: 'Demo: colour exchange', restock: true, user_id: 'usr_manager', demo: true });
      db.insert('refunds', { id: 'rfd_' + o.id, created_at: created, order_id: o.id, return_id: ret.id, amount, method: o.payment_method, reason: 'Demo: colour exchange', user_id: 'usr_manager', demo: true });
      db.update('orders', o.id, { status: 'partially_refunded', refunded: amount });
      events[it.variant_id].push({ at: created, type: 'return', qty: m, ref_type: 'return', ref_id: ret.id, reason: 'Return ' + o.number });
    });
    // damages
    for (let i = 0; i < 4; i++) { const v = pickR(variants); if (finalStock[v.id] < 20) continue; events[v.id].push({ at: at(Math.floor(R() * 40) + 2, 17), type: 'damage', qty: -pickR([0.5, 1, 1.5, 2]), ref_type: 'manual', reason: 'Demo: water-marked end of roll' }); }

    /* purchase orders (received ones add stock in the ledger) */
    const poDefs = [[60, 'sup_demo_1', 'dishdasha'], [48, 'sup_demo_2', 'suiting'], [40, 'sup_demo_3', 'silk'], [30, 'sup_demo_4', 'linen'], [18, 'sup_demo_1', 'dishdasha'], [9, 'sup_demo_3', 'satin'], [4, 'sup_demo_2', 'suiting'], [1, 'sup_demo_4', 'cotton']];
    let poN = 1001;
    poDefs.forEach(([d, sup, cat], i) => {
      const id = 'po_demo_' + i; const received = d > 5;
      const vs = variants.filter(v => products[v.product_id].category === cat).slice(0, 3);
      if (!vs.length) return;
      const items = vs.map(v => { const m = 50 * (1 + Math.floor(R() * 3)); const c = products[v.product_id].cost_per_meter || 2; return { id: `pi_${id}_${v.id}`, created_at: at(d, 10), po_id: id, product_id: v.product_id, variant_id: v.id, meters: m, rolls: m / 50, cost_per_meter: c, total: r3(m * c) }; });
      const total = r3(items.reduce((s, x) => s + x.total, 0));
      db.insert('purchase_orders', { id, created_at: at(d + 3, 10), number: 'PO-' + (poN++), supplier_id: sup, date: day(d + 3), status: received ? 'received' : 'ordered', payment_status: received ? (i % 3 ? 'paid' : 'partial') : 'unpaid', subtotal: total, total, paid: received ? (i % 3 ? total : r3(total / 2)) : 0, notes: 'Demo purchase order', created_by: 'Demo Manager', received_at: received ? at(d, 11) : null, demo: true });
      items.forEach(it => {
        db.insert('purchase_items', it);
        if (received) events[it.variant_id].push({ at: at(d, 11), type: 'purchase', qty: it.meters, ref_type: 'purchase', ref_id: id, reason: 'Received PO-' + (poN - 1), po: id, supplier: sup, cost: it.cost_per_meter, rolls: it.rolls });
      });
    });
    db.upsert('meta', { id: 'seq_po', value: poN - 1 });

    /* write ledger: opening = final − Σ(other events) ; then running balances */
    const openAt = at(DAYS + 2, 8);
    let rollN = 1;
    variants.forEach(v => {
      const evs = events[v.id].sort((a, b) => a.at.localeCompare(b.at));
      const delta = evs.reduce((s, e) => s + e.qty, 0);
      let opening = r3(finalStock[v.id] - delta);
      // ensure the balance never dips below zero at any point
      let run = opening, minRun = opening; evs.forEach(e => { run += e.qty; minRun = Math.min(minRun, run); });
      if (minRun < 0) opening = r3(opening - minRun);
      const extra = r3(opening - (finalStock[v.id] - delta));      // extra opening that must leave as a stock-take adjustment
      if (extra > 0) evs.push({ at: at(1, 20), type: 'adjustment', qty: -extra, ref_type: 'manual', reason: 'Demo: stock-take correction' });
      db.update('inventory_transactions', `itx_open_${v.id}`, { created_at: openAt, qty_m: opening, after_m: opening, demo: false });
      let bal = opening, sold = 0, damaged = 0;
      evs.forEach((e, i) => {
        const before = bal; bal = r3(bal + e.qty);
        if (e.type === 'sale') sold += -e.qty; if (e.type === 'return') sold -= e.qty; if (e.type === 'damage') damaged += -e.qty;
        db.insert('inventory_transactions', { id: `itx_demo_${v.id}_${i}`, created_at: e.at, variant_id: v.id, product_id: v.product_id, roll_id: null, type: e.type, qty_m: e.qty, before_m: before, after_m: bal, reason: e.reason, ref_type: e.ref_type, ref_id: e.ref_id || null, user_id: 'usr_manager', user_name: e.type === 'sale' ? 'POS / Website' : 'Demo Manager', demo: true });
      });
      db.update('inventory', v.id, { available_m: bal, sold_m: r3(sold), damaged_m: r3(damaged) });
      // rolls that make up today's stock
      let left = bal; let k = 0;
      while (left > 0.01 && k < 6) {
        const orig = left > 60 ? 50 + Math.floor(R() * 3) * 10 : Math.max(left, 25 + Math.floor(R() * 4) * 5);
        const rem = r3(Math.min(left, orig - (k === 0 ? Math.floor(R() * 3) * 5 : 0)) || left);
        const take = r3(Math.min(rem, left));
        const pe = evs.find(e => e.type === 'purchase');
        db.insert('fabric_rolls', { id: `roll_demo_${rollN}`, created_at: openAt, barcode: `R${String(rollN).padStart(6, '0')}`, product_id: v.product_id, variant_id: v.id, color: v.color,
          batch: pe ? 'PO batch' : 'B-' + (2026000 + rollN), supplier_id: pe ? pe.supplier : pickR(suppliers).id, original_m: Math.max(orig, take), remaining_m: take,
          cost_per_meter: products[v.product_id].cost_per_meter, purchase_date: day(pe ? 20 : DAYS + 2), location: `Shelf ${String.fromCharCode(65 + (rollN % 6))}${1 + (rollN % 4)}`,
          status: take < Math.max(orig, take) ? 'partial' : 'available', po_id: pe ? pe.po : null, demo: true });
        left = r3(left - take); k++; rollN++;
      }
    });
    // one reserved and one damaged roll for the demo
    const rr = db.filter('fabric_rolls', r => r.remaining_m > 20)[3];
    if (rr) { db.update('fabric_rolls', rr.id, { status: 'reserved' }); const i = db.get('inventory', rr.variant_id); db.update('inventory', rr.variant_id, { reserved_m: rr.remaining_m }); }

    /* held sale + quotation */
    [['held', 'HLD-1001', 0], ['quote', 'QT-1001', 1]].forEach(([status, number, d], i) => {
      const priced = svc.priceLines([{ variant_id: variants[i * 7].id, meters: 3 }, { variant_id: variants[i * 7 + 3].id, meters: 2.5 }]);
      const t = svc.totalsFor(priced, 0, 0);
      svc.writeOrder(sys, Object.assign({ id: `ord_demo_${status}`, created_at: at(d, 15), number, channel: 'pos', status, customer_id: customers[i].id, customer_name: customers[i].name, customer_phone: customers[i].phone, customer_email: '',
        salesperson_id: 'usr_sales', salesperson_name: 'Demo Sales', branch_id: 'main', paid: 0, refunded: 0, payment_method: null, payment_status: 'unpaid', ship_method: 'pickup', address: null, coupon: null, notes: 'Demo', updated_at: at(d, 15), completed_at: null, demo: true }, t), priced);
    });
    db.upsert('meta', { id: 'seq_held', value: 1001 }); db.upsert('meta', { id: 'seq_quote', value: 1001 });

    /* expenses */
    let ex = 1001;
    const exp = (d, category, description, amount, pm) => db.insert('expenses', { id: 'exp_demo_' + ex, created_at: at(d, 10), number: 'EXP-' + (ex++), date: day(d), category, description: 'Demo: ' + description, amount, payment_method: pm || 'bank_transfer', created_by: 'usr_accounts', created_by_name: 'Demo Accountant', attachment: null, demo: true });
    for (let m = 0; m < 3; m++) {
      const d0 = today.getDate() - 1 + m * 30;
      if (d0 <= DAYS) { exp(d0, 'rent', 'Monthly shop rent', 650); exp(d0, 'salary', 'Staff salaries', 1450); exp(Math.max(0, d0 - 4), 'electricity', 'Electricity bill', 38.5); exp(Math.max(0, d0 - 6), 'internet', 'Internet & phone', 17.5); }
    }
    for (let i = 0; i < 14; i++) { const d = Math.floor(R() * DAYS); const c = pickR(['packaging', 'transportation', 'supplies', 'marketing', 'maintenance', 'other']); exp(d, c, { packaging: 'Bags & tissue paper', transportation: 'Delivery driver', supplies: 'Scissors, chalk & tape', marketing: 'Instagram promotion', maintenance: 'AC service', other: 'Miscellaneous' }[c], r3(3 + R() * 40), R() < 0.6 ? 'cash' : 'knet'); }
    db.upsert('meta', { id: 'seq_expense', value: ex - 1 });

    /* closed daily reports for the last few days */
    const closer = { user: { id: 'usr_manager', name: 'Demo Manager', role_id: 'manager' }, perms: { reports: ['view', 'export'] } };
    for (let d = 6; d >= 1; d--) {
      const date = day(d);
      const rep = svc.methods['reports.daily'].fn(closer, { date, opening_cash: 50 });
      db.insert('daily_reports', { id: 'day_demo_' + d, created_at: at(d, 22), date, opening_cash: rep.opening_cash, counted_cash: r3(rep.expected_cash - (d === 3 ? 1.5 : 0)), closing_cash: rep.expected_cash, data: Object.assign({}, rep, { invoices_list: undefined, expenses_list: undefined, closed: undefined }), notes: d === 3 ? 'Demo: KWD 1.500 short — recounted next morning' : '', closed_by: 'Demo Manager', closed_at: at(d, 22) });
    }

    /* notifications reflecting current stock */
    db.all('inventory').filter(i => i.available_m <= i.min_stock_m).slice(0, 6).forEach((i, k) => {
      const v = db.get('product_variants', i.id), p = products[v.product_id];
      db.insert('notifications', { id: 'ntf_demo_low_' + k, created_at: at(0, 9, k), type: i.available_m <= 0 ? 'out_of_stock' : 'low_stock', level: i.available_m <= 0 ? 'danger' : 'warning',
        title_en: i.available_m <= 0 ? 'Out of stock' : 'Low stock', title_ar: i.available_m <= 0 ? 'نفد من المخزون' : 'مخزون منخفض',
        body_en: `${p.name_en} — ${v.color} (${v.sku}): ${i.available_m} m left`, body_ar: `${p.name_ar} — ${v.color} (${v.sku}): متبقٍ ${i.available_m} م`, link: 'inventory', read_by: [], demo: true });
    });
    orders.filter(x => x.o.channel === 'web' && x.o.status === 'pending').forEach(({ o }, k) => db.insert('notifications', { id: 'ntf_demo_ord_' + k, created_at: o.created_at, type: 'new_order', level: 'info', title_en: 'New website order', title_ar: 'طلب جديد من الموقع', body_en: `${o.number} — ${o.customer_name} — KWD ${o.total.toFixed(3)}`, body_ar: `${o.number} — ${o.customer_name} — ${o.total.toFixed(3)} د.ك`, link: 'orders', read_by: [], demo: true }));
    db.insert('activity_logs', { id: 'log_seed', created_at: new Date().toISOString(), user_id: 'system', user_name: 'System', action: 'seed', module: 'settings', record_id: null, summary: 'Demo data generated (clearly marked DEMO — remove in Settings → Backup)', before: null, after: null, ip: '', device: '' });
    db.upsert('meta', { id: 'demo', value: true });
    return { orders: orders.length, users: staff.length, password };
  }

  return { base, demo, STORE_PHOTOS, permissionRows };
});
