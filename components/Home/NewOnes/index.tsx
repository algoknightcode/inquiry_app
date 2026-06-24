import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { productCache } from "@/utils/productCache";
import { fetchWithCache } from "@/utils/apiCache";

// ── Types ──────────────────────────────────────────────────────────────────
type Media = {
  _id: string;
  url: string;
  isPrimary: boolean;
};

type Business = {
  companyName: string;
  city: string;
  state: string;
};

type Supplier = {
  _id: string;
  name: string;
  phone: string;
  business?: Business;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  priceType: string;
  media: Media[];
  supplier?: Supplier;
};

const NewOnes = () => {
  const router = useRouter();
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoryObjId, setCategoryObjId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        // 1. Fetch industry tree
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");

        if (json.success && json.data) {
          // 2. Find "Plants & Machinery"
          const industry = json.data.find(
            (ind: any) =>
              ind.name.toLowerCase().includes("plants") ||
              ind.name.toLowerCase().includes("machinery")
          );

          if (industry && industry.categories) {
            // 3. Find "Machines & Equipment"
            const categoryObj = industry.categories.find(
              (cat: any) =>
                cat.name.toLowerCase().includes("machines") ||
                cat.name.toLowerCase().includes("equipment")
            );

            if (categoryObj) {
              setCategoryObjId(categoryObj._id);
              
              if (categoryObj.subCategories) {
                const subCats = categoryObj.subCategories;

                // 4. Fetch products from all subcategories in parallel (Delhi location default)
                const productRequests = subCats.map(async (sub: any) => {
                  try {
                    const resJson = await fetchWithCache(`https://backend.inquirybazaar.com/api/categories/sub/${sub.slug}/Delhi`);
                    if (resJson.success && resJson.data && resJson.data.products) {
                      return resJson.data.products;
                    }
                  } catch (e) {
                    console.log(`Error fetching products for subcategory ${sub.slug}:`, e);
                  }
                  return [];
                });

                const allProductsArrays = await Promise.all(productRequests);
                const flattened = allProductsArrays.flat().slice(0, 10);
                setProductsList(flattened);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching B2B products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryProducts();
  }, []);

  const handleCardPress = (item: Product) => {
    productCache[item._id] = item;
    router.push({
      pathname: "/Products_Page/[slug]",
      params: {
        slug: item.slug,
        productId: item._id,
      },
    });
  };

  return (
    <View className={styles.container}>
      
      {/* Header Section */}
      <View className={styles.outer}>
        <View className={styles.left}>
          <Text className={styles.kicker}>MACHINERY ZONE</Text>
          <Text className={styles.heading}>
            Machines & Tools
          </Text>
        </View>

        <Pressable 
          className={styles.viewAllBtn}
          hitSlop={8}
          onPress={() => router.push({
            pathname: "/SubCategory",
            params: { categoryId: categoryObjId || undefined }
          })}
        >
          <Text className={styles.viewAllText}>
            Explore
          </Text>
        </Pressable>
      </View>

      {/* Horizontal Carousel or Loading state */}
      {isLoading ? (
        <View className="py-12 justify-center items-center">
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className={styles.cardsContainer}
          contentContainerStyle={styles.scrollContent}
          snapToInterval={160 + 16}
          decelerationRate="fast"
        >
          {productsList.map((item) => {
            const primaryImage = item.media && item.media.length > 0
              ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
              : "https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80";

            const company = item.supplier?.business?.companyName || item.supplier?.name || "Manufacturer";
            const isPriceOnRequest = item.priceType === "on_request" || !item.price;

            return (
              <Pressable
                key={item._id}
                className={styles.card}
                onPress={() => handleCardPress(item)}
              >
                {({ pressed }) => (
                  <View 
                    style={{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }} 
                    className="transition-all"
                  >
                    
                    {/* Image Container - Tall Portrait shape */}
                    <View className={styles.imageWrapper}>
                      <Image
                        source={{ uri: primaryImage }}
                        style={styles.image}
                        contentFit="cover"
                        transition={200}
                      />
                      
                      {/* Floating 'HOT' Badge */}
                      {item.priceType === "on_request" && (
                        <View className={styles.badge}>
                          <Text className={styles.badgeText}>ASK</Text>
                        </View>
                      )}

                      {/* Quick Action Micro-button */}
                      <Pressable className={styles.actionBtn}>
                        <Text className={styles.actionBtnText}>+</Text>
                      </Pressable>
                    </View>

                    {/* Typography details */}
                    <View className={styles.textWrapper}>
                      <Text className={styles.brandText} numberOfLines={1}>
                        {company}
                      </Text>
                      <Text className={styles.cardTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className={styles.cardPrice}>
                        {isPriceOnRequest ? "Price on Request" : `₹${item.price.toLocaleString()}`}
                      </Text>
                    </View>

                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

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

  card: "mr-4 w-[160px]",

  imageWrapper: 
    "w-[160px] h-[210px] bg-slate-100 rounded-2xl relative overflow-hidden", 

  image: {
    width: "100%" as const,
    height: "100%" as const,
  },

  badge: "absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md",
  badgeText: "text-slate-900 font-jakarta-extrabold text-[9px] tracking-widest uppercase",

  actionBtn: "absolute bottom-3 right-3 w-8 h-8 bg-slate-900 rounded-full items-center justify-center shadow-lg shadow-slate-900/30 active:scale-90 transition-all",
  actionBtnText: "text-white font-jakarta-medium text-lg leading-none mt-[-2px]",

  textWrapper: "mt-3 px-1",

  brandText: "text-slate-400 font-jakarta-semibold text-[10px] tracking-wider uppercase mb-1",

  cardTitle: "text-slate-800 font-jakarta-bold text-[14px] tracking-tight leading-snug mb-1",

  cardPrice: "text-slate-950 font-jakarta-black text-[15px] tracking-tighter",
};