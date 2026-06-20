import React, { useState } from "react";
import {
    GestureResponderEvent,
    Modal,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    Image,
    TextInput,
    Alert
} from "react-native";
import { useRouter } from "expo-router";
import Logo from "../../../assets/images/logoo.webp";

const MobileOtp = () => {   
  const router = useRouter();

  const [formdata, setFormdata] = useState({
    phone: ""
  });

  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormdata((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formdata.phone.trim()) {
      return; // dont open if empty
    }
    setModalVisible(true);
    console.log("Form Submitted: The number-OTP Ones");
    console.log(formdata);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    if (formdata.phone === "1111111111") {
      router.push("/otp-verify");
    } else {
      Alert.alert("Invalid Phone Number", "Please use the dummy number: 1111111111");
    }
  };


  return (

  <SafeAreaView className="flex-1 bg-white">
      
      {/* Top/Middle Section */}
      <View className="flex-1 justify-center items-center px-6">
        <Image
          source={Logo}
          className="w-[120px] h-[120px] mb-10"
          resizeMode="contain"
        />
        <Text className="text-xl font-semibold text-gray-800 mb-5 self-start">
          Enter your number
        </Text>
        <TextInput
          className="w-full h-14 border border-gray-300 rounded-xl px-4 text-base bg-gray-50"
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={formdata.phone}
          onChangeText={(text) => handleChange("phone", text)}
        />
      </View>
      {/* Bottom Section */}
      <View className="px-6 pb-10">
        <TouchableOpacity 
          className="bg-black h-16 rounded-xl justify-center items-center mb-4" 
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg font-bold">Next</Text>
        </TouchableOpacity>
        <Text className="text-center text-gray-500 text-xs">
          By continuing, I agree to the terms and conditions
        </Text>
      </View>
      {/* Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full rounded-2xl p-6 items-center shadow-lg">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Is this your number?
            </Text>
            <Text className="text-xl font-bold text-gray-900 mb-6">
              {formdata.phone}
            </Text>
            
            <View className="flex-row w-full justify-between gap-4">
              <TouchableOpacity
                className="flex-1 border border-gray-300 h-12 rounded-xl justify-center items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-gray-700 font-semibold text-base">Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-black h-12 rounded-xl justify-center items-center"
                onPress={handleConfirm}
              >
                <Text className="text-white font-semibold text-base">Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MobileOtp;