import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ManageProducts = () => {
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- API INTEGRATION ---
  useEffect(() => {
    fetchProducts(true);
  }, []);

  const fetchProducts = async (showGlobalLoader = true) => {
    if (showGlobalLoader) setIsLoading(true);
    try {
      // 🔓 Get the real logged-in ID saved during login
      const storedId = await AsyncStorage.getItem('supplierId');
      // Fallback ID for testing if no one is logged in
      const supplierId = storedId || "6a3654577d11e405b83317c5"; 
      
      const response = await fetch(`https://seller.inquirybazaar.com/api/product?supplierId=${supplierId}`);
      const json = await response.json();
      
      const productsArray = json.data || json.products || json || [];
      setProducts(productsArray);
      
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      if (showGlobalLoader) setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(false);
    setRefreshing(false);
  };

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(product => {
    const name = product.productName || product.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // --- PRODUCT CARD COMPONENT ---
  const renderProductCard = ({ item }: { item: any }) => {
    // API Fallbacks
    const displayImage = item.media?.[0]?.url || item.imageUri || item.images?.[0] || item.image || "https://images.unsplash.com/photo-1585202900225-6d3ac20a6962?q=80&w=400&auto=format&fit=crop";
    const displayName = item.productName || item.name || "Unnamed Product";
    const displayPrice = item.newPrice || item.price || "N/A";
    const displayUnit = item.unit || "Unit";
    const displayIndustry = item.industry || "Industry";
    const displayCategory = item.category || "Category";
    const displaySubCategory = item.subCategory || "Subcategory";

    return (
      <View className="flex-1 m-2 bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm shadow-slate-200">
        
        {/* Product Image Box */}
        <View className="h-36 w-full bg-slate-50 relative">
          <Image 
            source={{ uri: displayImage }} 
            className="w-full h-full" 
            resizeMode="cover" 
          />
          <View className="absolute inset-0 bg-black/5" />
        </View>

        {/* Card Content */}
        <View className="p-4 flex-1 justify-between">
          <View>
            {/* LAYERED MICRO-TYPOGRAPHY FOR INDUSTRY, CATEGORY & SUB-CATEGORY */}
            <View className="mb-2">
              <Text 
                className="text-[9px] font-jakarta-extrabold text-blue-900 uppercase tracking-widest mb-0.5"
                numberOfLines={1}
              >
                {displayIndustry}
              </Text>
              <Text 
                className="text-[10px] font-jakarta-medium text-slate-500 leading-tight"
                numberOfLines={1}
              >
                {displayCategory} • {displaySubCategory}
              </Text>
            </View>

            {/* Product Title */}
            <Text 
              className="text-[14px] font-jakarta-bold text-slate-900 leading-tight mb-2"
              numberOfLines={2}
            >
              {displayName}
            </Text>

            {/* Price */}
            <Text className="text-[16px] font-jakarta-extrabold text-slate-900">
              ₹ {displayPrice} <Text className="text-[11px] font-jakarta-medium text-slate-500">/ {displayUnit}</Text>
            </Text>
          </View>

          {/* Action Buttons Row */}
          <View className="flex-row items-center justify-end mt-4 pt-3 border-t border-slate-50 gap-x-2">
            <TouchableOpacity 
              onPress={() => router.push({
                pathname: "/Seller/AddProduct",
                params: { 
                  id: item._id || item.id,
                  name: displayName,
                  price: displayPrice,
                  unit: displayUnit,
                  category: item.categoryName || item.category?.name || item.category || displayCategory,
                  subCategory: item.subCategoryName || item.subCategory?.name || item.subCategory || displaySubCategory,
                  categoryId: item.categoryId?._id || item.categoryId || "",
                  subCategoryId: item.subCategoryId?._id || item.subCategoryId || "",
                  image: displayImage,
                  mediaStr: JSON.stringify(item.media || []),
                  brandName: item.brandName || "",
                  oldPrice: item.oldPrice ? String(item.oldPrice) : "",
                  priceType: item.priceType || "",
                  minOrderQty: item.minOrderQty ? String(item.minOrderQty) : "",
                  description: item.description || "",
                  deliveryTime: item.deliveryTime || "",
                  paymentTerms: item.paymentTerms || "",
                  packagingDetails: item.packagingDetails || "",
                  supplyAbility: item.supplyAbility || "",
                  youtubeLink: item.youtubeLink || "",
                  specifications: JSON.stringify(item.specifications || []),
                }
              })}
              className="h-8 w-8 bg-slate-50 rounded-lg items-center justify-center active:bg-slate-200 border border-slate-100"
            >
              <Ionicons name="create-outline" size={16} color="#1E3A8A" />
            </TouchableOpacity>
            <TouchableOpacity className="h-8 w-8 bg-red-50 rounded-lg items-center justify-center active:bg-red-100 border border-red-100">
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-slate-50" style={{ flex: 1 }}>
        
        {/* --- PREMIUM HEADER --- */}
        <View className="bg-white px-5 pb-5 pt-4 shadow-sm shadow-slate-100 z-20">
          
          {/* Top Row: Title, Total Count & Add Button */}
          <View className="flex-row items-start justify-between mb-5">
            <View>
              <Text className="text-2xl font-jakarta-extrabold text-slate-900 tracking-tight">Products</Text>
              <Text className="text-[13px] font-jakarta-medium text-slate-500 mt-0.5">
                {isLoading ? "Loading inventory..." : `Total ${filteredProducts.length} products listed`}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => router.push("/Seller/AddProduct")}
              className="flex-row items-center bg-blue-900 px-4 py-2.5 rounded-xl shadow-md shadow-blue-900/30 active:opacity-80"
            >
              <Ionicons name="add" size={18} color="#FFFFFF" className="mr-1" />
              <Text className="text-white font-jakarta-bold text-[14px]">Add New</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Row: Search & Filter */}
          <View className="flex-row items-center gap-x-3">
            <TouchableOpacity className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 w-1/3 active:bg-slate-100">
              <Text className="flex-1 text-[13px] font-jakarta-semibold text-slate-700" numberOfLines={1}>Category</Text>
              <Ionicons name="chevron-down" size={16} color="#64748B" />
            </TouchableOpacity>

            <View className="flex-1 flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 h-full">
              <Ionicons name="search" size={18} color="#94A3B8" className="mr-2" />
              <TextInput
                className="flex-1 text-[14px] font-jakarta-medium text-slate-900 h-full py-3"
                placeholder="Search products..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        {/* --- CONTENT AREA --- */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text className="mt-4 font-jakarta-medium text-slate-500">Fetching your catalog...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => item._id || item.id || index.toString()}
            renderItem={renderProductCard}
            numColumns={2}
            contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1E3A8A"]}
                tintColor="#1E3A8A"
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-20 px-8 mt-10">
                <View className="h-24 w-24 bg-slate-100 rounded-full items-center justify-center mb-6">
                  <Ionicons name="cube-outline" size={48} color="#CBD5E1" />
                </View>
                <Text className="text-lg font-jakarta-bold text-slate-900 mb-2">No products found</Text>
                <Text className="text-sm font-jakarta-medium text-slate-500 text-center">
                  {searchQuery ? "No products match your search." : "You haven't added any products yet."}
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ManageProducts;