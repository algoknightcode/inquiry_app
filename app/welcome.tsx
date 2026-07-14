import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Logo from "../assets/images/logoo-Photoroom.png";
import { prefetchHomeData } from "../utils/prefetchHome";

// Duration for the loading bar to fill (ms).
const LOADING_DURATION = 4200;

export default function Welcome() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Animations ────────────────────────────────────────────────
  const logoScale        = useRef(new Animated.Value(0.3)).current;
  const logoOpacity      = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(40)).current;
  const contentOpacity   = useRef(new Animated.Value(0)).current;
  const btnScale         = useRef(new Animated.Value(1)).current;
  const progressAnim     = useRef(new Animated.Value(0)).current;
  const btnOpacity       = useRef(new Animated.Value(0)).current;
  const barOpacity       = useRef(new Animated.Value(1)).current;

  // ── Kick off all animations on mount ─────────────────────────
  useEffect(() => {
    // 1. Kick off API prefetch immediately in the background
    prefetchHomeData().catch((err) => console.log("Prefetch error:", err));

    // 2. Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 15, friction: 6, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();

    // 3. Text content entrance
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(contentTranslateY, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ]).start();

    // 4. Progress bar fills, then reveal button
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: LOADING_DURATION,
        useNativeDriver: false, // width animation requires false
      }),
    ]).start(() => {
      setIsLoaded(true);
      Animated.parallel([
        Animated.timing(barOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  const handleGetStarted = useCallback(() => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start(() => {
      router.replace("/(auth)/choose-role");
    });
  }, []);

  const barWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={s.glow1} />
      <View style={s.glow2} />

      <View style={s.content}>
        <Animated.View style={[s.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <View style={s.logoShadowContainer}>
            <Image source={Logo} style={s.logo} contentFit="contain" />
          </View>
        </Animated.View>

        <Animated.View style={[s.textContainer, { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] }]}>
          <Text style={s.title}>Inquiry <Text style={s.highlight}>Bazaar</Text></Text>
          <Text style={s.subtitle}>Your Premiere B2B Marketplace. Connecting buyers and verified sellers globally with ease.</Text>
        </Animated.View>

        <View style={s.bottomArea}>
          <Animated.View style={[s.barWrapper, { opacity: barOpacity }]} pointerEvents={isLoaded ? "none" : "auto"}>
            <View style={s.barTrack}>
              <Animated.View style={[s.barFill, { width: barWidth }]} />
            </View>
            <Text style={s.loadingLabel}>Loading Content...</Text>
          </Animated.View>

          <Animated.View style={[s.btnContainer, { opacity: btnOpacity, transform: [{ scale: btnScale }] }]} pointerEvents={isLoaded ? "auto" : "none"}>
            <TouchableOpacity disabled={!isLoaded} activeOpacity={0.8} onPress={handleGetStarted} style={s.button}>
              <Text style={s.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center" },
  glow1: { position: "absolute", top: verticalScale(-100), right: scale(-100), width: scale(300), height: scale(300), borderRadius: scale(150), backgroundColor: "rgba(217, 101, 10, 0.07)" },
  glow2: { position: "absolute", bottom: verticalScale(-150), left: scale(-150), width: scale(400), height: scale(400), borderRadius: scale(200), backgroundColor: "rgba(99, 102, 241, 0.08)" },
  content: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center", paddingHorizontal: scale(30), paddingTop: verticalScale(80), paddingBottom: verticalScale(60) },
  logoContainer: { flex: 2, justifyContent: "center", alignItems: "center" },
  logoShadowContainer: { backgroundColor: "#F8FAFC", padding: moderateScale(25), borderRadius: moderateScale(50), borderWidth: 1, borderColor: "#E2E8F0" },
  logo: { width: scale(140), height: scale(140) },
  textContainer: { flex: 1.5, alignItems: "center", justifyContent: "center", marginTop: verticalScale(20) },
  title: { fontSize: moderateScale(36), fontWeight: "900", color: "#0F172A", textAlign: "center", letterSpacing: -0.5, marginBottom: verticalScale(16) },
  highlight: { color: "#D9650A" },
  subtitle: { fontSize: moderateScale(15), color: "#64748B", textAlign: "center", lineHeight: verticalScale(24), paddingHorizontal: scale(10), fontWeight: "500" },
  bottomArea: { width: "100%", height: verticalScale(72), justifyContent: "center", marginTop: verticalScale(20) },
  barWrapper: { width: "100%", alignItems: "center" },
  barTrack: { width: "100%", height: 5, backgroundColor: "#E2E8F0", borderRadius: 4, overflow: "hidden", marginBottom: verticalScale(10) },
  barFill: { height: "100%", backgroundColor: "#D9650A", borderRadius: 4 },
  loadingLabel: { fontSize: moderateScale(12), color: "#94A3B8", letterSpacing: 0.5 },
  btnContainer: { position: "absolute", width: "100%" },
  button: { backgroundColor: "#D9650A", width: "100%", height: verticalScale(54), borderRadius: moderateScale(18), justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontSize: moderateScale(17), fontWeight: "700", letterSpacing: 0.5 },
});