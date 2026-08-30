import { useEffect, useRef, useState } from "react";
import { BlurView } from "expo-blur";
import {
    Animated,
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function FormSheetModal({
  visible,
  title,
  onClose,
  onShow,
  blurTarget,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onShow?: () => void;
  blurTarget?: React.RefObject<View | null>;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [rendered, setRendered] = useState(visible);
  const animation = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    animation.stopAnimation();

    if (visible) {
      setRendered(true);
      onShow?.();
      const frame = requestAnimationFrame(() => {
        Animated.spring(animation, {
          toValue: 1,
          damping: 22,
          stiffness: 240,
          mass: 0.8,
          useNativeDriver: true,
        }).start();
      });

      return () => cancelAnimationFrame(frame);
    }

    Keyboard.dismiss();
    Animated.timing(animation, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  }, [animation, onShow, visible]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  if (!rendered) return null;

  const sheetTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [420, 0],
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        elevation: 1000,
      }}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          className="flex-1"
          style={{ opacity: animation }}
        >
          <BlurView
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            intensity={24}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View className="flex-1 bg-black/20" />
        </Animated.View>
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior="position"
        automaticOffset
        pointerEvents="box-none"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        contentContainerStyle={{ width: "100%" }}
      >
        <Animated.View
          className="overflow-hidden rounded-t-[28px] bg-brand-body px-5 pt-5"
          style={{
            transform: [{ translateY: sheetTranslateY }],
            paddingBottom: keyboardVisible
              ? 32
              : Math.max(insets.bottom, 10) + 104,
          }}
        >
          <Text className="text-brand-bg text-base font-semibold mb-4">
            {title}
          </Text>

          {children}

          <TouchableOpacity onPress={onClose} className="py-2 items-center">
            <Text className="text-brand-text-secondary text-sm">Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
