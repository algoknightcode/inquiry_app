
import { RoleProvider, useRole } from '@/contexts/RoleContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "../global.css";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disables warnings from third-party libraries reading shared values during render
});

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

// Inner layout component that has access to RoleProvider context
function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { initializeFromStorage } = useRole();
  usePushNotifications();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
        <View style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
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
              name="Seller/Profile/index" 
              options={{ 
                headerShown: false,
                animation: "slide_from_right"
              }} 
            />
            <Stack.Screen 
              name="Seller/auth/Login" 
              options={{ 
                headerShown: false,
                animation: "slide_from_right"
              }} 
            />
            <Stack.Screen 
              name="Seller/auth/Signup" 
              options={{ 
                headerShown: false,
                animation: "slide_from_right"
              }} 
            />
            <Stack.Screen 
              name="Buyer/auth/Login" 
              options={{ 
                headerShown: false,
                animation: "slide_from_right"
              }} 
            />
            <Stack.Screen 
              name="Buyer/auth/Signup" 
              options={{ 
                headerShown: false,
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
          <Stack.Screen 
            name="HelpSupport/index" 
            options={{ 
              headerShown: false,
              animation: "slide_from_right"
            }} 
          />
          <Stack.Screen 
            name="ExhibitionPage/index" 
            options={{ 
              headerShown: false,
              animation: "slide_from_right"
            }} 
          />
        </Stack>
  
      </View>
        <StatusBar style="dark" />
      </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Export default wrapped with RoleProvider
export default function RootLayout() {
  return (
    <RoleProvider>
      <RootLayoutContent />
    </RoleProvider>
  );
}
