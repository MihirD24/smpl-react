import {
  View,
  TextInput,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import AppIcon from './appIcon';
import { moderateScale, verticalScale } from 'react-native-size-matters';

interface SearchBarComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBarComponent: React.FC<SearchBarComponentProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = {
    background: isDarkMode ? '#0F172A' : '#F8FAFC',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    placeholder: isDarkMode ? '#64748B' : '#94A3B8',
    icon: isDarkMode ? '#94A3B8' : '#64748B',
    clearBg: isDarkMode ? '#1F2937' : '#E2E8F0',
  };

  return (
    <View
      style={{
        width: '100%',
        height: 50,
        flexDirection: 'row',
        backgroundColor: theme.background,
        borderColor: theme.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: moderateScale(12),
        alignItems: 'center',
        marginBottom: 10,
      }}
    >
      <AppIcon
        name="Search"
        size={20}
        color={theme.icon}
        style={{ marginRight: 8 }}
      />

      <TextInput
        placeholder={placeholder}
        style={{
          flex: 1,
          fontSize: 16,
          height: 40,
          padding: 0,
          color: theme.text,
        }}
        placeholderTextColor={theme.placeholder}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          activeOpacity={0.7}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.clearBg,
            marginLeft: 8,
          }}
        >
          <AppIcon name="X" size={14} color={theme.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBarComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    height: verticalScale(44), // ✅ proper height like your UI
  },

  icon: {
    marginRight: moderateScale(8),
  },

  input: {
    flex: 1,
    fontSize: moderateScale(14),
    paddingVertical: 0, // ✅ avoid extra height issues
  },
});
