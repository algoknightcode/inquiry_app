import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";

// Mock Data updated to reflect B2B / Wholesale products
const INITIAL_WISHLIST = [
  {
    id: "1",
    name: "Industrial Reverse Osmosis (RO) Water Plant, Capacity: 2000 LPH",
    supplier: "AquaTech Solutions Pvt. Ltd.",
    location: "Ahmedabad, Gujarat",
    price: "₹ 1.5 Lakh",
    unit: "/ Unit",
    moq: "1 Unit",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    name: "Wholesale Cotton Plain T-Shirts for Men",
    supplier: "Vardhman Textiles Ltd.",
    location: "Ludhiana, Punjab",
    price: "₹ 120",
    unit: "/ Piece",
    moq: "500 Pieces",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    name: "Automatic PET Bottle Blowing Machine",
    supplier: "Hind Engineering Works",
    location: "Faridabad, Haryana",
    price: "₹ 4.8 Lakh",
    unit: "/ Machine",
    moq: "1 Machine",
    image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    name: "Bulk Organic Turmeric Powder (High Curcumin)",
    supplier: "NatureSpices Exports",
    location: "Erode, Tamil Nadu",
    price: "₹ 150",
    unit: "/ Kg",
    moq: "100 Kg",
    image: "https://images.unsplash.com/photo-1615486171448-4fbefeb2cebf?auto=format&fit=crop&w=400&q=80",
  },
];

export default function B2BWishlist() {
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }: { item: typeof INITIAL_WISHLIST[0] }) => (
    <View className="bg-white mb-5 rounded-2xl p-4 shadow-xl shadow-slate-200/60 border border-slate-100">
      <View className="flex-row">
        {/* Product Image */}
        <Image 
          source={{ uri: item.image }} 
          className="w-28 h-28 rounded-xl bg-slate-50 border border-slate-100"
          resizeMode="cover"
        />

        {/* Product Details */}
        <View className="flex-1 ml-4 relative justify-between">
          <View className="pr-6">
            <Text className="text-sm font-jakarta-bold text-slate-800 leading-tight" numberOfLines={2}>
              {item.name}
            </Text>
            
            {/* Remove from Wishlist Button */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => removeFromWishlist(item.id)}
              className="absolute -top-2 -right-2 p-2 bg-red-50 rounded-full"
            >
              <Ionicons name="heart" size={20} color="#f43f5e" />
            </TouchableOpacity>

            <View className="mt-2 flex-row items-baseline">
              <Text className="text-lg font-jakarta-bold text-blue-600">
                {item.price}
              </Text>
              <Text className="text-xs text-slate-500 font-jakarta ml-1">
                {item.unit}
              </Text>
            </View>

            <View className="mt-2 flex-row items-center">
              <View className="bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 flex-row items-center">
                <Ionicons name="layers" size={10} color="#3b82f6" />
                <Text className="text-[10px] text-blue-700 font-jakarta-bold ml-1 uppercase tracking-wider">
                  MOQ: {item.moq}
                </Text>
              </View>
            </View>
          </View>

          {/* Supplier Info */}
          <View className="mt-3">
            <Text className="text-xs font-jakarta text-slate-600" numberOfLines={1}>
              <Ionicons name="business" size={12} color="#64748b" /> {item.supplier}
            </Text>
            <Text className="text-[11px] font-jakarta text-slate-400 mt-1" numberOfLines={1}>
              <Ionicons name="location" size={10} color="#94a3b8" /> {item.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row mt-4 border-t border-slate-100 pt-4 gap-x-3">
        <TouchableOpacity 
          activeOpacity={0.8}
          className="flex-1 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-600/30"
        >
          <Ionicons name="mail" size={18} color="white" />
          <Text className="ml-2 text-sm font-jakarta-bold text-white">
            Contact Supplier
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          className="bg-white border border-blue-200 py-3 px-5 rounded-xl flex-row items-center justify-center shadow-sm shadow-slate-100"
        >
          <Ionicons name="call" size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ListEmptyComponent = () => (
    <View className="flex-1 items-center justify-center mt-32">
      <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-6 border border-blue-100">
        <Ionicons name="heart-dislike-outline" size={48} color="#3b82f6" />
      </View>
      <Text className="text-2xl font-jakarta-bold text-slate-900 mb-2 tracking-tight">
        No Saved Items
      </Text>
      <Text className="text-sm text-slate-500 text-center px-8 leading-relaxed">
        Your wishlist is empty. Save products to easily request quotes from suppliers later.
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View className={`px-5 pt-6 pb-4 ${Platform.OS === 'android' ? 'mt-8' : ''}`}>
        <Text className="text-3xl font-jakarta-bold text-slate-900 tracking-tight">
          Wishlist
        </Text>
        <Text className="text-sm font-jakarta text-blue-600 mt-1.5">
          {wishlist.length} {wishlist.length === 1 ? 'Product' : 'Products'} saved
        </Text>
      </View>

      {/* Standard List */}
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        ListEmptyComponent={ListEmptyComponent}
      />
    </SafeAreaView>
  );
}