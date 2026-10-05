/* ==========================================================================
   COMPONENTS — reusable UI building blocks (return HTML strings)
   Header · Footer · HeroSlider · TrustBar · CategoryCard · ColorExplorer ·
   CollectionCard · ProductCard · ProductGallery · SwatchSelector ·
   QuantitySelector · ProductFilters · Review · CartDrawer · WhatsAppChat ·
   BottomNav · FabricCalculator · Newsletter · LanguageSwitcher · Breadcrumbs
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const { t, L, esc, fmt, q } = ROKN;

  /* ---------------- Icons (inline, 24px, 1.5 stroke) ---------------- */
  const P = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.4-3.6 4.3-5.4 7.5-5.4s6.1 1.8 7.5 5.4"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
    bag: '<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    phone: '<path d="M6.6 3.8 9 3.5l1.6 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.6-.3 2.4a2 2 0 0 1-2 1.7A15.6 15.6 0 0 1 4.9 5.8a2 2 0 0 1 1.7-2z"/>',
    chat: '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.6 18.7z"/><path d="M9.2 9.3c.3 2.4 2.6 4.8 5.3 5.4l1.2-1.3-1.6-.9-.8.7c-1-.4-1.9-1.3-2.4-2.3l.7-.8-.8-1.6z" fill="currentColor" stroke="none"/>',
    star: '<path d="m12 3.6 2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.5l-5.1 2.8L8 13.6l-4.3-4 5.8-.7z"/>',
    check: '<path d="m5 12.5 4.3 4.3L19 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>', chevronDown: '<path d="m6 9 6 6 6-6"/>', chevronLeft: '<path d="m15 6-6 6 6 6"/>',
    arrow: '<path d="M4 12h15M14 7l5 5-5 5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="1"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
    zoom: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2M11 8.5v5M8.5 11h5"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    quality: '<path d="M12 3.5 14 8l4.8.4-3.6 3.2 1.1 4.7L12 13.8l-4.3 2.5 1.1-4.7L5.2 8.4 10 8z"/><path d="M8 19.5h8"/>',
    roll: '<ellipse cx="7" cy="12" rx="3" ry="7"/><path d="M7 5h11.5v14H7"/><ellipse cx="7" cy="12" rx="1" ry="2.4"/><path d="M18.5 19l-2 2.5h-9"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5c0 1.5 1.3 2.5 2.7 2.5S9.3 11 9.3 9.5c0 1.5 1.3 2.5 2.7 2.5s2.7-1 2.7-2.5c0 1.5 1.2 2.5 2.6 2.5S20 11 20 9.5"/><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20"/>',
    support: '<path d="M4.5 13v-1.5a7.5 7.5 0 0 1 15 0V13"/><rect x="3.5" y="12.5" width="3.5" height="5.5" rx="1"/><rect x="17" y="12.5" width="3.5" height="5.5" rx="1"/><path d="M19 18c0 1.7-2 2.5-5 2.5"/>',
    scissors: '<circle cx="6" cy="17" r="2.5"/><circle cx="6" cy="7" r="2.5"/><path d="M8 8.5 20 17M8 15.5 20 7"/>',
    truck: '<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17.5" cy="17.5" r="1.7"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="1"/><path d="M5 15V4h10"/>',
    swatch: '<rect x="4" y="4" width="7" height="16" rx="1"/><path d="M11 7.5 16 5l3 14-8 1.5M8 16.5h.01"/>',
    ruler: '<path d="M3.5 16.5 16.5 3.5l4 4-13 13z"/><path d="m7 13 1.5 1.5M9.5 10.5 11 12M12 8l1.5 1.5M14.5 5.5 16 7"/>',
    hand: '<path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V5a1.5 1.5 0 0 1 3 0v5M13 10V6a1.5 1.5 0 0 1 3 0v6.5c0 4-2.5 7-6 7-2.4 0-4-1.3-5.2-3.4L3.5 13a1.4 1.4 0 0 1 2.4-1.4L7 13.4"/>',
    variety: '<rect x="3.5" y="5" width="5" height="14"/><rect x="9.5" y="5" width="5" height="14"/><rect x="15.5" y="5" width="5" height="14"/>',
    smile: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14c.8 1.3 2 2 3.5 2s2.7-.7 3.5-2M9 9.5h.01M15 9.5h.01"/>',
    camera: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.6 7.4h.01"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5z"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1"/><path d="m4 6.5 8 6.5 8-6.5"/>',
    pause: '<path d="M9 6v12M15 6v12"/>', play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    calc: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M8 7.5h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01"/>'
  };
  ROKN.icon = (name, cls = '', fillStar) =>
    `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="${fillStar ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${P[name] || ''}</svg>`;
  const I = ROKN.icon;

  /* WhatsApp deep link — Kuwait international format 965XXXXXXXX */
  const wa = (text) => `https://wa.me/${ROKN.config.whatsapp}?text=${encodeURIComponent(text || t('chat.msgs.help'))}`;
  ROKN.waLink = wa;
  ROKN.pageUrl = token => `${ROKN.config.siteUrl}/${ROKN.router.href(token)}`;
  const isAr = () => ROKN.state.lang === 'ar';

  const C = ROKN.components = {};

  /* ---------------- Logo ---------------- */
  C.Logo = (cls = '') => `
    <a class="logo ${cls}" href="#home" aria-label="${esc(L(ROKN.config.name))} — ${esc(t('nav.home'))}">
      <svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="1.6">
          <rect x="11" y="11" width="26" height="26"/>
          <rect x="11" y="11" width="26" height="26" transform="rotate(45 24 24)"/>
          <path d="M19 31V22a5 5 0 0 1 10 0v9" />
        </g>
      </svg>
      <span class="logo-words">
        <span class="logo-en">ROKN OM ALQURA</span>
        <span class="logo-ar" lang="ar">ركن أم القرى</span>
      </span>
    </a>`;

  /* ---------------- LanguageSwitcher ---------------- */
  C.LanguageSwitcher = (cls = '') => {
    const ar = isAr();
    const first = ar ? ['ar', 'العربية'] : ['en', 'EN'], second = ar ? ['en', 'English'] : ['ar', 'AR'];
    const btn = ([code, label]) => `<button type="button" data-action="lang" data-lang="${code}" lang="${code}" aria-pressed="${ROKN.state.lang === code}" aria-label="${code === 'ar' ? 'العربية' : 'English'}">${label}</button>`;
    return `<div class="lang-switch ${cls}" role="group" aria-label="Language / اللغة">${btn(first)}<span aria-hidden="true">|</span>${btn(second)}</div>`;
  };

  /* ---------------- Header ---------------- */
  C.Header = () => {
    const cats = ROKN.catalog.categories;
    const count = ROKN.cart.count(), wcount = ROKN.state.wishlist.length;
    return `
    <div class="announce">
      <div class="wrap announce-in">
        <p>${esc(ROKN.config.announcement ? L(ROKN.config.announcement) : t('announce'))} <span class="sep" aria-hidden="true">|</span> ${esc(t('callUs'))} <a href="tel:${ROKN.config.phoneE164}" dir="ltr">${ROKN.config.phone}</a></p>
        ${C.LanguageSwitcher('on-dark hide-sm')}
      </div>
    </div>
    <header class="site-header" id="site-header">
      <div class="wrap header-in">
        <button class="icon-btn menu-btn" type="button" data-action="menu-open" aria-label="${esc(t('icons.menu'))}" aria-controls="mobile-menu" aria-expanded="false">${I('menu')}</button>
        ${C.Logo()}
        <nav class="main-nav" aria-label="Main">
          <ul>
            <li><a href="#home" data-nav="home">${esc(t('nav.home'))}</a></li>
            <li class="has-mega">
              <a href="#shop" data-nav="shop">${esc(t('nav.shop'))} ${I('chevronDown', 'ico-xs')}</a>
              <div class="mega" role="region" aria-label="${esc(t('nav.categories'))}">
                <div class="mega-in">
                  <div><p class="mega-h">${esc(t('v2.fabricEyebrow'))}</p>
                  <ul class="mega-list">${cats.map(c => `<li><a href="#shop--${c.id}">${esc(L(c))}</a></li>`).join('')}</ul></div>
                  <div><p class="mega-h">${esc(t('v2.colorEyebrow'))}</p>
                  <ul class="mega-colors">${ROKN.catalog.colorFamilies.map(f => `<li><a href="#color--${f.id}"><span class="mc-chip" style="background-image:url(assets/img/swatches/${f.id}.webp)"></span>${esc(L(f))}</a></li>`).join('')}</ul></div>
                  <a class="mega-feature" href="#collections">
                    <img src="assets/img/scenes/swatch-fan.webp" alt="" loading="lazy" width="280" height="180">
                    <span>${esc(t('nav.collections'))} ${I('arrow', 'ico-sm flip-rtl')}</span>
                  </a>
                </div>
              </div>
            </li>
            <li><a href="#collections" data-nav="collections">${esc(t('nav.collections'))}</a></li>
            <li><a href="#about" data-nav="about">${esc(t('nav.about'))}</a></li>
            <li><a href="#contact" data-nav="contact">${esc(t('nav.contact'))}</a></li>
          </ul>
        </nav>
        <div class="header-tools">
          <button class="icon-btn" type="button" data-action="search-open" aria-label="${esc(t('icons.search'))}">${I('search')}</button>
          <a class="icon-btn hide-sm" href="#account" aria-label="${esc(t('icons.account'))}">${I('user')}</a>
          <a class="icon-btn hide-sm" href="#wishlist" aria-label="${esc(t('icons.wishlist'))} (${wcount})">${I('heart')}<span class="count" data-count="wishlist" ${wcount ? '' : 'hidden'}>${wcount}</span></a>
          <button class="icon-btn" type="button" data-action="drawer-open" aria-label="${esc(t('icons.cart'))} (${count})" aria-controls="cart-drawer">${I('bag')}<span class="count" data-count="cart" ${count ? '' : 'hidden'}>${count}</span></button>
          ${C.LanguageSwitcher('header-lang show-md')}
        </div>
      </div>
    </header>
    <div class="drawer-backdrop" data-action="menu-close" hidden></div>
    <aside class="mobile-menu" id="mobile-menu" aria-label="${esc(t('icons.menu'))}" aria-hidden="true" inert>
      <div class="mm-head">
        ${C.Logo('logo-sm')}
        <button class="icon-btn" type="button" data-action="menu-close" aria-label="${esc(t('icons.close'))}">${I('close')}</button>
      </div>
      <button class="mm-search" type="button" data-action="search-open">${I('search')} <span>${esc(t('search.placeholder'))}</span></button>
      <nav aria-label="Mobile">
        <ul class="mm-nav">
          <li><a href="#home">${esc(t('nav.home'))}</a></li>
          <li><a href="#shop">${esc(t('nav.shop'))}</a></li>
          <li><a href="#categories">${esc(t('nav.categories'))}</a></li>
          <li><a href="#collections">${esc(t('nav.collections'))}</a></li>
          <li><a href="#calculator">${esc(t('v2.calcCta'))}</a></li>
          <li><a href="#about">${esc(t('nav.about'))}</a></li>
          <li><a href="#contact">${esc(t('nav.contact'))}</a></li>
        </ul>
        <ul class="mm-sub">
          <li><a href="#account">${I('user')} ${esc(t('icons.account'))}</a></li>
          <li><a href="#wishlist">${I('heart')} ${esc(t('icons.wishlist'))}</a></li>
          <li><a href="#track">${I('truck')} ${esc(t('footer.tracking'))}</a></li>
        </ul>
      </nav>
      ${C.LanguageSwitcher('mm-lang')}
      <div class="mm-contact">
        <a href="tel:${ROKN.config.phoneE164}" dir="ltr">${I('phone')} ${ROKN.config.phone}</a>
        <a href="${wa()}" target="_blank" rel="noopener">${I('chat')} ${esc(t('wa.cta'))}</a>
      </div>
    </aside>`;
  };

  C.SaduBand = (cls = '') => `<div class="sadu-band ${cls}" role="presentation"></div>`;

  /* ---------------- Footer ---------------- */
  C.Footer = () => {
    const cfg = ROKN.config;
    return `
    ${C.SaduBand()}
    <footer class="site-footer">
      <div class="wrap footer-grid">
        <div class="f-brand">
          ${C.Logo('logo-footer')}
          <p>${esc(t('footer.blurb'))}</p>
          <p class="f-tag">${esc(t('tagline2'))}</p>
          <a class="btn btn-wa btn-sm" href="${wa()}" target="_blank" rel="noopener">${I('chat', 'ico-sm')} ${esc(t('wa.cta'))}</a>
        </div>
        <nav class="f-col" aria-label="${esc(t('footer.shop'))}">
          <h2>${esc(t('footer.shop'))}</h2>
          <ul>
            <li><a href="#shop">${esc(t('footer.allFabrics'))}</a></li>
            <li><a href="#collections">${esc(t('footer.collections'))}</a></li>
            <li><a href="#categories">${esc(t('nav.categories'))}</a></li>
            <li><a href="#bestsellers">${esc(t('footer.best'))}</a></li>
            <li><a href="#new">${esc(t('footer.newArr'))}</a></li>
            <li><a href="#calculator">${esc(t('v2.calcCta'))}</a></li>
          </ul>
        </nav>
        <nav class="f-col" aria-label="${esc(t('footer.service'))}">
          <h2>${esc(t('footer.service'))}</h2>
          <ul>
            <li><a href="#contact">${esc(t('footer.contactUs'))}</a></li>
            <li><a href="#faq">${esc(t('footer.faq'))}</a></li>
            <li><a href="#shipping">${esc(t('footer.shipping'))}</a></li>
            <li><a href="#returns">${esc(t('footer.returns'))}</a></li>
            <li><a href="#track">${esc(t('footer.tracking'))}</a></li>
          </ul>
        </nav>
        <nav class="f-col" aria-label="${esc(t('footer2.company'))}">
          <h2>${esc(t('footer2.company'))}</h2>
          <ul>
            <li><a href="#about">${esc(t('nav.about'))}</a></li>
            <li><a href="#account">${esc(t('icons.account'))}</a></li>
            <li><a href="#privacy">${esc(t('footer.privacy'))}</a></li>
            <li><a href="#terms">${esc(t('footer.terms'))}</a></li>
          </ul>
        </nav>
        <div class="f-col">
          <h2>${esc(t('footer.contact'))}</h2>
          <ul class="f-contact">
            <li>${I('phone', 'ico-sm')} <a href="tel:${cfg.phoneE164}" dir="ltr">${cfg.phone}</a></li>
            <li>${I('chat', 'ico-sm')} <a href="${wa()}" target="_blank" rel="noopener">WhatsApp <span dir="ltr">${cfg.phone}</span></a></li>
            <li>${I('pin', 'ico-sm')} <span>${esc(L(cfg.address))}</span></li>
          </ul>
          <h2 class="f-h-sm">${esc(t('footer2.follow'))}</h2>
          <ul class="social" aria-label="${esc(t('footer2.follow'))}">
            <li><a href="${cfg.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I('camera', 'ico-sm')}<span>Instagram</span></a></li>
            <li><a href="${cfg.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook"><span class="soc-letter" aria-hidden="true">f</span><span>Facebook</span></a></li>
            <li><a href="${cfg.social.tiktok}" target="_blank" rel="noopener" aria-label="TikTok"><span class="soc-letter" aria-hidden="true">♪</span><span>TikTok</span></a></li>
            <li><a href="${wa()}" target="_blank" rel="noopener" aria-label="WhatsApp">${I('chat', 'ico-sm')}<span>WhatsApp</span></a></li>
          </ul>
          <h2 class="f-h-sm">${esc(t('footer2.language'))}</h2>
          ${C.LanguageSwitcher('f-lang')}
        </div>
      </div>
      <div class="wrap f-pay">
        <span>${esc(t('footer.pay'))}</span>
        <ul>${['KNET', 'VISA', 'Mastercard', t('checkout.pay.cod')].map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </div>
      <div class="wrap f-bottom">
        <p>${esc(t('footer.rights'))}</p>
        <ul><li><a href="#privacy">${esc(t('footer.privacy'))}</a></li><li><a href="#terms">${esc(t('footer.terms'))}</a></li><li><a href="#admin" rel="nofollow" class="f-staff">${ROKN.state.lang === 'ar' ? 'دخول الموظفين' : 'Staff login'}</a></li></ul>
      </div>
      ${cfg.sampleCatalogue ? `<p class="wrap f-sample">${esc(t('footer.sample'))}</p>` : ''}
    </footer>`;
  };

  /* ---------------- WhatsApp chat widget ---------------- */
  C.WhatsAppChat = () => `
    <div class="wa-widget" id="wa-widget">
      <div class="wa-panel" id="wa-panel" role="dialog" aria-modal="false" aria-labelledby="wa-title" hidden>
        <div class="wa-head">
          <span class="wa-avatar">${I('chat')}</span>
          <div><p class="wa-title" id="wa-title">${esc(t('chat.title'))}</p><p class="wa-status"><span class="wa-dot"></span>${esc(t('chat.status'))}</p></div>
          <button class="icon-btn" type="button" data-action="chat-close" aria-label="${esc(t('chat.close'))}">${I('close')}</button>
        </div>
        <div class="wa-body">
          <p class="wa-bubble">${esc(t('chat.hello'))}</p>
          <ul class="wa-opts" data-wa-opts></ul>
        </div>
        <p class="wa-foot" dir="ltr">${ROKN.config.phone}</p>
      </div>
      <button class="wa-float" type="button" data-action="chat-toggle" aria-expanded="false" aria-controls="wa-panel" aria-label="${esc(t('wa.cta'))}">
        ${I('chat')}<span class="wa-label">${esc(t('wa.cta'))}</span>
      </button>
    </div>`;
  C.chatOptions = () => {
    const route = ROKN.state.route || {};
    const opts = [];
    if (route.name === 'product' && ROKN.pdp.id) {
      const p = q.product(ROKN.pdp.id), c = L(q.color(ROKN.pdp.color));
      opts.push(['product', t('chat.opts.product'), t('chat.msgs.productColor', { p: L(p.name), c })]);
    }
    opts.push(['help', t('chat.opts.help'), t('chat.msgs.help')]);
    opts.push(['swatch', t('chat.opts.swatch'), t('chat.msgs.swatch')]);
    opts.push(['order', t('chat.opts.order'), t('chat.msgs.order')]);
    opts.push(['visit', t('chat.opts.visit'), t('chat.msgs.visit')]);
    return opts.map(([k, label, msg]) => `<li><a href="${wa(msg)}" target="_blank" rel="noopener" class="wa-opt">${esc(label)} ${I('arrow', 'ico-xs flip-rtl')}</a></li>`).join('');
  };

  /* ---------------- Mobile bottom navigation ---------------- */
  C.BottomNav = () => {
    const c = ROKN.cart.count(), w = ROKN.state.wishlist.length;
    return `<nav class="bottom-nav" aria-label="${esc(t('icons.menu'))}">
      <a href="#home" data-bn="home">${I('home')}<span>${esc(t('nav2.home'))}</span></a>
      <a href="#shop" data-bn="shop">${I('grid')}<span>${esc(t('nav2.shop'))}</span></a>
      <button type="button" data-action="search-open">${I('search')}<span>${esc(t('nav2.search'))}</span></button>
      <a href="#wishlist" data-bn="wishlist">${I('heart')}<span>${esc(t('nav2.wishlist'))}</span><span class="count" data-count="wishlist" ${w ? '' : 'hidden'}>${w}</span></a>
      <button type="button" data-action="drawer-open" data-bn="cart">${I('bag')}<span>${esc(t('nav2.cart'))}</span><span class="count" data-count="cart" ${c ? '' : 'hidden'}>${c}</span></button>
    </nav>`;
  };

  /* ---------------- Cart drawer ---------------- */
  C.CartDrawer = () => {
    const lines = ROKN.cart.lines(), tot = ROKN.cart.totals();
    const free = ROKN.config.shipping.freeThreshold;
    const bar = free ? (() => {
      const left = Math.max(0, free - (tot.sub - tot.disc)), pct = Math.min(100, ((tot.sub - tot.disc) / free) * 100);
      return `<div class="free-bar"><p>${left > 0 ? esc(t('drawer.freeLeft', { n: left.toFixed(3) })) : `${I('check', 'ico-sm')} ${esc(t('drawer.freeOk'))}`}</p><span class="bar"><span style="width:${pct}%"></span></span></div>`;
    })() : '';
    return `
      <div class="cd-head"><h2 id="cd-title">${esc(t('drawer.title'))} <span class="muted">(${lines.length})</span></h2>
        <button class="icon-btn" type="button" data-action="drawer-close" aria-label="${esc(t('icons.close'))}">${I('close')}</button></div>
      ${bar}
      ${lines.length ? `<ul class="cd-lines" role="list">${lines.map(l => `
        <li class="cd-line">
          <a href="#product--${l.p.id}" class="cd-img" tabindex="-1" aria-hidden="true"><img src="${ROKN.img.drape(l.p, l.color, true)}" alt="" width="80" height="100" loading="lazy"></a>
          <div class="cd-info">
            <a class="cd-name" href="#product--${l.p.id}">${esc(L(l.p.name))}</a>
            <p class="muted"><span class="dot" style="--c:${q.color(l.color).hex}"></span> ${esc(L(q.color(l.color)))} · ${fmt.money(l.unit)} ${esc(t('product.perMeter'))}</p>
            <div class="cd-row">
              <div class="stepper stepper-sm">
                <button type="button" data-action="cart-step" data-index="${l.index}" data-dir="-1" aria-label="−">${I('minus')}</button>
                <input type="number" inputmode="decimal" step="${ROKN.config.meterStep}" min="${ROKN.config.minMeters}" value="${l.qty}" data-cart-qty="${l.index}" aria-label="${esc(t('cart.qty'))}: ${esc(L(l.p.name))}">
                <span class="stepper-unit">${esc(t('product.meters'))}</span>
                <button type="button" data-action="cart-step" data-index="${l.index}" data-dir="1" aria-label="+">${I('plus')}</button>
              </div>
              <strong class="cd-total">${fmt.money(l.total)}</strong>
            </div>
            <button class="text-btn" type="button" data-action="cart-remove" data-index="${l.index}">${I('trash', 'ico-xs')} ${esc(t('cart.remove'))}</button>
          </div>
        </li>`).join('')}</ul>
        <div class="cd-foot">
          <div class="cd-sub"><span>${esc(t('drawer.subtotal'))}</span><strong>${fmt.money(tot.sub)}</strong></div>
          <p class="muted cd-note">${esc(t('drawer.note'))}</p>
          <div class="cd-btns"><a class="btn btn-outline" href="#cart">${esc(t('drawer.view'))}</a><a class="btn btn-primary" href="#checkout">${I('lock', 'ico-sm')} ${esc(t('drawer.checkout'))}</a></div>
        </div>` :
        `<div class="empty">${I('bag', 'ico-xl')}<p>${esc(t('drawer.empty'))}</p><a class="btn btn-primary" href="#shop">${esc(t('hero.cta1'))}</a></div>`}`;
  };

  /* ---------------- Breadcrumbs ---------------- */
  C.Breadcrumbs = (items) => `
    <nav class="crumbs" aria-label="Breadcrumb">
      <ol>
        <li><a href="#home">${esc(t('crumbs.home'))}</a></li>
        ${items.map((it, i) => `<li>${I('chevron', 'ico-xs flip-rtl')}${i === items.length - 1 || !it.href ? `<span aria-current="page">${esc(it.label)}</span>` : `<a href="${it.href}">${esc(it.label)}</a>`}</li>`).join('')}
      </ol>
    </nav>`;

  /* ---------------- Rating / badges / price ---------------- */
  C.Stars = (rating, size = '') => {
    let s = '';
    for (let i = 1; i <= 5; i++) {
      const fill = rating >= i - 0.25 ? 'full' : rating >= i - 0.75 ? 'half' : 'empty';
      s += `<span class="star ${fill}">${I('star', '', true)}</span>`;
    }
    return `<span class="stars ${size}" role="img" aria-label="${rating.toFixed(1)} / 5">${s}</span>`;
  };
  C.Badge = (badge) => badge ? `<span class="badge badge-${badge}">${esc(t('badges.' + badge))}</span>` : '';
  C.Price = (p, long, color) => {
    const price = color ? q.price(p, color) : p.price;
    return `<span class="price">
      <span class="price-now${p.compareAt ? ' is-sale' : ''}" data-unit-price>${fmt.money(price)}</span><span class="per">${esc(long ? ' ' + t('product.perMeterLong') : ' ' + t('product.perMeter'))}</span>
      ${p.compareAt ? `<s class="price-was">${fmt.money(p.compareAt)}</s>` : ''}
    </span>`;
  };
  const colorsAvail = n => n === 1 ? t('v2.colorsAvail1') : t('v2.colorsAvail', { n });

  /* ---------------- ProductCard ---------------- */
  C.ProductCard = (p, opts = {}) => {
    const color = opts.color || q.defaultColor(p);
    const cat = q.category(p.category);
    const inWl = ROKN.wishlist.has(p.id);
    const total = q.totalStock(p), out = total === 0;
    const cstock = q.stock(p, color);
    const alt = isAr() ? `${L(p.name)} ${L(q.color(color))} من ركن أم القرى الكويت` : `${L(q.color(color))} ${L(p.name)} fabric at Rokn Om Alqura Kuwait`;
    const avail = out ? ['out', t('product.outOfStock')] : cstock <= 20 ? ['low', t('product.lowStock', { n: cstock })] : ['in', t('product.inStock')];
    return `
    <article class="pcard" data-product="${p.id}">
      <div class="pcard-media">
        <a href="#product--${p.id}" class="pcard-img" tabindex="-1" aria-hidden="true">
          <img src="${ROKN.img.drape(p, color, true)}" srcset="${ROKN.img.drape(p, color, true)} 480w, ${ROKN.img.drape(p, color)} 900w" sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 320px" alt="${esc(alt)}" loading="lazy" decoding="async" width="480" height="600" class="img-main">
          <img src="${ROKN.img.roll(p, color)}" alt="" loading="lazy" decoding="async" width="480" height="600" class="img-alt">
        </a>
        ${C.Badge(out ? null : p.badge)}
        <button class="wl-btn${inWl ? ' on' : ''}" type="button" data-action="wishlist" data-id="${p.id}" aria-pressed="${inWl}" aria-label="${esc(t(inWl ? 'product.wishlistRemove' : 'product.wishlistAdd'))}: ${esc(L(p.name))}">${I('heart')}</button>
      </div>
      <div class="pcard-body">
        <p class="pcard-type">${esc(L(cat))}${L(cat).toLowerCase().includes(L(ROKN.catalog.materials[p.material]).toLowerCase()) ? '' : ` · ${esc(L(ROKN.catalog.materials[p.material]))}`}</p>
        <h3 class="pcard-name"><a href="#product--${p.id}">${esc(L(p.name))}</a></h3>
        ${p.reviewCount ? `<div class="pcard-rating">${C.Stars(p.rating)}<span>${p.rating.toFixed(1)}</span></div>` : ''}
        ${C.Price(p, false, color)}
        <div class="pcard-colors">
          <span class="pcard-dots" aria-hidden="true">${p.variants.slice(0, 6).map(v => `<span class="dot${v.stock ? '' : ' is-out'}${v.color === color ? ' is-sel' : ''}" style="--c:${q.color(v.color).hex}"></span>`).join('')}</span>
          <span class="pcard-ncol">${esc(colorsAvail(p.variants.length))}</span>
        </div>
        <p class="avail avail-${avail[0]} pcard-avail"><span class="avail-dot"></span>${esc(avail[1])}${opts.color ? ` · ${esc(L(q.color(color)))}` : ''}</p>
        <div class="pcard-btns">
          <button class="btn btn-outline btn-sm" type="button" data-action="quickview" data-id="${p.id}" data-color="${color}" aria-label="${esc(t('product.quickView'))}: ${esc(L(p.name))}">${esc(t('product.quickView'))}</button>
          <button class="btn btn-primary btn-sm" type="button" data-action="quickadd" data-id="${p.id}" data-color="${color}" ${out || !cstock ? 'disabled' : ''} aria-label="${esc(t('product.addToCart'))}: ${esc(L(p.name))}">${esc(out ? t('product.outOfStock') : t('product.addToCart'))}</button>
        </div>
      </div>
    </article>`;
  };
  C.ProductGrid = (list, cls = '', colorFor) => `<div class="pgrid ${cls}">${list.map(p => C.ProductCard(p, { color: colorFor && colorFor(p) })).join('')}</div>`;

  /* ---------------- CategoryCard (Shop by Fabric) ---------------- */
  C.CategoryCard = (c, i, big) => {
    const p = (c.cover && q.product(c.cover[0])) || q.inCategory(c.id)[0];
    const n = q.inCategory(c.id).length;
    const col = p ? (c.cover && c.cover[0] === p.id ? c.cover[1] : q.defaultColor(p)) : null;
    const main = c.image || (p ? ROKN.img.roll(p, col) : 'assets/img/store/store-shelves-sm.webp');
    const alt2 = p ? ROKN.img.closeup(p, col) : main;
    return `
    <a class="ccard${big ? ' ccard-big' : ''}" href="#shop--${c.id}">
      <span class="ccard-img">
        <img src="${main}" alt="${esc(isAr() ? `أقمشة ${L(c)} في الكويت` : `${L(c)} fabric on the roll at Rokn Om Alqura Kuwait`)}" loading="lazy" decoding="async" width="450" height="562">
        <img class="ccard-alt" src="${alt2}" alt="" loading="lazy" decoding="async" width="450" height="562">
      </span>
      <span class="ccard-body">
        <span class="ccard-name">${esc(L(c))}</span>
        <span class="ccard-desc">${esc(L(c.desc))}</span>
        <span class="ccard-meta"><span>${esc(fmt.fabrics(n))}</span><span class="ccard-go">${esc(t('v2.explore'))} ${I('arrow', 'ico-sm flip-rtl')}</span></span>
      </span>
    </a>`;
  };

  /* ---------------- Colour explorer (Shop by Colour) ---------------- */
  C.ColorExplorer = (selected) => `
    <div class="color-explorer">
      <div class="cx-chips" role="radiogroup" aria-label="${esc(t('v2.colorEyebrow'))}">
        ${ROKN.catalog.colorFamilies.map(f => {
          const n = ROKN.catalog.products.filter(p => q.inFamily(p, f.id)).length;
          return `<button type="button" role="radio" class="cx-chip${f.id === selected ? ' on' : ''}" aria-checked="${f.id === selected}" data-action="color-family" data-family="${f.id}" ${n ? '' : 'disabled'}>
            <span class="cx-swatch" style="background-image:url(assets/img/swatches/${f.id}.webp)"></span><span class="cx-name">${esc(L(f))}</span><span class="cx-n">${n}</span></button>`;
        }).join('')}
      </div>
      <div class="cx-results" data-cx-results aria-live="polite"></div>
    </div>`;
  C.colorResults = (fam) => {
    const list = ROKN.catalog.products.filter(p => q.inFamily(p, fam)).sort((a, b) => b.sold - a.sold);
    const f = ROKN.catalog.colorFamilies.find(x => x.id === fam);
    if (!list.length) return `<p class="muted">${esc(t('v2.colorNone'))}</p>`;
    return `${C.ProductGrid(list.slice(0, 4), 'pgrid-cx', p => q.familyColor(p, fam))}
      <div class="center-cta"><a class="btn btn-outline" href="#color--${fam}">${esc(t('v2.colorAll', { c: L(f) }))} (${list.length})</a></div>`;
  };

  /* ---------------- CollectionCard ---------------- */
  C.CollectionCard = (c, i) => `
    <article class="colcard${i === 0 || i === 5 ? ' is-wide' : ''}">
      <a href="#collection--${c.id}" class="colcard-link" aria-label="${esc(t('sections.explore'))}: ${esc(L(c))}">
        <span class="colcard-img"><img src="${c.image}" alt="${esc(isAr() ? `${L(c)} — أقمشة في الكويت` : `${L(c)} — fabrics at Rokn Om Alqura Kuwait`)}" loading="lazy" decoding="async" width="1200" height="800"></span>
        <span class="colcard-body">
          <span class="colcard-count">${esc(fmt.fabrics(q.inCollection(c.id).length))}</span>
          <h3>${esc(L(c))}</h3>
          <p>${esc(L(c.desc))}</p>
          <span class="link-arrow">${esc(t('sections.explore'))} ${I('arrow', 'ico-sm flip-rtl')}</span>
        </span>
      </a>
    </article>`;

  /* ---------------- SwatchSelector (fabric-texture swatches) ---------------- */
  C.SwatchSelector = (p, selected, scope = 'pdp') => `
    <fieldset class="swatches">
      <legend><span>${esc(t('product.color'))}: <strong data-color-name>${esc(L(q.color(selected)))}</strong></span><span class="sw-count">${esc(t('pdp.colorsAvail', { n: p.variants.length }))}</span></legend>
      <div class="swatch-row" role="radiogroup" aria-label="${esc(t('product.selectColor'))}">
        ${p.variants.map(v => {
          const c = q.color(v.color);
          return `<button type="button" class="swatch${v.color === selected ? ' on' : ''}${v.stock ? '' : ' is-out'}" role="radio" aria-checked="${v.color === selected}"
            data-action="swatch" data-scope="${scope}" data-color="${v.color}" style="--c:${c.hex};--tex:url(${new URL(ROKN.img.drape(p, v.color, true), document.baseURI).href})" title="${esc(L(c))}${v.stock ? '' : ' — ' + esc(t('product.outOfStock'))}">
            <span class="swatch-chip"></span><span class="swatch-label">${esc(L(c))}</span></button>`;
        }).join('')}
      </div>
    </fieldset>`;

  C.Availability = (p, color) => {
    const s = q.stock(p, color);
    const cls = s <= 0 ? 'out' : s <= 20 ? 'low' : 'in';
    const label = s <= 0 ? t('product.outOfStock') : s <= 20 ? t('product.lowStock', { n: s }) : t('product.inStock');
    return `<span class="avail avail-${cls}" data-avail><span class="avail-dot"></span>${esc(label)}</span>`;
  };

  /* ---------------- QuantitySelector (metres) ---------------- */
  C.QuantitySelector = (qty, scope = 'pdp') => `
    <div class="qty-block">
      <label for="qty-${scope}" class="field-label">${esc(t('product.quantity'))}</label>
      <div class="qty-chips" role="group" aria-label="${esc(t('product.quantity'))}">
        ${ROKN.config.quickMeters.map(m => `<button type="button" class="chip${qty === m ? ' on' : ''}" data-action="qty-chip" data-scope="${scope}" data-qty="${m}" aria-pressed="${qty === m}">${m} ${esc(t('product.meters'))}</button>`).join('')}
      </div>
      <div class="qty-row">
        <div class="stepper">
          <button type="button" data-action="qty-step" data-scope="${scope}" data-dir="-1" aria-label="−">${I('minus')}</button>
          <input id="qty-${scope}" type="number" inputmode="decimal" min="${ROKN.config.minMeters}" max="${ROKN.config.maxMeters}" step="${ROKN.config.meterStep}" value="${qty}" data-qty-input="${scope}" aria-describedby="qty-hint-${scope}">
          <span class="stepper-unit">${esc(t('product.meters'))}</span>
          <button type="button" data-action="qty-step" data-scope="${scope}" data-dir="1" aria-label="+">${I('plus')}</button>
        </div>
        <p class="calc-line" data-calc-line aria-live="polite"></p>
      </div>
      <p class="hint" id="qty-hint-${scope}">${esc(t('product.customQty'))}: ${ROKN.config.minMeters}–${ROKN.config.maxMeters} ${esc(t('product.meters'))} · ${ROKN.config.meterStep} ${esc(t('product.meters'))}</p>
    </div>`;

  /* ---------------- ProductGallery ---------------- */
  C.ProductGallery = (p, color) => {
    const g = ROKN.img.gallery(p, color);
    const name = L(p.name), cname = L(q.color(color));
    const vname = v => t('product.views.' + v) || t('views2.' + v);
    return `
    <div class="gallery" data-gallery>
      <div class="gallery-main">
        <div class="gallery-zoom" data-zoom>
          <img src="${g[0].src}" alt="${esc(isAr() ? `${name} باللون ${cname} — ${vname('drape')} · ركن أم القرى الكويت` : `${cname} ${name} — ${vname('drape')} · Rokn Om Alqura Kuwait`)}" width="900" height="1125" data-main-img fetchpriority="high">
        </div>
        ${C.Badge(p.badge)}
        <button type="button" class="g-btn g-full" data-action="lightbox" aria-label="${esc(t('pdp.fullscreen'))}">${I('expand', 'ico-sm')}</button>
        <button type="button" class="g-btn g-prev" data-action="g-step" data-dir="-1" aria-label="${esc(t('pdp.prevImg'))}">${I('chevronLeft', 'ico-sm flip-rtl')}</button>
        <button type="button" class="g-btn g-next" data-action="g-step" data-dir="1" aria-label="${esc(t('pdp.nextImg'))}">${I('chevron', 'ico-sm flip-rtl')}</button>
        <p class="g-caption" data-g-caption>${esc(vname('drape'))} · 1 / ${g.length}</p>
      </div>
      <ul class="thumbs" role="list">
        ${g.map((im, i) => `<li><button type="button" class="thumb${i === 0 ? ' on' : ''}" data-action="thumb" data-index="${i}" aria-label="${esc(vname(im.view))}" aria-pressed="${i === 0}">
          <img src="${ROKN.img.thumb(im.src)}" alt="" decoding="async" width="160" height="200"><span>${esc(vname(im.view))}</span></button></li>`).join('')}
      </ul>
    </div>`;
  };

  /* ---------------- Review ---------------- */
  C.Review = (r) => `
    <article class="review">
      <header>${C.Stars(r.rating, 'stars-sm')}${r.date ? `<time datetime="${r.date}">${esc(fmt.date(r.date))}</time>` : ''}</header>
      <p>“${esc(L(r.text))}”</p>
      <footer><span class="r-name">${esc(typeof r.name === 'object' ? L(r.name) : (r.name === 'Sample Customer' ? (isAr() ? 'عميل تجريبي' : 'Sample customer') : r.name))}</span>
        ${r.verified ? `<span class="verified">${I('check', 'ico-xs')} ${esc(t('product.verified'))}</span>` : ''}</footer>
    </article>`;

  /* ---------------- ProductFilters ---------------- */
  C.ProductFilters = (f, counts) => {
    const Cat = ROKN.catalog;
    const group = (title, options, open = true) => `
      <details class="fgroup" ${open ? 'open' : ''}>
        <summary>${esc(title)}${I('chevronDown', 'ico-sm')}</summary>
        <div class="fopts">${options}</div>
      </details>`;
    const checks = (key, entries) => entries.map(([id, label]) => `
      <label class="check"><input type="checkbox" data-filter="${key}" value="${id}" ${f[key].includes(id) ? 'checked' : ''}>
      <span class="check-box">${I('check', 'ico-xs')}</span><span>${esc(label)}</span><span class="fcount">${(counts[key] || {})[id] || 0}</span></label>`).join('');
    const prices = Cat.products.map(p => p.price);
    const minP = Math.floor(Math.min(...prices)), maxP = Math.ceil(Math.max(...prices));
    return `
      <div class="filters" data-filters>
        ${group(t('shop.f.category'), checks('category', Cat.categories.map(c => [c.id, L(c)])))}
        ${group(t('filters2.colorFam'), `<div class="fcolors">${Cat.colorFamilies.map(c => `
          <label class="fcolor" title="${esc(L(c))}"><input type="checkbox" data-filter="color" value="${c.id}" ${f.color.includes(c.id) ? 'checked' : ''}>
          <span class="fcolor-chip" style="background-image:url(assets/img/swatches/${c.id}.webp)"></span><span class="fcolor-name">${esc(L(c))}</span></label>`).join('')}</div>`)}
        ${group(t('shop.f.price'), `
          <p class="range-label" data-range-label>${esc(t('filters2.minMax', { a: (f.minPrice ?? minP).toFixed(3), b: (f.maxPrice ?? maxP).toFixed(3) }))}</p>
          <div class="dual-range">
            <label class="sr-only" for="f-min">Min</label><input id="f-min" type="range" min="${minP}" max="${maxP}" step="0.5" value="${f.minPrice ?? minP}" data-filter-range="minPrice">
            <label class="sr-only" for="f-max">Max</label><input id="f-max" type="range" min="${minP}" max="${maxP}" step="0.5" value="${f.maxPrice ?? maxP}" data-filter-range="maxPrice">
          </div>`)}
        ${group(t('filters2.flags'), checks('flags', Object.entries(Cat.flags).map(([k, v]) => [k, L(v)])))}
        ${group(t('shop.f.fabricType'), checks('fabricType', Object.entries(Cat.fabricTypes).map(([k, v]) => [k, L(v)])), false)}
        ${group(t('shop.f.material'), checks('material', Object.entries(Cat.materials).map(([k, v]) => [k, L(v)])), false)}
        ${group(t('shop.f.pattern'), checks('pattern', Object.entries(Cat.patterns).map(([k, v]) => [k, L(v)])), false)}
        ${group(t('filters2.width'), checks('width', Object.entries(Cat.widths).map(([k, v]) => [k, L(v)])), false)}
        ${group(t('shop.f.collection'), checks('collection', Cat.collections.map(c => [c.id, L(c)])), false)}
        ${group(t('shop.f.availability'), `<label class="check"><input type="checkbox" data-filter-bool="inStock" ${f.inStock ? 'checked' : ''}><span class="check-box">${I('check', 'ico-xs')}</span><span>${esc(t('shop.inStockOnly'))}</span></label>`, false)}
      </div>`;
  };

  /* ---------------- Fabric calculator ---------------- */
  C.FabricCalculator = (scope = 'page', width) => {
    const g = ROKN.calcState = ROKN.calcState || { garment: 'abaya', width: width || 150, length: 145, skirt: 90, shirt: 75, winW: 200, drop: 250, fullness: '2', otherLen: 100, pieces: 1 };
    if (width) g.width = width;
    const opt = (k) => `<option value="${k}" ${g.garment === k ? 'selected' : ''}>${esc(t('calc.g.' + k))}</option>`;
    const num = (id, label, val, min, max) => `<div class="field"><label for="calc-${id}-${scope}">${esc(label)}</label><input id="calc-${id}-${scope}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${val}" data-calc="${id}"></div>`;
    let fields = '';
    if (['abaya', 'dress', 'thobe'].includes(g.garment)) fields = num('length', t('calc.length'), g.length, 60, 200);
    else if (g.garment === 'shirt') fields = num('shirt', t('calc.shirtLen'), g.shirt, 40, 120);
    else if (g.garment === 'skirt') fields = num('skirt', t('calc.skirtLen'), g.skirt, 30, 130);
    else if (g.garment === 'curtains') fields = `<div class="form-2">${num('winW', t('calc.winW'), g.winW, 40, 1200)}${num('drop', t('calc.drop'), g.drop, 40, 500)}</div>
      <div class="field"><label for="calc-full-${scope}">${esc(t('calc.panels'))}</label><select id="calc-full-${scope}" data-calc="fullness">${['1.5', '2', '2.5'].map(k => `<option value="${k}" ${g.fullness === k ? 'selected' : ''}>${esc(t('calc.fullness')[k])}</option>`).join('')}</select></div>`;
    else fields = `<div class="form-2">${num('otherLen', t('calc.otherLen'), g.otherLen, 10, 1000)}${num('pieces', t('calc.pieces'), g.pieces, 1, 50)}</div>`;
    return `
      <form class="calc form" data-form="calc" data-scope="${scope}" novalidate>
        <div class="form-2">
          <div class="field"><label for="calc-g-${scope}">${esc(t('calc.garment'))}</label><select id="calc-g-${scope}" data-calc="garment">${['abaya', 'dress', 'thobe', 'shirt', 'skirt', 'curtains', 'other'].map(opt).join('')}</select></div>
          <div class="field"><label for="calc-w-${scope}">${esc(t('calc.width'))}</label><select id="calc-w-${scope}" data-calc="width">${[110, 140, 150].map(w => `<option value="${w}" ${Number(g.width) === w || (w === 150 && g.width > 145) || (w === 140 && g.width > 120 && g.width <= 145) ? 'selected' : ''}>${fmt.cm(w)}</option>`).join('')}</select></div>
        </div>
        ${fields}
        <div class="calc-result" data-calc-result aria-live="polite"></div>
      </form>`;
  };
  ROKN.calcEstimate = function () {
    const g = ROKN.calcState, W = Number(g.width) || 150;
    const narrow = W < 140 ? 1.3 : 1;
    let cm;
    switch (g.garment) {
      case 'abaya': cm = (2 * g.length + 40) * 1.05 * narrow; break;
      case 'dress': cm = (2 * g.length + 50) * 1.1 * narrow; break;
      case 'thobe': cm = (2 * g.length + 70) * 1.05 * narrow; break;
      case 'shirt': cm = (2 * g.shirt + 60) * narrow; break;
      case 'skirt': cm = (2 * g.skirt + 20) * narrow; break;
      case 'curtains': { const widths = Math.ceil((g.winW * Number(g.fullness)) / (W - 10)); cm = widths * (Number(g.drop) + 30); break; }
      default: cm = g.otherLen * g.pieces * 1.05;
    }
    return Math.max(0.5, Math.ceil((cm / 100) * 2) / 2);
  };

  /* ---------------- Newsletter ---------------- */
  C.Newsletter = () => `
    <section class="newsletter" aria-labelledby="nl-h">
      <div class="wrap nl-in">
        <div class="nl-copy">
          <p class="eyebrow on-dark">${esc(t('v2.nlEyebrow'))}</p>
          <h2 id="nl-h">${esc(t('v2.nlTitle'))}</h2>
          <p>${esc(t('v2.nlText'))}</p>
        </div>
        <form class="nl-form" data-form="newsletter" novalidate>
          <div class="field"><label class="sr-only" for="nl-email">${esc(t('v2.nlPlaceholder'))}</label>
            <div class="nl-row"><input id="nl-email" name="email" type="email" autocomplete="email" dir="ltr" required placeholder="${esc(t('v2.nlPlaceholder'))}"><button class="btn btn-light" type="submit">${esc(t('v2.nlCta'))}</button></div>
          </div>
          <p class="nl-fine">${esc(t('v2.nlPrivacy'))}</p>
          <p class="form-ok" hidden role="status"></p>
        </form>
      </div>
    </section>`;

  /* ---------------- Section header / page hero ---------------- */
  C.SectionHead = (eyebrow, title, link, id) => `
    <div class="section-head">
      <div><p class="eyebrow">${esc(eyebrow)}</p><h2${id ? ` id="${id}"` : ''}>${esc(title)}</h2></div>
      ${link ? `<a class="link-arrow" href="${link.href}">${esc(link.label)} ${I('arrow', 'ico-sm flip-rtl')}</a>` : ''}
    </div>`;
  C.PageHero = (title, intro, crumbs) => `
    <section class="page-hero">
      <div class="wrap">
        ${C.Breadcrumbs(crumbs || [{ label: title }])}
        <h1>${esc(title)}</h1>
        ${intro ? `<p class="lead">${esc(intro)}</p>` : ''}
      </div>
    </section>`;
})();
