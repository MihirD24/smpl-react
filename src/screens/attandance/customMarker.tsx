import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { scale, moderateScale } from 'react-native-size-matters';

const CustomMarker = React.memo(() => {
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );

    loop.start();

    return () => loop.stop();
  }, []);

  const scaleAnim = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 3],
  });

  const opacityAnim = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View
      style={{
        width: scale(70),
        height: scale(70),
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Ripple Pulse */}
      <Animated.View
        style={{
          position: 'absolute',
          width: scale(40),
          height: scale(40),
          borderRadius: scale(20),
          backgroundColor: 'rgba(37, 99, 235, 0.35)',
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      />

      {/* Pin */}
      <View
        style={{
          width: moderateScale(34),
          height: moderateScale(34),
          borderRadius: moderateScale(17),
          backgroundColor: '#2563EB',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#FFF',
          elevation: 4,
        }}
      >
        <MapPin size={26} color="#fff" />
      </View>
    </View>
  );
});

export default CustomMarker;
