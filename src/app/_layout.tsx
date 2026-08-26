import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import "../../global.css";
import AnimatedSplash from '../app/components/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // load fonts/assets here
      } finally {
        setAppReady(true);
      }
    })();
  }, []);

  // Fires once AnimatedSplash has painted its first frame —
  // only then do we hide the native splash, avoiding any blank gap.
  const handleAnimatedSplashReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  const handleFinish = useCallback(() => setAnimDone(true), []);

  if (!appReady) return null;
  if (!animDone) {
    return <AnimatedSplash onFinish={handleFinish} onReady={handleAnimatedSplashReady} />;
  }

  return <Stack
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F5F5F4' },
    }}
  />
}