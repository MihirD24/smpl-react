import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import {
  cardStyles,
  getCardTheme,
} from '../.../../../../assets/style/cardStyles';
import { Holiday } from '../../../types/holiday';

interface HolidayCardProps {
  holidayData: Holiday;
}
type HolidayStatus = 'upcoming' | 'today' | 'past';

const getHolidayStatus = (dateString: string): HolidayStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const holidayDate = new Date(dateString);
  holidayDate.setHours(0, 0, 0, 0);
  if (holidayDate.getTime() === today.getTime()) return 'today';
  if (holidayDate > today) return 'upcoming';
  return 'past';
};
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.toLocaleString('en-US', { day: '2-digit' });
  const year = date.getFullYear();
  const weekday = date.toLocaleString('en-US', { weekday: 'long' });
  return `${month} ${day}, ${year} • ${weekday}`;
};
const STATUS_CONFIG = {
  upcoming: {
    label: 'UPCOMING',
    badgeBackground: '#DCFCE7',
    badgeText: '#16A34A',
  },
  today: {
    label: 'TODAY',
    badgeBackground: '#FEF9C3',
    badgeText: '#CA8A04',
  },
  past: {
    label: 'PAST',
    badgeBackground: '#F1F5F9',
    badgeText: '#94A3B8',
  },
};
const getDarkBadgeBg = (status: HolidayStatus) => {
  if (status === 'past') return '#0F172A';
  if (status === 'today') return '#3F3207';
  if (status === 'upcoming') return '#052E1B';
  return '#1E1E1E';
};
const getDarkBadgeText = (status: HolidayStatus) => {
  if (status === 'past') return '#CBD5E1';
  if (status === 'today') return '#FDE68A';
  if (status === 'upcoming') return '#86EFAC';
  return '#9CA3AF';
};

const HolidayIcon = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <View
    style={[
      cardStyles.iconBox,
      isDarkMode ? cardStyles.iconBoxDark : cardStyles.iconBoxLight,
    ]}
  >
    <Text style={styles.iconText}>🎉</Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

const HolidayCard: React.FC<HolidayCardProps> = ({ holidayData }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const ct = getCardTheme(isDarkMode);
  const status = getHolidayStatus(holidayData.date);
  const config = STATUS_CONFIG[status];

  const badgeBg = isDarkMode ? getDarkBadgeBg(status) : config.badgeBackground;
  const badgeTxt = isDarkMode ? getDarkBadgeText(status) : config.badgeText;

  const datePillBg =
    status === 'past' ? (isDarkMode ? '#111827' : '#F8FAFC') : 'transparent';
  const datePillBorder =
    status === 'past' ? (isDarkMode ? '#374151' : '#E2E8F0') : 'transparent';

  return (
    <View
      style={[
        cardStyles.card,
        isDarkMode ? cardStyles.cardDark : cardStyles.cardLight,
        styles.cardOverride,
      ]}
    >
      <View style={cardStyles.headerRow}>
        <HolidayIcon isDarkMode={isDarkMode} />

        <View style={cardStyles.headerText}>
          <Text style={[styles.holidayName, { color: ct.textPrimary }]}>
            {holidayData.name}
          </Text>
          <Text
            style={[
              styles.dateText,
              {
                color: ct.textSecondary,
                backgroundColor: datePillBg,
                borderColor: datePillBorder,
              },
            ]}
          >
            {formatDate(holidayData.date)}
          </Text>
        </View>

        {/* Status badge */}
        <View style={[cardStyles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[cardStyles.badgeText, { color: badgeTxt }]}>
            {config.label}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default HolidayCard;

const styles = StyleSheet.create({
  cardOverride: {
    marginHorizontal: moderateScale(16),
    marginVertical: moderateScale(8),
    padding: moderateScale(14),
    flexDirection: 'row',
  },
  iconText: {
    fontSize: moderateScale(18),
  },

  holidayName: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginBottom: verticalScale(3),
  },
  dateText: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginTop: moderateScale(4),
    paddingHorizontal: scale(8),
    paddingVertical: scale(5),
    borderRadius: scale(999),
    borderWidth: scale(1),
  },
});
