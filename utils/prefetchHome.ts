import { Image } from "react-native";
import { fetchWithCache } from "./apiCache";

const BASE = "https://backend.inquirybazaar.com/api";

/**
 * Pre-warms the API cache with every URL used on the home screen.
 * Structured into prioritized waves so the CPU is never overwhelmed
 * at startup on budget/single-core devices.
 *
 * Wave 1 → Critical layout (industries, categories, cities)
 * Wave 2 → Structural layout (brands, sellers, sub-categories)
 * Wave 3 → Non-critical content deferred 200ms (faqs, testimonials, about)
 */
export async function prefetchHomeData(): Promise<void> {
  // ── Wave 0: Preload critical images (non-blocking fire-and-forget) ──
  const criticalImages = [
    require("../assets/images/logoo-Photoroom.png"),
  ];
  criticalImages.forEach((image) => {
    Image.prefetch(typeof image === "string" ? image : image?.uri || "").catch(
      () => {},
    );
  });

  // ── Wave 1: High Priority — Core layout essentials ──────────────────
  // These endpoints power the first visible sections on screen.
  const essentialEndpoints = [
    `${BASE}/industries/tree`, // CategoryMarquee, IndusTreeCasaroul, SearchBar, NewOnes
    `${BASE}/industries`,      // Industry
    `${BASE}/categories/main`, // TopCategory
    `${BASE}/cities`,          // Cities list
  ];
  await Promise.allSettled(essentialEndpoints.map((url) => fetchWithCache(url)));

  // ── Wave 2: Structural layout — loads after Wave 1 completes ────────
  // Slightly lower priority — these components appear below the fold.
  const structuralEndpoints = [
    `${BASE}/categories/sub/led-display-board/Delhi`, // Trending, Trusted
    `${BASE}/brands`,      // TrendingBrandsCarousel
    `${BASE}/sellers/top`, // SellersByCityGrid
  ];
  await Promise.allSettled(structuralEndpoints.map((url) => fetchWithCache(url)));

  // ── Wave 2b: Pre-warm NewOnes subcategory URLs from cached tree ─────
  // Tree is already cached from Wave 1 — no network hit here.
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
        await Promise.allSettled(
          subCatUrls.map((url: string) => fetchWithCache(url)),
        );
      }
    }
  } catch {
    // Silently skip — home will fallback to its own fetch
  }

  // ── Wave 3: Non-critical background content — deferred 200ms ────────
  // Testimonials, FAQs and about content are below-fold and non-essential.
  // Deferring keeps them completely clear of the main boot sequence window.
  setTimeout(() => {
    const backgroundEndpoints = [
      `${BASE}/testimonials`, // Reviews/Testimonials
      `${BASE}/faqs`,         // FAQ section
      `${BASE}/content/about`, // About/footer content
    ];
    Promise.allSettled(backgroundEndpoints.map((url) => fetchWithCache(url))).catch(() => {});
  }, 200);
}
