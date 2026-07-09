import { fetchWithCache } from "@/utils/apiCache";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeInDown, SharedValue, runOnJS, useAnimatedReaction } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";

type Industry = {
  _id: string;
  name: string;
};

export default function CategoryMarquee({ isScrolling }: { isScrolling?: SharedValue<boolean> }) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const [isParentScrolling, setIsParentScrolling] = useState(false);

  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling, previousValue) => {
      // 🔥 FIX: Only cross the JS bridge if the scrolling state changes!
      if (scrolling !== previousValue) {
        runOnJS(setIsParentScrolling)(scrolling);
      }
    },
    [isScrolling]
  );

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const json = await fetchWithCache(
          "https://backend.inquirybazaar.com/api/industries/tree"
        );

        if (json?.success) {
          setIndustries(json.data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const columns = screenWidth >= 768 ? 4 : 2;

  const chunkedIndustries = useMemo(() => {
    if (!industries || industries.length === 0) return [];

    let safeIndustries = [...industries];

    // THE FIX: While the total number of items is NOT perfectly divisible by our columns,
    // duplicate the entire sequence. This completely eliminates blank spaces 
    // and guarantees the infinite loop never stutters or repeats items weirdly.
    while (safeIndustries.length % columns !== 0) {
      safeIndustries = [...safeIndustries, ...industries];
    }

    const chunks = [];
    for (let i = 0; i < safeIndustries.length; i += columns) {
      chunks.push(safeIndustries.slice(i, i + columns));
    }
    return chunks;
  }, [industries, columns]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#1e3a8a" />
      </View>
    );
  }

  if (industries.length === 0) return null;

  const exactItemWidth = screenWidth / columns;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <Carousel
          loop={true}
          autoPlay={!isParentScrolling}
          autoPlayInterval={2500}
          scrollAnimationDuration={800}
          data={chunkedIndustries}
          width={screenWidth}
          height={60}
          windowSize={11}
          onConfigurePanGesture={(gesture) => {
            "worklet";
            gesture.activeOffsetX([-10, 10]);
          }}

          // Added chunkIndex to generate completely unique React keys
          renderItem={({ item: chunk, index: chunkIndex }) => (
            <View style={styles.slideRow}>
              {chunk.map((industry, itemIndex) => (
                <View
                  // Unique key ensures no React warnings since we might have duplicated the data
                  key={`chunk-${chunkIndex}-item-${itemIndex}`}
                  style={[styles.pillContainer, { width: exactItemWidth }]}
                >
                  <Pressable
                    style={styles.pill}
                    onPress={() =>
                      router.push({
                        pathname: "/GrId_MainCategory",
                        params: {
                          id: industry._id,
                          name: industry.name,
                        },
                      })
                    }
                  >
                    <Text
                      style={styles.pillText}
                      numberOfLines={1}
                    >
                      {industry.name}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    overflow: "hidden",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  loader: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  slideRow: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  pillContainer: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  pill: {
    backgroundColor: "#1e3a8a",
    width: "100%",
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  pillText: {
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.3,
    fontSize: 13,
    textAlign: "center",
    width: "100%",
  },
});