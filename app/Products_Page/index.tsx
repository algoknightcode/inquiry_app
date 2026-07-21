import { Spinner } from "@/components/ui/spinner";
import { setProductCache } from "@/utils/productCache";
import { globalSellerId } from "@/utils/roleCache";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  email?: string;
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
  subCategoryName?: string;
};

const POPULAR_CITIES = [
  "All India",
  "Delhi",
  "New Delhi",
  "Lucknow",
  "Kanpur",
  "Noida",
  "Ghaziabad",
  "Meerut",
  "Varanasi",
  "Agra",
  "Greater Noida",
  "Ludhiana",
  "Amritsar",
  "Gurugram",
  "Kundli",
  "Sonipat",
  "Rohtak",
  "Faridabad",
  "Mumbai",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Chennai",
  "Coimbatore",
  "Bengaluru",
  "Mysuru",
  "Hyderabad",
  "Warangal",
  "Ajmer",
  "Jodhpur",
  "Jaipur",
  "Udaipur",
  "Gwalior",
  "Indore",
  "Bhopal",
  "Kolkata",
  "Durgapur",
  "Patna",
  "Muzaffarpur",
  "Bhubaneswar",
  "Cuttack",
  "Visakhapatnam",
  "Vijayawada",
  "Kochi",
  "Thiruvananthapuram",
  "Raipur",
  "Bhilai",
  "Ranchi",
  "Jamshedpur",
  "Guwahati",
  "Dibrugarh",
  "Dehradun",
  "Haridwar",
  "Shimla",
  "Baddi",
  "Srinagar",
  "Jammu",
  "Goa",
  "Chandigarh"
];

// ── Component ──────────────────────────────────────────────────────────────
export default function ProductListingPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    subCategoryName?: string;
    subCategorySlug?: string;
    subCategoryId?: string;
    location?: string;
    search?: string;
    isParentCategory?: string;
  }>();

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const subCategoryName = params.subCategoryName || "All Products";
  const subCategorySlug = params.subCategorySlug || "led-display-board";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [location, setLocation] = useState(() => {
    const passedCity = params.location || params.search;
    if (passedCity) {
      const matched = POPULAR_CITIES.find(
        (c) => c.toLowerCase() === passedCity.toLowerCase()
      );
      return matched || passedCity;
    }
    return "Delhi";
  });

  // Reset pagination when category or location changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
  }, [subCategorySlug, location]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");

  // --- INQUIRY MODAL STATES ---
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);
  const [isInquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [showInquirySuccessModal, setShowInquirySuccessModal] = useState(false);
  const [inqName, setInqName] = useState("");
  const [inqEmail, setInqEmail] = useState("");
  const [inqPhone, setInqPhone] = useState("");
  const [inqMessage, setInqMessage] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  const handleSendInquiry = async () => {
    if (!inqName.trim() || !inqPhone.trim() || !inqMessage.trim() || !inqEmail.trim()) {
      Alert.alert("Required Fields", "Please provide your Name, Email, Phone Number, and Message.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inqEmail.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setIsSubmittingInquiry(true);
    try {
      const globalUserId = globalSellerId || await AsyncStorage.getItem("buyerId") || await AsyncStorage.getItem("supplierId");

      let supToken = typeof selectedProductForInquiry?.supplier === "string" 
        ? selectedProductForInquiry.supplier 
        : (selectedProductForInquiry?.supplier?._id);

      if (!supToken && globalUserId) {
        supToken = globalUserId;
      }

      const payload = {
        supplierToken: supToken || "NA",
        platform: "App Product Listing",
        platformEmail: selectedProductForInquiry?.supplier?.email || "lead.inquirybazaar@gmail.com",
        name: inqName,
        email: inqEmail || "NA",
        company: "NA",
        phone: inqPhone,
        product: selectedProductForInquiry?.name || "NA",
        place: "NA",
        message: inqMessage,
      };

      console.log("📤 Sending Payload:", JSON.stringify(payload, null, 2));

      const res = await fetch("https://brandbnalo.com/api/form/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(globalUserId ? { "x-user-id": globalUserId } : {})
        },
        body: JSON.stringify(payload),
      });

      const resText = await res.text();
      console.log("📥 Response Status:", res.status);
      console.log("📥 Response Body:", resText);

      if (res.ok) {
        setInquiryModalVisible(false);
        setShowInquirySuccessModal(true);
        
        // Reset fields
        setInqName("");
        setInqEmail("");
        setInqPhone("");
        setInqMessage("");
      } else {
        let errorMsg = "Failed to send inquiry.";
        try {
          const errorData = JSON.parse(resText);
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {}
        Alert.alert("Submission Failed", errorMsg);
      }
    } catch (error) {
      console.error("Inquiry Error:", error);
      Alert.alert("Error", "A network error occurred. Please try again.");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  // Memoize filtered products to prevent re-filtering on every render
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      const productName = product.name?.toLowerCase() || "";
      const companyName = product.supplier?.business?.companyName?.toLowerCase() || "";
      const supplierName = product.supplier?.name?.toLowerCase() || "";
      return productName.includes(query) || companyName.includes(query) || supplierName.includes(query);
    });
  }, [products, searchQuery]);

  const prevSlug = useRef(subCategorySlug);
  const prevLocation = useRef(location);

  useEffect(() => {
    if (!subCategorySlug) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchProducts = async () => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setIsFetchingMore(true);
        }

        // Force API to always request products for "India" (All India) regardless of UI location selection
        const apiLocation = "India";
        let fetchedList: Product[] = [];
        
        if (params.isParentCategory === 'true') {
          // 1. Fetch industries tree to get the subcategories list
          const treeRes = await fetch("https://backend.inquirybazaar.com/api/industries/tree", { signal });
          const treeJson = await treeRes.json();
          let subSlugs: string[] = [];
          if (treeJson.success && Array.isArray(treeJson.data)) {
            // Find the category by slug or id and gather subcategory slugs
            for (const industry of treeJson.data) {
              if (Array.isArray(industry.categories)) {
                const matchedCat = industry.categories.find((c: any) => c.slug === subCategorySlug || c._id === params.subCategoryId);
                if (matchedCat && Array.isArray(matchedCat.subCategories)) {
                  subSlugs = matchedCat.subCategories.map((s: any) => s.slug).filter(Boolean);
                  break;
                }
              }
            }
          }

          if (subSlugs.length > 0) {
            // 2. Fetch products for each subcategory in parallel with pagination parameters
            const fetchPromises = subSlugs.map(async (slug) => {
              try {
                const url = `https://backend.inquirybazaar.com/api/categories/sub/${slug}/${apiLocation}?page=${page}&limit=13`;
                const res = await fetch(url, { signal });
                const json = await res.json();
                if (json.success && json.data && Array.isArray(json.data.products)) {
                  return json.data.products.map((p: any) => ({
                    ...p,
                    subCategoryName: json.data.category?.name || ''
                  }));
                }
              } catch (e) {
                console.error(`Error fetching products for subcategory ${slug}:`, e);
              }
              return [];
            });

            const results = await Promise.all(fetchPromises);
            const seenIds = new Set<string>();

            for (const prodList of results) {
              for (const product of prodList) {
                if (product && product._id && !seenIds.has(product._id)) {
                  seenIds.add(product._id);
                  fetchedList.push(product);
                }
              }
            }
          } else {
            // Fallback: normal single category request with pagination
            const url = `https://backend.inquirybazaar.com/api/categories/sub/${subCategorySlug}/${apiLocation}?page=${page}&limit=13`;
            const response = await fetch(url, { signal });
            const json = await response.json();
            if (json.success && json.data && Array.isArray(json.data.products)) {
              fetchedList = json.data.products;
            }
          }
        } else {
          // Normal subcategory fetch with pagination
          const url = `https://backend.inquirybazaar.com/api/categories/sub/${subCategorySlug}/${apiLocation}?page=${page}&limit=13`;
          const response = await fetch(url, { signal });
          const json = await response.json();
          if (json.success && json.data && Array.isArray(json.data.products)) {
            fetchedList = json.data.products;
          }
        }

        if (isMounted.current) {
          const MAX_PRODUCTS_IN_MEMORY = 100;
          if (page === 1) {
            setProducts(fetchedList);
            setTotalProducts(fetchedList.length);
          } else {
            setProducts(prev => {
              const existingIds = new Set(prev.map(p => p._id));
              const uniques = fetchedList.filter(p => !existingIds.has(p._id));
              const combined = [...prev, ...uniques];
              // Sliding window: drop oldest items from the front if we exceed the cap
              return combined.length > MAX_PRODUCTS_IN_MEMORY
                ? combined.slice(combined.length - MAX_PRODUCTS_IN_MEMORY)
                : combined;
            });
            setTotalProducts(prev => prev + fetchedList.length);
          }

          if (fetchedList.length === 0 || (params.isParentCategory !== 'true' && fetchedList.length < 13)) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error fetching products:", err);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    };
    
    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [subCategorySlug, location, isMounted, page, params.isParentCategory, params.subCategoryId]);

  const handleLoadMore = () => {
    if (!hasMore || isFetchingMore || loading) return;
    setIsFetchingMore(true);
    setPage(prev => prev + 1);
  };

  // ── Primary image helper ─────────────────────────────────────────────────
  const getPrimaryImage = (media: Media[]) => {
    if (!media || media.length === 0) return null;
    return (media.find((m) => m.isPrimary) || media[0]).url;
  };

  // ── Product card ─────────────────────────────────────────────────────────
  // Memoize renderProduct so FlatList doesn't re-render item cells unnecessarily
  const renderProduct = useCallback(({ item }: { item: Product }) => {
    const imageUri = getPrimaryImage(item.media);
    const company = item.supplier?.business?.companyName || item.supplier?.name || "Supplier";
    const city = item.supplier?.business?.city || "";
    const state = item.supplier?.business?.state || "";
    const locationText = [city, state].filter(Boolean).join(", ");
    const businessType = item.supplier?.business?.businessType || "";
    const whatsapp = item.supplier?.business?.social?.whatsapp;
    const phone = item.supplier?.phone;
    const isOnRequest = item.priceType === "on_request";
    const subCategoryNameToShow = item.subCategoryName || (params.isParentCategory !== 'true' ? params.subCategoryName : '');

    return (
      <View className="bg-white rounded-[24px] p-4 mb-5 border border-slate-100 shadow-sm shadow-slate-200/60">
      <Pressable
        onPress={() => {
            setProductCache(item._id, item);
            router.push({
              pathname: "/Products_Page/[slug]",
              params: {
                slug: item.slug,
                productId: item._id,
              },
            });
          }}
        android_ripple={{ color: "#e2e8f0" }}
      >
        {/* Image */}
        <View className="w-full rounded-2xl bg-slate-100 overflow-hidden mb-4" style={{ height: 212 }}>
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
            <View className="absolute top-3 left-3 bg-blue-900 px-2.5 py-1 rounded-md">
              <Text className="text-white font-jakarta-bold text-[10px] tracking-widest uppercase">
                 VERIFIED
              </Text>
            </View>
          ) : null}
        </View>

        {/* Product name Row */}
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-[16px] font-jakarta-bold text-slate-900 leading-snug flex-1">
            {item.name}
          </Text>
        </View>

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
            <Text className="text-slate-800 font-jakarta-bold text-[15px]" numberOfLines={1}>
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

        </Pressable>
        {/* Action buttons */}
        <View className="flex-row justify-between mt-2">
          <TouchableOpacity
            onPress={() => phone && Linking.openURL(`tel:${phone}`)}
            className="flex-1 flex-row justify-center items-center py-3 rounded-xl border-[2px] border-[#1e3a8a] bg-white active:bg-slate-50 mr-2"
          >
            <Ionicons name="call" size={15} color="#1e3a8a" />
            <Text className="text-[#1e3a8a] font-jakarta-bold text-[14px] ml-1">Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!phone) return;
              const cleanPhone = phone.replace(/[^\d]/g, '');
              const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
              const resolvedCompanyName = item.supplier?.business?.companyName || item.supplier?.name || "";
              const greeting = resolvedCompanyName ? `Hello ${resolvedCompanyName}` : "Hello";
              const message = `${greeting}, I am interested in your product: ${item.name} listed on Inquiry Bazaar.\n\nLink: https://dir.inquirybazaar.com/products/${item.slug}`;
              const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
              Linking.openURL(url).catch(() => {
                Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
              });
            }}
            style={{ shadowColor: "#25D366", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 }}
            className="flex-1 flex-row justify-center items-center py-3 rounded-xl bg-[#25D366] active:opacity-80 mr-2"
          >
            <Ionicons name="logo-whatsapp" size={16} color="#fff" />
            <Text className="text-white font-jakarta-bold text-[14px] ml-1">WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedProductForInquiry(item);
              setInqMessage(`Hi, I am interested in your product: ${item.name}. Please share pricing and details.`);
              setInquiryModalVisible(true);
            }}
            className="flex-[1.5] flex-row justify-center items-center py-3 rounded-xl bg-[#1e3a8a] active:opacity-90"
          >
            <Ionicons name="paper-plane-outline" size={15} color="white" />
            <Text className="text-white font-jakarta-bold text-[14px] ml-1">Inquiry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, []);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <Spinner size="large" color="#4f46e5" />
        <Text className="mt-4 text-slate-500 font-jakarta-medium text-[14px]">
          Finding suppliers…
        </Text>
      </SafeAreaView>
    );
  }

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

        {/* Search Bar */}
        <View
          className={`flex-row items-center bg-white border rounded-[16px] h-[56px] px-[18px] mb-4 ${
            isFocused ? "border-[#4F46E5]" : "border-[#E5E7EB]"
          }`}
        >
          <Ionicons name="search-outline" size={20} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search shops, products, or makers"
            placeholderTextColor="#6B7280"
            style={{ flex: 1, height: '100%', color: '#111827', fontSize: 15 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Count + Location pill row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-slate-500 font-jakarta-medium text-[13px]">
            {filteredProducts.length} suppliers found
          </Text>
          <Pressable 
            onPress={() => setCityModalVisible(true)}
            className="flex-row items-center bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200 active:bg-slate-200"
          >
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
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews={Platform.OS === "android"}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isFetchingMore ? (
            <View className="py-6 items-center justify-center">
              <ActivityIndicator size="small" color="#4f46e5" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <Ionicons name={searchQuery ? "search-outline" : "cube-outline"} size={56} color="#cbd5e1" />
            <Text className="text-slate-400 font-jakarta-bold text-[16px] mt-4">
              {searchQuery ? "No matching products" : "No products found"}
            </Text>
            <Text className="text-slate-400 font-jakarta-medium text-[13px] mt-1 text-center px-8">
              {searchQuery
                ? "Try searching for a different keyword or category."
                : `No suppliers for this category in ${location} yet.`}
            </Text>
          </View>
        }
      />


      {/* CITY SELECTION MODAL */}
      <Modal
        visible={cityModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setCityModalVisible(false);
          setCitySearchQuery("");
        }}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] h-[75%] px-5 pt-6 pb-8 shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-[20px] font-jakarta-extrabold text-slate-900">
                Select Location
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCityModalVisible(false);
                  setCitySearchQuery("");
                }}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
              >
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* City Search Box */}
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-[16px] h-[52px] px-4 mb-5">
              <Ionicons name="search-outline" size={18} color="#64748b" style={{ marginRight: 6 }} />
              <TextInput
                placeholder="Search city..."
                placeholderTextColor="#94a3b8"
                style={{ flex: 1, height: '100%', color: '#1e293b', fontSize: 14 }}
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Scrollable list of cities */}
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Popular Cities Grid (Only show when not searching) */}
              {!citySearchQuery && (
                <View className="mb-6">
                  <Text className="text-[14px] font-jakarta-bold text-slate-400 mb-3 uppercase tracking-wider">
                    Popular Cities
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {POPULAR_CITIES.map((city) => {
                      const isSelected = location.toLowerCase() === city.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={city}
                          onPress={() => {
                            setLocation(city);
                            setCityModalVisible(false);
                          }}
                          className={`px-4 py-2.5 rounded-full border ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-slate-50 border-slate-200 active:bg-slate-100"
                          }`}
                        >
                          <Text
                            className={`font-jakarta-semibold text-[13px] ${
                              isSelected ? "text-white" : "text-slate-700"
                            }`}
                          >
                            {city}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Matching Cities List */}
              <View>
                <Text className="text-[14px] font-jakarta-bold text-slate-400 mb-2 uppercase tracking-wider">
                  {citySearchQuery ? "Search Results" : "All Cities"}
                </Text>
                {POPULAR_CITIES.filter((city) =>
                  city.toLowerCase().includes(citySearchQuery.toLowerCase().trim())
                ).map((city) => {
                  const isSelected = location.toLowerCase() === city.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={city}
                      onPress={() => {
                        setLocation(city);
                        setCityModalVisible(false);
                        setCitySearchQuery("");
                      }}
                      className="flex-row items-center justify-between py-4 border-b border-slate-100 active:bg-slate-50"
                    >
                      <Text
                        className={`font-jakarta-bold text-[15px] ${
                          isSelected ? "text-indigo-600" : "text-slate-800"
                        }`}
                      >
                        {city}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color="#4f46e5" />
                      )}
                    </TouchableOpacity>
                  );
                })}
                {POPULAR_CITIES.filter((city) =>
                  city.toLowerCase().includes(citySearchQuery.toLowerCase().trim())
                ).length === 0 && (
                  <View className="py-8 items-center">
                    <Text className="text-slate-400 font-jakarta-medium text-[14px]">
                      No matching cities found
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* INQUIRY MODAL (THE FORM) */}
      <Modal
        visible={isInquiryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setInquiryModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-white rounded-t-[32px] p-6 max-h-[90%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-[20px] font-jakarta-extrabold text-slate-900">Contact Supplier</Text>
              <TouchableOpacity
                onPress={() => setInquiryModalVisible(false)}
                className="p-1.5 bg-slate-100 rounded-full active:bg-slate-200"
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProductForInquiry && (
                <View className="flex-row items-center bg-slate-50 p-3 rounded-2xl mb-6 border border-slate-200/80">
                  {selectedProductForInquiry.media && selectedProductForInquiry.media.length > 0 ? (
                    <Image
                      source={{ uri: (selectedProductForInquiry.media.find((m) => m.isPrimary) || selectedProductForInquiry.media[0]).url }}
                      style={{ width: 60, height: 60, borderRadius: 12 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-[60px] h-[60px] rounded-xl bg-slate-200 items-center justify-center">
                      <Ionicons name="image" size={24} color="#94a3b8" />
                    </View>
                  )}
                  <View className="flex-1 ml-3">
                    <Text className="text-[14px] font-jakarta-bold text-slate-900" numberOfLines={2}>
                      {selectedProductForInquiry.name}
                    </Text>
                    <Text className="text-[13px] text-slate-500 mt-1 font-jakarta-semibold">
                      {selectedProductForInquiry.supplier?.business?.companyName || selectedProductForInquiry.supplier?.name || "Supplier"}
                    </Text>
                  </View>
                </View>
              )}

              <View className="flex-row items-center border border-slate-200 rounded-2xl px-4 h-[52px] mb-4 bg-slate-50">
                <Ionicons name="person-outline" size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, height: '100%', color: '#0f172a', fontSize: 14 }}
                  placeholder="Your Name *"
                  placeholderTextColor="#94a3b8"
                  value={inqName}
                  onChangeText={setInqName}
                />
              </View>

              <View className="flex-row items-center border border-slate-200 rounded-2xl px-4 h-[52px] mb-4 bg-slate-50">
                <Ionicons name="mail-outline" size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, height: '100%', color: '#0f172a', fontSize: 14 }}
                  placeholder="Your Email"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={inqEmail}
                  onChangeText={setInqEmail}
                />
              </View>

              <View className="flex-row items-center border border-slate-200 rounded-2xl px-4 h-[52px] mb-4 bg-slate-50">
                <Ionicons name="call-outline" size={18} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  style={{ flex: 1, height: '100%', color: '#0f172a', fontSize: 14 }}
                  placeholder="Phone Number *"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={inqPhone}
                  onChangeText={setInqPhone}
                />
              </View>

              <View className="flex-row items-start border border-slate-200 rounded-2xl px-4 py-3 h-[120px] mb-6 bg-slate-50">
                <Ionicons name="chatbubble-outline" size={18} color="#64748b" style={{ marginRight: 10, marginTop: 2 }} />
                <TextInput
                  style={{ flex: 1, height: '100%', color: '#0f172a', fontSize: 14, textAlignVertical: 'top' }}
                  placeholder="Your Message *"
                  placeholderTextColor="#94a3b8"
                  multiline
                  value={inqMessage}
                  onChangeText={setInqMessage}
                />
              </View>

              <TouchableOpacity
                onPress={handleSendInquiry}
                disabled={isSubmittingInquiry}
                className="bg-indigo-600 h-[56px] rounded-2xl items-center justify-center flex-row mb-6 active:opacity-90 shadow-lg shadow-indigo-600/30"
              >
                {isSubmittingInquiry ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-[16px] font-jakarta-bold">Submit Inquiry</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CUSTOM SUCCESS MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showInquirySuccessModal}
        onRequestClose={() => setShowInquirySuccessModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="w-full max-w-[320px] bg-white rounded-3xl p-6 items-center shadow-2xl">
            <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={36} color="#10b981" />
            </View>
            <Text className="text-[20px] font-jakarta-extrabold text-slate-900 mb-2 text-center">
              Inquiry Sent!
            </Text>
            <Text className="text-[14px] text-slate-500 font-jakarta-medium text-center mb-6 leading-relaxed">
              Your inquiry has been successfully sent to the supplier. They will contact you shortly.
            </Text>
            <TouchableOpacity
              onPress={() => setShowInquirySuccessModal(false)}
              className="w-full bg-slate-900 h-[50px] rounded-2xl items-center justify-center active:opacity-90"
            >
              <Text className="text-white font-jakarta-bold text-[15px]">Great, thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}