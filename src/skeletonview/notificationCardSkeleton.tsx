import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function NotificationCardSkeleton() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={isDarkMode ? styles.containerDark : styles.containerLight}>
      <SkeletonPlaceholder
        backgroundColor={isDarkMode ? '#2A2A2A' : '#E1E9EE'}
        highlightColor={isDarkMode ? '#3A3A3A' : '#F2F8FC'}
      >
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
        >
          {/* Left Icon Box */}
          <SkeletonPlaceholder.Item
            width={42}
            height={42}
            borderRadius={12}
          />

          {/* Text Content */}
          <SkeletonPlaceholder.Item marginLeft={12} flex={1}>
            {/* Title */}
            <SkeletonPlaceholder.Item
              width={160}
              height={14}
              borderRadius={4}
            />
            {/* Description line 1 */}
            <SkeletonPlaceholder.Item
              marginTop={8}
              width={'100%'}
              height={12}
              borderRadius={4}
            />
            {/* Description line 2 */}
            <SkeletonPlaceholder.Item
              marginTop={5}
              width={'70%'}
              height={12}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
}

const styles = StyleSheet.create({
  containerLight: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});