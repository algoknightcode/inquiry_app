import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  cancelAnimation,
  runOnUI,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
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

  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  
  // Responsive layout values
  const marqueeHeight = isTablet ? 68 : 56;
  const itemPaddingHorizontal = isTablet ? 20 : 16;
  const itemPaddingVertical = isTablet ? 8 : 6;
  const fontSize = isTablet ? 15 : 13;

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const sharedContentWidth = useSharedValue(0);

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

  const loopMarquee = () => {
    'worklet';
    if (sharedContentWidth.value <= 0) return;
    cancelAnimation(translateX);
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-sharedContentWidth.value, {
        duration: sharedContentWidth.value * 30, // 30ms per pixel
        easing: Easing.linear,
      }),
      -1, // infinite loop
      false // do not reverse
    );
  };

  const startMarquee = () => {
    'worklet';
    if (sharedContentWidth.value <= 0) return;
    cancelAnimation(translateX);
    const currentPos = translateX.value;
    
    // Normalize position within [-sharedContentWidth.value, 0]
    let normalizedPos = currentPos;
    const width = sharedContentWidth.value;
    if (normalizedPos < -width) {
      normalizedPos = (normalizedPos % width);
    }
    if (normalizedPos > 0) {
      normalizedPos = (normalizedPos % width) - width;
    }

    const remainingDistance = width + normalizedPos;
    const duration = (remainingDistance / width) * (width * 30);

    translateX.value = withTiming(-width, {
      duration: Math.max(duration, 100),
      easing: Easing.linear,
    }, (finished) => {
      if (finished) {
        loopMarquee();
      }
    });
  };

  useEffect(() => {
    if (contentWidth > 0 && industries.length > 0) {
      // Ensure the animation is started on the UI thread for reliability across devices
      runOnUI(loopMarquee)();
    }
    return () => {
      cancelAnimation(translateX);
    };
  }, [contentWidth, industries]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // prevent small finger twitches from cancelling click triggers
    .onBegin(() => {
      isDragging.value = true;
      cancelAnimation(translateX);
      startX.value = translateX.value;
    })
    .onChange((event) => {
      let nextValue = startX.value + event.translationX;
      
      const width = sharedContentWidth.value;
      if (width > 0) {
        // Wrap around seamlessly
        while (nextValue < -width) {
          nextValue += width;
        }
        while (nextValue > 0) {
          nextValue -= width;
        }
      }
      translateX.value = nextValue;
    })
    .onEnd(() => {
      isDragging.value = false;
      startMarquee();
    });

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
      <View style={{ height: marqueeHeight }} className="bg-white border-y border-slate-100 flex-row justify-center items-center">
        <ActivityIndicator size="small" color="#475569" />
      </View>
    );
  }

  if (industries.length === 0) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ height: marqueeHeight }} className="bg-white border-y border-slate-100/80 overflow-hidden flex-row items-center relative">
        <Animated.View style={[{ flexDirection: "row", alignItems: "center" }, animatedStyle]}>
          {/* First group used to measure single set width */}
          <View
            onLayout={(e) => {
              const width = e.nativeEvent.layout.width;
              setContentWidth(width);
              sharedContentWidth.value = width;
            }}
            className="flex-row items-center pl-3"
          >
            {industries.map((ind, idx) => (
              <Pressable
                key={`ind-1-${ind._id}-${idx}`}
                onPress={() => handlePress(ind)}
                style={{
                  paddingHorizontal: itemPaddingHorizontal,
                  paddingVertical: itemPaddingVertical,
                }}
                className="bg-slate-50/80 border border-slate-100 rounded-full mr-3 shadow-xs shadow-slate-100/50 active:bg-slate-100 active:scale-95"
              >
                <Text style={{ fontSize }} className="text-slate-700 font-jakarta-semibold tracking-tight">
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
                style={{
                  paddingHorizontal: itemPaddingHorizontal,
                  paddingVertical: itemPaddingVertical,
                }}
                className="bg-slate-50/80 border border-slate-100 rounded-full mr-3 shadow-xs shadow-slate-100/50 active:bg-slate-100 active:scale-95"
              >
                <Text style={{ fontSize }} className="text-slate-700 font-jakarta-semibold tracking-tight">
                  {ind.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

export default React.memo(CategoryMarquee);
