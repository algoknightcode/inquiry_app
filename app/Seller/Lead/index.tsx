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
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const TIME_FILTERS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "All Time", value: "all" },
];

const LeadsScreen = () => {
  const insets = useSafeAreaInsets();
  
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
      <View style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.cardHeaderLeft}>
            <View style={s.avatarWrapper}>
              <View style={s.avatar}>
                <Ionicons name="person-outline" size={moderateScale(18)} color="#64748B" />
              </View>
              {item.status === "new" && (
                <View style={s.badgeDot} />
              )}
            </View>
            <View style={s.userInfo}>
              <Text style={s.userName} numberOfLines={1}>
                {userName}
              </Text>
              <View style={s.platformRow}>
                <Ionicons name="globe-outline" size={moderateScale(11)} color="#3B82F6" />
                <Text style={s.platformText} numberOfLines={1}>
                  {item.platform || "Direct Inquiry"}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={s.cardHeaderRight}>
            <Text style={s.dateText}>{dateStr}</Text>
            <Text style={s.timeText}>{timeStr}</Text>
          </View>
        </View>

        <View style={s.productBox}>
          <View style={s.productIconWrapper}>
            <Ionicons name="cube" size={moderateScale(14)} color="#3B82F6" />
          </View>
          <Text style={s.productText}>
            {productInterest}
          </Text>
        </View>

        <View style={s.cardFooter}>
          <View style={s.contactInfo}>
            <View style={s.contactRow}>
              <Ionicons name="call-outline" size={moderateScale(13)} color="#64748B" />
              <Text style={s.contactText}>{item.phone || "N/A"}</Text>
            </View>
            <View style={s.contactRow}>
              <Ionicons name="mail-outline" size={moderateScale(13)} color="#64748B" />
              <Text style={s.contactText} numberOfLines={1}>
                {item.email || "N/A"}
              </Text>
            </View>
          </View>

          <View style={s.actionsRow}>
            <TouchableOpacity onPress={handleCall} style={s.callBtn}>
              <Ionicons name="call" size={moderateScale(16)} color="#E11D48" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleWhatsApp} style={s.whatsappBtn}>
              <FontAwesome name="whatsapp" size={moderateScale(18)} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={s.flexContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={s.flexContainer}>
        
        {/* TOP HEADER */}
        <View style={[s.topHeader, { paddingTop: insets.top + verticalScale(8) }]}>
          <View style={s.headerRow}>
            <View>
              <View style={s.titleRow}>
                <Text style={s.title}>Inquiry</Text>
                <View style={s.titleIcon}>
                  <Ionicons name="grid" size={moderateScale(11)} color="white" />
                </View>
              </View>
              <Text style={s.subtitle}>
                Total Inquiry: {filteredLeads.length}
              </Text>
            </View>
          </View>

          <View style={s.searchBar}>
            <Ionicons name="search" size={moderateScale(18)} color="#94A3B8" />
            <TextInput
              style={s.searchInput}
              placeholder="Search leads..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* TIME FILTERS */}
          <View style={s.filtersContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={TIME_FILTERS}
              keyExtractor={(item) => item.value}
              contentContainerStyle={{ paddingRight: scale(20) }}
              renderItem={({ item }) => {
                const isActive = activeFilter === item.value;
                return (
                  <TouchableOpacity
                    onPress={() => setActiveFilter(item.value)}
                    style={[
                      s.filterBtn,
                      isActive ? s.filterBtnActive : s.filterBtnInactive
                    ]}
                  >
                    <Text style={[
                      s.filterBtnText,
                      isActive ? s.filterTextActive : s.filterTextInactive
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>

        {/* LIST CONTENT */}
        <View style={s.flexContainer}>
          {isLoading ? (
            <View style={s.loadingWrapper}>
              <ActivityIndicator size="large" color="#1E3A8A" />
              <Text style={s.loadingText}>Fetching inquiries...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredLeads}
              keyExtractor={(item, index) => item._id || item.id || index.toString()}
              renderItem={renderLeadCard}
              contentContainerStyle={s.listContent}
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
                <View style={s.emptyListWrapper}>
                  <Ionicons name="document-text-outline" size={moderateScale(44)} color="#CBD5E1" />
                  <Text style={s.emptyListText}>No inquiries found.</Text>
                </View>
              }
            />
          )}
        </View>
        
      </KeyboardAvoidingView>
    </View>
  );
};

const s = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topHeader: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(6),
    backgroundColor: "#F8FAFC",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: verticalScale(10),
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  titleIcon: {
    backgroundColor: "#1E293B",
    width: scale(22),
    height: scale(22),
    borderRadius: moderateScale(6),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: scale(8),
  },
  subtitle: {
    fontSize: moderateScale(12.5),
    fontWeight: "600",
    color: "#64748B",
    marginTop: verticalScale(2),
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(14),
    paddingHorizontal: scale(14),
    height: verticalScale(42),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: verticalScale(10),
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: moderateScale(13.5),
    fontWeight: "600",
    color: "#0F172A",
    height: "100%",
  },
  filtersContainer: {
    marginBottom: verticalScale(4),
  },
  filterBtn: {
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    marginRight: scale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
  },
  filterBtnActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#1E3A8A",
  },
  filterBtnInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  filterBtnText: {
    fontSize: moderateScale(12.5),
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  filterTextInactive: {
    color: "#475569",
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
    fontSize: moderateScale(13.5),
  },
  listContent: {
    padding: scale(16),
    paddingBottom: verticalScale(80),
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: verticalScale(12),
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: scale(10),
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    backgroundColor: "#F1F5F9",
    borderRadius: scale(20),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  badgeDot: {
    position: "absolute",
    top: verticalScale(-2),
    right: scale(-2),
    width: scale(10),
    height: scale(10),
    backgroundColor: "#10B981",
    borderRadius: scale(5),
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 10,
  },
  userInfo: {
    flex: 1,
    paddingRight: scale(8),
  },
  userName: {
    fontSize: moderateScale(14.5),
    fontWeight: "700",
    color: "#0F172A",
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(2),
  },
  platformText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    color: "#64748B",
    marginLeft: scale(4),
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  dateText: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#475569",
  },
  timeText: {
    fontSize: moderateScale(10.5),
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: verticalScale(2),
  },
  productBox: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(14),
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.1)",
  },
  productIconWrapper: {
    width: scale(26),
    height: scale(26),
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    borderRadius: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10),
  },
  productText: {
    fontSize: moderateScale(12.5),
    fontWeight: "700",
    color: "#1E3A8A",
    flex: 1,
    lineHeight: verticalScale(16),
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  contactInfo: {
    flex: 1,
    gap: verticalScale(4),
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#475569",
    marginLeft: scale(6),
  },
  actionsRow: {
    flexDirection: "row",
    gap: scale(10),
    marginLeft: scale(8),
  },
  callBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  whatsappBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  emptyListWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(80),
  },
  emptyListText: {
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: verticalScale(12),
    fontSize: moderateScale(13.5),
  },
});

export default LeadsScreen;