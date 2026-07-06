import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, useWindowDimensions, View } from "react-native";
// Keep this as a fallback just in case an industry has no image
import { CategoryImage } from "../../../assets/images";

// 1. Updated Type to exactly match your backend API response
type Industry = {
  _id: string;
  name: string;
  imageUrl: string;
  productCount?: string; // Optional since your API doesn't currently send this
};

import { fetchWithCache } from "@/utils/apiCache";

const Top_Industries = () => {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const [industriesList, setIndustriesList] = useState<Industry[]>([]);
    const [loading, setloading] = useState(true);

    // Responsive Card Math:
    // Takes 65% of screen width so the next card peeks out, but caps at 300px for tablets
    const CARD_WIDTH = Math.min(width * 0.65, 300);
    // Maintains your original 140/240 aspect ratio
    const CARD_HEIGHT = CARD_WIDTH * 0.583; 

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
                setloading(false); 
            }
        };

        fetchIndustries();
    }, []); 

    const renderIndustryCard = useCallback(({ item }: { item: Industry }) => (
      <Pressable
        className={styles.card}
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }} // Applies dynamic responsive sizing
        onPress={() => router.push({
          pathname: "/GrId_MainCategory",
          params: { id: item._id, name: item.name }
        })}
      >
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : CategoryImage}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk" 
        />

        <View className={styles.contentWrapper}>
          <View className="self-start bg-slate-900/50 border border-white/20 px-2.5 py-1 rounded-lg mb-2">
            <Text className={styles.glassPillText}>
              {item.productCount || "Explore Sector"} 
            </Text>
          </View>

          <View className="bg-black/50 px-2.5 py-1 rounded-lg self-start max-w-[90%]">
            <Text 
              className={styles.cardText}
              numberOfLines={2}
              style={styles.textShadow}
            >
              {item.name}
            </Text>
          </View>
        </View>
      </Pressable>
    ), [router, CARD_WIDTH, CARD_HEIGHT]); // Added dimensions to dependency array
    
  return (
    <View className={styles.container}>
      
      {/* Header Section */}
      <View className={styles.outer}>
        <View className={styles.left}>
          <Text className={styles.heading}>
            Explore Industries
          </Text>
        </View>

        <Pressable 
          className={styles.viewAllBtn}
          hitSlop={8}
          onPress={() => router.push("/Industries")}
        >
          <Text className={styles.viewAllText}>
            View all
          </Text>
        </Pressable>
      </View>

      {/* Optimized FlatList */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={industriesList}
        keyExtractor={(item) => item._id}
        renderItem={renderIndustryCard}
        className={styles.cardsContainer}
        contentContainerStyle={styles.scrollContent}
        initialNumToRender={4} 
        maxToRenderPerBatch={4} 
        windowSize={5} 
        removeClippedSubviews={true} 
      />

    </View>
  );
};

export default Top_Industries;

const styles = {
  container: "mt-8", 

  outer: "flex flex-row justify-between items-center px-4",

  left: "",

  heading: "text-[22px] font-jakarta-bold text-slate-900 tracking-tight", 

  viewAllBtn: 
    "bg-slate-100/80 active:bg-slate-200 px-3.5 py-1.5 rounded-full active:scale-95 transition-all",

  viewAllText: "text-slate-900 font-jakarta-semibold text-xs tracking-tight", 

  cardsContainer: "mt-4 pl-4",

  scrollContent: {
    paddingRight: 32, 
  },

  // Removed static w-[240px] h-[140px] -> Replaced with inline styles above
  card: "mr-4 rounded-[24px] overflow-hidden active:scale-95 transition-all shadow-sm shadow-slate-200", 

  image: {
    width: "100%" as const,
    height: "100%" as const,
    position: "absolute" as const, 
  },

  darkOverlay: 
    "absolute inset-0 bg-slate-900/40", 

  contentWrapper: 
    "flex-1 justify-end p-4",

  glassPill:
    "self-start bg-white/10 border border-white/30 px-2.5 py-1 rounded-lg mb-2",

  glassPillText:
    "text-white font-jakarta-bold text-[10px] tracking-widest uppercase",

  // Added dynamic scaling safeguards for text
  cardText:
    "text-white font-jakarta-bold text-[16px] sm:text-[18px] leading-[20px] sm:leading-[22px] tracking-tight",

  textShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
};