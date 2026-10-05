/* ==========================================================================
   CORE — formatting, persistent state (cart / wishlist / orders), router
   ========================================================================== */
window.ROKN = window.ROKN || {};

/* ---------- Safe storage (works in private mode / sandboxed previews) ---------- */
ROKN.storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem('rokn:' + key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('rokn:' + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
  }
};

/* ---------- Helpers ---------- */
ROKN.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

ROKN.fmt = {
  money(v, lang) {
    const n = Number(v || 0).toFixed(3);
    return (lang || ROKN.state.lang) === 'ar' ? `${n} د.ك` : `KWD ${n}`;
  },
  /* "12 fabrics" with correct Arabic plural forms */
  fabrics(n, lang) {
    if ((lang || ROKN.state.lang) === 'ar') return n === 1 ? 'قماش واحد' : n === 2 ? 'قماشان' : n >= 3 && n <= 10 ? `${n} أقمشة` : `${n} قماشًا`;
    return `${n} ${n === 1 ? 'fabric' : 'fabrics'}`;
  },
  cm(v) { return ROKN.state.lang === 'ar' ? `${v} سم` : `${v} cm`; },
  gsm(v) { return ROKN.state.lang === 'ar' ? `${v} غم/م²` : `${v} g/m²`; },
  meters(q) { return Number(q).toFixed(q % 1 ? 1 : 0); },
  date(iso, lang) {
    try { return new Date(iso).toLocaleDateString((lang || ROKN.state.lang) === 'ar' ? 'ar-KW-u-nu-latn' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return iso; }
  }
};

/* Translate: t('product.addToCart', {n: 3}) */
ROKN.t = function (path, vars) {
  const dict = ROKN.i18n[ROKN.state.lang];
  let v = path.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
  if (v == null) v = path.split('.').reduce((o, k) => (o == null ? o : o[k]), ROKN.i18n.en);
  if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));
  return v;
};
/* Localised field from data: L({en, ar}) */
ROKN.L = obj => (obj == null ? '' : (typeof obj === 'string' ? obj : (obj[ROKN.state.lang] || obj.en)));

/* ---------- Catalogue queries ---------- */
ROKN.q = {
  product: id => ROKN.catalog.products.find(p => p.id === id),
  category: id => ROKN.catalog.categories.find(c => c.id === id),
  collection: id => ROKN.catalog.collections.find(c => c.id === id),
  color: key => ROKN.catalog.colors[key] || { hex: '#ccc', en: key, ar: key },
  stock(p, color) { const v = p.variants.find(x => x.color === color); return v ? v.stock : 0; },
  totalStock: p => p.variants.reduce((s, v) => s + v.stock, 0),
  defaultColor(p) { const v = p.variants.find(x => x.stock > 0) || p.variants[0]; return v.color; },
  bestSellers: n => [...ROKN.catalog.products].sort((a, b) => b.sold - a.sold).slice(0, n),
  newest: n => [...ROKN.catalog.products].sort((a, b) => b.added.localeCompare(a.added)).slice(0, n),
  inCategory: id => ROKN.catalog.products.filter(p => p.category === id),
  inCollection: id => ROKN.catalog.products.filter(p => p.collections.includes(id)),
  price(p, color) { const v = p.variants.find(x => x.color === color); return (v && v.price) || p.price; },
  norm: s => String(s || '').toLowerCase().normalize('NFKD').replace(/[ً-ٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'),
  /* Search by name, fabric type, colour, material, collection or SKU — EN or AR.
     Returns [{ p, color }] where color is the variant matching a colour word (e.g. "black linen"). */
  searchHits(term) {
    const norm = ROKN.q.norm, C = ROKN.catalog;
    const words = norm(term).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const colorWord = key => { const c = C.colors[key]; const fam = C.colorFamilies.find(f => f.id === c.family) || {}; return norm(`${c.en} ${c.ar} ${fam.en || ''} ${fam.ar || ''} ${key}`); };
    return C.products.map(p => {
      const cat = ROKN.q.category(p.category);
      const hay = norm([
        p.name.en, p.name.ar, cat.en, cat.ar, p.composition.en, p.composition.ar, p.texture.en, p.texture.ar,
        p.use.en, p.use.ar, C.materials[p.material].en, C.materials[p.material].ar, C.fabricTypes[p.fabricType].en, C.fabricTypes[p.fabricType].ar,
        C.patterns[p.pattern].en, C.patterns[p.pattern].ar, p.sku, ...p.variants.map(v => v.sku),
        ...p.collections.map(c => `${ROKN.q.collection(c).en} ${ROKN.q.collection(c).ar}`)
      ].join(' '));
      let score = 0, color = null;
      for (const w of words) {
        const cv = p.variants.find(v => colorWord(v.color).includes(w));
        if (cv && !hay.includes(w)) { color = color || cv.color; score += 2; continue; }
        if (!hay.includes(w)) {
          if (cv) { color = color || cv.color; score += 2; continue; }
          return null;
        }
        score += norm(p.name.en + ' ' + p.name.ar).includes(w) ? 3 : 1;
        if (cv) color = color || cv.color;
      }
      return { p, color: color || ROKN.q.defaultColor(p), score };
    }).filter(Boolean).sort((a, b) => b.score - a.score || b.p.sold - a.p.sold);
  },
  search(term) { return ROKN.q.searchHits(term).map(h => h.p); },
  /* Autocomplete vocabulary in the active language */
  suggest(term) {
    const norm = ROKN.q.norm, C = ROKN.catalog, L = ROKN.L;
    const t = norm(term).trim(); if (!t) return [];
    const last = t.split(/\s+/).pop(), head = t.split(/\s+/).slice(0, -1).join(' ');
    const vocab = [
      ...C.categories.map(c => L(c)), ...C.colorFamilies.map(c => L(c)), ...Object.values(C.colors).map(c => L(c)),
      ...Object.values(C.materials).map(m => L(m)), ...C.collections.map(c => L(c)), ...C.products.map(p => L(p.name))
    ];
    const out = [];
    for (const v of [...new Set(vocab)]) {
      if (norm(v).split(/\s+/).some(x => x.startsWith(last)) || norm(v).startsWith(t)) {
        const phrase = head && !norm(v).startsWith(t) ? `${term.trim().split(/\s+/).slice(0, -1).join(' ')} ${v}` : v;
        if (!out.includes(phrase) && ROKN.q.searchHits(phrase).length) out.push(phrase);
      }
      if (out.length >= 6) break;
    }
    return out;
  },
  inFamily: (p, fam) => p.variants.some(v => ROKN.q.color(v.color).family === fam),
  familyColor: (p, fam) => { const v = p.variants.find(x => ROKN.q.color(x.color).family === fam && x.stock > 0) || p.variants.find(x => ROKN.q.color(x.color).family === fam); return v ? v.color : ROKN.q.defaultColor(p); }
};

/* ---------- App state ---------- */
ROKN.state = {
  lang: ROKN.storage.get('lang', ROKN.config.defaultLang || 'en'),
  cart: ROKN.storage.get('cart', []),           // [{id, color, qty}]
  wishlist: ROKN.storage.get('wishlist', []),   // [id]
  coupon: ROKN.storage.get('coupon', null),
  orders: ROKN.storage.get('orders', []),
  user: ROKN.storage.get('user', null),
  shop: null,                                    // transient shop filters
  pendingQuery: ''
};

ROKN.bus = {
  handlers: {},
  on(evt, fn) { (this.handlers[evt] = this.handlers[evt] || []).push(fn); },
  emit(evt, data) { (this.handlers[evt] || []).forEach(fn => fn(data)); }
};

ROKN.cart = {
  save() { ROKN.storage.set('cart', ROKN.state.cart); ROKN.bus.emit('cart'); },
  count() { return ROKN.state.cart.length; },
  add(id, color, qty) {
    const p = ROKN.q.product(id); if (!p) return false;
    qty = ROKN.cart.clampQty(qty);
    const stock = ROKN.q.stock(p, color);
    if (stock <= 0) return false;
    const line = ROKN.state.cart.find(l => l.id === id && l.color === color);
    if (line) line.qty = Math.min(stock, ROKN.cart.clampQty(line.qty + qty));
    else ROKN.state.cart.push({ id, color, qty: Math.min(stock, qty) });
    ROKN.cart.save(); return true;
  },
  setQty(i, qty) {
    const line = ROKN.state.cart[i]; if (!line) return;
    const p = ROKN.q.product(line.id);
    line.qty = Math.min(ROKN.q.stock(p, line.color), ROKN.cart.clampQty(qty));
    ROKN.cart.save();
  },
  remove(i) { ROKN.state.cart.splice(i, 1); ROKN.cart.save(); },
  clear() { ROKN.state.cart = []; ROKN.state.coupon = null; ROKN.storage.set('coupon', null); ROKN.cart.save(); },
  clampQty(q) {
    const c = ROKN.config; q = Number(q);
    if (!isFinite(q)) q = c.minMeters;
    q = Math.round(q / c.meterStep) * c.meterStep;
    return Math.max(c.minMeters, Math.min(c.maxMeters, q));
  },
  lines() {
    return ROKN.state.cart.map((l, i) => {
      const p = ROKN.q.product(l.id);
      if (!p) return null; const unit = ROKN.q.price(p, l.color);
      return { ...l, index: i, p, unit, total: +(unit * l.qty).toFixed(3) };
    }).filter(Boolean);
  },
  subtotal() { return +ROKN.cart.lines().reduce((s, l) => s + l.total, 0).toFixed(3); },
  discount(sub) {
    const code = ROKN.state.coupon; if (!code) return 0;
    const c = ROKN.config.coupons[code]; if (!c || sub < c.min) return 0;
    return +(c.type === 'percent' ? sub * c.value / 100 : Math.min(sub, c.value)).toFixed(3);
  },
  applyCoupon(code) {
    code = String(code || '').trim().toUpperCase();
    const c = ROKN.config.coupons[code];
    if (!c) return { ok: false, msg: ROKN.t('cart.couponInvalid') };
    if (ROKN.cart.subtotal() < c.min) return { ok: false, msg: ROKN.t('cart.couponMin', { n: c.min.toFixed(3) }) };
    ROKN.state.coupon = code; ROKN.storage.set('coupon', code); ROKN.bus.emit('cart');
    return { ok: true, msg: ROKN.t('cart.couponApplied', { c: code }) };
  },
  removeCoupon() { ROKN.state.coupon = null; ROKN.storage.set('coupon', null); ROKN.bus.emit('cart'); },
  shippingFee(methodId, sub) {
    const m = ROKN.config.shipping.methods.find(x => x.id === methodId) || ROKN.config.shipping.methods[0];
    const free = ROKN.config.shipping.freeThreshold;
    if (m.id === 'standard' && free && sub >= free) return 0;
    return m.fee;
  },
  totals(methodId) {
    const sub = ROKN.cart.subtotal();
    const disc = ROKN.cart.discount(sub);
    const ship = methodId ? ROKN.cart.shippingFee(methodId, sub - disc) : null;
    return { sub, disc, ship, total: +(sub - disc + (ship || 0)).toFixed(3) };
  }
};

ROKN.wishlist = {
  has: id => ROKN.state.wishlist.includes(id),
  toggle(id) {
    const w = ROKN.state.wishlist;
    const i = w.indexOf(id);
    if (i >= 0) w.splice(i, 1); else w.push(id);
    ROKN.storage.set('wishlist', w); ROKN.bus.emit('wishlist');
    return i < 0;
  }
};

/* ---------- Router (hash tokens: #shop, #product--italian-linen) ----------
   Route tokens use only letters, digits and "-" so links are shareable. */
ROKN.router = {
  /* Hash tokens carry the language: #en.shop--linen / #ar.product--italian-linen
     (production: map to /en/shop/linen and /ar/product/italian-linen) */
  parse(hash) {
    let raw = (hash || '').replace(/^#/, '');
    let lang = null;
    const m = raw.match(/^(en|ar)(?:\.|$)/);
    if (m) { lang = m[1]; raw = raw.slice(m[0].length); }
    raw = raw || 'home';
    const [name, ...rest] = raw.split('--');
    return { name, param: rest.join('--'), raw, lang };
  },
  href(token, lang) { return `#${lang || ROKN.state.lang}.${token || 'home'}`; },
  go(token) {
    const target = ROKN.router.href(token);
    if (location.hash === target) ROKN.router.render(); else location.hash = target;
  },
  render() {
    const route = ROKN.router.parse(location.hash);
    if (!route.lang) {   // un-prefixed link → normalise URL to the active language
      try { history.replaceState(null, '', ROKN.router.href(route.raw)); } catch (e) { /* sandboxed */ }
      route.lang = ROKN.state.lang;
    }
    if (route.lang !== ROKN.state.lang) {
      ROKN.state.lang = route.lang; ROKN.storage.set('lang', route.lang);
      ROKN.ui && ROKN.ui.renderShell();
    }
    ROKN.state.route = route;
    const page = ROKN.pages[route.name] || ROKN.pages.notFound;
    const app = document.getElementById('main');
    app.innerHTML = page.render(route.param) || '';
    page.mount && page.mount(route.param, app);
    ROKN.ui.afterRoute(route);
  }
};

/* Prefix every in-page link with the active language so links, sharing and SEO stay language-aware */
ROKN.localizeLinks = function (root) {
  (root || document).querySelectorAll('a[href^="#"]').forEach(a => {
    const h = a.getAttribute('href');
    if (h === '#' || /^#(en|ar)(\.|$)/.test(h) || a.hasAttribute('data-keep-href')) return;
    a.setAttribute('href', ROKN.router.href(h.slice(1)));
  });
};

ROKN.uid = () => 'RQ-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 90 + 10);
