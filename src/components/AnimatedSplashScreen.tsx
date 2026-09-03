import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, Text, Image } from 'react-native';
import { useAppTheme } from '../constant/theme';
import { moderateScale } from 'react-native-size-matters';

interface AnimatedSplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onFinish }) => {
  const { colors } = useAppTheme();
  
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1.1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Zoom out the JCB image slightly while fading it in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Slide and fade in the Text
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // 3. Pause so user admires the art
      Animated.delay(1500),

      // 4. Fade out everything to reveal app
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start(() => {
      onFinish();
    });
  }, []);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: '#1E293B', // Sleek dark backdrop
          opacity: overlayOpacity 
        }
      ]}
    >
      <View style={styles.imageWrapper}>
        <Animated.Image 
          source={require('../assets/images/jcb_splash.jpg')}
          style={[
            styles.jcbImage,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
          resizeMode="cover"
        />
        
        {/* Dark gradient overlay for text readability */}
        <View style={styles.darkGradient} />
      </View>

      <Animated.View 
        style={[
          styles.textContainer, 
          { 
            opacity: textFadeAnim,
            transform: [{ translateY: textTranslateY }] 
          }
        ]}
      >
        <Text style={styles.logoText}>SHANTINATH</Text>
        <Text style={styles.logoTextHighlight}>MOTORS</Text>
        <View style={styles.divider} />
        <Text style={styles.subText}>ENTERPRISE HRMS</Text>
      </Animated.View>

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  jcbImage: {
    width: width,
    height: height,
  },
  darkGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // Dark Slate overlay
  },
  textContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
  },
  logoText: {
    fontSize: moderateScale(32),
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 4,
  },
  logoTextHighlight: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    color: '#F59E0B', // JCB Yellow
    letterSpacing: 4,
    marginTop: -5,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    marginVertical: moderateScale(15),
  },
  subText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#94A3B8', // Slate 400
    letterSpacing: 6,
  },
});

export default AnimatedSplashScreen;
