import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
// 1. Reanimated imports for UI-Thread optimization
import Animated, {
  cancelAnimation,
  runOnJS,
  runOnUI,
  scrollTo,
  SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.88);
const SPACING = 12;
const ITEM_SIZE = CARD_WIDTH + SPACING;

// ── Local company logos ────────────────────────────────────────────────────
const client1 = require("../../../assets/images/Company_logo/client1logo.webp");
const client2 = require("../../../assets/images/Company_logo/client2logo.webp");
const client3 = require("../../../assets/images/Company_logo/client3logo.webp");
const client4 = require("../../../assets/images/Company_logo/client4logo.webp");
const client5 = require("../../../assets/images/Company_logo/client5logo.webp");
const client6 = require("../../../assets/images/Company_logo/client6logo.webp");

export interface TestimonialData {
  id: string;
  logo: any;
  quote: string;
  company: string;
  logoWidth?: number;       
  logoHeight?: number;      
  companyFontSize?: number; 
}

const testimonials: TestimonialData[] = [
  {
    id: "1",
    logo: client4,
    quote: "Platform use karna simple hai aur results transparent hain. Hume clearly dikhta hai inquiries kahan se aa rahi hain. Highly Recommended.",
    company: "Bhagya Laxmi Industries",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 18,
  },
  {
    id: "2",
    logo: client2,
    quote: "Pehle hum multiple platforms use kar rahe the but results clear nahi the. Yahan hume proper visibility aur genuine buyers mile — exactly what we needed.",
    company: "Exotic Crate",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 18,
  },
  {
    id: "3",
    logo: client3,
    quote: "InquiryBazaar ka biggest advantage hai targeted inquiries. Random calls band ho gaye aur sirf serious buyers hi connect karte hain.",
    company: "Shree Shakti Infratech",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 18,
  },
  {
    id: "4",
    logo: client1,
    quote: "InquiryBazaar ne sirf listing nahi di, balki hume real business inquiries milna start hua. Leads ka quality genuinely better hai aur conversion bhi improve hua",
    company: "Matrix Tissues",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 18,
  },
  {
    id: "5",
    logo: client5,
    quote: "Unki marketing approach alag hai — sirf listing nahi, actively promote karte hain. Isse humari brand visibility kaafi strong hui hai",
    company: "Strides Design Studio",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 18,
  },
  {
    id: "6",
    logo: client6,
    quote: "InquiryBazaar ne humara time aur effort dono bachaya. Ab hume sirf relevant aur high-intent buyers se hi inquiries milti hain.",
    company: "Mr Dates",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 18,
  },
];

// ── Optimised Static Card ──────────────────────────────────────────────────
const TestimonialCard = React.memo(({ item }: { item: TestimonialData }) => (
  <View style={styles.cardContainer}>
    <View style={styles.logoContainer}>
      <Image
        source={item.logo}
        style={[
          styles.defaultLogo,
          item.logoWidth ? { width: item.logoWidth } : undefined,
          item.logoHeight ? { height: item.logoHeight } : undefined,
        ]}
        contentFit="contain"
        transition={0} // Faster instant load
        cachePolicy="memory-disk"
      />
    </View>

    <Text style={styles.quoteText}>{`"${item.quote}"`}</Text>
    <View style={styles.divider} />
    <Text style={[styles.companyName, item.companyFontSize ? { fontSize: item.companyFontSize } : undefined]}>
      {item.company}
    </Text>
  </View>
));

const getItemLayout = (_: any, index: number) => ({
  length: ITEM_SIZE,
  offset: ITEM_SIZE * index,
  index,
});

// ── Main Component ─────────────────────────────────────────────────────────
export default function TestimonialCarousel({ isScrolling }: { isScrolling?: SharedValue<boolean> }) {
  const isFocused = useIsFocused();
  const [activeDotIndex, setActiveDotIndex] = useState(0);

  // 2. Data Replication for Seamless Infinite Loop
  const replicatedData = useMemo(() => Array(3).fill(testimonials).flat(), []);
  const baseMiddleIndex = useMemo(() => {
    const middle = Math.floor(replicatedData.length / 2);
    return middle - (middle % testimonials.length);
  }, [replicatedData.length]);

  // 3. Reanimated Core Hooks
  const flatListRef = useAnimatedRef<Animated.FlatList<TestimonialData>>();
  const scrollIndex = useSharedValue(baseMiddleIndex);
  const isAutoPlaying = useSharedValue(false);
  const autoplayPulse = useSharedValue(0);

  // 4. Auto-play using useAnimatedReaction + withRepeat pattern (proven pattern)
  useAnimatedReaction(
    () => autoplayPulse.value,
    (currentPulse, prevPulse) => {
      if (!isFocused) {
        return;
      }
      if (prevPulse !== null && currentPulse < prevPulse && isAutoPlaying.value) {
        scrollIndex.value = scrollIndex.value + 1;
        scrollTo(flatListRef, scrollIndex.value * ITEM_SIZE, 0, true);
        runOnJS(setActiveDotIndex)(scrollIndex.value % testimonials.length);
      }
    },
    [isFocused]
  );

  // Start autoplay timer on component focus
  useEffect(() => {
    if (isFocused && replicatedData.length > 0) {
      // Set initial center position immediately
      const initTimer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: baseMiddleIndex, animated: false });
        scrollIndex.value = baseMiddleIndex;
        setActiveDotIndex(0);

        // Start UI Thread Autoplay with 4-second intervals
        runOnUI(() => {
          'worklet';
          isAutoPlaying.value = true;
          cancelAnimation(autoplayPulse);
          autoplayPulse.value = withRepeat(
            withTiming(1, { duration: 4000 }),
            -1,
            false
          );
        })();
      }, 300);

      return () => {
        clearTimeout(initTimer);
        runOnUI(() => {
          'worklet';
          isAutoPlaying.value = false;
          cancelAnimation(autoplayPulse);
        })();
      };
    } else {
      runOnUI(() => {
        'worklet';
        isAutoPlaying.value = false;
        cancelAnimation(autoplayPulse);
      })();
    }
  }, [isFocused, baseMiddleIndex, scrollIndex, flatListRef, autoplayPulse, isAutoPlaying, replicatedData.length]);

  // 5. Scroll Handler completely on the UI Thread
  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isAutoPlaying.value = false; // Pause on user interaction
      cancelAnimation(autoplayPulse);
    },
    onMomentumEnd: (event: any) => {
      const scrollOffset = event.contentOffset.x;
      let currentIndex = Math.round(scrollOffset / ITEM_SIZE);

      // Infinite Loop Snap-back correction
      if (currentIndex < 3 || currentIndex > replicatedData.length - 3) {
        const remainder = currentIndex % testimonials.length;
        currentIndex = baseMiddleIndex + remainder;
        scrollTo(flatListRef, currentIndex * ITEM_SIZE, 0, false);
      }

      scrollIndex.value = currentIndex;
      runOnJS(setActiveDotIndex)(currentIndex % testimonials.length);

      // Resume Autoplay
      isAutoPlaying.value = true;
      cancelAnimation(autoplayPulse);
      autoplayPulse.value = withRepeat(
        withTiming(1, { duration: 4000 }),
        -1,
        false
      );
    },
  });

  // ── Pause carousel during main feed scroll ──
  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling) => {
      if (!isFocused) {
        isAutoPlaying.value = false;
        cancelAnimation(autoplayPulse);
        return;
      }
      if (scrolling) {
        // User is scrolling main feed - pause carousel
        isAutoPlaying.value = false;
        cancelAnimation(autoplayPulse);
      } else {
        // Scroll ended - resume carousel if focused
        if (isFocused) {
          isAutoPlaying.value = true;
          cancelAnimation(autoplayPulse);
          autoplayPulse.value = withRepeat(
            withTiming(1, { duration: 4000 }),
            -1,
            false
          );
        }
      }
    },
    [isFocused]
  );

  const renderItem = useCallback(({ item }: { item: TestimonialData }) => (
    <TestimonialCard item={item} />
  ), []);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.headerText}>What Our Clients Say</Text>

      {/* 6. Animated.FlatList Replaces Standard FlatList */}
      <Animated.FlatList
        ref={flatListRef}
        data={replicatedData}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{ paddingHorizontal: Math.round((SCREEN_WIDTH - CARD_WIDTH) / 2) }}
        getItemLayout={getItemLayout}
        
        // UI Thread Scroll Interactions
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        
        // Optimizations
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
      />

      <View style={styles.paginationContainer}>
        {testimonials.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              activeDotIndex === index ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: 28,
    backgroundColor: "#f8fafc",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 22,
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: SPACING,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  defaultLogo: {
    width: 140,
    height: 52,
  },
  quoteText: {
    fontSize: 16.5,
    lineHeight: 24,
    color: "#475569",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 14,
  },
  companyName: {
    fontSize: 16, 
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#1d4ed8",
    width: 22,
  },
  inactiveDot: {
    backgroundColor: "#cbd5e1",
    width: 7,
  },
});