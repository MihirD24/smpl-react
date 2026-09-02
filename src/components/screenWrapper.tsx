import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, verticalScale } from 'react-native-size-matters';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean | number;
  safeTop?: boolean;
  safeBottom?: boolean;
  backgroundColor?: string;
  safeAreaTopColor?: string;
  safeAreaBottomColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  statusBarTranslucent?: boolean;
  keyboardAvoiding?: boolean;
  withHeader?: boolean;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  padding = false,
  safeTop = true,
  safeBottom = true,
  backgroundColor = '#F6F8FC',
  safeAreaTopColor,
  safeAreaBottomColor,
  statusBarTranslucent = false,
  statusBarBackgroundColor = 'transparent',
  statusBarStyle ,
  keyboardAvoiding = false,
  withHeader = false,
}) => {
  const insets = useSafeAreaInsets();

  const contentStyle: ViewStyle = {
    // flex: 1,
    paddingHorizontal:
      typeof padding === 'boolean'
        ? padding
          ? moderateScale(16)
          : 0
        : padding,
    paddingVertical:
      typeof padding === 'boolean' ? (padding ? verticalScale(7) : 0) : padding,
  };

  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.inner, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.inner, contentStyle]}>{children}</View>
  );

  return (
    <>
      <StatusBar
        translucent={
          typeof statusBarTranslucent === 'boolean'
            ? statusBarTranslucent
            : !withHeader
        }
        barStyle={statusBarStyle}
        backgroundColor={
          statusBarBackgroundColor ??
          (Platform.OS === 'android' && withHeader
            ? safeAreaTopColor ?? backgroundColor
            : 'transparent')
        }
      />

      <View style={{ flex: 1, backgroundColor }}>
        {/* Top Safe Area (conditionally rendered) */}
        {!withHeader && safeTop && (
          <View
            style={{
              height: insets.top,
              backgroundColor: safeAreaTopColor ?? backgroundColor,
            }}
          />
        )}

        {/* Main Content */}
        {keyboardAvoiding ? (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}

        {/* Bottom Safe Area (conditionally rendered) */}
        {safeBottom && (
          <View
            style={{
              height: Platform.OS === 'ios' ? insets.bottom : 0,
              backgroundColor: safeAreaBottomColor ?? backgroundColor,
            }}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flexGrow: 1,
  },
});

export default ScreenWrapper;
