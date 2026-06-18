import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { productCache } from "@/utils/productCache";

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
  businessType: string;
  social?: { whatsapp?: string };
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

// ── Component ──────────────────────────────────────────────────────────────
export default function ProductListingPage() {
  const router = useRouter();
  const { subCategoryName, subCategorySlug } =
    useLocalSearchParams<{
      subCategoryName?: string;
      subCategorySlug?: string;
      subCategoryId?: string;
    }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [location, setLocation] = useState("Delhi");

  useEffect(() => {
    if (!subCategorySlug) {
      setLoading(false);
      return;
    }
    const fetchProducts = async () => {
      try {
        const url = `https://backend.inquirybazaar.com/api/categories/sub/${subCategorySlug}/${location}`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.success && json.data) {
          setProducts(json.data.products || []);
          setTotalProducts(json.data.totalProducts || 0);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [subCategorySlug, location]);

  // ── Primary image helper ─────────────────────────────────────────────────
  const getPrimaryImage = (media: Media[]) => {
    if (!media || media.length === 0) return null;
    return (media.find((m) => m.isPrimary) || media[0]).url;
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="mt-4 text-slate-500 font-jakarta-medium text-[14px]">
          Finding suppliers…
        </Text>
      </SafeAreaView>
    );
  }

  // ── Product card ─────────────────────────────────────────────────────────
  const renderProduct = ({ item }: { item: Product }) => {
    const imageUri = getPrimaryImage(item.media);
    const company = item.supplier?.business?.companyName || item.supplier?.name || "Supplier";
    const city = item.supplier?.business?.city || "";
    const state = item.supplier?.business?.state || "";
    const locationText = [city, state].filter(Boolean).join(", ");
    const businessType = item.supplier?.business?.businessType || "";
    const whatsapp = item.supplier?.business?.social?.whatsapp;
    const phone = item.supplier?.phone;
    const isOnRequest = item.priceType === "on_request";

    return (
      <Pressable
        onPress={() => {
            productCache[item._id] = item;
            router.push({
              pathname: "/Products_Page/[slug]",
              params: {
                slug: item.slug,
                productId: item._id,
              },
            });
          }}
        android_ripple={{ color: "#e2e8f0" }}
        className="bg-white rounded-[24px] p-4 mb-5 border border-slate-100 shadow-sm shadow-slate-200/60"
      >
        {/* Image */}
        <View className="w-full h-48 rounded-2xl bg-slate-100 overflow-hidden mb-4">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={48} color="#cbd5e1" />
            </View>
          )}
          {/* Business type badge */}
          {businessType ? (
            <View className="absolute top-3 left-3 bg-indigo-600/90 px-2.5 py-1 rounded-md">
              <Text className="text-white font-jakarta-bold text-[10px] tracking-widest uppercase">
                {businessType}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Product name */}
        <Text className="text-[16px] font-jakarta-bold text-slate-900 leading-snug mb-3">
          {item.name}
        </Text>

        {/* Price & MOQ */}
        <View className="flex-row items-end mb-4 flex-wrap gap-y-1">
          {isOnRequest ? (
            <View className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <Text className="text-amber-700 font-jakarta-bold text-[13px]">
                Price on Request
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-2xl font-jakarta-extrabold text-indigo-600 tracking-tight">
                ₹{item.price?.toLocaleString()}
              </Text>
              <Text className="text-slate-500 font-jakarta-medium text-[13px] mb-1 ml-1">
                /{item.unit}
              </Text>
            </>
          )}
        </View>

        {/* Delivery time pill */}
        {item.deliveryTime ? (
          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={13} color="#64748b" />
            <Text className="text-slate-500 font-jakarta-medium text-[12px] ml-1">
              Delivery: {item.deliveryTime}
            </Text>
          </View>
        ) : null}

        {/* Divider */}
        <View className="w-full h-[1px] bg-slate-100 mb-4" />

        {/* Supplier info */}
        <View className="flex-row items-center mb-4">
          {item.supplier?.profileImage ? (
            <Image
              source={{ uri: item.supplier.profileImage }}
              style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-2.5">
              <Ionicons name="business-outline" size={18} color="#4f46e5" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-slate-800 font-jakarta-bold text-[14px]" numberOfLines={1}>
              {company}
            </Text>
            {locationText ? (
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="location" size={11} color="#94a3b8" />
                <Text className="text-slate-500 font-jakarta-medium text-[11px] ml-0.5">
                  {locationText}
                </Text>
              </View>
            ) : null}
          </View>
          {/* Verified badge */}
          <View className="flex-row items-center bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
            <MaterialCommunityIcons name="shield-check" size={12} color="#2563eb" />
            <Text className="text-blue-600 font-jakarta-bold text-[10px] ml-1">Verified</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => phone && Linking.openURL(`tel:${phone}`)}
            className="flex-1 flex-row justify-center items-center py-3 rounded-xl border border-slate-200 active:bg-slate-50 mr-2"
          >
            <Ionicons name="call-outline" size={16} color="#475569" />
            <Text className="text-slate-700 font-jakarta-bold text-[12px] ml-1.5">Call</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-[2] flex-row justify-center items-center py-3 rounded-xl bg-indigo-600 active:opacity-90 shadow-sm shadow-indigo-600/30">
            <Ionicons name="mail-outline" size={16} color="white" />
            <Text className="text-white font-jakarta-bold text-[12px] ml-1.5">Inquiry</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View className="bg-white px-5 pt-2 pb-4 border-b border-slate-100 shadow-sm shadow-slate-200/50 z-10">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1 mr-4">
            <TouchableOpacity className="mr-3 active:opacity-50" onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text
              className="text-[18px] font-jakarta-bold text-slate-900 tracking-tight flex-1"
              numberOfLines={1}
            >
              {subCategoryName || "Products"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="ml-3 active:opacity-50">
              <Ionicons name="options-outline" size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Count + Location pill row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-slate-500 font-jakarta-medium text-[13px]">
            {totalProducts} suppliers found
          </Text>
          <Pressable className="flex-row items-center bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
            <Ionicons name="location-outline" size={13} color="#64748b" />
            <Text className="text-slate-700 font-jakarta-semibold text-[12px] ml-1 mr-0.5">
              {location}
            </Text>
            <Ionicons name="chevron-down" size={13} color="#64748b" />
          </Pressable>
        </View>
      </View>

      {/* PRODUCT LIST */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name="cube-outline" size={56} color="#cbd5e1" />
            <Text className="text-slate-400 font-jakarta-bold text-[16px] mt-4">
              No products found
            </Text>
            <Text className="text-slate-400 font-jakarta-medium text-[13px] mt-1 text-center px-8">
              No suppliers for this category in {location} yet.
            </Text>
          </View>
        }
      />

      {/* FLOATING POST REQUIREMENT BUTTON */}
      <View
        className={`absolute bottom-0 w-full px-5 pt-10 ${
          Platform.OS === "ios" ? "pb-8" : "pb-6"
        }`}
        style={{ backgroundColor: "transparent" }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          activeOpacity={0.9}
          className="w-full bg-[#0f172a] flex-row justify-between items-center px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/20"
        >
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mr-3">
              <Ionicons name="document-text" size={16} color="#fff" />
            </View>
            <View>
              <Text className="text-white font-jakarta-bold text-[16px]">Post a Requirement</Text>
              <Text className="text-slate-400 font-jakarta-medium text-[11px] mt-0.5">
                Get multiple quotes instantly
              </Text>
            </View>
          </View>
          <View className="w-8 h-8 bg-indigo-600 rounded-full items-center justify-center">
            <Ionicons name="arrow-forward" size={18} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}