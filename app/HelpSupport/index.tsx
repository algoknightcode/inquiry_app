import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ImageBackground,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ContactUs() {
  const insets = useSafeAreaInsets();
  
  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Link Handlers
  const handleCall = () => Linking.openURL("tel:+917303486777");
  const handleEmail = () => Linking.openURL("mailto:care@inquirybazaar.com");

  // Form Submit Handler
  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Message Sent! We will get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        bounces={false}
      >
        {/* ── HERO SECTION ── */}
        <ImageBackground
          // Replace with require('../../assets/bgcontact.png') if you have the local file
          source={{ uri: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" }} 
          className="w-full h-80 justify-center items-center"
          imageStyle={{ opacity: 0.2, backgroundColor: "#0F172A" }} // Dark overlay fallback
        >
          <View style={{ paddingTop: insets.top }} className="w-full h-full justify-center items-center px-6 bg-slate-900/60">
            <Text className="text-4xl font-extrabold text-white mb-3 tracking-tight text-center">
              Contact Us
            </Text>
            <Text className="text-[16px] text-slate-200 text-center leading-6 font-medium">
              We're here to help. Reach out to us for any questions, support, or business inquiries.
            </Text>
          </View>
        </ImageBackground>

        {/* ── QUICK ACTION CARDS (Overlapping Hero) ── */}
        <View className="flex-row px-4 -mt-12 justify-between w-full">
          {/* Call Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleCall}
            className="bg-white flex-1 mr-2 px-3 py-5 rounded-3xl shadow-sm shadow-slate-200 border border-slate-100 items-center"
          >
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-3">
              <Ionicons name="call" size={22} color="#1E3A8A" />
            </View>
            <Text className="text-[13px] text-slate-500 font-bold mb-1 uppercase tracking-wider">
              Customer Service
            </Text>
            <Text 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.9}
              className="text-[13px] font-extrabold text-slate-900"
            >
              +91 7303486777
            </Text>
          </TouchableOpacity>

          {/* Email Card */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleEmail}
            className="bg-white flex-1 ml-2 px-2 py-5 rounded-3xl shadow-sm shadow-slate-200 border border-slate-100 items-center"
          >
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-3">
              <Ionicons name="mail" size={22} color="#1E3A8A" />
            </View>
            <Text className="text-[13px] text-slate-500 font-bold mb-1 uppercase tracking-wider">
              Write To Us
            </Text>
            <Text 
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.9}
              className="text-[13px] font-extrabold text-slate-900 text-center leading-tight"
            >
              care@inquirybazaar.com
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── CONTACT FORM ── */}
        <View className="bg-white mx-4 mt-6 p-6 rounded-3xl shadow-sm shadow-slate-200 border border-slate-100">
          <Text className="text-2xl font-extrabold text-slate-900 mb-2">
            Send Us a Message
          </Text>
          <Text className="text-[14px] text-slate-500 mb-6 leading-5">
            Fill out the form below and we'll get back to you as soon as possible.
          </Text>

          <View className="space-y-4">
            {/* Full Name */}
            <View>
              <Text className="text-[13px] font-bold text-slate-700 mb-2 ml-1">Full Name</Text>
              <TextInput
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Enter your name"
                placeholderTextColor="#94A3B8"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 text-[15px] text-slate-900 focus:border-blue-600 focus:bg-blue-50/30"
              />
            </View>

            {/* Email Address */}
            <View>
              <Text className="text-[13px] font-bold text-slate-700 mb-2 ml-1">Email Address</Text>
              <TextInput
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 text-[15px] text-slate-900 focus:border-blue-600 focus:bg-blue-50/30"
              />
            </View>

            {/* Phone Number */}
            <View>
              <Text className="text-[13px] font-bold text-slate-700 mb-2 ml-1">Phone Number</Text>
              <TextInput
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="Enter your phone number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 h-14 text-[15px] text-slate-900 focus:border-blue-600 focus:bg-blue-50/30"
              />
            </View>

            {/* Message */}
            <View>
              <Text className="text-[13px] font-bold text-slate-700 mb-2 ml-1">Message</Text>
              <TextInput
                value={form.message}
                onChangeText={(text) => setForm({ ...form, message: text })}
                placeholder="Write your message..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 min-h-[120px] text-[15px] text-slate-900 focus:border-blue-600 focus:bg-blue-50/30"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-[#1E3A8A] h-14 rounded-2xl items-center justify-center mt-2 shadow-lg shadow-blue-900"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-[16px]">Send Message</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── OFFICE DETAILS ── */}
        <View className="bg-[#1E3A8A] mx-4 mt-6 p-6 rounded-3xl border border-blue-800 shadow-xl shadow-blue-900">
          <Text className="text-xl font-extrabold text-white mb-6">

            Contact Information
          </Text>

          <View className="space-y-6">
            {/* Address */}
            <View className="flex-row pr-4">
              <View className="w-10 items-center mt-1">
                <Ionicons name="location" size={22} color="#93C5FD" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-white mb-1">Head Office</Text>
                <Text className="text-[14px] text-blue-100 leading-5 pr-2">
                  Office No. 605-606, 6th Floor, Best Business Park, Netaji Subhash Place, Delhi, 110034
                </Text>
              </View>
            </View>

            {/* Business Hours */}
            <View className="flex-row">
              <View className="w-10 items-center mt-1">
                <Ionicons name="time" size={22} color="#93C5FD" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-white mb-1">Business Hours</Text>
                <Text className="text-[14px] text-blue-100 mb-1">Monday - Saturday: 9:00 AM - 6:30 PM</Text>
                <Text className="text-[14px] text-blue-200">Sunday: Closed</Text>
              </View>
            </View>

            {/* Support */}
            <View className="flex-row">
              <View className="w-10 items-center mt-1">
                <MaterialCommunityIcons name="headset" size={22} color="#93C5FD" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-white mb-1">Customer Support</Text>
                <Text className="text-[14px] text-blue-100">Available 24/7 for urgent inquiries.</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}