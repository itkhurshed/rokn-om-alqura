/* ==========================================================================
   ADMIN SHELL — sign-in, layout (sidebar / top bar), permission-guarded
   routing (#en.admin--pos, #ar.admin--products--edit--italian-linen),
   notifications bell, language switch.
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const A = ROKN.admin, t = A.t, esc = A.esc, I = A.i;
  const api = ROKN.api;
  A.pages = A.pages || {};
  const shell = A.shell = {};

  /* Navigation: [route, icon, i18n key, permission [module, action]] */
  A.NAV = [
    ['overview', [['dashboard', 'dashboard', 'nav.dashboard', ['dashboard', 'view']], ['notifications', 'notifications', 'nav.notifications', 'self']]],
    ['selling', [['pos', 'pos', 'nav.pos', ['pos', 'view']], ['sales', 'sales', 'nav.sales', ['sales', 'view']], ['orders', 'orders', 'nav.orders', ['orders', 'view']], ['customers', 'customers', 'nav.customers', ['customers', 'view']], ['coupons', 'coupons', 'nav.coupons', ['coupons', 'view']]]],
    ['catalogue', [['products', 'products', 'nav.products', ['products', 'view']], ['categories', 'categories', 'nav.categories', ['products', 'view']], ['collections', 'collections', 'nav.collections', ['products', 'view']], ['media', 'media', 'nav.media', ['media', 'view']]]],
    ['stock', [['inventory', 'inventory', 'nav.inventory', ['inventory', 'view']], ['inventory--rolls', 'rolls', 'nav.rolls', ['inventory', 'view']], ['inventory--labels', 'labels', 'nav.labels', ['inventory', 'print']], ['purchases', 'purchases', 'nav.purchases', ['purchases', 'view']], ['suppliers', 'suppliers', 'nav.suppliers', ['suppliers', 'view']]]],
    ['money', [['daily', 'daily', 'nav.daily', ['reports', 'view']], ['reports', 'reports', 'nav.salesReport', ['reports', 'view']], ['reports--inventory', 'inventory', 'nav.inventoryReport', ['reports', 'view']], ['expenses', 'expenses', 'nav.expenses', ['expenses', 'view']]]],
    ['people', [['users', 'users', 'nav.users', ['users', 'view']], ['roles', 'roles', 'nav.roles', ['users', 'view']], ['logs', 'logs', 'nav.logs', ['logs', 'view']]]],
    ['system', [['settings', 'settings', 'nav.settings', ['settings', 'view']], ['printers', 'printers', 'nav.printers', ['printers', 'view']]]]
  ];

  A.can = (module, action) => !!(A.me && A.me.perms && A.me.perms[module] && A.me.perms[module].includes(action || 'view'));
  const allowed = perm => perm === 'self' || !perm || A.can(perm[0], perm[1]);
  A.href = r => ROKN.router.href('admin' + (r ? '--' + r : ''));
  A.go = r => { location.hash = A.href(r); };
  A.call = async (method, args) => { try { return await api.call(method, args); } catch (e) { if (e.code === 'unauthenticated') shell.signedOut(); throw e; } };

  function root() {
    let r = document.getElementById('admin-root');
    if (!r) { r = document.createElement('div'); r.id = 'admin-root'; document.body.appendChild(r); }
    document.body.classList.add('is-admin');
    r.setAttribute('dir', A.isAr() ? 'rtl' : 'ltr');
    return r;
  }
  shell.leave = () => { document.body.classList.remove('is-admin'); const r = document.getElementById('admin-root'); if (r) r.innerHTML = ''; A.closeAllModals(); };

  /* ---------------- entry ---------------- */
  shell.route = async function (param) {
    const r = root();
    document.title = `${t('brand')} · Rokn Om Alqura`;
    if (!A.booted) {
      r.innerHTML = `<div class="adm-splash"><div class="spin"></div><p>${esc(t('loading'))}</p></div>`;
      try { await api.init(stage => { r.querySelector('.adm-splash p').textContent = t('preparing'); }); }
      catch (e) { r.innerHTML = `<div class="adm-splash"><p class="err">${esc(e.message)}</p></div>`; return; }
      A.booted = true;
    }
    if (!A.me) {
      if (api.token || api.mode === 'server') { try { A.me = await api.call('auth.me'); } catch (e) { A.me = null; } }
      if (!A.me) return shell.login(param);
    }
    if (A.me.user.must_change_password) return shell.mustChange();
    A.settings = A.me.settings;
    if (!A.lookups && A.can('products', 'view')) { try { A.lookups = await api.call('lookups.all'); } catch (e) { /* */ } }
    if (!A.lookups) A.lookups = { categories: [], collections: [], colors: [], fabric_types: [], suppliers: [], partial: true };
    const parts = (param || '').split('--').filter(Boolean);
    let name = parts[0] || '';
    if (!name) name = A.can('dashboard', 'view') ? 'dashboard' : A.can('pos', 'view') ? 'pos' : (firstAllowed() || 'account');
    shell.layout(name + (parts[1] && !['edit', 'new', 'view'].includes(parts[1]) ? '--' + parts[1] : ''));
    const page = A.pages[name];
    const old = document.getElementById('adm-view');
    const view = old.cloneNode(false); view.className = 'adm-view'; old.replaceWith(view);   // fresh element → no stale listeners
    if (!page) { view.innerHTML = `<div class="empty-a">${I('alert', 'ai-xl')}<h2>${esc(t('notFound'))}</h2></div>`; return; }
    if (!allowed(page.perm)) {
      view.innerHTML = `<div class="empty-a denied">${I('lock', 'ai-xl')}<h2>${esc(t('forbiddenT'))}</h2><p>${esc(t('forbidden'))}</p><a class="btn-a primary" href="${A.href('')}">${esc(t('nav.dashboard'))}</a></div>`;
      return;
    }
    view.innerHTML = `<div class="adm-loading"><div class="spin"></div></div>`;
    A.current = { name, parts: parts.slice(1), page };
    try { await page.render(view, parts.slice(1)); }
    catch (e) { view.innerHTML = `<div class="empty-a">${I('alert', 'ai-xl')}<h2>${esc(e.code === 'forbidden' ? t('forbiddenT') : t('error'))}</h2><p>${esc(e.message)}</p></div>`; if (e.code !== 'forbidden') console.error(e); }
    ROKN.localizeLinks(view);
    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  };
  A.refresh = () => { if (A.current) shell.route([A.current.name, ...A.current.parts].join('--')); };
  const firstAllowed = () => { for (const [, items] of A.NAV) for (const it of items) if (allowed(it[3]) && it[3] !== 'self') return it[0]; return null; };

  /* ---------------- login ---------------- */
  shell.login = function (param) {
    const r = root();
    const demo = api.mode === 'local';
    const other = A.isAr() ? 'en' : 'ar';
    r.innerHTML = `
    <div class="adm-login">
      <div class="al-art" aria-hidden="true"><img src="assets/img/store/store-shelves.webp" alt=""><div class="al-art-cap"><b>ROKN OM ALQURA</b><span>ركن أم القرى</span></div></div>
      <div class="al-panel">
        <div class="al-top"><a class="al-back" href="${ROKN.router.href('home')}">${I('store')} ${esc(t('toStore'))}</a><a class="al-lang" href="${ROKN.router.href('admin' + (param ? '--' + param : ''), other)}" lang="${other}">${other === 'ar' ? 'العربية' : 'English'}</a></div>
        <form class="al-form" data-login novalidate>
          <p class="eyebrow-a">${esc(t('brand'))}</p>
          <h1>${esc(t('staffLogin'))}</h1>
          ${A.field({ name: 'username', label: t('username'), req: true, attrs: ' autocomplete="username" autocapitalize="none" spellcheck="false"' })}
          ${A.field({ name: 'password', label: t('password'), type: 'password', req: true, attrs: ' autocomplete="current-password"' })}
          <p class="al-err" role="alert" hidden></p>
          <button class="btn-a primary block lg" type="submit">${I('lock')} ${esc(t('signIn'))}</button>
          ${demo ? `<div class="al-demo"><p><b>${esc(t('demoAccounts'))}</b> · ${esc(t('demoPw'))}: <code>Rokn@2026</code></p>
            <div class="al-chips">${[['admin', 'Super Admin'], ['manager', 'Manager'], ['cashier', 'Cashier'], ['sales', 'Sales'], ['inventory', 'Inventory'], ['accountant', 'Accountant'], ['viewer', 'Viewer']].map(([u, l]) => `<button type="button" class="chip-a" data-demo-user="${u}">${esc(l)} <code>${u}</code></button>`).join('')}</div>
            <p class="small muted">${esc(t('demoNote'))}</p><p class="small muted">${esc(t('localMode'))}</p></div>` : ''}
        </form>
      </div>
    </div>`;
    const f = r.querySelector('[data-login]');
    f.username.focus();
    r.querySelectorAll('[data-demo-user]').forEach(b => b.addEventListener('click', () => { f.username.value = b.dataset.demoUser; f.password.value = 'Rokn@2026'; f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true })); }));
    f.addEventListener('submit', async e => {
      e.preventDefault();
      if (!A.validate(f)) return;
      const btn = f.querySelector('button[type=submit]'), errEl = f.querySelector('.al-err');
      btn.disabled = true; btn.innerHTML = `<span class="spin sm"></span> ${esc(t('signingIn'))}`; errEl.hidden = true;
      try {
        await api.login(f.username.value.trim(), f.password.value);
        A.me = await api.call('auth.me');
        if (A.me.user.lang && A.me.user.lang !== A.lang() && !location.hash.match(/^#(en|ar)\./)) { location.hash = ROKN.router.href('admin', A.me.user.lang); return; }
        shell.route(param);
      } catch (ex) {
        errEl.textContent = ROKN.adminI18n[A.lang()].errs[ex.code] || ex.message; errEl.hidden = false;
        btn.disabled = false; btn.innerHTML = `${I('lock')} ${esc(t('signIn'))}`; f.password.value = ''; f.password.focus();
      }
    });
  };
  shell.signedOut = function () { A.me = null; api.token = null; try { sessionStorage.removeItem('rokn:admin-token'); } catch (e) { /* */ } A.closeAllModals(); shell.login((A.current && A.current.name) || ''); };
  shell.mustChange = function () {
    const r = root();
    r.innerHTML = `<div class="adm-login one"><div class="al-panel"><form class="al-form" data-chpw novalidate><h1>${esc(t('changePw'))}</h1><p class="muted">${esc(t('mustChange'))}</p>
      ${A.field({ name: 'current', label: t('currentPw'), type: 'password', req: true, attrs: ' autocomplete="current-password"' })}
      ${A.field({ name: 'next', label: t('newPw'), type: 'password', req: true, attrs: ' autocomplete="new-password" minlength="8"' })}
      ${A.field({ name: 'confirm', label: t('confirmPw'), type: 'password', req: true, attrs: ' autocomplete="new-password"' })}
      <p class="al-err" role="alert" hidden></p><button class="btn-a primary block lg" type="submit">${esc(t('changePw'))}</button>
      <button class="btn-a ghost block" type="button" data-logout>${esc(t('signOut'))}</button></form></div></div>`;
    const f = r.querySelector('[data-chpw]');
    r.querySelector('[data-logout]').onclick = async () => { await api.logout(); shell.signedOut(); };
    f.addEventListener('submit', async e => {
      e.preventDefault(); if (!A.validate(f)) return;
      const err = f.querySelector('.al-err');
      if (f.next.value !== f.confirm.value) { err.textContent = t('pwMismatch'); err.hidden = false; return; }
      try { await api.call('auth.changePassword', { current: f.current.value, next: f.next.value }); A.me = await api.call('auth.me'); A.toast(t('pwChanged')); shell.route(''); }
      catch (ex) { err.textContent = ex.message; err.hidden = false; }
    });
  };

  /* ---------------- layout ---------------- */
  shell.layout = function (active) {
    const r = root();
    const routes = A.NAV.flatMap(g => g[1]).map(it => it[0]);
    if (!routes.includes(active)) active = active.split('--')[0];
    const u = A.me.user;
    const other = A.isAr() ? 'en' : 'ar';
    const cur = (A.current ? [A.current.name, ...A.current.parts] : []).join('--');
    const nav = A.NAV.map(([g, items]) => {
      const vis = items.filter(it => allowed(it[3]));
      if (!vis.length) return '';
      return `<div class="an-group"><p class="an-g">${esc(t('groups.' + g))}</p>${vis.map(([route, icon, key]) => `<a class="an-item" href="${A.href(route)}" data-nav-a="${route}"${active === route ? ' aria-current="page"' : ''}>${I(icon)}<span>${esc(t(key))}</span>${route === 'notifications' ? `<b class="an-badge" data-unread ${A.me.unread ? '' : 'hidden'}>${A.me.unread}</b>` : ''}</a>`).join('')}</div>`;
    }).join('');
    const role = (A.me.roleName) || u.role_id.replace(/_/g, ' ');
    if (!r.querySelector('.adm') || r.dataset.lang !== A.lang() || r.dataset.uid !== u.id) {
      r.dataset.lang = A.lang(); r.dataset.uid = u.id;
      r.innerHTML = `
      <div class="adm">
        <aside class="adm-side" id="adm-side" aria-label="${esc(t('brand'))}">
          <a class="adm-brand" href="${A.href('')}"><span class="ab-mark" aria-hidden="true">ر</span><span><b>ROKN OM ALQURA</b><small>${esc(t('brand'))}</small></span></a>
          <nav class="adm-nav" aria-label="${esc(t('brand'))}"></nav>
          <div class="adm-me"></div>
        </aside>
        <div class="adm-scrim" data-side-close></div>
        <div class="adm-main">
          <header class="adm-top">
            <button type="button" class="ab-icon only-m" data-side-open aria-label="Menu" aria-controls="adm-side">${I('menu')}</button>
            <div class="adm-crumb" data-crumb></div>
            <div class="adm-top-r">
              <a class="ab-icon" href="${ROKN.router.href('home')}" title="${esc(t('toStore'))}" aria-label="${esc(t('toStore'))}">${I('store')}</a>
              <a class="ab-icon lang" data-lang-a href="#" lang="${other}">${other === 'ar' ? 'ع' : 'EN'}</a>
              <a class="ab-icon bell" href="${A.href('notifications')}" aria-label="${esc(t('nav.notifications'))}">${I('notifications')}<b data-unread ${A.me.unread ? '' : 'hidden'}>${A.me.unread}</b></a>
              <a class="adm-user" href="${A.href('account')}"><span class="av">${u.photo ? `<img src="${esc(u.photo)}" alt="">` : esc((u.name || '?').slice(0, 1))}</span><span class="nm"><b>${esc(u.name)}</b><small>${esc(role)}</small></span></a>
            </div>
          </header>
          ${A.me.demo || api.mode === 'local' ? `<div class="adm-banner">${I('alert')} <span>${A.me.demo ? esc(t('dash.demoBanner')) : ''} ${api.mode === 'local' ? esc(t('localMode')) : ''}</span></div>` : ''}
          <main id="adm-view" class="adm-view" tabindex="-1"></main>
        </div>
      </div>`;
      if (!r.dataset.bound) r.addEventListener('click', e => {
        if (e.target.closest('[data-side-open]')) document.body.classList.add('side-open');
        if (e.target.closest('[data-side-close]') || e.target.closest('.an-item')) document.body.classList.remove('side-open');
        if (e.target.closest('[data-logout]')) { e.preventDefault(); api.logout().then(() => shell.signedOut()); }
      });
      r.dataset.bound = '1';
    }
    r.querySelector('.adm-nav').innerHTML = nav;
    r.querySelector('.adm-me').innerHTML = `<button type="button" class="an-item" data-logout>${I('logout')}<span>${esc(t('signOut'))}</span></button>`;
    const pageTitle = (A.NAV.flatMap(g => g[1]).find(it => it[0] === active) || [])[2];
    r.querySelector('[data-crumb]').innerHTML = `<b>${esc(pageTitle ? t(pageTitle) : t('brand'))}</b>`;
    const lang = r.querySelector('[data-lang-a]');
    lang.href = ROKN.router.href('admin' + (cur ? '--' + cur : ''), other);
    lang.onclick = () => { api.call('auth.setLang', { lang: other }).catch(() => {}); };
    ROKN.localizeLinks(r.querySelector('.adm-side'));
  };
  shell.setUnread = n => { A.me.unread = n; document.querySelectorAll('[data-unread]').forEach(b => { b.textContent = n; b.hidden = !n; }); };
  shell.refreshUnread = async () => { try { const l = await api.call('notifications.list', { unread: true, limit: 200 }); shell.setUnread(l.length); } catch (e) { /* */ } };

  /* page header helper */
  A.head = (title, sub, actions) => `<div class="pg-head"><div><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${actions ? `<div class="pg-act">${actions}</div>` : ''}</div>`;
  A.tabs = (items, active) => `<nav class="tabs-a" aria-label="tabs">${items.map(([href, label, perm]) => perm === false ? '' : `<a href="${href}"${active === href ? ' aria-current="page"' : ''}>${esc(label)}</a>`).join('')}</nav>`;
  A.btn = (label, o) => { o = o || {}; return o.href ? `<a class="btn-a ${o.cls || 'primary'}" href="${o.href}">${o.icon ? I(o.icon) : ''} ${esc(label)}</a>` : `<button type="button" class="btn-a ${o.cls || 'primary'}" ${o.attrs || ''}>${o.icon ? I(o.icon) : ''} ${esc(label)}</button>`; };
  A.iconBtn = (icon, label, attrs, cls) => `<button type="button" class="ab-icon ${cls || ''}" ${attrs || ''} title="${esc(label)}" aria-label="${esc(label)}">${I(icon)}</button>`;
  /* Debounced live filter helper */
  A.debounce = (fn, ms) => { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms || 250); }; };
  /* Delegated listener that survives re-renders of a view */
  A.on = (el, type, sel, fn) => el.addEventListener(type, e => { const m = e.target.closest(sel); if (m && el.contains(m)) fn(e, m); });
  A.bindTable = (view, rerender) => { view.addEventListener('click', e => { if (A.tableClick(e, rerender)) return; const x = e.target.closest('[data-export]'); if (x) A.exportTable(x.dataset.tbl, x.dataset.export, x.closest('[data-title]') ? x.closest('[data-title]').dataset.title : document.querySelector('.pg-head h1') && document.querySelector('.pg-head h1').textContent); }); };

  /* ---------------- account page (every signed-in user) ---------------- */
  A.pages.account = {
    perm: 'self',
    async render(view) {
      const u = A.me.user;
      view.innerHTML = `${A.head(esc(u.name), esc(u.username) + ' · ' + esc(u.role_id))}
        <div class="grid-2"><section class="card-a"><h2>${esc(t('changePw'))}</h2><form data-pw novalidate>
          ${A.field({ name: 'current', label: t('currentPw'), type: 'password', req: true, attrs: ' autocomplete="current-password"' })}
          ${A.field({ name: 'next', label: t('newPw'), type: 'password', req: true, attrs: ' autocomplete="new-password"' })}
          ${A.field({ name: 'confirm', label: t('confirmPw'), type: 'password', req: true, attrs: ' autocomplete="new-password"' })}
          <button class="btn-a primary" type="submit">${esc(t('changePw'))}</button></form></section>
          <section class="card-a"><h2>${esc(t('f.role'))}</h2><ul class="perm-list">${Object.keys(A.me.perms).map(m => `<li><b>${esc(t('mod.' + m))}</b> ${A.me.perms[m].map(a => `<span class="ab">${esc(t('act.' + a))}</span>`).join(' ')}</li>`).join('')}</ul>
          <button type="button" class="btn-a ghost" data-logout>${I('logout')} ${esc(t('signOut'))}</button></section></div>`;
      const f = view.querySelector('[data-pw]');
      f.addEventListener('submit', async e => {
        e.preventDefault(); if (!A.validate(f)) return;
        if (f.next.value !== f.confirm.value) return A.toast(t('pwMismatch'), 'err');
        try { await A.call('auth.changePassword', { current: f.current.value, next: f.next.value }); f.reset(); A.toast(t('pwChanged')); } catch (ex) { A.err(ex); }
      });
      view.querySelector('[data-logout]').onclick = () => api.logout().then(() => shell.signedOut());
    }
  };
})();
