import { Image } from 'expo-image';
import { globalSellerId } from "@/utils/roleCache";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState, lazy, Suspense } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { Image as RNImage } from 'react-native';

const EnhancedImage = lazy(() =>
  import("@/utils/imageEnhancer").then((m) => ({ default: m.EnhancedImage }))
);

// --- REUSABLE INPUT COMPONENT ---
const InputField = ({ label, icon, placeholder, value, onChangeText, keyboardType = "default", multiline = false }: any) => (
  <View style={{ marginBottom: verticalScale(14) }}>
    <Text 
      style={{
        fontSize: moderateScale(11.5),
        marginBottom: verticalScale(6),
        marginLeft: scale(4),
      }}
      className="font-jakarta-medium text-slate-500 uppercase tracking-wider"
    >
      {label}
    </Text>
    <View 
      style={[
        {
          borderRadius: moderateScale(14),
          paddingHorizontal: scale(14),
        },
        multiline 
          ? { paddingVertical: verticalScale(10), minHeight: verticalScale(100), alignItems: 'flex-start' }
          : { height: verticalScale(48), alignItems: 'center' }
      ]}
      className="flex-row bg-white border border-slate-200 shadow-sm shadow-slate-100"
    >
      <Ionicons 
        name={icon} 
        size={moderateScale(18)} 
        color="#64748B" 
        style={[{ marginRight: scale(10) }, multiline ? { marginTop: verticalScale(2) } : {}]} 
      />
      <TextInput
        style={{ fontSize: moderateScale(14) }}
        className="flex-1 text-slate-900 font-jakarta-semibold"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  </View>
);

// --- REUSABLE DROPDOWN COMPONENT ---
const DropdownField = ({ label, icon, placeholder, value, options, onSelect, searchable = false }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!modalVisible) {
      setSearchQuery("");
    }
  }, [modalVisible]);

  const filteredOptions = searchable
    ? options.filter((item: string) => item.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <View style={{ marginBottom: verticalScale(14) }}>
      <Text 
        style={{
          fontSize: moderateScale(11.5),
          marginBottom: verticalScale(6),
          marginLeft: scale(4),
        }}
        className="font-jakarta-medium text-slate-500 uppercase tracking-wider"
      >
        {label}
      </Text>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        style={{
          height: verticalScale(48),
          paddingHorizontal: scale(14),
          borderRadius: moderateScale(14),
        }}
        className="flex-row items-center bg-white border border-slate-200 shadow-sm shadow-slate-100 active:bg-slate-50"
      >
        <Ionicons name={icon} size={moderateScale(18)} color="#64748B" style={{ marginRight: scale(10) }} />
        <Text 
          style={{ fontSize: moderateScale(14) }}
          className={value ? "flex-1 font-jakarta-semibold text-slate-900" : "flex-1 font-jakarta-semibold text-slate-400"}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={moderateScale(18)} color="#94A3B8" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View 
            style={{ borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24), padding: moderateScale(20), paddingBottom: verticalScale(30) }}
            className="bg-white max-h-[60%] shadow-2xl"
          >
            <View style={{ width: scale(40), height: verticalScale(5), borderRadius: 10 }} className="bg-slate-200 self-center mb-6" />
            <Text style={{ fontSize: moderateScale(16) }} className="font-jakarta-bold text-slate-900 mb-4 px-2">Select {label}</Text>
            
            {searchable && (
              <View 
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F1F5F9",
                  borderRadius: moderateScale(12),
                  paddingHorizontal: scale(10),
                  height: verticalScale(40),
                  marginBottom: verticalScale(14),
                  marginHorizontal: scale(8),
                }}
              >
                <Ionicons name="search-outline" size={moderateScale(16)} color="#64748B" style={{ marginRight: scale(6) }} />
                <TextInput
                  placeholder={`Search ${label}...`}
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{
                    fontSize: moderateScale(13),
                    flex: 1,
                    height: "100%",
                    color: "#0F172A",
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={moderateScale(16)} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {filteredOptions.length === 0 ? (
              <Text style={{ fontSize: moderateScale(13) }} className="text-slate-500 text-center py-4 font-jakarta-medium">No matching options</Text>
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{ paddingVertical: verticalScale(12), paddingHorizontal: scale(12) }}
                    className="border-b border-slate-100 flex-row items-center justify-between"
                    onPress={() => { onSelect(item); setModalVisible(false); }}
                  >
                    <Text 
                      style={{ fontSize: moderateScale(14) }}
                      className={value === item ? "font-jakarta-semibold text-blue-900" : "font-jakarta-semibold text-slate-700"}
                    >
                      {item}
                    </Text>
                    {value === item && <Ionicons name="checkmark-circle" size={moderateScale(20)} color="#1E3A8A" />}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// --- HELPER TO STRIP ALL EXPO-ROUTER ENCODING ---
const getCleanUrl = (url: string | null | undefined) => {
  if (!url) return null;
  let cleanUrl = url;
  while (cleanUrl !== decodeURIComponent(cleanUrl)) {
    cleanUrl = decodeURIComponent(cleanUrl);
  }
  return cleanUrl;
};

// --- HELPER TO SAFELY DECODE ROUTER PARAMS ---
const safeDecode = (value: string | string[] | undefined | null): string => {
  if (!value) return "";
  let str = Array.isArray(value) ? value[0] : value;
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str; // Fallback to raw string if decoding fails
  }
};

// --- HELPER TO GENERATE UNIQUE ID ---
const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// --- MAIN SCREEN ---
const AddProduct = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const tabs = [
    { id: "Category", icon: "layers" },
    { id: "Basic Info", icon: "cube" },
    { id: "Price", icon: "pricetag" },
    { id: "Description", icon: "document-text" },
    { id: "Specifications", icon: "options" },
    { id: "Other", icon: "add-circle" },
  ];
  
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
  const hasNextTab = currentTabIndex < tabs.length - 1;

  const [isSaving, setIsSaving] = useState(false); 
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  const [validationError, setValidationError] = useState<string | null>(null); 

  // Fix 1: Directly use the parameters, no useRef needed.
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;

  // --- SOURCE OF TRUTH STATES ---
  const [productImage, setProductImage] = useState<string | null>(null);
  const [originalImageUri, setOriginalImageUri] = useState<string | null>(null);
  const [imagesStateData, setImagesStateData] = useState<any[]>([]); 
  const [isLocalImageAdded, setIsLocalImageAdded] = useState(false); 
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [enhancedUri, setEnhancedUri] = useState<string | null>(null);

  // Clean up enhanced image temporary file when it changes or when component unmounts
  useEffect(() => {
    return () => {
      if (enhancedUri && enhancedUri.startsWith('file://')) {
        FileSystem.deleteAsync(enhancedUri, { idempotent: true }).catch(err => {
          console.log("Error cleaning up enhanced image:", err);
        });
      }
    };
  }, [enhancedUri]);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCancelBgRemoval = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRemovingBg(false);
  };

  const [previewSize, setPreviewSize] = useState({ width: 300, height: 224 });

  const [originalSize, setOriginalSize] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
  const [specs, setSpecs] = useState([{ id: generateUniqueId(), key: "", value: "" }]);
  
  const [formData, setFormData] = useState({
    category: "", subCategory: "", productName: "", brandName: "",
    newPrice: "", oldPrice: "", unit: "", priceType: "", minOrderQty: "",
    description: "", deliveryTime: "", paymentTerms: "", packagingDetails: "",
    supplyAbility: "", youtubeLink: "",
  });

  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [apiSubCategories, setApiSubCategories] = useState<any[]>([]);
  const [categoryIdState, setCategoryIdState] = useState("");
  const [subCategoryIdState, setSubCategoryIdState] = useState("");

  // --- 1. FETCH API DATA ---
  useEffect(() => {
    const fetchCategoriesAndSubs = async () => {
      try {
        const response = await fetch("https://backend.inquirybazaar.com/api/industries/tree");
        const json = await response.json();
        if (json.success && json.data && isMounted.current) {
          const allCats: any[] = [];
          const allSubs: any[] = [];
          
          json.data.forEach((industry: any) => {
            if (industry.categories) {
              industry.categories.forEach((cat: any) => {
                allCats.push({ _id: cat._id, name: cat.name });
                if (cat.subCategories) {
                  cat.subCategories.forEach((sub: any) => {
                    allSubs.push({ _id: sub._id, name: sub.name, parentCategoryId: cat._id });
                  });
                }
              });
            }
          });
          
          const uniqueCats = allCats.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
          const uniqueSubs = allSubs.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
          
          setApiCategories(uniqueCats);
          setApiSubCategories(uniqueSubs);
        }
      } catch (error) {
        console.error("Error fetching categories and subcategories tree:", error);
      }
    };
    fetchCategoriesAndSubs();
  }, []);

  // --- 2. INITIALIZE ROUTER PARAMS ON MOUNT ---
  // Fix 2: Properly decode all properties to avoid parser errors and broken linebreaks
  useEffect(() => {
    if (params.id) {
      
      let mediaArray: any[] = [];
      if (params.mediaStr) {
        try {
          mediaArray = JSON.parse(safeDecode(params.mediaStr));
        } catch(e) {
          console.log("Failed to parse media", e);
        }
      }

      if (mediaArray.length > 0) {
        const cleanState = mediaArray.map(m => ({
          mediaId: m._id || m.mediaId,
          url: getCleanUrl(m.url), 
          isPrimary: m.isPrimary !== false,
          isOld: true,
          type: m.type || "image"
        }));
        setImagesStateData(cleanState);
        setProductImage(cleanState.find(m => m.isPrimary)?.url || cleanState[0]?.url);
      } else if (params.image) {
        setImagesStateData([{ url: safeDecode(params.image), isPrimary: true, isOld: true, type: "image" }]);
        setProductImage(safeDecode(params.image));
      }

      setCategoryIdState(safeDecode(params.categoryId));
      setSubCategoryIdState(safeDecode(params.subCategoryId));
      
      setFormData({
        category: safeDecode(params.category),
        subCategory: safeDecode(params.subCategory),
        productName: safeDecode(params.name),
        brandName: safeDecode(params.brandName),
        newPrice: safeDecode(params.price),
        oldPrice: safeDecode(params.oldPrice),
        unit: safeDecode(params.unit),
        priceType: safeDecode(params.priceType),
        minOrderQty: safeDecode(params.minOrderQty),
        description: safeDecode(params.description), 
        deliveryTime: safeDecode(params.deliveryTime),
        paymentTerms: safeDecode(params.paymentTerms),
        packagingDetails: safeDecode(params.packagingDetails),
        supplyAbility: safeDecode(params.supplyAbility),
        youtubeLink: safeDecode(params.youtubeLink),
      });

      try {
        if (params.specifications) {
          const decodedSpecs = safeDecode(params.specifications);
          const parsedSpecs = JSON.parse(decodedSpecs);
          
          if (Array.isArray(parsedSpecs) && parsedSpecs.length > 0) {
            setSpecs(parsedSpecs.map((s: any) => ({ ...s, id: s.id || generateUniqueId() })));
            return;
          }
        }
      } catch(e) {
        console.error("Failed to parse specifications:", e);
      }

      setSpecs([{ id: generateUniqueId(), key: "", value: "" }]);
    } else {
      setSpecs([{ id: generateUniqueId(), key: "", value: "" }]);
    }
  }, [params.id]); 

  // --- 3. SYNC CATEGORY NAMES WITH IDs AFTER API LOADS ---
  useEffect(() => {
    if (isEditMode && apiCategories.length > 0) {
      setFormData(prev => {
        let updated = { ...prev };
        let changed = false;

        // Map Category ID to Name
        if (categoryIdState) {
          const matchedCat = apiCategories.find(c => c._id === categoryIdState);
          if (matchedCat && matchedCat.name !== prev.category) {
            updated.category = matchedCat.name;
            changed = true;
          }
        }

        // Map SubCategory ID to Name
        if (subCategoryIdState && apiSubCategories.length > 0) {
          const matchedSub = apiSubCategories.find(s => s._id === subCategoryIdState);
          if (matchedSub && matchedSub.name !== prev.subCategory) {
            updated.subCategory = matchedSub.name;
            changed = true;
          }
        }

        return changed ? updated : prev;
      });
    }
  }, [apiCategories, apiSubCategories, categoryIdState, subCategoryIdState, isEditMode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  let showNextBtn = false;
  if (activeTab === "Category" && (formData.category || formData.subCategory)) showNextBtn = true;
  if (activeTab === "Basic Info" && (formData.productName || formData.brandName)) showNextBtn = true;
  if (activeTab === "Price" && (formData.newPrice || formData.oldPrice || formData.unit || formData.priceType)) showNextBtn = true;
  if (activeTab === "Description" && formData.description.length > 0) showNextBtn = true;
  if (activeTab === "Specifications" && (specs[0].key || specs[0].value)) showNextBtn = true;

  const handleNextTab = () => { if (hasNextTab) setActiveTab(tabs[currentTabIndex + 1].id); };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, 
    });

    if (!result.canceled) {
      const originalUri = result.assets[0].uri;
      setOriginalImageUri(originalUri);
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

        setProductImage(manipResult.uri);
        setIsLocalImageAdded(true);
        setImagesStateData([{ mediaId: null, url: null, isPrimary: true, isOld: false, type: "image" }]);

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

  const handleRemoveBackground = async () => {
    const targetUri = isEnhanced && enhancedUri ? enhancedUri : (originalImageUri || productImage);
    if (!targetUri) return;
    try {
      setIsRemovingBg(true);
      
      // Ensure the image is converted to JPEG format before sending,
      // and RESIZE it so it doesn't crash the low-RAM VPS!
      const jpegResult = await ImageManipulator.manipulateAsync(
        targetUri,
        [{ resize: { width: 800 } }], // Resize to 800px width
        { format: ImageManipulator.SaveFormat.JPEG, compress: 0.7 } // Compress it slightly
      );

      // Read local image file as Base64 string
      const base64ImageInput = await FileSystem.readAsStringAsync(jpegResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("[BG Isolation] Uploading base64 image string...");

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

      const response = await fetch("https://backend.inquirybazaar.com/api/remove-bg", {
        method: "POST",
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ image: base64ImageInput }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log("[BG Isolation] Response status:", response.status);
      const result = await response.json();
      console.log("[BG Isolation] Response success:", result.success, "Base64 length:", result.base64 ? result.base64.length : 0);

      if (result.success && result.base64) {
        const cleanLocalUri = `${FileSystem.cacheDirectory}nobg_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(cleanLocalUri, result.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const manipResult = await ImageManipulator.manipulateAsync(
          cleanLocalUri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.WEBP }
        );
        const compFileInfo = await FileSystem.getInfoAsync(manipResult.uri);
        if (compFileInfo.exists && compFileInfo.size) {
          setCompressedSize(`${(compFileInfo.size / 1024).toFixed(1)} KB`);
        }

        setProductImage(manipResult.uri);
        setIsLocalImageAdded(true);
        setImagesStateData([{ mediaId: null, url: null, isPrimary: true, isOld: false, type: "image" }]);
        
        Alert.alert("Success", "Background removed successfully!");
      } else {
        Alert.alert("Error", result.error || "Failed to remove background.");
      }
    } catch (error: any) {
      if (error.name === "AbortError" || error.message?.includes("aborted")) {
        console.log("[BG Isolation] Request was cancelled by the user.");
        return;
      }
      console.error("BG isolation error:", error);
      Alert.alert("Error", `BG isolation error: ${error.message || error}`);
    } finally {
      abortControllerRef.current = null;
      setIsRemovingBg(false);
    }
  };

  const addSpec = () => setSpecs([...specs, { id: generateUniqueId(), key: "", value: "" }]);
  const removeSpec = (id: string) => setSpecs(specs.filter(s => s.id !== id));
  const updateSpec = (id: string, field: "key" | "value", text: string) => {
    setSpecs(specs.map(s => s.id === id ? { ...s, [field]: text } : s));
  };

  const handleSaveProduct = async () => {
    if (!productImage) {
      setValidationError("Please upload or select a product image first.");
      return;
    }
    if (!formData.productName?.trim()) {
      setValidationError("Product Name is required.");
      return;
    }
    if (!formData.category?.trim()) {
      setValidationError("Please select a Category.");
      return;
    }
    if (!formData.subCategory?.trim()) {
      setValidationError("Please select a Sub Category.");
      return;
    }
    try {
      setIsSaving(true);

      const activeSupplierId = globalSellerId || await AsyncStorage.getItem("supplierId") || "6a36322b7d11e405b8330ea1";
      const categoryId = categoryIdState || (apiCategories.find(c => c.name === formData.category)?._id) || "6a0ffb30586febf4eb4a6bf8";
      const subCategoryId = subCategoryIdState || (apiSubCategories.find(s => s.name === formData.subCategory)?._id) || "6a195e74ebea9d3dc25f0697";

      const uploadData = new FormData();

      uploadData.append("name", formData.productName);
      uploadData.append("supplierId", activeSupplierId);
      uploadData.append("categoryId", categoryId);
      uploadData.append("subCategoryId", subCategoryId);
      
      if (formData.brandName) uploadData.append("brandName", formData.brandName);
      if (formData.newPrice) uploadData.append("price", formData.newPrice);
      if (formData.oldPrice) uploadData.append("oldPrice", formData.oldPrice);
      if (formData.unit) uploadData.append("unit", formData.unit);
      if (formData.priceType) uploadData.append("priceType", formData.priceType.toLowerCase()); 
      if (formData.minOrderQty) uploadData.append("minOrderQty", formData.minOrderQty);
      if (formData.description) uploadData.append("description", formData.description);
      if (formData.deliveryTime) uploadData.append("deliveryTime", formData.deliveryTime);
      if (formData.paymentTerms) uploadData.append("paymentTerms", formData.paymentTerms);
      if (formData.packagingDetails) uploadData.append("packagingDetails", formData.packagingDetails);
      if (formData.supplyAbility) uploadData.append("supplyAbility", formData.supplyAbility);
      if (formData.youtubeLink) uploadData.append("youtubeLink", formData.youtubeLink);
      
      const cleanSpecs = specs.filter(s => s.key.trim() !== "" || s.value.trim() !== "");
      uploadData.append("specifications", JSON.stringify(cleanSpecs));

      const formattedImages = imagesStateData.map((img) => ({
        mediaId: img.mediaId || null, 
        url: img.url || null,
        isPrimary: img.isPrimary !== false, 
        isOld: img.isOld !== false,         
      }));

      if (!formattedImages.some((img) => img.isPrimary) && formattedImages.length) {
        formattedImages[0].isPrimary = true;
      }

      uploadData.append("imagesState", JSON.stringify(formattedImages));

      if (isLocalImageAdded && (isEnhanced && enhancedUri ? enhancedUri : productImage)) {
        const finalProductImage = isEnhanced && enhancedUri ? enhancedUri : productImage;
        const filename = finalProductImage!.split("/").pop() || "product_image.jpg";
        const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        const fileUri = Platform.OS === 'ios' ? finalProductImage!.replace('file://', '') : finalProductImage;

        uploadData.append("files", {
          uri: fileUri,
          name: filename,
          type: type,
        } as any);
      }

      const productId = Array.isArray(params.id) ? params.id[0] : params.id;
      const url = isEditMode 
        ? `https://seller.inquirybazaar.com/api/product/${productId}`
        : "https://seller.inquirybazaar.com/api/product";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Accept": "application/json",
          "x-user-id": activeSupplierId,
        },
        body: uploadData,
      });

      const data: any = await response.json();
      
      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          router.back();
        }, 1500);
      } else {
        setValidationError(data.error || data.message || "Failed to save product.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setValidationError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- API DRIVEN DROPDOWN OPTIONS ---
  const categoryOptions = apiCategories.map(c => c.name);
  
  const selectedCategoryObj = apiCategories.find(c => c._id === categoryIdState);
  
  const filteredSubCats = selectedCategoryObj 
    ? apiSubCategories.filter(s => s.parentCategoryId === selectedCategoryObj._id)
    : [];
  const subCategoryOptions = filteredSubCats.map(s => s.name);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-slate-50" style={{ flex: 1 }}>
        
        <Modal visible={isSaving} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View className="bg-white rounded-[32px] p-8 items-center shadow-2xl shadow-blue-900/50 w-[80%] max-w-[340px]">
              <View className="bg-blue-50 h-20 w-20 rounded-full items-center justify-center mb-5 border-[4px] border-white shadow-lg shadow-blue-100">
                <ActivityIndicator size="large" color="#1E3A8A" />
              </View>
              <Text className="text-[20px] font-jakarta-bold text-slate-900 mb-2 tracking-tight">
                {isEditMode ? "Updating Product" : "Saving Product"}
              </Text>
              <Text className="text-[14px] font-jakarta-medium text-slate-500 text-center leading-relaxed">
                {isEditMode ? "Saving changes to your catalog..." : "Uploading details to your catalog..."}
              </Text>
            </View>
          </View>
        </Modal>

        <Modal visible={isSuccess} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View className="bg-white rounded-[32px] p-8 items-center shadow-2xl shadow-emerald-900/50 w-[80%] max-w-[340px]">
              <View className="bg-emerald-50 h-20 w-20 rounded-full items-center justify-center mb-5 border-[4px] border-white shadow-lg shadow-emerald-100">
                <Ionicons name="checkmark" size={40} color="#10B981" />
              </View>
              <Text className="text-[20px] font-jakarta-bold text-slate-900 mb-2 tracking-tight">
                {isEditMode ? "Product Updated!" : "Product Saved!"}
              </Text>
              <Text className="text-[14px] font-jakarta-medium text-slate-500 text-center leading-relaxed">
                {isEditMode ? "Your product has been updated successfully." : "Your product has been added successfully."}
              </Text>
            </View>
          </View>
        </Modal>

        <Modal visible={!!validationError} transparent animationType="fade" onRequestClose={() => setValidationError(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View className="bg-white rounded-[32px] p-8 items-center shadow-2xl shadow-rose-900/10 w-[85%] max-w-[340px]">
              <View className="bg-rose-50 h-16 w-16 rounded-full items-center justify-center mb-4 border-[4px] border-white shadow-lg shadow-rose-100">
                <Ionicons name="alert-circle" size={32} color="#EF4444" />
              </View>
              <Text className="text-[18px] font-jakarta-bold text-slate-900 mb-2 tracking-tight text-center">
                Validation Error
              </Text>
              <Text className="text-[13px] font-jakarta-medium text-slate-500 text-center leading-relaxed mb-6">
                {validationError}
              </Text>
              <TouchableOpacity
                onPress={() => setValidationError(null)}
                className="w-full bg-[#0F172A] py-3 rounded-2xl items-center justify-center active:scale-[0.98]"
              >
                <Text className="text-white font-jakarta-bold text-[14px]">Okay</Text>
              </TouchableOpacity>
            </View>
          </View>
         </Modal>

        {/* Loading Overlay for Background Removal */}
        <Modal visible={isRemovingBg} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View className="bg-white rounded-[32px] p-8 items-center w-[80%] max-w-[340px]">
              <ActivityIndicator size="large" color="#7C3AED" className="mb-4" />
              <Text className="text-[18px] font-jakarta-bold text-slate-900 mb-1">Isolating Subject</Text>
              <Text className="text-[13px] font-jakarta-medium text-slate-500 text-center mb-5">Removing background via AI...</Text>
              <TouchableOpacity
                onPress={handleCancelBgRemoval}
                className="w-full bg-slate-100 py-3 rounded-2xl items-center justify-center active:scale-[0.98] border border-slate-200"
              >
                <Text className="text-slate-600 font-jakarta-bold text-[14px]">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View className="bg-white px-4 pb-4 pt-4 shadow-sm shadow-slate-100 flex-row items-center z-20">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center bg-blue-900 px-3 py-2 rounded-xl active:opacity-80">
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" className="mr-1" />
            <Text className="text-white font-jakarta-bold text-[14px]">Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-jakarta-bold text-slate-900 ml-4">{isEditMode ? "Edit Product" : "Add Product"}</Text>
        </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        <View className="p-5">
          <TouchableOpacity 
            onPress={pickImage} 
            activeOpacity={0.8} 
            className="w-full h-56 bg-slate-100 rounded-[32px] border-2 border-dashed border-slate-300 items-center justify-center relative overflow-hidden"
          >
            {productImage || compressionProgress !== null ? (
              <>
                {productImage && (
                  <View 
                    onLayout={(event) => {
                      const { width, height } = event.nativeEvent.layout;
                      setPreviewSize({ width, height });
                    }}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                  >
                    {isEnhanced ? (
                      <Suspense fallback={
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                          <ActivityIndicator size="small" color="#10B981" />
                        </View>
                      }>
                        <EnhancedImage 
                          sourceUri={productImage} 
                          width={previewSize.width}
                          height={previewSize.height}
                          onExtractImage={(uri) => setEnhancedUri(uri)}
                        />
                      </Suspense>
                    ) : (
                      <Image 
                        source={{ uri: productImage }} 
                        style={{ width: '100%', height: '100%', position: 'absolute' }} 
                        contentFit="cover" 
                      />
                    )}
                  </View>
                )}
                
                {productImage && (
                  <View className="absolute bottom-4 right-4 z-30">
                    <TouchableOpacity 
                      onPress={() => {
                        if (isEnhanced) setEnhancedUri(null);
                        setIsEnhanced(!isEnhanced);
                      }}
                      className={`flex-row items-center px-3 py-1.5 rounded-xl ${isEnhanced ? 'bg-amber-100' : 'bg-indigo-50 border border-indigo-100 shadow-sm'}`}
                    >
                      <Ionicons name={isEnhanced ? "arrow-undo-outline" : "sparkles"} size={14} color={isEnhanced ? "#d97706" : "#4f46e5"} />
                      <Text className={`ml-1.5 text-[12px] font-jakarta-bold ${isEnhanced ? 'text-amber-700' : 'text-indigo-600'}`}>
                        {isEnhanced ? 'Revert' : 'Enhance'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {compressionProgress !== null && !productImage && (
                  <View className="items-center z-10">
                    <ActivityIndicator size="small" color="#10B981" className="mb-2" />
                    <Text className="font-jakarta-medium text-slate-500 text-[14px]">Compressing image...</Text>
                  </View>
                )}

                {(originalSize || compressedSize || compressionProgress !== null) && (
                  <View className="absolute top-4 left-4 bg-slate-900/70 px-3 py-2 rounded-xl z-20">
                    {originalSize && (
                      <Text className="text-slate-300 text-[10px] font-jakarta-medium tracking-wide mb-0.5">
                        Original: <Text className="line-through">{originalSize}</Text>
                      </Text>
                    )}
                    {compressionProgress !== null && !compressedSize ? (
                      <Text className="text-emerald-400 text-[12px] font-jakarta-bold tracking-wide animate-pulse">
                        Compressing...
                      </Text>
                    ) : (
                      compressedSize && (
                        <Text className="text-emerald-400 text-[12px] font-jakarta-bold tracking-wide">
                          WEBP: {compressedSize}
                        </Text>
                      )
                    )}
                  </View>
                )}
              </>
            ) : (
              <View className="items-center">
                <Ionicons name="image-outline" size={48} color="#CBD5E1" className="mb-2" />
                <Text className="font-jakarta-medium text-slate-400 text-[15px]">Tap to upload product image</Text>
                <Text className="font-jakarta-medium text-slate-400 text-[11px] mt-1">Auto-compresses to WEBP format</Text>
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

            <View className="absolute bottom-4 right-4 h-12 w-12 bg-blue-900 rounded-full items-center justify-center shadow-lg shadow-blue-900/40 border-2 border-white">
              <Ionicons name={productImage ? "pencil" : "add"} size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          {/* ONLY SHOW REMOVE BG OPTION IF AN IMAGE IS PRESENT AND COMPRESSION IS FINISHED */}
          {productImage && compressionProgress === null && !isRemovingBg && (
            <TouchableOpacity
              onPress={handleRemoveBackground}
              className="mt-4 bg-purple-600 py-3 rounded-2xl flex-row items-center justify-center active:scale-[0.98] shadow-md shadow-purple-200"
            >
              <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text className="text-white font-jakarta-bold text-[14px]">Remove Background</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)}>
                  <View style={[
                      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
                      isActive ? { backgroundColor: "#1E3A8A", shadowColor: "#1E3A8A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 } : { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0" }
                    ]}>
                    <Ionicons name={`${tab.icon}${isActive ? "" : "-outline"}` as any} size={16} color={isActive ? "#FFFFFF" : "#64748B"} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: "700", fontFamily: "PlusJakartaSans-Bold", color: isActive ? "#FFFFFF" : "#475569" }}>{tab.id}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-5">
          <View className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/40 border border-slate-100">
            
            {activeTab === "Category" && (
              <View>
                <DropdownField 
                  label="Category" 
                  icon="layers-outline" 
                  placeholder="Select Category" 
                  value={formData.category} 
                  onSelect={(val: string) => {
                    handleChange("category", val);
                    handleChange("subCategory", ""); 
                    const match = apiCategories.find(c => c.name === val);
                    if (match) setCategoryIdState(match._id);
                    setSubCategoryIdState(""); 
                  }} 
                  options={categoryOptions}
                  searchable={true}
                />
                <DropdownField 
                  label="Sub Category" 
                  icon="git-network-outline" 
                  placeholder="Select Sub Category" 
                  value={formData.subCategory} 
                  onSelect={(val: string) => {
                    handleChange("subCategory", val);
                    const match = filteredSubCats.find(s => s.name === val);
                    if (match) setSubCategoryIdState(match._id);
                  }} 
                  options={subCategoryOptions} 
                  searchable={true}
                />
              </View>
            )}

            {activeTab === "Basic Info" && (
              <View>
                <InputField label="Product Name" icon="cube-outline" placeholder="Enter Product Name" value={formData.productName} onChangeText={(val: string) => handleChange("productName", val)}/>
                <InputField label="Brand Name" icon="pricetag-outline" placeholder="Enter Brand Name" value={formData.brandName} onChangeText={(val: string) => handleChange("brandName", val)}/>
              </View>
            )}

            {activeTab === "Price" && (
              <View>
                <InputField label="New Price" icon="cash-outline" placeholder="₹ New Price" keyboardType="numeric" value={formData.newPrice} onChangeText={(val: string) => handleChange("newPrice", val)}/>
                <InputField label="Old Price" icon="cash-outline" placeholder="₹ Old Price" keyboardType="numeric" value={formData.oldPrice} onChangeText={(val: string) => handleChange("oldPrice", val)}/>
                <DropdownField label="Unit" icon="scale-outline" placeholder="Select Unit" value={formData.unit} onSelect={(val: string) => handleChange("unit", val)} options={["Piece", "Kg", "Litre", "Meter", "Box", "Ton"]}/>
                <DropdownField label="Price Type" icon="list-outline" placeholder="On Request" value={formData.priceType} onSelect={(val: string) => handleChange("priceType", val)} options={["Fixed", "Negotiable", "On Request"]}/>
                <InputField label="Minimum Order Quantity" icon="cube-outline" placeholder="1" keyboardType="numeric" value={formData.minOrderQty} onChangeText={(val: string) => handleChange("minOrderQty", val)}/>
              </View>
            )}

            {activeTab === "Description" && (
              <View>
                <InputField label="Product Description" icon="document-text-outline" placeholder="Write a detailed description..." multiline={true} value={formData.description} onChangeText={(val: string) => handleChange("description", val)}/>
              </View>
            )}

            {activeTab === "Specifications" && (
              <View>
                <View className="flex-row items-center justify-between mb-4 mt-2">
                  <Text className="text-[16px] font-jakarta-bold text-slate-900">Specifications</Text>
                  <TouchableOpacity onPress={addSpec} className="bg-blue-50 px-3 py-1.5 rounded-lg flex-row items-center border border-blue-100">
                    <Ionicons name="add" size={16} color="#1E3A8A" />
                    <Text className="text-blue-900 font-jakarta-bold text-[13px] ml-1">Add</Text>
                  </TouchableOpacity>
                </View>

                {specs.map((spec, index) => (
                  <View key={spec.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 relative">
                    {specs.length > 1 && (
                      <TouchableOpacity onPress={() => removeSpec(spec.id)} className="absolute -top-3 -right-3 bg-red-50 h-8 w-8 rounded-full items-center justify-center border border-red-200 z-10">
                        <Ionicons name="close" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    )}
                    <InputField label={`Key (e.g. Material) ${index + 1}`} icon="hardware-chip-outline" placeholder="Key (e.g. Material)" value={spec.key} onChangeText={(val: string) => updateSpec(spec.id, "key", val)}/>
                    <InputField label={`Value (e.g. Steel) ${index + 1}`} icon="construct-outline" placeholder="Value (e.g. Steel)" value={spec.value} onChangeText={(val: string) => updateSpec(spec.id, "value", val)}/>
                  </View>
                ))}
              </View>
            )}

            {activeTab === "Other" && (
              <View>
                <InputField label="Delivery Time" icon="time-outline" placeholder="e.g. 7-14 Days" value={formData.deliveryTime} onChangeText={(val: string) => handleChange("deliveryTime", val)} />
                <InputField label="Payment Terms" icon="card-outline" placeholder="e.g. T/T, Letter of Credit" value={formData.paymentTerms} onChangeText={(val: string) => handleChange("paymentTerms", val)} />
                <InputField label="Packaging Details" icon="cube-outline" placeholder="Packaging Details" value={formData.packagingDetails} onChangeText={(val: string) => handleChange("packagingDetails", val)} />
                <InputField label="Supply Ability" icon="layers-outline" placeholder="Supply Ability" value={formData.supplyAbility} onChangeText={(val: string) => handleChange("supplyAbility", val)} />
                <InputField label="YouTube Link" icon="logo-youtube" placeholder="YouTube Video URL" value={formData.youtubeLink} onChangeText={(val: string) => handleChange("youtubeLink", val)} />
              </View>
            )}

            <View className="flex-row items-center justify-end mt-6 border-t border-slate-100 pt-6 gap-x-3">
              <TouchableOpacity onPress={() => router.back()} className="bg-rose-50 px-5 py-3.5 rounded-xl border border-rose-200 active:bg-rose-100">
                <Text className="text-rose-600 font-jakarta-bold text-[15px]">Cancel</Text>
              </TouchableOpacity>
              
              {hasNextTab && showNextBtn && (
                <TouchableOpacity onPress={handleNextTab} className="bg-slate-100 px-6 py-3.5 rounded-xl border border-slate-200 active:bg-slate-200">
                  <Text className="text-slate-800 font-jakarta-bold text-[15px]">Next</Text>
                </TouchableOpacity>
              )}

              {!hasNextTab && (
                <TouchableOpacity onPress={handleSaveProduct} className="bg-blue-900 px-6 py-3.5 rounded-xl shadow-lg shadow-blue-900/30 active:opacity-90">
                  <Text className="text-white font-jakarta-bold text-[15px]">{isEditMode ? "Update" : "Save"}</Text>
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddProduct;