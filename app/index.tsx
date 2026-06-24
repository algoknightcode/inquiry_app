import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setGlobalSellerId, setSellerSignedIn, setGlobalBuyerId, setGlobalRole } from "../utils/roleCache";

let sessionWelcomeShown = false;

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const supplierId = await AsyncStorage.getItem("supplierId");
        const buyerId = await AsyncStorage.getItem("buyerId");

        if (supplierId) {
          // Restore seller session in cache
          setGlobalSellerId(supplierId);
          setSellerSignedIn(true);
          setGlobalRole("seller");
          // Redirect to Home page
          router.replace("/(tabs)");
        } else if (buyerId) {
          // Restore buyer session in cache
          setGlobalBuyerId(buyerId);
          setGlobalRole("buyer");
          // Redirect to buyer Home/tabs
          router.replace("/(tabs)");
        } else if (!sessionWelcomeShown) {
          // First launch of this app session - show welcome screen
          sessionWelcomeShown = true;
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