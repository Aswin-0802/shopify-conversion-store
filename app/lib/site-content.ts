/**
 * Storefront copy. Change this file to rebrand the shop.
 */
export const siteContent = {
  brandName: 'Sloane',
  announcement:
    'Free shipping over $75  ·  30-day returns  ·  Ships in 1–2 days',
  tagline: 'Everyday pieces, cut with care.',
  hero: {
    eyebrow: 'Spring drop',
    title: 'Built for the week you actually live.',
    subtitle:
      'Soft fabrics, clean lines, and fits that don’t fall apart after three washes. Shop the current cut.',
    primaryCta: {label: 'Shop now', to: '/collections/all'},
    secondaryCta: {label: 'Our story', to: '/pages/about'},
  },
  benefits: [
    {
      title: 'Better fabric',
      body: 'Cotton, wool, and blends we would wear ourselves. Nothing that pills in a month.',
    },
    {
      title: 'Holds its shape',
      body: 'Simple construction and honest stitching so the piece still looks right next year.',
    },
    {
      title: 'Ships fast',
      body: 'Most orders leave within two business days. Tracking on every box.',
    },
    {
      title: 'Easy returns',
      body: 'Thirty days. Unworn. No lecture. Email us if you get stuck.',
    },
  ],
  promo: {
    eyebrow: 'This week',
    title: 'Small drop. No leftovers.',
    body: 'We don’t sit on piles of extra stock. When a color’s gone, it’s gone until the next cut.',
    cta: {label: 'See collections', to: '/collections'},
  },
  story: {
    eyebrow: 'About Sloane',
    title: 'Started with a hoodie that didn’t itch.',
    body: 'We got tired of paying for clothes that looked good in photos and felt cheap at home. Sloane is the opposite: fewer styles, better fabric, prices that make sense.',
    cta: {label: 'Read more', to: '/pages/about'},
  },
  about: {
    eyebrow: 'About',
    title: 'A small label. A short list.',
    intro:
      'Sloane makes a tight set of everyday clothes — tees, hoodies, pants, shoes — that you can actually rotate for years.',
    mission: {
      title: 'What we do',
      body: 'Design fewer things, make them well, and skip the seasonal circus. If it doesn’t earn a hanger, it doesn’t ship.',
    },
    values: [
      {
        title: 'Edit hard',
        body: 'We cut styles that don’t pull their weight. The rack stays short on purpose.',
      },
      {
        title: 'Ask the mill twice',
        body: 'Fabric, dye, and stitch quality get checked before we put a price on anything.',
      },
      {
        title: 'Talk like a person',
        body: 'Sizing questions, returns, wholesale — a human answers. No chatbot maze.',
      },
    ],
    why: [
      'Materials we can name, not “premium blend.”',
      'Stock that’s either in or out. No fake urgency timers.',
      'Returns without a scavenger hunt.',
      'Support that reads the whole email.',
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Need a hand?',
    intro:
      'Fit, orders, wholesale, press — send a note. We reply within one business day.',
    email: 'studio@sloane.example',
    phone: '+1 (212) 555-0148',
    address: 'Studio 4, 120 Mercer Street, New York, NY 10012',
    hours: [
      {days: 'Monday – Friday', time: '10:00am – 6:00pm ET'},
      {days: 'Saturday', time: '11:00am – 4:00pm ET'},
      {days: 'Sunday', time: 'Closed'},
    ],
    faq: [
      {
        question: 'How long does shipping take?',
        answer:
          'US orders usually land in 3–6 business days. International timing shows at checkout.',
      },
      {
        question: 'What’s the return window?',
        answer:
          'Unworn items, 30 days. Use the link in your order email or write us and we’ll start it.',
      },
      {
        question: 'Do you wholesale?',
        answer:
          'Yes. Put “Wholesale” in the subject and tell us about the shop. We’ll send a lookbook.',
      },
      {
        question: 'Can you help with size?',
        answer:
          'Send the product, the size you usually wear, and any fit notes. We’ll point you to the closest cut.',
      },
    ],
  },
  shipping: {
    title: 'Shipping',
    body: 'Free tracked shipping over $75. Most orders leave within 1–2 business days.',
  },
  returns: {
    title: 'Returns',
    body: '30 days on unworn pieces. Start from your order email, or email the studio.',
  },
  trust: [
    'Secure checkout',
    'Tracked shipping',
    '30-day returns',
    'Ships in 1–2 days',
  ],
  newsletter: {
    title: 'Get the drop first.',
    body: 'New colors, restocks, and the odd note from the studio. That’s it.',
    placeholder: 'Email address',
    cta: 'Join',
    success: 'You’re on the list.',
  },
  social: [
    {label: 'Instagram', href: 'https://instagram.com'},
    {label: 'Pinterest', href: 'https://pinterest.com'},
    {label: 'TikTok', href: 'https://tiktok.com'},
  ],
  nav: [
    {title: 'Shop', to: '/collections/all'},
    {title: 'Collections', to: '/collections'},
    {title: 'About', to: '/pages/about'},
    {title: 'Reviews', to: '/pages/reviews'},
    {title: 'Contact', to: '/pages/contact'},
  ],
  footerNote: 'Sloane — New York',
} as const;

export type SiteContent = typeof siteContent;
