import { fetchWithCache } from "@/utils/apiCache";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    LayoutChangeEvent,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    cancelAnimation,
    Easing,
    SharedValue,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withDecay,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

type Industry = {
  _id: string;
  name: string;
};

// Controls speed. Lower number = faster. (30ms per pixel)
const MARQUEE_SPEED_MS_PER_PIXEL = 30;

const fetchIndustriesData = async () => {
  try {
    const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");
    if (json && json.success && Array.isArray(json.data)) {
      return json.data as Industry[];
    }
  } catch (error) {
    console.log("Error fetching marquee industries:", error);
  }
  return [];
};

// 1. Single Interactive Pill Component (Used for both sets to fix UX bug)
const PillItem = React.memo(
  ({ industry, combinedPillStyle, combinedTextStyle, onPress }: {
    industry: Industry;
    combinedPillStyle: any;
    combinedTextStyle: any;
    onPress: (ind: Industry) => void;
  }) => {
    // Stable inline callback
    const handlePress = useCallback(() => {
      onPress(industry);
    }, [industry, onPress]);

    return (
      <Pressable onPress={handlePress} style={combinedPillStyle}>
        <Text style={combinedTextStyle}>{industry.name}</Text>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.industry._id === next.industry._id &&
    prev.combinedPillStyle === next.combinedPillStyle &&
    prev.combinedTextStyle === next.combinedTextStyle
);

const CategoryMarquee = ({ isScrolling }: { isScrolling?: SharedValue<boolean> }) => {
  const isFocused = useIsFocused();
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  const { width: screenWidth } = useWindowDimensions();
  const dims = useMemo(() => {
    const isTablet = screenWidth >= 768;
    return {
      marqueeHeight: isTablet ? 68 : 46,
      itemPaddingHorizontal: isTablet ? 18 : 15,
      itemPaddingVertical: isTablet ? 8 : 6,
      fontSize: 14,
    };
  }, [screenWidth]);

  const combinedPillStyle = useMemo(() => ([
    mqs.pill,
    { paddingHorizontal: dims.itemPaddingHorizontal, paddingVertical: dims.itemPaddingVertical }
  ]), [dims.itemPaddingHorizontal, dims.itemPaddingVertical]);

  const combinedTextStyle = useMemo(() => ([
    mqs.pillText,
    { fontSize: dims.fontSize }
  ]), [dims.fontSize]);

  // --- UI THREAD ENGINE ---
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const sharedContentWidth = useSharedValue(0);

  useEffect(() => {
    fetchIndustriesData().then((data) => {
      if (data && data.length > 0) setIndustries(data);
      setLoading(false);
    });
  }, []);

  // Native Worklet to handle seamless infinite looping via withRepeat
  const startMarquee = () => {
    'worklet';
    const w = sharedContentWidth.value;
    if (w <= 0) return;

    let currentPos = translateX.value % w;
    if (currentPos > 0) currentPos -= w;
    
    translateX.value = currentPos;
    
    const distanceLeft = w + currentPos; 
    const duration = distanceLeft * MARQUEE_SPEED_MS_PER_PIXEL;

    translateX.value = withTiming(-w, {
      duration: Math.max(duration, 16),
      easing: Easing.linear,
    }, (finished) => {
      if (finished && !isDragging.value) {
        translateX.value = 0;
        translateX.value = withRepeat(
          withTiming(-w, {
            duration: w * MARQUEE_SPEED_MS_PER_PIXEL,
            easing: Easing.linear,
          }),
          -1, 
          false
        );
      }
    });
  };

  useAnimatedReaction(
    () => sharedContentWidth.value,
    (width, prevWidth) => {
      if (!isFocused) {
        return;
      }
      if (width > 0 && width !== prevWidth && !isDragging.value) {
        startMarquee();
      }
    },
    [isFocused]
  );

  // ── Pause marquee during main feed scroll ──
  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling) => {
      if (!isFocused) {
        cancelAnimation(translateX);
        return;
      }
      if (scrolling) {
        // User is scrolling main feed - pause marquee
        cancelAnimation(translateX);
      } else {
        // Scroll ended - resume marquee
        if (!isDragging.value && sharedContentWidth.value > 0) {
          startMarquee();
        }
      }
    },
    [isFocused]
  );

  // 2. Optimized Gesture: Explicit worklets, empty dependency array
  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onBegin(() => {
      'worklet';
      cancelAnimation(translateX);
      isDragging.value = true;
      startX.value = translateX.value;
    })
    .onChange((event) => {
      'worklet';
      translateX.value = startX.value + event.translationX;
    })
    .onFinalize((event) => {
      'worklet';
      if (Math.abs(event.velocityX) > 150) {
        translateX.value = withDecay({
          velocity: event.velocityX,
          deceleration: 0.995,
        }, (finished) => {
          if (finished) {
            isDragging.value = false;
            startMarquee(); 
          }
        });
      } else {
        isDragging.value = false;
        startMarquee();
      }
    }), []); // Empty array guarantees it is never re-created

  const animatedStyle = useAnimatedStyle(() => {
    const w = sharedContentWidth.value;
    if (w === 0) return { transform: [{ translateX: 0 }] };
    
    let offset = translateX.value % w;
    if (offset > 0) offset -= w; 

    return {
      transform: [{ translateX: offset }],
    };
  });

  const handlePress = useCallback((ind: Industry) => {
    router.push({
      pathname: "/GrId_MainCategory",
      params: { id: ind._id, name: ind.name },
    });
  }, [router]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width; 
    if (width > 0 && sharedContentWidth.value !== width) {
      sharedContentWidth.value = width; 
    }
  }, []);

  const renderLoading = useMemo(() => (
    <View style={{ height: dims.marqueeHeight }} className="bg-white border-y border-slate-100 flex-row justify-center items-center">
      <ActivityIndicator size="small" color="#475569" />
    </View>
  ), [dims.marqueeHeight]);

  const safeIndustries = Array.isArray(industries) ? industries : [];

  // 3. Both Sets Interactive (Fixes UX Bug)
  const renderPills = useMemo(() => safeIndustries.map((ind, index) => (
    <PillItem
      key={`pill-${ind._id}-${index}`}
      industry={ind}
      combinedPillStyle={combinedPillStyle}
      combinedTextStyle={combinedTextStyle}
      onPress={handlePress}
    />
  )), [safeIndustries, combinedPillStyle, combinedTextStyle, handlePress]);

  if (loading) return renderLoading;
  if (safeIndustries.length === 0) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ height: dims.marqueeHeight }} className="bg-white border-y border-slate-100/80 overflow-hidden flex-row items-center relative">
        <Animated.View 
          style={[mqs.animatedWrapper, animatedStyle]}
          // Removed hardware properties as they cause Android alpha compositing glitches on moving targets
        >
          <View onLayout={handleLayout} className="flex-row items-center pl-3">
            {renderPills}
          </View>
          <View className="flex-row items-center pl-3">
            {renderPills}
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

export default React.memo(CategoryMarquee);

const mqs = StyleSheet.create({
  animatedWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    backgroundColor: "#1e3a8a", 
    borderRadius: 999,
    marginRight: 12,
  },
  pillText: {
    color: "#ffffff", 
    fontFamily: "PlusJakartaSans-Bold",
    letterSpacing: -0.3,
  },
});