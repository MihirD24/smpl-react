import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/navigationTypes';
import { TaskData } from '../../types/taskData';
import AppIcon from '../../components/appIcon';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { cardStyles, getCardTheme } from '../../assets/style/cardStyles';
import ScreenWrapper from '../../components/screenWrapper';

type TaskCardProps = {
  taskData: TaskData;
  navigation: NativeStackNavigationProp<AppStackParamList, any>;
  role: string;
};
const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'High':
      return { bg: '#FFF0E6', text: '#E8640A', border: '#FFD5B0' };
    case 'Medium':
      return { bg: '#FFF8E1', text: '#F9A825', border: '#FFE082' };
    case 'Low':
      return { bg: '#E8F5E9', text: '#43A047', border: '#C8E6C9' };
    default:
      return { bg: '#F5F5F5', text: '#757575', border: '#E0E0E0' };
  }
};
const fmtMetricMins = (mins: number): string => {
  if (mins === 0) return '0m';
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export default function TaskCard({
  taskData,
  navigation,
  role,
}: TaskCardProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const ct = getCardTheme(isDarkMode);

  const priorityStyle = getPriorityStyle(taskData?.priority ?? '');
  const workTypeChipStyle = {
    backgroundColor: isDarkMode ? '#111827' : '#F8FAFC',
    borderColor: isDarkMode ? '#374151' : '#E2E8F0',
    iconColor: isDarkMode ? '#93C5FD' : '#2563EB',
    textColor: isDarkMode ? '#E5E7EB' : '#334155',
  };

  const showActual = taskData?.status !== 'Pending';
  const isPending = taskData?.status === 'Pending';
  const estimated = taskData?.estimated_minutes ?? 0;
  const taken = taskData?.total_minutes ?? 0;
  const diff = (taken ?? 0) - (estimated ?? 0);
  const isOverTime = diff > 0;
  const isExact = diff === 0;
  const statusBadgeConfig = isPending
    ? {
        backgroundColor: isDarkMode ? '#1E3A8A' : '#EFF6FF',
        dotColor: '#2563EB',
        textColor: isDarkMode ? '#BFDBFE' : '#1D4ED8',
        label: 'Pending',
      }
    : {
        backgroundColor: isOverTime
          ? isDarkMode
            ? '#3F1D24'
            : '#FFF1F2'
          : isDarkMode
          ? '#052E1B'
          : '#F0FDF4',
        dotColor: isOverTime ? '#EF4444' : '#22C55E',
        textColor: isOverTime
          ? isDarkMode
            ? '#FCA5A5'
            : '#DC2626'
          : isDarkMode
          ? '#86EFAC'
          : '#16A34A',
        label: isOverTime ? 'Over Time' : 'Target Met',
      };

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <Pressable
        style={({ pressed }) => [
          cardStyles.cardWithMargin,
          isDarkMode ? cardStyles.cardDark : cardStyles.cardLight,
          pressed && cardStyles.cardPressed,
          Platform.OS === 'android' && { marginBottom: verticalScale(12) },
        ]}
        onPress={() => navigation.navigate('TaskDetail', { data: taskData })}
      >
        {/* ── Row 1: Title + Status badge ─────────────────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: ct.textPrimary }]}>
            {taskData?.project_name || '--'}
          </Text>
          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusBadgeConfig.backgroundColor },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusBadgeConfig.dotColor },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: statusBadgeConfig.textColor },
                ]}
              >
                {statusBadgeConfig.label}
              </Text>
            </View>
          </View>
        </View>
        <Text style={[styles.titleModule, { color: ct.textPrimary }]}>
          {taskData?.project_work_module_name || '--'}
        </Text>

        {role === 'Owner' && !!taskData?.staff_name && (
          <Text
            style={[
              styles.staffName,
              {
                color: isDarkMode ? '#3B82F6' : '#3B82F6',
              },
            ]}
          >
            Staff: {taskData.staff_name}
          </Text>
        )}

        {/* ── Row 2: Work type + Priority chip ────────────────────────────── */}
        <View style={styles.tagsRow}>
          {!!taskData?.work_type && (
            <View
              style={[
                styles.workTypeChip,
                {
                  backgroundColor: workTypeChipStyle.backgroundColor,
                  borderColor: workTypeChipStyle.borderColor,
                },
              ]}
            >
              <AppIcon
                name="Wrench"
                size={moderateScale(13)}
                color={workTypeChipStyle.iconColor}
              />
              <Text
                style={[
                  styles.workTypeText,
                  { color: workTypeChipStyle.textColor },
                ]}
              >
                {taskData.work_type}
              </Text>
            </View>
          )}

          {!!taskData?.priority && (
            <View
              style={[
                styles.priorityChip,
                {
                  backgroundColor: priorityStyle.bg,
                  borderColor: priorityStyle.border,
                },
              ]}
            >
              <Text
                style={[styles.priorityBang, { color: priorityStyle.text }]}
              >
                !
              </Text>
              <Text
                style={[styles.priorityLabel, { color: priorityStyle.text }]}
              >
                {taskData.priority} Priority
              </Text>
            </View>
          )}
        </View>

        {/* ── Row 3: Description ──────────────────────────────────────────── */}
        {!!taskData?.description && (
          <Text
            style={[styles.description, { color: ct.textSecondary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {taskData.description}
          </Text>
        )}

        <View style={[cardStyles.divider, { backgroundColor: ct.divider }]} />

        <Text style={[styles.sectionLabel, { color: ct.textMuted }]}>
          Time Summary
        </Text>

        <View style={styles.timeRow}>
          <View
            style={[
              styles.timeMetricCard,
              !showActual && styles.timeMetricCardFull,
              {
                backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                borderColor: ct.divider,
              },
            ]}
          >
            <Text style={[styles.timeMain, { color: ct.textPrimary }]}>
              {fmtMetricMins(estimated)}
            </Text>
            <Text style={[styles.timeSub, { color: ct.textSecondary }]}>
              Estimate
            </Text>
          </View>

          {showActual && (
            <>
              <View
                style={[
                  styles.timeMetricCard,
                  {
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                    borderColor: ct.divider,
                  },
                ]}
              >
                <Text style={[styles.timeMain, { color: ct.textPrimary }]}>
                  {fmtMetricMins(taken)}
                </Text>
                <Text style={[styles.timeSub, { color: ct.textSecondary }]}>
                  Taken
                </Text>
              </View>

              <View style={[{ backgroundColor: ct.separator }]} />

              <View
                style={[
                  styles.timeMetricCard,
                  styles.diffBlock,
                  {
                    backgroundColor: isOverTime ? '#FFF1F2' : '#EFF6FF',
                    borderColor: ct.divider,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeMain,
                    { color: '#3B82F6', fontWeight: '700' },
                  ]}
                >
                  {isOverTime ? '+' : isExact ? '' : '-'}
                  {fmtMetricMins(Math.abs(diff))}
                </Text>
                <Text style={[styles.timeSub, { color: ct.textSecondary }]}>
                  Diff
                </Text>
              </View>
            </>
          )}
        </View>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: scale(8),
  },
  title: {
    flex: 1,
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
    lineHeight: moderateScale(22),
  },
  titleModule: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(4),
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(9),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
    gap: scale(5),
    flexShrink: 0,
    marginTop: verticalScale(2),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(4),
  },
  statusText: {
    fontSize: moderateScale(11),
    fontFamily: 'PTSans-Bold',
    fontWeight: '600',
  },
  description: {
    fontSize: moderateScale(11),
    fontFamily: 'PTSans-Regular',
    lineHeight: moderateScale(18),
    width: '92%',
    marginTop: verticalScale(8),
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    flexWrap: 'wrap',
  },
  workTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: scale(7),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(7),
    borderWidth: 1,
  },
  workTypeText: {
    fontSize: moderateScale(11),
    fontFamily: 'PTSans-Bold',
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: scale(9),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(7),
    borderWidth: 1,
  },
  priorityBang: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
  },
  priorityLabel: {
    fontSize: moderateScale(10),
    fontFamily: 'PTSans-Bold',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: moderateScale(10),
    fontFamily: 'PTSans-Bold',
    marginBottom: verticalScale(8),
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(8),
  },
  timeMetricCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    minHeight: verticalScale(50),
    justifyContent: 'center',
    borderWidth: 1,
  },
  timeMetricCardFull: {
    flex: 0,
    width: '100%',
  },
  timeMain: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Bold',
    textAlign: 'center',
  },
  timeSub: {
    fontSize: moderateScale(10),
    marginTop: 2,
  },
  diffBlock: {
    paddingHorizontal: 6,
  },
  staffName: {
    fontSize: moderateScale(11),
    fontFamily: 'PTSans-Regular',
    color: '#3B82F6',
    fontStyle: 'italic',
    fontWeight: '700',
    marginBottom: verticalScale(7),
  },
});
