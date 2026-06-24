import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { useRouter } from "expo-router";
import Logo from "../../../assets/images/logoo.webp";

const BuyerSignUp = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  const handleSubmit = () => {
    console.log("Buyer Form data has been Submitted");
    console.log(formdata);
    // Since OTP page is already set up to go to tabs, let's redirect them to enter-numer/otp or directly to tabs/login
    // For now we can redirect them to Login
    router.push("/Buyer/auth/Login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#F8FAFC]"
    >

      <View className="flex-1 justify-start">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start", paddingTop: 24 }}
          className="px-4 pb-6"
          showsVerticalScrollIndicator={false}
        >


          {/* Main Card Canvas */}
          <View className="bg-white rounded-[32px] px-6 py-9 shadow-2xl shadow-black/30 w-full min-h-[580px]">
            
            {/* Brand Header */}
            <View className="items-center mb-8">
              <Image source={Logo} className="w-44 h-16 mb-4" resizeMode="contain" />
              <Text className="text-[26px] font-jakarta-bold font-extrabold text-blue-900 tracking-tight mb-1.5">
                Buyer Registration
              </Text>
              <Text className="text-[15px] font-jakarta-medium text-slate-500">
                Create your buyer account
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
                className="bg-orange-600 rounded-2xl h-14 items-center justify-center mt-3 shadow-lg shadow-orange-600/30 active:opacity-90"
                onPress={handleSubmit} 
                activeOpacity={0.9}
              >
                <Text className="text-white text-[16px] font-jakarta-bold font-bold">
                  Register Buyer
                </Text>
              </TouchableOpacity>

            </View>

            {/* Account Switch Redirect */}
            <View className="items-center mt-7">
              <Text className="text-sm font-jakarta-medium text-slate-500">
                Already have an account?{" "}
                <Text 
                  className="text-blue-900 font-jakarta-bold font-bold" 
                  onPress={() => router.push("/Buyer/auth/Login")}
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

export default BuyerSignUp;
