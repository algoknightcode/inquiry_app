import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

type Brand = {
  id: string;
  name: string;
  category: string;
  initials: string;
  colors: string[];
};

const mockBrands: Brand[] = [
  { id: "1", name: "Matrix Tissue", category: "Paper & Packaging", initials: "MT", colors: ["#FF8E53", "#FF4E50"] },
  { id: "2", name: "Vands Engineering", category: "Engineering Solutions", initials: "VA", colors: ["#4FACFE", "#00F2FE"] },
  { id: "3", name: "Ai Solutions", category: "IT & Technology", initials: "Ai", colors: ["#B185FC", "#8A4CFC"] },
  { id: "4", name: "BSM Enterprises", category: "Manufacturing", initials: "BS", colors: ["#38EF7D", "#11998E"] },
  { id: "5", name: "Shree Shakti Infra", category: "Building & Construction", initials: "SR", colors: ["#FAD961", "#F76B1C"] },
  { id: "6", name: "Eco Corp", category: "Sustainability", initials: "EC", colors: ["#10B981", "#059669"] },
];

function TrendingBrandsCarousel() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(0);

  const translateX = useSharedValue(0);

  // Compute scale multiplier based on screen size (standard base width: 375px)
  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));

  // Dynamic responsive sizes
  const avatarSize = 52 * scale;
  const avatarTextSize = 16 * scale;
  const brandNameSize = 14.5 * scale;
  const categorySize = 11.5 * scale;
  const marqueeHeight = 62 * scale;
  const minTextWidth = 110 * scale;
  const titleSize = 22 * scale;
  const subtitleSize = 12 * scale;
  const bottomTextSize = 12.5 * scale;
  const paddingHorizontal = 16 * scale;
  const cardPaddingTop = 22 * scale;
  const cardPaddingBottom = 20 * scale;

  useEffect(() => {
    if (contentWidth > 0) {
      cancelAnimation(translateX);
      translateX.value = 0;
      translateX.value = withRepeat(
        withTiming(-contentWidth, {
          duration: contentWidth * 25, // Adjust speed factor here (25ms per pixel)
          easing: Easing.linear,
        }),
        -1, // infinite loop
        false // do not reverse
      );
    }
    return () => {
      cancelAnimation(translateX);
    };
  }, [contentWidth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderBrandItem = (brand: Brand, idx: number, prefix: string) => {
    return (
      <View key={`${prefix}-${brand.id}-${idx}`} className="flex-row items-center">
        {/* Brand Item */}
        <Pressable className="flex-row items-center py-1 active:scale-98 active:opacity-90">
          {/* Gradients Avatar */}
          <LinearGradient
            colors={brand.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize * 0.32,
            }}
            className="flex items-center justify-center shadow-sm shadow-slate-300"
          >
            <Text
              style={{
                fontSize: avatarTextSize,
              }}
              className="font-jakarta-bold text-white tracking-wide"
            >
              {brand.initials}
            </Text>
          </LinearGradient>
          
          {/* Info */}
          <View style={{ minWidth: minTextWidth }} className="ml-3.5 justify-center">
            <Text
              style={{ fontSize: brandNameSize }}
              className="text-slate-800 font-jakarta-bold tracking-tight"
              numberOfLines={1}
            >
              {brand.name}
            </Text>
            <Text
              style={{ fontSize: categorySize }}
              className="text-slate-400 font-jakarta mt-0.5"
              numberOfLines={1}
            >
              {brand.category}
            </Text>
          </View>
        </Pressable>

        {/* Vertical Divider */}
        <View className="h-9 w-[1px] bg-slate-200/50 mx-5" />
      </View>
    );
  };

  const handleFreeListingPress = () => {
    router.push("/Seller/auth/Signup");
  };

  return (
    <View style={{ paddingHorizontal }} className="my-4">
      {/* Title & Header Section */}
      <View className="flex-row justify-between items-end mb-3.5 px-1">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              style={{ fontSize: titleSize }}
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
          <Text style={{ fontSize: subtitleSize }} className="text-slate-400 font-jakarta mt-0.5">
            Discover top-performing partners active on InquiryBazaar
          </Text>
        </View>
      </View>

      {/* Main Card Container */}
      <View
        style={{
          paddingTop: cardPaddingTop,
          paddingBottom: cardPaddingBottom,
          paddingHorizontal,
        }}
        className="bg-white border border-slate-100 rounded-[28px] shadow-lg shadow-slate-100/50"
      >
        {/* Horizontal Marquee */}
        <View style={{ height: marqueeHeight }} className="overflow-hidden flex-row items-center relative">
          <Animated.View style={[{ flexDirection: "row", alignItems: "center" }, animatedStyle]}>
            {/* First group used to measure single set width */}
            <View
              onLayout={(e) => {
                setContentWidth(e.nativeEvent.layout.width);
              }}
              className="flex-row items-center"
            >
              {mockBrands.map((brand, idx) => renderBrandItem(brand, idx, "b1"))}
            </View>

            {/* Second group */}
            <View className="flex-row items-center">
              {mockBrands.map((brand, idx) => renderBrandItem(brand, idx, "b2"))}
            </View>
          </Animated.View>
        </View>

        {/* Divider Line */}
        <View className="border-t border-slate-100/80 my-4.5 mb-4"  />

        {/* Bottom Details Info Row */}
        <View className="flex-row justify-between items-center w-full">
          {/* Green dot verified text with dynamic pill bg */}
          <View className="flex-row items-center py-0.5 px-2 bg-emerald-50/60 border border-emerald-100/40 rounded-full">
            <View className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5" />
            <Text
              style={{ fontSize: bottomTextSize * 0.82 }}
              className="text-emerald-700 font-jakarta-semibold"
            >
              100+ verified brands active on IB
            </Text>
          </View>

          {/* CTA Link styled as a neat action chip */}
          <Pressable
            onPress={handleFreeListingPress}
            className="active:scale-97 flex-row items-center py-0.5 px-2 bg-orange-50 border border-orange-100/80 rounded-full"
          >
            <Text
              style={{ fontSize: bottomTextSize * 0.82 }}
              className="text-slate-700 font-jakarta-semibold"
            >
              Want to be featured?{" "}
              <Text className="text-orange-500 font-jakarta-bold">
                List free →
              </Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default React.memo(TrendingBrandsCarousel);
