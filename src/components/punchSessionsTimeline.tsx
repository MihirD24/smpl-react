import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import moment from 'moment';
import { PunchSession } from '../types/adminAttendance';
import AppIcon from './appIcon';

interface PunchSessionsTimelineProps {
  punches?: PunchSession[];
  isDarkMode?: boolean;
}

const formatPunchTime = (timeStr?: string | null) => {
  if (!timeStr) return '--:--';
  // Check if already has AM/PM
  if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
    return timeStr;
  }
  const m = moment(timeStr, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DD HH:mm:ss']);
  return m.isValid() ? m.format('hh:mm A') : timeStr;
};

const calculateBreakDuration = (endPrevious: string, startNext: string) => {
  try {
    const t1 = moment(endPrevious, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DD HH:mm:ss', 'hh:mm A']);
    const t2 = moment(startNext, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DD HH:mm:ss', 'hh:mm A']);
    if (t1.isValid() && t2.isValid()) {
      const diffMins = Math.max(0, t2.diff(t1, 'minutes'));
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    }
  } catch {
    // fallback
  }
  return null;
};

const PunchSessionsTimeline: React.FC<PunchSessionsTimelineProps> = ({
  punches = [],
  isDarkMode: propDarkMode,
}) => {
  const systemDarkMode = useColorScheme() === 'dark';
  const isDarkMode = propDarkMode !== undefined ? propDarkMode : systemDarkMode;

  if (!punches || punches.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            backgroundColor: isDarkMode ? '#171A21' : '#F9FAFB',
            borderColor: isDarkMode ? '#2D323E' : '#E5E7EB',
          },
        ]}
      >
        <AppIcon
          name="Clock"
          size={moderateScale(16)}
          color={isDarkMode ? '#6B7280' : '#9CA3AF'}
        />
        <Text
          style={[
            styles.emptyText,
            { color: isDarkMode ? '#9CA3AF' : '#6B7280' },
          ]}
        >
          No punch sessions recorded yet today.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.timelineContainer,
        {
          backgroundColor: isDarkMode ? '#13161C' : '#F8FAFC',
          borderColor: isDarkMode ? '#262A34' : '#E2E8F0',
        },
      ]}
    >
      <View style={styles.timelineHeader}>
        <Text
          style={[
            styles.timelineTitle,
            { color: isDarkMode ? '#9CA3AF' : '#64748B' },
          ]}
        >
          PUNCH SESSIONS TIMELINE
        </Text>
        <Text
          style={[
            styles.sessionCount,
            { color: isDarkMode ? '#60A5FA' : '#2563EB' },
          ]}
        >
          {punches.length} {punches.length === 1 ? 'Session' : 'Sessions'}
        </Text>
      </View>

      {punches.map((punch, idx) => {
        const sessionNum = idx + 1;
        const inFormatted = formatPunchTime(punch.punch_in);
        const isActive = punch.is_active || !punch.punch_out;
        const outFormatted = isActive ? 'Active Now' : formatPunchTime(punch.punch_out);
        const durationFormatted = punch.duration_formatted
          ? `(${punch.duration_formatted})`
          : punch.duration_minutes
          ? `(${Math.floor(punch.duration_minutes / 60)}h ${punch.duration_minutes % 60}m)`
          : '';

        // Check if there was a break between previous punch out and this punch in
        let breakInfo: { start: string; end: string; duration: string } | null = null;
        if (idx > 0 && punches[idx - 1]?.punch_out) {
          const prevOut = punches[idx - 1].punch_out!;
          const currIn = punch.punch_in;
          const breakDuration = calculateBreakDuration(prevOut, currIn);
          if (breakDuration) {
            breakInfo = {
              start: formatPunchTime(prevOut),
              end: formatPunchTime(currIn),
              duration: breakDuration,
            };
          }
        }

        return (
          <React.Fragment key={punch.id || idx}>
            {/* Break between sessions if applicable */}
            {breakInfo && (
              <View style={styles.breakRow}>
                <View style={styles.breakLine} />
                <View
                  style={[
                    styles.breakBadge,
                    {
                      backgroundColor: isDarkMode ? '#262015' : '#FFFBEB',
                      borderColor: isDarkMode ? '#4D3B16' : '#FDE68A',
                    },
                  ]}
                >
                  <AppIcon
                    name="Coffee"
                    size={moderateScale(12)}
                    color={isDarkMode ? '#FBBF24' : '#D97706'}
                  />
                  <Text
                    style={[
                      styles.breakText,
                      { color: isDarkMode ? '#FCD34D' : '#B45309' },
                    ]}
                  >
                    Break: {breakInfo.start} - {breakInfo.end} ({breakInfo.duration})
                  </Text>
                </View>
                <View style={styles.breakLine} />
              </View>
            )}

            {/* Session Card */}
            <View
              style={[
                styles.sessionCard,
                {
                  backgroundColor: isDarkMode ? '#1E222B' : '#FFFFFF',
                  borderColor: isActive
                    ? '#10B981'
                    : isDarkMode
                    ? '#2D323E'
                    : '#E5E7EB',
                },
                isActive && styles.activeSessionGlow,
              ]}
            >
              <View style={styles.sessionLeft}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isActive ? '#10B981' : '#3B82F6',
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.sessionTitleRow}>
                    <Text
                      style={[
                        styles.sessionLabel,
                        { color: isDarkMode ? '#F3F4F6' : '#111827' },
                      ]}
                    >
                      Session {sessionNum}
                    </Text>
                    {isActive && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>WORKING</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.sessionTime,
                      { color: isDarkMode ? '#9CA3AF' : '#4B5563' },
                    ]}
                  >
                    {inFormatted} - {outFormatted}
                  </Text>
                </View>
              </View>

              {durationFormatted ? (
                <View style={styles.sessionRight}>
                  <Text
                    style={[
                      styles.durationText,
                      { color: isDarkMode ? '#E5E7EB' : '#111827' },
                    ]}
                  >
                    {durationFormatted}
                  </Text>
                </View>
              ) : null}
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default PunchSessionsTimeline;

const styles = StyleSheet.create({
  timelineContainer: {
    borderRadius: moderateScale(12),
    padding: moderateScale(12),
    borderWidth: 1,
    marginTop: verticalScale(10),
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  timelineTitle: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  sessionCount: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    marginTop: verticalScale(10),
    gap: scale(8),
  },
  emptyText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(6),
    paddingHorizontal: scale(4),
  },
  breakLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB30',
  },
  breakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    gap: scale(4),
  },
  breakText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(9),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    marginBottom: verticalScale(6),
  },
  activeSessionGlow: {
    borderLeftWidth: scale(3.5),
    borderLeftColor: '#10B981',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(8),
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  sessionLabel: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  sessionTime: {
    fontSize: moderateScale(11),
    marginTop: verticalScale(2),
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: moderateScale(5),
    paddingVertical: verticalScale(1),
    borderRadius: moderateScale(4),
  },
  activePillText: {
    color: '#15803D',
    fontSize: moderateScale(9),
    fontWeight: '800',
  },
  sessionRight: {
    marginLeft: scale(8),
  },
  durationText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
});
