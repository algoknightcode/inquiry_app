import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

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
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    gstNumber: "",
    phoneNumber: "",
    requirement: "",
  });

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.requirement
    ) {
      setErrorMessage("Please fill all required fields before proceeding.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      // Simulate API verification call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Beautiful clean console log printing all key fields explicitly
      console.log('\n========================================');
      console.log('🚀 NEW QUOTE REQUEST LOGGED');
      console.log('========================================');
      console.log(JSON.stringify(formData, null, 2));
      console.log('========================================\n');

      // Trigger the custom feedback modal window
      setShowModal(true);

      // Clean form inputs completely
      setFormData({
        fullName: "",
        email: "",
        companyName: "",
        gstNumber: "",
        phoneNumber: "",
        requirement: "",
      });
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F7FA"
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Request a Business Quote
            </Text>
            <Text style={styles.subtitle}>
              Share your requirements with us and our team will provide a customized quotation tailored to your business needs.
            </Text>
          </View>

          {/* Form Content Card Layout */}
          <View style={styles.card}>
            <InputField
              label="Full Name"
              required
              placeholder="Your name"
              value={formData.fullName}
              onChangeText={(text) => handleChange("fullName", text)}
            />

            <InputField
              label="Email Address"
              placeholder="name@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
            />

            <InputField
              label="Company Name"
              placeholder="Company name"
              value={formData.companyName}
              onChangeText={(text) => handleChange("companyName", text)}
            />

            <InputField
              label="GST Number"
              placeholder="15-digit GSTIN"
              autoCapitalize="characters"
              value={formData.gstNumber}
              onChangeText={(text) => handleChange("gstNumber", text)}
            />

            <InputField
              label="Phone Number"
              required
              placeholder="Mobile number"
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange("phoneNumber", text)}
            />

            <InputField
              label="Business Requirement"
              required
              placeholder="Describe your requirements..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={formData.requirement}
              onChangeText={(text) => handleChange("requirement", text)}
            />

            {/* Form Error Handling Message block */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Action Trigger Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.buttonDisabled,
              ]}
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.buttonText}>Sending Request...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Send OTP & Continue</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.secureText}>
              🔒 All submitted information is encrypted and handled securely.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS MODAL POPUP WRAPPER */}
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
              Thank you! Your request has been logged successfully. Our corporate team will contact you shortly.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              activeOpacity={0.8}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    paddingVertical: 30,
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
  inputGroup: {
    marginBottom: 18,
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
    paddingVertical: 16,
    fontSize: 15,
    color: "#0F172A",
  },
  inputFocused: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  textArea: {
    minHeight: 130,
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: "#1A365D",
    borderRadius: 16,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.8,
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
  /* MODAL ARCHITECTURE STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // Frosted backdrop glass alpha
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
});