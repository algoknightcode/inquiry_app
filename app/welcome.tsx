import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import Logo from "../assets/images/logoo.webp";

const { width, height } = Dimensions.get("window");

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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative background glow circles */}
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
    backgroundColor: "#0A0F24", // Premium deep dark theme
    justifyContent: "center",
    alignItems: "center",
  },
  glow1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(217, 101, 10, 0.15)", // Orange glow
    blurRadius: 100,
  },
  glow2: {
    position: "absolute",
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(27, 42, 107, 0.3)", // Deep blue glow
    blurRadius: 120,
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 60,
  },
  logoContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logoShadowContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 30,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  logo: {
    width: 140,
    height: 140,
  },
  textContainer: {
    flex: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
    fontFamily: "PlusJakartaSans-Bold",
    marginBottom: 16,
  },
  highlight: {
    color: "#D9650A", // Signature orange brand color
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 25,
    paddingHorizontal: 10,
    fontWeight: "500",
  },
  btnContainer: {
    width: "100%",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#D9650A",
    width: "100%",
    height: 58,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D9650A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
