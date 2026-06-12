import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import MainStyle from '../assets/style/maincss';

export default function LeaveCardSkeleton() {
  const mainStyles = MainStyle();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={isDarkMode ? styles.containerDark : styles.containerLight}>
      <SkeletonPlaceholder
        backgroundColor={isDarkMode ? '#2A2A2A' : '#E1E9EE'}
        highlightColor={isDarkMode ? '#3A3A3A' : '#F2F8FC'}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            {/* Avatar */}
            <SkeletonPlaceholder.Item
              width={44}
              height={44}
              borderRadius={22}
            />

            <View style={{ marginLeft: 12 }}>
              {/* Name */}
              <SkeletonPlaceholder.Item
                width={90}
                height={14}
                borderRadius={4}
              />

              {/* Leave type + duration */}
              <SkeletonPlaceholder.Item
                marginTop={6}
                width={130}
                height={12}
                borderRadius={4}
              />
            </View>
          </View>

          {/* Status pill */}
          <SkeletonPlaceholder.Item
            width={80}
            height={24}
            borderRadius={12}
          />
        </View>

        {/* DATE RANGE */}
        <View style={styles.dateRow}>
          <View>
            <SkeletonPlaceholder.Item
              width={80}
              height={10}
              borderRadius={4}
            />
            <SkeletonPlaceholder.Item
              marginTop={6}
              width={150}
              height={14}
              borderRadius={4}
            />
          </View>

          {/* Calendar icon */}
          <SkeletonPlaceholder.Item
            width={36}
            height={36}
            borderRadius={8}
          />
        </View>

        {/* REASON */}
        <View style={styles.reason}>
          <SkeletonPlaceholder.Item
            width="100%"
            height={12}
            borderRadius={4}
          />
          <SkeletonPlaceholder.Item
            marginTop={6}
            width="70%"
            height={12}
            borderRadius={4}
          />
        </View>
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  reason: {
    marginTop: 14,
  },
});
