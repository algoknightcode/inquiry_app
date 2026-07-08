import { Image } from "react-native";
import { fetchWithCache } from "./apiCache";

const BASE = "https://backend.inquirybazaar.com/api";

/**
 * Pre-warms the API cache with every URL used on the home screen.
 * Called during the welcome screen loading bar so components get
 * instant cache hits and show ZERO loaders when the home renders.
 *
 * Now also preloads critical images and more API endpoints.
 */
export async function prefetchHomeData(): Promise<void> {
  // ── Step 0: Preload critical images ──────────────────────────
  const criticalImages = [
    require("../assets/images/logoo-Photoroom.png"),
    // Add other critical image paths here as needed
  ];

  // Start image preloading in parallel (non-blocking)
  criticalImages.forEach((image) => {
    Image.prefetch(typeof image === "string" ? image : image?.uri || "").catch(
      () => {},
    );
  });

  // ── Step 1: Fire all top-level requests concurrently ──────────
  const topLevel = [
    `${BASE}/industries/tree`, // CategoryMarquee, IndusTreeCasaroul, SearchBar, NewOnes
    `${BASE}/industries`, // Industry
    `${BASE}/categories/main`, // TopCategory
    `${BASE}/categories/sub/led-display-board/Delhi`, // Trending, Trusted
    `${BASE}/brands`, // TrendingBrandsCarousel
    `${BASE}/sellers/top`, // SellersByCityGrid
    `${BASE}/cities`, // Cities list
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
          ind.name?.toLowerCase().includes("machinery"),
      );

      const categoryObj = industry?.categories?.find(
        (cat: any) =>
          cat.name?.toLowerCase().includes("machines") ||
          cat.name?.toLowerCase().includes("equipment"),
      );

      if (categoryObj?.subCategories?.length) {
        const subCatUrls = categoryObj.subCategories.map(
          (sub: any) => `${BASE}/categories/sub/${sub.slug}/Delhi`,
        );
        // Fire all subcategory product fetches in parallel
        await Promise.allSettled(
          subCatUrls.map((url: string) => fetchWithCache(url)),
        );
      }
    }
  } catch {
    // Silently skip — home will fallback to its own fetch
  }

  // ── Step 3: Preload additional common endpoints ──────────────
  const additionalEndpoints = [
    `${BASE}/testimonials`, // Reviews/Testimonials
    `${BASE}/faqs`, // FAQ section
    `${BASE}/content/about`, // About/footer content
  ];

  await Promise.allSettled(
    additionalEndpoints.map((url) => fetchWithCache(url)),
  );
}
