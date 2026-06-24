import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setGlobalRole } from "@/utils/roleCache";

const { width } = Dimensions.get("window");

export default function AccountChoicePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSelectRole = (role: "buyer" | "seller") => {
    setGlobalRole(role);
    if (role === "buyer") {
      router.push("/Buyer/auth/Login");
    } else {
      router.push("/Seller/auth/Login");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle-outline" size={80} color="#1E3A8A" />
          </View>
          <Text style={styles.title}>Join Inquiry Bazaar</Text>
          <Text style={styles.subtitle}>
            Choose how you want to proceed to unlock premium features, track requirements, and manage inquiries.
          </Text>
        </View>

        {/* Roles Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Buyer Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleSelectRole("buyer")}
            style={[styles.card, styles.buyerCard]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, styles.buyerIconBox]}>
                <Ionicons name="cart-outline" size={28} color="#1E3A8A" />
              </View>
              <View style={styles.cardTitleBox}>
                <Text style={styles.cardTitle}>Buyer Account</Text>
                <Text style={styles.cardTag}>Looking to Source</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>
              Post buying requirements, explore top industries, and contact verified suppliers globally.
            </Text>
            <View style={[styles.actionButton, styles.buyerButton]}>
              <Text style={[styles.actionButtonText, styles.buyerButtonText]}>
                Login / Register
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>

          {/* Seller Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleSelectRole("seller")}
            style={[styles.card, styles.sellerCard]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, styles.sellerIconBox]}>
                <Ionicons name="storefront-outline" size={28} color="#D9650A" />
              </View>
              <View style={styles.cardTitleBox}>
                <Text style={styles.cardTitle}>Seller Account</Text>
                <Text style={styles.cardTag}>Looking to Sell</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>
              List products, manage leads, view your business dashboard, and grow your sales.
            </Text>
            <View style={[styles.actionButton, styles.sellerButton]}>
              <Text style={[styles.actionButtonText, styles.sellerButtonText]}>
                Login / Register
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Secondary Back Link */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLink}
        >
          <Ionicons name="chevron-back" size={16} color="#64748B" />
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "PlusJakartaSans-Bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "PlusJakartaSans-Medium",
    paddingHorizontal: 12,
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  buyerCard: {
    borderColor: "#E2E8F0",
  },
  sellerCard: {
    borderColor: "#FCE8DB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  buyerIconBox: {
    backgroundColor: "#EFF6FF",
  },
  sellerIconBox: {
    backgroundColor: "#FFF7ED",
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    fontFamily: "PlusJakartaSans-Bold",
  },
  cardTag: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: "PlusJakartaSans-SemiBold",
    marginTop: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    fontFamily: "PlusJakartaSans-Regular",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buyerButton: {
    backgroundColor: "#1E3A8A",
  },
  sellerButton: {
    backgroundColor: "#D9650A",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans-Bold",
  },
  buyerButtonText: {
    color: "#ffffff",
  },
  sellerButtonText: {
    color: "#ffffff",
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 12,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    fontFamily: "PlusJakartaSans-SemiBold",
  },
});