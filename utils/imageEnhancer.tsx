import React, { useEffect, useMemo } from "react";
import { View, ActivityIndicator } from "react-native";
import { Canvas, Image as SkiaImage, useImage, useCanvasRef, Skia, TileMode, Group } from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system/legacy";

interface EnhancedImageProps {
  sourceUri: string;
  width: number;
  height: number;
  onExtractImage: (uri: string) => void;
}

export const EnhancedImage = ({ sourceUri, width, height, onExtractImage }: EnhancedImageProps) => {
  const image = useImage(sourceUri);
  const canvasRef = useCanvasRef();

  const paint = useMemo(() => {
    // 1. Brightness (1.05 - subtle boost)
    const brightnessMatrix = [
      1, 0, 0, 0, 0.05,
      0, 1, 0, 0, 0.05,
      0, 0, 1, 0, 0.05,
      0, 0, 0, 1, 0
    ];

    // 2. Saturate (1.15 - natural color enhancement)
    const saturation = 1.15;
    const rWeight = 0.2126;
    const gWeight = 0.7152;
    const bWeight = 0.0722;
    const r = (1.0 - saturation) * rWeight;
    const g = (1.0 - saturation) * gWeight;
    const b = (1.0 - saturation) * bWeight;
    const saturationMatrix = [
      r + saturation, g, b, 0, 0,
      r, g + saturation, b, 0, 0,
      r, g, b + saturation, 0, 0,
      0, 0, 0, 1, 0
    ];

    // 3. Contrast (1.15 - clean, natural contrast boost)
    const contrast = 1.15;
    const t = (1.0 - contrast) / 2.0;
    const contrastMatrix = [
      contrast, 0, 0, 0, t,
      0, contrast, 0, 0, t,
      0, 0, contrast, 0, t,
      0, 0, 0, 1, 0
    ];

    // 3x3 Sharpen Kernel (gentle sharpening)
    const sharpenKernel = [
       0, -1.0,  0,
      -1.0,  5, -1.0,
       0, -1.0,  0
    ];

    const brightnessFilter = Skia.ColorFilter.MakeMatrix(brightnessMatrix);
    const saturationFilter = Skia.ColorFilter.MakeMatrix(saturationMatrix);
    const contrastFilter = Skia.ColorFilter.MakeMatrix(contrastMatrix);
    
    // Chain them using compose
    const composedColorFilter = Skia.ColorFilter.MakeCompose(
      contrastFilter,
      Skia.ColorFilter.MakeCompose(saturationFilter, brightnessFilter)
    );
    
    const colorImageFilter = Skia.ImageFilter.MakeColorFilter(composedColorFilter, null);

    // Apply sharpen convolution filter
    const sharpenFilter = Skia.ImageFilter.MakeMatrixConvolution(
      3, 3, // kernel size
      sharpenKernel,
      1, // gain
      0, // bias
      1, 1, // kernel offset (X, Y)
      TileMode.Clamp,
      false, // convolveAlpha
      colorImageFilter // input filter
    );

    const p = Skia.Paint();
    p.setImageFilter(sharpenFilter);
    return p;
  }, []);

  useEffect(() => {
    if (image) {
      const timer = setTimeout(async () => {
        try {
          const snapshot = canvasRef.current?.makeImageSnapshot();
          if (snapshot) {
            const base64 = snapshot.encodeToBase64();
            const localUri = `${FileSystem.cacheDirectory}enhanced_${Date.now()}.png`;
            await FileSystem.writeAsStringAsync(localUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            onExtractImage(localUri);
          }
        } catch (err) {
          console.error("Error generating enhanced image:", err);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [image, width, height]);

  if (!image) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="#10B981" />
      </View>
    );
  }

  return (
    <Canvas ref={canvasRef} style={{ width, height }}>
      <Group layer={paint}>
        <SkiaImage
          image={image}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        />
      </Group>
    </Canvas>
  );
};
