import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Logo from "../../../assets/images/logoo.webp";

const Navbar = ({ onMenuPress }: { onMenuPress?: () => void }) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="flex flex-row items-center justify-between px-5 bg-white border-b border-gray-100 shadow-sm"
    >
      {/* Forces the phone's time, battery, and wifi icons to be dark so they show on white! */}
      <StatusBar style="dark" />
      
      {/* Menu Button */}
      <Pressable 
        className="h-12 w-12 items-center justify-center rounded-full active:bg-black/5 active:scale-[0.92] transition-all"
        hitSlop={12}
        onPress={onMenuPress}
      >
        <Ionicons name="menu-outline" size={28} color="#0f172a" />
      </Pressable>

      {/* Logo Container */}
      <View className="flex-1 h-16 max-w-[75%] items-center justify-center">
        <Image
          source={Logo}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Notification Button */}
      <Pressable 
        className="h-12 w-12 items-center justify-center rounded-full active:bg-black/5 active:scale-[0.92] transition-all"
        hitSlop={12}
      >
        <View className="relative items-center justify-center">
          <Ionicons name="notifications-outline" size={26} color="#0f172a" />
          <View className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-rose-500 border-[2px] border-white shadow-sm" />
        </View>
      </Pressable>

    </View>
  );
};

export default Navbar;

const styles = {
  logoImage: {
    width: "100%" as const,
    height: "100%" as const,
  },
};