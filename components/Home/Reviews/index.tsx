import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    Text,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Rounded to prevent fractional pixel rendering glitches
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.82); 
const SPACING = 20;
const ITEM_SIZE = CARD_WIDTH + SPACING;

// --- EXPANDED MOCK DATA ---
const testimonials = [
  {
    id: "1",
    name: "Mr. Harsh Bhargava",
    company: "COOLDECK INDUSTRIES",
    avatar: "https://i.pravatar.cc/150?img=11",
    rating: 5,
    text: "We have been working with Tradeindia for the past 4 years. Tradeindia has helped us launch our digital platform. There is always interaction from their side which is highly appreciated. Their services are truly excellent.",
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    company: "NEXUS TECH SOLUTIONS",
    avatar: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    text: "The integration process was seamless. We saw a 40% increase in lead generation within the first quarter alone.though I'd love to see a few more advanced filtering options in the future",
  },
  {
    id: "3",
    name: "Amit Patel",
    company: "PATEL LOGISTICS LTD",
    avatar: "https://i.pravatar.cc/150?img=8",
    rating: 4,
    text: "A very reliable platform for B2B networking. It has significantly reduced our procurement time. The interface is clean, though I'd love to see a few more advanced filtering options in the future updates.",
  }
];

const typography = {
  // Using lighter weights for the new header design
  light: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light', fontWeight: '300' as const },
  regular: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '400' as const },
  medium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '500' as const },
  bold: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '700' as const },
};

export default function TestimonialCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // --- ENTRANCE ANIMATION VALUES ---
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Triggers a smooth spring animation when the screen loads
    Animated.spring(mountAnim, {
      toValue: 1,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderItem = ({ item, index }: { item: typeof testimonials[0], index: number }) => {
    const inputRange = [
      (index - 1) * ITEM_SIZE,
      index * ITEM_SIZE,
      (index + 1) * ITEM_SIZE,
    ];

    // Swipe animations
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: "clamp",
    });

    // 3D Tilt rotation as cards are swiped
    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ["8deg", "0deg", "-8deg"],
      extrapolate: "clamp",
    });

    // Parallax card vertical offset
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [15, 0, 15],
      extrapolate: "clamp",
    });

    // Dynamic avatar float & scale
    const avatarScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1.1, 0.85],
      extrapolate: "clamp",
    });

    const avatarTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [10, 0, 10],
      extrapolate: "clamp",
    });

    return (
      <View style={{ width: ITEM_SIZE, alignItems: "center" }} className="pt-14 pb-4">
        <Animated.View 
          style={{
            width: CARD_WIDTH,
            transform: [
              { perspective: 1000 },
              { scale },
              { rotateY },
              { translateY }
            ],
            opacity,
            shadowColor: "#1e3a8a", // Dark Blue
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 8,
          }}
          className="bg-white rounded-[32px] px-6 pb-8 pt-14 relative border border-slate-100"
        >
          {/* Overlapping Avatar */}
          <Animated.View 
            style={{
              transform: [
                { scale: avatarScale },
                { translateY: avatarTranslateY }
              ]
            }}
            className="absolute -top-10 left-0 right-0 items-center z-10"
          >
            <View className="bg-slate-50 p-1.5 rounded-full shadow-md">
              <Image 
                source={{ uri: item.avatar }} 
                className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white"
                resizeMode="cover"
              />
            </View>
          </Animated.View>
 
          {/* Card Content */}
          <View className="items-center mt-2">
            <Text style={typography.bold} className="text-xl text-slate-900 mb-1 tracking-tight text-center">
              {item.name}
            </Text>
            <Text style={typography.medium} className="text-[11px] text-slate-400 tracking-widest uppercase mb-4 text-center">
              {item.company}
            </Text>

            {/* Stars */}
            <View className="flex-row items-center mb-5">
              {[...Array(5)].map((_, i) => (
                <FontAwesome 
                  key={i} 
                  name="star" 
                  size={16} 
                  color={i < item.rating ? "#fbbf24" : "#f1f5f9"} 
                  style={{ marginHorizontal: 3 }}
                />
              ))}
            </View>

            {/* Quote */}
            <View className="relative w-full px-2 mb-6">
              <View className="absolute -top-2 -left-2 opacity-10">
                <MaterialCommunityIcons name="format-quote-open" size={36} color="#1e3a8a" />
              </View>

              <Text 
                style={typography.regular} 
                className="text-slate-600 text-[14.5px] leading-[24px] text-center z-10"
              >
                {item.text}
              </Text>

              <View className="absolute -bottom-4 -right-2 opacity-10">
                <MaterialCommunityIcons name="format-quote-close" size={36} color="#1e3a8a" />
              </View>
            </View>

            {/* Pagination Indicators Inside Card */}
            <View className="flex-row justify-center items-center">
              {testimonials.map((_, dotIndex) => {
                const dotInputRange = [
                  (dotIndex - 1) * ITEM_SIZE,
                  dotIndex * ITEM_SIZE,
                  (dotIndex + 1) * ITEM_SIZE,
                ];

                const dotWidth = scrollX.interpolate({
                  inputRange: dotInputRange,
                  outputRange: [8, 24, 8],
                  extrapolate: "clamp",
                });

                const dotOpacity = scrollX.interpolate({
                  inputRange: dotInputRange,
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: "clamp",
                });

                return (
                  <Animated.View 
                    key={dotIndex}
                    style={{
                      width: dotWidth,
                      opacity: dotOpacity,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: "#1e3a8a", // Dark Blue
                      marginHorizontal: 4,
                    }}
                  />
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center">
      <View className="py-6 w-full">
        
        {/* Animated Header Section (Thin text, no subheader) */}
        <Animated.View 
          className="mb-2 items-center px-6"
          style={{
            opacity: mountAnim,
            transform: [{
              translateY: mountAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0] // Slides up gracefully
              })
            }]
          }}
        >
          <Text 
            style={typography.light} 
            className="text-2xl text-slate-800 text-center tracking-[2px] uppercase"
          >
            What Our Customers Say
          </Text>
        </Animated.View>

        {/* Animated Carousel Section */}
        <Animated.View
          style={{
            opacity: mountAnim,
            transform: [{
              translateY: mountAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [40, 0] // Slides up slightly delayed from the header
              })
            }]
          }}
        >
          <Animated.FlatList
            data={testimonials}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            // CRITICAL FIX FOR CENTERING: 
            // Setting snapToAlignment to "start" perfectly pairs with the padding calculation below
            snapToInterval={ITEM_SIZE}
            snapToAlignment="start" 
            decelerationRate="fast"
            disableIntervalMomentum={true}
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: (SCREEN_WIDTH - ITEM_SIZE) / 2,
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false } 
            )}
            scrollEventThrottle={16}
          />
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}