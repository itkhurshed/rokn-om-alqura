/* ==========================================================================
   PAGES — each page exposes render(param) → HTML and optional mount()
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const { t, L, esc, fmt, q } = ROKN;
  const C = ROKN.components, I = ROKN.icon;
  const pages = ROKN.pages = {};
  const isAr = () => ROKN.state.lang === 'ar';
  const img = (src, alt, w, h, cls = '', eager) => `<img src="${src}" alt="${esc(alt)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ''}>`;

  /* =========================== HOME =========================== */
  const SLIDES = [
    { img: 'assets/img/hero.webp', sm: 'assets/img/hero-sm.webp', href: '#collections', alt: { en: 'Luxurious burgundy satin and ivory silk fabric at Rokn Om Alqura Kuwait', ar: 'ساتان عنابي فاخر وحرير عاجي من ركن أم القرى في الكويت' } },
    { img: 'assets/img/store/store-shelves.webp', sm: 'assets/img/store/store-shelves-sm.webp', href: '#shop', alt: { en: 'Shelves of folded fabrics inside the Rokn Om Alqura store in Kuwait City', ar: 'رفوف الأقمشة المطوية داخل متجر ركن أم القرى في مدينة الكويت' } },
    { img: 'assets/img/hero-3.webp', sm: 'assets/img/hero-3-sm.webp', wa: true, alt: { en: 'Premium fabric swatches with tape measure and thread on marble', ar: 'عينات أقمشة فاخرة مع شريط قياس وخيوط على الرخام' } }
  ];
  pages.home = {
    render() {
      const slides = t('slides');
      const trustIcons = ['quality', 'roll', 'store', 'support'];
      const fabricCats = ROKN.catalog.categories.filter(c => c.home);
      const lux = q.inCollection('luxury').sort((a, b) => b.price - a.price).slice(0, 3);
      const insp = t('v2.insp');
      const inspImgs = ['assets/img/scenes/pair-emerald-gold.webp', 'assets/img/scenes/pair-ivory-champagne.webp', 'assets/img/scenes/pair-navy-sand.webp', 'assets/img/scenes/flatlay-tools.webp', 'assets/img/scenes/tailoring.webp'];
      const inspLinks = ['#collection--luxury', '#collection--occasion', '#collection--linen', '#calculator', '#contact'];
      const whyIcons = ['quality', 'hand', 'variety', 'store', 'support', 'smile'];
      return `
      <section class="hero-slider" aria-roledescription="carousel" aria-label="${esc(isAr() ? 'عروض مميزة' : 'Featured')}" data-slider>
        ${SLIDES.map((s, i) => `
        <div class="slide${i === 0 ? ' is-active' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} / ${SLIDES.length}" ${i ? 'aria-hidden="true"' : ''} data-slide="${i}">
          <picture class="slide-media"><source media="(max-width: 700px)" srcset="${(ROKN.config.heroImages && ROKN.config.heroImages[i]) || s.sm}"><img src="${(ROKN.config.heroImages && ROKN.config.heroImages[i]) || s.img}" alt="${esc(L(s.alt))}" width="1800" height="1100" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></picture>
          <div class="hero-shade"></div>
          <div class="wrap hero-in">
            <p class="eyebrow on-dark">${esc(slides[i].eyebrow)}</p>
            ${i === 0 ? '<h1' : '<h2'} class="hero-title">${slides[i].title.split('\n').map(esc).join('<br>')}${i === 0 ? '</h1>' : '</h2>'}
            <p class="hero-text">${esc(slides[i].text)}</p>
            <div class="btn-row">
              ${s.wa ? `<a class="btn btn-light" href="${ROKN.waLink(t('chat.msgs.help'))}" target="_blank" rel="noopener" ${i ? 'tabindex="-1"' : ''}>${I('chat', 'ico-sm')} ${esc(slides[i].cta)}</a>`
                     : `<a class="btn btn-light" href="${s.href}" ${i ? 'tabindex="-1"' : ''}>${esc(slides[i].cta)}</a>`}
              ${i === 0 ? `<a class="btn btn-ghost-light" href="#collections">${esc(t('hero.cta2'))}</a>` : ''}
            </div>
          </div>
        </div>`).join('')}
        <div class="slider-ui wrap">
          <div class="dots" role="group">${SLIDES.map((_, i) => `<button type="button" class="dotbtn${i === 0 ? ' on' : ''}" data-action="slide-go" data-index="${i}" aria-label="${esc(t('slider.goto', { n: i + 1 }))}" aria-current="${i === 0}"></button>`).join('')}</div>
          <div class="slider-arrows">
            <button type="button" class="sl-btn" data-action="slide-pause" aria-label="${esc(t('slider.pause'))}">${I('pause', 'ico-sm')}</button>
            <button type="button" class="sl-btn" data-action="slide-step" data-dir="-1" aria-label="${esc(t('slider.prev'))}">${I('chevronLeft', 'ico-sm flip-rtl')}</button>
            <button type="button" class="sl-btn" data-action="slide-step" data-dir="1" aria-label="${esc(t('slider.next'))}">${I('chevron', 'ico-sm flip-rtl')}</button>
          </div>
        </div>
        <p class="hero-note wrap">${I('scissors', 'ico-sm')} ${esc(t('hero.note'))}</p>
      </section>

      <section class="trust" aria-label="${esc(isAr() ? 'لماذا ركن أم القرى' : 'Why Rokn Om Alqura')}">
        <div class="wrap trust-grid">
          ${t('trust').map((tr, i) => `<div class="trust-item">${I(trustIcons[i], 'ico-lg')}<div><h3>${esc(tr[0])}</h3><p>${esc(tr[1])}</p></div></div>`).join('')}
        </div>
      </section>

      <section class="section" aria-labelledby="fab-h">
        <div class="wrap">
          ${C.SectionHead(t('v2.fabricEyebrow'), t('v2.fabricTitle'), { href: '#categories', label: t('sections.viewAllCats') }, 'fab-h')}
          <div class="cgrid">${fabricCats.map((c, i) => C.CategoryCard(c, i)).join('')}</div>
        </div>
      </section>

      <section class="section section-cream colors-sec" aria-labelledby="col-c-h">
        <div class="wrap">
          <div class="split-head">
            <div>${C.SectionHead(t('v2.colorEyebrow'), t('v2.colorTitle'), null, 'col-c-h')}<p class="muted">${esc(t('v2.colorHint'))}</p></div>
            ${img('assets/img/scenes/swatch-fan.webp', isAr() ? 'مروحة عينات أقمشة بألوان متعددة' : 'Fan of fabric swatches in many colours', 1400, 900, 'split-head-img')}
          </div>
          ${C.ColorExplorer(ROKN.state.homeColor || 'burgundy')}
        </div>
      </section>

      <section class="section" aria-labelledby="coll-h">
        <div class="wrap">
          ${C.SectionHead(t('sections.colEyebrow'), t('sections.colTitle'), { href: '#collections', label: t('nav.collections') }, 'coll-h')}
          <div class="colgrid">${ROKN.catalog.collections.map(C.CollectionCard).join('')}</div>
        </div>
      </section>

      ${C.SaduBand('sadu-thin')}

      <section class="section" aria-labelledby="best-h">
        <div class="wrap">
          ${C.SectionHead(t('sections.bestEyebrow'), t('sections.bestTitle'), { href: '#bestsellers', label: t('sections.viewAll') }, 'best-h')}
          ${C.ProductGrid(q.bestSellers(8))}
        </div>
      </section>

      <section class="section section-cream" aria-labelledby="new-h">
        <div class="wrap">
          ${C.SectionHead(isAr() ? 'جديدنا' : 'Just in', t('sections.newTitle'), { href: '#new', label: t('sections.viewAll') }, 'new-h')}
          ${C.ProductGrid(q.newest(4))}
        </div>
      </section>

      <section class="lux" aria-labelledby="lux-h">
        <div class="lux-media">${img('assets/img/scenes/luxury-feature.webp', isAr() ? 'مخمل عنابي فاخر مع بروكار زمردي في الكويت' : 'Luxury burgundy velvet with emerald brocade at Rokn Om Alqura Kuwait', 1600, 900)}</div>
        <div class="wrap lux-in">
          <div class="lux-copy">
            <p class="eyebrow on-dark">${esc(t('v2.luxEyebrow'))}</p>
            <h2 id="lux-h">${esc(t('v2.luxTitle'))}</h2>
            <p>${esc(t('v2.luxText'))}</p>
            <a class="btn btn-light" href="#collection--luxury">${esc(t('v2.luxCta'))}</a>
          </div>
          <ul class="lux-list" role="list">${lux.map(p => `<li><a href="#product--${p.id}" class="lux-item">
            ${img(ROKN.img.closeup(p, q.defaultColor(p)), '', 120, 150)}
            <span><span class="lux-name">${esc(L(p.name))}</span><span class="lux-price">${fmt.money(p.price)} ${esc(t('product.perMeter'))}</span></span>${I('arrow', 'ico-sm flip-rtl')}</a></li>`).join('')}</ul>
        </div>
      </section>

      <section class="section" aria-labelledby="insp-h">
        <div class="wrap">
          ${C.SectionHead(t('v2.inspEyebrow'), t('v2.inspTitle'), null, 'insp-h')}
          <div class="insp-grid">${insp.map((x, i) => `
            <a class="insp insp-${i}" href="${inspLinks[i]}">
              <span class="insp-img">${img(inspImgs[i], `${x[0]} — ${x[1]}`, 900, 1125)}</span>
              <span class="insp-cap"><span class="insp-t">${esc(x[0])}</span><span class="insp-d">${esc(x[1])}</span></span>
            </a>`).join('')}</div>
        </div>
      </section>

      <section class="section why section-cream" aria-labelledby="why-h">
        <div class="wrap why-in">
          <div class="why-media">${img('assets/img/store/store-interior.webp', isAr() ? 'داخل متجر ركن أم القرى للأقمشة في مدينة الكويت' : 'Inside the Rokn Om Alqura fabric store in Kuwait City', 750, 765)}</div>
          <div>
            <p class="eyebrow">${esc(t('v2.whyEyebrow'))}</p>
            <h2 id="why-h" class="h-section">${esc(t('v2.whyTitle'))}</h2>
            <ul class="why-list" role="list">${t('v2.why').map((w, i) => `<li>${I(whyIcons[i], 'ico-lg')}<div><h3>${esc(w[0])}</h3><p>${esc(w[1])}</p></div></li>`).join('')}</ul>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="rev-h2">
        <div class="wrap">
          ${C.SectionHead(t('v2.revEyebrow'), t('v2.revTitle'), null, 'rev-h2')}
          <div class="testi">${ROKN.testimonials.map(r => {
            const p = q.product(r.product);
            return `<figure class="testi-card">
              ${p ? `<a href="#product--${p.id}" class="testi-img" tabindex="-1" aria-hidden="true">${img(ROKN.img.closeup(p, q.defaultColor(p)), '', 300, 375)}</a>` : ''}
              <div>${C.Stars(r.rating)}<blockquote>“${esc(L(r.text))}”</blockquote>
              <figcaption><span class="r-name">${esc(L(r.name))}</span> <span class="verified">${I('check', 'ico-xs')} ${esc(t('product.verified'))}</span>${p ? `<a class="testi-p" href="#product--${p.id}">${esc(L(p.name))}</a>` : ''}</figcaption></div>
            </figure>`;
          }).join('')}</div>
          <p class="note">${esc(t('v2.revSample'))}</p>
        </div>
      </section>

      <section class="consult" aria-labelledby="consult-h">
        <div class="wrap consult-in">
          <div class="consult-media">${img('assets/img/scenes/flatlay-tools.webp', isAr() ? 'عينات أقمشة مع شريط قياس وخيوط للاستشارة' : 'Fabric swatches with tape measure and thread for a consultation', 1200, 1200)}</div>
          <div class="consult-copy">
            <p class="eyebrow">${esc(t('v2.consultEyebrow'))}</p>
            <h2 id="consult-h">${esc(t('v2.consultTitle'))}</h2>
            <p>${esc(t('v2.consultText'))}</p>
            <ol class="steps">${t('v2.consultSteps').map(s => `<li>${esc(s)}</li>`).join('')}</ol>
            <div class="btn-row">
              <a class="btn btn-wa" href="${ROKN.waLink(t('chat.msgs.help'))}" target="_blank" rel="noopener">${I('chat', 'ico-sm')} ${esc(t('v2.consultCta'))}</a>
              <a class="btn btn-outline" href="${ROKN.waLink(t('chat.msgs.swatch'))}" target="_blank" rel="noopener">${I('swatch', 'ico-sm')} ${esc(t('v2.swatchCta'))}</a>
              <a class="btn btn-outline" href="#calculator">${I('calc', 'ico-sm')} ${esc(t('v2.calcCta'))}</a>
            </div>
            <p class="consult-num">${I('phone', 'ico-sm')} <span dir="ltr">${ROKN.config.phone}</span></p>
          </div>
        </div>
      </section>

      <section class="visit" aria-labelledby="visit-h">
        <div class="visit-img">${img('assets/img/store/storefront.webp', isAr() ? 'واجهة متجر ركن أم القرى للأقمشة على شارع مبارك الكبير' : 'Rokn Om Alqura fabric store front on Mubarak Al Kabeer St', 640, 640)}</div>
        <div class="visit-copy">
          <p class="eyebrow">${esc(t('sections.visitEyebrow'))}</p>
          <h2 id="visit-h">${esc(t('v2.visitTitle'))}</h2>
          <p>${esc(t('v2.visitText'))}</p>
          <p class="visit-addr">${I('pin')} <span>${esc(L(ROKN.config.address))}</span></p>
          <p class="visit-addr">${I('phone')} <a href="tel:${ROKN.config.phoneE164}" dir="ltr">${ROKN.config.phone}</a></p>
          <a class="mini-map" href="${ROKN.config.mapsUrl}" target="_blank" rel="noopener" aria-label="${esc(t('contact.map'))}">${pages.mapSvg(true)}<span>${esc(t('v2.mapNote'))}</span></a>
          <div class="btn-row">
            <a class="btn btn-primary" href="${ROKN.config.mapsUrl}" target="_blank" rel="noopener">${I('pin', 'ico-sm')} ${esc(t('sections.directions'))}</a>
            <a class="btn btn-outline" href="${ROKN.waLink(t('chat.msgs.visit'))}" target="_blank" rel="noopener">${I('chat', 'ico-sm')} ${esc(t('wa.short'))}</a>
          </div>
        </div>
      </section>

      <section class="section ig" aria-labelledby="ig-h">
        <div class="wrap">
          <div class="ig-head">
            <div><p class="eyebrow">${I('camera', 'ico-sm')} Instagram</p><h2 id="ig-h">${esc(t('v2.igTitle'))}</h2><p class="muted">${esc(t('v2.igText'))}</p></div>
            <a class="btn btn-outline" href="${ROKN.config.social.instagram}" target="_blank" rel="noopener">${I('camera', 'ico-sm')} ${esc(t('v2.igCta'))}</a>
          </div>
          <ul class="ig-grid" role="list">${t('v2.igAlt').map((alt, i) => `<li><a href="${ROKN.config.social.instagram}" target="_blank" rel="noopener" class="ig-tile" aria-label="${esc(alt)} — Instagram">${img(ROKN.galleryImages[i], alt, 600, 600)}<span class="ig-ov">${I('camera')}</span></a></li>`).join('')}</ul>
        </div>
      </section>

      ${C.Newsletter()}`;
    },
    mount() {
      ROKN.ui.colorFamily(ROKN.state.homeColor || 'burgundy', true);
      ROKN.ui.startSlider();
    }
  };

  pages.mapSvg = (small) => `
    <svg viewBox="0 0 600 340" role="img" aria-label="${esc(t('contact.mapTitle'))}" preserveAspectRatio="xMidYMid slice" class="map-svg${small ? ' map-sm' : ''}">
      <rect width="600" height="340" class="m-bg"/>
      <path class="m-sea" d="M0 0h600v70C520 95 430 60 350 82S170 120 0 92z"/>
      <g class="m-road"><path d="M-10 210 610 160"/><path d="M120 340 210 60"/><path d="M380 340 330 70"/><path d="M-10 290 610 250"/></g>
      <g class="m-road-sm"><path d="M0 150 600 120"/><path d="M260 340 270 80"/><path d="M500 340 470 90"/><path d="M60 340 140 90"/></g>
      <text x="40" y="200" class="m-label" transform="rotate(-4 40 200)">Mubarak Al Kabeer St</text>
      <g transform="translate(300 175)"><circle r="34" class="m-pulse"/><path class="m-pin" d="M0 0c-14-18-22-29-22-40a22 22 0 0 1 44 0c0 11-8 22-22 40z"/><circle cy="-40" r="8" class="m-pin-dot"/></g>
    </svg>`;

  /* =========================== SHOP / COLLECTION / COLOUR =========================== */
  const emptyFilters = () => ({ category: [], fabricType: [], color: [], material: [], pattern: [], collection: [], width: [], flags: [], inStock: false, minPrice: null, maxPrice: null, sort: 'featured', query: '' });
  ROKN.emptyFilters = emptyFilters;

  ROKN.shop = {
    apply(f) {
      const W = ROKN.catalog.widths;
      let list = ROKN.catalog.products.filter(p =>
        (!f.category.length || f.category.includes(p.category)) &&
        (!f.fabricType.length || f.fabricType.includes(p.fabricType)) &&
        (!f.material.length || f.material.includes(p.material)) &&
        (!f.pattern.length || f.pattern.includes(p.pattern)) &&
        (!f.width.length || f.width.some(k => W[k].test(p.widthCm))) &&
        (!f.flags.length || f.flags.every(k => (k === 'best' && p.bestSeller) || (k === 'new' && p.newArrival) || (k === 'sale' && p.compareAt))) &&
        (!f.collection.length || p.collections.some(c => f.collection.includes(c))) &&
        (!f.color.length || p.variants.some(v => f.color.includes(q.color(v.color).family) && (!f.inStock || v.stock > 0))) &&
        (!f.inStock || q.totalStock(p) > 0) &&
        (f.minPrice == null || p.price >= f.minPrice) && (f.maxPrice == null || p.price <= f.maxPrice));
      let hitColor = {};
      if (f.query) { const hits = q.searchHits(f.query); hits.forEach(h => hitColor[h.p.id] = h.color); list = hits.map(h => h.p).filter(p => list.includes(p)); }
      const s = f.sort;
      if (s === 'newest') list.sort((a, b) => b.added.localeCompare(a.added));
      else if (s === 'priceAsc') list.sort((a, b) => a.price - b.price);
      else if (s === 'priceDesc') list.sort((a, b) => b.price - a.price);
      else if (s === 'best') list.sort((a, b) => b.sold - a.sold);
      else if (!f.query) list.sort((a, b) => (b.featured - a.featured) || ((b.badge ? 1 : 0) - (a.badge ? 1 : 0)) || b.rating - a.rating);
      ROKN.shop.colorFor = p => hitColor[p.id] || (f.color.length === 1 ? q.familyColor(p, f.color[0]) : null);
      return list;
    },
    counts() {
      const P = ROKN.catalog.products, c = { category: {}, fabricType: {}, material: {}, pattern: {}, collection: {}, width: {}, flags: {} };
      const W = ROKN.catalog.widths;
      P.forEach(p => {
        ['category', 'fabricType', 'material', 'pattern'].forEach(k => { const v = p[k]; c[k][v] = (c[k][v] || 0) + 1; });
        p.collections.forEach(k => c.collection[k] = (c.collection[k] || 0) + 1);
        Object.keys(W).forEach(k => { if (W[k].test(p.widthCm)) c.width[k] = (c.width[k] || 0) + 1; });
        if (p.bestSeller) c.flags.best = (c.flags.best || 0) + 1;
        if (p.newArrival) c.flags.new = (c.flags.new || 0) + 1;
        if (p.compareAt) c.flags.sale = (c.flags.sale || 0) + 1;
      });
      return c;
    },
    chips(f) {
      const Cat = ROKN.catalog, out = [];
      const add = (key, id, label) => out.push(`<button type="button" class="fchip" data-action="unfilter" data-key="${key}" data-value="${id}">${esc(label)} ${I('close', 'ico-xs')}</button>`);
      f.category.forEach(id => add('category', id, L(q.category(id))));
      f.color.forEach(id => add('color', id, L(Cat.colorFamilies.find(x => x.id === id))));
      f.flags.forEach(id => add('flags', id, L(Cat.flags[id])));
      f.fabricType.forEach(id => add('fabricType', id, L(Cat.fabricTypes[id])));
      f.material.forEach(id => add('material', id, L(Cat.materials[id])));
      f.pattern.forEach(id => add('pattern', id, L(Cat.patterns[id])));
      f.width.forEach(id => add('width', id, L(Cat.widths[id])));
      f.collection.forEach(id => add('collection', id, L(q.collection(id))));
      if (f.inStock) add('inStock', '1', t('shop.inStockOnly'));
      if (f.minPrice != null || f.maxPrice != null) add('price', '1', t('filters2.minMax', { a: (f.minPrice ?? 0).toFixed(3), b: (f.maxPrice ?? Math.ceil(Math.max(...Cat.products.map(p => p.price)))).toFixed(3) }));
      if (f.query) add('query', '1', `“${f.query}”`);
      if (out.length) out.push(`<button type="button" class="fchip-clear" data-action="clear-filters">${esc(t('shop.clear'))}</button>`);
      return out.join('');
    },
    refresh() {
      const f = ROKN.state.shop;
      const list = ROKN.shop.apply(f);
      const grid = document.querySelector('[data-shop-grid]');
      if (!grid) return;
      grid.innerHTML = list.length ? C.ProductGrid(list, 'pgrid-shop', ROKN.shop.colorFor) : `
        <div class="empty">${I('search', 'ico-lg')}<h2>${esc(t('shop.empty'))}</h2><p>${esc(t('shop.emptyHint'))}</p>
        <div class="btn-row center"><button class="btn btn-outline" type="button" data-action="clear-filters">${esc(t('shop.clear'))}</button>
        <a class="btn btn-wa" href="${ROKN.waLink(t('chat.msgs.help'))}" target="_blank" rel="noopener">${I('chat', 'ico-sm')} ${esc(t('wa.short'))}</a></div></div>`;
      document.querySelectorAll('[data-result-count]').forEach(el => el.textContent = fmt.fabrics(list.length));
      const ap = document.querySelector('[data-apply-count]'); if (ap) ap.textContent = t('shop.apply', { n: fmt.fabrics(list.length) });
      const ch = document.querySelector('[data-chips]'); if (ch) ch.innerHTML = ROKN.shop.chips(f);
      const rl = document.querySelector('[data-range-label]'); if (rl) {
        const prices = ROKN.catalog.products.map(p => p.price);
        rl.textContent = t('filters2.minMax', { a: (f.minPrice ?? Math.floor(Math.min(...prices))).toFixed(3), b: (f.maxPrice ?? Math.ceil(Math.max(...prices))).toFixed(3) });
      }
    }
  };

  pages.shop = {
    seed(name, param) {
      const f = emptyFilters();
      if (name === 'shop' && param && q.category(param)) f.category = [param];
      if (name === 'collection' && q.collection(param)) f.collection = [param];
      if (name === 'color' && ROKN.catalog.colorFamilies.some(x => x.id === param)) f.color = [param];
      if (name === 'new') { f.sort = 'newest'; f.flags = ['new']; }
      if (name === 'bestsellers') { f.sort = 'best'; f.flags = ['best']; }
      if (name === 'search') f.query = ROKN.state.pendingQuery || '';
      return f;
    },
    title(name, param) {
      if (name === 'shop' && param && q.category(param)) return L(q.category(param));
      if (name === 'collection' && q.collection(param)) return L(q.collection(param));
      if (name === 'color') { const f = ROKN.catalog.colorFamilies.find(x => x.id === param); if (f) return isAr() ? `أقمشة باللون ${L(f)}` : `${L(f)} Fabrics`; }
      if (name === 'new') return t('footer.newArr');
      if (name === 'bestsellers') return t('footer.best');
      if (name === 'search') return t('shop.searchFor', { q: ROKN.state.pendingQuery });
      return t('shop.title');
    },
    render(param) {
      const name = ROKN.state.route.name;
      const key = ROKN.state.route.raw;
      if (!ROKN.state.shop || ROKN.state.shopKey !== key) { ROKN.state.shop = this.seed(name, param); ROKN.state.shopKey = key; }
      const f = ROKN.state.shop;
      const title = this.title(name, param);
      const col = name === 'collection' ? q.collection(param) : null;
      const cat = name === 'shop' && param ? q.category(param) : null;
      const crumbs = name === 'shop' && !param ? [{ label: t('nav.shop') }] : col ? [{ label: t('nav.collections'), href: '#collections' }, { label: title }] : [{ label: t('nav.shop'), href: '#shop' }, { label: title }];
      const toolbar = `
        <div class="shop-toolbar">
          <button class="btn btn-outline btn-sm filter-toggle" type="button" data-action="filters-open" aria-controls="shop-filters" aria-expanded="false">${I('filter', 'ico-sm')} ${esc(t('shop.filters'))}</button>
          <p class="result-count" data-result-count aria-live="polite"></p>
          <label class="sort"><span>${esc(t('shop.sort'))}</span>
            <select id="sort-select" data-sort>${Object.entries(t('shop.sorts')).map(([k, v]) => `<option value="${k}" ${f.sort === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
          </label>
        </div>
        <div class="fchips" data-chips></div>`;
      const layout = `
        <div class="shop-layout">
          <aside class="shop-side" id="shop-filters" aria-label="${esc(t('shop.filters'))}">
            <div class="side-head"><h2>${esc(t('shop.filters'))}</h2><button class="icon-btn" type="button" data-action="filters-close" aria-label="${esc(t('icons.close'))}">${I('close')}</button></div>
            ${C.ProductFilters(f, ROKN.shop.counts())}
            <div class="side-foot"><button class="btn btn-outline btn-sm" type="button" data-action="clear-filters">${esc(t('shop.clear'))}</button><button class="btn btn-primary btn-sm" type="button" data-action="filters-close" data-apply-count></button></div>
          </aside>
          <div class="shop-main" data-shop-grid></div>
        </div>`;
      if (col) {
        const items = q.inCollection(col.id).sort((a, b) => b.featured - a.featured || b.sold - a.sold);
        return `
        <section class="col-hero">
          ${img(col.image, `${L(col)} — ${isAr() ? 'ركن أم القرى الكويت' : 'Rokn Om Alqura Kuwait'}`, 1200, 800, '', true)}
          <div class="col-hero-shade"></div>
          <div class="wrap col-hero-in">
            ${C.Breadcrumbs(crumbs)}
            <p class="eyebrow on-dark">${esc(t('nav.collections'))} · ${esc(fmt.fabrics(items.length))}</p>
            <h1>${esc(L(col))}</h1>
            <p>${esc(L(col.desc))}</p>
          </div>
        </section>
        <section class="wrap col-featured">
          <h2 class="h-section">${esc(t('v2.featured'))}</h2>
          ${C.ProductGrid(items.slice(0, 4))}
        </section>
        <section class="col-editorial">
          <div class="wrap">
            <p class="eyebrow">${esc(t('v2.editorialTitle'))}</p>
            <div class="ed-grid">${(col.editorial || []).map((src, i) => `<figure class="ed-${i}">${img(src, `${L(col)} — ${isAr() ? 'صورة تحريرية' : 'editorial'} ${i + 1}`, 900, 1125)}</figure>`).join('')}
              <div class="ed-copy"><h2>${esc(L(col))}</h2><p>${esc(L(col.desc))}</p>
              <a class="btn btn-wa" href="${ROKN.waLink(t('chat.msgs.help'))}" target="_blank" rel="noopener">${I('chat', 'ico-sm')} ${esc(t('v2.consultCta'))}</a></div>
            </div>
          </div>
        </section>
        <section class="wrap shop" aria-labelledby="all-in-h">
          <h2 class="h-section" id="all-in-h">${esc(t('v2.allIn'))}</h2>
          ${toolbar}${layout}
        </section>`;
      }
      return `
      ${C.PageHero(title, cat ? L(cat.desc) + ' ' + t('shop.intro') : t('shop.intro'), crumbs)}
      <section class="wrap shop">${toolbar}${layout}</section>`;
    },
    mount() { ROKN.shop.refresh(); }
  };
  ['collection', 'new', 'bestsellers', 'search', 'color'].forEach(n => pages[n] = pages.shop);

  pages.categories = {
    render() {
      return `${C.PageHero(t('pages.categories'), t('shop.intro'), [{ label: t('nav.categories') }])}
      <section class="wrap section-tight"><div class="cgrid cgrid-page">${ROKN.catalog.categories.map((c, i) => C.CategoryCard(c, i)).join('')}</div></section>`;
    }
  };
  pages.collections = {
    render() {
      return `${C.PageHero(t('pages.collections'), isAr() ? 'مجموعات منسّقة تساعدك على اختيار القماش المناسب لكل مناسبة.' : 'Curated edits to help you choose the right cloth for every occasion.', [{ label: t('nav.collections') }])}
      <section class="wrap section-tight"><div class="colgrid">${ROKN.catalog.collections.map(C.CollectionCard).join('')}</div></section>`;
    }
  };

  /* =========================== PRODUCT =========================== */
  ROKN.pdp = { id: null, color: null, qty: 1, index: 0 };
  const vname = v => t('product.views.' + v) || t('views2.' + v);
  ROKN.vname = vname;
  pages.product = {
    render(id) {
      const p = q.product(id);
      if (!p) return pages.notFound.render();
      const st = ROKN.pdp;
      if (st.id !== id) { st.id = id; st.color = ROKN.state.pendingColor && p.variants.some(v => v.color === ROKN.state.pendingColor) ? ROKN.state.pendingColor : q.defaultColor(p); st.qty = 1; st.index = 0; }
      ROKN.state.pendingColor = null;
      const cat = q.category(p.category);
      const Cat = ROKN.catalog;
      const reviews = ROKN.getReviews(p.id);
      const v = p.variants.find(x => x.color === st.color);
      const specs = [
        ['sku', `<span data-sku dir="ltr">${v.sku}</span>`], ['fabricType', L(Cat.fabricTypes[p.fabricType])], ['material', L(Cat.materials[p.material])],
        ['composition', L(p.composition)], ['width', fmt.cm(p.widthCm)], ['weight', p.weightGsm ? fmt.gsm(p.weightGsm) : ''], ['texture', L(p.texture)],
        ['stretch', L(Cat.stretch[p.stretch])], ['opacity', L(Cat.opacity[p.opacity])], ['pattern', L(Cat.patterns[p.pattern])],
        ['origin', p.origin ? L(Cat.origins[p.origin]) : ''], ['color', `<span data-color-name>${esc(L(q.color(st.color)))}</span>`],
        ['use', L(p.use)], ['care', L(p.care)]
      ].filter(r => r[1]);
      const related = ROKN.catalog.products.filter(x => x.id !== p.id && (x.category === p.category || x.collections.some(c => p.collections.includes(c)))).slice(0, 4);
      return `
      <div class="wrap pdp-crumbs">${C.Breadcrumbs([{ label: t('nav.shop'), href: '#shop' }, { label: L(cat), href: '#shop--' + cat.id }, { label: L(p.name) }])}</div>
      <section class="wrap pdp" data-pdp="${p.id}">
        <div class="pdp-media">${C.ProductGallery(p, st.color)}</div>
        <div class="pdp-info">
          <p class="eyebrow">${esc(L(cat))}${L(cat).toLowerCase().includes(L(Cat.materials[p.material]).toLowerCase()) ? '' : ' · ' + esc(L(Cat.materials[p.material]))}</p>
          <h1>${esc(L(p.name))}</h1>
          <p class="pdp-sku">${esc(t('specs.sku'))}: <span data-sku dir="ltr">${v.sku}</span></p>
          ${p.reviewCount ? `<button type="button" class="pdp-rating" data-action="to-reviews">${C.Stars(p.rating)} <span>${p.rating.toFixed(1)}</span> <span class="muted">(${esc(t('product.basedOn', { n: p.reviewCount }))})</span></button>` : ''}
          <div class="pdp-price">${C.Price(p, true, st.color)}</div>
          <div class="pdp-meta">
            <div><span class="muted">${esc(t('product.availability'))}</span> ${C.Availability(p, st.color)}</div>
            <div><span class="muted">${esc(t('specs.width'))}</span> <strong>${fmt.cm(p.widthCm)}</strong></div>
            <div><span class="muted">${esc(t('specs.composition'))}</span> <strong>${esc(L(p.composition))}</strong></div>
          </div>
          ${C.SwatchSelector(p, st.color)}
          <div class="pdp-links">
            <a class="text-link-btn" data-wa-swatch href="#" target="_blank" rel="noopener" data-keep-href>${I('swatch', 'ico-sm')} ${esc(t('pdp.swatch'))}</a>
            <button type="button" class="text-link-btn" data-action="calc-open">${I('ruler', 'ico-sm')} ${esc(t('pdp.calc'))}</button>
          </div>
          ${C.QuantitySelector(st.qty)}
          <p class="soldout-msg" data-soldout ${q.stock(p, st.color) ? 'hidden' : ''}>${esc(t('product.soldOutMsg'))}</p>
          <div class="pdp-actions" id="pdp-actions">
            <button class="btn btn-primary btn-lg" type="button" data-action="add-to-cart" data-buy="0">${I('bag', 'ico-sm')} ${esc(t('product.addToCart'))}</button>
            <a class="btn btn-wa btn-lg" data-wa-ask href="#" target="_blank" rel="noopener" data-keep-href>${I('chat', 'ico-sm')} ${esc(t('pdp.ask'))}</a>
            <button class="btn btn-outline btn-lg" type="button" data-action="add-to-cart" data-buy="1">${esc(t('product.buyNow'))}</button>
            <button class="icon-btn icon-btn-box wl-pdp${ROKN.wishlist.has(p.id) ? ' on' : ''}" type="button" data-action="wishlist" data-id="${p.id}" aria-pressed="${ROKN.wishlist.has(p.id)}" aria-label="${esc(t('product.wishlistAdd'))}">${I('heart')}</button>
          </div>
          <div class="help-box">
            ${I('chat', 'ico-lg')}
            <div><h2>${esc(t('product.needHelp'))}</h2><p>${esc(t('product.needHelpText'))}</p>
            <a class="link-arrow" data-wa-product href="#" target="_blank" rel="noopener" data-keep-href>${esc(t('product.whatsapp'))} · <span dir="ltr">${ROKN.config.phone}</span></a></div>
          </div>
          <ul class="pdp-perks">
            <li>${I('scissors', 'ico-sm')} ${esc(isAr() ? 'يُقص حسب الطول المطلوب' : 'Cut to your length')}</li>
            <li>${I('truck', 'ico-sm')} ${esc(isAr() ? 'توصيل لجميع مناطق الكويت' : 'Delivery across Kuwait')}</li>
            <li>${I('store', 'ico-sm')} ${esc(isAr() ? 'متوفر للمعاينة في المتجر' : 'See it in our Kuwait City store')}</li>
          </ul>
        </div>
      </section>

      <section class="wrap pdp-details">
        <div class="pdp-desc">
          <h2>${esc(t('product.description'))}</h2>
          <p>${esc(L(p.description))}</p>
          <h3>${esc(t('product.care'))}</h3><p>${esc(L(p.care))}</p>
          <h3>${esc(t('product.delivery'))}</h3><p>${esc(isAr() ? 'نوصل لجميع مناطق الكويت عادة خلال ١–٢ يوم عمل. لا يمكن إرجاع القماش المقصوص إلا في حال وجود عيب.' : 'Delivery across Kuwait, usually within 1–2 working days. Cut fabric can be returned only if faulty.')} <a href="#returns">${esc(t('footer.returns'))}</a></p>
          <figure class="pdp-styled">${img(ROKN.img.styled(p), isAr() ? `${L(p.name)} مع أدوات الخياطة` : `${L(p.name)} styled with tailoring tools`, 900, 1125)}</figure>
        </div>
        <div class="pdp-specs">
          <h2>${esc(t('product.details'))}</h2>
          <table class="spec-table"><tbody>
            ${specs.map(([k, val]) => `<tr><th scope="row">${esc(t('specs.' + k) || k)}</th><td>${k === 'color' || k === 'sku' ? val : esc(val)}</td></tr>`).join('')}
          </tbody></table>
        </div>
      </section>

      <section class="wrap reviews" id="reviews" aria-labelledby="rev-h">
        <div class="reviews-head">
          <div><h2 id="rev-h">${esc(t('product.reviews'))}</h2>
            ${p.reviewCount ? `<p class="rev-score"><strong>${p.rating.toFixed(1)}</strong> ${C.Stars(p.rating)} <span class="muted">${esc(t('product.basedOn', { n: p.reviewCount }))}</span></p>` : `<p class="muted">${esc(ROKN.state.lang === 'ar' ? 'لا توجد تقييمات بعد — كن أول من يقيّم هذا القماش.' : 'No reviews yet — be the first to review this fabric.')}</p>`}</div>
          <button class="btn btn-outline btn-sm" type="button" data-action="review-form" aria-expanded="false" aria-controls="review-form">${esc(t('product.writeReview'))}</button>
        </div>
        ${reviews.some(r => r.sample) ? `<p class="note">${esc(t('product.sampleReviews'))}</p>` : ''}
        <form class="review-form" id="review-form" hidden novalidate data-form="review">
          <fieldset class="rate-input"><legend>${esc(t('product.yourRating'))}</legend>
            ${[5, 4, 3, 2, 1].map(n => `<input type="radio" id="rate-${n}" name="rating" value="${n}" ${n === 5 ? 'checked' : ''}><label for="rate-${n}" title="${n}">${I('star', '', true)}<span class="sr-only">${n}</span></label>`).join('')}
          </fieldset>
          <div class="field"><label for="rv-text">${esc(t('product.yourReview'))}</label><textarea id="rv-text" rows="3" required></textarea></div>
          <button class="btn btn-primary btn-sm" type="submit">${esc(t('product.submitReview'))}</button>
          <p class="form-ok" hidden role="status">${esc(t('product.reviewThanks'))}</p>
        </form>
        <div class="review-list">${reviews.map(C.Review).join('')}</div>
      </section>

      ${related.length ? `<section class="section wrap"><h2 class="h-section">${esc(t('product.related'))}</h2>${C.ProductGrid(related)}</section>` : ''}

      <div class="sticky-buy">
        <a class="sb-wa" data-wa-ask href="#" target="_blank" rel="noopener" data-keep-href aria-label="${esc(t('pdp.ask'))}">${I('chat')}</a>
        <div class="sb-info"><span class="sb-name">${esc(L(p.name))}</span><span class="sb-price" data-sb-total></span></div>
        <button class="btn btn-primary" type="button" data-action="add-to-cart" data-buy="0">${esc(t('product.addToCart'))}</button>
      </div>`;
    },
    mount(id) {
      ROKN.pdpUpdate();
      document.body.classList.add('has-sticky-buy');
      ROKN.seo.product(q.product(id));
      ROKN.ui.initZoom();
    }
  };

  /* Update PDP / quick-view UI after colour or quantity change (no re-render) */
  ROKN.pdpUpdate = function (scope = 'pdp') {
    const isQv = scope === 'qv';
    const st = isQv ? ROKN.qv : ROKN.pdp;
    const p = q.product(st.id); if (!p) return;
    const root = isQv ? document.querySelector('.qv') : document;
    if (!root) return;
    const stock = q.stock(p, st.color), unit = q.price(p, st.color), v = p.variants.find(x => x.color === st.color);
    const cname = L(q.color(st.color));
    root.querySelectorAll('[data-color-name]').forEach(el => el.textContent = cname);
    root.querySelectorAll(`.swatch[data-scope="${scope}"]`).forEach(b => { const on = b.dataset.color === st.color; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const av = root.querySelector('[data-avail]'); if (av) av.outerHTML = C.Availability(p, st.color);
    root.querySelectorAll(`.chip[data-scope="${scope}"]`).forEach(b => { const on = Number(b.dataset.qty) === st.qty; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    const inp = root.querySelector(`[data-qty-input="${scope}"]`); if (inp && Number(inp.value) !== st.qty) inp.value = st.qty;
    root.querySelectorAll('[data-unit-price]').forEach(el => el.textContent = fmt.money(unit));
    const total = fmt.money(unit * st.qty);
    const line = root.querySelector('[data-calc-line]');
    if (line) line.innerHTML = `${esc(t('pdp.calcLine', { p: fmt.money(unit), q: fmt.meters(st.qty), t: '' }))}<strong>${total}</strong>`;
    const sb = document.querySelector('[data-sb-total]'); if (sb && !isQv) sb.textContent = `${fmt.meters(st.qty)} ${t('product.meters')} · ${total}`;
    root.querySelectorAll('[data-action="add-to-cart"], [data-action="qv-add"], [data-action="qv-buy"]').forEach(b => b.disabled = stock <= 0);
    const so = root.querySelector('[data-soldout]'); if (so) so.hidden = stock > 0;
    root.querySelectorAll('[data-sku]').forEach(el => el.textContent = v.sku);
    const url = ROKN.pageUrl('product--' + p.id);
    root.querySelectorAll('[data-wa-ask]').forEach(a => a.href = ROKN.waLink(t('chat.msgs.ask', { p: L(p.name), c: cname, url })));
    root.querySelectorAll('[data-wa-swatch]').forEach(a => a.href = ROKN.waLink(t('chat.msgs.swatchP', { p: L(p.name), c: cname, url })));
    root.querySelectorAll('[data-wa-product]').forEach(a => a.href = ROKN.waLink(t('chat.msgs.productColor', { p: L(p.name), c: cname })));
    if (isQv) {
      const im = root.querySelector('[data-qv-img]'); if (im) { im.src = ROKN.img.drape(p, st.color); im.alt = `${L(p.name)} — ${cname}`; }
    } else {
      const g = ROKN.img.gallery(p, st.color);
      const main = root.querySelector('[data-main-img]');
      if (main && !main.src.endsWith(g[st.index].src)) {
        main.classList.add('swap');
        const n = new Image(); n.onload = () => { main.src = g[st.index].src; main.classList.remove('swap'); }; n.src = g[st.index].src;
        main.alt = isAr() ? `${L(p.name)} باللون ${cname} — ${vname(g[st.index].view)}` : `${cname} ${L(p.name)} — ${vname(g[st.index].view)}`;
      }
      const cap = root.querySelector('[data-g-caption]'); if (cap) cap.textContent = `${vname(g[st.index].view)} · ${st.index + 1} / ${g.length}`;
      root.querySelectorAll('.thumb').forEach((b, i) => { b.querySelector('img').src = g[i].src; const on = i === st.index; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    }
  };

  /* =========================== FABRIC CALCULATOR =========================== */
  pages.calculator = {
    render() {
      return `${C.PageHero(t('calc.title'), t('calc.intro'), [{ label: t('v2.calcCta') }])}
      <section class="wrap calc-page">
        <div class="calc-card">${C.FabricCalculator('page')}</div>
        <figure class="calc-media">${img('assets/img/scenes/tailoring.webp', isAr() ? 'قماش على مانيكان خياطة مع شريط قياس' : 'Fabric pinned on a dress form with tape measures', 900, 1125)}
          <figcaption>${esc(t('sections.guideText'))}</figcaption></figure>
      </section>`;
    },
    mount() { ROKN.ui.calcUpdate(); }
  };


  /* =========================== ABOUT / CONTACT =========================== */
  /* Real store photography used in the gallery strip (Admin → Media Library can change these) */
  ROKN.galleryImages = ['dishdasha-whites-fan', 'suiting-colour-card', 'japan-yearn-9x9', 'store-shelves', 'dishdasha-herringbone', 'suiting-grey-pinstripe', 'shirting-lilac-navy', 'wool-220s-blue'].map(n => `assets/img/store/${n}-sm.webp`);
  /* =========================== STAFF ADMIN (lazy-loaded, not linked in customer navigation) =========================== */
  const ADMIN_FILES = ['assets/js/biz/schema.js', 'assets/js/biz/db.js', 'assets/js/biz/services.js', 'assets/js/biz/seed.js', 'assets/js/biz/local.js',
    'assets/js/admin/i18n.js', 'assets/js/admin/kit.js', 'assets/js/admin/shell.js', 'assets/js/admin/pages-core.js', 'assets/js/admin/pages-catalog.js', 'assets/js/admin/pages-admin.js'];
  let adminLoading = null;
  ROKN.loadAdmin = () => adminLoading || (adminLoading = new Promise((res, rej) => {
    if (!document.querySelector('link[data-admin-css]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'assets/css/admin.css'; l.dataset.adminCss = '1'; document.head.appendChild(l); }
    const next = i => { if (i >= ADMIN_FILES.length) return res(); const s = document.createElement('script'); s.src = ADMIN_FILES[i]; s.onload = () => next(i + 1); s.onerror = () => rej(new Error('Failed to load ' + ADMIN_FILES[i])); document.body.appendChild(s); };
    next(0);
  }));
  pages.admin = {
    render() { return ''; },
    mount(param) {
      document.body.classList.add('is-admin');
      ROKN.loadAdmin().then(() => ROKN.admin.shell.route(param)).catch(e => { document.body.classList.remove('is-admin'); document.getElementById('main').innerHTML = `<p class="wrap">${esc(e.message)}</p>`; });
    }
  };

  pages.about = {
    render() {
      return `
      ${C.PageHero(t('about.title'), null, [{ label: t('nav.about') }])}
      <section class="wrap about-lead">
        <p class="lead-xl">${esc(t('about.lead'))}</p>
      </section>
      <section class="wrap split">
        <div class="split-img"><img src="assets/img/store/storefront.webp" alt="${esc(isAr() ? 'واجهة متجر ركن أم القرى للأقمشة في مدينة الكويت' : 'The Rokn Om Alqura fabric store front in Kuwait City')}" loading="lazy" width="640" height="640"></div>
        <div class="split-copy"><p class="eyebrow">${esc(t('about.storyT'))}</p><h2>${esc(t('tagline2'))}</h2><p>${esc(t('about.story'))}</p></div>
      </section>
      ${C.SaduBand('sadu-thin')}
      <section class="section section-cream">
        <div class="wrap">
          <p class="eyebrow">${esc(t('about.valuesT'))}</p>
          <h2 class="h-section">${esc(t('about.valuesT'))}</h2>
          <div class="values">${t('about.values').map((v, i) => `<div class="value">${I(['quality', 'roll', 'support'][i], 'ico-lg')}<h3>${esc(v[0])}</h3><p>${esc(v[1])}</p></div>`).join('')}</div>
        </div>
      </section>
      <section class="wrap split split-rev section">
        <div class="split-img"><img src="assets/img/store/store-shelves.webp" alt="${esc(isAr() ? 'رفوف الأقمشة في متجر ركن أم القرى' : 'Fabric shelves at Rokn Om Alqura')}" loading="lazy" width="1360" height="1020"></div>
        <div class="split-copy"><h2>${esc(t('about.ctaT'))}</h2><p>${esc(t('about.ctaText'))}</p>
          <div class="btn-row"><a class="btn btn-primary" href="#contact">${esc(t('contact.title'))}</a><a class="btn btn-outline" href="${ROKN.waLink()}" target="_blank" rel="noopener">${I('chat')} ${esc(t('wa.short'))}</a></div></div>
      </section>`;
    }
  };

  /* =========================== CONTACT =========================== */
  pages.contact = {
    render() {
      const cfg = ROKN.config;
      return `
      ${C.PageHero(t('contact.title'), t('contact.intro'), [{ label: t('nav.contact') }])}
      <section class="wrap contact">
        <div class="contact-info">
          <h2 class="store-name">Rokn Om Alqura <span lang="ar">ركن أم القرى</span></h2>
          <dl class="info-list">
            <div>${I('pin')}<dt>${esc(t('contact.address'))}</dt><dd>${esc(L(cfg.address))}</dd></div>
            <div>${I('phone')}<dt>${esc(t('contact.phone'))}</dt><dd><span dir="ltr" class="select-all" id="store-phone">${cfg.phone}</span>
              <button class="mini-btn" type="button" data-action="copy" data-copy="${cfg.phone}">${I('copy', 'ico-xs')} ${esc(t('contact.copy'))}</button></dd></div>
            <div>${I('chat')}<dt>${esc(t('contact.whatsapp'))}</dt><dd dir="ltr">${cfg.phone}</dd></div>
            <div>${I('store')}<dt>${esc(t('contact.hours'))}</dt><dd>${esc(t('contact.hoursText'))}</dd></div>
          </dl>
          <div class="btn-row">
            <a class="btn btn-primary" href="tel:${cfg.phoneE164}">${I('phone')} ${esc(t('contact.call'))}</a>
            <a class="btn btn-outline" href="${ROKN.waLink()}" target="_blank" rel="noopener">${I('chat')} ${esc(t('contact.chat'))}</a>
          </div>
          <a class="map-card" href="${cfg.mapsUrl}" target="_blank" rel="noopener" aria-label="${esc(t('contact.map'))}">
            ${pages.mapSvg()}
            <span class="map-cta">${I('pin', 'ico-sm')} ${esc(t('contact.map'))} · XFJ+65H</span>
          </a>
        </div>
        <div class="contact-form-wrap">
          <h2>${esc(t('contact.formT'))}</h2>
          <form class="form" novalidate data-form="contact">
            <div class="field"><label for="cf-name">${esc(t('contact.name'))} *</label><input id="cf-name" name="name" autocomplete="name" required></div>
            <div class="form-2">
              <div class="field"><label for="cf-phone">${esc(t('contact.phoneF'))} *</label><input id="cf-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required dir="ltr"></div>
              <div class="field"><label for="cf-email">${esc(t('contact.email'))}</label><input id="cf-email" name="email" type="email" autocomplete="email" dir="ltr"></div>
            </div>
            <div class="field"><label for="cf-msg">${esc(t('contact.message'))} *</label><textarea id="cf-msg" name="message" rows="5" required></textarea></div>
            <button class="btn btn-primary" type="submit">${esc(t('contact.send'))}</button>
            <div class="form-ok" hidden role="status"><p>${esc(t('contact.ready'))}</p><a class="btn btn-outline" data-wa-msg target="_blank" rel="noopener" href="#">${I('chat')} ${esc(t('contact.sendWa'))}</a></div>
          </form>
        </div>
      </section>`;
    }
  };

  /* =========================== CART =========================== */
  /* shared order summary rows */
  const summaryRows = (tot, shipLabel) => `
    <dl class="sum-rows">
      <div><dt>${esc(t('cart.subtotal'))}</dt><dd>${fmt.money(tot.sub)}</dd></div>
      <div><dt>${esc(t('cart.shipping'))}</dt><dd>${shipLabel}</dd></div>
      ${tot.disc ? `<div class="disc"><dt>${esc(t('cart.discount'))} (${esc(ROKN.state.coupon)})</dt><dd>− ${fmt.money(tot.disc)}</dd></div>` : ''}
      <div class="sum-total"><dt>${esc(t('cart.total'))}</dt><dd>${fmt.money(tot.total)}</dd></div>
    </dl>`;


  /* =========================== CART =========================== */
  pages.cart = {
    render() {
      const lines = ROKN.cart.lines();
      if (!lines.length) return `${C.PageHero(t('cart.title'), null, [{ label: t('cart.title') }])}
        <section class="wrap empty empty-page">${I('bag', 'ico-xl')}<h2>${esc(t('cart.empty'))}</h2><p>${esc(t('cart.emptyText'))}</p><a class="btn btn-primary" href="#shop">${esc(t('hero.cta1'))}</a></section>
        <section class="wrap section"><h2 class="h-section">${esc(t('sections.bestTitle'))}</h2>${C.ProductGrid(q.bestSellers(4))}</section>`;
      const tot = ROKN.cart.totals();
      const free = ROKN.config.shipping.freeThreshold;
      const bar = free ? (() => {
        const left = Math.max(0, free - (tot.sub - tot.disc)), pct = Math.min(100, ((tot.sub - tot.disc) / free) * 100);
        return `<div class="free-bar" role="status"><p>${left > 0 ? esc(t('cart.freeLeft', { n: left.toFixed(3) })) : `${I('check', 'ico-sm')} ${esc(t('cart.freeReached'))}`}</p><span class="bar"><span style="width:${pct}%"></span></span></div>`;
      })() : '';
      return `
      ${C.PageHero(t('cart.title'), null, [{ label: t('cart.title') }])}
      <section class="wrap cart">
        <div class="cart-lines">
          ${bar}
          <ul class="lines" role="list">
            ${lines.map(l => `
            <li class="line">
              <a class="line-img" href="#product--${l.p.id}" tabindex="-1" aria-hidden="true"><img src="${ROKN.img.drape(l.p, l.color, true)}" alt="" width="120" height="150" loading="lazy"></a>
              <div class="line-info">
                <h3><a href="#product--${l.p.id}">${esc(L(l.p.name))}</a></h3>
                <p class="line-color"><span class="dot" style="--c:${q.color(l.color).hex}"></span> ${esc(L(q.color(l.color)))}</p>
                <p class="muted">${fmt.money(l.unit)} ${esc(t('product.perMeter'))} × ${fmt.meters(l.qty)} ${esc(t('product.meters'))}</p>
                <div class="line-actions">
                  <button class="text-btn" type="button" data-action="cart-wish" data-index="${l.index}">${I('heart', 'ico-xs')} ${esc(t('cart.moveToWishlist'))}</button>
                  <button class="text-btn" type="button" data-action="cart-remove" data-index="${l.index}">${I('trash', 'ico-xs')} ${esc(t('cart.remove'))}</button>
                </div>
              </div>
              <div class="line-qty">
                <div class="stepper stepper-sm">
                  <button type="button" data-action="cart-step" data-index="${l.index}" data-dir="-1" aria-label="−">${I('minus')}</button>
                  <input type="number" inputmode="decimal" step="${ROKN.config.meterStep}" min="${ROKN.config.minMeters}" value="${l.qty}" data-cart-qty="${l.index}" aria-label="${esc(t('cart.qty'))}: ${esc(L(l.p.name))}">
                  <span class="stepper-unit">${esc(t('product.meters'))}</span>
                  <button type="button" data-action="cart-step" data-index="${l.index}" data-dir="1" aria-label="+">${I('plus')}</button>
                </div>
              </div>
              <p class="line-total">${fmt.money(l.total)}</p>
            </li>`).join('')}
          </ul>
          <a class="link-arrow back" href="#shop">${I('arrow', 'ico-sm flip-rtl-back')} ${esc(t('cart.continue'))}</a>
        </div>
        <aside class="summary" aria-labelledby="sum-h">
          <h2 id="sum-h">${esc(t('cart.summary'))}</h2>
          ${summaryRows(tot, esc(t('cart.calcAtCheckout')))}
          <form class="coupon" data-form="coupon" novalidate>
            <label for="coupon-input">${esc(t('cart.coupon'))}</label>
            ${ROKN.state.coupon ? `<p class="coupon-on">${I('check', 'ico-sm')} ${esc(t('cart.couponApplied', { c: ROKN.state.coupon }))} <button type="button" class="text-btn" data-action="coupon-remove">${esc(t('cart.removeCoupon'))}</button></p>` :
              `<div class="coupon-row"><input id="coupon-input" autocomplete="off" dir="ltr" aria-describedby="coupon-msg"><button class="btn btn-outline btn-sm" type="submit">${esc(t('cart.applyCoupon'))}</button></div>`}
            <p class="field-msg" id="coupon-msg" role="alert"></p>
          </form>
          <a class="btn btn-primary btn-block btn-lg" href="#checkout">${I('lock', 'ico-sm')} ${esc(t('cart.checkout'))}</a>
          <a class="btn btn-wa btn-block" href="${ROKN.waLink(t('chat.msgs.order'))}" target="_blank" rel="noopener">${I('chat', 'ico-sm')} ${esc(t('chat.opts.order'))}</a>
          <ul class="pay-marks">${['KNET', 'VISA', 'Mastercard'].map(x => `<li>${x}</li>`).join('')}</ul>
        </aside>
      </section>`;
    }
  };

  /* =========================== CHECKOUT (4 steps) =========================== */
  ROKN.co = { step: 0, ship: 'standard', pay: 'knet', values: {} };
  pages.checkout = {
    render() {
      const lines = ROKN.cart.lines();
      if (!lines.length) return pages.cart.render();
      const cfg = ROKN.config, co = ROKN.co, saved = (ROKN.state.user && ROKN.state.user.addresses && ROKN.state.user.addresses[0]) || {};
      const v = Object.assign({}, ROKN.state.user || {}, saved, co.values);
      if (!cfg.payments.find(p => p.id === co.pay && p.enabled)) co.pay = cfg.payments.find(p => p.enabled).id;
      const field = (id, label, opts = {}) => `
        <div class="field ${opts.cls || ''}"><label for="co-${id}">${esc(label)}${opts.req === false ? '' : ' *'}</label>
        <input id="co-${id}" name="${id}" ${opts.type ? `type="${opts.type}"` : ''} ${opts.ac ? `autocomplete="${opts.ac}"` : ''} ${opts.req === false ? '' : 'required'} ${opts.ltr ? 'dir="ltr"' : ''} ${opts.im ? `inputmode="${opts.im}"` : ''} value="${esc(v[id] || '')}" aria-describedby="err-${id}">
        <p class="field-msg" id="err-${id}"></p></div>`;
      const tot = ROKN.cart.totals(co.ship);
      const steps = t('co2.steps');
      return `
      <section class="wrap checkout-head">
        <a class="link-arrow back" href="#cart">${I('arrow', 'ico-sm flip-rtl-back')} ${esc(t('checkout.back'))}</a>
        <h1>${esc(t('checkout.title'))}</h1>
        <p class="secure-badge">${I('lock', 'ico-sm')} ${esc(t('checkout.secure'))}</p>
        <ol class="stepper-nav">${steps.map((s, i) => `<li class="${i < co.step ? 'done' : i === co.step ? 'current' : ''}" ${i === co.step ? 'aria-current="step"' : ''}><span class="sn">${i < co.step ? I('check', 'ico-xs') : i + 1}</span><span class="st">${esc(s)}</span></li>`).join('')}</ol>
      </section>
      <form class="wrap checkout" novalidate data-form="checkout">
        <div class="co-main">
          <p class="form-error" role="alert" hidden data-form-error>${esc(t('checkout.fixErrors'))}</p>
          <fieldset class="co-step" data-step="0" ${co.step === 0 ? '' : 'hidden'}><legend><span class="step-n">1</span>${esc(steps[0])}</legend>
            ${field('fullName', t('checkout.fullName'), { ac: 'name' })}
            <div class="form-2">${field('phone', t('checkout.phone'), { type: 'tel', ac: 'tel', ltr: true, im: 'tel' })}${field('email', t('checkout.email'), { type: 'email', ac: 'email', ltr: true, req: false })}</div>
            <div class="form-2">
              <div class="field"><label for="co-country">${esc(t('checkout.country'))} *</label><select id="co-country" name="country" autocomplete="country"><option value="KW">${esc(t('checkout.kuwait'))}</option></select></div>
              <div class="field"><label for="co-city">${esc(t('checkout.city'))} *</label><select id="co-city" name="city" required aria-describedby="err-city"><option value="">${esc(t('checkout.select'))}</option>${cfg.governorates.map(g => `<option value="${g.id}" ${v.city === g.id ? 'selected' : ''}>${esc(L(g))}</option>`).join('')}</select><p class="field-msg" id="err-city"></p></div>
            </div>
            <div class="form-3">${field('area', t('checkout.area'))}${field('block', t('checkout.block'), { im: 'numeric' })}${field('street', t('checkout.street'))}</div>
            <div class="form-4">${field('avenue', t('checkout.avenue'), { req: false })}${field('building', t('checkout.building'))}${field('floor', t('checkout.floor'), { req: false })}${field('apartment', t('checkout.apartment'), { req: false })}</div>
            <div class="field"><label for="co-notes">${esc(t('co2.additional'))}</label><textarea id="co-notes" name="notes" rows="2">${esc(v.notes || '')}</textarea></div>
          </fieldset>
          <fieldset class="co-step" data-step="1" ${co.step === 1 ? '' : 'hidden'}><legend><span class="step-n">2</span>${esc(steps[1])}</legend>
            <div class="radio-cards">${cfg.shipping.methods.map(m => {
              const fee = ROKN.cart.shippingFee(m.id, tot.sub - tot.disc);
              return `<label class="rcard"><input type="radio" name="ship" value="${m.id}" ${co.ship === m.id ? 'checked' : ''} data-co="ship"><span class="rcard-in"><span class="rcard-t">${esc(t('checkout.methods.' + m.id))}</span><span class="rcard-d">${esc(L(m.days))}</span><span class="rcard-p">${fee ? fmt.money(fee) : esc(t('cart.free'))}</span></span></label>`;
            }).join('')}</div>
          </fieldset>
          <fieldset class="co-step" data-step="2" ${co.step === 2 ? '' : 'hidden'}><legend><span class="step-n">3</span>${esc(steps[2])}</legend>
            <div class="radio-cards pay-cards">${cfg.payments.filter(p => p.enabled).map(p => `
              <label class="rcard"><input type="radio" name="pay" value="${p.id}" ${co.pay === p.id ? 'checked' : ''} data-co="pay"><span class="rcard-in"><span class="rcard-t">${esc(t('checkout.pay.' + p.id))}</span><span class="rcard-d">${esc(t('checkout.payNote.' + p.id))}</span></span></label>`).join('')}</div>
            ${cfg.paymentGatewayConnected ? `<p class="secure-note">${I('lock', 'ico-xs')} ${esc(t('checkout.sslNote'))}</p>` : `<p class="note">${esc(t('co2.gatewayOff'))}</p>`}
          </fieldset>
          <fieldset class="co-step" data-step="3" ${co.step === 3 ? '' : 'hidden'}><legend><span class="step-n">4</span>${esc(steps[3])}</legend>
            <div class="review-blocks" data-review-blocks></div>
          </fieldset>
          <div class="co-nav">
            ${co.step > 0 ? `<button type="button" class="btn btn-outline" data-action="co-back">${I('arrow', 'ico-sm flip-rtl-back')} ${esc(t('co2.back'))}</button>` : '<span></span>'}
            ${co.step < 3 ? `<button type="button" class="btn btn-primary" data-action="co-next">${esc(t('co2.next'))} ${I('arrow', 'ico-sm flip-rtl')}</button>` : `<button class="btn btn-primary btn-lg" type="submit">${I('lock', 'ico-sm')} ${esc(t('checkout.placeOrder'))}</button>`}
          </div>
        </div>
        <aside class="summary co-summary" aria-labelledby="co-sum-h">
          <h2 id="co-sum-h">${esc(t('checkout.review'))}</h2>
          <ul class="mini-lines" role="list">${lines.map(l => `
            <li><img src="${ROKN.img.drape(l.p, l.color, true)}" alt="" width="56" height="70"><div><p class="ml-name">${esc(L(l.p.name))}</p><p class="muted">${esc(L(q.color(l.color)))} · ${fmt.meters(l.qty)} ${esc(t('product.meters'))}</p></div><p class="ml-total">${fmt.money(l.total)}</p></li>`).join('')}</ul>
          <div data-co-totals>${summaryRows(tot, tot.ship ? fmt.money(tot.ship) : esc(t('cart.free')))}</div>
          <p class="fine">${esc(t('checkout.agree'))}</p>
          <a class="text-link" href="${ROKN.waLink(t('chat.msgs.order'))}" target="_blank" rel="noopener">${I('chat', 'ico-xs')} ${esc(t('chat.opts.order'))}</a>
        </aside>
      </form>`;
    },
    mount() { if (ROKN.co.step === 3) ROKN.coReview(); }
  };
  ROKN.coTotals = function () {
    const tot = ROKN.cart.totals(ROKN.co.ship);
    const el = document.querySelector('[data-co-totals]');
    if (el) el.innerHTML = summaryRows(tot, tot.ship ? fmt.money(tot.ship) : esc(t('cart.free')));
  };
  ROKN.coAddress = (v) => {
    const gov = ROKN.config.governorates.find(g => g.id === v.city);
    return [v.area, v.block && `${t('checkout.block')} ${v.block}`, v.street && `${t('checkout.street')} ${v.street}`, v.avenue && `${isAr() ? 'جادة' : 'Avenue'} ${v.avenue}`,
      v.building && `${isAr() ? 'مبنى' : 'Bldg'} ${v.building}`, v.floor && `${t('checkout.floor')} ${v.floor}`, v.apartment && `${t('checkout.apartment')} ${v.apartment}`, gov && L(gov)].filter(Boolean).join(isAr() ? '، ' : ', ');
  };
  ROKN.coReview = function () {
    const v = ROKN.co.values, el = document.querySelector('[data-review-blocks]'); if (!el) return;
    const blk = (title, body, step) => `<div class="rv-block"><div><h3>${esc(title)}</h3><p>${body}</p></div><button type="button" class="text-btn" data-action="co-goto" data-step="${step}">${esc(t('co2.edit'))}</button></div>`;
    el.innerHTML = blk(t('checkout.contact'), `${esc(v.fullName || '')}<br><span dir="ltr">${esc(v.phone || '')}</span>${v.email ? `<br><span dir="ltr">${esc(v.email)}</span>` : ''}`, 0) +
      blk(t('co2.deliverTo'), esc(ROKN.coAddress(v)) + (v.notes ? `<br><span class="muted">${esc(v.notes)}</span>` : ''), 0) +
      blk(t('co2.method'), esc(t('checkout.methods.' + ROKN.co.ship)), 1) +
      blk(t('co2.payWith'), esc(t('checkout.pay.' + ROKN.co.pay)), 2);
  };

  pages.order = {
    render(num) {
      const o = ROKN.state.orders.find(x => x.number === String(num).toUpperCase());
      if (!o) return pages.notFound.render();
      return `
      <section class="wrap confirm">
        <span class="confirm-ico">${I('check', 'ico-xl')}</span>
        <h1>${esc(t('order.thanks'))}</h1>
        <p class="order-num">${esc(t('order.number'))}: <strong dir="ltr">${o.number}</strong></p>
        <p>${esc(t('order.confirmText', { phone: o.phone }))}</p>
        <p class="note">${esc(t('order.preview'))}</p>
        <dl class="sum-rows confirm-sum">
          <div><dt>${esc(t('cart.subtotal'))}</dt><dd>${fmt.money(o.sub)}</dd></div>
          <div><dt>${esc(t('cart.shipping'))}</dt><dd>${o.ship ? fmt.money(o.ship) : esc(t('cart.free'))}</dd></div>
          ${o.disc ? `<div><dt>${esc(t('cart.discount'))}</dt><dd>− ${fmt.money(o.disc)}</dd></div>` : ''}
          <div class="sum-total"><dt>${esc(t('cart.total'))}</dt><dd>${fmt.money(o.total)}</dd></div>
        </dl>
        <div class="btn-row center"><a class="btn btn-primary" href="#track--${o.number}">${esc(t('order.track'))}</a><a class="btn btn-outline" href="#shop">${esc(t('order.continue'))}</a></div>
      </section>`;
    }
  };

  /* =========================== WISHLIST =========================== */
  pages.wishlist = {
    render() {
      const list = ROKN.state.wishlist.map(q.product).filter(Boolean);
      return `${C.PageHero(t('wishlist.title'), null, [{ label: t('wishlist.title') }])}
      <section class="wrap section-tight">
        ${list.length ? `<div class="wl-head"><p class="muted">${esc(fmt.fabrics(list.length))}</p><button class="btn btn-outline btn-sm" type="button" data-action="wl-all">${esc(t('wishlist.moveAll'))}</button></div>${C.ProductGrid(list)}` :
          `<div class="empty empty-page">${I('heart', 'ico-xl')}<h2>${esc(t('wishlist.empty'))}</h2><p>${esc(t('wishlist.emptyText'))}</p><a class="btn btn-primary" href="#shop">${esc(t('hero.cta1'))}</a></div>`}
      </section>`;
    }
  };

  /* =========================== ACCOUNT =========================== */

  /* =========================== ACCOUNT =========================== */
  pages.account = {
    render() {
      const u = ROKN.state.user;
      if (!u) {
        const tab = ROKN.state.accTab || 'signin';
        return `${C.PageHero(t('account.title'), null, [{ label: t('account.title') }])}
        <section class="wrap account-auth">
          <div class="tabs" role="tablist">
            <button role="tab" id="tab-signin" aria-selected="${tab === 'signin'}" aria-controls="panel-auth" data-action="acc-tab" data-tab="signin">${esc(t('account.signIn'))}</button>
            <button role="tab" id="tab-register" aria-selected="${tab === 'register'}" aria-controls="panel-auth" data-action="acc-tab" data-tab="register">${esc(t('account.register'))}</button>
          </div>
          <form class="form auth-form" id="panel-auth" role="tabpanel" aria-labelledby="tab-${tab}" novalidate data-form="auth" data-mode="${tab}">
            ${tab === 'register' ? `<div class="field"><label for="au-name">${esc(t('account.name'))} *</label><input id="au-name" name="fullName" autocomplete="name" required></div>
            <div class="field"><label for="au-phone">${esc(t('account.phone'))} *</label><input id="au-phone" name="phone" type="tel" autocomplete="tel" dir="ltr" required></div>` : ''}
            <div class="field"><label for="au-email">${esc(t('account.email'))} *</label><input id="au-email" name="email" type="email" autocomplete="email" dir="ltr" required></div>
            <div class="field"><label for="au-pass">${esc(t('account.password'))} *</label><input id="au-pass" name="password" type="password" autocomplete="${tab === 'register' ? 'new-password' : 'current-password'}" minlength="6" required></div>
            <button class="btn btn-primary btn-block" type="submit">${esc(tab === 'register' ? t('account.register') : t('account.signIn'))}</button>
            ${tab === 'signin' ? `<a class="text-link" href="${ROKN.waLink(t('chat.msgs.help'))}" target="_blank" rel="noopener">${esc(t('account.forgot'))}</a>` : ''}
            <p class="note">${esc(t('account.demoNote'))}</p>
          </form>
        </section>`;
      }
      const sec = ROKN.state.accSec || 'orders';
      const orders = ROKN.state.orders;
      const nav = [['orders', 'bag', t('account.orders')], ['wishlist', 'heart', t('acc2.wishlist')], ['addresses', 'pin', t('account.addresses')], ['details', 'user', t('account.details')], ['language', 'globe', t('acc2.language')]];
      let body = '';
      if (sec === 'orders') body = orders.length ? `<div class="table-wrap"><table class="orders"><thead><tr><th>${esc(t('order.number'))}</th><th>${esc(t('account.date'))}</th><th>${esc(t('account.status'))}</th><th>${esc(t('account.total'))}</th><th><span class="sr-only">${esc(t('account.view'))}</span></th></tr></thead>
            <tbody>${orders.map(o => `<tr><td dir="ltr">${o.number}</td><td>${esc(fmt.date(o.date))}</td><td><span class="status">${esc(t('track2.steps')[ROKN.orderStep(o)])}</span></td><td>${fmt.money(o.total)}</td><td><a href="#track--${o.number}">${esc(t('account.view'))}</a></td></tr>`).join('')}</tbody></table></div>`
          : `<p class="muted">${esc(t('account.noOrders'))}</p><a class="btn btn-outline btn-sm" href="#shop">${esc(t('hero.cta1'))}</a>`;
      if (sec === 'wishlist') { const list = ROKN.state.wishlist.map(q.product).filter(Boolean); body = list.length ? C.ProductGrid(list, 'pgrid-shop') : `<p class="muted">${esc(t('wishlist.emptyText'))}</p>`; }
      if (sec === 'addresses') {
        const a = (u.addresses || [])[0] || {};
        body = `${u.addresses && u.addresses.length ? `<address class="addr-card">${esc(u.fullName || '')}<br>${esc(ROKN.coAddress(a))}<br><span dir="ltr">${esc(u.phone || '')}</span></address>` : `<p class="muted">${esc(t('account.noAddress'))}</p>`}
          <form class="form addr-form" data-form="address" novalidate>
            <h3>${esc(t('acc2.addAddr'))}</h3>
            <div class="field"><label for="ad-city">${esc(t('checkout.city'))} *</label><select id="ad-city" name="city" required><option value="">${esc(t('checkout.select'))}</option>${ROKN.config.governorates.map(g => `<option value="${g.id}" ${a.city === g.id ? 'selected' : ''}>${esc(L(g))}</option>`).join('')}</select></div>
            <div class="form-3">${['area', 'block', 'street'].map(k => `<div class="field"><label for="ad-${k}">${esc(t('checkout.' + k))} *</label><input id="ad-${k}" name="${k}" required value="${esc(a[k] || '')}"></div>`).join('')}</div>
            <div class="form-4">${['avenue', 'building', 'floor', 'apartment'].map(k => `<div class="field"><label for="ad-${k}">${esc(t('checkout.' + k))}${k === 'building' ? ' *' : ''}</label><input id="ad-${k}" name="${k}" ${k === 'building' ? 'required' : ''} value="${esc(a[k] || '')}"></div>`).join('')}</div>
            <button class="btn btn-primary btn-sm" type="submit">${esc(t('acc2.saveAddr'))}</button>
            <p class="form-ok" hidden role="status">${esc(t('acc2.addrSaved'))}</p>
          </form>`;
      }
      if (sec === 'details') body = `<dl class="kv"><div><dt>${esc(t('account.name'))}</dt><dd>${esc(u.fullName || '—')}</dd></div><div><dt>${esc(t('account.email'))}</dt><dd dir="ltr">${esc(u.email || '—')}</dd></div><div><dt>${esc(t('account.phone'))}</dt><dd dir="ltr">${esc(u.phone || '—')}</dd></div></dl>`;
      if (sec === 'language') body = `<p class="muted">${esc(t('acc2.langHint'))}</p>
        <div class="radio-cards lang-cards">${[['en', 'English'], ['ar', 'العربية']].map(([k, n]) => `<label class="rcard"><input type="radio" name="langpref" value="${k}" ${ROKN.state.lang === k ? 'checked' : ''} data-langpref><span class="rcard-in"><span class="rcard-t" lang="${k}">${n}</span><span class="rcard-d">${k === 'ar' ? 'RTL' : 'LTR'}</span></span></label>`).join('')}</div>`;
      return `${C.PageHero(t('account.welcome', { name: u.fullName || u.email }), null, [{ label: t('account.title') }])}
      <section class="wrap account">
        <nav class="acc-nav" aria-label="${esc(t('account.title'))}">
          ${nav.map(([k, ic, label]) => `<button type="button" data-action="acc-sec" data-sec="${k}" ${sec === k ? 'aria-current="page"' : ''}>${I(ic, 'ico-sm')} ${esc(label)}</button>`).join('')}
          <a href="#track">${I('truck', 'ico-sm')} ${esc(t('footer.tracking'))}</a>
          <button type="button" data-action="sign-out">${I('arrow', 'ico-sm flip-rtl-back')} ${esc(t('acc2.logout'))}</button>
        </nav>
        <div class="acc-main"><h2>${esc(nav.find(n => n[0] === sec)[2])}</h2>${body}<p class="note">${esc(t('account.demoNote'))}</p></div>
      </section>`;
    }
  };

  /* =========================== ORDER TRACKING =========================== */
  ROKN.orderStep = o => { const h = (Date.now() - new Date(o.date).getTime()) / 36e5; return h < 0.05 ? 0 : h < 2 ? 1 : h < 12 ? 2 : h < 30 ? 3 : 4; };
  pages.track = {
    render(num) {
      const found = num ? ROKN.state.orders.find(o => o.number === String(num).toUpperCase()) : null;
      return `${C.PageHero(t('track.title'), t('track.intro'), [{ label: t('track.title') }])}
      <section class="wrap track">
        <form class="form track-form" novalidate data-form="track">
          <div class="field"><label for="tr-num">${esc(t('track.number'))} *</label><input id="tr-num" name="number" dir="ltr" placeholder="RQ-000000" required value="${esc(found ? found.number : '')}"></div>
          <div class="field"><label for="tr-phone">${esc(t('track2.by'))} *</label><input id="tr-phone" name="contact" dir="ltr" required value="${esc(found ? found.phone : '')}" autocomplete="tel"></div>
          <button class="btn btn-primary" type="submit">${esc(t('track.submit'))}</button>
          <a class="text-link" href="${ROKN.waLink(t('chat.msgs.order'))}" target="_blank" rel="noopener">${I('chat', 'ico-xs')} ${esc(t('chat.opts.order'))}</a>
        </form>
        <div class="track-result" data-track-result aria-live="polite">${found ? ROKN.trackHtml(found) : `<figure class="track-media">${img('assets/img/store/store-shelves.webp', '', 1360, 1020)}</figure>`}</div>
      </section>`;
    }
  };
  ROKN.trackHtml = o => {
    const step = ROKN.orderStep(o), steps = t('track2.steps');
    return `<div class="track-card"><p><strong dir="ltr">${o.number}</strong> · ${esc(t('track.placed', { d: fmt.date(o.date) }))}</p>
      <ol class="progress">${steps.map((s, i) => `<li class="${i < step ? 'done' : i === step ? 'current' : ''}" ${i === step ? 'aria-current="step"' : ''}><span class="pg-dot">${i <= step ? I('check', 'ico-xs') : ''}</span><span class="pg-t">${esc(s)}</span></li>`).join('')}</ol>
      <p class="note">${esc(t('order.preview'))}</p></div>`;
  };

  pages.faq = {
    render() {
      return `${C.PageHero(t('pages.faq'), null, [{ label: t('pages.faq') }])}
      <section class="wrap prose-wrap">
        <div class="faq">${ROKN.content.faq.map((f, i) => `
          <details class="faq-item" ${i === 0 ? 'open' : ''}><summary><h2>${esc(L(f.q))}</h2>${I('plus', 'ico-sm')}</summary><p>${esc(L(f.a))}</p></details>`).join('')}</div>
        <div class="help-box">${I('chat', 'ico-lg')}<div><h2>${esc(t('product.needHelp'))}</h2><p>${esc(t('product.needHelpText'))}</p><a class="link-arrow" href="${ROKN.waLink()}" target="_blank" rel="noopener">${esc(t('wa.cta'))}</a></div></div>
      </section>`;
    }
  };
  const policy = (key, sectionsFn) => ({
    render() {
      const secs = sectionsFn(ROKN.state.lang, ROKN.config);
      return `${C.PageHero(t('pages.' + key), t('pages.updated'), [{ label: t('pages.' + key) }])}
      <section class="wrap prose-wrap prose">
        ${secs.map(([h, body]) => `<h2>${esc(h)}</h2>${body.split('\n').map(par => `<p>${esc(par)}</p>`).join('')}`).join('')}
        <p class="muted">${esc(isAr() ? 'لأي استفسار تواصل معنا على' : 'Questions? Contact us on')} <a href="tel:${ROKN.config.phoneE164}" dir="ltr">${ROKN.config.phone}</a></p>
      </section>`;
    }
  });
  pages.shipping = policy('shipping', ROKN.content.shipping);
  pages.returns = policy('returns', ROKN.content.returns);
  pages.privacy = policy('privacy', ROKN.content.privacy);
  pages.terms = policy('terms', ROKN.content.terms);

  /* =========================== 404 =========================== */
  pages.notFound = {
    render() {
      return `<section class="wrap empty empty-page"><h1>${esc(t('common.notFound'))}</h1><p>${esc(t('common.notFoundText'))}</p><a class="btn btn-primary" href="#home">${esc(t('common.goHome'))}</a></section>`;
    }
  };
})();
