import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    LayoutAnimation,
    Platform,
    Text,
    TouchableOpacity,
    UIManager,
    Vibration,
    View,
} from "react-native";

// Safely enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- FAQ DATA ---
const faqs = [
  {
    question: "How do I request a bulk quotation?",
    answer: "Simply click the 'Request Quote' button on any product page, fill in your business details and required quantity, and our sellers will get back to you within 24 hours.",
  },
  {
    question: "Are all suppliers verified?",
    answer: "Yes! Every supplier on our platform goes through a strict 3-step KYC and verification process to ensure 100% authentic and reliable B2B trading.",
  },
  {
    question: "What are the payment terms?",
    answer: "Payment terms are directly negotiated between the buyer and the seller. However, we recommend using secure Escrow or standard Net-30/Net-60 terms for trusted partners.",
  },
  {
    question: "How do I track my inquiries?",
    answer: "You can track all your active, pending, and completed inquiries directly from your Buyer Dashboard under the 'My Inquiries' tab.",
  },
];

// --- PREMIUM ANIMATED FAQ CARD ---
const FaqCard = ({
  item,
  isExpanded,
  onPress,
}: {
  item: typeof faqs[0];
  isExpanded: boolean;
  onPress: () => void;
}) => {
  // Use Animated.Value to fix the Android color popping bug
  const animationController = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animationController, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // Must be false for colors
    }).start();
  }, [isExpanded]);

  // Smoothly transition colors to avoid Android glitches
  const backgroundColor = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFFFFF", "#EFF6FF"], // White to soft Blue-50
  });

  const borderColor = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F1F5F9", "#93C5FD"], // Slate-100 to Blue-300
  });

  const iconRotate = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"], // Rotates Chevron Down to Up
  });

  return (
    <Animated.View
      style={{
        backgroundColor,
        borderColor,
        borderWidth: 1.5,
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        // Soft elevation shadow when expanded
        ...(isExpanded ? {
          shadowColor: "#1E3A8A",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 3,
        } : {}),
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className="py-4 px-4 flex-row items-center justify-between"
      >
        <Text
          className={`flex-1 text-[15px] font-bold tracking-tight pr-4 leading-6 ${
            isExpanded ? "text-[#1E3A8A]" : "text-[#0F172A]"
          }`}
        >
          {item.question}
        </Text>

        {/* Rotating Chevron Icon */}
        <Animated.View
          style={{ transform: [{ rotate: iconRotate }] }}
          className={`w-7 h-7 rounded-full items-center justify-center ${
            isExpanded ? "bg-[#EFF6FF]" : "bg-slate-50"
          }`}
        >
          <Ionicons
            name="chevron-down"
            size={16}
            color={isExpanded ? "#1E3A8A" : "#64748B"}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Expandable Content Area */}
      {isExpanded && (
        <View className="px-4 pb-4 pt-0 flex-row">
          {/* Vertical brand accent indicator bar */}
          <View className="w-[3px] bg-[#1E3A8A] rounded-full mr-3 my-0.5" />
          <Text className="flex-1 text-[14px] leading-[22px] text-[#475569] font-medium">
            {item.answer}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

// --- MAIN EXPORTED COMPONENT ---
export default function FaqSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item open by default

  const handlePress = (index: number) => {
    // 1. Premium Haptic Feedback
    Vibration.vibrate(Platform.OS === "ios" ? 10 : 20);

    // 2. Smooth native layout expansion
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // 3. Toggle state
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View className="w-full bg-transparent px-5 py-6">
      
      {/* Modern Editorial Header */}
      <View className="mb-8 items-start">
        <View className="flex-row items-center border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg mb-4">
          <Ionicons name="chatbubble-ellipses" size={14} color="#1E3A8A" />
          <Text className="text-[12px] font-bold text-[#1E3A8A] uppercase tracking-widest ml-2">
            Support
          </Text>
        </View>

        <Text className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">
          Got Questions?
        </Text>
        <Text className="text-[15px] text-[#475569] leading-6 font-medium pr-4">
          Everything you need to know about the platform, billing, and connecting with verified suppliers.
        </Text>
      </View>

      {/* FAQ List Generation */}
      <View className="w-full">
        {faqs.map((item, index) => (
          <FaqCard
            key={index.toString()}
            item={item}
            isExpanded={expandedIndex === index}
            onPress={() => handlePress(index)}
          />
        ))}
      </View>

      {/* Contact Support CTA Bottom */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="mt-4 bg-[#0F172A] flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-slate-900/20"
      >
        <Text className="text-white text-[16px] font-bold mr-2">
          Contact Support
        </Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
      
    </View>
  );
}