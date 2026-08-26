import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Logo from '../../../assets/splash/logo.svg';
import Tagline from '../../../assets/splash/tagline.svg';

const LOGO_ANIM_DURATION = 500;
const TAGLINE_ANIM_DURATION = 400;
const TAGLINE_DELAY = 350;

// Change these freely — each SVG lives inside its own fixed-size, centered
// box, so resizing here scales the graphic in place. It never shifts.
const LOGO_SIZE = { width: 400, height: 500 };
const TAGLINE_SIZE = { width: 300, height: 400 };

// Fixed region boxes — make these generous enough to fit the largest size
// you'll ever set above. The box is what anchors position; the SVG inside
// it is free to grow/shrink without moving.
const LOGO_REGION = { width: 400, height: 500 };
const TAGLINE_REGION = { width: 500, height: 220 };
const TAGLINE_BOTTOM_OFFSET = 10;

export default function AnimatedSplash({
  onFinish,
  onReady,
}: {
  onFinish: () => void;
  onReady?: () => void;
}) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(10);
  const containerOpacity = useSharedValue(1);
  const hasFiredReady = useRef(false);

  useEffect(() => {
    logoOpacity.value = withTiming(1, {
      duration: LOGO_ANIM_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withTiming(1, {
      duration: LOGO_ANIM_DURATION,
      easing: Easing.out(Easing.cubic),
    });

    taglineOpacity.value = withDelay(
      TAGLINE_DELAY,
      withTiming(1, { duration: TAGLINE_ANIM_DURATION })
    );
    taglineTranslateY.value = withDelay(
      TAGLINE_DELAY,
      withTiming(0, { duration: TAGLINE_ANIM_DURATION })
    );

    
    containerOpacity.value = withDelay(
      1200,
      withTiming(0, { duration: 400, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const handleLayout = () => {
    if (hasFiredReady.current) return;
    hasFiredReady.current = true;
    onReady?.();
  };

  return (
    <Animated.View
      className="flex-1"
      style={[containerStyle, { backgroundColor: '#F5F5F4' }]}
      onLayout={handleLayout}
    >
      {/* Logo: fixed-size box, centered on screen, content centered inside it */}
      <View className="absolute inset-0 justify-center items-center">
        <View
          style={{
            width: LOGO_REGION.width,
            height: LOGO_REGION.height,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Animated.View style={logoStyle}>
            <Logo width={LOGO_SIZE.width} height={LOGO_SIZE.height} />
          </Animated.View>
        </View>
      </View>

      {/* Tagline: fixed-size box, anchored by its own center via top math,
          not by bottom-with-no-top */}
      <View
        className="absolute left-0 right-0 items-center justify-center"
        style={{
          bottom: TAGLINE_BOTTOM_OFFSET,
          height: TAGLINE_REGION.height,
        }}
      >
        <Animated.View style={taglineStyle}>
          <Tagline width={TAGLINE_SIZE.width} height={TAGLINE_SIZE.height} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}