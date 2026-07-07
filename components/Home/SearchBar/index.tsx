import { fetchWithCache } from "@/utils/apiCache";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { moderateScale } from "react-native-size-matters";

// ── Types ──────────────────────────────────────────────────────────────────
interface SubCategory {
  _id: string;
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  subCategories?: SubCategory[];
}

interface Industry {
  _id: string;
  name: string;
  slug: string;
  categories?: Category[];
}

interface SearchBarProps {
  onFocus?: () => void;
  variant?: 'default' | 'compact';
}

export default function SearchBar({ onFocus, variant = 'default' }: SearchBarProps) {
  const router = useRouter();

  // Data states
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  // Search input & recommendation states
  const [inputText, setInputText] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Fetch the full industry tree on mount
  useEffect(() => {
    const loadTree = async () => {
      try {
        const json = await fetchWithCache("https://backend.inquirybazaar.com/api/industries/tree");
        if (json.success && Array.isArray(json.data)) {
          setIndustries(json.data);
        }
      } catch (err) {
        console.error("Error loading industries tree in SearchBar:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTree();
  }, []);

  // Flattened list of all subcategories in the tree
  const allSubCategories = useMemo(() => {
    return industries.flatMap((ind) => 
      (ind.categories || []).flatMap((cat) => cat.subCategories || [])
    );
  }, [industries]);

  // Fuzzy match scoring function
  const getFuzzyScore = (text: string, query: string): number => {
    const t = text.toLowerCase();
    const q = query.toLowerCase().trim();
    if (!q) return 1;
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 60;

    // Character sequence match
    let matches = 0;
    let qIdx = 0;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === q[qIdx]) {
        matches++;
        qIdx++;
        if (qIdx === q.length) break;
      }
    }
    return (matches / q.length) * 40;
  };

  // Filtered recommendations list
  const recommendations = useMemo(() => {
    if (!inputText.trim() || (selectedSubCategory && selectedSubCategory.name === inputText)) {
      return [];
    }
    return allSubCategories
      .map((sub) => ({ sub, score: getFuzzyScore(sub.name, inputText) }))
      .filter((item) => item.score > 10)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.sub)
      .slice(0, 5); // Limit to top 5 recommendations
  }, [inputText, allSubCategories, selectedSubCategory]);

  const handleSelectRecommendation = (sub: SubCategory) => {
    setSelectedSubCategory(sub);
    setInputText(sub.name);
    setShowRecommendations(false);
    router.push({
      pathname: "/Products_Page",
      params: {
        subCategoryId: sub._id,
        subCategoryName: sub.name,
        subCategorySlug: sub.slug,
      },
    });
  };

  const handleSearchSubmit = () => {
    // If we have a selected subcategory, route directly
    if (selectedSubCategory && selectedSubCategory.name === inputText) {
      router.push({
        pathname: "/Products_Page",
        params: {
          subCategoryId: selectedSubCategory._id,
          subCategoryName: selectedSubCategory.name,
          subCategorySlug: selectedSubCategory.slug,
        },
      });
      return;
    }

    // If no exact selection, look for closest matches
    if (inputText.trim()) {
      const bestMatch = allSubCategories
        .map((sub) => ({ sub, score: getFuzzyScore(sub.name, inputText) }))
        .filter((item) => item.score > 25) // Minimum score threshold for fuzzy submit match
        .sort((a, b) => b.score - a.score)[0]?.sub;

      if (bestMatch) {
        router.push({
          pathname: "/Products_Page",
          params: {
            subCategoryId: bestMatch._id,
            subCategoryName: bestMatch.name,
            subCategorySlug: bestMatch.slug,
          },
        });
        return;
      }
    }

    // Fallback: Go to general industries list if empty or no match
    router.push("/Industries");
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    setShowRecommendations(true);
    if (selectedSubCategory && selectedSubCategory.name !== text) {
      setSelectedSubCategory(null);
    }
  };

  const clearInput = () => {
    setInputText("");
    setSelectedSubCategory(null);
    setShowRecommendations(false);
  };

  return (
    <View className={variant === 'compact' ? "w-full z-50 relative" : "w-full px-4 my-2 z-50"}>
      <View 
        className={variant === 'compact' ? "bg-white rounded-full border border-slate-200 shadow-sm" : "bg-white rounded-[32px] p-2 shadow-2xl border border-slate-100/50"}
        style={variant === 'compact' ? {} : {
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.1,
          shadowRadius: 32,
          elevation: 10,
        }}
      >
        {/* Input Field Container */}
        <View className={variant === 'compact' ? "flex-row items-center bg-slate-50/80 rounded-full pl-3 pr-1 py-1" : "flex-row items-center bg-slate-50/80 border border-slate-200/60 rounded-[28px] pl-4 pr-1.5 py-1.5"}>
          <Ionicons name="search" size={variant === 'compact' ? 16 : moderateScale(20)} color="#94A3B8" />
          <TextInput
            className={variant === 'compact' ? "flex-1 h-9 px-2 text-[13px] text-slate-800 font-jakarta" : "flex-1 h-14 px-3 text-[15px] text-slate-800 font-jakarta"}
            placeholder="Search Products"
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={handleTextChange}
            onFocus={() => {
              setShowRecommendations(true);
              onFocus?.();
            }}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            clearButtonMode="never"
          />
          
          {inputText.length > 0 && (
            <TouchableOpacity onPress={clearInput} className="p-2 mr-1">
              <Ionicons name="close-circle" size={moderateScale(20)} color="#CBD5E1" />
            </TouchableOpacity>
          )}

          {/* Search Action Button */}
          {variant !== 'compact' && (
            <TouchableOpacity
              className="bg-emerald-700 rounded-[24px] px-6 h-12 items-center justify-center shadow-md shadow-emerald-900/20 ml-1"
              activeOpacity={0.85}
              onPress={handleSearchSubmit}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white text-[15px] font-jakarta-bold tracking-wide">Search</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Recommendations List */}
        {showRecommendations && recommendations.length > 0 && (
          <View 
            className={variant === 'compact' ? "absolute left-0 right-0 top-[110%] bg-white rounded-[16px] shadow-lg border border-slate-100 overflow-hidden z-50" : "bg-white mt-1 rounded-[24px] overflow-hidden"}
            style={variant === 'compact' ? {
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 5,
            } : {}}
          >
            {recommendations.map((item, index) => (
              <Pressable
                key={item._id}
                className={`flex-row items-center justify-between py-4 px-5 active:bg-slate-50 ${
                  index !== recommendations.length - 1 ? 'border-b border-slate-50' : ''
                }`}
                android_ripple={{ color: "#F1F5F9" }}
                onPress={() => handleSelectRecommendation(item)}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons name="trending-up-outline" size={moderateScale(16)} color="#94A3B8" className="mr-3" />
                  <Text 
                    className="text-[15px] text-slate-700 font-jakarta-medium flex-1"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={moderateScale(16)} color="#CBD5E1" />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
