import { fetchWithCache } from "@/utils/apiCache";
import { productCache } from "@/utils/productCache";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";

// ── TypeScript Types ─────────────────────────
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

// ── Memoized Card Component (Prevents re-renders during scrolling) ──
const ProductCard = React.memo(({ item, dynamicStyles, onPress }: { item: Product, dynamicStyles: any, onPress: (item: Product) => void }) => {
  const primaryImage = item.media?.length > 0
    ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
    : "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80";

  const companyName = item.supplier?.business?.companyName || item.supplier?.name || "Verified Seller";
  const isPriceOnRequest = item.priceType === "on_request" || !item.price;

  return (
    <Pressable
      style={{ marginRight: dynamicStyles.cardSpacing, width: dynamicStyles.cardWidth }}
      onPress={() => onPress(item)}
    >
      {({ pressed }) => (
        <View 
          style={{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }} 
        >
          {/* Image Container */}
          <View style={{ width: dynamicStyles.cardWidth, height: dynamicStyles.cardHeight }} className="bg-slate-100 rounded-2xl relative overflow-visible">
            <Image
              source={{ uri: primaryImage }}
              style={{ width: '100%', height: '100%', borderRadius: 16 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk" // Aggressive caching for performance
            />
            
            {/* Trust Badge */}
            <View className="absolute -bottom-2.5 self-center bg-slate-900 border-2 border-white px-2.5 py-1 rounded-full shadow-sm shadow-slate-900/20">
              <Text style={dynamicStyles.trustBadgeText} className="text-white font-jakarta-extrabold uppercase">
                ✓ VERIFIED
              </Text>
            </View>
          </View>

          {/* Typography details */}
          <View className="mt-5 px-1 items-center">
            <Text style={dynamicStyles.brandText} className="text-slate-400 font-jakarta-semibold uppercase mb-1" numberOfLines={1}>
              {companyName}
            </Text>
            <Text style={dynamicStyles.cardTitle} className="text-slate-800 font-jakarta-bold leading-snug mb-1 text-center" numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={dynamicStyles.cardPrice} className="text-slate-950 font-jakarta-black tracking-tighter">
              {isPriceOnRequest ? "Price on Request" : `₹${item.price}/${item.unit}`}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
});

const IBTrusted = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { width: screenWidth } = useWindowDimensions();

  // ── Responsive Scaling Engine ──
  const scale = useMemo(() => {
    const isTablet = screenWidth >= 768;
    return isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));
  }, [screenWidth]);

  const dynamicStyles = useMemo(() => {
    const containerPadding = 20 * scale;
    // Calculate card width so exactly ~2.4 cards show on screen, hinting there is more to scroll
    const cardWidth = (screenWidth - (containerPadding * 2)) / 2.3; 
    
    return {
      containerPadding,
      paddingVertical: 24 * scale,
      kickerText: { fontSize: 10 * scale, letterSpacing: 1.5 * scale },
      headingText: { fontSize: 26 * scale },
      viewAllText: { fontSize: 14 * scale },
      cardWidth,
      cardHeight: cardWidth * 1.25,
      cardSpacing: 16 * scale,
      trustBadgeText: { fontSize: 8 * scale, letterSpacing: 1.5 * scale },
      brandText: { fontSize: 10 * scale, letterSpacing: 0.5 * scale },
      cardTitle: { fontSize: 14 * scale },
      cardPrice: { fontSize: 15 * scale },
    };
  }, [scale, screenWidth]);

  useEffect(() => {
    const fetchTrustedProducts = async () => {
      try {
        // CHANGED: Endpoint updated to fetch titanium dioxide instead of led-display-board
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/categories/sub/titanium-dioxide/Delhi");
        if (json.success && json.data && json.data.products) {
          setProducts(json.data.products.slice(0, 10)); 
        }
      } catch (error) {
        console.error("Error fetching trusted products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrustedProducts();
  }, []);

  const handleCardPress = useCallback((item: Product) => {
    productCache[item._id] = item;
    router.push({
      pathname: "/Products_Page/[slug]",
      params: {
        slug: item.slug,
        productId: item._id,
      },
    });
  }, [router]);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard item={item} dynamicStyles={dynamicStyles} onPress={handleCardPress} />
  ), [dynamicStyles, handleCardPress]);

  return (
    <View style={{ paddingVertical: dynamicStyles.paddingVertical }} className="mt-3 bg-slate-50">
      
      {/* Header Section */}
      <View style={{ paddingHorizontal: dynamicStyles.containerPadding }} className="flex flex-row justify-between items-end">
        <View className="flex-col">
          <Text style={dynamicStyles.kickerText} className="font-jakarta-bold text-emerald-600 mb-1 uppercase">
            CERTIFIED
          </Text>
          <Text style={dynamicStyles.headingText} className="font-jakarta-extrabold text-slate-900 tracking-tighter leading-none">
            IB Trusted
          </Text>
        </View>

        <Pressable 
          className="border-b border-slate-900 pb-0.5 active:opacity-50 transition-all"
          hitSlop={8}
          onPress={() => router.push({
            pathname: "/Products_Page",
            params: {
              // CHANGED: Updated the route parameters for the "Explore" button
              subCategorySlug: "titanium-dioxide",
              subCategoryName: "Titanium Dioxide",
            }
          })}
        >
          <Text style={dynamicStyles.viewAllText} className="text-slate-900 font-jakarta-bold tracking-tight">
            Explore
          </Text>
        </Pressable>
      </View>

      {/* Horizontal List or Loading state */}
      {isLoading ? (
        <View className="py-12 justify-center items-center">
          <ActivityIndicator size="small" color="#059669" />
        </View>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          className="mt-6"
          contentContainerStyle={{ paddingLeft: dynamicStyles.containerPadding, paddingRight: dynamicStyles.containerPadding }}
          snapToInterval={dynamicStyles.cardWidth + dynamicStyles.cardSpacing}
          decelerationRate="fast"
          // Memory & CPU Optimizations
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={3}
          removeClippedSubviews={true} // Offloads off-screen views completely on Android
        />
      )}

    </View>
  );
};

export default React.memo(IBTrusted);