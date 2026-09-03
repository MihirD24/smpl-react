import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { handleApproval } from '../../services';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/navigationTypes';
import { LeaveData } from '../../types/leave';
import AppIcon from '../../components/appIcon';
import ToastUtil from '../../utils/toastAndroid';
import { formatFullDate } from '../../utils/dateUtils';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { cardStyles, getCardTheme } from '../../assets/style/cardStyles';

type LeaveRequestCardProps = {
  leaveData: LeaveData;
  navigation: NativeStackNavigationProp<AppStackParamList, 'LeaveList'>;
  role: string;
  onApprovalChange?: () => void;
};

const getDaysCount = (startDate: string, endDate: string | null): string => {
  if (!endDate) return '1 day';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays =
    Math.ceil(
      Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
};

const getInitials = (name: string): string => {
  const names = name.split(' ');
  if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getLeaveTypeColor = (leaveType: string): string => {
  const type = leaveType?.toLowerCase() || '';
  if (type.includes('sick')) return '#EF4444';
  if (type.includes('vacation')) return '#10B981';
  if (type.includes('personal')) return '#8B5CF6';
  if (type.includes('urgent')) return '#DC2626';
  return '#3B82F6';
};

export default function LeaveRequestCard({
  leaveData,
  role,
  onApprovalChange,
}: LeaveRequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeAll, setShowSeeAll] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  const ct = getCardTheme(isDarkMode);

  // Leave-card specific surface colors (not in shared cardStyles)
  const softBg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const softBorder = isDarkMode ? '#334155' : '#E2E8F0';
  const rejectBg = isDarkMode ? '#0F172A' : '#FFFFFF';

  const leaveTypeColor = getLeaveTypeColor(leaveData.leave_type || '');
  const daysCount = getDaysCount(leaveData.start_date, leaveData.end_date);

  // ── Approval handler ────────────────────────────────────────────────────────
  const handleLeaveApproval = async (status: number): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('leave_id', leaveData.id.toString());
      formData.append('status', status.toString());

      const { success, message } = await handleApproval(formData);

      if (success) {
        ToastUtil[status === 1 ? 'success' : 'error'](
          status === 1
            ? 'Leave Approved Successfully'
            : 'Leave Rejected Successfully',
        );
        onApprovalChange?.();
      } else {
        ToastUtil.error(message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error handling leave approval:', error);
      ToastUtil.error('An error occurred. Please try again.');
    }
  };

  // ── Urgent badge ────────────────────────────────────────────────────────────
  const renderUrgentBadge = () => {
    const type = leaveData.leave_type?.toLowerCase() || '';
    if (!type.includes('urgent') && !type.includes('emergency')) return null;
    return (
      <View style={styles.urgentBadge}>
        <Text style={styles.urgentText}>URGENT</Text>
      </View>
    );
  };

  // ── Status badge ────────────────────────────────────────────────────────────
  const renderStatusBadge = () => {
    if (leaveData.status === 1) {
      return (
        <View style={[cardStyles.badge, styles.statusApproved]}>
          <AppIcon name="CheckCircle2" color="#10B981" size={14} />
          <Text style={[cardStyles.badgeText, styles.statusTextApproved]}>
            Approved
          </Text>
        </View>
      );
    }

    if (leaveData.status === 2) {
      return (
        <View style={[cardStyles.badge, styles.statusRejected]}>
          <AppIcon name="XCircle" color="#EF4444" size={14} />
          <Text style={[cardStyles.badgeText, styles.statusTextRejected]}>
            Rejected
          </Text>
        </View>
      );
    }

    if (leaveData.status === 0 && role !== 'Employee') {
      return (
        <View style={[cardStyles.badge, styles.statusPending]}>
          <AppIcon name="Clock" color="#F59E0B" size={14} />
          <Text style={[cardStyles.badgeText, styles.statusTextPending]}>
            Pending
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={[
        cardStyles.card,
        isDarkMode ? cardStyles.cardDark : cardStyles.cardLight,
        styles.cardOverride,
      ]}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {/* Avatar (initials circle — unique to this card) */}
          <View style={[styles.avatar, { backgroundColor: leaveTypeColor }]}>
            <Text style={styles.avatarText}>
              {getInitials(leaveData?.employee?.name)}
            </Text>
          </View>

          <View style={cardStyles.headerText}>
            <Text style={[styles.userName, { color: ct.textPrimary }]}>
              {leaveData?.employee?.name || 'Unknown User'}
            </Text>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.leaveTypeBadge,
                  { backgroundColor: `${leaveTypeColor}20` },
                ]}
              >
                <Text style={[styles.leaveTypeText, { color: leaveTypeColor }]}>
                  {leaveData.type || 'Leave'}
                </Text>
              </View>
              <Text style={[styles.dot, { color: ct.textMuted }]}>•</Text>
              <Text style={[styles.duration, { color: ct.textSecondary }]}>
                {daysCount}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.rightBadgeContainer}>
          {renderUrgentBadge()}
          {renderStatusBadge()}
        </View>
      </View>

      {/* ── Date Range Block ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.dateDialog,
          { backgroundColor: softBg, borderColor: softBorder },
        ]}
      >
        <View>
          <Text style={[styles.dateLabel, { color: ct.textSecondary }]}>
            DATE RANGE
          </Text>
          <Text style={[styles.dateText, { color: ct.textPrimary }]}>
            {formatFullDate(leaveData.from_date)}
            {leaveData.to_date && ` - ${formatFullDate(leaveData.to_date)}`}
          </Text>
        </View>
        <View
          style={[
            styles.calendarIconBox,
            { backgroundColor: isDarkMode ? '#172554' : '#E2E8F0' },
          ]}
        >
          <AppIcon name="Calendar" size={16} color={ct.textSecondary} />
        </View>
      </View>

      {/* ── Reason ──────────────────────────────────────────────────────── */}
      {leaveData.reason && (
        <View>
          <Text
            style={[
              styles.reason,
              { position: 'absolute', opacity: 0, color: ct.textSecondary },
            ]}
            onTextLayout={e => {
              if (e.nativeEvent.lines.length > 2) setShowSeeAll(true);
            }}
          >
            {leaveData.reason}
          </Text>

          <Text
            style={[styles.reason, { color: ct.textSecondary }]}
            numberOfLines={isExpanded ? undefined : 2}
            ellipsizeMode="tail"
          >
            {leaveData.reason}
          </Text>

          {showSeeAll && (
            <TouchableOpacity
              onPress={() => setIsExpanded(prev => !prev)}
              activeOpacity={0.7}
            >
              <Text style={cardStyles.seeMoreText}>
                {isExpanded ? 'See Less' : 'See All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {/* Actions */}
      {role === 'Owner' && leaveData.status === 0 && (
        <View style={styles.actionsSection}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleLeaveApproval(1)}
              style={styles.approveButton}
              activeOpacity={0.8}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleLeaveApproval(2)}
              style={[
                styles.rejectButton,
                { backgroundColor: rejectBg, borderColor: softBorder },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.rejectButtonText, { color: ct.textSecondary }]}
              >
                Reject
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardOverride: {
    padding: scale(14),
    marginBottom: scale(10),
    borderRadius: scale(20),
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 7,
      },
      android: { elevation: 2 },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scale(16),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: moderateScale(40),
    height: moderateVerticalScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
  userName: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    marginBottom: scale(4),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(4),
  },
  leaveTypeBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(20),
  },
  leaveTypeText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  dot: {
    marginHorizontal: scale(6),
    fontWeight: '700',
  },
  duration: {
    fontSize: moderateScale(11),
  },
  rightBadgeContainer: {
    alignItems: 'flex-end',
    gap: scale(6),
  },
  urgentBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: scale(5),
    paddingVertical: verticalScale(2),
    borderRadius: scale(12),
  },
  urgentText: {
    color: '#DC2626',
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    gap: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(8),
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
    gap: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(8),
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
    gap: scale(6),
    paddingHorizontal: scale(12),
    paddingVertical: scale(8),
    borderRadius: scale(8),
  },
  statusTextPending: { color: '#F59E0B' },
  statusTextApproved: { color: '#10B981' },
  statusTextRejected: { color: '#EF4444' },

  dateDialog: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(10),
    borderRadius: scale(12),
    marginBottom: scale(12),
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: scale(4),
  },
  dateText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  calendarIconBox: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  reason: {
    fontSize: moderateScale(12),
    lineHeight: scale(18),
  },
  actionsSection: {
    marginTop: scale(4),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: scale(12),
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: scale(12),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  rejectButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
});
