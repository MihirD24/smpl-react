import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppStack from './appStack';
import AuthStack from './authStack';
import { useAuth } from '../customHook/useAuth';
import { AppStackParamList } from './navigationTypes';
import { BRAND } from '../assets/style/brandTheme';

const SHANTINATH_LOGO = require('../assets/images/login_logo.jpeg');

/**
 * Phase 1 enterprise splash.
 * Intentionally independent from the API layer: it only establishes the brand
 * and waits for the existing auth/navigation bootstrap to become visible.
 */
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const isDark = useColorScheme() === 'dark';
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(14)).current;
  const topLine = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const enter = Animated.parallel([
      Animated.timing(topLine, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 550,
          delay: 260,
          useNativeDriver: true,
        }),
        Animated.timing(contentY, {
          toValue: 0,
          duration: 550,
          delay: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(progress, {
        toValue: 1,
        duration: 1900,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);

    enter.start();

    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onFinish();
      });
    }, 2250);

    return () => {
      enter.stop();
      clearTimeout(timer);
    };
  }, [contentOpacity, contentY, logoOpacity, logoScale, onFinish, progress, screenOpacity, topLine]);

  const isTablet = Math.min(width, height) >= 600;
  const compact = height < 700;
  const logoWidth = Math.min(width * (isTablet ? 0.54 : 0.82), isTablet ? 560 : 430);
  const logoHeight = logoWidth * (146 / 1280);
  const bg = isDark ? '#090A0B' : '#F4F5F3';
  const panel = isDark ? '#111315' : '#FFFFFF';
  const secondary = isDark ? '#9EA5AC' : '#667078';

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 76],
  });

  return (
    <Animated.View style={[styles.root, { backgroundColor: bg, opacity: screenOpacity }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* Industrial top band */}
      <View style={[styles.topBand, { paddingTop: insets.top + 12 }]}>
        <Animated.View
          style={[
            styles.topYellow,
            {
              transform: [{ scaleX: topLine }],
            },
          ]}
        />
        <View style={styles.topMeta}>
          <View style={styles.metaLeft}>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>SHANTINATH MOTORS</Text>
          </View>
          <Text style={styles.metaCode}>HRMS • 01</Text>
        </View>
      </View>

      {/* Subtle ERP grid */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {[0, 1, 2, 3, 4].map(index => (
          <View
            key={`v-${index}`}
            style={[
              styles.gridVertical,
              { left: `${10 + index * 20}%`, opacity: isDark ? 0.07 : 0.045 },
            ]}
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map(index => (
          <View
            key={`h-${index}`}
            style={[
              styles.gridHorizontal,
              { top: `${25 + index * 11}%`, opacity: isDark ? 0.07 : 0.045 },
            ]}
          />
        ))}
      </View>

      <View
        style={[
          styles.main,
          {
            paddingTop: Math.max(16, insets.top * 0.15),
            paddingBottom: Math.max(24, insets.bottom + 18),
          },
        ]}
      >
        <View style={[styles.center, { maxWidth: isTablet ? 760 : 520 }]}>
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
              alignItems: 'center',
              width: '100%',
            }}
          >
            <View style={[styles.logoCard, { backgroundColor: panel }]}>
              <View style={styles.logoAccent} />
              <Image
                source={SHANTINATH_LOGO}
                style={{ width: logoWidth, height: logoHeight }}
                resizeMode="contain"
                accessibilityLabel="Shantinath JCB"
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.identity,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentY }],
                marginTop: compact ? 22 : isTablet ? 34 : 28,
              },
            ]}
          >
            <View style={styles.systemPill}>
              <View style={styles.systemPillDot} />
              <Text style={styles.systemPillText}>ENTERPRISE HRMS</Text>
            </View>

            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#101214' }]}>WORKFORCE</Text>
            <Text style={[styles.titleStrong, { color: isDark ? '#FFFFFF' : '#101214' }]}>MANAGEMENT</Text>
            <Text style={[styles.subtitle, { color: secondary }]}>People • Attendance • Payroll • Service</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.moduleRow,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentY }],
                marginTop: compact ? 26 : 38,
              },
            ]}
          >
            <Module label="PEOPLE" number="01" />
            <Module label="ATTENDANCE" number="02" />
            <Module label="PAYROLL" number="03" />
            <Module label="SERVICE" number="04" />
          </Animated.View>
        </View>

        <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <View style={styles.footerRow}>
            <Text style={[styles.footerBrand, { color: isDark ? '#AEB4BA' : '#596168' }]}>SHANTINATH JCB</Text>
            <Text style={[styles.footerVersion, { color: isDark ? '#737A81' : '#8A9197' }]}>SECURE WORKSPACE</Text>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function Module({ label, number }: { label: string; number: string }) {
  return (
    <View style={styles.module}>
      <Text style={styles.moduleNumber}>{number}</Text>
      <Text style={styles.moduleLabel}>{label}</Text>
    </View>
  );
}

function AppNav() {
  const { userToken } = useAuth();
  const [initialRoute] = useState<keyof AppStackParamList>('TabNavigator');
  const [splashDone, setSplashDone] = useState(false);

  const finishSplash = useCallback(() => setSplashDone(true), []);

  if (!splashDone) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={finishSplash} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {userToken ? <AppStack initialRoute={initialRoute} /> : <AuthStack />}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBand: {
    paddingHorizontal: 22,
    paddingBottom: 14,
    zIndex: 2,
  },
  topYellow: {
    height: 4,
    width: '100%',
    backgroundColor: BRAND.yellow,
    marginBottom: 12,
    borderRadius: 2,
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLeft: { flexDirection: 'row', alignItems: 'center' },
  metaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRAND.yellow,
    marginRight: 8,
  },
  metaText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: '#17191B' },
  metaCode: { fontSize: 9, fontWeight: '700', letterSpacing: 1.1, color: '#737A80' },
  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#6C7378',
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#6C7378',
  },
  main: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    zIndex: 1,
  },
  center: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  logoCard: {
    minWidth: 270,
    borderRadius: 14,
    paddingVertical: 17,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E3E5',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 7,
  },
  logoAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    backgroundColor: BRAND.yellow,
  },
  identity: { alignItems: 'center' },
  systemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4D7D9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  systemPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: BRAND.yellow, marginRight: 7 },
  systemPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 1.6, color: '#4B5257' },
  title: { marginTop: 13, fontSize: 27, fontWeight: '500', letterSpacing: 3.6 },
  titleStrong: { marginTop: -2, fontSize: 28, fontWeight: '900', letterSpacing: 3.2 },
  subtitle: { marginTop: 9, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  moduleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 600,
  },
  module: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D8DBDD',
  },
  moduleNumber: { fontSize: 8, fontWeight: '800', letterSpacing: 1.2, color: BRAND.yellow, marginBottom: 4 },
  moduleLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8, color: '#5D656B' },
  footer: { width: '100%', maxWidth: 600, paddingBottom: 2 },
  progressTrack: {
    height: 3,
    width: 76,
    backgroundColor: '#D9DDDF',
    borderRadius: 2,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 13,
  },
  progressBar: { height: 3, backgroundColor: BRAND.yellow, borderRadius: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerBrand: { fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  footerVersion: { fontSize: 7, fontWeight: '700', letterSpacing: 1.2 },
});

export default AppNav;
