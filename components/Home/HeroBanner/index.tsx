import { Image } from "expo-image";
import React from "react";
import { Dimensions, View } from "react-native";
import Swiper from "react-native-swiper";

import HomeImage1 from "../../../assets/images/mob1.jpeg";
import HomeImage2 from "../../../assets/images/mob2.jpeg";

const { width } = Dimensions.get("window");

const HeroBanner = () => {
  return (
    <View className={styles.outer}>
      <Swiper
        height={360}
        autoplay
        loop
        autoplayTimeout={4}
        dotColor="#D1D5DB"
        activeDotColor="#2563EB"
      >
        <View className={styles.slide}>
          <Image
            source={HomeImage1}
            style={{
              width: width,
              height: 360,
            }}
            contentFit="cover"
          />
        </View>

        <View className={styles.slide}>
          <Image
            source={HomeImage2}
            style={{
              width: width,
              height: 360,
            }}
            contentFit="cover"
          />
        </View>
      </Swiper>
    </View>
  );
};

export default HeroBanner;

const styles = {
  outer: "h-[360px] w-full",
  slide: "flex-1",
};