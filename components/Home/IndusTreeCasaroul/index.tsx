import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedReaction,
    useAnimatedRef,
    useAnimatedStyle,
    useSharedValue
} from "react-native-reanimated";


const { width: screenWidth } = Dimensions.get("window");

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface SubCategory { _id: string; name: string; slug: string; imageUrl?: string; }
interface Category { _id: string; name: string; slug: string; imageUrl?: string; subCategories?: SubCategory[]; }
interface Industry { _id: string; name: string; slug: string; imageUrl?: string; categories?: Category[]; }
interface ApiResponse { success: boolean; data: Industry[]; }

// ------------------------------------------------------------------
// Memoized Slide Component
// ------------------------------------------------------------------
const IndustrySlide = React.memo(({ 
  item, 
  onIndustryPress, 
  onCategoryPress, 
  onSubCategoryPress 
}: { 
  item: Industry;
  onIndustryPress: (item: Industry) => void;
  onCategoryPress: (cat: Category, industryId: string) => void;
  onSubCategoryPress: (sub: SubCategory) => void;
}) => {
  const cats = item.categories?.slice(0, 4) ?? [];
  const renderIndices = [0, 1, 2]; 

  return (
    <View style={s.slide}>
      <Pressable onPress={() => onIndustryPress(item)}>
        <Text style={s.industryName} numberOfLines={1}>{item.name}</Text>
      </Pressable>

      <Pressable style={s.heroWrap} onPress={() => onIndustryPress(item)}>
        <Image
          source={{ uri: item.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={0} 
          cachePolicy="memory-disk"
        />
      </Pressable>

      <View style={s.grid}>
        {cats.map((cat) => (
          <Pressable 
            key={cat._id} 
            style={s.catCard}
            onPress={() => onCategoryPress(cat, item._id)}
          >
            <View style={s.catHeader}>
              <View style={s.catThumb}>
                <Image
                  source={{ uri: cat.imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={0} 
                  cachePolicy="memory-disk"
                />
              </View>
              <Text style={s.catName} numberOfLines={2} ellipsizeMode="tail">
                {cat.name}
              </Text>
            </View>
            <View style={s.divider} />
            <View style={s.subList}>
              {[0, 1, 2].map((i) => {
                const sub = cat.subCategories?.[i];
                if (!sub) {
                  return <View key={i} style={{ height: 17 }} />;
                }
                return (
                  <Pressable 
                    key={sub._id} 
                    style={s.subRow}
                    onPress={() => onSubCategoryPress(sub)}
                  >
                    <View style={s.dot} />
                    <Text style={s.subName} numberOfLines={1} ellipsizeMode="tail">
                      {sub.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

// ------------------------------------------------------------------
// UI Thread Pagination Dot Component
// ------------------------------------------------------------------
const PaginationDot = React.memo(({ index, scrollX }: { index: number, scrollX: SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth];
    const dotWidth = interpolate(scrollX.value, inputRange, [6, 12, 6], Extrapolation.CLAMP);
    return { width: dotWidth };
  });

  return <Animated.View style={[s.dotIndicator, animatedStyle]} />;
});

// ------------------------------------------------------------------
// Cache helpers
// ------------------------------------------------------------------
const TREE_URL = "https://backend.inquirybazaar.com/api/industries/tree";

function getInitialData(): Industry[] {
  try {
    const cached: ApiResponse | null = getCacheSync(TREE_URL);
    if (cached?.success && cached.data) {
      return cached.data.filter((i) => (i.categories?.length ?? 0) >= 4);
    }
  } catch (_) {}
  return [];
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
export default function IndustryTreeCarousel({ 
  scrollY,
  isScrolling,
}: { 
  scrollY?: SharedValue<number>;
  isScrolling?: SharedValue<boolean>;
}) {
  const router = useRouter();
  
  const containerRef = useRef<View>(null);
  const isMeasuredRef = useRef(false);
  const { height: screenHeight } = useWindowDimensions();
  const [absoluteY, setAbsoluteY] = useState(0);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const initialData = getInitialData();
  const [data, setData] = useState<Industry[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0); // skip loader if cache hit
  const [error, setError] = useState<string | null>(null);
  
  const isFocused = useIsFocused();
  const flatRef = useAnimatedRef<Animated.FlatList<Industry>>();
  const scrollX = useSharedValue(0);
  const scrollIndex = useSharedValue(0);
  const isAutoPlaying = useSharedValue(false);
  const autoplayPulse = useSharedValue(0);

  useEffect(() => {
    if (!hasBeenVisible) return;
    (async () => {
      try {
        const json: ApiResponse = await fetchWithCache(TREE_URL);
        if (json.success && json.data) {
          const filtered = json.data.filter((i) => (i.categories?.length ?? 0) >= 4);
          setData((prev) => {
            if (prev.length === filtered.length && prev[0]?._id === filtered[0]?._id) return prev;
            return filtered;
          });
        }
      } catch (e: any) {
        if (data.length === 0) setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [hasBeenVisible]);

  // Autoplay timer ref
  const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAutoPlay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (data.length <= 1) return;

    autoplayTimerRef.current = setInterval(() => {
      if (!isFocused || !hasBeenVisible) {
        return;
      }

      scrollIndex.value = (scrollIndex.value + 1) % data.length;
      
      flatRef.current?.scrollToIndex({
        index: scrollIndex.value,
        animated: true,
      });
    }, 4000);
  }, [isFocused, hasBeenVisible, data.length, stopAutoPlay, screenWidth]);

  // Pause autoplay while the main home feed is being scrolled, resume once it settles
  useAnimatedReaction(
    () => isScrolling?.value ?? false,
    (scrolling, previousScrolling) => {
      if (scrolling === previousScrolling) return;
      if (scrolling) {
        runOnJS(stopAutoPlay)();
      } else {
        runOnJS(startAutoPlay)();
      }
    },
    [isScrolling]
  );

  useEffect(() => {
    if (!hasBeenVisible || data.length <= 1) return;

    if (isFocused) {
      scrollIndex.value = 0;
      const initTimer = setTimeout(() => {
        flatRef.current?.scrollToIndex({ index: 0, animated: false });
        startAutoPlay();
      }, 4000);

      return () => {
        clearTimeout(initTimer);
        stopAutoPlay();
      };
    } else {
      stopAutoPlay();
    }
  }, [hasBeenVisible, isFocused, data.length, startAutoPlay, stopAutoPlay]);

  // Guarantee background timer clearance on unmount/screen change
  useEffect(() => {
    return () => stopAutoPlay();
  }, [stopAutoPlay]);

  useAnimatedReaction(
    () => {
      if (hasBeenVisible) return true;
      if (!absoluteY || !scrollY) return false;
      const y = scrollY.value;
      return y + screenHeight * 1.5 > absoluteY;
    },
    (isNear, previousNear) => {
      if (isNear && !previousNear && !hasBeenVisible) {
        runOnJS(setHasBeenVisible)(true);
      }
    },
    [absoluteY, hasBeenVisible, scrollY, screenHeight]
  );

  const handleLayout = useCallback((event: any) => {
    if (isMeasuredRef.current) return;
    isMeasuredRef.current = true;
    
    // Measure absolute Y position relative to page
    setTimeout(() => {
      containerRef.current?.measure((x, y, width, measuredHeight, pageX, pageY) => {
        const currentScroll = scrollY?.value ?? 0;
        setAbsoluteY(pageY + currentScroll);
      });
    }, 100);
  }, [scrollY]);

  const scrollHandler = (event: any) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
  };

  const onMomentumEnd = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    scrollIndex.value = newIndex;
    startAutoPlay();
  };

  const onScrollBeginDrag = () => {
    stopAutoPlay();
  };

  const handleIndustryPress = useCallback((item: Industry) => {
    router.push({ pathname: "/GrId_MainCategory", params: { id: item._id, name: item.name }});
  }, [router]);

  const handleCategoryPress = useCallback((cat: Category, industryId: string) => {
    router.push({ pathname: "/SubCategory", params: { categoryId: cat._id, categoryName: cat.name, industryId }});
  }, [router]);

  const handleSubCategoryPress = useCallback((sub: SubCategory) => {
    router.push({ pathname: "/Products_Page", params: { subCategoryId: sub._id, subCategoryName: sub.name, subCategorySlug: sub.slug }});
  }, [router]);

  const renderItem = useCallback(({ item }: { item: Industry }) => (
    <IndustrySlide 
      item={item} 
      onIndustryPress={handleIndustryPress}
      onCategoryPress={handleCategoryPress}
      onSubCategoryPress={handleSubCategoryPress}
    />
  ), [handleIndustryPress, handleCategoryPress, handleSubCategoryPress]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  }), []);

  if (!hasBeenVisible) {
    return (
      <View 
        ref={containerRef} 
        onLayout={handleLayout} 
        style={[s.stateBox, { height: 560 }]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={s.stateText}>Loading industries…</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View ref={containerRef} onLayout={handleLayout} style={s.stateBox}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={s.stateText}>Loading industries…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View ref={containerRef} onLayout={handleLayout} style={s.stateBox}>
        <Text style={[s.stateText, { color: "#ef4444" }]}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View ref={containerRef} onLayout={handleLayout} style={s.root}>
      {data.length > 0 ? (
        <>
          <Animated.FlatList
            ref={flatRef}
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            scrollsToTop={false}
            showsHorizontalScrollIndicator={false}
            
            // Native Event Handlers
            onScroll={scrollHandler}
            onMomentumScrollEnd={onMomentumEnd}
            onScrollBeginDrag={onScrollBeginDrag}
            scrollEventThrottle={16}
            
            // Aggressive Optimizations for Horizontal Carousel
            getItemLayout={getItemLayout}
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={2}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
          />
          
          <View style={s.dotsRow}>
            {data.map((_, i) => (
              <PaginationDot key={i} index={i} scrollX={scrollX} />
            ))}
          </View>
        </>
      ) : (
        <View style={s.stateBox}>
          <Text style={s.stateText}>No industries found.</Text>
        </View>
      )}
    </View>
  );
}

// ------------------------------------------------------------------
// Styles
// ------------------------------------------------------------------
const WHITE  = "#ffffff";
const BG     = "#f8fafc";
const BORDER = "#e2e8f0";
const NAVY   = "#0f172a";
const BLUE_L = "#3b82f6";
const ACCENT = "#1d4ed8";

const s = StyleSheet.create({
  root: { backgroundColor: BG },
  stateBox: { height: 560, backgroundColor: BG, justifyContent: "center", alignItems: "center", gap: 12 },
  stateText: { color: "#64748b", fontSize: 14 },
  slide: { width: screenWidth, backgroundColor: WHITE, paddingHorizontal: 16, paddingTop: 20 },
  industryName: { color: NAVY, fontSize: 26, fontFamily: "PlusJakartaSans-ExtraBold", letterSpacing: -0.8, marginBottom: 14 },
  heroWrap: { width: "100%", height: 150, borderRadius: 18, overflow: "hidden", marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginBottom: 8 },
  catCard: { width: "49%", backgroundColor: WHITE, borderRadius: 14, borderWidth: 1, borderColor: BORDER, padding: 11, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  catHeader: { flexDirection: "row", alignItems: "flex-start", gap: 9, minHeight: 48 },
  catThumb: { width: 50, height: 50, borderRadius: 10, overflow: "hidden", backgroundColor: BG, flexShrink: 0, borderWidth: 1, borderColor: BORDER },
  catName: { flex: 1, color: "#1e293b", fontSize: 14, fontFamily: "PlusJakartaSans-Bold", lineHeight: 16, letterSpacing: -0.2, minHeight: 32 },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 8 },
  subList: { gap: 5 },
  subRow: { flexDirection: "row", alignItems: "center", height: 17, gap: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: BLUE_L, flexShrink: 0 },
  subName: { flex: 1, color: ACCENT, fontSize: 13, fontFamily: "PlusJakartaSans-Medium", letterSpacing: -0.1 },
  subEmpty: { flex: 1, fontSize: 11, color: "transparent" },
  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingTop: 12, paddingBottom: 12, backgroundColor: WHITE },
  dotIndicator: { height: 6, borderRadius: 3, backgroundColor: "#cbd5e1" },
});