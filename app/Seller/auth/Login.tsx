import { Image } from 'expo-image';
import { useRole } from "@/contexts/RoleContext";
import { addNotification } from "@/utils/notificationService";
import { prefetchHomeData } from "@/utils/prefetchHome";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Logo from "../../../assets/images/logoo-Photoroom.png";

const SellerLogin = () => {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSellerSignedIn, setGlobalSellerId, setGlobalBuyerId, setGlobalRole } = useRole();

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
        await AsyncStorage.removeItem("buyerId");
        setGlobalSellerId("6a36322b7d11e405b8330ea1");
        setGlobalBuyerId(null);
        setSellerSignedIn(true);
        setGlobalRole("seller");
        await addNotification("Supplier logged in successfully.");
        prefetchHomeData().catch(() => {}); // Warm Home cache during the success delay below
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          router.navigate("/(tabs)");
        }, 1500);
        return;
      }

      setLoading(true);

      try {
        console.log("🚀 Login Path: CALLING REAL API for", formdata.email);
        const response = await loginSeller(formdata);
        console.log("✅ API Login Response Status:", response);

        if (response.success) {
          console.log("👤 Logged-in Seller User ID:", response.id);
          if (response.id) {
            await AsyncStorage.setItem("supplierId", response.id);
            setGlobalSellerId(response.id);
          }
          await AsyncStorage.removeItem("buyerId");
          setGlobalBuyerId(null);
          setSellerSignedIn(true);
          setGlobalRole("seller");
          await addNotification("Supplier logged in successfully.");
          prefetchHomeData().catch(() => {}); // Warm Home cache during the success delay below
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            router.navigate("/(tabs)");
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
        await AsyncStorage.removeItem("buyerId");
        setGlobalSellerId("6a36322b7d11e405b8330ea1");
        setGlobalBuyerId(null);
        setSellerSignedIn(true);
        setGlobalRole("seller");
        prefetchHomeData().catch(() => {}); // Warm Home cache during the success delay below
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          router.navigate("/(tabs)");
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      style={s.flexContainer}
    >
      {/* --- SUCCESS TICK MODAL --- */}
      <Modal visible={isSuccess} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalSuccessCircle}>
              <Ionicons name="checkmark" size={moderateScale(38)} color="#10B981" />
            </View>
            <Text style={s.modalTitle}>Login Successful!</Text>
            <Text style={s.modalSubtitle}>
              Welcome back to your workspace.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Custom Back Header */}
      <View 
        style={[s.headerContainer, { paddingTop: insets.top + verticalScale(8) }]}
      >
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(auth)/choose-role");
            }
          }} 
          style={s.backBtn}
        >
          <Ionicons name="chevron-back" size={moderateScale(26)} color="#007AFF" />
          <Text style={s.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          Supplier Login
        </Text>
      </View>

      <View style={s.formContainer}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card Element */}
          <View style={s.mainCard}>
            {/* Brand Logo & Context Headers */}
            <View style={s.logoWrapper}>
              <Image source={Logo} style={s.logo} contentFit="contain" />
              <Text style={s.title}>
                Login
              </Text>
              <Text style={s.subtitle}>
                Access your account securely
              </Text>
            </View>

            {/* Inputs & Form Wrapper */}
            <View style={s.inputsWrapper}>
              {/* Email Field */}
              <View style={s.inputContainer}>
                <Ionicons name="mail-outline" size={moderateScale(18)} color="#64748B" style={s.inputIcon} />
                <TextInput
                  style={s.textInput}
                  placeholder="Email Address"
                  placeholderTextColor="#94A3B8"
                  value={formdata.email}
                  onChangeText={(val) => handleChange("email", val)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Password Field */}
              <View style={s.inputContainer}>
                <Ionicons name="lock-closed-outline" size={moderateScale(18)} color="#64748B" style={s.inputIcon} />
                <TextInput
                  style={s.textInput}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  value={formdata.password}
                  onChangeText={(val) => handleChange("password", val)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={s.eyeButton}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={moderateScale(18)}
                    color="#64748B"
                  />
                </Pressable>
              </View>

              {/* Forgot Password Action Trigger */}
              <TouchableOpacity style={s.forgotPasswordBtn}>
                <Text style={s.forgotPasswordText}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Dark Blue Main Login Action Button */}
              <TouchableOpacity
                style={s.loginButton}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={s.loginButtonText}>
                    Login
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Form Redirection */}
            <View style={s.signupRedirect}>
              <Text style={s.redirectText}>
                Don't have an account?{" "}
                <Text
                  style={s.redirectHighlight}
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

const s = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    alignItems: 'center',
    width: '80%',
    maxWidth: scale(300),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalSuccessCircle: {
    backgroundColor: '#ECFDF5',
    height: scale(64),
    width: scale(64),
    borderRadius: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(16),
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: '#0F172A',
    marginBottom: verticalScale(6),
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: moderateScale(13),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: verticalScale(18),
  },
  headerContainer: {
    paddingBottom: verticalScale(10),
    backgroundColor: "#F8FAFC",
    paddingHorizontal: scale(16),
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#007AFF",
    fontSize: moderateScale(16),
    marginLeft: scale(-4),
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: scale(16),
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingTop: verticalScale(12),
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(24),
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(24),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(28),
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    width: "100%",
    minHeight: verticalScale(480),
  },
  logoWrapper: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  logo: {
    width: scale(140),
    height: verticalScale(50),
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: -0.5,
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(14),
    color: "#94A3B8",
  },
  inputsWrapper: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: moderateScale(16),
    height: verticalScale(48),
    paddingHorizontal: scale(14),
    marginBottom: verticalScale(12),
  },
  inputIcon: {
    marginRight: scale(10),
  },
  textInput: {
    flex: 1,
    height: "100%",
    color: "#0F172A",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  eyeButton: {
    padding: moderateScale(4),
  },
  forgotPasswordBtn: {
    alignItems: "flex-end",
    marginTop: verticalScale(-4),
    marginBottom: verticalScale(16),
    paddingRight: scale(4),
  },
  forgotPasswordText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: moderateScale(11.5),
  },
  loginButton: {
    backgroundColor: "#1E3A8A",
    borderRadius: moderateScale(16),
    height: verticalScale(48),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(4),
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontWeight: "700",
  },
  signupRedirect: {
    alignItems: "center",
    marginTop: verticalScale(24),
  },
  redirectText: {
    fontSize: moderateScale(13),
    color: "#64748B",
  },
  redirectHighlight: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
});

export default SellerLogin;
