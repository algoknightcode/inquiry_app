import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { productCache } from "@/utils/productCache";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
// 1. Import Reanimated for UI-Thread animations
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
  const router = useRouter();

  // Data State
  const initialData = getInitialCachedProducts();
  const [productsList, setProductsList] = useState<Product[]>(initialData.products);
  const [categoryObjId, setCategoryObjId] = useState<string | null>(initialData.categoryId);
  const [isLoading, setIsLoading] = useState(initialData.products.length === 0);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 3. Reanimated Auto-scroll Refs
  const flatListRef = useAnimatedRef<Animated.FlatList<Product>>();
  const scrollIndex = useSharedValue(0);
  const isAutoPlaying = useSharedValue(false);

  // Fetch Data
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");
        if (json.success && json.data) {
          const industry = json.data.find(
            (ind: any) => ind.name?.toLowerCase().includes("plants") || ind.name?.toLowerCase().includes("machinery")
          );
          if (industry && industry.categories) {
            const categoryObj = industry.categories.find(
              (cat: any) => cat.name?.toLowerCase().includes("machines") || cat.name?.toLowerCase().includes("equipment")
            );
            if (categoryObj) {
              setCategoryObjId(categoryObj._id);
              if (categoryObj.subCategories) {
                const productRequests = categoryObj.subCategories.map(async (sub: any) => {
                  try {
                    const resJson = await fetchWithCache(`https://backend.inquirybazaar.com/api/categories/sub/${sub.slug}/Delhi`);
                    if (resJson.success && resJson.data && resJson.data.products) {
                      return resJson.data.products;
                    }
                  } catch (e) {
                    // Fail gracefully
                  }
                  return [];
                });
                const allProductsArrays = await Promise.all(productRequests);
                const flattened = allProductsArrays.flat().slice(0, 10);
                setProductsList(flattened);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching B2B products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryProducts();
  }, []);

  // 4. Reduced Infinite Scroll Array Size (30 instead of 100)
  const replicatedData = useMemo(() => {
    if (!productsList || productsList.length === 0) return [];
    return Array(30).fill(productsList).flat();
  }, [productsList]);

  const baseMiddleIndex = useMemo(() => {
    if (replicatedData.length === 0) return 0;
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % productsList.length);
  }, [replicatedData.length, productsList.length]);

  // 5. UI-Thread Autoplay Loop using withRepeat + useAnimatedReaction
  const autoplayPulse = useSharedValue(0);

  const startAutoPlayUI = () => {
    'worklet';
    if (productsList.length <= 0) return;
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
        scrollTo(flatListRef, scrollIndex.value * ITEM_SIZE, 0, true);
        
        // Infinite loop: reset when reaching end
        if (scrollIndex.value >= replicatedData.length - 2) {
          const remainder = scrollIndex.value % productsList.length;
          const safeIndex = baseMiddleIndex + remainder;
          scrollIndex.value = safeIndex;
          scrollTo(flatListRef, safeIndex * ITEM_SIZE, 0, false);
        }
      }
    }
  );

  useEffect(() => {
    if (replicatedData.length > 0 && productsList.length > 0) {
      scrollIndex.value = baseMiddleIndex;
      const initTimer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: baseMiddleIndex, animated: false });
        
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
    }
  }, [replicatedData, baseMiddleIndex, productsList.length]);

  // ── Pause carousel during main feed scroll ──
  useEffect(() => {
    if (!isScrolling) return;

    // When user is scrolling main feed, pause this carousel's autoplay
    if (isScrolling.value) {
      runOnUI(() => {
        'worklet';
        isAutoPlaying.value = false;
        stopAutoPlayUI();
      })();
    } else {
      // Resume autoplay when scroll stops
      runOnUI(() => {
        'worklet';
        if (productsList.length > 0) {
          isAutoPlaying.value = true;
          startAutoPlayUI();
        }
      })();
    }
  }, [isScrolling, productsList.length]);

  // ── Manual Scroll Handling ──
  const handleScrollBegin = useCallback(() => {
    runOnUI(() => {
      'worklet';
      isAutoPlaying.value = false;
    })();
  }, [isAutoPlaying]);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    let currentIndex = Math.round(scrollOffset / ITEM_SIZE);

    if (currentIndex < 5 || currentIndex > replicatedData.length - 5) {
      const remainder = currentIndex % productsList.length;
      currentIndex = baseMiddleIndex + remainder;
      flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
    }

    scrollIndex.value = currentIndex;
    
    runOnUI(() => {
      'worklet';
      isAutoPlaying.value = true;
      startAutoPlayUI();
    })();
  }, [ITEM_SIZE, replicatedData.length, productsList.length, baseMiddleIndex]);

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 500);
  }, [flatListRef]);

  // ── Actions ──
  const handleCardPress = useCallback((item: Product) => {
    productCache[item._id] = item;
    router.push({
      pathname: "/Products_Page/[slug]",
      params: { slug: item.slug, productId: item._id },
    });
  }, [router]);

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
          decelerationRate="fast"
          
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          
          getItemLayout={getItemLayout}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          updateCellsBatchingPeriod={40} // 6. Optimized React Native Batching
          removeClippedSubviews={true}
        />
      )}

      {/* Inline Enquiry Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={flatStyles.modalOverlay}>
          <View style={flatStyles.modalContainer}>
            <View style={flatStyles.modalHeader}>
              <Text style={flatStyles.modalTitle}>Request a Quote</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <View style={flatStyles.modalProductInfo}>
                <Text style={flatStyles.modalProductText} numberOfLines={1}>
                  Product: <Text style={{ color: '#0f172a' }}>{selectedProduct.name}</Text>
                </Text>
              </View>
            )}

            {/* Form Fields */}
            <TextInput style={flatStyles.input} placeholder="Your Name" placeholderTextColor="#94a3b8" />
            <TextInput style={flatStyles.input} placeholder="Phone Number" keyboardType="phone-pad" placeholderTextColor="#94a3b8" />
            <TextInput 
              style={[flatStyles.input, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="Describe your requirement (Quantity, Location, etc.)" 
              multiline 
              placeholderTextColor="#94a3b8"
            />

            <TouchableOpacity 
              style={flatStyles.submitBtn} 
              onPress={() => {
                setIsModalVisible(false);
              }}
            >
              <Text style={flatStyles.submitBtnText}>Send Requirement</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderColor: "#f1f5f9",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
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