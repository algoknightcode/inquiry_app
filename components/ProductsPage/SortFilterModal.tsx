import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

export type SortOption = "none" | "high_to_low" | "low_to_high";

interface SortFilterModalProps {
  visible: boolean;
  sortOption: SortOption;
  onClose: () => void;
  onSelectSort: (option: SortOption) => void;
}

/**
 * Modular Sort & Filter Modal Component.
 * Only renders its UI when visible=true to keep the parent page lightweight.
 */
export const SortFilterModal: React.FC<SortFilterModalProps> = React.memo(({
  visible,
  sortOption,
  onClose,
  onSelectSort,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-[32px] px-6 pt-6 pb-10 shadow-2xl">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-[20px] font-jakarta-extrabold text-slate-900">
              Sort & Filter
            </Text>
            <View className="flex-row items-center gap-3">
              {sortOption !== "none" && (
                <TouchableOpacity
                  onPress={() => {
                    onSelectSort("none");
                    onClose();
                  }}
                  className="px-3 py-1 bg-red-50 rounded-full border border-red-100"
                >
                  <Text className="text-red-600 font-jakarta-bold text-[12px]">
                    Clear Filter
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center active:bg-slate-200"
              >
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sort Options */}
          <View className="gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                onSelectSort("high_to_low");
                onClose();
              }}
              className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                sortOption === "high_to_low"
                  ? "bg-indigo-50/70 border-indigo-500"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                    sortOption === "high_to_low" ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <Ionicons
                    name="arrow-down-outline"
                    size={20}
                    color={sortOption === "high_to_low" ? "#ffffff" : "#475569"}
                  />
                </View>
                <View>
                  <Text
                    className={`font-jakarta-bold text-[15px] ${
                      sortOption === "high_to_low" ? "text-indigo-950" : "text-slate-800"
                    }`}
                  >
                    Price: High to Low
                  </Text>
                  <Text className="text-slate-400 font-jakarta-medium text-[12px] mt-0.5">
                    Highest price first
                  </Text>
                </View>
              </View>
              {sortOption === "high_to_low" && (
                <Ionicons name="checkmark-circle" size={22} color="#4F46E5" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                onSelectSort("low_to_high");
                onClose();
              }}
              className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                sortOption === "low_to_high"
                  ? "bg-indigo-50/70 border-indigo-500"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                    sortOption === "low_to_high" ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                >
                  <Ionicons
                    name="arrow-up-outline"
                    size={20}
                    color={sortOption === "low_to_high" ? "#ffffff" : "#475569"}
                  />
                </View>
                <View>
                  <Text
                    className={`font-jakarta-bold text-[15px] ${
                      sortOption === "low_to_high" ? "text-indigo-950" : "text-slate-800"
                    }`}
                  >
                    Price: Low to High
                  </Text>
                  <Text className="text-slate-400 font-jakarta-medium text-[12px] mt-0.5">
                    Lowest price first
                  </Text>
                </View>
              </View>
              {sortOption === "low_to_high" && (
                <Ionicons name="checkmark-circle" size={22} color="#4F46E5" />
              )}
            </TouchableOpacity>

            {sortOption !== "none" && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  onSelectSort("none");
                  onClose();
                }}
                className="mt-3 py-3 px-4 rounded-xl bg-slate-100 flex-row items-center justify-center active:bg-slate-200"
              >
                <Ionicons name="refresh-outline" size={16} color="#475569" style={{ marginRight: 6 }} />
                <Text className="text-slate-700 font-jakarta-semibold text-[14px]">
                  Clear Filter
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
});
