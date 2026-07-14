// Persist the cache reference globally during Expo development / Fast Reloads
const cache: Map<string, { data: any; ts: number }> =
  (global as any).__apiCache || ((global as any).__apiCache = new Map());

const pending: Record<string, Promise<any> | undefined> = {};

const FETCH_TIMEOUT_MS = 12000; 
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes expiration
const MAX_CACHE_ENTRIES = 40; // Hard memory cap

// Active Background Garbage Collection: Setup/Reset stale cache entries interval
if ((global as any).__apiCacheInterval) {
  clearInterval((global as any).__apiCacheInterval);
}
(global as any).__apiCacheInterval = setInterval(() => {
  const now = Date.now();
  for (const [url, entry] of cache.entries()) {
    if (now - entry.ts >= CACHE_TTL_MS) {
      cache.delete(url);
    }
  }
}, 2 * 60 * 1000);

/**
 * Fetches a URL with deduplication, auto-cleaning memory (TTL=5min), and an O(1) max limit cap.
 */
export async function fetchWithCache(url: string): Promise<any> {
  const entry = cache.get(url);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) {
    return entry.data;
  }
  if (pending[url]) {
    return pending[url];
  }

  // FIFO Cap: Instantly drop the oldest entry in O(1) without iterating arrays
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value; // Map keys iterator returns the oldest inserted first
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  pending[url] = fetch(url, { signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      cache.set(url, { data, ts: Date.now() });
      delete pending[url];
      return data;
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      delete pending[url];
      throw err;
    });

  return pending[url];
}

/**
 * Instantly retrieves cached data synchronously.
 */
export function getCacheSync(url: string): any | null {
  const entry = cache.get(url);
  if (entry) {
    if (Date.now() - entry.ts < CACHE_TTL_MS) {
      return entry.data;
    }
    // Proactive eviction if we happen to read a stale entry synchronously
    cache.delete(url);
  }
  return null;
}

/**
 * Manually evict a single URL from the cache.
 */
export function evictCache(url: string): void {
  cache.delete(url);
}