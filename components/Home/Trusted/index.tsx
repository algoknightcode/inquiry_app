import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { productCache } from "@/utils/productCache";

// ── TypeScript Types matching B2B response payload ─────────────────────────
type Media = {
  _id: string;
  url: string;
  isPrimary: boolean;
};

type Business = {
  companyName: string;
  city: string;
  state: string;
};

type Supplier = {
  _id: string;
  name: string;
  phone: string;
  business?: Business;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  priceType: string;
  media: Media[];
  supplier?: Supplier;
};

import { fetchWithCache } from "@/utils/apiCache";

const IBTrusted = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrustedProducts = async () => {
      try {
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/categories/sub/led-display-board/Delhi");
        if (json.success && json.data && json.data.products) {
          setProducts(json.data.products.slice(0, 10)); // Limit to 10 products
        }
      } catch (error) {
        console.error("Error fetching trusted products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrustedProducts();
  }, []);

  const handleCardPress = (item: Product) => {
    productCache[item._id] = item;
    router.push({
      pathname: "/Products_Page/[slug]",
      params: {
        slug: item.slug,
        productId: item._id,
      },
    });
  };

  return (
    <View className={styles.container}>
      
      {/* Header Section */}
      <View className={styles.outer}>
        <View className={styles.left}>
          <Text className={styles.kicker}>CERTIFIED</Text>
          <Text className={styles.heading}>
            IB Trusted
          </Text>
        </View>

        <Pressable 
          className={styles.viewAllBtn}
          hitSlop={8}
          onPress={() => router.push({
            pathname: "/Products_Page",
            params: {
              subCategorySlug: "led-display-board",
              subCategoryName: "LED Display Board",
            }
          })}
        >
          <Text className={styles.viewAllText}>
            Explore
          </Text>
        </Pressable>
      </View>

      {/* Horizontal Carousel or Loading state */}
      {isLoading ? (
        <View className="py-12 justify-center items-center">
          <ActivityIndicator size="small" color="#059669" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className={styles.cardsContainer}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={160 + 16} 
          decelerationRate="fast"
        >
          {products.map((item) => {
            const primaryImage = item.media && item.media.length > 0
              ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
              : "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80";

            const companyName = item.supplier?.business?.companyName || item.supplier?.name || "Verified Seller";
            const isPriceOnRequest = item.priceType === "on_request" || !item.price;

            return (
              <Pressable
                key={item._id}
                className={styles.card}
                onPress={() => handleCardPress(item)}
              >
                {({ pressed }) => (
                  <View 
                    style={{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }} 
                    className="transition-all"
                  >
                    
                    {/* Image Container - Rectangular rounded card */}
                    <View className={styles.imageWrapper}>
                      <Image
                        source={{ uri: primaryImage }}
                        style={styles.image}
                        contentFit="cover"
                        transition={200}
                      />
                      
                      {/* Floating 'VERIFIED' Trust Seal */}
                      <View className={styles.trustBadge}>
                        <Text className={styles.trustBadgeText}>✓ VERIFIED</Text>
                      </View>
                    </View>

                    {/* Typography details */}
                    <View className={styles.textWrapper}>
                      <Text className={styles.brandText} numberOfLines={1}>
                        {companyName}
                      </Text>
                      <Text className={styles.cardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className={styles.cardPrice}>
                        {isPriceOnRequest ? "Price on Request" : `₹${item.price}/${item.unit}`}
                      </Text>
                    </View>

                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

    </View>
  );
};

export default IBTrusted;

// --- STYLES ---
const styles = {
  container: "mt-8 bg-slate-50 py-6", 

  outer: "flex flex-row justify-between items-end px-5",

  left: "flex-col",

  kicker: "text-[10px] font-jakarta-bold text-emerald-600 tracking-[0.15em] mb-1 uppercase", 

  heading: "text-[26px] font-jakarta-extrabold text-slate-900 tracking-tighter leading-none", 

  viewAllBtn: 
    "border-b border-slate-900 pb-0.5 active:opacity-50 transition-all",

  viewAllText: "text-slate-900 font-jakarta-bold text-sm tracking-tight", 

  cardsContainer: "mt-6 pl-5",

  scrollContent: {
    paddingRight: 20, 
  },

  card: "mr-4 w-[160px]", 

  imageWrapper: "w-[160px] h-[200px] bg-slate-100 rounded-2xl relative overflow-visible",

  image: {
    width: "100%" as const,
    height: "100%" as const,
    borderRadius: 16,
  },
  trustBadge: "absolute -bottom-2.5 self-center bg-slate-900 border-2 border-white px-2.5 py-1 rounded-full shadow-sm shadow-slate-900/20",
  trustBadgeText: "text-white font-jakarta-extrabold text-[8px] tracking-widest uppercase",

  textWrapper: "mt-5 px-1 items-center", 

  brandText: "text-slate-400 font-jakarta-semibold text-[10px] tracking-wider uppercase mb-1",

  cardTitle: "text-slate-800 font-jakarta-bold text-[14px] tracking-tight leading-snug mb-1 text-center",

  cardPrice: "text-slate-950 font-jakarta-black text-[15px] tracking-tighter",
};