import React, { useRef, useState } from "react";
import { Modal, View, TouchableOpacity, Dimensions, Animated } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, State } from "react-native-gesture-handler";

interface ZoomableModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string;
}

const ZoomableImageModal = ({ visible, onClose, imageUri }: ZoomableModalProps) => {
  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
  const IMG_H = SCREEN_H * 0.8;

  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = useRef(Animated.multiply(baseScale, pinchScale)).current;
  const lastScale = useRef(1);
  const [isZoomed, setIsZoomed] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  );

  const onPinchStateChange = (event: any) => {
    const { state, oldState, scale: gestureScale } = event.nativeEvent;

    if (state === State.ACTIVE) {
      setIsZoomed(true);
    }

    if (oldState === State.ACTIVE) {
      const next = Math.max(1, Math.min(4, lastScale.current * gestureScale));
      lastScale.current = next;
      baseScale.setValue(next);
      pinchScale.setValue(1);

      if (next <= 1.05) {
        lastScale.current = 1;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;
        translateX.flattenOffset();
        translateY.flattenOffset();
        Animated.parallel([
          Animated.spring(baseScale, { toValue: 1, useNativeDriver: true }),
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        ]).start();
        setIsZoomed(false);
      }
    }
  };

  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onPanStateChange = (event: any) => {
    const { state, oldState, translationX: tx, translationY: ty } = event.nativeEvent;

    if (state === State.BEGAN) {
      translateX.setOffset(lastTranslateX.current);
      translateX.setValue(0);
      translateY.setOffset(lastTranslateY.current);
      translateY.setValue(0);
    }

    if (oldState === State.ACTIVE) {
      const s = lastScale.current;
      const maxX = (SCREEN_W * (s - 1)) / 2;
      const maxY = (IMG_H * (s - 1)) / 2;

      const newX = Math.max(-maxX, Math.min(maxX, lastTranslateX.current + tx));
      const newY = Math.max(-maxY, Math.min(maxY, lastTranslateY.current + ty));

      lastTranslateX.current = newX;
      lastTranslateY.current = newY;

      translateX.flattenOffset();
      translateY.flattenOffset();
      translateX.setValue(newX);
      translateY.setValue(newY);
    }
  };

  const handleClose = () => {
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
    baseScale.setValue(1);
    pinchScale.setValue(1);
    translateX.setValue(0);
    translateY.setValue(0);
    setIsZoomed(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleClose}>
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.95)", justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
            onPress={handleClose}
            style={{ position: "absolute", top: 50, right: 20, zIndex: 10, padding: 8, backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 20 }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>

          <PanGestureHandler
            ref={panRef}
            enabled={isZoomed}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanStateChange}
            simultaneousHandlers={pinchRef}
            minPointers={1}
            maxPointers={2}
            avgTouches
          >
            <Animated.View style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}>
              <PinchGestureHandler
                ref={pinchRef}
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
                simultaneousHandlers={panRef}
              >
                <Animated.View
                  style={{
                    width: SCREEN_W,
                    height: IMG_H,
                    transform: [{ translateX }, { translateY }, { scale }],
                  }}
                >
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                  />
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </View>
    </Modal>
  );
};

export default ZoomableImageModal;
