/* ==========================================================================
   PRODUCTS — admin-ready, database-shaped records  (⚠ DEMO DATA)
   --------------------------------------------------------------------------
   One flat record per fabric, with colour variants. This mirrors a typical
   database table (products) + child table (product_variants), so it can be
   replaced 1:1 by an API/CMS response:  ROKN.data.products = await res.json()

   Field reference
   id / slug ............ URL-safe identifier (also used for image folders)
   status ............... 'active' | 'draft' | 'archived'  (only active is shown)
   sku .................. base SKU; each variant has its own SKU
   name_en / name_ar, description_en / description_ar, *_en / *_ar text fields
   category ............. id from ROKN.catalog.categories
   collections .......... ids from ROKN.catalog.collections
   fabric_type, material, pattern, origin, stretch, opacity → lookup keys
   width_cm, weight_gsm . numbers
   price_per_meter ...... KWD per metre (variant may override with its own price_per_meter)
   compare_at_price ..... previous price (shows SALE)
   rating, review_count . aggregate from the reviews table
   featured, best_seller, new_arrival, limited → merchandising flags
   variants[] ........... { color (key in ROKN.catalog.colors), sku, stock_m (metres), price_per_meter? }
   images ............... optional override; default convention:
                          assets/img/products/<id>/<color>-{drape,closeup,folded,roll}.webp,
                          <color>-drape-sm.webp, styled.webp, variations.webp
   seo_title_en/_ar, seo_description_en/_ar ... optional overrides (auto-generated otherwise)
   ========================================================================== */
window.ROKN = window.ROKN || {};
ROKN.data = ROKN.data || {};
ROKN.data.products = [
 {
  "id": "italian-linen",
  "slug": "italian-linen",
  "status": "active",
  "sku": "ROA-LIN-001",
  "name_en": "Premium Italian Linen",
  "name_ar": "كتان إيطالي فاخر",
  "description_en": "A mid-weight pure linen with a soft hand and a natural slub. It breathes beautifully, softens with every wash and holds a crisp, tailored line — ideal for summer dishdashas, shirts and relaxed suiting.",
  "description_ar": "كتان نقي متوسط الوزن بملمس ناعم وخيوط طبيعية مميزة. يسمح بمرور الهواء، ويزداد نعومة مع كل غسلة، ويحافظ على قصّة أنيقة ومرتبة؛ مثالي للدشاديش الصيفية والقمصان والبدلات الخفيفة.",
  "category": "linen",
  "collections": [
   "linen",
   "everyday"
  ],
  "fabric_type": "plain",
  "material": "linen",
  "pattern": "solid",
  "composition_en": "100% linen",
  "composition_ar": "١٠٠٪ كتان",
  "texture_en": "Natural slub, matte",
  "texture_ar": "ملمس طبيعي غير لامع",
  "use_en": "Dishdashas, shirts, summer suits, trousers",
  "use_ar": "دشاديش، قمصان، بدلات صيفية، بناطيل",
  "care_en": "Machine wash cold, gentle cycle. Iron while slightly damp.",
  "care_ar": "غسيل آلي بماء بارد على دورة لطيفة. يُكوى وهو رطب قليلًا.",
  "origin": "IT",
  "width_cm": 145,
  "weight_gsm": 185,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 12.5,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.8,
  "review_count": 36,
  "sold_count": 410,
  "created_at": "2026-06-02",
  "featured": true,
  "best_seller": true,
  "new_arrival": false,
  "limited": false,
  "variants": [
   {
    "color": "beige",
    "sku": "ROA-LIN-001-BEI",
    "stock_m": 120
   },
   {
    "color": "ivory",
    "sku": "ROA-LIN-001-IVO",
    "stock_m": 86
   },
   {
    "color": "white",
    "sku": "ROA-LIN-001-WHI",
    "stock_m": 64
   },
   {
    "color": "black",
    "sku": "ROA-LIN-001-BLA",
    "stock_m": 14
   },
   {
    "color": "navy",
    "sku": "ROA-LIN-001-NAV",
    "stock_m": 52
   }
  ]
 },
 {
  "id": "mulberry-silk",
  "slug": "mulberry-silk",
  "status": "active",
  "sku": "ROA-SLK-002",
  "name_en": "Luxury Mulberry Silk Charmeuse",
  "name_ar": "حرير توت شارموز فاخر",
  "description_en": "Fluid 19-momme mulberry silk with a luminous face and a soft matte back. It falls in liquid folds and feels cool against the skin — made for evening dresses, linings and statement blouses.",
  "description_ar": "حرير توت انسيابي بوزن ١٩ مومي، بوجه لامع وظهر مطفي ناعم. ينسدل بطيّات كالماء ويمنح إحساسًا باردًا على البشرة؛ مثالي لفساتين السهرة والبطانات والبلوزات المميزة.",
  "category": "silk",
  "collections": [
   "silk",
   "luxury",
   "occasion"
  ],
  "fabric_type": "satin",
  "material": "silk",
  "pattern": "solid",
  "composition_en": "100% mulberry silk",
  "composition_ar": "١٠٠٪ حرير توت",
  "texture_en": "Lustrous face, matte back",
  "texture_ar": "وجه لامع وظهر مطفي",
  "use_en": "Evening dresses, blouses, linings, scarves",
  "use_ar": "فساتين سهرة، بلوزات، بطانات، أوشحة",
  "care_en": "Dry clean recommended. Cool iron on reverse.",
  "care_ar": "يُنصح بالتنظيف الجاف. كيّ بحرارة منخفضة على الوجه الخلفي.",
  "origin": "CN",
  "width_cm": 114,
  "weight_gsm": 82,
  "stretch": "none",
  "opacity": "semi",
  "price_per_meter": 18.75,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.9,
  "review_count": 22,
  "sold_count": 265,
  "created_at": "2026-08-20",
  "featured": false,
  "best_seller": false,
  "new_arrival": true,
  "limited": false,
  "variants": [
   {
    "color": "champagne",
    "sku": "ROA-SLK-002-CHA",
    "stock_m": 48
   },
   {
    "color": "ivory",
    "sku": "ROA-SLK-002-IVO",
    "stock_m": 40
   },
   {
    "color": "burgundy",
    "sku": "ROA-SLK-002-BUR",
    "stock_m": 26
   },
   {
    "color": "emerald",
    "sku": "ROA-SLK-002-EME",
    "stock_m": 9
   },
   {
    "color": "navy",
    "sku": "ROA-SLK-002-NAV",
    "stock_m": 30
   }
  ]
 },
 {
  "id": "egyptian-cotton",
  "slug": "egyptian-cotton",
  "status": "active",
  "sku": "ROA-CTN-003",
  "name_en": "Soft Egyptian Cotton Poplin",
  "name_ar": "قطن مصري بوبلين ناعم",
  "description_en": "A smooth, tightly woven long-staple cotton poplin with a subtle sheen. Comfortable, easy to sew and pleasant in warm weather — a reliable choice for shirts, dishdashas and children's wear.",
  "description_ar": "قطن بوبلين طويل التيلة بنسيج محكم ولمعة خفيفة. مريح وسهل الخياطة ولطيف في الأجواء الحارة؛ خيار موثوق للقمصان والدشاديش وملابس الأطفال.",
  "category": "cotton",
  "collections": [
   "everyday"
  ],
  "fabric_type": "plain",
  "material": "cotton",
  "pattern": "solid",
  "composition_en": "100% long-staple cotton",
  "composition_ar": "١٠٠٪ قطن طويل التيلة",
  "texture_en": "Smooth, light sheen",
  "texture_ar": "ناعم بلمعة خفيفة",
  "use_en": "Shirts, dishdashas, kids' wear, sleepwear",
  "use_ar": "قمصان، دشاديش، ملابس أطفال، ملابس نوم",
  "care_en": "Machine wash at 30°C. Medium iron.",
  "care_ar": "غسيل آلي على ٣٠ درجة. كيّ بحرارة متوسطة.",
  "origin": "EG",
  "width_cm": 150,
  "weight_gsm": 115,
  "stretch": "none",
  "opacity": "semi",
  "price_per_meter": 4.5,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.7,
  "review_count": 58,
  "sold_count": 690,
  "created_at": "2026-03-14",
  "featured": false,
  "best_seller": true,
  "new_arrival": false,
  "limited": false,
  "variants": [
   {
    "color": "white",
    "sku": "ROA-CTN-003-WHI",
    "stock_m": 240
   },
   {
    "color": "skyblue",
    "sku": "ROA-CTN-003-SKY",
    "stock_m": 96
   },
   {
    "color": "beige",
    "sku": "ROA-CTN-003-BEI",
    "stock_m": 110
   },
   {
    "color": "grey",
    "sku": "ROA-CTN-003-GRE",
    "stock_m": 0
   }
  ]
 },
 {
  "id": "duchess-satin",
  "slug": "duchess-satin",
  "status": "active",
  "sku": "ROA-SAT-004",
  "name_en": "Premium Duchess Satin",
  "name_ar": "ساتان دوتشيس فاخر",
  "description_en": "A heavy, structured satin with a deep, even lustre. It holds volume and sharp seams, making it the classic choice for bridal gowns, structured skirts and formal occasion wear.",
  "description_ar": "ساتان ثقيل ومتماسك بلمعان عميق ومتجانس. يحافظ على الحجم والخياطات الحادة، ولذلك يُعدّ الخيار الكلاسيكي لفساتين الزفاف والتنانير المنفوشة وملابس المناسبات الرسمية.",
  "category": "satin",
  "collections": [
   "occasion",
   "luxury"
  ],
  "fabric_type": "satin",
  "material": "polyester",
  "pattern": "solid",
  "composition_en": "100% polyester satin",
  "composition_ar": "١٠٠٪ ساتان بوليستر",
  "texture_en": "High lustre, smooth",
  "texture_ar": "لمعان عالٍ وملمس أملس",
  "use_en": "Bridal, evening gowns, structured skirts",
  "use_ar": "فساتين زفاف، فساتين سهرة، تنانير منفوشة",
  "care_en": "Dry clean only.",
  "care_ar": "تنظيف جاف فقط.",
  "origin": "KR",
  "width_cm": 150,
  "weight_gsm": 230,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 9.25,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.6,
  "review_count": 19,
  "sold_count": 205,
  "created_at": "2026-05-09",
  "featured": false,
  "best_seller": false,
  "new_arrival": false,
  "limited": false,
  "variants": [
   {
    "color": "ivory",
    "sku": "ROA-SAT-004-IVO",
    "stock_m": 70
   },
   {
    "color": "champagne",
    "sku": "ROA-SAT-004-CHA",
    "stock_m": 44
   },
   {
    "color": "burgundy",
    "sku": "ROA-SAT-004-BUR",
    "stock_m": 38
   },
   {
    "color": "emerald",
    "sku": "ROA-SAT-004-EME",
    "stock_m": 18
   },
   {
    "color": "black",
    "sku": "ROA-SAT-004-BLA",
    "stock_m": 55
   }
  ]
 },
 {
  "id": "silk-velvet",
  "slug": "silk-velvet",
  "status": "active",
  "sku": "ROA-VLV-005",
  "name_en": "Elegant Silk Velvet",
  "name_ar": "مخمل حريري أنيق",
  "description_en": "A supple velvet with a short, dense pile that catches the light as it moves. Rich in colour and soft to the touch, it drapes gracefully for winter evening wear and jackets.",
  "description_ar": "مخمل مرن بوبر قصير وكثيف يعكس الضوء مع كل حركة. غني باللون وناعم الملمس، وينسدل برقيّ لملابس السهرة الشتوية والجاكيتات.",
  "category": "velvet",
  "collections": [
   "luxury"
  ],
  "fabric_type": "pile",
  "material": "blend",
  "pattern": "solid",
  "composition_en": "82% viscose, 18% silk",
  "composition_ar": "٨٢٪ فسكوز، ١٨٪ حرير",
  "texture_en": "Soft dense pile",
  "texture_ar": "وبر كثيف وناعم",
  "use_en": "Evening dresses, jackets, bishts trims",
  "use_ar": "فساتين سهرة، جاكيتات، حواف البشوت",
  "care_en": "Dry clean only. Steam, do not iron the pile.",
  "care_ar": "تنظيف جاف فقط. يُستخدم البخار ولا يُكوى الوبر مباشرة.",
  "origin": "FR",
  "width_cm": 135,
  "weight_gsm": 260,
  "stretch": "slight",
  "opacity": "opaque",
  "price_per_meter": 15,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.8,
  "review_count": 14,
  "sold_count": 120,
  "created_at": "2026-09-12",
  "featured": true,
  "best_seller": false,
  "new_arrival": false,
  "limited": true,
  "variants": [
   {
    "color": "burgundy",
    "sku": "ROA-VLV-005-BUR",
    "stock_m": 22
   },
   {
    "color": "emerald",
    "sku": "ROA-VLV-005-EME",
    "stock_m": 16
   },
   {
    "color": "navy",
    "sku": "ROA-VLV-005-NAV",
    "stock_m": 12
   },
   {
    "color": "black",
    "sku": "ROA-VLV-005-BLA",
    "stock_m": 30
   }
  ]
 },
 {
  "id": "embroidered-crepe",
  "slug": "embroidered-crepe",
  "status": "active",
  "sku": "ROA-EMB-006",
  "name_en": "Embroidered Luxury Crepe",
  "name_ar": "كريب فاخر مطرّز",
  "description_en": "A fluid crepe base embroidered all over with fine metallic-gold medallions and scattered beads. Elegant without being heavy — beautiful for abayas, kaftans and occasion wear.",
  "description_ar": "قماش كريب انسيابي مطرّز بالكامل بزخارف دائرية بخيوط ذهبية دقيقة وخرز متناثر. فخم دون ثقل؛ رائع للعبايات والقفاطين وملابس المناسبات.",
  "category": "embroidered",
  "collections": [
   "embroidery",
   "abaya",
   "luxury"
  ],
  "fabric_type": "crepe",
  "material": "polyester",
  "pattern": "embroidered",
  "composition_en": "Polyester crepe, metallic thread embroidery",
  "composition_ar": "كريب بوليستر مع تطريز بخيوط معدنية",
  "texture_en": "Raised embroidery on soft crepe",
  "texture_ar": "تطريز بارز على كريب ناعم",
  "use_en": "Abayas, kaftans, occasion dresses",
  "use_ar": "عبايات، قفاطين، فساتين مناسبات",
  "care_en": "Dry clean only. Iron on reverse with a pressing cloth.",
  "care_ar": "تنظيف جاف فقط. يُكوى على الوجه الخلفي مع قطعة قماش عازلة.",
  "origin": "IN",
  "width_cm": 130,
  "weight_gsm": 210,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 24,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.9,
  "review_count": 11,
  "sold_count": 96,
  "created_at": "2026-07-28",
  "featured": true,
  "best_seller": false,
  "new_arrival": false,
  "limited": true,
  "variants": [
   {
    "color": "black",
    "sku": "ROA-EMB-006-BLA",
    "stock_m": 28
   },
   {
    "color": "ivory",
    "sku": "ROA-EMB-006-IVO",
    "stock_m": 15
   },
   {
    "color": "burgundy",
    "sku": "ROA-EMB-006-BUR",
    "stock_m": 10
   },
   {
    "color": "navy",
    "sku": "ROA-EMB-006-NAV",
    "stock_m": 6
   }
  ]
 },
 {
  "id": "floral-viscose",
  "slug": "floral-viscose",
  "status": "active",
  "sku": "ROA-PRT-007",
  "name_en": "Floral Printed Viscose",
  "name_ar": "فسكوز مطبوع بالورود",
  "description_en": "A light, fluid viscose printed with a small-scale floral. It moves softly and feels cool in the heat — lovely for summer dresses, jalabiyas and loungewear.",
  "description_ar": "فسكوز خفيف وانسيابي مطبوع بنقشة ورود صغيرة. يتحرك بنعومة ويمنح انتعاشًا في الحر؛ جميل لفساتين الصيف والجلابيات وملابس المنزل.",
  "category": "printed",
  "collections": [
   "everyday"
  ],
  "fabric_type": "plain",
  "material": "viscose",
  "pattern": "printed",
  "composition_en": "100% viscose",
  "composition_ar": "١٠٠٪ فسكوز",
  "texture_en": "Soft, fluid, light sheen",
  "texture_ar": "ناعم وانسيابي بلمعة خفيفة",
  "use_en": "Summer dresses, jalabiyas, loungewear",
  "use_ar": "فساتين صيفية، جلابيات، ملابس منزل",
  "care_en": "Hand wash cold. Do not tumble dry.",
  "care_ar": "غسيل يدوي بماء بارد. لا يُجفف في المجفف.",
  "origin": "TR",
  "width_cm": 140,
  "weight_gsm": 120,
  "stretch": "none",
  "opacity": "semi",
  "price_per_meter": 6.25,
  "compare_at_price": 7.5,
  "currency": "KWD",
  "rating": 4.5,
  "review_count": 27,
  "sold_count": 330,
  "created_at": "2026-04-21",
  "featured": false,
  "best_seller": false,
  "new_arrival": false,
  "limited": false,
  "variants": [
   {
    "color": "cream",
    "sku": "ROA-PRT-007-CRE",
    "stock_m": 75
   },
   {
    "color": "navy",
    "sku": "ROA-PRT-007-NAV",
    "stock_m": 60
   },
   {
    "color": "sage",
    "sku": "ROA-PRT-007-SAG",
    "stock_m": 34
   },
   {
    "color": "rose",
    "sku": "ROA-PRT-007-ROS",
    "stock_m": 8
   }
  ]
 },
 {
  "id": "wool-suiting",
  "slug": "wool-suiting",
  "status": "active",
  "sku": "ROA-SUI-008",
  "name_en": "Super 120s Wool Suiting",
  "name_ar": "قماش بدلات صوف سوبر ١٢٠",
  "description_en": "A fine worsted wool woven in a discreet herringbone. Smooth, crease-resistant and comfortable through long days — the tailor's choice for suits, trousers and winter dishdashas.",
  "description_ar": "صوف مغزول ناعم بنسيج عظم السمكة الهادئ. أملس ومقاوم للتجعّد ومريح طوال اليوم؛ اختيار الخيّاطين للبدلات والبناطيل والدشاديش الشتوية.",
  "category": "suiting",
  "collections": [
   "luxury"
  ],
  "fabric_type": "twill",
  "material": "wool",
  "pattern": "herringbone",
  "composition_en": "100% Super 120s merino wool",
  "composition_ar": "١٠٠٪ صوف ميرينو سوبر ١٢٠",
  "texture_en": "Smooth worsted, fine herringbone",
  "texture_ar": "صوف أملس بنقشة عظم السمكة",
  "use_en": "Suits, trousers, winter dishdashas",
  "use_ar": "بدلات، بناطيل، دشاديش شتوية",
  "care_en": "Dry clean. Steam to refresh.",
  "care_ar": "تنظيف جاف. يُنعش بالبخار.",
  "origin": "IT",
  "width_cm": 150,
  "weight_gsm": 250,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 14.5,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.7,
  "review_count": 17,
  "sold_count": 180,
  "created_at": "2026-02-10",
  "featured": false,
  "best_seller": false,
  "new_arrival": false,
  "limited": false,
  "variants": [
   {
    "color": "charcoal",
    "sku": "ROA-SUI-008-CHA",
    "stock_m": 64
   },
   {
    "color": "navy",
    "sku": "ROA-SUI-008-NAV",
    "stock_m": 58
   },
   {
    "color": "grey",
    "sku": "ROA-SUI-008-GRE",
    "stock_m": 40
   },
   {
    "color": "black",
    "sku": "ROA-SUI-008-BLA",
    "stock_m": 35
   }
  ]
 },
 {
  "id": "nida-abaya",
  "slug": "nida-abaya",
  "status": "active",
  "sku": "ROA-ABY-009",
  "name_en": "Premium Nida Abaya Fabric",
  "name_ar": "قماش ندى فاخر للعبايات",
  "description_en": "The fabric most requested for everyday abayas: a soft, matte nida with a fine pebble texture. It drapes cleanly, resists creasing and stays fully opaque.",
  "description_ar": "القماش الأكثر طلبًا للعبايات اليومية: ندى ناعم غير لامع بملمس حُبيبي دقيق. ينسدل بانسيابية، ويقاوم التجعّد، ويبقى ساترًا تمامًا.",
  "category": "abaya",
  "collections": [
   "abaya"
  ],
  "fabric_type": "crepe",
  "material": "polyester",
  "pattern": "solid",
  "composition_en": "100% polyester nida",
  "composition_ar": "١٠٠٪ ندى بوليستر",
  "texture_en": "Matte, fine pebble crepe",
  "texture_ar": "غير لامع بملمس كريب حُبيبي",
  "use_en": "Abayas, jilbabs, modest wear",
  "use_ar": "عبايات، جلابيب، أزياء محتشمة",
  "care_en": "Gentle machine wash 30°C. Low iron.",
  "care_ar": "غسيل آلي لطيف على ٣٠ درجة. كيّ بحرارة منخفضة.",
  "origin": "KR",
  "width_cm": 150,
  "weight_gsm": 165,
  "stretch": "slight",
  "opacity": "opaque",
  "price_per_meter": 7.75,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.8,
  "review_count": 64,
  "sold_count": 820,
  "created_at": "2026-01-18",
  "featured": true,
  "best_seller": true,
  "new_arrival": false,
  "limited": false,
  "variants": [
   {
    "color": "black",
    "sku": "ROA-ABY-009-BLA",
    "stock_m": 300
   },
   {
    "color": "navy",
    "sku": "ROA-ABY-009-NAV",
    "stock_m": 80
   },
   {
    "color": "mocha",
    "sku": "ROA-ABY-009-MOC",
    "stock_m": 45
   },
   {
    "color": "charcoal",
    "sku": "ROA-ABY-009-CHA",
    "stock_m": 60
   }
  ]
 },
 {
  "id": "sadu-weave",
  "slug": "sadu-weave",
  "status": "active",
  "sku": "ROA-TRD-010",
  "name_en": "Sadu-Inspired Woven Fabric",
  "name_ar": "قماش منسوج مستوحى من السدو",
  "description_en": "A sturdy woven fabric with geometric bands inspired by Sadu, the Bedouin weaving tradition of Kuwait and the Gulf. Use it for cushions, majlis upholstery, bags and heritage-inspired accents.",
  "description_ar": "قماش منسوج متين بأشرطة هندسية مستوحاة من السدو، فن النسيج البدوي في الكويت والخليج. مناسب للوسائد وتنجيد المجالس والحقائب والتفاصيل المستوحاة من التراث.",
  "category": "traditional",
  "collections": [
   "traditional"
  ],
  "fabric_type": "jacquard",
  "material": "blend",
  "pattern": "woven",
  "composition_en": "60% cotton, 40% wool",
  "composition_ar": "٦٠٪ قطن، ٤٠٪ صوف",
  "texture_en": "Coarse woven, matte",
  "texture_ar": "نسيج خشن غير لامع",
  "use_en": "Cushions, majlis upholstery, bags, décor",
  "use_ar": "وسائد، تنجيد مجالس، حقائب، ديكور",
  "care_en": "Dry clean or spot clean.",
  "care_ar": "تنظيف جاف أو تنظيف موضعي.",
  "origin": "IN",
  "width_cm": 140,
  "weight_gsm": 340,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 11,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.7,
  "review_count": 9,
  "sold_count": 75,
  "created_at": "2026-09-01",
  "featured": false,
  "best_seller": false,
  "new_arrival": true,
  "limited": false,
  "variants": [
   {
    "color": "crimson",
    "sku": "ROA-TRD-010-CRI",
    "stock_m": 30
   },
   {
    "color": "indigo",
    "sku": "ROA-TRD-010-IND",
    "stock_m": 18
   },
   {
    "color": "natural",
    "sku": "ROA-TRD-010-NAT",
    "stock_m": 22
   }
  ]
 },
 {
  "id": "georgette-chiffon",
  "slug": "georgette-chiffon",
  "status": "active",
  "sku": "ROA-CHF-011",
  "name_en": "Soft Georgette Chiffon",
  "name_ar": "شيفون جورجيت ناعم",
  "description_en": "An airy georgette chiffon with a soft crepe handle. Light and floating, it layers beautifully over linings for sleeves, overlays, scarves and sheilas.",
  "description_ar": "شيفون جورجيت خفيف بملمس كريب ناعم. خفيف ومتطاير، ويبدو رائعًا فوق البطانات للأكمام والطبقات الخارجية والأوشحة والشيلات.",
  "category": "chiffon",
  "collections": [
   "abaya",
   "occasion"
  ],
  "fabric_type": "sheer",
  "material": "polyester",
  "pattern": "solid",
  "composition_en": "100% polyester georgette",
  "composition_ar": "١٠٠٪ جورجيت بوليستر",
  "texture_en": "Sheer, soft crepe",
  "texture_ar": "شفاف بملمس كريب ناعم",
  "use_en": "Overlays, sleeves, scarves, sheilas",
  "use_ar": "طبقات خارجية، أكمام، أوشحة، شيلات",
  "care_en": "Hand wash cold. Cool iron.",
  "care_ar": "غسيل يدوي بماء بارد. كيّ بحرارة منخفضة.",
  "origin": "KR",
  "width_cm": 150,
  "weight_gsm": 60,
  "stretch": "none",
  "opacity": "sheer",
  "price_per_meter": 5.5,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.6,
  "review_count": 31,
  "sold_count": 400,
  "created_at": "2026-09-20",
  "featured": false,
  "best_seller": false,
  "new_arrival": true,
  "limited": false,
  "variants": [
   {
    "color": "ivory",
    "sku": "ROA-CHF-011-IVO",
    "stock_m": 90
   },
   {
    "color": "blush",
    "sku": "ROA-CHF-011-BLU",
    "stock_m": 42
   },
   {
    "color": "emerald",
    "sku": "ROA-CHF-011-EME",
    "stock_m": 25
   },
   {
    "color": "black",
    "sku": "ROA-CHF-011-BLA",
    "stock_m": 120
   }
  ]
 },
 {
  "id": "jacquard-brocade",
  "slug": "jacquard-brocade",
  "status": "active",
  "sku": "ROA-LUX-012",
  "name_en": "Damask Jacquard Brocade",
  "name_ar": "بروكار جاكار دمشقي",
  "description_en": "A rich jacquard brocade with a woven damask motif in metallic gold on a lustrous ground. Substantial and regal — for occasion jackets, bishts linings, kaftans and fine upholstery.",
  "description_ar": "بروكار جاكار فاخر بنقشة دمشقية منسوجة بخيوط ذهبية على أرضية لامعة. قماش متين وملكي الطابع لجاكيتات المناسبات وبطانات البشوت والقفاطين والتنجيد الراقي.",
  "category": "luxury",
  "collections": [
   "luxury",
   "traditional",
   "embroidery"
  ],
  "fabric_type": "jacquard",
  "material": "blend",
  "pattern": "jacquard",
  "composition_en": "70% polyester, 30% metallic yarn",
  "composition_ar": "٧٠٪ بوليستر، ٣٠٪ خيوط معدنية",
  "texture_en": "Raised woven motif, lustrous",
  "texture_ar": "نقشة منسوجة بارزة ولامعة",
  "use_en": "Occasion jackets, kaftans, upholstery",
  "use_ar": "جاكيتات مناسبات، قفاطين، تنجيد",
  "care_en": "Dry clean only.",
  "care_ar": "تنظيف جاف فقط.",
  "origin": "TR",
  "width_cm": 140,
  "weight_gsm": 300,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 21.5,
  "compare_at_price": null,
  "currency": "KWD",
  "rating": 4.9,
  "review_count": 8,
  "sold_count": 140,
  "created_at": "2026-06-30",
  "featured": false,
  "best_seller": false,
  "new_arrival": false,
  "limited": false,
  "variants": [
   {
    "color": "burgundy",
    "sku": "ROA-LUX-012-BUR",
    "stock_m": 20
   },
   {
    "color": "ivory",
    "sku": "ROA-LUX-012-IVO",
    "stock_m": 14
   },
   {
    "color": "emerald",
    "sku": "ROA-LUX-012-EME",
    "stock_m": 11
   },
   {
    "color": "gold",
    "sku": "ROA-LUX-012-GOL",
    "stock_m": 4
   }
  ]
 },
 {
  "status": "active",
  "currency": "KWD",
  "compare_at_price": null,
  "featured": false,
  "best_seller": false,
  "new_arrival": true,
  "limited": false,
  "id": "crepe-back-satin",
  "sku": "ROA-SAT-013",
  "name_en": "Crepe-Back Satin",
  "name_ar": "ساتان بظهر كريب",
  "description_en": "A reversible fabric with a soft satin face and a matte crepe back. It drapes fluidly, takes a bias cut beautifully and gives two finishes in one cloth — a favourite for evening gowns and occasion abayas.",
  "description_ar": "قماش بوجهين: وجه ساتان ناعم وظهر كريب مطفي. ينسدل بانسيابية ويتقبّل القص المائل بسهولة، ويمنحك لمستين في قماش واحد؛ مفضّل لفساتين السهرة وعبايات المناسبات.",
  "category": "satin",
  "collections": [
   "occasion",
   "silk",
   "luxury"
  ],
  "fabric_type": "satin",
  "material": "polyester",
  "pattern": "solid",
  "composition_en": "100% polyester",
  "composition_ar": "١٠٠٪ بوليستر",
  "texture_en": "Satin face, crepe back",
  "texture_ar": "وجه ساتان وظهر كريب",
  "use_en": "Evening gowns, occasion abayas, blouses",
  "use_ar": "فساتين سهرة، عبايات مناسبات، بلوزات",
  "care_en": "Dry clean recommended. Cool iron on the crepe side.",
  "care_ar": "يُنصح بالتنظيف الجاف. كيّ بحرارة منخفضة على جهة الكريب.",
  "origin": "KR",
  "width_cm": 150,
  "weight_gsm": 150,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 8.5,
  "rating": 4.8,
  "review_count": 21,
  "sold_count": 310,
  "created_at": "2026-09-25",
  "slug": "crepe-back-satin",
  "variants": [
   {
    "color": "wine",
    "sku": "ROA-SAT-013-WIN",
    "stock_m": 60
   },
   {
    "color": "blush",
    "sku": "ROA-SAT-013-BLU",
    "stock_m": 38
   },
   {
    "color": "ivory",
    "sku": "ROA-SAT-013-IVO",
    "stock_m": 72
   },
   {
    "color": "black",
    "sku": "ROA-SAT-013-BLA",
    "stock_m": 90
   },
   {
    "color": "champagne",
    "sku": "ROA-SAT-013-CHA",
    "stock_m": 44
   }
  ]
 },
 {
  "status": "active",
  "currency": "KWD",
  "compare_at_price": null,
  "featured": false,
  "best_seller": false,
  "new_arrival": false,
  "limited": false,
  "id": "swiss-voile",
  "sku": "ROA-CTN-014",
  "name_en": "Swiss Cotton Voile",
  "name_ar": "فوال قطني سويسري",
  "description_en": "A fine, airy cotton voile with a crisp hand and soft transparency. Cool and light in the Kuwaiti summer — for blouses, light jalabiyas, linings and layered sheer curtains.",
  "description_ar": "فوال قطني رقيق وخفيف بملمس منتعش وشفافية ناعمة. بارد وخفيف في صيف الكويت؛ للبلوزات والجلابيات الخفيفة والبطانات والستائر الشفافة.",
  "category": "cotton",
  "collections": [
   "everyday"
  ],
  "fabric_type": "sheer",
  "material": "cotton",
  "pattern": "solid",
  "composition_en": "100% cotton",
  "composition_ar": "١٠٠٪ قطن",
  "texture_en": "Fine, crisp, semi-sheer",
  "texture_ar": "رقيق ومنتعش وشبه شفاف",
  "use_en": "Blouses, light jalabiyas, linings, sheer curtains",
  "use_ar": "بلوزات، جلابيات خفيفة، بطانات، ستائر شفافة",
  "care_en": "Machine wash 30°C, gentle. Medium iron.",
  "care_ar": "غسيل آلي لطيف على ٣٠ درجة. كيّ بحرارة متوسطة.",
  "origin": "TR",
  "width_cm": 145,
  "weight_gsm": 70,
  "stretch": "none",
  "opacity": "sheer",
  "price_per_meter": 5.25,
  "rating": 4.6,
  "review_count": 18,
  "sold_count": 260,
  "created_at": "2026-05-30",
  "slug": "swiss-voile",
  "variants": [
   {
    "color": "white",
    "sku": "ROA-CTN-014-WHI",
    "stock_m": 150
   },
   {
    "color": "ivory",
    "sku": "ROA-CTN-014-IVO",
    "stock_m": 80
   },
   {
    "color": "skyblue",
    "sku": "ROA-CTN-014-SKY",
    "stock_m": 40
   },
   {
    "color": "blush",
    "sku": "ROA-CTN-014-BLU",
    "stock_m": 35
   }
  ]
 },
 {
  "status": "active",
  "currency": "KWD",
  "compare_at_price": null,
  "featured": false,
  "best_seller": true,
  "new_arrival": false,
  "limited": false,
  "id": "linen-cotton",
  "sku": "ROA-LIN-015",
  "name_en": "Washed Linen-Cotton Blend",
  "name_ar": "مزيج كتان وقطن مغسول",
  "description_en": "Linen character with cotton softness. Pre-washed for a relaxed, lived-in hand that resists heavy creasing — easy to sew and easy to wear every day.",
  "description_ar": "طابع الكتان مع نعومة القطن. مغسول مسبقًا لملمس مريح يقاوم التجعّد الشديد؛ سهل الخياطة ومريح للارتداء اليومي.",
  "category": "linen",
  "collections": [
   "linen",
   "everyday"
  ],
  "fabric_type": "plain",
  "material": "blend",
  "pattern": "solid",
  "composition_en": "55% linen, 45% cotton",
  "composition_ar": "٥٥٪ كتان، ٤٥٪ قطن",
  "texture_en": "Soft, washed, gentle slub",
  "texture_ar": "ناعم ومغسول بملمس طبيعي",
  "use_en": "Shirts, trousers, kaftans, home textiles",
  "use_ar": "قمصان، بناطيل، قفاطين، مفروشات منزلية",
  "care_en": "Machine wash 30°C. Tumble dry low.",
  "care_ar": "غسيل آلي على ٣٠ درجة. تجفيف على حرارة منخفضة.",
  "origin": "TR",
  "width_cm": 140,
  "weight_gsm": 160,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 6.5,
  "rating": 4.7,
  "review_count": 26,
  "sold_count": 380,
  "created_at": "2026-08-08",
  "slug": "linen-cotton",
  "variants": [
   {
    "color": "natural",
    "sku": "ROA-LIN-015-NAT",
    "stock_m": 110
   },
   {
    "color": "camel",
    "sku": "ROA-LIN-015-CAM",
    "stock_m": 54
   },
   {
    "color": "sage",
    "sku": "ROA-LIN-015-SAG",
    "stock_m": 40
   },
   {
    "color": "navy",
    "sku": "ROA-LIN-015-NAV",
    "stock_m": 62
   },
   {
    "color": "white",
    "sku": "ROA-LIN-015-WHI",
    "stock_m": 75
   }
  ]
 },
 {
  "status": "active",
  "currency": "KWD",
  "compare_at_price": null,
  "featured": false,
  "best_seller": false,
  "new_arrival": true,
  "limited": true,
  "id": "silk-organza",
  "sku": "ROA-SHR-016",
  "name_en": "Pure Silk Organza",
  "name_ar": "أورجانزا حرير خالص",
  "description_en": "Crisp, translucent silk organza with a luminous sheen. It holds shape for structured sleeves, veils, overlays and bridal details while staying feather-light.",
  "description_ar": "أورجانزا حرير شفافة ومتماسكة بلمعة مضيئة. تحافظ على شكلها في الأكمام المنفوشة والطرحات والطبقات الخارجية وتفاصيل العرائس، مع خفة كالريشة.",
  "category": "chiffon",
  "collections": [
   "occasion",
   "silk"
  ],
  "fabric_type": "sheer",
  "material": "silk",
  "pattern": "solid",
  "composition_en": "100% silk",
  "composition_ar": "١٠٠٪ حرير",
  "texture_en": "Crisp, translucent, lustrous",
  "texture_ar": "متماسك وشفاف ولامع",
  "use_en": "Bridal overlays, veils, structured sleeves",
  "use_ar": "طبقات فساتين العرائس، طرحات، أكمام منفوشة",
  "care_en": "Dry clean only. Cool iron with pressing cloth.",
  "care_ar": "تنظيف جاف فقط. كيّ بحرارة منخفضة مع قماش عازل.",
  "origin": "CN",
  "width_cm": 137,
  "weight_gsm": 40,
  "stretch": "none",
  "opacity": "sheer",
  "price_per_meter": 13.75,
  "rating": 4.9,
  "review_count": 7,
  "sold_count": 88,
  "created_at": "2026-09-28",
  "slug": "silk-organza",
  "variants": [
   {
    "color": "ivory",
    "sku": "ROA-SHR-016-IVO",
    "stock_m": 30
   },
   {
    "color": "blush",
    "sku": "ROA-SHR-016-BLU",
    "stock_m": 16
   },
   {
    "color": "gold",
    "sku": "ROA-SHR-016-GOL",
    "stock_m": 9
   },
   {
    "color": "black",
    "sku": "ROA-SHR-016-BLA",
    "stock_m": 20
   }
  ]
 },
 {
  "status": "active",
  "currency": "KWD",
  "compare_at_price": null,
  "featured": false,
  "best_seller": false,
  "new_arrival": false,
  "limited": true,
  "id": "guipure-lace",
  "sku": "ROA-EMB-017",
  "name_en": "Guipure Lace",
  "name_ar": "دانتيل جيبور",
  "description_en": "A rich guipure lace with raised floral medallions joined by fine bars. Elegant on its own or layered over satin for bridal, engagement and Eid occasion wear.",
  "description_ar": "دانتيل جيبور فاخر بزخارف دائرية بارزة متصلة بخيوط دقيقة. أنيق بمفرده أو فوق الساتان لملابس العرائس والملكات والعيد.",
  "category": "embroidered",
  "collections": [
   "embroidery",
   "occasion"
  ],
  "fabric_type": "jacquard",
  "material": "polyester",
  "pattern": "embroidered",
  "composition_en": "100% polyester guipure",
  "composition_ar": "١٠٠٪ جيبور بوليستر",
  "texture_en": "Raised floral lace",
  "texture_ar": "دانتيل بارز بنقشة ورود",
  "use_en": "Bridal, engagement dresses, overlays",
  "use_ar": "فساتين عرائس، فساتين ملكة، طبقات خارجية",
  "care_en": "Dry clean only.",
  "care_ar": "تنظيف جاف فقط.",
  "origin": "IN",
  "width_cm": 130,
  "weight_gsm": 190,
  "stretch": "none",
  "opacity": "semi",
  "price_per_meter": 19.5,
  "rating": 4.8,
  "review_count": 9,
  "sold_count": 70,
  "created_at": "2026-07-15",
  "slug": "guipure-lace",
  "variants": [
   {
    "color": "ivory",
    "sku": "ROA-EMB-017-IVO",
    "stock_m": 22
   },
   {
    "color": "black",
    "sku": "ROA-EMB-017-BLA",
    "stock_m": 18
   },
   {
    "color": "champagne",
    "sku": "ROA-EMB-017-CHA",
    "stock_m": 12
   }
  ]
 },
 {
  "status": "active",
  "currency": "KWD",
  "compare_at_price": null,
  "featured": false,
  "best_seller": false,
  "new_arrival": true,
  "limited": false,
  "id": "wool-cashmere",
  "sku": "ROA-SUI-018",
  "name_en": "Wool & Cashmere Coating",
  "name_ar": "قماش معاطف صوف وكشمير",
  "description_en": "A soft, brushed wool with a touch of cashmere for warmth without weight. Ideal for winter coats, bishts, jackets and tailored trousers.",
  "description_ar": "صوف ناعم مصقول بلمسة كشمير يمنح الدفء دون ثقل. مثالي للمعاطف الشتوية والبشوت والجاكيتات والبناطيل المفصّلة.",
  "category": "suiting",
  "collections": [
   "luxury"
  ],
  "fabric_type": "twill",
  "material": "wool",
  "pattern": "solid",
  "composition_en": "90% wool, 10% cashmere",
  "composition_ar": "٩٠٪ صوف، ١٠٪ كشمير",
  "texture_en": "Brushed, velvety handle",
  "texture_ar": "مصقول بملمس مخملي",
  "use_en": "Coats, bishts, jackets, trousers",
  "use_ar": "معاطف، بشوت، جاكيتات، بناطيل",
  "care_en": "Dry clean only. Brush after wear.",
  "care_ar": "تنظيف جاف فقط. يُفرّش بعد الاستخدام.",
  "origin": "IT",
  "width_cm": 150,
  "weight_gsm": 380,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 22.0,
  "rating": 4.9,
  "review_count": 6,
  "sold_count": 54,
  "created_at": "2026-09-30",
  "slug": "wool-cashmere",
  "variants": [
   {
    "color": "camel",
    "sku": "ROA-SUI-018-CAM",
    "stock_m": 26
   },
   {
    "color": "chocolate",
    "sku": "ROA-SUI-018-CHO",
    "stock_m": 18
   },
   {
    "color": "charcoal",
    "sku": "ROA-SUI-018-CHA",
    "stock_m": 30
   },
   {
    "color": "navy",
    "sku": "ROA-SUI-018-NAV",
    "stock_m": 22
   }
  ]
 },
 {
  "status": "active",
  "currency": "KWD",
  "compare_at_price": null,
  "featured": false,
  "best_seller": true,
  "new_arrival": false,
  "limited": false,
  "id": "dishdasha-fabric",
  "sku": "ROA-TRD-019",
  "name_en": "Premium Dishdasha Fabric",
  "name_ar": "قماش دشاديش فاخر",
  "description_en": "A smooth, fine-twill dishdasha fabric with a subtle sheen and clean drape. Breathable, crease-resistant and colour-fast — chosen for everyday and Friday dishdashas alike.",
  "description_ar": "قماش دشاديش ناعم بنسيج تويل دقيق ولمعة هادئة وانسدال مرتب. يسمح بمرور الهواء، ومقاوم للتجعّد، وثابت اللون؛ مناسب للدشاديش اليومية ودشاديش الجمعة.",
  "category": "traditional",
  "collections": [
   "everyday",
   "traditional"
  ],
  "fabric_type": "twill",
  "material": "blend",
  "pattern": "solid",
  "composition_en": "65% polyester, 35% viscose",
  "composition_ar": "٦٥٪ بوليستر، ٣٥٪ فسكوز",
  "texture_en": "Smooth fine twill, soft sheen",
  "texture_ar": "تويل دقيق أملس بلمعة ناعمة",
  "use_en": "Dishdashas / kanduras, thobes",
  "use_ar": "دشاديش / كنادير، أثواب",
  "care_en": "Machine wash 30°C. Medium iron.",
  "care_ar": "غسيل آلي على ٣٠ درجة. كيّ بحرارة متوسطة.",
  "origin": "JP",
  "width_cm": 150,
  "weight_gsm": 140,
  "stretch": "none",
  "opacity": "opaque",
  "price_per_meter": 4.75,
  "rating": 4.8,
  "review_count": 73,
  "sold_count": 950,
  "created_at": "2026-02-22",
  "slug": "dishdasha-fabric",
  "variants": [
   {
    "color": "white",
    "sku": "ROA-TRD-019-WHI",
    "stock_m": 400
   },
   {
    "color": "ivory",
    "sku": "ROA-TRD-019-IVO",
    "stock_m": 160
   },
   {
    "color": "beige",
    "sku": "ROA-TRD-019-BEI",
    "stock_m": 120
   },
   {
    "color": "grey",
    "sku": "ROA-TRD-019-GRE",
    "stock_m": 90
   },
   {
    "color": "skyblue",
    "sku": "ROA-TRD-019-SKY",
    "stock_m": 60
   }
  ]
 }
];

/* ==========================================================================
   IN-STORE PRODUCTS photographed at the shop (REAL PHOTOS — assets/img/store/)
   ⚠ Photos are real. Prices, stock levels and SKUs below are DEMO PLACEHOLDERS for the store to confirm in Admin → Products before launch.
   Only facts printed on the packaging are stated (58" × 25 yds, Made in Japan,
   "non-cling / crease-free", liquid-repellent). No ratings are invented.
   ========================================================================== */
(function () {
  const S = 'assets/img/store/';
  const img = (main, rest) => ({
    drape: S + main + '.webp', drapeSm: S + main + '-sm.webp',
    closeup: S + (rest[0] || main) + '.webp', roll: S + (rest[1] || rest[0] || main) + '.webp',
    folded: S + (rest[2] || main) + '.webp', styled: S + main + '.webp', variations: S + (rest[0] || main) + '.webp',
    gallery: [main, ...rest].map((n, i) => ({ src: S + n + '.webp', view: i === 0 ? 'photo' : (/japan-/.test(n) ? 'label' : /fan|card|book/.test(n) ? 'range' : 'photo') }))
  });
  const base = {
    status: 'active', currency: 'KWD', compare_at_price: null, featured: true, best_seller: false, new_arrival: true, limited: false,
    rating: 0, review_count: 0, sold_count: 0, created_at: '2026-10-01', stretch: 'none', opacity: 'opaque', real_photos: true,
    composition_en: 'Composition to be confirmed — ask us in store', composition_ar: 'التركيب يُؤكَّد عند الطلب — اسألنا في المتجر'
  };
  const v = (sku, list) => list.map(([color, stock]) => ({ color, sku: `${sku}-${color.slice(0, 3).toUpperCase()}`, stock_m: stock }));
  ROKN.data.products.push(
    Object.assign({}, base, {
      id: 'japan-green-forest', slug: 'japan-green-forest', sku: 'ROA-DSH-101',
      name_en: 'Green Forest Japanese Dishdasha Fabric', name_ar: 'قماش دشاديش ياباني — الغابة الخضراء',
      description_en: 'Japanese dishdasha cloth from the "Green Forest" range, sold from the box at our Kuwait City store. The packaging describes it as non-cling and crease-free, made from fine Japanese yarns. Available in whites and soft creams.',
      description_ar: 'قماش دشاديش ياباني من تشكيلة «الغابة الخضراء» يباع من العلبة في متجرنا بمدينة الكويت. تصفه العلبة بأنه «لا يلصق ولا يتكسر» ومصنوع من أجود الخيوط اليابانية. متوفر بدرجات الأبيض والكريمي.',
      category: 'dishdasha', collections: ['dishdasha', 'traditional'], fabric_type: 'plain', material: 'blend', pattern: 'solid',
      texture_en: 'Smooth, crisp hand', texture_ar: 'ملمس أملس ومتماسك', use_en: 'Dishdashas / kanduras', use_ar: 'دشاديش / كنادير',
      care_en: 'Follow the care label on the box.', care_ar: 'اتبع تعليمات العناية على العلبة.',
      origin: 'JP', width_cm: 147, weight_gsm: null, price_per_meter: 3.75,
      images: img('japan-green-forest', ['dishdasha-whites-fan', 'dishdasha-cream-twill']),
      variants: v('ROA-DSH-101', [['white', 80], ['ivory', 60], ['cream', 45]])
    }),
    Object.assign({}, base, {
      id: 'japan-yearn-9x9', slug: 'japan-yearn-9x9', sku: 'ROA-DSH-102',
      name_en: 'YEARN 9x9 Japanese Dishdasha Fabric', name_ar: 'قماش دشاديش ياباني — يارن ٩×٩',
      description_en: 'YEARN 9x9 dishdasha fabric by Yashica Plus Japan. The box describes it as made from fine natural yarns, non-cling and crease-free — 58" wide, 25 yards per piece, made in Japan.',
      description_ar: 'قماش دشاديش يارن ٩×٩ من ياشيكا بلس اليابانية. تصفه العلبة بأنه من أفضل الخيوط الطبيعية، لا يلصق ولا يتكسر؛ بعرض ٥٨ إنشًا و٢٥ ياردة للقطعة، صُنع في اليابان.',
      category: 'dishdasha', collections: ['dishdasha', 'traditional'], fabric_type: 'plain', material: 'blend', pattern: 'solid',
      texture_en: 'Soft, smooth hand', texture_ar: 'ملمس ناعم وأملس', use_en: 'Dishdashas / kanduras', use_ar: 'دشاديش / كنادير',
      care_en: 'Follow the care label on the box.', care_ar: 'اتبع تعليمات العناية على العلبة.',
      origin: 'JP', width_cm: 147, weight_gsm: null, price_per_meter: 4.25,
      images: img('japan-yearn-9x9', ['dishdasha-cream-diagonal', 'dishdasha-whites-fan']),
      variants: v('ROA-DSH-102', [['cream', 30], ['white', 25]])
    }),
    Object.assign({}, base, {
      id: 'japan-liquid-repellent', slug: 'japan-liquid-repellent', sku: 'ROA-DSH-103',
      name_en: 'Liquid-Repellent Japanese Dishdasha Fabric', name_ar: 'خام ضد السوائل — قماش دشاديش ياباني',
      description_en: 'A liquid-repellent dishdasha cloth ("خام ضد السوائل") made in Japan, 58" wide, sold by the metre or by the 25-yard piece. Ask us to show you the finish in store.',
      description_ar: 'خام دشاديش ضد السوائل من صنع اليابان، بعرض ٥٨ إنشًا، يباع بالمتر أو بالقطعة ٢٥ ياردة. اطلب منا تجربة الخاصية في المتجر.',
      category: 'dishdasha', collections: ['dishdasha'], fabric_type: 'plain', material: 'blend', pattern: 'solid',
      texture_en: 'Smooth, treated finish', texture_ar: 'ملمس أملس مع معالجة', use_en: 'Dishdashas, work and everyday wear', use_ar: 'دشاديش، للعمل والاستخدام اليومي',
      care_en: 'Follow the care label on the box.', care_ar: 'اتبع تعليمات العناية على العلبة.',
      origin: 'JP', width_cm: 147, weight_gsm: null, price_per_meter: 4.5,
      images: img('japan-liquid-repellent', ['dishdasha-cream-stripe', 'dishdasha-whites-fan']),
      variants: v('ROA-DSH-103', [['white', 40], ['ivory', 35]])
    }),
    Object.assign({}, base, {
      id: 'self-stripe-dishdasha', slug: 'self-stripe-dishdasha', sku: 'ROA-DSH-104',
      name_en: 'Self-Stripe & Twill Dishdasha Fabrics', name_ar: 'أقمشة دشاديش مقلّمة وتويل',
      description_en: 'Dishdasha fabrics with a woven self-stripe, fine twill or herringbone in white, ivory and cream — subtle texture that shows in daylight. See the full range on our shelves.',
      description_ar: 'أقمشة دشاديش بخطوط منسوجة بنفس اللون أو تويل دقيق أو نقشة عظم السمكة بالأبيض والعاجي والكريمي؛ ملمس هادئ يظهر في ضوء النهار. شاهد التشكيلة كاملة على رفوفنا.',
      category: 'dishdasha', collections: ['dishdasha', 'everyday'], fabric_type: 'twill', material: 'blend', pattern: 'herringbone',
      texture_en: 'Tone-on-tone stripe / twill', texture_ar: 'خطوط أو تويل بنفس اللون', use_en: 'Dishdashas / kanduras', use_ar: 'دشاديش / كنادير',
      care_en: 'Ask us for care advice per fabric.', care_ar: 'اسألنا عن طريقة العناية بكل قماش.',
      origin: null, width_cm: 147, weight_gsm: null, price_per_meter: 3.5,
      images: img('dishdasha-herringbone', ['dishdasha-pinstripe', 'dishdasha-cream-stripe', 'dishdasha-cream-twill']),
      variants: v('ROA-DSH-104', [['white', 20], ['ivory', 60], ['cream', 50]])
    }),
    Object.assign({}, base, {
      id: 'tailoring-suiting', slug: 'tailoring-suiting', sku: 'ROA-SUI-201',
      name_en: 'Tailoring Suiting — Shade Card', name_ar: 'أقمشة بدلات — بطاقة الألوان',
      description_en: 'Plain suiting fabrics shown on our numbered shade cards — greys, beiges, blues and charcoals for suits, trousers and bishts. Pick a shade number in store or send us a photo on WhatsApp.',
      description_ar: 'أقمشة بدلات سادة معروضة على بطاقات ألوان مرقّمة؛ رمادي وبيج وأزرق وفحمي للبدلات والبناطيل والبشوت. اختر رقم اللون في المتجر أو أرسل لنا صورة عبر واتساب.',
      category: 'suiting', collections: ['tailoring'], fabric_type: 'twill', material: 'wool', pattern: 'solid',
      texture_en: 'Smooth suiting finish', texture_ar: 'ملمس بدلات أملس', use_en: 'Suits, trousers, bishts', use_ar: 'بدلات، بناطيل، بشوت',
      care_en: 'Dry clean recommended.', care_ar: 'يُنصح بالتنظيف الجاف.',
      origin: null, width_cm: 150, weight_gsm: null, price_per_meter: 6.5,
      images: img('suiting-colour-card', ['suiting-colour-fan', 'store-interior']),
      variants: v('ROA-SUI-201', [['grey', 40], ['charcoal', 120], ['beige', 80], ['navy', 60]])
    }),
    Object.assign({}, base, {
      id: 'pinstripe-suiting', slug: 'pinstripe-suiting', sku: 'ROA-SUI-202',
      name_en: 'Pinstripe Suiting', name_ar: 'أقمشة بدلات مقلّمة',
      description_en: 'Classic chalk and pinstripe suiting in greys, charcoal and navy, from the swatch books on our counter.',
      description_ar: 'أقمشة بدلات مقلّمة كلاسيكية بالرمادي والفحمي والكحلي، من دفاتر العينات على طاولتنا.',
      category: 'suiting', collections: ['tailoring'], fabric_type: 'twill', material: 'wool', pattern: 'woven',
      texture_en: 'Fine woven stripe', texture_ar: 'خطوط منسوجة دقيقة', use_en: 'Suits, waistcoats, trousers', use_ar: 'بدلات، صديريات، بناطيل',
      care_en: 'Dry clean recommended.', care_ar: 'يُنصح بالتنظيف الجاف.',
      origin: null, width_cm: 150, weight_gsm: null, price_per_meter: 7.5,
      images: img('suiting-grey-pinstripe', ['suiting-pinstripe-book']),
      variants: v('ROA-SUI-202', [['grey', 45], ['charcoal', 30], ['navy', 25]])
    }),
    Object.assign({}, base, {
      id: 'wool-220s', slug: 'wool-220s', sku: 'ROA-SUI-203',
      name_en: "220's Wool Suiting", name_ar: 'صوف بدلات 220’s',
      description_en: "Fine suiting with a \"220's WOOL\" woven selvedge, in a blue-grey melange. Shown here beside our lilac shirting.",
      description_ar: 'قماش بدلات ناعم بحاشية منسوج عليها «220’s WOOL» بلون أزرق رمادي. يظهر هنا بجانب قماش القمصان الليلكي.',
      category: 'suiting', collections: ['tailoring', 'luxury'], fabric_type: 'twill', material: 'wool', pattern: 'solid',
      texture_en: 'Fine, smooth melange', texture_ar: 'ملمس ناعم متدرج', use_en: 'Suits, jackets', use_ar: 'بدلات، جاكيتات',
      care_en: 'Dry clean only.', care_ar: 'تنظيف جاف فقط.',
      origin: null, width_cm: 150, weight_gsm: null, price_per_meter: 12,
      images: img('wool-220s-blue', ['shirting-lilac-navy']),
      variants: v('ROA-SUI-203', [['indigo', 40], ['grey', 35]])
    }),
    Object.assign({}, base, {
      id: 'cotton-shirting', slug: 'cotton-shirting', sku: 'ROA-COT-301',
      name_en: 'Shirting Fabric', name_ar: 'قماش قمصان',
      description_en: 'A soft, fine-weave shirting shown in lilac against navy suiting — ideal for shirts under a suit or bisht.',
      description_ar: 'قماش قمصان ناعم بنسيج دقيق، يظهر باللون الليلكي مع قماش بدلات كحلي؛ مثالي للقمصان تحت البدلة أو البشت.',
      category: 'cotton', collections: ['tailoring', 'everyday'], fabric_type: 'plain', material: 'cotton', pattern: 'solid',
      texture_en: 'Soft, fine weave', texture_ar: 'نسيج دقيق وناعم', use_en: 'Shirts', use_ar: 'قمصان',
      care_en: 'Ask us for care advice.', care_ar: 'اسألنا عن طريقة العناية.',
      origin: null, width_cm: 147, weight_gsm: null, price_per_meter: 2.75,
      images: img('shirting-lilac-suiting', ['shirting-lilac-navy']),
      variants: v('ROA-COT-301', [['lilac', 20], ['white', 60], ['skyblue', 50]])
    })
  );
})();
