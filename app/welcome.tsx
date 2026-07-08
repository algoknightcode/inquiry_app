import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";
import Logo from "../assets/images/logoo-Photoroom.png";
import { prefetchHomeData } from "../utils/prefetchHome";

// Duration for the loading bar to fill (ms). All home data loads within this window.
// 4.2 seconds is the optimal balance for preloading industries/tree without excessive wait
const LOADING_DURATION = 4200;

export default function Welcome() {
  const router = useRouter();

  // ── Animations ────────────────────────────────────────────────
  const logoScale        = useRef(new Animated.Value(0.3)).current;
  const logoOpacity      = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(40)).current;
  const contentOpacity   = useRef(new Animated.Value(0)).current;
  const btnScale         = useRef(new Animated.Value(1)).current;

  // Linear progress bar (0 → 1)
  const progressAnim     = useRef(new Animated.Value(0)).current;
  // Controls showing/hiding the button after loading completes
  const btnOpacity       = useRef(new Animated.Value(0)).current;
  const barOpacity       = useRef(new Animated.Value(1)).current;

  const [loadingDone, setLoadingDone] = useState(false);

  // ── Kick off all animations on mount ─────────────────────────
  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 15,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Text content entrance
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(contentTranslateY, {
          toValue: 0,
          tension: 20,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Fire all home API prefetches NOW — runs in parallel with the bar animation
    prefetchHomeData().catch(() => { /* silently ignore network errors on welcome */ });

    // Progress bar fills over LOADING_DURATION, then reveals button
    Animated.sequence([
      Animated.delay(300), // slight pause before bar starts
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: LOADING_DURATION,
        useNativeDriver: false, // width animation can't use native driver
      }),
    ]).start(() => {
      setLoadingDone(true);
      // Fade out the bar
      Animated.timing(barOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      // Fade in the button
      Animated.timing(btnOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
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

  // Interpolate progress value → bar width %
  const barWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Background glow circles */}
      <View style={s.glow1} />
      <View style={s.glow2} />

      <View style={s.content}>
        {/* Animated Logo */}
        <Animated.View style={[s.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <View style={s.logoShadowContainer}>
            <Image source={Logo} style={s.logo} resizeMode="contain" />
          </View>
        </Animated.View>

        {/* Animated Text */}
        <Animated.View
          style={[
            s.textContainer,
            { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
          ]}
        >
          <Text style={s.title}>
            Inquiry <Text style={s.highlight}>Bazaar</Text>
          </Text>
          <Text style={s.subtitle}>
            Your Premiere B2B Marketplace. Connecting buyers and verified sellers globally with ease.
          </Text>
        </Animated.View>

        {/* Loading bar OR Get Started button — occupies the same space */}
        <View style={s.bottomArea}>
          {/* Progress Bar */}
          <Animated.View style={[s.barWrapper, { opacity: barOpacity }]}>
            <View style={s.barTrack}>
              <Animated.View style={[s.barFill, { width: barWidth }]} />
            </View>
            <Text style={s.loadingLabel}>Loading…</Text>
          </Animated.View>

          {/* Get Started Button — fades in once loading done */}
          <Animated.View
            style={[
              s.btnContainer,
              {
                opacity: btnOpacity,
                transform: [{ scale: btnScale }],
                // Sit behind the bar until it fades out
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
              },
            ]}
            pointerEvents={loadingDone ? "auto" : "none"}
          >
            <TouchableOpacity activeOpacity={0.8} onPress={handleGetStarted} style={s.button}>
              <Text style={s.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  glow1: {
    position: "absolute",
    top: verticalScale(-100),
    right: scale(-100),
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: "rgba(217, 101, 10, 0.07)",
  },
  glow2: {
    position: "absolute",
    bottom: verticalScale(-150),
    left: scale(-150),
    width: scale(400),
    height: scale(400),
    borderRadius: scale(200),
    backgroundColor: "rgba(99, 102, 241, 0.08)",
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(30),
    paddingTop: verticalScale(80),
    paddingBottom: verticalScale(60),
  },
  logoContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logoShadowContainer: {
    backgroundColor: "#F8FAFC",
    padding: moderateScale(25),
    borderRadius: moderateScale(50),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: verticalScale(12) },
    shadowOpacity: 0.06,
    shadowRadius: moderateScale(20),
    elevation: 4,
  },
  logo: {
    width: scale(140),
    height: scale(140),
  },
  textContainer: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(36),
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
    fontFamily: "PlusJakartaSans-Bold",
    marginBottom: verticalScale(16),
  },
  highlight: {
    color: "#D9650A",
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: "#64748B",
    textAlign: "center",
    lineHeight: verticalScale(24),
    paddingHorizontal: scale(10),
    fontWeight: "500",
  },

  // ── Bottom area (progress bar + button share this space) ──────
  bottomArea: {
    width: "100%",
    height: verticalScale(72), // enough for bar label + button
    justifyContent: "flex-end",
    marginTop: verticalScale(20),
  },
  barWrapper: {
    width: "100%",
    alignItems: "center",
    paddingBottom: verticalScale(4),
  },
  barTrack: {
    width: "100%",
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: verticalScale(10),
  },
  barFill: {
    height: "100%",
    backgroundColor: "#D9650A",
    borderRadius: 4,
  },
  loadingLabel: {
    fontSize: moderateScale(12),
    color: "#94A3B8",
    fontFamily: "PlusJakartaSans-Medium",
    letterSpacing: 0.5,
  },

  // ── Get Started button ────────────────────────────────────────
  btnContainer: {
    width: "100%",
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: "#D9650A",
    width: "100%",
    height: verticalScale(54),
    borderRadius: moderateScale(18),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D9650A",
    shadowOffset: { width: 0, height: verticalScale(8) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(16),
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(17),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
