import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Dimensions, View } from "react-native";
// 1. Import Reanimated
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";

import HomeImage1 from "../../../assets/images/mob1.jpeg";
import HomeImage2 from "../../../assets/images/mob2.jpeg";

const { width } = Dimensions.get("window");
const data = [HomeImage1, HomeImage2];

// 2. Extract Image to a Memoized Component 
// Listens to the shared value on the UI thread without re-rendering JS
const HeroImage = React.memo(({ img, index, activeIndex }: { img: any, index: number, activeIndex: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    // Crossfade strictly on the UI thread
    const isActive = activeIndex.value === index;
    return {
      opacity: withTiming(isActive ? 1 : 0, { duration: 800 }),
    };
  });

  return (
    <Animated.View style={[{ position: "absolute", width, height: 360 }, animatedStyle]}>
      <Image
        source={img}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0} // Disable internal expo-image fade, Reanimated handles it better
      />
    </Animated.View>
  );
});

// 3. Extract Pagination Dot to a Memoized Component
const PaginationDot = React.memo(({ index, activeIndex }: { index: number, activeIndex: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeIndex.value === index;
    // Animate width and color on the Native UI thread
    const progress = withTiming(isActive ? 1 : 0, { duration: 300 });
    return {
      width: 10 + (progress * 14), // Animates from 10 to 24
      backgroundColor: interpolateColor(
        progress,
        [0, 1],
        ["#d1d5db", "#2563eb"] // gray-300 to blue-600
      ),
    };
  });

  return (
    <Animated.View style={[{ height: 10, borderRadius: 5, marginHorizontal: 4, backgroundColor: '#d1d5db' }, animatedStyle]} />
  );
});

const HeroBanner = () => {
  const isFocused = useIsFocused();
  
  // 4. Shared Value: Replaces useState. This lives on the UI thread.
  const activeIndex = useSharedValue(0);

  useEffect(() => {
    if (!isFocused) return;

    const interval = setInterval(() => {
      // 5. Update the value without triggering a React re-render
      activeIndex.value = (activeIndex.value + 1) % data.length;
    }, 4000);

    return () => clearInterval(interval);
  }, [isFocused, activeIndex]);

  return (
    <View className="h-[360px] w-full relative bg-slate-900 overflow-hidden">
      {/* Images */}
      {data.map((img, index) => (
        <HeroImage key={`img-${index}`} img={img} index={index} activeIndex={activeIndex} />
      ))}

      {/* Pagination Dots */}
      <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
        {data.map((_, index) => (
          <PaginationDot key={`dot-${index}`} index={index} activeIndex={activeIndex} />
        ))}
      </View>
    </View>
  );
};

// 6. Memoize the parent so it ignores scrolls/updates from HomeScreen
export default React.memo(HeroBanner);