import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface MenuItem {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  color: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export default function AccountPage() {
  const menuGroups: MenuGroup[] = [
    {
      title: "Account Settings",
      items: [
        { icon: "user", label: "Personal Information", color: "#3b82f6" }, // blue-500
        { icon: "map-pin", label: "Saved Addresses", color: "#10b981" }, // emerald-500
        { icon: "credit-card", label: "Payment Methods", color: "#8b5cf6" }, // violet-500
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: "bell", label: "Notifications", color: "#f59e0b" }, // amber-500
        { icon: "lock", label: "Privacy & Security", color: "#64748b" }, // slate-500
        { icon: "globe", label: "Language & Region", color: "#0ea5e9" }, // sky-500
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "help-circle", label: "Help Center", color: "#ec4899" }, // pink-500
        { icon: "message-square", label: "Contact Us", color: "#14b8a6" }, // teal-500
      ],
    },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View className="bg-white px-5 pt-12 pb-8 rounded-b-[40px] shadow-sm shadow-slate-200/50">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-slate-900">Profile</Text>
          <TouchableOpacity className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center">
            <Feather name="settings" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View className="flex-row items-center mt-2">
          {/* Avatar with subtle ring */}
          <View className="p-1 border-2 border-blue-500 rounded-full">
            <Image
              source={{ uri: "https://i.pravatar.cc/150?img=11" }}
              className="w-20 h-20 rounded-full bg-slate-200"
            />
          </View>
          
          <View className="ml-5 flex-1">
            <Text className="text-2xl font-bold text-slate-900 mb-1">Alex Johnson</Text>
            <Text className="text-sm text-slate-500 mb-3">alex.johnson@example.com</Text>
            
            <TouchableOpacity className="bg-blue-600 self-start px-4 py-2 rounded-full">
              <Text className="text-white text-xs font-semibold tracking-wide">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View className="flex-row justify-between mt-8 pt-6 border-t border-slate-100">
          <View className="items-center flex-1">
            <Text className="text-xl font-bold text-slate-900">12</Text>
            <Text className="text-xs text-slate-500 mt-1 font-medium">Orders</Text>
          </View>
          <View className="w-[1px] bg-slate-200" />
          <View className="items-center flex-1">
            <Text className="text-xl font-bold text-slate-900">4</Text>
            <Text className="text-xs text-slate-500 mt-1 font-medium">Wishlist</Text>
          </View>
          <View className="w-[1px] bg-slate-200" />
          <View className="items-center flex-1">
            <Text className="text-xl font-bold text-slate-900">850</Text>
            <Text className="text-xs text-slate-500 mt-1 font-medium">Points</Text>
          </View>
        </View>
      </View>

      {/* Menu Sections */}
      <View className="px-5 pt-6 pb-12">
        {menuGroups.map((group, groupIndex) => (
          <View key={groupIndex} className="mb-8">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">
              {group.title}
            </Text>
            
            <View className="bg-white rounded-3xl p-2 shadow-sm shadow-slate-200/40">
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  className={`flex-row items-center p-3 ${
                    itemIndex !== group.items.length - 1 ? "border-b border-slate-50" : ""
                  }`}
                >
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center opacity-90"
                    style={{ backgroundColor: `${item.color}15` }} // 15 is hex for ~8% opacity
                  >
                    <Feather name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text className="flex-1 ml-4 text-[15px] font-medium text-slate-700">
                    {item.label}
                  </Text>
                  <Feather name="chevron-right" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity className="flex-row items-center justify-center bg-red-50 py-4 rounded-2xl mt-4">
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text className="ml-2 text-[15px] font-bold text-red-500">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}