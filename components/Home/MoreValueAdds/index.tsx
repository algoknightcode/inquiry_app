import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
    runOnJS,
    SharedValue,
    useAnimatedReaction,
    useAnimatedRef,
    useSharedValue,
} from "react-native-reanimated";

type ValueAddCard = {
  id: string;
  badge: string;
  title: string;
  imageSource: any;
  route: string;
};

const cardsData: ValueAddCard[] = [
  {
    id: "1",
    badge: "Inquiry Bazaar",
    title: "Buy Premium\nDomains",
    imageSource: require("@/assets/images/more_value/2-2.webp"),
    route: "https://domain.inquirybazaar.com/",
  },
  {
    id: "2",
    badge: "Inquiry Bazaar",
    title: "Membership Plans",
    imageSource: require("@/assets/images/more_value/3-3.webp"),
    route: "/Pricing",
  },
  {
    id: "3",
    badge: "Inquiry Bazaar",
    title: "GEM Tenders",
    imageSource: require("@/assets/images/more_value/4-4.webp"),
    route: "https://gem.gov.in/",
  },
  {
    id: "4",
    badge: "Inquiry Bazaar",
    title: "Be Everywhere:\nExhibitions to Google",
    imageSource: require("@/assets/images/more_value/5-5.webp"),
    route: "/ExhibitionPage",
  },
];

export default function MoreValueAdds({ isScrolling }: { isScrolling?: SharedValue<boolean> } = {}) {
  const isFocused = useIsFocused();
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  // References and Scroll variables
  const flatListRef = useAnimatedRef<Animated.FlatList<ValueAddCard>>();
  const scrollIndex = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerPadding = 16;
  const cardGap = 10;
  const cardWidth = (screenWidth - containerPadding * 2 - cardGap) / 2;
  const cardHeight = 148; 

  const scale = Math.max(0.85, Math.min(1.1, screenWidth / 375));
  const titleSize = 22 * scale;
  const cardTitleSize = 17 * scale;
  const badgeSize = 13 * scale;
  const actionTextSize = 15 * scale;

  const maxScrollIndex = cardsData.length - 2;

  // JS Thread Autoplay
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoPlay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (maxScrollIndex <= 0) return;

    return; // Autoplay safely disabled
    autoplayTimerRef.current = setInterval(() => {
      if (!isFocused) {
        return;
      }
      let nextIndex = scrollIndex.value + 1;
      if (nextIndex > maxScrollIndex) nextIndex = 0;

      scrollIndex.value = nextIndex;
      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000);
  }, [isFocused, maxScrollIndex, stopAutoPlay]);

  // Autoplay control on focus
  useEffect(() => {
    if (isFocused && maxScrollIndex > 0) {
      scrollIndex.value = 0;
      setCurrentIndex(0);

      const initTimer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: 0, animated: false });
        startAutoPlay();
      }, 2000);

      return () => {
        clearTimeout(initTimer);
        stopAutoPlay();
      };
    } else {
      stopAutoPlay();
    }
  }, [isFocused, maxScrollIndex, startAutoPlay, stopAutoPlay]);

  // Guarantee background timer clearance on unmount/screen change
  useEffect(() => {
    return () => stopAutoPlay();
  }, [stopAutoPlay]);

  // Pause autoplay while the main home feed is being scrolled, resume once it settles
  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling, previousScrolling) => {
      if (scrolling === previousScrolling) return;
      if (scrolling) {
        runOnJS(stopAutoPlay)();
      } else {
        runOnJS(startAutoPlay)();
      }
    },
    [isScrolling]
  );

  // Manual Scroll Handling
  const handleScrollBegin = useCallback(() => {
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / (cardWidth + cardGap));
    const safeIndex = Math.min(Math.max(0, index), maxScrollIndex);

    scrollIndex.value = safeIndex;
    setCurrentIndex(safeIndex);
    startAutoPlay();
  }, [cardWidth, cardGap, maxScrollIndex, startAutoPlay]);

  const handlePress = useCallback((route: string) => {
    if (route.startsWith("http://") || route.startsWith("https://")) {
      Linking.openURL(route).catch((err) => console.error("Failed to open external link", err));
    } else {
      router.push(route as Href);
    }
  }, [router]);

  const renderItem = useCallback(({ item, index }: { item: ValueAddCard; index: number }) => {
    const isLastItem = index === cardsData.length - 1;

    return (
      <Pressable
        onPress={() => handlePress(item.route)}
        style={{ 
          width: cardWidth, 
          height: cardHeight,
          marginRight: isLastItem ? 0 : cardGap 
        }}
        className="rounded-[20px] bg-[#F1F5F9] border border-[#F97316] relative overflow-hidden active:scale-[0.97] transition-transform"
      >
        {/* User Provided Image */}
        <View className="absolute bottom-1 right-1 z-0 opacity-80">
          <Image 
            source={item.imageSource}
            style={{ width: 88, height: 88 }}
            contentFit="contain"
            transition={300}
          />
        </View>

        <View className="flex-1 p-4 justify-between z-10">
          <View>
            <Text 
              style={{ fontSize: badgeSize }}
              className="text-[#334155] font-jakarta-medium mb-2 uppercase tracking-wide"
            >
              {item.badge}
            </Text>
            <Text 
              style={{ fontSize: cardTitleSize, lineHeight: cardTitleSize * 1.3 }}
              className="text-[#172554] font-jakarta-extrabold"
            >
              {item.title}
            </Text>
          </View>

          <View className="flex-row items-center mt-3">
            <Text 
              style={{ fontSize: actionTextSize }}
              className="text-[#EA580C] font-jakarta-bold mr-2"
            >
              Learn more
            </Text>
            <View className="w-6 h-6 rounded-full bg-[#EA580C] items-center justify-center">
              <Ionicons name="arrow-forward" size={14} color="white" />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }, [cardWidth, cardHeight, cardGap, handlePress, badgeSize, cardTitleSize, actionTextSize]);

  return (
    <View className="mt-8 mb-2">
      {/* Section Header */}
      <View className="px-4 mb-5">
        <Text
          style={{ fontSize: titleSize }}
          className="font-jakarta-extrabold text-[#172554] tracking-tight"
        >
          More Value Adds
        </Text>
      </View>

      {/* Two-Card Widget Carousel */}
      <Animated.FlatList
        ref={flatListRef}
        data={cardsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + cardGap}
        contentContainerStyle={{ paddingHorizontal: containerPadding, paddingBottom: 10 }}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: cardWidth + cardGap,
          offset: (cardWidth + cardGap) * index,
          index,
        })}
      />

      {/* Sleek Pagination Pills */}
      <View className="flex-row justify-center mt-3 gap-1.5">
        {Array.from({ length: maxScrollIndex + 1 }).map((_, index) => {
          const isActive = currentIndex === index;
          return (
            <View
              key={index}
              style={{
                width: isActive ? 24 : 8,
                height: 6,
                backgroundColor: isActive ? "#F97316" : "#E2E8F0",
                borderRadius: 4,
              }}
              className="transition-all duration-300"
            />
          );
        })}
      </View>
    </View>
  );
}