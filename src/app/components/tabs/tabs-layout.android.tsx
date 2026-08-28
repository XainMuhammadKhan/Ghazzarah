import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { useEffect, useRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ---- Layout constants ----------------------------------------------------
const CELL_WIDTH = 80;
const CELL_HEIGHT = 66;
const COLLAPSED_SIZE = 66;

const ACTIVE_COLOR = 'rgba(220, 30, 61, 1)';
const INACTIVE_COLOR = 'rgba(220, 30, 61, 0)';

// Tuned for a soft, creamy settle rather than a bouncy overshoot.
// Lower damping / higher stiffness = snappier; this is closer to "buttery".
const SPRING_CONFIG = {
  damping: 18,
  stiffness: 220,
  mass: 0.7,
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type CustomTabProps = TabTriggerSlotProps & {
  label: string;
  icon: IconName;
  selectedIcon: IconName;
};

/**
 * Visible tab button.
 *
 * This is NOT responsible for defining routes.
 * The hidden TabList below does that.
 */
function CustomTab({
  label,
  icon,
  selectedIcon,
  isFocused,
  ...props
}: CustomTabProps) {
  const selected = Boolean(isFocused);

  // 0 = collapsed (icon only), 1 = expanded (pill + label)
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, SPRING_CONFIG);
  }, [selected, progress]);

  const cellStyle = useAnimatedStyle(() => ({
    width: COLLAPSED_SIZE + (CELL_WIDTH - COLLAPSED_SIZE) * progress.value,
    height: COLLAPSED_SIZE + (CELL_HEIGHT - COLLAPSED_SIZE) * progress.value,
    borderRadius:
      (COLLAPSED_SIZE + (CELL_HEIGHT - COLLAPSED_SIZE) * progress.value) / 2,
    // interpolateColor avoids manually building an rgba() string, which
    // breaks when progress.value is a near-zero number in exponential
    // notation (e.g. "5.4e-7") — Reanimated's color parser can't handle that.
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [INACTIVE_COLOR, ACTIVE_COLOR]
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    // Fades and drifts up slightly as the pill expands, instead of popping in
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 6 - progress.value * 6 }],
  }));

  const iconWrapStyle = useAnimatedStyle(() => ({
    // Inactive stays at 0; only the selected content group shifts upward.
    transform: [{ translateY: progress.value * -9 }],
  }));

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={styles.tabSlot}
    >
      {({ pressed }) => (
        <Animated.View
          style={[styles.cell, cellStyle, pressed && styles.pressedTab]}
        >
          <Animated.View style={iconWrapStyle}>
            <MaterialCommunityIcons
              name={selected ? selectedIcon : icon}
              size={20}
              color="#FFFFFF"
            />
          </Animated.View>

          {/* Always mounted (not conditionally rendered) so opacity/translateY can animate smoothly both ways */}
          <Animated.Text
            numberOfLines={1}
            ellipsizeMode="clip"
            style={[styles.selectedLabel, labelStyle]}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      )}
    </Pressable>
  );
}

type TabConfig = {
  name: string;
  href: string;
  label: string;
  icon: IconName;
  selectedIcon: IconName;
};

const TAB_CONFIG: TabConfig[] = [
  { name: 'home', href: './', label: 'Home', icon: 'home-variant-outline', selectedIcon: 'home-variant' },
  { name: 'transactions', href: './transactions', label: 'Transactions', icon: 'swap-horizontal', selectedIcon: 'swap-horizontal' },
  { name: 'add-transaction', href: './add-transaction', label: 'Add', icon: 'plus', selectedIcon: 'plus' },
  { name: 'assistant', href: './assistant', label: 'Assistant', icon: 'creation-outline', selectedIcon: 'creation' },
  { name: 'profile', href: './profile', label: 'Profile', icon: 'account-outline', selectedIcon: 'account' },
];

type FloatingTabBarProps = {
  blurTarget: React.RefObject<View | null>;
};

/**
 * Floating glass tab bar.
 *
 * IMPORTANT:
 *
 * This is outside BlurTargetView.
 *
 * BlurView targets BlurTargetView.
 */
function FloatingTabBar({ blurTarget }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.positioner, { bottom: Math.max(insets.bottom, 10) + 10 }]}
    >
      <View style={styles.shadowWrapper}>
        <View style={styles.glassSurface}>
          <BlurView
            blurMethod="dimezisBlurViewSdk31Plus"
            blurTarget={blurTarget}
            intensity={55}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />

          <LinearGradient
            colors={['rgba(255,255,255,0.14)', 'rgba(0,0,0,0.12)']}
            locations={[0, 1]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.tabRow}>
            {TAB_CONFIG.map(({ name, label, icon, selectedIcon }) => (
              <TabTrigger key={name} name={name} asChild>
                <CustomTab label={label} icon={icon} selectedIcon={selectedIcon} />
              </TabTrigger>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function AndroidTabsLayout() {
  const blurTarget = useRef<View | null>(null);

  return (
    <Tabs>
      {/*
       * ONLY the actual application content is inside
       * BlurTargetView.
       *
       * The floating BlurView is NOT inside it.
       */}
      <BlurTargetView ref={blurTarget} style={styles.container}>
        <TabSlot />
      </BlurTargetView>

      {/*
       * Visible custom glass tab bar.
       *
       * It targets the BlurTargetView above.
       */}
      <FloatingTabBar blurTarget={blurTarget} />

      {/*
       * IMPORTANT:
       *
       * TabList MUST be an immediate child of Tabs.
       *
       * These TabTriggers define the actual routes.
       *
       * The visible buttons above are additional TabTriggers
       * referencing these names.
       */}
      <TabList style={styles.hiddenTabList}>
        <TabTrigger name="home" href="./" />
        <TabTrigger name="transactions" href="./transactions" />
        <TabTrigger name="add-transaction" href="./add-transaction" />
        <TabTrigger name="assistant" href="./assistant" />
        <TabTrigger name="profile" href="./profile" />
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F4',
  },

  hiddenTabList: {
    display: 'none',
  },

  positioner: {
    position: 'absolute',
    left: 18,
    right: 18,
    alignItems: 'center',
    zIndex: 100,
  },

  shadowWrapper: {
    width: '100%',
    maxWidth: 430,

    borderRadius: 39,

    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 22,

    ...Platform.select({
      android: { elevation: 22 },
    }),
  },

  glassSurface: {
    width: '100%',
    height: 82,

    overflow: 'hidden',

    borderRadius: 39,

    borderWidth: 1.25,
    borderColor: 'rgba(255,255,255,0.30)',

    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  tabRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  tabSlot: {
    flex: 1,
    height: 70,

    alignItems: 'center',
    justifyContent: 'center',
  },

  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    // width/height/borderRadius/backgroundColor are driven by the animated style above;
    // these are just safe fallbacks before the first animated frame commits.
    width: COLLAPSED_SIZE,
    height: CELL_HEIGHT,
    borderRadius: COLLAPSED_SIZE / 2,
  },

  pressedTab: {
    opacity: 0.78,
  },

  selectedLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    textAlign: 'center',
  },
});