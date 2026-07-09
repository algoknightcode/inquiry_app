import { setProductCache } from "@/utils/productCache";
import { AppNotification } from "@/utils/notificationService";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Load notifications from AsyncStorage
  const loadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("app_notifications");
      const list: AppNotification[] = stored ? JSON.parse(stored) : [];
      setNotifications(list);

      const storedRead = await AsyncStorage.getItem("read_notifications");
      if (storedRead) {
        setReadIds(new Set(JSON.parse(storedRead)));
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = async (item: AppNotification) => {
    // Mark as read
    const newRead = new Set(readIds);
    newRead.add(item.id);
    setReadIds(newRead);
    try {
      await AsyncStorage.setItem("read_notifications", JSON.stringify(Array.from(newRead)));
    } catch (e) {
      console.error("Error saving read status:", e);
    }

    // If product metadata exists, cache it and navigate to detail page
    if (item.product) {
      setProductCache(item.product._id, item.product);
      router.push({
        pathname: "/Products_Page/[slug]",
        params: {
          slug: item.product.slug,
          productId: item.product._id,
        },
      });
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear Notifications",
      "Are you sure you want to clear all your notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("app_notifications");
              await AsyncStorage.removeItem("read_notifications");
              setNotifications([]);
              setReadIds(new Set());
            } catch (e) {
              console.error("Error clearing notifications:", e);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Activity Log</Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={s.clearBtn}>
            <Text style={s.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={s.loadingText}>Fetching activity history...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <ScrollView
          contentContainerStyle={s.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4f46e5"]} />}
        >
          <Ionicons name="notifications-off-outline" size={64} color="#cbd5e1" />
          <Text style={s.emptyText}>No activity recorded yet.</Text>
          <Text style={s.emptySubText}>Interact with products on the Home screen to see logs here.</Text>
        </ScrollView>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4f46e5"]} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {notifications.map((item) => {
            const isUnread = !readIds.has(item.id);
            const product = item.product;
            
            // Resolve image
            const primaryImage = product?.media && product.media.length > 0
              ? (product.media.find((m: any) => m.isPrimary) || product.media[0]).url
              : "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400";

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
                style={[
                  s.notificationRow,
                  { backgroundColor: isUnread ? "#f4f6ff" : "#fff" },
                ]}
              >
                {/* Dot / Spacer */}
                {isUnread ? <View style={s.unreadDot} /> : <View style={s.readSpacer} />}

                <View style={s.textContent}>
                  {/* Log message */}
                  <Text style={s.logText}>{item.text}</Text>
                  
                  {/* Timestamp */}
                  <View style={s.timeRow}>
                    <Feather name="clock" size={10} color="#94a3b8" />
                    <Text style={s.timeText}>{item.timestamp}</Text>
                  </View>

                  {/* Embedded Product Card if available */}
                  {product && (
                    <View style={s.productPreview}>
                      <Image
                        source={{ uri: primaryImage }}
                        style={s.productImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                      <View style={s.productInfo}>
                        <Text style={s.productName} numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text style={s.supplierName} numberOfLines={1}>
                          {product.supplier?.business?.companyName || "Verified Supplier"}
                        </Text>
                        <Text style={s.priceText}>
                          {product.priceType === "on_request" || !product.price
                            ? "Price on Request"
                            : `₹${product.price.toLocaleString()} / ${product.unit || "Unit"}`}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Chevron icon */}
                {product && (
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" style={s.chevron} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#0f172a",
  },
  clearBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },
  clearBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Bold",
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
    textAlign: "center",
  },
  notificationRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4f46e5",
    marginRight: 10,
    marginTop: 6,
  },
  readSpacer: {
    width: 8,
    marginRight: 10,
  },
  textContent: {
    flex: 1,
  },
  logText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#1e293b",
    marginBottom: 4,
    lineHeight: 20,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  timeText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans",
    color: "#94a3b8",
    marginLeft: 4,
  },
  productPreview: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#cbd5e1",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  productName: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  supplierName: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans",
    color: "#64748b",
    marginBottom: 2,
  },
  priceText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#059669",
  },
  chevron: {
    alignSelf: "center",
    marginLeft: 12,
  },
});