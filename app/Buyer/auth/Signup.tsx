import { Image } from 'expo-image';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Logo from "../../../assets/images/logoo-Photoroom.png";

const API_BASE_URL = "https://buyer.inquirybazaar.com"; 

const BuyerSignUp = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isNavigating = useRef(false);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prevData: any) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const { name, email, phone, password } = formdata;
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Error", "All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formdata.name.trim(),
          email: formdata.email.trim(),
          phone: formdata.phone.trim(),
          password: formdata.password,
          role: "buyer",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Success", "Account registered successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/Buyer/auth/Login"),
          },
        ]);
      } else {
        Alert.alert("Registration Failed", result.message || "Something went wrong.");
      }
    } catch (error: any) {
      Alert.alert("Error", "Unable to connect to the server. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      style={s.flexContainer}
    >
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
          Buyer Registration
        </Text>
      </View>

      <View style={s.formContainer}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card Canvas */}
          <View style={s.mainCard}>
            
            {/* Brand Header */}
            <View style={s.brandWrapper}>
              <Image source={Logo} style={s.logo} contentFit="contain" />
              <Text style={s.title}>
                Buyer Registration
              </Text>
              <Text style={s.subtitle}>
                Create your buyer account
              </Text>
            </View>

            {/* Input Form Wrapper */}
            <View style={s.inputsWrapper}>
              
              {/* Full Name Input Container */}
              <View style={s.inputContainer}>
                <Ionicons name="person-outline" size={moderateScale(18)} color="#64748B" style={s.inputIcon} />
                <TextInput
                  style={s.textInput}
                  placeholder="Full Name"
                  placeholderTextColor="#94A3B8"
                  value={formdata.name}
                  onChangeText={(val) => handleChange("name", val)}
                  autoCapitalize="words"
                />
              </View>

              {/* Email Address Input Container */}
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

              {/* Phone Number Input Container */}
              <View style={s.inputContainer}>
                <Ionicons name="call-outline" size={moderateScale(18)} color="#64748B" style={s.inputIcon} />
                <TextInput
                  style={s.textInput}
                  placeholder="Phone Number"
                  placeholderTextColor="#94A3B8"
                  value={formdata.phone}
                  onChangeText={(val) => handleChange("phone", val)}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password Input Container */}
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

              {/* Branded Orange CTA Button */}
              <TouchableOpacity 
                style={s.registerBtn}
                onPress={handleSubmit} 
                activeOpacity={0.9}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.registerBtnText}>
                    Register Buyer
                  </Text>
                )}
              </TouchableOpacity>

            </View>

            {/* Account Switch Redirect */}
            <View style={s.loginRedirect}>
              <Text style={s.redirectText}>
                Already have an account?{" "}
                <Text 
                  style={s.redirectHighlight} 
                  onPress={() => {
                    if (isNavigating.current) return;
                    isNavigating.current = true;
                    router.push("/Buyer/auth/Login");
                    setTimeout(() => { isNavigating.current = false; }, 1000);
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

const s = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
    fontSize: moderateScale(17),
    marginLeft: scale(-4),
  },
  headerTitle: {
    fontSize: moderateScale(17),
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
    minHeight: verticalScale(500),
  },
  brandWrapper: {
    alignItems: "center",
    marginBottom: verticalScale(24),
  },
  logo: {
    width: scale(140),
    height: verticalScale(50),
    marginBottom: verticalScale(12),
  },
  title: {
    fontSize: moderateScale(23),
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: -0.5,
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: "#64748B",
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
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
  eyeButton: {
    padding: moderateScale(4),
  },
  registerBtn: {
    backgroundColor: "#EA580C",
    borderRadius: moderateScale(16),
    height: verticalScale(48),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(4),
    shadowColor: "#EA580C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  registerBtnText: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  loginRedirect: {
    alignItems: "center",
    marginTop: verticalScale(24),
  },
  redirectText: {
    fontSize: moderateScale(14),
    color: "#64748B",
  },
  redirectHighlight: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
});

export default BuyerSignUp;
