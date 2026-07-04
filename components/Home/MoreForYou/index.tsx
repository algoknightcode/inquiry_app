import React, { useRef, useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export interface MoreForYouCard {
  id: string;
  title: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  buttonText: string;
  route: string; // Internal route (e.g. "/Pricing") or External link (e.g. "https://...")
  isPopular?: boolean;
}

const cardsData: MoreForYouCard[] = [
  {
    id: "1",
    title: "Sell on Inquiry Bazaar for Free",
    desc: "Expand your business reach and connect with high-intent buyers. Generate quality B2B leads without upfront cost.",
    icon: "storefront-outline",
    buttonText: "Start Selling",
    route: "/Seller/auth/Signup",
    isPopular: true,
  },
  {
    id: "2",
    title: "Get Instant Business Enquiries",
    desc: "Receive real-time enquiries directly on your mobile & dashboard. Never miss a potential deal with instant alerts.",
    icon: "phone-portrait-outline",
    buttonText: "Get Enquiries Now",
    route: "/PostRequirenmentForm",
  },
  {
    id: "3",
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

  const containerPadding = 16;
  const cardGap = 12;
  const cardWidth = (screenWidth - containerPadding * 2 - cardGap) / 2;

  const scale = Math.max(0.85, Math.min(1.1, screenWidth / 375));
  const sectionTitleSize = 22 * scale;
  const cardTitleSize = 14 * scale;
  const descSize = 11.5 * scale;
  const buttonTextSize = 12 * scale;

  const handlePress = (route: string) => {
    if (route.startsWith("http://") || route.startsWith("https://")) {
      Linking.openURL(route).catch((err) =>
        console.error("Failed to open external link", err)
      );
    } else {
      router.push(route as any);
    }
  };

  const renderItem = ({ item, index }: { item: MoreForYouCard; index: number }) => {
    const isLastItem = index === cardsData.length - 1;
    const isPopular = item.isPopular;

    return (
      <View
        style={{
          width: cardWidth,
          marginRight: isLastItem ? 0 : cardGap,
        }}
        className={`rounded-2xl border p-4 justify-between min-h-[300px] ${
          isPopular
            ? "bg-[#0f172a] border-[#1e293b]"
            : "bg-[#ffffff] border-[#e2e8f0]"
        }`}
      >
        {/* Top Section */}
        <View className="flex-1">
          {isPopular ? (
            <View className="flex-row items-center bg-[#ea580c] px-2 py-0.5 rounded-full self-start mb-3 gap-0.5">
              <MaterialCommunityIcons name="flash" size={10} color="#ffffff" />
              <Text className="text-[9px] font-jakarta-bold text-white uppercase tracking-wider">
                Most Popular
              </Text>
            </View>
          ) : (
            <View className="h-5 mb-3" /> // spacing helper
          )}

          {/* Icon */}
          <View className="mb-3 self-start">
            <Ionicons
              name={item.icon}
              size={28 * scale}
              color={isPopular ? "#ffffff" : "#0f172a"}
            />
          </View>

          {/* Title */}
          <Text
            style={{ fontSize: cardTitleSize, lineHeight: cardTitleSize * 1.3 }}
            className={`font-jakarta-bold mb-2 ${
              isPopular ? "text-white" : "text-[#0f172a]"
            }`}
          >
            {item.title}
          </Text>

          {/* Description */}
          <Text
            style={{ fontSize: descSize, lineHeight: descSize * 1.4 }}
            className={`font-jakarta-medium ${
              isPopular ? "text-[#94a3b8]" : "text-[#64748b]"
            }`}
          >
            {item.desc}
          </Text>
        </View>

        {/* Bottom Button */}
        <Pressable
          onPress={() => handlePress(item.route)}
          className={`mt-4 py-2.5 px-3 rounded-full items-center justify-center border active:scale-[0.97] transition-transform ${
            isPopular
              ? "bg-transparent border-white"
              : "bg-transparent border-[#0f172a]"
          }`}
        >
          <Text
            style={{ fontSize: buttonTextSize }}
            className={`font-jakarta-bold ${
              isPopular ? "text-white" : "text-[#0f172a]"
            }`}
          >
            {item.buttonText}
          </Text>
        </Pressable>
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
        data={cardsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + cardGap}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: containerPadding,
          paddingBottom: 8,
        }}
      />
    </View>
  );
}
