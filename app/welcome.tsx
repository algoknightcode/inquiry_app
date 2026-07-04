import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import Logo from "../assets/images/logoo-Photoroom.png";

export default function Welcome() {
  const router = useRouter();

  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(40)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence animations for smooth entry
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
  }, []);

  const handleGetStarted = async () => {
    // Button spring press feedback
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      router.replace("/(auth)/choose-role");
    });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Decorative background glow circles for light theme */}
      <View style={s.glow1} />
      <View style={s.glow2} />

      <View style={s.content}>
        {/* Animated Logo Section */}
        <Animated.View style={[s.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <View style={s.logoShadowContainer}>
            <Image source={Logo} style={s.logo} resizeMode="contain" />
          </View>
        </Animated.View>

        {/* Animated Text Content */}
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

        {/* Animated CTA Button */}
        <Animated.View style={[s.btnContainer, { opacity: contentOpacity, transform: [{ scale: btnScale }] }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleGetStarted} style={s.button}>
            <Text style={s.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Clean premium white background
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
    backgroundColor: "rgba(217, 101, 10, 0.07)", // Very soft signature orange brand glow
  },
  glow2: {
    position: "absolute",
    bottom: verticalScale(-150),
    left: scale(-150),
    width: scale(400),
    height: scale(400),
    borderRadius: scale(200),
    backgroundColor: "rgba(99, 102, 241, 0.08)", // Very soft indigo/blue glow
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
    backgroundColor: "#F8FAFC", // Soft slate/white box for logo
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
    color: "#0F172A", // Dark theme-compliant text
    textAlign: "center",
    letterSpacing: -0.5,
    fontFamily: "PlusJakartaSans-Bold",
    marginBottom: verticalScale(16),
  },
  highlight: {
    color: "#D9650A", // Signature orange brand color
  },
  subtitle: {
    fontSize: moderateScale(15),
    color: "#64748B", // Slate gray readability contrast
    textAlign: "center",
    lineHeight: verticalScale(24),
    paddingHorizontal: scale(10),
    fontWeight: "500",
  },
  btnContainer: {
    width: "100%",
    justifyContent: "flex-end",
    marginTop: verticalScale(20),
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
