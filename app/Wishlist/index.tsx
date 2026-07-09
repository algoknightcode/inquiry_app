import { setProductCache } from "@/utils/productCache";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

import { fetchWithCache } from "@/utils/apiCache";
import EnquiryModal from "@/components/EnquiryModal";

export default function B2BWishlist() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States for EnquiryModal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isEnquiryVisible, setIsEnquiryVisible] = useState(false);

  const loadWishlist = async () => {
    try {
      const storedStr = await AsyncStorage.getItem("wishlist");
      if (storedStr) {
        setWishlist(JSON.parse(storedStr));
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Error loading wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadWishlist();
    }, [])
  );

  const removeFromWishlist = async (id: string) => {
    try {
      Vibration.vibrate(3);
      const updated = wishlist.filter((item) => item._id !== id);
      setWishlist(updated);
      await AsyncStorage.setItem("wishlist", JSON.stringify(updated));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  const getPrimaryImage = (media: any[]) => {
    if (!media || media.length === 0) {
      return "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400";
    }
    return (media.find((m: any) => m.isPrimary) || media[0])?.url || "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400";
  };

  const handleCardPress = (item: any) => {
    setProductCache(item._id, item);
    router.push({
      pathname: "/Products_Page/[slug]",
      params: {
        slug: item.slug,
        productId: item._id,
      },
    });
  };

  const handleCall = (item: any) => {
    const phone = item.supplier?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (item: any) => {
    const email = item.supplier?.email || "admin@inquirybazaar.com";
    const subject = encodeURIComponent(`Inquiry about ${item.name}`);
    Linking.openURL(`mailto:${email}?subject=${subject}`);
  };

  const renderItem = ({ item }: { item: any }) => {
    const primaryImage = getPrimaryImage(item.media);
    const companyName = item.supplier?.business?.companyName || item.supplier?.name || "Verified Seller";
    const location = item.supplier?.business?.city 
      ? `${item.supplier.business.city}, ${item.supplier.business.state || ""}`
      : "India";
    const isPriceOnRequest = item.priceType === "on_request" || !item.price;

    return (
      <View className="bg-white mb-5 rounded-2xl p-4 shadow-xl shadow-slate-200/60 border border-slate-100">
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleCardPress(item)}>
          <View className="flex-row">
            {/* Product Image */}
            <Image 
              source={{ uri: primaryImage }} 
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
                  onPress={() => removeFromWishlist(item._id)}
                  className="absolute -top-2 -right-2 p-2 bg-red-50 rounded-full"
                >
                  <Ionicons name="heart" size={20} color="#f43f5e" />
                </TouchableOpacity>

                <View className="mt-2 flex-row items-baseline">
                  <Text className="text-lg font-jakarta-bold text-blue-600">
                    {isPriceOnRequest ? "Price on Request" : `₹${item.price.toLocaleString()}`}
                  </Text>
                  {!isPriceOnRequest && (
                    <Text className="text-xs text-slate-500 font-jakarta ml-1">
                      / {item.unit || "Unit"}
                    </Text>
                  )}
                </View>

                <View className="mt-2 flex-row items-center">
                  <View className="bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 flex-row items-center">
                    <Ionicons name="layers" size={10} color="#3b82f6" />
                    <Text className="text-[10px] text-blue-700 font-jakarta-bold ml-1 uppercase tracking-wider">
                      MOQ: {item.minOrderQty || 1} {item.unit || "Units"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Supplier Info */}
              <View className="mt-3">
                <Text className="text-xs font-jakarta text-slate-600" numberOfLines={1}>
                  <Ionicons name="business" size={12} color="#64748b" /> {companyName}
                </Text>
                <Text className="text-[11px] font-jakarta text-slate-400 mt-1" numberOfLines={1}>
                  <Ionicons name="location" size={10} color="#94a3b8" /> {location}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View className="flex-row mt-4 border-t border-slate-100 pt-4 gap-x-3">
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => {
              setSelectedProduct(item);
              setIsEnquiryVisible(true);
            }}
            className="flex-1 bg-blue-600 py-3 rounded-xl flex-row items-center justify-center shadow-md shadow-blue-600/30"
          >
            <Ionicons name="mail" size={18} color="white" />
            <Text className="ml-2 text-sm font-jakarta-bold text-white">
              Contact Supplier
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => handleCall(item)}
            className="bg-white border border-blue-200 py-3 px-5 rounded-xl flex-row items-center justify-center shadow-sm shadow-slate-100"
          >
            <Ionicons name="call" size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          ListEmptyComponent={ListEmptyComponent}
        />
      )}

      {/* Reusable Enquiry Modal */}
      <EnquiryModal 
        visible={isEnquiryVisible} 
        onClose={() => setIsEnquiryVisible(false)} 
        product={selectedProduct} 
      />
    </SafeAreaView>
  );
}