import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { productCache } from "@/utils/productCache";
import { fetchWithCache, getCacheSync } from "@/utils/apiCache";

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

// Synchronously extract and merge cached products for "Plants & Machinery" -> "Machines & Equipment"
function getInitialCachedProducts(): { products: Product[]; categoryId: string | null } {
  try {
    const treeJson = getCacheSync("https://backend.inquirybazaar.com/api/industries/tree");
    if (treeJson?.success && Array.isArray(treeJson.data)) {
      const industry = treeJson.data.find(
        (ind: any) =>
          ind.name?.toLowerCase().includes("plants") ||
          ind.name?.toLowerCase().includes("machinery")
      );
      if (industry && industry.categories) {
        const categoryObj = industry.categories.find(
          (cat: any) =>
            cat.name?.toLowerCase().includes("machines") ||
            cat.name?.toLowerCase().includes("equipment")
        );
        if (categoryObj) {
          const categoryId = categoryObj._id;
          if (categoryObj.subCategories?.length) {
            const subCats = categoryObj.subCategories;
            const allProducts: Product[] = [];
            let allFoundInCache = true;

            for (const sub of subCats) {
              const resJson = getCacheSync(`https://backend.inquirybazaar.com/api/categories/sub/${sub.slug}/Delhi`);
              if (resJson?.success && Array.isArray(resJson.data?.products)) {
                allProducts.push(...resJson.data.products);
              } else {
                allFoundInCache = false;
              }
            }

            if (allProducts.length > 0) {
              return { products: allProducts.slice(0, 10), categoryId };
            }
          }
          return { products: [], categoryId };
        }
      }
    }
  } catch (e) {
    // Fail-safe
  }
  return { products: [], categoryId: null };
}

const NewOnes = () => {
  const router = useRouter();

  // Try to load cached data instantly
  const initialData = getInitialCachedProducts();
  const [productsList, setProductsList] = useState<Product[]>(initialData.products);
  const [categoryObjId, setCategoryObjId] = useState<string | null>(initialData.categoryId);
  const [isLoading, setIsLoading] = useState(initialData.products.length === 0);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");

        if (json.success && json.data) {
          const industry = json.data.find(
            (ind: any) =>
              ind.name.toLowerCase().includes("plants") ||
              ind.name.toLowerCase().includes("machinery")
          );

          if (industry && industry.categories) {
            const categoryObj = industry.categories.find(
              (cat: any) =>
                cat.name.toLowerCase().includes("machines") ||
                cat.name.toLowerCase().includes("equipment")
            );

            if (categoryObj) {
              setCategoryObjId(categoryObj._id);
              
              if (categoryObj.subCategories) {
                const subCats = categoryObj.subCategories;

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

  const renderProductCard = useCallback(({
    item,
  }: {
    item: Product;
  }) => {
    const primaryImage =
      item.media && item.media.length > 0
        ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
        : "https://images.unsplash.com/photo-1581092335397-9583eb92d232?q=80";

    const company =
      item.supplier?.business?.companyName ||
      item.supplier?.name ||
      "Manufacturer";
    const isPriceOnRequest = item.priceType === "on_request" || !item.price;

    return (
      <Pressable key={item._id} style={flatStyles.card} onPress={() => handleCardPress(item)}>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }}>
            <View style={flatStyles.imageWrapper}>
              <Image
                source={{ uri: primaryImage }}
                style={flatStyles.image}
                contentFit="cover"
                transition={200}
              />
            </View>

            <View style={flatStyles.content}>
              <Text style={flatStyles.company} numberOfLines={1}>
                {company}
              </Text>
              <Text style={flatStyles.title} numberOfLines={2}>
                {item.name}
              </Text>

              <View style={flatStyles.footer}>
                {isPriceOnRequest ? (
                  <Text style={flatStyles.priceRequest}>Price on Request</Text>
                ) : (
                  <Text style={flatStyles.price}>
                    ₹{item.price}
                    <Text style={flatStyles.unit}> / {item.unit || "piece"}</Text>
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </Pressable>
    );
  }, [router]);

  return (
    <View style={flatStyles.container}>
      <View style={flatStyles.header}>
        <View>
          <Text style={flatStyles.subTitle}>MACHINERY & EQUIPMENTS</Text>
          <Text style={flatStyles.mainTitle}>Industrial Machinery</Text>
        </View>
        <Pressable
          style={flatStyles.viewAll}
          onPress={() => {
            if (categoryObjId) {
              router.push({
                pathname: "/SubCategory",
                params: { categoryId: categoryObjId },
              });
            }
          }}
        >
          <Text style={flatStyles.viewAllText}>View All</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={flatStyles.loader}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={productsList}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={renderProductCard}
          contentContainerStyle={flatStyles.listContent}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
};

export default NewOnes;

const flatStyles = StyleSheet.create({
  container: {
    marginTop: 32,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#94a3b8",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: "PlusJakartaSans-ExtraBold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  viewAll: {
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#0f172a",
  },
  loader: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 8,
  },
  card: {
    width: 160,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrapper: {
    height: 110,
    backgroundColor: "#f8fafc",
    width: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 12,
  },
  company: {
    fontSize: 9,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#3b82f6",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#1e293b",
    height: 36,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    marginTop: 4,
  },
  price: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans-ExtraBold",
    color: "#0f172a",
  },
  unit: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans-Medium",
    color: "#64748b",
  },
  priceRequest: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#d97706",
  },
});