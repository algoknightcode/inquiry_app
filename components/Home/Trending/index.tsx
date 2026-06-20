import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { productCache } from "@/utils/productCache";

// ── TypeScript Types matching backend payload ──────────────────────────────
type Media = {
  _id: string;
  url: string;
  isPrimary: boolean;
};

type Business = {
  companyName: string;
  city: string;
  state: string;
  businessType: string;
};

type Supplier = {
  _id: string;
  name: string;
  phone: string;
  profileImage?: string;
  business?: Business;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  unit: string;
  priceType: string;
  minOrderQty: number;
  deliveryTime?: string;
  media: Media[];
  supplier?: Supplier;
};

const CARD_WIDTH = 170; 
const CARD_MARGIN = 20;

const ProductCard = ({ item }: { item: Product }) => {
  const router = useRouter();
  
  // Find primary image url
  const primaryImage = item.media && item.media.length > 0
    ? (item.media.find((m) => m.isPrimary) || item.media[0]).url
    : "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400";

  const isPriceOnRequest = item.priceType === "on_request" || !item.price;

  const handlePress = () => {
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
    <TouchableOpacity
      className="bg-white rounded-3xl mr-5 shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
      style={{ width: CARD_WIDTH }}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      {/* 1. Full-Bleed Image Container */}
      <View className="h-48 w-full bg-slate-100">
        <Image
          source={{ uri: primaryImage }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* 2. Streamlined Content Container */}
      <View className="p-4 flex-1 justify-between bg-white">
        
        {/* Title */}
        <Text 
          className="text-slate-800 font-jakarta-bold text-sm leading-snug mb-2" 
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Clean, bold price */}
        <View className="flex-col mt-auto">
          {isPriceOnRequest ? (
            <Text className="text-amber-600 font-jakarta-bold text-xs">
              Price on Request
            </Text>
          ) : (
            <Text className="text-slate-900 font-jakarta-black text-lg tracking-tight">
              ₹{item.price.toLocaleString()}
            </Text>
          )}
          
          {item.supplier?.business?.companyName ? (
            <Text className="text-[10px] text-slate-400 font-jakarta-medium mt-1" numberOfLines={1}>
              {item.supplier.business.companyName}
            </Text>
          ) : null}
        </View>
        
      </View>
    </TouchableOpacity>
  );
};

export default function HorizontalProductList() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const response = await fetch("https://backend.inquirybazaar.com/api/categories/sub/led-display-board/Delhi");
        const json = await response.json();
        if (json.success && json.data && json.data.products) {
          setProducts(json.data.products.slice(0, 10)); // Limit to top 10 items
        }
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  return (
    <View className="mt-8">

      {/* Section Header */}
      <View className="flex flex-row justify-between items-end px-5">
        <View className="flex-col">
          <Text className="text-[10px] font-jakarta-bold text-slate-400 tracking-[0.15em] mb-1 uppercase">
            TRENDING NOW
          </Text>
          <Text className="text-[26px] font-jakarta-extrabold text-slate-900 tracking-tighter leading-none">
            Featured
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          style={{ borderBottomWidth: 1, borderBottomColor: '#0f172a', paddingBottom: 2 }}
          onPress={() => router.push({
            pathname: "/Products_Page",
            params: {
              subCategorySlug: "led-display-board",
              subCategoryName: "LED Display Board",
            }
          })}
        >
          <Text className="text-slate-900 font-jakarta-bold text-sm tracking-tight">
            Explore
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal List or Spinner */}
      {isLoading ? (
        <View className="py-12 justify-center items-center">
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ProductCard item={item} />}
          className="mt-5 pl-5"
          contentContainerStyle={{ paddingRight: 20 }}
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          decelerationRate="fast"
          snapToAlignment="start"
        />
      )}
    </View>
  );
}