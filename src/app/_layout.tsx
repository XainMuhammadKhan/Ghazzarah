import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { ClerkProvider } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import "../../global.css";
import AnimatedSplash from '../app/components/AnimatedSplash';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Fires once AnimatedSplash has painted its first frame —
  // only then do we hide the native splash, avoiding any blank gap.
  const handleAnimatedSplashReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  const handleFinish = useCallback(() => setShowAnimatedSplash(false), []);

  return (
     <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
    <View className="flex-1 bg-brand-body">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      />

      {showAnimatedSplash && (
        <View className="absolute inset-0 z-[1000] bg-brand-body">
          <AnimatedSplash
            onFinish={handleFinish}
            onReady={handleAnimatedSplashReady}
          />
        </View>
      )}
    </View>
    </ClerkProvider>
  );
}
