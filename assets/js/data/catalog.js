/* ==========================================================================
   CATALOGUE — lookups (colours, categories, collections) + adapter that turns
   database-shaped product records (data/products.js) into the UI model.
   ========================================================================== */
window.ROKN = window.ROKN || {};
ROKN.catalog = {};

/* ---- Colour library: swatch hex, names, and the "Shop by Colour" family ---- */
ROKN.catalog.colors = {
  ivory:     { hex: '#E9E1D0', en: 'Ivory',      ar: 'عاجي',        family: 'ivory' },
  cream:     { hex: '#EFE6D6', en: 'Cream',      ar: 'كريمي',       family: 'ivory' },
  natural:   { hex: '#E3D6BE', en: 'Natural',    ar: 'طبيعي',       family: 'ivory' },
  white:     { hex: '#F2F0EB', en: 'White',      ar: 'أبيض',        family: 'white' },
  beige:     { hex: '#CDB894', en: 'Beige',      ar: 'بيج',         family: 'beige' },
  champagne: { hex: '#D6BE97', en: 'Champagne',  ar: 'شامبين',      family: 'beige' },
  gold:      { hex: '#B8964F', en: 'Gold',       ar: 'ذهبي',        family: 'gold' },
  blush:     { hex: '#DDB3A9', en: 'Blush',      ar: 'وردي فاتح',   family: 'pink' },
  rose:      { hex: '#C98E92', en: 'Dusty Rose', ar: 'وردي غامق',   family: 'pink' },
  burgundy:  { hex: '#5C1A28', en: 'Burgundy',   ar: 'عنابي',       family: 'burgundy' },
  wine:      { hex: '#6E1F2E', en: 'Wine',       ar: 'نبيذي',       family: 'wine' },
  crimson:   { hex: '#8E2230', en: 'Crimson',    ar: 'قرمزي',       family: 'wine' },
  emerald:   { hex: '#1F4D3E', en: 'Emerald',    ar: 'زمردي',       family: 'emerald' },
  sage:      { hex: '#9AA88E', en: 'Sage',       ar: 'أخضر مريمي',  family: 'emerald' },
  skyblue:   { hex: '#A9C0D3', en: 'Sky Blue',   ar: 'أزرق سماوي',  family: 'navy' },
  navy:      { hex: '#22304D', en: 'Navy',       ar: 'كحلي',        family: 'navy' },
  indigo:    { hex: '#2A3256', en: 'Indigo',     ar: 'نيلي',        family: 'navy' },
  grey:      { hex: '#8C8A87', en: 'Grey',       ar: 'رمادي',       family: 'grey' },
  charcoal:  { hex: '#3A3A3C', en: 'Charcoal',   ar: 'فحمي',        family: 'grey' },
  camel:     { hex: '#A47A52', en: 'Camel',      ar: 'جملي',        family: 'brown' },
  mocha:     { hex: '#5E4636', en: 'Mocha',      ar: 'موكا',        family: 'brown' },
  chocolate: { hex: '#4A3328', en: 'Chocolate',  ar: 'بني شوكولاتة', family: 'brown' },
  lilac:     { hex: '#B7A9D6', en: 'Lilac',      ar: 'ليلكي',       family: 'pink' },
  black:     { hex: '#1E1D1F', en: 'Black',      ar: 'أسود',        family: 'black' }
};

/* Shop-by-Colour families (texture chip images in assets/img/swatches/) */
ROKN.catalog.colorFamilies = [
  { id: 'ivory', en: 'Ivory', ar: 'عاجي' }, { id: 'white', en: 'White', ar: 'أبيض' },
  { id: 'beige', en: 'Beige', ar: 'بيج' }, { id: 'black', en: 'Black', ar: 'أسود' },
  { id: 'burgundy', en: 'Burgundy', ar: 'عنابي' }, { id: 'wine', en: 'Wine', ar: 'نبيذي' },
  { id: 'navy', en: 'Navy', ar: 'كحلي' }, { id: 'emerald', en: 'Emerald', ar: 'زمردي' },
  { id: 'grey', en: 'Grey', ar: 'رمادي' }, { id: 'brown', en: 'Brown', ar: 'بني' },
  { id: 'pink', en: 'Pink', ar: 'وردي' }, { id: 'gold', en: 'Gold', ar: 'ذهبي' }
];

/* ---- Categories (fabric types) ---- */
ROKN.catalog.categories = [
  { id: 'linen', en: 'Linen', ar: 'كتان', cover: ['italian-linen', 'beige'], home: true,
    desc: { en: 'Lightweight, breathable and naturally elegant.', ar: 'خفيف ومنعش وأنيق بطبيعته.' } },
  { id: 'cotton', en: 'Cotton', ar: 'قطن', cover: ['egyptian-cotton', 'skyblue'], home: true,
    desc: { en: 'Soft, cool and easy to wear every day.', ar: 'ناعم ومنعش ومريح للارتداء اليومي.' } },
  { id: 'silk', en: 'Silk', ar: 'حرير', cover: ['mulberry-silk', 'champagne'], home: true,
    desc: { en: 'Liquid drape with a natural, luminous sheen.', ar: 'انسدال كالماء ولمعة طبيعية مضيئة.' } },
  { id: 'satin', en: 'Satin', ar: 'ساتان', cover: ['duchess-satin', 'emerald'], home: true,
    desc: { en: 'Deep lustre and structure for occasion wear.', ar: 'لمعان عميق وقوام متماسك للمناسبات.' } },
  { id: 'velvet', en: 'Velvet', ar: 'مخمل', cover: ['silk-velvet', 'burgundy'], home: true,
    desc: { en: 'Rich colour and a soft pile that catches the light.', ar: 'لون غني ووبر ناعم يعكس الضوء.' } },
  { id: 'chiffon', en: 'Chiffon & Sheers', ar: 'شيفون وأقمشة شفافة', cover: ['georgette-chiffon', 'blush'],
    desc: { en: 'Airy georgette and organza for graceful layers.', ar: 'جورجيت وأورجانزا خفيفة لطبقات أنيقة.' } },
  { id: 'embroidered', en: 'Embroidery', ar: 'أقمشة مطرّزة', cover: ['embroidered-crepe', 'black'], home: true,
    desc: { en: 'Fine embroidery and lace with raised detail.', ar: 'تطريز ودانتيل دقيق بتفاصيل بارزة.' } },
  { id: 'dishdasha', en: 'Dishdasha Fabrics', ar: 'أقمشة الدشاديش', cover: ['japan-green-forest', 'white'], image: 'assets/img/store/dishdasha-whites-fan-sm.webp', home: true,
    desc: { en: 'Japanese and premium dishdasha fabrics in whites and creams.', ar: 'أقمشة دشاديش يابانية وفاخرة بدرجات الأبيض والكريمي.' } },
  { id: 'suiting', en: 'Suiting', ar: 'أقمشة البدلات', cover: ['pinstripe-suiting', 'grey'], image: 'assets/img/store/suiting-colour-card-sm.webp', home: true,
    desc: { en: 'Fine wools for tailoring, coats and bishts.', ar: 'أصواف فاخرة للتفصيل والمعاطف والبشوت.' } },
  { id: 'abaya', en: 'Abaya Fabrics', ar: 'أقمشة العبايات', cover: ['nida-abaya', 'black'], home: true,
    desc: { en: 'Opaque nida and crepe that drape cleanly.', ar: 'ندى وكريب ساتر بانسدال مرتب.' } },
  { id: 'traditional', en: 'Traditional Fabrics', ar: 'أقمشة تراثية', cover: ['sadu-weave', 'crimson'], home: true,
    desc: { en: 'Dishdasha fabrics and Sadu-inspired weaves.', ar: 'أقمشة الدشاديش ونسيج مستوحى من السدو.' } },
  { id: 'printed', en: 'Printed Fabrics', ar: 'أقمشة مطبوعة', cover: ['floral-viscose', 'cream'],
    desc: { en: 'Light florals and prints for summer.', ar: 'نقشات وورود خفيفة للصيف.' } },
  { id: 'luxury', en: 'Luxury Fabrics', ar: 'أقمشة فاخرة', cover: ['jacquard-brocade', 'burgundy'],
    desc: { en: 'Jacquards and brocades with metallic yarns.', ar: 'جاكار وبروكار بخيوط معدنية.' } }
];

/* ---- Collections (landing pages) ---- */
ROKN.catalog.collections = [
  { id: 'dishdasha', image: 'assets/img/store/dishdasha-whites-fan.webp', feature: 'assets/img/store/japan-yearn-9x9.webp',
    editorial: ['assets/img/store/japan-green-forest.webp', 'assets/img/store/dishdasha-herringbone.webp', 'assets/img/store/japan-liquid-repellent.webp'],
    en: 'Japanese Dishdasha Fabrics', ar: 'أقمشة الدشاديش اليابانية',
    desc: { en: 'Fine Japanese dishdasha cloth in whites and creams — straight from our shelves in Kuwait City.', ar: 'أقمشة دشاديش يابانية فاخرة بدرجات الأبيض والكريمي؛ من رفوف متجرنا في مدينة الكويت.' } },
  { id: 'tailoring', image: 'assets/img/store/suiting-colour-card.webp',
    editorial: ['assets/img/store/suiting-grey-pinstripe.webp', 'assets/img/store/wool-220s-blue.webp', 'assets/img/store/shirting-lilac-navy.webp'],
    en: 'Suiting & Tailoring', ar: 'أقمشة البدلات والتفصيل',
    desc: { en: 'Suiting wools, pinstripes and shirting chosen for tailors — see the full shade cards in store.', ar: 'أصواف بدلات ومقلّمات وأقمشة قمصان مختارة للخياطين؛ شاهد بطاقات الألوان كاملة في المتجر.' } },
  { id: 'luxury', image: 'assets/img/collections/luxury.webp', feature: 'assets/img/scenes/luxury-feature.webp',
    editorial: ['assets/img/scenes/tailoring-2.webp', 'assets/img/products/jacquard-brocade/burgundy-closeup.webp', 'assets/img/products/silk-velvet/emerald-roll.webp'],
    en: 'Luxury Collection', ar: 'المجموعة الفاخرة',
    desc: { en: 'Jacquards, velvets, cashmere and heavyweight silks for occasions that deserve the finest cloth.', ar: 'جاكار ومخمل وكشمير وحرير ثقيل للمناسبات التي تستحق أرقى الأقمشة.' } },
  { id: 'linen', image: 'assets/img/collections/linen.webp',
    editorial: ['assets/img/products/italian-linen/beige-closeup.webp', 'assets/img/products/linen-cotton/natural-roll.webp', 'assets/img/scenes/pair-navy-sand.webp'],
    en: 'Linen Collection', ar: 'مجموعة الكتان',
    desc: { en: 'Crisp, natural linen with a gentle slub — cool in summer, refined all year.', ar: 'كتان طبيعي بملمس مميز، منعش في الصيف وأنيق طوال العام.' } },
  { id: 'silk', image: 'assets/img/collections/silk.webp',
    editorial: ['assets/img/scenes/pair-ivory-champagne.webp', 'assets/img/products/mulberry-silk/champagne-closeup.webp', 'assets/img/products/mulberry-silk/burgundy-roll.webp'],
    en: 'Silk Collection', ar: 'مجموعة الحرير',
    desc: { en: 'Fluid charmeuse, organza and lustrous satins with a soft, liquid drape.', ar: 'حرير شارموز وأورجانزا وساتان لامع بانسدال ناعم كالماء.' } },
  { id: 'abaya', image: 'assets/img/collections/abaya.webp',
    editorial: ['assets/img/products/nida-abaya/black-closeup.webp', 'assets/img/products/embroidered-crepe/styled.webp', 'assets/img/products/nida-abaya/black-roll.webp'],
    en: 'Abaya Collection', ar: 'مجموعة العبايات',
    desc: { en: 'Nida, crepe, chiffon and embroidered fabrics chosen for graceful, opaque abayas.', ar: 'ندى وكريب وشيفون وأقمشة مطرّزة مختارة لعبايات أنيقة وساترة.' } },
  { id: 'traditional', image: 'assets/img/collections/traditional.webp',
    editorial: ['assets/img/sadu.webp', 'assets/img/store/dishdasha-cream-twill.webp', 'assets/img/products/sadu-weave/natural-closeup.webp'],
    en: 'Traditional Collection', ar: 'المجموعة التراثية',
    desc: { en: 'Dishdasha fabrics and woven bands that echo the Sadu heritage of the Gulf.', ar: 'أقمشة الدشاديش وأشرطة منسوجة مستوحاة من تراث السدو في الخليج.' } },
  { id: 'everyday', image: 'assets/img/collections/everyday.webp',
    editorial: ['assets/img/products/egyptian-cotton/skyblue-roll.webp', 'assets/img/products/swiss-voile/white-closeup.webp', 'assets/img/products/floral-viscose/styled.webp'],
    en: 'Everyday Fabrics', ar: 'أقمشة كل يوم',
    desc: { en: 'Breathable cottons, voiles and soft weaves made for daily wear in the Kuwaiti climate.', ar: 'أقطان وفوال ونسيج ناعم للارتداء اليومي يناسب أجواء الكويت.' } },
  { id: 'embroidery', image: 'assets/img/collections/embroidery.webp',
    editorial: ['assets/img/products/guipure-lace/ivory-closeup.webp', 'assets/img/products/embroidered-crepe/burgundy-roll.webp', 'assets/img/products/guipure-lace/styled.webp'],
    en: 'Premium Embroidery', ar: 'تطريز فاخر',
    desc: { en: 'Gold-thread medallions, guipure lace and woven brocade — detail you can feel.', ar: 'زخارف بخيوط ذهبية ودانتيل جيبور وبروكار منسوج؛ تفاصيل تشعر بها.' } },
  { id: 'occasion', image: 'assets/img/collections/occasion.webp',
    editorial: ['assets/img/scenes/tailoring.webp', 'assets/img/products/silk-organza/blush-closeup.webp', 'assets/img/products/crepe-back-satin/wine-roll.webp'],
    en: 'Special Occasion', ar: 'للمناسبات الخاصة',
    desc: { en: 'Satins, organza and lace for weddings, engagements and Eid.', ar: 'ساتان وأورجانزا ودانتيل للأعراس والملكات والعيد.' } }
];

/* ---- Lookups used in filters & specs ---- */
ROKN.catalog.fabricTypes = {
  plain: { en: 'Plain weave', ar: 'نسيج سادة' }, satin: { en: 'Satin weave', ar: 'نسيج ساتان' },
  twill: { en: 'Twill', ar: 'نسيج تويل' }, pile: { en: 'Pile', ar: 'وبري' }, sheer: { en: 'Sheer', ar: 'شفاف' },
  crepe: { en: 'Crepe', ar: 'كريب' }, jacquard: { en: 'Jacquard', ar: 'جاكار' }
};
ROKN.catalog.materials = {
  linen: { en: 'Linen', ar: 'كتان' }, silk: { en: 'Silk', ar: 'حرير' }, cotton: { en: 'Cotton', ar: 'قطن' },
  wool: { en: 'Wool', ar: 'صوف' }, viscose: { en: 'Viscose', ar: 'فسكوز' }, polyester: { en: 'Polyester', ar: 'بوليستر' },
  blend: { en: 'Blend', ar: 'مزيج' }
};
ROKN.catalog.patterns = {
  solid: { en: 'Solid', ar: 'سادة' }, embroidered: { en: 'Embroidered', ar: 'مطرّز' }, printed: { en: 'Printed', ar: 'مطبوع' },
  jacquard: { en: 'Jacquard', ar: 'جاكار' }, woven: { en: 'Woven motif', ar: 'نقش منسوج' }, herringbone: { en: 'Herringbone', ar: 'عظم السمكة' }
};
ROKN.catalog.widths = {
  narrow: { en: 'Up to 120 cm', ar: 'حتى ١٢٠ سم', test: w => w <= 120 },
  medium: { en: '121 – 140 cm', ar: '١٢١ – ١٤٠ سم', test: w => w > 120 && w <= 140 },
  wide: { en: 'Over 140 cm', ar: 'أكثر من ١٤٠ سم', test: w => w > 140 }
};
ROKN.catalog.flags = {
  best: { en: 'Best Sellers', ar: 'الأكثر مبيعًا' }, new: { en: 'New Arrivals', ar: 'وصل حديثًا' }, sale: { en: 'On Sale', ar: 'عليها تخفيض' }
};
ROKN.catalog.origins = {
  IT: { en: 'Italy', ar: 'إيطاليا' }, CN: { en: 'China', ar: 'الصين' }, EG: { en: 'Egypt', ar: 'مصر' },
  KR: { en: 'South Korea', ar: 'كوريا الجنوبية' }, IN: { en: 'India', ar: 'الهند' }, TR: { en: 'Türkiye', ar: 'تركيا' },
  JP: { en: 'Japan', ar: 'اليابان' }, FR: { en: 'France', ar: 'فرنسا' }
};
ROKN.catalog.stretch = { none: { en: 'No stretch', ar: 'بدون مرونة' }, slight: { en: 'Slight stretch', ar: 'مرونة خفيفة' }, medium: { en: 'Medium stretch', ar: 'مرونة متوسطة' } };
ROKN.catalog.opacity = { opaque: { en: 'Opaque', ar: 'غير شفاف' }, semi: { en: 'Semi-opaque', ar: 'شبه شفاف' }, sheer: { en: 'Sheer', ar: 'شفاف' } };

/* ---- Adapter: database record → UI model ---- */
ROKN.catalog.fromRecord = function (r) {
  const bi = k => ({ en: r[k + '_en'] || '', ar: r[k + '_ar'] || r[k + '_en'] || '' });
  const badge = r.compare_at_price ? 'sale' : r.limited ? 'limited' : r.best_seller ? 'bestseller' : r.new_arrival ? 'new' : null;
  return {
    id: r.id, slug: r.slug || r.id, sku: r.sku, status: r.status || 'active',
    category: r.category, collections: r.collections || [],
    fabricType: r.fabric_type, material: r.material, pattern: r.pattern,
    name: bi('name'), description: bi('description'), composition: bi('composition'), texture: bi('texture'),
    use: bi('use'), care: bi('care'), seoTitle: r.seo_title_en ? bi('seo_title') : null, seoDesc: r.seo_description_en ? bi('seo_description') : null,
    origin: r.origin, widthCm: r.width_cm, weightGsm: r.weight_gsm, stretch: r.stretch, opacity: r.opacity,
    price: r.price_per_meter, compareAt: r.compare_at_price || null, currency: r.currency || 'KWD',
    rating: r.rating, reviewCount: r.review_count, sold: r.sold_count, added: r.created_at,
    featured: !!r.featured, bestSeller: !!r.best_seller, newArrival: !!r.new_arrival, limited: !!r.limited, badge,
    images: r.images || null,
    variants: (r.variants || []).map(v => ({ color: v.color, sku: v.sku, stock: v.stock_m, price: v.price_per_meter || null }))
  };
};
/* ---- Admin-published overrides (see biz/pub.js) ---- */
ROKN.catalog.base = { colors: Object.assign({}, ROKN.catalog.colors), categories: ROKN.catalog.categories.slice(), collections: ROKN.catalog.collections.slice(), fabricTypes: ROKN.catalog.fabricTypes };
if (ROKN.pub && ROKN.pub.products && ROKN.pub.products.length) {
  const P = ROKN.pub;
  (P.colors || []).forEach(c => { ROKN.catalog.colors[c.id] = { hex: c.hex, en: c.name_en, ar: c.name_ar || c.name_en, family: c.family }; });
  if (P.categories && P.categories.length) ROKN.catalog.categories = P.categories.map(c => ({ id: c.id, en: c.name_en, ar: c.name_ar || c.name_en, cover: c.cover, image: c.image || null, home: !!c.home, desc: { en: c.desc_en || '', ar: c.desc_ar || c.desc_en || '' } }));
  if (P.collections && P.collections.length) ROKN.catalog.collections = P.collections.map(c => ({ id: c.id, en: c.name_en, ar: c.name_ar || c.name_en, image: c.image, feature: c.feature || null, editorial: c.editorial || [], desc: { en: c.desc_en || '', ar: c.desc_ar || c.desc_en || '' } }));
}
ROKN.catalog.products = (ROKN.data && ROKN.data.products || []).filter(r => (r.status || 'active') === 'active').map(ROKN.catalog.fromRecord);

/* ---- Image helpers — one place to change if photography moves to a CDN ---- */
ROKN.img = {
  base: 'assets/img/products/',
  pick(p, key, color, fallback) { return (p.images && p.images[key] && (p.images[key][color] || p.images[key])) || fallback; },
  drape(p, color, small) { return this.pick(p, small ? 'drapeSm' : 'drape', color, `${this.base}${p.id}/${color}-drape${small ? '-sm' : ''}.webp`); },
  closeup(p, color) { return this.pick(p, 'closeup', color, `${this.base}${p.id}/${color}-closeup.webp`); },
  folded(p, color) { return this.pick(p, 'folded', color, `${this.base}${p.id}/${color}-folded.webp`); },
  roll(p, color) { return this.pick(p, 'roll', color, `${this.base}${p.id}/${color}-roll.webp`); },
  styled(p) { return this.pick(p, 'styled', null, `${this.base}${p.id}/styled.webp`); },
  variations(p) { return this.pick(p, 'variations', null, `${this.base}${p.id}/variations.webp`); },
  gallery(p, color) {
    if (p.images && p.images.gallery) return p.images.gallery.map(g => typeof g === 'string' ? { src: g, view: 'photo' } : g);
    return [
      { src: this.drape(p, color), view: 'drape' },
      { src: this.closeup(p, color), view: 'closeup' },
      { src: this.roll(p, color), view: 'roll' },
      { src: this.styled(p), view: 'styled' },
      { src: this.variations(p), view: 'variations' }
    ];
  }
};
