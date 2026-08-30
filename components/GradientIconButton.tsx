import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import {
  HERO_GRADIENT_COLORS,
  HERO_GRADIENT_END,
  HERO_GRADIENT_LOCATIONS,
  HERO_GRADIENT_START,
} from "../constants/theme";

export function GradientIconButton({
  icon,
  size = 64,
  iconSize = 24,
  loading,
  disabled,
  onPress,
  borderColor,
}: {
  icon: keyof typeof Feather.glyphMap;
  size?: number;
  iconSize?: number;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  borderColor?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={HERO_GRADIENT_COLORS}
        locations={HERO_GRADIENT_LOCATIONS}
        start={HERO_GRADIENT_START}
        end={HERO_GRADIENT_END}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          ...(borderColor
            ? { borderWidth: 3, borderColor }
            : null),
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Feather name={icon} size={iconSize} color="#fff" />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
