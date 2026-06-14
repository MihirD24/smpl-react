import React from 'react';
import {
  TouchableOpacity,
  Text,
  useColorScheme,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import MainStyle from '../../assets/style/maincss';
import { moderateScale } from 'react-native-size-matters';

interface CustomButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onPress,
  disabled = false,
  style,
}) => {
  const MainStyles = MainStyle();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={0.6}
      onPress={onPress}
      style={[
        MainStyles.button,
        MainStyles.buttonWidth95,
        isDarkMode ? MainStyles.buttonSoftGray : MainStyles.buttonBlack,
        disabled && MainStyles.disabledButton,
        style,
        styles.submitButton,
      ]}
    >
      <Text style={MainStyles.ButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles =  StyleSheet.create({
  submitButton: {
    width: '95%',
    backgroundColor: '#3B82F6', 
    paddingVertical: 15,
  },
});