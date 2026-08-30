import {
  extractTransactionFromVoice,
  ExtractedTransaction,
} from "../lib/services/extractTransaction";
import { GradientIconButton } from "../components/GradientIconButton";
import {
  COLORS,
  HERO_GRADIENT_COLORS,
  HERO_GRADIENT_END,
  HERO_GRADIENT_LOCATIONS,
  HERO_GRADIENT_START,
} from "../constants/theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { File } from "expo-file-system";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Linking, Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Status = "idle" | "recording" | "processing" | "permission" | "error";

function PulseRing({ delay, active }: { delay: number; active: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }
    progress.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
  }, [active, progress, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: (1 - progress.value) * 0.5,
    transform: [{ scale: 1 + progress.value * 0.9 }],
  }));

  return (
    <Animated.View
      style={style}
      className="absolute w-24 h-24 rounded-full border-2 border-brand-red"
    />
  );
}

function ProcessingRing() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1100, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={style} className="absolute w-24 h-24">
      <LinearGradient
        colors={HERO_GRADIENT_COLORS}
        locations={HERO_GRADIENT_LOCATIONS}
        start={HERO_GRADIENT_START}
        end={HERO_GRADIENT_END}
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          padding: 3,
        }}
      >
        <View className="flex-1 rounded-full bg-brand-surface" />
      </LinearGradient>
    </Animated.View>
  );
}

export function VoiceRecorderModal({
  visible,
  onClose,
  onExtracted,
}: {
  visible: boolean;
  onClose: () => void;
  onExtracted: (result: ExtractedTransaction) => void;
}) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);

  const orbScale = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      setStatus("idle");
      setSeconds(0);
      return;
    }
    (async () => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setStatus("permission");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    })();
  }, [visible]);

  useEffect(() => {
    if (status !== "recording") return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status === "recording") {
      orbScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      orbScale.value = withTiming(1, { duration: 200 });
    }
  }, [status, orbScale]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

  const startRecording = async () => {
    setSeconds(0);
    await recorder.prepareToRecordAsync();
    recorder.record();
    setStatus("recording");
  };

  const stopRecording = async () => {
    setStatus("processing");
    await recorder.stop();

    try {
      const uri = recorder.uri;
      if (!uri) throw new Error("No recording captured");

      const file = new File(uri);
      const base64 = await file.base64();
      const result = await extractTransactionFromVoice(base64, "audio/m4a");
      onExtracted(result);
      onClose();
    } catch (err) {
      console.error("Voice extraction failed:", err);
      setStatus("error");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <BlurView
          intensity={40}
          tint="dark"
          className="absolute inset-0"
        />
        <LinearGradient
          colors={HERO_GRADIENT_COLORS}
          locations={HERO_GRADIENT_LOCATIONS}
          start={HERO_GRADIENT_START}
          end={HERO_GRADIENT_END}
          style={{
            width: "100%",
            alignItems: "center",
            overflow: "hidden",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 40,
          }}
        >
          <View className="w-10 h-1 rounded-full bg-white/15 mb-6" />

          {status === "permission" ? (
            <>
              <Feather name="mic-off" size={32} color={COLORS.brand.redGlow} />
              <Text className="text-white/60 text-sm mt-3 mb-6 text-center">
                Microphone access is required to create a transaction by voice.
              </Text>
              <TouchableOpacity
                onPress={() => Linking.openSettings()}
                className="bg-brand-red rounded-xl px-6 py-3.5 mb-3"
              >
                <Text className="text-white text-sm font-semibold">
                  Open settings
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} className="px-6 py-2">
                <Text className="text-white/50 text-sm">Close</Text>
              </TouchableOpacity>
            </>
          ) : status === "error" ? (
            <>
              <Feather name="alert-circle" size={32} color={COLORS.brand.redGlow} />
              <Text className="text-white/60 text-sm mt-3 mb-6 text-center">
                Couldn&apos;t process that. Check your microphone permission and
                try again.
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="bg-white/10 rounded-xl px-6 py-3.5"
              >
                <Text className="text-white text-sm font-semibold">Close</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="flex-row items-center gap-1.5 mb-1">
                <MaterialCommunityIcons
                  name="robot-outline"
                  size={13}
                  color={COLORS.brand.redGlow}
                />
                <Text
                  style={{ color: COLORS.brand.redGlow }}
                  className="text-[11px] font-semibold tracking-wide uppercase"
                >
                  AI voice log
                </Text>
              </View>
              <Text className="text-white text-base font-semibold mb-1">
                {status === "recording"
                  ? "Listening…"
                  : status === "processing"
                  ? "Understanding that…"
                  : "Tell me about a transaction"}
              </Text>
              <Text className="text-white/50 text-xs mb-8 text-center px-4">
                {status === "recording"
                  ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
                  : status === "processing"
                  ? "Transcribing and extracting the details"
                  : '"I spent 400 on groceries yesterday"'}
              </Text>

              <View className="w-24 h-24 items-center justify-center mb-8">
                {status === "idle" && (
                  <>
                    <PulseRing delay={0} active />
                    <PulseRing delay={800} active />
                  </>
                )}
                {status === "recording" && (
                  <>
                    <PulseRing delay={0} active />
                    <PulseRing delay={500} active />
                  </>
                )}
                {status === "processing" && <ProcessingRing />}

                <Animated.View style={orbStyle}>
                  <GradientIconButton
                    icon={status === "recording" ? "square" : "mic"}
                    disabled={status === "processing"}
                    onPress={
                      status === "recording" ? stopRecording : startRecording
                    }
                  />
                </Animated.View>
              </View>

              <TouchableOpacity onPress={onClose} disabled={status === "processing"}>
                <Text className="text-white/40 text-sm">Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}
