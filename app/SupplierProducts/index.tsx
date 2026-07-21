import EnquiryModal from "@/components/EnquiryModal";
import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Module-level singleton: fetched ONCE per app session, never again ───────
type IndustryTreeCache = {
  catNames: { [key: string]: string };
  subNames: { [key: string]: string };
} | null;
let _industryTreeCache: IndustryTreeCache = null;
let _industryTreeFetchPromise: Promise<IndustryTreeCache> | null = null;

async function getIndustryTree(): Promise<IndustryTreeCache> {
  if (_industryTreeCache) return _industryTreeCache;
  if (_industryTreeFetchPromise) return _industryTreeFetchPromise;

  _industryTreeFetchPromise = fetch("https://backend.inquirybazaar.com/api/industries/tree")
    .then(res => res.json())
    .then(json => {
      if (json.success && Array.isArray(json.data)) {
        const catNames: { [key: string]: string } = {};
        const subNames: { [key: string]: string } = {};
        json.data.forEach((industry: any) => {
          if (Array.isArray(industry.categories)) {
            industry.categories.forEach((cat: any) => {
              catNames[cat._id] = cat.name;
              if (Array.isArray(cat.subCategories)) {
                cat.subCategories.forEach((sub: any) => {
                  subNames[sub._id] = sub.name;
                });
              }
            });
          }
        });
        _industryTreeCache = { catNames, subNames };
      }
      _industryTreeFetchPromise = null;
      return _industryTreeCache;
    })
    .catch(err => {
      _industryTreeFetchPromise = null;
      console.error("Industry tree fetch failed:", err);
      return null;
    });

  return _industryTreeFetchPromise;
}
// ─────────────────────────────────────────────────────────────────────────────


export default function SupplierProductsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numColumns = isTablet ? 3 : 2;

  const params = useLocalSearchParams<{
    supplierId?: string;
    companyName?: string;
    city?: string;
    state?: string;
    phone?: string;
    businessType?: string;
    profileImage?: string;
    address?: string;
  }>();

  const { supplierId, companyName, city, state, phone, businessType, profileImage, address } = params;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<any | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [categoryNames, setCategoryNames] = useState<{ [key: string]: string }>({});
  const [subCategoryNames, setSubCategoryNames] = useState<{ [key: string]: string }>({});

  const isMounted = useRef(true);

  // Load industry category/subCategory names — uses module-level singleton,
  // so the network request only fires once in the entire app session.
  useEffect(() => {
    let cancelled = false;
    getIndustryTree().then(tree => {
      if (cancelled || !tree || !isMounted.current) return;
      setCategoryNames(tree.catNames);
      setSubCategoryNames(tree.subNames);
    });
    return () => { cancelled = true; };
  }, []);

  const fetchSupplierProducts = useCallback(async (showLoader = true, signal?: AbortSignal) => {
    if (!supplierId) {
      setLoading(false);
      return;
    }
    if (showLoader) setLoading(true);

    try {
      const response = await fetch(`https://seller.inquirybazaar.com/api/product?supplierId=${supplierId}`, { signal });
      const json = await response.json();
      if (isMounted.current) {
        const fetchedList = json.data || json.products || json || [];
        setProducts(Array.isArray(fetchedList) ? fetchedList : []);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching supplier products:", error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [supplierId]);

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();
    fetchSupplierProducts(true, controller.signal);

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [fetchSupplierProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSupplierProducts(false);
  }, [fetchSupplierProducts]);

  const openWhatsApp = (productName?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^\d]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = productName
      ? `Hello ${companyName || "Supplier"}, I am inquiring about your product: ${productName} on Inquiry Bazaar.`
      : `Hello ${companyName || "Supplier"}, I found your profile on Inquiry Bazaar and would like to inquire about your products.`;

    const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
        }
      })
      .catch(() => {
        Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
      });
  };

  const displayCompany = companyName || "Supplier Catalog";
  const locationText = [city, state].filter(Boolean).join(", ");

  const renderProductCard = useCallback(
    ({ item }: { item: any }) => {
      const media = item.media || item.images || [];
      const primaryImage = (media.find((m: any) => m.isPrimary) || media[0])?.url || item.imageUri || item.image || null;
      const name = item.name || item.productName || "Product";
      const price = item.price || item.newPrice;
      const isOnRequest = item.priceType === "on_request" || !price;

      const category =
        item.categoryName ||
        item.category?.name ||
        (typeof item.category === "string" ? item.category : null) ||
        item.categoryId?.name ||
        categoryNames[item.categoryId?._id || item.categoryId] ||
        null;

      const subCategory =
        item.subCategoryName ||
        item.subCategory?.name ||
        (typeof item.subCategory === "string" ? item.subCategory : null) ||
        item.subCategoryId?.name ||
        subCategoryNames[item.subCategoryId?._id || item.subCategoryId] ||
        null;

      const categoryLabel = [category, subCategory].filter(Boolean).join(" • ");

      return (
        <View style={s.cardWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              router.push({
                pathname: "/Products_Page/[slug]",
                params: {
                  slug: item.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  productId: item._id || item.id,
                },
              });
            }}
            style={s.card}
          >
            {/* Image Box */}
            <View style={s.imageBox}>
              {primaryImage ? (
                <Image source={{ uri: primaryImage }} style={s.image} contentFit="cover" transition={200} />
              ) : (
                <View style={s.imageFallback}>
                  <Ionicons name="image-outline" size={36} color="#cbd5e1" />
                </View>
              )}
            </View>

            {/* Card Content */}
            <View style={s.cardContent}>
              <View>
                {categoryLabel ? (
                  <Text style={s.subCategoryText} numberOfLines={1}>
                    {categoryLabel}
                  </Text>
                ) : null}

                <Text style={s.productTitle} numberOfLines={2}>
                  {name}
                </Text>
              </View>

              {isOnRequest ? (
                <Text style={s.priceOnRequest}>Price on Request</Text>
              ) : (
                <Text style={s.priceText}>
                  ₹{Number(price).toLocaleString()}{" "}
                  <Text style={s.unitText}>/ {item.unit || "unit"}</Text>
                </Text>
              )}

              {item.minOrderQty ? (
                <Text style={s.moqText}>MOQ: {item.minOrderQty} {item.unit || "units"}</Text>
              ) : null}

              {/* Inquiry Action Button */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedProductForInquiry({
                    ...item,
                    supplier: {
                      _id: supplierId,
                      name: companyName,
                      phone: phone,
                      business: { companyName, city, state },
                    },
                  });
                  setModalVisible(true);
                }}
                style={s.inquireBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="paper-plane-outline" size={14} color="#fff" />
                <Text style={s.inquireBtnText}>Send Inquiry</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [router, supplierId, companyName, phone, city, state, categoryNames, subCategoryNames]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- TOP HEADER BAR --- */}
      <View
        style={[
          s.headerBar,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {displayCompany}
          </Text>
          <Text style={s.headerSubtitle} numberOfLines={1}>
            All Products & Catalog
          </Text>
        </View>
      </View>

      {/* --- CONTENT FLATLIST WITH SUPPLIER HEADER --- */}
      <FlatList
        key={numColumns} // Re-render if layout orientation or device type changes columns
        data={products}
        keyExtractor={(item, idx) => item._id || item.id || idx.toString()}
        renderItem={renderProductCard}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? s.columnWrapper : undefined}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e3a8a"]} tintColor="#1e3a8a" />
        }
        ListHeaderComponent={
          <View style={s.supplierHeaderCard}>
            {/* Top row: Avatar + Name + Verified */}
            <View style={s.supplierTopRow}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={s.profileAvatar} contentFit="cover" />
              ) : (
                <View style={s.profileAvatarFallback}>
                  <MaterialCommunityIcons name="domain" size={28} color="#2563eb" />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <View style={s.nameRow}>
                  <Text style={s.companyNameText} numberOfLines={1}>
                    {displayCompany}
                  </Text>
                  <View style={s.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
                    <Text style={s.verifiedText}>VERIFIED</Text>
                  </View>
                </View>

                {businessType ? <Text style={s.businessTypeText}>{businessType}</Text> : null}
              </View>
            </View>

            {/* Address Row */}
            {address || locationText ? (
              <View style={s.infoRow}>
                <Feather name="map-pin" size={14} color="#0284c7" style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={s.infoText}>{address || locationText}</Text>
              </View>
            ) : null}

            {/* Phone Row & Action Buttons */}
            <View style={s.actionRow}>
              {phone ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${phone}`)}
                  style={s.callActionBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={16} color="#1e3a8a" />
                  <Text style={s.callActionText}>Call</Text>
                </TouchableOpacity>
              ) : null}

              {phone ? (
                <TouchableOpacity
                  onPress={() => openWhatsApp()}
                  style={s.whatsappActionBtn}
                  activeOpacity={0.8}
                >
                  <FontAwesome name="whatsapp" size={18} color="#25D366" />
                  <Text style={s.whatsappActionText}>WhatsApp</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Section Divider */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>All Listed Products</Text>
              <View style={s.countBadge}>
                <Text style={s.countBadgeText}>{products.length} Products</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={s.centerBox}>
              <ActivityIndicator size="large" color="#1e3a8a" />
              <Text style={s.loadingText}>Fetching supplier catalog...</Text>
            </View>
          ) : (
            <View style={s.centerBox}>
              <Ionicons name="cube-outline" size={56} color="#cbd5e1" />
              <Text style={s.emptyTitle}>No products listed yet</Text>
              <Text style={s.emptySubtitle}>This supplier hasn't added any products to their catalog.</Text>
            </View>
          )
        }
      />

      {/* Inquiry Modal */}
      {selectedProductForInquiry && (
        <EnquiryModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          product={selectedProductForInquiry}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  headerBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    zIndex: 10,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 1,
  },
  supplierHeaderCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  supplierTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  profileAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  companyNameText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    flexShrink: 1,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    color: "#15803d",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 3,
  },
  businessTypeText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 12,
  },
  infoText: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 4,
    marginBottom: 16,
  },
  callActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1e3a8a",
    backgroundColor: "#fff",
    gap: 6,
  },
  callActionText: {
    color: "#1e3a8a",
    fontWeight: "700",
    fontSize: 14,
  },
  whatsappActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#a5d6a7",
    gap: 6,
  },
  whatsappActionText: {
    color: "#1b5e20",
    fontWeight: "700",
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
  },
  countBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 12,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  cardWrapper: {
    flex: 0.485,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    flex: 1,
    justifyContent: "space-between",
  },
  imageBox: {
    height: 130,
    width: "100%",
    backgroundColor: "#f8fafc",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  subCategoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ea580c",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
    marginBottom: 6,
  },
  priceOnRequest: {
    color: "#d97706",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 4,
  },
  priceText: {
    color: "#4f46e5",
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 2,
  },
  unitText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 11,
  },
  moqText: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 8,
  },
  inquireBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e3a8a",
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
    gap: 6,
  },
  inquireBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 4,
  },
});
