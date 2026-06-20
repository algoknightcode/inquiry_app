import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    // Simulating login and navigating back or to Account index
    router.replace("/Account");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <View className="px-5 pt-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm shadow-slate-200/50"
            >
              <Feather name="arrow-left" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Logo & Welcome Header */}
          <View className="px-6 pt-8 pb-6">
            <Text className="text-3xl font-jakarta-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </Text>
            <Text className="text-sm font-jakarta-medium text-slate-500 mt-2">
              Sign in to your InquiryBazaar account to continue
            </Text>
          </View>

          {/* Form Fields */}
          <View className="px-6 gap-y-4">
            {/* Email Field */}
            <View>
              <Text className="text-xs font-jakarta-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Email Address
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm shadow-slate-100">
                <Feather name="mail" size={20} color="#94a3b8" />
                <TextInput
                  placeholder="name@example.com"
                  placeholderTextColor="#94a3b8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 ml-3 text-slate-900 font-jakarta-medium text-sm"
                />
              </View>
            </View>

            {/* Password Field */}
            <View>
              <Text className="text-xs font-jakarta-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Password
              </Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3.5 shadow-sm shadow-slate-100">
                <Feather name="lock" size={20} color="#94a3b8" />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 ml-3 text-slate-900 font-jakarta-medium text-sm"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="align-self-end mt-1">
              <Text className="text-xs font-jakarta-bold text-blue-600 text-right">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-blue-600 rounded-2xl py-4 items-center justify-center shadow-lg shadow-blue-500/20 mt-6 active:opacity-90"
            >
              <Text className="text-white font-jakarta-bold text-base">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Social Sign Up / Footer */}
          <View className="flex-1 justify-end items-center pb-8 px-6 mt-12">
            <View className="flex-row items-center mb-6">
              <View className="h-[1px] bg-slate-200 flex-1" />
              <Text className="text-xs font-jakarta-bold text-slate-400 mx-4">
                NEW TO INQUIRYBAZAAR?
              </Text>
              <View className="h-[1px] bg-slate-200 flex-1" />
            </View>

            <TouchableOpacity
              onPress={() => {}}
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 items-center justify-center flex-row shadow-sm shadow-slate-100"
            >
              <Text className="text-slate-800 font-jakarta-bold text-sm">
                Create an Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
