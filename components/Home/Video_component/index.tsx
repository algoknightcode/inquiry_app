import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = CARD_WIDTH * 0.65; // Increased height aspect ratio

const videoSource = require("../../../assets/Video/3D_graphic_animation_InquiryBazaar_202606191118 (1).mp4");

const VideoSection = () => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Setup video player with loop enabled
  const player = useVideoPlayer(videoSource, (setupPlayer) => {
    setupPlayer.loop = true;
    setupPlayer.muted = true;
  });

  // Manual play/pause control
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      try {
        if (player) player.pause();
      } catch (e) {
        console.warn('Error pausing video:', e);
      }
      setIsPlaying(false);
    } else {
      try {
        if (player) player.play();
      } catch (e) {
        console.warn('Error playing video:', e);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, player]);

  // Manual mute/unmute control
  const toggleMute = useCallback(() => {
    try {
      if (player) {
        player.muted = !isMuted;
      }
    } catch (e) {
      console.warn('Error toggling mute:', e);
    }
    setIsMuted(!isMuted);
  }, [isMuted, player]);

  return (
    <View className="mt-0 py-6 bg-slate-100"> 
      {/* Header Section */}
      <View className="mb-6 px-5">
        <Text className="text-[13px] font-jakarta-bold text-blue-700 tracking-[0.2em] mb-1.5 uppercase">
          INSIGHTS
        </Text>
        <Text className="text-[28px] font-jakarta-extrabold text-slate-950 tracking-tighter leading-none mb-1">
          Discover Global Trade
        </Text>
        <Text className="text-[18px] font-jakarta-medium text-slate-600">
          Connecting buyers and verified suppliers worldwide
        </Text>
      </View>

      {/* Full-Width Video Card Container */}
      <View 
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderTopWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: "rgba(226, 232, 240, 0.5)",
        }}
        className="bg-[#050912] overflow-hidden relative" 
      >
        <VideoView 
          style={{ width: "100%", height: "100%" }} 
          player={player}
          allowsPictureInPicture
          nativeControls={false}
          contentFit="cover" // Fills container without black bars
        />

        {/* Play & Mute Controls Overlay at the bottom */}
        <View className="absolute bottom-3 left-4 right-4 flex-row justify-between items-center z-10">
          {/* Play/Pause Button */}
          <Pressable 
            onPress={togglePlay}
            className="w-12 h-12 rounded-full backdrop-blur-lg items-center justify-center border border-white/20 active:scale-95 transition-all bg-black/50"
          >
            <FontAwesome 
              name={isPlaying ? "pause" : "play"} 
              size={18} 
              color="white" 
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </Pressable>

          {/* Mute/Unmute Button */}
          <Pressable 
            onPress={toggleMute}
            className="w-12 h-12 rounded-full backdrop-blur-lg items-center justify-center border border-white/20 active:scale-95 transition-all bg-black/50"
          >
            <Ionicons 
              name={isMuted ? "volume-mute" : "volume-high"} 
              size={22} 
              color="white" 
            />
          </Pressable>
        </View>
      </View>
    </View>
  ); 
};

// 4. Memoize the component to protect it from parent scrolls/updates
export default React.memo(VideoSection);