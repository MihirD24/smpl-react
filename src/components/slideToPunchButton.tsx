import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Image,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

type Props = {
  title?: string;
  onComplete: () => void;
};

const BUTTON_WIDTH = scale(320);
const KNOB_SIZE = scale(50);
const MAX_SLIDE = BUTTON_WIDTH - KNOB_SIZE;
const COMPLETE_THRESHOLD = BUTTON_WIDTH * 0.6;

export default function SlideToPunchButton({
  title = 'SLIDE TO PUNCH IN',
  onComplete,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;

  // 🔥 Animated opacity tied to slide position
  const textOpacity = translateX.interpolate({
    inputRange: [0, MAX_SLIDE * 0.7],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0 && gesture.dx < MAX_SLIDE) {
          translateX.setValue(gesture.dx);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > COMPLETE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: MAX_SLIDE,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            onComplete();
            translateX.setValue(0); // reset
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        {/* ✅ Centered fading text */}
        <Animated.Text
          style={[styles.label, { opacity: textOpacity }]}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>

        {/* ✅ Sliding knob */}
        <Animated.View
          style={[styles.knob, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          <Image
            source={require('../assets/images/icons/fast-forward.png')}
            style={styles.icon}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: verticalScale(20),
    alignItems: 'center',
  },

  track: {
    width: BUTTON_WIDTH,
    height: verticalScale(50),
    backgroundColor: '#2563EB',
    borderRadius: moderateScale(28),
    justifyContent: 'center',
    overflow: 'hidden',
  },

  label: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(4),
    elevation: 3,
  },

  icon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#0056A1',
  },
});
