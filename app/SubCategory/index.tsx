import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Type for the Left Sidebar (Main Categories)
type MainCategory = {
  _id: string;
  name: string;
  imageUrl: string;
};

// Type for the Right Grid (Subcategories)
type SubCategory = {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  parentCategoryId: {
    _id: string;
  };
};

const SubCateGory = () => {
  const router = useRouter();
  const { categoryId, industryId, location } = useLocalSearchParams<{ categoryId?: string; industryId?: string; location?: string }>();
  const insets = useSafeAreaInsets();
  
  // States for API Data
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [allSubCategories, setAllSubCategories] = useState<SubCategory[]>([]);
  
  // UI States
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch from the industry tree API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://backend.inquirybazaar.com/api/industries/tree");
        const json = await response.json();

        if (json.success && json.data) {
          // Find the active industry matching the passed industryId
          let activeIndustry = json.data.find((ind: any) => ind._id === industryId);
          
          // Fallback: search the tree to find which industry contains this categoryId
          if (!activeIndustry && categoryId) {
            activeIndustry = json.data.find((ind: any) =>
              ind.categories?.some((cat: any) => cat._id === categoryId)
            );
          }

          if (activeIndustry) {
            // Set Left Sidebar Data (Main Categories of this industry)
            const categoriesData = activeIndustry.categories || [];
            setMainCategories(categoriesData);

            // Extract and flatten right grid data (All subcategories inside this industry)
            const allSubs: SubCategory[] = [];
            categoriesData.forEach((cat: any) => {
              if (cat.subCategories) {
                cat.subCategories.forEach((sub: any) => {
                  allSubs.push({
                    _id: sub._id,
                    name: sub.name,
                    slug: sub.slug || "",
                    imageUrl: sub.imageUrl,
                    parentCategoryId: { _id: cat._id }
                  });
                });
              }
            });
            setAllSubCategories(allSubs);

            // Select the category passed in from the grid, or fallback to the first category in the industry
            if (categoryId) {
              setSelectedMainId(categoryId);
            } else if (categoriesData.length > 0) {
              setSelectedMainId(categoriesData[0]._id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching tree data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, industryId]);

  // 2. Filter the right side based on what is clicked on the left
  const currentSubCategories = allSubCategories.filter(
    (sub) => sub.parentCategoryId?._id === selectedMainId
  );

  const activeMainCategory = mainCategories.find(c => c._id === selectedMainId);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-slate-500 font-jakarta-medium">Loading catalog...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* --- HEADER --- */}
      <View className={styles.header}>
        <Pressable 
          className="p-2 -ml-2" 
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </Pressable>
        
        <Text className={styles.headerTitle} numberOfLines={1}>
          {activeMainCategory?.name || "Categories"}
        </Text>
        
        <Pressable className="p-2 -mr-2" hitSlop={8}>
          <Ionicons name="search-outline" size={24} color="#334155" />
        </Pressable>
      </View>

      {/* --- SPLIT PANE BODY --- */}
      <View className={styles.body}>
        
        {/* LEFT SIDEBAR: Main Categories */}
        <View className={styles.leftSidebar}>
          <FlatList
            data={mainCategories}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12 }}
            renderItem={({ item }) => {
              const isActive = item._id === selectedMainId;
              return (
                <Pressable
                  onPress={() => setSelectedMainId(item._id)}
                  className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ""}`}
                >
                  <View className={`${styles.sidebarImageWrapper} ${isActive ? styles.sidebarImageWrapperActive : "border-transparent"}`}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.sidebarImage}
                      contentFit="contain"
                      transition={200}
                    />
                  </View>
                  <Text 
                    className={`${styles.sidebarText} ${isActive ? "text-orange-600 font-jakarta-bold" : "text-slate-600 font-jakarta-medium"}`}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* RIGHT CONTENT: Subcategories Grid */}
        <View className={styles.rightContent}>
          <FlatList
            data={currentSubCategories}
            keyExtractor={(item) => item._id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            columnWrapperStyle={{ justifyContent: "space-between", gap: 12 }}
            ListEmptyComponent={
              <Text className="text-center text-slate-400 mt-10 font-jakarta-medium">
                No subcategories found.
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable
                className={styles.subCategoryCard}
                android_ripple={{ color: "#e2e8f0" }}
                onPress={() =>
                  router.push({
                    pathname: "/Products_Page",
                    params: {
                      subCategoryId: item._id,
                      subCategoryName: item.name,
                      subCategorySlug: item.slug,
                      location
                    },
                  })
                }
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.subCategoryImage}
                  contentFit="contain"
                  transition={200}
                />
                <Text className={styles.subCategoryText} numberOfLines={2}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>

      </View>
    </View>
  );
};

export default SubCateGory;

const styles = {
  header: "flex-row items-center justify-between px-4 pb-3 border-b border-slate-100 bg-white",
  headerTitle: "flex-1 text-[18px] font-jakarta-bold text-slate-800 text-center mx-4",
  
  body: "flex-1 flex-row bg-slate-50", 
  
  leftSidebar: "w-[100px] bg-white border-r border-slate-100",
  sidebarItem: "items-center px-2 py-3 mb-1",
  sidebarItemActive: "bg-orange-50/30", 
  sidebarImageWrapper: "w-[64px] h-[64px] rounded-xl items-center justify-center bg-slate-50 border-[1.5px] mb-2",
  sidebarImageWrapperActive: "border-orange-500 bg-orange-50/50",
  sidebarImage: { width: 44, height: 44 },
  sidebarText: "text-[10px] text-center leading-[13px]",

  rightContent: "flex-1",
  subCategoryCard: "flex-1 max-w-[48%] bg-white rounded-2xl p-3 mb-3 items-center border border-slate-100 shadow-sm shadow-slate-200/50",
  subCategoryImage: { width: 56, height: 56, marginBottom: 8 },
  subCategoryText: "text-[12px] font-jakarta-semibold text-slate-800 text-center leading-[16px]",
};