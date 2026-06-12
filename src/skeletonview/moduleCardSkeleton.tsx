import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function ModuleCardSkeleton() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={isDarkMode ? styles.containerDark : styles.containerLight}>
      <SkeletonPlaceholder
        backgroundColor={isDarkMode ? '#2A2A2A' : '#E1E9EE'}
        highlightColor={isDarkMode ? '#3A3A3A' : '#F2F8FC'}
      >
        {/* Module Title */}
        <SkeletonPlaceholder.Item
          width={140}
          height={16}
          borderRadius={4}
        />

        {/* Subtitle */}
        <SkeletonPlaceholder.Item
          marginTop={10}
          width={200}
          height={13}
          borderRadius={4}
        />

        {/* Meta row: icon + text  |  icon + text */}
        <SkeletonPlaceholder.Item
          marginTop={14}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={18} height={18} borderRadius={9} />
            <SkeletonPlaceholder.Item
              marginLeft={8}
              width={90}
              height={13}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={18} height={18} borderRadius={9} />
            <SkeletonPlaceholder.Item
              marginLeft={8}
              width={90}
              height={13}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* Status pill + action button */}
        <SkeletonPlaceholder.Item
          marginTop={14}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item
            width={80}
            height={24}
            borderRadius={12}
          />
          <SkeletonPlaceholder.Item
            width={100}
            height={32}
            borderRadius={8}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
}

const styles = StyleSheet.create({
  containerLight: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  containerDark: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
});