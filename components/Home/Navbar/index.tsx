import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, Platform, Pressable, View, Animated, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Logo from "../../../assets/images/logoo-Photoroom.png";
import SearchBar from "../SearchBar";

const Navbar = ({ onMenuPress, scrollY }: { onMenuPress?: () => void; scrollY?: Animated.Value }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Interpolations for crossfading logo and search bar (activated after scrolling past homepage search bar)
  const logoOpacity = scrollY ? scrollY.interpolate({
    inputRange: [380, 440, 480],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  }) : 1;

  const searchOpacity = scrollY ? scrollY.interpolate({
    inputRange: [380, 440, 480],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp'
  }) : 0;

  const searchTranslateY = scrollY ? scrollY.interpolate({
    inputRange: [380, 480],
    outputRange: [-50, 0],
    extrapolate: 'clamp'
  }) : -50;

  return (
    <View 
      style={{ paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 10) : 0, zIndex: 50 }}
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
        {/* Animated Logo - pointerEvents="none" so it doesn't block search bar interaction when hidden */}
        <Animated.View 
          style={{ opacity: logoOpacity, position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          pointerEvents="none"
        >
          <Image
            source={Logo}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Animated Sticky Search Bar */}
        <Animated.View 
          style={{ 
            opacity: searchOpacity, 
            transform: [{ translateY: searchTranslateY }],
            position: 'absolute', 
            width: '100%',
            height: 40,
            justifyContent: 'center'
          }}
          pointerEvents="box-none"
        >
          <View style={{ width: '100%', marginTop: -8 }}>
            <SearchBar variant="compact" />
          </View>
        </Animated.View>
      </View>

      {/* Notification Button */}
      <Pressable 
        className="h-12 w-12 items-center justify-center rounded-full active:bg-black/5 active:scale-[0.92] transition-all z-10"
        hitSlop={12}
        onPress={()=> router.push("/NotificationPanel")}
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
    width: "75%" as const,
    height: "100%" as const,
  },
};