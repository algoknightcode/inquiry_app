import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 🔴 1. IMPORT NATIVE FIREBASE AUTH conditionally for Expo Go
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let auth: any = null;
if (!isExpoGo) {
  try {
    auth = require('@react-native-firebase/auth').default;
  } catch (e) {
    console.log("Firebase Auth skipped in Expo Go");
  }
}

// ── Memoized Input Field (Prevents typing lag) ──
interface InputFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  scale: number;
}

const InputField = React.memo(({ label, required, scale, ...props }: InputFieldProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ marginBottom: 16 * scale }}>
      <Text 
        style={[styles.label, { fontSize: 13 * scale }, focused && styles.labelFocused]}
        maxFontSizeMultiplier={1.2}
      >
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TextInput
        {...props}
        style={[
          styles.input,
          { 
            height: props.multiline ? 120 * scale : 54 * scale,
            fontSize: 15 * scale,
            paddingHorizontal: 16 * scale,
          },
          focused && styles.inputFocused,
          props.multiline && { paddingTop: 16 * scale }
        ]}
        placeholderTextColor="#94A3B8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxFontSizeMultiplier={1.2}
      />
    </View>
  );
});

export default function RequestQuoteForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // --- Responsive Engine ---
  const { width: screenWidth } = useWindowDimensions();
  const scale = useMemo(() => Math.max(0.85, Math.min(1.15, screenWidth / 375)), [screenWidth]);

  // States
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // OTP & Verification States
  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    gstNumber: "",
    phoneNumber: "",
    requirement: "",
  });

  const handleChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage("");
  }, [errorMessage]);

  // --- 1. SEND OTP ---
  const handleSendOTP = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.requirement) {
      setErrorMessage("Please fill all required fields before proceeding.");
      return;
    }
    if (formData.phoneNumber.trim().length !== 10) {
      setErrorMessage("Enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      if (!auth) {
        setErrorMessage("Firebase is not available. Please reinstall the app.");
        setLoading(false);
        return;
      }
      const confirmation = await auth().signInWithPhoneNumber(`+91${formData.phoneNumber}`);
      setConfirm(confirmation);
      setShowOtpBox(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to Send OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VERIFY OTP ---
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setErrorMessage("Please enter a valid OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      if (confirm) {
        await confirm.confirm(otp);
        setIsPhoneVerified(true);
        await submitForm();
      } else {
        setErrorMessage("Please request an OTP first.");
        setLoading(false);
      }
    } catch (error: any) {
      setErrorMessage("Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  // --- 3. SUBMIT FORM TO BACKEND ---
  const submitForm = async () => {
    try {
      const payload = {
        platform: "App Request Quote",
        platformEmail: "lead.inquirybazaar@gmail.com",
        supplierToken: "7303486777",
        name: formData.fullName,
        phone: formData.phoneNumber,
        email: formData.email || "N/A",
        place: "N/A",
        product: "N/A",
        message: `Company Name: ${formData.companyName || "N/A"}\nGST Number: ${formData.gstNumber || "N/A"}\nRequirement: ${formData.requirement}`,
      };

      const res = await fetch("https://brandbnalo.com/api/form/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok || data?.success) {
        const whatsappText = `Hi, I am ${formData.fullName}.\n\nCompany Name: ${formData.companyName || "N/A"}\nGST Number: ${formData.gstNumber || "N/A"}\nEmail: ${formData.email || "N/A"}\nMessage: ${formData.requirement}\nContact: ${formData.phoneNumber}`;
        const waUrl = `whatsapp://send?phone=916306530720&text=${encodeURIComponent(whatsappText)}`;

        setShowModal(true);

        setTimeout(() => {
          Linking.openURL(waUrl).catch((err) => console.error("❌ Failed to open WhatsApp:", err));
        }, 1500);

        setFormData({
          fullName: "", email: "", companyName: "",
          gstNumber: "", phoneNumber: "", requirement: "",
        });
        setOtp("");
        setShowOtpBox(false);
        setConfirm(null);
        setIsPhoneVerified(false);
      } else {
        setErrorMessage("Failed to submit form. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Server error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (!showOtpBox) handleSendOTP();
    else if (!isPhoneVerified) handleVerifyOTP();
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Rigid Navbar */}
      <View style={{ paddingTop: insets.top, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }}>
        <View style={styles.navbar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)");
              }
            }} 
            activeOpacity={0.7} 
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={26} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navbarTitle} maxFontSizeMultiplier={1.2}>Request Quote</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 20 * scale }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ marginBottom: 24 * scale }}>
            <Text style={[styles.title, { fontSize: 30 * scale }]} maxFontSizeMultiplier={1.2}>
              Request a Business Quote
            </Text>
            <Text style={[styles.subtitle, { fontSize: 14 * scale }]} maxFontSizeMultiplier={1.2}>
              Share your requirements with us and our team will provide a customized quotation tailored to your business needs.
            </Text>
          </View>

          {/* Form Content Card */}
          <View style={[styles.card, { padding: 20 * scale, borderRadius: 24 * scale }]}>
            <InputField
              label="Full Name"
              required
              scale={scale}
              placeholder="Your name"
              value={formData.fullName}
              onChangeText={(text) => handleChange("fullName", text)}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="Email"
                  scale={scale}
                  placeholder="name@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Company Name"
                  scale={scale}
                  placeholder="Company name"
                  value={formData.companyName}
                  onChangeText={(text) => handleChange("companyName", text)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="GST Number"
                  scale={scale}
                  placeholder="15-digit GSTIN"
                  autoCapitalize="characters"
                  value={formData.gstNumber}
                  onChangeText={(text) => handleChange("gstNumber", text)}
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Phone Number"
                  required
                  scale={scale}
                  placeholder="10-digit mobile"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleChange("phoneNumber", text.replace(/[^0-9]/g, ""))}
                />
              </View>
            </View>

            <InputField
              label="Business Requirement"
              required
              scale={scale}
              placeholder="Describe your requirements..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.requirement}
              onChangeText={(text) => handleChange("requirement", text)}
            />

            {/* OTP BOX */}
            {showOtpBox && !isPhoneVerified && (
              <View style={[styles.otpContainer, { padding: 16 * scale, marginBottom: 16 * scale }]}>
                <Text style={[styles.otpLabel, { fontSize: 13 * scale }]} maxFontSizeMultiplier={1.2}>
                  Enter OTP sent to +91 {formData.phoneNumber}
                </Text>
                <TextInput
                  style={[styles.otpInput, { height: 56 * scale, fontSize: 24 * scale }]}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, ""));
                    setErrorMessage("");
                  }}
                  maxFontSizeMultiplier={1} // Prevent massive OTP text
                />
              </View>
            )}

            {/* Error Message */}
            {errorMessage ? (
              <View style={[styles.errorBox, { marginBottom: 16 * scale }]}>
                <Text style={[styles.errorText, { fontSize: 13 * scale }]} maxFontSizeMultiplier={1.2}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Action Trigger Button (Rigid Height) */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { height: 56 * scale, marginTop: 6 * scale },
                showOtpBox ? styles.submitButtonOtp : null,
                loading && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleAction}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={[styles.buttonText, { fontSize: 15 * scale }]} maxFontSizeMultiplier={1.2}>
                    {showOtpBox ? "Verifying..." : "Processing..."}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.buttonText, { fontSize: 15 * scale }]} maxFontSizeMultiplier={1.2}>
                  {!showOtpBox ? "Send OTP" : "Verify & Submit"}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={[styles.secureText, { fontSize: 11 * scale, marginTop: 20 * scale }]} maxFontSizeMultiplier={1.2}>
              🔒 All submitted information is encrypted and handled securely.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS MODAL POPUP */}
      <Modal visible={showModal} transparent={true} animationType="fade" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { padding: 28 * scale, borderRadius: 24 * scale }]}>
            <View style={[styles.successIconBadge, { width: 56 * scale, height: 56 * scale, borderRadius: 28 * scale, marginBottom: 20 * scale }]}>
              <Text style={[styles.successIconText, { fontSize: 24 * scale }]}>✓</Text>
            </View>
            <Text style={[styles.modalTitle, { fontSize: 20 * scale }]} maxFontSizeMultiplier={1.2}>Request Submitted</Text>
            <Text style={[styles.modalBody, { fontSize: 13 * scale, marginBottom: 24 * scale }]} maxFontSizeMultiplier={1.2}>
              Thank you! Redirecting you to WhatsApp to connect with our corporate team...
            </Text>
            <TouchableOpacity
              style={[styles.modalCloseButton, { height: 50 * scale }]}
              activeOpacity={0.8}
              onPress={() => setShowModal(false)}
            >
              <Text style={[styles.modalCloseButtonText, { fontSize: 14 * scale }]} maxFontSizeMultiplier={1.2}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- Styles (Rigid architecture foundations) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FA" },
  container: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 30 },
  title: { fontWeight: "800", color: "#0F172A", marginBottom: 8, fontFamily: "PlusJakartaSans-ExtraBold" },
  subtitle: { lineHeight: 22, color: "#64748B", fontFamily: "PlusJakartaSans-Medium" },
  card: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 5,
  },
  row: { flexDirection: "row", gap: 12 },
  halfInput: { flex: 1 },
  label: { fontWeight: "600", color: "#475569", marginBottom: 8, fontFamily: "PlusJakartaSans-Bold" },
  labelFocused: { color: "#1E40AF" },
  required: { color: "#EF4444" },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    color: "#0F172A",
    fontFamily: "PlusJakartaSans-Medium",
  },
  inputFocused: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  otpContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
  },
  otpLabel: { color: "#166534", fontWeight: "600", marginBottom: 12, fontFamily: "PlusJakartaSans-Bold" },
  otpInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#22C55E",
    borderRadius: 12,
    letterSpacing: 8,
    textAlign: "center",
    color: "#0F172A",
    width: "80%",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#1A365D",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonOtp: { backgroundColor: "#16A34A" },
  buttonDisabled: { opacity: 0.7 },
  loaderContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontFamily: "PlusJakartaSans-Bold" },
  errorBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: { color: "#991B1B", textAlign: "center", fontWeight: "600", fontFamily: "PlusJakartaSans-Medium" },
  secureText: { textAlign: "center", color: "#94A3B8", fontFamily: "PlusJakartaSans-Medium" },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "center", alignItems: "center", padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF", width: "100%", maxWidth: 340, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8,
  },
  successIconBadge: { backgroundColor: "#DCFCE7", justifyContent: "center", alignItems: "center" },
  successIconText: { color: "#15803D", fontWeight: "700" },
  modalTitle: { fontWeight: "800", color: "#0F172A", marginBottom: 10, textAlign: "center", fontFamily: "PlusJakartaSans-ExtraBold" },
  modalBody: { lineHeight: 22, color: "#64748B", textAlign: "center", fontFamily: "PlusJakartaSans-Medium" },
  modalCloseButton: {
    backgroundColor: "#1A365D", width: "100%", borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  modalCloseButtonText: { color: "#FFFFFF", fontWeight: "700", fontFamily: "PlusJakartaSans-Bold" },
  navbar: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", paddingHorizontal: 8 },
  backButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  navbarTitle: { fontSize: 17, fontWeight: "700", color: "#0F172A", fontFamily: "PlusJakartaSans-Bold" },
});