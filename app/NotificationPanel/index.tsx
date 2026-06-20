import { productCache } from "@/utils/productCache";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  createdAt?: string;
};

// --- Time Helper ---
const timeAgo = (dateString?: string) => {
  if (!dateString) return "Recently";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(diffMs)) return "Recently";
  
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

export default function NotificationScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readProductIds, setReadProductIds] = useState<Set<string>>(new Set());

  const fetchLiveNotifications = async () => {
    try {
      // 1. Fetch industry tree
      const response = await fetch("https://backend.inquirybazaar.com/api/industries/tree");
      const json = await response.json();

      if (json.success && json.data) {
        const subcategories: { name: string; slug: string }[] = [];
        
        // Traverse and collect subcategories
        json.data.forEach((industry: any) => {
          industry.categories?.forEach((category: any) => {
            category.subCategories?.forEach((sub: any) => {
              if (sub.slug) {
                subcategories.push({ name: sub.name, slug: sub.slug });
              }
            });
          });
        });

        // Pick a diverse set of up to 25 subcategories (stride-based sampling to cover all industries/categories)
        const selectedSubs: { name: string; slug: string }[] = [];
        const maxFetches = 25;
        if (subcategories.length > 0) {
          const stride = Math.max(1, Math.floor(subcategories.length / maxFetches));
          for (let i = 0; i < subcategories.length && selectedSubs.length < maxFetches; i += stride) {
            selectedSubs.push(subcategories[i]);
          }
        }

        // Fetch products in parallel for the selected subcategories (Delhi location default)
        const productRequests = selectedSubs.map(async (sub) => {
          try {
            const res = await fetch(`https://backend.inquirybazaar.com/api/categories/sub/${sub.slug}/Delhi`);
            const resJson = await res.json();
            if (resJson.success && resJson.data && resJson.data.products) {
              return resJson.data.products;
            }
          } catch (e) {
            console.log(`Error fetching products for subcategory ${sub.slug}:`, e);
          }
          return [];
        });

        const allProductsArrays = await Promise.all(productRequests);
        const flattened = allProductsArrays.flat();

        // Remove duplicate products by _id
        const uniqueProductsMap = new Map<string, Product>();
        flattened.forEach((prod: any) => {
          if (prod && prod._id) {
            uniqueProductsMap.set(prod._id, prod);
          }
        });
        const uniqueProducts = Array.from(uniqueProductsMap.values());

        // Sort by createdAt descending
        uniqueProducts.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setProducts(uniqueProducts);
      }
    } catch (error) {
      console.error("Error fetching live notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveNotifications();
  };

  const handleNotificationPress = (item: Product) => {
    // Add to read set
    setReadProductIds((prev) => {
      const next = new Set(prev);
      next.add(item._id);
      return next;
    });

    // Populate cache and navigate to details
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
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={s.loadingText}>Fetching latest product updates...</Text>
        </View>
      ) : products.length === 0 ? (
        <ScrollView
          contentContainerStyle={s.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4f46e5"]} />}
        >
          <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
          <Text style={s.emptyText}>No new products found right now.</Text>
          <Text style={s.emptySubText}>Swipe down to refresh and check again.</Text>
        </ScrollView>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4f46e5"]} />}
        >
          {products.map((item) => {
            const isUnread = !readProductIds.has(item._id);
            const supplierName = item.supplier?.business?.companyName || item.supplier?.name || "Verified Supplier";
            const isPriceOnRequest = item.priceType === "on_request" || !item.price;
            const priceText = isPriceOnRequest
              ? "Price on Request"
              : `₹${item.price.toLocaleString()} / ${item.unit || "Unit"}`;

            return (
              <TouchableOpacity
                key={item._id}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
                style={[
                  s.notificationRow,
                  { backgroundColor: isUnread ? "#f0f4ff" : "#fff" },
                ]}
              >
                {/* Unread dot */}
                {isUnread ? (
                  <View style={s.unreadDot} />
                ) : (
                  <View style={s.readSpacer} />
                )}

                {/* Text Content */}
                <View style={s.textContent}>
                  <Text style={s.supplierName} numberOfLines={1}>
                    {supplierName}
                  </Text>
                  <Text style={s.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[s.priceText, { color: isPriceOnRequest ? "#6b7280" : "#059669" }]}>
                    {priceText}
                  </Text>
                  <Text style={s.timeText}>{timeAgo(item.createdAt)}</Text>
                </View>

                {/* Chevron icon indicator */}
                <Ionicons name="chevron-forward" size={16} color="#94a3b8" style={s.chevron} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "#64748b",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: Dimensions.get("window").height - 150,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#475569",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "#94a3b8",
    marginTop: 8,
  },
  notificationRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4f46e5",
    marginRight: 10,
  },
  readSpacer: {
    width: 8,
    marginRight: 10,
  },
  textContent: {
    flex: 1,
  },
  supplierName: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#111",
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans",
    color: "#444",
    marginBottom: 4,
  },
  priceText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Bold",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans",
    color: "#999",
  },
  chevron: {
    marginLeft: 8,
  },
});