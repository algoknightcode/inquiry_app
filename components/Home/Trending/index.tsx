import EnquiryModal from "@/components/EnquiryModal";
import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { productCache } from "@/utils/productCache";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Linking,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
// 1. Import Reanimated for UI Thread scrolling
import Animated, { runOnJS, runOnUI, scrollTo, SharedValue, useAnimatedReaction, useAnimatedRef } from "react-native-reanimated";

type Media = {
  _id: string;
  url: string;
  isPrimary: boolean;
};

type Business = {
  companyName: string;
  city: string;
  state: string;
  businessType: string;
};

type Supplier = {
  _id: string;
  name: string;
  phone: string;
  profileImage?: string;
  business?: Business;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  unit: string;
  priceType: string;
  minOrderQty: number;
  deliveryTime?: string;
  media: Media[];
  supplier?: Supplier;
};

const CARD_MARGIN = 16;
const API_URL = "https://backend.inquirybazaar.com/api/categories/sub/led-display-board/Delhi";

const ProductCard = React.memo(({ 
  item, 
  cardWidth,
  onReqQuote
}: { 
  item: Product; 
  cardWidth: number;
  onReqQuote: (item: Product) => void;
}) => {
  const router = useRouter();

  const primaryImage = item.media?.length > 0
      ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
      : "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400";

  const isPriceOnRequest = item.priceType === "on_request" || !item.price;

  const handlePress = useCallback(() => {
    productCache[item._id] = item;
    router.push({
      pathname: "/Products_Page/[slug]",
      params: {
        slug: item.slug,
        productId: item._id,
      },
    });
  }, [item, router]);

  const handleCall = useCallback(() => {
    const phone = item.supplier?.phone || "+910000000000";
    Linking.openURL(`tel:${phone}`);
  }, [item.supplier?.phone]);

  const handleQuotePress = useCallback(() => {
    onReqQuote(item);
  }, [item, onReqQuote]);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 overflow-hidden"
      style={{ width: cardWidth, marginRight: CARD_MARGIN }}
      activeOpacity={1} 
      onPress={handlePress}
    >
      <View className="h-36 w-full bg-slate-100">
        <Image
          source={{ uri: primaryImage }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0} // 2. Zero transition for instant render and less GPU load
        />
      </View>

      <View className="p-3 flex-1 bg-white justify-between">
        <View>
          <Text className="text-slate-900 font-jakarta-bold text-[15px] leading-tight mb-1" numberOfLines={2}>
            {item.name}
          </Text>
          <Text className="text-slate-400 font-jakarta-medium text-[12px] mb-3" numberOfLines={1}>
            {item.supplier?.business?.companyName || "Verified Supplier"}
          </Text>
        </View>

        <View>
          <View className="flex-row justify-between items-end mb-4">
            <View className="flex-1">
              <Text className="text-slate-400 font-jakarta-medium text-[11px] mb-0.5">Starting From</Text>
              {isPriceOnRequest ? (
                <Text className="text-amber-600 font-jakarta-extrabold text-[16px] tracking-tight">On Request</Text>
              ) : (
                <Text className="text-black font-jakarta-extrabold text-[18px] tracking-tight" numberOfLines={1} adjustsFontSizeToFit>
                  ₹{item.price.toLocaleString()}
                </Text>
              )}
            </View>
            <View className="bg-[#dcfce7] px-1.5 py-1 rounded-md ml-2">
              <Text className="text-[#166534] font-jakarta-bold text-[10px] uppercase tracking-wider">In Stock</Text>
            </View>
          </View>

          <View className="flex-row gap-1.5">
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.7}
              className="flex-1 border-[1.5px] border-[#1e3a8a] py-1.5 rounded-full items-center justify-center bg-white"
            >
              <Text className="text-[#1e3a8a] font-jakarta-bold text-[12px]" numberOfLines={1}>Call Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleQuotePress}
              className="flex-1 bg-[#1e3a8a] py-1.5 rounded-full items-center justify-center border-[1.5px] border-[#1e3a8a]"
            >
              <Text className="text-white font-jakarta-bold text-[12px]" numberOfLines={1}>Req Quote</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prev, next) => prev.item._id === next.item._id && prev.cardWidth === next.cardWidth);

const SkeletonProductCard = ({ cardWidth }: { cardWidth: number }) => (
  <View
    style={{ width: cardWidth, marginRight: CARD_MARGIN }}
    className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 overflow-hidden"
  >
    <View className="h-36 w-full bg-slate-200" />
    <View className="p-3 flex-1 bg-white justify-between">
      <View>
        <View className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
        <View className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
      </View>
      <View>
        <View className="h-5 bg-slate-200 rounded w-2/3 mb-4" />
        <View className="flex-row gap-1.5">
          <View className="flex-1 h-9 bg-slate-200 rounded-full" />
          <View className="flex-1 h-9 bg-slate-200 rounded-full" />
        </View>
      </View>
    </View>
  </View>
);

export default function HorizontalProductList({ isScrolling }: { isScrolling?: SharedValue<boolean> }) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  
  const cardWidth = (screenWidth * 0.43); 
  const ITEM_SIZE = cardWidth + CARD_MARGIN;

  // 3. Reanimated useAnimatedRef for Native UI access
  const flatListRef = useAnimatedRef<Animated.FlatList<Product>>();
  const activeIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const cached = getCacheSync(API_URL);
  const [products, setProducts] = useState<Product[]>(
    cached?.success && Array.isArray(cached.data?.products)
      ? cached.data.products.slice(0, 10)
      : []
  );
  const [isLoading, setIsLoading] = useState(!cached);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const json = await fetchWithCache(API_URL);
        if (json.success && json.data && json.data.products) {
          const newProducts = json.data.products.slice(0, 10);
          setProducts(prev => {
            if (prev.length > 0 && prev[0]._id === newProducts[0]._id) return prev;
            return newProducts;
          });
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrendingProducts();
  }, []);

  // 4. Reduced array copies from 100 to 30
  const replicatedData = useMemo(() => {
    if (!products || products.length === 0) return [];
    return Array(30).fill(products).flat();
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

        // Instant reset without animation
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index: safeMiddleIndex, animated: false });
        }
        activeIndexRef.current = safeMiddleIndex;
      } else {
        activeIndexRef.current = nextIndex;
        // 5. Reanimated runOnUI for smooth auto-scrolling
        const targetOffset = nextIndex * ITEM_SIZE;
        runOnUI((offset: number) => {
          'worklet';
          scrollTo(flatListRef, offset, 0, true);
        })(targetOffset);
      }
    }, 3000); 
  }, [baseMiddleIndex, replicatedData.length, products.length, ITEM_SIZE]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── Monitor scroll state and pause/resume autoplay ──
  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling) => {
      if (scrolling) {
        // User is scrolling - pause autoplay
        runOnJS(stopAutoPlay)();
      } else {
        // Scroll ended - resume autoplay
        runOnJS(startAutoPlay)();
      }
    }
  );

  useEffect(() => {
    if (replicatedData.length > 0) {
      activeIndexRef.current = baseMiddleIndex;
      const initTimer = setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index: baseMiddleIndex, animated: false });
        }
        startAutoPlay();
      }, 500);

      return () => {
        clearTimeout(initTimer);
        stopAutoPlay();
      };
    }
  }, [replicatedData, baseMiddleIndex, startAutoPlay, stopAutoPlay]);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    let currentIndex = Math.round(scrollOffset / ITEM_SIZE);

    if (currentIndex < 5 || currentIndex > replicatedData.length - 5) {
      const remainder = currentIndex % products.length;
      currentIndex = baseMiddleIndex + remainder;

      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: currentIndex, animated: false });
      }
    }

    activeIndexRef.current = currentIndex;
    startAutoPlay(); 
  }, [ITEM_SIZE, replicatedData.length, products.length, baseMiddleIndex, startAutoPlay]);

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: info.index, animated: true });
      }
    }, 500);
  }, []);

  const handleReqQuote = useCallback((prod: Product) => {
    setSelectedProduct(prod);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      item={item}
      cardWidth={cardWidth}
      onReqQuote={handleReqQuote}
    />
  ), [cardWidth, handleReqQuote]);

  const keyExtractor = useCallback((_: any, index: number) => index.toString(), []);
  
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_SIZE,
    offset: ITEM_SIZE * index,
    index,
  }), [ITEM_SIZE]);

  const handleExplorePress = useCallback(() => {
    router.push({
      pathname: "/Products_Page",
      params: {
        subCategorySlug: "led-display-board",
        subCategoryName: "LED Display Board",
      },
    })
  }, [router]);

  return (
    <View className="mt-2">
      <View className="flex flex-row justify-between items-end px-5 mb-4">
        <View className="flex-col">
          <Text className="text-[12px] font-jakarta-bold text-slate-400 tracking-[0.15em] mb-1 uppercase">
            TRENDING NOW
          </Text>
          <Text className="text-[26px] font-jakarta-extrabold text-slate-900 tracking-tighter leading-none">
            Featured
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          style={{ borderBottomWidth: 1, borderBottomColor: "#0f172a", paddingBottom: 2 }}
          onPress={handleExplorePress}
        >
          <Text className="text-slate-900 font-jakarta-bold text-[16px] tracking-tight">
            Explore
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          className="pl-5 py-2"
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {[...Array(6)].map((_, i) => (
            <SkeletonProductCard key={`skeleton-${i}`} cardWidth={cardWidth} />
          ))}
        </ScrollView>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={replicatedData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          className="pl-5 py-2" 
          contentContainerStyle={{ paddingRight: 40 }} 
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          snapToAlignment="start"
          removeClippedSubviews={true}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          updateCellsBatchingPeriod={40} // 6. Optimized batching speed
          getItemLayout={getItemLayout}
          onScrollBeginDrag={stopAutoPlay}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}
        />
      )}

      <EnquiryModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        product={selectedProduct}
      />
    </View>
  );
}