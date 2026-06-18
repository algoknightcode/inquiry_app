import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

// 1. Extract the exact type of valid icon names from Ionicons
type IconName = React.ComponentProps<typeof Ionicons>["name"];

// 2. Define the exact shape of our Tab object
type TabItem = {
  id: string;
  label: string;
  icon: IconName;
  activeIcon: IconName;
  isFab?: boolean;
};

// 3. Apply the type to our tabs array
const tabs: TabItem[] = [
  { id: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { id: "categories", label: "Category", icon: "grid-outline", activeIcon: "grid" },
  { id: "wishlist", label: "Wishlist", icon: "heart-outline", activeIcon: "heart", isFab: true },
  { id: "cart", label: "Cart", icon: "cart-outline", activeIcon: "cart" },
  { id: "account", label: "Account", icon: "person-outline", activeIcon: "person" },
];

export default function CustomTabBar() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <SafeAreaView className="bg-white pt-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-slate-100">
      <View 
        className={`flex-row justify-between items-center px-6 ${Platform.OS === 'ios' ? 'pb-2' : 'pb-4'} pt-2`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isFab) {
            return (
              <View key={tab.id} className="items-center justify-center relative z-50">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(tab.id)}
                  className="absolute -top-10 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center border-[6px] border-slate-50 shadow-lg shadow-indigo-600/30"
                >
                  <Ionicons 
                    name={isActive ? tab.activeIcon : tab.icon} 
                    size={26} 
                    color="white" 
                  />
                </TouchableOpacity>
                <Text 
                  className={`text-[10px] font-jakarta-bold mt-8 ${
                    isActive ? "text-indigo-600" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.6}
              onPress={() => setActiveTab(tab.id)}
              className="items-center justify-center w-14"
            >
              <View className="mb-1">
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? "#4f46e5" : "#94a3b8"}
                />
              </View>
              <Text
                className={`text-[10px] font-jakarta-bold tracking-tight ${
                  isActive ? "text-indigo-600" : "text-slate-400"
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