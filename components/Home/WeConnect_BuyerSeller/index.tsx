import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function WeConnectBuyerSeller() {
  const { width: screenWidth } = useWindowDimensions();

  // 1. Detect device type & orientation
  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));

  // 2. Responsive Sizing & Typography Constants (centralized inside component)
  const titleSize = 24 * scale;
  const itemTitleSize = 14 * scale;
  const itemSubtitleSize = 12 * scale;
  const iconSize = 20 * scale;
  const iconBoxSize = 44 * scale;

  // 3. Adaptive Spacing (Paddings & Margins)
  const containerPaddingHorizontal = 20 * scale;
  const containerPaddingVertical = 24 * scale;
  const itemMarginBottom = (isTablet ? 12 : 24) * scale;
  const headingMarginBottom = 28 * scale;

  // 4. Responsive Grid structure (4 columns on tablets, 2 columns on mobile)
  const columnWidth = isTablet ? "23.5%" : "48%";

  const features = [
    {
      id: "buyer-assistance",
      title: "Buyer Assistance",
      subtitle: "Seamless sourcing",
      iconProvider: "ionicons",
      iconName: "cart-outline",
    },
    {
      id: "hybrid-network",
      title: "India’s Hybrid B2B Network",
      subtitle: "Competitive pricing",
      iconProvider: "material",
      iconName: "currency-inr",
    },
    {
      id: "quick-response",
      title: "Quick Response",
      subtitle: "Full protection",
      iconProvider: "ionicons",
      iconName: "shield-checkmark-outline",
    },
    {
      id: "genuine-inquiries",
      title: "Get Genuine Inquiries",
      subtitle: "Verified inquiries",
      iconProvider: "ionicons",
      iconName: "people-outline",
    },
  ];

  return (
    <View 
      style={{ 
        paddingHorizontal: containerPaddingHorizontal, 
        paddingVertical: containerPaddingVertical,
        backgroundColor: "#fff"
      }}
    >
      {/* Heading */}
      <Text
        style={{ 
          fontSize: titleSize, 
          lineHeight: titleSize * 1.25,
          marginBottom: headingMarginBottom
        }}
        className="font-jakarta-extrabold text-slate-900 tracking-tight"
      >
        We connect <Text className="text-[#EA580C]">Buyers & Sellers</Text>
      </Text>

      {/* Grid Layout (Responsive column count based on width) */}
      <View className="flex-row flex-wrap justify-between">
        {features.map((item) => (
          <View
            key={item.id}
            style={{ 
              width: columnWidth, 
              marginBottom: itemMarginBottom,
              flexDirection: isTablet ? "column" : "row",
              alignItems: isTablet ? "center" : "flex-start",
            }}
          >
            {/* Responsive Icon Box */}
            <View
              style={{ 
                width: iconBoxSize, 
                height: iconBoxSize, 
                borderRadius: iconBoxSize / 4,
                marginBottom: isTablet ? 10 : 0,
                marginRight: isTablet ? 0 : 12,
              }}
              className="bg-[#EAF2F5] items-center justify-center shadow-xs"
            >
              {item.iconProvider === "ionicons" ? (
                <Ionicons name={item.iconName as any} size={iconSize} color="#0F172A" />
              ) : (
                <MaterialCommunityIcons name={item.iconName as any} size={iconSize} color="#0F172A" />
              )}
            </View>

            {/* Content Container */}
            <View 
              style={{ 
                flex: 1, 
                alignItems: isTablet ? "center" : "flex-start",
                justifyContent: "center"
              }}
            >
              <Text
                style={{ 
                  fontSize: itemTitleSize,
                  textAlign: isTablet ? "center" : "left"
                }}
                className="font-jakarta-bold text-slate-900 leading-snug"
              >
                {item.title}
              </Text>
              <Text
                style={{ 
                  fontSize: itemSubtitleSize,
                  textAlign: isTablet ? "center" : "left"
                }}
                className="font-jakarta-medium text-slate-500 mt-1"
              >
                {item.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
