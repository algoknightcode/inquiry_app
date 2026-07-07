import { setGlobalRole } from "@/utils/roleCache";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logo from "../../assets/images/logoo-Photoroom.png";

const ChooseRole = () => {
  const router = useRouter();
  const [pressedRole, setPressedRole] = useState<"buyer" | "seller" | null>(null);

  const handleSelectRole = (role: "buyer" | "seller") => {
    setGlobalRole(role);
    console.log("Selected role:", role);
    if (role === "buyer") {
      router.push("/Buyer/auth/Signup");
    } else {
      router.push("/Seller/auth/Signup");
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("hasSkippedRole", "true");
      router.replace("/(tabs)");
    } catch (e) {
      console.log("Error saving skip state", e);
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        
        {/* --- TOP / MIDDLE SECTION --- */}
        {/* This container centers the Logo, Title, and Cards on the screen */}
        <View style={styles.mainContentCenter}>
          
          {/* Header Area */}
          <View style={styles.header}>
            <Image source={Logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.eyebrow}>Welcome to InquiryBazaar</Text>
            <Text style={styles.title}>Choose Your Role</Text>
            <View style={styles.accentLine} />
          </View>

          {/* Cards Area */}
          {/* TO MOVE CARDS CLOSER TO TEXT: Change marginTop in styles.cardRow */}
          <View style={styles.cardRow}>
            
            {/* Buyer Card */}
            <Pressable
              onPressIn={() => setPressedRole("buyer")}
              onPressOut={() => setPressedRole(null)}
              onPress={() => handleSelectRole("buyer")}
              style={[
                styles.cardWrapper,
                { transform: [{ scale: pressedRole === "buyer" ? 0.96 : 1 }] }
              ]}
            >
              <LinearGradient
                colors={["#0B2F64", "#1E40AF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="cart-outline" size={moderateScale(34)} color="#FFFFFF" />
                </View>
                <Text style={styles.cardTitle}>Buy</Text>
                <Text style={styles.cardSubtitle}>Source items</Text>
              </LinearGradient>
            </Pressable>

            {/* Vertical Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot}>
                <Text style={styles.dividerDotText}>OR</Text>
              </View>
            </View>

            {/* Seller Card */}
            <Pressable
              onPressIn={() => setPressedRole("seller")}
              onPressOut={() => setPressedRole(null)}
              onPress={() => handleSelectRole("seller")}
              style={[
                styles.cardWrapper,
                { transform: [{ scale: pressedRole === "seller" ? 0.96 : 1 }] }
              ]}
            >
              <LinearGradient
                colors={["#C2410C", "#F97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="storefront-outline" size={moderateScale(32)} color="#FFFFFF" />
                </View>
                <Text style={styles.cardTitle}>Sell</Text>
                <Text style={styles.cardSubtitle}>Grow business</Text>
              </LinearGradient>
            </Pressable>

          </View>
        </View>

        {/* --- BOTTOM SECTION --- */}
        {/* This stays anchored safely to the bottom of the screen */}
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.footerLink}
        >
          <Text style={styles.footerText}>
            Not sure? Skip for now
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1, 
    justifyContent: "space-between", // This magically pushes the footer to the bottom
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(30), // Safe space at the very bottom of screen
  },
  mainContentCenter: {
    flex: 1,
    justifyContent: "flex-start", // <--- This snaps it to the top!
    marginTop: verticalScale(0), // <--- CHANGE THIS to push the WHOLE block down from the top edge
  },
  header: {
    alignItems: "center",
  },
  logo: {
    width: scale(80),
    height: scale(80),
    marginBottom: verticalScale(8),
  },
  eyebrow: {
    fontSize: moderateScale(11),
    fontWeight: "800",
    color: "#4F46E5",
    letterSpacing: 2.5,
    marginBottom: verticalScale(4),
    textTransform: "uppercase",
  },
  title: {
    fontSize: moderateScale(26),
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  accentLine: {
    width: scale(44),
    height: verticalScale(4),
    backgroundColor: "#4F46E5",
    borderRadius: 99,
    marginTop: verticalScale(6),
    alignSelf: "center",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%", 
    marginTop: verticalScale(25), 
  },
  cardWrapper: {
    flex: 1, 
    aspectRatio: 0.85, 
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(24),
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientCard: {
    flex: 1,
    borderRadius: moderateScale(24),
    padding: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: verticalScale(12),
  },
  cardTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: moderateScale(20),
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    fontSize: moderateScale(11),
    marginTop: verticalScale(4),
    textAlign: "center",
  },
  dividerContainer: {
    width: scale(30), 
    alignItems: "center",
    justifyContent: "center",
  },
  dividerLine: {
    width: 1,
    height: "40%", 
    backgroundColor: "#E2E8F0",
  },
  dividerDot: {
    position: "absolute",
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  dividerDotText: {
    fontSize: moderateScale(9),
    fontWeight: "800",
    color: "#94A3B8",
  },
  footerLink: {
    alignItems: "center",
    paddingVertical: moderateScale(14),
    width: "100%",
    // The footer automatically sits at the bottom now.
  },
  footerText: {
    fontSize: moderateScale(15),
    fontWeight: "700",
    color: "#6B7280",
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: -150,
  },
});

export default ChooseRole;