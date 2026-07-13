import { useRole } from "@/contexts/RoleContext";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, usePathname, useSegments } from "expo-router";
import React, { useCallback } from "react";
import { BackHandler, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

type TabItem = {
  id: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
};

const tabs: TabItem[] = [
  { id: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { id: "request-quote", label: "Request Form", icon: "document-text-outline", activeIcon: "document-text" },
  { id: "categories", label: "Category", icon: "grid-outline", activeIcon: "grid" },
  { id: "wishlist", label: "Wishlist", icon: "heart-outline", activeIcon: "heart" },
  { id: "account", label: "Account", icon: "person-outline", activeIcon: "person" },
];

export default function CustomTabBar(props: BottomTabBarProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  
  // 👉 USE REACTIVE ROLE STATE FROM CONTEXT
  const { userRole, isSellerSignedIn, globalSellerId, globalBuyerId } = useRole();

  // Derive responsive scaling values
  const isTablet = screenWidth >= 768;
  const iconSize = isTablet ? 26 : 22;
  const fontSize = isTablet ? 12 : 9.5;
  const paddingVertical = isTablet ? 14 : 10;

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

  // Intercept the OS physical back button
  React.useEffect(() => {
    const hiddenRoutes = ["/welcome", "/auth", "/Login", "/Signup"];
    const shouldHide = hiddenRoutes.some((route) => pathname.includes(route));
    if (shouldHide) return;

    const handleBackPress = () => {
      // If there's a screen in the stack to go back to, pop it
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      // If we cannot go back further but we're not on home page, redirect to home
      if (activeTab !== "home") {
        router.replace("/(tabs)");
        return true;
      }
      // Otherwise, let the app close (default OS behavior)
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, [activeTab, pathname]);

  // Cast to string[] — expo-router types useSegments() as a strict route tuple,
  // but we need plain string comparisons for dynamic/auth segment checks.
  const segments = useSegments() as string[];

  // Hide the tab bar ONLY on onboarding/splash (index, welcome) and choose-role pages
  // We use useSegments() because usePathname() returns "/" for both the splash screen and the homepage `/(tabs)`.
  const isSplash = segments.length === 0 || (segments.length === 1 && segments[0] === "index");
  const isWelcome = segments.includes("welcome");
  const isChooseRole = segments.includes("choose-role");
  const isAuth = segments.includes("auth") || segments.includes("(auth)") || segments.includes("Login") || segments.includes("Signup");
  
  const shouldHide = isSplash || isWelcome || isChooseRole || isAuth;

  // ⚠️ useCallback MUST be defined before any conditional return (Rules of Hooks)
  const handlePress = useCallback((tabId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Fail silently if not supported
    }

    // Don't navigate if we're already on this tab — prevents unnecessary screen remounts
    if (activeTab === tabId) return;

    // Use router.replace so tabs SWAP the current screen instead of stacking.
    // Exception: home uses navigate() so if home is earlier in the stack it gets
    // brought back without remounting all its heavy carousels.
    if (tabId === "home") {
      router.navigate("/(tabs)");
    } else if (tabId === "request-quote") {
      router.push("/PostRequirenmentForm");
    } else if (tabId === "account") {
      if (userRole === "seller" && globalSellerId) {
        router.push("/Seller/Profile");
      } else if (userRole === "buyer" && globalBuyerId) {
        router.push("/Buyer/profile");
      } else {
        router.push("/(auth)/choose-role");
      }
    } else if (tabId === "wishlist") {
      router.push("/Wishlist");
    } else if (tabId === "categories") {
      router.push("/Industries");
    }
  }, [userRole, globalSellerId, globalBuyerId, activeTab]);

  if (shouldHide) {
    return null;
  }

  return (
    <View 
      pointerEvents="box-none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        width: "100%",
        paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 18,
        paddingTop: paddingVertical,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
      }}
    >
      <View 
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.6}
              onPress={() => handlePress(tab.id)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              className="py-1"
            >
              <View style={{ alignItems: 'center', justifyContent: 'center' }} className="mb-1">
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={iconSize}
                  color={isActive ? "#2563eb" : "#94a3b8"}
                />
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ fontSize }}
                className={`font-jakarta-bold tracking-tight text-center ${
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