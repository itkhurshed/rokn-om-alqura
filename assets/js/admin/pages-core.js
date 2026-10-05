/* ==========================================================================
   ADMIN PAGES — Dashboard · Sales · Website Orders · POS · Notifications
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const A = ROKN.admin, t = A.t, esc = A.esc, I = A.i, P = A.pages;
  const nm = (row) => A.L(row, 'name');
  const prodName = r => A.isAr() ? (r.name_ar || r.product_ar || r.name_en || r.product_en) : (r.name_en || r.product_en);

  /* ---------------- shared: period picker ---------------- */
  A.period = function (st, opts) {
    opts = opts || {};
    const keys = ['today', 'yesterday', 'd7', 'd30', 'month', 'lastMonth', 'year', 'custom'];
    return `<div class="period" role="group" aria-label="${esc(t('f.period'))}">
      <select data-period aria-label="${esc(t('f.period'))}">${keys.map(k => `<option value="${k}"${st.preset === k ? ' selected' : ''}>${esc(t('range.' + k))}</option>`).join('')}</select>
      <input type="date" data-from value="${st.from}" aria-label="${esc(t('f.from'))}" ${st.preset === 'custom' ? '' : 'hidden'}>
      <input type="date" data-to value="${st.to}" aria-label="${esc(t('f.to'))}" ${st.preset === 'custom' ? '' : 'hidden'}>
      ${opts.gran ? `<div class="seg" role="group" aria-label="${esc(t('f.granularity'))}">${['day', 'week', 'month', 'year'].map(g => `<button type="button" data-gran="${g}" aria-pressed="${st.gran === g}">${esc(t('gran.' + g))}</button>`).join('')}</div>` : ''}
    </div>`;
  };
  A.bindPeriod = function (view, st, rerender) {
    view.addEventListener('change', e => {
      if (e.target.matches('[data-period]')) { st.preset = e.target.value; if (st.preset !== 'custom') [st.from, st.to] = A.range(st.preset); rerender(); }
      if (e.target.matches('[data-from]')) { st.from = e.target.value; rerender(); }
      if (e.target.matches('[data-to]')) { st.to = e.target.value; rerender(); }
    });
    view.addEventListener('click', e => { const g = e.target.closest('[data-gran]'); if (g) { st.gran = g.dataset.gran; rerender(); } });
  };
  const newPeriod = (preset, gran) => { const [from, to] = A.range(preset); return { preset, from, to, gran: gran || 'day' }; };

  /* =========================== DASHBOARD =========================== */
  const dash = A.dashState = A.dashState || newPeriod('today', 'day');
  P.dashboard = {
    perm: ['dashboard', 'view'],
    async render(view) {
      const draw = async () => {
        const d = await A.call('dashboard.summary', { from: dash.from, to: dash.to, granularity: dash.gran });
        const k = d.kpi;
        const card = (key, val, icon, cls, href) => `<${href ? `a href="${A.href(href)}"` : 'div'} class="kpi ${cls || ''}"><span class="kpi-i">${I(icon)}</span><span class="kpi-l">${esc(t('dash.' + key))}</span><b class="kpi-v">${val}</b></${href ? 'a' : 'div'}>`;
        const pm = Object.entries(d.byPayment).map(([m, v]) => ({ label: t('pm.' + m), value: v }));
        const cats = d.topCategories.map(c => ({ label: (A.lookups && A.lookups.categories.find(x => x.id === c.id) ? nm(A.lookups.categories.find(x => x.id === c.id)) : c.id), value: c.revenue }));
        const quick = [
          A.can('pos', 'create') && A.btn(t('dash.newSale'), { href: A.href('pos'), icon: 'pos' }),
          A.can('products', 'create') && A.btn(t('dash.addProduct'), { href: A.href('products--new'), icon: 'plus', cls: 'ghost' }),
          A.can('purchases', 'create') && A.btn(t('dash.receiveStock'), { href: A.href('purchases'), icon: 'purchases', cls: 'ghost' }),
          A.can('expenses', 'create') && A.btn(t('dash.addExpense'), { href: A.href('expenses'), icon: 'expenses', cls: 'ghost' }),
          A.can('reports', 'view') && A.btn(t('dash.closeDay'), { href: A.href('daily'), icon: 'daily', cls: 'ghost' })
        ].filter(Boolean).join('');
        view.innerHTML = `
          ${A.head(esc(t('dash.hello', { name: A.me.user.name })), esc(A.date(dash.from) + (dash.to !== dash.from ? ' – ' + A.date(dash.to) : '')), A.period(dash))}
          ${quick ? `<div class="quick">${quick}</div>` : ''}
          <section class="kpis" aria-label="KPI">
            ${card('sales', A.money(k.sales), 'sales', 'kpi-main', 'sales')}
            ${card('orders', A.num(k.orders), 'orders', '', 'sales')}
            ${card('productsSold', A.num(k.productsSold) + ` <small>· ${A.m(k.meters)}</small>`, 'products')}
            ${card('grossProfit', A.money(k.grossProfit), 'reports', 'good')}
            ${card('expenses', A.money(k.expenses), 'expenses', '', 'expenses')}
            ${card('netSales', A.money(k.netSales), 'daily')}
            ${card('lowStock', A.num(k.lowStock) + (k.outOfStock ? ` <small class="bad">+${k.outOfStock} ${esc(t('st.out'))}</small>` : ''), 'alert', k.lowStock ? 'warn' : '', 'inventory')}
            ${card('pending', A.num(k.pending), 'orders', k.pending ? 'info' : '', 'orders')}
            ${card('cancelled', A.num(k.cancelled), 'x')}
          </section>
          <div class="grid-dash">
            <section class="card-a span-2"><header class="card-h"><h2>${esc(t('dash.trend'))}</h2>${A.period({ gran: dash.gran }, { gran: true }).replace(/<select[\s\S]*?<\/select>|<input[^>]*>/g, '')}</header>${A.chart.line(d.trend)}</section>
            <section class="card-a"><header class="card-h"><h2>${esc(t('dash.byPayment'))}</h2></header>${A.chart.donut(pm, { money: true, center: A.money(k.sales, true), sub: 'KWD' })}</section>
            <section class="card-a"><header class="card-h"><h2>${esc(t('dash.topProducts'))}</h2></header>${A.chart.bars(d.topProducts.map(p => ({ label: prodName(p), value: p.revenue, sub: A.m(p.meters) })), { money: true })}</section>
            <section class="card-a"><header class="card-h"><h2>${esc(t('dash.topCategories'))}</h2></header>${A.chart.donut(cats, { money: true })}</section>
            <section class="card-a"><header class="card-h"><h2>${esc(t('dash.attention'))}</h2><a class="lnk" href="${A.href('inventory')}">${esc(t('nav.inventory'))} ›</a></header>
              <ul class="mini-list">${d.lowStock.map(r => `<li><span class="sw" style="--c:${A.colorHex(r.color)}"></span><span>${esc(A.isAr() ? r.product_ar : r.product_en)}<small>${esc(A.colorName(r.color))} · <span dir="ltr">${esc(r.sku)}</span></small></span><b class="${r.state === 'out' ? 'bad' : 'warn'}">${A.m(r.available)}</b></li>`).join('') || `<li class="muted">${esc(t('noData'))}</li>`}</ul></section>
            <section class="card-a span-2"><header class="card-h"><h2>${esc(t('dash.recentOrders'))}</h2><a class="lnk" href="${A.href('sales')}">${esc(t('nav.sales'))} ›</a></header>
              ${A.table({ id: 'dash-orders', all: true, rows: d.recentOrders, cols: [
                { k: 'number', label: t('f.invoiceNo'), h: r => `<a href="${A.href('sales--view--' + r.id)}" class="mono">${esc(r.number)}</a>${A.demoTag(r)}` },
                { k: 'created_at', label: t('f.date'), h: r => esc(A.dt(r.created_at)) },
                { k: 'customer_name', label: t('f.customer') },
                { k: 'channel', label: t('f.channel'), h: r => esc(t('ch.' + r.channel)) },
                { k: 'total', label: t('f.total'), money: true },
                { k: 'status', label: t('f.status'), h: r => A.badge(r.status) }] })}</section>
            <section class="card-a"><header class="card-h"><h2>${esc(t('dash.recentTx'))}</h2></header>
              <ul class="mini-list">${d.recentTx.map(x => `<li><span class="ab ab-${x.type}">${esc(t('inv.' + x.type))}</span><span>${esc(x.reason || '')}<small>${esc(A.dt(x.created_at))} · ${esc(x.user_name || '')}</small></span><b class="${x.qty_m < 0 ? 'bad' : 'good'}" dir="ltr">${x.qty_m > 0 ? '+' : ''}${A.num(x.qty_m)}</b></li>`).join('')}</ul></section>
          </div>`;
        ROKN.localizeLinks(view);
      };
      A.bindPeriod(view, dash, draw);
      await draw();
    }
  };

  /* =========================== SALES & ORDERS =========================== */
  const salesState = A.salesState = A.salesState || Object.assign(newPeriod('d30'), { channel: '', status: '', payment: '', user: '', q: '' });
  const ordersState = A.ordersState = A.ordersState || Object.assign(newPeriod('d30'), { status: 'open', payment: '', q: '' });
  function salesPage(kind) {
    const web = kind === 'orders';
    const st = web ? ordersState : salesState;
    const mod = web ? 'orders' : 'sales';
    return {
      perm: [mod, 'view'],
      async render(view, parts) {
        let rows = [];
        const showTax = A.settings.tax && A.settings.tax.enabled;
        const draw = async () => {
          rows = await A.call(web ? 'orders.list' : 'sales.list', { from: st.from, to: st.to, channel: st.channel, status: st.status, payment: st.payment, user: st.user, q: st.q });
          const sum = rows.filter(r => !['cancelled'].includes(r.status)).reduce((s, r) => s + r.total, 0);
          const sellers = [...new Map(rows.filter(r => r.salesperson_id).map(r => [r.salesperson_id, r.salesperson_name])).entries()];
          view.querySelector('[data-body]').innerHTML = `
            <div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))}</span><b>${A.money(sum)}</b>${A.can(mod, 'export') ? A.exportBtns(mod + '-tbl') : ''}</div>
            ${A.table({ id: mod + '-tbl', title: t(web ? 'sales.ordersTitle' : 'sales.title'), rows, empty: t('sales.noItems'), cols: [
              { k: 'number', label: t('f.invoiceNo'), h: r => `<button type="button" class="lnk mono" data-view="${r.id}">${esc(r.number)}</button>${A.demoTag(r)}` },
              { k: 'created_at', label: t('f.date'), h: r => esc(A.dt(r.created_at)), x: r => r.created_at.replace('T', ' ').slice(0, 16) },
              { k: 'customer_name', label: t('f.customer'), h: r => `${esc(r.customer_name || '—')}${r.customer_phone ? `<small class="muted d-b" dir="ltr">${esc(r.customer_phone)}</small>` : ''}` },
              ...(web ? [] : [{ k: 'salesperson_name', label: t('f.salesperson') }]),
              { k: 'products', label: t('f.products'), cls: 'trunc', h: r => `<span title="${esc(A.isAr() ? r.products_ar : r.products)}">${esc(A.isAr() ? r.products_ar : r.products)}</span>`, x: r => A.isAr() ? r.products_ar : r.products },
              { k: 'item_count', label: t('f.qty'), m: true },
              { k: 'meters', label: t('f.meters'), m: true },
              { k: 'subtotal', label: t('f.subtotal'), money: true },
              { k: 'discount', label: t('f.discount'), money: true },
              ...(showTax ? [{ k: 'tax', label: t('f.tax'), money: true }] : []),
              { k: 'total', label: t('f.total'), money: true, cls: 'strong' },
              { k: 'payment_method', label: t('f.method'), h: r => esc(r.payment_method ? t('pm.' + r.payment_method) : '—'), x: r => r.payment_method || '' },
              { k: 'payment_status', label: t('f.payStatus'), h: r => A.badge(r.payment_status), x: r => r.payment_status },
              { k: 'status', label: t('f.orderStatus'), h: r => A.badge(r.status), x: r => r.status }],
              actions: r => `<div class="row-act">${A.iconBtn('eye', t('a.view'), `data-view="${r.id}"`)}${A.can(mod, 'print') ? A.iconBtn('print', t('a.print'), `data-print="${r.id}"`) : ''}${A.iconBtn('more', t('a.more'), `data-more="${r.id}"`)}</div>` })}`;
        };
        view.innerHTML = `${A.head(esc(t(web ? 'sales.ordersTitle' : 'sales.title')), '', A.can('pos', 'create') && !web ? A.btn(t('dash.newSale'), { href: A.href('pos'), icon: 'plus' }) : '')}
          <div class="filters-a">${A.period(st)}
            ${web ? '' : `<select data-f="channel" aria-label="${esc(t('f.channel'))}"><option value="">${esc(t('f.channel'))}: ${esc(t('a.all'))}</option>${['pos', 'web'].map(c => `<option value="${c}"${st.channel === c ? ' selected' : ''}>${esc(t('ch.' + c))}</option>`).join('')}</select>`}
            <select data-f="status" aria-label="${esc(t('f.status'))}"><option value="">${esc(t('f.status'))}: ${esc(t('a.all'))}</option>${(web ? ['open', 'pending', 'processing', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'] : ['completed', 'pending', 'delivered', 'partially_refunded', 'refunded', 'cancelled', 'held', 'quote']).map(s => `<option value="${s}"${st.status === s ? ' selected' : ''}>${esc(t('st.' + s))}</option>`).join('')}</select>
            <select data-f="payment" aria-label="${esc(t('f.method'))}"><option value="">${esc(t('f.method'))}: ${esc(t('a.all'))}</option>${['cash', 'knet', 'card', 'bank_transfer', 'cod', 'other'].map(m => `<option value="${m}"${st.payment === m ? ' selected' : ''}>${esc(t('pm.' + m))}</option>`).join('')}</select>
            <label class="srch">${I('search')}<input type="search" data-f="q" value="${esc(st.q)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label>
          </div><div data-body></div>`;
        A.bindPeriod(view, st, draw);
        A.bindTable(view, draw);
        view.addEventListener('change', e => { const f = e.target.closest('select[data-f]'); if (f) { st[f.dataset.f] = f.value; draw(); } });
        view.addEventListener('input', A.debounce(e => { if (e.target.matches('input[data-f=q]')) { st.q = e.target.value; draw(); } }, 300));
        view.addEventListener('click', async e => {
          const v = e.target.closest('[data-view]'); if (v) return A.saleModal(v.dataset.view, draw, mod);
          const p = e.target.closest('[data-print]'); if (p) return A.printSale(p.dataset.print, 'choose');
          const m = e.target.closest('[data-more]'); if (m) return A.saleMenu(m, m.dataset.more, draw, mod);
        });
        await draw();
        if (parts[0] === 'view' && parts[1]) A.saleModal(parts[1], draw, mod);
      }
    };
  }
  P.sales = salesPage('sales');
  P.orders = salesPage('orders');

  A.saleMenu = function (btn, id, after, mod) {
    document.querySelectorAll('.pop-a').forEach(x => x.remove());
    const items = [
      ['eye', t('a.view'), 'view', true], ['edit', t('a.edit'), 'edit', A.can('sales', 'edit')], ['print', t('printDocs.receipt'), 'receipt', A.can(mod, 'print')],
      ['file', t('printDocs.invoice') + ' (A4)', 'invoice', A.can(mod, 'print')], ['download', t('a.download') + ' PDF', 'invoice', A.can(mod, 'print')],
      ['undo', t('a.refund'), 'refund', A.can('sales', 'edit')], ['copy', t('a.duplicate'), 'dup', A.can('pos', 'create')], ['x', t('a.cancel'), 'cancel', A.can('sales', 'delete')]
    ].filter(x => x[3]);
    const pop = document.createElement('div'); pop.className = 'pop-a'; pop.setAttribute('role', 'menu');
    pop.innerHTML = items.map(([ic, l, a]) => `<button type="button" role="menuitem" data-a="${a}">${I(ic)} ${esc(l)}</button>`).join('');
    document.body.appendChild(pop);
    const r = btn.getBoundingClientRect();
    pop.style.top = (window.scrollY + r.bottom + 4) + 'px';
    pop.style[A.isAr() ? 'left' : 'right'] = (A.isAr() ? r.left : (document.documentElement.clientWidth - r.right)) + 'px';
    pop.querySelector('button').focus();
    const close = () => { pop.remove(); document.removeEventListener('click', out, true); };
    const out = e => { if (!pop.contains(e.target)) close(); };
    setTimeout(() => document.addEventListener('click', out, true));
    pop.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); btn.focus(); } });
    pop.addEventListener('click', async e => {
      const b = e.target.closest('[data-a]'); if (!b) return; close();
      const a = b.dataset.a;
      if (a === 'view') A.saleModal(id, after, mod);
      if (a === 'receipt' || a === 'invoice') A.printSale(id, a);
      if (a === 'edit') A.saleEdit(id, after);
      if (a === 'refund') A.refundModal(id, after);
      if (a === 'dup') A.duplicateSale(id);
      if (a === 'cancel') A.cancelSale(id, after);
    });
  };
  A.getSale = id => A.call(A.can('sales', 'view') ? 'sales.get' : 'orders.get', { id });
  A.printSale = async function (id, kind) {
    try {
      const o = await A.getSale(id);
      if (kind === 'choose') kind = o.channel === 'web' ? 'invoice' : 'receipt';
      const prn = (A.me.printers || []).find(p => p.type === (kind === 'receipt' ? 'receipt' : 'a4')) || {};
      const paper = kind === 'receipt' ? (prn.paper || '80mm') : (prn.paper || 'A4');
      const other = kind === 'receipt' ? 'invoice' : 'receipt';
      A.print(kind === 'receipt' ? A.docs.receipt(o, A.settings, prn) : A.docs.invoice(o, A.settings, prn), paper, { title: o.number,
        extra: `<button type="button" class="btn-a ghost" data-switch>${I('file')} ${esc(t('printDocs.' + other))}</button>${o.customer_phone ? `<a class="btn-a ghost" target="_blank" rel="noopener" href="${A.waLink(o.customer_phone, A.shareText(o))}">${I('wa')} ${esc(t('a.whatsapp'))}</a>` : ''}${o.customer_email ? `<a class="btn-a ghost" href="mailto:${esc(o.customer_email)}?subject=${encodeURIComponent((A.settings.business.name_en || '') + ' ' + o.number)}&body=${encodeURIComponent(A.shareText(o))}">${I('file')} ${esc(t('a.email'))}</a>` : ''}`,
        onMount: m => { const s = m.querySelector('[data-switch]'); if (s) s.onclick = () => { A.closeModal(); A.printSale(id, other); }; } });
    } catch (e) { A.err(e); }
  };
  A.saleModal = async function (id, after, mod) {
    let o; try { o = await A.getSale(id); } catch (e) { return A.err(e); }
    const web = o.channel === 'web';
    const canEditOrder = web && A.can('orders', 'edit') && !['cancelled', 'refunded'].includes(o.status);
    const m = A.modal({ size: 'lg', title: `${esc(t('sales.detail', { n: o.number }))} ${A.badge(o.status)} ${A.demoTag(o)}`, body: `
      <div class="det-grid">
        <div><small>${esc(t('f.date'))}</small><b>${esc(A.dt(o.created_at))}</b></div>
        <div><small>${esc(t('f.customer'))}</small><b>${esc(o.customer_name || '—')}</b>${o.customer_phone ? `<span dir="ltr">${esc(o.customer_phone)}</span>` : ''}</div>
        <div><small>${esc(t('f.channel'))}</small><b>${esc(t('ch.' + o.channel))}</b><span>${esc(o.salesperson_name || '')}</span></div>
        <div><small>${esc(t('f.payStatus'))}</small>${A.badge(o.payment_status)} <span>${esc(o.payment_method ? t('pm.' + o.payment_method) : '')}</span></div>
        ${o.address ? `<div class="span-2"><small>${esc(t('f.address'))}</small><span>${esc(Object.values(o.address).filter(Boolean).join(', '))}</span></div>` : ''}
      </div>
      ${A.table({ id: 'sale-items', all: true, rows: o.items, cols: [
        { k: 'name_en', label: t('f.product'), h: i => `${esc(prodName(i))}<small class="muted d-b">${esc(A.colorName(i.color))}${i.roll_id ? ' · roll' : ''}</small>` },
        { k: 'sku', label: t('f.sku'), h: i => `<span class="mono" dir="ltr">${esc(i.sku)}</span>` },
        { k: 'meters', label: t('f.meters'), h: i => `${A.num(i.meters)}${i.returned_m ? `<small class="bad d-b">−${A.num(i.returned_m)}</small>` : ''}`, num: true },
        { k: 'price_per_meter', label: t('f.pricePerM'), money: true }, { k: 'discount', label: t('f.discount'), money: true }, { k: 'total', label: t('f.total'), money: true }] })}
      <div class="tot-box"><span>${esc(t('f.subtotal'))}</span><b>${A.money(o.subtotal)}</b>${o.discount ? `<span>${esc(t('f.discount'))}</span><b>−${A.money(o.discount)}</b>` : ''}${o.tax ? `<span>${esc(t('f.tax'))}</span><b>${A.money(o.tax)}</b>` : ''}${o.shipping ? `<span>${esc(t('f.shipping'))}</span><b>${A.money(o.shipping)}</b>` : ''}<span class="g">${esc(t('f.total'))}</span><b class="g">${A.money(o.total)}</b>${o.refunded ? `<span>${esc(t('st.refunded'))}</span><b class="bad">−${A.money(o.refunded)}</b>` : ''}</div>
      ${o.payments.length || o.refunds.length ? `<h3 class="h3-a">${esc(t('sales.timeline'))}</h3><ul class="mini-list">${o.payments.map(p => `<li><span class="ab ab-paid">${esc(t('pm.' + p.method))}</span><span>${esc(A.dt(p.created_at))}${p.tendered ? ` · ${esc(t('f.tendered'))} ${A.money(p.tendered)} · ${esc(t('f.change'))} ${A.money(p.change)}` : ''}</span><b class="good">${A.money(p.amount)}</b></li>`).join('')}${o.refunds.map(r => `<li><span class="ab ab-refunded">${esc(t('a.refund'))}</span><span>${esc(A.dt(r.created_at))} · ${esc(r.reason || '')}</span><b class="bad">−${A.money(r.amount)}</b></li>`).join('')}</ul>` : ''}
      ${canEditOrder ? `<div class="inline-form"><label class="fld"><span>${esc(t('sales.setStatus'))}</span><select data-status>${['pending', 'processing', 'preparing', 'shipped', 'delivered'].map(s => `<option value="${s}"${o.status === s ? ' selected' : ''}>${esc(t('st.' + s))}</option>`).join('')}</select></label>${A.btn(t('a.save'), { attrs: 'data-save-status', cls: 'ghost' })}${o.payment_status !== 'paid' ? A.btn(t('sales.markPaid'), { attrs: 'data-paid', cls: 'ghost', icon: 'check' }) : ''}</div>` : ''}
      ${o.notes ? `<p class="note-a">${esc(o.notes)}</p>` : ''}`,
      foot: [A.can(mod, 'print') && `<button type="button" class="btn-a ghost" data-p="receipt">${I('print')} ${esc(t('printDocs.receipt'))}</button><button type="button" class="btn-a ghost" data-p="invoice">${I('file')} ${esc(t('printDocs.invoice'))}</button>`,
        A.can('sales', 'edit') && !['cancelled', 'refunded', 'held', 'quote'].includes(o.status) && `<button type="button" class="btn-a ghost" data-refund>${I('undo')} ${esc(t('a.refund'))}</button>`,
        A.can('pos', 'create') && `<button type="button" class="btn-a ghost" data-dup>${I('copy')} ${esc(t('a.duplicate'))}</button>`,
        A.can('sales', 'delete') && !['cancelled', 'refunded', 'partially_refunded'].includes(o.status) && `<button type="button" class="btn-a danger-ghost" data-cancel>${I('x')} ${esc(t('a.cancel'))}</button>`].filter(Boolean).join('') });
    m.addEventListener('click', async e => {
      const p = e.target.closest('[data-p]'); if (p) A.printSale(o.id, p.dataset.p);
      if (e.target.closest('[data-refund]')) { A.closeModal(); A.refundModal(o.id, after); }
      if (e.target.closest('[data-dup]')) { A.closeModal(); A.duplicateSale(o.id); }
      if (e.target.closest('[data-cancel]')) { A.closeModal(); A.cancelSale(o.id, after); }
      if (e.target.closest('[data-save-status]')) { try { await A.call('orders.setStatus', { id: o.id, status: m.querySelector('[data-status]').value }); A.toast(t('saved')); A.closeModal(); after && after(); } catch (ex) { A.err(ex); } }
      if (e.target.closest('[data-paid]')) { try { await A.call('orders.markPaid', { id: o.id }); A.toast(t('saved')); A.closeModal(); after && after(); } catch (ex) { A.err(ex); } }
    });
  };
  A.saleEdit = async function (id, after) {
    const o = await A.getSale(id).catch(A.err); if (!o) return;
    const m = A.modal({ title: esc(t('sales.editTitle')) + ' · ' + esc(o.number), body: `<form class="form-a" data-f>
      ${A.field({ name: 'customer_name', label: t('f.customer'), value: o.customer_name })}${A.field({ name: 'customer_phone', label: t('f.phone'), value: o.customer_phone, type: 'tel', dir: 'ltr' })}
      ${A.field({ name: 'customer_email', label: t('f.email'), value: o.customer_email, type: 'email' })}${A.field({ name: 'payment_status', label: t('f.payStatus'), type: 'select', value: o.payment_status, options: ['paid', 'unpaid', 'partial', 'refunded'].map(s => [s, t('st.' + s)]) })}
      ${A.field({ name: 'notes', label: t('f.notes'), type: 'textarea', value: o.notes })}</form>`,
      foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` });
    m.querySelector('[data-save]').onclick = async () => { try { await A.call('sales.update', { id, patch: A.formData(m.querySelector('[data-f]')) }); A.toast(t('saved')); A.closeModal(); after && after(); } catch (e) { A.err(e); } };
  };
  A.refundModal = async function (id, after) {
    const o = await A.getSale(id).catch(A.err); if (!o) return;
    const lines = o.items.filter(i => i.meters - (i.returned_m || 0) > 0);
    const m = A.modal({ size: 'lg', title: esc(t('sales.refundTitle', { n: o.number })), body: `<form class="form-a" data-f>
      <table class="tbl"><thead><tr><th>${esc(t('f.product'))}</th><th class="num">${esc(t('sales.returnable'))}</th><th class="num">${esc(t('f.meters'))}</th></tr></thead><tbody>
      ${lines.map(i => `<tr><td>${esc(prodName(i))}<small class="muted d-b">${esc(A.colorName(i.color))} · ${A.money(i.price_per_meter)}/m</small></td><td class="num">${A.num(i.meters - (i.returned_m || 0))}</td><td class="num"><input type="number" class="in-sm" min="0" step="0.5" max="${i.meters - (i.returned_m || 0)}" value="0" data-line="${i.id}" data-max="${i.meters - (i.returned_m || 0)}" data-unit="${i.total / i.meters}" aria-label="${esc(t('f.meters'))}"></td></tr>`).join('')}</tbody></table>
      <div class="grid-3">${A.field({ name: 'method', label: t('f.method'), type: 'select', value: o.payment_method === 'cod' ? 'cash' : o.payment_method, options: ['cash', 'knet', 'card', 'bank_transfer', 'other'].map(x => [x, t('pm.' + x)]) })}
      ${A.field({ name: 'amount', label: t('sales.refundAmount'), type: 'number', step: '0.001', value: '0' })}
      ${A.field({ name: 'restock', label: t('f.restock'), type: 'checkbox', value: true })}</div>
      ${A.field({ name: 'reason', label: t('f.reason'), req: true })}</form>`,
      foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a danger" data-go>${I('undo')} ${esc(t('a.refund'))}</button>` });
    const f = m.querySelector('[data-f]');
    const recalc = () => { let s = 0; f.querySelectorAll('[data-line]').forEach(x => { s += Math.min(+x.value || 0, +x.dataset.max) * +x.dataset.unit; }); f.amount.value = s.toFixed(3); };
    f.addEventListener('input', e => { if (e.target.matches('[data-line]')) recalc(); });
    m.querySelector('[data-go]').onclick = async () => {
      if (!A.validate(f)) return;
      const ls = [...f.querySelectorAll('[data-line]')].map(x => ({ item_id: x.dataset.line, meters: +x.value })).filter(x => x.meters > 0);
      if (!ls.length) return A.toast(t('required'), 'err');
      const d = A.formData(f);
      try { await A.call('sales.refund', { id, lines: ls, method: d.method, amount: d.amount, restock: d.restock, reason: d.reason }); A.toast(t('sales.refunded')); A.closeModal(); after && after(); }
      catch (e) { A.err(e); }
    };
  };
  A.cancelSale = async function (id, after) {
    const reason = await A.confirm(t('sales.cancelQ'), { danger: true, input: t('sales.cancelReason'), required: true, ok: t('a.cancel') });
    if (!reason) return;
    try { await A.call('sales.cancel', { id, reason }); A.toast(t('sales.cancelled')); after && after(); } catch (e) { A.err(e); }
  };
  A.duplicateSale = async function (id) {
    const o = await A.getSale(id).catch(A.err); if (!o) return;
    A.pos.cart = o.items.map(i => ({ variant_id: i.variant_id, meters: i.meters, discount: 0, roll_id: null }));
    A.pos.customer = o.customer_id ? { id: o.customer_id, name: o.customer_name, phone: o.customer_phone } : null;
    A.pos.held_id = null; A.pos.quote_id = o.status === 'quote' ? o.id : null; A.posSave();
    A.toast(t('pos.loadedDup')); A.go('pos');
  };

  /* =========================== POS =========================== */
  const ss = { get(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* */ } } };
  A.pos = Object.assign({ cart: [], customer: null, discount: 0, held_id: null, quote_id: null, cat: '', color: '', type: '', q: '', last: null }, ss.get('rokn:pos') || {});
  A.posSave = () => ss.set('rokn:pos', Object.assign({}, A.pos, { last: null }));
  let C = null; // catalog
  const vById = id => C.variants.find(v => v.id === id);
  const pById = id => C.products.find(p => p.id === id);
  const unitPrice = v => v.price_per_meter || pById(v.product_id).price_per_meter;
  const r3 = n => Math.round(n * 1000) / 1000;
  function posTotals() {
    const lines = A.pos.cart.map(l => { const v = vById(l.variant_id); if (!v) return null; const gross = r3(l.meters * unitPrice(v)); return Object.assign({}, l, { v, p: pById(v.product_id), unit: unitPrice(v), gross, total: r3(gross - (l.discount || 0)) }); }).filter(Boolean);
    const subtotal = r3(lines.reduce((s, l) => s + l.gross, 0));
    const discount = r3(Math.min(subtotal, lines.reduce((s, l) => s + (l.discount || 0), 0) + (+A.pos.discount || 0)));
    const tx = C.settings.tax; const base = subtotal - discount;
    const tax = tx.enabled && tx.rate ? (tx.inclusive ? r3(base - base / (1 + tx.rate / 100)) : r3(base * tx.rate / 100)) : 0;
    return { lines, subtotal, discount, tax, total: r3(base + (tx.inclusive ? 0 : tax)), meters: lines.reduce((s, l) => s + l.meters, 0) };
  }
  P.pos = {
    perm: ['pos', 'view'],
    async render(view) {
      C = await A.call('pos.catalog');
      const step = +(C.settings.inventory.meter_step || 0.5);
      const quick = String(C.settings.pos.quick_meters || '1,2,3,5').split(',').map(Number).filter(Boolean);
      const cats = (A.lookups ? A.lookups.categories : []).filter(c => C.products.some(p => p.category === c.id));
      view.classList.add('pos-view');
      view.innerHTML = `
      <div class="pos">
        <section class="pos-left" aria-label="${esc(t('nav.products'))}">
          <div class="pos-search">
            <label class="srch lg">${I('search')}<input type="search" data-q value="${esc(A.pos.q)}" placeholder="${esc(t('pos.search'))}" aria-label="${esc(t('pos.search'))}" autocomplete="off" enterkeyhint="search"></label>
            ${A.iconBtn('scan', t('pos.scan'), 'data-scan', 'lg')}
          </div>
          <div class="pos-cats" role="group" aria-label="${esc(t('f.category'))}"><button type="button" data-cat="" aria-pressed="${!A.pos.cat}">${esc(t('pos.allCats'))}</button>${cats.map(c => `<button type="button" data-cat="${c.id}" aria-pressed="${A.pos.cat === c.id}">${esc(nm(c))}</button>`).join('')}</div>
          <div class="pos-sub">
            <select data-pf="color" aria-label="${esc(t('f.color'))}"><option value="">${esc(t('f.color'))}: ${esc(t('a.all'))}</option>${[...new Set(C.variants.map(v => v.color))].map(c => `<option value="${c}"${A.pos.color === c ? ' selected' : ''}>${esc(A.colorName(c))}</option>`).join('')}</select>
            <select data-pf="type" aria-label="${esc(t('f.fabricType'))}"><option value="">${esc(t('f.fabricType'))}: ${esc(t('a.all'))}</option>${[...new Set(C.products.map(p => p.fabric_type))].map(x => `<option value="${x}"${A.pos.type === x ? ' selected' : ''}>${esc((A.lookups && A.lookups.fabric_types.find(f => f.id === x)) ? nm(A.lookups.fabric_types.find(f => f.id === x)) : x)}</option>`).join('')}</select>
            <button type="button" class="btn-a ghost sm" data-heldlist>${I('hold')} ${esc(t('pos.held'))} <b class="cnt">${C.held.length}</b></button>
            <button type="button" class="btn-a ghost sm" data-quotelist>${I('file')} ${esc(t('pos.quotes'))} <b class="cnt">${C.quotes.length}</b></button>
          </div>
          <div class="pos-grid" data-grid></div>
        </section>
        <section class="pos-right" aria-label="${esc(t('pos.cart'))}" data-cart></section>
      </div>`;
      const grid = view.querySelector('[data-grid]'), cart = view.querySelector('[data-cart]');
      const drawGrid = () => {
        const q = A.pos.q.trim().toLowerCase();
        const list = C.products.filter(p => (!A.pos.cat || p.category === A.pos.cat) && (!A.pos.type || p.fabric_type === A.pos.type)
          && (!A.pos.color || C.variants.some(v => v.product_id === p.id && v.color === A.pos.color))
          && (!q || [p.name_en, p.name_ar, p.sku, ...C.variants.filter(v => v.product_id === p.id).map(v => v.sku + ' ' + v.barcode + ' ' + A.colorName(v.color))].join(' ').toLowerCase().includes(q)));
        grid.innerHTML = list.map(p => {
          const vs = C.variants.filter(v => v.product_id === p.id), stock = vs.reduce((s, v) => s + v.stock, 0);
          const img = (p.images && p.images.drapeSm) || `assets/img/products/${p.id}/${(vs.find(v => v.stock > 0) || vs[0] || {}).color}-drape-sm.webp`;
          return `<button type="button" class="pt" data-p="${p.id}" ${stock <= 0 ? 'data-out' : ''}><span class="pt-img"><img src="${esc(img)}" alt="" loading="lazy" width="200" height="250"></span>
            <span class="pt-b"><b>${esc(nm(p))}</b><span class="pt-dots">${vs.slice(0, 7).map(v => `<i style="--c:${A.colorHex(v.color)}" class="${v.stock > 0 ? '' : 'out'}"></i>`).join('')}</span>
            <span class="pt-p">${A.money(p.price_per_meter)}<small>/${A.isAr() ? 'م' : 'm'}</small></span><span class="pt-s ${stock <= 0 ? 'bad' : ''}">${stock > 0 ? esc(t('pos.inStock', { n: A.num(stock) })) : esc(t('pos.outStock'))}</span></span></button>`;
        }).join('') || `<div class="empty-a">${I('search', 'ai-xl')}<p>${esc(t('noData'))}</p></div>`;
      };
      const drawCart = () => {
        const T = posTotals();
        const cust = A.pos.customer;
        cart.innerHTML = `
          <header class="pc-head"><h2>${esc(t('pos.cart'))}${A.pos.held_id ? ` <span class="ab ab-held">${esc(t('st.held'))}</span>` : ''}${A.pos.quote_id ? ` <span class="ab ab-quote">${esc(t('st.quote'))}</span>` : ''}</h2>${T.lines.length ? `<button type="button" class="lnk" data-clear>${esc(t('pos.clearCart'))}</button>` : ''}</header>
          <div class="pc-cust"><button type="button" class="pc-cust-b" data-cust>${I('user')}<span><small>${esc(t('pos.chooseCustomer'))}</small><b>${esc(cust ? cust.name : t('pos.walkIn'))}</b>${cust && cust.phone ? `<small dir="ltr">${esc(cust.phone)}</small>` : ''}</span>${I('chevronDown')}</button>${cust ? A.iconBtn('x', t('a.remove'), 'data-cust-clear') : ''}</div>
          <ul class="pc-lines">${T.lines.map((l, i) => `<li>
            <div class="pl-top"><span class="sw" style="--c:${A.colorHex(l.v.color)}"></span><span class="pl-n"><b>${esc(nm(l.p))}</b><small>${esc(A.colorName(l.v.color))} · <span dir="ltr">${esc(l.v.sku)}</span>${l.roll_id ? ` · ${esc(t('pos.roll'))} ${esc((C.rolls.find(r => r.id === l.roll_id) || {}).barcode || '')}` : ''}</small></span>${A.iconBtn('trash', t('a.remove'), `data-rm="${i}"`, 'sm')}</div>
            <div class="pl-bot"><div class="stepper-a"><button type="button" data-dec="${i}" aria-label="−">${I('minus')}</button><input type="number" inputmode="decimal" step="${step}" min="${step}" value="${l.meters}" data-mt="${i}" aria-label="${esc(t('f.meters'))}"><button type="button" data-inc="${i}" aria-label="+">${I('plus')}</button></div>
              <span class="pl-calc" dir="ltr">× ${A.money(l.unit, true)}${l.discount ? ` − ${A.money(l.discount, true)}` : ''}</span><b class="pl-t">${A.money(l.total, true)}</b></div>
            ${l.meters > (l.v.stock || 0) ? `<p class="bad small">${esc(t('errs.insufficient_stock'))} (${A.m(l.v.stock)})</p>` : ''}
            <button type="button" class="lnk small" data-ldisc="${i}">${esc(t('pos.lineDiscount'))}</button></li>`).join('') || `<li class="pc-empty">${I('pos', 'ai-xl')}<p>${esc(t('pos.empty'))}</p></li>`}</ul>
          <div class="pc-sum">
            <div><span>${esc(t('f.subtotal'))} · ${esc(t('pos.items', { n: T.lines.length }))} · ${A.m(T.meters)}</span><b>${A.money(T.subtotal)}</b></div>
            <div><button type="button" class="lnk" data-odisc>${esc(t('f.discount'))}</button><b>${T.discount ? '−' + A.money(T.discount) : A.money(0)}</b></div>
            ${T.tax ? `<div><span>${esc(t('f.tax'))}</span><b>${A.money(T.tax)}</b></div>` : ''}
            <div class="g"><span>${esc(t('f.total'))}</span><b>${A.money(T.total)}</b></div>
          </div>
          <div class="pc-btns">
            <button type="button" class="btn-a pay" data-pay ${T.lines.length && A.can('pos', 'create') ? '' : 'disabled'}>${esc(t('pos.pay'))} · ${A.money(T.total)}</button>
            <button type="button" class="btn-a ghost" data-hold ${T.lines.length && A.can('pos', 'create') ? '' : 'disabled'}>${I('hold')} ${esc(t('pos.hold'))}</button>
            <button type="button" class="btn-a ghost" data-quote ${T.lines.length && A.can('pos', 'create') ? '' : 'disabled'}>${I('file')} ${esc(t('pos.quote'))}</button>
            <button type="button" class="btn-a ghost" data-reprint ${A.pos.last ? '' : 'disabled'}>${I('print')} ${esc(t('pos.printReceipt'))}</button>
            <button type="button" class="btn-a ghost" data-newsale>${I('plus')} ${esc(t('pos.newSale'))}</button>
          </div>`;
        A.posSave();
      };
      const addModal = (p, presetColor, presetRoll) => {
        const vs = C.variants.filter(v => v.product_id === p.id);
        let color = presetColor || (vs.find(v => v.stock > 0) || vs[0]).color, roll = presetRoll || '', meters = quick[1] || 1, disc = 0;
        const canDisc = A.can('sales', 'edit') || +C.settings.pos.max_line_discount_pct > 0;
        const m = A.modal({ title: esc(nm(p)), size: 'md', body: `<div class="addm">
          <div class="addm-img"><img src="${esc((p.images && p.images.drapeSm) || `assets/img/products/${p.id}/${color}-drape-sm.webp`)}" alt="" data-img></div>
          <div class="addm-f">
            <p class="muted small"><span dir="ltr">${esc(p.sku)}</span> · ${A.money(p.price_per_meter)}/${A.isAr() ? 'م' : 'm'}${p.width_cm ? ' · ' + A.num(p.width_cm) + ' cm' : ''}</p>
            <fieldset class="sw-pick"><legend>${esc(t('pos.colors'))}</legend>${vs.map(v => `<label class="${v.stock > 0 ? '' : 'out'}"><input type="radio" name="color" value="${v.color}"${v.color === color ? ' checked' : ''}><i style="--c:${A.colorHex(v.color)}"></i><span>${esc(A.colorName(v.color))}<small>${A.m(v.stock)}</small></span></label>`).join('')}</fieldset>
            <div class="fld"><label>${esc(t('pos.roll'))}</label><select name="roll" data-roll></select></div>
            <div class="fld"><label>${esc(t('pos.metersHint', { s: step }))}</label><div class="stepper-a lg"><button type="button" data-d>${I('minus')}</button><input type="number" inputmode="decimal" name="meters" step="${step}" min="${step}" value="${meters}" aria-label="${esc(t('f.meters'))}"><button type="button" data-i>${I('plus')}</button></div>
              <div class="chips-a">${quick.map(q => `<button type="button" data-qm="${q}">${A.num(q)} ${A.isAr() ? 'م' : 'm'}</button>`).join('')}</div></div>
            ${canDisc ? A.field({ name: 'disc', label: t('pos.lineDiscount'), type: 'number', step: '0.001', min: 0, value: 0 }) : ''}
            <p class="addm-calc" aria-live="polite" data-calc></p>
          </div></div>`,
          foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary lg" data-add>${I('plus')} ${esc(t('pos.addToSale'))}</button>` });
        const upd = () => {
          const v = vs.find(x => x.color === color);
          meters = Math.max(step, Math.round((+m.querySelector('[name=meters]').value || step) / step) * step);
          disc = canDisc ? Math.max(0, +m.querySelector('[name=disc]').value || 0) : 0;
          const unit = unitPrice(v), tot = r3(meters * unit - disc);
          m.querySelector('[data-calc]').innerHTML = `<span dir="ltr">${A.num(meters)} m × ${A.money(unit, true)}${disc ? ` − ${A.money(disc, true)}` : ''} =</span> <b>${A.money(tot)}</b>${meters > v.stock ? `<br><span class="bad">${esc(t('errs.insufficient_stock'))}: ${A.m(v.stock)}</span>` : ''}`;
        };
        const fillRolls = () => {
          const v = vs.find(x => x.color === color);
          const rs = C.rolls.filter(r => r.variant_id === v.id);
          m.querySelector('[data-roll]').innerHTML = `<option value="">${esc(t('pos.anyRoll'))}</option>` + rs.map(r => `<option value="${r.id}"${r.id === roll ? ' selected' : ''}>${esc(r.barcode)} · ${A.m(r.remaining_m)}${r.location ? ' · ' + esc(r.location) : ''}</option>`).join('');
          const img = m.querySelector('[data-img]'); if (!(p.images && p.images.drapeSm)) img.src = `assets/img/products/${p.id}/${color}-drape-sm.webp`;
        };
        fillRolls(); upd();
        m.addEventListener('change', e => { if (e.target.name === 'color') { color = e.target.value; roll = ''; fillRolls(); upd(); } if (e.target.name === 'roll') roll = e.target.value; });
        m.addEventListener('input', upd);
        m.addEventListener('click', e => {
          const inp = m.querySelector('[name=meters]');
          if (e.target.closest('[data-d]')) { inp.value = Math.max(step, +inp.value - step); upd(); }
          if (e.target.closest('[data-i]')) { inp.value = +inp.value + step; upd(); }
          const qm = e.target.closest('[data-qm]'); if (qm) { inp.value = qm.dataset.qm; upd(); }
          if (e.target.closest('[data-add]')) {
            upd(); const v = vs.find(x => x.color === color);
            const ex = A.pos.cart.find(l => l.variant_id === v.id && (l.roll_id || '') === roll && !l.discount && !disc);
            if (ex) ex.meters = r3(ex.meters + meters); else A.pos.cart.push({ variant_id: v.id, meters, discount: disc, roll_id: roll || null });
            A.closeModal(); drawCart();
          }
        });
        m.querySelector('[name=meters]').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); m.querySelector('[data-add]').click(); } });
      };
      const scanCode = code => {
        code = code.trim().toLowerCase(); if (!code) return false;
        const v = C.variants.find(x => [x.barcode, x.sku].some(c => String(c || '').toLowerCase() === code));
        if (v) { addModal(pById(v.product_id), v.color); return true; }
        const r = C.rolls.find(x => String(x.barcode).toLowerCase() === code);
        if (r) { const v2 = vById(r.variant_id); addModal(pById(v2.product_id), v2.color, r.id); return true; }
        const p = C.products.find(x => String(x.sku || '').toLowerCase() === code || String(x.barcode || '').toLowerCase() === code);
        if (p) { addModal(p); return true; }
        return false;
      };
      const chooseCustomer = async () => {
        const m = A.modal({ title: esc(t('pos.chooseCustomer')), body: `<label class="srch">${I('search')}<input type="search" data-cq placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label><ul class="pick-list" data-cl></ul>
          ${A.can('customers', 'create') ? `<details class="new-c"><summary>${I('plus')} ${esc(t('pos.newCustomer'))}</summary><form class="form-a grid-2" data-nc novalidate>${A.field({ name: 'name', label: t('f.name'), req: true })}${A.field({ name: 'phone', label: t('f.phone'), type: 'tel', dir: 'ltr', req: true })}${A.field({ name: 'email', label: t('f.email'), type: 'email' })}<div class="fld"><label>&nbsp;</label><button class="btn-a primary" type="submit">${esc(t('a.save'))}</button></div></form></details>` : ''}` });
        const list = await A.call('customers.list', {}).catch(() => []);
        const draw = q => { q = (q || '').toLowerCase(); m.querySelector('[data-cl]').innerHTML = `<li><button type="button" data-pick="">${I('user')} ${esc(t('pos.walkIn'))}</button></li>` + list.filter(c => !q || [c.name, c.phone, c.email].join(' ').toLowerCase().includes(q)).slice(0, 40).map(c => `<li><button type="button" data-pick="${c.id}">${I('user')} <span>${esc(c.name)}<small dir="ltr">${esc(c.phone || '')}</small></span>${A.demoTag(c)}<b>${c.orders ? A.money(c.spent) : ''}</b></button></li>`).join(''); };
        draw('');
        m.querySelector('[data-cq]').addEventListener('input', e => draw(e.target.value));
        m.addEventListener('click', e => { const b = e.target.closest('[data-pick]'); if (!b) return; const c = list.find(x => x.id === b.dataset.pick); A.pos.customer = c ? { id: c.id, name: c.name, phone: c.phone } : null; A.closeModal(); drawCart(); });
        const nc = m.querySelector('[data-nc]');
        if (nc) nc.addEventListener('submit', async e => { e.preventDefault(); if (!A.validate(nc)) return; try { const c = await A.call('customers.save', { data: A.formData(nc) }); A.pos.customer = { id: c.id, name: c.name, phone: c.phone }; A.closeModal(); drawCart(); A.toast(t('cust.saved')); } catch (ex) { A.err(ex); } });
      };
      const payload = () => ({ items: A.pos.cart.map(l => ({ variant_id: l.variant_id, meters: l.meters, discount: l.discount || 0, roll_id: l.roll_id || null })), discount: +A.pos.discount || 0, customer_id: A.pos.customer ? A.pos.customer.id : null, held_id: A.pos.held_id, quote_id: A.pos.quote_id });
      const reset = async () => { Object.assign(A.pos, { cart: [], customer: null, discount: 0, held_id: null, quote_id: null }); C = await A.call('pos.catalog'); view.querySelectorAll('.cnt')[0].textContent = C.held.length; view.querySelectorAll('.cnt')[1].textContent = C.quotes.length; drawGrid(); drawCart(); };
      const payModal = () => {
        const T = posTotals();
        let method = C.methods[0];
        const m = A.modal({ title: esc(t('pos.payTitle')), size: 'md', body: `
          <p class="due">${esc(t('pos.due'))}<b>${A.money(T.total)}</b></p>
          <div class="pm-grid" role="radiogroup" aria-label="${esc(t('f.method'))}">${C.methods.map((x, i) => `<button type="button" role="radio" aria-checked="${i === 0}" data-pm="${x}">${esc(t('pm.' + x))}</button>`).join('')}</div>
          <div data-cash>${A.field({ name: 'tendered', label: t('f.tendered'), type: 'number', step: '0.001', min: 0, value: T.total.toFixed(3), attrs: ' inputmode="decimal"' })}
            <div class="chips-a">${[...new Set([T.total, Math.ceil(T.total), Math.ceil(T.total / 5) * 5, Math.ceil(T.total / 10) * 10, Math.ceil(T.total / 20) * 20])].map(v => `<button type="button" data-ten="${v}">${A.money(v, true)}</button>`).join('')}</div>
            <p class="change" data-change></p></div>
          <div data-ref hidden>${A.field({ name: 'reference', label: t('f.reference'), ph: 'KNET / card ref.' })}</div>`,
          foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a pay" data-done>${I('check')} ${esc(t('pos.complete'))}</button>` });
        const upd = () => {
          m.querySelectorAll('[data-pm]').forEach(b => b.setAttribute('aria-checked', b.dataset.pm === method));
          m.querySelector('[data-cash]').hidden = method !== 'cash'; m.querySelector('[data-ref]').hidden = method === 'cash';
          const ten = +m.querySelector('[name=tendered]').value || 0;
          m.querySelector('[data-change]').innerHTML = ten >= T.total ? `${esc(t('pos.changeDue'))}: <b>${A.money(ten - T.total)}</b>` : `<span class="bad">${A.money(T.total - ten)}</span>`;
        };
        upd();
        m.addEventListener('click', async e => {
          const b = e.target.closest('[data-pm]'); if (b) { method = b.dataset.pm; upd(); }
          const tn = e.target.closest('[data-ten]'); if (tn) { m.querySelector('[name=tendered]').value = (+tn.dataset.ten).toFixed(3); upd(); }
          const done = e.target.closest('[data-done]');
          if (done) {
            done.disabled = true;
            try {
              const o = await A.call('pos.checkout', Object.assign(payload(), { payment: { method, tendered: method === 'cash' ? +m.querySelector('[name=tendered]').value : null, reference: m.querySelector('[name=reference]').value } }));
              A.pos.last = o.id; A.closeModal();
              await reset();
              A.saleDone(o);
            } catch (ex) { done.disabled = false; A.err(ex); }
          }
        });
        m.addEventListener('input', upd);
      };
      A.saleDone = o => {
        const pay = o.payments[0] || {};
        const m = A.modal({ title: `${I('check')} ${esc(t('pos.saleDone'))} · <span dir="ltr">${esc(o.number)}</span>`, size: 'sm', body: `<p class="due">${esc(t('f.total'))}<b>${A.money(o.total)}</b></p>${pay.change ? `<p class="due ok">${esc(t('pos.changeDue'))}<b>${A.money(pay.change)}</b></p>` : ''}<p class="muted">${esc(t('pm.' + pay.method))}${o.customer_name ? ' · ' + esc(o.customer_name) : ''}</p>`,
          foot: `${o.customer_phone ? `<a class="btn-a ghost" target="_blank" rel="noopener" href="${A.waLink(o.customer_phone, A.shareText(o))}">${I('wa')} ${esc(t('a.whatsapp'))}</a>` : ''}<button type="button" class="btn-a ghost" data-inv>${I('file')} A4</button><button type="button" class="btn-a primary" data-rc>${I('print')} ${esc(t('pos.printReceipt'))}</button>` });
        m.querySelector('[data-rc]').onclick = () => { A.closeModal(); A.printSale(o.id, 'receipt'); };
        m.querySelector('[data-inv]').onclick = () => { A.closeModal(); A.printSale(o.id, 'invoice'); };
        if (C.settings.pos.auto_print_receipt) { A.closeModal(); A.printSale(o.id, 'receipt'); }
      };
      const listModal = (kind) => {
        const list = kind === 'held' ? C.held : C.quotes;
        const m = A.modal({ title: esc(t(kind === 'held' ? 'pos.held' : 'pos.quotes')), body: list.length ? `<ul class="pick-list">${list.map(h => `<li><div class="pk-row"><span><b class="mono">${esc(h.number)}</b> ${esc(h.customer_name || '')}<small>${esc(A.dt(h.created_at))} · ${h.items.length} × · ${esc(h.salesperson_name || '')}</small></span><b>${A.money(h.total)}</b>
          <button type="button" class="btn-a sm primary" data-resume="${h.id}">${esc(t('a.resume'))}</button>${kind === 'quote' ? `<button type="button" class="btn-a sm ghost" data-qprint="${h.id}">${I('print')}</button>` : ''}<button type="button" class="btn-a sm ghost" data-discard="${h.id}">${I('trash')}</button></div></li>`).join('')}</ul>` : `<p class="muted">${esc(t('noData'))}</p>` });
        m.addEventListener('click', async e => {
          const r = e.target.closest('[data-resume]');
          if (r) { const h = list.find(x => x.id === r.dataset.resume); A.pos.cart = h.items.map(i => ({ variant_id: i.variant_id, meters: i.meters, discount: i.discount || 0, roll_id: i.roll_id || null })); A.pos.held_id = kind === 'held' ? h.id : null; A.pos.quote_id = kind === 'quote' ? h.id : null; A.pos.customer = h.customer_name && h.customer_name !== C.settings.pos.walk_in_label_en ? { id: null, name: h.customer_name } : null; A.closeModal(); drawCart(); A.toast(t('pos.fromHeld')); }
          const d = e.target.closest('[data-discard]');
          if (d && await A.confirm(t('a.discard') + '?', { danger: true })) { try { await A.call('pos.discardHeld', { id: d.dataset.discard }); A.closeModal(); await reset(); } catch (ex) { A.err(ex); } }
          const qp = e.target.closest('[data-qprint]'); if (qp) { A.closeModal(); A.printSale(qp.dataset.qprint, 'invoice'); }
        });
      };
      const camScan = async () => {
        if (!('BarcodeDetector' in window)) return A.toast(t('pos.scanUnsupported'), 'err');
        let stream;
        const m = A.modal({ title: esc(t('pos.scan')), body: `<video class="scan-v" playsinline muted></video>`, onClose: () => { if (stream) stream.getTracks().forEach(x => x.stop()); } });
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          const vid = m.querySelector('video'); vid.srcObject = stream; await vid.play();
          const det = new window.BarcodeDetector({ formats: ['code_128', 'ean_13', 'qr_code', 'code_39'] });
          const loop = async () => { if (!document.body.contains(vid)) return; const c = await det.detect(vid).catch(() => []); if (c.length) { A.closeModal(); if (!scanCode(c[0].rawValue)) A.toast(t('pos.notFoundCode') + ': ' + c[0].rawValue, 'err'); } else requestAnimationFrame(loop); };
          loop();
        } catch (e) { A.closeModal(); A.err(e); }
      };
      drawGrid(); drawCart();
      const qInput = view.querySelector('[data-q]');
      qInput.addEventListener('input', A.debounce(() => { A.pos.q = qInput.value; drawGrid(); }, 120));
      qInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (scanCode(qInput.value)) { qInput.value = ''; A.pos.q = ''; drawGrid(); } else if (qInput.value.trim()) { const first = grid.querySelector('.pt'); if (first && grid.querySelectorAll('.pt').length === 1) first.click(); } } });
      if (window.matchMedia('(min-width: 900px)').matches) qInput.focus();
      view.addEventListener('change', e => {
        const pf = e.target.closest('[data-pf]'); if (pf) { A.pos[pf.dataset.pf] = pf.value; drawGrid(); }
        const mt = e.target.closest('[data-mt]'); if (mt) { const l = A.pos.cart[+mt.dataset.mt]; l.meters = Math.max(step, Math.round((+mt.value || step) / step) * step); drawCart(); }
      });
      view.addEventListener('click', async e => {
        const c = e.target.closest('[data-cat]'); if (c) { A.pos.cat = c.dataset.cat; view.querySelectorAll('[data-cat]').forEach(b => b.setAttribute('aria-pressed', b === c)); drawGrid(); return; }
        const pt = e.target.closest('[data-p]'); if (pt && grid.contains(pt)) return addModal(pById(pt.dataset.p));
        const rm = e.target.closest('[data-rm]'); if (rm) { A.pos.cart.splice(+rm.dataset.rm, 1); drawCart(); return; }
        const dec = e.target.closest('[data-dec]'); if (dec) { const l = A.pos.cart[+dec.dataset.dec]; l.meters = Math.max(step, r3(l.meters - step)); drawCart(); return; }
        const inc = e.target.closest('[data-inc]'); if (inc) { const l = A.pos.cart[+inc.dataset.inc]; l.meters = r3(l.meters + step); drawCart(); return; }
        const ld = e.target.closest('[data-ldisc]'); if (ld) { const l = A.pos.cart[+ld.dataset.ldisc]; const v = await A.confirm(t('pos.lineDiscount'), { input: t('f.amount') + ' (KWD)' }); if (v && v !== true) { l.discount = Math.max(0, +v || 0); drawCart(); } return; }
        if (e.target.closest('[data-odisc]')) { const v = await A.confirm(t('pos.orderDiscount'), { input: t('f.amount') + ' (KWD)' }); if (v && v !== true) { A.pos.discount = Math.max(0, +v || 0); drawCart(); } return; }
        if (e.target.closest('[data-cust]')) return chooseCustomer();
        if (e.target.closest('[data-cust-clear]')) { A.pos.customer = null; drawCart(); return; }
        if (e.target.closest('[data-clear]') || e.target.closest('[data-newsale]')) { if (A.pos.cart.length && !(await A.confirm(t('pos.clearCart') + '?'))) return; Object.assign(A.pos, { cart: [], customer: null, discount: 0, held_id: null, quote_id: null }); drawCart(); qInput.focus(); return; }
        if (e.target.closest('[data-pay]')) return payModal();
        if (e.target.closest('[data-hold]')) { try { const o = await A.call('pos.hold', payload()); A.toast(t('pos.heldSaved', { n: o.number })); await reset(); } catch (ex) { A.err(ex); } return; }
        if (e.target.closest('[data-quote]')) { try { const o = await A.call('pos.quote', payload()); A.toast(t('pos.quoteSaved', { n: o.number })); await reset(); A.printSale(o.id, 'invoice'); } catch (ex) { A.err(ex); } return; }
        if (e.target.closest('[data-reprint]') && A.pos.last) return A.printSale(A.pos.last, 'receipt');
        if (e.target.closest('[data-heldlist]')) return listModal('held');
        if (e.target.closest('[data-quotelist]')) return listModal('quote');
        if (e.target.closest('[data-scan]')) return camScan();
      });
    }
  };

  /* =========================== NOTIFICATIONS =========================== */
  P.notifications = {
    perm: 'self',
    async render(view) {
      const draw = async () => {
        const list = await A.call('notifications.list', {});
        view.innerHTML = `${A.head(esc(t('ntf.title')), '', list.some(n => !n.read) ? A.btn(t('a.markAllRead'), { attrs: 'data-all', cls: 'ghost', icon: 'check' }) : '')}
          <ul class="ntf-list">${list.map(n => `<li class="${n.read ? '' : 'unread'} lv-${n.level}"><span class="ntf-i">${I({ low_stock: 'alert', out_of_stock: 'alert', new_order: 'orders', payment: 'sales', refund: 'undo', new_customer: 'customers', new_user: 'users', inventory_adjustment: 'inventory', daily_report: 'daily' }[n.type] || 'notifications')}</span>
            <div><b>${esc(A.L(n, 'title'))}</b> <span class="ab">${esc(t('ntf.types.' + n.type))}</span>${A.demoTag(n)}<p>${esc(A.L(n, 'body'))}</p><small class="muted">${esc(A.dt(n.created_at))}</small></div>
            <div class="ntf-a">${n.link ? `<a class="btn-a ghost sm" href="${A.href(n.link)}">${esc(t('a.open'))}</a>` : ''}${n.read ? '' : A.iconBtn('check', t('a.markRead'), `data-read="${n.id}"`)}</div></li>`).join('') || `<li class="empty-a">${I('notifications', 'ai-xl')}<p>${esc(t('ntf.none'))}</p></li>`}</ul>`;
        ROKN.localizeLinks(view);
        A.shell.setUnread(list.filter(n => !n.read).length);
      };
      view.addEventListener('click', async e => {
        if (e.target.closest('[data-all]')) { await A.call('notifications.read', { all: true }); draw(); }
        const r = e.target.closest('[data-read]'); if (r) { await A.call('notifications.read', { id: r.dataset.read }); draw(); }
      });
      await draw();
    }
  };
})();
