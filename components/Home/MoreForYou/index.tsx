import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import {
    Linking,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
// 1. Import Reanimated for purely Native UI scrolling
import Animated, {
    cancelAnimation,
    runOnUI,
    scrollTo,
    SharedValue,
    useAnimatedReaction,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

export interface MoreForYouCard {
  id: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  buttonText: string;
  route: string;
  isPopular?: boolean;
}

const cardsData: MoreForYouCard[] = [
  {
    id: "1",
    title: "Connect with Verified Suppliers",
    desc: "Find trusted & verified manufacturers, wholesalers, and exporters across India. Share your requirement and get the best quotes instantly.",
    icon: "receipt-outline",
    buttonText: "Get Verified Suppliers",
    route: "https://dir.inquirybazaar.com/",
  },
  {
    id: "2",
    title: "Sell on Inquiry Bazaar for Free",
    desc: "Expand your business reach and connect with high-intent buyers. Generate quality B2B leads without upfront cost.",
    icon: "storefront-outline",
    buttonText: "Start Selling",
    route: "/Seller/auth/Signup",
    isPopular: true,
  },
  {
    id: "3",
    title: "Get Instant Business Enquiries",
    desc: "Receive real-time enquiries directly on your mobile & dashboard. Never miss a potential deal with instant alerts.",
    icon: "phone-portrait-outline",
    buttonText: "Get Enquiries Now",
    route: "/PostRequirenmentForm",
  },
  {
    id: "4",
    title: "Legal Compliance",
    desc: "Verified Goods & Service Tax Identification Number (GSTIN) indicates a registered business that complies with Indian tax regulations.",
    icon: "shield-checkmark-outline",
    buttonText: "Know More",
    route: "/HelpSupport",
  },
];

const CARDS_LENGTH = cardsData.length;
const REPLICATED_COUNT = 5;
const TOTAL_ITEMS = CARDS_LENGTH * REPLICATED_COUNT; // 20 items
const BASE_MIDDLE = CARDS_LENGTH * 2; // Starts exactly at index 8 (3rd copy)

// 2. Extracted and Memoized Card Component
const MoreForYouCardItem = React.memo(({
  item,
  cardWidth,
  cardHeight,
  scale,
  onPress,
}: {
  item: MoreForYouCard;
  cardWidth: number;
  cardHeight: number;
  scale: number;
  onPress: (route: string) => void;
}) => {
  const isPopular = item.isPopular;
  
  // Pre-calculated strict heights to skip layout passes
  const titleContainerHeight = 15 * scale * 1.3 * 2;
  const descContainerHeight = 13 * scale * 1.4 * 4.5;

  return (
    <View
      style={{ width: cardWidth, height: cardHeight }}
      className={`flex-col items-center px-3 py-4 border-r border-gray-200 relative ${
        isPopular ? "bg-[#0E2347]" : "bg-white"
      }`}
    >
      {isPopular && (
        <View className="absolute top-2 left-2 bg-[#ec771c] px-2 py-0.5 rounded-full flex-row items-center gap-0.5 z-10">
          <MaterialCommunityIcons name="flash" size={8} color="#ffffff" />
          <Text
            style={{ fontFamily: "PlusJakartaSans-Bold" }}
            className="text-[8px] text-white uppercase tracking-wider"
          >
            Most Popular
          </Text>
        </View>
      )}

      <View className="flex-1 w-full flex-col items-center pointer-events-none">
        <View style={{ height: 40 * scale, justifyContent: 'center' }} className="mb-2">
          <Ionicons name={item.icon} size={28 * scale} color={isPopular ? "#ffffff" : "#10316C"} />
        </View>

        <View style={{ height: titleContainerHeight, justifyContent: 'flex-start' }} className="w-full mb-2">
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ fontSize: 15 * scale, lineHeight: 15 * scale * 1.3, fontFamily: "PlusJakartaSans-Bold" }}
            className={`text-center px-1 ${isPopular ? "text-white" : "text-gray-800"}`}
          >
            {item.title}
          </Text>
        </View>

        <View style={{ height: descContainerHeight, justifyContent: 'flex-start' }} className="w-full">
          <Text
            numberOfLines={4}
            ellipsizeMode="tail"
            style={{ fontSize: 13 * scale, lineHeight: 13 * scale * 1.4, fontFamily: "PlusJakartaSans-Medium" }}
            className={`text-center opacity-90 ${isPopular ? "text-[#e2e8f0]" : "text-gray-600"}`}
          >
            {item.desc}
          </Text>
        </View>
      </View>

      <View style={{ height: 44 * scale, justifyContent: 'flex-end' }} className="w-full mt-2">
        {/* 3. Changed to TouchableOpacity: Avoids inline style function memory allocation on every render */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onPress(item.route)}
          className={`w-full py-2 rounded-full items-center justify-center border ${
            isPopular ? "bg-transparent border-white" : "bg-transparent border-[#10316C]"
          }`}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{ fontSize: 13 * scale, fontFamily: "PlusJakartaSans-Bold" }}
            className={isPopular ? "text-white" : "text-[#10316C]"}
          >
            {item.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}, (prev, next) => prev.item.id === next.item.id && prev.cardWidth === next.cardWidth);


export default function MoreForYou({ isScrolling }: { isScrolling?: SharedValue<boolean> }) {
  const isFocused = useIsFocused();
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  // 4. Reanimated Refs & Shared Values
  const flatListRef = useAnimatedRef<Animated.FlatList<MoreForYouCard>>();
  const currentIndex = useSharedValue(BASE_MIDDLE);
  const autoplayPulse = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.15 : Math.max(0.85, Math.min(1.1, screenWidth / 375));
  const cardWidth = isTablet ? screenWidth / 4 : screenWidth / 2;
  const cardHeight = 240 * scale; 
  const sectionTitleSize = 22 * scale;

  const replicatedData = useMemo(() => {
    return Array(REPLICATED_COUNT).fill(cardsData).flat();
  }, []);

  // 5. Native Engine: Generates ticks strictly on the UI thread
  const startAutoPlayUI = () => {
    'worklet';
    if (!isFocused) return;
    autoplayPulse.value = withRepeat(
      withTiming(autoplayPulse.value + 1, { duration: 2500 }),
      -1
    );
  };

  const stopAutoPlayUI = () => {
    'worklet';
    cancelAnimation(autoplayPulse);
  };

  // ── Pause carousel during main feed scroll ──
  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling) => {
      if (!isFocused) {
        stopAutoPlayUI();
        return;
      }
      if (scrolling) {
        // User is scrolling main feed - pause carousel
        stopAutoPlayUI();
      } else {
        // Scroll ended - resume carousel
        startAutoPlayUI();
      }
    },
    [isFocused]
  );

  // 6. Native Reaction: Listens to the UI ticker and performs smooth or silent snaps
  useAnimatedReaction(
    () => Math.floor(autoplayPulse.value),
    (currentPulse, prevPulse) => {
      if (!isFocused) {
        return;
      }
      if (currentPulse !== prevPulse && prevPulse !== null && !isDragging.value) {
        let nextIndex = currentIndex.value + 1;
        
        // Edge handling directly on the UI thread
        if (nextIndex >= TOTAL_ITEMS - 2) {
          const remainder = nextIndex % CARDS_LENGTH;
          const safeMiddleIndex = BASE_MIDDLE + remainder;
          
          // Instant silent reset
          scrollTo(flatListRef, safeMiddleIndex * cardWidth, 0, false);
          currentIndex.value = safeMiddleIndex;
        } else {
          // Normal animated scroll
          currentIndex.value = nextIndex;
          scrollTo(flatListRef, nextIndex * cardWidth, 0, true);
        }
      }
    },
    [isFocused]
  );

  // 7. Bridgeless scroll handler for user touches
  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isDragging.value = true;
      stopAutoPlayUI(); // Worklet executed natively
    },
    onMomentumEnd: (event) => {
      isDragging.value = false;
      let newIndex = Math.round(event.contentOffset.x / cardWidth);

      // Silent edge correction natively if they dragged too far
      if (newIndex < 2 || newIndex > TOTAL_ITEMS - 3) {
        const remainder = newIndex % CARDS_LENGTH;
        newIndex = BASE_MIDDLE + remainder;
        scrollTo(flatListRef, newIndex * cardWidth, 0, false);
      }

      currentIndex.value = newIndex;
      startAutoPlayUI(); // Resume Native Engine
    }
  });

  useEffect(() => {
    if (!isFocused) {
      stopAutoPlayUI();
      return;
    }

    const initTimer = setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({ index: BASE_MIDDLE, animated: false });
      }
      runOnUI(startAutoPlayUI)(); // Boot up the Native UI ticker once
    }, 300);

    return () => clearTimeout(initTimer);
  }, [isFocused]);

  const handlePress = useCallback((route: string) => {
    if (route.startsWith("http://") || route.startsWith("https://")) {
      Linking.openURL(route).catch((err) => console.error("Failed to open external link", err));
    } else {
      router.push(route as any);
    }
  }, [router]);

  const renderCard = useCallback(({ item }: { item: MoreForYouCard }) => (
    <MoreForYouCardItem
      item={item}
      cardWidth={cardWidth}
      cardHeight={cardHeight}
      scale={scale}
      onPress={handlePress}
    />
  ), [cardWidth, cardHeight, scale, handlePress]);

  const keyExtractor = useCallback((item: MoreForYouCard, index: number) => `${item.id}-${index}`, []);
  
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: cardWidth,
    offset: cardWidth * index,
    index,
  }), [cardWidth]);

  return (
    <View className="w-full bg-white pt-4 pb-0 mt-0 mb-0">
      <View className="px-4 mb-3">
        <Text style={{ fontSize: sectionTitleSize, fontFamily: "PlusJakartaSans-Bold" }} className="text-gray-800">
          More for You
        </Text>
      </View>

      <View className="border-y border-gray-200 overflow-hidden bg-white w-full">
        <Animated.FlatList
          ref={flatListRef}
          data={replicatedData}
          keyExtractor={keyExtractor}
          renderItem={renderCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth}
          decelerationRate="fast"
          removeClippedSubviews={true}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={3}
          updateCellsBatchingPeriod={40}
          getItemLayout={getItemLayout}
          // 8. Assigned Reanimated Worklet Handler
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        />
      </View>
    </View>
  );
}