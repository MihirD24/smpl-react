import React from 'react';
import { ViewStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { LucideProps } from 'lucide-react-native';

export type IconName = keyof typeof LucideIcons;

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  const IconComponent =
    LucideIcons[name] as React.FC<LucideProps>;

  if (!IconComponent) {
    console.warn(`Lucide icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} color={color} style={style} />;
};

export default AppIcon;
