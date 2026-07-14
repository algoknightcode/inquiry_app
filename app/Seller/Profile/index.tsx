import Navbar from "@/components/Home/Navbar";
import { useRole } from "@/contexts/RoleContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    FlatList,
    Image,
    InteractionManager,
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import { employeNumber, locations } from "../data/data";

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
const SellerProfileSettings = () => {
  const insets = useSafeAreaInsets();
  const { globalSellerId, setSellerSignedIn, setGlobalSellerId, setGlobalBuyerId, setGlobalRole, clearRoleState } = useRole();
  const [activeTab, setActiveTab] = useState("Business");
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

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

  const handleLogout = async () => {
    await clearRoleState();
    try {
      await AsyncStorage.multiRemove(["supplierId", "buyerId", "phone", "phoneNumber"]);
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

  // 1. Initialize with an empty array
  const [industryOptions, setIndustryOptions] = useState<Array<{ name: string; image?: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. Fetch data when the component mounts
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch("https://backend.inquirybazaar.com/api/industries");
        const json = await response.json();
        console.log("📥 GET Industries Response:", json);

        // Robustly extract the array from response
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

        if (isMounted.current) {
          setIndustryOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    const task = InteractionManager.runAfterInteractions(() => {
      fetchIndustries();
    });
    return () => task.cancel();
  }, []);

  // Fetch Business, Bank, and Social Profiles from backend
  const fetchProfileData = async (showGlobalLoader = true) => {
    if (showGlobalLoader) {
      setLoading(true);
      setInitialLoading(true);
    }
    try {
      const storedId = globalSellerId || await AsyncStorage.getItem("supplierId");
      if (storedId) {
        setSellerId(storedId);

        // 1. Fetch Business Profile
        const businessRes = await fetch("https://seller.inquirybazaar.com/api/profile/business", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": storedId,
          },
        });

        let businessData: any = {};
        if (businessRes.ok) {
          const businessJson = await businessRes.json();
          console.log("📥 GET Business Profile JSON Response:", businessJson);
          businessData = businessJson.data || businessJson.profile || businessJson || {};
        }

        // 2. Fetch Bank Profile
        const bankRes = await fetch("https://seller.inquirybazaar.com/api/profile/bank", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": storedId,
          },
        });

        let bankData: any = {};
        if (bankRes.ok) {
          const bankJson = await bankRes.json();
          console.log("📥 GET Bank Profile JSON Response:", bankJson);
          bankData = bankJson.data || bankJson.profile || bankJson || {};
        }

        // 3. Fetch Social Profile
        const socialRes = await fetch("https://seller.inquirybazaar.com/api/profile/social", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": storedId,
          },
        });

        let socialData: any = {};
        if (socialRes.ok) {
          const socialJson = await socialRes.json();
          console.log("📥 GET Social Profile JSON Response:", socialJson);
          socialData = socialJson.data || socialJson.profile || socialJson || {};
        }

        // 4. Fetch Additional Info Profile
        const additionalRes = await fetch("https://seller.inquirybazaar.com/api/profile/additional", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": storedId,
          },
        });

        let additionalData: any = {};
        if (additionalRes.ok) {
          const additionalJson = await additionalRes.json();
          console.log("📥 GET Additional Info JSON Response:", additionalJson);
          additionalData = additionalJson.data || additionalJson.profile || additionalJson || {};
        }

        // Map datasets into the unified state object
        const activeSocial = socialData.social || socialData || {};
        const fallbackSocial = businessData.social || businessData.socialLinks || businessData.social_links || {};

        if (isMounted.current) {
          setProfileData({
            companyName: businessData.companyName || businessData.name || businessData.company_name || "",
            ceoName: businessData.ceoName || businessData.ceo_name || "",
            gstNumber: businessData.gstNumber || businessData.gst || businessData.gst_number || "",
            establishedDate: businessData.establishedDate || businessData.established_date || "",
            ownershipType: businessData.ownershipType || businessData.ownership_type || "",
            businessField: businessData.businessField || businessData.business_field || "",
            businessType: businessData.businessType || businessData.business_type || "",
            employeeCount: businessData.employeeCount || businessData.employee_count || "",
            annualTurnover: businessData.annualTurnover || businessData.annual_turnover || "",
            stateName: businessData.stateName || businessData.state || businessData.state_name || "",
            cityName: businessData.cityName || businessData.city || businessData.city_name || "",
            businessAddress: businessData.businessAddress || businessData.address || businessData.business_address || "",
            
            // Map Bank details from the separate API response
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
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
    } finally {
      if (showGlobalLoader && isMounted.current) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      fetchProfileData(true);
    });
    return () => task.cancel();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData(false);
    setRefreshing(false);
  };

  // Save/Update Profile to backend
  const handleSaveProfile = async () => {
    const currentSellerId = globalSellerId || sellerId || await AsyncStorage.getItem("supplierId");
    if (!currentSellerId) {
      Alert.alert("Error", "Seller session not found. Please log in again.");
      return;
    }
    setLoading(true);

    if (activeTab === "Bank") {
      // Save Bank Details using /api/profile/bank
      const bankPayload = {
        accountNumber: profileData.accountNumber,
        accountHolderName: profileData.accountHolderName,
        bankName: profileData.bankName,
        branchName: profileData.branchName,
        ifsc: profileData.ifsc,
      };

      try {
        console.log("📤 Sending Bank Save Payload:", JSON.stringify(bankPayload, null, 2));
        const res = await fetch("https://seller.inquirybazaar.com/api/profile/bank", {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentSellerId,
          },
          body: JSON.stringify(bankPayload),
        });

        console.log("📥 POST Bank Response Status:", res.status);
        const resText = await res.text();
        console.log("📥 POST Bank Response Body:", resText);

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
        console.error("Error saving bank details:", error);
        Alert.alert("Error", error.message || "An unexpected error occurred while saving bank details.");
      } finally {
        setLoading(false);
      }
    } else if (activeTab === "Social") {
      // Save Social Details using POST https://seller.inquirybazaar.com/api/profile/social
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
        console.log("📤 Sending Social Save Payload:", JSON.stringify(socialPayload, null, 2));
        const res = await fetch("https://seller.inquirybazaar.com/api/profile/social", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentSellerId,
          },
          body: JSON.stringify(socialPayload),
        });

        console.log("📥 POST Social Response Status:", res.status);
        const resText = await res.text();
        console.log("📥 POST Social Response Body:", resText);

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
        console.error("Error saving social links:", error);
        Alert.alert("Error", error.message || "An unexpected error occurred while saving social links.");
      } finally {
        setLoading(false);
      }
    } else if (activeTab === "Additional Info") {
      // Save Additional Info using POST https://seller.inquirybazaar.com/api/profile/additional
      const additionalPayload = {
        panNumber: profileData.panNumber,
        aadhaarNumber: profileData.aadhaarNumber,
        tanNumber: profileData.tanNumber,
      };

      try {
        console.log("📤 Sending Additional Info Save Payload:", JSON.stringify(additionalPayload, null, 2));
        const res = await fetch("https://seller.inquirybazaar.com/api/profile/additional", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentSellerId,
          },
          body: JSON.stringify(additionalPayload),
        });

        console.log("📥 POST Additional Response Status:", res.status);
        const resText = await res.text();
        console.log("📥 POST Additional Response Body:", resText);

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
        console.error("Error saving additional info:", error);
        Alert.alert("Error", error.message || "An unexpected error occurred while saving additional info.");
      } finally {
        setLoading(false);
      }
    } else {
      // Save Business Profile details using /api/profile/business
      const payload = {
        ...profileData,
        numberOfEmployees: profileData.employeeCount, // Backend DB field name
        state: profileData.stateName, // Backend DB field name
        city: profileData.cityName, // Backend DB field name (REQUIRED in DB Schema)
        address: profileData.businessAddress, // Backend DB field name
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
        console.log("📤 Sending Save Payload:", JSON.stringify(payload, null, 2));
        const res = await fetch("https://seller.inquirybazaar.com/api/profile/business", {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentSellerId,
          },
          body: JSON.stringify(payload),
        });

        console.log("📥 POST Save Response Status:", res.status);
        const resText = await res.text();
        console.log("📥 POST Save Response Body:", resText);

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
        console.error("Error saving profile details:", error);
        Alert.alert("Error", error.message || "An unexpected error occurred while saving profile.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Added Reviews, Performance, and Docs to match your images
  const selectedState = locations.find(
    (item) => item.state === profileData.stateName
  );

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
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
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
              onPress={handleLogout}
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
                <Text style={{ fontSize: moderateScale(36) }} className="font-jakarta-bold text-blue-900">
                  {(profileData.ceoName || "Seller").charAt(0).toUpperCase()}
                </Text>
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
            <Text style={{ fontSize: moderateScale(22) }} className="font-jakarta-bold text-slate-900 tracking-tight">
              {profileData.ceoName || "Seller Name"}
            </Text>
            <Text style={{ fontSize: moderateScale(14), marginBottom: verticalScale(6) }} className="font-jakarta-medium text-slate-500">
              {profileData.companyName || "Company Name"}
            </Text>
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

            {initialLoading ? (
              <View style={{ py: 48, minHeight: 250, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1E3A8A" />
                <Text style={{ marginTop: 16 }} className="text-slate-500 font-jakarta-medium text-center">Loading details...</Text>
              </View>
            ) : (
              <>
                {activeTab === "Business" && (
                  <View>
                    <InputField label="Company Name" icon="briefcase-outline" placeholder="Enter Company Name" value={profileData.companyName} onChangeText={(val: string) => handleChange("companyName", val)} />
                    <InputField label="CEO Name" icon="person-outline" placeholder="Enter CEO Name" value={profileData.ceoName} onChangeText={(val: string) => handleChange("ceoName", val)} />
                    <InputField label="GST Number" icon="receipt-outline" placeholder="Enter GST Number" value={profileData.gstNumber} onChangeText={(val: string) => handleChange("gstNumber", val)} />
                    <InputField label="Established Date" icon="calendar-outline" placeholder="dd/mm/yyyy" value={profileData.establishedDate} onChangeText={(val: string) => handleChange("establishedDate", val)} />

                    <DropdownField
                      label="Ownership Type"
                      icon="people-outline"
                      placeholder="Proprietorship"
                      value={profileData.ownershipType}
                      onSelect={(val: string) => handleChange("ownershipType", val)}
                      options={["Proprietorship", "Partnership", "Private Limited", "Public Limited"]}
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
                      options={["Wholesaler", "Manufacturer", "Retailer", "Distributor"]}
                    />
                    <DropdownField
                      label="Number of Employees"
                      icon="people-circle-outline"
                      placeholder="Select Employees"
                      value={profileData.employeeCount}
                      onSelect={(val: string) => handleChange("employeeCount", val)}
                      options={employeNumber}
                    />

                    <InputField label="Annual Turnover" icon="cash-outline" placeholder="Enter Annual Turnover" value={profileData.annualTurnover} onChangeText={(val: string) => handleChange("annualTurnover", val)} />

                    <DropdownField
                      label="State"
                      icon="map-outline"
                      placeholder="Select State"
                      value={profileData.stateName}
                      onSelect={(val: string) => {
                        handleChange("stateName", val);
                        handleChange("cityName", ""); // Reset city on state change
                      }}
                      options={locations.map(item => item.state)}
                    />
                    <DropdownField
                      label="City"
                      icon="pin-outline"
                      placeholder="Select City"
                      value={profileData.cityName}
                      onSelect={(val: string) => handleChange("cityName", val)}
                      options={selectedState ? selectedState.cities : []}
                    />
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
                  onPress={handleLogout}
                  className="flex-row border border-rose-200 bg-rose-50/50 rounded-2xl h-14 items-center justify-center mt-4 active:bg-rose-100/50"
                >
                  <Ionicons name="log-out-outline" size={20} color="#E11D48" style={{ marginRight: 8 }} />
                  <Text className="text-rose-600 text-[16px] font-jakarta-bold">Log Out</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SellerProfileSettings;