import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, usePathname } from "expo-router";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { userRole, isSellerSignedIn } from "@/utils/roleCache";
import AsyncStorage from "@react-native-async-storage/async-storage";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type TabItem = {
  id: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
};

const tabs: TabItem[] = [
  { id: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { id: "request-quote", label: "Request A Quote", icon: "document-text-outline", activeIcon: "document-text" },
  { id: "categories", label: "Category", icon: "grid-outline", activeIcon: "grid" },
  { id: "wishlist", label: "Wishlist", icon: "heart-outline", activeIcon: "heart" },
  { id: "account", label: "Account", icon: "person-outline", activeIcon: "person" },
];

export default function CustomTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Hide the tab bar on onboarding and auth flow pages
  const hiddenRoutes = ["/welcome", "/auth", "/Login", "/Signup"];
  const shouldHide = hiddenRoutes.some((route) => pathname.includes(route));

  if (shouldHide) {
    return null;
  }

  // Derive the active tab dynamically from the current route pathname
  let activeTab = "home";
  if (pathname.includes("/Wishlist")) {
    activeTab = "wishlist";
  } else if (
    pathname.includes("/Industries") ||
    pathname.includes("/SubCategory") ||
    pathname.includes("/GrId_MainCategory")
  ) {
    activeTab = "categories";
  } else if (
    pathname.includes("/Profile") ||
    pathname.includes("/profile")
  ) {
    activeTab = "account";
  } else if (pathname.includes("/PostRequirenmentForm")) {
    activeTab = "request-quote";
  } else if (pathname === "/" || pathname === "/index" || pathname.includes("(tabs)")) {
    activeTab = "home";
  }

  const handlePress = async (tabId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Fail silently if not supported
    }

    if (tabId === "home") {
      router.replace("/(tabs)");
    } else if (tabId === "request-quote") {
      router.replace("/PostRequirenmentForm");
    } else if (tabId === "account") {
      try {
        const storedBuyerId = await AsyncStorage.getItem("buyerId");
        const storedSupplierId = await AsyncStorage.getItem("supplierId");
        if (storedSupplierId) {
          router.replace("/Seller/Profile");
        } else if (storedBuyerId) {
          router.replace("/Buyer/profile");
        } else {
          router.replace("/(auth)/choose-role");
        }
      } catch (e) {
        router.replace("/(auth)/choose-role");
      }
    } else if (tabId === "wishlist") {
      router.replace("/Wishlist");
    } else if (tabId === "categories") {
      router.replace("/Industries");
    }
  };

  return (
    <View 
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      className="bg-white shadow-2xl shadow-slate-200 border-t border-slate-100"
    >
      <View className="flex-row justify-between items-center px-4 pb-1 pt-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.6}
              onPress={() => handlePress(tab.id)}
              className="items-center justify-center w-[72px]"
            >
              <View className="mb-0.5">
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? "#2563eb" : "#94a3b8"}
                />
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className={`text-[9.5px] font-jakarta-bold tracking-tight text-center ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}