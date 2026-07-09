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
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
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
    if (json?.success && Array.isArray(json.data)) {
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
    onPress: (ind: Industry) => void;
  }) => {
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

  // Shared values
  const translateX = useSharedValue(0);
  const sharedContentWidth = useSharedValue(0);
  const prevTimestamp = useSharedValue(0);
  const isFocusedSV = useSharedValue(isFocused);

  // Sync JS React State to Reanimated UI Thread
  useEffect(() => {
    isFocusedSV.value = isFocused;
  }, [isFocused]);

  // Create a single source of truth for whether the marquee should be active
  const isActive = useDerivedValue(() => {
    const scrolling = isScrolling?.value ?? false;
    return isFocusedSV.value && !scrolling;
  });

  useEffect(() => {
    fetchIndustriesData().then((data) => {
      if (data && data.length > 0) setIndustries(data);
      setLoading(false);
    });
  }, []);

  // Frame Callback: The ultra-optimized engine for the marquee
  useFrameCallback((frameInfo) => {
    if (!frameInfo.timestamp) return;

    // If paused or width isn't calculated, just keep updating the timestamp 
    // so we don't get massive jumps when we resume.
    if (!isActive.value || sharedContentWidth.value <= 0) {
      prevTimestamp.value = frameInfo.timestamp;
      return;
    }

    const delta = frameInfo.timestamp - prevTimestamp.value;
    prevTimestamp.value = frameInfo.timestamp;

    // Prevent huge jumps if the app goes to the background and comes back
    if (delta > 100) return;

    const pixelsToMove = delta / MARQUEE_SPEED_MS_PER_PIXEL;
    let nextX = translateX.value - pixelsToMove;

    // Seamlessly loop back without stuttering
    if (nextX <= -sharedContentWidth.value) {
      nextX += sharedContentWidth.value;
    }

    translateX.value = nextX;
  });

  // Clean, minimal animated style
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

  const safeIndustries = Array.isArray(industries) ? industries : [];

  const renderPills = useMemo(() => safeIndustries.map((ind, index) => (
    <PillItem
      key={`pill-${ind._id}-${index}`}
      industry={ind}
      combinedPillStyle={combinedPillStyle}
      combinedTextStyle={combinedTextStyle}
      onPress={handlePress}
    />
  )), [safeIndustries, combinedPillStyle, combinedTextStyle, handlePress]);

  if (loading) {
    return (
      <View style={{ height: dims.marqueeHeight }} className="bg-white border-y border-slate-100 flex-row justify-center items-center">
        <ActivityIndicator size="small" color="#475569" />
      </View>
    );
  }

  if (safeIndustries.length === 0) return null;

  return (
    <View style={{ height: dims.marqueeHeight }} className="bg-white border-y border-slate-100/80 overflow-hidden flex-row items-center">
      <Animated.View style={[mqs.animatedWrapper, animatedStyle]}>
        <View onLayout={handleLayout} className="flex-row items-center pl-3">
          {renderPills}
        </View>
        <View className="flex-row items-center pl-3">
          {renderPills}
        </View>
      </Animated.View>
    </View>
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