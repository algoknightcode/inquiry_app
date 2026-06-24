import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
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
    const [industriesList, setIndustriesList] = useState<Industry[]>([]);
    const [loading, setloading] = useState(true);

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

      {/* Horizontal Cinematic Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className={styles.cardsContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {industriesList.map((item) => (
          <Pressable
            // 3. THE FIX: MongoDB uses _id, not id
            key={item._id}
            className={styles.card}
            onPress={() => router.push({
              pathname: "/GrId_MainCategory",
              params: { id: item._id, name: item.name }
            })}
          >
            {/* 4. THE FIX: Pass the dynamic network image URL */}
            <Image
              source={item.imageUrl ? { uri: item.imageUrl } : CategoryImage}
              style={styles.image}
              contentFit="cover"
              transition={200} // Adds a nice smooth fade-in when the network image loads
            />

            <View className={styles.contentWrapper}>
              
              <BlurView 
                intensity={30} 
                tint="light" 
                className={styles.glassPill}
                style={{ overflow: 'hidden' }} 
              >
                <Text className={styles.glassPillText}>
                  {/* Hardcoded fallback if your API doesn't have product counts yet */}
                  {item.productCount || "Explore Sector"} 
                </Text>
              </BlurView>

              {/* Industry Title */}
              <Text 
                className={styles.cardText}
                numberOfLines={2}
                style={styles.textShadow}
              >
                {item.name}
              </Text>
            </View>

          </Pressable>
        ))}
      </ScrollView>

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
    paddingRight: 16, 
  },

  card: "mr-4 w-[240px] h-[140px] rounded-[24px] overflow-hidden active:scale-95 transition-all shadow-sm shadow-slate-200", 

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

  cardText:
    "text-white font-jakarta-bold text-[18px] leading-[22px] tracking-tight w-[90%]",

  // High-performance text shadow for contrast
  textShadow: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
};