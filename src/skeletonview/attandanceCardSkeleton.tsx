import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function AttendanceCardSkeleton() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={isDarkMode ? styles.containerDark : styles.containerLight}>
      <SkeletonPlaceholder
        backgroundColor={isDarkMode ? '#2A2A2A' : '#E1E9EE'}
        highlightColor={isDarkMode ? '#3A3A3A' : '#F2F8FC'}
      >
        {/* Header: Name + Hours */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item width={120} height={14} borderRadius={4} />
          <SkeletonPlaceholder.Item width={60} height={14} borderRadius={4} />
        </SkeletonPlaceholder.Item>

        {/* Punch In / Punch Out buttons + chevron */}
        <SkeletonPlaceholder.Item
          marginTop={14}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Punch In button */}
          <SkeletonPlaceholder.Item
            width={110}
            height={36}
            borderRadius={8}
          />

          {/* Punch Out button */}
          <SkeletonPlaceholder.Item
            width={110}
            height={36}
            borderRadius={8}
          />

          {/* Chevron / dropdown */}
          <SkeletonPlaceholder.Item
            width={36}
            height={36}
            borderRadius={8}
          />
        </SkeletonPlaceholder.Item>

        {/* Footer info row */}
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
              width={100}
              height={13}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={18} height={18} borderRadius={9} />
            <SkeletonPlaceholder.Item
              marginLeft={8}
              width={100}
              height={13}
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