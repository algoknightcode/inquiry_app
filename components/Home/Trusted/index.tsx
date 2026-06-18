import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type TrustedProduct = {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  isVerified?: boolean; // Changed from isHot to isVerified
};

const trustedProducts: TrustedProduct[] = [
  {
    id: "1",
    name: "Oversized Heavyweight Tee",
    brand: "STUDIO BLANK",
    price: "1,299",
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop",
    isVerified: true,
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
    isVerified: true,
  },
  {
    id: "4",
    name: "Aged Silver Ring",
    brand: "METALS",
    price: "2,100",
    image: "https://images.unsplash.com/photo-1605100804763-247f66121408?q=80&w=400&auto=format&fit=crop",
  },
];

const IBTrusted = () => {
  return (
    <View className={styles.container}>
      
      {/* Header Section */}
      <View className={styles.outer}>
        <View className={styles.left}>
          <Text className={styles.kicker}>CERTIFIED</Text>
          <Text className={styles.heading}>
            IB Trusted
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
        snapToInterval={160 + 16} 
        decelerationRate="fast">
        {trustedProducts.map((item) => (
          <Pressable
            key={item.id}
            className={styles.card}
          >
            {({ pressed }) => (
              <View style={{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }} className="transition-all">
                
                {/* 
                  UNIQUE TWIST: Arched "Tombstone" Image Container.
                  This dramatically changes the silhouette of the card while keeping the same dimensions.
                */}
                <View style={styles.imageWrapper}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                  />
                  
                  {/* Floating 'VERIFIED' Trust Seal - Centered at the bottom edge */}
                  {item.isVerified && (
                    <View className={styles.trustBadge}>
                      {/* Optional: You can add a small shield icon or checkmark here from expo/vector-icons */}
                      <Text className={styles.trustBadgeText}>✓ VERIFIED</Text>
                    </View>
                  )}
                </View>

                {/* Typography details (Kept identical as requested) */}
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

export default IBTrusted;

// --- STYLES ---
const styles = {
  // Added a very subtle background tint and padding to the whole section to make it feel like a distinct "zone"
  container: "mt-8 bg-slate-50 py-6", 

  outer: "flex flex-row justify-between items-end px-5",

  left: "flex-col",

  kicker: "text-[10px] font-jakarta-bold text-emerald-600 tracking-[0.15em] mb-1 uppercase", // Changed to emerald for trust

  heading: "text-[26px] font-jakarta-extrabold text-slate-900 tracking-tighter leading-none", 

  viewAllBtn: 
    "border-b border-slate-900 pb-0.5 active:opacity-50 transition-all",

  viewAllText: "text-slate-900 font-jakarta-bold text-sm tracking-tight", 

  cardsContainer: "mt-6 pl-5",

  scrollContent: {
    paddingRight: 20, 
  },

  card: "mr-4 w-[160px]", 

  // UNIQUE ARCH SHAPE (Half circle top, slightly rounded bottom)
  imageArchWrapper: {
    width: 160,
    height: 200,
    backgroundColor: "#f1f5f9", // slate-100
    borderTopLeftRadius: 80,    // Creates the perfect arch
    borderTopRightRadius: 80,   // Creates the perfect arch
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    position: "relative" as const,
    overflow: "visible" as const, // Allows the badge to pop out slightly if needed
  },

  // Regular rectangular image wrapper (replaces arch for simpler design)
  imageWrapper: {
    width: 160,
    height: 200,
    backgroundColor: "#f1f5f9", // slate-100
    borderRadius: 16,
    position: "relative" as const,
    overflow: "visible" as const,
  },

  // Image style to fill rectangular wrapper
  image: {
    width: "100%" as const,
    height: "100%" as const,
    borderRadius: 16,
  },
  trustBadge: "absolute -bottom-2.5 self-center bg-slate-900 border-2 border-white px-2.5 py-1 rounded-full shadow-sm shadow-slate-900/20",
  trustBadgeText: "text-white font-jakarta-extrabold text-[8px] tracking-widest uppercase",

  // Text wrapper gets a tiny bit more top margin to account for the overlapping badge
  textWrapper: "mt-5 px-1 items-center", // Centered text complements the arched shape beautifully

  brandText: "text-slate-400 font-jakarta-semibold text-[10px] tracking-wider uppercase mb-1",

  cardTitle: "text-slate-800 font-jakarta-bold text-[14px] tracking-tight leading-snug mb-1 text-center",

  cardPrice: "text-slate-950 font-jakarta-black text-[16px] tracking-tighter",
};