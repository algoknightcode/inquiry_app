import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { runOnJS, SharedValue, useAnimatedReaction } from "react-native-reanimated";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const API_URL = "https://backend.inquirybazaar.com/api/industries";

type Industry = {
  _id: string;
  name: string;
};

function getInitialCachedIndustries(): Industry[] {
  try {
    const json = getCacheSync(API_URL);
    if (json?.success && Array.isArray(json.data)) {
      return json.data;
    } else if (Array.isArray(json)) {
      return json;
    }
  } catch (err) {
    console.warn("Error reading CategoryMarquee cache:", err);
  }
  return [];
}

interface CategoryPillProps {
  id: string;
  name: string;
  onPress: (id: string, name: string) => void;
  width: number;
}

// Memoized sub-component to eliminate anonymous function allocations on every render
const CategoryPill = React.memo(({ id, name, onPress, width }: CategoryPillProps) => {
  const handlePress = useCallback(() => {
    onPress(id, name);
  }, [id, name, onPress]);

  return (
    <View style={[styles.pillContainer, { width }]}>
      <Pressable style={styles.pill} onPress={handlePress}>
        <Text style={styles.pillText} numberOfLines={1}>
          {name}
        </Text>
      </Pressable>
    </View>
  );
});

export default function CategoryMarquee({ isScrolling }: { isScrolling?: SharedValue<boolean> } = {}) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const carouselRef = useRef<ICarouselInstance>(null);

  const initialIndustries = getInitialCachedIndustries();
  const [industries, setIndustries] = useState<Industry[]>(initialIndustries);
  const [loading, setLoading] = useState(initialIndustries.length === 0);
  const [isScrollPaused, setIsScrollPaused] = useState(false);

  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling, previousScrolling) => {
      if (scrolling !== previousScrolling) {
        runOnJS(setIsScrollPaused)(scrolling);
      }
    },
    [isScrolling]
  );

  useEffect(() => {
    (async () => {
      try {
        const json = await fetchWithCache(API_URL);

        if (json?.success && Array.isArray(json.data)) {
          setIndustries(json.data);
        } else if (Array.isArray(json)) {
          setIndustries(json);
        }
      } catch (err) {
        console.error("CategoryMarquee fetch error:", err);
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

  const handlePillPress = useCallback((id: string, name: string) => {
    router.push({
      pathname: "/GrId_MainCategory",
      params: { id, name },
    });
  }, [router]);

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
      <Carousel
        ref={carouselRef}
        loop={true}
        autoPlay={!isScrollPaused}
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

        // Renders using the memoized CategoryPill component
        renderItem={({ item: chunk, index: chunkIndex }) => (
          <View style={styles.slideRow}>
            {chunk.map((industry, itemIndex) => (
              <CategoryPill
                key={`chunk-${chunkIndex}-item-${itemIndex}`}
                id={industry._id}
                name={industry.name}
                onPress={handlePillPress}
                width={exactItemWidth}
              />
            ))}
          </View>
        )}
      />
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
  pillPressed: {
    opacity: 0.8,
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