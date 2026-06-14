import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import AppIcon from '../components/appIcon';

const WorkLogCardSkeleton = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={isDarkMode ? styles.containerDark : styles.containerLight}>
      <SkeletonPlaceholder
        backgroundColor={isDarkMode ? '#2A2A2A' : '#E1E9EE'}
        highlightColor={isDarkMode ? '#3A3A3A' : '#F2F8FC'}
      >
        {/* Job Title */}
        <SkeletonPlaceholder.Item width={100} height={14} borderRadius={4} />

        {/* Description */}
        <SkeletonPlaceholder.Item
          marginTop={12}
          width={200}
          height={14}
          borderRadius={4}
        />

        {/* CircleUser row */}
        <SkeletonPlaceholder.Item
          marginTop={12}
          flexDirection="row"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item width={18} height={18} borderRadius={9} />
          <SkeletonPlaceholder.Item
            marginLeft={8}
            width={120}
            height={14}
            borderRadius={4}
          />
        </SkeletonPlaceholder.Item>

        {/* Folder row */}
        <SkeletonPlaceholder.Item
          marginTop={12}
          flexDirection="row"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item width={18} height={18} borderRadius={4} />
          <SkeletonPlaceholder.Item
            marginLeft={8}
            width={120}
            height={14}
            borderRadius={4}
          />
        </SkeletonPlaceholder.Item>

        {/* Clock + UserCog row */}
        <SkeletonPlaceholder.Item
          marginTop={12}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={18} height={18} borderRadius={9} />
            <SkeletonPlaceholder.Item
              marginLeft={8}
              width={80}
              height={14}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={18} height={18} borderRadius={9} />
            <SkeletonPlaceholder.Item
              marginLeft={8}
              width={80}
              height={14}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* CircleCheck + Status pill row */}
        <SkeletonPlaceholder.Item
          marginTop={12}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={18} height={18} borderRadius={9} />
            <SkeletonPlaceholder.Item
              marginLeft={8}
              width={100}
              height={14}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>

          {/* Status pill */}
          <SkeletonPlaceholder.Item width={60} height={20} borderRadius={10} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

export default WorkLogCardSkeleton;

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
