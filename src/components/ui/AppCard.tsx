import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme, shadows } from '../../constant/theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  noPadding?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ children, style, noPadding = false }) => {
  const { colors, isDark } = useAppTheme();
  const shadowStyle = isDark ? shadows.dark : shadows.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : 'transparent',
          borderWidth: isDark ? 1 : 0,
        },
        shadowStyle,
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
  },
  padding: {
    padding: 16,
  },
});

export default AppCard;
