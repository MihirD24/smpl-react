import React from 'react';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const ProfileSkeleton: React.FC = () => {
  const isDark = useColorScheme() === 'dark';

  const bgColor = isDark ? '#2A2D38' : '#E1E9EE';
  const hlColor = isDark ? '#3A3D4A' : '#F2F8FC';
  const screenBg = isDark ? '#141518' : '#F5F7FB';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: screenBg }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      <SkeletonPlaceholder
        backgroundColor={bgColor}
        highlightColor={hlColor}
        speed={1200}
      >
        {/* ══════════════════════════════════════
            HEADER — Avatar + Name + Role + Location
        ══════════════════════════════════════ */}
        <SkeletonPlaceholder.Item
          alignItems="center"
          paddingTop={52}
          paddingBottom={24}
        >
          {/* Avatar circle */}
          <SkeletonPlaceholder.Item
            width={90}
            height={90}
            borderRadius={45}
            marginBottom={12}
          />

          {/* Name */}
          <SkeletonPlaceholder.Item
            width={130}
            height={20}
            borderRadius={6}
            marginBottom={8}
          />

          {/* Role • Company */}
          <SkeletonPlaceholder.Item
            width={190}
            height={14}
            borderRadius={5}
            marginBottom={8}
          />

          {/* Location row */}
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item width={13} height={13} borderRadius={7} />
            <SkeletonPlaceholder.Item
              marginLeft={4}
              width={110}
              height={12}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* ══════════════════════════════════════
            STATS GRID — My Leaves + Time Difference
        ══════════════════════════════════════ */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          marginHorizontal={16}
          marginBottom={24}
        >
          {/* Card 1 — My Leaves */}
          <SkeletonPlaceholder.Item
            flex={1}
            borderRadius={16}
            padding={16}
            marginRight={6}
            height={100}
          />

          {/* Card 2 — Time Difference */}
          <SkeletonPlaceholder.Item
            flex={1}
            borderRadius={16}
            padding={16}
            marginLeft={6}
            height={100}
          />
        </SkeletonPlaceholder.Item>

        {/* ══════════════════════════════════════
            QUICK ACCESS — Section label + 3 cards
        ══════════════════════════════════════ */}

        {/* Section label */}
        <SkeletonPlaceholder.Item
          width={90}
          height={11}
          borderRadius={4}
          marginLeft={20}
          marginBottom={10}
        />

        {/* 3 quick cards */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          marginHorizontal={16}
          marginBottom={24}
        >
          {[0, 1, 2].map(i => (
            <SkeletonPlaceholder.Item
              key={i}
              flex={1}
              borderRadius={16}
              height={100}
              marginLeft={i > 0 ? 12 : 0}
            />
          ))}
        </SkeletonPlaceholder.Item>

        {/* ══════════════════════════════════════
            OPERATIONS — Section label + menu card
        ══════════════════════════════════════ */}

        {/* Section label */}
        <SkeletonPlaceholder.Item
          width={80}
          height={11}
          borderRadius={4}
          marginLeft={20}
          marginBottom={10}
        />

        {/* Menu card with 2 rows */}
        <SkeletonPlaceholder.Item
          borderRadius={14}
          marginHorizontal={16}
          marginBottom={18}
          paddingVertical={6}
        >
          {/* Row 1 — Work Logs */}
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            paddingVertical={14}
            paddingHorizontal={14}
          >
            <SkeletonPlaceholder.Item
              width={38}
              height={38}
              borderRadius={10}
              marginRight={12}
            />
            <SkeletonPlaceholder.Item flex={1} height={15} borderRadius={5} />
            <SkeletonPlaceholder.Item
              width={18}
              height={18}
              borderRadius={4}
              marginLeft={8}
            />
          </SkeletonPlaceholder.Item>

          {/* Divider */}
          <SkeletonPlaceholder.Item
            height={1}
            marginLeft={64}
            borderRadius={1}
          />

          {/* Row 2 — Projects */}
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            paddingVertical={14}
            paddingHorizontal={14}
          >
            <SkeletonPlaceholder.Item
              width={38}
              height={38}
              borderRadius={10}
              marginRight={12}
            />
            <SkeletonPlaceholder.Item flex={1} height={15} borderRadius={5} />
            <SkeletonPlaceholder.Item
              width={18}
              height={18}
              borderRadius={4}
              marginLeft={8}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* ══════════════════════════════════════
            SYSTEM — Section label + menu card
        ══════════════════════════════════════ */}

        {/* Section label */}
        <SkeletonPlaceholder.Item
          width={56}
          height={11}
          borderRadius={4}
          marginLeft={20}
          marginBottom={10}
        />

        {/* Menu card — 1 row (Notifications) */}
        <SkeletonPlaceholder.Item
          borderRadius={14}
          marginHorizontal={16}
          marginBottom={18}
          paddingVertical={6}
        >
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            paddingVertical={14}
            paddingHorizontal={14}
          >
            <SkeletonPlaceholder.Item
              width={38}
              height={38}
              borderRadius={10}
              marginRight={12}
            />
            <SkeletonPlaceholder.Item flex={1} height={15} borderRadius={5} />
            <SkeletonPlaceholder.Item
              width={18}
              height={18}
              borderRadius={4}
              marginLeft={8}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* ══════════════════════════════════════
            SIGN OUT BUTTON
        ══════════════════════════════════════ */}
        <SkeletonPlaceholder.Item
          height={52}
          borderRadius={14}
          marginHorizontal={16}
          marginBottom={20}
        />

        {/* VERSION TEXT */}
        <SkeletonPlaceholder.Item
          width={160}
          height={10}
          borderRadius={4}
          alignSelf="center"
        />
      </SkeletonPlaceholder>
    </ScrollView>
  );
};

export default ProfileSkeleton;

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
});
