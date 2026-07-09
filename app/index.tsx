import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, InteractionManager, View } from "react-native";
import { prefetchHomeData } from "../utils/prefetchHome";
import { setGlobalBuyerId, setGlobalRole, setGlobalSellerId, setSellerSignedIn } from "../utils/roleCache";
import {
    getSessionSkippedRole,
    getSessionWelcomeShown,
    setSessionWelcomeShown,
} from "../utils/sessionCache";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supplierId = await AsyncStorage.getItem("supplierId");
        const buyerId = await AsyncStorage.getItem("buyerId");
        const skippedRole = await AsyncStorage.getItem("skippedRole");

        if (supplierId) {
          // Restore seller session in cache
          setGlobalSellerId(supplierId);
          setSellerSignedIn(true);
          setGlobalRole("seller");
          // Pre-warm home data so tabs load instantly (no loaders)
          InteractionManager.runAfterInteractions(() => {
            prefetchHomeData().catch(() => {});
          });
          router.replace("/(tabs)");
        } else if (buyerId) {
          // Restore buyer session in cache
          setGlobalBuyerId(buyerId);
          setGlobalRole("buyer");
          // Pre-warm home data so tabs load instantly
          InteractionManager.runAfterInteractions(() => {
            prefetchHomeData().catch(() => {});
          });
          router.replace("/(tabs)");
        } else if (skippedRole === "true" || getSessionSkippedRole()) {
          // User skipped role selection — stay in tabs
          InteractionManager.runAfterInteractions(() => {
            prefetchHomeData().catch(() => {});
          });
          router.replace("/(tabs)");
        } else if (!getSessionWelcomeShown()) {
          // First launch of this app session - show welcome screen
          // (welcome.tsx handles its own prefetchHomeData call)
          setSessionWelcomeShown();
          router.replace("/welcome");
        } else {
          // Choose role
          router.replace("/(auth)/choose-role");
        }
      } catch (err) {
        console.error("Session restoration failed:", err);
        router.replace("/(auth)/choose-role");
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" }}>
      <ActivityIndicator size="large" color="#1E3A8A" />
    </View>
  );
}