import { fetchWithCache } from "@/utils/apiCache";
import { productCache } from "@/utils/productCache";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
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

// ── Memoized Card Component (Prevents re-renders during scrolling) ──
const ProductCard = React.memo(
  ({
    item,
    dynamicStyles,
    onPress,
    onQuotePress,
  }: {
    item: Product;
    dynamicStyles: any;
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
        style={{
          marginRight: dynamicStyles.cardSpacing,
          width: dynamicStyles.cardWidth,
        }}
        onPress={() => onPress(item)}
      >
        {({ pressed }) => (
          <View
            style={{
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            }}
          >
            {/* Image Container */}
            <View
              style={{
                width: dynamicStyles.cardWidth,
                height: dynamicStyles.cardHeight,
              }}
              className="bg-slate-100 rounded-2xl relative overflow-visible"
            >
              <Image
                source={{ uri: primaryImage }}
                style={{ width: "100%", height: "100%", borderRadius: 16 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk" // Aggressive caching for performance
              />

              {/* Trust Badge */}
              <View className="absolute -bottom-2.5 self-center bg-slate-900 border-2 border-white px-2.5 py-1 rounded-full shadow-sm shadow-slate-900/20">
                <Text
                  style={dynamicStyles.trustBadgeText}
                  className="text-white font-jakarta-extrabold uppercase"
                >
                  ✓ VERIFIED
                </Text>
              </View>
            </View>

            {/* Typography details & Request Form Button */}
            <View className="mt-5 px-1 items-center flex-col justify-between">
              <View className="items-center w-full">
                <Text
                  style={dynamicStyles.brandText}
                  className="text-slate-400 font-jakarta-semibold uppercase mb-1"
                  numberOfLines={1}
                >
                  {companyName}
                </Text>
                <Text
                  style={dynamicStyles.cardTitle}
                  className="text-slate-800 font-jakarta-bold leading-snug mb-1 text-center"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text
                  style={dynamicStyles.cardPrice}
                  className="text-slate-950 font-jakarta-black tracking-tighter mb-3"
                >
                  {isPriceOnRequest
                    ? "Price on Request"
                    : `₹${item.price}/${item.unit}`}
                </Text>
              </View>

              {/* Buttons Container */}
              <View className="flex-row items-center w-full mt-1 gap-1.5">
                {/* Request a Quote Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onQuotePress(item)}
                  className="flex-1 bg-[#0E2347] py-2 rounded-lg items-center justify-center shadow-sm shadow-[#0E2347]/20"
                >
                  <Text
                    style={dynamicStyles.buttonText}
                    className="text-white font-jakarta-bold tracking-wide"
                    numberOfLines={1}
                  >
                    Request a Quote
                  </Text>
                </TouchableOpacity>

                {/* Call Button */}
                {item.supplier?.phone && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      Linking.openURL(`tel:${item.supplier.phone}`);
                    }}
                    className="bg-emerald-600 p-2 rounded-lg items-center justify-center shadow-sm shadow-emerald-600/20"
                  >
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

const IBTrusted = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  // Auto-scroll refs
  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Responsive Scaling Engine ──
  const scale = useMemo(() => {
    const isTablet = screenWidth >= 768;
    return isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));
  }, [screenWidth]);

  const dynamicStyles = useMemo(() => {
    const containerPadding = 20 * scale;
    // Calculate card width so exactly ~2.4 cards show on screen, hinting there is more to scroll
    const cardWidth = (screenWidth - containerPadding * 2) / 2.3;

    return {
      containerPadding,
      paddingVertical: 24 * scale,
      kickerText: { fontSize: 12 * scale, letterSpacing: 1.5 * scale },
      headingText: { fontSize: 26 * scale },
      viewAllText: { fontSize: 16 * scale },
      cardWidth,
      cardHeight: cardWidth * 1.25,
      cardSpacing: 16 * scale,
      trustBadgeText: { fontSize: 10 * scale, letterSpacing: 1.5 * scale },
      brandText: { fontSize: 12 * scale, letterSpacing: 0.5 * scale },
      cardTitle: { fontSize: 16 * scale },
      cardPrice: { fontSize: 17 * scale },
      buttonText: { fontSize: 13 * scale }, // Dynamically scaled button text
    };
  }, [scale, screenWidth]);

  const ITEM_SIZE = dynamicStyles.cardWidth + dynamicStyles.cardSpacing;

  useEffect(() => {
    const fetchTrustedProducts = async () => {
      try {
        const json = await fetchWithCache(
          "https://backend.inquirybazaar.com/api/categories/sub/titanium-dioxide/Delhi"
        );
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

  // ── INFINITE SCROLL LOGIC ──
  const replicatedData = useMemo(() => {
    if (!products || products.length === 0) return [];
    return Array(100).fill(products).flat();
  }, [products]);

  const baseMiddleIndex = useMemo(() => {
    if (replicatedData.length === 0) return 0;
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % products.length);
  }, [replicatedData.length, products.length]);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (replicatedData.length <= 1) return;

    timerRef.current = setInterval(() => {
      let nextIndex = activeIndexRef.current + 1;

      if (nextIndex >= replicatedData.length - 5) {
        const remainder = nextIndex % products.length;
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
  }, [baseMiddleIndex, replicatedData.length, products.length]);

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

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    let currentIndex = Math.round(scrollOffset / ITEM_SIZE);

    if (currentIndex < 5 || currentIndex > replicatedData.length - 5) {
      const remainder = currentIndex % products.length;
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

  const handleCardPress = useCallback(
    (item: Product) => {
      productCache[item._id] = item;
      router.push({
        pathname: "/Products_Page/[slug]",
        params: {
          slug: item.slug,
          productId: item._id,
        },
      });
    },
    [router]
  );

  const handleOpenQuote = useCallback((item: Product) => {
    setSelectedProduct(item);
    setIsModalVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        item={item}
        dynamicStyles={dynamicStyles}
        onPress={handleCardPress}
        onQuotePress={handleOpenQuote}
      />
    ),
    [dynamicStyles, handleCardPress, handleOpenQuote]
  );

  return (
    <View
      style={{ paddingTop: dynamicStyles.paddingVertical, paddingBottom: 0 }}
      className="mt-3 bg-slate-50"
    >
      {/* Header Section */}
      <View
        style={{ paddingHorizontal: dynamicStyles.containerPadding }}
        className="flex flex-row justify-between items-end"
      >
        <View className="flex-col">
          <Text
            style={dynamicStyles.kickerText}
            className="font-jakarta-bold text-emerald-600 mb-1 uppercase"
          >
            CERTIFIED
          </Text>
          <Text
            style={dynamicStyles.headingText}
            className="font-jakarta-extrabold text-slate-900 tracking-tighter leading-none"
          >
            IB Trusted
          </Text>
        </View>

        <Pressable
          className="border-b border-slate-900 pb-0.5 active:opacity-50 transition-all"
          hitSlop={8}
          onPress={() =>
            router.push({
              pathname: "/Products_Page",
              params: {
                subCategorySlug: "titanium-dioxide",
                subCategoryName: "Titanium Dioxide",
              },
            })
          }
        >
          <Text
            style={dynamicStyles.viewAllText}
            className="text-slate-900 font-jakarta-bold tracking-tight"
          >
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
          ref={flatListRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={replicatedData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          className="mt-6"
          contentContainerStyle={{
            paddingLeft: dynamicStyles.containerPadding,
            paddingRight: dynamicStyles.containerPadding + dynamicStyles.cardWidth, 
            paddingBottom: 10,
          }}
          snapToInterval={ITEM_SIZE}
          snapToAlignment="start"
          decelerationRate="fast"
          
          // Event Listeners for Autoplay
          onScrollBeginDrag={stopAutoPlay}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}

          // Memory & CPU Optimizations
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

export default React.memo(IBTrusted);