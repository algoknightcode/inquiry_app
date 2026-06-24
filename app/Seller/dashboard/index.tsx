import Navbar from "@/components/Home/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import { globalSellerId } from "@/utils/roleCache";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = () => {
  const insets = useSafeAreaInsets();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [productsCount, setProductsCount] = useState(0);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const supplierId = globalSellerId || await AsyncStorage.getItem("supplierId");

      if (supplierId) {
        // 1. Fetch Products
        const prodRes = await fetch(`https://seller.inquirybazaar.com/api/product?supplierId=${supplierId}`);
        const prodJson = await prodRes.json();
        const productsArray = prodJson.data || prodJson.products || prodJson || [];
        setProductsCount(productsArray.length);

        // Extract unique category names
        const categorySet = new Set<string>();
        productsArray.forEach((p: any) => {
          const cat = p.categoryName || p.category?.name || p.category;
          if (cat && typeof cat === 'string') {
            categorySet.add(cat);
          } else if (cat && typeof cat === 'object' && cat.name) {
            categorySet.add(cat.name);
          }
        });
        setCategoriesList(Array.from(categorySet));

        // 2. Fetch Latest Inquiries/Forms
        const leadRes = await fetch(`https://brandbnalo.com/api/form/get-forms/${supplierId}?filter=today`);
        const leadJson = await leadRes.json();
        if (leadJson.success && leadJson.data) {
          setInquiries(leadJson.data);
        }

        // 3. Fetch Business Profile details
        const businessRes = await fetch("https://seller.inquirybazaar.com/api/profile/business", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": supplierId,
          },
        });
        if (businessRes.ok) {
          const businessJson = await businessRes.json();
          const bData = businessJson.data || businessJson.profile || businessJson || null;
          setBusinessProfile(bData);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData(false);
    setRefreshing(false);
  }, []);

  return (
    <View className="flex-1 bg-slate-50">
      <Navbar onMenuPress={() => setIsSidebarOpen(true)} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        className="px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} tintColor="#4F46E5" />
        }
      >
        {/* --- 3. MEMBERSHIP PLAN (Hero Card - Moved Topmost) --- */}
        <View className="bg-emerald-500 rounded-3xl p-6 mb-4 shadow-lg shadow-emerald-200 relative overflow-hidden">
          {/* Decorative Background Icon */}
          <Ionicons name="shield-checkmark" size={120} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: -20, top: -20 }} />
          
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center bg-emerald-600/40 px-3 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-green-300 mr-2" />
              <Text className="text-emerald-50 text-xs font-semibold">Active</Text>
            </View>
            <Ionicons name="medal" size={24} color="#FFF" />
          </View>
          
          <Text className="text-white text-2xl font-extrabold mb-4 mt-2">
            Elite Plan
          </Text>
          
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-emerald-100 text-xs font-medium mb-1">
                <Ionicons name="calendar-outline" size={12} /> Start: 01 Jan 2026
              </Text>
              <Text className="text-emerald-100 text-xs font-medium">
                <Ionicons name="calendar-outline" size={12} /> End: 31 Dec 2026
              </Text>
            </View>
            <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
              <Text className="text-white text-sm font-bold">Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 1. ACCOUNT MANAGER HEADER --- */}
      

        {/* --- 2. METRICS GRID (Side by Side) --- */}
        <View className="flex-row justify-between mb-4 gap-x-4">
          {/* Total Products (Purple Card) */}
          <View className="flex-1 bg-indigo-600 rounded-3xl p-5 shadow-lg shadow-indigo-300">
            <View className="flex-row justify-between items-start mb-4">
              <Text className="text-indigo-100 text-sm font-semibold">
                Total Products
              </Text>
              <Ionicons name="cube-outline" size={20} color="#E0E7FF" />
            </View>
            <Text className="text-white text-4xl font-extrabold mb-1 tracking-tighter">
              {productsCount}
            </Text>
            <Text className="text-indigo-200 text-xs font-medium">
              Active listed products
            </Text>
          </View>

          {/* Categories (White Card) */}
          <View className="flex-1 bg-white rounded-3xl p-5 shadow-sm shadow-slate-200 border border-slate-100">
            <View className="flex-row justify-between items-start mb-4">
              <Text className="text-slate-500 text-sm font-semibold">
                Categories
              </Text>
              <Ionicons name="folder-outline" size={20} color="#64748B" />
            </View>
            <Text className="text-slate-900 text-2xl font-bold mb-3 tracking-tight">
              {categoriesList.length}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {categoriesList.slice(0, 2).map((cat, idx) => (
                <View key={idx} className="bg-slate-100 px-2 py-1 rounded-md">
                  <Text className="text-[10px] text-slate-600 font-medium" numberOfLines={1}>
                    {cat}
                  </Text>
                </View>
              ))}
              {categoriesList.length > 2 && (
                <View className="bg-slate-100 px-2 py-1 rounded-md">
                  <Text className="text-[10px] text-slate-600 font-medium">
                    +{categoriesList.length - 2} more
                  </Text>
                </View>
              )}
              {categoriesList.length === 0 && (
                <View className="bg-slate-100 px-2 py-1 rounded-md">
                  <Text className="text-[10px] text-slate-400 font-medium">No Categories</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* --- 5. LATEST INQUIRIES (Moved to place of Elite Plan) --- */}
        <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm shadow-slate-200 border border-slate-100">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Ionicons name="chatbubbles-outline" size={20} color="#4F46E5" />
              <Text className="text-lg font-bold text-slate-900 ml-2">
                Latest Inquiries
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-indigo-600 text-sm font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : inquiries.length === 0 ? (
              <View className="items-center py-6">
                <Text className="text-sm text-slate-400 font-jakarta-medium">No inquiries found today.</Text>
              </View>
            ) : (
              inquiries.map((item, index) => {
                const userName = item.name || item.fullName || item.userName || "Anonymous";
                const timeString = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
                const messageDetail = item.message || item.query || item.requirements || "Inquiry Request";
                return (
                  <TouchableOpacity key={item._id || index} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 active:bg-slate-100 mb-3">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="font-bold text-slate-900">{userName}</Text>
                      <Text className="text-xs text-slate-400 font-medium">{timeString}</Text>
                    </View>
                    <Text className="text-sm text-slate-600 leading-relaxed">
                      {messageDetail}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* --- 4. COMPANY PROFILE --- */}
        <View className="bg-white rounded-3xl p-6 mb-4 shadow-sm shadow-slate-200 border border-slate-100">
          <View className="flex-row items-center mb-6 border-b border-slate-100 pb-5">
            <View className="w-16 h-16 bg-blue-900/10 rounded-2xl items-center justify-center mr-4 border border-blue-900/20">
              <Text className="text-blue-900 text-2xl font-bold">
                {(businessProfile?.companyName || "Guruji Colours Enterprises").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900 leading-tight">
                {businessProfile?.companyName || "Guruji Colours Enterprises"}
              </Text>
              <Text className="text-indigo-600 text-sm font-semibold mt-1">
                <Ionicons name="business" size={14} /> {businessProfile?.businessType || "Wholesaler"}
              </Text>
            </View>
          </View>

          <View className="gap-y-4">
            <View className="flex-row items-start">
              <Ionicons name="person-outline" size={18} color="#64748B" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-slate-500 font-medium">CEO</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  {businessProfile?.ceoName || "Tanish Sukh"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 font-medium">GST No</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  {businessProfile?.gstNumber || "07LVXPS5272F1ZK"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Ionicons name="cash-outline" size={18} color="#64748B" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-slate-500 font-medium">Annual Turnover</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  {businessProfile?.annualTurnover || "5 - 20 Cr"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Ionicons name="briefcase-outline" size={18} color="#64748B" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-slate-500 font-medium">Business Field</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  {businessProfile?.businessField || "Chemicals, Dyes & Solvents"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Ionicons name="location-outline" size={18} color="#64748B" className="mt-0.5" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-slate-500 font-medium">Address</Text>
                <Text className="text-sm font-semibold text-slate-900">
                  {businessProfile?.businessAddress || "Adrash Nagar, New Delhi"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Sidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentRole="seller"
      />
    </View>
  );
};

export default Dashboard;