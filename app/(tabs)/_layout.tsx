import CustomTabBar from '@/components/Home/Footer';
import { useRole } from '@/contexts/RoleContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

export default function TabLayout() {
  const { globalSellerId, globalBuyerId } = useRole();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const skipped = await AsyncStorage.getItem('skippedRole');
        // If the user has no active session AND has not explicitly skipped role selection
        if (!globalSellerId && !globalBuyerId && skipped !== 'true') {
          router.replace('/(auth)/choose-role');
        }
      } catch (error) {
        console.error('Error checking tab layout access:', error);
      }
    };
    checkAccess();
  }, [globalSellerId, globalBuyerId]);

  return (
    <Tabs
      screenOptions={{ 
        headerShown: false,
      }}
      // 🔥 This line perfectly links your Custom Footer to the navigation engine!
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}