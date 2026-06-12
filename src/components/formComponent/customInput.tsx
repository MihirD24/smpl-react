import React from 'react';
import {
  TextInput,
  View,
  Text,
  KeyboardTypeOptions,
  StyleSheet,
  StyleProp,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import MainStyle from '../../assets/style/maincss';
import { moderateScale } from 'react-native-size-matters';

interface CustomInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isMultiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  iconName?: keyof typeof Icons; // Lucide icon name
  style?: StyleProp<ViewStyle>;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  isMultiline = false,
  keyboardType = 'default',
  iconName,
  style,
 
}) => {
  const MainStyles = MainStyle();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = {
    background: isDarkMode ? '#0F172A' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#1E293B',
    placeholder: isDarkMode ? '#64748B' : '#94A3B8',
  };

  const IconComponent: LucideIcon | undefined = iconName
    ? Icons[iconName]
    : undefined;

  return (
    <View style={{ marginBottom: 16 }}>
      {label && <Text style={MainStyles.formlabel}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isMultiline && styles.textAreaWrapper,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
          },
          style,
        ]}
      >
        {IconComponent && (
          <IconComponent size={20} color="#3B82F6" style={{ marginRight: 8 }} />
        )}

        <TextInput
          style={[
            styles.input,
            isMultiline && styles.textArea,
            { color: theme.text },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          multiline={isMultiline}
          numberOfLines={isMultiline ? 4 : 1}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: moderateScale(4),
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
