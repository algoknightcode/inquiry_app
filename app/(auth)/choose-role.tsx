import React from "react";
import { Pressable, Text, View } from "react-native";

const ChooseRole = () => {
  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Header */}
      <View className="items-center mb-12">
        <Text className="text-3xl font-bold text-gray-900">
          Welcome to IndiaMart
        </Text>

        <Text className="text-base text-gray-500 text-center mt-3">
          Choose how you'd like to use the platform
        </Text>
      </View>

      {/* Buyer Card */}
      <Pressable className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-5">
        <Text className="text-2xl mb-2">🛒</Text>

        <Text className="text-xl font-bold text-gray-900">
          Continue as Buyer
        </Text>

        <Text className="text-gray-600 mt-2">
          Discover products, compare suppliers and send enquiries.
        </Text>
      </Pressable>

      {/* Seller Card */}
      <Pressable className="bg-orange-50 border border-orange-200 rounded-3xl p-6">
        <Text className="text-2xl mb-2">🏪</Text>

        <Text className="text-xl font-bold text-gray-900">
          Continue as Seller
        </Text>

        <Text className="text-gray-600 mt-2">
          Showcase products, receive leads and grow your business.
        </Text>
      </Pressable>

      <Text className="text-center text-gray-400 mt-10">
        You can change your role later from your account settings.
      </Text>
    </View>
  );
};

export default ChooseRole;