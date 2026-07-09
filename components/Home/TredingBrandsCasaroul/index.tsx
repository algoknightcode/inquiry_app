import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  runOnUI,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

type Brand = {
  id: string;
  name: string;
  category: string;
  initials: string;
  colors: [string, string, ...string[]];
};

const mockBrands: Brand[] = [
  { id: "1", name: "Matrix Tissues", category: "Paper & Packaging", initials: "MT", colors: ["#FF8E53", "#FF4E50"] },
  { id: "2", name: "Vands Engineering", category: "Engineering Solutions", initials: "VA", colors: ["#4FACFE", "#00F2FE"] },
  { id: "3", name: "Ai Solutions", category: "IT & Technology", initials: "Ai", colors: ["#B185FC", "#8A4CFC"] },
  { id: "4", name: "BSM Enterprises", category: "Manufacturing", initials: "BS", colors: ["#38EF7D", "#11998E"] },
  { id: "5", name: "Shree Shakti Infra", category: "Building & Construction", initials: "SR", colors: ["#FAD961", "#F76B1C"] },
  { id: "6", name: "Eco Corp", category: "Sustainability", initials: "EC", colors: ["#10B981", "#059669"] },
];

const BrandCard = React.memo(({ brand, dynamicStyles }: { brand: Brand; dynamicStyles: any }) => {
  return (
    <View
      style={{ 
        width: dynamicStyles.itemWidth, 
        height: dynamicStyles.marqueeHeight,
      }}
      className="flex-row items-center justify-between pr-1.5"
    >
      <Pressable className="flex-row items-center flex-1 active:opacity-70 transition-opacity">
        <View
          style={[dynamicStyles.avatar, { backgroundColor: brand.colors[0] }]}
          className="items-center justify-center"
        >
          <Text
            style={dynamicStyles.avatarText}
            className="font-jakarta-bold text-white tracking-wide"
            numberOfLines={1}
            adjustsFontSizeToFit 
          >
            {brand.initials}
          </Text>
        </View>

        <View style={dynamicStyles.infoWrapper} className="ml-3 justify-center shrink">
          <Text
            style={dynamicStyles.brandName}
            className="text-slate-800 font-jakarta-bold tracking-tight"
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {brand.name}
          </Text>
          <Text
            style={dynamicStyles.category}
            className="text-slate-400 font-jakarta mt-0.5"
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {brand.category}
          </Text>
        </View>
      </Pressable>
      <View style={{ height: dynamicStyles.dividerHeight }} className="w-[1px] bg-slate-200/50" />
    </View>
  );
});

function TrendingBrandsCarousel({ isScrolling }: { isScrolling?: SharedValue<boolean> }) {
  const isFocused = useIsFocused();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  // 🚀 FIXED: Added ref to track if HUMAN is touching the screen vs ROBOT scrolling
  const isUserDragging = useRef(false);

  const flatListRef = useAnimatedRef<Animated.FlatList<Brand>>();
  const scrollIndex = useSharedValue(0);
  const isAutoPlaying = useSharedValue(false);
  const autoplayPulse = useSharedValue(0);

  const scale = useMemo(() => {
    const isTablet = screenWidth >= 768;
    return isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));
  }, [screenWidth]);

  const dynamicStyles = useMemo(() => {
    const avatarSize = 52 * scale;
    const paddingHorizontal = 16 * scale;
    const carouselWidth = screenWidth - paddingHorizontal * 2;

    let itemsPerView = 2;
    if (screenWidth >= 1024) itemsPerView = 4;
    else if (screenWidth >= 768) itemsPerView = 3;
    else if (screenWidth >= 480) itemsPerView = 2.5;
    else if (screenWidth < 350) itemsPerView = 1.7;

    const brandNameSize = 15.5 * scale;
    const brandNameLineHeight = brandNameSize * 1.3;
    const categorySize = 12.5 * scale;
    const categoryLineHeight = categorySize * 1.3;
    const infoWrapperHeight = brandNameLineHeight + categoryLineHeight + (4 * scale);

    return {
      paddingHorizontal,
      cardPaddingTop: 22 * scale,
      cardPaddingBottom: 20 * scale,
      marqueeHeight: 64 * scale,
      dividerHeight: 36 * scale,
      titleSize: 22 * scale,
      subtitleSize: 13 * scale,
      bottomTextSize: 13.5 * scale,
      itemWidth: carouselWidth / itemsPerView,
      avatarText: { fontSize: 18 * scale },
      brandName: { fontSize: brandNameSize, lineHeight: brandNameLineHeight },
      category: { fontSize: categorySize, lineHeight: categoryLineHeight },
      infoWrapper: { minWidth: 90 * scale, height: infoWrapperHeight, justifyContent: 'center' },
      avatar: { width: avatarSize, height: avatarSize, borderRadius: avatarSize * 0.32 },
    };
  }, [scale, screenWidth]);

  const ITEM_SIZE = dynamicStyles.itemWidth;

  const replicatedData = useMemo(() => {
    return Array(8).fill(mockBrands).flat();
  }, []);

  const baseMiddleIndex = useMemo(() => {
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % mockBrands.length);
  }, [replicatedData.length]);

  const startAutoPlayUI = () => {
    'worklet';
    isAutoPlaying.value = false;
    autoplayPulse.value = 0; // Safe reset
    isAutoPlaying.value = true;
    autoplayPulse.value = withRepeat(withTiming(1, { duration: 4500 }), -1);
  };

  const stopAutoPlayUI = () => {
    'worklet';
    cancelAnimation(autoplayPulse);
  };

  useAnimatedReaction(
    () => autoplayPulse.value,
    (currentPulse, prevPulse) => {
      if (!isFocused || !isAutoPlaying.value) return;
      if (isScrolling?.value) return;

      // 🚀 FIXED: Only trigger on a natural loop (1 -> 0), never on a manual start/reset
      if (prevPulse !== null && currentPulse < prevPulse && prevPulse > 0.5) {
        scrollIndex.value = scrollIndex.value + 1;
        scrollTo(flatListRef, scrollIndex.value * ITEM_SIZE, 0, true);
        
        if (scrollIndex.value >= replicatedData.length - 3) {
          const safeIndex = baseMiddleIndex + (scrollIndex.value % mockBrands.length);
          scrollIndex.value = safeIndex;
          scrollTo(flatListRef, safeIndex * ITEM_SIZE, 0, false);
        }
      }
    },
    [isFocused]
  );

  useEffect(() => {
    if (!isFocused) {
      runOnUI(stopAutoPlayUI)();
      isAutoPlaying.value = false;
      return;
    }

    if (replicatedData.length > 0) {
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
  }, [isFocused, replicatedData, baseMiddleIndex]);

  const handleScrollBegin = useCallback(() => {
    isUserDragging.current = true; // 🚀 Flag that human fingers are touching the list
    runOnUI(() => {
      'worklet';
      isAutoPlaying.value = false;
      stopAutoPlayUI();
    })();
  }, []);

  const handleMomentumScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // 🚀 FIXED: If a programmatic animation caused this scroll end, IGNORE IT immediately.
    if (!isUserDragging.current) return;
    
    // Reset flag since human let go
    isUserDragging.current = false;

    let currentIndex = Math.round(event.nativeEvent.contentOffset.x / ITEM_SIZE);

    if (currentIndex < 3 || currentIndex > replicatedData.length - 4) {
      currentIndex = baseMiddleIndex + (currentIndex % mockBrands.length);
      flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
    }

    scrollIndex.value = currentIndex;
    
    runOnUI(() => {
      'worklet';
      isAutoPlaying.value = true;
      startAutoPlayUI();
    })();
  }, [ITEM_SIZE, replicatedData.length, baseMiddleIndex]);

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    }, 500);
  }, []);

  const handleFreeListingPress = useCallback(() => {
    router.push("/Seller/auth/Signup");
  }, [router]);

  return (
    <View
      style={{ paddingHorizontal: dynamicStyles.paddingHorizontal }}
      className="mt-1 mb-4"
    >
      <View className="flex-row justify-between items-end mb-3.5 px-1">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              style={{ fontSize: dynamicStyles.titleSize }}
              className="text-slate-900 font-jakarta-bold tracking-tight mr-1.5"
            >
              Trending Brands
            </Text>
            <View className="bg-amber-100/80 px-2 py-0.5 rounded-full flex-row items-center border border-amber-200/50">
              <Text className="text-[10px] font-jakarta-bold text-amber-700 uppercase tracking-wider">
                Hot
              </Text>
            </View>
          </View>
          <Text
            style={{ fontSize: dynamicStyles.subtitleSize }}
            className="text-slate-400 font-jakarta mt-0.5"
          >
            Discover top-performing partners active on InquiryBazaar
          </Text>
        </View>
      </View>

      <View
        style={{
          paddingTop: dynamicStyles.cardPaddingTop,
          paddingBottom: dynamicStyles.cardPaddingBottom,
          paddingHorizontal: dynamicStyles.paddingHorizontal,
        }}
        className="bg-white border border-slate-200 rounded-[28px]"
      >
        <View style={{ height: dynamicStyles.marqueeHeight, width: "100%", justifyContent: 'center' }}>
          <Animated.FlatList
            ref={flatListRef}
            data={replicatedData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <BrandCard brand={item} dynamicStyles={dynamicStyles} />
            )}
            snapToInterval={ITEM_SIZE}
            snapToAlignment="start"
            decelerationRate="fast"
            onScrollBeginDrag={handleScrollBegin}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            getItemLayout={(_, index) => ({
              length: ITEM_SIZE,
              offset: ITEM_SIZE * index,
              index,
            })}
            initialNumToRender={6}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews={false} 
          />
        </View>

        <View className="border-t border-slate-100/80 my-4 mb-4" />

        <View className="flex-row justify-between items-center w-full">
          <View className="flex-row items-center py-1 px-2.5 bg-emerald-50/60 border border-emerald-100/40 rounded-full">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            <Text
              style={{ fontSize: dynamicStyles.bottomTextSize * 0.85 }}
              className="text-emerald-700 font-jakarta-semibold"
            >
              100+ verified brands 
            </Text>
          </View>

          <Pressable
            onPress={handleFreeListingPress}
            className="active:opacity-70 flex-row items-center py-1 px-2.5 bg-orange-50 border border-orange-100/80 rounded-full"
          >
            <Text
              style={{ fontSize: dynamicStyles.bottomTextSize * 0.85 }}
              className="text-slate-700 font-jakarta-semibold"
            >
              Want to be featured?
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default React.memo(TrendingBrandsCarousel);