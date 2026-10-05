/* ==========================================================================
   CONTENT PAGES — FAQ and policies (EN / AR)
   REVIEW before launch: these are well-structured starting drafts based on
   common practice for fabric retailers in Kuwait. Fees and timings read from
   ROKN.config so they stay consistent. Have the business confirm each policy.
   ========================================================================== */
window.ROKN = window.ROKN || {};

ROKN.content = {
  faq: [
    { q: { en: 'Do you sell fabric by the metre?', ar: 'هل تبيعون القماش بالمتر؟' },
      a: { en: 'Yes. Every fabric is priced per metre and cut to the length you choose, in steps of half a metre (minimum 0.5 m).', ar: 'نعم. جميع الأقمشة مسعّرة بالمتر وتُقص حسب الطول الذي تختاره، بزيادات نصف متر (الحد الأدنى ٠٫٥ متر).' } },
    { q: { en: 'How do I know how many metres I need?', ar: 'كيف أعرف عدد الأمتار التي أحتاجها؟' },
      a: { en: 'Check the length guide on our homepage, ask your tailor, or message us on WhatsApp with the garment and size — we will help you calculate.', ar: 'راجع دليل الأطوال في الصفحة الرئيسية، أو اسأل الخيّاط، أو راسلنا عبر واتساب بنوع القطعة والمقاس وسنساعدك في الحساب.' } },
    { q: { en: 'Will the colour look the same as on my screen?', ar: 'هل سيكون اللون مطابقًا لما أراه على الشاشة؟' },
      a: { en: 'We photograph fabrics carefully, but screens differ. If colour matching matters, ask us for a daylight photo on WhatsApp or visit the store.', ar: 'نصوّر الأقمشة بعناية، لكن الشاشات تختلف. إذا كان تطابق اللون مهمًا، اطلب صورة في ضوء النهار عبر واتساب أو زر المتجر.' } },
    { q: { en: 'Which areas do you deliver to?', ar: 'ما المناطق التي توصلون إليها؟' },
      a: { en: 'We deliver to all six governorates of Kuwait. You can also collect your order from our store in Kuwait City.', ar: 'نوصل إلى محافظات الكويت الست جميعها، ويمكنك أيضًا استلام طلبك من متجرنا في مدينة الكويت.' } },
    { q: { en: 'How long does delivery take?', ar: 'كم يستغرق التوصيل؟' },
      a: { en: 'Standard delivery usually takes 1–2 working days. Express same-day delivery is available for orders placed before 2 pm.', ar: 'يستغرق التوصيل العادي عادة ١–٢ يوم عمل، ويتوفر التوصيل السريع في نفس اليوم للطلبات قبل الساعة ٢ ظهرًا.' } },
    { q: { en: 'Which payment methods do you accept?', ar: 'ما طرق الدفع المتاحة؟' },
      a: { en: 'KNET, Visa and Mastercard, and cash on delivery.', ar: 'كي نت، وفيزا وماستركارد، والدفع عند الاستلام.' } },
    { q: { en: 'Can I get a physical swatch before ordering?', ar: 'هل يمكنني الحصول على عينة قبل الطلب؟' },
      a: { en: 'Yes — tap “Request fabric swatch” on any product, or message us on WhatsApp with the fabric and colours you are considering.', ar: 'نعم، اضغط «اطلب عينة قماش» في صفحة أي منتج، أو راسلنا عبر واتساب باسم القماش والألوان التي تفكر بها.' } },
    { q: { en: 'Can I return cut fabric?', ar: 'هل يمكن إرجاع القماش بعد قصّه؟' },
      a: { en: 'Because fabric is cut to order, it can only be returned or exchanged if it is faulty or not what you ordered. Please inspect it before cutting or sewing.', ar: 'لأن القماش يُقص حسب الطلب، لا يمكن إرجاعه أو استبداله إلا إذا كان معيبًا أو مختلفًا عمّا طلبته. يرجى فحصه قبل القص أو الخياطة.' } },
    { q: { en: 'Can I see the fabric before buying?', ar: 'هل يمكنني رؤية القماش قبل الشراء؟' },
      a: { en: 'Of course. Visit us on Mubarak Al Kabeer St in Kuwait City, or ask for photos and videos on WhatsApp.', ar: 'بالتأكيد. زورونا في شارع مبارك الكبير بمدينة الكويت، أو اطلبوا صورًا ومقاطع فيديو عبر واتساب.' } },
    { q: { en: 'Do you offer larger quantities for tailors and boutiques?', ar: 'هل توفرون كميات كبيرة للخيّاطين والبوتيكات؟' },
      a: { en: 'Please contact us by phone or WhatsApp with the fabric, colours and quantity and we will reply with availability.', ar: 'يرجى التواصل معنا عبر الهاتف أو واتساب مع ذكر القماش والألوان والكمية، وسنرد عليكم بمدى التوفر.' } }
  ],

  shipping: (L, cfg) => {
    const m = id => cfg.shipping.methods.find(x => x.id === id);
    return L === 'ar' ? [
      ['مناطق التوصيل', `نوصل الطلبات إلى جميع محافظات الكويت: العاصمة، وحولي، والفروانية، ومبارك الكبير، والأحمدي، والجهراء.`],
      ['خيارات ورسوم التوصيل', `التوصيل العادي (${m('standard').days.ar}): ${ROKN.fmt.money(m('standard').fee, 'ar')}${cfg.shipping.freeThreshold ? `، ومجاني للطلبات التي تتجاوز ${ROKN.fmt.money(cfg.shipping.freeThreshold, 'ar')}` : ''}.\nالتوصيل السريع (${m('express').days.ar}): ${ROKN.fmt.money(m('express').fee, 'ar')}.\nالاستلام من المتجر (${m('pickup').days.ar}): مجاني.`],
      ['تجهيز الطلب', 'يُقص كل قماش حسب الطول المطلوب ويُفحص ويُطوى بعناية قبل التغليف. سنتواصل معك هاتفيًا أو عبر واتساب لتأكيد الطلب وموعد التوصيل.'],
      ['أيام العمل', 'لا يتم التوصيل في أيام الجمعة والعطلات الرسمية، وقد يتأخر التوصيل قليلًا في مواسم الأعياد.'],
      ['تتبع الطلب', 'يمكنك متابعة حالة طلبك من صفحة تتبع الطلب باستخدام رقم الطلب ورقم الهاتف.']
    ] : [
      ['Delivery areas', 'We deliver to every governorate in Kuwait: Al Asimah (Capital), Hawalli, Farwaniya, Mubarak Al-Kabeer, Ahmadi and Jahra.'],
      ['Delivery options and fees', `Standard delivery (${m('standard').days.en}): ${ROKN.fmt.money(m('standard').fee, 'en')}${cfg.shipping.freeThreshold ? `, free on orders over ${ROKN.fmt.money(cfg.shipping.freeThreshold, 'en')}` : ''}.\nExpress delivery (${m('express').days.en}): ${ROKN.fmt.money(m('express').fee, 'en')}.\nStore pickup (${m('pickup').days.en}): free.`],
      ['Order preparation', 'Each fabric is cut to your length, checked and carefully folded before packing. We will call or message you on WhatsApp to confirm your order and delivery time.'],
      ['Working days', 'Deliveries do not run on Fridays or public holidays, and may take a little longer during Eid seasons.'],
      ['Tracking', 'Follow your order on the Order Tracking page using your order number and phone number.']
    ];
  },

  returns: (L) => L === 'ar' ? [
    ['القماش المقصوص حسب الطلب', 'نظرًا لأن الأقمشة تُقص حسب الطول الذي تطلبه، لا يمكن إرجاع القماش أو استبداله بسبب تغيير الرأي.'],
    ['العيوب أو الأخطاء', 'إذا وصلك قماش معيب أو بلون أو طول مختلف عمّا طلبته، تواصل معنا خلال ٣ أيام من الاستلام مع صور واضحة، وسنستبدله أو نرد المبلغ.'],
    ['شروط الاستبدال', 'يجب أن يكون القماش غير مغسول وغير مقصوص وغير مخيط، وبحالته الأصلية.'],
    ['استرداد المبلغ', 'يُعاد المبلغ بنفس طريقة الدفع الأصلية خلال ٧–١٠ أيام عمل من الموافقة على الطلب.'],
    ['كيف تبدأ', 'راسلنا عبر واتساب أو اتصل على +965 9735 8288 مع رقم الطلب.']
  ] : [
    ['Cut-to-order fabric', 'Because fabric is cut to the length you order, we cannot accept returns or exchanges for a change of mind.'],
    ['Faults or mistakes', 'If your fabric arrives faulty, or in a different colour or length from your order, contact us within 3 days of delivery with clear photos and we will replace it or refund you.'],
    ['Conditions', 'Fabric must be unwashed, uncut and unsewn, in its original condition.'],
    ['Refunds', 'Refunds are made to the original payment method within 7–10 working days of approval.'],
    ['How to start', 'Message us on WhatsApp or call +965 9735 8288 with your order number.']
  ],

  privacy: (L) => L === 'ar' ? [
    ['البيانات التي نجمعها', 'نجمع الاسم ورقم الهاتف والبريد الإلكتروني وعنوان التوصيل وتفاصيل الطلب عند الشراء أو التواصل معنا.'],
    ['كيف نستخدمها', 'نستخدم بياناتك لمعالجة الطلبات وتوصيلها، وللتواصل معك بشأن طلبك، ولتحسين خدماتنا. لا نبيع بياناتك لأي طرف.'],
    ['الدفع', 'تتم المدفوعات عبر بوابات دفع آمنة ومعتمدة، ولا نحتفظ ببيانات بطاقتك على خوادمنا.'],
    ['الأطراف الأخرى', 'نشارك الحد الأدنى من البيانات اللازمة مع شركات التوصيل ومزودي الدفع لإتمام طلبك فقط.'],
    ['ملفات تعريف الارتباط', 'نستخدم تخزينًا محليًا في المتصفح لحفظ السلة والمفضلة واللغة المفضلة لديك.'],
    ['حقوقك', 'يمكنك طلب الاطلاع على بياناتك أو تعديلها أو حذفها بالتواصل معنا على +965 9735 8288.']
  ] : [
    ['Information we collect', 'We collect your name, phone number, email, delivery address and order details when you shop or contact us.'],
    ['How we use it', 'We use your information to process and deliver orders, contact you about your order and improve our service. We never sell your data.'],
    ['Payments', 'Payments are handled by secure, certified payment gateways. We do not store your card details on our servers.'],
    ['Third parties', 'We share only the minimum information needed with delivery partners and payment providers to complete your order.'],
    ['Cookies and storage', 'We use browser storage to remember your cart, wishlist and language preference.'],
    ['Your rights', 'You can ask to see, correct or delete your information by contacting us on +965 9735 8288.']
  ],

  terms: (L) => L === 'ar' ? [
    ['عام', 'باستخدامك لهذا الموقع أو الشراء منه، فإنك توافق على هذه الشروط. يدير الموقع متجر ركن أم القرى في مدينة الكويت، دولة الكويت.'],
    ['المنتجات والأسعار', 'الأسعار بالدينار الكويتي لكل متر وتشمل أي رسوم مطبقة ما لم يُذكر غير ذلك. قد تختلف الألوان قليلًا حسب الشاشة. نحتفظ بحق تعديل الأسعار وتصحيح الأخطاء.'],
    ['الطلبات', 'يُعد الطلب مؤكدًا بعد اتصالنا بك أو استلام الدفع. قد نلغي الطلب في حال عدم توفر الكمية ونعيد المبلغ كاملًا.'],
    ['القص والكميات', 'تُقص الأقمشة حسب الطول المطلوب وقد يختلف الطول الفعلي بفارق بسيط لا يتجاوز ٢ سم لكل متر.'],
    ['القانون المطبق', 'تخضع هذه الشروط لقوانين دولة الكويت.']
  ] : [
    ['General', 'By using or buying from this website you agree to these terms. The website is operated by Rokn Om Alqura, Kuwait City, State of Kuwait.'],
    ['Products and prices', 'Prices are in Kuwaiti Dinar per metre and include any applicable charges unless stated otherwise. Colours may vary slightly by screen. We may update prices and correct errors.'],
    ['Orders', 'An order is confirmed once we contact you or payment is received. If an item is unavailable we may cancel the order and refund you in full.'],
    ['Cutting and lengths', 'Fabric is cut to the length ordered; the cut length may vary by up to 2 cm per metre.'],
    ['Governing law', 'These terms are governed by the laws of the State of Kuwait.']
  ]
};
