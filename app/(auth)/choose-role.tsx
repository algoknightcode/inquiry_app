import { setGlobalRole } from "@/utils/roleCache";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Logo from "../../assets/images/logoo.webp";

const ChooseRole = () => {
  const router = useRouter();

  const handleSelectRole = (role: "buyer" | "seller") => {
    setGlobalRole(role); 
    console.log("Selected role:", role);
    if (role === "buyer") {
      router.replace("/Buyer/auth/Signup");
    } else {
      router.replace("/Seller/auth/Signup");
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.content}>

        {/* Header */}
        <View style={s.header}>
          <Image source={Logo} style={s.logo} resizeMode="contain" />
          <Text style={s.eyebrow}>WELCOME TO INDIAMART</Text>
          <Text style={s.title}>I want to...</Text>
          <View style={s.titleUnderline} />
        </View>


        {/* Cards Row Container */}
        <View style={s.cardsRowContainer}>

          {/* Buyer Card */}
          <Pressable
            style={({ pressed }) => [
              s.card,
              s.buyerCard,
              pressed && s.cardPressed,
            ]}
            onPress={() => handleSelectRole("buyer")}
          >
            <View style={[s.medallion, s.medallionBuyer]}>
              <View style={[s.medallionRing, s.medallionRingBuyer]} />
              <Ionicons name="cart" size={36} color="#1B2A6B" />
            </View>
            <Text style={s.cardTitle}>Buy</Text>
    
          </Pressable>

          {/* Vertical Divider */}
          <View style={s.dividerWrap}>
            <View style={s.divider} />
            <View style={s.dividerDot} />
          </View>

          {/* Seller Card */}
          <Pressable
            style={({ pressed }) => [
              s.card,
              s.sellerCard,
              pressed && s.cardPressed,
            ]}
            onPress={() => handleSelectRole("seller")}
          >
            <View style={[s.medallion, s.medallionSeller]}>
              <View style={[s.medallionRing, s.medallionRingSeller]} />
              <Ionicons name="storefront" size={36} color="#D9650A" />
            </View>
            <Text style={s.cardTitle}>Sell</Text>
        
          </Pressable>

        </View>

        {/* Footer Link */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={s.footerContainer}
        >
          <Text style={s.footerLinkText}>Not sure? Skip for now</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 24,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginTop: 16,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },


  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: "#D9650A",
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0F1535",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  titleUnderline: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#D9650A",
    marginTop: 14,
  },
  cardsRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
  },
  card: {
    width: 148,
    height: 188,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    shadowColor: "#1B2A6B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
    overflow: "hidden",
  },
  cardPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  buyerCard: {
    borderColor: "#DCE1F5",
  },
  sellerCard: {
    borderColor: "#F7DCC6",
  },
  medallion: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    position: "relative",
  },
  medallionBuyer: {
    backgroundColor: "#EAEEFB",
  },
  medallionSeller: {
    backgroundColor: "#FCE9DA",
  },
  medallionRing: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
  },
  medallionRingBuyer: {
    borderColor: "rgba(27,42,107,0.25)",
  },
  medallionRingSeller: {
    borderColor: "rgba(217,101,10,0.25)",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F1535",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6B7290",
  },
  dividerWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 14,
  },
  divider: {
    width: 1,
    height: 140,
    backgroundColor: "#E2E5F0",
  },
  dividerDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C7CBDE",
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerLinkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7290",
    textDecorationLine: "underline",
  },
});

export default ChooseRole;