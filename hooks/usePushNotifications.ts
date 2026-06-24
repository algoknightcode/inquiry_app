import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

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
          console.log('Permission not granted');
          return;
        }

        const token = await Notifications.getDevicePushTokenAsync();
        console.log("===============================");
        console.log("FCM Token:", token.data);
        console.log("===============================");

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }
      } catch (error: any) {
        console.log("Error generating FCM token:", error.message);
      }
    }

    registerForPushNotificationsAsync();
  }, []);
}
