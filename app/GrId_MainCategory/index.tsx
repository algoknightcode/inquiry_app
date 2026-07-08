import { fetchWithCache } from "@/utils/apiCache";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryImage } from "@/assets/images"; // Make sure your path is correct

type Category = {
  _id: string;
  name: string;
  imageUrl?: string;
};

const Grid_mainCategory = () => {
  const router = useRouter();
  const { id, name, location } = useLocalSearchParams<{ id?: string; name?: string; location?: string }>();
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const url = id 
        ? `https://backend.inquirybazaar.com/api/categories/main?industryId=${id}`
        : "https://backend.inquirybazaar.com/api/categories/main";

      const json = await fetchWithCache(url);

      if (json.success && json.data) {
        let data = json.data;
        
        if (id && Array.isArray(data)) {
          data = data.filter((cat: any) => {
            return cat.industryId && cat.industryId._id === id;
          });
        }
        
        setCategoriesList(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Dynamic Header */}
      <View className="mb-6">
        <Text className="text-[26px] font-jakarta-bold text-slate-900 tracking-tight">
          {name || "All Categories"}
        </Text>
        <Text className="text-[14px] font-jakarta-medium text-slate-500 mt-1">
          Explore products within this sector
        </Text>
      </View>

      {loading ? (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : null}
      
      <FlatList
        data={categoriesList}
        renderItem={({ item }) => (
          <Pressable 
            style={{ width: '23%', alignItems: 'center', marginVertical: 12, marginHorizontal: '1.3%' }}
            android_ripple={{ color: "#f1f5f9", radius: 35, borderless: true }}
            onPress={() => router.push({
              pathname: "/SubCategory",
              params: { categoryId: item._id, categoryName: item.name, industryId: id, location }
            })}
          >
            <View className={styles.imageWrapper}>
              <Image
                source={item.imageUrl ? { uri: item.imageUrl } : CategoryImage}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            </View>

            <Text
              className={styles.title}
              numberOfLines={2}
            >
              {item.name}
            </Text>
          </Pressable>
        )}
        keyExtractor={(item) => item._id}
        numColumns={4}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </ScrollView>
  );
};

export default Grid_mainCategory;

const styles = {
  container: "flex-1 bg-white px-4 pt-5",

  // Uses a 23% width instead of fixed pixels. 23% * 4 = 92%, leaving perfect space for gaps!
  card:
    "w-[23%] items-center active:scale-[0.95] active:opacity-80 transition-all",

  // Replaced outer card border with a premium soft-tinted image container
  imageWrapper:
    "w-[72px] h-[72px] bg-slate-50 border border-slate-100/80 rounded-[22px] items-center justify-center shadow-sm shadow-slate-100 mb-2",

  image: {
    width: "100%" as const,
    height: "100%" as const,
    borderRadius: 20,
  },

  // Tightened the line height and font size for a super clean multi-line display
  title:
    "text-[11px] text-center text-slate-800 font-jakarta-semibold leading-[14px] tracking-tight px-1",
};