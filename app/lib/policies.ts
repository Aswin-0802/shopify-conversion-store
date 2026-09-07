export const POLICY_LIST = [
  {
    field: 'privacyPolicy',
    handle: 'privacy-policy',
    title: 'Privacy policy',
    lede: 'What we collect, why we collect it, and how to reach us.',
    body: `
      <p>Sloane collects only what we need to take an order, ship it, and answer you if something goes wrong.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Name, email, shipping address, and payment details at checkout (payments are handled by Shopify).</li>
        <li>Order history so we can pack returns and replacements.</li>
        <li>Site analytics in aggregate — pages viewed, not a dossier on you.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To fulfill orders, send shipping updates, and — only if you join the list — occasional notes about new drops. We do not sell your information.</p>
      <h2>Cookies</h2>
      <p>We use cookies for the cart, checkout, and basic analytics. You can block non-essential cookies in your browser; the shop still works.</p>
      <h2>Contact</h2>
      <p>Questions about your data: use the contact page. We will reply from the studio email.</p>
    `,
  },
  {
    field: 'refundPolicy',
    handle: 'refund-policy',
    title: 'Refund policy',
    lede: '30 days on unworn pieces. Easy on purpose.',
    body: `
      <p>If a piece is not right, send it back within 30 days of delivery. It should be unworn, unwashed, and in its original condition, with tags attached.</p>
      <h2>How to start a return</h2>
      <p>Use the link in your order email, or write us from the contact page with your order number. We will send a return label when the order qualifies.</p>
      <h2>Refunds</h2>
      <p>Refunds go back to the original payment method once the return is checked in. Please allow a few business days after we receive it. Sale pieces marked final sale are not refundable.</p>
      <h2>Exchanges</h2>
      <p>For a different size or color, return the original and place a new order. That keeps stock honest on both ends.</p>
    `,
  },
  {
    field: 'shippingPolicy',
    handle: 'shipping-policy',
    title: 'Shipping policy',
    lede: 'Tracked shipping. Most orders leave within a couple of days.',
    body: `
      <p>We ship from New York. Most in-stock orders leave within 1–2 business days. You will get a tracking number by email when the box is scanned.</p>
      <h2>Rates</h2>
      <p>Tracked shipping is free on orders over $75. Below that, checkout shows the rate before you pay. International duties, if any, are the buyer’s responsibility.</p>
      <h2>Delays</h2>
      <p>Carriers slip sometimes. If a package sits still for more than a week, write us and we will chase it.</p>
      <h2>Wrong address</h2>
      <p>Change the address before the order ships by contacting the studio. After it ships, we cannot redirect the carrier.</p>
    `,
  },
  {
    field: 'termsOfService',
    handle: 'terms-of-service',
    title: 'Terms of service',
    lede: 'The short version of how this shop works.',
    body: `
      <p>By placing an order with Sloane you agree to these terms. The site, product photos, and writing are ours. Do not scrape or republish them.</p>
      <h2>Orders</h2>
      <p>An order is a request. We may cancel it if an item is out of stock, a price is wrong, or payment does not clear. If we cancel, we refund you.</p>
      <h2>Pricing</h2>
      <p>Prices are in the currency shown at checkout and can change. The price you see when you pay is the price you get.</p>
      <h2>Liability</h2>
      <p>We are responsible for sending what you ordered in the condition described. We are not responsible for carrier delay after a package is scanned, or for how you wear or alter a garment.</p>
      <h2>Contact</h2>
      <p>Studio questions go through the contact page.</p>
    `,
  },
] as const;

export type PolicyField = (typeof POLICY_LIST)[number]['field'];

export type PolicyRecord = {
  id: string;
  handle: string;
  title: string;
  lede: string;
  body: string;
};

export function handleToPolicyField(handle: string): PolicyField | null {
  const match = POLICY_LIST.find((policy) => policy.handle === handle);
  return match?.field ?? null;
}

export function getFallbackPolicy(handle: string): PolicyRecord | null {
  const match = POLICY_LIST.find((policy) => policy.handle === handle);
  if (!match) return null;
  return {
    id: match.handle,
    handle: match.handle,
    title: match.title,
    lede: match.lede,
    body: match.body.trim(),
  };
}

function isPlaceholderPolicy(body?: string | null) {
  if (!body) return true;
  return /automatically generated template provided by Shopify/i.test(body);
}

export function resolvePolicy(
  handle: string,
  shopPolicy?: {id?: string | null; handle?: string | null; title?: string | null; body?: string | null} | null,
): PolicyRecord | null {
  const fallback = getFallbackPolicy(handle);
  if (!fallback && isPlaceholderPolicy(shopPolicy?.body)) return null;

  const useShopBody = Boolean(shopPolicy?.body) && !isPlaceholderPolicy(shopPolicy?.body);

  return {
    id: shopPolicy?.id || fallback?.id || handle,
    handle: shopPolicy?.handle || fallback?.handle || handle,
    title: useShopBody ? shopPolicy?.title || fallback?.title || 'Policy' : fallback?.title || shopPolicy?.title || 'Policy',
    lede: fallback?.lede || '',
    body: useShopBody ? shopPolicy?.body || '' : fallback?.body || shopPolicy?.body || '',
  };
}

export function resolvePolicyList(
  shop?: {
    privacyPolicy?: {id: string; title: string; handle: string} | null;
    shippingPolicy?: {id: string; title: string; handle: string} | null;
    termsOfService?: {id: string; title: string; handle: string} | null;
    refundPolicy?: {id: string; title: string; handle: string} | null;
  } | null,
): Array<{id: string; title: string; handle: string; lede: string}> {
  return POLICY_LIST.map((item) => {
    const fromShop = shop?.[item.field];
    return {
      id: fromShop?.id || item.handle,
      title: item.title,
      handle: fromShop?.handle || item.handle,
      lede: item.lede,
    };
  });
}
