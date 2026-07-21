import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

interface EnquiryModalProps {
  visible: boolean;
  onClose: () => void;
  product: any;
}

export default function EnquiryModal({ visible, onClose, product }: EnquiryModalProps) {
  const [inqName, setInqName] = useState("");
  const [inqEmail, setInqEmail] = useState("");
  const [inqPhone, setInqPhone] = useState("");
  const [inqMessage, setInqMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; message?: string }>({});

  // Pre-fill fields if buyer/user info is stored
  useEffect(() => {
    const prefillData = async () => {
      try {
        const storedName = await AsyncStorage.getItem("userName") || await AsyncStorage.getItem("supplierName");
        const storedPhone = await AsyncStorage.getItem("userPhone") || await AsyncStorage.getItem("supplierPhone");
        const storedEmail = await AsyncStorage.getItem("userEmail") || await AsyncStorage.getItem("supplierEmail");
        
        if (storedName) setInqName(storedName);
        if (storedPhone) {
          const digits = storedPhone.replace(/[^\d]/g, '');
          setInqPhone(digits);
        }
        if (storedEmail) setInqEmail(storedEmail);
      } catch (e) {
        console.log("Error reading prefill info", e);
      }
    };
    if (visible) {
      prefillData();
      setErrors({}); // Clear any prior errors on open
    }
  }, [visible]);

  if (!product) return null;

  const primaryImage = product.media && product.media.length > 0
    ? (product.media.find((m: any) => m.isPrimary) || product.media[0]).url
    : null;

  const companyName = product.supplier?.business?.companyName || product.supplier?.name || "Verified Supplier";

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!inqName.trim()) {
      newErrors.name = "Name is required";
    } else if (inqName.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!inqPhone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const cleanPhone = inqPhone.trim().replace(/[^\d]/g, '');
      if (cleanPhone.length !== 10) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        newErrors.phone = "Please enter a valid mobile number";
      }
    }

    if (!inqEmail.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inqEmail.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!inqMessage.trim()) {
      newErrors.message = "Message is required";
    } else if (inqMessage.trim().length < 5) {
      newErrors.message = "Message must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendInquiry = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const buyerId = await AsyncStorage.getItem("buyerId");
      const supplierId = await AsyncStorage.getItem("supplierId");
      const globalUserId = buyerId || supplierId;

      let supToken = typeof product.supplier === "string" 
        ? product.supplier 
        : (product.supplier?._id);

      if (!supToken && globalUserId) {
        supToken = globalUserId;
      }

      const resolvedCompany = product.supplier?.business?.companyName || product.supplier?.name || "Supplier";

      const payload = {
        supplierToken: supToken || "NA",
        platform: `App - ${resolvedCompany}`,
        platformEmail: product.supplier?.email || "lead.inquirybazaar@gmail.com",
        name: inqName,
        email: inqEmail || "NA",
        company: "NA",
        phone: inqPhone,
        product: product.name || "NA",
        place: "NA",
        message: inqMessage,
      };

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
      console.log("📥 Response Status:", res.status);

      if (res.ok) {
        onClose();
        setShowSuccessModal(true);
        // Reset message field
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
      console.error("Error sending inquiry:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBg}>
          <View style={styles.sheetContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Contact Supplier</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.productCard}>
                {primaryImage ? (
                  <Image source={{ uri: primaryImage }} style={styles.productImage} contentFit="cover" />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Ionicons name="image" size={24} color="#94a3b8" />
                  </View>
                )}
                <View style={styles.productTextWrapper}>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.companyName} numberOfLines={1}>{companyName}</Text>
                </View>
              </View>

              <View style={[styles.inputWrapper, errors.name ? styles.inputWrapperError : null]}>
                <Ionicons name="person-outline" size={18} color={errors.name ? "#ef4444" : "#64748b"} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Your Name *" placeholderTextColor="#94a3b8" value={inqName} onChangeText={(t) => { setInqName(t); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })); }} />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

              <View style={[styles.inputWrapper, errors.email ? styles.inputWrapperError : null]}>
                <Ionicons name="mail-outline" size={18} color={errors.email ? "#ef4444" : "#64748b"} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Your Email" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" value={inqEmail} onChangeText={(t) => { setInqEmail(t); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }} />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              <View style={[styles.inputWrapper, errors.phone ? styles.inputWrapperError : null]}>
                <Ionicons name="call-outline" size={18} color={errors.phone ? "#ef4444" : "#64748b"} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Phone Number *" placeholderTextColor="#94a3b8" keyboardType="phone-pad" value={inqPhone} onChangeText={(t) => { setInqPhone(t); if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined })); }} maxLength={10} />
              </View>
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

              <View style={[styles.inputWrapper, styles.multilineWrapper, errors.message ? styles.inputWrapperError : null]}>
                <Ionicons name="chatbubble-outline" size={18} color={errors.message ? "#ef4444" : "#64748b"} style={[styles.icon, { marginTop: 2 }]} />
                <TextInput style={[styles.input, styles.multilineInput]} placeholder="Your Message *" placeholderTextColor="#94a3b8" multiline value={inqMessage} onChangeText={(t) => { setInqMessage(t); if (errors.message) setErrors(prev => ({ ...prev, message: undefined })); }} />
              </View>
              {errors.message ? <Text style={[styles.errorText, { marginTop: -8, marginBottom: 16 }]}>{errors.message}</Text> : null}

              <TouchableOpacity onPress={handleSendInquiry} disabled={isSubmitting} style={styles.submitBtn}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Inquiry</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal
        animationType="fade"
        transparent
        visible={showSuccessModal}
        statusBarTranslucent
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successBg}>
          <View style={styles.successCard}>
            <View style={styles.successIconWrapper}>
              <View style={styles.successIconInner}>
                <Ionicons name="checkmark" size={32} color="#059669" />
              </View>
            </View>

            <Text style={styles.successTitle}>Inquiry Sent!</Text>
            <Text style={styles.successDesc}>
              Your request has been successfully sent to the supplier. They will contact you shortly.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowSuccessModal(false)}
              style={styles.successBtn}
            >
              <Text style={styles.successBtnText}>Got it, Thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  sheetContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "90%"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a"
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 20
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 40 : 20
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center"
  },
  productTextWrapper: {
    flex: 1,
    marginLeft: 12
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a"
  },
  companyName: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    backgroundColor: "#f8fafc"
  },
  icon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a"
  },
  multilineWrapper: {
    alignItems: "flex-start",
    paddingVertical: 16,
    height: 120,
    marginBottom: 24
  },
  multilineInput: {
    textAlignVertical: "top",
    height: "100%"
  },
  submitBtn: {
    backgroundColor: "#1e3a8a",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700"
  },
  successBg: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32
  },
  successCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 12
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0fdf4",
    borderWidth: 2,
    borderColor: "#bbf7d0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  successIconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center"
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: "center"
  },
  successDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28
  },
  successBtn: {
    width: "100%",
    backgroundColor: "#0f172a",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center"
  },
  successBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2
  },
  inputWrapperError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5"
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "600",
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 16
  }
});
