import EnquiryModal from "@/components/EnquiryModal";
import { productCache } from "@/utils/productCache";
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Linking,
    ScrollView,
    Share,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProductDetailPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId, slug } = useLocalSearchParams<{ productId?: string; slug?: string }>();

  // --- STATES ---
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<any>(() => {
    return productId ? productCache[productId as string] : null;
  });

  // --- INQUIRY MODAL STATES ---
  const [isModalVisible, setModalVisible] = useState(false);

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

  // Handle product sharing
  const handleShare = async () => {
    if (!product) return;
    try {
      const priceStr = product.priceType === "on_request" || !product.price
        ? "Price on Request"
        : `₹${product.price.toLocaleString()}`;
      
      const shareMessage = `Check out this product on InquiryBazaar:\n\n${product.name}\nPrice: ${priceStr}\n\nLink: https://dir.inquirybazaar.com/products/${product.slug}`;
      
      await Share.share({
        message: shareMessage,
      });
    } catch (err) {
      console.error("Error sharing product:", err);
    }
  };

  // Fetch full details from backend using Promise.race for speed
  React.useEffect(() => {
    if (!productId && !slug) return;

    const fetchFullDetails = async () => {
      // Prioritize cached data
      if (productId && productCache[productId]) {
        setProduct(productCache[productId]);
      }

      // Try multiple endpoints in parallel and use first successful response
      const urls = [
        `https://backend.inquirybazaar.com/api/products/${productId}`,
        `https://backend.inquirybazaar.com/api/products/single/${productId}`,
        `https://backend.inquirybazaar.com/api/product/${productId}`,
        `https://backend.inquirybazaar.com/api/products/slug/${slug}`,
      ];

      try {
        // Race: first successful fetch wins
        const result = await Promise.race(
          urls.map((url) =>
            fetch(url)
              .then((res) => {
                if (!res.ok) throw new Error(`${res.status}`);
                return res.json();
              })
              .then((json) => {
                if (json.success && json.data) return json.data;
                throw new Error("No data");
              })
          )
        );

        if (result) {
          setProduct(result);
          if (productId) {
            productCache[productId] = result;
          }
        }
      } catch (e) {
        console.log("Could not fetch product details from any endpoint", e);
      }
    };

    fetchFullDetails();
  }, [productId, slug]);



  // ── Helpers ──────────────────────────────────────────────────────────────
  const getPrimaryImage = (media: any[]) => {
    if (!media || media.length === 0) return null;
    return (media.find((m: any) => m.isPrimary) || media[0])?.url || null;
  };

  const openWhatsApp = () => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = `Hello, I am interested in your product: ${product.name} listed on Inquiry Bazaar.\n\nLink: https://dir.inquirybazaar.com/products/${product.slug}`;
    const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
      }
    }).catch(() => {
      Linking.openURL(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`);
    });
  };

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingTop: insets.top }}>
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
      </View>
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

  const plainTextDescription = product.description
    ? (product.description as string)
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim()
    : "";
  const hasDescription = plainTextDescription.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── HEADER ── */}
      <View style={{ backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" }}>
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
          <TouchableOpacity onPress={handleShare} style={{ padding: 4 }} activeOpacity={0.7}>
            <Ionicons name="share-social-outline" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }} contentContainerStyle={{ paddingBottom: insets.bottom + 70 }} showsVerticalScrollIndicator={false}>
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
            <MaterialCommunityIcons name="domain" size={18} color="#64748b" />
            <Text style={{ color: "#475569", fontWeight: "600", fontSize: 16 }} numberOfLines={1}>{company}</Text>
            {(city || state) ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Ionicons name="location-outline" size={14} color="#64748b" />
                <Text style={{ color: "#64748b", fontSize: 14, marginLeft: 2 }}>{[city, state].filter(Boolean).join(", ")}</Text>
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
              <Text style={{ color: "#64748b", fontSize: 16, marginLeft: 6, marginBottom: 4 }}>/ {product.unit}</Text>
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
                <MaterialCommunityIcons name="package-variant" size={15} color="#475569" />
                <Text style={{ color: "#475569", fontWeight: "600", fontSize: 14, marginLeft: 6 }}>MOQ: {product.minOrderQty} {product.unit}</Text>
              </View>
            ) : null}
            {product.deliveryTime ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <Ionicons name="time-outline" size={15} color="#475569" />
                <Text style={{ color: "#475569", fontWeight: "600", fontSize: 14, marginLeft: 6 }}>{product.deliveryTime}</Text>
              </View>
            ) : null}
            {product.supplyAbility ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <MaterialCommunityIcons name="check-circle-outline" size={15} color="#16a34a" />
                <Text style={{ color: "#15803d", fontWeight: "600", fontSize: 14, marginLeft: 6 }}>{product.supplyAbility}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* DESCRIPTION */}
        {hasDescription ? (
          <View style={{ marginTop: 0, borderTopWidth: 1, borderTopColor: "#f1f5f9", backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 28 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#0f172a", marginBottom: 16 }}>Product Description</Text>
            <Text style={{ color: "#475569", fontSize: 16, lineHeight: 26, fontWeight: "400" }}>{plainTextDescription}</Text>
          </View>
        ) : null}

        {/* SPECIFICATIONS */}
        {specs.length > 0 ? (
          <View style={{ marginTop: hasDescription ? 0 : 12, borderTopWidth: hasDescription ? 1 : 0, borderTopColor: "#f1f5f9", backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 32 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#0f172a", marginBottom: 20 }}>Specifications & Details</Text>
            <View style={{ borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
              {specs.map((spec, idx) => (
                <View key={idx} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: idx % 2 === 0 ? "#fff" : "#f8fafc", borderBottomWidth: idx === specs.length - 1 ? 0 : 1, borderBottomColor: "#e2e8f0" }}>
                  <Text style={{ color: "#64748b", fontWeight: "600", fontSize: 15, flex: 1, marginRight: 8 }}>{spec.key}</Text>
                  <Text style={{ color: "#0f172a", fontWeight: "600", fontSize: 15, flex: 1.5, textAlign: "right" }}>{spec.value}</Text>
                </View>
              ))}
            </View>

            {product.packagingDetails ? (
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }}>
                <MaterialCommunityIcons name="package-variant-closed" size={18} color="#64748b" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: "#94a3b8", fontWeight: "700", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Packaging</Text>
                  <Text style={{ color: "#334155", fontWeight: "600", fontSize: 15, marginTop: 2 }}>{product.packagingDetails}</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* SUPPLIER */}
        <View style={{ marginTop: (hasDescription || specs.length > 0) ? 0 : 12, borderTopWidth: (hasDescription || specs.length > 0) ? 1 : 0, borderTopColor: "#f1f5f9", backgroundColor: "#fff", paddingHorizontal: 24, paddingVertical: 32, marginBottom: 24 }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: "#0f172a", marginBottom: 20 }}>Supplier Details</Text>
          <View style={{ backgroundColor: "#f0f7ff", borderWidth: 1, borderColor: "#bfdbfe", borderRadius: 20, padding: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#bfdbfe" }}>
              {product.supplier?.profileImage ? (
                <Image source={{ uri: product.supplier.profileImage }} style={{ width: 52, height: 52, borderRadius: 26, marginRight: 14 }} contentFit="cover" />
              ) : (
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <MaterialCommunityIcons name="domain" size={24} color="#2563eb" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 2 }}>
                  <Text style={{ color: "#0f172a", fontWeight: "800", fontSize: 18, flexShrink: 1 }} numberOfLines={1}>{company}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#dcfce7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
                    <Text style={{ color: "#15803d", fontSize: 10, fontWeight: "700", marginLeft: 2 }}>VERIFIED</Text>
                  </View>
                </View>
                {businessType ? <Text style={{ color: "#475569", fontWeight: "600", fontSize: 15 }}>{businessType}</Text> : null}
              </View>
            </View>

            {address ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Feather name="map-pin" size={13} color="#0284c7" />
                </View>
                <Text style={{ color: "#334155", fontWeight: "500", fontSize: 16, lineHeight: 22, flex: 1 }}>{address}</Text>
              </View>
            ) : null}

            {phone ? (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${phone}`)} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <Feather name="phone" size={13} color="#15803d" />
                  </View>
                  <Text style={{ color: "#2563eb", fontWeight: "700", fontSize: 16 }}>{phone}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={openWhatsApp}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#e8f5e9", borderWidth: 1, borderColor: "#a5d6a7", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 }}
                >
                  <FontAwesome name="whatsapp" size={16} color="#25D366" />
                  <Text style={{ color: "#1b5e20", fontWeight: "700", fontSize: 12 }}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => phone && Linking.openURL(`tel:${phone}`)}
                style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: "#bfdbfe", backgroundColor: "#fff" }}
              >
                <Ionicons name="call" size={18} color="#2563eb" />
                <Text style={{ color: "#2563eb", fontWeight: "700", fontSize: 14, marginLeft: 8 }}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={{ flex: 2, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderRadius: 12, backgroundColor: "#2563eb" }}
              >
                <Ionicons name="paper-plane-outline" size={18} color="white" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 8 }}>Inquiry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BAR */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingHorizontal: 20, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 10) }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity onPress={() => phone && Linking.openURL(`tel:${phone}`)} style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 2, borderColor: "#e2e8f0", backgroundColor: "#fff" }}>
            <Ionicons name="call" size={18} color="#475569" />
            <Text style={{ color: "#475569", fontWeight: "700", fontSize: 15, marginLeft: 8 }}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)} style={{ flex: 2, flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 12, borderRadius: 12, backgroundColor: "#4f46e5" }}>
            <Ionicons name="paper-plane-outline" size={18} color="white" />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginLeft: 8 }}>Send Inquiry</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* INQUIRY MODAL */}
      <EnquiryModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        product={product}
      />

    </View>
  );
}