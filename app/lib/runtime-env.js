/**
 * Read Hydrogen env from Node (`process.env`) and any host-provided object.
 * Vercel may call the server as `handler(request, platformContext)`. That
 * second argument is not Shopify env, so we always merge `process.env`.
 * Dynamic `process.env[name]` avoids Vite inlining empty values at build time.
 *
 * @param {Record<string, unknown> | NodeJS.ProcessEnv | undefined} passed
 * @returns {Env}
 */
export function readRuntimeEnv(passed) {
  /** @type {Record<string, string>} */
  const merged = {};

  const nodeEnv = typeof process !== 'undefined' ? process.env : undefined;
  copyStringEnv(merged, nodeEnv);
  copyStringEnv(merged, passed);

  const storeDomain = merged.PUBLIC_STORE_DOMAIN || '';

  return {
    ...merged,
    SESSION_SECRET: merged.SESSION_SECRET || '',
    PUBLIC_STORE_DOMAIN: storeDomain,
    PUBLIC_STOREFRONT_API_TOKEN: merged.PUBLIC_STOREFRONT_API_TOKEN || '',
    PRIVATE_STOREFRONT_API_TOKEN: merged.PRIVATE_STOREFRONT_API_TOKEN || '',
    PUBLIC_STOREFRONT_ID: merged.PUBLIC_STOREFRONT_ID || '',
    PUBLIC_CHECKOUT_DOMAIN: merged.PUBLIC_CHECKOUT_DOMAIN || storeDomain,
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID:
      merged.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID || '',
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: merged.PUBLIC_CUSTOMER_ACCOUNT_API_URL || '',
    PUBLIC_JUDGEME_SHOP_DOMAIN: merged.PUBLIC_JUDGEME_SHOP_DOMAIN || '',
    CONTACT_FORM_ENDPOINT: merged.CONTACT_FORM_ENDPOINT || '',
    NEWSLETTER_FORM_ENDPOINT: merged.NEWSLETTER_FORM_ENDPOINT || '',
  };
}

/**
 * @param {Record<string, string>} target
 * @param {Record<string, unknown> | NodeJS.ProcessEnv | undefined} source
 */
function copyStringEnv(target, source) {
  if (!source || typeof source !== 'object') return;

  for (const name of Object.keys(source)) {
    const value = source[name];
    if (typeof value === 'string' && value.trim() !== '') {
      target[name] = value.trim();
    }
  }

  // Explicit runtime reads so Vite cannot replace these with build-time "".
  const keys = [
    'SESSION_SECRET',
    'PUBLIC_STORE_DOMAIN',
    'PUBLIC_STOREFRONT_API_TOKEN',
    'PRIVATE_STOREFRONT_API_TOKEN',
    'PUBLIC_STOREFRONT_ID',
    'PUBLIC_CHECKOUT_DOMAIN',
    'PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID',
    'PUBLIC_CUSTOMER_ACCOUNT_API_URL',
    'PUBLIC_JUDGEME_SHOP_DOMAIN',
    'CONTACT_FORM_ENDPOINT',
    'NEWSLETTER_FORM_ENDPOINT',
  ];

  if (typeof process === 'undefined') return;

  for (const name of keys) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim() !== '') {
      target[name] = value.trim();
    }
  }
}
