import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  useColorScheme,
} from 'react-native';
import AppStack from './appStack';
import AuthStack from './authStack';
import messaging from '@react-native-firebase/messaging';
import { useAuth } from '../customHook/useAuth';
import { AppStackParamList } from './navigationTypes';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// ─── Splash Screen Component ───────────────────────────────────────────────────
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const isDarkMode = useColorScheme() === 'dark';
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Fade + scale in the logo
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Fade in the bottom text slightly after logo appears
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // 3. Hold for ~2s then fade the whole screen out
      setTimeout(() => {
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => onFinish());
      }, 2000);
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.splashContainer,
        { opacity: screenOpacity },
        { backgroundColor: isDarkMode ? '#1E1E2E' : '#FFFFFF' },
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
       translucent
      />

      {/* ── Centered Logo ── */}
      <View style={styles.centerContent}>
        <Animated.Image
          source={require('../assets/images/bootsplash_logo.png')}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* ── Bottom Company Name — pinned to bottom ── */}
      <Animated.View
        style={[styles.bottomTextContainer, { opacity: textOpacity }]}
      >
        <Text
          style={[
            styles.companyName,
            { color: isDarkMode ? '#FFFFFF' : '#1E1E2E' },
          ]}
        >
          Jatayu
        </Text>
        <Text
          style={[
            styles.companyName,
            { color: isDarkMode ? '#FFFFFF' : '#1E1E2E' },
          ]}
        >
          Technologies
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// ─── AppNav ────────────────────────────────────────────────────────────────────
function AppNav() {
  const { userToken } = useAuth();
  const [initialRoute, setInitialRoute] =
    useState<keyof AppStackParamList>('TabNavigator');
  const [loading, setLoading] = useState(true);
  const [splashDone, setSplashDone] = useState(false);

  // Handle notification tap from killed state
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (!remoteMessage) {
          setLoading(false);
          return;
        }
        const { screen } = remoteMessage?.data as {
          screen: keyof AppStackParamList;
        };
        switch (screen) {
          case 'LeaveList':
            setInitialRoute('LeaveList');
            break;
          default:
            setInitialRoute('NotificationScreen');
        }
        setLoading(false);
      });
  }, []);

  // Show splash until animation is done
  const showSplash = !splashDone;

  if (showSplash) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <SafeAreaProvider>
      {userToken ? <AppStack initialRoute={initialRoute} /> : <AuthStack />}
    </SafeAreaProvider>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,

    alignItems: 'center',
    // space-between: logo stays centered, text pushed to bottom
    justifyContent: 'space-between',
  },

  // Fills all middle space so logo is truly centered on screen
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: width * 0.55,
    height: height * 0.3,
  },

  // Fixed to the bottom of the screen
  bottomTextContainer: {
    alignItems: 'center',
    paddingBottom: 50, // gap from the very bottom edge
  },

  companyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    letterSpacing: 0.5,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export default AppNav;
