import React, { useState } from 'react';
import { View, Text, Dimensions, Image, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { AttendanceItem } from '../../types/adminAttendance';
import { cardStyles, getCardTheme } from '../../assets/style/cardStyles'; // adjust path as needed
import AppIcon from '../../components/appIcon';

// ─── Scaling ──────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const parseDateDMY = (dateStr?: string): moment.Moment | null => {
  if (!dateStr) return null;
  if (dateStr.includes('-') && dateStr.length === 10 && dateStr[4] === '-') {
    return moment(dateStr, 'YYYY-MM-DD');
  }
  const p = dateStr.split('-');
  if (p.length !== 3) return null;
  return moment(`${p[2]}-${p[1]}-${p[0]}`, 'YYYY-MM-DD');
};

export const fmtMins = (mins: number): string => {
  if (mins === 0) return '0';
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}hr`;
  return `${h}hr ${m}min`;
};

export const fmtTime = (t?: string | null): string => {
  if (!t) return 'N/A';
  const m = moment(t, ['hh:mm:ss a', 'hh:mm a', 'HH:mm:ss', 'HH:mm']);
  return m.isValid() ? m.format('hh:mm a') : t;
};

export const getLeaveSubtitle = (item: AttendanceItem): string => {
  if (item?.leave?.reason) return item.leave.reason;
  if (item?.remarks) return item.remarks;
  return 'Applied for Leave';
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface AttendanceCardProps {
  attendanceData: AttendanceItem;
  isDarkMode?: boolean;
  navigation?: any;
}

// ─── Component ────────────────────────────────────────────────────────────────
const AttendanceCard: React.FC<AttendanceCardProps> = ({
  attendanceData,
  isDarkMode = false,
  navigation,
}) => {
  const [showPunchDetails, setShowPunchDetails] = useState(false);
  const theme = getCardTheme(isDarkMode);

  const date = parseDateDMY(attendanceData?.date);
  const status = attendanceData?.status;
  const isToday = date?.isSame(moment(), 'day') ?? false;
  const isLeave = status === 'Paid Leave' || status === 'Leave';
  const isAbsent = status === 'Absent';

  const monthLabel = date ? date.format('MMM').toUpperCase() : '---';
  const dayNumber = date ? date.format('D') : '--';

  const dayName = (() => {
    if (!date) return 'Unknown';
    if (isToday) return 'Today';
    if (date.isSame(moment().subtract(1, 'day'), 'day')) return 'Yesterday';
    return date.format('dddd');
  })();

  const workHoursLabel = (() => {
    if (isLeave) return getLeaveSubtitle(attendanceData);
    if (isAbsent) return 'No Record';
    const mins = attendanceData?.total_minutes;
    if (mins) return `Workday • ${fmtMins(mins)}`;
    return 'In Progress';
  })();

  const shiftLabel = (() => {
    if (isLeave || isAbsent) return null;
    const inT = fmtTime(attendanceData?.in_time);
    const outT = attendanceData?.out_time
      ? fmtTime(attendanceData.out_time)
      : null;
    if (!outT) return inT;
    return `${inT} - ${outT}`;
  })();

  const chips: { label: string; color: string; bg: string }[] = [];

  if (isAbsent) {
    chips.push({ label: 'ABSENT', color: '#EF4444', bg: '#FEE2E2' });
  } else if (status === 'Half Day') {
    chips.push({ label: 'LATE', color: '#F59E0B', bg: '#FEF3C7' });
  } else if (status === 'Present') {
    const lateEntry = attendanceData?.late_entry ?? 0;
    const extraTime = attendanceData?.extra_time ?? 0;
    const earlyExit = attendanceData?.early_exit ?? 0;

    if (lateEntry === 0) {
      chips.push({ label: 'ON TIME', color: '#10B981', bg: '#D1FAE5' });
    } else {
      chips.push({
        label: `LATE ${fmtMins(lateEntry)}`,
        color: '#F59E0B',
        bg: '#FEF3C7',
      });
    }
    if (extraTime > 0) {
      chips.push({
        label: `OVERTIME +${fmtMins(extraTime)}`,
        color: '#8B5CF6',
        bg: '#EDE9FE',
      });
    }
    if (earlyExit > 0) {
      chips.push({
        label: `EARLY EXIT ${fmtMins(earlyExit)}`,
        color: '#F97316',
        bg: '#FFEDD5',
      });
    }
  }

  const openImage = (url?: string | null) => {
    if (!url) return;
    navigation?.navigate('showImage', { url });
  };

  const openMap = (lat?: number | string | null, long?: number | string | null) => {
    const latitude = Number(lat);
    const longitude = Number(long);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    navigation?.navigate('showMap', { lat: latitude, long: longitude });
  };

  const punchDetails = [
    {
      label: 'Punch In',
      image: attendanceData?.in_image,
      location: attendanceData?.in_location,
      lat: attendanceData?.in_lat,
      long: attendanceData?.in_long,
    },
    {
      label: 'Punch Out',
      image: attendanceData?.out_image,
      location: attendanceData?.out_location,
      lat: attendanceData?.out_lat,
      long: attendanceData?.out_long,
    },
  ].filter(item => item.image || item.location);

  const hasPunchDetails = punchDetails.length > 0;

  // Date box colors
  const dateBg = isToday ? '#2563EB' : isLeave ? '#FEE2E2' : theme.iconBoxBg;
  const monthColor = isToday
    ? '#BFDBFE'
    : isLeave
    ? '#EF4444'
    : isDarkMode
    ? '#93C5FD'
    : '#2563EB';
  const dayNumColor = isToday
    ? '#FFFFFF'
    : isLeave
    ? '#EF4444'
    : isDarkMode
    ? '#DBEAFE'
    : '#1D4ED8';

  return (
    <View
      style={[
        cardStyles.cardWithMargin,
        isDarkMode ? cardStyles.cardDark : cardStyles.cardLight,
        isLeave && { borderLeftWidth: 3, borderLeftColor: '#EF4444' },
      ]}
    >
      {/* ── Top Row ── */}
      <View style={cardStyles.headerRow}>
        {/* Date Box */}
        <View
          style={[
            cardStyles.iconBox,
            {
              width: scale(46),
              height: scale(56),
              backgroundColor: dateBg,
              marginRight: scale(12),
            },
          ]}
        >
          <Text
            style={{
              fontSize: moderateScale(10),
              fontWeight: '700',
              color: monthColor,
              letterSpacing: 0.5,
            }}
          >
            {monthLabel}
          </Text>
          <Text
            style={{
              fontSize: moderateScale(22),
              fontWeight: '800',
              color: dayNumColor,
              lineHeight: moderateScale(26),
            }}
          >
            {dayNumber}
          </Text>
        </View>

        {/* Middle Info */}
        <View style={cardStyles.headerText}>
          <Text
            style={[
              {
                fontSize: moderateScale(16),
                fontWeight: '700',
                marginBottom: verticalScale(3),
              },
              isDarkMode
                ? cardStyles.textPrimaryDark
                : cardStyles.textPrimaryLight,
            ]}
          >
            {dayName}
          </Text>
          <Text
            style={[
              { fontSize: moderateScale(12), fontWeight: '500' },
              isLeave
                ? { color: '#EF4444' }
                : isDarkMode
                ? cardStyles.textSecondaryDark
                : cardStyles.textSecondaryLight,
            ]}
            numberOfLines={1}
          >
            {workHoursLabel}
          </Text>
        </View>

        {/* Right: Shift or LEAVE tag */}
        {shiftLabel ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={[
                {
                  fontSize: moderateScale(9),
                  fontWeight: '700',
                  letterSpacing: 0.8,
                  marginBottom: verticalScale(2),
                },
                isDarkMode
                  ? cardStyles.textMutedDark
                  : cardStyles.textMutedLight,
              ]}
            >
              SHIFT
            </Text>
            <Text
              style={[
                { fontSize: moderateScale(12), fontWeight: '600' },
                isDarkMode
                  ? cardStyles.textSecondaryDark
                  : { color: '#374151' },
              ]}
            >
              {shiftLabel}
            </Text>
          </View>
        ) : isLeave ? (
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontSize: moderateScale(11),
                fontWeight: '800',
                color: '#EF4444',
                letterSpacing: 0.6,
              }}
            >
              LEAVE
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Status Chips ── */}
      {chips.length > 0 && (
        <View style={{ marginTop: verticalScale(10) }}>
          <View
            style={[
              cardStyles.divider,
              isDarkMode ? cardStyles.dividerDark : cardStyles.dividerLight,
              { marginBottom: verticalScale(10) },
            ]}
          />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: scale(6),
                paddingRight: hasPunchDetails ? scale(8) : 0,
              }}
            >
              {chips.map((chip, i) => (
                <View
                  key={i}
                  style={[cardStyles.badge, { backgroundColor: chip.bg }]}
                >
                  <Text style={[cardStyles.badgeText, { color: chip.color }]}>
                    {chip.label}
                  </Text>
                </View>
              ))}
            </View>
            {hasPunchDetails && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowPunchDetails(value => !value)}
                style={{
                  height: verticalScale(22),
                  borderRadius: moderateScale(7),
                  width: scale(34),
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'flex-start',
                  backgroundColor: showPunchDetails
                    ? '#1D4ED8'
                    : '#2563EB',
                }}
              >
                <AppIcon
                  name={showPunchDetails ? 'ChevronUp' : 'Camera'}
                  size={moderateScale(14)}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {chips.length === 0 && hasPunchDetails && (
        <View style={{ marginTop: verticalScale(10), alignItems: 'flex-end' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowPunchDetails(value => !value)}
            style={{
              height: verticalScale(22),
              borderRadius: moderateScale(7),
              width: scale(34),
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: showPunchDetails
                ? '#1D4ED8'
                : '#2563EB',
            }}
          >
            <AppIcon
              name={showPunchDetails ? 'ChevronUp' : 'Camera'}
              size={moderateScale(14)}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      )}

      {showPunchDetails && hasPunchDetails && (
        <View style={{ marginTop: verticalScale(10) }}>
          <View
            style={[
              cardStyles.divider,
              isDarkMode ? cardStyles.dividerDark : cardStyles.dividerLight,
              { marginBottom: verticalScale(10) },
            ]}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: verticalScale(8),
            }}
          >
            <Text
              style={[
                {
                  fontSize: moderateScale(10),
                  fontWeight: '800',
                  textTransform: 'uppercase',
                },
                isDarkMode ? cardStyles.textMutedDark : cardStyles.textMutedLight,
              ]}
            >
              Punch Photos
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowPunchDetails(false)}
              style={{
                width: scale(24),
                height: scale(24),
                borderRadius: moderateScale(12),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDarkMode ? '#1F2937' : '#F3F4F6',
              }}
            >
              <AppIcon name="X" size={moderateScale(13)} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: scale(8) }}>
            {punchDetails.map(item => (
              <View
                key={item.label}
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderRadius: moderateScale(10),
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#374151' : '#E5E7EB',
                  backgroundColor: isDarkMode ? '#111827' : '#F9FAFB',
                  padding: scale(8),
                }}
              >
                <Text
                  style={[
                    {
                      fontSize: moderateScale(10),
                      fontWeight: '800',
                      marginBottom: verticalScale(6),
                      textTransform: 'uppercase',
                    },
                    isDarkMode
                      ? cardStyles.textMutedDark
                      : cardStyles.textMutedLight,
                  ]}
                >
                  {item.label}
                </Text>

                {item.image && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openImage(item.image)}
                    style={{
                      width: '100%',
                      height: verticalScale(70),
                      borderRadius: moderateScale(8),
                      overflow: 'hidden',
                      marginBottom: verticalScale(7),
                      backgroundColor: isDarkMode ? '#1F2937' : '#E5E7EB',
                    }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}

                {!!item.location && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => openMap(item.lat, item.long)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <AppIcon name="MapPin" size={moderateScale(13)} color="#EF4444" />
                    <Text
                      numberOfLines={1}
                      style={[
                        {
                          flex: 1,
                          marginLeft: scale(4),
                          fontSize: moderateScale(10),
                          fontWeight: '600',
                        },
                        isDarkMode
                          ? cardStyles.textSecondaryDark
                          : cardStyles.textSecondaryLight,
                      ]}
                    >
                      {item.location}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default AttendanceCard;
