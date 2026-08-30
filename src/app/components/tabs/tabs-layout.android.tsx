// import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// import { BlurTargetView, BlurView } from 'expo-blur';
// import { LinearGradient } from 'expo-linear-gradient';
// import {
//   TabList,
//   Tabs,
//   TabSlot,
//   TabTrigger,
//   type TabTriggerSlotProps,
// } from 'expo-router/ui';
// import { usePathname } from 'expo-router';
// import { useEffect, useRef } from 'react';
// import { Platform, Pressable, StyleSheet, View } from 'react-native';
// import Animated, {
//   cancelAnimation,
//   interpolateColor,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
// } from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// // ---- Layout constants ----------------------------------------------------
// const CELL_WIDTH = 80;
// const CELL_HEIGHT = 66;
// const COLLAPSED_SIZE = 66;

// const ACTIVE_COLOR = 'rgba(220, 30, 61, 1)';

// // Tuned for a soft, creamy settle rather than a bouncy overshoot.
// // Lower damping / higher stiffness = snappier; this is closer to "buttery".
// const SPRING_CONFIG = {
//   damping: 18,
//   stiffness: 220,
//   mass: 0.7,
// };

// type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// type CustomTabProps = TabTriggerSlotProps & {
//   label: string;
//   icon: IconName;
//   selectedIcon: IconName;
//   active: boolean;
// };

// /**
//  * Visible tab button.
//  *
//  * This is NOT responsible for defining routes.
//  * The hidden TabList below does that.
//  */
// function CustomTab({
//   label,
//   icon,
//   selectedIcon,
//   active,
//   isFocused: _isFocused,
//   ...props
// }: CustomTabProps) {
//   const selected = active;

//   // Keep animation state derived from the actual route selection so it
//   // cannot drift back to the collapsed state after the first tab mount.
//   const progress = useSharedValue(selected ? 1 : 0);

//   useEffect(() => {
//     cancelAnimation(progress);
//     progress.value = withSpring(selected ? 1 : 0, SPRING_CONFIG);
//   }, [selected]);

//   const cellStyle = useAnimatedStyle(() => {
//     const value = Math.max(0, Math.min(1, progress.value));
//     return {
//     width: COLLAPSED_SIZE + (CELL_WIDTH - COLLAPSED_SIZE) * value,
//     height: COLLAPSED_SIZE + (CELL_HEIGHT - COLLAPSED_SIZE) * value,
//     borderRadius: (COLLAPSED_SIZE + (CELL_HEIGHT - COLLAPSED_SIZE) * value) / 2,
//     backgroundColor: selected
//       ? interpolateColor(value, [0, 1], ['transparent', ACTIVE_COLOR])
//       : 'transparent',
//     // interpolateColor avoids manually building an rgba() string, which
//     // breaks when progress.value is a near-zero number in exponential
//     // notation (e.g. "5.4e-7") — Reanimated's color parser can't handle that.
//     };
//   });

//   const labelStyle = useAnimatedStyle(() => {
//     const value = Math.max(0, Math.min(1, progress.value));
//     return {
//     // Fades and drifts up slightly as the pill expands, instead of popping in
//     opacity: selected ? value : 0,
//     transform: [{ translateY: (1 - value) * 6 - value * 6 }],
//     };
//   });

//   const iconWrapStyle = useAnimatedStyle(() => {
//     const value = Math.max(0, Math.min(1, progress.value));
//     return {
//     // Inactive stays at 0; only the selected content group shifts upward.
//     transform: [{ translateY: selected ? value * -9 : 0 }],
//     };
//   });

//   return (
//     <Pressable
//       {...props}
//       accessibilityRole="tab"
//       accessibilityState={{ selected }}
//       style={styles.tabSlot}
//     >
//       {({ pressed }) => (
//         <Animated.View
//           style={[
//             styles.cell,
//             cellStyle,
//             pressed && styles.pressedTab,
//           ]}
//         >
//           <Animated.View
//             style={[
//               iconWrapStyle,
//             ]}
//           >
//             <MaterialCommunityIcons
//               name={selected ? selectedIcon : icon}
//               size={20}
//               color="#FFFFFF"
//             />
//           </Animated.View>

//           {/* Always mounted (not conditionally rendered) so opacity/translateY can animate smoothly both ways */}
//           <Animated.Text
//             numberOfLines={1}
//             ellipsizeMode="clip"
//             style={[
//               styles.selectedLabel,
//               labelStyle,
//             ]}
//           >
//             {label}
//           </Animated.Text>
//         </Animated.View>
//       )}
//     </Pressable>
//   );
// }

// type TabConfig = {
//   name: string;
//   href: string;
//   pathname: string;
//   label: string;
//   icon: IconName;
//   selectedIcon: IconName;
// };

// const TAB_CONFIG: TabConfig[] = [
//   { name: 'home', href: './', pathname: '/', label: 'Home', icon: 'home-variant-outline', selectedIcon: 'home-variant' },
//   { name: 'transactions', href: './transactions', pathname: '/transactions', label: 'Transactions', icon: 'swap-horizontal', selectedIcon: 'swap-horizontal' },
//   { name: 'add-transaction', href: './add-transaction', pathname: '/add-transaction', label: 'Add', icon: 'plus', selectedIcon: 'plus' },
//   { name: 'assistant', href: './assistant', pathname: '/assistant', label: 'Assistant', icon: 'creation-outline', selectedIcon: 'creation' },
//   { name: 'profile', href: './profile', pathname: '/profile', label: 'Profile', icon: 'account-outline', selectedIcon: 'account' },
// ];

// /**
//  * Floating glass tab bar.
//  */
// type FloatingTabBarProps = {
//   blurTarget: React.RefObject<View | null>;
// };

// function FloatingTabBar({ blurTarget }: FloatingTabBarProps) {
//   const insets = useSafeAreaInsets();
//   const pathname = usePathname();

//   return (
//     <View
//       pointerEvents="box-none"
//       style={[styles.positioner, { bottom: Math.max(insets.bottom, 10) + 10 }]}
//     >
//       <View style={styles.shadowWrapper}>
//         <View style={styles.glassSurface}>
//           <BlurView
//             blurMethod="dimezisBlurViewSdk31Plus"
//             blurTarget={blurTarget}
//             intensity={55}
//             tint="dark"
//             style={StyleSheet.absoluteFill}
//           />

//           <LinearGradient
//             colors={['rgba(255,255,255,0.14)', 'rgba(0,0,0,0.12)']}
//             locations={[0, 1]}
//             start={{ x: 0.1, y: 0 }}
//             end={{ x: 0.9, y: 1 }}
//             style={StyleSheet.absoluteFill}
//           />

//           <View style={styles.tabRow}>
//             {TAB_CONFIG.map(({ name, pathname: tabPathname, label, icon, selectedIcon }) => (
//               <TabTrigger key={name} name={name} asChild>
//                 <CustomTab
//                   label={label}
//                   icon={icon}
//                   selectedIcon={selectedIcon}
//                   active={pathname === tabPathname}
//                 />
//               </TabTrigger>
//             ))}
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// }

// export default function AndroidTabsLayout() {
//   const blurTarget = useRef<View | null>(null);

//   return (
//     <Tabs>
//       <BlurTargetView ref={blurTarget} style={styles.container}>
//         <TabSlot />
//       </BlurTargetView>

//       {/*
//        * Visible custom glass tab bar.
//        *
//        * It targets the BlurTargetView above.
//        */}
//       <FloatingTabBar blurTarget={blurTarget} />

//       {/*
//        * IMPORTANT:
//        *
//        * TabList MUST be an immediate child of Tabs.
//        *
//        * These TabTriggers define the actual routes.
//        *
//        * The visible buttons above are additional TabTriggers
//        * referencing these names.
//        */}
//       <TabList style={styles.hiddenTabList}>
//         <TabTrigger name="home" href="./" />
//         <TabTrigger name="transactions" href="./transactions" />
//         <TabTrigger name="add-transaction" href="./add-transaction" />
//         <TabTrigger name="assistant" href="./assistant" />
//         <TabTrigger name="profile" href="./profile" />
//       </TabList>
//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F4',
//   },

//   hiddenTabList: {
//     display: 'none',
//   },

//   positioner: {
//     position: 'absolute',
//     left: 18,
//     right: 18,
//     alignItems: 'center',
//     zIndex: 100,
//   },

//   shadowWrapper: {
//     width: '100%',
//     maxWidth: 430,

//     borderRadius: 39,

//     shadowColor: '#000000',
//     shadowOffset: { width: 0, height: 12 },
//     shadowOpacity: 0.4,
//     shadowRadius: 22,

//     ...Platform.select({
//       android: { elevation: 22 },
//     }),
//   },

//   glassSurface: {
//     width: '100%',
//     height: 82,

//     overflow: 'hidden',

//     borderRadius: 39,

//     borderWidth: 1.25,
//     borderColor: 'rgba(255,255,255,0.30)',

//     backgroundColor: 'rgba(255,255,255,0.06)',
//   },

//   tabRow: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//   },

//   tabSlot: {
//     flex: 1,
//     height: 70,

//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   cell: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     // width/height/borderRadius/backgroundColor are driven by the animated style above;
//     // these are just safe fallbacks before the first animated frame commits.
//     width: COLLAPSED_SIZE,
//     height: CELL_HEIGHT,
//     borderRadius: COLLAPSED_SIZE / 2,
//   },

//   selectedCell: {
//     width: CELL_WIDTH,
//     height: CELL_HEIGHT,
//     borderRadius: CELL_HEIGHT / 2,
//     backgroundColor: ACTIVE_COLOR,
//   },

//   inactiveCell: {
//     width: COLLAPSED_SIZE,
//     height: COLLAPSED_SIZE,
//     borderRadius: COLLAPSED_SIZE / 2,
//     backgroundColor: 'transparent',
//   },

//   selectedIconContent: {
//     transform: [{ translateY: -9 }],
//   },

//   pressedTab: {
//     opacity: 0.78,
//   },

//   inactiveIconContent: {
//     transform: [{ translateY: 0 }],
//   },

//   inactiveLabel: {
//     opacity: 0,
//   },

//   selectedLabel: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 8,
//     color: '#FFFFFF',
//     fontSize: 9.5,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
// });


import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurTargetView, BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname } from 'expo-router';
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
  cancelAnimation,
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
  active: boolean;
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
  active,
  isFocused: _isFocused,
  onPress,
  ...props
}: CustomTabProps) {
  const selected = active;

  // CHANGED: temporary instrumentation to find where the 2-3s delay
  // actually originates — logs the moment the tab is tapped so we can
  // diff it against "[transactions] render start" in the console. Remove
  // once the bottleneck is found.
  const handlePress = (e: any) => {
    console.log(`[tab] pressed "${label}"`, Date.now());
    onPress?.(e);
  };

  // Keep animation state derived from the actual route selection so it
  // cannot drift back to the collapsed state after the first tab mount.
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    cancelAnimation(progress);
    progress.value = withSpring(selected ? 1 : 0, SPRING_CONFIG);
  }, [selected]);

  const cellStyle = useAnimatedStyle(() => {
    const value = Math.max(0, Math.min(1, progress.value));
    return {
      width: COLLAPSED_SIZE + (CELL_WIDTH - COLLAPSED_SIZE) * value,
      height: COLLAPSED_SIZE + (CELL_HEIGHT - COLLAPSED_SIZE) * value,
      borderRadius: (COLLAPSED_SIZE + (CELL_HEIGHT - COLLAPSED_SIZE) * value) / 2,
      backgroundColor: selected
        ? interpolateColor(value, [0, 1], ['transparent', ACTIVE_COLOR])
        : 'transparent',
      // interpolateColor avoids manually building an rgba() string, which
      // breaks when progress.value is a near-zero number in exponential
      // notation (e.g. "5.4e-7") — Reanimated's color parser can't handle that.
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const value = Math.max(0, Math.min(1, progress.value));
    return {
      // Fades and drifts up slightly as the pill expands, instead of popping in
      opacity: selected ? value : 0,
      transform: [{ translateY: (1 - value) * 6 - value * 6 }],
    };
  });

  const iconWrapStyle = useAnimatedStyle(() => {
    const value = Math.max(0, Math.min(1, progress.value));
    return {
      // Inactive stays at 0; only the selected content group shifts upward.
      transform: [{ translateY: selected ? value * -9 : 0 }],
    };
  });

  return (
    <Pressable
      {...props}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={styles.tabSlot}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.cell,
            cellStyle,
            pressed && styles.pressedTab,
          ]}
        >
          <Animated.View
            style={[
              iconWrapStyle,
            ]}
          >
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
            style={[
              styles.selectedLabel,
              labelStyle,
            ]}
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
  pathname: string;
  label: string;
  icon: IconName;
  selectedIcon: IconName;
};

const TAB_CONFIG: TabConfig[] = [
  { name: 'home', href: './', pathname: '/', label: 'Home', icon: 'home-variant-outline', selectedIcon: 'home-variant' },
  { name: 'transactions', href: './transactions', pathname: '/transactions', label: 'Transactions', icon: 'swap-horizontal', selectedIcon: 'swap-horizontal' },
  { name: 'add-transaction', href: './add-transaction', pathname: '/add-transaction', label: 'Add', icon: 'plus', selectedIcon: 'plus' },
  { name: 'assistant', href: './assistant', pathname: '/assistant', label: 'Assistant', icon: 'creation-outline', selectedIcon: 'creation' },
  { name: 'profile', href: './profile', pathname: '/profile', label: 'Profile', icon: 'account-outline', selectedIcon: 'account' },
];

/**
 * Floating glass tab bar.
 */
type FloatingTabBarProps = {
  blurTarget: React.RefObject<View | null>;
};

function FloatingTabBar({ blurTarget }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

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
            {TAB_CONFIG.map(({ name, pathname: tabPathname, label, icon, selectedIcon }) => (
              <TabTrigger key={name} name={name} asChild>
                <CustomTab
                  label={label}
                  icon={icon}
                  selectedIcon={selectedIcon}
                  active={pathname === tabPathname}
                />
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

  selectedCell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    borderRadius: CELL_HEIGHT / 2,
    backgroundColor: ACTIVE_COLOR,
  },

  inactiveCell: {
    width: COLLAPSED_SIZE,
    height: COLLAPSED_SIZE,
    borderRadius: COLLAPSED_SIZE / 2,
    backgroundColor: 'transparent',
  },

  selectedIconContent: {
    transform: [{ translateY: -9 }],
  },

  pressedTab: {
    opacity: 0.78,
  },

  inactiveIconContent: {
    transform: [{ translateY: 0 }],
  },

  inactiveLabel: {
    opacity: 0,
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