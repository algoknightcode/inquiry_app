const cache: Record<string, any> = {};
const pending: Record<string, Promise<any>> = {};

/**
 * Fetches a URL with deduplication and in-memory caching.
 * Prevents duplicate concurrent requests and speeds up repeat mounts to 0ms.
 */
export async function fetchWithCache(url: string): Promise<any> {
  if (cache[url]) {
    return cache[url];
  }
  if (pending[url]) {
    return pending[url];
  }

  pending[url] = fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      cache[url] = data;
      delete pending[url];
      return data;
    })
    .catch((err) => {
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
  return cache[url] || null;
}
