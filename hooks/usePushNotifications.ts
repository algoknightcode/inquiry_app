import { useEffect } from 'react';
import { Platform } from 'react-native';

// NOTE: Push notifications are temporarily disabled on iOS because sideloading with a
// free Apple Developer account does not support the 'aps-environment' entitlement.
// Firebase (authentication, etc.) is still fully active.
// To re-enable, uncomment the code below and ensure you have a paid Apple Developer account.

export function usePushNotifications() {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      console.log("Push notifications are disabled on iOS (free provisioning profile).");
      return;
    }

    // --- PUSH NOTIFICATIONS DISABLED TEMPORARILY ---
    // Uncomment the block below when you have a paid Apple Developer account:
    //
    // import Constants, { ExecutionEnvironment } from 'expo-constants';
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // import * as Device from 'expo-device';
    //
    // const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    // const BACKEND_API_URL = 'https://app-inquiry-notification-five.vercel.app';
    //
    // if (isExpoGo) {
    //   console.log("FCM Token: [Unavailable in Expo Go.]");
    //   return;
    // }
    //
    // const Notifications = require('expo-notifications');
    // Notifications.setNotificationHandler({
    //   handleNotification: async () => ({
    //     shouldShowAlert: true,
    //     shouldPlaySound: true,
    //     shouldSetBadge: false,
    //   }),
    // });
    //
    // async function registerForPushNotificationsAsync() {
    //   try {
    //     const { status: existingStatus } = await Notifications.getPermissionsAsync();
    //     let finalStatus = existingStatus;
    //     if (existingStatus !== 'granted') {
    //       const { status } = await Notifications.requestPermissionsAsync();
    //       finalStatus = status;
    //     }
    //     if (finalStatus !== 'granted') { return; }
    //     const token = await Notifications.getDevicePushTokenAsync();
    //     const fcmToken = token.data;
    //     if (Platform.OS === 'android') {
    //       await Notifications.setNotificationChannelAsync('default', {
    //         name: 'default',
    //         importance: Notifications.AndroidImportance.MAX,
    //       });
    //     }
    //     const now = new Date();
    //     const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    //     const date = now.toISOString().split('T')[0];
    //     const platform = Platform.OS;
    //     const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';
    //     const response = await fetch(`${BACKEND_API_URL}/api/tokens`, {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ fcmToken, time, date, platform, deviceName }),
    //     });
    //     const result = await response.json();
    //     if (result.success) {
    //       await AsyncStorage.setItem('registered_fcm_token', fcmToken);
    //     }
    //   } catch (error: any) {
    //     console.log("Error generating or registering FCM token:", error.message);
    //   }
    // }
    // registerForPushNotificationsAsync();

  }, []);
}
