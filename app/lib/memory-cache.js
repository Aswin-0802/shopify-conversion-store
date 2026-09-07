/**
 * In-memory Cache API for Node / Vercel.
 * Oxygen provides `caches.open()`; Vercel Functions do not.
 */
export function createMemoryCache() {
  /** @type {Map<string, {response: Response, expires: number}>} */
  const store = new Map();

  /**
   * @param {RequestInfo} request
   */
  function keyOf(request) {
    return typeof request === 'string' ? request : request.url;
  }

  return /** @type {Cache} */ ({
    async match(request) {
      const entry = store.get(keyOf(request));
      if (!entry) return undefined;
      if (entry.expires && Date.now() > entry.expires) {
        store.delete(keyOf(request));
        return undefined;
      }
      return entry.response.clone();
    },
    async put(request, response) {
      const cacheControl = response.headers.get('cache-control') || '';
      const maxAge = /max-age=(\d+)/i.exec(cacheControl);
      const swr = /s-maxage=(\d+)/i.exec(cacheControl);
      const seconds = Number(swr?.[1] || maxAge?.[1] || 0);
      store.set(keyOf(request), {
        response: response.clone(),
        expires: seconds ? Date.now() + seconds * 1000 : 0,
      });
    },
    async delete(request) {
      return store.delete(keyOf(request));
    },
    async keys() {
      return [...store.keys()].map((url) => new Request(url));
    },
    async add() {
      throw new Error('Cache.add is not implemented');
    },
    async addAll() {
      throw new Error('Cache.addAll is not implemented');
    },
    async matchAll() {
      return [];
    },
  });
}

/** @returns {Promise<Cache>} */
export async function openHydrogenCache() {
  if (globalThis.caches && typeof globalThis.caches.open === 'function') {
    return globalThis.caches.open('hydrogen');
  }
  return createMemoryCache();
}
