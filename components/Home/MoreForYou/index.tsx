import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

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

export default function MoreForYou() {
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  const flatListRef = useRef<FlatList>(null);
  const activeIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive configurations
  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.15 : Math.max(0.85, Math.min(1.1, screenWidth / 375));
  const cardWidth = isTablet ? screenWidth / 4 : screenWidth / 2;

  const sectionTitleSize = 22 * scale;
  const cardTitleSize = 16 * scale;
  const descSize = 13.5 * scale;
  const buttonTextSize = 14 * scale;

  // INCREASED TO 250 (1000 items). CPU/Mem is safe because of FlatList Virtualization props.
  const replicatedData = useMemo(() => {
    return Array(250).fill(cardsData).flat();
  }, []);

  // Base middle index calculated to perfectly align with index 0 of cardsData
  const baseMiddleIndex = useMemo(() => {
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % cardsData.length); 
  }, [replicatedData.length]);

  // --- PLAYBACK CONTROLS ---
  const startAutoPlay = useCallback(() => {
    stopAutoPlay(); // Prevent duplicate intervals
    timerRef.current = setInterval(() => {
      let nextIndex = activeIndexRef.current + 1;

      // INVISIBLE RESET: If we get too close to the end, silently jump to the middle
      if (nextIndex >= replicatedData.length - 5) {
        // Calculate the exact matching card in the middle to make the jump invisible
        const remainder = nextIndex % cardsData.length;
        const safeMiddleIndex = baseMiddleIndex + remainder;

        flatListRef.current?.scrollToIndex({
          index: safeMiddleIndex,
          animated: false, // Turn off animation for the reset
        });
        activeIndexRef.current = safeMiddleIndex;
      } else {
        activeIndexRef.current = nextIndex;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 2500);
  }, [baseMiddleIndex, replicatedData.length]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // --- INITIALIZATION ---
  useEffect(() => {
    if (replicatedData.length > 0) {
      activeIndexRef.current = baseMiddleIndex;
      
      // Delay ensures layout has mounted before calculating offsets
      const initTimer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: baseMiddleIndex,
          animated: false,
        });
        startAutoPlay();
      }, 300);

      return () => {
        clearTimeout(initTimer);
        stopAutoPlay();
      };
    }
  }, [replicatedData, baseMiddleIndex, startAutoPlay, stopAutoPlay]);

  // --- MANUAL SWIPE SYNCING ---
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    let currentIndex = Math.round(scrollOffset / cardWidth);

    // If user manually swipes too far left or right, invisibly snap them back to the middle
    if (currentIndex < 5 || currentIndex > replicatedData.length - 5) {
      const remainder = currentIndex % cardsData.length;
      currentIndex = baseMiddleIndex + remainder;
      
      flatListRef.current?.scrollToIndex({
        index: currentIndex,
        animated: false,
      });
    }

    activeIndexRef.current = currentIndex;
    startAutoPlay(); // Resume auto-play after user finishes swiping
  };

  const handlePress = (route: string) => {
    if (route.startsWith("http://") || route.startsWith("https://")) {
      Linking.openURL(route).catch((err) =>
        console.error("Failed to open external link", err)
      );
    } else {
      router.push(route as any);
    }
  };

  // Prevent crash if auto-scroll triggers before an off-screen item is rendered
  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    });
  };

  const renderCard = ({ item }: { item: MoreForYouCard }) => {
    const isPopular = item.isPopular;

    return (
      <View
        style={{ width: cardWidth }}
        className={`flex-col items-center text-center justify-between px-3 py-5 min-h-[245px] border-r border-gray-200 relative ${
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

        <View className="flex-1 justify-center items-center w-full mt-1">
          <View className="mb-2">
            <Ionicons
              name={item.icon}
              size={28 * scale}
              color={isPopular ? "#ffffff" : "#10316C"}
            />
          </View>

          <Text
            style={{
              fontSize: cardTitleSize,
              lineHeight: cardTitleSize * 1.3,
              fontFamily: "PlusJakartaSans-Bold",
            }}
            className={`text-center mb-1 px-1 ${
              isPopular ? "text-white" : "text-gray-800"
            }`}
          >
            {item.title}
          </Text>

          <Text
            style={{
              fontSize: descSize,
              lineHeight: descSize * 1.4,
              fontFamily: "PlusJakartaSans-Medium",
            }}
            className={`text-center opacity-90 mb-3 ${
              isPopular ? "text-[#e2e8f0]" : "text-gray-600"
            }`}
          >
            {item.desc}
          </Text>
        </View>

        <Pressable
          onPress={() => handlePress(item.route)}
          className={`mt-auto px-4 py-1.5 rounded-full items-center justify-center border active:opacity-70 transition-opacity ${
            isPopular
              ? "bg-transparent border-white"
              : "bg-transparent border-[#10316C]"
          }`}
        >
          <Text
            style={{
              fontSize: buttonTextSize,
              fontFamily: "PlusJakartaSans-Bold",
            }}
            className={isPopular ? "text-white" : "text-[#10316C]"}
          >
            {item.buttonText}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View className="w-full bg-white pt-4 pb-0 mt-0 mb-0">
      <View className="px-4 mb-3">
        <Text
          style={{
            fontSize: sectionTitleSize,
            fontFamily: "PlusJakartaSans-Bold",
          }}
          className="text-gray-800"
        >
          More for You
        </Text>
      </View>

      <View className="border-y border-gray-200 overflow-hidden bg-white w-full">
        <FlatList
          ref={flatListRef}
          data={replicatedData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth}
          decelerationRate="fast"
          // Memory and CPU optimizations
          removeClippedSubviews={true}
          initialNumToRender={4}
          maxToRenderPerBatch={3}
          windowSize={5} 
          // Event Listeners
          onScrollBeginDrag={stopAutoPlay} // Pause when user touches
          onMomentumScrollEnd={handleMomentumScrollEnd} // Resume when user lets go
          onScrollToIndexFailed={handleScrollToIndexFailed} // Prevents rare crashes
          getItemLayout={(_, index) => ({
            length: cardWidth,
            offset: cardWidth * index,
            index,
          })}
        />
      </View>
    </View>
  );
}