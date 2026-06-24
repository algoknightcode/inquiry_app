import { Graph1, Graph2 } from "@/assets/images";
import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isSellerSignedIn } from "@/utils/roleCache";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 25) / 2;

const Banner2 = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pressScaleLeft = useRef(new Animated.Value(1)).current;
  const pressScaleRight = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const handleFreeListingPress = async () => {
    try {
      const supplierId = await AsyncStorage.getItem("supplierId");
      if (supplierId || isSellerSignedIn) {
        router.push("/Seller/AddProduct");
      } else {
        router.push("/Seller/auth/Login");
      }
    } catch (e) {
      router.push("/Seller/auth/Login");
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const handlePressIn = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      friction: 7,
      tension: 60,
    }).start();
  };

  const handlePressOut = (scale: Animated.Value) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  };

  return (
    <View className={styles.sectionContainer}>
      <View className={styles.headerRow}>
        <Text className={styles.heading}>
          Analytics Overview
        </Text>
      </View>

      <View className={styles.container}>
        {/* Post Requirement Card */}
        <Animated.View style={{ transform: [{ scale: pressScaleLeft }], width: CARD_WIDTH }}>
          <Pressable
            className={styles.card}
            onPress={() => router.push('/PostRequirenmentForm')}
            onPressIn={() => handlePressIn(pressScaleLeft)}
            onPressOut={() => handlePressOut(pressScaleLeft)}
            android_ripple={{ color: "#f1f5f9" }}
          >
            <Image
              source={Graph1}
              style={styles.graphImage}
              contentFit="cover"
            />

            {/* Left Card Overlay Text (instead of button) */}
            <View className="absolute top-4 left-4">
              <Text className="text-slate-900 font-jakarta-bold text-[18px] leading-[22px] tracking-tight">
                Post{"\n"}Requirement
              </Text>
              <View className="flex-row items-center mt-1.5">
                <Text className="text-slate-500 mt-20 font-jakarta-semibold text-[11px] tracking-tight">Post now</Text>
                <Text className="text-slate-900 mt-20 text-[11px] font-jakarta-bold ml-1.5">→</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Free Listing Card */}
        <Animated.View style={{ transform: [{ scale: pressScaleRight }], width: CARD_WIDTH }}>
          <Pressable
            className={styles.card}
            onPressIn={() => handlePressIn(pressScaleRight)}
            onPressOut={() => handlePressOut(pressScaleRight)}
            onPress={handleFreeListingPress}
            android_ripple={{ color: "#f1f5f9" }}
          >
            <Image
              source={Graph2}
              style={styles.graphImage}
              contentFit="cover"
            />

            {/* Right Card Overlay Text (instead of button) */}
            <View className="absolute top-4 left-4">
              <Text className="text-orange-600 font-jakarta-bold text-[18px] leading-[22px] tracking-tight">
                Free{"\n"}Listing
              </Text>
              <View className="flex-row items-center mt-1.5">
                <Text className="text-orange-500/80 mt-20 font-jakarta-semibold text-[11px] tracking-tight">Add store</Text>
                <Text className="text-orange-600 mt-20 text-[11px] font-jakarta-bold ml-1.5">→</Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

export default Banner2;

const styles = {
  sectionContainer: "mt-8",

  headerRow: "px-3 mb-4",

  heading:
    "text-[22px] font-jakarta-bold text-slate-900 tracking-tight",

  container:
    "px-3 flex-row justify-between",

  card:
    "bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm relative h-[160px]",

  graphImage: {
    width: "100%" as const,
    height: "100%" as const,
    opacity: 0.85, 
  },

  // Centering wrapper overlay layer
  centerOverlay: {
    position: "absolute" as const,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 12,
  },

  // Light translucent glass style button with dark slate text (more transparent)
  overlayBtn:
    "w-full bg-white/50 border border-white/50 py-2.5 rounded-xl shadow-sm",

  overlayBtnText:
    "text-slate-900 font-jakarta-bold text-[11px] tracking-tight text-center",

  // Orange tinted translucent glass style button with orange text (more transparent)
  animatedOverlayBtn:
    "w-full bg-orange-50/50 border border-orange-300/40 py-2.5 rounded-xl shadow-sm",

  animatedOverlayBtnText:
    "text-orange-600 font-jakarta-bold text-[11px] tracking-tight uppercase text-center",

  arrowLeft:
    "text-slate-900 text-xs font-jakarta-bold ml-1.5 bottom-[0.5px]",

  arrowRight:
    "text-orange-600 text-xs font-jakarta-bold ml-1.5 bottom-[0.5px]",
};