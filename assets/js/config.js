/* ==========================================================================
   ROKN OM ALQURA — Store configuration
   --------------------------------------------------------------------------
   Business details below were supplied by the store owner.
   Values marked  // REVIEW  are sensible placeholders: confirm them with the
   business before launch (delivery fees, thresholds, policies, social links).
   ========================================================================== */
window.ROKN = window.ROKN || {};

ROKN.config = {
  name: { en: 'Rokn Om Alqura', ar: 'ركن أم القرى' },
  legalName: 'Rokn Om Alqura',
  phone: '+965 9735 8288',
  phoneE164: '+96597358288',
  whatsapp: '96597358288',
  address: {
    en: 'XFJ+65H, Mubarak Al Kabeer St, Kuwait City, Kuwait',
    ar: 'XFJ+65H، شارع مبارك الكبير، مدينة الكويت، الكويت',
    plusCode: 'XFJ+65H',
    street: 'Mubarak Al Kabeer St',
    city: 'Kuwait City',
    country: 'KW'
  },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=XFJ%2B65H%2C%20Mubarak%20Al%20Kabeer%20St%2C%20Kuwait%20City',
  /* For production, embed Google Maps with:
     <iframe src="https://www.google.com/maps?q=XFJ%2B65H+Kuwait+City&output=embed" loading="lazy"></iframe> */
  siteUrl: 'https://www.roknomalqura.com', // REVIEW: final domain
  currency: 'KWD',
  unit: 'm',
  minMeters: 0.5,
  meterStep: 0.5,
  maxMeters: 100,
  quickMeters: [0.5, 1, 1.5, 2, 3, 5, 10],
  defaultLang: 'en',               // 'en' | 'ar'

  shipping: {                       // REVIEW: confirm fees and thresholds
    freeThreshold: null,            // KWD — set a number (e.g. 30) to enable free delivery + progress bar; null = off
    methods: [
      { id: 'standard', fee: 2.0, days: { en: '1–2 working days', ar: 'خلال ١–٢ يوم عمل' } },
      { id: 'express',  fee: 3.5, days: { en: 'Same day for orders before 2 pm', ar: 'في نفس اليوم للطلبات قبل الساعة ٢ ظهرًا' } },
      { id: 'pickup',   fee: 0,   days: { en: 'Ready within 24 hours', ar: 'جاهز خلال ٢٤ ساعة' } }
    ]
  },

  /* Payment methods. In production these hand off to a Kuwait payment gateway
     (e.g. KNET via MyFatoorah / Tap / UPayments). No card data is collected here. */
  paymentGatewayConnected: false,   // set true only once KNET / card gateway is live
  newsletterConnected: false,       // set true once the email service (Mailchimp, Klaviyo…) is connected
  payments: [
    { id: 'knet', enabled: true },
    { id: 'card', enabled: true },
    { id: 'applepay', enabled: false }, // enable if your gateway supports Apple Pay
    { id: 'cod', enabled: true }    // REVIEW: Cash on Delivery on/off
  ],

  /* DEMO coupon codes — replace with server-validated codes */
  coupons: {
    WELCOME10: { type: 'percent', value: 10, min: 0 },
    FABRIC5:   { type: 'fixed', value: 5, min: 40 }
  },

  social: {                         // REVIEW: add the store's real profile URLs (no handle invented)
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    tiktok: 'https://www.tiktok.com/'
  },

  governorates: [
    { id: 'capital',  en: 'Al Asimah (Capital)', ar: 'العاصمة' },
    { id: 'hawalli',  en: 'Hawalli',             ar: 'حولي' },
    { id: 'farwaniya',en: 'Farwaniya',           ar: 'الفروانية' },
    { id: 'mubarak',  en: 'Mubarak Al-Kabeer',   ar: 'مبارك الكبير' },
    { id: 'ahmadi',   en: 'Ahmadi',              ar: 'الأحمدي' },
    { id: 'jahra',    en: 'Jahra',               ar: 'الجهراء' }
  ],

  /* Set to true while the catalogue still contains demo products */
  sampleCatalogue: true
};
