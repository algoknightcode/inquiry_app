import { fetchWithCache } from "@/utils/apiCache";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// ------------------------------------------------------------------
// 1. Types
// ------------------------------------------------------------------
interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  subCategories?: SubCategory[];
}

interface Industry {
  _id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  categories?: Category[];
}

interface ApiResponse {
  success: boolean;
  data: Industry[];
}

// ------------------------------------------------------------------
// 2. Component — uses plain horizontal FlatList (no gesture conflicts)
// ------------------------------------------------------------------
export default function IndustryTreeCarousel() {
  const router = useRouter();
  const [data, setData] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList<Industry>>(null);

  useEffect(() => {
    (async () => {
      try {
        const json: ApiResponse = await fetchWithCache(
          "https://backend.inquirybazaar.com/api/industries/tree"
        );
        if (json.success && json.data) {
          setData(json.data.filter((i) => (i.categories?.length ?? 0) >= 4));
        } else {
          throw new Error("Invalid response");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={s.stateBox}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={s.stateText}>Loading industries…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.stateBox}>
        <Text style={[s.stateText, { color: "#ef4444" }]}>Error: {error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Industry }) => {
    const cats = item.categories?.slice(0, 4) ?? [];

    const handleIndustryPress = () => {
      router.push({
        pathname: "/GrId_MainCategory",
        params: { id: item._id, name: item.name }
      });
    };

    return (
      <View style={s.slide}>
        {/* Industry title */}
        <Pressable onPress={handleIndustryPress}>
          <Text style={s.industryName} numberOfLines={1}>
            {item.name}
          </Text>
        </Pressable>

        {/* Hero image */}
        <Pressable style={s.heroWrap} onPress={handleIndustryPress}>
          <Image
            source={{ uri: item.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            transition={300}
          />
        </Pressable>

        {/* 2×2 grid */}
        <View style={s.grid}>
          {cats.map((cat) => (
            <Pressable 
              key={cat._id} 
              style={s.catCard}
              onPress={() => router.push({
                pathname: "/SubCategory",
                params: { categoryId: cat._id, categoryName: cat.name, industryId: item._id }
              })}
            >
              {/* Fixed-height header keeps all 4 cards aligned */}
              <View style={s.catHeader}>
                <View style={s.catThumb}>
                  <Image
                    source={{ uri: cat.imageUrl }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={200}
                  />
                </View>
                <Text style={s.catName} numberOfLines={2} ellipsizeMode="tail">
                  {cat.name}
                </Text>
              </View>

              <View style={s.divider} />

              {/* Always 3 slots — prevents height jumps */}
              <View style={s.subList}>
                {Array.from({ length: 3 }).map((_, i) => {
                  const sub = cat.subCategories?.[i];
                  return (
                    <Pressable 
                      key={i} 
                      style={s.subRow}
                      disabled={!sub}
                      onPress={() => sub && router.push({
                        pathname: "/Products_Page",
                        params: {
                          subCategoryId: sub._id,
                          subCategoryName: sub.name,
                          subCategorySlug: sub.slug,
                        }
                      })}
                    >
                      <View style={s.dot} />
                      <Text
                        style={sub ? s.subName : s.subEmpty}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {sub?.name ?? ""}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          ))}
        </View>

        {/* CTA */}
        <Pressable 
          style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
          onPress={handleIndustryPress}
        >
          <Text style={s.ctaText}>View All Categories</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={s.root}>
      {data.length > 0 ? (
        <>
          <FlatList
            ref={flatRef}
            data={data}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            // ↓ Critical: lets the parent vertical ScrollView capture
            //   vertical gestures while this list handles horizontal ones
            nestedScrollEnabled
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / screenWidth
              );
              setActiveIndex(idx);
            }}
          />
          <View style={s.dotsRow}>
            {data.map((_, i) => (
              <View
                key={i}
                style={[
                  s.dotIndicator,
                  activeIndex === i && s.dotActive,
                ]}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={s.stateBox}>
          <Text style={s.stateText}>No industries found.</Text>
        </View>
      )}
    </View>
  );
}

// ------------------------------------------------------------------
// 3. Styles — light theme
// ------------------------------------------------------------------
const WHITE  = "#ffffff";
const BG     = "#f8fafc";
const BORDER = "#e2e8f0";
const NAVY   = "#0f172a";
const BLUE   = "#1d4ed8";
const BLUE_L = "#3b82f6";
const ACCENT = "#1d4ed8";

const s = StyleSheet.create({
  root: { backgroundColor: BG },

  stateBox: {
    height: 560,
    backgroundColor: BG,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  stateText: {
    color: "#64748b",
    fontSize: 14,
  },

  // ── Slide ───────────────────────────────────────────────────────
  slide: {
    width: screenWidth,
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  industryName: {
    color: NAVY,
    fontSize: 26,
    fontFamily: "PlusJakartaSans-ExtraBold",
    letterSpacing: -0.8,
    marginBottom: 14,
  },

  // ── Hero ────────────────────────────────────────────────────────
  heroWrap: {
    width: "100%",
    height: 150,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },

  // ── Grid ────────────────────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 8,
  },

  catCard: {
    width: "49%",
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 11,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  catHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    minHeight: 48,
  },

  catThumb: {
    width: 42,
    height: 42,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: BG,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: BORDER,
  },

  catName: {
    flex: 1,
    color: "#1e293b",
    fontSize: 12,
    fontFamily: "PlusJakartaSans-Bold",
    lineHeight: 16,
    letterSpacing: -0.2,
    minHeight: 32,
  },

  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 8,
  },

  subList: { gap: 5 },

  subRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 17,
    gap: 6,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: BLUE_L,
    flexShrink: 0,
  },

  subName: {
    flex: 1,
    color: ACCENT,
    fontSize: 11,
    fontFamily: "PlusJakartaSans-Medium",
    letterSpacing: -0.1,
  },

  subEmpty: {
    flex: 1,
    fontSize: 11,
    color: "transparent",
  },

  // ── CTA ─────────────────────────────────────────────────────────
  cta: {
    backgroundColor: BLUE,
    borderRadius: 50,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaText: {
    color: WHITE,
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15,
    letterSpacing: -0.3,
  },

  // ── Dot indicators ──────────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: 0,
    backgroundColor: WHITE,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#cbd5e1",
  },
  dotActive: {
    width: 20,
    backgroundColor: BLUE,
    borderRadius: 3,
  },
});