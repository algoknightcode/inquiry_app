import { fetchWithCache } from "@/utils/apiCache";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, LayoutChangeEvent, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";

type Industry = {
  _id: string;
  name: string;
};

const MARQUEE_SPEED_MS_PER_PIXEL = 30;

const fetchIndustriesData = async () => {
  try {
    const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");
    if (json && json.success && Array.isArray(json.data)) {
      // FIX: Removed Object.freeze() which was breaking Hermes array prototypes
      return json.data as Industry[];
    }
  } catch (error) {
    console.log("Error fetching marquee industries:", error);
  }
  return [];
};

const PillItem = React.memo(
  ({ industry, combinedPillStyle, combinedTextStyle, onPress }: { 
    industry: Industry; 
    combinedPillStyle: any; 
    combinedTextStyle: any; 
    onPress: (ind: Industry) => void 
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

const CategoryMarquee = () => {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  const { width: screenWidth } = useWindowDimensions();
  const dims = useMemo(() => {
    const isTablet = screenWidth >= 768;
    return {
      marqueeHeight: isTablet ? 68 : 46,
      itemPaddingHorizontal: isTablet ? 20 : 16,
      itemPaddingVertical: isTablet ? 8 : 6,
      fontSize: 15, 
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

  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const sharedContentWidth = useSharedValue(0);

  useEffect(() => {
    fetchIndustriesData().then((data) => {
      if (data && data.length > 0) {
        setIndustries(data);
      }
      setLoading(false);
    });
  }, []);

  const loopMarquee = () => {
    'worklet';
    if (sharedContentWidth.value <= 0 || isDragging.value) return;
    
    cancelAnimation(translateX);
    translateX.value = 0;
    translateX.value = withRepeat(
      withTiming(-sharedContentWidth.value, {
        duration: sharedContentWidth.value * MARQUEE_SPEED_MS_PER_PIXEL,
        easing: Easing.linear,
      }),
      -1, 
      false 
    );
  };

  useAnimatedReaction(
    () => sharedContentWidth.value,
    (width, prevWidth) => {
      if (width > 0 && width !== prevWidth && !isDragging.value) {
        loopMarquee();
      }
    }
  );

  const startMarquee = () => {
    'worklet';
    if (sharedContentWidth.value <= 0) return;
    cancelAnimation(translateX);
    
    const currentPos = translateX.value;
    const width = sharedContentWidth.value;
    
    let normalizedPos = currentPos % width;
    if (normalizedPos > 0) {
      normalizedPos -= width;
    }

    const remainingDistance = width + normalizedPos;
    const duration = (remainingDistance / width) * (width * MARQUEE_SPEED_MS_PER_PIXEL);

    translateX.value = withTiming(-width, {
      duration: Math.max(duration, 100),
      easing: Easing.linear,
    }, (finished) => {
      if (finished && !isDragging.value) {
        translateX.value = 0; 
        loopMarquee();
      }
    });
  };

  useEffect(() => {
    return () => cancelAnimation(translateX);
  }, [translateX]);

  const panGesture = useMemo(() => Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onBegin(() => {
      isDragging.value = true;
      cancelAnimation(translateX);
      startX.value = translateX.value;
    })
    .onChange((event) => {
      const w = sharedContentWidth.value;
      if (w > 0) {
        let nextValue = (startX.value + event.translationX) % w;
        if (nextValue > 0) nextValue -= w;
        translateX.value = nextValue;
      } else {
        translateX.value = startX.value + event.translationX;
      }
    })
    .onFinalize(() => {
      isDragging.value = false;
      startMarquee();
    }), [translateX, startX, isDragging, sharedContentWidth]); 

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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

  // FIX: Fallback to an empty array to absolutely guarantee .map exists
  const safeIndustries = Array.isArray(industries) ? industries : [];

  const pillNodes = useMemo(() => safeIndustries.map((ind) => (
    <PillItem
      key={`ind-${ind._id}`}
      industry={ind}
      combinedPillStyle={combinedPillStyle}
      combinedTextStyle={combinedTextStyle}
      onPress={handlePress}
    />
  )), [safeIndustries, combinedPillStyle, combinedTextStyle, handlePress]);

  const duplicateNodes = useMemo(() => safeIndustries.map((ind) => (
    <PillItem
      key={`dup-${ind._id}`}
      industry={ind}
      combinedPillStyle={combinedPillStyle}
      combinedTextStyle={combinedTextStyle}
      onPress={handlePress}
    />
  )), [safeIndustries, combinedPillStyle, combinedTextStyle, handlePress]);

  // FIX: Bulletproof guard clauses before rendering
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
            {pillNodes}
          </View>
          <View className="flex-row items-center pl-3">
            {duplicateNodes}
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