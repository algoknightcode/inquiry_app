import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";

const citiesData = [
  {
    id: "1",
    name: "Noida",
    badge: "HOT MARKET",
    image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Delhi",
    badge: "PRIME",
    image: "https://images.unsplash.com/photo-1667849357658-16bfaec30885?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Mumbai",
    badge: "HOT MARKET",
    image: "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Bengaluru",
    badge: "PRIME",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=400&auto=format&fit=crop",
  },
];

export default function SellersByCityGrid() {
  const router = useRouter();

  return (
    // Outer padding keeps the entire section safely away from screen edges
    <View className="px-4 mt-8">
      
      {/* Header Section - Now matches the grid width perfectly */}
      <View className="flex-row justify-between items-end mb-4 px-1">
        <Text className="text-[22px] font-jakarta-extrabold text-slate-900 tracking-tight">
          Sellers by Cities
        </Text>
        <TouchableOpacity 
          activeOpacity={0.6} 
          className="pb-0.5"
          onPress={() => router.push("/AllCities")}
        >
          <Text className="text-indigo-600 font-jakarta-bold text-sm tracking-tight">
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2x2 Tall Grid Section */}
      <View className="flex-row flex-wrap justify-between">
        {citiesData.map((city) => (
          <Pressable
            key={city.id}
            className="w-[48%] h-56 rounded-[22px] overflow-hidden mb-4 active:scale-[0.97] active:opacity-90 transition-all bg-slate-200 relative"
          >
            
            {/* 1. Background Image */}
            <Image
              source={{ uri: city.image }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
              }}
              contentFit="cover"
              transition={200}
            />

            {/* 2. Top Badge */}
            {city.badge && (
              <View 
                style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}
                className="bg-black/60 px-2.5 py-1 rounded-full"
              >
                <Text className="text-white/90 text-[9px] font-jakarta-extrabold tracking-[0.1em] uppercase">
                  {city.badge}
                </Text>
              </View>
            )}

            {/* 3. Bottom Gradient & Text */}
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.95)"]}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '50%',
                justifyContent: 'flex-end',
                paddingHorizontal: 16,
                paddingBottom: 16,
                zIndex: 10,
              }}
            >
              <Text 
                className="text-white font-jakarta-bold text-[19px] tracking-tight"
                numberOfLines={1}
              >
                {city.name}
              </Text>
            </LinearGradient>

          </Pressable>
        ))}
      </View>

    </View>
  );
}