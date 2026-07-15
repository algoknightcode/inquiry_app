import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  setGlobalRole, 
  globalBuyerId, 
  globalSellerId, 
  setGlobalBuyerId, 
  setGlobalSellerId, 
  setSellerSignedIn 
} from "@/utils/roleCache";
import AsyncStorage from "@react-native-async-storage/async-storage";
const { width } = Dimensions.get("window");

export default function AccountChoicePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [targetRole, setTargetRole] = useState<"buyer" | "seller" | null>(null);

  const [activeLoggedInRole, setActiveLoggedInRole] = useState<"buyer" | "seller" | null>(
    globalSellerId ? "seller" : (globalBuyerId ? "buyer" : null)
  );

  React.useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedSeller = await AsyncStorage.getItem("supplierId");
        const storedBuyer = await AsyncStorage.getItem("buyerId");
        
        if (storedSeller) {
          setGlobalSellerId(storedSeller);
          setActiveLoggedInRole("seller");
        } else if (storedBuyer) {
          setGlobalBuyerId(storedBuyer);
          setActiveLoggedInRole("buyer");
        }
      } catch (error) {
        console.error("Error reading auth state from storage", error);
      }
    };
    checkAuthStatus();
  }, []);

  const handleSelectRole = (role: "buyer" | "seller") => {
    if (activeLoggedInRole && activeLoggedInRole !== role) {
      setTargetRole(role);
      setModalVisible(true);
      return;
    }

    if (activeLoggedInRole === role) {
      // Already logged in.
      return;
    }

    setGlobalRole(role);
    if (role === "buyer") {
      router.push("/Buyer/auth/Login");
    } else {
      router.push("/Seller/auth/Login");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["supplierId", "buyerId", "skippedRole"]);
      setGlobalBuyerId(null);
      setGlobalSellerId(null);
      setSellerSignedIn(false);
      setGlobalRole("buyer");
      setModalVisible(false);
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/(auth)/choose-role");
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button Container */}
      <TouchableOpacity 
         onPress={() => router.back()}
         style={{ position: 'absolute', top: insets.top + 10, left: 20, zIndex: 10, backgroundColor: '#1E3A8A', padding: 8, borderRadius: 20 }}
      >
         <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingTop: insets.top + 40,
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
            activeOpacity={activeLoggedInRole === "buyer" ? 1.0 : 0.9}
            onPress={() => handleSelectRole("buyer")}
            style={[styles.card, styles.buyerCard]}
          >
            {activeLoggedInRole === "buyer" && (
              <View style={styles.loggedInBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#1E3A8A" />
                <Text style={styles.loggedInText}>Logged In</Text>
              </View>
            )}
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
            {activeLoggedInRole !== "buyer" && (
              <View style={[styles.actionButton, styles.buyerButton]}>
                <Text style={[styles.actionButtonText, styles.buyerButtonText]}>
                  Login / Register
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>

          {/* Seller Card */}
          <TouchableOpacity
            activeOpacity={activeLoggedInRole === "seller" ? 1.0 : 0.9}
            onPress={() => handleSelectRole("seller")}
            style={[styles.card, styles.sellerCard]}
          >
            {activeLoggedInRole === "seller" && (
              <View style={styles.loggedInBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#D9650A" />
                <Text style={styles.loggedInText}>Logged In</Text>
              </View>
            )}
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
            {activeLoggedInRole !== "seller" && (
              <View style={[styles.actionButton, styles.sellerButton]}>
                <Text style={[styles.actionButtonText, styles.sellerButtonText]}>
                  Login / Register
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </View>
            )}
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

      {/* Role Switch Warning Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Action Required</Text>
            <Text style={styles.modalText}>
              You are currently logged in as a <Text style={{fontWeight: "bold"}}>{activeLoggedInRole === "seller" ? "Seller" : "Buyer"}</Text>. 
              To switch to a {targetRole === "seller" ? "Seller" : "Buyer"} account, you must log out first.
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>Understood</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.modalLogoutBtn}>
              <Text style={styles.modalLogoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    position: "relative",
  },
  loggedInBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  loggedInText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    fontFamily: "PlusJakartaSans-Bold",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    fontFamily: "PlusJakartaSans-Bold",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "PlusJakartaSans-Medium",
    marginBottom: 24,
  },
  modalCloseBtn: {
    backgroundColor: "#0F172A",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalCloseText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans-Bold",
  },
  modalLogoutBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#FEF2F2",
  },
  modalLogoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans-Bold",
  },
});