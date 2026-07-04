import React, { useRef, useState, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useIsFocused } from "@react-navigation/native";

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

// ── Testimonial data ───────────────────────────────────────────────────────
const testimonials = [
  {
    id: "1",
    logo: client4,
    quote: "InquiryBazaar ne sirf listing nahi di, balki hume real business inquiries milna start hua. Leads ka quality genuinely better hai aur conversion bhi improve hua.",
    company: "Matrix Tissues",
  },
  {
    id: "2",
    logo: client2,
    quote: "Platform use karna simple hai aur results transparent hain. Hume clearly dikhta hai inquiries kahan se aa rahi hain. Highly Recommended.",
    company: "Bhagya Laxmi Industries",
  },
  {
    id: "3",
    logo: client3,
    quote: "InquiryBazaar ne humara time aur effort dono bachaya. Ab hume sirf relevant aur high-intent buyers se hi inquiries milti hain.",
    company: "Mr Dates",
  },
  {
    id: "4",
    logo: client1,
    quote: "Unki marketing approach alag hai — sirf listing nahi, actively promote karte hain. Isse humari brand visibility kaafi strong hui hai.",
    company: "Strides Design Studio",
  },
  {
    id: "5",
    logo: client5,
    quote: "Bahut achha platform hai B2B ke liye. Hum pehle se zyada inquiries receive kar rahe hain aur response time bhi improve hua.",
    company: "Verified Partner",
  },
  {
    id: "6",
    logo: client6,
    quote: "InquiryBazaar pe list hone ke baad hume genuine buyers mile. Platform ka interface clean hai aur support team bhi responsive hai.",
    company: "Verified Partner",
  },
];

// ── Optimised card — no Animated, no inline styles recreated on scroll ─────
const TestimonialCard = ({ item }: { item: typeof testimonials[0] }) => (
  <View
    style={{
      width: CARD_WIDTH,
      marginRight: SPACING,
      backgroundColor: "#fff",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      paddingHorizontal: 24,
      paddingVertical: 28,
      // Android shadow via elevation
      elevation: 3,
      // iOS shadow
      shadowColor: "#1e3a8a",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
    }}
  >
    {/* Company Logo */}
    <View style={{ alignItems: "center", marginBottom: 20 }}>
      <Image
        source={item.logo}
        style={{ width: 140, height: 52 }}
        contentFit="contain"
        transition={150}
      />
    </View>

    {/* Quote */}
    <Text
      style={{
        fontSize: 14.5,
        lineHeight: 24,
        color: "#475569",
        textAlign: "center",
        fontStyle: "italic",
        marginBottom: 18,
      }}
    >
      {`"${item.quote}"`}
    </Text>

    {/* Divider */}
    <View style={{ height: 1, backgroundColor: "#f1f5f9", marginBottom: 14 }} />

    {/* Company name */}
    <Text
      style={{
        fontSize: 14,
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "center",
        letterSpacing: 0.2,
      }}
    >
      {item.company}
    </Text>
  </View>
);

// Stable keyExtractor outside component to prevent re-creation
const keyExtractor = (item: typeof testimonials[0]) => item.id;

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

  const startAutoPlay = () => {
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
  };

  const stopAutoPlay = () => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (isFocused) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isFocused]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item }: { item: typeof testimonials[0] }) => (
    <TestimonialCard item={item} />
  );

  return (
    <View style={{ paddingVertical: 28, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <Text
        style={{
          fontSize: 26,
          fontWeight: "800",
          color: "#0f172a",
          textAlign: "center",
          letterSpacing: -0.5,
          marginBottom: 22,
          paddingHorizontal: 20,
        }}
      >
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
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 18 }}>
        {testimonials.map((_, index) => (
          <View
            key={index}
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: currentIndex === index ? "#1d4ed8" : "#cbd5e1",
              width: currentIndex === index ? 22 : 7,
              marginHorizontal: 3,
            }}
          />
        ))}
      </View>
    </View>
  );
}