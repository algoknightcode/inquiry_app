import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { productCache } from "@/utils/productCache";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import EnquiryModal from "../../EnquiryModal";

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

// ── Constants for Auto-Scroll ──
const CARD_WIDTH = 160;
const CARD_MARGIN = 16;
const ITEM_SIZE = CARD_WIDTH + CARD_MARGIN;

const NewOnes = () => {
  const router = useRouter();

  // Data State
  const initialData = getInitialCachedProducts();
  const [productsList, setProductsList] = useState<Product[]>(initialData.products);
  const [categoryObjId, setCategoryObjId] = useState<string | null>(initialData.categoryId);
  const [isLoading, setIsLoading] = useState(initialData.products.length === 0);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Auto-scroll Refs
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Data
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");
        if (json.success && json.data) {
          const industry = json.data.find(
            (ind: any) => ind.name.toLowerCase().includes("plants") || ind.name.toLowerCase().includes("machinery")
          );
          if (industry && industry.categories) {
            const categoryObj = industry.categories.find(
              (cat: any) => cat.name.toLowerCase().includes("machines") || cat.name.toLowerCase().includes("equipment")
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

  // ── INFINITE SCROLL LOGIC ──
  const replicatedData = useMemo(() => {
    if (!productsList || productsList.length === 0) return [];
    return Array(100).fill(productsList).flat();
  }, [productsList]);

  const baseMiddleIndex = useMemo(() => {
    if (replicatedData.length === 0) return 0;
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % productsList.length);
  }, [replicatedData.length, productsList.length]);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (replicatedData.length <= 1) return;

    timerRef.current = setInterval(() => {
      let nextIndex = activeIndexRef.current + 1;

      if (nextIndex >= replicatedData.length - 5) {
        const remainder = nextIndex % productsList.length;
        const safeMiddleIndex = baseMiddleIndex + remainder;

        flatListRef.current?.scrollToIndex({
          index: safeMiddleIndex,
          animated: false,
        });
        activeIndexRef.current = safeMiddleIndex;
      } else {
        activeIndexRef.current = nextIndex;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 3000);
  }, [baseMiddleIndex, replicatedData.length, productsList.length]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (replicatedData.length > 0) {
      activeIndexRef.current = baseMiddleIndex;
      const initTimer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: baseMiddleIndex,
          animated: false,
        });
        startAutoPlay();
      }, 500);

      return () => {
        clearTimeout(initTimer);
        stopAutoPlay();
      };
    }
  }, [replicatedData, baseMiddleIndex, startAutoPlay, stopAutoPlay]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    let currentIndex = Math.round(scrollOffset / ITEM_SIZE);

    if (currentIndex < 5 || currentIndex > replicatedData.length - 5) {
      const remainder = currentIndex % productsList.length;
      currentIndex = baseMiddleIndex + remainder;

      flatListRef.current?.scrollToIndex({
        index: currentIndex,
        animated: false,
      });
    }

    activeIndexRef.current = currentIndex;
    startAutoPlay();
  };

  const handleScrollToIndexFailed = (info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 500);
  };

  // ── Actions ──
  const handleCardPress = (item: Product) => {
    productCache[item._id] = item;
    router.push({
      pathname: "/Products_Page/[slug]",
      params: { slug: item.slug, productId: item._id },
    });
  };

  const handleOpenQuote = (item: Product) => {
    setSelectedProduct(item);
    setIsModalVisible(true);
  };

  // ── Render Card ──
  const renderProductCard = useCallback(({ item }: { item: Product }) => {
    const primaryImage =
      item.media && item.media.length > 0
        ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
        : "https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80";

    const company = item.supplier?.business?.companyName || item.supplier?.name || "Manufacturer";
    const isPriceOnRequest = item.priceType === "on_request" || !item.price;

    return (
      <Pressable style={flatStyles.card} onPress={() => handleCardPress(item)}>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }], flex: 1 }}>
            {/* Image */}
            <View style={flatStyles.imageWrapper}>
              <Image
                source={{ uri: primaryImage }}
                style={flatStyles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            </View>

            {/* Content */}
            <View style={flatStyles.content}>
              <Text style={flatStyles.company} numberOfLines={1}>
                {company}
              </Text>
              <Text style={flatStyles.title} numberOfLines={2}>
                {item.name}
              </Text>

              {/* Price Area */}
              <View style={flatStyles.priceContainer}>
                {!isPriceOnRequest && (
                  <Text style={flatStyles.price} numberOfLines={1} adjustsFontSizeToFit>
                    ₹{item.price.toLocaleString()}
                    <Text style={flatStyles.unit}> / {item.unit || "pc"}</Text>
                  </Text>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleOpenQuote(item)}
                style={flatStyles.quoteBtn}
              >
                <Text style={flatStyles.quoteBtnText}>Request Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Pressable>
    );
  }, []);

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
        <View style={flatStyles.loader}>
          <ActivityIndicator size="small" color="#0E2347" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={replicatedData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderProductCard}
          contentContainerStyle={flatStyles.listContent}
          
          // Auto-Swipe specific props
          snapToInterval={ITEM_SIZE}
          snapToAlignment="start"
          decelerationRate="fast"
          onScrollBeginDrag={stopAutoPlay}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          getItemLayout={(_, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * index,
            index,
          })}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}

      {/* Enquiry Modal */}
      <EnquiryModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        product={selectedProduct}
      />
    </View>
  );
};

export default NewOnes;

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
    uppercase: true,
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
  loader: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
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
    height: 240, // Reduced height to look compact when some items have no price
  },
  imageWrapper: {
    height: 120,
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
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#1e293b",
    lineHeight: 18,
    marginBottom: 6,
  },
  priceContainer: {
    marginBottom: 10,
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
});