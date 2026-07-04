import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const faqs = [
  {
    id: "f1",
    question: "How do I request a bulk quotation?",
    answer: "Click 'Request Quote' on a product page, fill in business details and quantity, and sellers will reply within 24 hours.",
  },
  {
    id: "f2",
    question: "Are all suppliers verified?",
    answer: "Yes, every supplier goes through a KYC and verification process to ensure authentic and reliable B2B trading.",
  },
  {
    id: "f3",
    question: "What are the payment terms?",
    answer: "Terms are negotiated directly. We recommend secure Escrow or standard Net-30/60 terms for trusted partners.",
  },
  {
    id: "f4",
    question: "How do I track my inquiries?",
    answer: "Track all your active, pending, and completed inquiries directly from your Dashboard under 'My Inquiries'.",
  },
];

// --- ACCORDION ITEM COMPONENT ---
const AccordionItem = ({
  question,
  answer,
  isExpanded,
  onPress,
}: {
  question: string;
  answer: string;
  isExpanded: boolean;
  onPress: () => void;
}) => {
  return (
    <View 
      className={`mb-3 border rounded-2xl overflow-hidden ${
        isExpanded ? "border-indigo-200 bg-indigo-50/20" : "border-slate-100 bg-white"
      }`}
    >
      {/* Accordion Trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex-row justify-between items-center px-4 py-3.5"
      >
        <Text 
          className={`flex-1 text-[14px] font-jakarta-bold tracking-tight pr-4 leading-5 ${
            isExpanded ? "text-indigo-900" : "text-slate-800"
          }`}
        >
          {question}
        </Text>
        <View 
          className={`w-6 h-6 rounded-full items-center justify-center ${
            isExpanded ? "bg-indigo-100" : "bg-slate-50"
          }`}
        >
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={14} 
            color={isExpanded ? "#4F46E5" : "#64748B"} 
          />
        </View>
      </TouchableOpacity>

      {/* Accordion Content */}
      {isExpanded && (
        <View className="px-4 pb-3.5 pt-0 flex-row">
          <View className="w-[2.5px] bg-indigo-600 rounded-full mr-3 my-0.5" />
          <Text className="flex-1 text-[13px] leading-[20px] text-slate-500 font-jakarta-medium">
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
};

// --- MAIN FAQ COMPONENT ---
export default function FaqSection() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item open by default

  const handlePress = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View className="w-full bg-transparent px-5 py-4">
      
      {/* Compact Elegant Header */}
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 items-center justify-center mr-3">
            <Ionicons name="help-circle" size={18} color="#4F46E5" />
          </View>
          <Text className="text-xl font-jakarta-bold text-slate-900 tracking-tight">
            FAQs
          </Text>
        </View>

        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push("/HelpSupport")}
          className="flex-row items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl"
        >
          <Text className="text-[12px] font-jakarta-bold text-slate-600 mr-1">
            Get Help
          </Text>
          <Ionicons name="arrow-forward" size={12} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Accordion Container */}
      <View className="w-full">
        {faqs.map((item, index) => (
          <AccordionItem
            key={item.id}
            question={item.question}
            answer={item.answer}
            isExpanded={expandedIndex === index}
            onPress={() => handlePress(index)}
          />
        ))}
      </View>
      
    </View>
  );
}