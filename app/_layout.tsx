import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import "../global.css";

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="Products_Page/index" options={{ headerShown: false }} />
          <Stack.Screen name="Products_Page/[slug]/index" options={{ headerShown: false }} />
          <Stack.Screen name="SubCategory/index" options={{ headerShown: false }} />
          <Stack.Screen name="Industries/index" options={{ headerShown: false }} />
          <Stack.Screen name="GrId_MainCategory/index" options={{ headerShown: false }} />
          <Stack.Screen name="AllCities/index" options={{ headerShown: false }} />
          <Stack.Screen name="PostRequirenmentForm/index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
