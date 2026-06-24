import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isSellerSignedIn, setGlobalRole, setSellerSignedIn, setGlobalSellerId, userRole, setGlobalBuyerId } from "@/utils/roleCache";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.72; // Adjusted slightly for robust menu padding

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  currentRole: "buyer" | "seller"; // Received dynamically based on user state
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  route: string;
  highlight?: boolean;
};

// Main base menu items visible to everyone
const baseMenuItems: MenuItem[] = [
  { icon: "home-outline", title: "Home", route: "/(tabs)" },
  { icon: "grid-outline", title: "Explore Industries", route: "/Industries" },
  { icon: "create-outline", title: "Post RFQ", route: "/Buyer/PostRFQ", highlight: true }, 
  { icon: "briefcase-outline", title: "Free Listing", route: "/(tabs)", highlight: true },
  { icon: "notifications-outline", title: "Notifications", route: "/NotificationPanel" },
  { icon: "settings-outline", title: "Settings", route: "/(tabs)" },
  { icon: "help-circle-outline", title: "Help & Support", route: "/(tabs)" },
];

// Seller dashboard specific sub-items pulled from image_b2b71e.png (excluding Website Page)
const sellerSubMenuItems: MenuItem[] = [
  { icon: "speedometer-outline", title: "Dashboard", route: "/Seller/dashboard" },
  { icon: "person-outline", title: "Profile", route: "/Seller/Profile" },
  { icon: "cube-outline", title: "Products", route: "/Seller/ViewAllProduct" },
  { icon: "add-circle-outline", title: "Add Product", route: "/Seller/AddProduct" },
  { icon: "headset-outline", title: "Leads", route: "/Seller/Lead" },
];

export default function Sidebar({ visible, onClose, currentRole }: SidebarProps) {
  const insets = useSafeAreaInsets();
  
  const [sellerMenuExpanded, setSellerMenuExpanded] = useState(true);
  const [activeRole, setActiveRole] = useState<"buyer" | "seller">(currentRole);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = async () => {
    setLogoutConfirmVisible(false);
    onClose();
    setGlobalRole("buyer");
    setSellerSignedIn(false);
    setGlobalSellerId(null);
    setGlobalBuyerId(null);
    try {
      await AsyncStorage.removeItem("supplierId");
      await AsyncStorage.removeItem("buyerId");
      await AsyncStorage.removeItem("phone");
      await AsyncStorage.removeItem("phoneNumber");
    } catch (e) {
      console.log("Error clearing storage:", e);
    }
    setTimeout(() => {
      router.replace("/(auth)/choose-role");
    }, 250);
  };

  // Main Drawer Animations
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const checkRoleAndLogin = async () => {
        const supplierId = await AsyncStorage.getItem("supplierId");
        const buyerId = await AsyncStorage.getItem("buyerId");
        
        if (supplierId || isSellerSignedIn) {
          setActiveRole("seller");
          setIsLoggedIn(true);
        } else {
          const activeUserRole = userRole || currentRole;
          setActiveRole(activeUserRole);
          setIsLoggedIn(!!buyerId);
        }
      };
      checkRoleAndLogin();

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 75,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentRole]);

  const toggleSellerMenu = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSellerMenuExpanded(!sellerMenuExpanded);
  };

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      let finalRoute = route;
      const isSellerRoute = 
        route.toLowerCase() === "/seller/profile" || 
        route.toLowerCase() === "/seller/addproduct" ||
        route.toLowerCase() === "/seller/viewallproduct" ||
        route.toLowerCase() === "/seller/dashboard" ||
        route.toLowerCase() === "/seller/lead";
      
      if (isSellerRoute && !isSellerSignedIn) {
        finalRoute = "/Seller/auth/Login";
      }
      router.push(finalRoute as any);
    }, 250);
  };

  const activeMenuItems = [...baseMenuItems];
  if (activeRole === "buyer" && isLoggedIn) {
    activeMenuItems.splice(1, 0, { icon: "person-outline", title: "Profile", route: "/Buyer/profile" });
  }

  if (!visible) return null;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.45)",
              opacity: fadeAnim,
            }}
          />
        </TouchableWithoutFeedback>

        {/* Sliding Sidebar */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0, left: 0, bottom: 0,
            width: SIDEBAR_WIDTH,
            backgroundColor: "#ffffff",
            shadowColor: "#0F172A",
            shadowOffset: { width: 6, height: 0 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 24,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          {/* Header Section */}
          <View className="px-5 pb-5 pt-2 border-b border-slate-100 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="h-10 w-10 rounded-xl bg-slate-900 items-center justify-center mr-3 shadow-sm">
                <Text className="text-white font-jakarta-bold text-lg">IB</Text>
              </View>
              <View>
                <Text className="text-[17px] font-jakarta-bold text-slate-900 tracking-tight">
                  Inquiry Bazaar
                </Text>
                <Text className="text-[11px] font-jakarta-medium text-slate-400 uppercase tracking-wider">
                  {activeRole === "seller" ? "Seller Workspace" : "B2B Marketplace"}
                </Text>
              </View>
            </View>
            
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 active:bg-slate-200"
            >
              <Ionicons name="close" size={18} color="#64748b" />
            </Pressable>
          </View>

          {/* Menu Scroller */}
          <ScrollView className="flex-1 px-3 pt-4" showsVerticalScrollIndicator={false}>
            
            {/* SELLER DROPDOWN SECTION (Only renders if user selected Seller) */}
            {activeRole === "seller" && (
              <View className="mb-4 rounded-2xl overflow-hidden border border-slate-100" style={{ backgroundColor: 'rgba(248, 250, 252, 0.7)' }}>
                {/* Dropdown Header Trigger */}
                <Pressable
                  onPress={toggleSellerMenu}
                  className="flex-row items-center justify-between px-4 py-3.5"
                  style={{ backgroundColor: 'rgba(241, 245, 249, 0.6)' }}
                >
                  <View className="flex-row items-center">
                    <View className="h-8 w-8 rounded-lg bg-blue-900 items-center justify-center mr-3" style={{ shadowColor: '#bfdbfe', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 2 }}>
                      <Ionicons name="ribbon" size={16} color="#ffffff" />
                    </View>
                    <Text className="text-[14px] font-jakarta-bold text-slate-800">
                      Seller Central
                    </Text>
                  </View>
                  <Ionicons 
                    name={sellerMenuExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#475569" 
                  />
                </Pressable>

                {/* Dropdown Sub-Items Accordion */}
                {sellerMenuExpanded && (
                  <View className="py-1 px-2">
                    {sellerSubMenuItems.map((subItem, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => handleNavigation(subItem.route)}
                        className="flex-row items-center px-3 py-2.5 rounded-xl mb-1 active:bg-white active:scale-[0.99] transition-all"
                      >
                        <View className="h-7 w-7 rounded-lg bg-white border border-slate-100 items-center justify-center mr-3">
                          <Ionicons name={subItem.icon} size={15} color="#1b2a6b" />
                        </View>
                        <Text className="text-[13.5px] font-jakarta-semibold text-slate-700 flex-1">
                          {subItem.title}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Standard Core Links Menu */}
            {activeMenuItems.map((item, index) => (
              <View key={index}>
                <Pressable
                  onPress={() => handleNavigation(item.route)}
                  className={`flex-row items-center px-4 py-3.5 rounded-[16px] mb-2 active:scale-[0.97] transition-all ${
                    item.highlight ? 'border border-blue-100' : 'active:bg-slate-50'
                  }`}
                  style={item.highlight ? { backgroundColor: 'rgba(239, 246, 255, 0.5)' } : {}}
                  android_ripple={{ color: item.highlight ? "#dbeafe" : "#f1f5f9" }}
                >
                  <View 
                    className={`h-9 w-9 rounded-xl items-center justify-center mr-4 ${item.highlight ? 'bg-blue-900' : 'bg-slate-50'}`}
                    style={item.highlight ? { shadowColor: '#bfdbfe', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 2 } : {}}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={18} 
                      color={item.highlight ? "#ffffff" : "#475569"} 
                    />
                  </View>
                  <Text className={`text-[15px] flex-1 tracking-tight ${
                    item.highlight ? 'font-jakarta-bold text-blue-900' : 'font-jakarta-semibold text-slate-700'
                  }`}>
                    {item.title}
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={item.highlight ? "#1b2a6b" : "#cbd5e1"} 
                  />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {/* Logout / Reset Button */}
          <View className="px-4 py-2 border-t border-slate-100">
            <Pressable
              onPress={() => setLogoutConfirmVisible(true)}
              className="flex-row items-center justify-center bg-rose-50 border border-rose-100 py-3 rounded-xl active:scale-[0.98] transition-all"
            >
              <Ionicons name="log-out-outline" size={18} color="#e11d48" style={{ marginRight: 6 }} />
              <Text className="text-[14px] font-jakarta-bold text-rose-600">
                Log Out / Switch Account
              </Text>
            </Pressable>
          </View>

          {/* Footer Section */}
          <View className="px-6 pt-4 pb-2 border-t border-slate-100">
            <Text className="text-slate-400 text-[10px] font-jakarta-medium text-center uppercase tracking-widest">
              Version 1.0.0
            </Text>
          </View>
        </Animated.View>
      </View>

      {/* Logout Confirmation Modal Overlay */}
      <Modal
        visible={logoutConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutConfirmVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.55)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: width * 0.8, backgroundColor: "#ffffff", borderRadius: 24, padding: 24, alignItems: "center", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFF1F2", alignItems: "center", justifyContent: "center", marginBottom: 16, flexDirection: "row" }}>
              <Ionicons name="log-out" size={28} color="#E11D48" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A", fontFamily: "PlusJakartaSans-Bold", marginBottom: 8, textAlign: "center" }}>
              Confirm Logout
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", fontFamily: "PlusJakartaSans-Medium", textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
              Are you sure you want to log out? You will need to sign in again to access your profile.
            </Text>
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => setLogoutConfirmVisible(false)}
                style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#475569", fontFamily: "PlusJakartaSans-Bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: "#E11D48", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff", fontFamily: "PlusJakartaSans-Bold" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}