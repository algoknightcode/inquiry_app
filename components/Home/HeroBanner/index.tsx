import { Image } from "expo-image";
import React, { useState, useEffect, useRef } from "react";
import { Animated, Dimensions, View } from "react-native";

import HomeImage1 from "../../../assets/images/mob1.jpeg";
import HomeImage2 from "../../../assets/images/mob2.jpeg";

const { width } = Dimensions.get("window");

const HeroBanner = () => {
  const data = [HomeImage1, HomeImage2];
  const [activeIndex, setActiveIndex] = useState(0);

  // Animated values for each image's opacity
  const fadeAnims = useRef(data.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % data.length;

      // Smooth cross-fade transition using hardware-accelerated native driver
      Animated.parallel([
        Animated.timing(fadeAnims[activeIndex], {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnims[nextIndex], {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setActiveIndex(nextIndex);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <View className="h-[360px] w-full relative bg-slate-900">
      {data.map((img, index) => (
        <Animated.View
          key={index}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: width,
            height: 360,
            opacity: fadeAnims[index],
          }}
        >
          <Image
            source={img}
            style={{
              width: width,
              height: 360,
            }}
            contentFit="cover"
          />
        </Animated.View>
      ))}

      {/* Pagination Dots */}
      <View className="absolute bottom-4 left-0 right-0 flex-row justify-center items-center gap-x-2">
        {data.map((_, index) => (
          <View
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${
              activeIndex === index ? "bg-blue-600 w-6" : "bg-gray-300"
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default HeroBanner;