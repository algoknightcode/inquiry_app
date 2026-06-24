import { globalSellerId } from "@/utils/roleCache";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Platform,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // Added this import

const TIME_FILTERS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "All Time", value: "all" },
];

const LeadsScreen = () => {
  const insets = useSafeAreaInsets(); // Initialize safe area insets
  
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- API FETCH LOGIC ---
  const fetchLeads = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      let supplierId = globalSellerId;
      if (!supplierId) {
        supplierId = await AsyncStorage.getItem("supplierId") || await AsyncStorage.getItem("sellerId");
      }

      if (!supplierId) {
        console.warn("[LeadsScreen] No supplier ID found");
        setLeads([]);
        return;
      }

      const url = `https://brandbnalo.com/api/form/get-forms/${supplierId}?filter=${activeFilter}`;
      const response = await fetch(url);
      const json = await response.json();
      
      if (json.success && json.data) {
        setLeads(json.data);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error("[LeadsScreen] Error fetching leads:", error);
      setLeads([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads(true);
  }, [activeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeads(false);
  }, [activeFilter]);

  // --- FILTERING LOGIC ---
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    const name = String(lead.name || lead.fullName || lead.userName || "").toLowerCase();
    const product = String(lead.product || lead.message || lead.query || lead.requirements || "").toLowerCase();
    const phone = String(lead.phone || "").toLowerCase();
    
    return name.includes(query) || product.includes(query) || phone.includes(query);
  });

  // --- CARD RENDERER ---
  const renderLeadCard = ({ item }: { item: any }) => {
    let dateStr = "N/A";
    let timeStr = "";
    
    // Safely parse date to prevent UI crashes
    if (item.createdAt) {
      const dt = new Date(item.createdAt);
      if (!isNaN(dt.getTime())) {
        dateStr = dt.toLocaleDateString('en-GB'); 
        timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }

    const userName = String(item.name || item.fullName || item.userName || "Anonymous");
    const productInterest = String(item.product || item.message || item.query || item.requirements || "Inquiry Request");

    const handleCall = () => {
      if (item.phone) Linking.openURL(`tel:${item.phone}`);
    };

    const handleWhatsApp = () => {
      if (item.phone) {
        const text = `Hello ${userName}, I am following up on your inquiry regarding: ${productInterest}.`;
        const phoneFormatted = String(item.phone).includes('+') ? item.phone : `+91${item.phone}`;
        Linking.openURL(`whatsapp://send?phone=${phoneFormatted}&text=${encodeURIComponent(text)}`);
      }
    };

    return (
      <View className="bg-white rounded-[24px] p-5 mb-4 shadow-sm shadow-slate-200/50 border border-slate-100">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-row items-center flex-1">
            <View className="relative mr-3">
              <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                <Ionicons name="person-outline" size={20} color="#64748B" />
              </View>
              {item.status === "new" && (
                <View className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white z-10" />
              )}
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-[16px] font-bold text-slate-900 tracking-tight" numberOfLines={1}>
                {userName}
              </Text>
              <View className="flex-row items-center mt-0.5">
                <Ionicons name="globe-outline" size={12} color="#3B82F6" />
                <Text className="text-[12px] font-medium text-slate-500 ml-1" numberOfLines={1}>
                  {item.platform || "Direct Inquiry"}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="items-end pl-2">
            <Text className="text-[13px] font-bold text-slate-700">{dateStr}</Text>
            <Text className="text-[11px] font-medium text-slate-400 mt-0.5">{timeStr}</Text>
          </View>
        </View>

        <View className="bg-blue-50/50 rounded-2xl p-3.5 flex-row items-center mb-5 border border-blue-100">
          <View className="w-8 h-8 bg-blue-100 rounded-xl items-center justify-center mr-3">
            <Ionicons name="cube" size={16} color="#3B82F6" />
          </View>
          <Text className="text-[13px] font-semibold text-blue-950 flex-1 leading-5">
            {productInterest}
          </Text>
        </View>

        <View className="flex-row justify-between items-end">
          <View className="flex-1 gap-y-2">
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={14} color="#64748B" />
              <Text className="text-[13px] font-semibold text-slate-700 ml-2">{item.phone || "N/A"}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="mail-outline" size={14} color="#64748B" />
              <Text className="text-[13px] font-medium text-slate-500 ml-2 flex-1" numberOfLines={1}>
                {item.email || "N/A"}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-x-3 ml-2">
            <TouchableOpacity onPress={handleCall} className="w-11 h-11 rounded-full bg-rose-50 items-center justify-center border border-rose-100 active:bg-rose-100">
              <Ionicons name="call" size={18} color="#E11D48" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleWhatsApp} className="w-11 h-11 rounded-full bg-emerald-50 items-center justify-center border border-emerald-100 active:bg-emerald-100">
              <FontAwesome name="whatsapp" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        
        {/* TOP HEADER - Fixed SafeAreaView overlap */}
        <View className="px-5 pb-2" style={{ paddingTop: insets.top + 16 }}>
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <View className="flex-row items-center">
                <Text className="text-2xl font-bold text-slate-900 tracking-tight">Inquiry</Text>
                <View className="bg-slate-800 w-6 h-6 rounded-md items-center justify-center ml-2">
                  <Ionicons name="grid" size={12} color="white" />
                </View>
              </View>
              <Text className="text-[13px] font-medium text-slate-500 mt-1">
                Total Inquiry: {filteredLeads.length}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 h-12 shadow-sm shadow-slate-100 mb-4">
            <Ionicons name="search" size={20} color="#94A3B8" />
            <TextInput
              className="flex-1 ml-2 text-[15px] font-medium text-slate-900 h-full"
              placeholder="Search leads..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>



          {/* TIME FILTERS - Fixed FlatList constraints and spacing */}
          <View className="mb-2">
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={TIME_FILTERS}
              keyExtractor={(item) => item.value}
              contentContainerStyle={{ paddingRight: 20 }}
              renderItem={({ item }) => {
                const isActive = activeFilter === item.value;
                return (
                  <TouchableOpacity
                    onPress={() => setActiveFilter(item.value)}
                    className={`px-4 py-2 mr-2 rounded-full border ${
                      isActive 
                        ? 'bg-blue-900 border-blue-900' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>

        {/* LIST CONTENT */}
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text className="mt-4 font-jakarta-medium text-slate-500">Fetching inquiries...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredLeads}
              keyExtractor={(item, index) => item._id || item.id || index.toString()}
              renderItem={renderLeadCard}
              contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              initialNumToRender={8}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#1E3A8A"]}
                  tintColor="#1E3A8A"
                />
              }
              ListEmptyComponent={
                <View className="items-center justify-center mt-20">
                  <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
                  <Text className="text-slate-400 font-medium mt-4 text-[15px]">No inquiries found.</Text>
                </View>
              }
            />
          )}
        </View>
        
      </KeyboardAvoidingView>
    </View>
  );
};

export default LeadsScreen;