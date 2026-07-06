import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";

type Brand = {
  id: string;
  name: string;
  category: string;
  initials: string;
  colors: [string, string, ...string[]];
};

const mockBrands: Brand[] = [
  { id: "1", name: "Matrix Tissue", category: "Paper & Packaging", initials: "MT", colors: ["#FF8E53", "#FF4E50"] },
  { id: "2", name: "Vands Engineering", category: "Engineering Solutions", initials: "VA", colors: ["#4FACFE", "#00F2FE"] },
  { id: "3", name: "Ai Solutions", category: "IT & Technology", initials: "Ai", colors: ["#B185FC", "#8A4CFC"] },
  { id: "4", name: "BSM Enterprises", category: "Manufacturing", initials: "BS", colors: ["#38EF7D", "#11998E"] },
  { id: "5", name: "Shree Shakti Infra", category: "Building & Construction", initials: "SR", colors: ["#FAD961", "#F76B1C"] },
  { id: "6", name: "Eco Corp", category: "Sustainability", initials: "EC", colors: ["#10B981", "#059669"] },
];

const BrandCard = React.memo(({ brand, dynamicStyles }: { brand: Brand; dynamicStyles: any }) => {
  return (
    <View style={[styles.brandContainer, { width: dynamicStyles.itemWidth }]}>
      <Pressable style={styles.brandPressable}>
        <View style={[
          dynamicStyles.avatar, 
          styles.avatarCenter, 
          { backgroundColor: brand.colors[0] } 
        ]}>
          <Text style={[dynamicStyles.avatarText, styles.avatarTextBase]}>
            {brand.initials}
          </Text>
        </View>
        
        <View style={[dynamicStyles.infoWrapper, styles.infoWrapperBase]}>
          <Text style={[dynamicStyles.brandName, styles.brandNameBase]} numberOfLines={1}>
            {brand.name}
          </Text>
          <Text style={[dynamicStyles.category, styles.categoryBase]} numberOfLines={1}>
            {brand.category}
          </Text>
        </View>
      </Pressable>
      
      {/* Brought the divider back to separate the two visible items */}
      <View style={styles.divider} />
    </View>
  );
});

function TrendingBrandsCarousel() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const scale = useMemo(() => {
    const isTablet = screenWidth >= 768;
    return isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));
  }, [screenWidth]);

  const dynamicStyles = useMemo(() => {
    const avatarSize = 52 * scale;
    const paddingHorizontal = 16 * scale;
    
    // Total width available for the carousel
    const carouselWidth = screenWidth - (paddingHorizontal * 2);
    
    return {
      paddingHorizontal,
      cardPaddingTop: 22 * scale,
      cardPaddingBottom: 20 * scale,
      marqueeHeight: 62 * scale,
      titleSize: 22 * scale,
      subtitleSize: 12 * scale,
      bottomTextSize: 12.5 * scale,
      
      // DIVIDED BY 2: This ensures exactly two items fit on the screen at once
      itemWidth: carouselWidth / 2, 
      
      avatarText: { fontSize: 16 * scale },
      brandName: { fontSize: 14.5 * scale },
      category: { fontSize: 11.5 * scale },
      infoWrapper: { minWidth: 90 * scale }, // Slightly reduced to ensure it fits comfortably in half-screen
      avatar: {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize * 0.32,
      }
    };
  }, [scale, screenWidth]);

  // Buffer data for infinite scrolling
  const bufferedData = useMemo(() => [...mockBrands, ...mockBrands, ...mockBrands, ...mockBrands], []);

  const handleFreeListingPress = useCallback(() => {
    router.push("/Seller/auth/Signup");
  }, [router]);

  return (
    <View style={{ paddingHorizontal: dynamicStyles.paddingHorizontal }} className="my-4">
      {/* Title & Header Section */}
      <View className="flex-row justify-between items-end mb-3.5 px-1">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text style={{ fontSize: dynamicStyles.titleSize }} className="text-slate-900 font-jakarta-bold tracking-tight mr-1.5">
              Trending Brands
            </Text>
            <View className="bg-amber-100/80 px-2 py-0.5 rounded-full flex-row items-center border border-amber-200/50">
              <Text className="text-[10px] font-jakarta-bold text-amber-700 uppercase tracking-wider">
                Hot
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: dynamicStyles.subtitleSize }} className="text-slate-400 font-jakarta mt-0.5">
            Discover top-performing partners active on InquiryBazaar
          </Text>
        </View>
      </View>

      {/* Main Card Container */}
      <View
        style={{
          paddingTop: dynamicStyles.cardPaddingTop,
          paddingBottom: dynamicStyles.cardPaddingBottom,
          paddingHorizontal: dynamicStyles.paddingHorizontal,
        }}
        className="bg-white border border-slate-100 rounded-[28px] shadow-lg shadow-slate-100/50"
      >
        
        {/* Reanimated Carousel */}
        <View style={{ height: dynamicStyles.marqueeHeight, width: '100%' }}>
          <Carousel
            loop
            width={dynamicStyles.itemWidth}
            style={{ width: '100%' }}
            height={dynamicStyles.marqueeHeight}
            autoPlay={true}
            autoPlayInterval={2500}
            scrollAnimationDuration={1000} // Increased duration for a slower, smoother glide
            data={bufferedData} 
            renderItem={({ item, index }) => (
              <BrandCard key={`${item.id}-${index}`} brand={item} dynamicStyles={dynamicStyles} />
            )}
          />
        </View>

        <View className="border-t border-slate-100/80 my-4.5 mb-4"  />

        {/* Bottom Details Info Row */}
        <View className="flex-row justify-between items-center w-full">
          <View className="flex-row items-center py-0.5 px-2 bg-emerald-50/60 border border-emerald-100/40 rounded-full">
            <View className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5" />
            <Text style={{ fontSize: dynamicStyles.bottomTextSize * 0.82 }} className="text-emerald-700 font-jakarta-semibold">
              100+ verified brands active on IB
            </Text>
          </View>

          <Pressable onPress={handleFreeListingPress} className="active:scale-97 flex-row items-center py-0.5 px-2 bg-orange-50 border border-orange-100/80 rounded-full">
            <Text style={{ fontSize: dynamicStyles.bottomTextSize * 0.82 }} className="text-slate-700 font-jakarta-semibold">
              Want to be featured?{" "}
              <Text className="text-orange-500 font-jakarta-bold">List free →</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Pushes the divider to the edge of the width
    paddingRight: 6, // Prevents the divider from touching the very edge
  },
  brandPressable: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    flex: 1, // Ensures the pressable takes up available space
  },
  avatarCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTextBase: {
    fontFamily: "jakarta-bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  infoWrapperBase: {
    marginLeft: 12,
    justifyContent: "center",
    flexShrink: 1, // Prevents text from pushing out of bounds if it's too long
  },
  brandNameBase: {
    color: "#1e293b",
    fontFamily: "jakarta-bold",
    letterSpacing: -0.5,
  },
  categoryBase: {
    color: "#94a3b8",
    fontFamily: "jakarta",
    marginTop: 2,
  },
  divider: {
    height: 36,
    width: 1,
    backgroundColor: "rgba(226, 232, 240, 0.5)",
  }
});

export default React.memo(TrendingBrandsCarousel);