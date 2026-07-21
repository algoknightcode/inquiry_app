import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

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
  { id: "6", name: "Eco Corp", category: "Sustainability", initials: "EC", colors: ["#10B981", "#059669"] },
];

interface BrandCardProps {
  brand: Brand;
  itemWidth: number;
  scale: number;
  marqueeHeight: number;
}

const BrandCard = React.memo(({ brand, itemWidth, scale, marqueeHeight }: BrandCardProps) => {
  const avatarSize = useMemo(() => 52 * scale, [scale]);
  const avatarStyle = useMemo(() => ({
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize * 0.32,
    backgroundColor: brand.colors[0],
  }), [avatarSize, brand.colors]);

  const avatarTextStyle = useMemo(() => ({
    fontSize: 18 * scale,
  }), [scale]);

  const brandNameStyle = useMemo(() => ({
    fontSize: 15.5 * scale,
  }), [scale]);

  const categoryStyle = useMemo(() => ({
    fontSize: 12.5 * scale,
  }), [scale]);

  return (
    <View
      style={{ 
        width: itemWidth, 
        height: marqueeHeight,
        overflow: 'hidden',
      }}
      className="flex-row items-center justify-between pr-1"
    >
      <Pressable 
        style={{ width: '92%', flexDirection: 'row', alignItems: 'center' }}
        className="active:opacity-70 transition-opacity"
      >
        <View
          style={avatarStyle}
          className="items-center justify-center shrink-0"
        >
          <Text
            style={avatarTextStyle}
            className="font-jakarta-bold text-white tracking-wide"
            numberOfLines={1}
            adjustsFontSizeToFit 
          >
            {brand.initials}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0 }} className="ml-3 justify-center">
          <Text
            style={brandNameStyle}
            className="text-slate-800 font-jakarta-bold tracking-tight"
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {brand.name}
          </Text>
          <Text
            style={categoryStyle}
            className="text-slate-400 font-jakarta mt-0.5"
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {brand.category}
          </Text>
        </View>
      </Pressable>
      <View style={{ height: "55%" }} className="w-[1px] bg-slate-200/50" />
    </View>
  );
});

function TrendingBrandsCarousel({ isScrolling }: { isScrolling?: SharedValue<boolean> } = {}) {
  const isFocused = useIsFocused();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [isScrollPaused, setIsScrollPaused] = useState(false);

  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling, previousScrolling) => {
      if (scrolling !== previousScrolling) {
        runOnJS(setIsScrollPaused)(scrolling);
      }
    },
    [isScrolling]
  );

  const { scale, paddingHorizontal, itemWidth, marqueeHeight } = useMemo(() => {
    const isTablet = screenWidth >= 768;
    const computedScale = isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));
    const padHorizontal = 16 * computedScale;
    const carouselWidth = screenWidth - padHorizontal * 2;

    let itemsPerView = 2;
    if (screenWidth >= 1024) itemsPerView = 4;
    else if (screenWidth >= 768) itemsPerView = 3;
    else if (screenWidth >= 480) itemsPerView = 2.5;
    else if (screenWidth < 350) itemsPerView = 1.7;

    return {
      scale: computedScale,
      paddingHorizontal: padHorizontal,
      itemWidth: carouselWidth / itemsPerView,
      marqueeHeight: 64 * computedScale,
    };
  }, [screenWidth]);

  const handleFreeListingPress = useCallback(() => {
    router.push("/Seller/auth/Signup");
  }, [router]);

  return (
    <View
      style={{ paddingHorizontal }}
      className="mt-1 mb-4"
    >
      <View className="flex-row justify-between items-end mb-3.5 px-1">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              style={{ fontSize: 22 * scale }}
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
            style={{ fontSize: 13 * scale }}
            className="text-slate-400 font-jakarta mt-0.5"
          >
            Discover top-performing partners active on InquiryBazaar
          </Text>
        </View>
      </View>

      <View
        style={{
          paddingTop: 22 * scale,
          paddingBottom: 20 * scale,
          paddingHorizontal,
        }}
        className="bg-white border border-slate-200 rounded-[28px]"
      >
        <View style={{ height: marqueeHeight, width: "100%", justifyContent: 'center' }}>
          {isFocused && (
            <Carousel
              loop={true}
              autoPlay={!isScrollPaused}
              autoPlayInterval={2500}
              scrollAnimationDuration={800}
              data={mockBrands}
              width={itemWidth}
              height={marqueeHeight}
              style={{ width: screenWidth - paddingHorizontal * 2 }}
              renderItem={({ item }) => (
                <BrandCard
                  brand={item}
                  itemWidth={itemWidth}
                  scale={scale}
                  marqueeHeight={marqueeHeight}
                />
              )}
              onConfigurePanGesture={(gesture) => {
                "worklet";
                gesture.activeOffsetX([-10, 10]);
              }}
            />
          )}
        </View>

        <View className="border-t border-slate-100/80 my-4 mb-4" />

        <View className="flex-row justify-between items-center w-full">
          <View className="flex-row items-center py-1 px-2.5 bg-emerald-50/60 border border-emerald-100/40 rounded-full">
            <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            <Text
              style={{ fontSize: 13.5 * scale * 0.85 }}
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
              style={{ fontSize: 13.5 * scale * 0.85 }}
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