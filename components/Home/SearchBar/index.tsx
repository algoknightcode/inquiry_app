import { fetchWithCache } from "@/utils/apiCache";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
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

// ── Memoized Recommendation Row (Prevents re-renders during typing) ──
const RecommendationRow = React.memo(({ 
  item, 
  isLast, 
  onPress 
}: { 
  item: SubCategory; 
  isLast: boolean; 
  onPress: (sub: SubCategory) => void 
}) => {
  return (
    <Pressable
      className={`flex-row items-center justify-between px-5 ${
        !isLast ? 'border-b border-slate-50' : ''
      }`}
      style={styles.recommendationRow} // Rigid Height
      android_ripple={{ color: "#F1F5F9" }}
      onPress={() => onPress(item)}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons name="trending-up-outline" size={moderateScale(16)} color="#94A3B8" className="mr-3" />
        <Text 
          className="text-slate-700 font-jakarta-medium flex-1"
          style={styles.recommendationText}
          numberOfLines={1}
          maxFontSizeMultiplier={1.2}
        >
          {item.name}
        </Text>
      </View>
      <Ionicons name="arrow-forward" size={moderateScale(16)} color="#CBD5E1" />
    </Pressable>
  );
});

export default function SearchBar({ onFocus, variant = 'default' }: SearchBarProps) {
  const router = useRouter();

  // Data states
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  // Search input & recommendation states
  const [inputText, setInputText] = useState("");
  const [debouncedText, setDebouncedText] = useState(""); // UI Thread Optimizer
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const isCompact = variant === 'compact';

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

  // ── PERFORMANCE UPGRADE: Debounce Typing ──
  // Prevents the heavy fuzzy search from running on every single keystroke, saving CPU
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(inputText);
    }, 150);
    return () => clearTimeout(timer);
  }, [inputText]);

  // Flattened list of all subcategories in the tree (Memoized once)
  const allSubCategories = useMemo(() => {
    return industries.flatMap((ind) => 
      (ind.categories || []).flatMap((cat) => cat.subCategories || [])
    );
  }, [industries]);

  // Fuzzy match scoring function
  const getFuzzyScore = useCallback((text: string, query: string): number => {
    const t = text.toLowerCase();
    const q = query.toLowerCase().trim();
    if (!q) return 1;
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 60;

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
  }, []);

  // Filtered recommendations list (Runs against Debounced Text for 60FPS typing)
  const recommendations = useMemo(() => {
    if (!debouncedText.trim() || (selectedSubCategory && selectedSubCategory.name === debouncedText)) {
      return [];
    }
    return allSubCategories
      .map((sub) => ({ sub, score: getFuzzyScore(sub.name, debouncedText) }))
      .filter((item) => item.score > 10)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.sub)
      .slice(0, 5); // Limit to top 5 recommendations strictly
  }, [debouncedText, allSubCategories, selectedSubCategory, getFuzzyScore]);

  // ── Actions ──
  const handleSelectRecommendation = useCallback((sub: SubCategory) => {
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
  }, [router]);

  const handleSearchSubmit = useCallback(() => {
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

    if (inputText.trim()) {
      const bestMatch = allSubCategories
        .map((sub) => ({ sub, score: getFuzzyScore(sub.name, inputText) }))
        .filter((item) => item.score > 25) 
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

    router.push("/Industries");
  }, [inputText, selectedSubCategory, allSubCategories, getFuzzyScore, router]);

  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
    setShowRecommendations(true);
    if (selectedSubCategory && selectedSubCategory.name !== text) {
      setSelectedSubCategory(null);
    }
  }, [selectedSubCategory]);

  const clearInput = useCallback(() => {
    setInputText("");
    setSelectedSubCategory(null);
    setShowRecommendations(false);
  }, []);

  return (
    <View className={isCompact ? "w-full z-50 relative" : "w-full px-4 my-2 z-50"}>
      <View 
        className={isCompact 
          ? "bg-white rounded-full border border-slate-200" 
          : "bg-white rounded-[32px] p-2 border border-slate-200"
        }
        style={!isCompact ? styles.defaultShadow : {}}
      >
        {/* Input Field Container - Enforced Rigid Heights */}
        <View 
          className={isCompact 
            ? "flex-row items-center bg-slate-50/80 rounded-full pl-3 pr-1 py-1" 
            : "flex-row items-center bg-slate-50/80 border border-slate-200/60 rounded-[28px] pl-4 pr-1.5"
          }
          style={isCompact ? styles.compactInputWrapper : styles.defaultInputWrapper}
        >
          <Ionicons name="search" size={isCompact ? 16 : moderateScale(20)} color="#94A3B8" />
          
          <TextInput
            className={isCompact 
              ? "flex-1 px-2 text-[13px] text-slate-800 font-jakarta" 
              : "flex-1 px-3 text-[15px] text-slate-800 font-jakarta"
            }
            style={isCompact ? styles.compactTextInput : styles.defaultTextInput}
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
            maxFontSizeMultiplier={1.2} // Protects UI from massive accessibility fonts
          />
          
          {inputText.length > 0 && (
            <TouchableOpacity onPress={clearInput} className="p-2 mr-1" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={moderateScale(20)} color="#CBD5E1" />
            </TouchableOpacity>
          )}

          {/* Search Action Button */}
          {!isCompact && (
            <TouchableOpacity
              className="bg-emerald-700 rounded-[24px] px-6 items-center justify-center ml-1"
              style={styles.defaultSearchButton}
              activeOpacity={0.85}
              onPress={handleSearchSubmit}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text 
                  className="text-white font-jakarta-bold tracking-wide"
                  style={{ fontSize: 15 }}
                  maxFontSizeMultiplier={1.1}
                >
                  Search
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Recommendations List */}
        {showRecommendations && recommendations.length > 0 && (
          <View 
            className={isCompact 
              ? "absolute left-0 right-0 top-[110%] bg-white rounded-[16px] border border-slate-200 overflow-hidden z-50" 
              : "bg-white mt-1 rounded-[24px] border border-slate-200 overflow-hidden"
            }
            style={isCompact ? styles.compactDropdownShadow : {}}
          >
            {recommendations.map((item, index) => (
              <RecommendationRow 
                key={item._id}
                item={item}
                isLast={index === recommendations.length - 1}
                onPress={handleSelectRecommendation}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ── Rigid Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  defaultShadow: {},
  compactDropdownShadow: {},
  // Rigid Dimensions preventing layout shift
  defaultInputWrapper: {
    height: 60, // Locked height for default container
  },
  compactInputWrapper: {
    height: 40, // Locked height for compact container
  },
  defaultTextInput: {
    height: '100%', // Fills locked wrapper
    paddingVertical: 0,
  },
  compactTextInput: {
    height: '100%', // Fills locked wrapper
    paddingVertical: 0,
  },
  defaultSearchButton: {
    height: 48, // Rigid button height
  },
  recommendationRow: {
    height: 56, // Locked height per recommendation (ensures exact touch targets)
  },
  recommendationText: {
    fontSize: 15,
  }
});