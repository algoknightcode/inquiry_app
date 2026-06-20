import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

// 1. Extract the exact type of valid icon names from Ionicons
type IconName = React.ComponentProps<typeof Ionicons>["name"];

// 2. Define the exact shape of our Tab object (Removed isFab)
type TabItem = {
  id: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
};

// 3. Apply the type to our tabs array (Exactly 4 items)
const tabs: TabItem[] = [
  { id: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { id: "categories", label: "Category", icon: "grid-outline", activeIcon: "grid" },
  { id: "wishlist", label: "Wishlist", icon: "heart-outline", activeIcon: "heart" },
  { id: "account", label: "Account", icon: "person-outline", activeIcon: "person" },
];

export default function CustomTabBar() {
  const [activeTab, setActiveTab] = useState("home");

  const handlePress = async (tabId: string) => {
    setActiveTab(tabId);
    
    // Trigger premium haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Fail silently if not supported
    }

    if(tabId === "account"){
      router.push("/Account");
    } else if(tabId === "wishlist"){
      router.push("/Wishlist");
    } else if(tabId === "categories"){
      router.push("/Industries");
    }
  };

  return (
    <SafeAreaView className="bg-white shadow-2xl shadow-slate-200 border-t border-slate-100">
      {/* Changed px-6 to px-8 for better spacing with 4 items */}
      <View 
        className={`flex-row justify-between items-center px-8 ${Platform.OS === 'ios' ? 'pb-1' : 'pb-2'} pt-1.5`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.6}
              onPress={() => handlePress(tab.id)}
              className="items-center justify-center w-16"
            >
              <View className="mb-0.5">
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22} // Slightly smaller icon
                  color={isActive ? "#2563eb" : "#94a3b8"} // Updated to match light theme blue
                />
              </View>
              <Text
                className={`text-[9.5px] font-jakarta-bold tracking-tight ${ // Slightly smaller text
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}