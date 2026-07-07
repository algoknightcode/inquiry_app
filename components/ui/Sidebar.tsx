import { isSellerSignedIn, setGlobalBuyerId, setGlobalRole, setGlobalSellerId, setSellerSignedIn } from "@/utils/roleCache";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  InteractionManager,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  Easing, 
  interpolate, 
  runOnJS, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming 
} from "react-native-reanimated";

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

// ── Memoized Child Components ──

const RenderMenuItem = memo(({ item, metrics, onPress }: { item: MenuItem, metrics: any, onPress: (route: string) => void }) => {
  const handlePress = useCallback(() => onPress(item.route), [item.route, onPress]);
  
  return (
    <Pressable
      onPress={handlePress}
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
      style={{ paddingVertical: metrics.subItemPaddingVertical, paddingHorizontal: metrics.subItemPaddingHorizontal, marginBottom: 4 }}
      className="flex-row items-center rounded-xl active:bg-white active:scale-[0.99] transition-all"
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
  const progress = useSharedValue(1);

  const toggleMenu = useCallback(() => {
    const nextState = !expanded;
    setExpanded(nextState);
    progress.value = withTiming(nextState ? 1 : 0, { duration: 250, easing: Easing.out(Easing.cubic) });
  }, [expanded, progress]);

  const accordionStyle = useAnimatedStyle(() => ({ height: progress.value * metrics.totalSubmenuHeight, opacity: progress.value }));
  const arrowStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }] }));

  return (
    <View className="mb-4">
      <View style={{ marginHorizontal: 4, marginBottom: metrics.planCardMarginBottom, padding: metrics.planCardPadding }} className="rounded-2xl bg-emerald-50 border border-emerald-100 flex-row items-center">
        <View className="h-9 w-9 rounded-xl bg-emerald-500 items-center justify-center mr-3">
          <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
        </View>
        <View className="flex-1">
          <Text className="text-[14px] font-jakarta-bold text-slate-800">Standard Plan</Text>
        </View>
      </View>

      <View className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
        <Pressable onPress={toggleMenu} className="flex-row items-center justify-between" style={{ paddingHorizontal: metrics.itemPaddingHorizontal, paddingVertical: metrics.itemPaddingVertical }}>
          <View className="flex-row items-center">
            <View style={{ width: metrics.itemIconBoxSize - 2, height: metrics.itemIconBoxSize - 2 }} className="rounded-lg bg-blue-900 items-center justify-center mr-3" >
              <Ionicons name="ribbon" size={metrics.itemIconSize - 2} color="#ffffff" />
            </View>
            <Text style={{ fontSize: metrics.itemTextSize - 0.5 }} className="font-jakarta-bold text-slate-800">Seller Central</Text>
          </View>
          <Animated.View style={arrowStyle}>
            <Ionicons name="chevron-down" size={metrics.chevronSize} color="#475569" />
          </Animated.View>
        </Pressable>

        <Animated.View style={[accordionStyle, { overflow: 'hidden' }]}>
          <View style={{ paddingVertical: 4, paddingHorizontal: 8 }}>
            {sellerSubMenuItems.map((subItem, idx) => <RenderSubItem key={idx} subItem={subItem} metrics={metrics} onPress={onNavigate} />)}
          </View>
        </Animated.View>
      </View>
    </View>
  );
});

const Sidebar = ({ visible, onClose, currentRole }: SidebarProps) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeRole] = useState<"buyer" | "seller">(currentRole);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isContentReady, setIsContentReady] = useState(false);

  const slideAnim = useSharedValue(-400);
  const fadeAnim = useSharedValue(0);

  const metrics = useMemo(() => {
    const isTablet = screenWidth >= 768;
    const baseScale = isTablet ? 1.15 : Math.max(0.85, Math.min(1.1, screenWidth / 375));
    const hScale = screenHeight < 680 ? 0.78 : 1.0;
    const sidebarWidth = isTablet ? 320 : Math.min(screenWidth * 0.68, 250 * baseScale);
    const subItemIconBoxSize = 28 * baseScale;
    const totalSubmenuHeight = (sellerSubMenuItems.length * (subItemIconBoxSize + (9 * hScale * 2) + 4)) + 8;

    return { sidebarWidth, scale: baseScale, headerPaddingHorizontal: 20 * baseScale, headerPaddingTop: 12 * hScale, headerPaddingBottom: 16 * hScale, logoSize: 40 * baseScale, logoTextSize: 17 * baseScale, logoSubTextSize: 13 * baseScale, closeBtnSize: 32 * baseScale, closeIconSize: 18 * baseScale, scrollPaddingHorizontal: 12 * baseScale, scrollPaddingTop: 12 * hScale, itemMarginBottom: 8 * hScale, itemPaddingVertical: 12 * hScale, itemPaddingHorizontal: 14 * baseScale, itemIconBoxSize: 36 * baseScale, itemIconSize: 18 * baseScale, itemTextSize: 16.5 * baseScale, chevronSize: 15 * baseScale, subItemPaddingVertical: 9 * hScale, subItemPaddingHorizontal: 10 * baseScale, subItemIconBoxSize, subItemIconSize: 14 * baseScale, subItemTextSize: 15 * baseScale, totalSubmenuHeight, planCardPadding: 12 * baseScale, planCardMarginBottom: 16 * hScale, logoutPaddingHorizontal: 16 * baseScale, logoutPaddingVertical: 10 * hScale, logoutButtonPaddingVertical: 12 * hScale, logoutTextSize: 15.5 * baseScale, logoutIconSize: 17 * baseScale, footerPaddingHorizontal: 24 * baseScale, footerPaddingTop: 10 * hScale, footerPaddingBottom: 8 * hScale, footerTextSize: 12 * baseScale };
  }, [screenWidth, screenHeight]);

  useEffect(() => { slideAnim.value = -metrics.sidebarWidth; }, [metrics.sidebarWidth, slideAnim]);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      slideAnim.value = withSpring(0, { damping: 15, stiffness: 90, mass: 0.8 });
      fadeAnim.value = withTiming(1, { duration: 250 });
      setTimeout(() => setIsContentReady(true), 50);
    } else {
      setIsContentReady(false);
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleClose = useCallback(() => {
    slideAnim.value = withTiming(-metrics.sidebarWidth, { duration: 250, easing: Easing.out(Easing.cubic) });
    fadeAnim.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) { runOnJS(setShowModal)(false); runOnJS(onClose)(); }
    });
  }, [metrics.sidebarWidth, onClose, slideAnim, fadeAnim]);

  const handleNavigation = useCallback(async (route: string) => {
    handleClose();
    InteractionManager.runAfterInteractions(async () => {
      router.push(route as any);
    });
  }, [handleClose]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: fadeAnim.value }));
  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: slideAnim.value }] }));

  if (!showModal && !visible) return null;

  return (
    <Modal visible={showModal} transparent animationType="none" onRequestClose={handleClose}>
      <View style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.45)" }, backdropStyle]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[{ position: "absolute", top: 0, left: 0, bottom: 0, width: metrics.sidebarWidth, backgroundColor: "#ffffff", shadowColor: "#0F172A", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 16, paddingTop: insets.top + (metrics.scale * 12), paddingBottom: Math.max(insets.bottom, 12 * metrics.scale) }, drawerStyle]}>
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
          <FlatList
            data={isContentReady ? (activeRole === "seller" ? baseMenuItems.filter(i => i.title !== "Free Listing") : baseMenuItems) : []}
            keyExtractor={(i) => i.route}
            renderItem={({ item }) => <RenderMenuItem item={item} metrics={metrics} onPress={handleNavigation} />}
            ListHeaderComponent={isContentReady && activeRole === 'seller' ? <SellerHeader metrics={metrics} onNavigate={handleNavigation} /> : null}
            contentContainerStyle={{ paddingHorizontal: metrics.scrollPaddingHorizontal, paddingTop: metrics.scrollPaddingTop }}
            showsVerticalScrollIndicator={false}
          />
          <View style={{ padding: 20 }} className="border-t border-slate-100">
             <TouchableOpacity onPress={() => setLogoutConfirmVisible(true)} className="flex-row items-center justify-center bg-rose-50 p-3 rounded-xl">
               <Text className="font-jakarta-bold text-rose-600">Log Out</Text>
             </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default memo(Sidebar);