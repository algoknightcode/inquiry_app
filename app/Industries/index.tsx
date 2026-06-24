import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    FlatList,
    Pressable,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryImage } from "../../assets/images";

type Industry = {
  _id: string;
  name: string;
  imageUrl: string;
};

// --- Animated Card Component ---
const AnimatedIndustryCard = ({ item, index }: { item: Industry; index: number }) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(20)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current;   

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 60, 
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 60,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        className={styles.card}
        android_ripple={{ color: "#f1f5f9" }}
        onPress={() => router.push({
          pathname: "/GrId_MainCategory",
          params: { id: item._id, name: item.name }
        })}
      >
        <View className={styles.imageWrapper}>
          <Image
            source={item.imageUrl ? { uri: item.imageUrl } : CategoryImage}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>

        <Text
          className={styles.title}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Subtle, un-intrusive chevron */}
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      </Pressable>
    </Animated.View>
  );
};

import { fetchWithCache } from "@/utils/apiCache";

// --- Main List Component ---
const IndustriesList = () => {
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: insets.top }}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>All Industries</Text>
        {/* Fixed the unreadable light-blue text color */}
        <Text className={styles.headerSubtitle}>
          Discover products across {industriesList.length || 'all'} sectors
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center pb-20">
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <FlatList
          data={industriesList}
          renderItem={({ item, index }) => <AnimatedIndustryCard item={item} index={index} />}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 40,
          }}
        />
      )}
    </View>
  );
};

export default IndustriesList;

const styles = {
  // 1. Changed to pure white background. Grey backgrounds make shadows look muddy.
  container: "flex-1 bg-white", 

  header: "px-5 pt-4 pb-6",

  headerTitle: "text-[28px] font-jakarta-bold text-slate-900 tracking-tight",
  
  // 2. Forced a distinct slate-500 color so it doesn't wash out
  headerSubtitle: "text-[15px] font-jakarta-medium text-slate-500 mt-1.5",

  // 3. THE FIX: Removed shadows entirely. Used a pure white flat card with a crisp, delicate border.
  card:
    "flex-row items-center bg-white border border-slate-200/80 rounded-[20px] p-3 mb-3.5 active:scale-[0.98] active:bg-slate-50 transition-all",

  // Slightly refined the image box to look like a neat icon container (no padding for full bleed)
  imageWrapper:
    "w-[56px] h-[56px] rounded-[14px] bg-slate-50 border border-slate-100 items-center justify-center overflow-hidden",

  image: {
    width: "100%" as const,
    height: "100%" as const,
    borderRadius: 14,
  },

  title:
    "ml-4 mr-2 flex-1 text-[16px] leading-[22px] text-slate-800 font-jakarta-bold tracking-tight",
};