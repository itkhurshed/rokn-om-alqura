/* ==========================================================================
   REVIEWS — PLACEHOLDER CONTENT ONLY
   These are sample reviews that demonstrate the layout. They are labelled as
   samples in the UI. Replace with real, verified customer reviews from your
   order system (set sample:false) before launch.
   ========================================================================== */
window.ROKN = window.ROKN || {};

ROKN.reviews = [
  { productId: 'italian-linen', name: 'Sample Customer', rating: 5, date: '2026-09-14', verified: true, sample: true,
    text: { en: 'Excellent fabric quality and beautiful colours. Softer than I expected after the first wash.', ar: 'جودة ممتازة وألوان جميلة. أصبح أنعم مما توقعت بعد أول غسلة.' } },
  { productId: 'italian-linen', name: 'Sample Customer', rating: 4, date: '2026-08-30', verified: true, sample: true,
    text: { en: 'Good weight for summer dishdashas. My tailor was happy with how it pressed.', ar: 'وزن مناسب للدشاديش الصيفية، والخيّاط كان راضيًا عن سهولة كيّه.' } },
  { productId: 'italian-linen', name: 'Sample Customer', rating: 5, date: '2026-07-19', verified: false, sample: true,
    text: { en: 'The beige is exactly as pictured. Will order the navy next.', ar: 'اللون البيج مطابق للصورة تمامًا. سأطلب الكحلي في المرة القادمة.' } },
  { productId: '*', name: 'Sample Customer', rating: 5, date: '2026-09-02', verified: true, sample: true,
    text: { en: 'Beautiful drape and the colour matched the swatch perfectly.', ar: 'انسدال جميل واللون مطابق للعينة تمامًا.' } },
  { productId: '*', name: 'Sample Customer', rating: 4, date: '2026-08-11', verified: true, sample: true,
    text: { en: 'Well packed and delivered quickly. Quality feels premium.', ar: 'تغليف ممتاز وتوصيل سريع، والجودة فاخرة بالفعل.' } }
];

/* Homepage testimonials — PLACEHOLDERS, labelled as samples in the UI */
ROKN.testimonials = [
  { name: { en: 'Sample customer', ar: 'عميلة تجريبية' }, rating: 5, verified: true, sample: true, product: 'nida-abaya',
    text: { en: 'Beautiful quality and excellent selection. The fabric looked even better in person.', ar: 'جودة جميلة وتشكيلة ممتازة، والقماش كان أجمل على الطبيعة.' } },
  { name: { en: 'Sample customer', ar: 'عميل تجريبي' }, rating: 5, verified: true, sample: true, product: 'dishdasha-fabric',
    text: { en: 'They helped me choose the right length on WhatsApp and the cut was exact.', ar: 'ساعدوني في اختيار الطول المناسب عبر واتساب، وكان القص دقيقًا.' } },
  { name: { en: 'Sample customer', ar: 'عميلة تجريبية' }, rating: 5, verified: true, sample: true, product: 'mulberry-silk',
    text: { en: 'The silk drapes like water and the colour matched the swatch perfectly.', ar: 'الحرير ينسدل كالماء واللون مطابق للعينة تمامًا.' } }
];

ROKN.getReviews = function (productId) {
  const own = ROKN.reviews.filter(r => r.productId === productId);
  const p = ROKN.q && ROKN.q.product(productId);
  if (own.length || (p && !p.reviewCount)) return own;
  return ROKN.reviews.filter(r => r.productId === '*');
};
