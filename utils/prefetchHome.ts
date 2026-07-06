import { fetchWithCache } from "./apiCache";

const BASE = "https://backend.inquirybazaar.com/api";

/**
 * Pre-warms the API cache with every URL used on the home screen.
 * Called during the welcome screen loading bar so components get
 * instant cache hits and show ZERO loaders when the home renders.
 */
export async function prefetchHomeData(): Promise<void> {
  // ── Step 1: Fire all top-level requests concurrently ──────────
  const topLevel = [
    `${BASE}/industries/tree`,      // CategoryMarquee, IndusTreeCasaroul, SearchBar, NewOnes
    `${BASE}/industries`,           // Industry
    `${BASE}/categories/main`,      // TopCategory
    `${BASE}/categories/sub/led-display-board/Delhi`, // Trending
    `${BASE}/categories/sub/titanium-dioxide/Delhi`, // Trusted
  ];

  await Promise.allSettled(topLevel.map((url) => fetchWithCache(url)));

  // ── Step 2: Use cached tree to pre-warm NewOnes subcategory URLs ──
  // The tree is now in cache so this is instant (no network hit)
  try {
    const treeJson = await fetchWithCache(`${BASE}/industries/tree`);
    if (treeJson?.success && Array.isArray(treeJson.data)) {
      const industry = treeJson.data.find(
        (ind: any) =>
          ind.name?.toLowerCase().includes("plants") ||
          ind.name?.toLowerCase().includes("machinery")
      );

      const categoryObj = industry?.categories?.find(
        (cat: any) =>
          cat.name?.toLowerCase().includes("machines") ||
          cat.name?.toLowerCase().includes("equipment")
      );

      if (categoryObj?.subCategories?.length) {
        const subCatUrls = categoryObj.subCategories.map(
          (sub: any) => `${BASE}/categories/sub/${sub.slug}/Delhi`
        );
        // Fire all subcategory product fetches in parallel
        await Promise.allSettled(subCatUrls.map((url: string) => fetchWithCache(url)));
      }
    }
  } catch {
    // Silently skip — home will fallback to its own fetch
  }
}
