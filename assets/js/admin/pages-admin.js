/* ==========================================================================
   ADMIN PAGES — Reports · Daily report · Users · Roles & permissions ·
   Printers · Settings · Media library · Activity logs
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const A = ROKN.admin, t = A.t, esc = A.esc, I = A.i, P = A.pages;
  const nm = r => A.L(r, 'name');
  const pn = r => A.isAr() ? (r.name_ar || r.product_ar || r.name_en || r.product_en) : (r.name_en || r.product_en);
  const catName = id => { const c = (A.lookups && A.lookups.categories || []).find(x => x.id === id); return c ? nm(c) : id; };

  /* =========================== REPORTS =========================== */
  const repState = Object.assign({ tab: 'overview', channel: '', user: '', payment: '', product: '', category: '', customer: '' }, (() => { const [from, to] = A.range('month'); return { preset: 'month', from, to, gran: 'day' }; })());
  const invRep = { kind: 'current' };
  P.reports = {
    perm: ['reports', 'view'],
    async render(view, parts) {
      if (parts[0] === 'inventory') return inventoryReport(view);
      const users = A.can('users', 'view') ? await A.call('users.list').catch(() => []) : [];
      const draw = async () => {
        const m = await A.call('reports.sales', { from: repState.from, to: repState.to, granularity: repState.gran, channel: repState.channel, user: repState.user, payment: repState.payment, product: repState.product, category: repState.category });
        const kv = [[t('rep.gross'), A.money(m.gross)], [t('day.refunds'), A.money(m.refunds)], [t('rep.net'), A.money(m.netSales)], [t('f.discount'), A.money(m.discounts)], [t('dash.orders'), A.num(m.orders)], [t('dash.meters'), A.m(m.meters)],
          [t('f.aov'), A.money(m.aov)], [t('rep.cogs'), A.money(m.cogs)], [t('dash.grossProfit'), A.money(m.grossProfit)], [t('dash.expenses'), A.money(m.expenses)], [t('rep.netProfit'), A.money(m.netProfit)], [t('rep.margin'), m.netSales ? ((m.grossProfit / m.netSales) * 100).toFixed(1) + '%' : '—']];
        const tabs = ['overview', 'products', 'categories', 'payments', 'staff', 'orders', 'profit'];
        let table = '';
        const tb = repState.tab;
        if (tb === 'products') table = A.table({ id: 'rep-tbl', title: t('rep.tabs.products'), rows: m.byProduct, cols: [{ k: 'name_en', label: t('f.product'), v: pn }, { k: 'orders', label: t('f.orders'), m: true }, { k: 'meters', label: t('f.meters'), m: true }, { k: 'revenue', label: t('f.total'), money: true }, { k: 'cost', label: t('rep.cogs'), money: true }, { k: 'profit', label: t('dash.grossProfit'), money: true, v: r => +(r.revenue - r.cost).toFixed(3) }, { k: 'share', label: t('rep.share'), v: r => m.netSales ? +(r.revenue / m.gross * 100).toFixed(1) : 0, h: r => (m.gross ? (r.revenue / m.gross * 100).toFixed(1) : 0) + '%' }] });
        if (tb === 'categories') table = A.table({ id: 'rep-tbl', title: t('rep.tabs.categories'), rows: m.byCategory, cols: [{ k: 'id', label: t('f.category'), v: r => catName(r.id) }, { k: 'meters', label: t('f.meters'), m: true }, { k: 'revenue', label: t('f.total'), money: true }] }) + `<h3 class="h3-a">${esc(t('f.color'))}</h3>` + A.chart.bars(m.byColor.slice(0, 12).map(c => ({ label: A.colorName(c.id), value: c.revenue, swatch: A.colorHex(c.id), sub: A.m(c.meters) })), { money: true });
        if (tb === 'payments') { const rows = Object.entries(m.byPayment).map(([k, v]) => ({ id: k, method: t('pm.' + k), amount: v })); table = A.chart.donut(rows.map(r => ({ label: r.method, value: r.amount })), { money: true }) + A.table({ id: 'rep-tbl', title: t('rep.tabs.payments'), rows, cols: [{ k: 'method', label: t('f.method') }, { k: 'amount', label: t('f.amount'), money: true }] }); }
        if (tb === 'staff') table = A.table({ id: 'rep-tbl', title: t('rep.tabs.staff'), rows: m.byStaff, cols: [{ k: 'name', label: t('f.salesperson') }, { k: 'orders', label: t('f.orders'), m: true }, { k: 'revenue', label: t('f.total'), money: true }, { k: 'aov', label: t('f.aov'), money: true, v: r => r.orders ? +(r.revenue / r.orders).toFixed(3) : 0 }] });
        if (tb === 'orders') table = A.table({ id: 'rep-tbl', title: t('rep.tabs.orders'), rows: m.orderList, cols: [{ k: 'number', label: t('f.invoiceNo') }, { k: 'created_at', label: t('f.date'), h: r => esc(A.dt(r.created_at)), x: r => r.created_at.slice(0, 16).replace('T', ' ') }, { k: 'channel', label: t('f.channel'), v: r => t('ch.' + r.channel) }, { k: 'customer_name', label: t('f.customer') }, { k: 'salesperson_name', label: t('f.salesperson') }, { k: 'payment_method', label: t('f.method'), v: r => r.payment_method ? t('pm.' + r.payment_method) : '' }, { k: 'subtotal', label: t('f.subtotal'), money: true }, { k: 'discount', label: t('f.discount'), money: true }, { k: 'tax', label: t('f.tax'), money: true }, { k: 'total', label: t('f.total'), money: true }, { k: 'status', label: t('f.status'), h: r => A.badge(r.status), x: r => r.status }] });
        if (tb === 'profit') { const rows = [[t('rep.gross'), m.gross], [t('f.tax'), -m.tax], [t('f.shipping'), -m.shipping], [t('day.refunds'), -m.refunds], [t('rep.cogs'), -m.cogs], [t('dash.grossProfit'), m.grossProfit], [t('dash.expenses'), -m.expenses], [t('rep.netProfit'), m.netProfit]].map(([k, v], i) => ({ id: i, k, v })); table = A.table({ id: 'rep-tbl', title: t('rep.tabs.profit'), rows, all: true, sortable: false, cols: [{ k: 'k', label: t('f.description'), sortable: false }, { k: 'v', label: t('f.amount'), money: true, sortable: false }] }); }
        if (tb === 'overview') table = `<div class="grid-dash"><section class="card-a span-2"><header class="card-h"><h2>${esc(t('dash.trend'))}</h2>${A.period({ gran: repState.gran }, { gran: true }).replace(/<select[\s\S]*?<\/select>|<input[^>]*>/g, '')}</header>${A.chart.line(m.trend)}</section>
          <section class="card-a"><header class="card-h"><h2>${esc(t('dash.byPayment'))}</h2></header>${A.chart.donut(Object.entries(m.byPayment).map(([k, v]) => ({ label: t('pm.' + k), value: v })), { money: true })}</section>
          <section class="card-a"><header class="card-h"><h2>${esc(t('dash.topProducts'))}</h2></header>${A.chart.bars(m.byProduct.slice(0, 8).map(p => ({ label: pn(p), value: p.revenue, sub: A.m(p.meters) })), { money: true })}</section>
          <section class="card-a"><header class="card-h"><h2>${esc(t('dash.topCategories'))}</h2></header>${A.chart.donut(m.byCategory.map(c => ({ label: catName(c.id), value: c.revenue })), { money: true })}</section>
          <section class="card-a"><header class="card-h"><h2>${esc(t('f.channel'))}</h2></header>${A.chart.donut(Object.entries(m.byChannel).map(([k, v]) => ({ label: t('ch.' + k), value: v })), { money: true })}</section></div>`;
        const body = view.querySelector('[data-body]');
        body.innerHTML = `<div class="kv-grid">${kv.map(([k, v]) => `<div><small>${esc(k)}</small><b>${v}</b></div>`).join('')}</div>
          ${A.tabs(tabs.map(x => ['#rt-' + x, t('rep.tabs.' + x)]), '#rt-' + tb).replace(/href="#rt-(\w+)"/g, 'href="#" data-rtab="$1" data-keep-href')}
          ${A.can('reports', 'export') && tb !== 'overview' ? `<div class="sum-strip">${A.exportBtns('rep-tbl')}</div>` : ''}
          ${A.can('reports', 'print') ? `<div class="sum-strip end"><button type="button" class="btn-a ghost sm" data-printrep>${I('print')} ${esc(t('a.print'))} / PDF</button></div>` : ''}
          <div class="rep-body">${table}</div>`;
        body.onclick = e => {
          const rt = e.target.closest('[data-rtab]'); if (rt) { e.preventDefault(); repState.tab = rt.dataset.rtab; draw(); }
          if (e.target.closest('[data-printrep]')) A.print(A.docs.report(`${t('rep.salesT')} · ${A.date(repState.from)} – ${A.date(repState.to)}`, `<table class="r-tbl"><thead><tr><th>${esc(t('f.product'))}</th><th class="n">${esc(t('f.meters'))}</th><th class="n">${esc(t('f.total'))}</th></tr></thead><tbody>${m.byProduct.map(p => `<tr><td>${esc(pn(p))}</td><td class="n">${A.num(p.meters)}</td><td class="n">${A.money(p.revenue, true)}</td></tr>`).join('')}</tbody></table>`, kv), 'A4');
        };
      };
      view.innerHTML = `${A.head(esc(t('rep.salesT')), '', `<a class="btn-a ghost" href="${A.href('reports--inventory')}">${I('inventory')} ${esc(t('rep.invT'))}</a>`)}
        <div class="filters-a">${A.period(repState)}
          <select data-f="channel" aria-label="${esc(t('f.channel'))}"><option value="">${esc(t('f.channel'))}: ${esc(t('a.all'))}</option>${['pos', 'web'].map(c => `<option value="${c}">${esc(t('ch.' + c))}</option>`).join('')}</select>
          <select data-f="payment" aria-label="${esc(t('f.method'))}"><option value="">${esc(t('f.method'))}: ${esc(t('a.all'))}</option>${['cash', 'knet', 'card', 'bank_transfer', 'cod', 'other'].map(c => `<option value="${c}">${esc(t('pm.' + c))}</option>`).join('')}</select>
          ${users.length ? `<select data-f="user" aria-label="${esc(t('f.user'))}"><option value="">${esc(t('f.user'))}: ${esc(t('a.all'))}</option>${users.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select>` : ''}
          <select data-f="category" aria-label="${esc(t('f.category'))}"><option value="">${esc(t('f.category'))}: ${esc(t('a.all'))}</option>${(A.lookups.categories || []).map(c => `<option value="${c.id}">${esc(nm(c))}</option>`).join('')}</select>
          <select data-f="product" aria-label="${esc(t('f.product'))}"><option value="">${esc(t('f.product'))}: ${esc(t('a.all'))}</option>${(await A.call('products.list', {}).catch(() => [])).map(p => `<option value="${p.id}">${esc(nm(p))}</option>`).join('')}</select>
        </div><div data-body></div>`;
      ROKN.localizeLinks(view);
      view.querySelectorAll('select[data-f]').forEach(s => { s.value = repState[s.dataset.f] || ''; });
      A.bindPeriod(view, repState, draw); A.bindTable(view, draw);
      view.addEventListener('change', e => { const f = e.target.closest('select[data-f]'); if (f) { repState[f.dataset.f] = f.value; draw(); } });
      await draw();
    }
  };
  async function inventoryReport(view) {
    const kinds = ['current', 'low', 'out', 'movement', 'valuation', 'product_sales', 'rolls', 'damaged', 'reserved'];
    const per = invRep.per = invRep.per || (() => { const [from, to] = A.range('d30'); return { preset: 'd30', from, to }; })();
    const draw = async () => {
      const r = await A.call('reports.inventory', { kind: invRep.kind, from: per.from, to: per.to });
      let cols;
      if (['movement', 'damaged'].includes(r.kind)) cols = [{ k: 'created_at', label: t('f.date'), h: x => esc(A.dt(x.created_at)), x: x => x.created_at.slice(0, 16).replace('T', ' ') }, { k: 'type', label: t('f.type'), v: x => t('inv.' + x.type) }, { k: 'sku', label: t('f.sku') }, { k: 'product_en', label: t('f.product'), v: x => `${pn(x)} · ${A.colorName(x.color)}` }, { k: 'qty_m', label: t('f.meters'), m: true }, { k: 'after_m', label: t('f.after'), m: true }, { k: 'reason', label: t('f.reason'), cls: 'trunc' }, { k: 'user_name', label: t('f.user') }];
      else if (r.kind === 'rolls') cols = [{ k: 'barcode', label: t('f.rollId') }, { k: 'product_en', label: t('f.product'), v: pn }, { k: 'color', label: t('f.color'), v: x => A.colorName(x.color) }, { k: 'batch', label: t('f.batch') }, { k: 'supplier', label: t('f.supplier') }, { k: 'original_m', label: t('f.original'), m: true }, { k: 'remaining_m', label: t('f.remaining'), m: true }, { k: 'location', label: t('f.location') }, { k: 'status', label: t('f.status'), v: x => t('st.' + x.status) }];
      else if (r.kind === 'product_sales') cols = [{ k: 'name_en', label: t('f.product'), v: pn }, { k: 'orders', label: t('f.orders'), m: true }, { k: 'meters', label: t('f.meters'), m: true }, { k: 'revenue', label: t('f.total'), money: true }];
      else cols = [{ k: 'sku', label: t('f.sku') }, { k: 'product_en', label: t('f.product'), v: pn }, { k: 'color', label: t('f.color'), v: x => A.colorName(x.color) }, { k: 'category', label: t('f.category'), v: x => catName(x.category) }, { k: 'available', label: t('f.available'), m: true }, { k: 'reserved', label: t('f.reserved'), m: true }, { k: 'damaged', label: t('f.damaged'), m: true }, { k: 'min', label: t('f.minStock'), m: true }, { k: 'cost', label: t('f.costPerM'), money: true }, { k: 'price', label: t('f.pricePerM'), money: true }, { k: 'value_cost', label: t('stock.valuation'), money: true }, { k: 'value_retail', label: t('stock.retail'), money: true }];
      view.querySelector('[data-body]').innerHTML = `
        ${r.totals ? `<div class="kv-grid">${[[t('f.available'), A.m(r.totals.available)], [t('stock.valuation'), A.money(r.totals.value_cost)], [t('stock.retail'), A.money(r.totals.value_retail)], [t('f.reserved'), A.m(r.totals.reserved)], [t('f.damaged'), A.m(r.totals.damaged)]].map(([k, v]) => `<div><small>${esc(k)}</small><b>${v}</b></div>`).join('')}</div>` : ''}
        <div class="sum-strip"><span>${esc(t('rows', { n: r.rows.length }))}</span>${A.can('reports', 'export') ? A.exportBtns('irep-tbl') : ''}</div>
        ${A.table({ id: 'irep-tbl', title: t('rep.kinds.' + r.kind), rows: r.rows, cols })}`;
    };
    view.innerHTML = `${A.head(esc(t('rep.invT')), '', `<a class="btn-a ghost" href="${A.href('reports')}">${I('reports')} ${esc(t('rep.salesT'))}</a>`)}
      <div class="filters-a"><select data-kind aria-label="${esc(t('f.kind'))}">${kinds.map(k => `<option value="${k}"${invRep.kind === k ? ' selected' : ''}>${esc(t('rep.kinds.' + k))}</option>`).join('')}</select>${A.period(per)}</div><div data-body></div>`;
    ROKN.localizeLinks(view);
    A.bindPeriod(view, per, draw); A.bindTable(view, draw);
    view.addEventListener('change', e => { if (e.target.matches('[data-kind]')) { invRep.kind = e.target.value; draw(); } });
    await draw();
  }

  /* =========================== DAILY REPORT =========================== */
  const dayState = { date: A.day() };
  P.daily = {
    perm: ['reports', 'view'],
    async render(view) {
      const draw = async () => {
        const d = await A.call('reports.daily', { date: dayState.date });
        const closed = d.closed;
        const rows = [['opening', d.opening_cash], ['cashSales', d.cash], ['knetSales', d.knet], ['cardSales', d.card], ['otherSales', d.other], ['totalSales', d.total, 'g'], ['refunds', -d.refunds], ['discounts', d.discounts, 'i'], ['expenses', -d.expenses], ['net', d.net, 'g'], ['cashRefunds', -d.cash_refunds, 'i'], ['cashExpenses', -d.cash_expenses, 'i'], ['expected', d.expected_cash, 'g']];
        view.innerHTML = `${A.head(esc(t('day.title')), esc(A.date(d.date)), `<input type="date" data-date value="${d.date}" aria-label="${esc(t('f.date'))}" max="${A.day()}">`)}
          ${closed ? `<p class="note-a ok">${I('lock')} ${esc(t('day.closedBy', { u: closed.closed_by, t: A.dt(closed.closed_at) }))}${closed.notes ? ' — ' + esc(closed.notes) : ''}</p>` : ''}
          <div class="grid-dash">
            <section class="card-a span-2"><table class="tbl day-tbl"><tbody>${rows.map(([k, v, c]) => `<tr class="${c || ''}"><th scope="row">${esc(t('day.' + k))}</th><td class="num">${c === 'i' ? `<span class="muted">${A.money(v)}</span>` : A.money(v)}</td></tr>`).join('')}
              ${closed ? `<tr class="g"><th scope="row">${esc(t('day.counted'))}</th><td class="num">${A.money(closed.counted_cash)}</td></tr><tr><th scope="row">${esc(t('day.variance'))}</th><td class="num ${Math.abs(closed.counted_cash - closed.closing_cash) > 0.0005 ? 'bad' : 'good'}">${A.money(closed.counted_cash - closed.closing_cash)}</td></tr>` : ''}</tbody></table></section>
            <section class="card-a"><div class="kv-grid one">${[['invoices', A.num(d.invoices)], ['productsSold', A.num(d.products_sold)], ['metersSold', A.m(d.meters)], ['aov', A.money(d.aov)], ['topProduct', d.top_product ? pn(d.top_product) : '—'], ['topCategory', d.top_category ? catName(d.top_category.id) : '—']].map(([k, v]) => `<div><small>${esc(t('day.' + k))}</small><b>${esc(v)}</b></div>`).join('')}</div></section>
          </div>
          ${!closed && A.can('reports', 'export') ? `<form class="card-a close-form" data-close novalidate><h2>${esc(t('day.close'))}</h2><div class="grid-3">
            ${A.field({ name: 'opening_cash', label: t('day.opening'), type: 'number', step: '0.001', value: d.opening_cash })}${A.field({ name: 'counted_cash', label: t('day.counted'), type: 'number', step: '0.001', req: true })}${A.field({ name: 'notes', label: t('f.notes') })}</div>
            <button type="submit" class="btn-a primary">${I('lock')} ${esc(t('day.close'))}</button></form>` : ''}
          <div class="sum-strip">${A.can('reports', 'export') ? A.exportBtns('day-inv') : ''}<button type="button" class="btn-a ghost sm" data-print-day>${I('print')} ${esc(t('a.print'))} / PDF</button></div>
          ${A.table({ id: 'day-inv', title: `${t('day.title')} ${d.date}`, rows: d.invoices_list, cols: [{ k: 'number', label: t('f.invoiceNo') }, { k: 'created_at', label: t('f.time'), h: r => esc(A.time(r.created_at)), x: r => r.created_at.slice(11, 16) }, { k: 'customer_name', label: t('f.customer') }, { k: 'salesperson_name', label: t('f.salesperson') }, { k: 'payment_method', label: t('f.method'), v: r => t('pm.' + r.payment_method) }, { k: 'total', label: t('f.total'), money: true }] })}
          ${d.expenses_list.length ? `<h3 class="h3-a">${esc(t('day.expenses'))}</h3>` + A.table({ id: 'day-exp', all: true, rows: d.expenses_list, cols: [{ k: 'number', label: t('f.number') }, { k: 'category', label: t('f.category'), v: r => t('ex.' + r.category) }, { k: 'description', label: t('f.description'), cls: 'trunc' }, { k: 'payment_method', label: t('f.method'), v: r => t('pm.' + r.payment_method) }, { k: 'amount', label: t('f.amount'), money: true }] }) : ''}`;
        const cf = view.querySelector('[data-close]');
        if (cf) cf.addEventListener('submit', async e => {
          e.preventDefault(); if (!A.validate(cf)) return;
          if (!(await A.confirm(t('day.closeQ', { d: A.date(d.date) })))) return;
          try { await A.call('reports.closeDay', Object.assign({ date: d.date }, A.formData(cf))); A.toast(t('day.closed')); draw(); A.shell.refreshUnread(); } catch (ex) { A.err(ex); }
        });
        view.querySelector('[data-print-day]').onclick = () => A.print(A.docs.report(`${t('day.title')} · ${A.date(d.date)}`,
          `<table class="r-tbl"><tbody>${rows.map(([k, v]) => `<tr><td>${esc(t('day.' + k))}</td><td class="n">${A.money(v, true)}</td></tr>`).join('')}${closed ? `<tr><td>${esc(t('day.counted'))}</td><td class="n">${A.money(closed.counted_cash, true)}</td></tr><tr><td>${esc(t('day.variance'))}</td><td class="n">${A.money(closed.counted_cash - closed.closing_cash, true)}</td></tr>` : ''}</tbody></table>
           <h3>${esc(t('day.invoices'))}</h3><table class="r-tbl"><thead><tr><th>${esc(t('f.invoiceNo'))}</th><th>${esc(t('f.time'))}</th><th>${esc(t('f.method'))}</th><th class="n">${esc(t('f.total'))}</th></tr></thead><tbody>${d.invoices_list.map(o => `<tr><td>${esc(o.number)}</td><td>${esc(A.time(o.created_at))}</td><td>${esc(t('pm.' + o.payment_method))}</td><td class="n">${A.money(o.total, true)}</td></tr>`).join('')}</tbody></table>`,
          [[t('day.invoices'), A.num(d.invoices)], [t('day.metersSold'), A.m(d.meters)], [t('day.aov'), A.money(d.aov)], [t('day.topProduct'), d.top_product ? pn(d.top_product) : '—'], [t('day.topCategory'), d.top_category ? catName(d.top_category.id) : '—'], [t('day.net'), A.money(d.net)]]), 'A4');
      };
      view.addEventListener('change', e => { if (e.target.matches('[data-date]')) { dayState.date = e.target.value; draw(); } });
      A.bindTable(view, draw);
      await draw();
    }
  };

  /* =========================== USERS =========================== */
  P.users = {
    perm: ['users', 'view'],
    async render(view) {
      const draw = async () => {
        const [rows, roles] = await Promise.all([A.call('users.list'), A.call('roles.list')]);
        const rn = id => { const r = roles.find(x => x.id === id); return r ? nm(r) : id; };
        view.innerHTML = `${A.head(esc(t('users.title')), '', A.can('users', 'create') ? A.btn(t('users.newT'), { attrs: 'data-new', icon: 'plus' }) : '')}
          <div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))}</span>${A.can('users', 'export') ? A.exportBtns('usr-tbl') : ''}</div>
          ${A.table({ id: 'usr-tbl', title: t('users.title'), rows, cols: [
            { k: 'name', label: t('f.name'), h: r => `<span class="u-cell"><span class="av sm">${r.photo ? `<img src="${esc(r.photo)}" alt="">` : esc(r.name.slice(0, 1))}</span><b>${esc(r.name)}</b>${r.id === A.me.user.id ? ` <span class="ab">${esc(t('users.you'))}</span>` : ''}${A.demoTag(r)}</span>` },
            { k: 'username', label: t('f.username'), h: r => `<span class="mono">${esc(r.username)}</span>` }, { k: 'email', label: t('f.email') }, { k: 'phone', label: t('f.phone') },
            { k: 'role_id', label: t('f.role'), v: r => rn(r.role_id) }, { k: 'status', label: t('f.status'), h: r => A.badge(r.status), x: r => r.status }, { k: 'last_login_at', label: t('f.lastLogin'), h: r => esc(A.dt(r.last_login_at)) }],
            actions: r => `<div class="row-act">${A.can('users', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-edit="${r.id}"`) : ''}${A.can('users', 'delete') && r.id !== A.me.user.id ? A.iconBtn('trash', t('a.delete'), `data-del="${r.id}"`) : ''}</div>` })}`;
        view.onclick = async e => {
          if (A.tableClick(e, draw)) return;
          const x = e.target.closest('[data-export]'); if (x) return A.exportTable(x.dataset.tbl, x.dataset.export, t('users.title'));
          const ed = e.target.closest('[data-edit]'); if (ed || e.target.closest('[data-new]')) userForm(ed ? rows.find(r => r.id === ed.dataset.edit) : null, roles, draw);
          const dl = e.target.closest('[data-del]'); if (dl && await A.confirm(t('a.delete') + '?', { danger: true })) { try { const r = await A.call('users.delete', { id: dl.dataset.del }); A.toast(r.deactivated ? t('users.deactivated') : t('deleted')); draw(); } catch (ex) { A.err(ex); } }
        };
      };
      await draw();
    }
  };
  function userForm(u, roles, after) {
    const isNew = !u; u = u || { status: 'active', lang: 'en', role_id: 'cashier', must_change_password: true };
    const m = A.modal({ size: 'md', title: esc(isNew ? t('users.newT') : t('users.editT', { n: u.name })), body: `<form class="form-a grid-2" data-f novalidate autocomplete="off">
      ${A.field({ name: 'name', label: t('f.name'), value: u.name, req: true })}${A.field({ name: 'username', label: t('f.username'), value: u.username, req: true, dir: 'ltr', attrs: ' autocomplete="off" autocapitalize="none"' })}
      ${A.field({ name: 'email', label: t('f.email'), value: u.email, type: 'email' })}${A.field({ name: 'phone', label: t('f.phone'), value: u.phone, type: 'tel', dir: 'ltr' })}
      ${A.field({ name: 'role_id', label: t('f.role'), value: u.role_id, type: 'select', options: roles.filter(r => r.id !== 'super_admin' || A.me.user.role_id === 'super_admin').map(r => [r.id, nm(r)]) })}
      ${A.field({ name: 'status', label: t('f.status'), value: u.status, type: 'select', options: ['active', 'inactive', 'suspended'].map(s => [s, t('st.' + s)]) })}
      ${A.field({ name: 'lang', label: t('f.language'), value: u.lang, type: 'select', options: [['en', 'English'], ['ar', 'العربية']] })}
      ${A.field({ name: 'password', label: isNew ? t('f.password') : t('f.newPassword'), type: 'password', req: isNew, attrs: ' autocomplete="new-password"', hint: '8+ · A–Z + 0–9' })}
      <div class="fld span-2"><label for="u-photo">${esc(t('f.photo'))}</label><input id="u-photo" type="file" accept="image/*" data-photo></div>
      ${A.field({ name: 'must_change_password', label: t('f.mustChange'), type: 'checkbox', value: u.must_change_password, cls: 'span-2' })}</form>`,
      foot: `<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.cancel'))}</button><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` });
    m.querySelector('[data-save]').onclick = async () => {
      const f = m.querySelector('[data-f]'); if (!A.validate(f)) return;
      const d = A.formData(f); const pw = d.password; delete d.password;
      try {
        const file = m.querySelector('[data-photo]').files[0];
        if (file) d.photo = (await A.processImage(file, 240)).url;
        await A.call('users.save', { id: u.id, data: d, password: pw || undefined }); A.toast(t('users.saved')); A.closeModal(); after();
      } catch (ex) { A.err(ex); }
    };
  }

  /* =========================== ROLES & PERMISSIONS =========================== */
  P.roles = {
    perm: ['users', 'view'],
    async render(view, parts) {
      const roles = await A.call('roles.list');
      const cur = roles.find(r => r.id === parts[0]) || roles.find(r => r.id === 'cashier') || roles[0];
      const S = ROKN.biz && ROKN.biz.schema;
      const modules = S ? S.modules : Object.keys(A.me.perms), actions = ['view', 'create', 'edit', 'delete', 'print', 'export'];
      const locked = cur.id === 'super_admin' || !A.can('users', 'edit');
      view.innerHTML = `${A.head(esc(t('roles.title')), '', A.can('users', 'create') ? A.btn(t('roles.newT'), { attrs: 'data-new', icon: 'plus' }) : '')}
        <div class="roles-l">
          <nav class="role-list" aria-label="${esc(t('roles.title'))}">${roles.map(r => `<a href="${A.href('roles--' + r.id)}"${r.id === cur.id ? ' aria-current="page"' : ''}><b>${esc(nm(r))}</b><small>${esc(t('roles.usersN', { n: r.users }))} · <span class="mono">${esc(r.key)}</span></small></a>`).join('')}</nav>
          <section class="card-a"><header class="card-h"><h2>${esc(t('roles.matrix'))} · ${esc(nm(cur))}</h2>${!cur.system && A.can('users', 'delete') ? A.iconBtn('trash', t('a.delete'), 'data-delrole') : ''}</header>
            ${cur.id === 'super_admin' ? `<p class="note-a">${I('lock')} ${esc(t('roles.locked'))}</p>` : ''}
            <form data-matrix><div class="tbl-wrap"><table class="tbl matrix"><thead><tr><th>${esc(t('f.module'))}</th>${actions.map(a => `<th class="c">${esc(t('act.' + a))}</th>`).join('')}<th class="c">${esc(t('roles.allRow'))}</th></tr></thead>
              <tbody>${modules.map(mo => `<tr><th scope="row">${esc(t('mod.' + mo))}</th>${actions.map(a => `<td class="c"><input type="checkbox" name="${mo}" value="${a}" aria-label="${esc(t('mod.' + mo) + ' · ' + t('act.' + a))}"${cur.id === 'super_admin' || (cur.perms[mo] || []).includes(a) ? ' checked' : ''}${locked ? ' disabled' : ''}></td>`).join('')}<td class="c"><input type="checkbox" data-row="${mo}" aria-label="${esc(t('mod.' + mo))} · ${esc(t('roles.allRow'))}"${locked ? ' disabled' : ''}></td></tr>`).join('')}</tbody></table></div>
            ${locked ? '' : `<button type="submit" class="btn-a primary">${I('check')} ${esc(t('a.saveChanges'))}</button>`}</form></section></div>`;
      ROKN.localizeLinks(view);
      const f = view.querySelector('[data-matrix]');
      f.addEventListener('change', e => { const r = e.target.closest('[data-row]'); if (r) f.querySelectorAll(`input[name="${r.dataset.row}"]`).forEach(x => { x.checked = r.checked; }); });
      f.addEventListener('submit', async e => {
        e.preventDefault();
        const perms = {}; modules.forEach(mo => { perms[mo] = [...f.querySelectorAll(`input[name="${mo}"]:checked`)].map(x => x.value); });
        try { await A.call('roles.save', { id: cur.id, perms }); A.toast(t('roles.saved')); if (cur.id === A.me.user.role_id) A.me = await A.call('auth.me'); } catch (ex) { A.err(ex); }
      });
      view.addEventListener('click', async e => {
        if (e.target.closest('[data-new]')) A.crudForm('roles', null, [['name_en', 'f.nameEn', { req: true }], ['name_ar', 'f.nameAr', { dir: 'rtl' }]], () => A.refresh(), t('roles.newT'));
        if (e.target.closest('[data-delrole]') && await A.confirm(t('a.delete') + ' ' + nm(cur) + '?', { danger: true })) { try { await A.call('roles.delete', { id: cur.id }); A.go('roles'); } catch (ex) { A.err(ex); } }
      });
    }
  };

  /* =========================== PRINTERS =========================== */
  P.printers = {
    perm: ['printers', 'view'],
    async render(view) {
      const draw = async () => {
        const [ps, pr] = await Promise.all([A.call('printers.list', {}), A.call('printer_profiles.list', {})]);
        const fields = [['name', 'f.name', { req: true }], ['type', 'f.type', { type: 'select', options: ['receipt', 'a4', 'a5', 'label', 'barcode', 'report'].map(x => [x, t('prn.types.' + x)]) }], ['paper', 'f.paper', { type: 'select', options: Object.keys(A.paper).map(x => [x, x]) }],
          ['connection', 'f.connection', { type: 'select', options: ['browser', 'usb', 'network', 'bluetooth'].map(x => [x, t('prn.conns.' + x)]) }], ['address', 'f.address', { dir: 'ltr', ph: '192.168.1.50 / USB001' }], ['copies', 'f.copies', { type: 'number', step: '1', min: 1, max: 5 }],
          ['header', 'f.header'], ['footer', 'f.footer'], ['is_default', 'f.isDefault', { type: 'checkbox' }], ['show_logo', 'f.showLogo', { type: 'checkbox' }], ['show_address', 'f.showAddress', { type: 'checkbox' }], ['show_phone', 'f.showPhone', { type: 'checkbox' }], ['show_qr', 'f.showQr', { type: 'checkbox' }], ['show_barcode', 'f.showBarcode', { type: 'checkbox' }],
          ['status', 'f.status', { type: 'select', options: ['active', 'inactive'].map(s => [s, t('st.' + s)]) }]];
        const pfields = [['name', 'f.name', { req: true }], ['document', 'f.document', { type: 'select', options: ['receipt', 'invoice', 'quote', 'label', 'report'].map(x => [x, t('prn.docs.' + x)]) }], ['printer_id', 'f.printer', { type: 'select', options: ps.map(p => [p.id, p.name]) }], ['paper', 'f.paper', { type: 'select', options: Object.keys(A.paper).map(x => [x, x]) }], ['copies', 'f.copies', { type: 'number', step: '1', min: 1 }], ['lang', 'f.language', { type: 'select', options: [['both', 'EN + AR'], ['en', 'English'], ['ar', 'العربية']] }], ['auto_print', 'f.autoPrint', { type: 'checkbox' }]];
        view.innerHTML = `${A.head(esc(t('prn.title')), esc(t('prn.note')), A.can('printers', 'create') ? A.btn(t('prn.newT'), { attrs: 'data-new', icon: 'plus' }) : '')}
          <div class="cards-grid">${ps.map(p => `<article class="prn-card ${p.status === 'inactive' ? 'off' : ''}"><span class="prn-i">${I(p.type === 'label' || p.type === 'barcode' ? 'labels' : 'printers')}</span><div><h3>${esc(p.name)} ${p.is_default ? `<span class="ab ab-active">${esc(t('f.isDefault'))}</span>` : ''}</h3>
            <p class="small muted">${esc(t('prn.types.' + p.type))} · ${esc(p.paper)} · ${esc(t('prn.conns.' + p.connection))}${p.address ? ' · ' + esc(p.address) : ''} · ×${p.copies}</p></div>
            <div class="row-act">${A.iconBtn('print', t('a.test'), `data-test="${p.id}"`)}${A.can('printers', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-edit="${p.id}"`) : ''}${A.can('printers', 'delete') ? A.iconBtn('trash', t('a.delete'), `data-del="${p.id}"`) : ''}</div></article>`).join('')}</div>
          <div class="pg-head sub"><h2>${esc(t('prn.profiles'))}</h2>${A.can('printers', 'create') ? A.btn(t('prn.newP'), { attrs: 'data-newp', icon: 'plus', cls: 'ghost' }) : ''}</div>
          ${A.table({ id: 'pp-tbl', rows: pr, cols: [{ k: 'name', label: t('f.name') }, { k: 'document', label: t('f.document'), v: r => t('prn.docs.' + r.document) }, { k: 'printer_id', label: t('f.printer'), v: r => (ps.find(p => p.id === r.printer_id) || {}).name || '—' }, { k: 'paper', label: t('f.paper') }, { k: 'copies', label: t('f.copies'), m: true }, { k: 'lang', label: t('f.language') }, { k: 'auto_print', label: t('f.autoPrint'), v: r => r.auto_print ? '✓' : '—' }],
            actions: r => `<div class="row-act">${A.can('printers', 'edit') ? A.iconBtn('edit', t('a.edit'), `data-editp="${r.id}"`) : ''}${A.can('printers', 'delete') ? A.iconBtn('trash', t('a.delete'), `data-delp="${r.id}"`) : ''}</div>` })}`;
        view.onclick = async e => {
          if (e.target.closest('[data-new]')) A.crudForm('printers', { type: 'receipt', paper: '80mm', connection: 'browser', copies: 1, show_logo: true, show_address: true, show_phone: true, show_qr: true, show_barcode: true, status: 'active' }, fields, refreshAfter(draw), t('prn.newT'));
          const ed = e.target.closest('[data-edit]'); if (ed) A.crudForm('printers', ps.find(p => p.id === ed.dataset.edit), fields, refreshAfter(draw));
          const dl = e.target.closest('[data-del]'); if (dl && await A.confirm(t('a.delete') + '?', { danger: true })) { await A.call('printers.delete', { id: dl.dataset.del }).catch(A.err); draw(); }
          if (e.target.closest('[data-newp]')) A.crudForm('printer_profiles', { document: 'receipt', copies: 1, lang: 'both' }, pfields, draw, t('prn.newP'));
          const ep = e.target.closest('[data-editp]'); if (ep) A.crudForm('printer_profiles', pr.find(p => p.id === ep.dataset.editp), pfields, draw);
          const dp = e.target.closest('[data-delp]'); if (dp && await A.confirm(t('a.delete') + '?', { danger: true })) { await A.call('printer_profiles.delete', { id: dp.dataset.delp }).catch(A.err); draw(); }
          const ts = e.target.closest('[data-test]');
          if (ts) {
            const p = ps.find(x => x.id === ts.dataset.test);
            const sample = { number: 'TEST-0001', created_at: new Date().toISOString(), salesperson_name: A.me.user.name, customer_name: '', status: 'completed', channel: 'pos', subtotal: 16.25, discount: 0, tax: 0, shipping: 0, total: 16.25, payment_status: 'paid', payment_method: 'cash',
              items: [{ name_en: 'Sample fabric', name_ar: 'قماش تجريبي', color: 'white', sku: 'TEST-SKU', meters: 2.5, price_per_meter: 6.5, discount: 0, total: 16.25 }], payments: [{ method: 'cash', amount: 16.25, tendered: 20, change: 3.75 }], refunds: [] };
            if (p.type === 'label' || p.type === 'barcode') A.print(A.docs.labels([{ name: 'Sample fabric · قماش', color: 'White', sku: 'TEST-SKU', code: 'TEST-SKU', price: 'KWD 6.500/m', extra: '150 cm' }]), p.paper);
            else if (p.type === 'receipt') A.print(A.docs.receipt(sample, A.settings, p), p.paper);
            else A.print(A.docs.invoice(sample, A.settings, p), p.paper);
          }
        };
      };
      await draw();
    }
  };
  const refreshAfter = draw => async () => { draw(); try { A.me = await A.call('auth.me'); } catch (e) { /* */ } };

  /* =========================== SETTINGS =========================== */
  const SET = {
    business: [['name_en', 'text'], ['name_ar', 'text', 'rtl'], ['legal_name', 'text'], ['phone', 'tel'], ['phone_e164', 'tel'], ['whatsapp', 'tel'], ['email', 'email'], ['cr_number', 'text'], ['address_en', 'textarea'], ['address_ar', 'textarea', 'rtl'], ['maps_url', 'url'], ['logo', 'url']],
    store: [['branch_name_en', 'text'], ['branch_name_ar', 'text', 'rtl'], ['hours_en', 'textarea'], ['hours_ar', 'textarea', 'rtl']],
    currency: [['code', 'text'], ['symbol_en', 'text'], ['symbol_ar', 'text', 'rtl'], ['decimals', 'number']],
    tax: [['enabled', 'checkbox'], ['name_en', 'text'], ['name_ar', 'text', 'rtl'], ['rate', 'number'], ['inclusive', 'checkbox']],
    shipping: [['standard_fee', 'number'], ['express_fee', 'number'], ['pickup_fee', 'number'], ['free_threshold', 'number']],
    payments: [['cash', 'checkbox'], ['knet', 'checkbox'], ['card', 'checkbox'], ['bank_transfer', 'checkbox'], ['other', 'checkbox'], ['cod', 'checkbox'], ['applepay', 'checkbox'], ['gateway_connected', 'checkbox']],
    pos: [['walk_in_label_en', 'text'], ['walk_in_label_ar', 'text', 'rtl'], ['quick_meters', 'text'], ['max_line_discount_pct', 'number'], ['allow_negative_stock', 'checkbox'], ['require_customer', 'checkbox'], ['auto_print_receipt', 'checkbox']],
    invoice: [['prefix', 'text'], ['next_number', 'number'], ['quote_prefix', 'text'], ['po_prefix', 'text'], ['expense_prefix', 'text'], ['notes_en', 'textarea'], ['notes_ar', 'textarea', 'rtl'], ['terms_en', 'textarea'], ['terms_ar', 'textarea', 'rtl']],
    receipt: [['header_en', 'text'], ['header_ar', 'text', 'rtl'], ['footer_en', 'text'], ['footer_ar', 'text', 'rtl'], ['show_qr', 'checkbox'], ['show_barcode', 'checkbox'], ['lang', 'select', null, [['both', 'EN + AR'], ['en', 'English'], ['ar', 'العربية']]]],
    inventory: [['unit', 'text'], ['default_min_stock', 'number'], ['meter_step', 'number'], ['min_meters', 'number'], ['max_meters', 'number'], ['low_stock_alerts', 'checkbox'], ['roll_tracking', 'checkbox']],
    notifications: [['low_stock', 'checkbox'], ['out_of_stock', 'checkbox'], ['new_order', 'checkbox'], ['new_customer', 'checkbox'], ['payment', 'checkbox'], ['refund', 'checkbox'], ['new_user', 'checkbox'], ['inventory_adjustment', 'checkbox'], ['daily_report', 'checkbox']],
    email: [['connected', 'checkbox'], ['from_name', 'text'], ['from_email', 'email'], ['smtp_host', 'text']],
    whatsapp: [['number', 'tel'], ['order_template_en', 'textarea'], ['order_template_ar', 'textarea', 'rtl']],
    languages: [['default', 'select', null, [['en', 'English'], ['ar', 'العربية']]], ['admin_default', 'select', null, [['en', 'English'], ['ar', 'العربية']]], ['enabled', 'text']],
    seo: [['site_url', 'url'], ['title_en', 'text'], ['title_ar', 'text', 'rtl'], ['description_en', 'textarea'], ['description_ar', 'textarea', 'rtl']],
    security: [['session_hours', 'number'], ['max_failed_logins', 'number'], ['lockout_minutes', 'number'], ['min_password_length', 'number'], ['require_strong_password', 'checkbox']],
    website: [['announcement_en', 'text'], ['announcement_ar', 'text', 'rtl'], ['sample_notice', 'checkbox'], ['newsletter_connected', 'checkbox'], ['hero_images', 'textarea', 'ltr'], ['instagram_url', 'url'], ['facebook_url', 'url'], ['tiktok_url', 'url']]
  };
  const label = k => k.replace(/_/g, ' ').replace(/\b(en|ar)\b/g, m => m.toUpperCase()).replace(/^\w/, c => c.toUpperCase());
  const labelAr = { name_en: 'الاسم (EN)', name_ar: 'الاسم (AR)', phone: 'الهاتف', email: 'البريد', address_en: 'العنوان (EN)', address_ar: 'العنوان (AR)', enabled: 'مفعّل', rate: 'النسبة %', standard_fee: 'رسوم التوصيل العادي', express_fee: 'رسوم التوصيل السريع', pickup_fee: 'رسوم الاستلام من المتجر', free_threshold: 'حد التوصيل المجاني (فارغ = إيقاف)', gateway_connected: 'بوابة الدفع متصلة', prefix: 'بادئة الفاتورة', next_number: 'رقم الفاتورة التالي', session_hours: 'مدة الجلسة (ساعات)', max_failed_logins: 'أقصى محاولات فاشلة', lockout_minutes: 'مدة القفل (دقائق)', min_password_length: 'أقل طول لكلمة المرور', quick_meters: 'أمتار سريعة', max_line_discount_pct: 'أقصى خصم للكاشير %', default_min_stock: 'الحد الأدنى الافتراضي (م)', meter_step: 'خطوة الأمتار' };
  P.settings = {
    perm: ['settings', 'view'],
    async render(view, parts) {
      const all = await A.call('settings.get');
      const sec = SET[parts[0]] ? parts[0] : parts[0] === 'backup' ? 'backup' : 'business';
      const canEdit = A.can('settings', 'edit');
      const nav = Object.keys(SET).concat('backup').map(k => `<a href="${A.href('settings--' + k)}"${k === sec ? ' aria-current="page"' : ''}>${esc(t('set.sections.' + k))}</a>`).join('');
      let body;
      if (sec === 'backup') {
        body = `<section class="card-a"><h2>${esc(t('set.backupT'))}</h2>
          ${A.can('settings', 'export') ? `<p><button type="button" class="btn-a primary" data-exp>${I('download')} ${esc(t('set.exportJson'))}</button></p>` : ''}
          ${canEdit && A.me.user.role_id === 'super_admin' ? `<div class="fld"><label for="bk-imp">${esc(t('set.importJson'))}</label><input id="bk-imp" type="file" accept="application/json" data-imp></div>` : ''}
          ${A.can('settings', 'delete') && A.me.user.role_id === 'super_admin' ? `<hr class="hr-a"><p class="muted">${esc(t('set.clearDemoQ'))}</p><button type="button" class="btn-a danger" data-cleardemo>${I('trash')} ${esc(t('dash.removeDemo'))}</button>` : ''}
          ${ROKN.api.mode === 'local' ? `<hr class="hr-a"><button type="button" class="btn-a ghost" data-resetlocal>${I('refresh')} ${esc(t('set.resetLocal'))}</button>` : ''}
          <p class="small muted">${esc(t('f.updated'))}: ${esc(all.backup.last_export_at ? A.dt(all.backup.last_export_at) : '—')}</p></section>`;
      } else {
        const vals = all[sec];
        body = `<form class="card-a" data-set novalidate ${canEdit ? '' : 'inert'}><h2>${esc(t('set.sections.' + sec))}</h2>
          ${sec === 'payments' ? `<p class="note-a">${I('alert')} ${esc(t('set.gatewayNote'))}</p>` : ''}${sec === 'email' && !vals.connected ? `<p class="note-a">${esc(t('set.notConnected'))}</p>` : ''}
          <div class="grid-2">${SET[sec].map(([k, type, dir, options]) => A.field({ name: k, label: A.isAr() && labelAr[k] ? labelAr[k] : (sec === 'payments' || sec === 'notifications') && t(sec === 'payments' ? 'pm.' + k : 'ntf.types.' + k) !== k ? t(sec === 'payments' ? 'pm.' + k : 'ntf.types.' + k) : label(k), type: type === 'url' ? 'text' : type, value: vals[k] == null ? '' : vals[k], dir: dir || (type === 'url' || type === 'tel' || type === 'email' ? 'ltr' : undefined), options, step: type === 'number' ? 'any' : undefined, cls: type === 'textarea' ? 'span-2' : '' })).join('')}</div>
          ${canEdit ? `<button type="submit" class="btn-a primary">${I('check')} ${esc(t('a.saveChanges'))}</button>` : ''}</form>`;
      }
      view.innerHTML = `${A.head(esc(t('set.title')))}<div class="set-l"><nav class="set-nav" aria-label="${esc(t('set.title'))}">${nav}</nav><div>${body}</div></div>`;
      ROKN.localizeLinks(view);
      const f = view.querySelector('[data-set]');
      if (f) f.addEventListener('submit', async e => {
        e.preventDefault();
        try { await A.call('settings.save', { section: sec, values: A.formData(f) }); A.toast(t('set.saved')); A.me = await A.call('auth.me'); A.settings = A.me.settings; } catch (ex) { A.err(ex); }
      });
      view.addEventListener('click', async e => {
        if (e.target.closest('[data-exp]')) { try { const b = await A.call('backup.export', {}); A.download(`rokn-backup-${A.day()}.json`, JSON.stringify(b, null, 1), 'application/json'); } catch (ex) { A.err(ex); } }
        if (e.target.closest('[data-cleardemo]') && await A.confirm(t('set.clearDemoQ'), { danger: true })) { try { const r = await A.call('demo.clear', {}); A.toast(t('set.demoCleared', { n: r.removed })); A.me = await A.call('auth.me'); A.shell.layout('settings--backup'); A.refresh(); } catch (ex) { A.err(ex); } }
        if (e.target.closest('[data-resetlocal]') && await A.confirm(t('set.resetQ'), { danger: true })) { await ROKN.api.resetLocal(); location.reload(); }
      });
      const imp = view.querySelector('[data-imp]');
      if (imp) imp.addEventListener('change', async () => {
        const file = imp.files[0]; if (!file) return;
        try { const data = JSON.parse(await file.text()); if (!(await A.confirm(t('set.importJson') + '?', { danger: true }))) return; await A.call('backup.import', data); A.toast(t('set.restored')); A.refresh(); } catch (ex) { A.err(ex); }
      });
    }
  };

  /* =========================== MEDIA LIBRARY =========================== */
  const mediaState = { folder: '', q: '' };
  P.media = {
    perm: ['media', 'view'],
    async render(view) {
      const folders = ['products', 'categories', 'collections', 'banners', 'store', 'logo', 'marketing', 'social'];
      const draw = async () => {
        const rows = await A.call('media.list', mediaState);
        view.querySelector('[data-body]').innerHTML = `<div class="media-grid">${rows.map(m => `<figure class="mcard"><button type="button" class="mthumb" data-open="${m.id}" aria-label="${esc(m.name)}"><img src="${esc(m.url.replace(/^(assets\/img\/store\/[\w-]+)\.webp$/, '$1-sm.webp'))}" alt="${esc(A.L(m, 'alt') || m.name)}" loading="lazy"></button>
          <figcaption><b title="${esc(m.name)}">${esc(m.name)}</b><small>${esc(t('media.folders.' + m.folder))}${m.width ? ` · ${m.width}×${m.height}` : ''}${m.real ? ` · <span class="ab ab-real">${esc(t('media.real'))}</span>` : ''}</small>${(m.uses || []).length ? `<small class="muted">${esc(t('media.used'))}: ${m.uses.map(u => esc(t('media.' + (u.target === 'product_featured' ? 'productFeatured' : u.target)))).join(', ')}</small>` : ''}</figcaption></figure>`).join('') || `<div class="empty-a">${I('media', 'ai-xl')}<p>${esc(t('noData'))}</p></div>`}</div>`;
        view.querySelector('[data-body]').onclick = e => { const o = e.target.closest('[data-open]'); if (o) detail(rows.find(r => r.id === o.dataset.open)); };
      };
      const upload = async files => {
        let n = 0;
        for (const file of files) {
          try { const img = await A.processImage(file); await A.call('media.save', { data: { folder: mediaState.folder || 'products', name: file.name.replace(/\.(jpe?g|png|gif)$/i, '.webp'), url: img.url, mime: img.mime, size: img.size, width: img.width, height: img.height, alt_en: '', alt_ar: '' } }); n++; }
          catch (ex) { A.err(ex); }
        }
        if (n) { A.toast(t('media.uploaded', { n })); draw(); }
      };
      const detail = m => {
        const targets = [['product_featured', t('media.productFeatured'), 'products'], ['product', t('media.product'), 'products'], ['category', t('media.category'), 'categories'], ['collection', t('media.collection'), 'collections'], ['banner', t('media.banner'), null], ['logo', t('media.logo'), null]];
        const canEdit = A.can('media', 'edit');
        const dlg = A.modal({ size: 'lg', title: esc(m.name), body: `<div class="mdet"><div class="mdet-img"><img src="${esc(m.url)}" alt="${esc(A.L(m, 'alt'))}"></div>
          <form class="form-a" data-f novalidate>${A.field({ name: 'name', label: t('f.name'), value: m.name })}${A.field({ name: 'folder', label: t('f.folder'), type: 'select', value: m.folder, options: folders.map(f => [f, t('media.folders.' + f)]) })}
          ${A.field({ name: 'alt_en', label: t('f.alt') + ' (EN)', value: m.alt_en })}${A.field({ name: 'alt_ar', label: t('f.alt') + ' (AR)', value: m.alt_ar, dir: 'rtl' })}
          <p class="small muted">${m.mime || ''}${m.size ? ' · ' + Math.round(m.size / 1024) + ' KB' : ''}${m.width ? ` · ${m.width}×${m.height}` : ''} · ${esc(m.uploaded_by || '')} · ${esc(A.date(m.created_at))}</p>
          <div class="url-row"><input readonly value="${esc(/^data:/.test(m.url) ? m.url.slice(0, 60) + '…' : m.url)}" aria-label="URL" dir="ltr"><button type="button" class="btn-a ghost sm" data-copy>${I('copy')} ${esc(t('a.copyUrl'))}</button></div>
          ${canEdit ? `<fieldset class="fld"><legend>${esc(t('media.setAs'))}</legend><div class="grid-2"><select data-target aria-label="${esc(t('media.setAs'))}">${targets.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select><select data-ref aria-label="${esc(t('media.chooseTarget'))}"></select></div><button type="button" class="btn-a primary sm" data-use>${I('check')} ${esc(t('a.apply'))}</button></fieldset>` : ''}
          </form></div>`,
          foot: `${A.can('media', 'delete') ? `<button type="button" class="btn-a danger-ghost" data-del>${I('trash')} ${esc(t('a.delete'))}</button>` : ''}${canEdit ? `<label class="btn-a ghost">${I('upload')} ${esc(t('a.replace'))}<input type="file" accept="image/*" data-replace hidden></label><button type="button" class="btn-a primary" data-save>${esc(t('a.save'))}</button>` : ''}` });
        const fillRef = () => {
          const tg = dlg.querySelector('[data-target]'); if (!tg) return;
          const list = targets.find(x => x[0] === tg.value)[2];
          const sel = dlg.querySelector('[data-ref]');
          sel.hidden = !list;
          if (list === 'products') A.call('products.list', {}).then(ps => { sel.innerHTML = ps.map(p => `<option value="${p.id}">${esc(nm(p))}</option>`).join(''); });
          else if (list) sel.innerHTML = (A.lookups[list] || []).map(c => `<option value="${c.id}">${esc(nm(c))}</option>`).join('');
        };
        fillRef();
        dlg.addEventListener('change', async e => {
          if (e.target.matches('[data-target]')) fillRef();
          if (e.target.matches('[data-replace]')) { const file = e.target.files[0]; if (!file) return; try { const img = await A.processImage(file); await A.call('media.save', { id: m.id, data: { url: img.url, mime: img.mime, size: img.size, width: img.width, height: img.height } }); A.toast(t('saved')); A.closeModal(); draw(); } catch (ex) { A.err(ex); } }
        });
        dlg.addEventListener('click', async e => {
          if (e.target.closest('[data-copy]')) { const full = /^data:/.test(m.url) ? m.url : new URL(m.url, location.href).href; try { await navigator.clipboard.writeText(full); A.toast(t('media.copied')); } catch (ex) { const i = dlg.querySelector('.url-row input'); i.value = full; i.select(); } }
          if (e.target.closest('[data-save]')) { try { await A.call('media.save', { id: m.id, data: A.formData(dlg.querySelector('[data-f]')) }); A.toast(t('saved')); A.closeModal(); draw(); } catch (ex) { A.err(ex); } }
          if (e.target.closest('[data-use]')) { try { const tg = dlg.querySelector('[data-target]').value; await A.call('media.use', { id: m.id, target: tg, ref: dlg.querySelector('[data-ref]').hidden ? null : dlg.querySelector('[data-ref]').value }); A.toast(t('media.applied')); A.closeModal(); draw(); if (tg === 'category' || tg === 'collection') A.lookups = await A.call('lookups.all'); } catch (ex) { A.err(ex); } }
          if (e.target.closest('[data-del]') && await A.confirm(t('media.deleteQ', { n: m.name }), { danger: true })) { try { await A.call('media.delete', { id: m.id }); A.closeModal(); draw(); } catch (ex) { A.err(ex); } }
        });
      };
      view.innerHTML = `${A.head(esc(t('media.title')), '')}
        ${A.can('media', 'create') ? `<label class="dropzone" data-drop tabindex="0">${I('upload', 'ai-xl')}<b>${esc(t('media.drop'))}</b><small>${esc(t('media.formats'))}</small><input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" multiple data-files hidden></label>` : ''}
        <div class="filters-a"><div class="seg seg-wrap" role="group" aria-label="${esc(t('f.folder'))}"><button type="button" data-folder="" aria-pressed="${!mediaState.folder}">${esc(t('a.all'))}</button>${folders.map(f => `<button type="button" data-folder="${f}" aria-pressed="${mediaState.folder === f}">${esc(t('media.folders.' + f))}</button>`).join('')}</div>
          <label class="srch">${I('search')}<input type="search" data-q value="${esc(mediaState.q)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label></div>
        <div data-body></div>`;
      view.addEventListener('click', e => { const f = e.target.closest('[data-folder]'); if (f) { mediaState.folder = f.dataset.folder; view.querySelectorAll('[data-folder]').forEach(b => b.setAttribute('aria-pressed', b === f)); draw(); } });
      view.addEventListener('input', A.debounce(e => { if (e.target.matches('[data-q]')) { mediaState.q = e.target.value; draw(); } }, 250));
      const dz = view.querySelector('[data-drop]');
      if (dz) {
        dz.querySelector('[data-files]').addEventListener('change', e => upload([...e.target.files]));
        dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dz.querySelector('input').click(); } });
        ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('over'); }));
        ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('over'); }));
        dz.addEventListener('drop', e => upload([...e.dataTransfer.files]));
      }
      await draw();
    }
  };

  /* =========================== ACTIVITY LOGS =========================== */
  const logState = Object.assign({ q: '', module: '', action: '' }, (() => { const [from, to] = A.range('d7'); return { preset: 'd7', from, to }; })());
  P.logs = {
    perm: ['logs', 'view'],
    async render(view) {
      const S = ROKN.biz && ROKN.biz.schema;
      const draw = async () => {
        const rows = await A.call('logs.list', logState);
        view.querySelector('[data-body]').innerHTML = `<div class="sum-strip"><span>${esc(t('rows', { n: rows.length }))}</span>${A.exportBtns('log-tbl')}</div>${A.table({ id: 'log-tbl', title: t('logs.title'), rows, cols: [
          { k: 'created_at', label: t('f.date'), h: r => esc(A.dt(r.created_at)), x: r => r.created_at },
          { k: 'user_name', label: t('f.user') }, { k: 'action', label: t('f.action'), h: r => `<span class="ab ab-${r.action === 'denied' || r.action === 'login_failed' ? 'cancelled' : 'x'}">${esc(r.action)}</span>`, x: r => r.action },
          { k: 'module', label: t('f.module'), v: r => t('mod.' + r.module) }, { k: 'summary', label: t('f.description'), cls: 'wrap' }, { k: 'record_id', label: t('f.record'), h: r => `<span class="mono small">${esc(r.record_id || '')}</span>` },
          { k: 'ip', label: t('f.device'), h: r => `<small class="muted" title="${esc(r.device || '')}">${esc(r.ip || '')}</small>`, x: r => `${r.ip || ''} ${r.device || ''}` }],
          actions: r => r.before || r.after ? A.iconBtn('eye', t('logs.diff'), `data-diff="${r.id}"`) : '' })}`;
        view.querySelector('[data-body]').onclick = e => {
          const d = e.target.closest('[data-diff]'); if (!d) return;
          const r = rows.find(x => x.id === d.dataset.diff);
          const keys = [...new Set(Object.keys(r.before || {}).concat(Object.keys(r.after || {})))];
          const show = v => esc(typeof v === 'object' && v !== null ? JSON.stringify(v) : v == null ? '—' : String(v)).slice(0, 400);
          A.modal({ size: 'lg', title: esc(r.summary), body: `<p class="muted">${esc(r.user_name)} · ${esc(A.dt(r.created_at))} · ${esc(r.ip || '')}</p><table class="tbl"><thead><tr><th>${esc(t('f.record'))}</th><th>${esc(t('f.before'))}</th><th>${esc(t('f.after'))}</th></tr></thead><tbody>${keys.map(k => `<tr><th scope="row" class="mono">${esc(k)}</th><td class="bad">${show((r.before || {})[k])}</td><td class="good">${show((r.after || {})[k])}</td></tr>`).join('')}</tbody></table>` });
        };
      };
      view.innerHTML = `${A.head(esc(t('logs.title')))}
        <div class="filters-a">${A.period(logState)}<select data-f="module" aria-label="${esc(t('f.module'))}"><option value="">${esc(t('f.module'))}: ${esc(t('a.all'))}</option>${(S ? S.modules : []).map(m => `<option value="${m}">${esc(t('mod.' + m))}</option>`).join('')}</select>
        <label class="srch">${I('search')}<input type="search" data-q value="${esc(logState.q)}" placeholder="${esc(t('a.search'))}" aria-label="${esc(t('a.search'))}"></label></div><div data-body></div>`;
      view.querySelector('[data-f=module]').value = logState.module;
      A.bindPeriod(view, logState, draw); A.bindTable(view, draw);
      view.addEventListener('change', e => { const f = e.target.closest('select[data-f]'); if (f) { logState[f.dataset.f] = f.value; draw(); } });
      view.addEventListener('input', A.debounce(e => { if (e.target.matches('[data-q]')) { logState.q = e.target.value; draw(); } }, 250));
      await draw();
    }
  };
})();
