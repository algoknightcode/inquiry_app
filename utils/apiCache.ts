const cache: Record<string, { data: any; ts: number }> = {};
const pending: Record<string, Promise<any>> = {};

const FETCH_TIMEOUT_MS = 12000; 
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes expiration
const MAX_CACHE_ENTRIES = 40; // Hard memory cap to prevent unbounded growth

// Active Background Garbage Collection: Purge stale cache entries every 2 minutes automatically
if (__DEV__ || !(global as any).__apiCacheInterval) {
  (global as any).__apiCacheInterval = setInterval(() => {
    const now = Date.now();
    for (const url in cache) {
      if (now - cache[url].ts >= CACHE_TTL_MS) {
        delete cache[url];
      }
    }
  }, 2 * 60 * 1000);
}

/**
 * Fetches a URL with deduplication, auto-cleaning memory (TTL=5min), and a max limit cap.
 */
export async function fetchWithCache(url: string): Promise<any> {
  const entry = cache[url];
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) {
    return entry.data;
  }
  if (pending[url]) {
    return pending[url];
  }

  // FIFO Boundary Cap: If cache expands past 40 unique entries, drop the oldest page response to save RAM
  const keys = Object.keys(cache);
  if (keys.length >= MAX_CACHE_ENTRIES) {
    const oldestKey = keys.reduce((oldest, current) => 
      cache[current].ts < cache[oldest].ts ? current : oldest
    , keys[0]);
    delete cache[oldestKey];
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
      cache[url] = { data, ts: Date.now() };
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
  const entry = cache[url];
  if (entry) {
    if (Date.now() - entry.ts < CACHE_TTL_MS) {
      return entry.data;
    }
    // Proactive eviction if we happen to read a stale entry synchronously
    delete cache[url];
  }
  return null;
}

/**
 * Manually evict a single URL from the cache (e.g. after a POST that changes data).
 */
export function evictCache(url: string): void {
  delete cache[url];
}