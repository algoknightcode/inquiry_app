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
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

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
      const storedId = await AsyncStorage.getItem('supplierId');
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
    const displayImage = item.media?.[0]?.url || item.imageUri || item.images?.[0] || item.image || "https://images.unsplash.com/photo-1585202900225-6d3ac20a6962?q=80&w=400&auto=format&fit=crop";
    const displayName = item.productName || item.name || "Unnamed Product";
    const displayPrice = item.newPrice || item.price || "N/A";
    const displayUnit = item.unit || "Unit";
    const displayIndustry = item.industry || "Industry";
    const displayCategory = item.category || "Category";
    const displaySubCategory = item.subCategory || "Subcategory";

    return (
      <View style={s.card}>
        {/* Product Image Box */}
        <View style={s.imageBox}>
          <Image 
            source={{ uri: displayImage }} 
            style={s.image} 
            resizeMode="cover" 
          />
          <View style={s.imageOverlay} />
        </View>

        {/* Card Content */}
        <View style={s.cardContent}>
          <View>
            {/* LAYERED MICRO-TYPOGRAPHY FOR INDUSTRY, CATEGORY & SUB-CATEGORY */}
            <View style={{ marginBottom: verticalScale(6) }}>
              <Text 
                style={s.industryText}
                numberOfLines={1}
              >
                {displayIndustry}
              </Text>
              <Text 
                style={s.categoryText}
                numberOfLines={1}
              >
                {displayCategory} • {displaySubCategory}
              </Text>
            </View>

            {/* Product Title */}
            <Text 
              style={s.productName}
              numberOfLines={2}
            >
              {displayName}
            </Text>

            {/* Price */}
            <Text style={s.priceText}>
              ₹ {displayPrice} <Text style={s.unitText}>/ {displayUnit}</Text>
            </Text>
          </View>

          {/* Action Buttons Row */}
          <View style={s.actionsRow}>
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
              style={s.editBtn}
            >
              <Ionicons name="create-outline" size={moderateScale(15)} color="#1E3A8A" />
            </TouchableOpacity>
            <TouchableOpacity style={s.deleteBtn}>
              <Ionicons name="trash-outline" size={moderateScale(15)} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.flexContainer}>
        
        {/* --- PREMIUM HEADER --- */}
        <View style={s.headerContainer}>
          
          {/* Top Row: Title, Total Count & Add Button */}
          <View style={s.headerTopRow}>
            <View>
              <Text style={s.headerTitle}>Products</Text>
              <Text style={s.headerSubtitle}>
                {isLoading ? "Loading inventory..." : `Total ${filteredProducts.length} products listed`}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => router.push("/Seller/AddProduct")}
              style={s.addNewBtn}
            >
              <Ionicons name="add" size={moderateScale(18)} color="#FFFFFF" style={{ marginRight: scale(4) }} />
              <Text style={s.addNewBtnText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Row: Search & Filter */}
          <View style={s.searchFilterRow}>
            <TouchableOpacity style={s.categoryFilterBtn}>
              <Text style={s.categoryFilterText} numberOfLines={1}>Category</Text>
              <Ionicons name="chevron-down" size={moderateScale(14)} color="#64748B" />
            </TouchableOpacity>

            <View style={s.searchBar}>
              <Ionicons name="search" size={moderateScale(16)} color="#94A3B8" />
              <TextInput
                style={s.searchInput}
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
          <View style={s.loadingWrapper}>
            <ActivityIndicator size="large" color="#1E3A8A" />
            <Text style={s.loadingText}>Fetching your catalog...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item, index) => item._id || item.id || index.toString()}
            renderItem={renderProductCard}
            numColumns={2}
            contentContainerStyle={s.listContent}
            columnWrapperStyle={s.columnWrapper}
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
              <View style={s.emptyListWrapper}>
                <View style={s.emptyIconWrapper}>
                  <Ionicons name="cube-outline" size={moderateScale(42)} color="#CBD5E1" />
                </View>
                <Text style={s.emptyTitle}>No products found</Text>
                <Text style={s.emptySubtitle}>
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

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  flexContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(14),
    paddingTop: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "start",
    justifyContent: "space-between",
    marginBottom: verticalScale(14),
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    color: "#64748B",
    fontWeight: "600",
    marginTop: verticalScale(2),
  },
  addNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A8A",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10),
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  addNewBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(13),
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  categoryFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    height: verticalScale(38),
    width: "30%",
  },
  categoryFilterText: {
    flex: 1,
    fontSize: moderateScale(11.5),
    fontWeight: "600",
    color: "#475569",
    marginRight: scale(4),
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(10),
    height: verticalScale(38),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(12.5),
    fontWeight: "600",
    color: "#0F172A",
    height: "100%",
    paddingVertical: 0,
    marginLeft: scale(6),
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontWeight: "600",
    color: "#64748B",
    fontSize: moderateScale(13),
  },
  listContent: {
    padding: scale(10),
    paddingBottom: verticalScale(100),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 0.485,
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(18),
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: verticalScale(12),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  imageBox: {
    height: verticalScale(110),
    width: "100%",
    backgroundColor: "#F8FAFC",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  cardContent: {
    padding: moderateScale(10),
    flex: 1,
    justifyContent: "space-between",
  },
  industryText: {
    fontSize: moderateScale(8.5),
    fontWeight: "800",
    color: "#1E3A8A",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: verticalScale(2),
  },
  categoryText: {
    fontSize: moderateScale(9.5),
    fontWeight: "600",
    color: "#64748B",
  },
  productName: {
    fontSize: moderateScale(12.5),
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: verticalScale(16),
    marginBottom: verticalScale(6),
  },
  priceText: {
    fontSize: moderateScale(13.5),
    fontWeight: "800",
    color: "#0F172A",
  },
  unitText: {
    fontSize: moderateScale(10),
    color: "#64748B",
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: verticalScale(8),
    paddingTop: verticalScale(6),
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: scale(8),
  },
  editBtn: {
    height: scale(28),
    width: scale(28),
    borderRadius: moderateScale(6),
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  deleteBtn: {
    height: scale(28),
    width: scale(28),
    borderRadius: moderateScale(6),
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  emptyListWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(40),
    paddingHorizontal: scale(24),
    marginTop: verticalScale(20),
  },
  emptyIconWrapper: {
    height: scale(72),
    width: scale(72),
    backgroundColor: "#F8FAFC",
    borderRadius: scale(36),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(14),
  },
  emptyTitle: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: verticalScale(4),
  },
  emptySubtitle: {
    fontSize: moderateScale(12.5),
    color: "#64748B",
    textAlign: "center",
    lineHeight: verticalScale(16),
  },
});

export default ManageProducts;