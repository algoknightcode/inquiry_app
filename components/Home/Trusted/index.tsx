import { useRole } from "@/contexts/RoleContext";
import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { logProductInteraction } from "@/utils/notificationService";
import { setProductCache } from "@/utils/productCache";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
// 1. Reanimated hooks for UI-thread animation
import Animated, {
  cancelAnimation,
  runOnUI,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import EnquiryModal from "../../EnquiryModal";

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

type DynamicLayout = {
  cardWidth: number;
  cardHeight: number;
  cardSpacing: number;
  containerPadding: number;
  ITEM_SIZE: number;
  totalListHeight: number;
};

// ── Cache Loader ───────────────────────────────────────────────────────────
const TRUSTED_URL = "https://backend.inquirybazaar.com/api/categories/sub/titanium-dioxide/Delhi";
function getInitialCachedTrustedProducts(): Product[] {
  try {
    const json = getCacheSync(TRUSTED_URL);
    if (json.success && json.data?.products) {
      const sliced = json.data.products.slice(0, 10);
      
      const urlsToPrefetch = sliced
        .map((item: Product) => {
          if (item.media && item.media.length > 0) {
            return (item.media.find((m) => m.isPrimary) || item.media[0]).url;
          }
          return null;
        })
        .filter(Boolean) as string[]; 

      if (urlsToPrefetch.length > 0) {
        Image.prefetch(urlsToPrefetch).catch(err => 
          console.warn("Prefetch failed", err)
        );
      }

      return sliced;
    }
  } catch (err) {
    console.warn("Error getting initial cached products:", err);
  }
  return [];
}

const staticStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: "#f8fafc",
    paddingBottom: 0,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  kickerText: {
    fontFamily: "jakarta-bold",
    color: "#059669",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headingText: {
    fontFamily: "jakarta-extrabold",
    color: "#0f172a",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  exploreButton: {
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
    paddingBottom: 2,
  },
  exploreText: {
    color: "#0f172a",
    fontFamily: "jakarta-bold",
    letterSpacing: -0.2,
  },
  imageContainer: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    position: "relative",
    overflow: "visible",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  trustBadge: {
    position: "absolute",
    bottom: -10,
    alignSelf: "center",
    backgroundColor: "#0f172a",
    borderWidth: 2,
    borderColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  trustBadgeText: {
    color: "white",
    fontFamily: "jakarta-extrabold",
    textTransform: "uppercase",
  },
  cardContent: {
    marginTop: 20,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandText: {
    color: "#94a3b8",
    fontFamily: "jakarta-semibold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cardTitle: {
    color: "#1e293b",
    fontFamily: "jakarta-bold",
    marginBottom: 4,
    textAlign: "center",
  },
  cardPrice: {
    color: "#020617",
    fontFamily: "jakarta-black",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 4,
    gap: 6,
  },
  quoteButton: {
    backgroundColor: "#0E2347",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  quoteButtonText: {
    color: "white",
    fontFamily: "jakarta-bold",
    letterSpacing: 0.5,
  },
  callButton: {
    backgroundColor: "#059669",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ── Memoized Card Component ──
const ProductCard = React.memo(
  ({
    item,
    layout,
    fontScale,
    onPress,
    onQuotePress,
  }: {
    item: Product;
    layout: DynamicLayout;
    fontScale: number;
    onPress: (item: Product) => void;
    onQuotePress: (item: Product) => void;
  }) => {
    const primaryImage =
      item.media?.length > 0
        ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
        : "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80";

    const companyName =
      item.supplier?.business?.companyName || item.supplier?.name || "Verified Seller";
    const isPriceOnRequest = item.priceType === "on_request" || !item.price;

    return (
      <View style={{ marginRight: layout.cardSpacing, width: layout.cardWidth }}>
        {/* Tappable image + info area */}
        <Pressable onPress={() => onPress(item)}>
          {({ pressed }) => (
            <View style={{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }}>
              {/* Image Container */}
              <View style={[staticStyles.imageContainer, { width: layout.cardWidth, height: layout.cardHeight }]}>
                <Image
                  source={{ uri: primaryImage }}
                  style={staticStyles.image}
                  contentFit="cover"
                  transition={0}
                  cachePolicy="memory-disk"
                  recyclingKey={primaryImage}
                />
                <View style={staticStyles.trustBadge}>
                  <Text style={[staticStyles.trustBadgeText, { fontSize: 10 * fontScale, letterSpacing: 1.5 * fontScale }]}>
                    ✓ VERIFIED
                  </Text>
                </View>
              </View>

              {/* Typography */}
              <View style={[staticStyles.cardContent, { paddingBottom: 0 }]}>
                <View style={{ alignItems: "center", width: "100%" }}>
                  <Text style={[staticStyles.brandText, { fontSize: 12 * fontScale, letterSpacing: 0.5 * fontScale }]} numberOfLines={1}>
                    {companyName}
                  </Text>
                  <Text style={[staticStyles.cardTitle, { fontSize: 16 * fontScale }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[staticStyles.cardPrice, { fontSize: 17 * fontScale }]}>
                    {isPriceOnRequest ? "Price on Request" : `₹${item.price}${item.unit ? `/${item.unit}` : ""}`}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Pressable>

        {/* Quote Button — TouchableOpacity for reliable background rendering */}
        <View style={{ paddingHorizontal: 4, marginTop: 8, width: layout.cardWidth }}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onQuotePress(item)}
            style={[staticStyles.quoteButton, { height: 38 * fontScale }]}
          >
            <Text style={[staticStyles.quoteButtonText, { fontSize: 13 * fontScale }]} numberOfLines={1}>
              Request Quote
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

// ── Skeleton Loader Component ──
const SkeletonProductCard = ({ layout }: { layout?: DynamicLayout }) => {
  const cardSpacing = layout?.cardSpacing ?? 16;
  const cardWidth = layout?.cardWidth ?? 150;
  const cardHeight = layout?.cardHeight ?? 180;
  return (
    <View style={{ marginRight: cardSpacing, width: cardWidth }}>
      <View style={[{ width: cardWidth, height: cardHeight }, { backgroundColor: '#e2e8f0', borderRadius: 16 }]} />
      <View style={staticStyles.cardContent}>
        <View style={{ alignItems: "center", width: "100%" }}>
          <View style={{ height: 12, backgroundColor: '#e2e8f0', borderRadius: 4, width: '66%', marginBottom: 8 }} />
          <View style={{ height: 16, backgroundColor: '#e2e8f0', borderRadius: 4, width: '100%', marginBottom: 8 }} />
          <View style={{ height: 20, backgroundColor: '#e2e8f0', borderRadius: 4, width: '50%', marginBottom: 12 }} />
        </View>
        <View style={staticStyles.buttonContainer}>
          <View style={{ flex: 1, height: 36, backgroundColor: '#e2e8f0', borderRadius: 8 }} />
        </View>
      </View>
    </View>
  );
};

const IBTrusted = ({ isScrolling }: { isScrolling?: SharedValue<boolean> }) => {
  const isFocused = useIsFocused();
  const router = useRouter();
  const { globalBuyerId, globalSellerId, userRole } = useRole();
  const initialProducts = getInitialCachedTrustedProducts();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { width: screenWidth } = useWindowDimensions();

  // 3. UI-Thread Animation Hooks
  const flatListRef = useAnimatedRef<Animated.FlatList<Product>>();
  const scrollIndex = useSharedValue(0);
  const isAutoPlaying = useSharedValue(false);

  // ── Layout Memoization ──
  const scale = useMemo(() => {
    const isTablet = screenWidth >= 768;
    return isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));
  }, [screenWidth]);

  const layout = useMemo<DynamicLayout>(() => {
    const containerPadding = 20 * scale;
    const cardWidth = (screenWidth - containerPadding * 2) / 2.3;
    const cardSpacing = 16 * scale;
    const cardHeight = cardWidth * 1.25;
    const totalListHeight = cardHeight + (180 * scale);
    return {
      cardWidth,
      cardHeight,
      cardSpacing,
      containerPadding,
      ITEM_SIZE: cardWidth + cardSpacing,
      totalListHeight,
    };
  }, [scale, screenWidth]);

  useEffect(() => {
    // 🚀 JS Thread protection: Let the main page render first before mounting the heavy list
    const mountTimer = setTimeout(() => {
      setIsLoading(false);
    }, 250);

    const fetchTrustedProducts = async () => {
      try {
        const json = await fetchWithCache(TRUSTED_URL);
        if (json.success && json.data?.products) {
          const sliced = json.data.products.slice(0, 10);
          setProducts((prev) => {
            if (prev.length === sliced.length && prev[0]?._id === sliced[0]?._id) return prev;
            return sliced;
          });
        }
      } catch (error) {
        console.error("Error fetching Trusted products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrustedProducts();

    return () => {
      clearTimeout(mountTimer);
    };
  }, []);

  const replicatedData = useMemo(() => {
    if (!products || products.length === 0) return [];
    return Array(3).fill(products).flat();
  }, [products]);

  const baseMiddleIndex = useMemo(() => {
    if (replicatedData.length === 0) return 0;
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % products.length);
  }, [replicatedData.length, products.length]);

  // ── 4. Reanimated UI-Thread Autoplay Loop ──
  const autoplayPulse = useSharedValue(0);

  const startAutoPlayUI = () => {
    'worklet';
    if (products.length <= 0) return;
    autoplayPulse.value = 0;
    autoplayPulse.value = withRepeat(
      withTiming(1, { duration: 5000 }),
      -1
    );
  };

  const stopAutoPlayUI = () => {
    'worklet';
    cancelAnimation(autoplayPulse);
  };

  // Listen to autoplay pulse and scroll
  useAnimatedReaction(
    () => autoplayPulse.value,
    (currentPulse, prevPulse) => {
      if (!isFocused || (isScrolling && isScrolling.value)) {
        return;
      }
      if (prevPulse !== null && currentPulse < prevPulse && prevPulse > 0.9 && currentPulse < 0.1) {
        if (!isAutoPlaying.value) {
          return; // Don't scroll if user is dragging
        }
        
        scrollIndex.value = scrollIndex.value + 1;
        scrollTo(flatListRef, scrollIndex.value * layout.ITEM_SIZE, 0, true);
        
        // Infinite loop: reset when reaching end
        if (scrollIndex.value >= replicatedData.length - 2) {
          const remainder = scrollIndex.value % products.length;
          const safeIndex = baseMiddleIndex + remainder;
          scrollIndex.value = safeIndex;
          scrollTo(flatListRef, safeIndex * layout.ITEM_SIZE, 0, false);
        }
      }
    },
    [isFocused, isScrolling]
  );

  useEffect(() => {
    if (replicatedData.length > 0 && products.length > 0) {
      if (isFocused && !isModalVisible) {
        // Initialize position
        scrollIndex.value = baseMiddleIndex;
        const initTimer = setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: baseMiddleIndex, animated: false });
          
          // Start UI Thread Loop
          runOnUI(() => {
            'worklet';
            isAutoPlaying.value = true;
            startAutoPlayUI();
          })();
        }, 500);

        return () => {
          clearTimeout(initTimer);
          runOnUI(stopAutoPlayUI)();
          isAutoPlaying.value = false;
        };
      } else {
        runOnUI(stopAutoPlayUI)();
        isAutoPlaying.value = false;
      }
    }
  }, [isFocused, replicatedData, baseMiddleIndex, products.length, isModalVisible]);

  // ── Manual Scroll Handling ──
  const handleScrollBegin = useCallback(() => {
    runOnUI(() => {
      'worklet';
      isAutoPlaying.value = false;
      stopAutoPlayUI();
    })();
  }, [isAutoPlaying]);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    let currentIndex = Math.round(scrollOffset / layout.ITEM_SIZE);

    // Infinite Loop Snap-back adjusted for shorter array
    if (currentIndex < 2 || currentIndex > replicatedData.length - 3) {
      const remainder = currentIndex % products.length;
      currentIndex = baseMiddleIndex + remainder;
      flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
    }

    scrollIndex.value = currentIndex;
    
    // Restart Autoplay
    runOnUI(() => {
      'worklet';
      isAutoPlaying.value = true;
      startAutoPlayUI();
    })();
  }, [layout.ITEM_SIZE, replicatedData.length, products.length, baseMiddleIndex, scrollIndex, flatListRef, isAutoPlaying]);

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 500);
  }, [flatListRef]);

  // ── Actions ──
  const handleCardPress = useCallback((item: Product) => {
    setProductCache(item._id, item);
    logProductInteraction(
      item.name,
      item._id,
      globalBuyerId,
      globalSellerId,
      userRole as "buyer" | "seller",
      item
    );
    router.push({ pathname: "/Products_Page/[slug]", params: { slug: item.slug, productId: item._id } });
  }, [router, globalBuyerId, globalSellerId, userRole]);

  const handleOpenQuote = useCallback((item: Product) => {
    setSelectedProduct(item);
    setIsModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      item={item}
      layout={layout}
      fontScale={scale}
      onPress={handleCardPress}
      onQuotePress={handleOpenQuote}
    />
  ), [layout, scale, handleCardPress, handleOpenQuote]);

  const keyExtractor = useCallback((item: Product | undefined, index: number) => item ? `${item._id || 'brand'}-${index}` : `empty-${index}`, []);
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: layout.ITEM_SIZE,
    offset: layout.ITEM_SIZE * index,
    index,
  }), [layout.ITEM_SIZE]);

  return (
    <View style={[staticStyles.container, { paddingTop: 24 * scale, paddingBottom: 24 * scale }]}>
      {/* Header */}
      <View style={[staticStyles.headerContainer, { paddingHorizontal: layout.containerPadding }]}>
        <View style={{ flexDirection: "column" }}>
          <Text style={[staticStyles.kickerText, { fontSize: 12 * scale, letterSpacing: 1.5 * scale }]}>
            CERTIFIED
          </Text>
          <Text style={[staticStyles.headingText, { fontSize: 23 * scale }]}>
            Inquiry Bazzar Trusted
          </Text>
        </View>

        <Pressable
          style={staticStyles.exploreButton}
          hitSlop={8}
          onPress={() => router.push({ pathname: "/Products_Page", params: { subCategorySlug: "titanium-dioxide", subCategoryName: "Titanium Dioxide" } })}
        >
          <Text style={[staticStyles.exploreText, { fontSize: 16 * scale }]}>Explore</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={{ marginTop: 24, height: layout.totalListHeight }}
          contentContainerStyle={{ paddingLeft: layout.containerPadding, paddingBottom: 28 }}
        >
          {[...Array(4)].map((_, i) => (
            <SkeletonProductCard key={`skeleton-${i}`} layout={layout} />
          ))}
        </ScrollView>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={replicatedData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={{ marginTop: 24, height: layout.totalListHeight }}
          contentContainerStyle={{
            paddingLeft: layout.containerPadding,
            paddingRight: layout.containerPadding + layout.cardWidth, 
            paddingBottom: 28,
          }}
          snapToInterval={layout.ITEM_SIZE}
          snapToAlignment="start"
          decelerationRate="fast"
          
          // Interactions
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}

          // FlatList Optimizations
         removeClippedSubviews={Platform.OS === 'android'} // Safely destroys hidden views
          getItemLayout={getItemLayout}
          initialNumToRender={4}
          maxToRenderPerBatch={6}      // Increased to handle faster swiping
          windowSize={3}               // Tightened the render window to save RAM
          updateCellsBatchingPeriod={30} // Faster batch processing
        />
      )}

      <EnquiryModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} product={selectedProduct} />
    </View>
  );
};

export default React.memo(IBTrusted);