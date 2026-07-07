import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { productCache } from "@/utils/productCache";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import EnquiryModal from "@/components/EnquiryModal";

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

const CARD_MARGIN = 16; // Slightly tighter margin to fit 2 cards comfortably

// --- UPDATED CARD COMPONENT ---
const ProductCard = ({ 
  item, 
  cardWidth,
  onReqQuote
}: { 
  item: Product; 
  cardWidth: number;
  onReqQuote: (item: Product) => void;
}) => {
  const router = useRouter();

  const primaryImage =
    item.media && item.media.length > 0
      ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
      : "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400";

  const isPriceOnRequest = item.priceType === "on_request" || !item.price;

  const handlePress = () => {
    productCache[item._id] = item;
    router.push({
      pathname: "/Products_Page/[slug]",
      params: {
        slug: item.slug,
        productId: item._id,
      },
    });
  };

  const handleCall = () => {
    const phone = item.supplier?.phone || "+910000000000";
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl shadow-md shadow-slate-200/50 border border-slate-100 overflow-hidden"
      style={{ width: cardWidth, marginRight: CARD_MARGIN }}
      activeOpacity={1} 
      onPress={handlePress}
    >
      {/* Top Image (Scaled down slightly for narrower card) */}
      <View className="h-36 w-full bg-slate-100">
        <Image
          source={{ uri: primaryImage }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />
      </View>

      {/* Card Content */}
      <View className="p-3 flex-1 bg-white justify-between">
        <View>
          <Text
            className="text-slate-900 font-jakarta-bold text-[15px] leading-tight mb-1"
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text
            className="text-slate-400 font-jakarta-medium text-[12px] mb-3"
            numberOfLines={1}
          >
            {item.supplier?.business?.companyName || "Verified Supplier"}
          </Text>
        </View>

        <View>
          {/* Price and Badge Section */}
          <View className="flex-row justify-between items-end mb-4">
            <View className="flex-1">
              <Text className="text-slate-400 font-jakarta-medium text-[11px] mb-0.5">
                Starting From
              </Text>
              {isPriceOnRequest ? (
                <Text className="text-amber-600 font-jakarta-extrabold text-[16px] tracking-tight">
                  On Request
                </Text>
              ) : (
                <Text className="text-black font-jakarta-extrabold text-[18px] tracking-tight" numberOfLines={1} adjustsFontSizeToFit>
                  ₹{item.price.toLocaleString()}
                </Text>
              )}
            </View>
            
            <View className="bg-[#dcfce7] px-1.5 py-1 rounded-md ml-2">
              <Text className="text-[#166534] font-jakarta-bold text-[10px] uppercase tracking-wider">
                In Stock
              </Text>
            </View>
          </View>

          {/* Action Buttons (Scaled text/padding to fit 2-columns in narrow width) */}
          <View className="flex-row gap-1.5">
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.7}
              className="flex-1 border-[1.5px] border-[#1e3a8a] py-1.5 rounded-full items-center justify-center bg-white"
            >
              <Text className="text-[#1e3a8a] font-jakarta-bold text-[12px]" numberOfLines={1}>
                Call Now
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onReqQuote(item)}
              className="flex-1 bg-[#1e3a8a] py-1.5 rounded-full items-center justify-center border-[1.5px] border-[#1e3a8a]"
            >
              <Text className="text-white font-jakarta-bold text-[12px]" numberOfLines={1}>
                Req Quote
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const API_URL =
  "https://backend.inquirybazaar.com/api/categories/sub/led-display-board/Delhi";

export default function HorizontalProductList() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  
  // DYNAMIC CALCULATION: Exactly 2 cards visible on screen (plus margins)
  // ~43% of the screen ensures 2 full cards + a peek of the 3rd card
  const cardWidth = (screenWidth * 0.43); 
  const ITEM_SIZE = cardWidth + CARD_MARGIN;

  const flatListRef = useRef<FlatList>(null);
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
          setProducts(json.data.products.slice(0, 10));
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrendingProducts();
  }, []);

  // --- INFINITE SCROLL LOGIC ---
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
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#0f172a",
            paddingBottom: 2,
          }}
          onPress={() =>
            router.push({
              pathname: "/Products_Page",
              params: {
                subCategorySlug: "led-display-board",
                subCategoryName: "LED Display Board",
              },
            })
          }
        >
          <Text className="text-slate-900 font-jakarta-bold text-[16px] tracking-tight">
            Explore
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="py-12 justify-center items-center">
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={replicatedData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              cardWidth={cardWidth}
              onReqQuote={(prod) => {
                setSelectedProduct(prod);
                setModalVisible(true);
              }}
            />
          )}
          className="pl-5 py-2" 
          contentContainerStyle={{ paddingRight: 40 }} 
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          snapToAlignment="start"
          
          removeClippedSubviews={true}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          getItemLayout={(_, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * index,
            index,
          })}
          
          onScrollBeginDrag={stopAutoPlay}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollToIndexFailed={handleScrollToIndexFailed}
        />
      )}

      {/* Enquiry Modal overlay */}
      <EnquiryModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        product={selectedProduct}
      />
    </View>
  );
}