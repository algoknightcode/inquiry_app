import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = width * 0.68; 

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
};

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  route: string;
  highlight?: boolean; // Added to make specific CTAs pop
};

const menuItems: MenuItem[] = [
  { icon: "home-outline", title: "Home", route: "/(tabs)" },
  { icon: "grid-outline", title: "Explore Industries", route: "/Industries" },
  { icon: "create-outline", title: "Post Requirement", route: "/(tabs)", highlight: true }, 
  { icon: "briefcase-outline", title: "Free Listing", route: "/(tabs)", highlight: true },
  { icon: "notifications-outline", title: "Notifications", route: "/NotificationPanel" },
  { icon: "settings-outline", title: "Settings", route: "/(tabs)" },
  { icon: "help-circle-outline", title: "Help & Support", route: "/(tabs)" },
];

export default function Sidebar({ visible, onClose }: SidebarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Main Drawer Animations
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Staggered Menu Item Animations
  const itemFadeAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;
  const itemSlideAnims = useRef(menuItems.map(() => new Animated.Value(20))).current;

  useEffect(() => {
    if (visible) {
      // 1. Open the drawer with a premium spring bounce
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11, // Gives it a slight, satisfying snap without wobbling too much
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 2. Cascade the menu items in right after the drawer starts opening
      Animated.stagger(
        40, // 40ms delay between each item
        menuItems.map((_, i) =>
          Animated.parallel([
            Animated.timing(itemFadeAnims[i], {
              toValue: 1,
              duration: 350,
              useNativeDriver: true,
            }),
            Animated.timing(itemSlideAnims[i], {
              toValue: 0,
              duration: 350,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ])
        )
      ).start();

    } else {
      // 3. Smoothly close and reset everything
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Instantly reset menu items so they are ready for the next open
        itemFadeAnims.forEach(anim => anim.setValue(0));
        itemSlideAnims.forEach(anim => anim.setValue(20));
      });
    }
  }, [visible]);

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 250); // Matched timeout with close animation duration
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.5)", // Slightly darker backdrop for better contrast
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
            shadowColor: "#000",
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 24,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 16,
            paddingBottom: Math.max(insets.bottom, 16),
          }}
        >
          {/* Header Section */}
          <View className="px-6 pb-6 pt-2 border-b border-slate-100 flex-row items-center justify-between">
            <View className="flex-row items-center">
              {/* App Avatar/Logo Placeholder */}
              <View className="h-10 w-10 rounded-xl bg-slate-900 items-center justify-center mr-3 shadow-sm">
                 <Text className="text-white font-jakarta-bold text-lg">IB</Text>
              </View>
              <View>
                <Text className="text-[18px] font-jakarta-bold text-slate-900 tracking-tight">
                  Inquiry Bazaar
                </Text>
                <Text className="text-[12px] font-jakarta-medium text-slate-500">
                  B2B Marketplace
                </Text>
              </View>
            </View>
            
            <Pressable
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full bg-slate-50 active:bg-slate-200 active:scale-90 transition-all"
            >
              <Ionicons name="close" size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Menu Items List */}
          <ScrollView
            className="flex-1 px-4 pt-5"
            showsVerticalScrollIndicator={false}
          >
            {menuItems.map((item, index) => (
              <Animated.View 
                key={index}
                style={{
                  opacity: itemFadeAnims[index],
                  transform: [{ translateY: itemSlideAnims[index] }]
                }}
              >
                <Pressable
                  onPress={() => handleNavigation(item.route)}
                  className={`flex-row items-center px-4 py-3.5 rounded-[16px] mb-2 active:scale-[0.97] transition-all ${
                    item.highlight ? 'bg-orange-50/50 border border-orange-100/50' : 'active:bg-slate-50'
                  }`}
                  android_ripple={{ color: item.highlight ? "#ffedd5" : "#f1f5f9" }}
                >
                  <View className={`h-9 w-9 rounded-xl items-center justify-center mr-4 ${
                    item.highlight ? 'bg-orange-500 shadow-sm shadow-orange-200' : 'bg-slate-50'
                  }`}>
                    <Ionicons 
                      name={item.icon} 
                      size={18} 
                      color={item.highlight ? "#ffffff" : "#475569"} 
                    />
                  </View>
                  <Text className={`text-[15px] flex-1 tracking-tight ${
                    item.highlight ? 'font-jakarta-bold text-orange-600' : 'font-jakarta-semibold text-slate-700'
                  }`}>
                    {item.title}
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={item.highlight ? "#f97316" : "#cbd5e1"} 
                  />
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          {/* Footer Section */}
          <View className="px-6 pt-5 pb-2 border-t border-slate-100">
            <Text className="text-slate-400 text-[11px] font-jakarta-medium text-center uppercase tracking-widest">
              Version 1.0.0
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}