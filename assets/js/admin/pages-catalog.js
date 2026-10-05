/* ==========================================================================
   ADMIN PAGES — Products · Categories · Collections · Inventory (stock, rolls,
   movements, barcode labels) · Purchases · Suppliers · Customers · Expenses · Coupons
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const A = ROKN.admin, t = A.t, esc = A.esc, I = A.i, P = A.pages;
  const nm = r => A.L(r, 'name');
  const pn = r => A.isAr() ? (r.product_ar || r.name_ar || r.product_en || r.name_en) : (r.product_en || r.name_en);
  const reloadLookups = async () => { try { A.lookups = await A.call('lookups.all'); } catch (e) { /* */ } };
  const lk = (list, id) => { const x = (A.lookups && A.lookups[list] || []).find(r => r.id === id); return x ? nm(x) : (id || '—'); };
  const C = ROKN.catalog;
  const opt = (obj) => Object.keys(obj).map(k => [k, A.isAr() ? obj[k].ar : obj[k].en]);
  const thumb = (src, alt) => `<img class="th-img" src="${esc(src || 'assets/img/store/store-shelves-sm.webp')}" alt="${esc(alt || '')}" loading="lazy" width="44" height="54">`;
  const prodImg = p => (p.images && (p.images.drapeSm || p.images.drape)) || (p.colors && p.colors[0] ? `assets/img/products/${p.id}/${p.colors[0]}-drape-sm.webp` : null);

  /* =========================== PRODUCTS =========================== */
  const prodState = { q: '', category: '', status: '' };
  P.products = {
    perm: ['products', 'view'],
    async render(view, parts) {
      if (parts[0] === 'new' || parts[0] === 'edit') return productForm(view, parts[1]);
      const draw = async () => {
        const rows = await A.call('products.list', prodState);
        view.querySelector('[data-body]').innerHTML = `<div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))}</span>${A.can('products', 'export') ? A.exportBtns('prod-tbl') : ''}
          ${A.can('inventory', 'print') ? `<a class="btn-a ghost sm" href="${A.href('inventory--labels')}">${I('labels')} ${esc(t('nav.labels'))}</a>` : ''}</div>
          ${A.table({ id: 'prod-tbl', title: t('prod.title'), rows, cols: [
            { k: 'img', label: t('f.image'), sortable: false, export: false, h: r => thumb(prodImg(r), nm(r)) },
            { k: 'name_en', label: t('f.product'), v: r => nm(r), h: r => `<a href="${A.href('products--edit--' + r.id)}" class="strong">${esc(nm(r))}</a>${r.real_photos ? ` <span class="ab ab-real">${esc(t('media.real'))}</span>` : ''}<small class="muted d-b" dir="ltr">${esc(r.sku || '')}</small>` },
            { k: 'category', label: t('f.category'), v: r => lk('categories', r.category) },
            { k: 'colors', label: t('f.color'), sortable: false, h: r => `<span class="a-dots">${(r.colors || []).map(c => `<i class="sw" style="--c:${A.colorHex(c)}" title="${esc(A.colorName(c))}"></i>`).join('')}</span>`, x: r => (r.colors || []).join(' ') },
            { k: 'price_per_meter', label: t('f.pricePerM'), money: true },
            { k: 'cost_per_meter', label: t('f.costPerM'), money: true },
            { k: 'stock', label: t('f.available') + ' (m)', m: true, h: r => `<span class="${r.stock <= 0 ? 'bad' : r.stock < 30 ? 'warn' : ''}">${A.num(r.stock)}</span>` },
            { k: 'status', label: t('f.status'), h: r => A.badge(r.status), x: r => r.status }],
            actions: r => `<div class="row-act">${A.can('products', 'edit') ? `<a class="ab-icon" href="${A.href('products--edit--' + r.id)}" title="${esc(t('a.edit'))}" aria-label="${esc(t('a.edit'))}">${I('edit')}</a>` : ''}<a class="ab-icon" href="${ROKN.router.href('product--' + r.id)}" target="_blank" rel="noopener" title="${esc(t('prod.storefront'))}" aria-label="${esc(t('prod.storefront'))}">${I('eye')}</a>${A.can('products', 'delete') && r.status !== 'archived' ? A.iconBtn('trash', t('a.archive'), `data-arch="${r.id}"`) : ''}</div>` })}`;
        ROKN.localizeLinks(view);
      };
      view.innerHTML = `${A.head(esc(t('prod.title')), esc(t('prod.liveNote')), A.can('products', 'create') ? A.btn(t('prod.newT'), { href: A.href('products--new'), icon: 'plus' }) : '')}
        <div class="filters-a"><label class="srch">${I('search')}<input type="search" data-q value="${esc(prodState.q)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label>
          <select data-f="category" aria-label="${esc(t('f.category'))}"><option value="">${esc(t('f.category'))}: ${esc(t('a.all'))}</option>${(A.lookups.categories || []).map(c => `<option value="${c.id}"${prodState.category === c.id ? ' selected' : ''}>${esc(nm(c))}</option>`).join('')}</select>
          <select data-f="status" aria-label="${esc(t('f.status'))}"><option value="">${esc(t('f.status'))}: ${esc(t('st.active'))} + ${esc(t('st.draft'))}</option>${['active', 'draft', 'archived'].map(s => `<option value="${s}"${prodState.status === s ? ' selected' : ''}>${esc(t('st.' + s))}</option>`).join('')}</select></div>
        <div data-body></div>`;
      A.bindTable(view, draw);
      view.addEventListener('input', A.debounce(e => { if (e.target.matches('[data-q]')) { prodState.q = e.target.value; draw(); } }, 250));
      view.addEventListener('change', e => { const f = e.target.closest('[data-f]'); if (f) { prodState[f.dataset.f] = f.value; draw(); } });
      view.addEventListener('click', async e => { const a = e.target.closest('[data-arch]'); if (a && await A.confirm(t('a.archive') + '?', { danger: true })) { try { await A.call('products.delete', { id: a.dataset.arch }); A.toast(t('prod.archived')); draw(); } catch (ex) { A.err(ex); } } });
      await draw();
    }
  };

  async function productForm(view, id) {
    const isNew = !id;
    const p = isNew ? { status: 'draft', currency: 'KWD', collections: [], variants: [], images: null, fabric_type: 'plain', material: 'cotton', pattern: 'solid', stretch: 'none', opacity: 'opaque' } : await A.call('products.get', { id });
    const canEdit = A.can('products', isNew ? 'create' : 'edit');
    const colors = A.lookups.colors;
    const imgs = p.images || {};
    const gal = (imgs.gallery || []).map(g => g.src || g);
    const F = (name, label, o) => A.field(Object.assign({ name, label, value: p[name] }, o || {}));
    const vRow = (v, i) => `<tr data-vrow>
      <td><select name="v_color" aria-label="${esc(t('f.color'))}">${colors.map(c => `<option value="${c.id}"${c.id === v.color ? ' selected' : ''}>${esc(nm(c))}</option>`).join('')}</select></td>
      <td><input name="v_sku" value="${esc(v.sku || '')}" dir="ltr" aria-label="${esc(t('f.sku'))}" placeholder="auto"></td>
      <td><input name="v_barcode" value="${esc(v.barcode || '')}" dir="ltr" aria-label="${esc(t('f.barcode'))}" placeholder="= SKU"></td>
      <td><input name="v_price" type="number" step="0.001" min="0" value="${v.price_per_meter == null ? '' : v.price_per_meter}" aria-label="${esc(t('f.pricePerM'))}" placeholder="—"></td>
      <td><input name="v_cost" type="number" step="0.001" min="0" value="${v.cost_per_meter == null ? '' : v.cost_per_meter}" aria-label="${esc(t('f.costPerM'))}" placeholder="—"></td>
      <td><input name="v_min" type="number" step="0.5" min="0" value="${v.min_stock_m == null ? 20 : v.min_stock_m}" aria-label="${esc(t('f.minStock'))}"></td>
      <td class="num">${v.inventory ? `<b>${A.num(v.inventory.available_m)}</b>` : `<input name="v_open" type="number" step="0.5" min="0" value="0" aria-label="${esc(t('f.opening'))}" title="${esc(t('f.opening'))}">`}</td>
      <td>${v.inventory ? '' : A.iconBtn('trash', t('a.remove'), 'data-vdel')}</td></tr>`;
    view.innerHTML = `
      ${A.head(esc(isNew ? t('prod.newT') : t('prod.editT', { n: nm(p) })), isNew ? '' : `<span dir="ltr">${esc(p.sku || '')}</span> · ${A.badge(p.status)} ${p.real_photos ? `<span class="ab ab-real">${esc(t('media.real'))}</span>` : ''}`,
        `<a class="btn-a ghost" href="${A.href('products')}">${esc(t('a.back'))}</a>${!isNew ? `<a class="btn-a ghost" target="_blank" rel="noopener" href="${ROKN.router.href('product--' + p.id)}">${I('eye')} ${esc(t('prod.storefront'))}</a>` : ''}${canEdit ? `<button type="submit" form="pform" class="btn-a primary">${I('check')} ${esc(t('a.saveChanges'))}</button>` : ''}`)}
      <form id="pform" class="pform" novalidate ${canEdit ? '' : 'inert'}>
        <div class="pform-main">
          <section class="card-a"><h2>${esc(t('prod.basics'))}</h2><div class="grid-2">
            ${F('name_en', t('f.nameEn'), { req: true })}${F('name_ar', t('f.nameAr'), { dir: 'rtl' })}
            ${F('description_en', t('f.descEn'), { type: 'textarea', rows: 4 })}${F('description_ar', t('f.descAr'), { type: 'textarea', rows: 4, dir: 'rtl' })}
            ${F('sku', t('f.sku'), { dir: 'ltr' })}${F('barcode', t('f.barcode'), { dir: 'ltr' })}
            ${F('category', t('f.category'), { type: 'select', req: true, options: A.opts(A.lookups.categories.map(c => [c.id, nm(c)]), null, '—') })}
            <fieldset class="fld"><legend>${esc(t('f.collections'))}</legend><div class="chk-grid">${A.lookups.collections.map(c => `<label class="fld-check"><input type="checkbox" name="collections[]" value="${c.id}"${(p.collections || []).includes(c.id) ? ' checked' : ''}><span>${esc(nm(c))}</span></label>`).join('')}</div></fieldset>
          </div></section>
          <section class="card-a"><h2>${esc(t('prod.fabric'))}</h2><div class="grid-3">
            ${F('fabric_type', t('f.fabricType'), { type: 'select', options: A.lookups.fabric_types.map(f => [f.id, nm(f)]) })}
            ${F('material', t('f.material'), { type: 'select', options: opt(C.materials) })}
            ${F('pattern', t('f.pattern'), { type: 'select', options: opt(C.patterns) })}
            ${F('width_cm', t('f.width'), { type: 'number', step: '1', min: 0 })}${F('weight_gsm', t('f.weight'), { type: 'number', step: '1', min: 0 })}
            ${F('origin', t('f.origin'), { type: 'select', options: A.opts(opt(C.origins), null, '—') })}
            ${F('stretch', t('f.stretch'), { type: 'select', options: opt(C.stretch) })}${F('opacity', t('f.opacity'), { type: 'select', options: opt(C.opacity) })}
            </div><div class="grid-2">
            ${F('composition_en', t('f.composition') + ' (EN)')}${F('composition_ar', t('f.composition') + ' (AR)', { dir: 'rtl' })}
            ${F('texture_en', t('f.texture') + ' (EN)')}${F('texture_ar', t('f.texture') + ' (AR)', { dir: 'rtl' })}
            ${F('use_en', t('f.use') + ' (EN)')}${F('use_ar', t('f.use') + ' (AR)', { dir: 'rtl' })}
            ${F('care_en', t('f.care') + ' (EN)')}${F('care_ar', t('f.care') + ' (AR)', { dir: 'rtl' })}
          </div></section>
          <section class="card-a"><h2>${esc(t('f.variants'))}</h2><p class="muted small">${esc(t('prod.variantsHint'))}</p>
            <div class="tbl-wrap"><table class="tbl vtbl"><thead><tr><th>${esc(t('f.color'))}</th><th>${esc(t('f.sku'))}</th><th>${esc(t('f.barcode'))}</th><th>${esc(t('f.pricePerM'))}</th><th>${esc(t('f.costPerM'))}</th><th>${esc(t('f.minStock'))}</th><th class="num">${esc(t('f.available'))}</th><th></th></tr></thead>
            <tbody data-vbody>${(p.variants || []).filter(v => v.status !== 'archived').map(vRow).join('')}</tbody></table></div>
            <button type="button" class="btn-a ghost sm" data-vadd>${I('plus')} ${esc(t('prod.addColor'))}</button></section>
          <section class="card-a"><h2>${esc(t('prod.seo'))}</h2><div class="grid-2">${F('seo_title_en', t('f.seoTitle') + ' (EN)')}${F('seo_title_ar', t('f.seoTitle') + ' (AR)', { dir: 'rtl' })}${F('seo_description_en', t('f.seoDesc') + ' (EN)', { type: 'textarea', rows: 2 })}${F('seo_description_ar', t('f.seoDesc') + ' (AR)', { type: 'textarea', rows: 2, dir: 'rtl' })}</div></section>
        </div>
        <aside class="pform-side">
          <section class="card-a"><h2>${esc(t('prod.publish'))}</h2>${F('status', t('f.status'), { type: 'select', options: ['active', 'draft', 'archived'].map(s => [s, t('st.' + s)]) })}</section>
          <section class="card-a"><h2>${esc(t('prod.pricing'))}</h2>
            ${F('price_per_meter', t('f.pricePerM') + ' (KWD)', { type: 'number', step: '0.001', min: 0, req: true })}${F('compare_at_price', t('f.compareAt'), { type: 'number', step: '0.001', min: 0 })}${F('cost_per_meter', t('f.costPerM'), { type: 'number', step: '0.001', min: 0 })}
            <p class="small muted" data-margin></p></section>
          <section class="card-a"><h2>${esc(t('f.flags'))}</h2>${['featured', 'best_seller', 'new_arrival', 'limited'].map(k => A.field({ name: k, label: t('f.' + { featured: 'featured', best_seller: 'bestSeller', new_arrival: 'newArrival', limited: 'limited' }[k]), type: 'checkbox', value: p[k] })).join('')}</section>
          <section class="card-a"><h2>${esc(t('prod.media'))}</h2>
            <div class="pimgs">${[imgs.drape, ...gal].filter((x, i, a) => x && a.indexOf(x) === i).map(src => `<img src="${esc(src)}" alt="" loading="lazy">`).join('') || `<p class="muted small">${esc(t('prod.noImages'))}</p>`}</div>
            ${!isNew && A.can('media', 'view') ? `<a class="btn-a ghost sm block" href="${A.href('media')}">${I('media')} ${esc(t('prod.pickImage'))}</a>` : ''}</section>
        </aside>
      </form>`;
    ROKN.localizeLinks(view);
    const f = view.querySelector('#pform');
    const margin = () => { const pr = +f.price_per_meter.value, c = +f.cost_per_meter.value; f.querySelector('[data-margin]').textContent = pr && c ? `${t('rep.margin')}: ${(((pr - c) / pr) * 100).toFixed(0)}%` : ''; };
    margin(); f.addEventListener('input', margin);
    view.addEventListener('click', e => {
      if (e.target.closest('[data-vadd]')) { const used = [...f.querySelectorAll('[name=v_color]')].map(s => s.value); const c = colors.find(x => !used.includes(x.id)) || colors[0]; f.querySelector('[data-vbody]').insertAdjacentHTML('beforeend', vRow({ color: c.id })); }
      const d = e.target.closest('[data-vdel]'); if (d) d.closest('tr').remove();
    });
    f.addEventListener('submit', async e => {
      e.preventDefault(); if (!A.validate(f)) return;
      const d = A.formData(f);
      ['v_color', 'v_sku', 'v_barcode', 'v_price', 'v_cost', 'v_min', 'v_open'].forEach(k => delete d[k]);
      d.collections = d.collections || [];
      const variants = [...f.querySelectorAll('[data-vrow]')].map(tr => { const g = n => tr.querySelector(`[name=${n}]`); return { color: g('v_color').value, sku: g('v_sku').value.trim(), barcode: g('v_barcode').value.trim(), price_per_meter: g('v_price').value, cost_per_meter: g('v_cost').value, min_stock_m: g('v_min').value, opening_m: g('v_open') ? +g('v_open').value : 0 }; });
      if (new Set(variants.map(v => v.color)).size !== variants.length) return A.toast(t('f.color') + ' ×2', 'err');
      try {
        const saved = await A.call('products.save', { id: isNew ? null : p.id, data: d, variants });
        A.toast(t('prod.saved')); await reloadLookups();
        A.go('products--edit--' + saved.id); if (!isNew) A.refresh();
      } catch (ex) { A.err(ex); }
    });
  }

  /* =========================== CATEGORIES / COLLECTIONS =========================== */
  function taxonomyPage(kind) {
    const table = kind === 'cat' ? 'categories' : 'collections';
    return {
      perm: ['products', 'view'],
      async render(view) {
        const draw = async () => {
          const rows = await A.call(`${table}.list`);
          view.innerHTML = `${A.head(esc(t(kind === 'cat' ? 'cat.title' : 'cat.colTitle')), '', A.can('products', 'create') ? A.btn(t('a.add'), { attrs: 'data-new', icon: 'plus' }) : '')}
            <div class="cards-grid">${rows.map(r => `<article class="tx-card"><img src="${esc(r.image || (r.cover ? `assets/img/products/${r.cover[0]}/${r.cover[1]}-roll.webp` : 'assets/img/store/store-shelves-sm.webp'))}" alt="" loading="lazy">
              <div><h3>${esc(nm(r))}</h3><p class="muted small">${esc(A.L(r, 'desc'))}</p><p class="small"><b>${r.products}</b> ${esc(t('f.products'))} ${r.home ? `· <span class="ab">${esc(t('cat.homeShow'))}</span>` : ''} ${r.status === 'archived' ? A.badge('archived') : ''}</p></div>
              <div class="row-act">${A.can('products', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-edit="${r.id}"`) : ''}${A.can('products', 'delete') ? A.iconBtn('trash', t('a.delete'), `data-del="${r.id}"`) : ''}</div></article>`).join('')}</div>`;
          view.onclick = async e => {
            if (e.target.closest('[data-new]')) form(null);
            const ed = e.target.closest('[data-edit]'); if (ed) form(rows.find(r => r.id === ed.dataset.edit));
            const dl = e.target.closest('[data-del]'); if (dl && await A.confirm(t('a.delete') + '?', { danger: true })) { try { await A.call(`${table}.delete`, { id: dl.dataset.del }); A.toast(t('deleted')); await reloadLookups(); draw(); } catch (ex) { A.err(ex); } }
          };
        };
        const form = r => {
          r = r || { status: 'active', sort: 99 };
          const m = A.modal({ title: esc(r.id ? nm(r) : t('a.add')), size: 'md', body: `<form class="form-a grid-2" data-f novalidate>
            ${A.field({ name: 'name_en', label: t('f.nameEn'), value: r.name_en, req: true })}${A.field({ name: 'name_ar', label: t('f.nameAr'), value: r.name_ar, dir: 'rtl' })}
            ${A.field({ name: 'desc_en', label: t('f.descEn'), value: r.desc_en, type: 'textarea' })}${A.field({ name: 'desc_ar', label: t('f.descAr'), value: r.desc_ar, type: 'textarea', dir: 'rtl' })}
            ${A.field({ name: 'image', label: t('f.image') + ' (URL)', value: r.image, dir: 'ltr', hint: t('media.title') + ' → ' + t('media.setAs') })}
            ${A.field({ name: 'sort', label: t('f.sort'), value: r.sort, type: 'number', step: '1' })}
            ${A.field({ name: 'status', label: t('f.status'), value: r.status, type: 'select', options: ['active', 'archived'].map(s => [s, t('st.' + s)]) })}
            ${kind === 'cat' ? A.field({ name: 'home', label: t('cat.homeShow'), value: r.home, type: 'checkbox' }) : A.field({ name: 'editorial', label: t('cat.editorial'), value: (r.editorial || []).join('\n'), type: 'textarea', dir: 'ltr' })}
            </form>`, foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` });
          m.querySelector('[data-save]').onclick = async () => {
            const f = m.querySelector('[data-f]'); if (!A.validate(f)) return;
            const d = A.formData(f); if (d.editorial !== undefined) d.editorial = d.editorial.split('\n').map(x => x.trim()).filter(Boolean);
            try { await A.call(`${table}.save`, { id: r.id, data: d }); A.toast(t('saved')); A.closeModal(); await reloadLookups(); draw(); } catch (ex) { A.err(ex); }
          };
        };
        await draw();
      }
    };
  }
  P.categories = taxonomyPage('cat');
  P.collections = taxonomyPage('col');

  /* =========================== INVENTORY =========================== */
  const invState = { q: '', state: '', category: '', mq: '', mtype: '', rq: '', rstatus: '' };
  P.inventory = {
    perm: ['inventory', 'view'],
    async render(view, parts) {
      const tab = ['rolls', 'moves', 'labels'].includes(parts[0]) ? parts[0] : 'stock';
      view.innerHTML = `${A.head(esc(t('stock.title')), '', tab === 'rolls' && A.can('inventory', 'create') ? A.btn(t('stock.newRoll'), { attrs: 'data-newroll', icon: 'plus' }) : '')}
        ${A.tabs([[A.href('inventory'), t('stock.tabs.stock')], [A.href('inventory--rolls'), t('stock.tabs.rolls')], [A.href('inventory--moves'), t('stock.tabs.moves')], [A.href('inventory--labels'), t('stock.tabs.labels'), A.can('inventory', 'print')]], A.href(tab === 'stock' ? 'inventory' : 'inventory--' + tab))}
        <div data-body></div>`;
      ROKN.localizeLinks(view);
      const body = view.querySelector('[data-body]');
      A.bindTable(view, () => draw());
      let draw;
      if (tab === 'stock') {
        draw = async () => {
          const rows = await A.call('inventory.list', { q: invState.q, state: invState.state, category: invState.category });
          const tot = rows.reduce((s, r) => ({ m: s.m + r.available, c: s.c + r.value_cost, v: s.v + r.value_retail }), { m: 0, c: 0, v: 0 });
          body.innerHTML = `<div class="filters-a"><label class="srch">${I('search')}<input type="search" data-q="q" value="${esc(invState.q)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label>
              <select data-f="state" aria-label="${esc(t('f.state'))}"><option value="">${esc(t('f.state'))}: ${esc(t('a.all'))}</option>${['attention', 'low', 'out', 'ok'].map(s => `<option value="${s}"${invState.state === s ? ' selected' : ''}>${esc(s === 'attention' ? t('stock.attention') : t('st.' + s))}</option>`).join('')}</select>
              <select data-f="category" aria-label="${esc(t('f.category'))}"><option value="">${esc(t('f.category'))}: ${esc(t('a.all'))}</option>${A.lookups.categories.map(c => `<option value="${c.id}"${invState.category === c.id ? ' selected' : ''}>${esc(nm(c))}</option>`).join('')}</select></div>
            <div class="kpis sm"><div class="kpi"><span class="kpi-l">${esc(t('f.available'))}</span><b class="kpi-v">${A.m(tot.m)}</b></div><div class="kpi"><span class="kpi-l">${esc(t('stock.valuation'))}</span><b class="kpi-v">${A.money(tot.c)}</b></div><div class="kpi"><span class="kpi-l">${esc(t('stock.retail'))}</span><b class="kpi-v">${A.money(tot.v)}</b></div>
              <div class="kpi warn"><span class="kpi-l">${esc(t('st.low'))} / ${esc(t('st.out'))}</span><b class="kpi-v">${rows.filter(r => r.state === 'low').length} / ${rows.filter(r => r.state === 'out').length}</b></div></div>
            <div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))}</span>${A.can('inventory', 'export') ? A.exportBtns('inv-tbl') : ''}</div>
            ${A.table({ id: 'inv-tbl', title: t('stock.title'), rows, sort: 'available', dir: 1, rowAttr: r => `class="st-${r.state}"`, cols: [
              { k: 'sku', label: t('f.sku'), h: r => `<span class="mono" dir="ltr">${esc(r.sku)}</span>` },
              { k: 'barcode', label: t('f.barcode'), h: r => `<span class="mono small" dir="ltr">${esc(r.barcode || '')}</span>` },
              { k: 'product_en', label: t('f.product'), v: r => pn(r), h: r => `<a href="${A.href('products--edit--' + r.product_id)}">${esc(pn(r))}</a>` },
              { k: 'color', label: t('f.color'), v: r => A.colorName(r.color), h: r => `<span class="sw" style="--c:${A.colorHex(r.color)}"></span> ${esc(A.colorName(r.color))}` },
              { k: 'fabric_type', label: t('f.fabricType'), v: r => lk('fabric_types', r.fabric_type) },
              { k: 'width_cm', label: t('f.width'), m: true },
              { k: 'rolls', label: t('f.rolls'), m: true },
              { k: 'available', label: t('f.available'), m: true, h: r => `<b class="${r.state === 'out' ? 'bad' : r.state === 'low' ? 'warn' : ''}">${A.num(r.available)}</b>` },
              { k: 'reserved', label: t('f.reserved'), m: true }, { k: 'sold', label: t('f.sold'), m: true }, { k: 'damaged', label: t('f.damaged'), m: true }, { k: 'min', label: t('f.minStock'), m: true },
              { k: 'cost', label: t('f.costPerM'), money: true }, { k: 'price', label: t('f.pricePerM'), money: true }, { k: 'value_cost', label: t('f.value'), money: true },
              { k: 'state', label: t('f.state'), h: r => A.badge(r.state), x: r => r.state }],
              actions: r => `<div class="row-act">${A.can('inventory', 'edit') ? A.iconBtn('edit', t('a.adjust'), `data-adj="${r.id}"`) : ''}${A.iconBtn('logs', t('a.history'), `data-hist="${r.id}"`)}</div>` })}`;
          ROKN.localizeLinks(body);
          body.onclick = e => {
            const a = e.target.closest('[data-adj]'); if (a) adjust(rows.find(r => r.id === a.dataset.adj), draw);
            const h = e.target.closest('[data-hist]'); if (h) history(rows.find(r => r.id === h.dataset.hist));
          };
        };
      } else if (tab === 'rolls') {
        draw = async () => {
          const rows = await A.call('rolls.list', { q: invState.rq, status: invState.rstatus });
          body.innerHTML = `<div class="filters-a"><label class="srch">${I('search')}<input type="search" data-q="rq" value="${esc(invState.rq)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label>
            <select data-f="rstatus" aria-label="${esc(t('f.status'))}"><option value="">${esc(t('f.status'))}: ${esc(t('a.all'))}</option>${['available', 'partial', 'reserved', 'finished', 'damaged'].map(s => `<option value="${s}"${invState.rstatus === s ? ' selected' : ''}>${esc(s === 'partial' ? t('st.partial') : t('st.' + s))}</option>`).join('')}</select></div>
            <div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))} · ${A.m(rows.reduce((s, r) => s + r.remaining_m, 0))}</span>${A.can('inventory', 'export') ? A.exportBtns('roll-tbl') : ''}${A.can('inventory', 'print') ? `<button type="button" class="btn-a ghost sm" data-rlabels>${I('labels')} ${esc(t('stock.rollLabels'))}</button>` : ''}</div>
            ${A.table({ id: 'roll-tbl', title: t('nav.rolls'), rows, check: A.can('inventory', 'print'), cols: [
              { k: 'barcode', label: t('f.rollId'), h: r => `<span class="mono" dir="ltr">${esc(r.barcode)}</span>${A.demoTag(r)}` },
              { k: 'product_en', label: t('f.product'), v: r => pn(r) },
              { k: 'color', label: t('f.color'), v: r => A.colorName(r.color), h: r => `<span class="sw" style="--c:${A.colorHex(r.color)}"></span> ${esc(A.colorName(r.color))}` },
              { k: 'batch', label: t('f.batch') }, { k: 'supplier', label: t('f.supplier') },
              { k: 'original_m', label: t('f.original'), m: true },
              { k: 'remaining_m', label: t('f.remaining'), m: true, h: r => `<b>${A.num(r.remaining_m)}</b><span class="bar-mini"><span style="width:${Math.min(100, r.remaining_m / r.original_m * 100)}%"></span></span>` },
              { k: 'cost_per_meter', label: t('f.purchaseCost'), money: true }, { k: 'purchase_date', label: t('f.purchaseDate'), h: r => esc(A.date(r.purchase_date)) },
              { k: 'location', label: t('f.location') }, { k: 'status', label: t('f.status'), h: r => A.badge(r.status), x: r => r.status }],
              actions: r => `<div class="row-act">${A.can('inventory', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-roll="${r.id}"`) : ''}${A.iconBtn('logs', t('a.history'), `data-rhist="${r.id}"`)}</div>` })}`;
          body.onclick = async e => {
            const r = e.target.closest('[data-roll]'); if (r) rollForm(rows.find(x => x.id === r.dataset.roll), draw);
            const h = e.target.closest('[data-rhist]'); if (h) { const ro = rows.find(x => x.id === h.dataset.rhist); history({ id: ro.variant_id, sku: ro.sku, product_en: ro.product_en, product_ar: ro.product_ar, color: ro.color }, ro.id); }
            if (e.target.closest('[data-rlabels]')) {
              const sel = new Set([...body.querySelectorAll('input[name="sel[]"]:checked')].map(x => x.value));
              const list = (sel.size ? rows.filter(x => sel.has(x.id)) : rows.filter(x => x.remaining_m > 0).slice(0, 24));
              A.print(A.docs.labels(list.map(x => ({ name: pn(x), color: A.colorName(x.color), sku: x.sku, code: x.barcode, price: `${A.num(x.remaining_m)} m`, extra: x.location || '' }))), 'label-50x30', { title: 'Roll labels' });
            }
          };
        };
        view.addEventListener('click', e => { if (e.target.closest('[data-newroll]')) rollForm(null, draw); });
      } else if (tab === 'moves') {
        const ms = invState.moves = invState.moves || Object.assign({}, { preset: 'd30' }, (() => { const [from, to] = A.range('d30'); return { from, to }; })());
        draw = async () => {
          const rows = await A.call('inventory.transactions', { from: ms.from, to: ms.to, type: invState.mtype });
          const q = invState.mq.toLowerCase();
          const list = q ? rows.filter(r => [r.sku, r.product_en, r.product_ar, r.reason, r.user_name].join(' ').toLowerCase().includes(q)) : rows;
          body.innerHTML = `<div class="filters-a">${A.period(ms)}<select data-f="mtype" aria-label="${esc(t('f.type'))}"><option value="">${esc(t('f.type'))}: ${esc(t('a.all'))}</option>${['opening', 'purchase', 'sale', 'return', 'damage', 'adjustment', 'transfer', 'reservation', 'release'].map(s => `<option value="${s}"${invState.mtype === s ? ' selected' : ''}>${esc(t('inv.' + s))}</option>`).join('')}</select>
            <label class="srch">${I('search')}<input type="search" data-q="mq" value="${esc(invState.mq)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label></div>
            <div class="sum-strip"><span>${esc(t('rows', { n: list.length }))}</span>${A.can('inventory', 'export') ? A.exportBtns('mv-tbl') : ''}</div>${movesTable('mv-tbl', list)}`;
        };
        A.bindPeriod(view, ms, () => draw());
      } else {
        draw = async () => {
          const rows = await A.call('inventory.list', { q: invState.q });
          body.innerHTML = `<p class="muted">${esc(t('stock.labelsHint'))}</p>
            <div class="filters-a"><label class="srch">${I('search')}<input type="search" data-q="q" value="${esc(invState.q)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label>
            <button type="button" class="btn-a primary" data-plabels>${I('print')} ${esc(t('stock.printLabels'))}</button></div>
            <div class="tbl-wrap"><table class="tbl"><thead><tr><th class="chk"><input type="checkbox" data-check-all="lbl" aria-label="${esc(t('a.all'))}"></th><th>${esc(t('f.product'))}</th><th>${esc(t('f.color'))}</th><th>${esc(t('f.sku'))}</th><th>${esc(t('f.barcode'))}</th><th class="num">${esc(t('f.pricePerM'))}</th><th class="num">${esc(t('stock.copies'))}</th></tr></thead>
            <tbody>${rows.map(r => `<tr><td class="chk"><input type="checkbox" name="sel[]" value="${r.id}" aria-label="${esc(t('a.select'))}"></td><td>${esc(pn(r))}</td><td><span class="sw" style="--c:${A.colorHex(r.color)}"></span> ${esc(A.colorName(r.color))}</td><td class="mono" dir="ltr">${esc(r.sku)}</td><td>${A.barcode(r.barcode || r.sku, { h: 22, text: false, w: 110 })}</td><td class="num">${A.money(r.price, true)}</td><td class="num"><input type="number" class="in-sm" min="1" max="50" value="1" data-copies="${r.id}" aria-label="${esc(t('stock.copies'))}"></td></tr>`).join('')}</tbody></table></div>`;
          body.onclick = e => {
            if (e.target.closest('[data-plabels]')) {
              const sel = [...body.querySelectorAll('input[name="sel[]"]:checked')].map(x => x.value);
              if (!sel.length) return A.toast(t('stock.selected', { n: 0 }), 'err');
              const items = [];
              sel.forEach(id => { const r = rows.find(x => x.id === id); const n = Math.max(1, Math.min(50, +body.querySelector(`[data-copies="${CSS.escape(id)}"]`).value || 1)); for (let i = 0; i < n; i++) items.push({ name: pn(r), color: A.colorName(r.color), sku: r.sku, code: r.barcode || r.sku, price: `${A.money(r.price)}/${A.isAr() ? 'م' : 'm'}`, extra: r.width_cm ? `${r.width_cm} cm` : '' }); });
              const prn = (A.me.printers || []).find(p => p.type === 'label');
              A.print(A.docs.labels(items), (prn && prn.paper) || 'label-50x30', { title: 'Labels' });
            }
          };
        };
      }
      view.addEventListener('input', A.debounce(e => { const q = e.target.closest('[data-q]'); if (q) { invState[q.dataset.q] = q.value; draw().then(() => { const el = view.querySelector(`[data-q="${q.dataset.q}"]`); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }); } }, 300));
      view.addEventListener('change', e => { const f = e.target.closest('select[data-f]'); if (f) { invState[f.dataset.f] = f.value; draw(); } });
      await draw();
    }
  };
  const movesTable = (id, rows) => A.table({ id, title: t('stock.tabs.moves'), rows, cols: [
    { k: 'created_at', label: t('f.date'), h: r => esc(A.dt(r.created_at)), x: r => r.created_at.replace('T', ' ').slice(0, 16) },
    { k: 'type', label: t('f.type'), h: r => `<span class="ab ab-${r.type}">${esc(t('inv.' + r.type))}</span>`, x: r => r.type },
    { k: 'sku', label: t('f.sku'), h: r => `<span class="mono" dir="ltr">${esc(r.sku || '')}</span>` },
    { k: 'product_en', label: t('f.product'), v: r => `${pn(r)} · ${A.colorName(r.color)}` },
    { k: 'qty_m', label: t('f.meters'), m: true, h: r => `<b class="${r.qty_m < 0 ? 'bad' : 'good'}" dir="ltr">${r.qty_m > 0 ? '+' : ''}${A.num(r.qty_m)}</b>` },
    { k: 'before_m', label: t('f.before'), m: true }, { k: 'after_m', label: t('f.after'), m: true },
    { k: 'reason', label: t('f.reason'), cls: 'trunc' }, { k: 'user_name', label: t('f.user') }] });
  function adjust(r, after) {
    const m = A.modal({ title: esc(t('stock.adjustT', { n: `${pn(r)} · ${A.colorName(r.color)}` })), body: `<form class="form-a" data-f novalidate>
      <p class="muted"><span dir="ltr">${esc(r.sku)}</span> · ${esc(t('f.available'))}: <b>${A.m(r.available)}</b> · ${esc(t('f.reserved'))}: ${A.m(r.reserved)}</p>
      <div class="grid-2">${A.field({ name: 'type', label: t('f.type'), type: 'select', options: ['adjustment', 'damage', 'return', 'purchase', 'reservation', 'release', 'transfer'].map(x => [x, t('inv.' + x)]) })}
      ${A.field({ name: 'qty', label: t('stock.qtyHint'), type: 'number', step: '0.5', req: true })}</div>
      ${A.field({ name: 'reason', label: t('f.reason'), req: true })}</form>`,
      foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` });
    m.querySelector('[data-save]').onclick = async () => {
      const f = m.querySelector('[data-f]'); if (!A.validate(f)) return;
      const d = A.formData(f);
      try { const res = await A.call('inventory.adjust', { variant_id: r.id, type: d.type, qty: d.qty, reason: d.reason }); A.toast(`${t('stock.adjusted')} → ${A.m(res.after)}`); A.closeModal(); after(); A.shell.refreshUnread(); } catch (ex) { A.err(ex); }
    };
  }
  async function history(r, rollId) {
    const rows = await A.call('inventory.transactions', { variant_id: rollId ? null : r.id, roll_id: rollId || null });
    A.modal({ size: 'xl', title: esc(t('stock.historyT', { n: `${pn(r)} · ${A.colorName(r.color)} (${r.sku})` })), body: `<div data-title="${esc(r.sku)}">${A.exportBtns('hist-tbl')}${movesTable('hist-tbl', rows)}</div>`,
      onMount: m => m.addEventListener('click', e => { const x = e.target.closest('[data-export]'); if (x) A.exportTable('hist-tbl', x.dataset.export, 'stock-' + r.sku); }) });
  }
  async function rollForm(r, after) {
    const isNew = !r;
    const inv = isNew ? await A.call('inventory.list', {}) : null;
    const m = A.modal({ title: esc(isNew ? t('stock.newRoll') : t('stock.rollT', { n: r.barcode })), size: 'md', body: `<form class="form-a grid-2" data-f novalidate>
      ${isNew ? A.field({ name: 'variant_id', label: t('f.product'), type: 'select', req: true, cls: 'span-2', options: A.opts(inv.map(v => [v.id, `${pn(v)} · ${A.colorName(v.color)} (${v.sku})`]), null, '—') }) + A.field({ name: 'original_m', label: t('f.original') + ' (m)', type: 'number', step: '0.5', min: 0.5, req: true }) + A.field({ name: 'cost_per_meter', label: t('f.purchaseCost'), type: 'number', step: '0.001', min: 0 }) : `<p class="span-2 muted">${esc(pn(r))} · ${esc(A.colorName(r.color))} · ${esc(t('f.remaining'))} <b>${A.m(r.remaining_m)}</b> / ${A.m(r.original_m)}</p>`}
      ${A.field({ name: 'barcode', label: t('f.barcode'), value: r && r.barcode, dir: 'ltr', ph: 'auto' })}
      ${A.field({ name: 'batch', label: t('f.batch'), value: r && r.batch })}
      ${A.field({ name: 'supplier_id', label: t('f.supplier'), type: 'select', value: r && r.supplier_id, options: A.opts((A.lookups.suppliers || []).map(s => [s.id, s.name]), null, '—') })}
      ${A.field({ name: 'location', label: t('f.location'), value: r && r.location })}
      ${A.field({ name: 'purchase_date', label: t('f.purchaseDate'), type: 'date', value: (r && r.purchase_date) || A.day() })}
      ${isNew ? A.field({ name: 'counts_as_purchase', label: t('inv.purchase'), type: 'checkbox', value: true }) : A.field({ name: 'status', label: t('f.status'), type: 'select', value: r.status, options: ['available', 'partial', 'reserved', 'finished', 'damaged'].map(s => [s, s === 'partial' ? t('st.partial') : t('st.' + s)]) })}
      </form>`, foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` });
    m.querySelector('[data-save]').onclick = async () => {
      const f = m.querySelector('[data-f]'); if (!A.validate(f)) return;
      try { await A.call('rolls.save', { id: r && r.id, data: A.formData(f) }); A.toast(t('saved')); A.closeModal(); after(); } catch (ex) { A.err(ex); }
    };
  }

  /* =========================== PURCHASES =========================== */
  const poState = { status: '' };
  P.purchases = {
    perm: ['purchases', 'view'],
    async render(view) {
      const draw = async () => {
        const rows = await A.call('purchases.list', poState);
        view.innerHTML = `${A.head(esc(t('po.title')), '', A.can('purchases', 'create') ? A.btn(t('po.newT'), { attrs: 'data-new', icon: 'plus' }) : '')}
          <div class="filters-a"><select data-f="status" aria-label="${esc(t('f.status'))}"><option value="">${esc(t('f.status'))}: ${esc(t('a.all'))}</option>${['draft', 'ordered', 'received', 'cancelled'].map(s => `<option value="${s}"${poState.status === s ? ' selected' : ''}>${esc(t('st.' + s))}</option>`).join('')}</select></div>
          <div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))} · ${A.money(rows.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.total, 0))}</span>${A.can('purchases', 'export') ? A.exportBtns('po-tbl') : ''}</div>
          ${A.table({ id: 'po-tbl', title: t('po.title'), rows, cols: [
            { k: 'number', label: t('f.number'), h: r => `<button type="button" class="lnk mono" data-open="${r.id}">${esc(r.number)}</button>${A.demoTag(r)}` },
            { k: 'supplier', label: t('f.supplier') }, { k: 'date', label: t('f.date'), h: r => esc(A.date(r.date)) },
            { k: 'lines', label: t('f.products'), m: true }, { k: 'qty', label: t('f.rolls'), m: true }, { k: 'meters', label: t('f.meters'), m: true },
            { k: 'total', label: t('f.total'), money: true }, { k: 'paid', label: t('f.paid'), money: true },
            { k: 'payment_status', label: t('f.payStatus'), h: r => A.badge(r.payment_status), x: r => r.payment_status },
            { k: 'status', label: t('f.status'), h: r => A.badge(r.status), x: r => r.status }],
            actions: r => `<div class="row-act">${A.iconBtn('eye', t('a.view'), `data-open="${r.id}"`)}${['draft', 'ordered'].includes(r.status) && A.can('purchases', 'edit') ? A.iconBtn('download', t('a.receive'), `data-recv="${r.id}"`) : ''}</div>` })}`;
        view.onclick = async e => {
          if (A.tableClick(e, draw)) return;
          const x = e.target.closest('[data-export]'); if (x) return A.exportTable(x.dataset.tbl, x.dataset.export, t('po.title'));
          if (e.target.closest('[data-new]')) poForm(null, draw);
          const o = e.target.closest('[data-open]'); if (o) poView(o.dataset.open, draw);
          const rc = e.target.closest('[data-recv]'); if (rc) receive(rows.find(r => r.id === rc.dataset.recv), draw);
        };
        view.onchange = e => { const f = e.target.closest('[data-f]'); if (f) { poState[f.dataset.f] = f.value; draw(); } };
      };
      await draw();
    }
  };
  async function receive(po, after) {
    const m = A.modal({ title: esc(t('a.receive')) + ' · ' + esc(po.number), size: 'sm', body: `<p>${esc(t('po.receiveQ', { n: po.number }))}</p><form class="form-a" data-f>${A.field({ name: 'batch', label: t('po.batch'), value: po.number })}${A.field({ name: 'location', label: t('po.location') })}</form>`,
      foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-go>${I('download')} ${esc(t('a.receive'))}</button>` });
    m.querySelector('[data-go]').onclick = async () => { try { await A.call('purchases.receive', Object.assign({ id: po.id }, A.formData(m.querySelector('[data-f]')))); A.toast(t('po.received')); A.closeAllModals(); after(); } catch (ex) { A.err(ex); } };
  }
  async function poView(id, after) {
    const po = await A.call('purchases.get', { id });
    const edit = ['draft', 'ordered'].includes(po.status) && A.can('purchases', 'edit');
    const m = A.modal({ size: 'lg', title: `${esc(t('po.editT', { n: po.number }))} ${A.badge(po.status)} ${A.demoTag(po)}`, body: `
      <div class="det-grid"><div><small>${esc(t('f.supplier'))}</small><b>${esc(po.supplier ? po.supplier.name : '')}</b></div><div><small>${esc(t('f.date'))}</small><b>${esc(A.date(po.date))}</b></div><div><small>${esc(t('f.payStatus'))}</small>${A.badge(po.payment_status)} ${A.money(po.paid)} / ${A.money(po.total)}</div><div><small>${esc(t('f.created'))}</small><span>${esc(po.created_by || '')}</span></div></div>
      ${A.table({ id: 'po-items', all: true, rows: po.items, cols: [{ k: 'product_en', label: t('f.product'), v: r => `${pn(r)} · ${A.colorName(r.color)}` }, { k: 'sku', label: t('f.sku') }, { k: 'rolls', label: t('f.rolls'), m: true }, { k: 'meters', label: t('f.meters'), m: true }, { k: 'cost_per_meter', label: t('f.costPerM'), money: true }, { k: 'total', label: t('f.total'), money: true }] })}
      ${po.notes ? `<p class="note-a">${esc(po.notes)}</p>` : ''}`,
      foot: `${A.can('purchases', 'print') || true ? `<button type="button" class="btn-a ghost" data-print>${I('print')} ${esc(t('a.print'))}</button>` : ''}${A.can('purchases', 'edit') && po.status !== 'cancelled' ? `<button type="button" class="btn-a ghost" data-pay>${esc(t('po.payment'))}</button>` : ''}${edit ? `<button type="button" class="btn-a ghost" data-edit>${I('edit')} ${esc(t('a.edit'))}</button><button type="button" class="btn-a primary" data-recv>${I('download')} ${esc(t('a.receive'))}</button>` : ''}${A.can('purchases', 'delete') && ['draft', 'ordered'].includes(po.status) ? `<button type="button" class="btn-a danger-ghost" data-cancel>${esc(t('a.cancel'))}</button>` : ''}` });
    m.addEventListener('click', async e => {
      if (e.target.closest('[data-recv]')) receive(po, after);
      if (e.target.closest('[data-edit]')) { A.closeModal(); poForm(po, after); }
      if (e.target.closest('[data-cancel]') && await A.confirm(t('a.cancel') + ' ' + po.number + '?', { danger: true })) { try { await A.call('purchases.cancel', { id: po.id }); A.closeAllModals(); after(); } catch (ex) { A.err(ex); } }
      if (e.target.closest('[data-pay]')) { const v = await A.confirm(t('po.payment'), { input: t('po.paidAmount') }); if (v && v !== true) { try { await A.call('purchases.setPayment', { id: po.id, paid: +v }); A.toast(t('saved')); A.closeAllModals(); after(); } catch (ex) { A.err(ex); } } }
      if (e.target.closest('[data-print]')) A.print(A.docs.report(`${t('po.editT', { n: po.number })}`, `<table class="r-tbl"><thead><tr><th>${esc(t('f.product'))}</th><th>${esc(t('f.sku'))}</th><th class="n">${esc(t('f.rolls'))}</th><th class="n">${esc(t('f.meters'))}</th><th class="n">${esc(t('f.costPerM'))}</th><th class="n">${esc(t('f.total'))}</th></tr></thead><tbody>${po.items.map(i => `<tr><td>${esc(pn(i))} · ${esc(A.colorName(i.color))}</td><td>${esc(i.sku)}</td><td class="n">${i.rolls}</td><td class="n">${A.num(i.meters)}</td><td class="n">${A.money(i.cost_per_meter, true)}</td><td class="n">${A.money(i.total, true)}</td></tr>`).join('')}</tbody></table>`, [[t('f.supplier'), po.supplier ? po.supplier.name : ''], [t('f.date'), A.date(po.date)], [t('f.total'), A.money(po.total)]]), 'A4');
    });
  }
  async function poForm(po, after) {
    const inv = await A.call('inventory.list', {});
    const sups = await A.call('suppliers.list', {});
    po = po || { date: A.day(), status: 'ordered', items: [{}] };
    const row = it => `<tr data-line><td><select name="variant_id" aria-label="${esc(t('f.product'))}">${inv.map(v => `<option value="${v.id}"${v.id === it.variant_id ? ' selected' : ''}>${esc(pn(v))} · ${esc(A.colorName(v.color))}</option>`).join('')}</select></td>
      <td><input type="number" name="rolls" min="1" step="1" value="${it.rolls || 1}" class="in-sm" aria-label="${esc(t('f.rolls'))}"></td><td><input type="number" name="meters" min="0.5" step="0.5" value="${it.meters || 50}" class="in-sm" aria-label="${esc(t('f.meters'))}"></td>
      <td><input type="number" name="cost_per_meter" min="0" step="0.001" value="${it.cost_per_meter == null ? '' : it.cost_per_meter}" class="in-sm" aria-label="${esc(t('f.costPerM'))}"></td><td class="num" data-lt></td><td>${A.iconBtn('trash', t('a.remove'), 'data-rm')}</td></tr>`;
    const m = A.modal({ size: 'xl', title: esc(po.id ? t('po.editT', { n: po.number }) : t('po.newT')), body: `<form class="form-a" data-f novalidate><div class="grid-3">
      ${A.field({ name: 'supplier_id', label: t('f.supplier'), type: 'select', req: true, value: po.supplier_id, options: A.opts(sups.map(s => [s.id, s.name]), null, '—') })}
      ${A.field({ name: 'date', label: t('f.date'), type: 'date', value: po.date, req: true })}
      ${A.field({ name: 'status', label: t('f.status'), type: 'select', value: po.status, options: ['draft', 'ordered'].map(s => [s, t('st.' + s)]) })}</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${esc(t('f.product'))}</th><th>${esc(t('f.rolls'))}</th><th>${esc(t('f.meters'))}</th><th>${esc(t('f.costPerM'))}</th><th class="num">${esc(t('f.total'))}</th><th></th></tr></thead><tbody data-lines>${po.items.map(row).join('')}</tbody></table></div>
      <button type="button" class="btn-a ghost sm" data-add>${I('plus')} ${esc(t('po.addLine'))}</button><p class="tot-line" data-total></p>
      ${A.field({ name: 'notes', label: t('f.notes'), type: 'textarea', value: po.notes })}</form>`,
      foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` });
    const recalc = () => { let s = 0; m.querySelectorAll('[data-line]').forEach(tr => { const v = (+tr.querySelector('[name=meters]').value || 0) * (+tr.querySelector('[name=cost_per_meter]').value || 0); s += v; tr.querySelector('[data-lt]').textContent = A.money(v, true); }); m.querySelector('[data-total]').innerHTML = `${esc(t('f.total'))}: <b>${A.money(s)}</b>`; };
    recalc(); m.addEventListener('input', recalc);
    m.addEventListener('click', async e => {
      if (e.target.closest('[data-add]')) { m.querySelector('[data-lines]').insertAdjacentHTML('beforeend', row({})); recalc(); }
      const rm = e.target.closest('[data-rm]'); if (rm) { rm.closest('tr').remove(); recalc(); }
      if (e.target.closest('[data-save]')) {
        const f = m.querySelector('[data-f]'); if (!A.validate(f)) return;
        const d = A.formData(f);
        d.items = [...m.querySelectorAll('[data-line]')].map(tr => ({ variant_id: tr.querySelector('[name=variant_id]').value, rolls: +tr.querySelector('[name=rolls]').value, meters: +tr.querySelector('[name=meters]').value, cost_per_meter: +tr.querySelector('[name=cost_per_meter]').value }));
        ['variant_id', 'rolls', 'meters', 'cost_per_meter'].forEach(k => delete d[k]);
        try { await A.call('purchases.save', { id: po.id, data: d }); A.toast(t('saved')); A.closeModal(); after(); } catch (ex) { A.err(ex); }
      }
    });
  }

  /* =========================== SUPPLIERS =========================== */
  P.suppliers = {
    perm: ['suppliers', 'view'],
    async render(view) {
      const draw = async () => {
        const rows = await A.call('suppliers.list', {});
        view.innerHTML = `${A.head(esc(t('sup.title')), '', A.can('suppliers', 'create') ? A.btn(t('sup.newT'), { attrs: 'data-new', icon: 'plus' }) : '')}
          <div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))}</span>${A.can('suppliers', 'export') ? A.exportBtns('sup-tbl') : ''}</div>
          ${A.table({ id: 'sup-tbl', title: t('sup.title'), rows, cols: [{ k: 'name', label: t('f.name'), h: r => `<b>${esc(r.name)}</b>${A.demoTag(r)}` }, { k: 'contact', label: t('f.contact') }, { k: 'phone', label: t('f.phone'), h: r => `<span dir="ltr">${esc(r.phone || '')}</span>` }, { k: 'email', label: t('f.email') }, { k: 'country', label: t('f.country') },
            { k: 'po_count', label: t('sup.pos'), m: true }, { k: 'purchased', label: t('sup.purchased'), money: true }, { k: 'balance', label: t('f.balance'), money: true }, { k: 'status', label: t('f.status'), h: r => A.badge(r.status), x: r => r.status }],
            actions: r => `<div class="row-act">${A.can('suppliers', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-edit="${r.id}"`) : ''}${A.can('suppliers', 'delete') ? A.iconBtn('trash', t('a.delete'), `data-del="${r.id}"`) : ''}</div>` })}`;
        view.onclick = async e => {
          if (A.tableClick(e, draw)) return;
          const x = e.target.closest('[data-export]'); if (x) return A.exportTable(x.dataset.tbl, x.dataset.export, t('sup.title'));
          const ed = e.target.closest('[data-edit]'); if (ed || e.target.closest('[data-new]')) A.crudForm('suppliers', ed ? rows.find(r => r.id === ed.dataset.edit) : null, [['name', 'f.name', { req: true }], ['contact', 'f.contact'], ['phone', 'f.phone', { type: 'tel', dir: 'ltr' }], ['email', 'f.email', { type: 'email' }], ['country', 'f.country'], ['address', 'f.address'], ['status', 'f.status', { type: 'select', options: ['active', 'inactive'].map(s => [s, t('st.' + s)]) }], ['notes', 'f.notes', { type: 'textarea', cls: 'span-2' }]], async () => { await reloadLookups(); draw(); }, t('sup.newT'));
          const dl = e.target.closest('[data-del]'); if (dl && await A.confirm(t('a.delete') + '?', { danger: true })) { try { await A.call('suppliers.delete', { id: dl.dataset.del }); A.toast(t('deleted')); draw(); } catch (ex) { A.err(ex); } }
        };
      };
      await draw();
    }
  };
  /* generic create/edit modal: fields [[name, labelKey, opts]] */
  A.crudForm = function (table, row, fields, after, newTitle, extra) {
    row = row || {};
    const m = A.modal({ title: esc(row.id ? (row.name || row.name_en || row.code || row.id) : newTitle), size: 'md', body: `<form class="form-a grid-2" data-f novalidate>${fields.map(([k, l, o]) => A.field(Object.assign({ name: k, label: t(l), value: row[k] }, o || {}))).join('')}</form>`,
      foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` });
    m.querySelector('[data-save]').onclick = async () => {
      const f = m.querySelector('[data-f]'); if (!A.validate(f)) return;
      const data = A.formData(f); if (extra) extra(data);
      try { await A.call(`${table}.save`, { id: row.id, data }); A.toast(t('saved')); A.closeModal(); after && after(); } catch (ex) { A.err(ex); }
    };
  };

  /* =========================== CUSTOMERS =========================== */
  const custState = { q: '' };
  P.customers = {
    perm: ['customers', 'view'],
    async render(view, parts) {
      const draw = async () => {
        const rows = await A.call('customers.list', custState);
        view.querySelector('[data-body]').innerHTML = `<div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))}</span>${A.can('customers', 'export') ? A.exportBtns('cus-tbl') : ''}</div>
          ${A.table({ id: 'cus-tbl', title: t('cust.title'), rows, cols: [
            { k: 'name', label: t('f.name'), h: r => `<button type="button" class="lnk strong" data-open="${r.id}">${esc(r.name)}</button>${A.demoTag(r)}` },
            { k: 'phone', label: t('f.phone'), h: r => `<span dir="ltr">${esc(r.phone || '')}</span>` }, { k: 'email', label: t('f.email') },
            { k: 'orders', label: t('f.orders'), m: true }, { k: 'spent', label: t('f.spent'), money: true }, { k: 'last', label: t('f.lastOrder'), h: r => esc(r.last ? A.date(r.last) : '—') },
            { k: 'source', label: t('f.channel'), h: r => esc(r.source === 'web' ? t('ch.web') : t('ch.pos')) }],
            actions: r => `<div class="row-act">${A.iconBtn('eye', t('a.view'), `data-open="${r.id}"`)}${A.can('customers', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-edit="${r.id}"`) : ''}${r.phone ? `<a class="ab-icon" href="${A.waLink(r.phone, '')}" target="_blank" rel="noopener" aria-label="WhatsApp" title="WhatsApp">${I('wa')}</a>` : ''}</div>` })}`;
        view.querySelector('[data-body]').onclick = e => {
          const o = e.target.closest('[data-open]'); if (o) profile(o.dataset.open, draw);
          const ed = e.target.closest('[data-edit]'); if (ed) custForm(rows.find(r => r.id === ed.dataset.edit), draw);
        };
      };
      view.innerHTML = `${A.head(esc(t('cust.title')), '', A.can('customers', 'create') ? A.btn(t('cust.newT'), { attrs: 'data-new', icon: 'plus' }) : '')}
        <div class="filters-a"><label class="srch">${I('search')}<input type="search" data-q value="${esc(custState.q)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label></div><div data-body></div>`;
      A.bindTable(view, draw);
      view.addEventListener('input', A.debounce(e => { if (e.target.matches('[data-q]')) { custState.q = e.target.value; draw(); } }, 250));
      view.addEventListener('click', e => { if (e.target.closest('[data-new]')) custForm(null, draw); });
      await draw();
      if (parts[0] === 'view' && parts[1]) profile(parts[1], draw);
    }
  };
  function custForm(c, after) {
    c = c || {};
    const a = (c.addresses || [])[0] || {};
    A.crudForm('customers', c, [['name', 'f.name', { req: true }], ['phone', 'f.phone', { type: 'tel', dir: 'ltr' }], ['email', 'f.email', { type: 'email' }], ['lang', 'f.language', { type: 'select', options: [['', '—'], ['en', 'English'], ['ar', 'العربية']] }],
      ['addr_city', 'f.address', { value: [a.city, a.area, a.block && 'Block ' + a.block, a.street && 'St ' + a.street].filter(Boolean).join(', '), cls: 'span-2' }], ['notes', 'f.notes', { type: 'textarea', cls: 'span-2' }]], after, t('cust.newT'),
      d => { const s = d.addr_city; delete d.addr_city; d.addresses = s ? [{ city: s }] : []; });
  }
  async function profile(id, after) {
    const c = await A.call('customers.get', { id });
    const s = c.stats;
    const m = A.modal({ size: 'xl', title: `${esc(c.name)} ${A.demoTag(c)}`, body: `
      <div class="det-grid"><div><small>${esc(t('f.phone'))}</small><b dir="ltr">${esc(c.phone || '—')}</b></div><div><small>${esc(t('f.email'))}</small><b>${esc(c.email || '—')}</b></div><div><small>${esc(t('f.address'))}</small><span>${esc((c.addresses || []).map(a => Object.values(a).filter(Boolean).join(', ')).join(' / ') || '—')}</span></div><div><small>${esc(t('f.created'))}</small><span>${esc(A.date(c.created_at))}</span></div></div>
      <div class="kpis sm"><div class="kpi"><span class="kpi-l">${esc(t('f.orders'))}</span><b class="kpi-v">${s.orders}</b></div><div class="kpi"><span class="kpi-l">${esc(t('f.spent'))}</span><b class="kpi-v">${A.money(s.spent)}</b></div><div class="kpi"><span class="kpi-l">${esc(t('f.meters'))}</span><b class="kpi-v">${A.num(s.meters)}</b></div><div class="kpi"><span class="kpi-l">${esc(t('f.aov'))}</span><b class="kpi-v">${A.money(s.aov)}</b></div><div class="kpi"><span class="kpi-l">${esc(t('f.lastOrder'))}</span><b class="kpi-v sm">${esc(s.last ? A.date(s.last) : '—')}</b></div></div>
      <h3 class="h3-a">${esc(t('cust.favorites'))}</h3><div class="fav-row">${c.favorites.map(f => `<div class="fav"><b>${esc(pn(f))}</b><span class="a-dots">${f.colors.map(x => `<i class="sw" style="--c:${A.colorHex(x)}" title="${esc(A.colorName(x))}"></i>`).join('')}</span><small>${A.m(f.meters)}</small></div>`).join('') || `<p class="muted">${esc(t('noData'))}</p>`}</div>
      <h3 class="h3-a">${esc(t('cust.history'))}</h3>${A.table({ id: 'cus-orders', all: true, rows: c.orders, cols: [{ k: 'number', label: t('f.invoiceNo'), h: r => `<a class="mono" href="${A.href('sales--view--' + r.id)}">${esc(r.number)}</a>` }, { k: 'created_at', label: t('f.date'), h: r => esc(A.dt(r.created_at)) }, { k: 'channel', label: t('f.channel'), h: r => esc(t('ch.' + r.channel)) }, { k: 'total', label: t('f.total'), money: true }, { k: 'status', label: t('f.status'), h: r => A.badge(r.status) }] })}
      ${c.notes ? `<p class="note-a">${esc(c.notes)}</p>` : ''}`,
      foot: `${c.phone ? `<a class="btn-a ghost" href="${A.waLink(c.phone, '')}" target="_blank" rel="noopener">${I('wa')} WhatsApp</a>` : ''}${A.can('customers', 'edit') ? `<button type="button" class="btn-a ghost" data-edit>${I('edit')} ${esc(t('a.edit'))}</button>` : ''}${A.can('customers', 'delete') && !c.orders.length ? `<button type="button" class="btn-a danger-ghost" data-del>${I('trash')} ${esc(t('a.delete'))}</button>` : ''}` });
    ROKN.localizeLinks(m);
    m.addEventListener('click', async e => {
      if (e.target.closest('a[href*="sales--view"]')) A.closeAllModals();
      if (e.target.closest('[data-edit]')) { A.closeModal(); custForm(c, after); }
      if (e.target.closest('[data-del]') && await A.confirm(t('a.delete') + ' ' + c.name + '?', { danger: true })) { try { await A.call('customers.delete', { id: c.id }); A.closeAllModals(); after(); } catch (ex) { A.err(ex); } }
    });
  }

  /* =========================== EXPENSES =========================== */
  const expState = Object.assign({ category: '', q: '' }, (() => { const [from, to] = A.range('month'); return { preset: 'month', from, to }; })());
  P.expenses = {
    perm: ['expenses', 'view'],
    async render(view) {
      const cats = ['rent', 'salary', 'electricity', 'internet', 'transportation', 'marketing', 'packaging', 'maintenance', 'supplies', 'other'];
      const draw = async () => {
        const rows = await A.call('expenses.list', expState);
        const by = {}; rows.forEach(r => { by[r.category] = (by[r.category] || 0) + r.amount; });
        view.querySelector('[data-body]').innerHTML = `
          <div class="grid-dash"><section class="card-a"><header class="card-h"><h2>${esc(t('exp.total'))}</h2></header><p class="big-num">${A.money(rows.reduce((s, r) => s + r.amount, 0))}</p></section>
          <section class="card-a span-2"><header class="card-h"><h2>${esc(t('exp.byCat'))}</h2></header>${A.chart.bars(Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: t('ex.' + k), value: v })), { money: true })}</section></div>
          <div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))}</span>${A.can('expenses', 'export') ? A.exportBtns('exp-tbl') : ''}</div>
          ${A.table({ id: 'exp-tbl', title: t('exp.title'), rows, cols: [
            { k: 'number', label: t('f.number'), h: r => `<span class="mono">${esc(r.number)}</span>${A.demoTag(r)}` }, { k: 'date', label: t('f.date'), h: r => esc(A.date(r.date)) },
            { k: 'category', label: t('f.category'), h: r => `<span class="ab">${esc(t('ex.' + r.category))}</span>`, x: r => r.category }, { k: 'description', label: t('f.description'), cls: 'trunc' },
            { k: 'amount', label: t('f.amount'), money: true }, { k: 'payment_method', label: t('f.method'), h: r => esc(t('pm.' + r.payment_method)), x: r => r.payment_method },
            { k: 'created_by_name', label: t('f.user') }, { k: 'attachment', label: t('f.attachment'), sortable: false, export: false, h: r => r.attachment ? `<a href="${esc(r.attachment)}" target="_blank" rel="noopener" download="${esc(r.number)}">${I('file')}</a>` : '' }],
            actions: r => `<div class="row-act">${A.can('expenses', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-edit="${r.id}"`) : ''}${A.can('expenses', 'delete') ? A.iconBtn('trash', t('a.delete'), `data-del="${r.id}"`) : ''}</div>` })}`;
        view.querySelector('[data-body]').onclick = async e => {
          const ed = e.target.closest('[data-edit]'); if (ed) form(rows.find(r => r.id === ed.dataset.edit));
          const dl = e.target.closest('[data-del]'); if (dl && await A.confirm(t('a.delete') + '?', { danger: true })) { try { await A.call('expenses.delete', { id: dl.dataset.del }); A.toast(t('deleted')); draw(); } catch (ex) { A.err(ex); } }
        };
      };
      const form = r => {
        r = r || { date: A.day(), payment_method: 'cash', category: 'other' };
        const m = A.modal({ title: esc(r.id ? r.number : t('exp.newT')), size: 'md', body: `<form class="form-a grid-2" data-f novalidate>
          ${A.field({ name: 'date', label: t('f.date'), type: 'date', value: r.date, req: true })}${A.field({ name: 'category', label: t('f.category'), type: 'select', value: r.category, options: cats.map(c => [c, t('ex.' + c)]) })}
          ${A.field({ name: 'amount', label: t('f.amount') + ' (KWD)', type: 'number', step: '0.001', min: 0, value: r.amount, req: true })}${A.field({ name: 'payment_method', label: t('f.method'), type: 'select', value: r.payment_method, options: ['cash', 'knet', 'card', 'bank_transfer', 'other'].map(x => [x, t('pm.' + x)]) })}
          ${A.field({ name: 'description', label: t('f.description'), value: r.description, cls: 'span-2' })}
          <div class="fld span-2"><label for="exp-att">${esc(t('f.attachment'))}</label><input id="exp-att" type="file" accept="image/*,application/pdf" data-att>${r.attachment ? `<small><a href="${esc(r.attachment)}" target="_blank" rel="noopener">${I('file')} ${esc(r.number)}</a></small>` : ''}</div></form>`,
          foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` });
        m.querySelector('[data-save]').onclick = async () => {
          const f = m.querySelector('[data-f]'); if (!A.validate(f)) return;
          const d = A.formData(f);
          const file = m.querySelector('[data-att]').files[0];
          try {
            if (file) d.attachment = /^image\//.test(file.type) ? (await A.processImage(file, 1400)).url : await A.fileToDataUrl(file);
            await A.call('expenses.save', { id: r.id, data: d }); A.toast(t('saved')); A.closeModal(); draw();
          } catch (ex) { A.err(ex); }
        };
      };
      view.innerHTML = `${A.head(esc(t('exp.title')), '', A.can('expenses', 'create') ? A.btn(t('exp.newT'), { attrs: 'data-new', icon: 'plus' }) : '')}
        <div class="filters-a">${A.period(expState)}<select data-f="category" aria-label="${esc(t('f.category'))}"><option value="">${esc(t('f.category'))}: ${esc(t('a.all'))}</option>${cats.map(c => `<option value="${c}"${expState.category === c ? ' selected' : ''}>${esc(t('ex.' + c))}</option>`).join('')}</select>
        <label class="srch">${I('search')}<input type="search" data-q value="${esc(expState.q)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label></div><div data-body></div>`;
      A.bindPeriod(view, expState, draw); A.bindTable(view, draw);
      view.addEventListener('change', e => { const f = e.target.closest('select[data-f]'); if (f) { expState[f.dataset.f] = f.value; draw(); } });
      view.addEventListener('input', A.debounce(e => { if (e.target.matches('[data-q]')) { expState.q = e.target.value; draw(); } }, 250));
      view.addEventListener('click', e => { if (e.target.closest('[data-new]')) form(null); });
      await draw();
    }
  };

  /* =========================== COUPONS =========================== */
  P.coupons = {
    perm: ['coupons', 'view'],
    async render(view) {
      const draw = async () => {
        const rows = await A.call('coupons.list', {});
        view.innerHTML = `${A.head(esc(t('coupons.title')), '', A.can('coupons', 'create') ? A.btn(t('coupons.newT'), { attrs: 'data-new', icon: 'plus' }) : '')}
          ${A.table({ id: 'cpn-tbl', rows, cols: [{ k: 'code', label: t('f.code'), h: r => `<b class="mono">${esc(r.code)}</b>` }, { k: 'type', label: t('f.type'), h: r => esc(r.type === 'percent' ? t('f.percent') : t('f.fixed')) }, { k: 'value', label: t('f.value2'), m: true }, { k: 'min', label: t('f.minOrder'), money: true }, { k: 'used', label: t('coupons.used'), m: true }, { k: 'active', label: t('f.active'), h: r => A.badge(r.active ? 'active' : 'inactive') }],
            actions: r => `<div class="row-act">${A.can('coupons', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-edit="${r.id}"`) : ''}${A.can('coupons', 'delete') ? A.iconBtn('trash', t('a.delete'), `data-del="${r.id}"`) : ''}</div>` })}`;
        view.onclick = async e => {
          if (A.tableClick(e, draw)) return;
          const ed = e.target.closest('[data-edit]');
          if (ed || e.target.closest('[data-new]')) A.crudForm('coupons', ed ? rows.find(r => r.id === ed.dataset.edit) : { active: true, type: 'percent' }, [['code', 'f.code', { req: true, dir: 'ltr' }], ['type', 'f.type', { type: 'select', options: [['percent', t('f.percent')], ['fixed', t('f.fixed')]] }], ['value', 'f.value2', { type: 'number', step: '0.001', req: true }], ['min', 'f.minOrder', { type: 'number', step: '0.001' }], ['max_uses', 'coupons.used', { type: 'number', step: '1', hint: 'max' }], ['active', 'f.active', { type: 'checkbox' }]], draw, t('coupons.newT'));
          const dl = e.target.closest('[data-del]'); if (dl && await A.confirm(t('a.delete') + '?', { danger: true })) { try { await A.call('coupons.delete', { id: dl.dataset.del }); draw(); } catch (ex) { A.err(ex); } }
        };
      };
      await draw();
    }
  };
})();
