import { Image } from 'expo-image';
import { prefetchHomeData } from "@/utils/prefetchHome";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from "../../assets/images/logoo-Photoroom.png";

const OtpVerify = () => {
  const router = useRouter();
  const [otp, setOtp] = useState("");

  const handleVerify = (code: string) => {
    if (code === "1234") {
      prefetchHomeData().catch(() => {}); // Warm Home cache before navigating
      router.replace("/(tabs)");
    } else {
      Alert.alert("Invalid OTP", "Please enter the dummy OTP: 1234");
    }
  };

  const handleChange = (text: string, index: number) => {
    const newOtp = otp.split("");
    newOtp[index] = text;
    const joined = newOtp.join("");
    setOtp(joined);

    // If 4 digits are entered, auto-verify
    if (joined.length === 4) {
      handleVerify(joined);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={s.keyboardView}
      >
        <View style={s.content}>
          {/* Logo Section */}
          <View style={s.logoContainer}>
            <Image
              source={Logo}
              style={s.logo}
              contentFit="contain"
            />
          </View>

          {/* Form Card */}
          <View style={s.card}>
            <Text style={s.title}>Verification Code</Text>
            <Text style={s.subtitle}>Enter the 4-digit code sent to your phone. Use dummy OTP: 1234</Text>

            {/* OTP Inputs */}
            <View style={s.otpContainer}>
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  value={otp[index] || ""}
                  maxLength={1}
                  keyboardType="number-pad"
                  onChangeText={(text) => handleChange(text, index)}
                  style={s.otpInput}
                  placeholder="-"
                  placeholderTextColor="#94a3b8"
                />
              ))}
            </View>

            <TouchableOpacity style={s.btn} onPress={() => handleVerify(otp)}>
              <Text style={s.btnText}>Verify OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#1e3a8a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  otpInput: {
    width: 56,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    textAlign: "center",
    fontSize: 23,
    fontWeight: "bold",
    color: "#1e3a8a",
    backgroundColor: "#f8fafc",
  },
  btn: {
    backgroundColor: "#2563eb",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  btnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});

export default OtpVerify;