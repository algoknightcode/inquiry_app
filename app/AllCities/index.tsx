import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// High-quality mock data for the grid
const citiesData = [
  {
    id: "1",
    name: "Agra",
    badge: "METRO",
    homes: "40+ homes",
    image: "https://images.unsplash.com/photo-1564507592208-528f1e680a64?q=80&w=400&auto=format&fit=crop", // Taj Mahal
  },
  {
    id: "2",
    name: "Bangalore",
    badge: "PRIME",
    homes: "51+ homes",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=400&auto=format&fit=crop", // Vidhana Soudha
  },
  {
    id: "3",
    name: "Bareilly",
    badge: "HERITAGE",
    homes: "12+ homes",
    image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?q=80&w=400&auto=format&fit=crop", // Cityscape
  },
  {
    id: "4",
    name: "Chandigarh",
    badge: "GROWING",
    homes: "89+ homes",
    image: "https://images.unsplash.com/photo-1587474260580-58f40452c4c2?q=80&w=400&auto=format&fit=crop", // Urban landscape
  },
  {
    id: "5",
    name: "Mumbai",
    badge: "HOT MARKET",
    homes: "120+ homes",
    image: "https://images.unsplash.com/photo-1522244243640-5e5894178602?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "6",
    name: "Noida",
    badge: "GROWING",
    homes: "65+ homes",
    image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=400&auto=format&fit=crop",
  }
];

export default function DiscoverCitiesPage() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* ========================================== */}
        {/* TOP HERO CARD SECTION (Light Theme)       */}
        {/* ========================================== */}
        <View className="mx-4 mt-2 bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm shadow-slate-200">
          
          {/* Live Coverage Badge */}
          <View className="self-start flex-row items-center border border-indigo-100 bg-indigo-50 px-3 py-1.5 rounded-full mb-5">
            <Ionicons name="pulse" size={14} color="#4f46e5" />
            <Text className="text-indigo-600 font-jakarta-extrabold text-[10px] tracking-[0.15em] ml-1.5 uppercase">
              Live Coverage
            </Text>
          </View>

          {/* Heading & Subtitle */}
          <Text className="text-slate-950 text-3xl font-jakarta-extrabold tracking-tight mb-2">
            Discover by city
          </Text>
          <Text className="text-slate-500 font-jakarta-medium text-[15px] leading-snug mb-8">
            Hand-picked growth corridors and high-demand pockets — your next home starts where the market is strongest.
          </Text>

          {/* 3 Stats Boxes */}
          <View className="flex-row justify-between">
            {/* Stat 1 */}
            <View className="bg-slate-50 border border-slate-100 rounded-[20px] w-[31%] py-4 items-center">
              <MaterialCommunityIcons name="map-marker-multiple" size={22} color="#4f46e5" className="mb-2" />
              <Text className="text-slate-900 font-jakarta-extrabold text-lg mt-1">30</Text>
              <Text className="text-slate-400 font-jakarta-bold text-[9px] tracking-widest uppercase mt-0.5">Cities</Text>
            </View>

            {/* Stat 2 */}
            <View className="bg-slate-50 border border-slate-100 rounded-[20px] w-[31%] py-4 items-center">
              <Ionicons name="home" size={20} color="#4f46e5" className="mb-2" />
              <Text className="text-slate-900 font-jakarta-extrabold text-lg mt-1">2.4k+</Text>
              <Text className="text-slate-400 font-jakarta-bold text-[9px] tracking-widest uppercase mt-0.5">Listings</Text>
            </View>

            {/* Stat 3 */}
            <View className="bg-slate-50 border border-slate-100 rounded-[20px] w-[31%] py-4 items-center">
              <Ionicons name="globe-outline" size={22} color="#4f46e5" className="mb-2" />
              <Text className="text-slate-900 font-jakarta-extrabold text-lg mt-1">All</Text>
              <Text className="text-slate-400 font-jakarta-bold text-[9px] tracking-widest uppercase mt-0.5">India</Text>
            </View>
          </View>
        </View>


        {/* ========================================== */}
        {/* BOTTOM CITY GRID SECTION                   */}
        {/* ========================================== */}
        <View className="px-4 mt-6 flex-row flex-wrap justify-between">
          {citiesData.map((city) => (
            <Pressable
              key={city.id}
              className="w-[48%] h-64 rounded-[28px] overflow-hidden mb-4 active:scale-[0.97] active:opacity-90 transition-all bg-slate-200 relative shadow-sm shadow-slate-300"
            >
              
              {/* 1. Background Image - Explicitly pinned to prevent layout breaks */}
              <Image
                source={{ uri: city.image }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  width: '100%', height: '100%',
                  zIndex: 0,
                }}
                contentFit="cover"
                transition={300}
              />

              {/* 2. Top Badge - Frosted Glass effect */}
              {city.badge && (
                <View 
                  style={{ position: 'absolute', top: 14, left: 14, zIndex: 10 }}
                  // Using black/40 to create that slightly dark frosted glass look from your image
                  className="bg-black/40 px-3 py-1.5 rounded-full" 
                >
                  <Text className="text-white/95 text-[9px] font-jakarta-extrabold tracking-[0.15em] uppercase">
                    {city.badge}
                  </Text>
                </View>
              )}

              {/* 3. Bottom Gradient, City Name & Homes Count */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)", "rgba(0,0,0,0.95)"]}
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '55%',
                  justifyContent: 'flex-end',
                  paddingHorizontal: 16,
                  paddingBottom: 16,
                  zIndex: 10,
                }}
              >
                {/* City Name */}
                <Text 
                  className="text-white font-jakarta-extrabold text-[20px] tracking-tight mb-1"
                  numberOfLines={1}
                >
                  {city.name}
                </Text>

                {/* Listing Count Row */}
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="office-building-outline" size={12} color="#cbd5e1" />
                  <Text className="text-slate-300 font-jakarta-semibold text-[11px] ml-1.5">
                    {city.homes}
                  </Text>
                </View>

              </LinearGradient>

            </Pressable>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}