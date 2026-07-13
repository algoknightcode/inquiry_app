import { useRole } from "@/contexts/RoleContext";
import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { logProductInteraction } from "@/utils/notificationService";
import { setProductCache } from "@/utils/productCache";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import EnquiryModal from "../../EnquiryModal";
// 1. Import Reanimated for UI-Thread animations
import Animated, {
  SharedValue,
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  useAnimatedRef,
  useSharedValue,
  cancelAnimation,
  scrollTo,
  withRepeat,
  withTiming,
  withDelay,
} from "react-native-reanimated";


// ── Types ──────────────────────────────────────────────────────────────────
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

// Helper function to process array items with a concurrency limit
async function batchRequests<T, R>(
  items: T[], 
  limit: number, 
  requestFn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  
  const runWorker = async (iterator: IterableIterator<[number, T]>) => {
    for (const [index, item] of iterator) {
      try {
        results[index] = await requestFn(item);
      } catch (error) {
        console.error(`Failed at index ${index}:`, error);
      }
    }
  };

  const iterator = items.entries();
  const workers = Array(Math.min(items.length, limit))
    .fill(null)
    .map(() => runWorker(iterator));

  await Promise.all(workers);
  return results.filter(Boolean);
}

// ── Cache Loader ───────────────────────────────────────────────────────────
function getInitialCachedProducts(): { products: Product[]; categoryId: string | null } {
  try {
    const treeJson = getCacheSync("https://backend.inquirybazaar.com/api/industries/tree");
    if (treeJson?.success && Array.isArray(treeJson.data)) {
      const industry = treeJson.data.find(
        (ind: any) =>
          ind.name?.toLowerCase().includes("plants") ||
          ind.name?.toLowerCase().includes("machinery")
      );
      if (industry && industry.categories) {
        const categoryObj = industry.categories.find(
          (cat: any) =>
            cat.name?.toLowerCase().includes("machines") ||
            cat.name?.toLowerCase().includes("equipment")
        );
        if (categoryObj) {
          const categoryId = categoryObj._id;
          if (categoryObj.subCategories?.length) {
            const subCats = categoryObj.subCategories;
            const allProducts: Product[] = [];
            for (const sub of subCats) {
              const resJson = getCacheSync(`https://backend.inquirybazaar.com/api/categories/sub/${sub.slug}/Delhi`);
              if (resJson?.success && Array.isArray(resJson.data?.products)) {
                allProducts.push(...resJson.data.products);
              }
            }
            if (allProducts.length > 0) {
              return { products: allProducts.slice(0, 10), categoryId };
            }
          }
          return { products: [], categoryId };
        }
      }
    }
  } catch (e) {
    // Fail-safe
  }
  return { products: [], categoryId: null };
}

// ── Constants for Auto-Scroll & Rigid Alignment ──
const CARD_WIDTH = 160;
const CARD_MARGIN = 16;
const ITEM_SIZE = CARD_WIDTH + CARD_MARGIN;
const TITLE_HEIGHT = 36; 
const PRICE_HEIGHT = 20; 

// ── Memoized Static Card Component ──
const ProductCard = React.memo(
  ({
    item,
    onPress,
    onQuotePress,
  }: {
    item: Product;
    onPress: (item: Product) => void;
    onQuotePress: (item: Product) => void;
  }) => {
    const primaryImage =
      item.media && item.media.length > 0
        ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
        : "https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80";

    const company = item.supplier?.business?.companyName || item.supplier?.name || "Manufacturer";
    const isPriceOnRequest = item.priceType === "on_request" || !item.price;

    return (
      <Pressable style={flatStyles.card} onPress={() => onPress(item)}>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }], flex: 1 }}>
            
            <View style={flatStyles.imageWrapper}>
              <Image
                source={{ uri: primaryImage }}
                style={flatStyles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0} // 2. Instant render, no GPU transition cost
              />
            </View>

            <View style={flatStyles.content}>
              <Text style={flatStyles.company} numberOfLines={1}>
                {company}
              </Text>

              <View style={{ height: TITLE_HEIGHT, justifyContent: 'flex-start' }}>
                <Text style={flatStyles.title} numberOfLines={2} ellipsizeMode="tail">
                  {item.name}
                </Text>
              </View>

              <View style={[flatStyles.priceContainer, { height: PRICE_HEIGHT }]}>
                {isPriceOnRequest ? (
                  <Text style={flatStyles.priceRequest}>Price on Request</Text>
                ) : (
                  <Text style={flatStyles.price} numberOfLines={1} adjustsFontSizeToFit>
                    ₹{item.price.toLocaleString()}
                    <Text style={flatStyles.unit}> / {item.unit || "pc"}</Text>
                  </Text>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onQuotePress(item)}
                style={flatStyles.quoteBtn}
              >
                <Text style={flatStyles.quoteBtnText}>Request Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>
    );
  }
);

// ── Skeleton Loader Component ──
const SkeletonProductCard = () => (
  <View style={flatStyles.card}>
    <View style={[flatStyles.imageWrapper, { backgroundColor: '#e2e8f0' }]} />
    <View style={flatStyles.content}>
      <View style={{ height: 12, backgroundColor: '#e2e8f0', borderRadius: 4, width: '80%', marginBottom: 4 }} />
      <View style={{ height: TITLE_HEIGHT, justifyContent: 'flex-start', gap: 4 }}>
        <View style={{ height: 14, backgroundColor: '#e2e8f0', borderRadius: 4, width: '100%' }} />
        <View style={{ height: 14, backgroundColor: '#e2e8f0', borderRadius: 4, width: '60%' }} />
      </View>
      <View style={[flatStyles.priceContainer, { height: PRICE_HEIGHT }]}>
        <View style={{ height: 16, backgroundColor: '#e2e8f0', borderRadius: 4, width: '50%' }} />
      </View>
      <View style={[flatStyles.quoteBtn, { backgroundColor: '#e2e8f0' }]} />
    </View>
  </View>
);

const NewOnes = ({ isScrolling }: { isScrolling?: SharedValue<boolean> }) => {
  const isFocused = useIsFocused();
  const router = useRouter();
  const { globalBuyerId, globalSellerId, userRole } = useRole();

  // Data State
  // 🔥 FIX: Zero UI layout footprint during mount phases
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoryObjId, setCategoryObjId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Reanimated UI-thread variables
  const flatListRef = useAnimatedRef<Animated.FlatList<Product>>();
  const scrollIndex = useSharedValue(0);
  const isAutoPlaying = useSharedValue(false);
  const autoplayPulse = useSharedValue(0);

  // Fetch Data
  useEffect(() => {
    let active = true;

    // 🚀 JS Thread protection: Let the main page render first before mounting the heavy list
    const mountTimer = setTimeout(() => {
      if (active) setIsLoading(false);
    }, 250);

    const fetchCategoryProducts = async () => {
      try {
        // Safe asynchronous cache recovery during initial mounting
        const cacheData = getInitialCachedProducts();
        if (cacheData.products && cacheData.products.length > 0 && active) {
          setProductsList(cacheData.products);
          setCategoryObjId(cacheData.categoryId);
        }

        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");
        if (json.success && json.data && active) {
          const industry = json.data.find(
            (ind: any) => ind.name?.toLowerCase().includes("plants") || ind.name?.toLowerCase().includes("machinery")
          );
          if (industry && industry.categories) {
            const categoryObj = industry.categories.find(
              (cat: any) => cat.name?.toLowerCase().includes("machines") || cat.name?.toLowerCase().includes("equipment")
            );
            if (categoryObj) {
              if (active) setCategoryObjId(categoryObj._id);
              if (categoryObj.subCategories) {
                const allProductsArrays = await batchRequests(
                  categoryObj.subCategories,
                  3, // Maximum 3 concurrent requests
                  async (sub: any) => {
                    try {
                      const resJson = await fetchWithCache(`https://backend.inquirybazaar.com/api/categories/sub/${sub.slug}/Delhi`);
                      if (resJson.success && resJson.data && resJson.data.products) {
                        return resJson.data.products;
                      }
                    } catch (e) {
                      // Fail gracefully
                    }
                    return [];
                  }
                );
                const flattened = allProductsArrays.flat().slice(0, 10);
                if (active) {
                  setProductsList((prev) => {
                    if (prev.length === flattened.length && prev[0]?._id === flattened[0]?._id) return prev;
                    return flattened;
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching B2B products:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchCategoryProducts();

    return () => {
      active = false;
      clearTimeout(mountTimer);
    };
  }, []);

  // 4. Reduced Infinite Scroll Array Size (30 instead of 100)
  const replicatedData = useMemo(() => {
    if (!productsList || productsList.length === 0) return [];
    return Array(3).fill(productsList).flat();
  }, [productsList]);

  const baseMiddleIndex = useMemo(() => {
    if (replicatedData.length === 0) return 0;
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % productsList.length);
  }, [replicatedData.length, productsList.length]);

  // Autoplay timer ref
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoPlay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (productsList.length <= 0) return;

    autoplayTimerRef.current = setInterval(() => {
      if (!isFocused || isModalVisible || (isScrolling && isScrolling.value)) {
        return;
      }

      scrollIndex.value = scrollIndex.value + 1;
      
      // Scroll to the next index smoothly
      flatListRef.current?.scrollToIndex({
        index: scrollIndex.value,
        animated: true,
      });

      // Handle wrapping at the bounds
      if (scrollIndex.value >= replicatedData.length - 2) {
        const remainder = scrollIndex.value % productsList.length;
        const safeIndex = baseMiddleIndex + remainder;
        scrollIndex.value = safeIndex;
        // Wait for the slide animation to finish before snapping back to the middle
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: safeIndex,
            animated: false,
          });
        }, 500);
      }
    }, 4000);
  }, [isFocused, isModalVisible, productsList.length, replicatedData.length, baseMiddleIndex, isScrolling, stopAutoPlay]);

  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling) => {
      if (scrolling) {
        runOnJS(stopAutoPlay)();
      } else {
        runOnJS(startAutoPlay)();
      }
    },
    [startAutoPlay, stopAutoPlay]
  );

  useEffect(() => {
    if (replicatedData.length > 0 && productsList.length > 0) {
      if (isFocused && !isModalVisible) {
        scrollIndex.value = baseMiddleIndex;
        const initTimer = setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: baseMiddleIndex, animated: false });
          startAutoPlay();
        }, 500);

        return () => {
          clearTimeout(initTimer);
          stopAutoPlay();
        };
      } else {
        stopAutoPlay();
      }
    }
  }, [isFocused, replicatedData, baseMiddleIndex, productsList.length, isModalVisible, startAutoPlay, stopAutoPlay]);

  // ── Manual Scroll Handling ──
  const handleScrollBegin = useCallback(() => {
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    let currentIndex = Math.round(scrollOffset / ITEM_SIZE);

    if (currentIndex < 2 || currentIndex > replicatedData.length - 3) {
      const remainder = currentIndex % productsList.length;
      currentIndex = baseMiddleIndex + remainder;
      flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
    }

    scrollIndex.value = currentIndex;
    startAutoPlay();
  }, [ITEM_SIZE, replicatedData.length, productsList.length, baseMiddleIndex, startAutoPlay]);

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 500);
  }, []);

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
    router.push({
      pathname: "/Products_Page/[slug]",
      params: { slug: item.slug, productId: item._id },
    });
  }, [router, globalBuyerId, globalSellerId, userRole]);

  const handleOpenQuote = useCallback((item: Product) => {
    setSelectedProduct(item);
    setIsModalVisible(true);
  }, []);

  const renderProductCard = useCallback(({ item }: { item: Product }) => (
    <ProductCard 
      item={item} 
      onPress={handleCardPress} 
      onQuotePress={handleOpenQuote} 
    />
  ), [handleCardPress, handleOpenQuote]);

  const keyExtractor = useCallback((_: any, index: number) => index.toString(), []);
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_SIZE,
    offset: ITEM_SIZE * index,
    index,
  }), []);

  return (
    <View style={flatStyles.container}>
      {/* Header */}
      <View style={flatStyles.header}>
        <View>
          <Text style={flatStyles.subTitle}>MACHINERY & EQUIPMENTS</Text>
          <Text style={flatStyles.mainTitle}>Industrial Machinery</Text>
        </View>
        <Pressable
          style={flatStyles.viewAll}
          onPress={() => {
            if (categoryObjId) {
              router.push({
                pathname: "/SubCategory",
                params: { categoryId: categoryObjId },
              });
            }
          }}
        >
          <Text style={flatStyles.viewAllText}>View All</Text>
        </Pressable>
      </View>

      {/* List */}
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={flatStyles.listContent}
        >
          {[...Array(4)].map((_, i) => (
            <SkeletonProductCard key={`skeleton-${i}`} />
          ))}
        </ScrollView>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={replicatedData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderProductCard}
          contentContainerStyle={flatStyles.listContent}
          
          snapToInterval={ITEM_SIZE}
          snapToAlignment="start"
          
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          
          getItemLayout={getItemLayout}
          initialNumToRender={5}
          initialScrollIndex={baseMiddleIndex}
          windowSize={11}
          updateCellsBatchingPeriod={40} // 6. Optimized React Native Batching
          removeClippedSubviews={false}
        />
      )}

      <EnquiryModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} product={selectedProduct} />
    </View>
  );
};

export default React.memo(NewOnes);

// ── 7. Static Styles ──
const flatStyles = StyleSheet.create({
  container: {
    marginTop: 32,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#64748b",
    letterSpacing: 1.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans-ExtraBold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  viewAll: {
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#0f172a",
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 12,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_MARGIN,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    flexDirection: 'column',
    height: 256, 
  },
  imageWrapper: {
    height: 110,
    backgroundColor: "#f8fafc",
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  company: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#3b82f6",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#1e293b",
    lineHeight: 18,
  },
  priceContainer: {
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans-ExtraBold",
    color: "#0f172a",
  },
  unit: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans-Medium",
    color: "#64748b",
  },
  priceRequest: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#d97706",
  },
  quoteBtn: {
    backgroundColor: "#0E2347",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  quoteBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-ExtraBold',
    color: '#0f172a',
  },
  modalProductInfo: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalProductText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#64748b',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    color: '#0f172a',
  },
  submitBtn: {
    backgroundColor: '#0E2347',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});