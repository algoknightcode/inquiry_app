import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const PostRFQ = () => {
  const insets = useSafeAreaInsets();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [requirement, setRequirement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [originalSize, setOriginalSize] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);

  // --- IMAGE PICKER ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow camera roll permissions to upload a photo.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const originalUri = result.assets[0].uri;
      setOriginalSize(null);
      setCompressedSize(null);
      setCompressionProgress(10);

      const interval = setInterval(() => {
        setCompressionProgress((prev) => {
          if (prev === null || prev >= 90) return prev;
          return prev + 10;
        });
      }, 80);

      try {
        const origFileInfo = await FileSystem.getInfoAsync(originalUri);
        if (origFileInfo.exists && origFileInfo.size) {
          const origSizeMB = (origFileInfo.size / 1024 / 1024).toFixed(2);
          setOriginalSize(`${origSizeMB} MB`);
        }

        const manipResult = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 800 } }],
          { compress: 0.4, format: ImageManipulator.SaveFormat.WEBP }
        );

        const compFileInfo = await FileSystem.getInfoAsync(manipResult.uri);
        if (compFileInfo.exists && compFileInfo.size) {
          const compSizeKB = (compFileInfo.size / 1024).toFixed(1);
          setCompressedSize(`${compSizeKB} KB`);
        }

        setSelectedImage(manipResult.uri);

        clearInterval(interval);
        setCompressionProgress(100);
        setTimeout(() => {
          setCompressionProgress(null);
        }, 1000);
      } catch (error) {
        clearInterval(interval);
        setCompressionProgress(null);
        console.error("Error compressing image:", error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert("Required", "Please select a product photo first.");
      return;
    }
    if (!productName.trim() || !requirement.trim()) {
      Alert.alert("Required", "Please fill in the product name and requirement details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentBuyerId = await AsyncStorage.getItem("buyerId");
      if (!currentBuyerId) {
        throw new Error("No buyer session found. Please login again.");
      }

      console.log("📤 Step 1: Uploading RFQ Photo...");
      const fileData = new FormData();
      fileData.append("file", {
        uri: selectedImage,
        name: "rfq_photo.webp",
        type: "image/webp",
      } as any);

      const uploadRes = await fetch("https://seller.inquirybazaar.com/api/upload", {
        method: "POST",
        body: fileData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadText = await uploadRes.text();
      console.log("📥 Upload API Raw Response:", uploadText);
      let uploadJson: any;
      try {
        uploadJson = JSON.parse(uploadText);
      } catch (err) {
        throw new Error(`Upload server error (${uploadRes.status}): ${uploadText.slice(0, 150)}`);
      }

      if (!uploadRes.ok || !uploadJson.fileUrl) {
        throw new Error(uploadJson.message || "Failed to upload image file.");
      }

      const imageUrl = uploadJson.fileUrl;
      console.log("✅ Photo Uploaded. URL:", imageUrl);

      console.log("📤 Step 2: Submitting RFQ Form details...");
      const payload = {
        name: productName.trim(),
        details: requirement.trim(),
        photoUrl: imageUrl,
        buyerId: currentBuyerId,
      };

      const submitRes = await fetch("https://seller.inquirybazaar.com/api/form/add-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const submitText = await submitRes.text();
      console.log("📥 RFQ API Raw Response:", submitText);
      let submitJson: any;
      try {
        submitJson = JSON.parse(submitText);
      } catch (err) {
        throw new Error(`Submit server error (${submitRes.status}): ${submitText.slice(0, 150)}`);
      }
      if (submitRes.ok && (submitJson.success || submitJson._id)) {
        Alert.alert("Success!", "Your RFQ has been posted successfully.");
        setSelectedImage(null);
        setProductName("");
        setRequirement("");
      } else {
        throw new Error(submitJson.message || submitJson.error || "Failed to post requirement.");
      }
    } catch (error: any) {
      console.error("Submission Error Details:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.flexContainer}
    >
      {/* Navbar / Header */}
      <View style={[s.headerContainer, { paddingTop: insets.top + verticalScale(8) }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={moderateScale(18)} color="#FFFFFF" style={{ marginRight: scale(4) }} />
          <Text style={s.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Post RFQ</Text>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Card Container */}
        <View style={s.mainCard}>
          
          <Text style={s.cardTitle}>
            Post RFQ via Photo
          </Text>

          {/* ── IMAGE UPLOAD AREA ── */}
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            style={s.uploadArea}
          >
            {selectedImage || compressionProgress !== null ? (
              <>
                {selectedImage && (
                  <Image source={{ uri: selectedImage }} style={s.uploadedImage} resizeMode="cover" />
                )}
                
                {compressionProgress !== null && !selectedImage && (
                  <View style={s.compressingWrapper}>
                    <ActivityIndicator size="small" color="#10B981" style={{ marginBottom: verticalScale(6) }} />
                    <Text style={s.compressingText}>Compressing image...</Text>
                  </View>
                )}

                {(originalSize || compressedSize || compressionProgress !== null) && (
                  <View style={s.metadataOverlay}>
                    {originalSize && (
                      <Text style={s.metadataText}>
                        Original: <Text className="line-through">{originalSize}</Text>
                      </Text>
                    )}
                    {compressionProgress !== null && !compressedSize ? (
                      <Text style={s.metadataHighlight}>
                        Compressing...
                      </Text>
                    ) : (
                      compressedSize && (
                        <Text style={s.metadataHighlight}>
                          WEBP: {compressedSize}
                        </Text>
                      )
                    )}
                  </View>
                )}

                {selectedImage && (
                  <View style={s.changePhotoOverlay}>
                    <View style={s.changePhotoBadge}>
                      <Ionicons name="pencil" size={moderateScale(14)} color="white" />
                      <Text style={s.changePhotoText}>Change Photo</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={s.placeholderWrapper}>
                <Ionicons name="cloud-upload" size={moderateScale(32)} color="#94A3B8" style={{ marginBottom: verticalScale(6) }} />
                <Text style={s.placeholderTitle}>
                  Drag & drop a product photo
                </Text>
                <Text style={s.placeholderSubtitle}>
                  or click to upload
                </Text>
                <View style={s.uploadButton}>
                  <Text style={s.uploadButtonText}>Upload</Text>
                </View>
              </View>
            )}

            {compressionProgress !== null && (
              <View style={s.progressBarBackground}>
                <View 
                  style={[s.progressBarFill, { width: `${compressionProgress}%` }]} 
                />
              </View>
            )}
          </TouchableOpacity>

          {/* ── FORM FIELDS ── */}
          <View style={s.fieldWrapper}>
            <Text style={s.fieldLabel}>
              Product / Service Name
            </Text>
            <TextInput
              style={s.textInput}
              placeholder="e.g. Diesel Generator"
              placeholderTextColor="#94A3B8"
              value={productName}
              onChangeText={setProductName}
              editable={!isSubmitting}
            />
          </View>

          <View style={s.fieldWrapper}>
            <Text style={s.fieldLabel}>
              Requirement Details
            </Text>
            <TextInput
              style={[s.textInput, s.textArea]}
              placeholder="Enter your requirement..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={requirement}
              onChangeText={setRequirement}
              editable={!isSubmitting}
            />
          </View>

          {/* ── SUBMIT BUTTON ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.9}
            style={[
              s.submitBtn,
              isSubmitting ? s.submitBtnDisabled : s.submitBtnActive
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={moderateScale(18)} color="white" />
                <Text style={s.submitBtnText}>
                  Submit Requirement
                </Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(12),
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 20,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A8A",
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(10),
  },
  backBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(13),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: scale(16),
  },
  scrollContent: {
    padding: scale(16),
    paddingBottom: verticalScale(32),
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(24),
    padding: moderateScale(18),
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardTitle: {
    fontSize: moderateScale(20),
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: verticalScale(16),
  },
  uploadArea: {
    width: "100%",
    height: verticalScale(180),
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(18),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    marginBottom: verticalScale(16),
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  compressingWrapper: {
    alignItems: "center",
    zIndex: 10,
  },
  compressingText: {
    fontWeight: "600",
    color: "#64748B",
    fontSize: moderateScale(13),
  },
  metadataOverlay: {
    position: "absolute",
    top: verticalScale(10),
    left: scale(10),
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(10),
    zIndex: 20,
  },
  metadataText: {
    color: "#CBD5E1",
    fontSize: moderateScale(9.5),
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  metadataHighlight: {
    color: "#34D399",
    fontSize: moderateScale(10.5),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  changePhotoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  changePhotoBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(10),
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  changePhotoText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: scale(6),
    fontSize: moderateScale(12),
  },
  placeholderWrapper: {
    alignItems: "center",
  },
  placeholderTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#334155",
    marginBottom: verticalScale(2),
  },
  placeholderSubtitle: {
    fontSize: moderateScale(12.5),
    color: "#64748B",
    marginBottom: verticalScale(12),
  },
  uploadButton: {
    backgroundColor: "#EA580C",
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(10),
    shadowColor: "#EA580C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(13.5),
  },
  progressBarBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(5),
    backgroundColor: "#E2E8F0",
    zIndex: 30,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  fieldWrapper: {
    marginBottom: verticalScale(14),
  },
  fieldLabel: {
    fontSize: moderateScale(13.5),
    fontWeight: "700",
    color: "#334155",
    marginBottom: verticalScale(6),
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(14),
    height: verticalScale(48),
    fontSize: moderateScale(14),
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: verticalScale(100),
    paddingVertical: verticalScale(10),
  },
  submitBtn: {
    borderRadius: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: verticalScale(48),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  submitBtnActive: {
    backgroundColor: "#1E3A8A",
    shadowColor: "#1E3A8A",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(15),
    marginLeft: scale(8),
  },
});

export default PostRFQ;