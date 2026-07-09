import Navbar from "@/components/Home/Navbar";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { setGlobalRole, setGlobalBuyerId, setSellerSignedIn, setGlobalSellerId } from "@/utils/roleCache";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { employeNumber } from "../../Seller/data/data";

// --- REUSABLE INPUT COMPONENT ---
const InputField = ({ label, icon, placeholder, value, onChangeText, keyboardType = "default" }: any) => (
  <View style={{ marginBottom: verticalScale(14) }}>
    <Text 
      style={{
        fontSize: moderateScale(11.5),
        marginBottom: verticalScale(6),
        marginLeft: scale(4),
      }}
      className="font-jakarta-medium text-slate-500 uppercase tracking-wider"
    >
      {label}
    </Text>
    <View 
      style={{
        height: verticalScale(48),
        paddingHorizontal: scale(14),
        borderRadius: moderateScale(14),
      }}
      className="flex-row items-center bg-white border border-slate-200 shadow-sm shadow-slate-100"
    >
      <Ionicons name={icon} size={moderateScale(18)} color="#64748B" style={{ marginRight: scale(10) }} />
      <TextInput
        style={{ fontSize: moderateScale(14), flex: 1, height: '100%', color: '#0f172a' }}
        className="font-jakarta-semibold"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

// --- FULLY WORKING DUMMY DROPDOWN COMPONENT ---
const DropdownField = ({ label, icon, placeholder, value, options, onSelect }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options?.find((opt: any) => typeof opt === "object" && opt.name === value);

  return (
    <View style={{ marginBottom: verticalScale(14) }}>
      <Text 
        style={{
          fontSize: moderateScale(11.5),
          marginBottom: verticalScale(6),
          marginLeft: scale(4),
        }}
        className="font-jakarta-medium text-slate-500 uppercase tracking-wider"
      >
        {label}
      </Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          height: verticalScale(48),
          paddingHorizontal: scale(14),
          borderRadius: moderateScale(14),
        }}
        className="flex-row items-center bg-white border border-slate-200 shadow-sm shadow-slate-100 active:bg-slate-50"
      >
        <Ionicons name={icon} size={moderateScale(18)} color="#64748B" style={{ marginRight: scale(10) }} />
        {selectedOption && selectedOption.image && (
          <Image 
            source={{ uri: selectedOption.image }} 
            style={{ width: scale(26), height: scale(26), borderRadius: moderateScale(6), marginRight: scale(8) }}
            className="bg-slate-100" 
            resizeMode="cover"
          />
        )}
        <Text 
          style={{ fontSize: moderateScale(14) }}
          className={value ? "flex-1 font-jakarta-semibold text-slate-900" : "flex-1 font-jakarta-semibold text-slate-400"}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={moderateScale(18)} color="#94A3B8" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-white rounded-t-[32px] p-6 max-h-[60%]">
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />
            <Text className="text-lg font-jakarta-bold text-slate-900 mb-4 px-2">Select {label}</Text>

            <FlatList
              data={options}
              keyExtractor={(item, index) => (typeof item === "string" ? item : item.name || String(index))}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isObject = typeof item !== "string";
                const labelText = isObject ? item.name : item;
                const isSelected = value === labelText;

                return (
                  <TouchableOpacity
                    className="py-4 px-4 border-b border-slate-100 flex-row items-center justify-between"
                    onPress={() => {
                      onSelect(labelText);
                      setModalVisible(false);
                    }}
                  >
                    <View className="flex-row items-center">
                      {isObject && item.image && (
                        <Image 
                          source={{ uri: item.image }} 
                          style={{ width: 40, height: 35 }}
                          className="rounded-lg mr-3 bg-slate-100" 
                          resizeMode="cover"
                        />
                      )}
                      <Text className={isSelected ? "text-[16px] font-jakarta-semibold text-blue-900" : "text-[16px] font-jakarta-semibold text-slate-700"}>
                        {labelText}
                      </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color="#1E3A8A" />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- MAIN SCREEN ---
const BuyerProfileSettings = () => {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const [activeTab, setActiveTab] = useState("Business");
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutConfirmVisible(false);
    setGlobalRole("buyer");
    setSellerSignedIn(false);
    setGlobalSellerId(null);
    setGlobalBuyerId(null);
    try {
      await AsyncStorage.removeItem("buyerId");
      await AsyncStorage.removeItem("supplierId");
      await AsyncStorage.removeItem("phone");
      await AsyncStorage.removeItem("phoneNumber");
    } catch (e) {
      console.log("Error clearing storage:", e);
    }
    router.replace("/(auth)/choose-role");
  };

  // Unified State for Profile Data
  const [profileData, setProfileData] = useState({
    companyName: "",
    ceoName: "",
    gstNumber: "",
    establishedDate: "",
    ownershipType: "",
    businessField: "",
    businessType: "",
    employeeCount: "",
    annualTurnover: "",
    stateName: "",
    cityName: "",
    businessAddress: "",
    accountNumber: "",
    accountHolderName: "",
    bankName: "",
    branchName: "",
    ifsc: "",
    panNumber: "",
    aadhaarNumber: "",
    tanNumber: "",
    whatsApp: "",
    linkedIn: "",
    instagram: "",
    facebook: "",
    telegram: "",
    youtube: "",
    twitter: "",
  });

  const handleChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const [industryOptions, setIndustryOptions] = useState<Array<{ name: string; image?: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch data when the component mounts
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch("https://backend.inquirybazaar.com/api/industries");
        const json = await response.json();

        let list: any[] = [];
        if (Array.isArray(json)) {
          list = json;
        } else if (json && Array.isArray(json.data)) {
          list = json.data;
        } else if (json && Array.isArray(json.industries)) {
          list = json.industries;
        } else if (json && Array.isArray(json.results)) {
          list = json.results;
        }

        const formattedOptions = list.map((item: any) => {
          if (typeof item === "string") {
            return { name: item, image: undefined };
          }
          return {
            name: item.name || item.industry_name || "",
            image: item.image || item.imageUrl || item.icon || undefined
          };
        }).filter((opt: any) => opt.name);

        setIndustryOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching industries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  // Fetch Business, Bank, and Social Profiles from backend
  const fetchProfileData = async (showGlobalLoader = true) => {
    if (showGlobalLoader) setLoading(true);
    try {
      const storedId = await AsyncStorage.getItem("buyerId");
      if (storedId) {
        setBuyerId(storedId);

        // ✅ UPDATED TO BUYER ENDPOINT
        const API_BASE = "https://buyer.inquirybazaar.com/api/profile";

        // 1. Fetch Business Profile
        const businessRes = await fetch(`${API_BASE}/business`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": storedId,
          },
        });

        let businessData: any = {};
        if (businessRes.ok) {
          const businessJson = await businessRes.json();
          businessData = businessJson.data || businessJson.profile || businessJson || {};
        }

        // 2. Fetch Bank Profile
        const bankRes = await fetch(`${API_BASE}/bank`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": storedId,
          },
        });

        let bankData: any = {};
        if (bankRes.ok) {
          const bankJson = await bankRes.json();
          bankData = bankJson.data || bankJson.profile || bankJson || {};
        }

        // 3. Fetch Social Profile
        const socialRes = await fetch(`${API_BASE}/social`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": storedId,
          },
        });

        let socialData: any = {};
        if (socialRes.ok) {
          const socialJson = await socialRes.json();
          socialData = socialJson.data || socialJson.profile || socialJson || {};
        }

        // 4. Fetch Additional Info Profile
        const additionalRes = await fetch(`${API_BASE}/additional`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": storedId,
          },
        });

        let additionalData: any = {};
        if (additionalRes.ok) {
          const additionalJson = await additionalRes.json();
          additionalData = additionalJson.data || additionalJson.profile || additionalJson || {};
        }

        // Map datasets into the unified state object
        const activeSocial = socialData.social || socialData || {};
        const fallbackSocial = businessData.social || businessData.socialLinks || businessData.social_links || {};

        setProfileData({
          companyName: businessData.companyName || businessData.company_name || "",
          ceoName: businessData.ceoName || businessData.ceo_name || "",
          gstNumber: businessData.gstNumber || businessData.gst_number || "",
          establishedDate: businessData.establishedDate || businessData.established_date || "",
          ownershipType: businessData.ownershipType || businessData.ownership_type || "",
          businessField: businessData.businessField || businessData.business_field || "",
          businessType: businessData.businessType || "",
          employeeCount: businessData.employeeCount || businessData.employee_count || businessData.numberOfEmployees || businessData.number_of_employees || "",
          annualTurnover: businessData.annualTurnover || businessData.annual_turnover || "",
          stateName: businessData.stateName || businessData.state || businessData.state_name || "",
          cityName: businessData.cityName || businessData.city || businessData.city_name || "",
          businessAddress: businessData.businessAddress || businessData.address || businessData.business_address || "",
          
          accountNumber: bankData.accountNumber || bankData.account_number || "",
          accountHolderName: bankData.accountHolderName || bankData.account_holder_name || "",
          bankName: bankData.bankName || bankData.bank_name || "",
          branchName: bankData.branchName || bankData.branch_name || "",
          ifsc: bankData.ifsc || "",

          panNumber: additionalData.panNumber || businessData.panNumber || businessData.pan_number || "",
          aadhaarNumber: additionalData.aadhaarNumber || businessData.aadhaarNumber || businessData.aadhaar_number || "",
          tanNumber: additionalData.tanNumber || businessData.tanNumber || businessData.tan_number || "",
          whatsApp: activeSocial.whatsApp || activeSocial.whatsapp || fallbackSocial.whatsApp || fallbackSocial.whatsapp || "",
          linkedIn: activeSocial.linkedIn || activeSocial.linkedin || fallbackSocial.linkedIn || fallbackSocial.linkedin || "",
          instagram: activeSocial.instagram || fallbackSocial.instagram || "",
          facebook: activeSocial.facebook || fallbackSocial.facebook || "",
          telegram: activeSocial.telegram || fallbackSocial.telegram || "",
          youtube: activeSocial.youtube || fallbackSocial.youtube || "",
          twitter: activeSocial.twitter || activeSocial.x || fallbackSocial.twitter || fallbackSocial.x || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
    } finally {
      if (showGlobalLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData(true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData(false);
    setRefreshing(false);
  };

  // Save/Update Profile to backend
  const handleSaveProfile = async () => {
    const currentBuyerId = buyerId || await AsyncStorage.getItem("buyerId");
    if (!currentBuyerId) {
      Alert.alert("Error", "Buyer session not found. Please log in again.");
      return;
    }
    setLoading(true);
    
    // ✅ UPDATED TO BUYER ENDPOINT
    const API_BASE = "https://buyer.inquirybazaar.com/api/profile";

    if (activeTab === "Bank") {
      const bankPayload = {
        accountNumber: profileData.accountNumber,
        accountHolderName: profileData.accountHolderName,
        bankName: profileData.bankName,
        branchName: profileData.branchName,
        ifsc: profileData.ifsc,
      };

      try {
        const res = await fetch(`${API_BASE}/bank`, {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentBuyerId,
          },
          body: JSON.stringify(bankPayload),
        });

        const resText = await res.text();
        if (res.ok) {
          Alert.alert("Success", "Bank Details saved successfully!");
        } else {
          let errorMessage = "Failed to save bank details.";
          try {
            const errData = JSON.parse(resText);
            errorMessage = errData.message || errorMessage;
          } catch (e) {}
          Alert.alert("Error", `Code ${res.status}: ${errorMessage}`);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "An unexpected error occurred while saving bank details.");
      } finally {
        setLoading(false);
      }
    } else if (activeTab === "Social") {
      const socialPayload = {
        whatsApp: profileData.whatsApp,
        linkedIn: profileData.linkedIn,
        instagram: profileData.instagram,
        facebook: profileData.facebook,
        telegram: profileData.telegram,
        youtube: profileData.youtube,
        twitter: profileData.twitter,
        whatsapp: profileData.whatsApp,
        linkedin: profileData.linkedIn,
      };

      try {
        const res = await fetch(`${API_BASE}/social`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentBuyerId,
          },
          body: JSON.stringify(socialPayload),
        });

        const resText = await res.text();
        if (res.ok) {
          Alert.alert("Success", "Social links saved successfully!");
        } else {
          let errorMessage = "Failed to save social links.";
          try {
            const errData = JSON.parse(resText);
            errorMessage = errData.message || errorMessage;
          } catch (e) {}
          Alert.alert("Error", `Code ${res.status}: ${errorMessage}`);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "An unexpected error occurred while saving social links.");
      } finally {
        setLoading(false);
      }
    } else if (activeTab === "Additional Info") {
      const additionalPayload = {
        panNumber: profileData.panNumber,
        aadhaarNumber: profileData.aadhaarNumber,
        tanNumber: profileData.tanNumber,
      };

      try {
        const res = await fetch(`${API_BASE}/additional`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentBuyerId,
          },
          body: JSON.stringify(additionalPayload),
        });

        const resText = await res.text();
        if (res.ok) {
          Alert.alert("Success", "Additional Info saved successfully!");
        } else {
          let errorMessage = "Failed to save additional info.";
          try {
            const errData = JSON.parse(resText);
            errorMessage = errData.message || errorMessage;
          } catch (e) {}
          Alert.alert("Error", `Code ${res.status}: ${errorMessage}`);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "An unexpected error occurred while saving additional info.");
      } finally {
        setLoading(false);
      }
    } else {
      const payload = {
        ...profileData,
        numberOfEmployees: profileData.employeeCount,
        state: profileData.stateName, 
        city: profileData.cityName, 
        address: profileData.businessAddress,
        social: {
          whatsApp: profileData.whatsApp,
          linkedIn: profileData.linkedIn,
          instagram: profileData.instagram,
          facebook: profileData.facebook,
          telegram: profileData.telegram,
          youtube: profileData.youtube,
          twitter: profileData.twitter,
        },
        socialLinks: {
          whatsApp: profileData.whatsApp,
          linkedIn: profileData.linkedIn,
          instagram: profileData.instagram,
          facebook: profileData.facebook,
          telegram: profileData.telegram,
          youtube: profileData.youtube,
          twitter: profileData.twitter,
        },
        social_links: {
          whatsapp: profileData.whatsApp,
          linkedin: profileData.linkedIn,
          instagram: profileData.instagram,
          facebook: profileData.facebook,
          telegram: profileData.telegram,
          youtube: profileData.youtube,
          twitter: profileData.twitter,
        }
      };

      try {
        const res = await fetch(`${API_BASE}/business`, {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentBuyerId,
          },
          body: JSON.stringify(payload),
        });

        const resText = await res.text();
        if (res.ok) {
          Alert.alert("Success", "Business Profile saved successfully!");
        } else {
          let errorMessage = "Failed to save business profile settings.";
          try {
            const errData = JSON.parse(resText);
            errorMessage = errData.message || errorMessage;
          } catch (e) {}
          Alert.alert("Error", `Code ${res.status}: ${errorMessage}`);
        }
      } catch (error: any) {
        Alert.alert("Error", error.message || "An unexpected error occurred while saving profile.");
      } finally {
        setLoading(false);
      }
    }
  };


  const tabs = [
    { id: "Business", icon: "briefcase" },
    { id: "Bank", icon: "business" },
    { id: "Additional Info", icon: "link" },
    { id: "Reviews", icon: "star" },
    { id: "Performance", icon: "trending-up" },
    { id: "Docs", icon: "document-text" },
    { id: "Social", icon: "share-social" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      className="flex-1 bg-slate-50"
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Navbar />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E3A8A"]}
            tintColor="#1E3A8A"
          />
        }
      >
        {/* PROFILE HEADER */}
        <View 
          style={{
            borderBottomLeftRadius: moderateScale(32),
            borderBottomRightRadius: moderateScale(32),
            paddingHorizontal: scale(24),
            paddingTop: verticalScale(24),
            paddingBottom: verticalScale(32),
            marginBottom: verticalScale(24),
          }}
          className="bg-white shadow-xl shadow-slate-200/50 mb-6 z-10"
        >
          <View className="items-center relative">
            <TouchableOpacity
              onPress={() => setLogoutConfirmVisible(true)}
              style={{
                height: scale(38),
                width: scale(38),
                borderRadius: scale(19),
              }}
              className="absolute top-0 right-0 bg-rose-50 items-center justify-center border border-rose-100 shadow-sm active:bg-rose-100"
            >
              <Ionicons name="log-out-outline" size={moderateScale(18)} color="#E11D48" />
            </TouchableOpacity>
            <View style={{ marginBottom: verticalScale(16) }} className="relative">
              <View 
                style={{
                  height: scale(88),
                  width: scale(88),
                  borderRadius: scale(44),
                }}
                className="bg-blue-50 border-2 border-blue-100 items-center justify-center"
              >
                <Text style={{ fontSize: moderateScale(36) }} className="font-jakarta-bold text-blue-900">B</Text>
              </View>
              <TouchableOpacity 
                style={{
                  height: scale(28),
                  width: scale(28),
                  borderRadius: scale(14),
                }}
                className="absolute bottom-0 right-0 bg-blue-900 items-center justify-center border-2 border-white shadow-sm"
              >
                <Ionicons name="camera" size={moderateScale(14)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: moderateScale(22) }} className="font-jakarta-bold text-slate-900 tracking-tight">Buyer Profile</Text>
            <Text style={{ fontSize: moderateScale(14), marginBottom: verticalScale(6) }} className="font-jakarta-medium text-slate-500">Manage your business details</Text>
          </View>
        </View>

        {/* HORIZONTAL SCROLLING TABS */}
        <View style={{ marginBottom: verticalScale(24) }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: scale(20), gap: scale(10) }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <View
                    style={[
                      { 
                        flexDirection: "row", 
                        alignItems: "center", 
                        paddingHorizontal: scale(16), 
                        paddingVertical: verticalScale(10), 
                        borderRadius: moderateScale(12) 
                      },
                      isActive
                        ? { backgroundColor: "#1E3A8A", shadowColor: "#1E3A8A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }
                        : { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" }
                    ]}
                  >
                    <Ionicons
                      name={`${tab.icon}${isActive ? "" : "-outline"}` as any}
                      size={moderateScale(16)}
                      color={isActive ? "#FFFFFF" : "#64748B"}
                      style={{ marginRight: scale(6) }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        fontWeight: "700",
                        fontFamily: "PlusJakartaSans-Bold",
                        color: isActive ? "#FFFFFF" : "#475569"
                      }}
                    >
                      {tab.id}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* DYNAMIC FORM CONTENT BASED ON ACTIVE TAB */}
        <View className="px-5">
          <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/40 border border-slate-100">

            {activeTab === "Business" && (
              <View>
                <InputField label="Company Name" icon="briefcase-outline" placeholder="Your Company Name" value={profileData.companyName} onChangeText={(val: string) => handleChange("companyName", val)} />
                <InputField label="CEO Name" icon="person-outline" placeholder="CEO / Owner Name" value={profileData.ceoName} onChangeText={(val: string) => handleChange("ceoName", val)} />
                <InputField label="GST Number" icon="receipt-outline" placeholder="GST Identification Number" value={profileData.gstNumber} onChangeText={(val: string) => handleChange("gstNumber", val)} />
                <InputField label="Established Date" icon="calendar-outline" placeholder="dd/mm/yyyy" value={profileData.establishedDate} onChangeText={(val: string) => handleChange("establishedDate", val)} />

                <DropdownField
                  label="Ownership Type"
                  icon="people-outline"
                  placeholder="Proprietorship"
                  value={profileData.ownershipType}
                  onSelect={(val: string) => handleChange("ownershipType", val)}
                  options={["Proprietorship", "Partnership", "Private Limited", "Public Limited", "LLP", "Other"]}
                />
                <DropdownField
                  label="Business Field"
                  icon="layers-outline"
                  placeholder={isLoading ? "Loading industries..." : "Select an industry"}
                  value={profileData.businessField}
                  onSelect={(val: string) => handleChange("businessField", val)}
                  options={industryOptions}
                />
                <DropdownField
                  label="Business Type"
                  icon="storefront-outline"
                  placeholder="Wholesaler"
                  value={profileData.businessType}
                  onSelect={(val: string) => handleChange("businessType", val)}
                  options={["Wholesaler", "Manufacturer", "Retailer", "Distributor", "Service Provider", "Trader", "Other"]}
                />
                <DropdownField
                  label="Number of Employees"
                  icon="people-circle-outline"
                  placeholder="Select Employees"
                  value={profileData.employeeCount}
                  onSelect={(val: string) => handleChange("employeeCount", val)}
                  options={employeNumber}
                />

                <InputField label="Annual Turnover" icon="cash-outline" placeholder="e.g. 5 - 25 Cr" value={profileData.annualTurnover} onChangeText={(val: string) => handleChange("annualTurnover", val)} />

                <InputField label="Business Address" icon="location-outline" placeholder="Enter Business Address" value={profileData.businessAddress} onChangeText={(val: string) => handleChange("businessAddress", val)} />
              </View>
            )}

            {activeTab === "Bank" && (
              <View>
                <InputField label="Account Number" icon="keypad-outline" placeholder="Account Number" keyboardType="number-pad" value={profileData.accountNumber} onChangeText={(val: string) => handleChange("accountNumber", val)} />
                <InputField label="Account Holder Name" icon="person-outline" placeholder="Account Holder Name" value={profileData.accountHolderName} onChangeText={(val: string) => handleChange("accountHolderName", val)} />
                <InputField label="Bank Name" icon="business-outline" placeholder="Bank Name" value={profileData.bankName} onChangeText={(val: string) => handleChange("bankName", val)} />
                <InputField label="Branch Name" icon="git-branch-outline" placeholder="Branch Name" value={profileData.branchName} onChangeText={(val: string) => handleChange("branchName", val)} />
                <InputField label="IFSC" icon="barcode-outline" placeholder="IFSC Code" value={profileData.ifsc} onChangeText={(val: string) => handleChange("ifsc", val)} />
              </View>
            )}

            {activeTab === "Additional Info" && (
              <View>
                <InputField label="PAN Number" icon="card-outline" placeholder="PAN Number" value={profileData.panNumber} onChangeText={(val: string) => handleChange("panNumber", val)} />
                <InputField label="Aadhaar Number" icon="finger-print-outline" placeholder="Aadhaar Number" keyboardType="number-pad" value={profileData.aadhaarNumber} onChangeText={(val: string) => handleChange("aadhaarNumber", val)} />
                <InputField label="TAN Number" icon="document-text-outline" placeholder="TAN Number" value={profileData.tanNumber} onChangeText={(val: string) => handleChange("tanNumber", val)} />
              </View>
            )}

            {activeTab === "Social" && (
              <View>
                <InputField label="WhatsApp" icon="logo-whatsapp" placeholder="https://wa.me/..." value={profileData.whatsApp} onChangeText={(val: string) => handleChange("whatsApp", val)} />
                <InputField label="LinkedIn" icon="logo-linkedin" placeholder="LinkedIn" value={profileData.linkedIn} onChangeText={(val: string) => handleChange("linkedIn", val)} />
                <InputField label="Instagram" icon="logo-instagram" placeholder="Instagram" value={profileData.instagram} onChangeText={(val: string) => handleChange("instagram", val)} />
                <InputField label="Facebook" icon="logo-facebook" placeholder="Facebook" value={profileData.facebook} onChangeText={(val: string) => handleChange("facebook", val)} />
                <InputField label="Telegram" icon="paper-plane-outline" placeholder="Telegram" value={profileData.telegram} onChangeText={(val: string) => handleChange("telegram", val)} />
                <InputField label="YouTube" icon="logo-youtube" placeholder="YouTube" value={profileData.youtube} onChangeText={(val: string) => handleChange("youtube", val)} />
                <InputField label="X (Twitter)" icon="logo-twitter" placeholder="X (Twitter)" value={profileData.twitter} onChangeText={(val: string) => handleChange("twitter", val)} />
              </View>
            )}

            {/* Placeholder for the other tabs shown in UI */}
            {(activeTab === "Reviews" || activeTab === "Performance" || activeTab === "Docs") && (
              <View className="py-10 items-center justify-center">
                <Ionicons name="construct-outline" size={48} color="#CBD5E1" className="mb-4" />
                <Text className="text-slate-500 font-jakarta-medium text-center">
                  {activeTab} module is coming soon.
                </Text>
              </View>
            )}

            {loading && (
              <ActivityIndicator size="small" color="#1E3A8A" style={{ marginVertical: 10 }} />
            )}

            <TouchableOpacity
              onPress={handleSaveProfile}
              className="bg-blue-900 rounded-2xl h-14 items-center justify-center mt-4 shadow-lg shadow-blue-900/30 active:opacity-90"
            >
              <Text className="text-white text-[16px] font-jakarta-bold">Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLogoutConfirmVisible(true)}
              className="flex-row border border-rose-200 bg-rose-50/50 rounded-2xl h-14 items-center justify-center mt-4 active:bg-rose-100/50"
            >
              <Ionicons name="log-out-outline" size={20} color="#E11D48" style={{ marginRight: 8 }} />
              <Text className="text-rose-600 text-[16px] font-jakarta-bold">Log Out</Text>
            </TouchableOpacity>

          </View>
        </View>

      </ScrollView>

      {/* Logout Confirmation Modal Overlay */}
      <Modal
        visible={logoutConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutConfirmVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.55)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: width * 0.8, backgroundColor: "#ffffff", borderRadius: 24, padding: 24, alignItems: "center", shadowColor: "#0F172A", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFF1F2", alignItems: "center", justifyContent: "center", marginBottom: 16, flexDirection: "row" }}>
              <Ionicons name="log-out" size={28} color="#E11D48" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#0F172A", fontFamily: "PlusJakartaSans-Bold", marginBottom: 8, textAlign: "center" }}>
              Confirm Logout
            </Text>
            <Text style={{ fontSize: 14, color: "#64748B", fontFamily: "PlusJakartaSans-Medium", textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
              Are you sure you want to log out? You will need to sign in again to access your profile.
            </Text>
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => setLogoutConfirmVisible(false)}
                style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#475569", fontFamily: "PlusJakartaSans-Bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: "#E11D48", justifyContent: "center", alignItems: "center" }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff", fontFamily: "PlusJakartaSans-Bold" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default BuyerProfileSettings;