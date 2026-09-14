import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  useColorScheme,
} from 'react-native';
import moment from 'moment';
import { useTheme } from '@react-navigation/native';
import AppIcon from '../../../components/appIcon';
import { cardStyles, getCardTheme } from '../../../assets/style/cardStyles';
import { moderateScale, s, scale, verticalScale } from 'react-native-size-matters';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const fmtMins = (mins: number): string => {
  const abs = Math.floor(Math.abs(mins));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

const fmtShiftTime = (t?: string | null): string => {
  if (!t) return '--:--';
  const m = moment(t, ['hh:mm:ss a', 'hh:mm a', 'HH:mm:ss', 'HH:mm']);
  return m.isValid() ? m.format('hh:mm a') : t;
};

const fmtDurationTime = (t?: string | null): string => {
  if (!t) return '--:--';
  const m = moment(t, ['hh:mm:ss a', 'hh:mm a', 'HH:mm:ss', 'HH:mm']);
  return m.isValid() ? m.format('HH:mm a') : t;
};

const parseToMinutes = (value: any): number => {
  if (!value) return 0;
  if (typeof value === 'number') return Math.floor(Math.abs(value));
  const hm = String(value).match(/(\d+)h\s*(\d+)m/);
  if (hm) return parseInt(hm[1]) * 60 + parseInt(hm[2]);
  const mOnly = String(value).match(/^(\d+(?:\.\d+)?)$/);
  if (mOnly) return Math.floor(parseFloat(mOnly[1]));
  return 0;
};

const calcWorked = (inTime?: string, outTime?: string): string => {
  if (!inTime || !outTime) return '';
  const inM = moment(inTime, ['hh:mm:ss a', 'hh:mm a', 'HH:mm:ss', 'HH:mm']);
  const outM = moment(outTime, ['hh:mm:ss a', 'hh:mm a', 'HH:mm:ss', 'HH:mm']);
  const mins = Math.floor(moment.duration(outM.diff(inM)).asMinutes());
  return mins > 0 ? fmtMins(mins) : '';
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminAttendanceCard({ attendanceData, navigation }) {
  const { colors } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const ct = getCardTheme(isDarkMode);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(prev => !prev);
  };

  const status = attendanceData?.status;
  const isPresent = status === 'Present';
  const isAbsent = status === 'Absent';
  const isLeave = status === 'Paid Leave';
  const isHalfDay = status === 'Half Day';

  // ── Employee info ─────────────────────────────────────────────────────────
  const empName = attendanceData?.employee?.name || '';
  const empImage =
    attendanceData?.employee?.profile_image || 'https://via.placeholder.com/40';

  // ── Duration ────────────────────────────────────────────────────────────────
  const workedStr = calcWorked(
    attendanceData?.in_time,
    attendanceData?.out_time,
  );
  const workdayLabel = workedStr ? `Workday · ${workedStr}` : 'In Progress';
  const durationIn = fmtDurationTime(attendanceData?.in_time);
  const durationOut = attendanceData?.out_time
    ? fmtDurationTime(attendanceData?.out_time)
    : null;
  const durationLabel = durationOut
    ? `${durationIn} - ${durationOut}`
    : durationIn;

  // ── Chips ───────────────────────────────────────────────────────────────────
  const lateMins = parseToMinutes(attendanceData?.late_entry);
  const overtimeMins = parseToMinutes(attendanceData?.extra_time);
  const earlyExitMins = parseToMinutes(attendanceData?.early_exit);

  const chips: { label: string; color: string; bg: string }[] = [];

  if (isPresent) {
    chips.push(
      lateMins === 0
        ? { label: 'ON TIME', color: '#10B981', bg: '#D1FAE5' }
        : {
            label: `LATE ${fmtMins(lateMins)}`,
            color: '#F59E0B',
            bg: '#FEF3C7',
          },
    );
    if (overtimeMins > 0)
      chips.push({
        label: `OVERTIME +${fmtMins(overtimeMins)}`,
        color: '#8B5CF6',
        bg: '#EDE9FE',
      });
    if (earlyExitMins > 0)
      chips.push({
        label: `EARLY EXIT -${fmtMins(earlyExitMins)}`,
        color: '#F97316',
        bg: '#FFEDD5',
      });
  } else if (isAbsent) {
    chips.push({ label: 'ABSENT', color: '#EF4444', bg: '#FEE2E2' });
  } else if (isHalfDay) {
    chips.push({ label: 'HALF DAY', color: '#F59E0B', bg: '#FEF3C7' });
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View
      style={[
        cardStyles.card,
        isDarkMode ? cardStyles.cardDark : cardStyles.cardLight,
        styles.cardOverride,
        isLeave && styles.cardLeave,
        isAbsent && styles.cardAbsent,
      ]}
    >
      {/* ── ROW 1: Avatar · Name + Workday · Duration ───────────────────── */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <Image
          source={require('../../../assets/images/profile.png')}
          style={styles.avatar}
        />

        {/* Name + subtitle */}
        <View style={cardStyles.headerText}>
          <Text
            style={[styles.empName, { color: ct.textPrimary }]}
            numberOfLines={1}
          >
            {empName}
          </Text>
          {isLeave ? (
            <Text style={styles.leaveSubtitle} numberOfLines={1}>
              {attendanceData?.leave?.reason ||
                attendanceData?.remarks ||
                'Applied for Leave'}
            </Text>
          ) : isAbsent ? (
            <Text style={[styles.absentSubtitle, { color: ct.textMuted }]}>
              No Record
            </Text>
          ) : (
            <Text
              style={[styles.workHours, { color: ct.textSecondary }]}
              numberOfLines={1}
            >
              {workdayLabel}
            </Text>
          )}
        </View>

        {/* Right: Duration / Leave tag */}
        <View style={styles.rightBlock}>
          {isPresent && (
            <View style={styles.durationBlock}>
              <Text style={[styles.durationLabel, { color: ct.textMuted }]}>
                DURATION
              </Text>
              <Text style={[styles.durationTime, { color: ct.textPrimary }]}>
                {durationLabel}
              </Text>
            </View>
          )}
          {isLeave && <Text style={styles.leaveTag}>LEAVE</Text>}
        </View>
      </View>

      {/* ── ROW 2: Chips + Chevron ───────────────────────────────────────── */}
      {(chips.length > 0 || isPresent) && (
        <View
          style={[styles.badgesAndChevronRow, { borderTopColor: ct.divider }]}
        >
          <View style={styles.chipsWrap}>
            {chips.map((chip, i) => (
              <View key={i} style={[styles.chip, { backgroundColor: chip.bg }]}>
                <Text style={[styles.chipText, { color: chip.color }]}>
                  {chip.label}
                </Text>
              </View>
            ))}
          </View>

          {isPresent && (
            <TouchableOpacity
              style={[
                styles.chevronBtn,
                { backgroundColor: ct.contentBlockBg, borderColor: ct.divider },
              ]}
              onPress={toggleExpand}
            >
              <AppIcon
                name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
                size={18}
                color={colors.notification || '#64748B'}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {(isAbsent || isLeave || isHalfDay) && (
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              isAbsent && styles.absentStatusBadge,
              isLeave && styles.leaveBadge,
              isHalfDay && styles.halfDayBadge,
            ]}
          >
            <Text style={[styles.statusText, { color: ct.textPrimary }]}>
              On a {status}
            </Text>
          </View>
          {isHalfDay && attendanceData?.out_time && (
            <Text style={[styles.outTimeLabel, { color: ct.textSecondary }]}>
              {fmtShiftTime(attendanceData.out_time)} OUT
            </Text>
          )}
        </View>
      )}

      {isExpanded && isPresent && (
        <View style={[styles.expandedSection, { borderTopColor: ct.divider }]}>
          {/* Punch-In */}
          {attendanceData?.in_time && (
            <View style={styles.punchDetailsSection}>
              <Text style={[styles.sectionTitle, { color: ct.textSecondary }]}>
                PUNCH-IN DETAILS
              </Text>
              <View style={styles.detailsRow}>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: ct.textMuted }]}>
                    CHECK-IN SELFIE
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('showImage', {
                        url: attendanceData?.in_image,
                      })
                    }
                    style={styles.imageContainer}
                  >
                    <Image
                      source={{ uri: attendanceData?.in_image }}
                      style={styles.selfieImage}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: ct.textMuted }]}>
                    PUNCH-IN LOCATION
                  </Text>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('showMap', {
                        lat: attendanceData?.in_lat,
                        long: attendanceData?.in_long,
                      })
                    }
                    style={styles.mapContainer}
                  >
                    <View style={styles.mapPlaceholder}>
                      <AppIcon name="MapPin" size={32} color="#EF4444" />
                      <Text
                        style={[styles.locationText, { color: ct.textPrimary }]}
                      >
                        {attendanceData?.in_location || 'Location'}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {/* Punch-Out */}
          {!!attendanceData?.out_time && !!attendanceData?.out_image && (
            <View style={styles.punchDetailsSection}>
              <Text style={[styles.sectionTitle, { color: ct.textSecondary }]}>
                PUNCH-OUT DETAILS
              </Text>
              <View style={styles.detailsRow}>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: ct.textMuted }]}>
                    CHECK-OUT SELFIE
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('showImage', {
                        url: attendanceData?.out_image,
                      })
                    }
                    style={styles.imageContainer}
                  >
                    <Image
                      source={{ uri: attendanceData?.out_image }}
                      style={styles.selfieImage}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.detailCard}>
                  <Text style={[styles.detailLabel, { color: ct.textMuted }]}>
                    PUNCH-OUT LOCATION
                  </Text>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('showMap', {
                        lat: attendanceData?.out_lat,
                        long: attendanceData?.out_long,
                      })
                    }
                    style={styles.mapContainer}
                  >
                    <View style={styles.mapPlaceholder}>
                      <AppIcon name="MapPin" size={32} color="#EF4444" />
                      <Text
                        style={[styles.locationText, { color: ct.textPrimary }]}
                      >
                        {attendanceData?.out_location || 'Location'}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardOverride: {
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    borderRadius: scale(12),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  cardLeave: { borderLeftWidth: scale(3), borderLeftColor: '#EF4444' },
  cardAbsent: { borderLeftWidth: scale(3), borderLeftColor: '#94A3B8' },

  // ── Top row ──────────────────────────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(12),
    backgroundColor: '#E2E8F0',
    marginRight: moderateScale(12),
  },
  empName: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    marginBottom: verticalScale(3),
  },
  workHours: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  leaveSubtitle: {
    fontSize: moderateScale(12),
    color: '#EF4444',
    fontWeight: '500',
  },
  absentSubtitle: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  rightBlock: { alignItems: 'flex-end' },
  durationBlock: { alignItems: 'flex-end' },
  durationLabel: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: verticalScale(2),
  },
  durationTime: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  leaveTag: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.6,
  },

  // ── Chips + chevron row ───────────────────────────────────────────────────
  badgesAndChevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    gap: 8,
  },
  chipsWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: scale(6),
  },
  chipText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  chevronBtn: {
    width: moderateScale(34),
    height: verticalScale(34),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(7),
    borderWidth: 1,
  },

  // ── Status badge ─────────────────────────────────────────────────────────
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  statusBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    borderRadius: scale(6),
  },
  absentStatusBadge: { backgroundColor: '#FEE2E2' },
  leaveBadge: { backgroundColor: '#DBEAFE' },
  halfDayBadge: { backgroundColor: '#FED7AA' },
  statusText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  outTimeLabel: { fontSize: moderateScale(12) },

  // ── Expanded section ──────────────────────────────────────────────────────
  expandedSection: {
    marginTop: verticalScale(16),
    paddingTop: verticalScale(6),
    borderTopWidth: 1,
  },
  punchDetailsSection: { marginBottom: verticalScale(16) },
  sectionTitle: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: verticalScale(12),
  },
  detailsRow: { flexDirection: 'row', gap: 12 },
  detailCard: { flex: 1 },
  detailLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: verticalScale(8),
  },
  imageContainer: {
    borderRadius: scale(8),
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  selfieImage: {
    width: '100%',
    height: scale(120),
    borderRadius: moderateScale(8),
  },
  mapContainer: {
    borderRadius: scale(8),
    overflow: 'hidden',
    backgroundColor: '#F0F9FF',
    borderWidth: moderateScale(1),
    borderColor: '#E0F2FE',
  },
  mapPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
  },
  locationText: {
    fontSize: moderateScale(10),
    marginTop: verticalScale(4),
    textAlign: 'center',
    paddingHorizontal: moderateScale(8),
  },
});
