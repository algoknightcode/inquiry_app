import { isSellerSignedIn, setGlobalBuyerId, setGlobalRole, setGlobalSellerId, setSellerSignedIn } from "@/utils/roleCache";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  InteractionManager,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  currentRole: "buyer" | "seller";
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  route: string;
  highlight?: boolean;
};

const baseMenuItems: MenuItem[] = [
  { icon: "home-outline", title: "Home", route: "/(tabs)" },
  { icon: "person-outline", title: "Profile", route: "/Buyer/profile" },
  { icon: "grid-outline", title: "Explore Industries", route: "/Industries" },
  { icon: "briefcase-outline", title: "Free Listing", route: "/Seller/auth/Signup", highlight: true },
  { icon: "notifications-outline", title: "Notifications", route: "/NotificationPanel" },
  { icon: "help-circle-outline", title: "Help & Support", route: "/HelpSupport" },
];

const sellerSubMenuItems: MenuItem[] = [
  { icon: "speedometer-outline", title: "Dashboard", route: "/Seller/dashboard" },
  { icon: "person-outline", title: "Profile", route: "/Seller/Profile" },
  { icon: "cube-outline", title: "Products", route: "/Seller/ViewAllProduct" },
  { icon: "add-circle-outline", title: "Add Product", route: "/Seller/AddProduct" },
  { icon: "headset-outline", title: "Leads", route: "/Seller/Lead" },
];

// ── Memoized Child Components (Prevents UI stutter during state changes) ──

const RenderMenuItem = memo(({ item, metrics, onPress }: { item: MenuItem, metrics: any, onPress: (route: string) => void }) => (
  <Pressable
    onPress={() => onPress(item.route)}
    className={`flex-row items-center rounded-[16px] active:scale-[0.97] transition-all ${
      item.highlight ? 'border border-blue-100' : 'active:bg-slate-50'
    }`}
    style={{
      paddingHorizontal: metrics.itemPaddingHorizontal,
      paddingVertical: metrics.itemPaddingVertical,
      marginBottom: metrics.itemMarginBottom,
      backgroundColor: item.highlight ? 'rgba(239, 246, 255, 0.5)' : 'transparent',
    }}
    android_ripple={{ color: item.highlight ? "#dbeafe" : "#f1f5f9" }}
  >
    <View 
      style={[
        { width: metrics.itemIconBoxSize, height: metrics.itemIconBoxSize },
        item.highlight ? { shadowColor: '#bfdbfe', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 2 } : {}
      ]}
      className={`rounded-xl items-center justify-center mr-4 ${item.highlight ? 'bg-blue-900' : 'bg-slate-50'}`}
    >
      <Ionicons name={item.icon} size={metrics.itemIconSize} color={item.highlight ? "#ffffff" : "#475569"} />
    </View>
    <Text 
      style={{ fontSize: metrics.itemTextSize }}
      className={`flex-1 tracking-tight ${item.highlight ? 'font-jakarta-bold text-blue-900' : 'font-jakarta-semibold text-slate-700'}`}
    >
      {item.title}
    </Text>
    <Ionicons name="chevron-forward" size={metrics.chevronSize} color={item.highlight ? "#1b2a6b" : "#cbd5e1"} />
  </Pressable>
));

const RenderSubItem = memo(({ subItem, metrics, onPress }: { subItem: MenuItem, metrics: any, onPress: (route: string) => void }) => (
  <Pressable
    onPress={() => onPress(subItem.route)}
    style={{ 
      paddingVertical: metrics.subItemPaddingVertical, 
      paddingHorizontal: metrics.subItemPaddingHorizontal, 
      marginBottom: 4 
    }}
    className="flex-row items-center rounded-xl active:bg-white active:scale-[0.99] transition-all"
  >
    <View 
      style={{ width: metrics.subItemIconBoxSize, height: metrics.subItemIconBoxSize }}
      className="rounded-lg bg-white border border-slate-100 items-center justify-center mr-3"
    >
      <Ionicons name={subItem.icon} size={metrics.subItemIconSize} color="#1b2a6b" />
    </View>
    <Text style={{ fontSize: metrics.subItemTextSize }} className="font-jakarta-semibold text-slate-700 flex-1">
      {subItem.title}
    </Text>
    <Ionicons name="chevron-forward" size={metrics.chevronSize - 2} color="#cbd5e1" />
  </Pressable>
));


// ── Main Component ──

const Sidebar = ({ visible, onClose, currentRole }: SidebarProps) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [sellerMenuExpanded, setSellerMenuExpanded] = useState(true);
  const [activeRole, setActiveRole] = useState<"buyer" | "seller">(currentRole);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const slideAnim = useRef(new Animated.Value(-400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // CPU/Memory Optimized Layout Math for any screen height and width
  const metrics = useMemo(() => {
    const isTablet = screenWidth >= 768;
    const baseScale = isTablet ? 1.15 : Math.max(0.85, Math.min(1.1, screenWidth / 375));
    const isShortScreen = screenHeight < 680;
    const hScale = isShortScreen ? 0.78 : 1.0;
    const sidebarWidth = isTablet ? 320 : Math.min(screenWidth * 0.68, 250 * baseScale);

    return {
      sidebarWidth,
      scale: baseScale,
      
      headerPaddingHorizontal: 20 * baseScale,
      headerPaddingTop: 12 * hScale,
      headerPaddingBottom: 16 * hScale,
      logoSize: 40 * baseScale,
      logoTextSize: 17 * baseScale,
      logoSubTextSize: 11 * baseScale,
      closeBtnSize: 32 * baseScale,
      closeIconSize: 18 * baseScale,

      scrollPaddingHorizontal: 12 * baseScale,
      scrollPaddingTop: 12 * hScale,

      itemMarginBottom: 8 * hScale,
      itemPaddingVertical: 12 * hScale,
      itemPaddingHorizontal: 14 * baseScale,
      itemIconBoxSize: 36 * baseScale,
      itemIconSize: 18 * baseScale,
      itemTextSize: 14.5 * baseScale,
      chevronSize: 15 * baseScale,

      subItemPaddingVertical: 9 * hScale,
      subItemPaddingHorizontal: 10 * baseScale,
      subItemIconBoxSize: 28 * baseScale,
      subItemIconSize: 14 * baseScale,
      subItemTextSize: 13 * baseScale,

      planCardPadding: 12 * baseScale,
      planCardMarginBottom: 16 * hScale,

      logoutPaddingHorizontal: 16 * baseScale,
      logoutPaddingVertical: 10 * hScale,
      logoutButtonPaddingVertical: 12 * hScale,
      logoutTextSize: 13.5 * baseScale,
      logoutIconSize: 17 * baseScale,

      footerPaddingHorizontal: 24 * baseScale,
      footerPaddingTop: 10 * hScale,
      footerPaddingBottom: 8 * hScale,
      footerTextSize: 10 * baseScale,
    };
  }, [screenWidth, screenHeight]);

  const activeMenuItems = useMemo(() => {
    return activeRole === "seller" 
      ? baseMenuItems.filter(item => item.title !== "Free Listing") 
      : baseMenuItems;
  }, [activeRole]);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 85,
          friction: 14,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -metrics.sidebarWidth,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  }, [metrics.sidebarWidth, onClose, slideAnim, fadeAnim]);

  const handleLogout = useCallback(async () => {
    setLogoutConfirmVisible(false);
    handleClose();
    setGlobalRole("buyer");
    setSellerSignedIn(false);
    setGlobalSellerId(null);
    setGlobalBuyerId(null);
    
    // InteractionManager ensures routing waits until the drawer close animation is 100% finished
    InteractionManager.runAfterInteractions(async () => {
      try {
        await AsyncStorage.multiRemove(["supplierId", "buyerId", "phone", "phoneNumber"]);
      } catch (e) {
        console.log("Error clearing storage:", e);
      }
      router.replace("/(auth)/choose-role");
    });
  }, [handleClose]);

  const toggleSellerMenu = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSellerMenuExpanded(prev => !prev);
  }, []);

  const handleNavigation = useCallback(async (route: string) => {
    handleClose();
    
    // Defer heavy routing logic until AFTER animation to prevent frame drops
    InteractionManager.runAfterInteractions(async () => {
      const supplierId = await AsyncStorage.getItem("supplierId");
      let finalRoute = route;

      if (route === "/Buyer/profile") {
        if (!isLoggedIn) {
          finalRoute = "/(auth)/choose-role";
        } else if (activeRole === "seller") {
          finalRoute = "/Seller/Profile";
        }
      } else {
        const isSellerRoute = 
          route.toLowerCase() === "/seller/profile" || 
          route.toLowerCase() === "/seller/addproduct" ||
          route.toLowerCase() === "/seller/viewallproduct" ||
          route.toLowerCase() === "/seller/dashboard" ||
          route.toLowerCase() === "/seller/lead";
        
        if (isSellerRoute && !isSellerSignedIn && !supplierId) {
          finalRoute = "/Seller/auth/Login";
        }
      }
      router.push(finalRoute as any);
    });
  }, [handleClose, isLoggedIn, activeRole]);


  if (!showModal && !visible) return null;

  return (
    <Modal visible={showModal} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.45)",
              opacity: fadeAnim,
            }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            width: metrics.sidebarWidth,
            backgroundColor: "#ffffff",
            shadowColor: "#0F172A",
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 16,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + (metrics.scale * 12),
            paddingBottom: Math.max(insets.bottom, 12 * metrics.scale),
          }}
        >
          {/* Header Section */}
          <View 
            style={{ 
              paddingHorizontal: metrics.headerPaddingHorizontal,
              paddingBottom: metrics.headerPaddingBottom,
              paddingTop: metrics.headerPaddingTop,
            }}
            className="border-b border-slate-100 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <View 
                style={{ width: metrics.logoSize, height: metrics.logoSize }}
                className="rounded-xl bg-slate-900 items-center justify-center mr-3 shadow-sm"
              >
                <Text className="text-white font-jakarta-bold text-lg">IB</Text>
              </View>
              <View>
                <Text style={{ fontSize: metrics.logoTextSize }} className="font-jakarta-bold text-slate-900 tracking-tight">
                  Inquiry Bazaar
                </Text>
                <Text style={{ fontSize: metrics.logoSubTextSize }} className="font-jakarta-medium text-slate-400 uppercase tracking-wider">
                  {activeRole === "seller" ? "Seller Workspace" : "B2B Marketplace"}
                </Text>
              </View>
            </View>
            
            <Pressable
              onPress={handleClose}
              style={{ width: metrics.closeBtnSize, height: metrics.closeBtnSize }}
              className="items-center justify-center rounded-full bg-slate-50 active:bg-slate-200"
            >
              <Ionicons name="close" size={metrics.closeIconSize} color="#64748b" />
            </Pressable>
          </View>

          {/* Menu Scroller */}
          <ScrollView 
            style={{ paddingHorizontal: metrics.scrollPaddingHorizontal, paddingTop: metrics.scrollPaddingTop }}
            className="flex-1" 
            showsVerticalScrollIndicator={false}
          >
            
            {activeRole === "seller" && (
              <View 
                style={{ marginHorizontal: 4, marginBottom: metrics.planCardMarginBottom, padding: metrics.planCardPadding }}
                className="rounded-2xl bg-emerald-50 border border-emerald-100 flex-row items-center"
              >
                <View className="h-9 w-9 rounded-xl bg-emerald-500 items-center justify-center mr-3 shadow-sm">
                  <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-[14px] font-jakarta-bold text-slate-800">Standard Plan</Text>
                    <View className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 flex-row items-center">
                      <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
                      <Text className="text-[9px] font-jakarta-bold text-emerald-600 uppercase">Active</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeRole === "seller" && (
              <View className="mb-4 rounded-2xl overflow-hidden border border-slate-100" style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)' }}>
                <Pressable
                  onPress={toggleSellerMenu}
                  className="flex-row items-center justify-between"
                  style={{ paddingHorizontal: metrics.itemPaddingHorizontal, paddingVertical: metrics.itemPaddingVertical, backgroundColor: 'rgba(241, 245, 249, 0.6)' }}
                >
                  <View className="flex-row items-center">
                    <View 
                      style={{ 
                        width: metrics.itemIconBoxSize - 2, height: metrics.itemIconBoxSize - 2,
                        shadowColor: '#bfdbfe', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 2 
                      }}
                      className="rounded-lg bg-blue-900 items-center justify-center mr-3" 
                    >
                      <Ionicons name="ribbon" size={metrics.itemIconSize - 2} color="#ffffff" />
                    </View>
                    <Text style={{ fontSize: metrics.itemTextSize - 0.5 }} className="font-jakarta-bold text-slate-800">Seller Central</Text>
                  </View>
                  <Ionicons name={sellerMenuExpanded ? "chevron-up" : "chevron-down"} size={metrics.chevronSize} color="#475569" />
                </Pressable>

                {sellerMenuExpanded && (
                  <View style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
                    {sellerSubMenuItems.map((subItem, idx) => (
                      <RenderSubItem key={idx} subItem={subItem} metrics={metrics} onPress={handleNavigation} />
                    ))}
                  </View>
                )}
              </View>
            )}

            {activeMenuItems.map((item, index) => (
              <RenderMenuItem key={index} item={item} metrics={metrics} onPress={handleNavigation} />
            ))}
          </ScrollView>

          {/* Footer & Logout */}
          <View style={{ paddingHorizontal: metrics.logoutPaddingHorizontal, paddingVertical: metrics.logoutPaddingVertical }} className="border-t border-slate-100">
            <Pressable
              onPress={() => setLogoutConfirmVisible(true)}
              style={{ paddingVertical: metrics.logoutButtonPaddingVertical }}
              className="flex-row items-center justify-center bg-rose-50 border border-rose-100 py-3 rounded-xl active:scale-[0.98] transition-all"
            >
              <Ionicons name="log-out-outline" size={metrics.logoutIconSize} color="#e11d48" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: metrics.logoutTextSize }} className="font-jakarta-bold text-rose-600">Log Out / Switch Account</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: metrics.footerPaddingHorizontal, paddingTop: metrics.footerPaddingTop, paddingBottom: metrics.footerPaddingBottom }} className="border-t border-slate-100">
            <Text style={{ fontSize: metrics.footerTextSize }} className="text-slate-400 font-jakarta-medium text-center uppercase tracking-widest">Version 1.0.0</Text>
          </View>
        </Animated.View>
      </View>

      {/* Logout Confirmation Modal Overlay */}
      <Modal visible={logoutConfirmVisible} transparent animationType="fade" onRequestClose={() => setLogoutConfirmVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.55)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: screenWidth * 0.8, maxWidth: 400, backgroundColor: "#ffffff", borderRadius: 24, padding: 24, alignItems: "center", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 }}>
            <View style={{ width: 56 * metrics.scale, height: 56 * metrics.scale, borderRadius: 28 * metrics.scale, backgroundColor: "#FFF1F2", alignItems: "center", justifyContent: "center", marginBottom: 16, flexDirection: "row" }}>
              <Ionicons name="log-out" size={28 * metrics.scale} color="#E11D48" />
            </View>
            <Text style={{ fontSize: 18 * metrics.scale, color: "#0F172A", fontFamily: "PlusJakartaSans-Bold", marginBottom: 8, textAlign: "center" }}>
              Confirm Logout
            </Text>
            <Text style={{ fontSize: 14 * metrics.scale, color: "#64748B", fontFamily: "PlusJakartaSans-Medium", textAlign: "center", marginBottom: 24, lineHeight: 20 * metrics.scale }}>
              Are you sure you want to log out? You will need to sign in again to access your profile.
            </Text>
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => setLogoutConfirmVisible(false)}
                style={{ flex: 1, height: 48 * metrics.scale, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14 * metrics.scale, color: "#475569", fontFamily: "PlusJakartaSans-Bold" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{ flex: 1, height: 48 * metrics.scale, borderRadius: 12, backgroundColor: "#E11D48", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14 * metrics.scale, color: "#ffffff", fontFamily: "PlusJakartaSans-Bold" }}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default memo(Sidebar);