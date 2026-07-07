import { fetchWithCache } from "@/utils/apiCache";
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

// 1. Interactive Pill (Mounted only once per item)
const PillItem = React.memo(
  ({ industry, combinedPillStyle, combinedTextStyle, onPress }: {
    industry: Industry;
    combinedPillStyle: any;
    combinedTextStyle: any;
    onPress: (ind: Industry) => void;
  }) => (
    <Pressable onPress={() => onPress(industry)} style={combinedPillStyle}>
      <Text style={combinedTextStyle}>{industry.name}</Text>
    </Pressable>
  ),
  (prev, next) =>
    prev.industry._id === next.industry._id &&
    prev.combinedPillStyle === next.combinedPillStyle &&
    prev.combinedTextStyle === next.combinedTextStyle
);

// 2. Static Pill (Cuts down mounted Pressables by 50% for the duplicate set)
const StaticPillItem = React.memo(
  ({ industry, combinedPillStyle, combinedTextStyle }: {
    industry: Industry;
    combinedPillStyle: any;
    combinedTextStyle: any;
  }) => (
    <View style={combinedPillStyle}>
      <Text style={combinedTextStyle}>{industry.name}</Text>
    </View>
  ),
  (prev, next) =>
    prev.industry._id === next.industry._id &&
    prev.combinedPillStyle === next.combinedPillStyle &&
    prev.combinedTextStyle === next.combinedTextStyle
);

const CategoryMarquee = () => {
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

  // --- UI THREAD ENGINE (⭐⭐⭐⭐⭐ IMPACT) ---
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

    // Normalize current position to cleanly handle manual right/left swipes
    let currentPos = translateX.value % w;
    if (currentPos > 0) currentPos -= w;
    
    translateX.value = currentPos;
    
    const distanceLeft = w + currentPos; 
    const duration = distanceLeft * MARQUEE_SPEED_MS_PER_PIXEL;

    // Phase 1: Travel the remaining distance smoothly to the loop boundary
    translateX.value = withTiming(-w, {
      duration: Math.max(duration, 16),
      easing: Easing.linear,
    }, (finished) => {
      if (finished && !isDragging.value) {
        // Phase 2: Instantly reset to 0 and loop forever completely natively
        translateX.value = 0;
        translateX.value = withRepeat(
          withTiming(-w, {
            duration: w * MARQUEE_SPEED_MS_PER_PIXEL,
            easing: Easing.linear,
          }),
          -1, // -1 means infinite repeat
          false
        );
      }
    });
  };

  // Triggers the animation exactly once when layout is measured
  useAnimatedReaction(
    () => sharedContentWidth.value,
    (width, prevWidth) => {
      if (width > 0 && width !== prevWidth && !isDragging.value) {
        startMarquee();
      }
    }
  );

  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onBegin(() => {
      cancelAnimation(translateX);
      isDragging.value = true;
      startX.value = translateX.value;
    })
    .onChange((event) => {
      translateX.value = startX.value + event.translationX;
    })
    .onFinalize((event) => {
      if (Math.abs(event.velocityX) > 150) {
        translateX.value = withDecay({
          velocity: event.velocityX,
          deceleration: 0.995,
        }, (finished) => {
          if (finished) {
            isDragging.value = false;
            startMarquee(); // Resume infinite loop after physics decay stops
          }
        });
      } else {
        isDragging.value = false;
        startMarquee();
      }
    }), [translateX, startX, isDragging, sharedContentWidth]); 

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

  // Set 1: Interactive
  const set1 = useMemo(() => safeIndustries.map((ind) => (
    <PillItem
      key={`s1-${ind._id}`}
      industry={ind}
      combinedPillStyle={combinedPillStyle}
      combinedTextStyle={combinedTextStyle}
      onPress={handlePress}
    />
  )), [safeIndustries, combinedPillStyle, combinedTextStyle, handlePress]);

  // Set 2: Non-Interactive (Removes dozens of Pressables from memory)
  const set2 = useMemo(() => safeIndustries.map((ind) => (
    <StaticPillItem
      key={`s2-${ind._id}`}
      industry={ind}
      combinedPillStyle={combinedPillStyle}
      combinedTextStyle={combinedTextStyle}
    />
  )), [safeIndustries, combinedPillStyle, combinedTextStyle]);

  if (loading) return renderLoading;
  if (safeIndustries.length === 0) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ height: dims.marqueeHeight }} className="bg-white border-y border-slate-100/80 overflow-hidden flex-row items-center relative">
        <Animated.View 
          style={[mqs.animatedWrapper, animatedStyle]}
          renderToHardwareTextureAndroid={true}
          needsOffscreenAlphaCompositing={true}
        >
          <View onLayout={handleLayout} className="flex-row items-center pl-3">
            {set1}
          </View>
          <View className="flex-row items-center pl-3">
            {set2}
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