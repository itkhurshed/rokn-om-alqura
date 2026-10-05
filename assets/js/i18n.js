/* ==========================================================================
   i18n — English / Arabic (RTL) interface strings
   ========================================================================== */
window.ROKN = window.ROKN || {};

ROKN.i18n = {
  en: {
    dir: 'ltr', langName: 'English',
    announce: 'Premium Fabrics in Kuwait', callUs: 'Call', skip: 'Skip to content',
    tagline: 'Premium Fabrics for Elegant Style', tagline2: 'Quality Fabrics. Timeless Elegance.',
    nav: { home: 'Home', shop: 'Shop', collections: 'Collections', about: 'About Us', contact: 'Contact', categories: 'Categories' },
    icons: { search: 'Search', account: 'Account', wishlist: 'Wishlist', cart: 'Cart', menu: 'Menu', close: 'Close' },
    hero: {
      eyebrow: 'Fabric Store · Kuwait City',
      title: 'Premium Fabrics for Elegant Style',
      text: 'Discover carefully selected fabrics designed for elegance, comfort and timeless style.',
      cta1: 'Shop Fabrics', cta2: 'Explore Collections', note: 'Sold by the metre · Delivery across Kuwait'
    },
    trust: [
      ['Premium Quality', 'Fabrics chosen for hand, weight and colour.'],
      ['Wide Fabric Selection', 'From everyday cotton to bridal satin.'],
      ['Trusted Local Store', 'Visit us on Mubarak Al Kabeer St.'],
      ['Customer Support', 'Advice by phone and WhatsApp.']
    ],
    sections: {
      catEyebrow: 'Shop by Category', catTitle: 'Find the right cloth', viewAllCats: 'View All Categories',
      colEyebrow: 'Collections', colTitle: 'Explore Our Collections', explore: 'Explore',
      bestEyebrow: 'Most loved', bestTitle: 'Best Selling Fabrics', viewAll: 'View all fabrics',
      newTitle: 'New Arrivals',
      guideEyebrow: 'Buying by the metre', guideTitle: 'How much fabric do you need?',
      guideText: 'Typical lengths for 140–150 cm wide fabric. Exact needs depend on size, cut and pattern matching — ask us and we will help you calculate.',
      guide: [['Dishdasha / Kandura', '3.5 – 4 m'], ['Abaya', '3 – 3.5 m'], ['Evening dress', '3 – 5 m'], ['Two-piece suit', '3 – 3.5 m'], ['Shirt', '1.8 – 2.2 m'], ['Sheila / scarf', '1.8 – 2 m']],
      guideCta: 'Ask on WhatsApp',
      visitEyebrow: 'Visit the store', visitTitle: 'See and feel every fabric in person',
      visitText: 'Colours on screen can vary. Visit our store in Kuwait City to compare fabrics side by side, or send us a message and we will share swatch photos in daylight.',
      directions: 'Get Directions'
    },
    product: {
      perMeter: '/ m', perMeterLong: 'per metre', colors: 'Available Colours', color: 'Colour', addToCart: 'Add to Cart',
      quickView: 'Quick View', buyNow: 'Buy Now', wishlistAdd: 'Add to wishlist', wishlistRemove: 'Remove from wishlist',
      inStock: 'In stock', lowStock: 'Only {n} m left', outOfStock: 'Out of stock', availability: 'Availability',
      quantity: 'Quantity (metres)', customQty: 'Custom length', meters: 'm', metersLong: 'metres',
      total: 'Total for {q} m', needHelp: 'Need Help Choosing?', needHelpText: 'Send us a message and we will help you pick the right fabric, colour and length.',
      whatsapp: 'Contact us on WhatsApp', details: 'Fabric Details', description: 'Description', specs: 'Specifications',
      care: 'Care', delivery: 'Delivery & Returns',
      deliveryText: 'Delivery across Kuwait, usually within 1–2 working days. Free standard delivery on orders over KWD {free}. Cut fabric can be returned only if faulty — see our returns policy.',
      reviews: 'Customer Reviews', basedOn: 'based on {n} reviews', verified: 'Verified Purchase', writeReview: 'Write a Review',
      sampleReviews: 'Sample reviews shown for preview. Real customer reviews will appear here.',
      reviewThanks: 'Thank you. Your review will appear after moderation.', yourRating: 'Your rating', yourReview: 'Your review', submitReview: 'Submit Review',
      related: 'You may also like', sku: 'SKU', selectColor: 'Select colour', zoom: 'Open full view', viewDetails: 'View full details',
      views: { drape: 'Drape', closeup: 'Close-up texture', folded: 'Folded', variations: 'Colour range' },
      added: 'Added to your cart', viewCart: 'View cart', sampleNote: 'Sample product for preview',
      soldOutMsg: 'This colour is sold out. Choose another colour or message us for restock dates.'
    },
    specs: {
      fabricType: 'Fabric Type', composition: 'Material / Composition', width: 'Width', weight: 'Weight', texture: 'Texture',
      stretch: 'Stretch', opacity: 'Opacity', use: 'Recommended Use', care: 'Care Instructions', origin: 'Country of Origin',
      color: 'Colour', pattern: 'Pattern', sku: 'SKU', category: 'Category'
    },
    badges: { new: 'New', bestseller: 'Best Seller', limited: 'Limited', sale: 'Sale' },
    shop: {
      title: 'All Fabrics', intro: 'Every fabric is sold by the metre and cut to your length.', results: '{n} fabrics',
      filters: 'Filters', sort: 'Sort by', clear: 'Clear all', apply: 'Show {n}',
      sorts: { featured: 'Featured', newest: 'Newest', priceAsc: 'Price: Low to High', priceDesc: 'Price: High to Low', best: 'Best Selling' },
      f: { category: 'Category', fabricType: 'Fabric Type', color: 'Colour', price: 'Price per metre', material: 'Material', pattern: 'Pattern', availability: 'Availability', collection: 'Collection' },
      inStockOnly: 'In stock only', upTo: 'Up to KWD {n}',
      empty: 'No fabrics match these filters.', emptyHint: 'Try removing a filter, or ask us — we may have it in store.',
      searchFor: 'Results for “{q}”'
    },
    search: {
      placeholder: 'Search fabrics, materials, colours...', title: 'Search', popular: 'Popular searches',
      terms: ['Linen', 'Silk', 'Abaya', 'Velvet', 'Black', 'Embroidered'],
      none: 'No fabrics found for “{q}”.', noneHint: 'Check the spelling, try a material like “cotton”, or a colour like “navy”.',
      seeAll: 'See all {n} results', category: 'Category'
    },
    cart: {
      title: 'Shopping Cart', empty: 'Your cart is empty', emptyText: 'Browse our fabrics and add the lengths you need.',
      product: 'Product', price: 'Price', qty: 'Metres', subtotal: 'Subtotal', remove: 'Remove', moveToWishlist: 'Save for later',
      summary: 'Order Summary', shipping: 'Shipping', discount: 'Discount', total: 'Total', free: 'Free',
      calcAtCheckout: 'Calculated at checkout', coupon: 'Discount code', applyCoupon: 'Apply', couponApplied: 'Code {c} applied',
      couponInvalid: 'This code is not valid.', couponMin: 'This code needs a subtotal of KWD {n} or more.', removeCoupon: 'Remove code',
      checkout: 'Proceed to Checkout', continue: 'Continue shopping', freeLeft: 'Add KWD {n} more for free delivery',
      freeReached: 'Your order qualifies for free standard delivery', secure: 'Secure checkout'
    },
    checkout: {
      title: 'Checkout', secure: 'Secure Checkout', contact: 'Contact Information', address: 'Delivery Address',
      shipping: 'Delivery Method', payment: 'Payment', placeOrder: 'Place Order', review: 'Order Summary',
      fullName: 'Full Name', phone: 'Phone', email: 'Email', country: 'Country', city: 'Governorate / City', area: 'Area',
      block: 'Block', street: 'Street', avenue: 'Avenue (optional)', building: 'Building / House', floor: 'Floor', apartment: 'Apartment', notes: 'Delivery notes (optional)',
      kuwait: 'Kuwait', select: 'Select…',
      methods: { standard: 'Standard Delivery', express: 'Express Delivery', pickup: 'Store Pickup' },
      pay: { knet: 'KNET', card: 'Credit / Debit Card', applepay: 'Apple Pay', cod: 'Cash on Delivery' },
      payNote: { knet: 'You will be redirected to the secure KNET payment page.', card: 'Visa and Mastercard, processed on a secure payment page.', applepay: 'Pay with Apple Pay on supported devices.', cod: 'Pay in cash or by KNET machine when your order arrives.' },
      required: 'This field is required.', invalidPhone: 'Enter a valid Kuwaiti mobile number (8 digits).', invalidEmail: 'Enter a valid email address.',
      fixErrors: 'Please check the highlighted fields.', agree: 'By placing your order you agree to our Terms & Conditions and Privacy Policy.',
      sslNote: 'Your details are protected with encrypted connection.', back: 'Back to cart'
    },
    order: {
      thanks: 'Thank you for your order', number: 'Order number', confirmText: 'We have received your order and will contact you on {phone} to confirm delivery.',
      preview: 'Preview mode: no payment was taken and no order was sent to the store.', track: 'Track Order', continue: 'Continue Shopping'
    },
    wishlist: { title: 'Wishlist', empty: 'Your wishlist is empty', emptyText: 'Tap the heart on any fabric to save it here.', moveAll: 'Add all to cart' },
    account: {
      title: 'My Account', signIn: 'Sign In', register: 'Create Account', email: 'Email', password: 'Password', name: 'Full Name', phone: 'Phone',
      forgot: 'Forgot password?', welcome: 'Welcome, {name}', orders: 'My Orders', addresses: 'Saved Addresses', details: 'Account Details', signOut: 'Sign Out',
      noOrders: 'You have not placed any orders yet.', noAddress: 'No saved addresses yet. Your delivery address will be saved at checkout.',
      demoNote: 'Preview: accounts are stored only in this browser until the store backend is connected.',
      date: 'Date', status: 'Status', total: 'Total', view: 'Track'
    },
    track: {
      title: 'Order Tracking', intro: 'Enter your order number and the phone number used at checkout.', number: 'Order number', phone: 'Phone',
      submit: 'Track Order', notFound: 'We could not find an order with these details. Check the number, or contact us on WhatsApp.',
      steps: ['Order placed', 'Confirmed', 'Cutting & packing', 'Out for delivery', 'Delivered'], placed: 'Placed on {d}'
    },
    about: {
      title: 'About Rokn Om Alqura',
      lead: 'Rokn Om Alqura is a textile and fabric store based in Kuwait City, offering a carefully selected range of fabrics for customers looking for quality, elegance and variety.',
      storyT: 'Our Story',
      story: 'Rokn means “corner” — and our store is exactly that: a dedicated corner of Kuwait City for people who love good cloth. Whether you are planning a dishdasha for Eid, an abaya for everyday, a gown for a wedding or new cushions for the majlis, we help you choose the fabric, colour and length with care.',
      valuesT: 'Our Values',
      values: [
        ['Quality', 'We judge every fabric by its hand, weight, colour fastness and how it behaves after sewing.'],
        ['Variety', 'From light cottons and linens to silks, velvets, embroidery and heritage weaves — in a wide range of colours.'],
        ['Customer Service', 'Honest advice in Arabic and English, in store, by phone and on WhatsApp.']
      ],
      ctaT: 'Come and feel the difference', ctaText: 'Fabric is best chosen by touch. Visit our store or send us a message for daylight swatch photos.'
    },
    contact: {
      title: 'Visit Our Store', intro: 'We would love to help you find the right fabric.', address: 'Address', phone: 'Phone', whatsapp: 'WhatsApp',
      hours: 'Opening hours', hoursText: 'Call or message us for today’s opening hours.',
      call: 'Call Us', chat: 'Chat on WhatsApp', copy: 'Copy', copied: 'Copied',
      formT: 'Send us a message', name: 'Name', email: 'Email', phoneF: 'Phone', message: 'Message', send: 'Send Message',
      ready: 'Your message is ready. Tap below to send it to us on WhatsApp so we can reply right away.', sendWa: 'Send on WhatsApp',
      map: 'Open in Google Maps', mapTitle: 'Store location map'
    },
    wa: { cta: 'Chat With Us on WhatsApp', short: 'WhatsApp', hello: 'Hello Rokn Om Alqura, I have a question about your fabrics.', about: 'Hello, I am interested in {p} ({c}). Could you help me?' },
    footer: {
      blurb: 'Premium fabrics and textiles in Kuwait.', shop: 'Shop', allFabrics: 'All Fabrics', collections: 'Collections', best: 'Best Sellers', newArr: 'New Arrivals',
      service: 'Customer Service', contactUs: 'Contact Us', shipping: 'Shipping', returns: 'Returns', faq: 'FAQ', tracking: 'Order Tracking',
      contact: 'Contact', rights: '© 2026 Rokn Om Alqura. All Rights Reserved.', privacy: 'Privacy Policy', terms: 'Terms & Conditions',
      pay: 'We accept', sample: 'Products, prices and reviews currently shown are sample content for preview.'
    },
    pages: { faq: 'Frequently Asked Questions', shipping: 'Shipping & Delivery', returns: 'Returns & Exchange', privacy: 'Privacy Policy', terms: 'Terms & Conditions', categories: 'Shop by Category', collections: 'Our Collections', updated: 'Last updated: October 2026' },
    crumbs: { home: 'Home' },
    common: { back: 'Back', close: 'Close', toast: 'Done', notFound: 'Page not found', notFoundText: 'The page you are looking for does not exist.', goHome: 'Back to home', fabrics: '{n} fabrics', from: 'From' },
    meta: {
      home: ['Rokn Om Alqura | Premium Fabrics & Textiles in Kuwait', 'Shop premium fabrics and textiles at Rokn Om Alqura in Kuwait City. Discover elegant fabrics, quality materials and a wide selection for every style.'],
      shop: ['Shop All Fabrics | Rokn Om Alqura Kuwait', 'Browse linen, silk, cotton, satin, velvet, chiffon, abaya and embroidered fabrics sold by the metre at our fabric shop in Kuwait City.'],
      about: ['About Us | Rokn Om Alqura Fabric Store Kuwait', 'Rokn Om Alqura is a textile and fabric store in Kuwait City offering quality, elegance and variety.'],
      contact: ['Contact & Directions | Rokn Om Alqura Kuwait City', 'Visit our fabric store on Mubarak Al Kabeer St, Kuwait City. Call or WhatsApp +965 9735 8288.']
    }
  },

  ar: {
    dir: 'rtl', langName: 'العربية',
    announce: 'أقمشة فاخرة في الكويت', callUs: 'اتصل', skip: 'انتقل إلى المحتوى',
    tagline: 'أقمشة فاخرة لأناقة استثنائية', tagline2: 'جودة في القماش، وأناقة لا تزول.',
    nav: { home: 'الرئيسية', shop: 'المتجر', collections: 'المجموعات', about: 'من نحن', contact: 'تواصل معنا', categories: 'الأقسام' },
    icons: { search: 'بحث', account: 'حسابي', wishlist: 'المفضلة', cart: 'السلة', menu: 'القائمة', close: 'إغلاق' },
    hero: {
      eyebrow: 'متجر أقمشة · مدينة الكويت',
      title: 'أقمشة فاخرة لأناقة استثنائية',
      text: 'اكتشف تشكيلة مختارة بعناية من الأقمشة التي تجمع بين الأناقة والجودة والراحة.',
      cta1: 'تسوّق الأقمشة', cta2: 'اكتشف المجموعات', note: 'البيع بالمتر · توصيل لجميع مناطق الكويت'
    },
    trust: [
      ['منتجات عالية الجودة', 'أقمشة مختارة بعناية من حيث الملمس والوزن واللون.'],
      ['تشكيلة واسعة من الأقمشة', 'من القطن اليومي إلى ساتان الأعراس.'],
      ['متجر موثوق في الكويت', 'زورونا في شارع مبارك الكبير.'],
      ['خدمة عملاء مميزة', 'استشارة عبر الهاتف والواتساب.']
    ],
    sections: {
      catEyebrow: 'تسوّق حسب القسم', catTitle: 'اختر القماش المناسب', viewAllCats: 'عرض جميع الأقسام',
      colEyebrow: 'المجموعات', colTitle: 'اكتشف مجموعاتنا', explore: 'اكتشف',
      bestEyebrow: 'الأكثر طلبًا', bestTitle: 'الأقمشة الأكثر مبيعًا', viewAll: 'عرض جميع الأقمشة',
      newTitle: 'وصل حديثًا',
      guideEyebrow: 'الشراء بالمتر', guideTitle: 'كم مترًا تحتاج؟',
      guideText: 'أطوال تقريبية لقماش بعرض ١٤٠–١٥٠ سم. يختلف الطول المطلوب حسب المقاس والتصميم وتطابق النقشة، وسنساعدك في حسابه بدقة.',
      guide: [['دشداشة / كندورة', '٣٫٥ – ٤ م'], ['عباية', '٣ – ٣٫٥ م'], ['فستان سهرة', '٣ – ٥ م'], ['بدلة قطعتين', '٣ – ٣٫٥ م'], ['قميص', '١٫٨ – ٢٫٢ م'], ['شيلة / وشاح', '١٫٨ – ٢ م']],
      guideCta: 'اسألنا عبر واتساب',
      visitEyebrow: 'زوروا المتجر', visitTitle: 'المس القماش وشاهده بنفسك',
      visitText: 'قد تختلف الألوان قليلًا على الشاشة. زورونا في مدينة الكويت لمقارنة الأقمشة جنبًا إلى جنب، أو راسلونا لنرسل لكم صور العينات في ضوء النهار.',
      directions: 'الاتجاهات'
    },
    product: {
      perMeter: '/ م', perMeterLong: 'للمتر', colors: 'الألوان المتوفرة', color: 'اللون', addToCart: 'أضف إلى السلة',
      quickView: 'نظرة سريعة', buyNow: 'اشترِ الآن', wishlistAdd: 'أضف إلى المفضلة', wishlistRemove: 'إزالة من المفضلة',
      inStock: 'متوفر', lowStock: 'متبقٍ {n} م فقط', outOfStock: 'نفدت الكمية', availability: 'التوفر',
      quantity: 'الكمية (بالمتر)', customQty: 'طول مخصص', meters: 'م', metersLong: 'متر',
      total: 'الإجمالي لـ {q} م', needHelp: 'تحتاج مساعدة في الاختيار؟', needHelpText: 'راسلنا وسنساعدك في اختيار القماش واللون والطول المناسب.',
      whatsapp: 'تواصل معنا عبر واتساب', details: 'تفاصيل القماش', description: 'الوصف', specs: 'المواصفات',
      care: 'العناية', delivery: 'التوصيل والإرجاع',
      deliveryText: 'نوصل لجميع مناطق الكويت عادة خلال ١–٢ يوم عمل. التوصيل العادي مجاني للطلبات التي تتجاوز {free} د.ك. لا يمكن إرجاع القماش المقصوص إلا في حال وجود عيب، راجع سياسة الإرجاع.',
      reviews: 'آراء العملاء', basedOn: 'بناءً على {n} تقييم', verified: 'شراء موثّق', writeReview: 'اكتب تقييمًا',
      sampleReviews: 'تقييمات تجريبية للعرض فقط، وستظهر هنا تقييمات العملاء الحقيقية.',
      reviewThanks: 'شكرًا لك. سيظهر تقييمك بعد المراجعة.', yourRating: 'تقييمك', yourReview: 'رأيك', submitReview: 'إرسال التقييم',
      related: 'قد يعجبك أيضًا', sku: 'رمز المنتج', selectColor: 'اختر اللون', zoom: 'عرض بالحجم الكامل', viewDetails: 'عرض التفاصيل الكاملة',
      views: { drape: 'الانسدال', closeup: 'الملمس عن قرب', folded: 'مطوي', variations: 'جميع الألوان' },
      added: 'تمت الإضافة إلى السلة', viewCart: 'عرض السلة', sampleNote: 'منتج تجريبي للعرض',
      soldOutMsg: 'نفد هذا اللون. اختر لونًا آخر أو راسلنا لمعرفة موعد توفره.'
    },
    specs: {
      fabricType: 'نوع النسيج', composition: 'الخامة / التركيب', width: 'العرض', weight: 'الوزن', texture: 'الملمس',
      stretch: 'المرونة', opacity: 'الشفافية', use: 'الاستخدام المقترح', care: 'تعليمات العناية', origin: 'بلد المنشأ',
      color: 'اللون', pattern: 'النقشة', sku: 'رمز المنتج', category: 'القسم'
    },
    badges: { new: 'جديد', bestseller: 'الأكثر مبيعًا', limited: 'كمية محدودة', sale: 'تخفيض' },
    shop: {
      title: 'جميع الأقمشة', intro: 'جميع الأقمشة تُباع بالمتر وتُقص حسب الطول الذي تحتاجه.', results: '{n} قماش',
      filters: 'التصفية', sort: 'الترتيب', clear: 'مسح الكل', apply: 'عرض {n}',
      sorts: { featured: 'المميّزة', newest: 'الأحدث', priceAsc: 'السعر: من الأقل للأعلى', priceDesc: 'السعر: من الأعلى للأقل', best: 'الأكثر مبيعًا' },
      f: { category: 'القسم', fabricType: 'نوع النسيج', color: 'اللون', price: 'سعر المتر', material: 'الخامة', pattern: 'النقشة', availability: 'التوفر', collection: 'المجموعة' },
      inStockOnly: 'المتوفر فقط', upTo: 'حتى {n} د.ك',
      empty: 'لا توجد أقمشة تطابق هذه الخيارات.', emptyHint: 'جرّب إزالة أحد الفلاتر، أو اسألنا فقد يكون متوفرًا في المتجر.',
      searchFor: 'نتائج البحث عن «{q}»'
    },
    search: {
      placeholder: 'ابحث عن الأقمشة والخامات والألوان...', title: 'البحث', popular: 'عمليات بحث شائعة',
      terms: ['كتان', 'حرير', 'عباية', 'مخمل', 'أسود', 'مطرّز'],
      none: 'لم نجد أقمشة تطابق «{q}».', noneHint: 'تأكد من الإملاء، أو جرّب اسم خامة مثل «قطن» أو لون مثل «كحلي».',
      seeAll: 'عرض جميع النتائج ({n})', category: 'القسم'
    },
    cart: {
      title: 'سلة التسوق', empty: 'سلتك فارغة', emptyText: 'تصفّح أقمشتنا وأضف الأطوال التي تحتاجها.',
      product: 'المنتج', price: 'السعر', qty: 'الأمتار', subtotal: 'المجموع الفرعي', remove: 'إزالة', moveToWishlist: 'احفظه لاحقًا',
      summary: 'ملخص الطلب', shipping: 'التوصيل', discount: 'الخصم', total: 'الإجمالي', free: 'مجاني',
      calcAtCheckout: 'يُحسب عند إتمام الطلب', coupon: 'كود الخصم', applyCoupon: 'تطبيق', couponApplied: 'تم تطبيق الكود {c}',
      couponInvalid: 'هذا الكود غير صالح.', couponMin: 'يتطلب هذا الكود مجموعًا لا يقل عن {n} د.ك.', removeCoupon: 'إزالة الكود',
      checkout: 'إتمام الطلب', continue: 'متابعة التسوق', freeLeft: 'أضف {n} د.ك للحصول على توصيل مجاني',
      freeReached: 'طلبك مؤهل للتوصيل العادي المجاني', secure: 'دفع آمن'
    },
    checkout: {
      title: 'إتمام الطلب', secure: 'دفع آمن', contact: 'معلومات التواصل', address: 'عنوان التوصيل',
      shipping: 'طريقة التوصيل', payment: 'طريقة الدفع', placeOrder: 'تأكيد الطلب', review: 'ملخص الطلب',
      fullName: 'الاسم الكامل', phone: 'رقم الهاتف', email: 'البريد الإلكتروني', country: 'الدولة', city: 'المحافظة / المدينة', area: 'المنطقة',
      block: 'القطعة', street: 'الشارع', avenue: 'الجادة (اختياري)', building: 'المبنى / المنزل', floor: 'الدور', apartment: 'الشقة', notes: 'ملاحظات التوصيل (اختياري)',
      kuwait: 'الكويت', select: 'اختر…',
      methods: { standard: 'توصيل عادي', express: 'توصيل سريع', pickup: 'الاستلام من المتجر' },
      pay: { knet: 'كي نت', card: 'بطاقة ائتمان / خصم', applepay: 'Apple Pay', cod: 'الدفع عند الاستلام' },
      payNote: { knet: 'سيتم تحويلك إلى صفحة الدفع الآمنة عبر كي نت.', card: 'فيزا وماستركارد عبر صفحة دفع آمنة.', applepay: 'ادفع عبر Apple Pay على الأجهزة المدعومة.', cod: 'ادفع نقدًا أو عبر جهاز كي نت عند استلام الطلب.' },
      required: 'هذا الحقل مطلوب.', invalidPhone: 'أدخل رقم هاتف كويتي صحيح (٨ أرقام).', invalidEmail: 'أدخل بريدًا إلكترونيًا صحيحًا.',
      fixErrors: 'يرجى مراجعة الحقول المحددة.', agree: 'بتأكيد الطلب، فإنك توافق على الشروط والأحكام وسياسة الخصوصية.',
      sslNote: 'بياناتك محمية عبر اتصال مشفّر.', back: 'العودة إلى السلة'
    },
    order: {
      thanks: 'شكرًا لطلبك', number: 'رقم الطلب', confirmText: 'استلمنا طلبك وسنتواصل معك على الرقم {phone} لتأكيد موعد التوصيل.',
      preview: 'وضع المعاينة: لم يتم خصم أي مبلغ ولم يُرسل الطلب إلى المتجر.', track: 'تتبع الطلب', continue: 'متابعة التسوق'
    },
    wishlist: { title: 'المفضلة', empty: 'قائمة المفضلة فارغة', emptyText: 'اضغط على رمز القلب في أي قماش لحفظه هنا.', moveAll: 'أضف الكل إلى السلة' },
    account: {
      title: 'حسابي', signIn: 'تسجيل الدخول', register: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور', name: 'الاسم الكامل', phone: 'رقم الهاتف',
      forgot: 'نسيت كلمة المرور؟', welcome: 'أهلًا {name}', orders: 'طلباتي', addresses: 'العناوين المحفوظة', details: 'بيانات الحساب', signOut: 'تسجيل الخروج',
      noOrders: 'لم تقم بأي طلب حتى الآن.', noAddress: 'لا توجد عناوين محفوظة بعد، وسيُحفظ عنوانك عند إتمام الطلب.',
      demoNote: 'معاينة: تُحفظ الحسابات في هذا المتصفح فقط حتى يتم ربط نظام المتجر.',
      date: 'التاريخ', status: 'الحالة', total: 'الإجمالي', view: 'تتبع'
    },
    track: {
      title: 'تتبع الطلب', intro: 'أدخل رقم الطلب ورقم الهاتف المستخدم عند الشراء.', number: 'رقم الطلب', phone: 'رقم الهاتف',
      submit: 'تتبع الطلب', notFound: 'لم نعثر على طلب بهذه البيانات. تأكد من الرقم أو تواصل معنا عبر واتساب.',
      steps: ['تم استلام الطلب', 'تم التأكيد', 'القص والتغليف', 'في الطريق إليك', 'تم التوصيل'], placed: 'تاريخ الطلب {d}'
    },
    about: {
      title: 'عن ركن أم القرى',
      lead: 'ركن أم القرى هو متجر متخصص في الأقمشة والمنسوجات في مدينة الكويت، نقدم تشكيلة مختارة بعناية من الأقمشة التي تجمع بين الجودة والأناقة والتنوع.',
      storyT: 'قصتنا',
      story: 'متجرنا ركنٌ مخصص في قلب مدينة الكويت لكل من يقدّر القماش الجيد. سواء كنت تجهّز دشداشة العيد، أو عباية للاستخدام اليومي، أو فستانًا لحفل زفاف، أو وسائد جديدة للمجلس، نساعدك في اختيار القماش واللون والطول بعناية واهتمام.',
      valuesT: 'قيمنا',
      values: [
        ['الجودة', 'نقيّم كل قماش بملمسه ووزنه وثبات لونه وطريقة تعامله بعد الخياطة.'],
        ['التنوع', 'من القطن والكتان الخفيف إلى الحرير والمخمل والتطريز والنسيج التراثي، وبألوان متعددة.'],
        ['خدمة العملاء', 'نصيحة صادقة بالعربية والإنجليزية، في المتجر وعبر الهاتف والواتساب.']
      ],
      ctaT: 'تعال واشعر بالفرق', ctaText: 'أفضل طريقة لاختيار القماش هي لمسه. زورونا في المتجر أو راسلونا لنرسل لكم صور العينات في ضوء النهار.'
    },
    contact: {
      title: 'زوروا متجرنا', intro: 'يسعدنا مساعدتك في اختيار القماش المناسب.', address: 'العنوان', phone: 'الهاتف', whatsapp: 'واتساب',
      hours: 'ساعات العمل', hoursText: 'اتصل بنا أو راسلنا لمعرفة ساعات العمل اليوم.',
      call: 'اتصل بنا', chat: 'تواصل عبر واتساب', copy: 'نسخ', copied: 'تم النسخ',
      formT: 'أرسل لنا رسالة', name: 'الاسم', email: 'البريد الإلكتروني', phoneF: 'رقم الهاتف', message: 'الرسالة', send: 'إرسال الرسالة',
      ready: 'رسالتك جاهزة. اضغط أدناه لإرسالها عبر واتساب حتى نتمكن من الرد عليك فورًا.', sendWa: 'إرسال عبر واتساب',
      map: 'فتح في خرائط Google', mapTitle: 'خريطة موقع المتجر'
    },
    wa: { cta: 'تواصل معنا عبر واتساب', short: 'واتساب', hello: 'مرحبًا ركن أم القرى، لدي استفسار عن الأقمشة.', about: 'مرحبًا، أنا مهتم بـ {p} (اللون: {c}). هل يمكنكم مساعدتي؟' },
    footer: {
      blurb: 'أقمشة ومنسوجات فاخرة في الكويت.', shop: 'المتجر', allFabrics: 'جميع الأقمشة', collections: 'المجموعات', best: 'الأكثر مبيعًا', newArr: 'وصل حديثًا',
      service: 'خدمة العملاء', contactUs: 'تواصل معنا', shipping: 'الشحن والتوصيل', returns: 'الإرجاع والاستبدال', faq: 'الأسئلة الشائعة', tracking: 'تتبع الطلب',
      contact: 'التواصل', rights: '© 2026 ركن أم القرى. جميع الحقوق محفوظة.', privacy: 'سياسة الخصوصية', terms: 'الشروط والأحكام',
      pay: 'طرق الدفع', sample: 'المنتجات والأسعار والتقييمات المعروضة حاليًا محتوى تجريبي للمعاينة.'
    },
    pages: { faq: 'الأسئلة الشائعة', shipping: 'الشحن والتوصيل', returns: 'الإرجاع والاستبدال', privacy: 'سياسة الخصوصية', terms: 'الشروط والأحكام', categories: 'تسوّق حسب القسم', collections: 'مجموعاتنا', updated: 'آخر تحديث: أكتوبر 2026' },
    crumbs: { home: 'الرئيسية' },
    common: { back: 'رجوع', close: 'إغلاق', toast: 'تم', notFound: 'الصفحة غير موجودة', notFoundText: 'الصفحة التي تبحث عنها غير موجودة.', goHome: 'العودة للرئيسية', fabrics: '{n} قماش', from: 'يبدأ من' },
    meta: {
      home: ['ركن أم القرى | أقمشة ومنسوجات فاخرة في الكويت', 'تسوّق أقمشة ومنسوجات فاخرة من ركن أم القرى في مدينة الكويت. محل أقمشة يقدم خامات عالية الجودة وتشكيلة واسعة تناسب كل الأذواق.'],
      shop: ['جميع الأقمشة | ركن أم القرى الكويت', 'تصفّح الكتان والحرير والقطن والساتان والمخمل والشيفون وأقمشة العبايات والأقمشة المطرزة بالمتر من محل أقمشة في مدينة الكويت.'],
      about: ['من نحن | ركن أم القرى للأقمشة في الكويت', 'ركن أم القرى متجر أقمشة ومنسوجات في مدينة الكويت يجمع بين الجودة والأناقة والتنوع.'],
      contact: ['تواصل معنا | ركن أم القرى مدينة الكويت', 'زوروا محل الأقمشة في شارع مبارك الكبير، مدينة الكويت. اتصلوا أو راسلونا على واتساب ‎+965 9735 8288.']
    }
  }
};

/* ---------------- v2 strings (merged into the dictionaries above) ---------------- */
(function () {
  const extra = {
    en: {
      slides: [
        { eyebrow: 'Fabric Store · Kuwait City', title: 'Premium Fabrics\nfor Timeless Elegance', text: 'Discover carefully selected fabrics for every style.', cta: 'Shop Collection' },
        { eyebrow: 'Inside our store · Kuwait City', title: 'Shelves Full of\nFine Fabric', text: 'Dishdasha cloth, suiting and fabrics for every occasion — chosen by hand on Mubarak Al Kabeer St.', cta: 'Explore Fabrics' },
        { eyebrow: 'Personal assistance', title: 'Discover Your\nPerfect Fabric', text: 'Need help choosing? Send us your idea and we will suggest fabrics, colours and lengths.', cta: 'Chat on WhatsApp' }
      ],
      slider: { prev: 'Previous slide', next: 'Next slide', goto: 'Go to slide {n}', pause: 'Pause slideshow', play: 'Play slideshow' },
      v2: {
        fabricEyebrow: 'Shop by Fabric', fabricTitle: 'Every weave, chosen by hand', products: 'products', explore: 'Explore',
        colorEyebrow: 'Shop by Colour', colorTitle: 'Find your colour', colorHint: 'Tap a swatch to see fabrics in that colour.', colorAll: 'See all {c} fabrics', colorNone: 'No fabrics in this colour right now.',
        luxEyebrow: 'The Luxury Collection', luxTitle: 'Velvet, brocade and cashmere for the occasions that matter', luxText: 'Heavy jacquards woven with metallic yarn, deep-pile velvets and soft wool-cashmere — fabrics with weight, depth and presence.', luxCta: 'Explore Luxury Collection',
        inspEyebrow: 'Fabric Inspiration', inspTitle: 'Colour pairings our customers love',
        insp: [['Emerald & Gold', 'Velvet with a gold damask brocade — for Eid and evening.'], ['Ivory & Champagne', 'Silk and satin in soft neutrals — bridal and engagement.'], ['Navy & Sand', 'Linen pairings for crisp summer tailoring.'], ['The fabric table', 'Swatches, tape and thread — plan your next piece.'], ['From cloth to garment', 'We help you choose fabrics that tailor beautifully.']],
        whyEyebrow: 'Why choose us', whyTitle: 'Why choose Rokn Om Alqura?',
        why: [['Premium Quality', 'Fabrics judged by hand, weight and colour fastness before they reach our shelves.'], ['Carefully Selected Fabrics', 'A curated range — every fabric earns its place.'], ['Wide Variety', 'From everyday cotton and dishdasha fabric to bridal lace and silk.'], ['Kuwait-Based Store', 'Visit us on Mubarak Al Kabeer St, Kuwait City.'], ['Personalized Assistance', 'Advice in Arabic and English, in store and on WhatsApp.'], ['Customer Satisfaction', 'Careful cutting, folding and packing on every order.']],
        revEyebrow: 'Customer reviews', revTitle: 'What customers say', revSample: 'Sample reviews shown for preview — real customer reviews will replace them.',
        consultEyebrow: 'WhatsApp consultation', consultTitle: 'Not sure which fabric to choose?', consultText: 'Tell us what you are making and we will suggest fabrics, colours and the length you need — or send you a physical swatch first.',
        consultSteps: ['Send a photo or idea of your design', 'We suggest fabrics, colours and metres', 'Order online or visit the store'],
        consultCta: 'Chat on WhatsApp', swatchCta: 'Request Fabric Swatches', calcCta: 'Fabric Calculator',
        visitTitle: 'Visit our store', visitText: 'See every colour in daylight, feel the weight and drape, and get advice from our team.', mapNote: 'Map preview — opens Google Maps',
        igEyebrow: '@ Instagram', igTitle: 'Follow our journey', igText: 'Fabric details, new arrivals and colour ideas.', igCta: 'Follow us on Instagram',
        igAlt: ['Fan of white and cream dishdasha fabrics', 'Numbered suiting shade card', 'YEARN 9×9 Japanese dishdasha fabric box', 'Shelves of folded fabric in our store', 'Herringbone dishdasha fabric close-up', 'Grey pinstripe suiting swatches', 'Lilac shirting with navy suiting', "220's wool suiting selvedge"],
        nlEyebrow: 'Newsletter', nlTitle: 'Discover new fabrics first', nlText: 'Subscribe for new arrivals, exclusive collections and special offers.', nlPlaceholder: 'Email address', nlCta: 'Subscribe', nlOk: 'Thank you — you will hear about new fabrics first.', nlPreview: 'Preview: saved in this browser until the email service is connected.', nlPrivacy: 'One or two emails a month. Unsubscribe any time.',
        exitTitle: 'Before you go', exitText: 'Need help choosing the right fabric? Our team can help on WhatsApp.', exitWa: 'Chat on WhatsApp', exitStay: 'Continue Shopping',
        colorsAvail: 'Available in {n} colours', colorsAvail1: 'Available in 1 colour',
        editorialTitle: 'In the collection', featured: 'Featured fabrics', allIn: 'All fabrics in this collection'
      },
      nav2: { home: 'Home', shop: 'Shop', search: 'Search', wishlist: 'Wishlist', cart: 'Cart' },
      drawer: { title: 'Your Cart', empty: 'Your cart is empty.', view: 'View Cart', checkout: 'Checkout', subtotal: 'Subtotal', note: 'Delivery calculated at checkout.', freeLeft: 'KWD {n} away from free delivery', freeOk: 'You have free standard delivery' },
      chat: { title: 'Rokn Om Alqura', status: 'WhatsApp · Kuwait', hello: 'Hello! How can we help you today?', open: 'Chat with us', close: 'Close chat',
        opts: { help: 'Help me choose a fabric', product: 'Ask about this fabric', order: 'Help with my order', swatch: 'Request a fabric swatch', visit: 'Visit the store' },
        msgs: { help: 'Hello Rokn Om Alqura, I would like help choosing a fabric.', order: 'Hello, I need help with my order.', swatch: 'Hello, I would like to request a fabric swatch.', visit: 'Hello, I would like to visit the store. What are today\'s opening hours?',
          product: 'Hello, I am interested in {p}. Please provide more details.', productColor: 'Hello, I am interested in {p} in {c}. Is it available?',
          ask: 'Hello, I am interested in {p}, {c}. I would like to know more about availability and quality.\n{url}', swatchP: 'Hello, I would like to request a physical swatch of {p} in {c}.\n{url}' } },
      pdp: { ask: 'Ask about this fabric', swatch: 'Request fabric swatch', calc: 'How much do I need?', colorsAvail: '{n} colours available', calcLine: '{p} × {q} m = {t}', fullscreen: 'Fullscreen gallery', prevImg: 'Previous image', nextImg: 'Next image', useLength: 'Use {q} m' },
      views2: { roll: 'On the roll', styled: 'Styled flat-lay', photo: 'In-store photo', label: 'Box label', range: 'Shade range' },
      calc: { title: 'How much fabric do I need?', intro: 'Choose what you are making and enter your measurements.', garment: 'I am making', width: 'Fabric width',
        g: { abaya: 'Abaya', dress: 'Dress', thobe: 'Thobe / Dishdasha', shirt: 'Shirt', skirt: 'Skirt', curtains: 'Curtains', other: 'Other' },
        length: 'Garment length (shoulder to hem), cm', skirtLen: 'Skirt length (waist to hem), cm', shirtLen: 'Shirt length (shoulder to hem), cm',
        winW: 'Window / rail width, cm', drop: 'Curtain drop, cm', panels: 'Fullness', fullness: { '1.5': 'Light (1.5×)', '2': 'Standard (2×)', '2.5': 'Full (2.5×)' },
        otherLen: 'Length per piece, cm', pieces: 'Number of pieces', result: 'Estimated amount', resultUnit: 'metres',
        note: 'Estimated amount — actual requirement may vary depending on design and tailoring.', ask: 'Confirm with us on WhatsApp',
        waMsg: 'Hello, I am making a {g} and the calculator estimated {q} m. Could you confirm the length I need?' },
      co2: { steps: ['Customer Information', 'Delivery', 'Payment', 'Review Order'], next: 'Continue', back: 'Back', edit: 'Edit', additional: 'Additional address information (optional)',
        gatewayOff: 'Preview: online payment is not connected yet — no payment will be taken. Once the store connects its payment gateway, KNET and card payments open on a secure payment page.',
        reviewItems: 'Items', deliverTo: 'Deliver to', method: 'Delivery method', payWith: 'Payment' },
      track2: { by: 'Phone or email', steps: ['Order Received', 'Processing', 'Preparing', 'Shipped', 'Delivered'] },
      acc2: { language: 'Language Preference', langHint: 'Choose the language for the website and our messages.', saveAddr: 'Save address', addAddr: 'Add address', wishlist: 'Wishlist', logout: 'Logout', addrSaved: 'Address saved' },
      filters2: { width: 'Width', flags: 'Highlights', colorFam: 'Colour', minMax: 'KWD {a} – {b}' },
      search2: { suggestions: 'Suggestions', products: 'Products', sku: 'SKU' },
      footer2: { company: 'Company', language: 'Language', follow: 'Follow us' }
    },
    ar: {
      slides: [
        { eyebrow: 'متجر أقمشة · مدينة الكويت', title: 'أقمشة فاخرة\nلأناقة لا تزول', text: 'اكتشف أقمشة مختارة بعناية تناسب كل الأذواق.', cta: 'تسوّق المجموعة' },
        { eyebrow: 'داخل متجرنا · مدينة الكويت', title: 'رفوف عامرة\nبأرقى الأقمشة', text: 'أقمشة دشاديش وبدلات وأقمشة لكل مناسبة، مختارة بعناية في شارع مبارك الكبير.', cta: 'اكتشف الأقمشة' },
        { eyebrow: 'مساعدة شخصية', title: 'اكتشف القماش\nالمثالي لك', text: 'تحتاج مساعدة في الاختيار؟ أرسل لنا فكرتك وسنقترح الأقمشة والألوان والأطوال.', cta: 'تواصل عبر واتساب' }
      ],
      slider: { prev: 'الشريحة السابقة', next: 'الشريحة التالية', goto: 'انتقل إلى الشريحة {n}', pause: 'إيقاف العرض', play: 'تشغيل العرض' },
      v2: {
        fabricEyebrow: 'تسوّق حسب نوع القماش', fabricTitle: 'كل نسيج اخترناه بعناية', products: 'منتجات', explore: 'اكتشف',
        colorEyebrow: 'تسوّق حسب اللون', colorTitle: 'اختر لونك', colorHint: 'اضغط على أي عينة لعرض الأقمشة بهذا اللون.', colorAll: 'عرض كل الأقمشة باللون {c}', colorNone: 'لا توجد أقمشة بهذا اللون حاليًا.',
        luxEyebrow: 'المجموعة الفاخرة', luxTitle: 'مخمل وبروكار وكشمير للمناسبات المهمة', luxText: 'جاكار ثقيل منسوج بخيوط معدنية، ومخمل كثيف الوبر، وصوف ممزوج بالكشمير؛ أقمشة لها وزن وعمق وحضور.', luxCta: 'اكتشف المجموعة الفاخرة',
        inspEyebrow: 'إلهام الأقمشة', inspTitle: 'تنسيقات ألوان يحبها عملاؤنا',
        insp: [['زمردي وذهبي', 'مخمل مع بروكار دمشقي ذهبي للعيد والسهرات.'], ['عاجي وشامبين', 'حرير وساتان بألوان هادئة للعرائس والملكات.'], ['كحلي ورملي', 'تنسيقات كتان لتفصيل صيفي أنيق.'], ['طاولة القماش', 'عينات وشريط قياس وخيوط؛ خطّط لقطعتك القادمة.'], ['من القماش إلى القطعة', 'نساعدك في اختيار أقمشة تتفصّل بجمال.']],
        whyEyebrow: 'لماذا نحن', whyTitle: 'لماذا تختار ركن أم القرى؟',
        why: [['جودة فاخرة', 'نقيّم الأقمشة بملمسها ووزنها وثبات لونها قبل أن تصل إلى رفوفنا.'], ['أقمشة مختارة بعناية', 'تشكيلة منتقاة؛ كل قماش يستحق مكانه.'], ['تنوع واسع', 'من القطن اليومي وأقمشة الدشاديش إلى دانتيل العرائس والحرير.'], ['متجر في الكويت', 'زورونا في شارع مبارك الكبير، مدينة الكويت.'], ['مساعدة شخصية', 'نصيحة بالعربية والإنجليزية في المتجر وعبر واتساب.'], ['رضا العملاء', 'قص وطي وتغليف بعناية في كل طلب.']],
        revEyebrow: 'آراء العملاء', revTitle: 'ماذا يقول عملاؤنا', revSample: 'تقييمات تجريبية للعرض فقط، وستحل محلها تقييمات العملاء الحقيقية.',
        consultEyebrow: 'استشارة عبر واتساب', consultTitle: 'محتار في اختيار القماش؟', consultText: 'أخبرنا بما تريد تفصيله وسنقترح عليك الأقمشة والألوان والطول المطلوب، أو نرسل لك عينة قماش أولًا.',
        consultSteps: ['أرسل صورة أو فكرة التصميم', 'نقترح الأقمشة والألوان والأمتار', 'اطلب أونلاين أو زر المتجر'],
        consultCta: 'تواصل عبر واتساب', swatchCta: 'اطلب عينات قماش', calcCta: 'حاسبة الأقمشة',
        visitTitle: 'زوروا متجرنا', visitText: 'شاهد الألوان في ضوء النهار، والمس وزن القماش وانسداله، واحصل على نصيحة فريقنا.', mapNote: 'معاينة الخريطة — تفتح خرائط Google',
        igEyebrow: '@ إنستغرام', igTitle: 'تابعوا رحلتنا', igText: 'تفاصيل الأقمشة ووصل حديثًا وأفكار للألوان.', igCta: 'تابعونا على إنستغرام',
        igAlt: ['مروحة أقمشة دشاديش بيضاء وكريمية', 'بطاقة ألوان أقمشة البدلات المرقّمة', 'علبة قماش دشاديش ياباني يارن ٩×٩', 'رفوف الأقمشة المطوية في متجرنا', 'قماش دشاديش بنقشة عظم السمكة عن قرب', 'عينات أقمشة بدلات رمادية مقلّمة', 'قماش قمصان ليلكي مع قماش بدلات كحلي', 'حاشية قماش صوف 220’s'],
        nlEyebrow: 'النشرة البريدية', nlTitle: 'اكتشف أحدث الأقمشة أولاً', nlText: 'اشترك لتصلك الأقمشة الجديدة والمجموعات الحصرية والعروض الخاصة.', nlPlaceholder: 'البريد الإلكتروني', nlCta: 'اشترك', nlOk: 'شكرًا لك، ستكون أول من يعرف بالأقمشة الجديدة.', nlPreview: 'معاينة: يُحفظ في هذا المتصفح حتى يتم ربط خدمة البريد.', nlPrivacy: 'رسالة أو رسالتان في الشهر، ويمكنك إلغاء الاشتراك في أي وقت.',
        exitTitle: 'قبل أن تغادر', exitText: 'تحتاج مساعدة في اختيار القماش المناسب؟ فريقنا جاهز عبر واتساب.', exitWa: 'تواصل عبر واتساب', exitStay: 'متابعة التسوق',
        colorsAvail: 'متوفر بـ {n} ألوان', colorsAvail1: 'متوفر بلون واحد',
        editorialTitle: 'من المجموعة', featured: 'أقمشة مميزة', allIn: 'كل أقمشة المجموعة'
      },
      nav2: { home: 'الرئيسية', shop: 'المتجر', search: 'بحث', wishlist: 'المفضلة', cart: 'السلة' },
      drawer: { title: 'سلتك', empty: 'سلتك فارغة.', view: 'عرض السلة', checkout: 'إتمام الطلب', subtotal: 'المجموع الفرعي', note: 'تُحسب رسوم التوصيل عند إتمام الطلب.', freeLeft: 'متبقٍ {n} د.ك للتوصيل المجاني', freeOk: 'حصلت على التوصيل العادي المجاني' },
      chat: { title: 'ركن أم القرى', status: 'واتساب · الكويت', hello: 'مرحبًا! كيف يمكننا مساعدتك اليوم؟', open: 'تواصل معنا', close: 'إغلاق المحادثة',
        opts: { help: 'ساعدني في اختيار قماش', product: 'استفسر عن هذا القماش', order: 'مساعدة بخصوص طلبي', swatch: 'طلب عينة قماش', visit: 'زيارة المتجر' },
        msgs: { help: 'مرحبًا ركن أم القرى، أرغب في المساعدة لاختيار قماش.', order: 'مرحبًا، أحتاج مساعدة بخصوص طلبي.', swatch: 'مرحبًا، أرغب في طلب عينة قماش.', visit: 'مرحبًا، أرغب في زيارة المتجر. ما ساعات العمل اليوم؟',
          product: 'مرحبًا، أنا مهتم بـ {p}. أرجو تزويدي بمزيد من التفاصيل.', productColor: 'مرحبًا، أنا مهتم بـ {p} باللون {c}. هل هو متوفر؟',
          ask: 'مرحبًا، أنا مهتم بـ {p}، اللون {c}. أرغب في معرفة المزيد عن التوفر والجودة.\n{url}', swatchP: 'مرحبًا، أرغب في طلب عينة من {p} باللون {c}.\n{url}' } },
      pdp: { ask: 'استفسر عن هذا القماش', swatch: 'اطلب عينة قماش', calc: 'كم مترًا أحتاج؟', colorsAvail: '{n} ألوان متوفرة', calcLine: '{p} × {q} م = {t}', fullscreen: 'عرض المعرض بملء الشاشة', prevImg: 'الصورة السابقة', nextImg: 'الصورة التالية', useLength: 'استخدم {q} م' },
      views2: { roll: 'على اللفة', styled: 'تنسيق مع الأدوات', photo: 'صورة من المتجر', label: 'ملصق العلبة', range: 'درجات الألوان' },
      calc: { title: 'كم مترًا أحتاج؟', intro: 'اختر ما تريد تفصيله وأدخل المقاسات.', garment: 'أريد تفصيل', width: 'عرض القماش',
        g: { abaya: 'عباية', dress: 'فستان', thobe: 'ثوب / دشداشة', shirt: 'قميص', skirt: 'تنورة', curtains: 'ستائر', other: 'أخرى' },
        length: 'طول القطعة (من الكتف إلى الأسفل) بالسم', skirtLen: 'طول التنورة (من الخصر إلى الأسفل) بالسم', shirtLen: 'طول القميص (من الكتف إلى الأسفل) بالسم',
        winW: 'عرض النافذة / السكة بالسم', drop: 'طول الستارة بالسم', panels: 'الكثافة', fullness: { '1.5': 'خفيفة (١٫٥×)', '2': 'عادية (٢×)', '2.5': 'كثيفة (٢٫٥×)' },
        otherLen: 'طول القطعة الواحدة بالسم', pieces: 'عدد القطع', result: 'الكمية التقديرية', resultUnit: 'متر',
        note: 'كمية تقديرية — قد تختلف الكمية الفعلية حسب التصميم والتفصيل.', ask: 'تأكد معنا عبر واتساب',
        waMsg: 'مرحبًا، أريد تفصيل {g} وقدّرت الحاسبة {q} م. هل يمكنكم تأكيد الطول المطلوب؟' },
      co2: { steps: ['معلومات العميل', 'التوصيل', 'الدفع', 'مراجعة الطلب'], next: 'متابعة', back: 'رجوع', edit: 'تعديل', additional: 'معلومات إضافية عن العنوان (اختياري)',
        gatewayOff: 'معاينة: الدفع الإلكتروني غير مفعّل بعد ولن يتم خصم أي مبلغ. عند ربط بوابة الدفع، تُفتح مدفوعات كي نت والبطاقات في صفحة دفع آمنة.',
        reviewItems: 'المنتجات', deliverTo: 'التوصيل إلى', method: 'طريقة التوصيل', payWith: 'الدفع' },
      track2: { by: 'رقم الهاتف أو البريد الإلكتروني', steps: ['تم استلام الطلب', 'قيد المعالجة', 'قيد التجهيز', 'تم الشحن', 'تم التوصيل'] },
      acc2: { language: 'اللغة المفضلة', langHint: 'اختر لغة الموقع والرسائل.', saveAddr: 'حفظ العنوان', addAddr: 'إضافة عنوان', wishlist: 'المفضلة', logout: 'تسجيل الخروج', addrSaved: 'تم حفظ العنوان' },
      filters2: { width: 'العرض', flags: 'مميزات', colorFam: 'اللون', minMax: '{a} – {b} د.ك' },
      search2: { suggestions: 'اقتراحات', products: 'المنتجات', sku: 'رمز المنتج' },
      footer2: { company: 'عن المتجر', language: 'اللغة', follow: 'تابعونا' }
    }
  };
  const merge = (a, b) => { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) { a[k] = a[k] || {}; merge(a[k], b[k]); } else a[k] = b[k]; } };
  merge(ROKN.i18n.en, extra.en); merge(ROKN.i18n.ar, extra.ar);
  /* refinements to v1 strings */
  ROKN.i18n.en.specs.material = 'Material'; ROKN.i18n.ar.specs.material = 'الخامة';
  ROKN.i18n.en.product.outOfStock = 'Out of stock'; ROKN.i18n.ar.product.outOfStock = 'غير متوفر';
  ROKN.i18n.ar.product.inStock = 'متوفر'; ROKN.i18n.en.product.inStock = 'Available';
  ROKN.i18n.en.badges.new = 'New'; ROKN.i18n.ar.badges.new = 'جديد';
  ROKN.i18n.en.product.views.closeup = 'Texture close-up'; ROKN.i18n.ar.product.views.closeup = 'الملمس عن قرب';
  ROKN.i18n.en.wa.cta = 'Chat With Us on WhatsApp'; ROKN.i18n.ar.wa.cta = 'تواصل معنا عبر واتساب';
})();
