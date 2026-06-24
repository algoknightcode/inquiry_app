import { productCache } from "@/utils/productCache";
import { globalSellerId } from "@/utils/roleCache";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

export default function ProductDetailPage() {
  const router = useRouter();
  const { productId, slug } = useLocalSearchParams<{ productId?: string; slug?: string }>();

  // --- STATES ---
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<any>(() => {
    return productId ? productCache[productId as string] : null;
  });

  // --- INQUIRY MODAL STATES ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // NEW: Custom Success Modal State
  
  const [inqName, setInqName] = useState("");
  const [inqEmail, setInqEmail] = useState("");
  const [inqPhone, setInqPhone] = useState("");
  const [inqMessage, setInqMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load wishlist state on mount
  React.useEffect(() => {
    if (!product?._id) return;
    const checkWishlist = async () => {
      try {
        const storedStr = await AsyncStorage.getItem("wishlist");
        if (storedStr) {
          const list: any[] = JSON.parse(storedStr);
          const exists = list.some((item) => item._id === product._id);
          setIsWishlisted(exists);
        }
      } catch (err) {
        console.error("Error checking wishlist:", err);
      }
    };
    checkWishlist();
  }, [product]);

  // Handle wishlist add/remove toggle
  const handleToggleWishlist = async () => {
    if (!product?._id) return;
    try {
      Vibration.vibrate(30); 
      const storedStr = await AsyncStorage.getItem("wishlist");
      let list: any[] = [];
      if (storedStr) {
        list = JSON.parse(storedStr);
      }

      const exists = list.some((item) => item._id === product._id);
      if (exists) {
        list = list.filter((item) => item._id !== product._id);
        setIsWishlisted(false);
      } else {
        list.push(product);
        setIsWishlisted(true);
      }
      await AsyncStorage.setItem("wishlist", JSON.stringify(list));
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  // Fetch full details from backend
  React.useEffect(() => {
    if (!productId && !slug) return;

    const fetchFullDetails = async () => {
      const urls = [
        `https://backend.inquirybazaar.com/api/products/${productId}`,
        `https://backend.inquirybazaar.com/api/products/single/${productId}`,
        `https://backend.inquirybazaar.com/api/product/${productId}`,
        `https://backend.inquirybazaar.com/api/products/details/${productId}`,
        `https://backend.inquirybazaar.com/api/products/get/${productId}`,
        `https://backend.inquirybazaar.com/api/products/slug/${slug}`,
        `https://backend.inquirybazaar.com/api/product/slug/${slug}`,
        `https://backend.inquirybazaar.com/api/products/${slug}`,
      ];

      for (const url of urls) {
        try {
          const res = await fetch(url);
          const text = await res.text();
          if (text.startsWith("{")) {
            const json = JSON.parse(text);
            if (json.success && json.data) {
              const fullProduct = json.data;
              setProduct(fullProduct);
              if (productId) {
                productCache[productId] = fullProduct;
              }
              break;
            }
          }
        } catch (e) {
          // Continue to next URL
        }
      }
    };

    fetchFullDetails();
  }, [productId, slug]);

  // --- SUBMIT INQUIRY API ---
  const handleSendInquiry = async () => {
    if (!inqName.trim() || !inqPhone.trim() || !inqMessage.trim()) {
      Alert.alert("Required Fields", "Please provide your Name, Phone Number, and Message.");
      return;
    }

    setIsSubmitting(true);
    try {
      const globalUserId = globalSellerId || await AsyncStorage.getItem("buyerId") || await AsyncStorage.getItem("supplierId");

      let supToken = typeof product?.supplier === "string" 
        ? product.supplier 
        : (product?.supplier?._id || product?.supplierId?._id);

      if (!supToken && globalUserId) {
        supToken = globalUserId;
      }

      const payload = {
        supplierToken: supToken,
        platform: "App Product Popup",
        platformEmail: product?.supplier?.email || product?.supplierId?.email || "lead.inquirybazaar@gmail.com",
        name: inqName,
        email: inqEmail || "NA",
        company: "NA",
        phone: inqPhone,
        product: product?.name || "NA",
        place: "NA",
        message: inqMessage,
      };

      // EXACT LOGGING SO YOU KNOW WHERE IT FAILS
      console.log("📤 Sending Payload:", JSON.stringify(payload, null, 2));

      const res = await fetch("https://brandbnalo.com/api/form/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(globalUserId ? { "x-user-id": globalUserId } : {})
        },
        body: JSON.stringify(payload),
      });

      const resText = await res.text();
      
      // EXACT LOGGING OF BACKEND RESPONSE
      console.log("📥 Response Status:", res.status);
      console.log("📥 Response Body:", resText);

      if (res.ok) {
        // CLOSE FORM MODAL AND SHOW BEAUTIFUL SUCCESS MODAL
        setModalVisible(false);
        setShowSuccessModal(true);
        
        // Reset fields
        setInqName("");
        setInqEmail("");
        setInqPhone("");
        setInqMessage("");
      } else {
        let errorMsg = "Failed to send inquiry.";
        try {
          const errorData = JSON.parse(resText);
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (e) {}
        Alert.alert("Submission Failed", errorMsg);
      }
    } catch (error) {
      console.error("Inquiry Error:", error);
      Alert.alert("Error", "A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getPrimaryImage = (media: any[]) => {
    if (!media || media.length === 0) return null;
    return (media.find((m: any) => m.isPrimary) || media[0])?.url || null;
  };

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={56} color="#cbd5e1" />
        <Text style={{ color: "#334155", fontWeight: "bold", fontSize: 18, marginTop: 16, textAlign: "center" }}>
          Product not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#4f46e5", borderRadius: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const imageUri = getPrimaryImage(product.media);
  const company = product.supplier?.business?.companyName || product.supplier?.name || "Supplier";
  const city = product.supplier?.business?.city || "";
  const state = product.supplier?.business?.state || "";
  const address = product.supplier?.business?.address || "";
  const businessType = product.supplier?.business?.businessType || "";
  const phone = product.supplier?.phone;
  const isOnRequest = product.priceType === "on_request";

  const specs: any[] = product.specifications || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── HEADER ── */}
      <View style={{ backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginLeft: -4 }}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <Text style={{ flex: 1, fontSize: 17, fontWeight: "700", color: "#0f172a", marginLeft: 8, marginRight: 8 }} numberOfLines={1}>
          {product.name}
        </Text>
        
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={handleToggleWishlist} style={{ padding: 4, marginRight: 8 }} activeOpacity={0.7}>
            <Ionicons name={isWishlisted ? "heart" : "heart-outline"} size={24} color={isWishlisted ? "#8b5cf6" : "#64748b"} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 4 }}>
            <Ionicons name="share-social-outline" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* HERO IMAGE */}
        <View style={{ width: "100%", height: 280, backgroundColor: "#e2e8f0" }}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} contentFit="cover" transition={300} />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="image-outline" size={64} color="#cbd5e1" />
            </View>
          )}
        </View>

        {/* PRODUCT INFO CARD */}
        <View style={{ marginTop: -24, backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 32, paddingHorizontal: 24, paddingBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 12, gap: 6 }}>
            <MaterialCommunityIcons name="domain" size={15} color="#64748b" />
            <Text style={{ color: "#475569", fontWeight: "600", fontSize: 13 }} numberOfLines={1}>{company}</Text>
            {(city || state) ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Ionicons name="location-outline" size={11} color="#64748b" />
                <Text style={{ color: "#64748b", fontSize: 11, marginLeft: 2 }}>{[city, state].filter(Boolean).join(", ")}</Text>
              </View>
            ) : null}
          </View>

          <Text style={{ fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 16, lineHeight: 30 }}>{product.name}</Text>

          {isOnRequest ? (
            <View style={{ backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: "flex-start", marginBottom: 16 }}>
              <Text style={{ color: "#92400e", fontWeight: "700", fontSize: 15 }}>Price on Request</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
              <Text style={{ fontSize: 30, fontWeight: "900", color: "#4f46e5" }}>₹{product.price?.toLocaleString()}</Text>
              <Text style={{ color: "#64748b", fontSize: 14, marginLeft: 6, marginBottom: 4 }}>/ {product.unit}</Text>
              {product.oldPrice ? (
                <Text style={{ color: "#94a3b8", fontSize: 14, marginLeft: 8, marginBottom: 4, textDecorationLine: "line-through" }}>
                  ₹{product.oldPrice?.toLocaleString()}
                </Text>
              ) : null}
            </View>
          )}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {product.minOrderQty ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <MaterialCommunityIcons name="package-variant" size={13} color="#475569" />
                <Text style={{ color: "#475569", fontWeight: "600", fontSize: 12, marginLeft: 6 }}>MOQ: {product.minOrderQty} {product.unit}</Text>
              </View>
            ) : null}
            {product.deliveryTime ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <Ionicons name="time-outline" size={13} color="#475569" />
                <Text style={{ color: "#475569", fontWeight: "600", fontSize: 12, marginLeft: 6 }}>{product.deliveryTime}</Text>
              </View>
            ) : null}
            {product.supplyAbility ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <MaterialCommunityIcons name="check-circle-outline" size={13} color="#16a34a" />
                <Text style={{ color: "#15803d", fontWeight: "600", fontSize: 12, marginLeft: 6 }}>{product.supplyAbility}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* DESCRIPTION */}
        {product.description ? (() => {
          const plainText = (product.description as string).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
          return plainText.length > 0 ? (
            <View style={{ marginTop: 12, backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 28 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#0f172a", marginBottom: 16 }}>Product Description</Text>
              <Text style={{ color: "#475569", fontSize: 14, lineHeight: 24, fontWeight: "400" }}>{plainText}</Text>
            </View>
          ) : null;
        })() : null}

        {/* SPECIFICATIONS */}
        {specs.length > 0 ? (
          <View style={{ marginTop: 12, backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 32 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#0f172a", marginBottom: 20 }}>Specifications & Details</Text>
            <View style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
              {specs.map((spec, idx) => (
                <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottomWidth: idx === specs.length - 1 ? 0 : 1, borderBottomColor: "#e2e8f0" }}>
                  <Text style={{ color: "#64748b", fontWeight: "600", fontSize: 13, flex: 1, marginRight: 8 }}>{spec.key}</Text>
                  <Text style={{ color: "#0f172a", fontWeight: "600", fontSize: 13, flex: 1.5, textAlign: "right" }}>{spec.value}</Text>
                </View>
              ))}
            </View>

            {product.packagingDetails ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }}>
                <MaterialCommunityIcons name="package-variant-closed" size={18} color="#64748b" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: "#94a3b8", fontWeight: "700", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Packaging</Text>
                  <Text style={{ color: "#334155", fontWeight: "600", fontSize: 13, marginTop: 2 }}>{product.packagingDetails}</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* SUPPLIER */}
        <View style={{ marginTop: 12, backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 32, marginBottom: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#0f172a", marginBottom: 20 }}>Supplier Details</Text>
          <View style={{ backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }}>
              {product.supplier?.profileImage ? (
                <Image source={{ uri: product.supplier.profileImage }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14 }} contentFit="cover" />
              ) : (
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#e0e7ff", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <MaterialCommunityIcons name="domain" size={22} color="#4f46e5" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#0f172a", fontWeight: "700", fontSize: 15 }} numberOfLines={2}>{company}</Text>
                {businessType ? <Text style={{ color: "#64748b", fontWeight: "500", fontSize: 12, marginTop: 2 }}>{businessType}</Text> : null}
              </View>
            </View>

            {address ? (
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 16 }}>
                <Feather name="map-pin" size={15} color="#64748b" style={{ marginTop: 2, marginRight: 10 }} />
                <Text style={{ color: "#334155", fontWeight: "500", fontSize: 13, lineHeight: 20, flex: 1 }}>{address}</Text>
              </View>
            ) : null}

            {phone ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)} style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                <Feather name="phone" size={15} color="#64748b" style={{ marginRight: 10 }} />
                <Text style={{ color: "#4f46e5", fontWeight: "600", fontSize: 13 }}>{phone}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={{ width: "100%", paddingVertical: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: "#c7d2fe", borderRadius: 12, alignItems: "center" }}>
              <Text style={{ color: "#4f46e5", fontWeight: "700", fontSize: 14 }}>View Full Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === "ios" ? 32 : 20 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => phone && Linking.openURL(`tel:${phone}`)} style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 16, borderWidth: 2, borderColor: "#e2e8f0", backgroundColor: "#fff" }}>
            <Ionicons name="call" size={18} color="#475569" />
            <Text style={{ color: "#475569", fontWeight: "700", fontSize: 15, marginLeft: 8 }}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)} style={{ flex: 2, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 16, backgroundColor: "#4f46e5" }}>
            <Ionicons name="paper-plane-outline" size={18} color="white" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginLeft: 8 }}>Send Inquiry</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* INQUIRY MODAL (THE FORM) */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '90%' }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#0f172a" }}>Contact Supplier</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4, backgroundColor: "#f1f5f9", borderRadius: 20 }}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", padding: 12, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: "#e2e8f0" }}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={{ width: 60, height: 60, borderRadius: 10 }} contentFit="cover" />
                ) : (
                  <View style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="image" size={24} color="#94a3b8" />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }} numberOfLines={2}>{product.name}</Text>
                  <Text style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{company}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, paddingHorizontal: 16, height: 52, marginBottom: 16, backgroundColor: "#f8fafc" }}>
                <Ionicons name="person-outline" size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput style={{ flex: 1, fontSize: 15, color: "#0f172a" }} placeholder="Your Name *" placeholderTextColor="#94a3b8" value={inqName} onChangeText={setInqName} editable={!isSubmitting} />
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, paddingHorizontal: 16, height: 52, marginBottom: 16, backgroundColor: "#f8fafc" }}>
                <Ionicons name="mail-outline" size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput style={{ flex: 1, fontSize: 15, color: "#0f172a" }} placeholder="Your Email" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" value={inqEmail} onChangeText={setInqEmail} editable={!isSubmitting} />
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, paddingHorizontal: 16, height: 52, marginBottom: 16, backgroundColor: "#f8fafc" }}>
                <Ionicons name="call-outline" size={18} color="#64748b" style={{ marginRight: 12 }} />
                <TextInput style={{ flex: 1, fontSize: 15, color: "#0f172a" }} placeholder="Phone Number *" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={inqPhone} onChangeText={setInqPhone} editable={!isSubmitting} />
              </View>

              <View style={{ flexDirection: "row", alignItems: "flex-start", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, height: 120, marginBottom: 24, backgroundColor: "#f8fafc" }}>
                <Ionicons name="chatbubble-outline" size={18} color="#64748b" style={{ marginRight: 12, marginTop: 2 }} />
                <TextInput style={{ flex: 1, fontSize: 15, color: "#0f172a", textAlignVertical: "top" }} placeholder="Your Message *" placeholderTextColor="#94a3b8" multiline value={inqMessage} onChangeText={setInqMessage} editable={!isSubmitting} />
              </View>

              <TouchableOpacity onPress={handleSendInquiry} disabled={isSubmitting} style={{ backgroundColor: "#1e3a8a", height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", marginBottom: Platform.OS === "ios" ? 20 : 0 }}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Submit Inquiry</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── CUSTOM SUCCESS MODAL ── */}
      <Modal
        animationType="fade"
        transparent
        visible={showSuccessModal}
        statusBarTranslucent
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.55)", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 28, paddingVertical: 36, paddingHorizontal: 28, width: "100%", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.12, shadowRadius: 40, elevation: 12 }}>
            
            {/* Green ring icon */}
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#f0fdf4", borderWidth: 2, borderColor: "#bbf7d0", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="checkmark" size={32} color="#059669" />
              </View>
            </View>

            <Text style={{ fontSize: 22, fontWeight: "800", color: "#0f172a", letterSpacing: -0.5, marginBottom: 10, textAlign: "center" }}>
              Inquiry Sent!
            </Text>
            <Text style={{ fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
              Your request has been successfully sent to the supplier. They will contact you shortly.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowSuccessModal(false)}
              style={{ width: "100%", backgroundColor: "#0f172a", paddingVertical: 15, borderRadius: 16, alignItems: "center" }}
            >
              <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 15, letterSpacing: 0.2 }}>Got it, Thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}