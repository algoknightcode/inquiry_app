import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type NewProduct = {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  isHot?: boolean;
};

// Using high-quality placeholder images to demonstrate the editorial aesthetic
const newProducts: NewProduct[] = [
  {
    id: "1",
    name: "Oversized Heavyweight Tee",
    brand: "STUDIO BLANK",
    price: "1,299",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop",
    isHot: true,
  },
  {
    id: "2",
    name: "Matte Ceramic Vase",
    brand: "NORDIC HOME",
    price: "850",
    image: "https://images.unsplash.com/photo-1613563914594-52622615456c?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Minimalist Leather Tote",
    brand: "ATELIER",
    price: "4,500",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=400&auto=format&fit=crop",
    isHot: true,
  },
  {
    id: "4",
    name: "Aged Silver Ring",
    brand: "METALS",
    price: "2,100",
    image: "https://images.unsplash.com/photo-1605100804763-247f66121408?q=80&w=400&auto=format&fit=crop",
  },
];

const NewOnes = () => {
  return (
    <View className={styles.container}>
      
      {/* Header Section */}
      <View className={styles.outer}>
        <View className={styles.left}>
          {/* Added a subtle kicker text above the main heading for an editorial feel */}
          <Text className={styles.kicker}>JUST DROPPED</Text>
          <Text className={styles.heading}>
            New Arrivals
          </Text>
        </View>

        <Pressable 
          className={styles.viewAllBtn}
          hitSlop={8}
        >
          <Text className={styles.viewAllText}>
            Explore
          </Text>
        </Pressable>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className={styles.cardsContainer}
        contentContainerStyle={styles.scrollContent}
        // Snapping adds that premium tactile feedback when scrolling
        snapToInterval={160 + 16} // card width (160) + margin (16)
        decelerationRate="fast"
      >
        {newProducts.map((item) => (
          <Pressable
            key={item.id}
            className={styles.card}
          >
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }} className="transition-all">
                
                {/* Image Container - Tall Portrait shape */}
                <View className={styles.imageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                  />
                  
                  {/* Floating 'NEW' or 'HOT' Badge */}
                  {item.isHot && (
                    <View className={styles.badge}>
                      <Text className={styles.badgeText}>HOT</Text>
                    </View>
                  )}

                  {/* Quick Action Micro-button (e.g., Add / Favorite) */}
                  <Pressable className={styles.actionBtn}>
                    <Text className={styles.actionBtnText}>+</Text>
                  </Pressable>
                </View>

                {/* Typography details */}
                <View className={styles.textWrapper}>
                  <Text className={styles.brandText} numberOfLines={1}>
                    {item.brand}
                  </Text>
                  <Text className={styles.cardTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className={styles.cardPrice}>
                    ₹{item.price}
                  </Text>
                </View>

              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

    </View>
  );
};

export default NewOnes;

// --- STYLES ---
const styles = {
  container: "mt-8", 

  outer: "flex flex-row justify-between items-end px-5",

  left: "flex-col",

  kicker: "text-[10px] font-jakarta-bold text-slate-400 tracking-[0.15em] mb-1 uppercase",

  heading: "text-[26px] font-jakarta-extrabold text-slate-900 tracking-tighter leading-none", 

  viewAllBtn: 
    "border-b border-slate-900 pb-0.5 active:opacity-50 transition-all",

  viewAllText: "text-slate-900 font-jakarta-bold text-sm tracking-tight", 

  cardsContainer: "mt-5 pl-5",

  scrollContent: {
    paddingRight: 20, 
  },

  card: "mr-4 w-[160px]", // Wider and taller than the category card

  imageWrapper: 
    "w-[160px] h-[210px] bg-slate-100 rounded-2xl relative overflow-hidden", 

  image: {
    width: "100%" as const,
    height: "100%" as const,
  },

  // Premium floating badge Top-Left
  badge: "absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md",
  badgeText: "text-slate-900 font-jakarta-extrabold text-[9px] tracking-widest uppercase",

  // Tactile circular quick-action button Bottom-Right
  actionBtn: "absolute bottom-3 right-3 w-8 h-8 bg-slate-900 rounded-full items-center justify-center shadow-lg shadow-slate-900/30 active:scale-90 transition-all",
  actionBtnText: "text-white font-jakarta-medium text-lg leading-none mt-[-2px]", // mt adjusts optical alignment for the '+'

  textWrapper: "mt-3 px-1",

  brandText: "text-slate-400 font-jakarta-semibold text-[10px] tracking-wider uppercase mb-1",

  cardTitle: "text-slate-800 font-jakarta-bold text-[14px] tracking-tight leading-snug mb-1",

  cardPrice: "text-slate-950 font-jakarta-black text-[16px] tracking-tighter",
};