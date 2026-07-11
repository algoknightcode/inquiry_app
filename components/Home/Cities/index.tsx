import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from "react-native";
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
  const textFontSize = 15.5 * scale;
  const titleSize = 22 * scale;

  const handleCityPress = (cityName: string) => {
    router.push({
      pathname: "/Industries",
      params: { location: cityName },
    });
  };

  // Memoize styles that depend on scale — stops new objects being allocated in every .map() iteration
  const circleStyle = useMemo(() => ({
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
  }), [circleSize]);

  const imageStyle = useMemo(() => ({
    width: imageSize,
    height: imageSize,
  }), [imageSize]);

  const titleStyle = useMemo(() => ({ fontSize: titleSize }), [titleSize]);
  const labelStyle = useMemo(() => ({ fontSize: textFontSize }), [textFontSize]);
  const exactItemWidth = useMemo(() => (screenWidth - 32) * 0.235, [screenWidth]);

  return (
    <View style={cityStyles.wrapper}>
      <Text
        style={[cityStyles.title, titleStyle]}
      >
        Find Suppliers from Top Cities
      </Text>

      <View style={cityStyles.grid}>
        {citiesData.map((city) => (
          <Pressable
            key={city.id}
            onPress={() => handleCityPress(city.name)}
            style={[cityStyles.gridItem, { width: exactItemWidth }]}
            activeOpacity={0.75}
          >
            <View
              style={[cityStyles.circle, circleStyle]}
            >
              <Image
                source={city.source}
                style={imageStyle}
                contentFit="contain"
                transition={200}
              />
            </View>
            <Text
              style={[cityStyles.label, labelStyle]}
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

const cityStyles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, marginTop: 12 },
  title: { fontFamily: "PlusJakartaSans-ExtraBold", color: "#0f172a", letterSpacing: -0.5, marginBottom: 24, paddingHorizontal: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { alignItems: "center", marginBottom: 24 },
  circle: { backgroundColor: "#F4F6F9", borderWidth: 1, borderColor: "rgba(226,232,240,0.6)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  label: { color: "#1e293b", fontFamily: "PlusJakartaSans-SemiBold", textAlign: "center", letterSpacing: -0.3 },
});