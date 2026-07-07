import { fetchWithCache, getCacheSync } from "@/utils/apiCache";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CategoryImage } from "../../../assets/images";

type Category = {
  _id: string;
  name: string;
  imageUrl?: string;
};

const API_URL = "https://backend.inquirybazaar.com/api/categories/main";

// 1. Strict equality check for BOTH item and onPress
const CategoryCard = React.memo(
  ({ item, onPress }: { item: Category; onPress: (id: string) => void }) => (
    <Pressable
      style={catStyles.card}
      activeOpacity={0.75}
      onPress={() => onPress(item._id)}
    >
      <View style={catStyles.imageWrapper}>
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : CategoryImage}
          style={catStyles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={100} // Reduced from 200 for less fade overhead
        />
      </View>
      <Text style={catStyles.cardText} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
    </Pressable>
  ),
  (prevProps, nextProps) =>
    prevProps.item._id === nextProps.item._id && prevProps.onPress === nextProps.onPress
);

// Skeleton Card Component for loading state
const SkeletonCard = () => (
  <View style={catStyles.card}>
    <View style={[catStyles.imageWrapper, catStyles.skeletonImage]} />
    <View style={[catStyles.skeletonText, { marginTop: 8 }]} />
  </View>
);

const Main_Category = () => {
  const router = useRouter();

  const cached = getCacheSync(API_URL);
  const [category, setCategory] = useState<Category[]>(
    cached?.success && Array.isArray(cached.data) ? cached.data : []
  );
  const [isLoading, setIsLoading] = useState(!cached);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const json = await fetchWithCache(API_URL);
        if (json.success && json.data) {
          // Removed expensive JSON.stringify. Relying on React's default update cycle
          // or a simple array length fallback if you want to avoid some re-renders.
          setCategory(json.data);
        }
      } catch (error) {
        console.log("Error in fetching categories", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleViewAll = useCallback(() => {
    router.push("/Industries");
  }, [router]);

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      router.push({
        pathname: "/SubCategory",
        params: { categoryId },
      });
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Category }) => (
      <CategoryCard item={item} onPress={handleCategoryPress} />
    ),
    [handleCategoryPress]
  );

  const keyExtractor = useCallback((item: Category) => item._id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 106,
      offset: 106 * index,
      index,
    }),
    []
  );

  return (
    <View style={catStyles.container}>
      <View style={catStyles.outer}>
        <Text style={catStyles.heading}>Top Categories</Text>
        <Pressable
          hitSlop={8}
          activeOpacity={0.75}
          onPress={handleViewAll}
          style={catStyles.viewAllBtn}
        >
          <Text style={catStyles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={catStyles.cardsContainer}
          contentContainerStyle={catStyles.scrollContent}
          scrollEnabled={false}
        >
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={category}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          decelerationRate="fast"
          style={catStyles.cardsContainer}
          contentContainerStyle={catStyles.scrollContent}
          removeClippedSubviews={Platform.OS === "android"}
          // Removed redundant ListFooterComponent
          // Removed arbitrary initialNumToRender, maxToRenderPerBatch, and windowSize until profiled
        />
      )}
    </View>
  );
};

export default React.memo(Main_Category);

const catStyles = StyleSheet.create({
  container: { marginTop: 24 },
  outer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 22,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  viewAllBtn: {
    backgroundColor: "rgba(241,245,249,0.8)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  viewAllText: {
    color: "#0f172a",
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    letterSpacing: -0.3,
  },
  loader: { paddingVertical: 40, justifyContent: "center", alignItems: "center" },
  cardsContainer: { marginTop: 12 },
  scrollContent: { paddingLeft: 16, paddingRight: 16 },
  card: { width: 90, marginRight: 16, alignItems: "center" },
  imageWrapper: {
    width: 80,
    height: 80, // Enforces the size rule (image requested close to display size)
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
  },
  image: { width: "100%", height: "100%" },
  cardText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "PlusJakartaSans-SemiBold",
    color: "#334155",
    textAlign: "center",
    width: "100%",
  },
  // Removed invalid animation: "pulse"
  skeletonImage: { backgroundColor: "#e2e8f0" },
  skeletonText: {
    width: "80%",
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    alignSelf: "center",
  },
});