/* ==========================================================================
   APP — shell, interactions, overlays (search, quick view, gallery, cart
   drawer, WhatsApp chat, exit intent), forms. Event delegation via data-action.
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const { t, L, esc, fmt, q } = ROKN;
  const C = ROKN.components, I = ROKN.icon;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const isAr = () => ROKN.state.lang === 'ar';
  const store = { get(k) { try { return sessionStorage.getItem('rokn:' + k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem('rokn:' + k, v); } catch (e) { /* ignore */ } } };

  const ui = ROKN.ui = {};

  /* ---------------- Shell ---------------- */
  ui.renderShell = function () {
    const lang = ROKN.state.lang, d = ROKN.i18n[lang];
    document.documentElement.lang = lang === 'ar' ? 'ar-KW' : 'en';
    document.documentElement.dir = d.dir;
    $('#skip-link').textContent = t('skip');
    $('#header-root').innerHTML = C.Header();
    $('#footer-root').innerHTML = C.Footer();
    $('#wa-root').innerHTML = C.WhatsAppChat() + C.BottomNav() +
      `<div class="cd-backdrop" data-action="drawer-close" hidden></div><aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cd-title" aria-hidden="true" inert></aside>`;
    ROKN.localizeLinks(document);
  };

  ui.updateCounts = function () {
    const c = ROKN.cart.count(), w = ROKN.state.wishlist.length;
    $$('[data-count="cart"]').forEach(el => { el.textContent = c; el.hidden = !c; const p = el.parentElement; if (p.hasAttribute('aria-label')) p.setAttribute('aria-label', `${t('icons.cart')} (${c})`); });
    $$('[data-count="wishlist"]').forEach(el => { el.textContent = w; el.hidden = !w; const p = el.parentElement; if (p.hasAttribute('aria-label')) p.setAttribute('aria-label', `${t('icons.wishlist')} (${w})`); });
    if ($('#cart-drawer.open')) ui.renderDrawer();
  };

  ui.afterRoute = function (route) {
    if (route.name !== 'admin' && document.body.classList.contains('is-admin') && ROKN.admin && ROKN.admin.shell) ROKN.admin.shell.leave();
    ui.closeAll();
    ui.stopSlider(route.name === 'home');
    if (route.name !== 'product') document.body.classList.remove('has-sticky-buy');
    document.body.dataset.route = route.name;
    const navKey = { shop: 'shop', collection: 'collections', collections: 'collections', categories: 'shop', product: 'shop', new: 'shop', bestsellers: 'shop', search: 'shop', color: 'shop' }[route.name] || route.name;
    $$('[data-nav]').forEach(a => a.dataset.nav === navKey ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    $$('[data-bn]').forEach(a => a.dataset.bn === navKey ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    ROKN.localizeLinks(document);
    ROKN.seo.route(route);
    if (!ui.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    ui.keepScroll = false;
    if (ui.routed && route.name !== 'admin') $('#main').focus({ preventScroll: true });
    ui.routed = true;
    ui.updateCounts();
    ui.refreshChat();
  };
  ui.rerender = function () { ui.keepScroll = true; const y = window.scrollY; ROKN.router.render(); window.scrollTo(0, y); };

  /* ---------------- Toast ---------------- */
  let toastTimer;
  ui.toast = function (html) {
    const el = $('#toast');
    el.innerHTML = html; el.hidden = false; ROKN.localizeLinks(el);
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => { el.hidden = true; }, 300); }, 3200);
  };

  /* ---------------- Modal (focus-trapped dialog) ---------------- */
  let lastFocus = null;
  ui.openModal = function (html, cls = '', label = '') {
    lastFocus = document.activeElement;
    const root = $('#overlay-root');
    root.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}">
      <div class="modal-backdrop" data-action="modal-close"></div>
      <div class="modal-panel" tabindex="-1">${html}<button class="icon-btn modal-x" type="button" data-action="modal-close" aria-label="${esc(t('common.close'))}">${I('close')}</button></div></div>`;
    ROKN.localizeLinks(root);
    document.body.classList.add('no-scroll');
    requestAnimationFrame(() => { root.firstElementChild.classList.add('open'); const f = root.querySelector('[data-autofocus]') || root.querySelector('.modal-panel'); f.focus(); });
  };
  ui.closeModal = function () {
    const root = $('#overlay-root');
    if (!root.firstElementChild) return;
    root.innerHTML = '';
    document.body.classList.remove('no-scroll');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  };
  ui.closeAll = function () { ui.closeModal(); ui.menu(false); ui.filters(false); ui.drawer(false); ui.chat(false); };

  /* ---------------- Drawers ---------------- */
  const setDrawer = (el, backdrop, open) => {
    if (!el) return;
    el.classList.toggle('open', open); el.setAttribute('aria-hidden', !open);
    if (open) el.removeAttribute('inert'); else el.setAttribute('inert', '');
    if (backdrop) backdrop.hidden = !open;
    document.body.classList.toggle('no-scroll', open);
  };
  ui.menu = function (open) {
    const m = $('#mobile-menu'); if (!m) return;
    setDrawer(m, $('.drawer-backdrop'), open);
    const btn = $('.menu-btn'); btn && btn.setAttribute('aria-expanded', open);
    if (open) setTimeout(() => m.querySelector('a, button').focus(), 50);
  };
  ui.renderDrawer = function () { const d = $('#cart-drawer'); d.innerHTML = C.CartDrawer(); ROKN.localizeLinks(d); };
  ui.drawer = function (open) {
    const d = $('#cart-drawer'); if (!d) return;
    if (open) { lastFocus = document.activeElement; ui.renderDrawer(); }
    const was = d.classList.contains('open');
    setDrawer(d, $('.cd-backdrop'), open);
    if (open) setTimeout(() => d.querySelector('button, a').focus(), 60);
    else if (was && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  };
  ui.filters = function (open) {
    const side = $('#shop-filters'); if (!side) return;
    document.body.classList.toggle('filters-open', open);
    document.body.classList.toggle('no-scroll', open && window.innerWidth < 960);
    const tg = $('.filter-toggle'); tg && tg.setAttribute('aria-expanded', open);
    if (open) side.querySelector('button, input, summary').focus();
  };

  /* ---------------- WhatsApp chat widget ---------------- */
  ui.refreshChat = function () { const ul = $('[data-wa-opts]'); if (ul) ul.innerHTML = C.chatOptions(); };
  ui.chat = function (open) {
    const panel = $('#wa-panel'), btn = $('.wa-float'); if (!panel) return;
    if (open) ui.refreshChat();
    panel.hidden = !open; btn.setAttribute('aria-expanded', open);
    $('#wa-widget').classList.toggle('open', open);
    if (open) setTimeout(() => panel.querySelector('.wa-opt').focus(), 40);
  };

  /* ---------------- Hero slider ---------------- */
  let slideTimer = null, slideIdx = 0, slidePaused = false;
  ui.showSlide = function (i) {
    const slides = $$('[data-slide]'); if (!slides.length) return;
    slideIdx = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const on = k === slideIdx; s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', !on);
      $$('a, button', s).forEach(a => on ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1'));
    });
    $$('.dotbtn').forEach((d, k) => { d.classList.toggle('on', k === slideIdx); d.setAttribute('aria-current', k === slideIdx); });
  };
  ui.startSlider = function () {
    slideIdx = 0; ui.showSlide(0);
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    clearInterval(slideTimer);
    if (!reduce && !slidePaused) slideTimer = setInterval(() => ui.showSlide(slideIdx + 1), 7000);
    const sl = $('[data-slider]');
    if (sl && !sl.dataset.bound) {
      sl.dataset.bound = 1;
      let x0 = null;
      sl.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
      sl.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { ui.showSlide(slideIdx + ((dx < 0) !== isAr() ? 1 : -1)); ui.restartSlider(); } x0 = null; });
    }
  };
  ui.restartSlider = function () { if (slideTimer) { clearInterval(slideTimer); slideTimer = setInterval(() => ui.showSlide(slideIdx + 1), 7000); } };
  ui.stopSlider = function (keep) { if (!keep) { clearInterval(slideTimer); slideTimer = null; } };

  /* ---------------- Shop by colour ---------------- */
  ui.colorFamily = function (fam, initial) {
    ROKN.state.homeColor = fam;
    $$('.cx-chip').forEach(b => { const on = b.dataset.family === fam; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const box = $('[data-cx-results]'); if (box) { box.innerHTML = C.colorResults(fam); ROKN.localizeLinks(box); }
  };

  /* ---------------- Search with autocomplete ---------------- */
  ui.openSearch = function () {
    ui.menu(false); ui.drawer(false);
    ui.openModal(`
      <div class="search-box">
        <label for="search-input" class="sr-only">${esc(t('search.title'))}</label>
        <div class="search-field">${I('search')}<input id="search-input" type="search" autocomplete="off" placeholder="${esc(t('search.placeholder'))}" data-search-input data-autofocus aria-controls="search-results" aria-describedby="search-hint"></div>
        <p class="sr-only" id="search-hint">${esc(t('search2.suggestions'))}</p>
        <div id="search-results" class="search-results" aria-live="polite">${ui.searchIdle()}</div>
      </div>`, 'modal-search', t('search.title'));
  };
  const chipTerms = terms => `<div class="pop-terms">${terms.map(s => `<button type="button" class="chip" data-action="search-term" data-term="${esc(s)}">${esc(s)}</button>`).join('')}</div>`;
  ui.searchIdle = () => `<p class="eyebrow">${esc(t('search.popular'))}</p>${chipTerms([...t('search.terms'), isAr() ? 'كتان أسود' : 'black linen', isAr() ? 'دشداشة' : 'dishdasha'])}
    <p class="eyebrow">${esc(t('v2.colorEyebrow'))}</p><div class="pop-terms">${ROKN.catalog.colorFamilies.map(f => `<a class="chip chip-sw" href="#color--${f.id}"><span class="mc-chip" style="background-image:url(assets/img/swatches/${f.id}.webp)"></span>${esc(L(f))}</a>`).join('')}</div>`;
  ui.runSearch = function (term) {
    const box = $('#search-results'); if (!box) return;
    term = term.trim();
    if (!term) { box.innerHTML = ui.searchIdle(); ROKN.localizeLinks(box); return; }
    const hits = q.searchHits(term), sugg = q.suggest(term).filter(s => q.norm(s) !== q.norm(term));
    const sugHtml = sugg.length ? `<p class="eyebrow">${esc(t('search2.suggestions'))}</p><ul class="suggest" role="list">${sugg.map(s => `<li><button type="button" data-action="search-term" data-term="${esc(s)}">${I('search', 'ico-xs')} ${esc(s)}</button></li>`).join('')}</ul>` : '';
    if (!hits.length) {
      box.innerHTML = `${sugHtml}<div class="search-empty">${I('search', 'ico-lg')}<p><strong>${esc(t('search.none', { q: term }))}</strong></p><p class="muted">${esc(t('search.noneHint'))}</p>
        ${chipTerms(t('search.terms'))}<a class="btn btn-wa btn-sm" href="${ROKN.waLink(t('chat.msgs.help'))}" target="_blank" rel="noopener">${I('chat', 'ico-sm')} ${esc(t('wa.cta'))}</a></div>`;
      ROKN.localizeLinks(box); return;
    }
    box.innerHTML = `${sugHtml}<p class="eyebrow">${esc(t('search2.products'))} (${hits.length})</p><ul class="sresults" role="list">${hits.slice(0, 6).map(({ p, color }) => {
      const stock = q.stock(p, color);
      return `<li><a href="#product--${p.id}" class="sresult" data-action="search-go" data-id="${p.id}" data-color="${color}">
        <img src="${ROKN.img.drape(p, color, true)}" alt="" width="64" height="80" loading="lazy">
        <span class="sr-body"><span class="sr-name">${esc(L(p.name))}</span><span class="sr-cat">${esc(L(q.category(p.category)))} · ${esc(L(q.color(color)))} · <span dir="ltr">${esc(p.sku)}</span></span></span>
        <span class="sr-side"><span class="sr-price">${fmt.money(q.price(p, color))} <small>${esc(t('product.perMeter'))}</small></span><span class="avail avail-${stock ? (stock <= 20 ? 'low' : 'in') : 'out'}"><span class="avail-dot"></span>${esc(stock ? t('product.inStock') : t('product.outOfStock'))}</span></span>
      </a></li>`;
    }).join('')}</ul>
    <button class="btn btn-outline btn-block" type="button" data-action="search-all" data-term="${esc(term)}">${esc(t('search.seeAll', { n: hits.length }))}</button>`;
    ROKN.localizeLinks(box);
  };

  /* ---------------- Quick view ---------------- */
  ROKN.qv = { id: null, color: null, qty: 1 };
  ui.quickView = function (id, color) {
    const p = q.product(id); if (!p) return;
    Object.assign(ROKN.qv, { id, color: color || q.defaultColor(p), qty: 1 });
    const cat = q.category(p.category);
    ui.drawer(false);
    ui.openModal(`
      <div class="qv">
        <div class="qv-img"><img src="${ROKN.img.drape(p, ROKN.qv.color)}" alt="${esc(L(p.name))}" width="900" height="1125" data-qv-img></div>
        <div class="qv-info">
          <p class="eyebrow">${esc(L(cat))}</p>
          <h2>${esc(L(p.name))}</h2>
          <p class="pdp-rating">${p.reviewCount ? `${C.Stars(p.rating)} <span>${p.rating.toFixed(1)}</span> <span class="muted">· ` : '<span class="muted">'}<span data-sku dir="ltr"></span></span></p>
          <div class="pdp-price">${C.Price(p, true, ROKN.qv.color)}</div>
          <p class="muted qv-desc">${esc(L(p.description))}</p>
          <div class="pdp-meta"><div><span class="muted">${esc(t('product.availability'))}</span> ${C.Availability(p, ROKN.qv.color)}</div></div>
          ${C.SwatchSelector(p, ROKN.qv.color, 'qv')}
          ${C.QuantitySelector(1, 'qv')}
          <div class="pdp-actions qv-actions">
            <button class="btn btn-primary btn-lg" type="button" data-action="qv-add" data-autofocus>${I('bag', 'ico-sm')} ${esc(t('product.addToCart'))}</button>
            <button class="btn btn-outline btn-lg" type="button" data-action="qv-buy">${esc(t('product.buyNow'))}</button>
          </div>
          <a class="btn btn-wa btn-block" data-wa-ask href="#" target="_blank" rel="noopener" data-keep-href>${I('chat', 'ico-sm')} ${esc(t('pdp.ask'))}</a>
          <a class="link-arrow" href="#product--${p.id}">${esc(t('product.viewDetails'))} ${I('arrow', 'ico-sm flip-rtl')}</a>
        </div>
      </div>`, 'modal-qv', `${t('product.quickView')}: ${L(p.name)}`);
    ROKN.pdpUpdate('qv');
  };

  /* ---------------- Fullscreen gallery ---------------- */
  ui.lightbox = function () {
    const st = ROKN.pdp, p = q.product(st.id);
    const g = ROKN.img.gallery(p, st.color);
    ui.openModal(`<figure class="lightbox" data-lightbox>
        <div class="lb-stage"><img src="${g[st.index].src}" alt="${esc(L(p.name))} — ${esc(ROKN.vname(g[st.index].view))}" data-lb-img></div>
        <button type="button" class="g-btn lb-prev" data-action="lb-step" data-dir="-1" aria-label="${esc(t('pdp.prevImg'))}">${I('chevronLeft', 'ico-sm flip-rtl')}</button>
        <button type="button" class="g-btn lb-next" data-action="lb-step" data-dir="1" aria-label="${esc(t('pdp.nextImg'))}">${I('chevron', 'ico-sm flip-rtl')}</button>
        <figcaption data-lb-cap>${esc(L(p.name))} · ${esc(L(q.color(st.color)))} · ${esc(ROKN.vname(g[st.index].view))} (${st.index + 1}/${g.length})</figcaption>
        <ul class="lb-thumbs" role="list">${g.map((im, i) => `<li><button type="button" class="${i === st.index ? 'on' : ''}" data-action="lb-go" data-index="${i}" aria-label="${esc(ROKN.vname(im.view))}"><img src="${im.src}" alt="" width="80" height="100" loading="lazy"></button></li>`).join('')}</ul>
      </figure>`, 'modal-lightbox', t('pdp.fullscreen'));
  };
  ui.lbShow = function (i) {
    const st = ROKN.pdp, p = q.product(st.id), g = ROKN.img.gallery(p, st.color);
    st.index = (i + g.length) % g.length;
    const im = $('[data-lb-img]'); if (!im) return;
    im.src = g[st.index].src; im.alt = `${L(p.name)} — ${ROKN.vname(g[st.index].view)}`;
    $('[data-lb-cap]').textContent = `${L(p.name)} · ${L(q.color(st.color))} · ${ROKN.vname(g[st.index].view)} (${st.index + 1}/${g.length})`;
    $$('.lb-thumbs button').forEach((b, k) => b.classList.toggle('on', k === st.index));
    ROKN.pdpUpdate();
  };

  /* ---------------- Hover zoom on product image ---------------- */
  ui.initZoom = function () {
    const z = $('[data-zoom]'); if (!z || !window.matchMedia('(hover: hover)').matches) return;
    const im = z.querySelector('img');
    z.addEventListener('mousemove', e => { const r = z.getBoundingClientRect(); im.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; z.classList.add('zooming'); });
    z.addEventListener('mouseleave', () => z.classList.remove('zooming'));
    z.addEventListener('click', () => ui.lightbox());
  };

  /* ---------------- Fabric calculator ---------------- */
  ui.calcUpdate = function () {
    $$('[data-calc-result]').forEach(box => {
      const qv = ROKN.calcEstimate(), g = t('calc.g.' + ROKN.calcState.garment);
      const onPdp = ROKN.state.route.name === 'product' && box.closest('.modal');
      box.innerHTML = `<p class="cr-label">${esc(t('calc.result'))}</p><p class="cr-val"><strong>${fmt.meters(qv)}</strong> ${esc(t('calc.resultUnit'))}</p>
        <p class="cr-note">${esc(t('calc.note'))}</p>
        <div class="btn-row">${onPdp ? `<button type="button" class="btn btn-primary btn-sm" data-action="calc-use" data-qty="${qv}">${esc(t('pdp.useLength', { q: fmt.meters(qv) }))}</button>` : ''}
        <a class="btn btn-wa btn-sm" href="${ROKN.waLink(t('calc.waMsg', { g, q: fmt.meters(qv) }))}" target="_blank" rel="noopener">${I('chat', 'ico-sm')} ${esc(t('calc.ask'))}</a></div>`;
    });
  };
  ui.calcRerender = function () {
    $$('[data-form="calc"]').forEach(f => { const scope = f.dataset.scope; const w = document.createElement('div'); w.innerHTML = C.FabricCalculator(scope); f.replaceWith(w.firstElementChild); });
    ui.calcUpdate();
  };

  /* ---------------- Exit intent (desktop, once per session) ---------------- */
  ui.exitIntent = function () {
    if (store.get('exit') || ['checkout', 'order'].includes(ROKN.state.route.name) || $('#overlay-root').firstElementChild) return;
    store.set('exit', '1');
    ui.openModal(`<div class="exit">
      <img src="assets/img/scenes/swatch-fan.webp" alt="" width="1400" height="900" class="exit-img">
      <div class="exit-copy"><h2>${esc(t('v2.exitTitle'))}</h2><p>${esc(t('v2.exitText'))}</p>
      <div class="btn-row"><a class="btn btn-wa" href="${ROKN.waLink(t('chat.msgs.help'))}" target="_blank" rel="noopener" data-autofocus>${I('chat', 'ico-sm')} ${esc(t('v2.exitWa'))}</a>
      <button class="btn btn-outline" type="button" data-action="modal-close">${esc(t('v2.exitStay'))}</button></div></div></div>`, 'modal-exit', t('v2.exitTitle'));
  };
  const armedAt = Date.now();
  document.addEventListener('mouseout', e => {
    if (e.relatedTarget || e.clientY > 8 || Date.now() - armedAt < 12000) return;
    if (!window.matchMedia('(hover: hover) and (min-width: 960px)').matches) return;
    ui.exitIntent();
  });

  /* ---------------- Validation helper ---------------- */
  const validate = (scope, rules = {}) => {
    let ok = true, first = null;
    $$('[required], [data-validate]', scope).forEach(el => {
      if (el.closest('[hidden]')) return;
      let msg = '';
      const v = (el.value || '').trim();
      if (el.required && !v) msg = t('checkout.required');
      else if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = t('checkout.invalidEmail');
      else if (v && el.type === 'tel' && rules.kwPhone && !/^(\+?965)?[2569]\d{7}$/.test(v.replace(/[\s-]/g, ''))) msg = t('checkout.invalidPhone');
      else if (v && el.minLength > 0 && v.length < el.minLength) msg = isAr() ? '٦ أحرف على الأقل' : `At least ${el.minLength} characters`;
      const field = el.closest('.field');
      let m = field && field.querySelector('.field-msg');
      if (field && !m) { m = document.createElement('p'); m.className = 'field-msg'; m.id = (el.id || 'f') + '-msg'; field.appendChild(m); el.setAttribute('aria-describedby', m.id); }
      if (m) m.textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (field) field.classList.toggle('has-error', !!msg);
      if (msg) { ok = false; first = first || el; }
    });
    if (first) first.focus();
    return ok;
  };
  const addedToCart = () => ui.drawer(true);

  /* ---------------- Click actions ---------------- */
  const actions = {
    lang(el) {
      const lang = el.dataset.lang; if (ROKN.state.lang === lang) return;
      const r = ROKN.state.route || { raw: 'home' };
      ui.keepScroll = true;
      location.hash = ROKN.router.href(r.raw, lang);
    },
    skip() { $('#main').focus(); },
    'menu-open'() { ui.menu(true); }, 'menu-close'() { ui.menu(false); },
    'search-open'() { ui.openSearch(); },
    'search-term'(el) { const i = $('[data-search-input]'); if (i) { i.value = el.dataset.term; ui.runSearch(el.dataset.term); i.focus(); } },
    'search-all'(el) { ROKN.state.pendingQuery = el.dataset.term; ROKN.state.shopKey = null; ui.closeModal(); ROKN.router.go('search'); },
    'search-go'(el) { ROKN.state.pendingColor = el.dataset.color; ui.closeModal(); ROKN.router.go('product--' + el.dataset.id); },
    'modal-close'() { ui.closeModal(); },
    'drawer-open'() { ui.drawer(true); }, 'drawer-close'() { ui.drawer(false); },
    'chat-toggle'() { ui.chat($('#wa-panel').hidden); }, 'chat-close'() { ui.chat(false); $('.wa-float').focus(); },
    wishlist(el) {
      const id = el.dataset.id, added = ROKN.wishlist.toggle(id);
      $$(`[data-action="wishlist"][data-id="${id}"]`).forEach(b => { b.classList.toggle('on', added); b.setAttribute('aria-pressed', added); });
      ui.toast(`${I('heart', 'ico-sm')}<span>${esc(added ? (isAr() ? 'أُضيف إلى المفضلة' : 'Saved to your wishlist') : (isAr() ? 'أُزيل من المفضلة' : 'Removed from your wishlist'))}</span><a href="#wishlist">${esc(t('icons.wishlist'))}</a>`);
      if (['wishlist', 'account'].includes(ROKN.state.route.name)) ui.rerender();
    },
    quickview(el) { ui.quickView(el.dataset.id, el.dataset.color); },
    quickadd(el) { const p = q.product(el.dataset.id), color = el.dataset.color || q.defaultColor(p); if (ROKN.cart.add(p.id, color, 1)) addedToCart(); },
    swatch(el) { const scope = el.dataset.scope, st = scope === 'qv' ? ROKN.qv : ROKN.pdp; st.color = el.dataset.color; ROKN.pdpUpdate(scope); ui.refreshChat(); },
    'qty-chip'(el) { const st = el.dataset.scope === 'qv' ? ROKN.qv : ROKN.pdp; st.qty = Number(el.dataset.qty); ROKN.pdpUpdate(el.dataset.scope); },
    'qty-step'(el) { const st = el.dataset.scope === 'qv' ? ROKN.qv : ROKN.pdp; st.qty = ROKN.cart.clampQty(st.qty + Number(el.dataset.dir) * ROKN.config.meterStep); ROKN.pdpUpdate(el.dataset.scope); },
    thumb(el) { ROKN.pdp.index = Number(el.dataset.index); ROKN.pdpUpdate(); },
    'g-step'(el) { const n = ROKN.img.gallery(q.product(ROKN.pdp.id), ROKN.pdp.color).length; ROKN.pdp.index = (ROKN.pdp.index + Number(el.dataset.dir) + n) % n; ROKN.pdpUpdate(); },
    lightbox() { ui.lightbox(); },
    'lb-step'(el) { ui.lbShow(ROKN.pdp.index + Number(el.dataset.dir)); }, 'lb-go'(el) { ui.lbShow(Number(el.dataset.index)); },
    'to-reviews'() { const r = $('#reviews'); if (r) { r.scrollIntoView({ behavior: 'smooth', block: 'start' }); r.setAttribute('tabindex', '-1'); r.focus({ preventScroll: true }); } },
    'add-to-cart'(el) {
      const st = ROKN.pdp, p = q.product(st.id);
      if (!ROKN.cart.add(p.id, st.color, st.qty)) return;
      if (el.dataset.buy === '1') { ROKN.co.step = 0; ROKN.router.go('checkout'); } else addedToCart();
    },
    'qv-add'() { const st = ROKN.qv; if (ROKN.cart.add(st.id, st.color, st.qty)) { ui.closeModal(); addedToCart(); } },
    'qv-buy'() { const st = ROKN.qv; if (ROKN.cart.add(st.id, st.color, st.qty)) { ui.closeModal(); ROKN.co.step = 0; ROKN.router.go('checkout'); } },
    'calc-open'() {
      const p = q.product(ROKN.pdp.id);
      ui.openModal(`<div class="calc-modal"><h2>${esc(t('calc.title'))}</h2><p class="muted">${esc(L(p.name))} · ${fmt.cm(p.widthCm)}</p>${C.FabricCalculator('modal', p.widthCm)}</div>`, 'modal-calc', t('calc.title'));
      ui.calcUpdate();
    },
    'calc-use'(el) { ROKN.pdp.qty = ROKN.cart.clampQty(Number(el.dataset.qty)); ui.closeModal(); ROKN.pdpUpdate(); },
    'review-form'(el) { const f = $('#review-form'); f.hidden = !f.hidden; el.setAttribute('aria-expanded', !f.hidden); if (!f.hidden) f.querySelector('textarea').focus(); },
    'filters-open'() { ui.filters(true); }, 'filters-close'() { ui.filters(false); },
    unfilter(el) {
      const f = ROKN.state.shop, k = el.dataset.key;
      if (k === 'inStock') f.inStock = false; else if (k === 'price') { f.minPrice = null; f.maxPrice = null; } else if (k === 'query') f.query = '';
      else f[k] = f[k].filter(x => x !== el.dataset.value);
      ui.syncFilterInputs(); ROKN.shop.refresh();
    },
    'clear-filters'() { const s = ROKN.state.shop.sort; ROKN.state.shop = Object.assign(ROKN.emptyFilters(), { sort: s }); ui.syncFilterInputs(); ROKN.shop.refresh(); },
    'color-family'(el) { ui.colorFamily(el.dataset.family); },
    'slide-go'(el) { ui.showSlide(Number(el.dataset.index)); ui.restartSlider(); },
    'slide-step'(el) { ui.showSlide(slideIdx + Number(el.dataset.dir)); ui.restartSlider(); },
    'slide-pause'(el) {
      slidePaused = !slidePaused;
      if (slidePaused) { clearInterval(slideTimer); slideTimer = null; } else ui.startSlider();
      el.innerHTML = I(slidePaused ? 'play' : 'pause', 'ico-sm'); el.setAttribute('aria-label', t(slidePaused ? 'slider.play' : 'slider.pause'));
    },
    'cart-step'(el) { const i = Number(el.dataset.index); ROKN.cart.setQty(i, ROKN.state.cart[i].qty + Number(el.dataset.dir) * ROKN.config.meterStep); if (ROKN.state.route.name === 'cart') ui.rerender(); },
    'cart-remove'(el) { ROKN.cart.remove(Number(el.dataset.index)); if (ROKN.state.route.name === 'cart') ui.rerender(); },
    'cart-wish'(el) { const i = Number(el.dataset.index), id = ROKN.state.cart[i].id; if (!ROKN.wishlist.has(id)) ROKN.wishlist.toggle(id); ROKN.cart.remove(i); ui.rerender(); },
    'coupon-remove'() { ROKN.cart.removeCoupon(); ui.rerender(); },
    'wl-all'() { ROKN.state.wishlist.forEach(id => { const p = q.product(id); p && ROKN.cart.add(id, q.defaultColor(p), 1); }); ui.drawer(true); },
    'acc-tab'(el) { ROKN.state.accTab = el.dataset.tab; ui.rerender(); },
    'acc-sec'(el) { ROKN.state.accSec = el.dataset.sec; ui.rerender(); },
    'sign-out'() { ROKN.state.user = null; ROKN.storage.set('user', null); ROKN.state.accSec = 'orders'; ui.rerender(); },
    'co-next'() {
      const form = $('form[data-form="checkout"]'), stepEl = $(`[data-step="${ROKN.co.step}"]`, form);
      $$('input, select, textarea', form).forEach(el => { if (el.name && !['ship', 'pay'].includes(el.name)) ROKN.co.values[el.name] = el.value; });
      const ok = validate(stepEl, { kwPhone: true }); $('[data-form-error]').hidden = ok;
      if (!ok) return;
      ROKN.co.step = Math.min(3, ROKN.co.step + 1); ui.rerender(); $('.checkout-head').scrollIntoView({ block: 'start' });
    },
    'co-back'() { ROKN.co.step = Math.max(0, ROKN.co.step - 1); ui.rerender(); },
    'co-goto'(el) { ROKN.co.step = Number(el.dataset.step); ui.rerender(); },
    copy(el) {
      const txt = el.dataset.copy;
      const done = () => { el.lastChild.textContent = ' ' + t('contact.copied'); setTimeout(() => { el.lastChild.textContent = ' ' + t('contact.copy'); }, 1600); };
      try { navigator.clipboard.writeText(txt).then(done, () => selectText($('#store-phone'))); } catch (e) { selectText($('#store-phone')); }
    }
  };
  const selectText = node => { const r = document.createRange(); r.selectNodeContents(node); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };

  ui.syncFilterInputs = function () {
    const f = ROKN.state.shop;
    $$('[data-filter]').forEach(cb => cb.checked = f[cb.dataset.filter].includes(cb.value));
    $$('[data-filter-bool]').forEach(cb => cb.checked = !!f[cb.dataset.filterBool]);
    const mn = $('#f-min'), mx = $('#f-max'); if (mn) mn.value = f.minPrice ?? mn.min; if (mx) mx.value = f.maxPrice ?? mx.max;
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el && actions[el.dataset.action]) {
      if (el.tagName === 'A') e.preventDefault();
      actions[el.dataset.action](el, e);
      return;
    }
    if (!e.target.closest('#wa-widget') && $('#wa-widget.open')) ui.chat(false);
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); ROKN.router.render(); }
  });

  /* ---------------- Input / change ---------------- */
  let searchTimer;
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.matches('[data-search-input]')) { clearTimeout(searchTimer); searchTimer = setTimeout(() => ui.runSearch(el.value), 120); }
    if (el.matches('[data-filter-range]')) {
      const f = ROKN.state.shop, mn = $('#f-min'), mx = $('#f-max');
      let a = Number(mn.value), b = Number(mx.value);
      if (a > b) { if (el === mn) { a = b; mn.value = a; } else { b = a; mx.value = b; } }
      f.minPrice = a <= Number(mn.min) ? null : a; f.maxPrice = b >= Number(mx.max) ? null : b;
      ROKN.shop.refresh();
    }
    if (el.matches('[data-calc]') && el.type === 'number') { ROKN.calcState[el.dataset.calc] = Number(el.value) || 0; ui.calcUpdate(); }
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.matches('[data-filter]')) {
      const arr = ROKN.state.shop[el.dataset.filter];
      if (el.checked) { if (!arr.includes(el.value)) arr.push(el.value); } else arr.splice(arr.indexOf(el.value), 1);
      ROKN.shop.refresh();
    }
    if (el.matches('[data-filter-bool]')) { ROKN.state.shop[el.dataset.filterBool] = el.checked; ROKN.shop.refresh(); }
    if (el.matches('[data-sort]')) { ROKN.state.shop.sort = el.value; ROKN.shop.refresh(); }
    if (el.matches('[data-qty-input]')) { const sc = el.dataset.qtyInput, st = sc === 'qv' ? ROKN.qv : ROKN.pdp; st.qty = ROKN.cart.clampQty(el.value); el.value = st.qty; ROKN.pdpUpdate(sc); }
    if (el.matches('[data-cart-qty]')) { ROKN.cart.setQty(Number(el.dataset.cartQty), el.value); if (ROKN.state.route.name === 'cart') ui.rerender(); }
    if (el.matches('[data-co]')) { ROKN.co[el.dataset.co] = el.value; if (el.dataset.co === 'ship') ROKN.coTotals(); }
    if (el.form && el.form.dataset.form === 'checkout' && el.name && !['ship', 'pay'].includes(el.name)) ROKN.co.values[el.name] = el.value;
    if (el.matches('[data-calc]') && el.tagName === 'SELECT') {
      ROKN.calcState[el.dataset.calc] = el.dataset.calc === 'width' ? Number(el.value) : el.value;
      if (el.dataset.calc === 'garment') ui.calcRerender(); else ui.calcUpdate();
    }
    if (el.matches('[data-langpref]')) actions.lang({ dataset: { lang: el.value } });
  });

  /* ---------------- Forms ---------------- */
  document.addEventListener('submit', async e => {
    const form = e.target, kind = form.dataset.form;
    if (!kind) return;
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (kind === 'calc') return;
    if (kind === 'coupon') {
      const input = $('#coupon-input', form); const r = ROKN.cart.applyCoupon(input && input.value);
      if (r.ok) ui.rerender(); else $('#coupon-msg').textContent = r.msg;
    }
    if (kind === 'contact') {
      if (!validate(form)) return;
      const msg = `${data.message}\n\n— ${data.name} (${data.phone}${data.email ? ', ' + data.email : ''})`;
      const ok = $('.form-ok', form); ok.hidden = false; const a = $('[data-wa-msg]', form); a.href = ROKN.waLink(msg); a.setAttribute('data-keep-href', ''); a.focus();
    }
    if (kind === 'review') { if (!validate(form)) return; $('.form-ok', form).hidden = false; form.querySelector('textarea').value = ''; }
    if (kind === 'newsletter') {
      if (!validate(form)) return;
      const list = ROKN.storage.get('newsletter', []); if (!list.includes(data.email)) list.push(data.email); ROKN.storage.set('newsletter', list);
      /* PRODUCTION: POST data.email to your email service (double opt-in recommended) */
      const ok = $('.form-ok', form); ok.hidden = false;
      ok.textContent = t('v2.nlOk') + (ROKN.config.newsletterConnected ? '' : ' ' + t('v2.nlPreview'));
      form.reset();
    }
    if (kind === 'auth') {
      if (!validate(form)) return;
      const existing = ROKN.storage.get('user-profile', null);
      ROKN.state.user = form.dataset.mode === 'register' ? { fullName: data.fullName, phone: data.phone, email: data.email, addresses: [] } : (existing && existing.email === data.email ? existing : { email: data.email, addresses: [] });
      ROKN.storage.set('user', ROKN.state.user); ROKN.storage.set('user-profile', ROKN.state.user);
      ui.rerender();
    }
    if (kind === 'address') {
      if (!validate(form)) return;
      ROKN.state.user.addresses = [data]; ROKN.storage.set('user', ROKN.state.user); ROKN.storage.set('user-profile', ROKN.state.user);
      ui.rerender(); const ok = $('form[data-form="address"] .form-ok'); if (ok) ok.hidden = false;
    }
    if (kind === 'track') {
      if (!validate(form)) return;
      const digits = s => String(s).replace(/\D/g, '').slice(-8);
      const c = data.contact.trim().toLowerCase();
      const o = ROKN.state.orders.find(x => x.number === data.number.trim().toUpperCase() && ((x.email && x.email.toLowerCase() === c) || (digits(c).length === 8 && digits(x.phone) === digits(c))));
      $('[data-track-result]').innerHTML = o ? ROKN.trackHtml(o) : `<p class="form-error">${esc(t('track.notFound'))}</p>`;
    }
    if (kind === 'checkout') {
      if (ROKN.co.step < 3) { actions['co-next'](); return; }
      const v = ROKN.co.values;
      const tot = ROKN.cart.totals(ROKN.co.ship);
      const address = ROKN.coAddress(v);
      const order = {
        number: ROKN.uid(), date: new Date().toISOString(), phone: v.phone, name: v.fullName, email: v.email, address,
        ship: tot.ship, sub: tot.sub, disc: tot.disc, total: tot.total, shipMethod: ROKN.co.ship, payment: ROKN.co.pay, coupon: ROKN.state.coupon || null,
        lines: ROKN.state.cart.map(l => ({ ...l, price: q.price(q.product(l.id), l.color) }))
      };
      /* With the API server (config.apiBase) the order is priced, stock-checked and saved server-side.
         PRODUCTION next step: redirect to the payment gateway (KNET / card) for online payments. */
      if (ROKN.config.apiBase) {
        const btn = form.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
        try {
          const res = await fetch(ROKN.config.apiBase + '/public/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: order.name, phone: order.phone, email: order.email, address: order.address, shipMethod: order.shipMethod, payment: order.payment, coupon: order.coupon, lines: order.lines.map(l => ({ id: l.id, color: l.color, qty: l.qty })) }) });
          const body = await res.json();
          if (!res.ok || body.error) throw new Error((body.error && body.error.message) || res.statusText);
          order.number = body.result.number; order.total = body.result.total;
        } catch (err) { if (btn) btn.disabled = false; ui.toast(esc(err.message)); return; }
      }
      ROKN.state.orders.unshift(order); ROKN.storage.set('orders', ROKN.state.orders);
      /* Reserve the metres immediately: live stock on this device + admin snapshot (the admin ingests the order on next open) */
      order.lines.forEach(l => { const p = q.product(l.id); const v = p && p.variants.find(x => x.color === l.color); if (v) v.stock = Math.max(0, +(v.stock - l.qty).toFixed(3)); });
      try { const pub = JSON.parse(localStorage.getItem('rokn:pub') || 'null'); if (pub) { order.lines.forEach(l => { const pr = pub.products.find(x => x.id === l.id); const v = pr && pr.variants.find(x => x.color === l.color); if (v) v.stock_m = Math.max(0, +(v.stock_m - l.qty).toFixed(3)); }); localStorage.setItem('rokn:pub', JSON.stringify(pub)); } } catch (e) { /* storage unavailable */ }
      if (ROKN.state.user) { Object.assign(ROKN.state.user, { phone: ROKN.state.user.phone || v.phone, fullName: ROKN.state.user.fullName || v.fullName, addresses: [{ city: v.city, area: v.area, block: v.block, street: v.street, avenue: v.avenue, building: v.building, floor: v.floor, apartment: v.apartment }] }); ROKN.storage.set('user', ROKN.state.user); }
      ROKN.cart.clear(); ROKN.co = { step: 0, ship: 'standard', pay: ROKN.co.pay, values: {} };
      ROKN.router.go('order--' + order.number);
    }
  });

  /* ---------------- Keyboard ---------------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { ui.closeModal(); ui.menu(false); ui.filters(false); ui.drawer(false); ui.chat(false); }
    if ($('[data-lightbox]') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const fwd = (e.key === 'ArrowRight') !== isAr(); ui.lbShow(ROKN.pdp.index + (fwd ? 1 : -1));
    }
    if (e.key === 'Tab') {
      const scope = $('#overlay-root .modal-panel') || $('#mobile-menu.open') || $('#cart-drawer.open');
      if (!scope) return;
      const f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', scope).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('img-missing'); }, true);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { document.body.classList.toggle('scrolled', window.scrollY > 40); ticking = false; });
  }, { passive: true });

  /* ---------------- Boot ---------------- */
  ROKN.bus.on('cart', ui.updateCounts);
  ROKN.bus.on('wishlist', ui.updateCounts);
  window.addEventListener('hashchange', () => ROKN.router.render());
  window.addEventListener('resize', () => { if (window.innerWidth >= 960) document.body.classList.remove('filters-open'); });
  new MutationObserver(muts => { for (const m of muts) m.addedNodes.forEach(n => { if (n.nodeType === 1) ROKN.localizeLinks(n.parentNode || n); }); })
    .observe(document.getElementById('main'), { childList: true, subtree: true });
  const first = ROKN.router.parse(location.hash);
  if (first.lang) { ROKN.state.lang = first.lang; ROKN.storage.set('lang', first.lang); }
  ui.renderShell();
  ROKN.router.render();
})();
