import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, runOnJS, SharedValue, useAnimatedReaction } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

type Industry = {
  _id: string;
  name: string;
};

const TREE_URL = "https://backend.inquirybazaar.com/api/industries/tree";

function getInitialCachedIndustries(): Industry[] {
  try {
    const json = getCacheSync(TREE_URL);
    if (json?.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn("Error reading CategoryMarquee cache:", err);
  }
  return [];
}

export default function CategoryMarquee({ isScrolling }: { isScrolling?: SharedValue<boolean> }) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const carouselRef = useRef<ICarouselInstance>(null);

  const [autoPlay, setAutoPlay] = useState(true);

  // Pause carousel autoplay while parent list is scrolling to save JS resources
  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling, previousValue) => {
      if (scrolling !== previousValue) {
        runOnJS(setAutoPlay)(!scrolling);
      }
    },
    [isScrolling]
  );

  const initialIndustries = getInitialCachedIndustries();
  const [industries, setIndustries] = useState<Industry[]>(initialIndustries);
  const [loading, setLoading] = useState(initialIndustries.length === 0);

  useEffect(() => {
    (async () => {
      try {
        const json = await fetchWithCache(TREE_URL);

        if (json?.success && json.data) {
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

    let k = 1;
    while ((k * industries.length) % columns !== 0) {
      k++;
    }

    const safeIndustries = [];
    for (let i = 0; i < k; i++) {
      safeIndustries.push(...industries);
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
          ref={carouselRef}
          loop={true}
          autoPlay={autoPlay}
          autoPlayInterval={2500}
          scrollAnimationDuration={800}
          data={chunkedIndustries}
          width={screenWidth}
          height={60}
          windowSize={5}
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