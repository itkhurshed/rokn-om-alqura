/* ==========================================================================
   ADMIN KIT — i18n, formatting, icons, tables, forms, modals, charts,
   exports (CSV / Excel / PDF-print), printing, barcodes, image processing.
   ========================================================================== */
window.ROKN = window.ROKN || {};
(function () {
  const A = ROKN.admin = ROKN.admin || {};
  const esc = ROKN.esc;
  A.esc = esc;
  A.lang = () => ROKN.state.lang;
  A.isAr = () => ROKN.state.lang === 'ar';

  /* ---------------- i18n ---------------- */
  A.t = function (path, vars) {
    const get = d => path.split('.').reduce((o, k) => (o == null ? o : o[k]), d);
    let v = get(ROKN.adminI18n[A.lang()]); if (v == null) v = get(ROKN.adminI18n.en);
    if (v == null) v = path.split('.').pop().replace(/_/g, ' ');
    if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));
    return v;
  };
  const t = A.t;
  A.L = (row, base) => row ? (row[`${base}_${A.lang()}`] || row[`${base}_en`] || '') : '';
  A.colorName = key => { const c = (A.lookups && A.lookups.colors || []).find(x => x.id === key) || ROKN.catalog.colors[key]; return c ? (c.name_en ? A.L(c, 'name') : (A.isAr() ? c.ar : c.en)) : key; };
  A.colorHex = key => { const c = (A.lookups && A.lookups.colors || []).find(x => x.id === key) || ROKN.catalog.colors[key]; return c ? c.hex : '#ccc'; };

  /* ---------------- formatting (Latin digits in both languages) ---------------- */
  const loc = () => A.isAr() ? 'ar-KW-u-nu-latn' : 'en-GB';
  A.money = (n, bare) => { const v = Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }); return bare ? v : (A.isAr() ? `${v} د.ك` : `KWD ${v}`); };
  A.num = (n, d) => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d });
  A.m = n => `${A.num(n, 2)} ${A.isAr() ? 'م' : 'm'}`;
  A.date = iso => { if (!iso) return '—'; try { return new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString(loc(), { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return iso; } };
  A.dt = iso => { if (!iso) return '—'; try { return new Date(iso).toLocaleString(loc(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } };
  A.time = iso => { try { return new Date(iso).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
  A.pad = (n, w) => String(n).padStart(w, '0');
  A.day = d => { const x = d ? new Date(d) : new Date(); return `${x.getFullYear()}-${A.pad(x.getMonth() + 1, 2)}-${A.pad(x.getDate(), 2)}`; };
  A.range = key => {
    const n = new Date(), d = o => { const x = new Date(n); x.setDate(x.getDate() + o); return A.day(x); };
    return ({ today: [d(0), d(0)], yesterday: [d(-1), d(-1)], d7: [d(-6), d(0)], d30: [d(-29), d(0)],
      month: [A.day(new Date(n.getFullYear(), n.getMonth(), 1)), d(0)],
      lastMonth: [A.day(new Date(n.getFullYear(), n.getMonth() - 1, 1)), A.day(new Date(n.getFullYear(), n.getMonth(), 0))],
      year: [A.day(new Date(n.getFullYear(), 0, 1)), d(0)] }[key] || [d(0), d(0)]);
  };
  A.badge = (key, group) => `<span class="ab ab-${esc(key)}">${esc(t(`${group || 'st'}.${key}`))}</span>`;
  A.demoTag = r => r && r.demo ? `<span class="ab ab-demo" title="Demo">DEMO</span>` : '';

  /* ---------------- icons ---------------- */
  const P = {
    dashboard: '<rect x="3.5" y="3.5" width="7" height="9" rx="1"/><rect x="13.5" y="3.5" width="7" height="5" rx="1"/><rect x="13.5" y="11.5" width="7" height="9" rx="1"/><rect x="3.5" y="15.5" width="7" height="5" rx="1"/>',
    sales: '<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8h6M9 11.5h6M9 15h3"/>',
    pos: '<rect x="3.5" y="4" width="17" height="11" rx="1.5"/><path d="M8 20h8M12 15v5M7 8h5"/>',
    orders: '<path d="M4 7.5 12 3.5l8 4v9l-8 4-8-4z"/><path d="m4 7.5 8 4 8-4M12 11.5v9"/>',
    products: '<path d="M3.5 12.5 11 5h8.5v8.5L12 21z"/><circle cx="15.5" cy="9" r="1.3"/>',
    categories: '<rect x="4" y="4" width="6.5" height="6.5"/><rect x="13.5" y="4" width="6.5" height="6.5"/><rect x="4" y="13.5" width="6.5" height="6.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5"/>',
    collections: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
    inventory: '<path d="M3.5 7.5h17v13h-17zM2.5 3.5h19v4h-19z"/><path d="M10 11.5h4"/>',
    rolls: '<ellipse cx="7" cy="12" rx="3" ry="7"/><path d="M7 5h11c1.7 0 3 3.1 3 7s-1.3 7-3 7H7"/><ellipse cx="7" cy="12" rx="1" ry="2.3"/>',
    customers: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>',
    suppliers: '<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    purchases: '<rect x="5" y="4.5" width="14" height="16" rx="1.5"/><path d="M9 3.5h6v3H9zM8.5 11h7M8.5 14.5h7M8.5 18h4"/>',
    expenses: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14.5h2"/>',
    reports: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3M20 16V6"/>',
    daily: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4M8 13.5h3v3H8z"/>',
    users: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.7-4 3.6-6.2 7.5-6.2s6.8 2.2 7.5 6.2"/>',
    roles: '<path d="M12 3.5 19.5 6v6c0 4.5-3.2 7.5-7.5 8.5C7.7 19.5 4.5 16.5 4.5 12V6z"/><path d="m9 12 2 2 4-4.5"/>',
    printers: '<path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8.5" rx="1.5"/><path d="M7 14h10v6.5H7z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"/>',
    media: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5.5-5 4 3.5 2.5-2 4 3.5"/>',
    notifications: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    logs: '<path d="M8 6.5h12M8 12h12M8 17.5h12"/><circle cx="4.5" cy="6.5" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="17.5" r="1"/>',
    coupons: '<path d="M3.5 8V5.5h17V8a2.5 2.5 0 0 0 0 5v5.5h-17V13a2.5 2.5 0 0 0 0-5z"/><path d="M14 6v12" stroke-dasharray="1.5 2"/>',
    labels: '<path d="M4 5v14M7 5v14M10 5v14M13.5 5v14M15.5 5v14M18 5v14M20 5v14"/>',
    logout: '<path d="M14 4.5H5.5v15H14M10 12h10.5M17 8.5l3.5 3.5-3.5 3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12.5 4.3 4.3L19 7"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>', eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4.5 19.5h15"/>', upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4.5 19.5h15"/>', print: '<path d="M7 8V3.5h10V8"/><rect x="3.5" y="8" width="17" height="8.5" rx="1.5"/><path d="M7 14h10v6.5H7z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5z"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5c0 1.4 1.1 2.5 2.7 2.5s2.6-1.1 2.6-2.5c0 1.4 1.1 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1 2.5 2.6 2.5S20 10.9 20 9.5"/><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20"/>',
    alert: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4.5M12 17v.5"/>', refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15"/>',
    copy: '<rect x="8" y="8" width="11" height="12" rx="1.5"/><path d="M5 15.5V5.5A1.5 1.5 0 0 1 6.5 4H15"/>', scan: '<path d="M4 8V4.5h3.5M20 8V4.5h-3.5M4 16v3.5h3.5M20 16v3.5h-3.5M7 12h10"/>',
    more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>', chevron: '<path d="m9 6 6 6-6 6"/>', chevronDown: '<path d="m6 9 6 6 6-6"/>',
    hold: '<path d="M9 6v12M15 6v12"/>', file: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/>', wa: '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.6 18.6z"/><path d="M9.2 8.6c.3 2.7 2.4 5 5.2 5.6l.9-1.2 1.9.7"/>',
    undo: '<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9a5.5 5.5 0 0 1 0 11"/>', lock: '<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>', user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.7-4 3.6-6.2 7.5-6.2s6.8 2.2 7.5 6.2"/>'
  };
  A.i = (name, cls) => `<svg class="ai ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${P[name] || ''}</svg>`;
  const I = A.i;

  /* ---------------- toast / modal / confirm ---------------- */
  let toastT;
  A.toast = function (msg, kind) {
    let el = document.getElementById('a-toast');
    if (!el) { el = document.createElement('div'); el.id = 'a-toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.className = 'a-toast show ' + (kind || 'ok'); el.innerHTML = `${I(kind === 'err' ? 'alert' : 'check')}<span>${esc(msg)}</span>`;
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), kind === 'err' ? 5200 : 2600);
  };
  A.err = function (e) {
    console.warn('[admin]', e);
    const msg = (e && e.code && ROKN.adminI18n[A.lang()].errs[e.code]) ? `${t('errs.' + e.code)}${e.code === 'insufficient_stock' ? ' — ' + e.message : ''}` : (e && e.message) || t('error');
    A.toast(msg, 'err');
    if (e && e.code === 'unauthenticated') A.shell && A.shell.signedOut();
    if (e && e.code === 'password_change_required') A.shell && A.shell.mustChange();
  };
  const stack = [];
  A.modal = function (o) {
    const wrap = document.createElement('div');
    wrap.className = 'am-wrap'; wrap.innerHTML = `
      <div class="am-back" data-am-close></div>
      <div class="am ${o.size ? 'am-' + o.size : ''}" role="dialog" aria-modal="true" aria-labelledby="am-t-${stack.length}">
        <header class="am-head"><h2 id="am-t-${stack.length}">${o.title || ''}</h2><button type="button" class="ab-icon" data-am-close aria-label="${esc(t('a.close'))}">${I('x')}</button></header>
        <div class="am-body">${o.body || ''}</div>
        ${o.foot ? `<footer class="am-foot">${o.foot}</footer>` : ''}
      </div>`;
    document.body.appendChild(wrap);
    const prev = document.activeElement;
    stack.push({ wrap, prev, onClose: o.onClose });
    wrap.addEventListener('click', e => { if (e.target.closest('[data-am-close]')) A.closeModal(); });
    ROKN.localizeLinks(wrap);
    requestAnimationFrame(() => { wrap.classList.add('open'); const f = wrap.querySelector('[autofocus], .am-body input:not([type=hidden]):not([type=checkbox]), .am-body select, .am-body textarea, .am-foot .btn-a'); if (f) f.focus(); });
    if (o.onMount) o.onMount(wrap.querySelector('.am'));
    return wrap.querySelector('.am');
  };
  A.closeModal = function () {
    const top = stack.pop(); if (!top) return;
    top.wrap.remove(); if (top.onClose) top.onClose();
    if (top.prev && top.prev.focus) top.prev.focus();
  };
  A.closeAllModals = () => { while (stack.length) A.closeModal(); };
  A.confirm = (msg, opts) => new Promise(res => {
    opts = opts || {};
    let done = false;
    const m = A.modal({ title: esc(opts.title || t('confirmT')), size: 'sm', body: `<p class="am-msg">${esc(msg)}</p>${opts.input ? `<label class="fld"><span>${esc(opts.input)}</span><input name="v" ${opts.required ? 'required' : ''}></label>` : ''}`,
      foot: `<button type="button" class="btn-a ghost" data-c="0">${esc(t('a.cancel'))}</button><button type="button" class="btn-a ${opts.danger ? 'danger' : 'primary'}" data-c="1">${esc(opts.ok || t('a.confirm'))}</button>`,
      onClose: () => { if (!done) res(false); } });
    m.addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      const v = m.querySelector('input[name=v]');
      if (b.dataset.c === '1' && v && opts.required && !v.value.trim()) { v.focus(); v.classList.add('invalid'); return; }
      done = true; res(b.dataset.c === '1' ? (v ? v.value.trim() || true : true) : false); A.closeModal();
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && stack.length) { e.preventDefault(); A.closeModal(); }
    if (e.key === 'Tab' && stack.length) {
      const scope = stack[stack.length - 1].wrap.querySelector('.am');
      const f = [...scope.querySelectorAll('a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- forms ---------------- */
  /* field({name,label,type,value,options:[[v,l]],req,hint,step,min,cls,attrs}) */
  A.field = function (f) {
    const id = 'f_' + f.name.replace(/[^\w]/g, '_') + '_' + Math.random().toString(36).slice(2, 6);
    const v = f.value == null ? '' : f.value;
    const req = f.req ? ' required aria-required="true"' : '';
    const attrs = (f.attrs || '') + (f.step ? ` step="${f.step}"` : '') + (f.min != null ? ` min="${f.min}"` : '') + (f.max != null ? ` max="${f.max}"` : '') + (f.dir ? ` dir="${f.dir}"` : '') + (f.ph ? ` placeholder="${esc(f.ph)}"` : '');
    let input;
    if (f.type === 'select') input = `<select id="${id}" name="${f.name}"${req}${attrs}>${(f.options || []).map(o => `<option value="${esc(o[0])}"${String(o[0]) === String(v) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
    else if (f.type === 'textarea') input = `<textarea id="${id}" name="${f.name}" rows="${f.rows || 3}"${req}${attrs}>${esc(v)}</textarea>`;
    else if (f.type === 'checkbox') return `<label class="fld-check ${f.cls || ''}"><input type="checkbox" name="${f.name}" value="1"${v ? ' checked' : ''}${attrs}><span>${esc(f.label)}</span>${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</label>`;
    else input = `<input id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}"${req}${attrs}${f.type === 'number' && !f.step ? ' step="any"' : ''}>`;
    return `<div class="fld ${f.cls || ''}"><label for="${id}">${esc(f.label)}${f.req ? ' <b aria-hidden="true">*</b>' : ''}</label>${input}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</div>`;
  };
  A.formData = function (form) {
    const o = {};
    form.querySelectorAll('input[name], select[name], textarea[name]').forEach(el => {
      if (el.disabled) return;
      if (el.type === 'checkbox') { if (el.name.endsWith('[]')) { const k = el.name.slice(0, -2); o[k] = o[k] || []; if (el.checked) o[k].push(el.value); } else o[el.name] = el.checked; }
      else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
      else if (el.type === 'number') o[el.name] = el.value === '' ? '' : Number(el.value);
      else if (el.type !== 'file') o[el.name] = el.value.trim();
    });
    return o;
  };
  A.validate = function (form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach(el => { const bad = !String(el.value || '').trim(); el.classList.toggle('invalid', bad); el.setAttribute('aria-invalid', bad); if (bad && ok) { el.focus(); ok = false; } });
    form.querySelectorAll('input[type=email]').forEach(el => { if (el.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value)) { el.classList.add('invalid'); if (ok) el.focus(); ok = false; } });
    if (!ok) A.toast(t('required'), 'err');
    return ok;
  };
  A.opts = (list, labelFn, empty) => (empty ? [['', empty]] : []).concat(list.map(x => Array.isArray(x) ? x : [x, labelFn ? labelFn(x) : x]));

  /* ---------------- tables ---------------- */
  /* cols: [{k, label, v(row) → raw value, h(row) → html, cls, num, money, sortable}] */
  const tableState = {};
  A.table = function (o) {
    const id = o.id || 'tbl';
    const st = tableState[id] = tableState[id] || { sort: o.sort || null, dir: o.dir || -1, page: 0 };
    let rows = o.rows.slice();
    if (st.sort) { const c = o.cols.find(x => x.k === st.sort); if (c) { const val = c.v || (r => r[c.k]); rows.sort((a, b) => { const x = val(a), y = val(b); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''))) * st.dir; }); } }
    const per = o.per || 50, pages = Math.max(1, Math.ceil(rows.length / per));
    if (st.page >= pages) st.page = 0;
    const slice = o.all ? rows : rows.slice(st.page * per, st.page * per + per);
    A._tables = A._tables || {}; A._tables[id] = { o, rows };
    const cell = (c, r) => { if (c.h) return c.h(r); const v = c.v ? c.v(r) : r[c.k]; return c.money ? A.money(v, true) : c.m ? A.num(v) : esc(v == null ? '' : v); };
    const th = c => `<th scope="col" class="${c.num || c.money || c.m ? 'num' : ''} ${c.cls || ''}">${c.sortable === false ? esc(c.label) : `<button type="button" class="th-sort" data-sort="${c.k}" data-tbl="${id}" aria-sort="${st.sort === c.k ? (st.dir > 0 ? 'ascending' : 'descending') : 'none'}">${esc(c.label)}${st.sort === c.k ? `<span aria-hidden="true">${st.dir > 0 ? '▲' : '▼'}</span>` : ''}</button>`}</th>`;
    return `
    <div class="tbl-wrap" data-table="${id}">
      ${rows.length ? `<table class="tbl ${o.cls || ''}">
        <thead><tr>${o.check ? `<th class="chk"><input type="checkbox" data-check-all="${id}" aria-label="${esc(t('a.all'))}"></th>` : ''}${o.cols.map(th).join('')}${o.actions ? `<th class="act"><span class="sr">${esc(t('f.action'))}</span></th>` : ''}</tr></thead>
        <tbody>${slice.map(r => `<tr${o.rowAttr ? ' ' + o.rowAttr(r) : ''}>${o.check ? `<td class="chk"><input type="checkbox" name="sel[]" value="${esc(r.id)}" aria-label="${esc(t('a.select'))}"></td>` : ''}${o.cols.map(c => `<td class="${c.num || c.money || c.m ? 'num' : ''} ${c.cls || ''}" data-l="${esc(c.label)}">${cell(c, r)}</td>`).join('')}${o.actions ? `<td class="act">${o.actions(r)}</td>` : ''}</tr>`).join('')}</tbody>
        ${o.foot ? `<tfoot>${o.foot}</tfoot>` : ''}
      </table>` : `<div class="empty-a">${I('file', 'ai-xl')}<p>${esc(o.empty || t('noData'))}</p></div>`}
      ${pages > 1 && !o.all ? `<nav class="pager" aria-label="pages"><button type="button" class="btn-a ghost sm" data-page="${id}" data-p="${st.page - 1}" ${st.page ? '' : 'disabled'}>‹</button><span>${st.page + 1} / ${pages} · ${esc(t('rows', { n: rows.length }))}</span><button type="button" class="btn-a ghost sm" data-page="${id}" data-p="${st.page + 1}" ${st.page < pages - 1 ? '' : 'disabled'}>›</button></nav>` : (rows.length > 8 ? `<p class="tbl-count">${esc(t('rows', { n: rows.length }))}</p>` : '')}
    </div>`;
  };
  A.tableClick = function (e, rerender) {
    const s = e.target.closest('[data-sort]');
    if (s) { const st = tableState[s.dataset.tbl]; if (st.sort === s.dataset.sort) st.dir *= -1; else { st.sort = s.dataset.sort; st.dir = -1; } rerender(); return true; }
    const p = e.target.closest('[data-page]');
    if (p) { tableState[p.dataset.page].page = Number(p.dataset.p); rerender(); return true; }
    const ca = e.target.closest('[data-check-all]');
    if (ca) { ca.closest('table').querySelectorAll('tbody input[name="sel[]"]').forEach(x => { x.checked = ca.checked; }); return false; }
    return false;
  };
  A.exportBtns = (id, perms) => `<div class="exp-btns" role="group" aria-label="${esc(t('a.export'))}">
    <button type="button" class="btn-a ghost sm" data-export="csv" data-tbl="${id}">${I('download')} ${t('a.csv')}</button>
    <button type="button" class="btn-a ghost sm" data-export="xls" data-tbl="${id}">${I('download')} ${t('a.excel')}</button>
    <button type="button" class="btn-a ghost sm" data-export="pdf" data-tbl="${id}">${I('print')} ${t('a.pdf')}</button></div>`;

  /* ---------------- export: CSV / Excel (SpreadsheetML) / PDF via print ---------------- */
  const raw = (c, r) => { const v = c.x ? c.x(r) : c.v ? c.v(r) : r[c.k]; return v == null ? '' : v; };
  A.download = function (name, content, mime) {
    try {
      const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    } catch (e) { A.err(e); }
  };
  A.exportTable = function (id, fmt, title) {
    const T = A._tables && A._tables[id]; if (!T) return;
    const cols = T.o.cols.filter(c => c.export !== false), rows = T.rows;
    const name = `${(title || T.o.title || id).replace(/[^\w؀-ۿ-]+/g, '-')}-${A.day()}`;
    if (fmt === 'csv') {
      const q = v => { const s = String(v).replace(/"/g, '""'); return /[",\n]/.test(s) ? `"${s}"` : s; };
      const csv = '﻿' + [cols.map(c => q(c.label)).join(','), ...rows.map(r => cols.map(c => q(raw(c, r))).join(','))].join('\r\n');
      A.download(name + '.csv', csv, 'text/csv;charset=utf-8');
    } else if (fmt === 'xls') {
      const x = v => String(v).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
      const cellX = v => typeof v === 'number' ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>` : `<Cell><Data ss:Type="String">${x(v)}</Data></Cell>`;
      const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1"/><Interior ss:Color="#F1E9DC" ss:Pattern="Solid"/></Style></Styles>
<Worksheet ss:Name="${x((title || id).slice(0, 30))}"${A.isAr() ? ' ss:RightToLeft="1"' : ''}><Table><Row>${cols.map(c => `<Cell ss:StyleID="h"><Data ss:Type="String">${x(c.label)}</Data></Cell>`).join('')}</Row>
${rows.map(r => `<Row>${cols.map(c => cellX(raw(c, r))).join('')}</Row>`).join('\n')}</Table></Worksheet></Workbook>`;
      A.download(name + '.xls', xml, 'application/vnd.ms-excel');
    } else {
      const html = A.docs.report(title || T.o.title || id, `<table class="r-tbl"><thead><tr>${cols.map(c => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => { const v = raw(c, r); return `<td${typeof v === 'number' ? ' class="n"' : ''}>${esc(typeof v === 'number' && (c.money) ? A.money(v, true) : v)}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`);
      A.print(html, 'A4', { landscape: cols.length > 7 });
      return;
    }
    A.toast(t('exportN', { n: rows.length }));
  };

  /* ---------------- printing ---------------- */
  const PAPER = { '58mm': { w: '58mm', css: 'size: 58mm auto; margin: 2mm' }, '80mm': { w: '80mm', css: 'size: 80mm auto; margin: 3mm' }, A4: { w: '210mm', css: 'size: A4; margin: 12mm' },
    A5: { w: '148mm', css: 'size: A5; margin: 10mm' }, 'label-50x30': { w: '50mm', css: 'size: 50mm 30mm; margin: 0' }, custom: { w: '100mm', css: 'size: auto; margin: 5mm' } };
  A.paper = PAPER;
  A.printDoc = function (body, paper, o) {
    o = o || {};
    const p = PAPER[paper] || PAPER.A4;
    const dir = A.isAr() ? 'rtl' : 'ltr';
    return `<!doctype html><html lang="${A.isAr() ? 'ar' : 'en'}" dir="${dir}"><head><meta charset="utf-8"><title>${esc(o.title || 'Print')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600&family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
<style>@page{${p.css}${o.landscape ? ';size:A4 landscape' : ''}}*{box-sizing:border-box}body{margin:0;font:12px/1.45 Jost,'IBM Plex Sans Arabic',Arial,sans-serif;color:#1c1b1d;-webkit-print-color-adjust:exact;print-color-adjust:exact}
${A.docs.css}</style></head><body class="paper-${paper}">${body}</body></html>`;
  };
  /* Prints through a hidden iframe (works on desktop/tablet browsers and with receipt printers set as default). */
  A.print = function (bodyHtml, paper, o) {
    o = o || {};
    const html = A.printDoc(bodyHtml, paper, o);
    const m = A.modal({ title: esc(t('printDocs.preview')), size: paper === 'A4' || paper === 'A5' ? 'lg' : 'md',
      body: `<p class="muted small">${esc(t('printDocs.sentTo', { p: paper }))}</p><div class="print-prev paper-${paper}"><div class="pv-sheet" role="document" aria-label="${esc(t('printDocs.preview'))}"></div></div><p class="muted small">${esc(t('printDocs.viewerNote'))}</p>`,
      foot: `${o.extra || ''}<button type="button" class="btn-a ghost" data-am-close>${esc(t('a.close'))}</button><button type="button" class="btn-a primary" data-do-print>${I('print')} ${esc(t('a.print'))}</button>` });
    /* Preview in a shadow root (styles isolated, works where iframes are restricted) */
    const sheet = m.querySelector('.pv-sheet');
    const shadow = sheet.attachShadow ? sheet.attachShadow({ mode: 'open' }) : sheet;
    const p = PAPER[paper] || PAPER.A4;
    shadow.innerHTML = `<style>:host{display:block}.doc{font:12px/1.45 Jost,'IBM Plex Sans Arabic',Arial,sans-serif;color:#1c1b1d;background:#fff;padding:${/mm$/.test(paper) ? '3mm' : '10mm'};box-sizing:border-box}*{box-sizing:border-box}${A.docs.css}</style><div class="doc paper-${paper}" dir="${A.isAr() ? 'rtl' : 'ltr'}">${bodyHtml}</div>`;
    sheet.style.width = p.w; sheet.style.maxWidth = '100%';
    A.qrFill(shadow);
    m.querySelector('[data-do-print]').addEventListener('click', () => {
      try {
        let fr = document.getElementById('a-print-frame');
        if (fr) fr.remove();
        fr = document.createElement('iframe'); fr.id = 'a-print-frame'; fr.title = 'print';
        fr.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0;visibility:hidden';
        document.body.appendChild(fr);
        fr.srcdoc = html;
        fr.onload = () => { A.qrFill(fr.contentDocument); setTimeout(() => { try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { A.err(e); } }, 400); };
      } catch (e) { A.err(e); }
    });
    if (o.onMount) o.onMount(m);
    return m;
  };

  /* ---------------- Code 128-B barcode → SVG ---------------- */
  const C128 = ['212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212','112232','122132','122231','113222','123122','123221','223211','221132','221231','213212','223112','312131','311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321','112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121','313121','211331','231131','213113','213311','213131','311123','311321','331121','312113','312311','332111','314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114','122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212','124112','124211','411212','421112','421211','212141','214121','412121','111143','111341','131141','114113','114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'];
  A.barcode = function (text, o) {
    o = o || {};
    text = String(text || '').replace(/[^\x20-\x7e]/g, '');
    const codes = [104]; for (const ch of text) codes.push(ch.charCodeAt(0) - 32);
    let sum = 104; for (let i = 1; i < codes.length; i++) sum += codes[i] * i;
    codes.push(sum % 103, 106);
    let x = 10, bars = '';
    codes.forEach(c => { const pat = C128[c]; for (let i = 0; i < pat.length; i++) { const w = +pat[i]; if (i % 2 === 0) bars += `<rect x="${x}" y="0" width="${w}" height="${o.h || 50}"/>`; x += w; } });
    const W = x + 10;
    return `<svg class="bc" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${(o.h || 50) + (o.text === false ? 0 : 14)}" width="${o.w || W * 1.2}" preserveAspectRatio="none" role="img" aria-label="${esc(text)}"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${bars}</g>${o.text === false ? '' : `<text x="${W / 2}" y="${(o.h || 50) + 11}" font-size="10" text-anchor="middle" font-family="monospace">${esc(text)}</text>`}</svg>`;
  };
  /* QR codes: lazy-loads qrcode-generator (cdnjs). Elements: <span data-qr="text"></span> */
  let qrLib = null;
  A.loadQR = () => qrLib || (qrLib = new Promise((res) => {
    if (window.qrcode) return res(window.qrcode);
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    s.onload = () => res(window.qrcode); s.onerror = () => res(null); document.head.appendChild(s);
  }));
  A.qrFill = function (doc) {
    if (!doc) return; const els = doc.querySelectorAll('[data-qr]'); if (!els.length) return;
    A.loadQR().then(lib => els.forEach(el => {
      if (!lib) { el.textContent = ''; return; }
      try { const q = lib(0, 'M'); q.addData(el.getAttribute('data-qr')); q.make(); el.innerHTML = q.createSvgTag({ cellSize: 2, margin: 0, scalable: true }); } catch (e) { el.textContent = ''; }
    }));
  };

  /* ---------------- charts (SVG, no library) ---------------- */
  A.chart = {
    line(data, o) {
      o = o || {};
      if (!data.length) return `<div class="empty-a sm">${esc(t('noData'))}</div>`;
      const W = 640, H = o.h || 220, pl = 52, pr = 14, pt = 14, pb = 28;
      const max = Math.max(1, ...data.map(d => d.sales)); const nice = Math.pow(10, Math.floor(Math.log10(max))); const top = Math.ceil(max / nice) * nice;
      const X = i => pl + (data.length === 1 ? (W - pl - pr) / 2 : i * (W - pl - pr) / (data.length - 1)), Y = v => pt + (H - pt - pb) * (1 - v / top);
      const pts = data.map((d, i) => `${X(i).toFixed(1)},${Y(d.sales).toFixed(1)}`).join(' ');
      const grid = [0, .25, .5, .75, 1].map(f => `<line x1="${pl}" x2="${W - pr}" y1="${Y(top * f)}" y2="${Y(top * f)}" class="g"/><text x="${pl - 6}" y="${Y(top * f) + 4}" text-anchor="end" class="ax">${A.num(top * f, 0)}</text>`).join('');
      const step = Math.ceil(data.length / 7);
      const lbl = d => { const k = d.key; if (k.length === 4) return k; if (k.length === 7) return new Date(k + '-01T12:00:00').toLocaleDateString(loc(), { month: 'short' }); return new Date(k + 'T12:00:00').toLocaleDateString(loc(), { day: 'numeric', month: 'short' }); };
      const xl = data.map((d, i) => i % step === 0 || i === data.length - 1 ? `<text x="${X(i)}" y="${H - 8}" text-anchor="middle" class="ax">${esc(lbl(d))}</text>` : '').join('');
      const dots = data.map((d, i) => `<circle cx="${X(i)}" cy="${Y(d.sales)}" r="${data.length > 40 ? 0 : 3}" class="pt"><title>${esc(lbl(d))}: ${A.money(d.sales)} · ${d.orders}</title></circle>`).join('');
      return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || t('dash.trend'))}" ${A.isAr() ? 'style="direction:ltr"' : ''}>${grid}<polygon points="${pl},${Y(0)} ${pts} ${X(data.length - 1)},${Y(0)}" class="area"/><polyline points="${pts}" class="ln"/>${dots}${xl}</svg>`;
    },
    bars(items, o) {
      o = o || {};
      if (!items.length) return `<div class="empty-a sm">${esc(t('noData'))}</div>`;
      const max = Math.max(...items.map(i => i.value), 0.001);
      return `<ul class="hbars">${items.map(i => `<li><span class="hb-l" title="${esc(i.label)}">${i.swatch ? `<i class="sw" style="--c:${i.swatch}"></i>` : ''}${esc(i.label)}</span><span class="hb-bar"><span style="width:${Math.max(2, i.value / max * 100).toFixed(1)}%"></span></span><span class="hb-v">${o.money ? A.money(i.value, true) : A.num(i.value)}${i.sub ? `<small>${esc(i.sub)}</small>` : ''}</span></li>`).join('')}</ul>`;
    },
    donut(items, o) {
      o = o || {};
      const total = items.reduce((s, i) => s + Math.max(0, i.value), 0);
      if (!total) return `<div class="empty-a sm">${esc(t('noData'))}</div>`;
      const pal = ['#5C1A28', '#B8964F', '#3A3A3C', '#8E6B4A', '#9AA88E', '#22304D', '#C98E92', '#CDB894'];
      let a = -Math.PI / 2; const R = 54, r = 34, cx = 64, cy = 64;
      const seg = items.filter(i => i.value > 0).map((i, k) => {
        const f = i.value / total, b = a + f * Math.PI * 2, large = f > .5 ? 1 : 0;
        const p = (rad, ang) => `${(cx + rad * Math.cos(ang)).toFixed(2)},${(cy + rad * Math.sin(ang)).toFixed(2)}`;
        const d = f >= .9999 ? `M${p(R, 0)} A${R},${R} 0 1 1 ${p(R, Math.PI)} A${R},${R} 0 1 1 ${p(R, 0)} M${p(r, 0)} A${r},${r} 0 1 0 ${p(r, Math.PI)} A${r},${r} 0 1 0 ${p(r, 0)}` : `M${p(R, a)} A${R},${R} 0 ${large} 1 ${p(R, b)} L${p(r, b)} A${r},${r} 0 ${large} 0 ${p(r, a)} Z`;
        a = b; return `<path d="${d}" fill="${pal[k % pal.length]}" fill-rule="evenodd"><title>${esc(i.label)}: ${(f * 100).toFixed(1)}%</title></path>`;
      }).join('');
      return `<div class="donut"><svg viewBox="0 0 128 128" role="img" aria-label="${esc(o.label || '')}">${seg}<text x="64" y="60" text-anchor="middle" class="d-t">${esc(o.center || '')}</text><text x="64" y="76" text-anchor="middle" class="d-s">${esc(o.sub || '')}</text></svg>
        <ul class="legend">${items.filter(i => i.value > 0).map((i, k) => `<li><i style="background:${pal[k % pal.length]}"></i><span>${esc(i.label)}</span><b>${o.money ? A.money(i.value, true) : A.num(i.value)}</b><small>${(i.value / total * 100).toFixed(0)}%</small></li>`).join('')}</ul></div>`;
    }
  };

  /* ---------------- images: resize + convert to WEBP ---------------- */
  A.processImage = function (file, max) {
    max = max || 1600;
    return new Promise((res, rej) => {
      if (!/^image\/(jpeg|png|webp|svg\+xml|gif)$/.test(file.type)) return rej(new Error('Unsupported file type: ' + file.type));
      const fr = new FileReader();
      fr.onerror = () => rej(fr.error);
      fr.onload = () => {
        if (file.type === 'image/svg+xml') { if (/<script|on\w+=|javascript:/i.test(atob(fr.result.split(',')[1] || ''))) return rej(new Error('SVG contains scripts')); return res({ url: fr.result, mime: file.type, size: file.size, width: null, height: null }); }
        const img = new Image();
        img.onload = () => {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.round(img.width * s), h = Math.round(img.height * s);
          const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
          let url = c.toDataURL('image/webp', 0.82); let mime = 'image/webp';
          if (!/^data:image\/webp/.test(url)) { url = c.toDataURL('image/jpeg', 0.85); mime = 'image/jpeg'; }
          res({ url, mime, size: Math.round(url.length * 0.75), width: w, height: h });
        };
        img.onerror = () => rej(new Error('Cannot read image'));
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  };
  A.fileToDataUrl = file => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(fr.error); fr.readAsDataURL(file); });

  /* ---------------- printable documents ---------------- */
  A.docs = {
    css: `.rc{width:100%;font-size:11px}.rc h1{font-size:15px;margin:0;text-align:center;font-weight:600}.rc .c{text-align:center}.rc .muted{color:#555}.rc hr{border:0;border-top:1px dashed #999;margin:6px 0}
.rc table{width:100%;border-collapse:collapse}.rc td{padding:2px 0;vertical-align:top}.rc .n{text-align:end;white-space:nowrap}.rc .tot td{font-weight:600;font-size:13px;padding-top:4px}.rc .qr{display:flex;justify-content:center;margin:6px 0}.rc .qr svg{width:90px;height:90px}
.rc .bc{display:block;margin:4px auto;max-width:100%;height:42px}.ar{font-family:'IBM Plex Sans Arabic',sans-serif}.paper-58mm .rc{font-size:10px}
.inv{max-width:186mm;margin:0 auto}.inv header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #5C1A28;padding-bottom:10px;margin-bottom:14px;gap:16px}
.inv .brand b{display:block;font-size:20px;color:#5C1A28;letter-spacing:.06em}.inv .brand span{font-size:16px;color:#5C1A28}.inv h2{font-size:22px;margin:0;color:#5C1A28;font-weight:500;text-align:end}
.inv .meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}.inv .box{border:1px solid #e3dccf;border-radius:6px;padding:8px 10px}.inv .box h4{margin:0 0 4px;font-size:10px;text-transform:uppercase;color:#8a7a5c;letter-spacing:.08em}
.inv table.li{width:100%;border-collapse:collapse}.inv .li th{background:#F4EEE4;text-align:start;padding:6px;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em}.inv .li td{padding:6px;border-bottom:1px solid #eee}.inv .n{text-align:end;white-space:nowrap}
.inv .sum{margin-inline-start:auto;width:46%;margin-top:10px}.inv .sum td{padding:3px 6px}.inv .sum .g td{font-size:15px;font-weight:600;border-top:2px solid #5C1A28;color:#5C1A28}.inv footer{margin-top:22px;display:flex;justify-content:space-between;gap:16px;align-items:flex-end;font-size:10.5px;color:#555}
.inv .qr svg{width:84px;height:84px}.lbls{display:flex;flex-wrap:wrap;gap:0}.lbl{width:50mm;height:30mm;padding:1.6mm 2mm;overflow:hidden;page-break-inside:avoid;break-inside:avoid;display:flex;flex-direction:column;justify-content:space-between;border:1px dashed #ddd}
.paper-label-50x30 .lbl{border:0;page-break-after:always}.lbl b{font-size:8.5px;line-height:1.15;display:block;max-height:2.3em;overflow:hidden}.lbl .row{display:flex;justify-content:space-between;font-size:8px}.lbl .p{font-size:10px;font-weight:600}.lbl .bc{width:100%;height:11mm}
.rep h1{font-size:18px;margin:0 0 2px;color:#5C1A28;font-weight:500}.rep .sub{color:#666;margin:0 0 12px;font-size:11px}.r-tbl{width:100%;border-collapse:collapse;font-size:10px}.r-tbl th{background:#F4EEE4;text-align:start;padding:5px}.r-tbl td{padding:4px 5px;border-bottom:1px solid #eee}.r-tbl .n{text-align:end}
.kv{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.kv div{border:1px solid #e3dccf;border-radius:6px;padding:6px 8px}.kv small{display:block;color:#777;font-size:9.5px}.kv b{font-size:13px}`,
    biz() { return A.settings ? A.settings.business : { name_en: 'Rokn Om Alqura', name_ar: 'ركن أم القرى' }; },
    lineName(i) { return A.isAr() ? (i.name_ar || i.name_en) : i.name_en; },
    receipt(o, s, prn) {
      s = s || A.settings || {}; prn = prn || {};
      const b = s.business || {}, rc = s.receipt || {}, inv = s.invoice || {};
      const both = rc.lang === 'both';
      const title = o.status === 'quote' ? t('printDocs.quote') : o.status === 'refunded' || o.status === 'partially_refunded' ? `${t('printDocs.receipt')} · ${t('st.' + o.status)}` : t('printDocs.receipt');
      const pays = (o.payments || []);
      return `<div class="rc">
        ${prn.show_logo !== false && b.logo ? `<div class="c"><img src="${esc(b.logo)}" alt="" style="max-height:40px"></div>` : ''}
        <h1>${esc(b.name_en || '')}</h1><h1 class="ar">${esc(b.name_ar || '')}</h1>
        ${rc.header_en || prn.header ? `<p class="c muted">${esc(prn.header || (A.isAr() ? rc.header_ar : rc.header_en))}</p>` : ''}
        ${prn.show_address !== false ? `<p class="c muted">${esc(A.isAr() ? b.address_ar : b.address_en)}</p>` : ''}
        ${prn.show_phone !== false ? `<p class="c" dir="ltr">${esc(b.phone || '')}</p>` : ''}
        <hr><p class="c"><b>${esc(title)}</b> · <span dir="ltr">${esc(o.number)}</span><br>${esc(A.dt(o.created_at))}<br>${esc(t('printDocs.cashier'))}: ${esc(o.salesperson_name || '')}${o.customer_name ? `<br>${esc(t('f.customer'))}: ${esc(o.customer_name)}` : ''}</p><hr>
        <table>${(o.items || []).map(i => `<tr><td colspan="2">${esc(A.docs.lineName(i))} · ${esc(A.colorName(i.color))}${both && !A.isAr() ? `<br><span class="ar muted">${esc(i.name_ar || '')}</span>` : ''}</td></tr>
          <tr><td class="muted" dir="ltr">${A.num(i.meters)} m × ${A.money(i.price_per_meter, true)}${i.discount ? ` − ${A.money(i.discount, true)}` : ''}</td><td class="n">${A.money(i.total, true)}</td></tr>`).join('')}</table><hr>
        <table><tr><td>${esc(t('f.subtotal'))}</td><td class="n">${A.money(o.subtotal, true)}</td></tr>
          ${o.discount ? `<tr><td>${esc(t('f.discount'))}</td><td class="n">−${A.money(o.discount, true)}</td></tr>` : ''}
          ${o.tax ? `<tr><td>${esc(t('f.tax'))}</td><td class="n">${A.money(o.tax, true)}</td></tr>` : ''}
          ${o.shipping ? `<tr><td>${esc(t('f.shipping'))}</td><td class="n">${A.money(o.shipping, true)}</td></tr>` : ''}
          <tr class="tot"><td>${esc(t('f.total'))} (KWD)</td><td class="n">${A.money(o.total, true)}</td></tr>
          ${pays.map(p => `<tr><td>${esc(t('pm.' + p.method))}${p.tendered ? ` · ${esc(t('f.tendered'))} ${A.money(p.tendered, true)}` : ''}</td><td class="n">${A.money(p.amount, true)}</td></tr>${p.change ? `<tr><td>${esc(t('f.change'))}</td><td class="n">${A.money(p.change, true)}</td></tr>` : ''}`).join('')}
          ${(o.refunds || []).map(r => `<tr><td>${esc(t('a.refund'))} · ${esc(t('pm.' + r.method))}</td><td class="n">−${A.money(r.amount, true)}</td></tr>`).join('')}</table><hr>
        ${(prn.show_barcode !== false && rc.show_barcode !== false) ? A.barcode(o.number, { h: 34, w: '100%' }) : ''}
        ${(prn.show_qr !== false && rc.show_qr !== false) ? `<div class="qr" data-qr="${esc(`${b.name_en || ''} | ${o.number} | KWD ${Number(o.total).toFixed(3)} | ${A.day(o.created_at)}`)}"></div>` : ''}
        <p class="c">${esc(prn.footer || (A.isAr() ? rc.footer_ar : rc.footer_en) || t('printDocs.thanks'))}</p>
        ${inv.terms_en ? `<p class="c muted" style="font-size:9px">${esc(A.isAr() ? inv.terms_ar : inv.terms_en)}</p>` : ''}
      </div>`;
    },
    invoice(o, s, prn) {
      s = s || A.settings || {}; prn = prn || {};
      const b = s.business || {}, inv = s.invoice || {};
      const isQ = o.status === 'quote';
      return `<div class="inv">
        <header><div class="brand">${b.logo ? `<img src="${esc(b.logo)}" alt="" style="max-height:46px;display:block;margin-bottom:4px">` : ''}<b>${esc((b.name_en || '').toUpperCase())}</b><span class="ar">${esc(b.name_ar || '')}</span>
          <div class="muted" style="margin-top:4px">${esc(A.isAr() ? b.address_ar : b.address_en)}<br><span dir="ltr">${esc(b.phone || '')}</span>${b.email ? ' · ' + esc(b.email) : ''}${b.cr_number ? `<br>CR ${esc(b.cr_number)}` : ''}</div></div>
          <div><h2>${esc(isQ ? t('printDocs.quote') : t('printDocs.taxInvoice'))}</h2><p style="text-align:end;margin:4px 0 0"><b dir="ltr">${esc(o.number)}</b><br>${esc(A.date(o.created_at))}</p></div></header>
        <div class="meta"><div class="box"><h4>${esc(t('printDocs.billTo'))}</h4><b>${esc(o.customer_name || '—')}</b><br><span dir="ltr">${esc(o.customer_phone || '')}</span>${o.customer_email ? '<br>' + esc(o.customer_email) : ''}${o.address ? `<br>${esc(Object.values(o.address).filter(Boolean).join(', '))}` : ''}</div>
          <div class="box"><h4>${esc(t('f.payStatus'))}</h4>${esc(t('st.' + (o.payment_status || 'unpaid')))}${o.payment_method ? ` · ${esc(t('pm.' + o.payment_method))}` : ''}<br>${esc(t('f.channel'))}: ${esc(t('ch.' + o.channel))}<br>${esc(t('f.salesperson'))}: ${esc(o.salesperson_name || '')}</div></div>
        <table class="li"><thead><tr><th>#</th><th>${esc(t('f.product'))}</th><th>${esc(t('f.sku'))}</th><th class="n">${esc(t('f.meters'))}</th><th class="n">${esc(t('f.pricePerM'))}</th><th class="n">${esc(t('f.discount'))}</th><th class="n">${esc(t('f.total'))}</th></tr></thead>
          <tbody>${(o.items || []).map((i, k) => `<tr><td>${k + 1}</td><td>${esc(A.docs.lineName(i))}<br><small class="muted">${esc(A.colorName(i.color))}</small></td><td dir="ltr">${esc(i.sku)}</td><td class="n">${A.num(i.meters)}</td><td class="n">${A.money(i.price_per_meter, true)}</td><td class="n">${i.discount ? A.money(i.discount, true) : '—'}</td><td class="n">${A.money(i.total, true)}</td></tr>`).join('')}</tbody></table>
        <table class="sum"><tr><td>${esc(t('f.subtotal'))}</td><td class="n">${A.money(o.subtotal)}</td></tr>${o.discount ? `<tr><td>${esc(t('f.discount'))}</td><td class="n">−${A.money(o.discount)}</td></tr>` : ''}${o.tax ? `<tr><td>${esc(t('f.tax'))}</td><td class="n">${A.money(o.tax)}</td></tr>` : ''}${o.shipping ? `<tr><td>${esc(t('f.shipping'))}</td><td class="n">${A.money(o.shipping)}</td></tr>` : ''}
          <tr class="g"><td>${esc(t('f.total'))}</td><td class="n">${A.money(o.total)}</td></tr>${o.refunded ? `<tr><td>${esc(t('st.refunded'))}</td><td class="n">−${A.money(o.refunded)}</td></tr>` : ''}</table>
        <footer><div>${esc(A.isAr() ? inv.notes_ar : inv.notes_en)}<br>${esc(A.isAr() ? inv.terms_ar : inv.terms_en)}</div><div class="qr" data-qr="${esc(`${b.name_en || ''} | ${o.number} | KWD ${Number(o.total).toFixed(3)} | ${A.day(o.created_at)}`)}"></div></footer>
      </div>`;
    },
    labels(items) {
      return `<div class="lbls">${items.map(it => `<div class="lbl"><b>${esc(it.name)}</b><div class="row"><span>${esc(it.color)}</span><span dir="ltr">${esc(it.sku)}</span></div>${A.barcode(it.code, { h: 30, text: true, w: '100%' })}<div class="row"><span class="p" dir="ltr">${esc(it.price)}</span><span>${esc(it.extra || '')}</span></div></div>`).join('')}</div>`;
    },
    report(title, inner, kv) {
      const b = A.docs.biz();
      return `<div class="rep"><h1>${esc(title)}</h1><p class="sub">${esc(b.name_en || '')} · ${esc(b.name_ar || '')} · ${esc(t('printDocs.generated'))} ${esc(A.dt(new Date().toISOString()))}</p>
        ${kv ? `<div class="kv">${kv.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>` : ''}${inner}</div>`;
    }
  };

  /* WhatsApp / email share for invoices */
  A.shareText = o => `${A.docs.biz().name_en || ''}\n${t('printDocs.invoice')} ${o.number}\n${A.date(o.created_at)}\n${(o.items || []).map(i => `• ${i.name_en} (${i.color}) ${A.num(i.meters)} m × ${A.money(i.price_per_meter, true)} = ${A.money(i.total, true)}`).join('\n')}\n${t('f.total')}: ${A.money(o.total)}`;
  A.waLink = (phone, text) => `https://wa.me/${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
})();
