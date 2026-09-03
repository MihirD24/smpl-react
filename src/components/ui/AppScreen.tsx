import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../constant/theme';

interface AppScreenProps {
  children: React.ReactNode;
  safeTop?: boolean;
  safeBottom?: boolean;
  padding?: boolean;
  keyboardAvoiding?: boolean;
}

const AppScreen: React.FC<AppScreenProps> = ({
  children,
  safeTop = true,
  safeBottom = true,
  padding = true,
  keyboardAvoiding = false,
}) => {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={[
        styles.inner,
        padding && styles.padding,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {safeTop && <View style={{ height: insets.top }} />}
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
      {safeBottom && <View style={{ height: insets.bottom }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: 16,
  },
});

export default AppScreen;
