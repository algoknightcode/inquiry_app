import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

// ── Interface definition ───────────────────────────────────────────────────
// Added optional properties to control individual logo and text sizes
export interface TestimonialData {
  id: string;
  logo: any;
  quote: string;
  company: string;
  logoWidth?: number;       // Interface to increase/decrease individual logo width
  logoHeight?: number;      // Interface to increase/decrease individual logo height
  companyFontSize?: number; // Interface to increase individual company name text size
}

// ── Testimonial data ───────────────────────────────────────────────────────
const testimonials: TestimonialData[] = [
  {
    id: "1",
    logo: client4,
    quote: "Platform use karna simple hai aur results transparent hain. Hume clearly dikhta hai inquiries kahan se aa rahi hain. Highly Recommended.",
    company: "Bhagya Laxmi Industries",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 16,
  },
  {
    id: "2",
    logo: client2,
    quote: "Pehle hum multiple platforms use kar rahe the but results clear nahi the. Yahan hume proper visibility aur genuine buyers mile — exactly what we needed.",
    company: "Exotic Crate",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 16,
  },
  {
    id: "3",
    logo: client3,
    quote: "InquiryBazaar ka biggest advantage hai targeted inquiries. Random calls band ho gaye aur sirf serious buyers hi connect karte hain.",
    company: "Shree Shakti Infratech",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 16,
  },
  {
    id: "4",
    logo: client1,
    quote: "InquiryBazaar ne sirf listing nahi di, balki hume real business inquiries milna start hua. Leads ka quality genuinely better hai aur conversion bhi improve hua",
    company: "Matrix Tissues",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 16,
  },
  {
    id: "5",
    logo: client5,
    quote: "Unki marketing approach alag hai — sirf listing nahi, actively promote karte hain. Isse humari brand visibility kaafi strong hui hai",
    company: "Strides Design Studio",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 16,
  },
  {
    id: "6",
    logo: client6,
    quote: "InquiryBazaar ne humara time aur effort dono bachaya. Ab hume sirf relevant aur high-intent buyers se hi inquiries milti hain.",
    company: "Mr Dates",
    logoWidth: 160, 
    logoHeight: 60,
    companyFontSize: 16,
  },
];

// ── Optimised card with React.memo to prevent unnecessary re-renders ───────
const TestimonialCard = React.memo(({ item }: { item: TestimonialData }) => (
  <View style={styles.cardContainer}>
    {/* Company Logo */}
    <View style={styles.logoContainer}>
      <Image
        source={item.logo}
        style={[
          styles.defaultLogo,
          // Apply custom individual overrides if they exist in the data
          item.logoWidth ? { width: item.logoWidth } : undefined,
          item.logoHeight ? { height: item.logoHeight } : undefined,
        ]}
        contentFit="contain"
        transition={150}
      />
    </View>

    {/* Quote */}
    <Text style={styles.quoteText}>
      {`"${item.quote}"`}
    </Text>

    {/* Divider */}
    <View style={styles.divider} />

    {/* Company name */}
    <Text
      style={[
        styles.companyName,
        // Apply custom individual override for the company font size
        item.companyFontSize ? { fontSize: item.companyFontSize } : undefined,
      ]}
    >
      {item.company}
    </Text>
  </View>
));

// Stable keyExtractor outside component to prevent re-creation
const keyExtractor = (item: TestimonialData) => item.id;

// Stable getItemLayout for Android fast scroll calculations
const getItemLayout = (_: any, index: number) => ({
  length: ITEM_SIZE,
  offset: ITEM_SIZE * index,
  index,
});

// ── Main Component ─────────────────────────────────────────────────────────
export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isFocused = useIsFocused();
  const timeoutRef = useRef<any>(null);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    timeoutRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        let nextIndex = prevIndex + 1;
        if (nextIndex >= testimonials.length) {
          nextIndex = 0;
        }
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 4000);
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isFocused, startAutoPlay, stopAutoPlay]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // Stable render item
  const renderItem = useCallback(({ item }: { item: TestimonialData }) => (
    <TestimonialCard item={item} />
  ), []);

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <Text style={styles.headerText}>
        What Our Clients Say
      </Text>

      {/* Cards */}
      <FlatList
        ref={flatListRef}
        data={testimonials}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{ paddingHorizontal: Math.round((SCREEN_WIDTH - CARD_WIDTH) / 2) }}
        getItemLayout={getItemLayout}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
      />

      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {testimonials.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
// Using StyleSheet improves scroll performance over inline styles
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
    elevation: 3,
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
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
    fontSize: 14.5,
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
    fontSize: 14, // Default fallback size
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