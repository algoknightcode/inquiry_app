import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

// Added realistic Unsplash images to demonstrate the premium feel
const productData = [
  {
    id: '1',
    title: 'Sony WH-1000XM4 Wireless Headphones',
    price: '22,990',
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Mechanical Gaming Keyboard - RGB',
    price: '4,500',
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Minimalist Desk Lamp with Charger',
    price: '1,850',
    currency: 'INR',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400&auto=format&fit=crop',
  }
];

interface Product {
  id: string;
  title: string;
  price: string;
  currency: string;
  image: string;
}

// Calculate snap interval: w-60 is usually 240px + mr-5 is 20px = 260
const CARD_WIDTH = 170; 
const CARD_MARGIN = 20;

const ProductCard = ({ item }: { item: Product }) => {
  return (
    <TouchableOpacity
      // Increased width, larger border radius, and softer shadows for a premium look
      className="bg-white rounded-3xl mr-5 shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
      style={{ width: CARD_WIDTH }}
      activeOpacity={0.7}
    >
      {/* 1. Full-Bleed Image Container */}
      <View className="h-48 w-full bg-slate-100">
        <Image
          source={{ uri: item.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* 2. Streamlined Content Container */}
      <View className="p-5 flex-1 justify-between bg-white">
        
        {/* Title */}
        <Text 
          className="text-slate-800 font-bold text-base leading-snug mb-3" 
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Clean, bold price */}
        <View className="flex-row items-center mt-auto">
          <Text className="text-slate-900 font-black text-2xl tracking-tight">
            ₹{item.price}
          </Text>
        </View>
        
      </View>
    </TouchableOpacity>
  );
};

export default function HorizontalProductList() {
  return (
    <View className="mt-8">

      {/* Section Header — matches NewOnes layout exactly */}
      <View className="flex flex-row justify-between items-end px-5">
        <View className="flex-col">
          <Text className="text-[10px] font-jakarta-bold text-slate-400 tracking-[0.15em] mb-1 uppercase">
            TRENDING NOW
          </Text>
          <Text className="text-[26px] font-jakarta-extrabold text-slate-900 tracking-tighter leading-none">
            Featured
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          style={{ borderBottomWidth: 1, borderBottomColor: '#0f172a', paddingBottom: 2 }}
        >
          <Text className="text-slate-900 font-jakarta-bold text-sm tracking-tight">
            Explore
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal List */}
      <FlatList
        data={productData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard item={item} />}
        className="mt-5 pl-5"
        contentContainerStyle={{ paddingRight: 20 }}
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
        snapToAlignment="start"
      />
    </View>
  );
}