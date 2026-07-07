import { Graph1, Graph2 } from "@/assets/images";
import { isSellerSignedIn } from "@/utils/roleCache";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

const Banner2 = () => {
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
      <View className="flex-row justify-between gap-3 px-3 w-full max-w-[600px] mx-auto">
        
        {/* Post Requirement Card */}
        <Animated.View style={{ transform: [{ scale: pressScaleLeft }], flex: 1 }}>
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

            <View className="absolute inset-0 flex-col justify-center px-3">
              <Text className="text-gray-800 text-[16px] sm:text-[17px] font-bold leading-snug">
                Looking for a{"\n"}
                <Text className="text-[#0D2340] font-bold">product?</Text>
              </Text>

              {/* Blue Border with increased top margin (mt-4) for gap */}
              <View className="bg-white/60 px-3 py-2 rounded-lg border border-[#1753C5] self-start mt-4">
                <Text className="text-gray-800 text-[11px] sm:text-[13px] font-semibold">
                  Post As Per Requirement →
                </Text>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Free Listing Card */}
        <Animated.View style={{ transform: [{ scale: pressScaleRight }], flex: 1 }}>
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

            <View className="absolute inset-0 flex-col justify-center px-3">
              <Text className="text-gray-800 text-[16px] sm:text-[17px] font-bold leading-snug">
                Grow business{"\n"}
                <Text className="text-[#0D2340] font-bold">10x faster</Text>
              </Text>

              {/* Orange Border with increased top margin (mt-4) for gap */}
              <View className="bg-white/60 px-3 py-2 rounded-lg border border-[#f48335] self-start mt-4">
                <Text className="text-gray-800 text-[11px] sm:text-[13px] font-semibold">
                  Free Listing →
                </Text>
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
  sectionContainer: "mt-4 w-full",
  
  card: "bg-white rounded-xl overflow-hidden relative h-[140px] w-full",

  graphImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    opacity: 0.9, 
  } as const
};