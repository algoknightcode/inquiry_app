import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, Platform, Pressable, View } from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    SharedValue,
    useAnimatedStyle,
    useSharedValue
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Logo from "../../../assets/images/logoo-Photoroom.png";
import SearchBar from "../SearchBar";

interface NavbarProps {
  onMenuPress?: () => void;
  // Optional scrollY with default - works in both Home (with scroll) and Dashboard (without)
  scrollY?: SharedValue<number>; 
}

const Navbar = ({ onMenuPress, scrollY: externalScrollY }: NavbarProps) => {
  // Use provided scrollY or create default static one
  const scrollY = externalScrollY || useSharedValue<number>(0);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 1. Logo Style (UI Thread only - Never triggers a React re-render)
  const logoAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [380, 440, 480],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // 2. Search Bar Style (UI Thread only)
  const searchAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [380, 440, 480],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [380, 480],
      [-50, 0],
      Extrapolation.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View 
      style={{ 
        paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 10) : 0, 
        zIndex: 999,
        overflow: 'visible',
      }}
      className="flex flex-row items-center justify-between px-5 bg-white border-b border-gray-100 shadow-sm"
    >
      <StatusBar style="dark" />
      
      {/* Menu Button */}
      <Pressable 
        className="h-12 w-12 items-center justify-center rounded-full active:bg-black/5 active:scale-[0.92] transition-all z-10"
        hitSlop={12}
        onPress={onMenuPress}
      >
        <Ionicons name="menu-outline" size={28} color="#0f172a" />
      </Pressable>

      {/* Center Container for Logo & Search Bar */}
        <View className="flex-1 h-16 items-center justify-center relative mx-2">
        {/* Animated Logo */}
        <Animated.View 
          style={[
            { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
            logoAnimatedStyle // Applied safely on UI thread
          ]}
          pointerEvents="none"
        >
          <Image
            source={Logo}
            style={{ width: "75%", height: "100%" }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Sticky Search Bar */}
        <Animated.View 
          style={[
            { position: 'absolute', width: '100%', height: 40, justifyContent: 'center', overflow: 'visible', zIndex: 100 },
            searchAnimatedStyle // Applied safely on UI thread
          ]}
          pointerEvents="box-none"
        >
          <View style={{ width: '100%', marginTop: -8, zIndex: 100 }}>
            <SearchBar variant="compact" />
          </View>
        </Animated.View>
      </View>

      {/* Notification Button */}
      <Pressable 
        className="h-12 w-12 items-center justify-center rounded-full active:bg-black/5 active:scale-[0.92] transition-all z-10"
        hitSlop={12}
        onPress={() => router.push("/NotificationPanel")}
      >
        <View className="relative items-center justify-center">
          <Ionicons name="notifications-outline" size={26} color="#0f172a" />
          <View className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-rose-500 border-[2px] border-white shadow-sm" />
        </View>
      </Pressable>

    </View>
  );
};

// Use React.memo so the Navbar NEVER re-renders if parent state changes (unless props change)
export default React.memo(Navbar);