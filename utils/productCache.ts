type CacheEntry = { data: any; ts: number };
const productCache: Map<string, CacheEntry> =
  (global as any).__productCache ||
  ((global as any).__productCache = new Map());

const PRODUCT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes expiration
const MAX_PRODUCT_CACHE_ENTRIES = 50; // Hard memory cap

// No background polling interval - lazy eviction on get/set

export const setProductCache = (id: string, data: any) => {
  if (!id) return;

  // FIFO Cap: Remove oldest entry when at capacity
  if (productCache.size >= MAX_PRODUCT_CACHE_ENTRIES) {
    const oldestKey = productCache.keys().next().value;
    if (oldestKey) {
      productCache.delete(oldestKey);
    }
  }

  productCache.set(id, { data, ts: Date.now() });
};

export const getProductCache = (id: string) => {
  const entry = productCache.get(id);
  if (entry) {
    if (Date.now() - entry.ts < PRODUCT_CACHE_TTL_MS) {
      return entry.data;
    }
    // Proactive eviction if stale
    productCache.delete(id);
  }
  return null;
};

/**
 * Retrieves the product data and instantly deletes it from memory
 * to prevent multi-megabyte browsing sessions from lagging the app.
 */
export const consumeProductCache = (id: string): any | null => {
  const entry = productCache.get(id);
  if (entry) {
    const data = entry.data;
    productCache.delete(id); // Burn on read! Wipes the item out of RAM
    return data;
  }
  return null;
};
