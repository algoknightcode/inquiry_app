import { useRole } from "@/contexts/RoleContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    LayoutAnimation,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    useWindowDimensions
} from "react-native";
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

// ── Memoized Child Components ──

const RenderMenuItem = memo(({ item, metrics, onPress }: { item: MenuItem, metrics: any, onPress: (route: string) => void }) => {
  const handlePress = useCallback(() => onPress(item.route), [item.route, onPress]);
  
  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row items-center rounded-[16px] ${
        item.highlight ? 'border border-blue-100' : ''
      }`}
      style={({ pressed }) => ({
        paddingHorizontal: metrics.itemPaddingHorizontal,
        paddingVertical: metrics.itemPaddingVertical,
        marginBottom: metrics.itemMarginBottom,
        backgroundColor: pressed 
            ? (item.highlight ? 'rgba(239, 246, 255, 0.8)' : '#f1f5f9')
            : (item.highlight ? 'rgba(239, 246, 255, 0.5)' : 'transparent'),
        transform: [{ scale: pressed ? 0.97 : 1 }]
      })}
      android_ripple={{ color: item.highlight ? "#dbeafe" : "#f1f5f9" }}
    >
      <View 
        style={[{ width: metrics.itemIconBoxSize, height: metrics.itemIconBoxSize }]}
        className={`rounded-xl items-center justify-center mr-4 ${item.highlight ? 'bg-blue-900' : 'bg-slate-100'}`}
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
  );
});

const RenderSubItem = memo(({ subItem, metrics, onPress }: { subItem: MenuItem, metrics: any, onPress: (route: string) => void }) => {
  const handlePress = useCallback(() => onPress(subItem.route), [subItem.route, onPress]);
  
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({ 
        paddingVertical: metrics.subItemPaddingVertical, 
        paddingHorizontal: metrics.subItemPaddingHorizontal, 
        marginBottom: 4,
        backgroundColor: pressed ? '#ffffff' : 'transparent',
        transform: [{ scale: pressed ? 0.99 : 1 }]
      })}
      className="flex-row items-center rounded-xl"
    >
      <View 
        style={{ width: metrics.subItemIconBoxSize, height: metrics.subItemIconBoxSize }}
        className="rounded-lg bg-slate-50 border border-slate-100 items-center justify-center mr-3"
      >
        <Ionicons name={subItem.icon} size={metrics.subItemIconSize} color="#1b2a6b" />
      </View>
      <Text style={{ fontSize: metrics.subItemTextSize }} className="font-jakarta-semibold text-slate-700 flex-1">{subItem.title}</Text>
    </Pressable>
  );
});

const SellerHeader = memo(({ metrics, onNavigate }: { metrics: any; onNavigate: (route: string) => void }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleMenu = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => !prev);
  }, []);

  return (
    <View className="mb-4">
      {/* Premium Plan Card */}
      <View 
        style={{ 
          marginHorizontal: 4, 
          marginBottom: metrics.planCardMarginBottom, 
          padding: metrics.planCardPadding,
          borderColor: "#d1fae5",
          borderWidth: 1,
        }} 
        className="rounded-2xl bg-emerald-50/50 flex-row items-center"
      >
        <View className="h-9 w-9 rounded-xl bg-emerald-500 items-center justify-center mr-3">
          <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-jakarta-bold text-emerald-800">Standard Plan</Text>
        </View>
      </View>

      {/* Accordion Box */}
      <View className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50/70">
        <Pressable 
          onPress={toggleMenu} 
          className="flex-row items-center justify-between" 
          style={{ paddingHorizontal: metrics.itemPaddingHorizontal, paddingVertical: metrics.itemPaddingVertical }}
        >
          <View className="flex-row items-center">
            <View style={{ width: metrics.itemIconBoxSize - 2, height: metrics.itemIconBoxSize - 2 }} className="rounded-lg bg-blue-900 items-center justify-center mr-3" >
              <Ionicons name="ribbon" size={metrics.itemIconSize - 2} color="#ffffff" />
            </View>
            <Text style={{ fontSize: metrics.itemTextSize - 0.5 }} className="font-jakarta-bold text-slate-800">Seller Central</Text>
          </View>
          <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
            <Ionicons name="chevron-down" size={metrics.chevronSize} color="#475569" />
          </View>
        </Pressable>

        {expanded && (
          <View style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
            {sellerSubMenuItems.map((subItem, idx) => (
              <RenderSubItem key={idx} subItem={subItem} metrics={metrics} onPress={onNavigate} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
});



const Sidebar = ({ visible, onClose, currentRole }: SidebarProps) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  
  // 👉 USE REACTIVE ROLE STATE FROM CONTEXT
  const { globalBuyerId, globalSellerId, setGlobalSellerId, setSellerSignedIn, setGlobalBuyerId, setGlobalRole, clearRoleState } = useRole();

  // Only treat user as seller if they have an actual seller session (not just a stale role in storage)
  const isActuallySeller = currentRole === "seller" && !!globalSellerId;

  // Build role-aware menu items
  const roleMenuItems = useMemo<MenuItem[]>(() => {
    const profileRoute = isActuallySeller ? "/Seller/Profile" : "/Buyer/profile";
    const items: MenuItem[] = [
      { icon: "home-outline", title: "Home", route: "/(tabs)" },
      { icon: "person-outline", title: "Profile", route: profileRoute },
      { icon: "person-circle-outline", title: "Account", route: "/Account" },
      { icon: "grid-outline", title: "Explore Industries", route: "/Industries" },
      { icon: "notifications-outline", title: "Notifications", route: "/NotificationPanel" },
      { icon: "help-circle-outline", title: "Help & Support", route: "/HelpSupport" },
    ];
    if (!isActuallySeller) {
      items.splice(3, 0, { icon: "briefcase-outline", title: "Free Listing", route: "/Seller/auth/Signup", highlight: true });
    }
    return items;
  }, [isActuallySeller]);

  const slideAnim = useSharedValue(-400);
  const fadeAnim = useSharedValue(0);

  const metrics = useMemo(() => {
    const isTablet = screenWidth >= 768;
    const baseScale = isTablet ? 1.15 : Math.max(0.85, Math.min(1.1, screenWidth / 375));
    const hScale = screenHeight < 680 ? 0.78 : 1.0;
    const sidebarWidth = isTablet ? 320 : Math.min(screenWidth * 0.68, 250 * baseScale);
    const subItemIconBoxSize = 28 * baseScale;
    const totalSubmenuHeight = (sellerSubMenuItems.length * (subItemIconBoxSize + (9 * hScale * 2) + 4)) + 8;

    return { sidebarWidth, scale: baseScale, headerPaddingHorizontal: 20 * baseScale, headerPaddingTop: 14 * hScale, headerPaddingBottom: 16 * hScale, logoSize: 40 * baseScale, logoTextSize: 17 * baseScale, logoSubTextSize: 13 * baseScale, closeBtnSize: 32 * baseScale, closeIconSize: 18 * baseScale, scrollPaddingHorizontal: 16 * baseScale, scrollPaddingTop: 16 * hScale, itemMarginBottom: 12 * hScale, itemPaddingVertical: 14 * hScale, itemPaddingHorizontal: 16 * baseScale, itemIconBoxSize: 36 * baseScale, itemIconSize: 18 * baseScale, itemTextSize: 16.5 * baseScale, chevronSize: 15 * baseScale, subItemPaddingVertical: 11 * hScale, subItemPaddingHorizontal: 12 * baseScale, subItemIconBoxSize, subItemIconSize: 14 * baseScale, subItemTextSize: 15 * baseScale, totalSubmenuHeight, planCardPadding: 12 * baseScale, planCardMarginBottom: 16 * hScale, logoutPaddingHorizontal: 16 * baseScale, logoutPaddingVertical: 10 * hScale, logoutButtonPaddingVertical: 12 * hScale, logoutTextSize: 15.5 * baseScale, logoutIconSize: 17 * baseScale, footerPaddingHorizontal: 24 * baseScale, footerPaddingTop: 10 * hScale, footerPaddingBottom: 8 * hScale, footerTextSize: 12 * baseScale };
  }, [screenWidth, screenHeight]);

  useEffect(() => { 
    if (!visible) {
      slideAnim.value = -metrics.sidebarWidth; 
    }
  }, [metrics.sidebarWidth, visible]);

  useEffect(() => {
    if (visible) {
      slideAnim.value = withSpring(0, { damping: 15, stiffness: 90, mass: 0.8 });
      fadeAnim.value = withTiming(1, { duration: 250 });
    } else {
      slideAnim.value = withTiming(-metrics.sidebarWidth, { duration: 250, easing: Easing.out(Easing.cubic) });
      fadeAnim.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const protectedRoutes = useMemo(() => new Set([
    "/Buyer/profile", 
    "/Seller/Profile", 
    "/Account",
    "/NotificationPanel",
    "/Seller/dashboard",
    "/Seller/ViewAllProduct",
    "/Seller/AddProduct",
    "/Seller/Lead"
  ]), []);

  const handleNavigation = useCallback((route: string) => {
    onClose();
    
    let finalRoute = route;
    const isGuest = !globalBuyerId && !globalSellerId;

    if (isGuest && protectedRoutes.has(route)) {
      finalRoute = "/(auth)/choose-role";
    }

    // Navigate immediately without waiting for animations
    requestAnimationFrame(() => {
      router.navigate(finalRoute as any);
    });
  }, [onClose, globalBuyerId, globalSellerId, protectedRoutes]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));
  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: slideAnim.value }] }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.45)" }, backdropStyle]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[{ position: "absolute", top: 0, left: 0, bottom: 0, width: metrics.sidebarWidth, backgroundColor: "#ffffff", borderRightWidth: 1, borderRightColor: "#E2E8F0", paddingTop: insets.top + (metrics.scale * 12), paddingBottom: Math.max(insets.bottom, 12 * metrics.scale) }, drawerStyle]}>
          <View style={{ paddingHorizontal: metrics.headerPaddingHorizontal, paddingBottom: metrics.headerPaddingBottom, paddingTop: metrics.headerPaddingTop }} className="border-b border-slate-100 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View style={{ width: metrics.logoSize, height: metrics.logoSize }} className="rounded-xl bg-slate-900 items-center justify-center mr-3">
                <Text className="text-white font-jakarta-bold text-lg">IB</Text>
              </View>
              <View>
                <Text style={{ fontSize: metrics.logoTextSize }} className="font-jakarta-bold text-slate-900">Inquiry Bazaar</Text>
              </View>
            </View>
            <Pressable onPress={handleClose} className="p-2 bg-slate-100 rounded-full">
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: metrics.scrollPaddingHorizontal, paddingTop: metrics.scrollPaddingTop }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          >
            {isActuallySeller && <SellerHeader metrics={metrics} onNavigate={handleNavigation} />}
            {roleMenuItems.map((item) => (
              <RenderMenuItem key={item.route} item={item} metrics={metrics} onPress={handleNavigation} />
            ))}
          </ScrollView>
          <View style={{ padding: 20 }} className="border-t border-slate-100">
             {(!globalBuyerId && !globalSellerId) ? (
               <TouchableOpacity onPress={() => handleNavigation("/(auth)/choose-role")} className="flex-row items-center justify-center bg-blue-50 p-3 rounded-xl">
                 <Text className="font-jakarta-bold text-blue-600">Log In / Sign Up</Text>
               </TouchableOpacity>
             ) : (
               <TouchableOpacity onPress={() => setLogoutConfirmVisible(true)} className="flex-row items-center justify-center bg-rose-50 p-3 rounded-xl">
                 <Text className="font-jakarta-bold text-rose-600">Log Out</Text>
               </TouchableOpacity>
             )}
          </View>
        </Animated.View>
      </View>

      {/* Logout Confirmation Modal */}
      <Modal visible={logoutConfirmVisible} transparent animationType="fade" onRequestClose={() => setLogoutConfirmVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <View style={{ backgroundColor: "white", borderRadius: 16, padding: 24, width: "100%", maxWidth: 300 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#0f172a", marginBottom: 12 }}>Confirm Logout</Text>
            <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 20 }}>Are you sure you want to log out? You can log back in anytime.</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setLogoutConfirmVisible(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748b" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={async () => {
                setLogoutConfirmVisible(false);
                onClose();
                await clearRoleState();
                router.replace("/(auth)/choose-role");
              }} style={{ flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#ef4444", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "white" }}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default memo(Sidebar);