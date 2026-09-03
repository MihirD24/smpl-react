import { useColorScheme } from 'react-native';

export const lightColors = {
  primary: '#F59E0B', // Vibrant JCB Yellow
  primaryDark: '#D97706',
  background: '#F9FAFB', // Very light gray for clean look
  surface: '#FFFFFF',
  text: '#111827', // Almost black
  textMuted: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  card: '#FFFFFF',
};

export const darkColors = {
  primary: '#FBBF24', // Brighter yellow for dark mode
  primaryDark: '#F59E0B',
  background: '#0F172A', // Deep modern slate/black
  surface: '#1E293B', // Slightly lighter slate for cards
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#334155',
  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',
  card: '#1E293B',
};

export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  }
};

export const useAppTheme = () => {
  const isDark = useColorScheme() === 'dark';
  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    shadows: isDark ? shadows.dark : shadows.light,
  };
};
