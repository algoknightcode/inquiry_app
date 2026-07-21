import { Image } from "expo-image";
import { fetchWithCache } from "./apiCache";

const BASE = "https://backend.inquirybazaar.com/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pre-warms the API cache with URLs used on the home screen.
 * Staggered with time delays between waves so the CPU is never overwhelmed
 * during initial app boot and mounting.
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

  // ── Wave 1: High Priority — Above-the-fold essentials ───────────────
  const essentialEndpoints = [
    `${BASE}/industries`,      // CategoryMarquee, Industry
    `${BASE}/categories/main`, // TopCategory
    `${BASE}/cities`,          // Cities list
  ];
  await Promise.allSettled(essentialEndpoints.map((url) => fetchWithCache(url)));

  // ── Wave 2: Structural layout — Deferred 500ms ──────────────────────
  await delay(500);
  const structuralEndpoints = [
    `${BASE}/categories/sub/led-display-board/Delhi`, // Trending, Trusted
    `${BASE}/brands`,                                  // TrendingBrandsCarousel
    `${BASE}/sellers/top`,                             // SellersByCityGrid
  ];
  await Promise.allSettled(structuralEndpoints.map((url) => fetchWithCache(url)));

  // ── Wave 3: Non-critical background content — Deferred 1200ms ───────
  await delay(1200);
  const backgroundEndpoints = [
    `${BASE}/testimonials`, // Reviews/Testimonials
    `${BASE}/faqs`,         // FAQ section
    `${BASE}/content/about`, // About/footer content
  ];
  await Promise.allSettled(backgroundEndpoints.map((url) => fetchWithCache(url))).catch(() => {});
}
