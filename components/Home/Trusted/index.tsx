import { fetchWithCache } from "@/utils/apiCache";
import { productCache } from "@/utils/productCache";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
// 1. Reanimated hooks for UI-thread animation
import Animated, {
  runOnUI,
  scrollTo,
  useAnimatedRef,
  useSharedValue,
  useAnimatedReaction,
  withRepeat,
  withTiming,
  cancelAnimation,
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
};

// ── 2. Static Styles Extracted from Component ──
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
    shadowColor: "#0f172a",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
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
    flex: 1,
    backgroundColor: "#0E2347",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0E2347",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
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
    shadowColor: "#059669",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
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
      <Pressable
        style={{ marginRight: layout.cardSpacing, width: layout.cardWidth }}
        onPress={() => onPress(item)}
      >
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
              />
              <View style={staticStyles.trustBadge}>
                <Text style={[staticStyles.trustBadgeText, { fontSize: 10 * fontScale, letterSpacing: 1.5 * fontScale }]}>
                  ✓ VERIFIED
                </Text>
              </View>
            </View>

            {/* Typography & Buttons */}
            <View style={staticStyles.cardContent}>
              <View style={{ alignItems: "center", width: "100%" }}>
                <Text style={[staticStyles.brandText, { fontSize: 12 * fontScale, letterSpacing: 0.5 * fontScale }]} numberOfLines={1}>
                  {companyName}
                </Text>
                <Text style={[staticStyles.cardTitle, { fontSize: 16 * fontScale }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[staticStyles.cardPrice, { fontSize: 17 * fontScale }]}>
                  {isPriceOnRequest ? "Price on Request" : `₹${item.price}/${item.unit}`}
                </Text>
              </View>

              <View style={staticStyles.buttonContainer}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onQuotePress(item)} style={staticStyles.quoteButton}>
                  <Text style={[staticStyles.quoteButtonText, { fontSize: 13 * fontScale }]} numberOfLines={1}>
                    Request Quote
                  </Text>
                </TouchableOpacity>

                {item.supplier?.phone && (
                  <TouchableOpacity activeOpacity={0.8} onPress={() => Linking.openURL(`tel:${item.supplier.phone}`)} style={staticStyles.callButton}>
                    <Ionicons name="call" size={16} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </Pressable>
    );
  }
);

// ── Skeleton Loader Component ──
const SkeletonProductCard = ({ layout }: { layout: DynamicLayout }) => (
  <View style={{ marginRight: layout.cardSpacing, width: layout.cardWidth }}>
    <View style={[{ width: layout.cardWidth, height: layout.cardHeight }, { backgroundColor: '#e2e8f0', borderRadius: 16 }]} />
    <View style={staticStyles.cardContent}>
      <View style={{ alignItems: "center", width: "100%" }}>
        <View style={{ height: 12, backgroundColor: '#e2e8f0', borderRadius: 4, width: '66%', marginBottom: 8 }} />
        <View style={{ height: 16, backgroundColor: '#e2e8f0', borderRadius: 4, width: '100%', marginBottom: 8 }} />
        <View style={{ height: 20, backgroundColor: '#e2e8f0', borderRadius: 4, width: '50%', marginBottom: 12 }} />
      </View>
      <View style={staticStyles.buttonContainer}>
        <View style={{ flex: 1, height: 36, backgroundColor: '#e2e8f0', borderRadius: 8 }} />
        <View style={{ width: 36, height: 36, backgroundColor: '#e2e8f0', borderRadius: 8 }} />
      </View>
    </View>
  </View>
);

const IBTrusted = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
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
    return {
      cardWidth,
      cardHeight: cardWidth * 1.25,
      cardSpacing,
      containerPadding,
      ITEM_SIZE: cardWidth + cardSpacing,
    };
  }, [scale, screenWidth]);

  useEffect(() => {
    const fetchTrustedProducts = async () => {
      try {
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/categories/sub/titanium-dioxide/Delhi");
        if (json.success && json.data?.products) {
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

  const replicatedData = useMemo(() => {
    if (!products || products.length === 0) return [];
    return Array(30).fill(products).flat();
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
    autoplayPulse.value = withRepeat(
      withTiming(autoplayPulse.value + 1, { duration: 3000 }),
      -1
    );
  };

  const stopAutoPlayUI = () => {
    'worklet';
    cancelAnimation(autoplayPulse);
  };

  // Listen to autoplay pulse and scroll
  useAnimatedReaction(
    () => Math.floor(autoplayPulse.value),
    (currentPulse, prevPulse) => {
      if (currentPulse !== prevPulse && prevPulse !== null && !isAutoPlaying.value) {
        return; // Don't scroll if user is dragging
      }
      
      if (currentPulse !== prevPulse && prevPulse !== null && isAutoPlaying.value) {
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
    }
  );

  useEffect(() => {
    if (replicatedData.length > 0 && products.length > 0) {
      // Initialize position
      scrollIndex.value = baseMiddleIndex;
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: baseMiddleIndex, animated: false });
        
        // Start UI Thread Loop
        runOnUI(() => {
          'worklet';
          isAutoPlaying.value = true;
          startAutoPlayUI();
        })();
      }, 500);

      return () => {
        runOnUI(stopAutoPlayUI)();
        isAutoPlaying.value = false;
      };
    }
  }, [replicatedData, baseMiddleIndex, products.length]);

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

    // Infinite Loop Snap-back
    if (currentIndex < 5 || currentIndex > replicatedData.length - 5) {
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
    productCache[item._id] = item;
    router.push({ pathname: "/Products_Page/[slug]", params: { slug: item.slug, productId: item._id } });
  }, [router]);

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

  const keyExtractor = useCallback((_: any, index: number) => index.toString(), []);
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: layout.ITEM_SIZE,
    offset: layout.ITEM_SIZE * index,
    index,
  }), [layout.ITEM_SIZE]);

  return (
    <View style={[staticStyles.container, { paddingTop: 24 * scale }]}>
      {/* Header */}
      <View style={[staticStyles.headerContainer, { paddingHorizontal: layout.containerPadding }]}>
        <View style={{ flexDirection: "column" }}>
          <Text style={[staticStyles.kickerText, { fontSize: 12 * scale, letterSpacing: 1.5 * scale }]}>
            CERTIFIED
          </Text>
          <Text style={[staticStyles.headingText, { fontSize: 26 * scale }]}>
            IB Trusted
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

      {/* Horizontal List */}
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={{ marginTop: 24 }}
          contentContainerStyle={{ paddingLeft: layout.containerPadding, paddingBottom: 10 }}
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
          style={{ marginTop: 24 }}
          contentContainerStyle={{
            paddingLeft: layout.containerPadding,
            paddingRight: layout.containerPadding + layout.cardWidth, 
            paddingBottom: 10,
          }}
          snapToInterval={layout.ITEM_SIZE}
          snapToAlignment="start"
          decelerationRate="fast"
          
          // Interactions
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}

          // FlatList Optimizations
          getItemLayout={getItemLayout}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          updateCellsBatchingPeriod={40}
          removeClippedSubviews={true} 
        />
      )}

      <EnquiryModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} product={selectedProduct} />
    </View>
  );
};

export default React.memo(IBTrusted);