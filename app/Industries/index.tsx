import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CategoryImage } from "../../assets/images";
import { fetchWithCache } from "@/utils/apiCache";
import { Spinner } from "@/components/ui/spinner";

type Industry = {
  _id: string;
  name: string;
  imageUrl: string;
};

// --- 1. Custom React.memo Comparator & Memoized Card Component ---
const AnimatedIndustryCard = React.memo(({ 
  item, 
  index, 
  location, 
  onPress 
}: { 
  item: Industry; 
  index: number; 
  location?: string;
  onPress: (id: string, name: string) => void;
}) => {
  // Stable internal callback
  const handlePress = useCallback(() => {
    onPress(item._id, item.name);
  }, [item._id, item.name, onPress]);

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60).duration(400)}
    >
      <Pressable
        className={styles.card}
        android_ripple={{ color: "#f1f5f9" }}
        onPress={handlePress}
      >
        <View className={styles.imageWrapper}>
          <Image
            source={item.imageUrl ? { uri: item.imageUrl } : CategoryImage}
            style={styles.image}
            contentFit="cover"
            transition={0} // 2. Zero transition to remove GPU fade overhead
            cachePolicy="memory-disk"
          />
        </View>

        <Text
          className={styles.title}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      </Pressable>
    </Animated.View>
  );
}, (prev, next) => 
  prev.item._id === next.item._id && 
  prev.location === next.location && 
  prev.index === next.index
);

// --- Main List Component ---
const IndustriesList = () => {
  const router = useRouter();
  const { location } = useLocalSearchParams<{ location?: string }>();
  const [industriesList, setIndustriesList] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries");
        if (json.success && json.data) {
          setIndustriesList(json.data);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  // --- 3. Memoize Navigation Handler ---
  const handleCardPress = useCallback((id: string, name: string) => {
    router.push({
      pathname: "/GrId_MainCategory",
      params: { id, name, location }
    });
  }, [router, location]);

  // --- 4. Memoize renderItem ---
  const renderItem = useCallback(({ item, index }: { item: Industry, index: number }) => (
    <AnimatedIndustryCard 
      item={item} 
      index={index} 
      location={location} 
      onPress={handleCardPress}
    />
  ), [location, handleCardPress]);

  // --- 5. O(1) Layout Calculation ---
  // Card padding (24) + Image (56) = 80. Margin bottom (14). Total length = 94.
  const ITEM_HEIGHT = 94; 
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: Industry) => item._id, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top }}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>All Industries</Text>
        <Text className={styles.headerSubtitle}>
          Discover products across {industriesList.length || 'all'} sectors
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center pb-20">
          <Spinner size="large" color="#0f172a" />
        </View>
      ) : (
        <FlatList
          data={industriesList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          
          // --- 6. Moved contentContainerStyle to stable reference ---
          contentContainerStyle={styles.listContent}
          
          // --- 7. Aggressive FlatList Optimizations ---
          getItemLayout={getItemLayout}
          updateCellsBatchingPeriod={40}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
};

export default IndustriesList;

const styles = {
  container: "flex-1 bg-white", 
  header: "px-5 pt-4 pb-6",
  headerTitle: "text-[28px] font-jakarta-bold text-slate-900 tracking-tight",
  headerSubtitle: "text-[15px] font-jakarta-medium text-slate-500 mt-1.5",
  card: "flex-row items-center bg-white border border-slate-200/80 rounded-[20px] p-3 mb-3.5 active:scale-[0.98] active:bg-slate-50 transition-all",
  imageWrapper: "w-[56px] h-[56px] rounded-[14px] bg-slate-50 border border-slate-100 items-center justify-center overflow-hidden",
  image: {
    width: "100%" as const,
    height: "100%" as const,
    borderRadius: 14,
  },
  title: "ml-4 mr-2 flex-1 text-[16px] leading-[22px] text-slate-800 font-jakarta-bold tracking-tight",
  // Stable reference for contentContainerStyle
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  }
};