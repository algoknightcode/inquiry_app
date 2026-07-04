import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Production API URL deployed on Vercel
const BACKEND_API_URL = 'https://app-inquiry-notification-five.vercel.app';

export function usePushNotifications() {
  useEffect(() => {
    if (isExpoGo) {
      console.log("====================================================================");
      console.log("FCM Token: [Unavailable in Expo Go. Please run in your development build APK.]");
      console.log("====================================================================");
      return;
    }
    
    // Dynamically require only when running outside of Expo Go (e.g. in development build APK)
    const Notifications = require('expo-notifications');

    async function registerForPushNotificationsAsync() {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Push notification permission not granted');
          return;
        }

        const token = await Notifications.getDevicePushTokenAsync();
        const fcmToken = token.data;
        console.log("===============================");
        console.log("Fetched FCM Token:", fcmToken);
        console.log("===============================");

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }

        // Check if we have already registered this token to avoid redundant network calls
        const registeredToken = await AsyncStorage.getItem('registered_fcm_token');
        if (registeredToken === fcmToken) {
          console.log("Token already registered on backend.");
          return;
        }

        // Prepare installation metadata
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const platform = Platform.OS;
        const deviceName = Device.deviceName || Device.modelName || 'Unknown Device';

        console.log(`Sending token to backend: ${BACKEND_API_URL}/api/tokens...`);

        const response = await fetch(`${BACKEND_API_URL}/api/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fcmToken,
            time,
            date,
            platform,
            deviceName,
          }),
        });

        const result = await response.json();
        if (result.success) {
          console.log("Token registered successfully on backend!");
          await AsyncStorage.setItem('registered_fcm_token', fcmToken);
        } else {
          console.error("Failed to register token on backend:", result.error);
        }

      } catch (error: any) {
        console.log("Error generating or registering FCM token:", error.message);
      }
    }

    registerForPushNotificationsAsync();
  }, []);
}
