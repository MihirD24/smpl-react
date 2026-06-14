import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import AppIcon from '../appIcon';

interface AddButtonProps {
  onPress: () => void;
  iconName?: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const AddButton: React.FC<AddButtonProps> = ({
  onPress,
  iconName = 'Plus',
  size = 24,
  color = '#FFFFFF',
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <AppIcon name={iconName} size={scale(size)} color={color} />
    </TouchableOpacity>
  );
};

export default AddButton;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: scale(20),
    bottom: scale(20),
    width: scale(56),
    height: scale(56),
    borderRadius: scale(28),
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});