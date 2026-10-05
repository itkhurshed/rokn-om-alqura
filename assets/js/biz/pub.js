/* ==========================================================================
   STOREFRONT ← ADMIN bridge.  The admin publishes a public snapshot (products,
   live stock, categories, collections, colours, coupons and public settings).
   Production: GET /api/public/catalog (server/server.js) — set
   ROKN.config.apiBase and render server-side or fetch before boot.
   Offline demo: the admin writes the same snapshot to localStorage 'rokn:pub'.
   Loaded after data/products.js and before data/catalog.js.
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  ROKN.data = ROKN.data || {};
  ROKN.data.baseProducts = ROKN.data.products;           // pristine catalogue (used to seed a fresh database)
  let pub = null;
  if (window.ROKN_PUB) pub = window.ROKN_PUB;            // server-rendered (server/server.js)
  else { try { pub = JSON.parse(localStorage.getItem('rokn:pub') || 'null'); } catch (e) { pub = null; } }
  ROKN.pub = pub;
  if (pub && !window.ROKN_PUB && (pub.seed || 1) < (ROKN.config.dataVersion || 1)) pub = null;   // snapshot from an older bundled catalogue
  ROKN.pub = pub;
  if (!pub || !Array.isArray(pub.products) || !pub.products.length) return;

  ROKN.data.products = pub.products.filter(p => p.status === 'active' && (p.variants || []).length);
  const s = pub.settings || {}, c = ROKN.config;
  const b = s.business || {}, sh = s.shipping || {}, pay = s.payments || {}, w = s.website || {}, seo = s.seo || {}, lang = s.languages || {};
  if (b.name_en) c.name = { en: b.name_en, ar: b.name_ar || b.name_en };
  if (b.phone) c.phone = b.phone;
  if (b.phone_e164) c.phoneE164 = b.phone_e164;
  if (b.whatsapp) c.whatsapp = String(b.whatsapp).replace(/\D/g, '');
  if (b.address_en) c.address = Object.assign({}, c.address, { en: b.address_en, ar: b.address_ar || b.address_en });
  if (b.maps_url) c.mapsUrl = b.maps_url;
  if (seo.site_url) c.siteUrl = seo.site_url;
  if (lang.default) c.defaultLang = lang.default;
  if (sh.standard_fee != null) c.shipping.methods.forEach(m => { const f = sh[m.id + '_fee']; if (f != null) m.fee = Number(f); });
  if ('free_threshold' in sh) c.shipping.freeThreshold = sh.free_threshold == null || sh.free_threshold === '' ? null : Number(sh.free_threshold);
  if (Object.keys(pay).length) {
    c.paymentGatewayConnected = !!pay.gateway_connected;
    c.payments = [{ id: 'knet', enabled: !!pay.knet }, { id: 'card', enabled: !!pay.card }, { id: 'applepay', enabled: !!pay.applepay }, { id: 'cod', enabled: !!pay.cod }];
  }
  if (Array.isArray(pub.coupons)) { c.coupons = {}; pub.coupons.forEach(x => { c.coupons[x.code] = { type: x.type, value: Number(x.value), min: Number(x.min || 0) }; }); }
  if ('sample_notice' in w) c.sampleCatalogue = !!w.sample_notice;
  if ('newsletter_connected' in w) c.newsletterConnected = !!w.newsletter_connected;
  ['instagram', 'facebook', 'tiktok'].forEach(k => { if (w[k + '_url']) c.social[k] = w[k + '_url']; });
  if (w.announcement_en) c.announcement = { en: w.announcement_en, ar: w.announcement_ar || w.announcement_en };
  if (w.hero_images) c.heroImages = String(w.hero_images).split('\n').map(x => x.trim()).filter(Boolean);
})();
