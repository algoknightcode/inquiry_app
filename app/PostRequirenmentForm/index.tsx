import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

interface InputFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, focused && styles.labelFocused]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <TextInput
        {...props}
        style={[
          styles.input,
          focused && styles.inputFocused,
          props.multiline && styles.textArea,
        ]}
        placeholderTextColor="#94A3B8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

export default function RequestQuoteForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // OTP & Verification States
  const [otp, setOtp] = useState("");
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  // Store Firebase's confirmation object
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    gstNumber: "",
    phoneNumber: "",
    requirement: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(""); // Clear errors on typing
  };

  // --- 1. SEND OTP (NO CAPTCHA) ---
  const handleSendOTP = async () => {
    console.log("🚀 [OTP] Starting handleSendOTP flow...");
    if (!formData.fullName || !formData.phoneNumber || !formData.requirement) {
      console.log("⚠️ [OTP] Missing required fields:", { fullName: !!formData.fullName, phoneNumber: !!formData.phoneNumber, requirement: !!formData.requirement });
      setErrorMessage("Please fill all required fields before proceeding.");
      return;
    }
    if (formData.phoneNumber.trim().length !== 10) {
      console.log("⚠️ [OTP] Invalid phone number length:", formData.phoneNumber);
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
      console.log(`📤 [OTP] Requesting SMS OTP for: +91${formData.phoneNumber}`);
      const confirmation = await auth().signInWithPhoneNumber(`+91${formData.phoneNumber}`);
      console.log("📥 [OTP] Firebase confirmation object received:", confirmation ? "SUCCESS" : "EMPTY");
      setConfirm(confirmation);
      setShowOtpBox(true);
    } catch (error: any) {
      console.error("❌ [OTP] Firebase Auth Error:", error);
      setErrorMessage(error?.message || "Failed to Send OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VERIFY OTP ---
  const handleVerifyOTP = async () => {
    console.log("🚀 [OTP] Starting handleVerifyOTP flow...");
    if (!otp || otp.length < 4) {
      console.log("⚠️ [OTP] Invalid OTP length entered:", otp);
      setErrorMessage("Please enter a valid OTP.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      if (confirm) {
        console.log(`📤 [OTP] Verifying code: "${otp}"`);
        const userCredential = await confirm.confirm(otp);
        console.log("📥 [OTP] Verification successful! User credential:", userCredential?.user?.uid);
        setIsPhoneVerified(true);
        // Proceed directly to submit form after successful verification
        await submitForm();
      } else {
        console.error("❌ [OTP] No confirmation object found.");
        setErrorMessage("Please request an OTP first.");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("❌ [OTP] OTP Verification Error:", error);
      setErrorMessage("Invalid OTP. Please try again.");
      setLoading(false);
    }
  };

  // --- 3. SUBMIT FORM TO BACKEND ---
  const submitForm = async () => {
    console.log("🚀 [API] Starting submitForm flow...");
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

      console.log("📤 [API] Sending payload to backend:", JSON.stringify(payload, null, 2));

      const res = await fetch("https://brandbnalo.com/api/form/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📥 [API] Response status:", res.status);
      const data = await res.json();
      console.log("📥 [API] Response JSON:", JSON.stringify(data, null, 2));

      if (res.ok || data?.success) {
        console.log("✅ [API] Form submitted successfully!");
        // Format text for WhatsApp redirection
        const whatsappText = `Hi, I am ${formData.fullName}.\n\nCompany Name: ${formData.companyName || "N/A"}\nGST Number: ${formData.gstNumber || "N/A"}\nEmail: ${formData.email || "N/A"}\nMessage: ${formData.requirement}\nContact: ${formData.phoneNumber}`;
        const waUrl = `whatsapp://send?phone=916306530720&text=${encodeURIComponent(whatsappText)}`;

        setShowModal(true);

        // Redirect to WhatsApp after 1.5 seconds
        setTimeout(() => {
          console.log("🔗 [Redirect] Opening WhatsApp...");
          Linking.openURL(waUrl).catch((err) => console.error("❌ [Redirect] Failed to open WhatsApp:", err));
        }, 1500);

        // Reset form
        setFormData({
          fullName: "", email: "", companyName: "",
          gstNumber: "", phoneNumber: "", requirement: "",
        });
        setOtp("");
        setShowOtpBox(false);
        setConfirm(null);
        setIsPhoneVerified(false);
      } else {
        console.error("❌ [API] Backend failed to process submission:", data?.message);
        setErrorMessage("Failed to submit form. Please try again.");
      }
    } catch (error) {
      console.error("❌ [API] Server error during submission:", error);
      setErrorMessage("Server error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION BUTTON ROUTER ---
  const handleAction = () => {
    if (!showOtpBox) {
      handleSendOTP();
    } else if (!isPhoneVerified) {
      handleVerifyOTP();
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navbar */}
      <View style={{ paddingTop: insets.top, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }}>
        <View style={styles.navbar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={26} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.navbarTitle}>Request Quote</Text>
          <View style={{ width: 44 }} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Request a Business Quote</Text>
            <Text style={styles.subtitle}>
              Share your requirements with us and our team will provide a customized quotation tailored to your business needs.
            </Text>
          </View>

          {/* Form Content Card */}
          <View style={styles.card}>
            <InputField
              label="Full Name"
              required
              placeholder="Your name"
              value={formData.fullName}
              onChangeText={(text) => handleChange("fullName", text)}
              editable={!loading && !showOtpBox}
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="Email"
                  placeholder="name@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                  editable={!loading && !showOtpBox}
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Company Name"
                  placeholder="Company name"
                  value={formData.companyName}
                  onChangeText={(text) => handleChange("companyName", text)}
                  editable={!loading && !showOtpBox}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <InputField
                  label="GST Number"
                  placeholder="15-digit GSTIN"
                  autoCapitalize="characters"
                  value={formData.gstNumber}
                  onChangeText={(text) => handleChange("gstNumber", text)}
                  editable={!loading && !showOtpBox}
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  label="Phone Number"
                  required
                  placeholder="10-digit mobile"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChangeText={(text) => handleChange("phoneNumber", text.replace(/[^0-9]/g, ""))}
                  editable={!loading && !showOtpBox}
                />
              </View>
            </View>

            <InputField
              label="Business Requirement"
              required
              placeholder="Describe your requirements..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.requirement}
              onChangeText={(text) => handleChange("requirement", text)}
              editable={!loading && !showOtpBox}
            />

            {/* OTP BOX (Visible only after sending OTP) */}
            {showOtpBox && !isPhoneVerified && (
              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>Enter OTP sent to +91 {formData.phoneNumber}</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, ""));
                    setErrorMessage("");
                  }}
                  editable={!loading}
                />
              </View>
            )}

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Action Trigger Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                showOtpBox ? styles.submitButtonOtp : null,
                loading && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleAction}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.buttonText}>
                    {showOtpBox ? "Verifying..." : "Processing..."}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  {!showOtpBox ? "Send OTP" : "Verify & Submit"}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.secureText}>
              🔒 All submitted information is encrypted and handled securely.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS MODAL POPUP */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.successIconBadge}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Request Submitted</Text>
            <Text style={styles.modalBody}>
              Thank you! Redirecting you to WhatsApp to connect with our corporate team...
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              activeOpacity={0.8}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  labelFocused: {
    color: "#1E40AF",
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 15,
    color: "#0F172A",
  },
  inputFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  textArea: {
    minHeight: 110,
    paddingTop: 16,
  },
  otpContainer: {
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 16,
    alignItems: "center",
  },
  otpLabel: {
    color: "#166534",
    fontWeight: "600",
    marginBottom: 12,
    fontSize: 14,
  },
  otpInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 24,
    letterSpacing: 8,
    textAlign: "center",
    color: "#0F172A",
    width: "80%",
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#1A365D",
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  submitButtonOtp: {
    backgroundColor: "#16A34A",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorBox: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  secureText: {
    textAlign: "center",
    marginTop: 20,
    color: "#94A3B8",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)", 
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  successIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successIconText: {
    color: "#15803D",
    fontSize: 24,
    fontWeight: "700",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    textAlign: "center",
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },
  modalCloseButton: {
    backgroundColor: "#1A365D",
    width: "100%",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  navbar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  navbarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
});