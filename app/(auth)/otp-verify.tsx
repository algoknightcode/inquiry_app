import React, { useState } from "react";
import { Image, TextInput, View, TouchableOpacity, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import Logo from "../../../assets/images/logoo.webp";

const OtpVerify = () => {
  const router = useRouter();
  const [otp, setOtp] = useState("");

  const handleVerify = (code: string) => {
    if (code === "1234") {
      router.push("/choose-role");
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
    <View className="flex-1 bg-white justify-between pb-10">
      
      {/* Logo Section */}
      <View className="flex-1 justify-center items-center px-6">
        <Image
          source={Logo}
          className="w-[120px] h-[120px] mb-10"
          resizeMode="contain"
        />

        <Text className="text-xl font-semibold text-gray-800 mb-5">
          Enter OTP
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row gap-3">
          {[0, 1, 2, 3].map((index) => (
            <TextInput
              key={index}
              value={otp[index] || ""}
              maxLength={1}
              keyboardType="number-pad"
              onChangeText={(text) => handleChange(text, index)}
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl"
            />
          ))}
        </View>
      </View>

      {/* Verify button */}
      <View className="px-6">
        <TouchableOpacity
          className="bg-black h-16 rounded-xl justify-center items-center"
          onPress={() => handleVerify(otp)}
        >
          <Text className="text-white text-lg font-bold">
            Verify OTP
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default OtpVerify;