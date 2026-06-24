import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LeadGenCard() {
  const [productName, setProductName] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const phoneInputRef = useRef<TextInput>(null);
  const productInputRef = useRef<TextInput>(null);

  // Validation check
  const isFormValid = mobile.length === 10 && productName.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid || isLoading) return;
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      // Prepare the payload exactly as required by the backend schema
      const payload = {
        supplierToken: "7303486777",
        platform: "App Home Page",
        platformEmail: "lead.inquirybazaar@gmail.com",
        name: "Home Page Buyer - APP",
        phone: mobile,
        email: "lead.inquirybazaar@gmail.com",
        product: productName.trim(),
        place: "Delhi, India",
        message: `We need help with ${productName.trim()}`,
      };

      console.log("Submitting Payload:", payload);

      // Make the API call
      const response = await fetch("https://brandbnalo.com/api/form/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Lead Gen Raw Response:", responseText);

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned invalid response (${response.status}): ${responseText.slice(0, 150)}`);
      }

      if (response.ok) {
        // Success! Show modal and clear form
        setShowModal(true);
        setMobile("");
        setProductName("");
      } else {
        Alert.alert("Submission Failed", data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Lead Gen Error:", error);
      Alert.alert("Network Error", "Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.outer}>
      <View style={styles.card}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="search" size={18} color="#2563eb" />
          </View>
          <Text style={styles.headingText}>
            Looking for a <Text style={styles.headingBlue}>Product?</Text>
          </Text>
        </View>

        <Text style={styles.subText}>
          Tell us what you need, and we'll instantly connect you with verified wholesale sellers.
        </Text>

        {/* --- Product Input --- */}
        <Text style={styles.label}>
          Product Name <Text style={{ color: "#ef4444" }}>*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => productInputRef.current?.focus()}
          style={styles.inputWrapper}
        >
          <Ionicons name="cube-outline" size={20} color="#64748b" style={styles.inputIcon} />
          <TextInput
            ref={productInputRef}
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g. Diesel Generator"
            placeholderTextColor="#94a3b8"
            editable={!isLoading}
            style={styles.textInput}
            selectionColor="#2563eb"
          />
        </TouchableOpacity>

        {/* --- Mobile Input --- */}
        <Text style={styles.label}>
          Mobile Number <Text style={{ color: "#ef4444" }}>*</Text>
        </Text>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => phoneInputRef.current?.focus()}
          style={styles.inputWrapper}
        >
          <Text style={styles.countryCode}>+91</Text>
          <View style={styles.divider} />
          <TextInput
            ref={phoneInputRef}
            value={mobile}
            onChangeText={setMobile}
            placeholder="Enter 10-digit number"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            maxLength={10}
            editable={!isLoading}
            style={styles.textInput}
            selectionColor="#2563eb"
          />
          {mobile.length === 10 && (
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={14} color="#16a34a" />
            </View>
          )}
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={!isFormValid || isLoading}
          style={[
            styles.button,
            { backgroundColor: isFormValid ? "#2563eb" : "#1e293b" },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.buttonText}>Get Verified Sellers</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Success Modal ───────────────────────────────── */}
      <Modal
        animationType="fade"
        transparent
        visible={showModal}
        statusBarTranslucent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {/* Green ring icon */}
            <View style={styles.successRing}>
              <View style={styles.successInner}>
                <Ionicons name="checkmark" size={32} color="#059669" />
              </View>
            </View>

            <Text style={styles.modalTitle}>We'll Be in Touch!</Text>
            <Text style={styles.modalBody}>
              Your request has been received. Our team will contact you shortly with the best verified wholesale sellers.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowModal(false)}
              style={styles.okayBtn}
            >
              <Text style={styles.okayText}>Got it, Thanks!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 20,
    backgroundColor: "#f8fafc",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    backgroundColor: "#dbeafe",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  headingText: {
    flex: 1,
    fontSize: 20,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  headingBlue: {
    color: "#2563eb",
  },
  subText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: {
    marginRight: 12,
  },
  countryCode: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#475569",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#cbd5e1",
    marginHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#0f172a",
    height: "100%",
  },
  checkBadge: {
    marginLeft: 8,
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 4,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
    marginTop: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 16,
  },

  // ── Modal ──────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
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
    elevation: 12,
  },
  successRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0fdf4",
    borderWidth: 2,
    borderColor: "#bbf7d0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  successInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: "PlusJakartaSans-Bold",
    color: "#0f172a",
    letterSpacing: -0.5,
    marginBottom: 10,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans",
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  okayBtn: {
    width: "100%",
    backgroundColor: "#0f172a",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  okayText: {
    color: "#ffffff",
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15,
    letterSpacing: 0.2,
  },
});