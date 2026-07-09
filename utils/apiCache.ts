const cache: Record<string, { data: any; ts: number }> = {};
const pending: Record<string, Promise<any>> = {};

const FETCH_TIMEOUT_MS = 12000; // 12 seconds — fail fast instead of hanging forever
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — evict stale entries

/**
 * Fetches a URL with deduplication, in-memory caching (TTL=5min), and a timeout guard.
 * If the request hangs for > 12s, it rejects so components can show fallback UI.
 */
export async function fetchWithCache(url: string): Promise<any> {
  const entry = cache[url];
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) {
    return entry.data;
  }
  if (pending[url]) {
    return pending[url];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  pending[url] = fetch(url, { signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
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
 * Instantly retrieves cached data synchronously. Used to initialize
 * component states during construction to avoid a 1-frame flickering loader.
 */
export function getCacheSync(url: string): any | null {
  const entry = cache[url];
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

/**
 * Manually evict a single URL from the cache (e.g. after a POST that changes data).
 */
export function evictCache(url: string): void {
  delete cache[url];
}
