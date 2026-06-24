import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Logo from "../../../assets/images/logoo.webp";

const SellerSignUp = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prevData: any) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    // 1. Basic Validation
    if (!formdata.name.trim() || !formdata.email.trim() || !formdata.phone.trim() || !formdata.password.trim()) {
      Alert.alert("Required Fields", "Please fill out all the fields to register.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Prepare Payload
      const payload = {
        name: formdata.name,
        email: formdata.email,
        phone: formdata.phone,
        password: formdata.password,
        role: "supplier", // Required by backend
      };

      // 3. Make API Call
      const response = await fetch("https://seller.inquirybazaar.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // 4. Handle Response
      if (response.ok && (data.success || data.message === "User created successfully")) {
        Alert.alert("Success!", "Supplier account created successfully. Please login.", [
          { text: "OK", onPress: () => router.push("/Seller/auth/Login") }
        ]);
      } else {
        // Backend returned an error (e.g., email already exists)
        Alert.alert("Registration Failed", data.error || data.message || "Failed to create account.");
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      Alert.alert("Network Error", "Could not connect to the server. Please check your internet and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      className="flex-1 bg-[#F8FAFC]"
      style={{ flex: 1 }}
    >
      {/* Custom Back Header */}
      <View 
        style={{ paddingTop: insets.top + 10, paddingBottom: 10, backgroundColor: "#F8FAFC" }}
        className="px-4 flex-row items-center border-b border-slate-100"
      >
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(auth)/choose-role");
            }
          }} 
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
          <Text style={{ color: "#007AFF", fontSize: 17, marginLeft: -6 }}>Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-jakarta-bold font-bold text-slate-800 ml-4">
          Supplier Registration
        </Text>
      </View>

      <View className="flex-1 justify-start">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start", paddingTop: 16 }}
          className="px-4 pb-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card Canvas */}
          <View className="bg-white rounded-[32px] px-6 py-9 shadow-2xl shadow-black/30 w-full min-h-[580px]">
            
            {/* Brand Header */}
            <View className="items-center mb-8">
              <Image source={Logo} className="w-44 h-16 mb-4" resizeMode="contain" />
              <Text className="text-[26px] font-jakarta-bold font-extrabold text-blue-900 tracking-tight mb-1.5">
                Supplier Registration
              </Text>
              <Text className="text-[15px] font-jakarta-medium text-slate-500">
                Create your supplier account
              </Text>
            </View>

            {/* Input Form Wrapper */}
            <View className="w-full gap-y-4">
              
              {/* Full Name Input Container */}
              <View className="flex-row items-center bg-white border-[1.5px] border-slate-200 rounded-2xl h-14 px-4">
                <Ionicons name="person-outline" size={20} color="#64748B" className="mr-3" />
                <TextInput
                  className="flex-1 h-full text-slate-900 text-[15px] font-jakarta-semibold font-semibold"
                  placeholder="Full Name"
                  placeholderTextColor="#94A3B8"
                  value={formdata.name}
                  onChangeText={(val) => handleChange("name", val)}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              {/* Email Address Input Container */}
              <View className="flex-row items-center bg-white border-[1.5px] border-slate-200 rounded-2xl h-14 px-4">
                <Ionicons name="mail-outline" size={20} color="#64748B" className="mr-3" />
                <TextInput
                  className="flex-1 h-full text-slate-900 text-[15px] font-jakarta-semibold font-semibold"
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                  value={formdata.email}
                  onChangeText={(val) => handleChange("email", val)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              {/* Phone Number Input Container */}
              <View className="flex-row items-center bg-white border-[1.5px] border-slate-200 rounded-2xl h-14 px-4">
                <Ionicons name="call-outline" size={20} color="#64748B" className="mr-3" />
                <TextInput
                  className="flex-1 h-full text-slate-900 text-[15px] font-jakarta-semibold font-semibold"
                  placeholder="Phone Number"
                  placeholderTextColor="#94A3B8"
                  value={formdata.phone}
                  onChangeText={(val) => handleChange("phone", val)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>

              {/* Password Input Container */}
              <View className="flex-row items-center bg-white border-[1.5px] border-slate-200 rounded-2xl h-14 px-4">
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" className="mr-3" />
                <TextInput
                  className="flex-1 h-full text-slate-900 text-[15px] font-jakarta-semibold font-semibold"
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  value={formdata.password}
                  onChangeText={(val) => handleChange("password", val)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} className="p-1">
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>

              {/* Branded Orange CTA Button */}
              <TouchableOpacity 
                className={`rounded-2xl h-14 items-center justify-center mt-3 shadow-lg active:opacity-90 ${
                  isLoading ? "bg-orange-400 shadow-orange-400/30" : "bg-orange-600 shadow-orange-600/30"
                }`}
                onPress={handleSubmit} 
                activeOpacity={0.9}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-[16px] font-jakarta-bold font-bold">
                    Register Supplier
                  </Text>
                )}
              </TouchableOpacity>

            </View>

            {/* Account Switch Redirect */}
            <View className="items-center mt-7">
              <Text className="text-sm font-jakarta-medium text-slate-500">
                Already have an account?{" "}
                <Text 
                  className="text-blue-900 font-jakarta-bold font-bold" 
                  onPress={() => {
                    if (!isLoading) router.push("/Seller/auth/Login");
                  }}
                >
                  Login
                </Text>
              </Text>
            </View>

          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SellerSignUp;