import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

interface BrandLogoProps {
  width?: number | string;
  height?: number;
  compact?: boolean;
  style?: StyleProp<ImageStyle>;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  width = '100%',
  height,
  compact = false,
  style,
}) => {
  const defaultHeight = compact ? 48 : 58;
  return (
    <View style={styles.wrap}>
      <Image
        source={require('../assets/images/login_logo.jpeg')}
        resizeMode="contain"
        style={[
          styles.image,
          { width, height: height ?? defaultHeight },
          style,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '100%',
  },
});

export default BrandLogo;
