import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import moment from 'moment';
import { GraceInfo } from '../types/adminAttendance';
import AppIcon from './appIcon';

interface GraceTrackerWidgetProps {
  graceInfo?: GraceInfo;
  monthName?: string;
  style?: any;
}

const GraceTrackerWidget: React.FC<GraceTrackerWidgetProps> = ({
  graceInfo,
  monthName,
  style,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  if (!graceInfo) {
    return null;
  }

  const {
    late_grace_allowed = 45,
    late_used_minutes = 0,
    late_remaining_minutes = 45,
    late_excess_minutes = 0,
    early_grace_allowed = 45,
    early_used_minutes = 0,
    early_remaining_minutes = 45,
    early_excess_minutes = 0,
  } = graceInfo;

  const totalExcess = Number(late_excess_minutes || 0) + Number(early_excess_minutes || 0);
  const currentMonthLabel = monthName || moment().format('MMMM YYYY');

  // Percentages clamped between 0 and 100
  const latePercent = Math.min(
    100,
    Math.round((Number(late_used_minutes || 0) / (Number(late_grace_allowed) || 45)) * 100) || 0,
  );
  const earlyPercent = Math.min(
    100,
    Math.round((Number(early_used_minutes || 0) / (Number(early_grace_allowed) || 45)) * 100) || 0,
  );

  const getBarColor = (used: number, allowed: number, excess: number) => {
    if (excess > 0) return '#EF4444'; // Red
    if (used >= allowed * 0.8) return '#F59E0B'; // Amber warning
    return '#10B981'; // Green
  };

  const lateBarColor = getBarColor(late_used_minutes, late_grace_allowed, late_excess_minutes);
  const earlyBarColor = getBarColor(early_used_minutes, early_grace_allowed, early_excess_minutes);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#171A21' : '#FFFFFF',
          borderColor: isDarkMode ? '#282C35' : '#E2E8F0',
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <AppIcon
            name="ShieldAlert"
            size={moderateScale(16)}
            color={isDarkMode ? '#FBBF24' : '#D97706'}
          />
          <Text
            style={[
              styles.headerTitle,
              { color: isDarkMode ? '#F3F4F6' : '#111827' },
            ]}
          >
            MONTHLY GRACE BALANCE
          </Text>
        </View>
        <Text style={[styles.monthBadgeText, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
          {currentMonthLabel}
        </Text>
      </View>

      {/* Excess Alert Banner */}
      {totalExcess > 0 && (
        <View
          style={[
            styles.alertBanner,
            {
              backgroundColor: isDarkMode ? '#3A1418' : '#FEF2F2',
              borderColor: isDarkMode ? '#7F1D1D' : '#FCA5A5',
            },
          ]}
        >
          <AppIcon name="AlertTriangle" size={moderateScale(15)} color="#EF4444" />
          <Text
            style={[
              styles.alertText,
              { color: isDarkMode ? '#FCA5A5' : '#B91C1C' },
            ]}
          >
            <Text style={{ fontWeight: '700' }}>Notice: </Text>
            You have exceeded monthly grace by{' '}
            <Text style={{ fontWeight: '800' }}>{totalExcess} mins</Text>. An hourly
            deduction will apply in this month's payroll.
          </Text>
        </View>
      )}

      {/* Metric 1: Late Entry Grace */}
      <View style={styles.graceSection}>
        <View style={styles.metricHeader}>
          <View style={styles.metricLabelRow}>
            <AppIcon
              name="Clock"
              size={moderateScale(14)}
              color={isDarkMode ? '#60A5FA' : '#2563EB'}
            />
            <Text
              style={[
                styles.metricName,
                { color: isDarkMode ? '#E5E7EB' : '#1F2937' },
              ]}
            >
              Late Entry Grace
            </Text>
          </View>
          <View
            style={[
              styles.remainingBadge,
              {
                backgroundColor:
                  late_excess_minutes > 0
                    ? isDarkMode ? '#451217' : '#FEE2E2'
                    : isDarkMode ? '#143026' : '#DCFCE7',
              },
            ]}
          >
            <Text
              style={[
                styles.remainingBadgeText,
                {
                  color:
                    late_excess_minutes > 0
                      ? '#EF4444'
                      : isDarkMode ? '#4ADE80' : '#15803D',
                },
              ]}
            >
              {late_excess_minutes > 0
                ? `+${late_excess_minutes}m excess`
                : `${late_remaining_minutes}m left`}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text
            style={[
              styles.usedText,
              { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            Used: <Text style={{ fontWeight: '700', color: isDarkMode ? '#F3F4F6' : '#111827' }}>{late_used_minutes}m</Text> / {late_grace_allowed}m
          </Text>
          <Text
            style={[
              styles.percentText,
              { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            {latePercent}%
          </Text>
        </View>

        <View
          style={[
            styles.progressTrack,
            { backgroundColor: isDarkMode ? '#242833' : '#E5E7EB' },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${latePercent}%`,
                backgroundColor: lateBarColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Metric 2: Early Exit Grace */}
      <View style={[styles.graceSection, { marginTop: verticalScale(14) }]}>
        <View style={styles.metricHeader}>
          <View style={styles.metricLabelRow}>
            <AppIcon
              name="LogOut"
              size={moderateScale(14)}
              color={isDarkMode ? '#F59E0B' : '#D97706'}
            />
            <Text
              style={[
                styles.metricName,
                { color: isDarkMode ? '#E5E7EB' : '#1F2937' },
              ]}
            >
              Early Exit Grace
            </Text>
          </View>
          <View
            style={[
              styles.remainingBadge,
              {
                backgroundColor:
                  early_excess_minutes > 0
                    ? isDarkMode ? '#451217' : '#FEE2E2'
                    : isDarkMode ? '#143026' : '#DCFCE7',
              },
            ]}
          >
            <Text
              style={[
                styles.remainingBadgeText,
                {
                  color:
                    early_excess_minutes > 0
                      ? '#EF4444'
                      : isDarkMode ? '#4ADE80' : '#15803D',
                },
              ]}
            >
              {early_excess_minutes > 0
                ? `+${early_excess_minutes}m excess`
                : `${early_remaining_minutes}m left`}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text
            style={[
              styles.usedText,
              { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            Used: <Text style={{ fontWeight: '700', color: isDarkMode ? '#F3F4F6' : '#111827' }}>{early_used_minutes}m</Text> / {early_grace_allowed}m
          </Text>
          <Text
            style={[
              styles.percentText,
              { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
            ]}
          >
            {earlyPercent}%
          </Text>
        </View>

        <View
          style={[
            styles.progressTrack,
            { backgroundColor: isDarkMode ? '#242833' : '#E5E7EB' },
          ]}
        >
          <View
            style={[
              styles.progressBar,
              {
                width: `${earlyPercent}%`,
                backgroundColor: earlyBarColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Policy Footer Note */}
      <View style={styles.policyRow}>
        <AppIcon
          name="Info"
          size={moderateScale(12)}
          color={isDarkMode ? '#6B7280' : '#9CA3AF'}
        />
        <Text
          style={[
            styles.policyText,
            { color: isDarkMode ? '#6B7280' : '#9CA3AF' },
          ]}
        >
          Rule: Excess minutes beyond 45 mins are deducted hourly from gross salary.
        </Text>
      </View>
    </View>
  );
};

export default GraceTrackerWidget;

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
    borderWidth: 1,
    marginTop: verticalScale(12),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  headerTitle: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  monthBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    marginBottom: verticalScale(12),
    gap: scale(6),
  },
  alertText: {
    flex: 1,
    fontSize: moderateScale(11),
    lineHeight: moderateScale(15),
  },
  graceSection: {
    marginTop: verticalScale(2),
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  metricName: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  remainingBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(10),
  },
  remainingBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  usedText: {
    fontSize: moderateScale(11),
  },
  percentText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  progressTrack: {
    height: verticalScale(6),
    borderRadius: moderateScale(3),
    overflow: 'hidden',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: moderateScale(3),
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(12),
    paddingTop: verticalScale(8),
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB25',
    gap: scale(6),
  },
  policyText: {
    fontSize: moderateScale(10),
    flex: 1,
    lineHeight: moderateScale(13),
  },
});
