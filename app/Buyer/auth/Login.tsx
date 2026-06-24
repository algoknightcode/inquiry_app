import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
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
import { setGlobalRole, setGlobalBuyerId } from "../../../utils/roleCache";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BuyerLogin = () => {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Buyer Login Submitted");
    console.log({ data: formdata });
    
    if (!formdata.email || !formdata.password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    // Demo credentials login bypass
    if ((formdata.email === "testing@gmail.com" || formdata.email === "1111111111" || formdata.email === "8888888888") && formdata.password === "test") {
      console.log("ℹ️ Buyer Login Path: DEMO BYPASS MATCHED");
      await AsyncStorage.setItem("buyerId", "buyer-demo-id-12345");
      setGlobalBuyerId("buyer-demo-id-12345");
      setGlobalRole("buyer");
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        router.replace("/Buyer/profile");
      }, 1500);
      return;
    }
    setLoading(true);
    try {
      console.log("🚀 Buyer Login Path: CALLING REAL API for", formdata.email);
      
      const response = await fetch("https://buyer.inquirybazaar.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formdata.email,
          password: formdata.password,
        }),
      });
      const json = await response.json();
      console.log("📥 POST Login Response:", json);
      if (response.ok && json.success) {
        // Extract the user's MongoDB ID
        const loggedInUserId = json.user?.id || json.user?._id || json.userId || json.data?.user?._id || json.data?.user?.id;
        if (loggedInUserId) {
          console.log("🔑 Logged in Buyer User ID:", loggedInUserId);
          
          // Save actual ID to AsyncStorage
          await AsyncStorage.setItem("buyerId", loggedInUserId);
          setGlobalBuyerId(loggedInUserId);
          setGlobalRole("buyer");
          
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            router.replace("/Buyer/profile");
          }, 1500);
        } else {
          Alert.alert("Error", "Could not retrieve User ID from response.");
        }
      } else {
        Alert.alert("Login Failed", json.message || "Invalid credentials.");
      }
    } catch (error: any) {
      console.log("Error during login request:", error);
      Alert.alert("Error", error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F8FAFC]"
    >

      {/* --- SUCCESS TICK MODAL --- */}
      <Modal visible={isSuccess} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View className="bg-white rounded-[32px] p-8 items-center shadow-2xl shadow-emerald-900/50 w-[80%] max-w-[340px]">
            <View className="bg-emerald-50 h-20 w-20 rounded-full items-center justify-center mb-5 border-[4px] border-white shadow-lg shadow-emerald-100">
              <Ionicons name="checkmark" size={40} color="#10B981" />
            </View>
            <Text className="text-[20px] font-jakarta-bold text-slate-900 mb-2 tracking-tight">Login Successful!</Text>
            <Text className="text-[14px] font-jakarta-medium text-slate-500 text-center leading-relaxed">
              Welcome back to your workspace.
            </Text>
          </View>
        </View>
      </Modal>


      <View className="flex-1 justify-start">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start", paddingTop: 24 }}
          className="px-4 pb-6"
          showsVerticalScrollIndicator={false}
        >

          {/* Main Card Element */}
          <View className="bg-white rounded-[32px] px-6 py-9 shadow-2xl shadow-black/30 w-full min-h-[580px]">
            {/* Brand Logo & Context Headers */}
            <View className="items-center mb-6">
              <Image source={Logo} className="w-44 h-16 mb-4" resizeMode="contain" />
              <Text className="text-[30px] font-jakarta-bold font-extrabold text-blue-900 tracking-tight mb-1.5">
                Buyer Login
              </Text>
              <Text className="text-[15px] font-jakarta-medium text-slate-400">
                Access your account securely
              </Text>
            </View>

            {/* Inputs & Form Wrapper */}
            <View className="w-full gap-y-4">
              {/* Email or Phone Number Field */}
              <View className="flex-row items-center bg-white border-[1.5px] border-slate-200 rounded-2xl h-14 px-4">
                <Ionicons name="person-outline" size={20} color="#64748B" className="mr-3" />
                <TextInput
                  className="flex-1 h-full text-slate-900 text-[15px] font-jakarta-semibold font-semibold"
                  placeholder="Email Address or Phone Number"
                  placeholderTextColor="#94A3B8"
                  value={formdata.email}
                  onChangeText={(val) => handleChange("email", val)}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Field */}
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
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} className="p-1">
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              </View>

              {/* Forgot Password Action Trigger */}
              <TouchableOpacity className="items-end -mt-1 pr-1">
                <Text className="text-blue-900 font-jakarta-bold font-bold text-xs tracking-tight">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Dark Blue Main Login Action Button */}
              <TouchableOpacity
                className="bg-blue-900 rounded-2xl h-14 items-center justify-center mt-3 shadow-lg shadow-blue-900/20 active:opacity-95"
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-[16px] font-jakarta-bold font-bold">
                    Login
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Form Redirection Router Hook Placeholder */}
            <View className="items-center mt-7">
              <Text className="text-sm font-jakarta-medium text-slate-500">
                Don't have an account?{" "}
                <Text
                  className="text-blue-900 font-jakarta-bold font-bold"
                  onPress={() => router.push("/Buyer/auth/Signup")}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default BuyerLogin;
