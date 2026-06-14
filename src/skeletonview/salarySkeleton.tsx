import React from 'react';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

// ─── Single skeleton card ─────────────────────────────────────────────────────
const SalaryCardSkeleton: React.FC = () => {
  const isDark = useColorScheme() === 'dark';

  const bgColor = isDark ? '#2A2D38' : '#E1E9EE';
  const hlColor = isDark ? '#3A3D4A' : '#F2F8FC';
  const screenBg = isDark ? '#141518' : '#F5F7FB';
  return (
    <View style={[styles.card, { backgroundColor: screenBg }]}>
      <SkeletonPlaceholder
        backgroundColor={bgColor}
        highlightColor={hlColor}
        speed={1200}
      >
        {/* ── Header: icon circle + month/year + entry date ── */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
          marginBottom={verticalScale(18)}
        >
          {/* Icon circle */}
          <SkeletonPlaceholder.Item
            width={moderateScale(40)}
            height={moderateScale(40)}
            borderRadius={moderateScale(20)}
            marginRight={scale(14)}
          />
          {/* Month + entry date */}
          <SkeletonPlaceholder.Item flex={1}>
            <SkeletonPlaceholder.Item
              width={scale(130)}
              height={moderateScale(14)}
              borderRadius={4}
              marginBottom={verticalScale(6)}
            />
            <SkeletonPlaceholder.Item
              width={scale(90)}
              height={moderateScale(10)}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* ── Period + Salary row ── */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={verticalScale(18)}
        >
          {/* Period block */}
          <SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              width={scale(50)}
              height={moderateScale(9)}
              borderRadius={4}
              marginBottom={verticalScale(6)}
            />
            <SkeletonPlaceholder.Item
              width={scale(110)}
              height={moderateScale(12)}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>

          {/* Salary block */}
          <SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item
              width={scale(45)}
              height={moderateScale(9)}
              borderRadius={4}
              marginBottom={verticalScale(6)}
            />
            <SkeletonPlaceholder.Item
              width={scale(80)}
              height={moderateScale(12)}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>

        {/* ── 4-column stats grid ── */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={verticalScale(16)}
        >
          {[
            scale(50), // HOLIDAYS
            scale(40), // LEAVES
            scale(55), // WORK DAYS
            scale(60), // ACTUAL DAYS
          ].map((labelW, i) => (
            <SkeletonPlaceholder.Item key={i} alignItems="center">
              <SkeletonPlaceholder.Item
                width={labelW}
                height={moderateScale(9)}
                borderRadius={4}
                marginBottom={verticalScale(6)}
              />
              <SkeletonPlaceholder.Item
                width={scale(28)}
                height={moderateScale(13)}
                borderRadius={4}
              />
            </SkeletonPlaceholder.Item>
          ))}
        </SkeletonPlaceholder.Item>

        {/* ── Thin divider ── */}
        <SkeletonPlaceholder.Item
          height={1}
          width="100%"
          borderRadius={0}
          marginBottom={verticalScale(16)}
        />

        {/* ── Bottom row: additional + paid amount + download btn ── */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Additional */}
          <SkeletonPlaceholder.Item alignItems="center" flex={1}>
            <SkeletonPlaceholder.Item
              width={scale(60)}
              height={moderateScale(9)}
              borderRadius={4}
              marginBottom={verticalScale(5)}
            />
            <SkeletonPlaceholder.Item
              width={scale(72)}
              height={moderateScale(14)}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>

          {/* Paid Amount */}
          <SkeletonPlaceholder.Item alignItems="center" flex={1}>
            <SkeletonPlaceholder.Item
              width={scale(70)}
              height={moderateScale(9)}
              borderRadius={4}
              marginBottom={verticalScale(5)}
            />
            <SkeletonPlaceholder.Item
              width={scale(80)}
              height={moderateScale(14)}
              borderRadius={4}
            />
          </SkeletonPlaceholder.Item>

          {/* Download button circle */}
          <SkeletonPlaceholder.Item
            width={moderateScale(40)}
            height={moderateScale(40)}
            borderRadius={moderateScale(20)}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </View>
  );
};

// ─── Main skeleton screen ─────────────────────────────────────────────────────
const SalarySkeleton: React.FC = () => {
  const isDark = useColorScheme() === 'dark';

  const bgColor = isDark ? '#2A2D38' : '#E1E9EE';
  const hlColor = isDark ? '#3A3D4A' : '#F2F8FC';
  const screenBg = isDark ? '#12121E' : '#F4F5FA';
  const cardBg = isDark ? '#1E1E2E' : '#FFFFFF';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: screenBg }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      {/* Render 3 placeholder cards (matches typical salary list length) */}
      {[0, 1, 2].map(i => (
        <SalaryCardSkeleton key={i} bgColor={bgColor} hlColor={hlColor} />
      ))}
    </ScrollView>
  );
};

export default SalarySkeleton;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: scale(14),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(60),
    gap: verticalScale(14),
  },
  card: {
    borderRadius: moderateScale(16),
    padding: moderateScale(18),
    elevation: 1,
  },
});
