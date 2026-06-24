import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import "../global.css";
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity } from 'react-native';

const CustomBackButton = () => {
  return (
    <TouchableOpacity 
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(auth)/choose-role");
        }
      }} 
      style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -8 }}
    >
      <Ionicons name="chevron-back" size={28} color="#007AFF" />
      <Text style={{ color: '#007AFF', fontSize: 17, marginLeft: -6 }}>Back</Text>
    </TouchableOpacity>
  );
};

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setGlobalSellerId } from '@/utils/roleCache';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const restoreSession = async () => {
      const storedId = await AsyncStorage.getItem("supplierId");
      if (storedId) {
        setGlobalSellerId(storedId);
      }
    };
    restoreSession();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="Products_Page/index" options={{ headerShown: false }} />
          <Stack.Screen name="Products_Page/[slug]/index" options={{ headerShown: false }} />
          <Stack.Screen name="SubCategory/index" options={{ headerShown: false }} />
          <Stack.Screen 
            name="Industries/index" 
            options={{ 
              headerShown: false, 
              animation: "slide_from_bottom" 
            }} 
          />
          <Stack.Screen name="GrId_MainCategory/index" options={{ headerShown: false }} />
          <Stack.Screen name="AllCities/index" options={{ headerShown: false }} />
          <Stack.Screen name="PostRequirenmentForm/index" options={{ headerShown: false }} />
          <Stack.Screen name="NotificationPanel/index" options={{ headerShown: false }} />
          <Stack.Screen 
            name="Account/index" 
            options={{ 
              headerShown: false, 
              animation: "slide_from_bottom" 
            }} 
          />
          <Stack.Screen 
            name="Wishlist/index" 
            options={{ 
              headerShown: false, 
              animation: "slide_from_bottom" 
            }} 
          />
          <Stack.Screen 
            name="Buyer/profile/index" 
            options={{ 
              headerShown: false,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Buyer/PostRFQ/index" 
            options={{ 
              headerShown: false,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Seller/Profile/index" 
            options={{ 
              headerShown: false,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Seller/auth/Login" 
            options={{ 
              headerShown: true,
              title: "Supplier Login",
              headerLeft: () => <CustomBackButton />,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Seller/auth/Signup" 
            options={{ 
              headerShown: true,
              title: "Supplier Registration",
              headerLeft: () => <CustomBackButton />,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Buyer/auth/Login" 
            options={{ 
              headerShown: true,
              title: "Buyer Login",
              headerLeft: () => <CustomBackButton />,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Buyer/auth/Signup" 
            options={{ 
              headerShown: true,
              title: "Buyer Registration",
              headerLeft: () => <CustomBackButton />,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Seller/AddProduct/index" 
            options={{ 
              headerShown: false,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Seller/ViewAllProduct/index" 
            options={{ 
              headerShown: false,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="Seller/dashboard/index" 
          options={{ 
            headerShown: false,
            animation: "slide_from_right"
          }} 
        />
        <Stack.Screen 
          name="Seller/Lead/index" 
          options={{ 
            headerShown: false,
            animation: "slide_from_right"
          }} 
        />
      </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
