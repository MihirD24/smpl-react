import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import AppIcon from '../../../components/appIcon';
import { cardStyles, getCardTheme } from '../../../assets/style/cardStyles';

export type ReminderStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface Party {
  id: number | string;
  name: string;
}

export interface ReminderType {
  id: number | string;
  name: string;
}

export interface ProjectReminder {
  id: number | string;
  party?: Party;
  reminderType?: ReminderType;
  startTime?: string;
  endTime?: string;
  status: ReminderStatus;
  remarks: string;
}

const formatDisplay = (dateTime?: string) => {
  if (!dateTime) return '—';

  // Example:
  // 2026-05-08 10:30:00

  const [datePart, timePart] = dateTime.split(' ');

  if (!datePart || !timePart) return '—';

  // ── Format Date ─────────────────────────────
  const [year, month, day] = datePart.split('-');

  const formattedDate = `${day}-${month}-${year}`;

  // ── Format Time ─────────────────────────────
  const [hourStr, minute] = timePart.split(':');

  let hour = Number(hourStr);

  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  const formattedTime = `${hour}:${minute} ${ampm}`;

  return `${formattedDate} ${formattedTime}`;
};

const statusConfig = (status: ReminderStatus) => {
  switch (status) {
    case 'Pending':
      return {
        bg: '#FFF8E1',
        darkBg: '#3B2F00',
        text: '#B45309',
        icon: 'Clock' as const,
      };
    case 'Completed':
      return {
        bg: '#ECFDF5',
        darkBg: '#002E1C',
        text: '#065F46',
        icon: 'CheckCircle' as const,
      };
    case 'Cancelled':
      return {
        bg: '#FEF2F2',
        darkBg: '#2E0000',
        text: '#991B1B',
        icon: 'XCircle' as const,
      };
    default:
      return {
        bg: '#F3F4F6',
        darkBg: '#1E1E1E',
        text: '#374151',
        icon: 'Circle' as const,
      };
  }
};

interface ReminderCardProps {
  item: ProjectReminder;
  /** Optional callback so the parent can sync the status change */
  onMarkCompleted?: (id: number | string) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({
  item,
  onMarkCompleted,
}) => {
  const isDark = useColorScheme() === 'dark';
  const ct = getCardTheme(isDark);

  const { bg, darkBg, text, icon } = statusConfig(item.status);
  const [expanded, setExpanded] = useState(false);

  const handleMarkCompleted = (reminderId: number | string) => {
    Alert.alert(
      'Confirm Completion',
      'Are you sure you want to mark this reminder as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark',
          onPress: () => {
            onMarkCompleted?.(reminderId);
          },
        },
      ],
    );
  };

  return (
    <View
      style={[
        cardStyles.card,
        isDark ? cardStyles.cardDark : cardStyles.cardLight,
      ]}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={cardStyles.headerRow}>
        <View
          style={[
            cardStyles.iconBox,
            isDark ? cardStyles.iconBoxDark : cardStyles.iconBoxLight,
          ]}
        >
          <AppIcon name="Bell" size={moderateScale(20)} color="#3B82F6" />
        </View>

        <View style={cardStyles.headerText}>
          <Text
            style={[styles.partyName, { color: ct.textPrimary }]}
            numberOfLines={2}
          >
            {item.party?.name || '—'}
          </Text>
          <Text
            style={[styles.reminderTypeName, { color: ct.textSecondary }]}
            numberOfLines={1}
          >
            {item.reminderType?.name}
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={[cardStyles.badge, { backgroundColor: isDark ? darkBg : bg }]}
        >
          <AppIcon
            name={icon}
            size={moderateScale(11)}
            color={text}
            style={cardStyles.badgeIcon}
          />
          <Text style={[cardStyles.badgeText, { color: text }]}>
          {item.status}
          </Text>
        </View>
      </View>

      <View style={[cardStyles.divider, { backgroundColor: ct.divider }]} />

      <View style={styles.timeRow}>
        <View style={styles.timeItem}>
          <AppIcon name="PlayCircle" size={moderateScale(13)} color="#9CA3AF" />
          <Text style={[styles.timeLabel, { color: ct.textMuted }]}>
            {' '}
            Start
          </Text>
          <Text style={[styles.timeValue, { color: ct.textSecondary }]}>
            {'  '}
            {formatDisplay(item?.startTime)}
          </Text>
        </View>

        <View
          style={[
            cardStyles.verticalSeparator,
            { backgroundColor: ct.separator },
          ]}
        />

        <View style={styles.timeItem}>
          <AppIcon name="StopCircle" size={moderateScale(13)} color="#9CA3AF" />
          <Text style={[styles.timeLabel, { color: ct.textMuted }]}> End</Text>
          <Text style={[styles.timeValue, { color: ct.textSecondary }]}>
            {'  '}
            {formatDisplay(item?.endTime)}
          </Text>
        </View>
      </View>

      {/* ── Remarks ─────────────────────────────────────────────────────── */}
      {!!item.remarks && (
        <View
          style={[
            cardStyles.contentBlock,
            { backgroundColor: ct.contentBlockBg },
            { marginTop: verticalScale(8) },
          ]}
        >
          <AppIcon
            name="MessageSquare"
            size={moderateScale(13)}
            color="#6B7280"
            style={cardStyles.contentBlockIcon}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[cardStyles.contentBlockText, { color: ct.textSecondary }]}
              numberOfLines={expanded ? undefined : 2}
            >
              {item.remarks}
            </Text>
            {item.remarks.length > 80 && (
              <Text
                onPress={() => setExpanded(!expanded)}
                style={cardStyles.seeMoreText}
              >
                {expanded ? 'See Less' : 'See More'}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* ── Mark as Completed Button (only for Pending) ──────────────────── */}
      {item.status === 'Pending' && (
        <>
          <View style={[cardStyles.divider, { backgroundColor: ct.divider, marginTop: verticalScale(8) }]} />
          <TouchableOpacity
            style={[
              styles.markCompletedBtn,
              { backgroundColor: isDark ? '#002E1C' : '#ECFDF5', borderColor: '#065F46' },
            ]}
            onPress={() => handleMarkCompleted(item.id)}
            activeOpacity={0.75}
          >
            <AppIcon name="CheckCircle" size={moderateScale(14)} color="#065F46" />
            <Text style={styles.markCompletedText}>Mark as Completed</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ReminderCard;

const styles = StyleSheet.create({
  partyName: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  reminderTypeName: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(2),
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  timeValue: {
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  markCompletedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(6),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    marginTop: verticalScale(4),
  },
  markCompletedText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#065F46',
    letterSpacing: 0.2,
  },
});
