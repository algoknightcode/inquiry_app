import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

type City = {
  id: string;
  name: string;
  source: any;
};

const citiesData: City[] = [
  {
    id: "1",
    name: "Delhi",
    source: require("../../../assets/images/cities/delhi.webp"),
  },
  {
    id: "2",
    name: "Bengaluru",
    source: require("../../../assets/images/cities/bengaluru.webp"),
  },
  {
    id: "3",
    name: "Chennai",
    source: require("../../../assets/images/cities/chennai.webp"),
  },
  {
    id: "4",
    name: "Mumbai",
    source: require("../../../assets/images/cities/mumbai.webp"),
  },
  {
    id: "5",
    name: "Ahmedabad",
    source: require("../../../assets/images/cities/Ahmedabad.webp"),
  },
  {
    id: "6",
    name: "Kolkata",
    source: require("../../../assets/images/cities/Kolkata.webp"),
  },
  {
    id: "7",
    name: "Pune",
    source: require("../../../assets/images/cities/pune.webp"),
  },
  {
    id: "8",
    name: "Surat",
    source: require("../../../assets/images/cities/surat.webp"),
  },
];

export default function SellersByCityGrid() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  // Compute responsive layout sizes
  const isTablet = screenWidth >= 768;
  const scale = isTablet ? 1.25 : Math.max(0.85, Math.min(1.15, screenWidth / 375));

  const circleSize = 72 * scale;
  const imageSize = 42 * scale; // Slightly scaled for transparency layout
  const textFontSize = 13.5 * scale;
  const titleSize = 22 * scale;

  const handleCityPress = (cityName: string) => {
    router.push({
      pathname: "/Industries",
      params: { location: cityName },
    });
  };

  return (
    <View className="px-4 mt-8">
      {/* Title */}
      <Text
        style={{ fontSize: titleSize }}
        className="font-jakarta-extrabold text-slate-900 tracking-tight mb-6 px-1"
      >
        Find Suppliers from Top Cities
      </Text>

      {/* Grid container with 4 columns per row */}
      <View className="flex-row flex-wrap justify-between">
        {citiesData.map((city) => (
          <Pressable
            key={city.id}
            onPress={() => handleCityPress(city.name)}
            style={{ width: "23.5%" }}
            className="items-center mb-6 active:scale-95 transition-all"
          >
            {/* Circle backdrop containing the local monument image */}
            <View
              style={{
                width: circleSize,
                height: circleSize,
                borderRadius: circleSize / 2,
              }}
              className="bg-[#F4F6F9] border border-slate-200/60 items-center justify-center mb-2 shadow-xs shadow-slate-100"
            >
              <Image
                source={city.source}
                style={{
                  width: imageSize,
                  height: imageSize,
                }}
                contentFit="contain"
                transition={200}
              />
            </View>

            {/* City Label */}
            <Text
              style={{ fontSize: textFontSize }}
              className="text-slate-800 font-jakarta-semibold text-center tracking-tight"
              numberOfLines={1}
            >
              {city.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}