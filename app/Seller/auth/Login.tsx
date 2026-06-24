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
import { setSellerSignedIn, setGlobalSellerId } from "../../../utils/roleCache";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SellerLogin = () => {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    console.log("Form Submitted");
    console.log({ data: formdata, loginMode, otp });
    
    if (loginMode === "password") {
      if (!formdata.email || !formdata.password) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
      }

      // Demo credentials login bypass
      if ((formdata.email === "testing@gmail.com" || formdata.email === "1111111111" || formdata.email === "8888888888") && formdata.password === "test") {
        console.log("ℹ️ Login Path: DEMO BYPASS MATCHED");
        await AsyncStorage.setItem("supplierId", "6a36322b7d11e405b8330ea1");
        setGlobalSellerId("6a36322b7d11e405b8330ea1");
        setSellerSignedIn(true);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          router.replace("/(tabs)");
        }, 1500);
        return;
      }

      setLoading(true);

      try {
        // Real API Login
        console.log("🚀 Login Path: CALLING REAL API for", formdata.email);
        const response = await loginSeller(formdata);
        console.log("✅ API Login Response Status:", response);

        if (response.success) {
          console.log("👤 Logged-in Seller User ID:", response.id);
          if (response.id) {
            await AsyncStorage.setItem("supplierId", response.id);
            setGlobalSellerId(response.id);
          }
          setSellerSignedIn(true);
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            router.replace("/(tabs)");
          }, 1500);
        } else {
          Alert.alert("Login Failed", response.message || "Invalid credentials.");
        }
      } catch (error) {
        console.log(error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!formdata.email || !otp) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
      }

      // Demo credentials OTP login bypass
      if ((formdata.email === "1111111111" || formdata.email === "8888888888" || formdata.email === "testing@gmail.com") && otp === "1234") {
        console.log("ℹ️ Login Path: DEMO OTP BYPASS MATCHED");
        await AsyncStorage.setItem("supplierId", "6a36322b7d11e405b8330ea1");
        setGlobalSellerId("6a36322b7d11e405b8330ea1");
        setSellerSignedIn(true);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          router.replace("/(tabs)");
        }, 1500);
        return;
      } else {
        Alert.alert("Invalid Details", "Please use dummy number 1111111111 and dummy OTP 1234");
        return;
      }
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
                Login
              </Text>
              <Text className="text-[15px] font-jakarta-medium text-slate-400">
                Access your account securely
              </Text>
            </View>

            {/* Inputs & Form Wrapper */}
            <View className="w-full gap-y-4">
              {/* Email Field */}
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
                  onPress={() => router.push("/Seller/auth/Signup")}
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

async function loginSeller(formdata: { email: string; password: string }): Promise<{ success: boolean; message?: string; id?: string }> {
  try {
    const response = await fetch("https://seller.inquirybazaar.com/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formdata),
    });

    const data = await response.json();
    console.log("📥 Raw API Response Data:", data);

    if (response.ok && data.success) {
      return { success: true, id: data.user?.id };
    } else {
      return { success: false, message: data.message || "Invalid credentials." };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Network connection failed. Please check your internet." };
  }
}

export default SellerLogin;
