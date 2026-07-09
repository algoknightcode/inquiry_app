import { useRole } from "@/contexts/RoleContext";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
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
  useAnimatedStyle,
  useSharedValue,
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

const sellerSubMenuItems: MenuItem[] = [
  { icon: "speedometer-outline", title: "Dashboard", route: "/Seller/dashboard" },
  { icon: "person-outline", title: "Profile", route: "/Seller/Profile" },
  { icon: "cube-outline", title: "Products", route: "/Seller/ViewAllProduct" },
  { icon: "add-circle-outline", title: "Add Product", route: "/Seller/AddProduct" },
  { icon: "headset-outline", title: "Leads", route: "/Seller/Lead" },
];

const RenderMenuItem = memo(({ item, isActive, onPress }: { item: MenuItem, isActive: boolean, onPress: (route: string) => void }) => {
  const handlePress = useCallback(() => onPress(item.route), [item.route, onPress]);
  
  // Magic trick: Automatically use the filled icon when active, outline when inactive
  const iconName = isActive ? item.icon.replace('-outline', '') as any : item.icon;
  
  return (
    <Pressable
      onPress={handlePress}
      className={`flex-row items-center py-4 pl-8 pr-6 mb-1 mr-6 rounded-r-full ${
        isActive ? 'bg-[#1E3A8A]' : 'bg-transparent'
      }`}
      android_ripple={{ color: isActive ? "#1e3a8a" : "#f1f5f9" }}
    >
      <Ionicons 
        name={iconName} 
        size={24} 
        color={isActive ? "#ffffff" : "#334155"} 
        style={{ marginRight: 20 }}
      />
      <Text 
        className={`flex-1 text-[16px] tracking-tight ${
          isActive ? 'font-jakarta-bold text-white' : 'font-jakarta-medium text-slate-700'
        }`}
      >
        {item.title}
      </Text>
    </Pressable>
  );
});

const SellerHeader = memo(({ onNavigate }: { onNavigate: (route: string) => void }) => {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <View className="mb-4">
      {/* Sleek Accordion Toggle */}
      <Pressable 
        onPress={() => setExpanded(!expanded)} 
        className="flex-row items-center justify-between py-4 pl-8 pr-6 mb-1 mr-6 rounded-r-full"
        android_ripple={{ color: "#f1f5f9" }}
      >
        <View className="flex-row items-center">
          <Ionicons name={expanded ? "briefcase" : "briefcase-outline"} size={24} color="#334155" style={{ marginRight: 20 }} />
          <Text className="text-[16px] font-jakarta-medium text-slate-700">Seller Central</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color="#94a3b8" />
      </Pressable>

      {/* Elegant Indented Sub-menu */}
      {expanded && (
        <View className="ml-[60px] border-l-[1.5px] border-slate-200 py-2">
          {sellerSubMenuItems.map((sub, idx) => {
            const isSubActive = pathname === sub.route;
            const subIconName = isSubActive ? sub.icon.replace('-outline', '') as any : sub.icon;

            return (
              <Pressable
                key={idx}
                onPress={() => onNavigate(sub.route)}
                className="flex-row items-center py-3.5 pl-6"
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Ionicons name={subIconName} size={20} color={isSubActive ? "#1E3A8A" : "#64748b"} style={{ marginRight: 16 }} />
                <Text className={`text-[15px] ${isSubActive ? 'font-jakarta-bold text-[#1E3A8A]' : 'font-jakarta-medium text-slate-500'}`}>
                  {sub.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
});

const Sidebar = ({ visible, onClose, currentRole }: SidebarProps) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const pathname = usePathname();
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  
  const { globalBuyerId, globalSellerId, clearRoleState } = useRole();
  const isActuallySeller = currentRole === "seller" && !!globalSellerId;

  const roleMenuItems = useMemo<MenuItem[]>(() => {
    const profileRoute = isActuallySeller ? "/Seller/Profile" : "/Buyer/profile";
    const items: MenuItem[] = [
      { icon: "home-outline", title: "Home", route: "/(tabs)" },
      { icon: "grid-outline", title: "Explore Industries", route: "/Industries" },
      { icon: "person-outline", title: "Profile", route: profileRoute },
      { icon: "person-circle-outline", title: "Account Settings", route: "/Account" },
      { icon: "notifications-outline", title: "Notifications", route: "/NotificationPanel" },
      { icon: "help-circle-outline", title: "Help & Support", route: "/HelpSupport" },
    ];
    if (!isActuallySeller) {
      items.splice(2, 0, { icon: "briefcase-outline", title: "Free Listing", route: "/Seller/auth/Signup", highlight: true });
    }
    return items;
  }, [isActuallySeller]);

  const slideAnim = useSharedValue(-400);
  const fadeAnim = useSharedValue(0);

  const sidebarWidth = useMemo(() => {
    const isTablet = screenWidth >= 768;
    return isTablet ? 320 : Math.min(screenWidth * 0.75, 300);
  }, [screenWidth]);

  useEffect(() => { 
    if (!visible) {
      slideAnim.value = -sidebarWidth; 
    }
  }, [sidebarWidth, visible]);

  useEffect(() => {
    if (visible) {
      slideAnim.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
      fadeAnim.value = withTiming(1, { duration: 250 });
    } else {
      slideAnim.value = withTiming(-sidebarWidth, { duration: 250, easing: Easing.out(Easing.cubic) });
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

    requestAnimationFrame(() => {
      router.navigate(finalRoute as any);
    });
  }, [onClose, globalBuyerId, globalSellerId, protectedRoutes]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));
  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: slideAnim.value }] }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.4)" }, backdropStyle]} />
        </TouchableWithoutFeedback>
        
        {/* Sidebar Drawer */}
        <Animated.View style={[{ 
            position: "absolute", top: 0, left: 0, bottom: 0, width: sidebarWidth, 
            backgroundColor: "#ffffff", borderRightWidth: 1, borderRightColor: "#E2E8F0", 
            paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 24) 
          }, drawerStyle]}
        >
          {/* Header */}
          <View className="px-8 pb-6 pt-4 border-b border-slate-100 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-[#1E3A8A] items-center justify-center mr-4">
                <Text className="text-white font-jakarta-bold text-[17px]">IB</Text>
              </View>
              <Text className="text-[18px] font-jakarta-bold text-slate-900 tracking-tight">Inquiry Bazaar</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Navigation Links - ZERO horizontal padding allows the highlight to touch the left edge */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {isActuallySeller && <SellerHeader onNavigate={handleNavigation} />}
            
            <View>
              {roleMenuItems.map((item) => {
                const isActive = pathname === item.route || item.highlight;
                return (
                  <RenderMenuItem key={item.route} item={item} isActive={isActive!} onPress={handleNavigation} />
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Actions - Minimal Text Ghost Buttons */}
          <View className="px-8 pt-6 pb-2 border-t border-slate-100">
             {(!globalBuyerId && !globalSellerId) ? (
               <TouchableOpacity 
                 onPress={() => handleNavigation("/(auth)/choose-role")} 
                 className="flex-row items-center py-3"
               >
                 <Ionicons name="log-in-outline" size={24} color="#1E3A8A" style={{ marginRight: 16 }} />
                 <Text className="font-jakarta-bold text-[#1E3A8A] text-[16px]">Log In / Sign Up</Text>
               </TouchableOpacity>
             ) : (
               <TouchableOpacity 
                 onPress={() => setLogoutConfirmVisible(true)} 
                 className="flex-row items-center py-3"
               >
                 <Ionicons name="log-out-outline" size={24} color="#e11d48" style={{ marginRight: 16 }} />
                 <Text className="font-jakarta-bold text-rose-600 text-[16px]">Log Out</Text>
               </TouchableOpacity>
             )}
          </View>
        </Animated.View>
      </View>

      {/* Shadowless Logout Confirmation Modal */}
      <Modal visible={logoutConfirmVisible} transparent animationType="fade" onRequestClose={() => setLogoutConfirmVisible(false)}>
        {logoutConfirmVisible && (
          <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
            <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 320, borderWidth: 1, borderColor: "#e2e8f0" }}>
              
              <View className="w-12 h-12 rounded-full bg-rose-50 items-center justify-center mb-4 border border-rose-100">
                <Ionicons name="log-out-outline" size={24} color="#e11d48" />
              </View>

              <Text style={{ fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 8 }}>Log Out</Text>
              <Text style={{ fontSize: 14.5, color: "#64748b", marginBottom: 28, lineHeight: 22 }}>Are you sure you want to log out of InquiryBazaar? You will need to sign in again to manage your account.</Text>
              
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => setLogoutConfirmVisible(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#475569" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={async () => {
                  setLogoutConfirmVisible(false);
                  onClose();
                  await clearRoleState();
                  router.replace("/(auth)/choose-role");
                }} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#e11d48", alignItems: "center" }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: "#ffffff" }}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </Modal>
  );
};

export default memo(Sidebar);