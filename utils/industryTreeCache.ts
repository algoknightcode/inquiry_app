let cachedTree: any = null;
let treeFetchPromise: Promise<any> | null = null;

/**
 * Singleton cache for the Industry Tree API (/api/industries/tree).
 * Ensures the large nested industry tree JSON is fetched and parsed exactly ONCE
 * per app session across all components and screens.
 */
export async function getIndustryTree(): Promise<any> {
  // 1. Instant RAM return if already loaded
  if (cachedTree) {
    return cachedTree;
  }

  // 2. Reuse in-flight promise if multiple components mount simultaneously
  if (treeFetchPromise) {
    return treeFetchPromise;
  }

  // 3. Single network fetch
  treeFetchPromise = fetch("https://backend.inquirybazaar.com/api/industries/tree")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      cachedTree = json;
      treeFetchPromise = null;
      return cachedTree;
    })
    .catch((err) => {
      treeFetchPromise = null;
      console.error("[IndustryTreeCache] Error fetching tree:", err);
      return null;
    });

  return treeFetchPromise;
}

/**
 * Returns cached tree synchronously (if already fetched), or null.
 */
export function getIndustryTreeSync(): any {
  return cachedTree;
}
