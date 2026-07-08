import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
    interpolateColor,
    SharedValue,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import HomeImage1 from "../../../assets/images/mob1.jpeg";
import HomeImage2 from "../../../assets/images/mob2.jpeg";

const data = [HomeImage1, HomeImage2];

// 2. Extract Image to a Memoized Component 
const HeroImage = React.memo(({ img, index, activeIndex, screenWidth }: { img: any, index: number, activeIndex: SharedValue<number>, screenWidth: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeIndex.value === index;
    return {
      opacity: withTiming(isActive ? 1 : 0, { duration: 800 }),
    };
  });

  return (
    <Animated.View style={[{ position: "absolute", width: screenWidth, height: 360 }, animatedStyle]}>
      <Image
        source={img}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
    </Animated.View>
  );
});

// 3. Extract Pagination Dot to a Memoized Component
const PaginationDot = React.memo(({ index, activeIndex }: { index: number, activeIndex: SharedValue<number> }) => {
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
  const { width: screenWidth } = useWindowDimensions();
  
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
        <HeroImage key={`img-${index}`} img={img} index={index} activeIndex={activeIndex} screenWidth={screenWidth} />
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