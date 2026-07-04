import React from "react";
import { ActivityIndicator, ActivityIndicatorProps } from "react-native";

export interface SpinnerProps extends ActivityIndicatorProps {
  // Add any custom extensions here if needed
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "large",
  color = "grey",
  ...props
}) => {
  return (
    <ActivityIndicator
      size={size}
      color={color}
      {...props}
    />
  );
};
