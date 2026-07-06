import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
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

  // Responsive configurations
  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.15 : Math.max(0.85, Math.min(1.1, screenWidth / 375));
  
  // FIXED: Calculate exactly 50% of the FULL screen width (no padding subtracted)
  const cardWidth = isTablet ? screenWidth / 4 : screenWidth / 2;

  const sectionTitleSize = 22 * scale;
  const cardTitleSize = 14 * scale;
  const descSize = 11.5 * scale;
  const buttonTextSize = 12 * scale;

  // Replicate flat data to allow smooth 1-by-1 infinite scrolling
  const replicatedData = React.useMemo(() => {
    return Array(10).fill(cardsData).flat(); // 40 items — enough for infinite feel, 10× lighter than 400
  }, []);

  // Initial scroll to the middle on mount
  useEffect(() => {
    if (replicatedData.length > 0) {
      const middleIndex = Math.floor(replicatedData.length / 2);
      activeIndexRef.current = middleIndex;
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: middleIndex,
          animated: false,
        });
      }, 200);
    }
  }, [replicatedData]);

  // --- AUTOPLAY / AUTO SWIPE LOGIC ---
  useEffect(() => {
    const totalItems = replicatedData.length;
    if (totalItems <= 1) return;

    const interval = setInterval(() => {
      let nextIndex = activeIndexRef.current + 1;
      
      if (nextIndex >= totalItems) {
        // Instantly reset to middle to keep the infinite loop seamless
        nextIndex = Math.floor(totalItems / 2);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: false,
        });
        activeIndexRef.current = nextIndex;
      } else {
        activeIndexRef.current = nextIndex;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }
    }, 2500); // 2500ms delay matches Web

    return () => clearInterval(interval);
  }, [replicatedData.length]);

  // Sync manual swipes
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / cardWidth);
    activeIndexRef.current = currentIndex;
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

  // Render a Single Card
  const renderCard = ({ item }: { item: MoreForYouCard }) => {
    const isPopular = item.isPopular;
    
    return (
      <View
        style={{ width: cardWidth }}
        className={`flex-col items-center text-center justify-between px-3 py-5 min-h-[245px] border-r border-gray-200 relative ${
          isPopular ? "bg-[#0E2347]" : "bg-white"
        }`}
      >
        {/* Most Popular Tag */}
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

        {/* Central Content */}
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
              fontFamily: "PlusJakartaSans-Bold"
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
              fontFamily: "PlusJakartaSans-Medium"
            }}
            className={`text-center opacity-90 mb-3 ${
              isPopular ? "text-[#e2e8f0]" : "text-gray-600"
            }`}
          >
            {item.desc}
          </Text>
        </View>

        {/* Action Button */}
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
              fontFamily: "PlusJakartaSans-Bold"
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
    <View className="w-full bg-[#f5f5f5] pt-4 pb-0 mt-2 mb-0">
      {/* Section Header */}
      {/* Kept padding here so the title text doesn't touch the very edge of the phone */}
      <View className="px-4 mb-3">
        <Text
          style={{ 
            fontSize: sectionTitleSize,
            fontFamily: "PlusJakartaSans-Bold"
          }}
          className="text-gray-800"
        >
          More for You
        </Text>
      </View>

      {/* FIXED: Removed marginHorizontal so the container is full bleed */}
      <View className="border-y border-gray-200 overflow-hidden bg-white w-full">
        {/* Cards Scrollable List */}
        <FlatList
          ref={flatListRef}
          data={replicatedData}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth} // Snaps exactly 1 card width at a time
          decelerationRate="fast"
          onMomentumScrollEnd={handleMomentumScrollEnd}
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