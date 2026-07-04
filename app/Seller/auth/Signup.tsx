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
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import Logo from "../../../assets/images/logoo-Photoroom.png";

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
    if (!formdata.name.trim() || !formdata.email.trim() || !formdata.phone.trim() || !formdata.password.trim()) {
      Alert.alert("Required Fields", "Please fill out all the fields to register.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formdata.name,
        email: formdata.email,
        phone: formdata.phone,
        password: formdata.password,
        role: "supplier", 
      };

      const response = await fetch("https://seller.inquirybazaar.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && (data.success || data.message === "User created successfully")) {
        Alert.alert("Success!", "Supplier account created successfully. Please login.", [
          { text: "OK", onPress: () => router.push("/Seller/auth/Login") }
        ]);
      } else {
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
          Supplier Registration
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
              <Image source={Logo} style={s.logo} resizeMode="contain" />
              <Text style={s.title}>
                Supplier Registration
              </Text>
              <Text style={s.subtitle}>
                Create your supplier account
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
                  editable={!isLoading}
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
                  editable={!isLoading}
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
                  editable={!isLoading}
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
                  editable={!isLoading}
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
                style={[
                  s.registerBtn,
                  isLoading ? s.registerBtnDisabled : s.registerBtnActive
                ]}
                onPress={handleSubmit} 
                activeOpacity={0.9}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={s.registerBtnText}>
                    Register Supplier
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
    fontSize: moderateScale(22),
    fontWeight: "800",
    color: "#1E3A8A",
    letterSpacing: -0.5,
    marginBottom: verticalScale(6),
  },
  subtitle: {
    fontSize: moderateScale(14),
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
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  eyeButton: {
    padding: moderateScale(4),
  },
  registerBtn: {
    borderRadius: moderateScale(16),
    height: verticalScale(48),
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(4),
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  registerBtnActive: {
    backgroundColor: "#EA580C",
    shadowColor: "#EA580C",
  },
  registerBtnDisabled: {
    backgroundColor: "#FB923C",
    shadowColor: "#FB923C",
  },
  registerBtnText: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontWeight: "700",
  },
  loginRedirect: {
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

export default SellerSignUp;