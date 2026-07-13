import EnquiryModal from "@/components/EnquiryModal";
import { useRole } from "@/contexts/RoleContext";
import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { logProductInteraction } from "@/utils/notificationService";
import { setProductCache } from "@/utils/productCache";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

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

function getInitialCachedProducts(): Product[] {
  try {
    const json = getCacheSync(API_URL);
    if (json?.success && Array.isArray(json.data?.products)) {
      return json.data.products.slice(0, 10);
    }
  } catch (err) {
    console.warn("Error reading cache:", err);
  }
  return [];
}

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
  const { globalBuyerId, globalSellerId, userRole } = useRole();

  const primaryImage = item.media?.length > 0
      ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
      : "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400";

  const isPriceOnRequest = item.priceType === "on_request" || !item.price;

  const handlePress = useCallback(() => {
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
  }, [item, router, globalBuyerId, globalSellerId, userRole]);

  const handleCall = useCallback(() => {
    const phone = item.supplier?.phone || "+910000000000";
    Linking.openURL(`tel:${phone}`);
  }, [item.supplier?.phone]);

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ width: cardWidth, marginRight: CARD_MARGIN, height: 305 }}
      activeOpacity={1} 
      onPress={handlePress}
    >
      <View className="h-36 w-full bg-slate-100">
        <Image
          source={{ uri: primaryImage }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0} 
          recyclingKey={primaryImage} 
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
              onPress={() => onReqQuote(item)}
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
    style={{ width: cardWidth, marginRight: CARD_MARGIN, height: 305 }}
    className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
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

const HorizontalProductList = ({ isScrolling }: { isScrolling?: SharedValue<boolean> }) => {
  const isFocused = useIsFocused();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  
  const cardWidth = (screenWidth * 0.43); 
  const ITEM_SIZE = cardWidth + CARD_MARGIN;

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const initialProducts = getInitialCachedProducts();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true);

  const isUserDragging = useRef(false);
  const flatListRef = useRef<any>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    // JS Thread protection
    const mountTimer = setTimeout(() => {
      setIsLoading(false);
    }, 250);

    const fetchTrendingProducts = async () => {
      try {
        const json = await fetchWithCache(API_URL);
        if (json.success && json.data?.products) {
          const newProducts: Product[] = json.data.products.slice(0, 10);

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

    return () => {
      clearTimeout(mountTimer);
    };
  }, []);

  const replicatedData = useMemo(() => {
    if (!products || products.length === 0) return [];
    return Array(5).fill(products).flat();
  }, [products]);

  const baseMiddleIndex = useMemo(() => {
    if (replicatedData.length === 0) return 0;
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % products.length);
  }, [replicatedData.length, products.length]);

  useEffect(() => {
    if (!isFocused || replicatedData.length === 0) return;

    setScrollIndex(baseMiddleIndex);
    const initTimer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: baseMiddleIndex, animated: false });
    }, 500);

    const interval = setInterval(() => {
      if (isUserDragging.current) return;
      if (isScrolling && isScrolling.value) return;

      setScrollIndex(prev => {
        const nextIndex = prev + 1;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        
        // Loop reset check
        if (nextIndex >= replicatedData.length - 2) {
          const safeIndex = baseMiddleIndex + (nextIndex % products.length);
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: safeIndex, animated: false });
          }, 500);
          return safeIndex;
        }
        return nextIndex;
      });
    }, 2500);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [isFocused, replicatedData, baseMiddleIndex, products.length, isScrolling]);

  const handleScrollBegin = useCallback(() => {
    isUserDragging.current = true;
  }, []);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    isUserDragging.current = false;
    let currentIndex = Math.round(event.nativeEvent.contentOffset.x / ITEM_SIZE);

    if (currentIndex < 2 || currentIndex > replicatedData.length - 3) {
      currentIndex = baseMiddleIndex + (currentIndex % products.length);
      flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
    }
    setScrollIndex(currentIndex);
  }, [ITEM_SIZE, replicatedData.length, products.length, baseMiddleIndex]);

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => flatListRef.current?.scrollToIndex({ index: info.index, animated: true }), 500);
  }, []);

  const handleReqQuote = useCallback((prod: Product) => {
    setSelectedProduct(prod);
    setModalVisible(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard item={item} cardWidth={cardWidth} onReqQuote={handleReqQuote} />
  ), [cardWidth, handleReqQuote]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_SIZE, offset: ITEM_SIZE * index, index,
  }), [ITEM_SIZE]);

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
          onPress={() => router.push({ pathname: "/Products_Page", params: { subCategorySlug: "led-display-board", subCategoryName: "LED Display Board" }})}
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
          contentContainerStyle={{ paddingLeft: 20 }}
        >
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <SkeletonProductCard key={i} cardWidth={cardWidth} />
            ))}
        </ScrollView>
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={replicatedData}
          renderItem={renderItem}
          keyExtractor={(item, index) => item ? `${item._id || 'brand'}-${index}` : `empty-${index}`}
          getItemLayout={getItemLayout}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_SIZE}
          snapToAlignment="start"
          decelerationRate="fast"
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          contentContainerStyle={{ paddingLeft: 20 }}
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={5}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      )}
      <EnquiryModal visible={isModalVisible} onClose={() => setModalVisible(false)} product={selectedProduct} />
    </View>
  );
};

export default React.memo(HorizontalProductList);