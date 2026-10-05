/* ==========================================================================
   SEO — per-route title / description / canonical / hreflang / Open Graph +
   JSON-LD (Product, BreadcrumbList, CollectionPage). Organization + Store
   schema is static in index.html. For production, pre-render each language
   route (/en/..., /ar/...) so crawlers receive this HTML directly.
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const { t, L } = ROKN;
  const head = document.head;
  const meta = (name, content, attr = 'name') => {
    let el = head.querySelector(`meta[${attr}="${name}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); head.appendChild(el); }
    el.setAttribute('content', content);
  };
  const link = (rel, href, hreflang) => {
    const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
    let el = head.querySelector(sel);
    if (!el) { el = document.createElement('link'); el.rel = rel; if (hreflang) el.hreflang = hreflang; head.appendChild(el); }
    el.href = href;
  };
  const ld = (id, data) => {
    let el = document.getElementById(id);
    if (!data) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = id; head.appendChild(el); }
    el.textContent = JSON.stringify(data);
  };
  const site = () => ROKN.config.siteUrl;
  const ar = () => ROKN.state.lang === 'ar';
  const brand = () => (ar() ? 'ركن أم القرى' : 'Rokn Om Alqura');
  const url = (raw, lang) => `${site()}/${ROKN.router.href(raw, lang)}`;

  function apply(raw, title, desc, image, type = 'website', noindex = false) {
    document.title = title;
    meta('description', desc);
    meta('robots', noindex ? 'noindex, follow' : 'index, follow');
    link('canonical', url(raw));
    link('alternate', url(raw, 'en'), 'en');
    link('alternate', url(raw, 'ar'), 'ar-KW');
    link('alternate', url(raw, 'en'), 'x-default');
    meta('og:title', title, 'property'); meta('og:description', desc, 'property'); meta('og:type', type, 'property');
    meta('og:url', url(raw), 'property'); meta('og:image', `${site()}/${image || 'assets/img/hero.webp'}`, 'property');
    meta('og:locale', ar() ? 'ar_KW' : 'en_KW', 'property');
  }
  const crumbs = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: t('crumbs.home'), raw: 'home' }, ...items].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: url(it.raw) })) });

  ROKN.seo = {
    route(route) {
      const { name, param, raw } = route;
      if (name === 'product') return;   // handled in product()
      if (name === 'admin') { document.title = 'Staff · Rokn Om Alqura'; meta('robots', 'noindex, nofollow'); ['ld-product', 'ld-breadcrumb', 'ld-collection', 'ld-faq'].forEach(k => ld(k, null)); return; }
      ld('ld-product', null);
      const m = t('meta');
      const noindex = ['cart', 'checkout', 'account', 'order', 'wishlist', 'track', 'search'].includes(name);
      if (m[name]) { apply(raw, m[name][0], m[name][1], name === 'home' ? 'assets/img/hero.webp' : 'assets/img/scenes/showroom.webp'); ld('ld-breadcrumb', name === 'home' ? null : crumbs([{ name: m[name][0].split(' | ')[0], raw }])); ld('ld-collection', null); return; }
      if (['shop', 'collection', 'new', 'bestsellers', 'search', 'color', 'categories', 'collections'].includes(name)) {
        let heading = name === 'categories' ? t('pages.categories') : name === 'collections' ? t('pages.collections') : ROKN.pages.shop.title(name, param);
        const cat = name === 'shop' && param ? ROKN.q.category(param) : null, col = name === 'collection' ? ROKN.q.collection(param) : null;
        let title = name === 'shop' && !param ? m.shop[0] : cat ? (ar() ? `أقمشة ${L(cat)} في الكويت | ${brand()}` : `${L(cat)} Fabric in Kuwait | ${brand()}`) : col ? (ar() ? `${L(col)} | أقمشة فاخرة الكويت | ${brand()}` : `${L(col)} | Luxury Fabrics Kuwait | ${brand()}`) : `${heading} | ${brand()}`;
        const desc = cat ? (ar() ? `${L(cat.desc)} تسوّق أقمشة ${L(cat)} بالمتر من متجر أقمشة في مدينة الكويت.` : `${L(cat.desc)} Shop ${L(cat)} fabric by the metre from our fabric store in Kuwait City.`) : col ? L(col.desc) : m.shop[1];
        apply(raw, title, desc, col ? col.image.replace(/^\//, '') : 'assets/img/hero-2.webp', 'website', noindex);
        ld('ld-breadcrumb', crumbs([{ name: t('nav.shop'), raw: 'shop' }, ...(name === 'shop' && !param ? [] : [{ name: heading, raw }])]));
        ld('ld-collection', col || cat ? { '@context': 'https://schema.org', '@type': 'CollectionPage', name: heading, description: desc, url: url(raw), inLanguage: ar() ? 'ar-KW' : 'en' } : null);
        return;
      }
      ld('ld-collection', null);
      const key = { faq: 'pages.faq', shipping: 'pages.shipping', returns: 'pages.returns', privacy: 'pages.privacy', terms: 'pages.terms', cart: 'cart.title', checkout: 'checkout.title', wishlist: 'wishlist.title', account: 'account.title', track: 'track.title', order: 'order.thanks', calculator: 'calc.title' }[name];
      const title = `${key ? t(key) : t('common.notFound')} | ${brand()}`;
      apply(raw, title, m.home[1], null, 'website', noindex || !key);
      ld('ld-breadcrumb', crumbs([{ name: title.split(' | ')[0], raw }]));
      if (name === 'faq') ld('ld-faq', { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: ROKN.content.faq.map(f => ({ '@type': 'Question', name: L(f.q), acceptedAnswer: { '@type': 'Answer', text: L(f.a) } })) });
      else ld('ld-faq', null);
    },
    product(p) {
      if (!p) return;
      ld('ld-faq', null); ld('ld-collection', null);
      const cat = ROKN.q.category(p.category), raw = 'product--' + p.id;
      const title = p.seoTitle ? L(p.seoTitle) : ar() ? `${L(p.name)} | أقمشة ${L(cat)} في الكويت | ${brand()}` : `${L(p.name)} | ${L(cat)} Fabric in Kuwait | ${brand()}`;
      const price = ROKN.fmt.money(p.price);
      const desc = p.seoDesc ? L(p.seoDesc) : ar() ? `${L(p.name)} بسعر ${price} للمتر. ${L(p.description)}`.slice(0, 158) : `${L(p.name)} from ${price} per metre. ${L(p.description)}`.slice(0, 158);
      const color = ROKN.pdp.color || ROKN.q.defaultColor(p);
      apply(raw, title, desc, ROKN.img.roll(p, color), 'product');
      ld('ld-product', {
        '@context': 'https://schema.org', '@type': 'Product', inLanguage: ar() ? 'ar-KW' : 'en',
        name: L(p.name), description: L(p.description), sku: p.sku, category: L(cat), material: L(p.composition),
        brand: { '@type': 'Brand', name: 'Rokn Om Alqura' },
        image: p.variants.flatMap(v => [ROKN.img.drape(p, v.color), ROKN.img.roll(p, v.color)]).map(s => `${site()}/${s}`),
        countryOfOrigin: p.origin ? ROKN.catalog.origins[p.origin].en : undefined,
        width: { '@type': 'QuantitativeValue', value: p.widthCm, unitCode: 'CMT' },
        /* aggregateRating intentionally omitted until real, verified reviews are connected */
        offers: p.variants.map(v => ({
          '@type': 'Offer', url: url(raw), priceCurrency: 'KWD', price: ROKN.q.price(p, v.color).toFixed(3), sku: v.sku,
          itemCondition: 'https://schema.org/NewCondition', color: ROKN.q.color(v.color).en,
          availability: v.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          priceSpecification: { '@type': 'UnitPriceSpecification', price: ROKN.q.price(p, v.color).toFixed(3), priceCurrency: 'KWD', unitCode: 'MTR', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MTR' } },
          seller: { '@type': 'Organization', name: 'Rokn Om Alqura' }
        }))
      });
      ld('ld-breadcrumb', crumbs([{ name: t('nav.shop'), raw: 'shop' }, { name: L(cat), raw: 'shop--' + cat.id }, { name: L(p.name), raw }]));
    }
  };
})();
