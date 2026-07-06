import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { CategoryImage } from "../../../assets/images";
import { fetchWithCache, getCacheSync } from "@/utils/apiCache";

type Category = {
  _id: string;
  name: string;
  imageUrl?: string;
};

const API_URL = "https://backend.inquirybazaar.com/api/categories/main";

const Main_Category = () => {
  const router = useRouter();

  // Initialize state synchronously if prefetch already finished
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

  const renderCategory = useCallback(({ item }: { item: Category }) => (
    <Pressable
      key={item._id}
      style={catStyles.card}
      activeOpacity={0.75}
      onPress={() => router.push({
        pathname: "/SubCategory",
        params: { categoryId: item._id }
      })}
    >
      <View style={catStyles.imageWrapper}>
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : CategoryImage}
          style={catStyles.image}
          contentFit="cover"
        />
      </View>
      <Text style={catStyles.cardText} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
    </Pressable>
  ), [router]);

  return (
    <View style={catStyles.container}>
      <View style={catStyles.outer}>
        <Text style={catStyles.heading}>Top Categories</Text>
        <Pressable hitSlop={8} activeOpacity={0.75} onPress={() => router.push("/Industries")} style={catStyles.viewAllBtn}>
          <Text style={catStyles.viewAllText}>View all</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={catStyles.loader}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={category}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
          style={catStyles.cardsContainer}
          contentContainerStyle={catStyles.scrollContent}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
};

export default Main_Category;

const catStyles = StyleSheet.create({
  container: { marginTop: 24 },
  outer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16 },
  heading: { fontSize: 22, fontFamily: "PlusJakartaSans-Bold", color: "#0f172a", letterSpacing: -0.5 },
  viewAllBtn: { backgroundColor: "rgba(241,245,249,0.8)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  viewAllText: { color: "#0f172a", fontFamily: "PlusJakartaSans-SemiBold", fontSize: 12, letterSpacing: -0.3 },
  loader: { paddingVertical: 40, justifyContent: "center", alignItems: "center" },
  cardsContainer: { marginTop: 12 },
  scrollContent: { paddingLeft: 16, paddingRight: 16 },
  card: { width: 90, marginRight: 16, alignItems: "center" },
  imageWrapper: { width: 80, height: 80, borderRadius: 40, overflow: "hidden", backgroundColor: "#f1f5f9" },
  image: { width: "100%", height: "100%" },
  cardText: { marginTop: 8, fontSize: 12, fontFamily: "PlusJakartaSans-SemiBold", color: "#334155", textAlign: "center", width: "100%" }
});