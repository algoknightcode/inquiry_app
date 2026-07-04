import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  cancelAnimation,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { fetchWithCache } from "@/utils/apiCache";

type Industry = {
  _id: string;
  name: string;
};

const CategoryMarquee = () => {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentWidth, setContentWidth] = useState(0);

  const translateX = useSharedValue(0);

  useEffect(() => {
    const getIndustries = async () => {
      try {
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");
        if (json.success && Array.isArray(json.data)) {
          setIndustries(json.data);
        }
      } catch (error) {
        console.log("Error fetching marquee industries:", error);
      } finally {
        setLoading(false);
      }
    };
    getIndustries();
  }, []);

  useEffect(() => {
    if (contentWidth > 0 && industries.length > 0) {
      cancelAnimation(translateX);
      translateX.value = 0;
      translateX.value = withRepeat(
        withTiming(-contentWidth, {
          duration: contentWidth * 30, // 30ms per pixel, adjust speed here
          easing: Easing.linear,
        }),
        -1, // infinite loop
        false // do not reverse
      );
    }
    return () => {
      cancelAnimation(translateX);
    };
  }, [contentWidth, industries]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handlePress = (ind: Industry) => {
    router.push({
      pathname: "/GrId_MainCategory",
      params: { id: ind._id, name: ind.name },
    });
  };

  if (loading) {
    return (
      <View className="h-14 bg-white border-y border-slate-100 flex-row justify-center items-center">
        <ActivityIndicator size="small" color="#475569" />
      </View>
    );
  }

  if (industries.length === 0) {
    return null;
  }

  return (
    <View className="h-14 bg-white border-y border-slate-100/80 overflow-hidden flex-row items-center relative">
      <Animated.View style={[{ flexDirection: "row", alignItems: "center" }, animatedStyle]}>
        {/* First group used to measure single set width */}
        <View
          onLayout={(e) => {
            setContentWidth(e.nativeEvent.layout.width);
          }}
          className="flex-row items-center pl-3"
        >
          {industries.map((ind, idx) => (
            <Pressable
              key={`ind-1-${ind._id}-${idx}`}
              onPress={() => handlePress(ind)}
              className="bg-slate-50/80 border border-slate-100 px-4 py-1.5 rounded-full mr-3 shadow-xs shadow-slate-100/50 active:bg-slate-100 active:scale-95"
            >
              <Text className="text-slate-700 font-jakarta-semibold text-[13px] tracking-tight">
                {ind.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Second group (duplicate for seamless loop) */}
        <View className="flex-row items-center">
          {industries.map((ind, idx) => (
            <Pressable
              key={`ind-2-${ind._id}-${idx}`}
              onPress={() => handlePress(ind)}
              className="bg-slate-50/80 border border-slate-100 px-4 py-1.5 rounded-full mr-3 shadow-xs shadow-slate-100/50 active:bg-slate-100 active:scale-95"
            >
              <Text className="text-slate-700 font-jakarta-semibold text-[13px] tracking-tight">
                {ind.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(CategoryMarquee);
