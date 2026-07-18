import Navbar from "@/components/Home/Navbar";
import { globalSellerId } from "@/utils/roleCache";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  InteractionManager,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const Dashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [productsCount, setProductsCount] = useState(0);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const fetchDashboardData = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    
    // Cancel any older requests before firing a new batch
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
 
    try {
      const supplierId = globalSellerId || await AsyncStorage.getItem("supplierId");
 
      if (supplierId) {
        // 🔥 Fetch products, inquiries, business profile, AND the category tree
        const results = await Promise.allSettled([
          fetch(`https://seller.inquirybazaar.com/api/product?supplierId=${supplierId}`, { signal }),
          fetch(`https://brandbnalo.com/api/form/get-forms/${supplierId}?filter=today`, { signal }),
          fetch("https://seller.inquirybazaar.com/api/profile/business", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-user-id": supplierId,
            },
            signal,
          }),
          fetch("https://backend.inquirybazaar.com/api/industries/tree", { signal }),
        ]);
 
        if (!isMounted.current) return;
 
        // 1. Build Category ID-to-Name mapping lookup table
        const catMap: { [key: string]: string } = {};
        if (results[3].status === "fulfilled" && results[3].value.ok) {
          try {
            const treeJson = await results[3].value.json();
            if (treeJson.success && Array.isArray(treeJson.data)) {
              treeJson.data.forEach((industry: any) => {
                if (industry.categories) {
                  industry.categories.forEach((cat: any) => {
                    catMap[cat._id] = cat.name;
                  });
                }
              });
            }
          } catch (e) {
            console.log("Error parsing categories tree:", e);
          }
        }

        // 2. Process products and resolve unique category names
        if (results[0].status === "fulfilled" && results[0].value.ok) {
          const prodJson = await results[0].value.json();
          const productsArray = prodJson.data || prodJson.products || prodJson || [];
          setProductsCount(productsArray.length);
 
          const categorySet = new Set<string>();
          productsArray.forEach((p: any) => {
            // Check lookup map first, then fallbacks
            const catName = catMap[p.categoryId] || p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : null);
            if (catName) {
              categorySet.add(catName);
            }
          });
          setCategoriesList(Array.from(categorySet));
        }
 
        // Safely process inquiries
        if (results[1].status === "fulfilled" && results[1].value.ok) {
          const leadJson = await results[1].value.json();
          if (leadJson.success && leadJson.data) {
            setInquiries(leadJson.data);
          }
        }
 
        // Safely process business profile
        if (results[2].status === "fulfilled" && results[2].value.ok) {
          const businessJson = await results[2].value.json();
          const bData = businessJson.data || businessJson.profile || businessJson || null;
          setBusinessProfile(bData);
        }
      }
    } catch (error: any) {
      if (error?.name !== 'AbortError') {
        console.error("Error fetching dashboard data:", error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const isFocused = useIsFocused();
  const hasLoadedInitialData = useRef(false);

  useEffect(() => {
    const backAction = () => {
      if (!router.canGoBack()) {
        router.replace("/(tabs)");
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!isFocused) return;
    const task = InteractionManager.runAfterInteractions(() => {
      // Only show loader on the very first mount
      fetchDashboardData(!hasLoadedInitialData.current);
      hasLoadedInitialData.current = true;
    });
    return () => task.cancel();
  }, [fetchDashboardData, isFocused]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData(false);
    setRefreshing(false);
  }, [fetchDashboardData]);

  return (
    <View style={s.flexContainer}>
      <Navbar />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} tintColor="#4F46E5" />
        }
      >
        {/* --- METRICS GRID (Side by Side) --- */}
        <View style={s.metricsGrid}>
          {/* Total Products (Purple Card) */}
          <View style={s.purpleCard}>
            <View style={s.cardHeader}>
              <Text style={s.purpleCardTitle}>
                Total Products
              </Text>
              <Ionicons name="cube-outline" size={moderateScale(20)} color="#E0E7FF" />
            </View>
            <Text style={s.cardCountLarge}>
              {productsCount}
            </Text>
            <Text style={s.purpleCardSubtitle}>
              Active listed products
            </Text>
          </View>

          {/* Categories (White Card) */}
          <View style={s.whiteCard}>
            <View style={s.cardHeader}>
              <Text style={s.whiteCardTitle}>
                Categories
              </Text>
              <Ionicons name="folder-outline" size={moderateScale(20)} color="#64748B" />
            </View>
            <Text style={s.whiteCardCountLarge}>
              {categoriesList.length}
            </Text>
            <View style={s.pillsWrapper}>
              {categoriesList.slice(0, 2).map((cat, idx) => (
                <View key={idx} style={s.pill}>
                  <Text style={s.pillText} numberOfLines={1}>
                    {cat}
                  </Text>
                </View>
              ))}
              {categoriesList.length > 2 && (
                <View style={s.pill}>
                  <Text style={s.pillText}>
                    +{categoriesList.length - 2} more
                  </Text>
                </View>
              )}
              {categoriesList.length === 0 && (
                <View style={s.pill}>
                  <Text style={s.pillTextEmpty}>No Categories</Text>
                </View>
              )}
            </View>
          </View>
        </View>

         {/* --- LATEST INQUIRIES --- */}
        <View style={s.sectionCard}>
          <View style={s.sectionHeader}>
            <View style={s.sectionHeaderTitleWrapper}>
              <Ionicons name="chatbubbles-outline" size={moderateScale(20)} color="#4F46E5" />
              <Text style={s.sectionTitle}>
                Latest Inquiries
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/Seller/Lead")}>
              <Text style={s.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <View>
            {inquiries.length > 0 ? (
              inquiries.slice(0, 10).map((item, index) => {
                const userName = item.name || item.fullName || item.userName || "Anonymous";
                const timeString = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
                const messageDetail = item.message || item.query || item.requirements || "Inquiry Request";
                return (
                  <TouchableOpacity 
                    key={item._id || index} 
                    style={s.inquiryCard}
                    onPress={() => router.push("/Seller/Lead")}
                  >
                    <View style={s.inquiryCardHeader}>
                      <Text style={s.inquiryUser}>{userName}</Text>
                      <Text style={s.inquiryTime}>{timeString}</Text>
                    </View>
                    <Text style={s.inquiryMessage}>
                      {messageDetail}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={s.emptyWrapper}>
                <Text style={s.emptyText}>No inquiries found today.</Text>
              </View>
            )}
          </View>
        </View>

        {/* --- COMPANY PROFILE --- */}
        <View style={s.sectionCard}>
          {isLoading ? (
            <View style={{ height: verticalScale(180), justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="text-[13px] font-jakarta-medium text-slate-500 mt-2">Loading supplier details...</Text>
            </View>
          ) : (
            <>
              <View style={s.companyProfileHeader}>
                <View style={s.companyLogoWrapper}>
                  <Text style={s.companyLogoText}>
                    {(businessProfile?.companyName || "N/A").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={s.flexContainer}>
                  <Text style={s.companyNameText}>
                    {businessProfile?.companyName || "N/A"}
                  </Text>
                  <Text style={s.companyTypeText}>
                    <Ionicons name="business" size={moderateScale(13)} /> {businessProfile?.businessType || "N/A"}
                  </Text>
                </View>
              </View>

              <View style={s.gridContainer}>
                <View style={s.gridRow}>
                  <Ionicons name="person-outline" size={moderateScale(16)} color="#64748B" style={s.gridIcon} />
                  <View style={s.gridCol}>
                    <Text style={s.gridColLabel}>CEO</Text>
                    <Text style={s.gridColValue}>
                      {businessProfile?.ceoName || "N/A"}
                    </Text>
                  </View>
                  <View style={s.gridCol}>
                    <Text style={s.gridColLabel}>GST No</Text>
                    <Text style={s.gridColValue}>
                      {businessProfile?.gstNumber || "N/A"}
                    </Text>
                  </View>
                </View>

                <View style={s.gridRow}>
                  <Ionicons name="cash-outline" size={moderateScale(16)} color="#64748B" style={s.gridIcon} />
                  <View style={s.gridCol}>
                    <Text style={s.gridColLabel}>Annual Turnover</Text>
                    <Text style={s.gridColValue}>
                      {businessProfile?.annualTurnover || "N/A"}
                    </Text>
                  </View>
                </View>

                <View style={s.gridRow}>
                  <Ionicons name="briefcase-outline" size={moderateScale(16)} color="#64748B" style={s.gridIcon} />
                  <View style={s.gridCol}>
                    <Text style={s.gridColLabel}>Business Field</Text>
                    <Text style={s.gridColValue}>
                      {businessProfile?.businessField || "N/A"}
                    </Text>
                  </View>
                </View>

                <View style={s.gridRow}>
                  <Ionicons name="location-outline" size={moderateScale(16)} color="#64748B" style={s.gridIcon} />
                  <View style={s.gridCol}>
                    <Text style={s.gridColLabel}>Address</Text>
                    <Text style={s.gridColValue}>
                      {businessProfile?.businessAddress || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const s: any = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: verticalScale(40),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
  },
  heroCard: {
    backgroundColor: "#10B981",
    borderRadius: moderateScale(24),
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeIcon: {
    position: 'absolute',
    right: scale(-20),
    top: verticalScale(-20),
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(8),
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  activeDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: "#A7F3D0",
    marginRight: scale(6),
  },
  activeText: {
    color: "#FFFFFF",
    fontSize: moderateScale(11.5),
    fontWeight: "700",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginBottom: verticalScale(16),
    marginTop: verticalScale(8),
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  dateText: {
    color: "#D1FAE5",
    fontSize: moderateScale(11.5),
    fontWeight: "600",
    marginBottom: verticalScale(3),
  },
  upgradeBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(10),
  },
  upgradeBtnText: {
    color: "#FFFFFF",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: verticalScale(16),
    gap: scale(12),
  },
  purpleCard: {
    flex: 1,
    backgroundColor: "#4F46E5",
    borderRadius: moderateScale(24),
    padding: moderateScale(16),
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(12),
  },
  purpleCardTitle: {
    color: "#E0E7FF",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  cardCountLarge: {
    color: "#FFFFFF",
    fontSize: moderateScale(32),
    fontWeight: "800",
    marginBottom: verticalScale(4),
    letterSpacing: -1,
  },
  purpleCardSubtitle: {
    color: "#C7D2FE",
    fontSize: moderateScale(11),
    fontWeight: "600",
  },
  whiteCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(24),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  whiteCardTitle: {
    color: "#64748B",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  whiteCardCountLarge: {
    color: "#0F172A",
    fontSize: moderateScale(24),
    fontWeight: "800",
    marginBottom: verticalScale(8),
  },
  pillsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(6),
  },
  pill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
    maxWidth: '100%',
  },
  pillText: {
    fontSize: moderateScale(9.5),
    color: "#475569",
    fontWeight: "600",
  },
  pillTextEmpty: {
    fontSize: moderateScale(9.5),
    color: "#94A3B8",
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(24),
    padding: moderateScale(18),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(12),
  },
  sectionHeaderTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "800",
    color: "#0F172A",
    marginLeft: scale(8),
  },
  viewAllLink: {
    color: "#4F46E5",
    fontSize: moderateScale(13),
    fontWeight: "700",
  },
  inquiriesList: {
    maxHeight: verticalScale(220),
  },
  emptyWrapper: {
    alignItems: "center",
    paddingVertical: verticalScale(16),
  },
  emptyText: {
    fontSize: moderateScale(13),
    color: "#94A3B8",
  },
  inquiryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: verticalScale(8),
  },
  inquiryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: verticalScale(4),
  },
  inquiryUser: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: moderateScale(13.5),
  },
  inquiryTime: {
    fontSize: moderateScale(11),
    color: "#94A3B8",
    fontWeight: "600",
  },
  inquiryMessage: {
    fontSize: moderateScale(12.5),
    color: "#475569",
    lineHeight: verticalScale(18),
  },
  companyProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: verticalScale(12),
    marginBottom: verticalScale(16),
  },
  companyLogoWrapper: {
    width: scale(52),
    height: scale(52),
    backgroundColor: "rgba(30, 58, 138, 0.08)",
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(12),
    borderWidth: 1,
    borderColor: "rgba(30, 58, 138, 0.15)",
  },
  companyLogoText: {
    color: "#1E3A8A",
    fontSize: moderateScale(20),
    fontWeight: "800",
  },
  companyNameText: {
    fontSize: moderateScale(15.5),
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: verticalScale(20),
  },
  companyTypeText: {
    color: "#4F46E5",
    fontSize: moderateScale(12.5),
    fontWeight: "700",
    marginTop: verticalScale(2),
  },
  gridContainer: {
    gap: verticalScale(12),
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  gridIcon: {
    marginTop: verticalScale(2),
  },
  gridCol: {
    marginLeft: scale(8),
    flex: 1,
  },
  gridColLabel: {
    fontSize: moderateScale(11),
    color: "#64748B",
    fontWeight: "600",
  },
  gridColValue: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#1E293B",
  },
});

export default Dashboard;