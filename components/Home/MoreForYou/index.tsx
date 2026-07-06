import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Linking,
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

  // Responsive configurations
  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.15 : Math.max(0.85, Math.min(1.1, screenWidth / 375));
  
  const containerPadding = 16;
  
  // Calculate exact half width for the combined block structure in Image 1
  const cardWidth = isTablet 
    ? (screenWidth - containerPadding * 2) / 2 
    : (screenWidth - containerPadding * 2);

  const sectionTitleSize = 22 * scale;
  const cardTitleSize = 15 * scale;
  const descSize = 12 * scale;
  const buttonTextSize = 13 * scale;

  const handlePress = (route: string) => {
    if (route.startsWith("http://") || route.startsWith("https://")) {
      Linking.openURL(route).catch((err) =>
        console.error("Failed to open external link", err)
      );
    } else {
      router.push(route as any);
    }
  };

  // Grouping cards into pairs of 2 to match the layout style of Image 1
  const chunkedData = [];
  for (let i = 0; i < cardsData.length; i += 2) {
    chunkedData.push(cardsData.slice(i, i + 2));
  }

  const renderCombinedBlock = ({ item: pair }: { item: MoreForYouCard[] }) => {
    return (
      <View 
        style={{ width: cardWidth }}
        className="flex-row border border-[#e2e8f0] rounded-sm overflow-hidden bg-white"
      >
        {pair.map((item, idx) => {
          const isPopular = item.isPopular;
          // Split widths perfectly half-and-half inside the container
          return (
            <View
              key={item.id}
              className={`flex-1 p-5 justify-between min-h-[340px] ${
                isPopular ? "bg-[#0E2347]" : "bg-white"
              } ${idx === 0 ? "border-r border-[#e2e8f0]" : ""}`}
            >
              {/* Top Section */}
              <View className="flex-1">
                {isPopular ? (
                  <View className="flex-row items-center bg-[#ec771c] px-2.5 py-1 rounded-sm self-start mb-4 gap-1">
                    <MaterialCommunityIcons name="flash" size={10} color="#ffffff" />
                    <Text className="text-[9px] font-jakarta-bold text-white uppercase tracking-wider">
                      Most Popular
                    </Text>
                  </View>
                ) : (
                  <View className="h-[22px] mb-4" /> // Seamless visual layout baseline alignment
                )}

                {/* Icon */}
                <View className="mb-4 self-start">
                  <Ionicons
                    name={item.icon}
                    size={28 * scale}
                    color={isPopular ? "#ffffff" : "#10316C"}
                  />
                </View>

                {/* Title */}
                <Text
                  style={{ fontSize: cardTitleSize, lineHeight: cardTitleSize * 1.3 }}
                  className={`font-jakarta-bold mb-3 ${
                    isPopular ? "text-white" : "text-[#10316C]"
                  }`}
                >
                  {item.title}
                </Text>

                {/* Description */}
                <Text
                  style={{ fontSize: descSize, lineHeight: descSize * 1.4 }}
                  className={`font-jakarta-medium ${
                    isPopular ? "text-[#e2e8f0]" : "text-[#64748b]"
                  }`}
                >
                  {item.desc}
                </Text>
              </View>

              {/* Bottom Button */}
              <Pressable
                onPress={() => handlePress(item.route)}
                className={`mt-5 py-2.5 px-4 rounded-full items-center justify-center border active:scale-[0.98] ${
                  isPopular
                    ? "bg-transparent border-white"
                    : "bg-transparent border-[#10316C]"
                }`}
              >
                <Text
                  style={{ fontSize: buttonTextSize }}
                  className={`font-jakarta-bold ${
                    isPopular ? "text-white" : "text-[#10316C]"
                  }`}
                >
                  {item.buttonText}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View className="mt-6 mb-6">
      {/* Section Header */}
      <View className="px-4 mb-4">
        <Text
          style={{ fontSize: sectionTitleSize }}
          className="font-jakarta-extrabold text-[#0f172a] tracking-tight"
        >
          More for You
        </Text>
      </View>

      {/* Cards List */}
      <FlatList
        data={chunkedData}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderCombinedBlock}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: containerPadding,
          paddingBottom: 8,
          gap: 12
        }}
      />
    </View>
  );
}