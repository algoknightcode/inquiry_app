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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  // --- 2-STEP SUBMISSION LOGIC ---
  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert("Required", "Please select a product photo first.");
      return;
    }
    if (!productName.trim() || !requirement.trim()) {
      Alert.alert("Required", "Please fill out the product name and requirements.");
      return;
    }
    setIsSubmitting(true);
    try {
      const buyerId = await AsyncStorage.getItem("buyerId");
      // Retrieve buyer profile info so the API has the contact details
      const buyerPhone = await AsyncStorage.getItem("phoneNumber") || await AsyncStorage.getItem("phone");
      
      if (!buyerId) {
        Alert.alert("Error", "Buyer session not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      // ==========================================
      // STEP 1: UPLOAD IMAGE TO FILE SERVER
      // ==========================================
      const formData = new FormData();
      
      // Ensure correct filename and WEBP mime-type
      const filename = `rfq_${Date.now()}.webp`;
      const fileType = "image/webp";
      formData.append("file", {
        uri: Platform.OS === "android" ? selectedImage : selectedImage.replace("file://", ""),
        name: filename,
        type: fileType,
      } as any);
      console.log("📤 Uploading Image to Server...");
      const uploadRes = await fetch("https://seller.inquirybazaar.com/api/upload", {
        method: "POST",
        headers: {
          "x-user-id": buyerId,
          "Accept": "application/json",
        },
        body: formData,
      });
      const uploadText = await uploadRes.text();
      console.log("📥 Upload API Raw Response:", uploadText);
      let uploadJson: any;
      try {
        uploadJson = JSON.parse(uploadText);
      } catch (err) {
        throw new Error(`Upload server error (${uploadRes.status}): ${uploadText.slice(0, 150)}`);
      }
      if (!uploadRes.ok || !uploadJson.success || !uploadJson.url) {
        throw new Error(uploadJson.message || uploadJson.error || "Failed to upload image to server.");
      }
      const imageUrl = uploadJson.url;
      console.log("✅ Image Uploaded Successfully:", imageUrl);
      // ==========================================
      // STEP 2: SUBMIT RFQ DATA WITH IMAGE URL
      // ==========================================
      const rfqPayload = {
        name: "Buyer Name",                // Add buyer contact name if required by backend
        phone: buyerPhone || "0000000000", // Add phone number if required by backend
        product: productName,
        message: requirement,
        image: imageUrl,
      };
      console.log("📤 Submitting RFQ Payload:", rfqPayload);
      const submitRes = await fetch("https://seller.inquirybazaar.com/api/form/add-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": buyerId,
        },
        body: JSON.stringify(rfqPayload),
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
        // Reset Form
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
      className="flex-1 bg-slate-50"
    >
      {/* Navbar / Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white px-4 pb-4 pt-4 shadow-sm shadow-slate-100 flex-row items-center z-20">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center bg-blue-900 px-3 py-2 rounded-xl active:opacity-80">
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" className="mr-1" />
          <Text className="text-white font-jakarta-bold text-[14px]">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-jakarta-bold text-slate-900 ml-4">Post RFQ</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        
        {/* Main Card Container */}
        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200 border border-slate-100">
          
          <Text className="text-2xl font-bold text-[#1E293B] mb-6">
            Post RFQ via Photo
          </Text>

          {/* ── IMAGE UPLOAD AREA ── */}
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            className="w-full h-56 border-2 border-dashed border-slate-300 rounded-[24px] items-center justify-center bg-white overflow-hidden mb-6 relative"
          >
            {selectedImage || compressionProgress !== null ? (
              <>
                {selectedImage && (
                  <Image source={{ uri: selectedImage }} className="w-full h-full absolute" resizeMode="cover" />
                )}
                
                {compressionProgress !== null && !selectedImage && (
                  <View className="items-center z-10">
                    <ActivityIndicator size="small" color="#10B981" className="mb-2" />
                    <Text className="font-jakarta-semibold text-slate-500 text-[14px]">Compressing image...</Text>
                  </View>
                )}

                {(originalSize || compressedSize || compressionProgress !== null) && (
                  <View className="absolute top-4 left-4 bg-slate-900/80 px-3 py-2 rounded-xl z-20">
                    {originalSize && (
                      <Text className="text-slate-300 text-[10px] font-jakarta-semibold tracking-wide mb-0.5">
                        Original: <Text className="line-through">{originalSize}</Text>
                      </Text>
                    )}
                    {compressionProgress !== null && !compressedSize ? (
                      <Text className="text-emerald-400 text-[11px] font-jakarta-bold tracking-wide animate-pulse">
                        Compressing...
                      </Text>
                    ) : (
                      compressedSize && (
                        <Text className="text-emerald-400 text-[11px] font-jakarta-bold tracking-wide">
                          WEBP: {compressedSize}
                        </Text>
                      )
                    )}
                  </View>
                )}

                {selectedImage && (
                  <View className="absolute inset-0 bg-black/25 items-center justify-center z-10">
                    <View className="bg-white/25 px-4 py-2 rounded-xl backdrop-blur-md flex-row items-center border border-white/20">
                      <Ionicons name="pencil" size={16} color="white" />
                      <Text className="text-white font-semibold ml-2">Change Photo</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View className="items-center">
                <Ionicons name="cloud-upload" size={36} color="#94A3B8" className="mb-2" />
                <Text className="text-[16px] font-bold text-[#334155] mb-1">
                  Drag & drop a product photo
                </Text>
                <Text className="text-[14px] text-[#64748B] mb-5">
                  or click to upload
                </Text>
                <View className="bg-[#EA580C] px-8 py-3 rounded-xl shadow-sm shadow-orange-200">
                  <Text className="text-white font-bold text-[15px]">Upload</Text>
                </View>
              </View>
            )}

            {compressionProgress !== null && (
              <View className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-200 z-30">
                <View 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${compressionProgress}%` }} 
                />
              </View>
            )}
          </TouchableOpacity>

          {/* ── FORM FIELDS ── */}
          <View className="mb-4">
            <Text className="text-[14px] font-bold text-[#334155] mb-2">
              Product / Service Name
            </Text>
            <TextInput
              className="border border-slate-300 rounded-xl px-4 h-14 text-[15px] text-slate-900 bg-white focus:border-blue-900"
              placeholder="e.g. Diesel Generator"
              placeholderTextColor="#94A3B8"
              value={productName}
              onChangeText={setProductName}
              editable={!isSubmitting}
            />
          </View>

          <View className="mb-6">
            <Text className="text-[14px] font-bold text-[#334155] mb-2">
              Requirement Details
            </Text>
            <TextInput
              className="border border-slate-300 rounded-xl px-4 py-4 text-[15px] text-slate-900 bg-white h-32 focus:border-blue-900"
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
            className={`rounded-xl flex-row items-center justify-center h-14 shadow-md ${
              isSubmitting ? "bg-slate-400" : "bg-[#1E3A8A] shadow-blue-900/30"
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={20} color="white" />
                <Text className="text-white font-bold text-[16px] ml-2">
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

export default PostRFQ;