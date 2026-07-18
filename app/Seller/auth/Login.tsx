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
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let nativeAuth: any = null;
if (!isExpoGo) {
  try {
    nativeAuth = require('@react-native-firebase/auth').default;
  } catch (e) {
    console.log("Firebase Auth native module loading skipped");
  }
}

const SellerLogin = () => {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSellerSignedIn, setGlobalSellerId, setGlobalBuyerId, setGlobalRole } = useRole();

  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmResult, setConfirmResult] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit mobile number starting with 6-9.");
      return;
    }

    setLoading(true);

    // Expo Go or Demo Number Bypass
    if (isExpoGo || phoneNumber === "1111111111" || phoneNumber === "8888888888") {
      console.log("ℹ️ OTP Send: DEMO/EXPO GO BYPASS");
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        Alert.alert("Demo OTP Sent", "Please use dummy OTP: 1234");
      }, 1000);
      return;
    }

    try {
      if (nativeAuth) {
        console.log("🚀 OTP Send: Calling Native Firebase Auth for +91" + phoneNumber);
        const confirmation = await nativeAuth().signInWithPhoneNumber(`+91${phoneNumber}`);
        setConfirmResult(confirmation);
        setOtpSent(true);
        Alert.alert("OTP Sent", "A verification code has been sent to your phone number.");
      } else {
        Alert.alert("Error", "Native Firebase Auth is not loaded in this environment.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Failed to send OTP", error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert("Error", "Please enter a valid OTP.");
      return;
    }

    setLoading(true);

    // Demo / Expo Go Verification Bypass
    if (isExpoGo || phoneNumber === "1111111111" || phoneNumber === "8888888888") {
      if (otp === "1234") {
        console.log("ℹ️ OTP Verify: DEMO OTP BYPASS MATCHED");
        await AsyncStorage.setItem("supplierId", "6a36322b7d11e405b8330ea1");
        await AsyncStorage.removeItem("buyerId");
        setGlobalSellerId("6a36322b7d11e405b8330ea1");
        setGlobalBuyerId(null);
        setSellerSignedIn(true);
        setGlobalRole("seller");
        await addNotification("Supplier logged in successfully.");
        prefetchHomeData().catch(() => {});
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          router.navigate("/(tabs)");
        }, 1500);
        setLoading(false);
        return;
      } else {
        Alert.alert("Invalid OTP", "Please use dummy OTP 1234");
        setLoading(false);
        return;
      }
    }

    try {
      if (confirmResult) {
        console.log("🚀 OTP Verify: Confirming OTP code");
        await confirmResult.confirm(otp);
      } else {
        throw new Error("No pending verification session found.");
      }

      console.log("🚀 Syncing with Backend DB for phone:", phoneNumber);
      const response = await fetch("https://seller.inquirybazaar.com/api/auth/login-with-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();
      console.log("📥 Backend OTP Login Response:", data);

      if (response.ok && data.success) {
        const loggedInUserId = data.user?.id || data.user?._id;
        if (loggedInUserId) {
          await AsyncStorage.setItem("supplierId", loggedInUserId);
          setGlobalSellerId(loggedInUserId);
        }
        await AsyncStorage.removeItem("buyerId");
        setGlobalBuyerId(null);
        setSellerSignedIn(true);
        setGlobalRole("seller");
        await addNotification("Supplier logged in successfully.");
        prefetchHomeData().catch(() => {});
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          router.navigate("/(tabs)");
        }, 1500);
      } else {
        Alert.alert("Login Failed", data.message || "Failed to log in via server.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

            {/* Mode Selector Tabs */}
            <View style={s.tabContainer}>
              <TouchableOpacity
                style={[s.tabButton, loginMode === "password" && s.activeTabButton]}
                onPress={() => {
                  setLoginMode("password");
                  setOtpSent(false);
                }}
              >
                <Text style={[s.tabButtonText, loginMode === "password" && s.activeTabButtonText]}>
                  Password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.tabButton, loginMode === "otp" && s.activeTabButton]}
                onPress={() => setLoginMode("otp")}
              >
                <Text style={[s.tabButtonText, loginMode === "otp" && s.activeTabButtonText]}>
                  OTP Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs & Form Wrapper */}
            <View style={s.inputsWrapper}>
              {loginMode === "password" ? (
                <>
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

                  {/* Login Button */}
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
                </>
              ) : (
                <>
                  {/* Phone Number Field */}
                  <View style={s.inputContainer}>
                    <Ionicons name="call-outline" size={moderateScale(18)} color="#64748B" style={s.inputIcon} />
                    <Text style={s.countryCode}>+91 </Text>
                    <TextInput
                      style={s.textInput}
                      placeholder="Mobile Number"
                      placeholderTextColor="#94A3B8"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      maxLength={10}
                      editable={!otpSent}
                    />
                  </View>

                  {/* OTP Field (Visible only after OTP is sent) */}
                  {otpSent && (
                    <View style={s.inputContainer}>
                      <Ionicons name="keypad-outline" size={moderateScale(18)} color="#64748B" style={s.inputIcon} />
                      <TextInput
                        style={s.textInput}
                        placeholder="Enter 6-Digit OTP"
                        placeholderTextColor="#94A3B8"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  )}

                  {/* Dynamic Send / Verify Button */}
                  {!otpSent ? (
                    <TouchableOpacity
                      style={s.loginButton}
                      onPress={handleSendOtp}
                      disabled={loading}
                      activeOpacity={0.9}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={s.loginButtonText}>Send OTP</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={s.loginButton}
                        onPress={handleVerifyOtp}
                        disabled={loading}
                        activeOpacity={0.9}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={s.loginButtonText}>Verify & Login</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={s.resendButton}
                        onPress={() => {
                          setOtpSent(false);
                          setOtp("");
                        }}
                      >
                        <Text style={s.resendText}>Change Number / Resend</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(20),
    backgroundColor: '#F1F5F9',
    borderRadius: moderateScale(12),
    padding: scale(4),
  },
  tabButton: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(8),
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabButtonText: {
    color: '#1E3A8A',
  },
  countryCode: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#1E293B',
    marginRight: scale(4),
  },
  resendButton: {
    alignItems: 'center',
    marginTop: verticalScale(14),
  },
  resendText: {
    color: '#1E3A8A',
    fontWeight: '600',
    fontSize: moderateScale(13),
    textDecorationLine: 'underline',
  },
});

export default SellerLogin;
