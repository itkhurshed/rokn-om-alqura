-- =====================================================================
-- Rokn Om Alqura — Store management database (PostgreSQL 14+)
-- GENERATED from assets/js/biz/schema.js by server/gen-schema.js — edit the
-- schema file, then regenerate. Money & metres: NUMERIC(14,3) (KWD has 3 decimals).
-- Passwords: users.password_hash = pbkdf2$sha256$<iterations>$<salt>$<hash>
-- (never plain text). Sessions store SHA-256 of the cookie token only.
-- =====================================================================
BEGIN;
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name_en TEXT,
  name_ar TEXT,
  address TEXT,
  phone TEXT,
  status TEXT
);
CREATE INDEX IF NOT EXISTS ix_branches_created_at ON branches(created_at);
CREATE INDEX IF NOT EXISTS ix_branches_status ON branches(status);
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  branch_id TEXT,
  name_en TEXT,
  name_ar TEXT,
  status TEXT
);
CREATE INDEX IF NOT EXISTS ix_warehouses_created_at ON warehouses(created_at);
CREATE INDEX IF NOT EXISTS ix_warehouses_branch_id ON warehouses(branch_id);
CREATE INDEX IF NOT EXISTS ix_warehouses_status ON warehouses(status);
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  key TEXT UNIQUE,
  name_en TEXT,
  name_ar TEXT,
  system BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_roles_created_at ON roles(created_at);
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  module TEXT,
  action TEXT
);
CREATE INDEX IF NOT EXISTS ix_permissions_module ON permissions(module);
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role_id TEXT,
  permission_id TEXT
);
CREATE INDEX IF NOT EXISTS ix_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS ix_role_permissions_permission_id ON role_permissions(permission_id);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name TEXT,
  username TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  password_hash TEXT,
  role_id TEXT,
  status TEXT,
  photo TEXT,
  lang TEXT,
  branch_id TEXT,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  failed_attempts INTEGER,
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS ix_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS ix_users_status ON users(status);
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  role_id TEXT
);
CREATE INDEX IF NOT EXISTS ix_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS ix_user_roles_role_id ON user_roles(role_id);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  user_id TEXT,
  expires_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  ip TEXT,
  device TEXT
);
CREATE INDEX IF NOT EXISTS ix_sessions_created_at ON sessions(created_at);
CREATE INDEX IF NOT EXISTS ix_sessions_user_id ON sessions(user_id);
CREATE TABLE IF NOT EXISTS colors (
  id TEXT PRIMARY KEY,
  name_en TEXT,
  name_ar TEXT,
  hex TEXT,
  family TEXT
);
CREATE TABLE IF NOT EXISTS fabric_types (
  id TEXT PRIMARY KEY,
  name_en TEXT,
  name_ar TEXT
);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name_en TEXT,
  name_ar TEXT,
  desc_en TEXT,
  desc_ar TEXT,
  image TEXT,
  cover JSONB,
  home BOOLEAN NOT NULL DEFAULT FALSE,
  sort INTEGER,
  status TEXT
);
CREATE INDEX IF NOT EXISTS ix_categories_created_at ON categories(created_at);
CREATE INDEX IF NOT EXISTS ix_categories_status ON categories(status);
CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name_en TEXT,
  name_ar TEXT,
  desc_en TEXT,
  desc_ar TEXT,
  image TEXT,
  feature TEXT,
  editorial JSONB,
  sort INTEGER,
  status TEXT
);
CREATE INDEX IF NOT EXISTS ix_collections_created_at ON collections(created_at);
CREATE INDEX IF NOT EXISTS ix_collections_status ON collections(status);
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  slug TEXT UNIQUE,
  status TEXT,
  sku TEXT,
  barcode TEXT,
  name_en TEXT,
  name_ar TEXT,
  description_en TEXT,
  description_ar TEXT,
  category TEXT,
  collections JSONB,
  fabric_type TEXT,
  material TEXT,
  pattern TEXT,
  composition_en TEXT,
  composition_ar TEXT,
  texture_en TEXT,
  texture_ar TEXT,
  use_en TEXT,
  use_ar TEXT,
  care_en TEXT,
  care_ar TEXT,
  origin TEXT,
  width_cm NUMERIC(14,3),
  weight_gsm NUMERIC(14,3),
  stretch TEXT,
  opacity TEXT,
  price_per_meter NUMERIC(14,3),
  compare_at_price NUMERIC(14,3),
  cost_per_meter NUMERIC(14,3),
  currency TEXT,
  rating NUMERIC(14,3),
  review_count INTEGER,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  best_seller BOOLEAN NOT NULL DEFAULT FALSE,
  new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
  limited BOOLEAN NOT NULL DEFAULT FALSE,
  images JSONB,
  seo_title_en TEXT,
  seo_title_ar TEXT,
  seo_description_en TEXT,
  seo_description_ar TEXT,
  real_photos BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS ix_products_status ON products(status);
CREATE INDEX IF NOT EXISTS ix_products_category ON products(category);
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  product_id TEXT,
  color TEXT,
  sku TEXT UNIQUE,
  barcode TEXT,
  price_per_meter NUMERIC(14,3),
  cost_per_meter NUMERIC(14,3),
  min_stock_m NUMERIC(14,3),
  location TEXT,
  status TEXT
);
CREATE INDEX IF NOT EXISTS ix_product_variants_created_at ON product_variants(created_at);
CREATE INDEX IF NOT EXISTS ix_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS ix_product_variants_color ON product_variants(color);
CREATE INDEX IF NOT EXISTS ix_product_variants_status ON product_variants(status);
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  product_id TEXT,
  color TEXT,
  media_id TEXT,
  url TEXT,
  view TEXT,
  sort INTEGER
);
CREATE INDEX IF NOT EXISTS ix_product_images_created_at ON product_images(created_at);
CREATE INDEX IF NOT EXISTS ix_product_images_product_id ON product_images(product_id);
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  variant_id TEXT,
  product_id TEXT,
  warehouse_id TEXT,
  available_m NUMERIC(14,3),
  reserved_m NUMERIC(14,3),
  sold_m NUMERIC(14,3),
  damaged_m NUMERIC(14,3),
  min_stock_m NUMERIC(14,3),
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_inventory_variant_id ON inventory(variant_id);
CREATE INDEX IF NOT EXISTS ix_inventory_product_id ON inventory(product_id);
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  variant_id TEXT,
  product_id TEXT,
  roll_id TEXT,
  type TEXT,
  qty_m NUMERIC(14,3),
  before_m NUMERIC(14,3),
  after_m NUMERIC(14,3),
  reason TEXT,
  ref_type TEXT,
  ref_id TEXT,
  user_id TEXT,
  user_name TEXT,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_inventory_transactions_created_at ON inventory_transactions(created_at);
CREATE INDEX IF NOT EXISTS ix_inventory_transactions_variant_id ON inventory_transactions(variant_id);
CREATE INDEX IF NOT EXISTS ix_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS ix_inventory_transactions_type ON inventory_transactions(type);
CREATE INDEX IF NOT EXISTS ix_inventory_transactions_user_id ON inventory_transactions(user_id);
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name TEXT,
  contact TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  country TEXT,
  notes TEXT,
  status TEXT,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_suppliers_created_at ON suppliers(created_at);
CREATE INDEX IF NOT EXISTS ix_suppliers_status ON suppliers(status);
CREATE TABLE IF NOT EXISTS fabric_rolls (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  barcode TEXT,
  product_id TEXT,
  variant_id TEXT,
  color TEXT,
  batch TEXT,
  supplier_id TEXT,
  original_m NUMERIC(14,3),
  remaining_m NUMERIC(14,3),
  cost_per_meter NUMERIC(14,3),
  purchase_date DATE,
  location TEXT,
  status TEXT,
  po_id TEXT,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_fabric_rolls_created_at ON fabric_rolls(created_at);
CREATE INDEX IF NOT EXISTS ix_fabric_rolls_product_id ON fabric_rolls(product_id);
CREATE INDEX IF NOT EXISTS ix_fabric_rolls_variant_id ON fabric_rolls(variant_id);
CREATE INDEX IF NOT EXISTS ix_fabric_rolls_status ON fabric_rolls(status);
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  number TEXT UNIQUE,
  supplier_id TEXT,
  date DATE,
  status TEXT,
  payment_status TEXT,
  subtotal NUMERIC(14,3),
  total NUMERIC(14,3),
  paid NUMERIC(14,3),
  notes TEXT,
  created_by TEXT,
  received_at TIMESTAMPTZ,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_purchase_orders_created_at ON purchase_orders(created_at);
CREATE INDEX IF NOT EXISTS ix_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS ix_purchase_orders_date ON purchase_orders(date);
CREATE INDEX IF NOT EXISTS ix_purchase_orders_status ON purchase_orders(status);
CREATE TABLE IF NOT EXISTS purchase_items (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  po_id TEXT,
  product_id TEXT,
  variant_id TEXT,
  meters NUMERIC(14,3),
  rolls INTEGER,
  cost_per_meter NUMERIC(14,3),
  total NUMERIC(14,3)
);
CREATE INDEX IF NOT EXISTS ix_purchase_items_created_at ON purchase_items(created_at);
CREATE INDEX IF NOT EXISTS ix_purchase_items_po_id ON purchase_items(po_id);
CREATE INDEX IF NOT EXISTS ix_purchase_items_variant_id ON purchase_items(variant_id);
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name TEXT,
  phone TEXT,
  email TEXT,
  addresses JSONB,
  notes TEXT,
  lang TEXT,
  source TEXT,
  tags JSONB,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_customers_created_at ON customers(created_at);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  number TEXT UNIQUE,
  channel TEXT,
  status TEXT,
  customer_id TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  salesperson_id TEXT,
  salesperson_name TEXT,
  branch_id TEXT,
  subtotal NUMERIC(14,3),
  discount NUMERIC(14,3),
  tax NUMERIC(14,3),
  shipping NUMERIC(14,3),
  total NUMERIC(14,3),
  cost_total NUMERIC(14,3),
  paid NUMERIC(14,3),
  refunded NUMERIC(14,3),
  payment_method TEXT,
  payment_status TEXT,
  ship_method TEXT,
  address JSONB,
  coupon TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(status);
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  order_id TEXT,
  product_id TEXT,
  variant_id TEXT,
  roll_id TEXT,
  name_en TEXT,
  name_ar TEXT,
  color TEXT,
  sku TEXT,
  meters NUMERIC(14,3),
  price_per_meter NUMERIC(14,3),
  cost_per_meter NUMERIC(14,3),
  discount NUMERIC(14,3),
  total NUMERIC(14,3),
  returned_m NUMERIC(14,3)
);
CREATE INDEX IF NOT EXISTS ix_order_items_created_at ON order_items(created_at);
CREATE INDEX IF NOT EXISTS ix_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS ix_order_items_variant_id ON order_items(variant_id);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  order_id TEXT,
  method TEXT,
  amount NUMERIC(14,3),
  tendered NUMERIC(14,3),
  change NUMERIC(14,3),
  reference TEXT,
  status TEXT,
  user_id TEXT,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS ix_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS ix_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS ix_payments_user_id ON payments(user_id);
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  order_id TEXT,
  items JSONB,
  reason TEXT,
  restock BOOLEAN NOT NULL DEFAULT FALSE,
  user_id TEXT,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_returns_created_at ON returns(created_at);
CREATE INDEX IF NOT EXISTS ix_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS ix_returns_user_id ON returns(user_id);
CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  order_id TEXT,
  return_id TEXT,
  amount NUMERIC(14,3),
  method TEXT,
  reason TEXT,
  user_id TEXT,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_refunds_created_at ON refunds(created_at);
CREATE INDEX IF NOT EXISTS ix_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS ix_refunds_user_id ON refunds(user_id);
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  number TEXT UNIQUE,
  date DATE,
  category TEXT,
  description TEXT,
  amount NUMERIC(14,3),
  payment_method TEXT,
  created_by TEXT,
  created_by_name TEXT,
  attachment TEXT,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_expenses_created_at ON expenses(created_at);
CREATE INDEX IF NOT EXISTS ix_expenses_date ON expenses(date);
CREATE TABLE IF NOT EXISTS daily_reports (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  date DATE,
  opening_cash NUMERIC(14,3),
  counted_cash NUMERIC(14,3),
  closing_cash NUMERIC(14,3),
  data JSONB,
  notes TEXT,
  closed_by TEXT,
  closed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_daily_reports_created_at ON daily_reports(created_at);
CREATE INDEX IF NOT EXISTS ix_daily_reports_date ON daily_reports(date);
CREATE TABLE IF NOT EXISTS printers (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name TEXT,
  type TEXT,
  paper TEXT,
  paper_w_mm NUMERIC(14,3),
  connection TEXT,
  address TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  copies INTEGER,
  header TEXT,
  footer TEXT,
  show_logo BOOLEAN NOT NULL DEFAULT FALSE,
  show_address BOOLEAN NOT NULL DEFAULT FALSE,
  show_phone BOOLEAN NOT NULL DEFAULT FALSE,
  show_qr BOOLEAN NOT NULL DEFAULT FALSE,
  show_barcode BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT
);
CREATE INDEX IF NOT EXISTS ix_printers_created_at ON printers(created_at);
CREATE INDEX IF NOT EXISTS ix_printers_type ON printers(type);
CREATE INDEX IF NOT EXISTS ix_printers_status ON printers(status);
CREATE TABLE IF NOT EXISTS printer_profiles (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  name TEXT,
  document TEXT,
  printer_id TEXT,
  paper TEXT,
  copies INTEGER,
  lang TEXT,
  auto_print BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_printer_profiles_created_at ON printer_profiles(created_at);
CREATE INDEX IF NOT EXISTS ix_printer_profiles_printer_id ON printer_profiles(printer_id);
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ,
  updated_by TEXT
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  type TEXT,
  level TEXT,
  title_en TEXT,
  title_ar TEXT,
  body_en TEXT,
  body_ar TEXT,
  link TEXT,
  read_by JSONB,
  demo BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS ix_notifications_type ON notifications(type);
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  user_id TEXT,
  user_name TEXT,
  action TEXT,
  module TEXT,
  record_id TEXT,
  summary TEXT,
  before JSONB,
  after JSONB,
  ip TEXT,
  device TEXT
);
CREATE INDEX IF NOT EXISTS ix_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS ix_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS ix_activity_logs_module ON activity_logs(module);
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  folder TEXT,
  name TEXT,
  url TEXT,
  mime TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_en TEXT,
  alt_ar TEXT,
  uses JSONB,
  uploaded_by TEXT,
  real BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS ix_media_created_at ON media(created_at);
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ,
  code TEXT UNIQUE,
  type TEXT,
  value NUMERIC(14,3),
  min NUMERIC(14,3),
  active BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at DATE,
  ends_at DATE,
  used INTEGER,
  max_uses INTEGER
);
CREATE INDEX IF NOT EXISTS ix_coupons_created_at ON coupons(created_at);
CREATE INDEX IF NOT EXISTS ix_coupons_type ON coupons(type);
CREATE TABLE IF NOT EXISTS meta (
  id TEXT PRIMARY KEY,
  value JSONB
);

-- Foreign keys
ALTER TABLE warehouses ADD CONSTRAINT fk_warehouses_branch_id FOREIGN KEY (branch_id) REFERENCES branches(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE users ADD CONSTRAINT fk_users_role_id FOREIGN KEY (role_id) REFERENCES roles(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE user_roles ADD CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category) REFERENCES categories(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE product_variants ADD CONSTRAINT fk_product_variants_product_id FOREIGN KEY (product_id) REFERENCES products(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE product_variants ADD CONSTRAINT fk_product_variants_color FOREIGN KEY (color) REFERENCES colors(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE product_images ADD CONSTRAINT fk_product_images_product_id FOREIGN KEY (product_id) REFERENCES products(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE inventory ADD CONSTRAINT fk_inventory_variant_id FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE inventory ADD CONSTRAINT fk_inventory_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE inventory_transactions ADD CONSTRAINT fk_inventory_transactions_variant_id FOREIGN KEY (variant_id) REFERENCES product_variants(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE inventory_transactions ADD CONSTRAINT fk_inventory_transactions_product_id FOREIGN KEY (product_id) REFERENCES products(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE fabric_rolls ADD CONSTRAINT fk_fabric_rolls_product_id FOREIGN KEY (product_id) REFERENCES products(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE fabric_rolls ADD CONSTRAINT fk_fabric_rolls_variant_id FOREIGN KEY (variant_id) REFERENCES product_variants(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE purchase_orders ADD CONSTRAINT fk_purchase_orders_supplier_id FOREIGN KEY (supplier_id) REFERENCES suppliers(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE purchase_items ADD CONSTRAINT fk_purchase_items_po_id FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE payments ADD CONSTRAINT fk_payments_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE returns ADD CONSTRAINT fk_returns_order_id FOREIGN KEY (order_id) REFERENCES orders(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_order_id FOREIGN KEY (order_id) REFERENCES orders(id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE printer_profiles ADD CONSTRAINT fk_printer_profiles_printer_id FOREIGN KEY (printer_id) REFERENCES printers(id) DEFERRABLE INITIALLY DEFERRED;

-- Reporting view: completed sales (POS + website)
CREATE OR REPLACE VIEW sales AS
  SELECT o.*, (o.total - COALESCE(o.refunded, 0)) AS net_total
  FROM orders o
  WHERE o.status IN ('completed','pending','processing','preparing','shipped','delivered','partially_refunded','refunded');

-- Integrity rules the services also enforce
ALTER TABLE inventory ADD CONSTRAINT ck_inventory_nonneg CHECK (reserved_m >= 0 AND damaged_m >= 0);
ALTER TABLE order_items ADD CONSTRAINT ck_items_meters CHECK (meters > 0 AND returned_m >= 0 AND returned_m <= meters);
ALTER TABLE fabric_rolls ADD CONSTRAINT ck_rolls_len CHECK (remaining_m >= 0 AND original_m > 0);
COMMIT;
