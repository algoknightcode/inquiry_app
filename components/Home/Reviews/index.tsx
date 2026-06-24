import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
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
    text: "The integration process was seamless. We saw a 40% increase in lead generation within the first quarter alone. though I'd love to see a few more advanced filtering options in the future.",
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
  light: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light', fontWeight: '300' as const },
  regular: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '400' as const },
  medium: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium', fontWeight: '500' as const },
  bold: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '700' as const },
};

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // --- AUTO-SWIPE LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= testimonials.length) {
        nextIndex = 0; // Loop back to the start
      }
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      
    }, 3500); // Swipes every 3.5 seconds

    return () => clearInterval(timer);
  }, [currentIndex]);

  // Sync index when the user manually swipes
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  // Required for safe and fast scrollToIndex calculations on Android
  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_SIZE,
    offset: ITEM_SIZE * index,
    index,
  });

  const renderItem = ({ item }: { item: typeof testimonials[0] }) => {
    return (
      <View style={{ width: ITEM_SIZE, alignItems: "center" }} className="pt-14 pb-4">
        <View 
          style={{
            width: CARD_WIDTH,
            shadowColor: "#1e3a8a",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
            elevation: 5, // Android shadow
          }}
          className="bg-white rounded-[32px] px-6 pb-8 pt-14 relative border border-slate-100"
        >
          {/* Overlapping Avatar */}
          <View className="absolute -top-10 left-0 right-0 items-center z-10">
            <View className="bg-slate-50 p-1.5 rounded-full shadow-sm elevation-2">
              <Image 
                source={{ uri: item.avatar }} 
                className="w-20 h-20 rounded-full bg-slate-200 border-2 border-white"
                resizeMode="cover"
              />
            </View>
          </View>
 
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
            <View className="relative w-full px-2">
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
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center">
      <View className="py-6 w-full">
        
        {/* Static Header Section */}
        <View className="mb-2 items-center px-6">
          <Text 
            style={typography.light} 
            className="text-2xl text-slate-800 text-center tracking-[2px] uppercase"
          >
            What Our Customers Say
          </Text>
        </View>

        {/* Optimized FlatList Section */}
        <View>
          <FlatList
            ref={flatListRef}
            data={testimonials}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_SIZE}
            snapToAlignment="start" 
            decelerationRate="fast"
            bounces={false}
            contentContainerStyle={{
              paddingHorizontal: (SCREEN_WIDTH - ITEM_SIZE) / 2,
            }}
            
            // --- ANDROID PERFORMANCE OPTIMIZATIONS ---
            getItemLayout={getItemLayout}
            removeClippedSubviews={true} // Unmounts off-screen cards
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3} // Prevents rendering too far ahead
            
            // --- STATE SYNC LOGIC ---
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
          />
        </View>

        {/* Global Pagination Indicators */}
        <View className="flex-row justify-center items-center mt-2">
          {testimonials.map((_, index) => (
            <View 
              key={index}
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: currentIndex === index ? "#1e3a8a" : "#cbd5e1",
                width: currentIndex === index ? 24 : 8,
                marginHorizontal: 4,
              }}
            />
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
}