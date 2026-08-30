import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, TouchableOpacity, View } from "react-native";
import {
  HERO_GRADIENT_COLORS,
  HERO_GRADIENT_END,
  HERO_GRADIENT_LOCATIONS,
  HERO_GRADIENT_START,
} from "../constants/theme";

const CARD_HEIGHT = 108;

export function AIActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flex: 1 }}>
      <LinearGradient
        colors={HERO_GRADIENT_COLORS}
        locations={HERO_GRADIENT_LOCATIONS}
        start={HERO_GRADIENT_START}
        end={HERO_GRADIENT_END}
        style={{
          height: CARD_HEIGHT,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            inset: 0,
            padding: 16,
          }}
        >
          <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mb-3">
            <Feather name={icon} size={16} color="#fff" />
          </View>
          <Text className="text-white text-[13px] font-semibold mb-0.5">
            {title}
          </Text>
          <Text className="text-white/70 text-[11px]">{subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
