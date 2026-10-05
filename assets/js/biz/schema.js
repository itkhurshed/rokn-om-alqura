/* ==========================================================================
   BUSINESS SCHEMA — single source of truth shared by the browser admin and
   the Node API server (server/).  Tables → schema.sql is generated from here
   (node server/gen-schema.js), so the database and the app never drift.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.ROKN = root.ROKN || {}; root.ROKN.biz = root.ROKN.biz || {}; root.ROKN.biz.schema = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---- Column types: id (text PK) · text · int · num (12,3 money/metres) · bool · ts · date · json ---- */
  const T = (cols, opts) => Object.assign({ cols }, opts || {});
  const base = { id: 'id', created_at: 'ts' };
  const tables = {
    branches:           T({ ...base, name_en: 'text', name_ar: 'text', address: 'text', phone: 'text', status: 'text' }),
    warehouses:         T({ ...base, branch_id: 'text->branches', name_en: 'text', name_ar: 'text', status: 'text' }),
    roles:              T({ ...base, key: 'text!', name_en: 'text', name_ar: 'text', system: 'bool', updated_at: 'ts' }),
    permissions:        T({ id: 'id', module: 'text', action: 'text' }),
    role_permissions:   T({ id: 'id', role_id: 'text->roles', permission_id: 'text->permissions' }),
    users:              T({ ...base, name: 'text', username: 'text!', email: 'text', phone: 'text', password_hash: 'text', role_id: 'text->roles',
                            status: 'text', photo: 'text', lang: 'text', branch_id: 'text', must_change_password: 'bool', failed_attempts: 'int',
                            locked_until: 'ts', last_login_at: 'ts', updated_at: 'ts', demo: 'bool' }),
    user_roles:         T({ id: 'id', user_id: 'text->users', role_id: 'text->roles' }),
    sessions:           T({ ...base, user_id: 'text->users', expires_at: 'ts', last_seen_at: 'ts', ip: 'text', device: 'text' }),
    colors:             T({ id: 'id', name_en: 'text', name_ar: 'text', hex: 'text', family: 'text' }),
    fabric_types:       T({ id: 'id', name_en: 'text', name_ar: 'text' }),
    categories:         T({ ...base, name_en: 'text', name_ar: 'text', desc_en: 'text', desc_ar: 'text', image: 'text', cover: 'json', home: 'bool', sort: 'int', status: 'text' }),
    collections:        T({ ...base, name_en: 'text', name_ar: 'text', desc_en: 'text', desc_ar: 'text', image: 'text', feature: 'text', editorial: 'json', sort: 'int', status: 'text' }),
    products:           T({ ...base, slug: 'text!', status: 'text', sku: 'text', barcode: 'text', name_en: 'text', name_ar: 'text', description_en: 'text', description_ar: 'text',
                            category: 'text->categories', collections: 'json', fabric_type: 'text', material: 'text', pattern: 'text',
                            composition_en: 'text', composition_ar: 'text', texture_en: 'text', texture_ar: 'text', use_en: 'text', use_ar: 'text', care_en: 'text', care_ar: 'text',
                            origin: 'text', width_cm: 'num', weight_gsm: 'num', stretch: 'text', opacity: 'text', price_per_meter: 'num', compare_at_price: 'num',
                            cost_per_meter: 'num', currency: 'text', rating: 'num', review_count: 'int', featured: 'bool', best_seller: 'bool', new_arrival: 'bool', limited: 'bool',
                            images: 'json', seo_title_en: 'text', seo_title_ar: 'text', seo_description_en: 'text', seo_description_ar: 'text', real_photos: 'bool', updated_at: 'ts', demo: 'bool' }),
    product_variants:   T({ ...base, product_id: 'text->products', color: 'text->colors', sku: 'text!', barcode: 'text', price_per_meter: 'num', cost_per_meter: 'num', min_stock_m: 'num', location: 'text', status: 'text' }),
    product_images:     T({ ...base, product_id: 'text->products', color: 'text', media_id: 'text', url: 'text', view: 'text', sort: 'int' }),
    inventory:          T({ id: 'id', variant_id: 'text->product_variants', product_id: 'text->products', warehouse_id: 'text', available_m: 'num', reserved_m: 'num',
                            sold_m: 'num', damaged_m: 'num', min_stock_m: 'num', updated_at: 'ts' }),
    inventory_transactions: T({ ...base, variant_id: 'text->product_variants', product_id: 'text->products', roll_id: 'text', type: 'text', qty_m: 'num',
                            before_m: 'num', after_m: 'num', reason: 'text', ref_type: 'text', ref_id: 'text', user_id: 'text', user_name: 'text', demo: 'bool' }),
    suppliers:          T({ ...base, name: 'text', contact: 'text', phone: 'text', email: 'text', address: 'text', country: 'text', notes: 'text', status: 'text', demo: 'bool' }),
    fabric_rolls:       T({ ...base, barcode: 'text', product_id: 'text->products', variant_id: 'text->product_variants', color: 'text', batch: 'text', supplier_id: 'text',
                            original_m: 'num', remaining_m: 'num', cost_per_meter: 'num', purchase_date: 'date', location: 'text', status: 'text', po_id: 'text', demo: 'bool' }),
    purchase_orders:    T({ ...base, number: 'text!', supplier_id: 'text->suppliers', date: 'date', status: 'text', payment_status: 'text', subtotal: 'num', total: 'num',
                            paid: 'num', notes: 'text', created_by: 'text', received_at: 'ts', demo: 'bool' }),
    purchase_items:     T({ ...base, po_id: 'text->purchase_orders', product_id: 'text', variant_id: 'text', meters: 'num', rolls: 'int', cost_per_meter: 'num', total: 'num' }),
    customers:          T({ ...base, name: 'text', phone: 'text', email: 'text', addresses: 'json', notes: 'text', lang: 'text', source: 'text', tags: 'json', demo: 'bool' }),
    orders:             T({ ...base, number: 'text!', channel: 'text', status: 'text', customer_id: 'text', customer_name: 'text', customer_phone: 'text', customer_email: 'text',
                            salesperson_id: 'text', salesperson_name: 'text', branch_id: 'text', subtotal: 'num', discount: 'num', tax: 'num', shipping: 'num', total: 'num',
                            cost_total: 'num', paid: 'num', refunded: 'num', payment_method: 'text', payment_status: 'text', ship_method: 'text', address: 'json', coupon: 'text',
                            notes: 'text', updated_at: 'ts', completed_at: 'ts', demo: 'bool' }),
    order_items:        T({ ...base, order_id: 'text->orders', product_id: 'text', variant_id: 'text', roll_id: 'text', name_en: 'text', name_ar: 'text', color: 'text', sku: 'text',
                            meters: 'num', price_per_meter: 'num', cost_per_meter: 'num', discount: 'num', total: 'num', returned_m: 'num' }),
    payments:           T({ ...base, order_id: 'text->orders', method: 'text', amount: 'num', tendered: 'num', change: 'num', reference: 'text', status: 'text', user_id: 'text', demo: 'bool' }),
    returns:            T({ ...base, order_id: 'text->orders', items: 'json', reason: 'text', restock: 'bool', user_id: 'text', demo: 'bool' }),
    refunds:            T({ ...base, order_id: 'text->orders', return_id: 'text', amount: 'num', method: 'text', reason: 'text', user_id: 'text', demo: 'bool' }),
    expenses:           T({ ...base, number: 'text!', date: 'date', category: 'text', description: 'text', amount: 'num', payment_method: 'text', created_by: 'text',
                            created_by_name: 'text', attachment: 'text', demo: 'bool' }),
    daily_reports:      T({ ...base, date: 'date', opening_cash: 'num', counted_cash: 'num', closing_cash: 'num', data: 'json', notes: 'text', closed_by: 'text', closed_at: 'ts' }),
    printers:           T({ ...base, name: 'text', type: 'text', paper: 'text', paper_w_mm: 'num', connection: 'text', address: 'text', is_default: 'bool', copies: 'int',
                            header: 'text', footer: 'text', show_logo: 'bool', show_address: 'bool', show_phone: 'bool', show_qr: 'bool', show_barcode: 'bool', status: 'text' }),
    printer_profiles:   T({ ...base, name: 'text', document: 'text', printer_id: 'text->printers', paper: 'text', copies: 'int', lang: 'text', auto_print: 'bool' }),
    settings:           T({ id: 'id', value: 'json', updated_at: 'ts', updated_by: 'text' }),
    notifications:      T({ ...base, type: 'text', level: 'text', title_en: 'text', title_ar: 'text', body_en: 'text', body_ar: 'text', link: 'text', read_by: 'json', demo: 'bool' }),
    activity_logs:      T({ ...base, user_id: 'text', user_name: 'text', action: 'text', module: 'text', record_id: 'text', summary: 'text', before: 'json', after: 'json', ip: 'text', device: 'text' }),
    media:              T({ ...base, folder: 'text', name: 'text', url: 'text', mime: 'text', size: 'int', width: 'int', height: 'int', alt_en: 'text', alt_ar: 'text',
                            uses: 'json', uploaded_by: 'text', real: 'bool' }),
    coupons:            T({ ...base, code: 'text!', type: 'text', value: 'num', min: 'num', active: 'bool', starts_at: 'date', ends_at: 'date', used: 'int', max_uses: 'int' }),
    meta:               T({ id: 'id', value: 'json' })
  };

  /* ---- Permissions ---- */
  const modules = ['dashboard', 'sales', 'pos', 'orders', 'products', 'inventory', 'purchases', 'suppliers', 'customers', 'expenses',
    'reports', 'users', 'settings', 'printers', 'media', 'coupons', 'website', 'logs', 'notifications'];
  const actions = ['view', 'create', 'edit', 'delete', 'print', 'export'];
  const ALL = 'view create edit delete print export';
  /* Default role matrix (editable in Admin → Roles & Permissions) */
  const roles = [
    { id: 'super_admin', key: 'SUPER_ADMIN', name_en: 'Super Admin', name_ar: 'مدير النظام', system: true, perms: '*' },
    { id: 'admin', key: 'ADMIN', name_en: 'Admin', name_ar: 'مسؤول', system: true,
      perms: Object.fromEntries(modules.map(m => [m, ALL])) },
    { id: 'manager', key: 'MANAGER', name_en: 'Manager', name_ar: 'مدير المتجر', system: true,
      perms: { dashboard: 'view export', sales: ALL, pos: 'view create edit print', orders: ALL, products: 'view create edit print export', inventory: ALL,
        purchases: ALL, suppliers: 'view create edit export', customers: 'view create edit export print', expenses: 'view create edit export print',
        reports: 'view print export', printers: 'view', media: 'view create edit', coupons: 'view create edit', website: 'view edit', logs: 'view', notifications: 'view edit' } },
    { id: 'sales_staff', key: 'SALES_STAFF', name_en: 'Sales Staff', name_ar: 'موظف مبيعات', system: true,
      perms: { dashboard: 'view', sales: 'view create print', pos: 'view create print', orders: 'view edit print', products: 'view', inventory: 'view',
        customers: 'view create edit', notifications: 'view' } },
    { id: 'inventory_staff', key: 'INVENTORY_STAFF', name_en: 'Inventory Staff', name_ar: 'موظف مخزون', system: true,
      perms: { dashboard: 'view', products: 'view edit print', inventory: 'view create edit print export', purchases: 'view create edit', suppliers: 'view',
        reports: 'view', media: 'view create', notifications: 'view' } },
    { id: 'accountant', key: 'ACCOUNTANT', name_en: 'Accountant', name_ar: 'محاسب', system: true,
      perms: { dashboard: 'view export', sales: 'view print export', orders: 'view print export', purchases: 'view export', suppliers: 'view export',
        customers: 'view export', expenses: ALL, reports: 'view print export', notifications: 'view' } },
    { id: 'cashier', key: 'CASHIER', name_en: 'Cashier', name_ar: 'كاشير', system: true,
      perms: { pos: 'view create print', sales: 'view print', products: 'view', customers: 'view create', notifications: 'view' } },
    { id: 'viewer', key: 'VIEWER', name_en: 'Viewer', name_ar: 'مشاهد', system: true,
      perms: { dashboard: 'view', sales: 'view', orders: 'view', products: 'view', inventory: 'view', reports: 'view' } }
  ];

  const enums = {
    userStatus: ['active', 'inactive', 'suspended'],
    orderStatus: ['pending', 'processing', 'preparing', 'shipped', 'delivered', 'completed', 'held', 'quote', 'cancelled', 'refunded', 'partially_refunded'],
    fulfilment: ['pending', 'processing', 'preparing', 'shipped', 'delivered'],
    paymentStatus: ['paid', 'unpaid', 'partial', 'refunded'],
    invTypes: ['opening', 'purchase', 'sale', 'return', 'damage', 'adjustment', 'transfer', 'reservation', 'release'],
    rollStatus: ['available', 'partial', 'reserved', 'finished', 'damaged'],
    poStatus: ['draft', 'ordered', 'received', 'cancelled'],
    expenseCategories: ['rent', 'salary', 'electricity', 'internet', 'transportation', 'marketing', 'packaging', 'maintenance', 'supplies', 'other'],
    printerTypes: ['receipt', 'a4', 'a5', 'label', 'barcode', 'report'],
    paperSizes: ['58mm', '80mm', 'A4', 'A5', 'label-50x30', 'custom'],
    connections: ['browser', 'usb', 'network', 'bluetooth'],
    mediaFolders: ['products', 'categories', 'collections', 'banners', 'store', 'logo', 'marketing', 'social'],
    notifTypes: ['low_stock', 'out_of_stock', 'new_order', 'new_customer', 'payment', 'refund', 'new_user', 'inventory_adjustment', 'daily_report']
  };

  /* ---- Settings: every business value lives here (no hard-coding in the app) ---- */
  const settingsDefaults = {
    business: { name_en: 'Rokn Om Alqura', name_ar: 'ركن أم القرى', legal_name: 'Rokn Om Alqura', phone: '+965 9735 8288', phone_e164: '+96597358288',
      whatsapp: '96597358288', email: '', address_en: 'XFJ+65H, Mubarak Al Kabeer St, Kuwait City, Kuwait', address_ar: 'XFJ+65H، شارع مبارك الكبير، مدينة الكويت، الكويت',
      maps_url: 'https://www.google.com/maps/search/?api=1&query=XFJ%2B65H%2C%20Mubarak%20Al%20Kabeer%20St%2C%20Kuwait%20City', cr_number: '', logo: '' },
    store: { hours_en: '', hours_ar: '', branch_name_en: 'Kuwait City', branch_name_ar: 'مدينة الكويت' },
    currency: { code: 'KWD', symbol_en: 'KWD', symbol_ar: 'د.ك', decimals: 3 },
    tax: { enabled: false, name_en: 'VAT', name_ar: 'ضريبة القيمة المضافة', rate: 0, inclusive: false },
    shipping: { free_threshold: null, standard_fee: 2, express_fee: 3.5, pickup_fee: 0 },
    payments: { cash: true, knet: true, card: true, bank_transfer: true, other: true, cod: true, applepay: false, gateway_connected: false },
    pos: { walk_in_label_en: 'Walk-in customer', walk_in_label_ar: 'عميل مباشر', allow_negative_stock: false, require_customer: false, quick_meters: '0.5,1,1.5,2,2.5,3,5,10',
      max_line_discount_pct: 20, auto_print_receipt: false },
    invoice: { prefix: 'INV-', next_number: 1001, quote_prefix: 'QT-', po_prefix: 'PO-', expense_prefix: 'EXP-', notes_en: 'Thank you for shopping with us.', notes_ar: 'شكرًا لتسوقكم معنا.',
      terms_en: 'Cut fabric cannot be returned unless faulty.', terms_ar: 'لا يمكن إرجاع القماش المقصوص إلا في حال وجود عيب.' },
    receipt: { header_en: 'Rokn Om Alqura — Fabrics', header_ar: 'ركن أم القرى للأقمشة', footer_en: 'Thank you · شكرًا لكم', footer_ar: 'شكرًا لزيارتكم', show_qr: true, show_barcode: true, lang: 'both' },
    inventory: { unit: 'm', default_min_stock: 20, low_stock_alerts: true, roll_tracking: true, meter_step: 0.5, min_meters: 0.5, max_meters: 100 },
    notifications: { low_stock: true, out_of_stock: true, new_order: true, new_customer: true, payment: true, refund: true, new_user: true, inventory_adjustment: true, daily_report: true },
    email: { connected: false, from_name: 'Rokn Om Alqura', from_email: '', smtp_host: '' },
    whatsapp: { number: '96597358288', order_template_en: 'Hello {name}, your order {number} total {total} is confirmed. Thank you!', order_template_ar: 'مرحبًا {name}، تم تأكيد طلبك {number} بقيمة {total}. شكرًا لكم!' },
    languages: { default: 'en', admin_default: 'en', enabled: 'en,ar' },
    seo: { site_url: 'https://www.roknomalqura.com', title_en: 'Rokn Om Alqura | Premium Fabrics & Textiles in Kuwait', title_ar: 'ركن أم القرى | أقمشة ومنسوجات فاخرة في الكويت',
      description_en: 'Shop premium fabrics and textiles at Rokn Om Alqura in Kuwait City.', description_ar: 'تسوّق أقمشة ومنسوجات فاخرة من ركن أم القرى في مدينة الكويت.' },
    security: { session_hours: 8, max_failed_logins: 5, lockout_minutes: 15, min_password_length: 8, require_strong_password: true },
    backup: { last_export_at: null },
    website: { announcement_en: 'Premium Fabrics in Kuwait', announcement_ar: 'أقمشة فاخرة في الكويت', sample_notice: true,
      newsletter_connected: false, hero_images: '', instagram_url: '', facebook_url: '', tiktok_url: '' }
  };

  /* Which settings the public storefront may read (never security/email etc.) */
  const publicSettings = ['business', 'store', 'currency', 'tax', 'shipping', 'payments', 'languages', 'seo', 'website', 'inventory'];

  return { tables, modules, actions, roles, enums, settingsDefaults, publicSettings };
});
