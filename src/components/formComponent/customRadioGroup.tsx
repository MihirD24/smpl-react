import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

interface RadioOption {
  label: string;
  value: string;
}

interface Props {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

const CustomRadioGroup: React.FC<Props> = ({ options, value, onChange }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const dynamicStyles = getStyles(isDarkMode);

  return (
    <View style={dynamicStyles.container}>
      {options.map(option => {
        const isSelected = value === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              dynamicStyles.segment,
              isSelected && dynamicStyles.activeSegment,
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
          >
            {/* Radio Circle */}
            <View
              style={[
                dynamicStyles.circle,
                isSelected && dynamicStyles.circleActive,
              ]}
            >
              {isSelected && <View style={dynamicStyles.innerDot} />}
            </View>

            {/* Label */}
            <Text
              style={[
                dynamicStyles.label,
                isSelected && dynamicStyles.labelActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default CustomRadioGroup;

// 🎨 Dynamic styles
const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? '#1F2937' : '#E5E7EB',
      borderRadius: moderateScale(10),
      padding: moderateScale(4),
    },

    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(10),
      borderRadius: moderateScale(8),
    },

    activeSegment: {
      backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
    },

    circle: {
      width: moderateScale(16),
      height: moderateScale(16),
      borderRadius: moderateScale(8),
      borderWidth: 2,
      borderColor: isDarkMode ? '#6B7280' : '#9CA3AF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: moderateScale(6),
    },

    circleActive: {
      borderColor: '#3B82F6',
    },

    innerDot: {
      width: moderateScale(8),
      height: moderateScale(8),
      borderRadius: moderateScale(4),
      backgroundColor: '#3B82F6',
    },

    label: {
      fontSize: moderateScale(13),
      color: isDarkMode ? '#D1D5DB' : '#6B7280',
      fontWeight: '500',
    },

    labelActive: {
      color: isDarkMode ? '#FFFFFF' : '#1F2937',
      fontWeight: '600',
    },
  });
