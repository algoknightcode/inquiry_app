import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Linking, Pressable, Text, useWindowDimensions, View } from "react-native";

// ── Interface Props ────────────────────────────────────────────────────────
export interface HomeFooterHelpProps {
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  phoneNumber?: string;
  supportHours?: string;
}

export default function HomeFooterHelp({
  facebookUrl = "https://facebook.com",
  instagramUrl = "https://instagram.com",
  linkedinUrl = "https://linkedin.com",
  youtubeUrl = "https://youtube.com",
  phoneNumber = "+917303486777",
  supportHours = "Mon–Sun: 9am–8pm",
}: HomeFooterHelpProps) {
  const { width: screenWidth } = useWindowDimensions();

  // 1. Responsive Screen Calculations
  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.2 : Math.max(0.85, Math.min(1.1, screenWidth / 375));

  // 2. Adaptive Spacing & Sizing
  const containerPadding = 18 * scale;
  const iconSize = 22 * scale;
  const itemTitleSize = 13.5 * scale;
  const itemDescSize = 11 * scale;
  const headingSize = 15 * scale;

  // Layout adjusts: 3 columns on tablet, 2 columns on mobile (to keep it compact and reduce height)
  const itemWidth = isTablet ? "31.5%" : "48%";
  const columnGap = isTablet ? 10 : 6;

  // Features list structured for clean loops
  const helpFeatures = [
    {
      id: "support",
      title: "Dedicated Support",
      description: `Call: ${phoneNumber}\n(${supportHours})`,
      iconProvider: "ionicons",
      iconName: "headset-outline",
      isCall: true,
    },
    {
      id: "verified",
      title: "Verified Suppliers Only",
      description: "Trusted manufacturers and wholesalers screened for reliability.",
      iconProvider: "material",
      iconName: "decagram-outline",
    },
    {
      id: "response",
      title: "Quick Response",
      description: "Get multiple quotations within hours of posting requirement.",
      iconProvider: "material",
      iconName: "package-variant-closed-refresh",
    },
    {
      id: "categories",
      title: "Wide Product Categories",
      description: "Explore lakhs of B2B products across multiple industries.",
      iconProvider: "ionicons",
      iconName: "grid-outline",
    },
    {
      id: "assistance",
      title: "Buyer Assistance",
      description: "Our B2B sourcing team helps find the best prices guaranteed.",
      iconProvider: "ionicons",
      iconName: "chatbox-ellipses-outline",
    },
    {
      id: "protection",
      title: "Buyer Protection",
      description: "Committed to buyer interests for a smooth shopping journey.",
      iconProvider: "ionicons",
      iconName: "shield-checkmark-outline",
    },
  ];

  // Helper to open links safely
  const handleLinkPress = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  };

  return (
    <View 
      style={{ padding: containerPadding }}
      className="bg-[#112240] rounded-[24px] my-3 mx-4 shadow-lg"
    >
      {/* Features Grid */}
      <View className="flex-row flex-wrap justify-between" style={{ gap: columnGap }}>
        {helpFeatures.map((feat) => (
          <Pressable
            key={feat.id}
            onPress={() => feat.isCall && handleLinkPress(`tel:${phoneNumber}`)}
            style={{ width: itemWidth }}
            className={`mb-4 items-start active:opacity-80 p-2 rounded-xl bg-white/5 border border-white/5`}
          >
            {/* Icon Header Row */}
            <View className="flex-row items-center mb-1.5">
              <View className="bg-white/10 p-1.5 rounded-lg mr-2 items-center justify-center">
                {feat.iconProvider === "ionicons" ? (
                  <Ionicons name={feat.iconName as any} size={iconSize} color="#38BDF8" />
                ) : (
                  <MaterialCommunityIcons name={feat.iconName as any} size={iconSize} color="#38BDF8" />
                )}
              </View>
              <Text 
                style={{ fontSize: itemTitleSize }}
                className="font-jakarta-bold text-white flex-1 leading-tight"
                numberOfLines={1}
              >
                {feat.title}
              </Text>
            </View>

            {/* Description Text */}
            <Text 
              style={{ fontSize: itemDescSize }}
              className="font-jakarta-medium text-slate-300 leading-normal"
              numberOfLines={3}
            >
              {feat.description}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-white/10 my-3 w-full" />

      {/* Follow Us Footer */}
      <View className="flex-row items-center justify-between flex-wrap gap-2 px-1">
        <Text style={{ fontSize: headingSize }} className="font-jakarta-bold text-white">
          Follow us on
        </Text>

        {/* Social Icons row */}
        <View className="flex-row items-center" style={{ gap: 10 }}>
          {facebookUrl && (
            <Pressable 
              onPress={() => handleLinkPress(facebookUrl)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
            >
              <Ionicons name="logo-facebook" size={18} color="white" />
            </Pressable>
          )}

          {instagramUrl && (
            <Pressable 
              onPress={() => handleLinkPress(instagramUrl)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
            >
              <Ionicons name="logo-instagram" size={18} color="white" />
            </Pressable>
          )}

          {linkedinUrl && (
            <Pressable 
              onPress={() => handleLinkPress(linkedinUrl)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
            >
              <Ionicons name="logo-linkedin" size={18} color="white" />
            </Pressable>
          )}

          {youtubeUrl && (
            <Pressable 
              onPress={() => handleLinkPress(youtubeUrl)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
            >
              <Ionicons name="logo-youtube" size={18} color="white" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
