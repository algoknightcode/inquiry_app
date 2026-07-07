import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import { DimensionValue, Linking, Pressable, Text, useWindowDimensions, View } from "react-native";

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

  // 1. CPU/Memory Optimized Layout Math
  // Prevents recalculating layout scale on every render unless screen rotates
  const metrics = useMemo(() => {
    const isTablet = screenWidth >= 768;
    const scale = isTablet ? 1.2 : Math.max(0.85, Math.min(1.1, screenWidth / 375));

    return {
      containerPadding: 20 * scale,
      iconSize: 22 * scale,
      itemTitleSize: 15.5 * scale,
      itemDescSize: 13 * scale,
      headingSize: 15 * scale,
      itemWidth: isTablet ? "31.5%" : "48%",
      columnGap: isTablet ? 12 : 8,
    };
  }, [screenWidth]);

  // 2. Optimized Data Array
  // Prevents the array from being recreated in memory 60 times a second
  const helpFeatures = useMemo(() => [
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
      iconProvider: "ionicons",
      iconName: "help", // Matches the "?" from your design
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
  ], [phoneNumber, supportHours]);

  // 3. Memoized handlers
  const handleLinkPress = useCallback((url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  }, []);

  return (
    <View 
      style={{ padding: metrics.containerPadding }}
      className="bg-[#0f172a] rounded-[24px] my-4 mx-4 shadow-lg"
    >
      {/* Features Grid */}
      <View className="flex-row flex-wrap justify-between" style={{ gap: metrics.columnGap }}>
        {helpFeatures.map((feat) => (
          <Pressable
            key={feat.id}
            onPress={() => feat.isCall && handleLinkPress(`tel:${phoneNumber}`)}
            style={{ width: metrics.itemWidth as DimensionValue }}
            className="mb-3 items-start active:scale-[0.98] transition-transform p-3 rounded-xl bg-white/5 border border-white/5"
          >
            {/* Icon Header Row - Switched to items-start for wrapped text alignment */}
            <View className="flex-row items-start mb-2 w-full">
              <View className="bg-white/10 p-1.5 rounded-lg mr-2.5 items-center justify-center">
                {feat.iconProvider === "ionicons" ? (
                  <Ionicons name={feat.iconName as any} size={metrics.iconSize} color="#38BDF8" />
                ) : (
                  <MaterialCommunityIcons name={feat.iconName as any} size={metrics.iconSize} color="#38BDF8" />
                )}
              </View>
              <Text 
                style={{ fontSize: metrics.itemTitleSize }}
                className="font-jakarta-bold text-white flex-1 leading-snug pt-0.5"
                numberOfLines={2} // Allows text to wrap perfectly without truncating
              >
                {feat.title}
              </Text>
            </View>

            {/* Description Text */}
            <Text 
              style={{ fontSize: metrics.itemDescSize }}
              className="font-jakarta-medium text-slate-300 leading-normal"
              numberOfLines={4} // Increased just in case description gets long on small screens
            >
              {feat.description}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-white/10 my-4 w-full" />

      {/* Follow Us Footer */}
      <View className="flex-row items-center justify-between flex-wrap gap-3 px-1">
        <Text style={{ fontSize: metrics.headingSize }} className="font-jakarta-bold text-white">
          Follow us on
        </Text>

        {/* Social Icons row */}
        <View className="flex-row items-center gap-3">
          {facebookUrl && (
            <Pressable 
              onPress={() => handleLinkPress(facebookUrl)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20 transition-colors"
            >
              <Ionicons name="logo-facebook" size={18} color="white" />
            </Pressable>
          )}

          {instagramUrl && (
            <Pressable 
              onPress={() => handleLinkPress(instagramUrl)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20 transition-colors"
            >
              <Ionicons name="logo-instagram" size={18} color="white" />
            </Pressable>
          )}

          {linkedinUrl && (
            <Pressable 
              onPress={() => handleLinkPress(linkedinUrl)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20 transition-colors"
            >
              <Ionicons name="logo-linkedin" size={18} color="white" />
            </Pressable>
          )}

          {youtubeUrl && (
            <Pressable 
              onPress={() => handleLinkPress(youtubeUrl)}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:bg-white/20 transition-colors"
            >
              <Ionicons name="logo-youtube" size={18} color="white" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}