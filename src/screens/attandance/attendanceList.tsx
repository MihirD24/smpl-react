import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  RefreshControl,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import MonthSelector from '../../components/monthSelector';
import { getAttendance, getCount } from '../../services';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import { AttendanceItem } from '../../types/adminAttendance';
import AppIcon from '../../components/appIcon';
import ScreenWrapper from '../../components/screenWrapper';
import AttendanceCard, { fmtMins } from '../attandance/attendanceCard';
import { cardStyles } from '../../assets/style/cardStyles'; // adjust path as needed
import NetInfoComponent from '../../components/netinfoComponent';

// ─── Scaling ──────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

interface UserAttendanceCount {
  total_present: number;
  total_absent: number;
  total_halfday: number;
  total_paidleave: number;
  total_notmarked: number;
  total_late_time_in_min: number;
  total_extra_time_in_min: number;
  total_early_exit_in_min: number;
}

const EMPTY_COUNT: UserAttendanceCount = {
  total_present: 0,
  total_absent: 0,
  total_halfday: 0,
  total_paidleave: 0,
  total_notmarked: 0,
  total_late_time_in_min: 0,
  total_extra_time_in_min: 0,
  total_early_exit_in_min: 0,
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const AttendanceSkeleton: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#1E293B' : '#E2E8F0';
  const hlColor = isDark ? '#334155' : '#F8FAFC';
  return (
    <SkeletonPlaceholder
      backgroundColor={bgColor}
      highlightColor={hlColor}
      speed={1200}
    >
      <SkeletonPlaceholder.Item
        marginHorizontal={scale(16)}
        marginTop={verticalScale(18)}
        marginBottom={verticalScale(14)}
        height={verticalScale(36)}
        borderRadius={moderateScale(10)}
      />
      {[0, 1, 2].map(row => (
        <SkeletonPlaceholder.Item
          key={row}
          flexDirection="row"
          paddingHorizontal={scale(16)}
          marginTop={verticalScale(row === 0 ? 14 : 10)}
        >
          <SkeletonPlaceholder.Item
            flex={1}
            height={verticalScale(88)}
            borderRadius={moderateScale(14)}
            marginRight={scale(5)}
          />
          <SkeletonPlaceholder.Item
            flex={1}
            height={verticalScale(88)}
            borderRadius={moderateScale(14)}
            marginLeft={scale(5)}
          />
        </SkeletonPlaceholder.Item>
      ))}
      <SkeletonPlaceholder.Item
        marginHorizontal={scale(16)}
        marginTop={verticalScale(20)}
        height={verticalScale(220)}
        borderRadius={moderateScale(16)}
      />
      <SkeletonPlaceholder.Item
        flexDirection="row"
        justifyContent="space-between"
        paddingHorizontal={scale(16)}
        marginTop={verticalScale(28)}
        marginBottom={verticalScale(14)}
      >
        <SkeletonPlaceholder.Item
          width={scale(120)}
          height={moderateScale(11)}
          borderRadius={moderateScale(4)}
        />
        <SkeletonPlaceholder.Item
          width={scale(80)}
          height={moderateScale(11)}
          borderRadius={moderateScale(4)}
        />
      </SkeletonPlaceholder.Item>
      {[0, 1, 2].map(i => (
        <SkeletonPlaceholder.Item
          key={i}
          marginHorizontal={scale(16)}
          marginBottom={verticalScale(10)}
          borderRadius={moderateScale(16)}
          paddingHorizontal={scale(16)}
          paddingTop={verticalScale(14)}
          paddingBottom={verticalScale(12)}
        >
          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
            <SkeletonPlaceholder.Item
              width={scale(46)}
              height={scale(56)}
              borderRadius={moderateScale(10)}
              marginRight={scale(12)}
            />
            <SkeletonPlaceholder.Item flex={1}>
              <SkeletonPlaceholder.Item
                width="55%"
                height={moderateScale(16)}
                borderRadius={moderateScale(5)}
                marginBottom={verticalScale(6)}
              />
              <SkeletonPlaceholder.Item
                width="75%"
                height={moderateScale(12)}
                borderRadius={moderateScale(4)}
              />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item alignItems="flex-end">
              <SkeletonPlaceholder.Item
                width={scale(30)}
                height={moderateScale(9)}
                borderRadius={moderateScale(3)}
                marginBottom={verticalScale(4)}
              />
              <SkeletonPlaceholder.Item
                width={scale(64)}
                height={moderateScale(12)}
                borderRadius={moderateScale(4)}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item
            flexDirection="row"
            marginTop={verticalScale(10)}
            paddingTop={verticalScale(10)}
          >
            <SkeletonPlaceholder.Item
              width={scale(64)}
              height={verticalScale(22)}
              borderRadius={moderateScale(6)}
              marginRight={scale(6)}
            />
            <SkeletonPlaceholder.Item
              width={scale(96)}
              height={verticalScale(22)}
              borderRadius={moderateScale(6)}
            />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      ))}
    </SkeletonPlaceholder>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  accentColor: string;
  valueColor: string;
  subtextColor: string;
  theme: any;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  accentColor,
  valueColor,
  subtextColor,
  theme,
}) => {
  return (
    <View
      style={[
        styles.summaryMetric,
        {
          borderColor: theme.border,
          backgroundColor: theme.card,
        },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: scale(4),
          backgroundColor: accentColor,
          borderTopLeftRadius: moderateScale(9),
          borderBottomLeftRadius: moderateScale(9),
        }}
      />
      <Text style={[styles.statLabel, { color: theme.sub }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.statSubtext, { color: subtextColor }]}>
        {subtext}
      </Text>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const Attendancelist: React.FC<AppStackScreenProps<'Attendancelist'>> = ({
  navigation,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const isFocused = useIsFocused();
  const [currentTime, setCurrentTime] = useState(moment().format('hh:mm'));
  const [currentPeriod, setCurrentPeriod] = useState(moment().format('A'));
  const [monthYear, setMonthYear] = useState(() => moment().format('YYYY-MM'));
  const [filterJobData, setfilterJobData] = useState<AttendanceItem[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceItem | null>(
    null,
  );
  const [attandanceCount, setAttandanceCount] =
    useState<UserAttendanceCount>(EMPTY_COUNT);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [punchingOut] = useState(false);
  
  const isDarkMode = useColorScheme() === 'dark';

  // ── Shared theme ──
  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    sub: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    primary: '#2563EB',
  };

  useEffect(() => {
    const iv = setInterval(() => {
      setCurrentTime(moment().format('hh:mm'));
      setCurrentPeriod(moment().format('A'));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const getSelectedMonthYear = useCallback(() => {
    if (!monthYear || !moment(monthYear, 'YYYY-MM', true).isValid()) {
      const cur = moment().format('YYYY-MM');
      setMonthYear(cur);
      return { month: moment().format('MM'), year: moment().format('YYYY') };
    }
    return {
      month: moment(monthYear, 'YYYY-MM').format('MM'),
      year: moment(monthYear, 'YYYY-MM').format('YYYY'),
    };
  }, [monthYear]);

  const handleCheckAttandance = async (
    month: string,
    year: string,
  ): Promise<void> => {
    try {
      const data = await getAttendance(month, year, 'user', null);
      const seen = new Set<string>();
      const deduped = data.filter((item: AttendanceItem) => {
        if (seen.has(item.date)) return false;
        seen.add(item.date);
        return true;
      });
      setfilterJobData(deduped);
      const today = moment().format('YYYY-MM-DD');
      setTodayAttendance(
        deduped.find((item: AttendanceItem) => item.date === today) || null,
      );
    } catch {
      setfilterJobData([]);
      setTodayAttendance(null);
    }
  };

  const handleCheckCount = async (
    month: string,
    year: string,
  ): Promise<void> => {
    try {
      const data = await getCount(month, year, 'user', null);
      setAttandanceCount(data as UserAttendanceCount);
    } catch {
      setAttandanceCount(EMPTY_COUNT);
    }
  };

  const handleRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    const { month, year } = getSelectedMonthYear();
    try {
      await Promise.all([
        handleCheckCount(month, year),
        handleCheckAttandance(month, year),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [getSelectedMonthYear]);

  useEffect(() => {
    if (!isFocused) return;
    const init = async () => {
      setIsReady(false);
      const { month, year } = getSelectedMonthYear();
      await Promise.allSettled([
        handleCheckCount(month, year),
        handleCheckAttandance(month, year),
      ]);
      setIsReady(true);
    };
    init();
  }, [getSelectedMonthYear, isFocused, monthYear]);

  const calculateWorkedHours = (): string => {
    if (todayAttendance?.in_time && todayAttendance?.status === 'Present') {
      const inTime = moment(todayAttendance.in_time, 'hh:mm:ss a');
      const duration = moment.duration(moment().diff(inTime));
      const h = Math.floor(duration.asHours());
      const m = Math.floor(duration.asMinutes()) % 60;
      const s = Math.floor(duration.asSeconds()) % 60;
      return `${String(h).padStart(2, '0')}h ${String(m).padStart(
        2,
        '0',
      )}m ${String(s).padStart(2, '0')}s`;
    }
    return '00h 00m 00s';
  };

  const getTotalHours = (): string => {
    if (todayAttendance?.total_minutes) {
      const abs = Math.abs(todayAttendance.total_minutes);
      return `${String(Math.floor(abs / 60)).padStart(2, '0')}h ${String(
        abs % 60,
      ).padStart(2, '0')}m`;
    }
    return '00h 00m';
  };

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={theme.bg}
    >
      <NetInfoComponent onReconnect={handleRefresh} />
      <>
        {!isReady ? (
          <ScrollView
            style={[{ flex: 1 }, { backgroundColor: theme.bg }]}
            contentContainerStyle={{
              paddingHorizontal: moderateScale(16),
              paddingTop: verticalScale(12),
              paddingBottom: verticalScale(100),
            }}
            scrollEnabled={false}
          >
            <AttendanceSkeleton />
          </ScrollView>
        ) : (
          <ScrollView
            style={[{ flex: 1 }, { backgroundColor: theme.bg }]}
            contentContainerStyle={{
              paddingHorizontal: moderateScale(16),
              paddingTop: verticalScale(12),
              paddingBottom: verticalScale(100),
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            {/* ── Month Selector ── */}
            <View
              style={[
                styles.dateSelector,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <MonthSelector
                selectedMonthYear={monthYear}
                onMonthChange={setMonthYear}
              />
            </View>

            {/* ── Monthly Summary ── */}
            <View
              style={[
                styles.summaryPanel,
                {
                  backgroundColor: theme.bg,
                },
              ]}
            >
              <StatCard
                label="DAYS PRESENT"
                value={attandanceCount?.total_present || 0}
                subtext="This month"
                accentColor="#10B981"
                valueColor={theme.text}
                subtextColor="#10B981"
                theme={theme}
              />
              <StatCard
                label="LEAVES TAKEN"
                value={attandanceCount?.total_paidleave || 0}
                subtext="Paid Leave"
                accentColor="#EF4444"
                valueColor="#EF4444"
                subtextColor="#EF4444"
                theme={theme}
              />
              <StatCard
                label="EARLY EXIT"
                value={
                  attandanceCount.total_early_exit_in_min > 0
                    ? fmtMins(attandanceCount.total_early_exit_in_min)
                    : '0'
                }
                subtext="Before 7.30 pm"
                accentColor="#F59E0B"
                valueColor="#F59E0B"
                subtextColor="#F59E0B"
                theme={theme}
              />
              <StatCard
                label="HALF DAYS"
                value={attandanceCount?.total_halfday || 0}
                subtext="This month"
                accentColor="#F59E0B"
                valueColor="#F59E0B"
                subtextColor="#F59E0B"
                theme={theme}
              />
              <StatCard
                label="LATE TIME"
                value={
                  attandanceCount?.total_late_time_in_min !== 0
                    ? fmtMins(attandanceCount?.total_late_time_in_min || 0)
                    : '0'
                }
                subtext="After 10.00 am"
                accentColor="#F59E0B"
                valueColor="#F59E0B"
                subtextColor="#F59E0B"
                theme={theme}
              />
              <StatCard
                label="TOTAL OVERTIME"
                value={
                  attandanceCount?.total_extra_time_in_min > 0
                    ? fmtMins(attandanceCount?.total_extra_time_in_min || 0)
                    : '0'
                }
                subtext="After 7.30 pm"
                accentColor={theme.primary}
                valueColor={theme.primary}
                subtextColor={theme.primary}
                theme={theme}
              />
            </View>

            {/* ── Punch Section ── */}
            {todayAttendance?.in_time && !todayAttendance?.out_time ? (
              // ── Active punch-in card ──
              <View
                style={[
                  styles.activePunchSection,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.activePunchHeader}>
                  <View style={styles.punchedInBadge}>
                    <View style={styles.punchedInDot} />
                    <Text style={styles.punchedInText}>PUNCHED IN</Text>
                  </View>
                  <View style={styles.currentTimeCompact}>
                    <Text
                      style={[
                        styles.currentTimeLabel,
                        { color: theme.sub },
                      ]}
                    >
                      Current Time
                    </Text>
                    <View style={styles.currentTimeContainer}>
                      <Text
                        style={[
                          styles.currentTime,
                          { color: theme.text },
                        ]}
                      >
                        {currentTime}
                      </Text>
                      <Text
                        style={[
                          styles.currentTimePeriod,
                          { color: theme.sub },
                        ]}
                      >
                        {currentPeriod}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.contentBlock,
                    { 
                      backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                    },
                  ]}
                >
                  <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
                    <AppIcon
                      name="Clock"
                      size={moderateScale(22)}
                      color={theme.primary}
                    />
                  </View>
                  <View style={{ marginLeft: scale(11), flex: 1 }}>
                    <Text
                      style={[
                        styles.hoursWorkedLabel,
                        { color: theme.sub },
                      ]}
                    >
                      HOURS WORKED TODAY
                    </Text>
                    <Text
                      style={[styles.hoursWorkedValue, { color: theme.primary }]}
                    >
                      {calculateWorkedHours()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.punchOutButton}
                  onPress={() =>
                    navigation.navigate('TabNavigator', { screen: 'Punch' })
                  }
                  disabled={punchingOut}
                >
                  {punchingOut ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <AppIcon
                        name="LogOut"
                        size={moderateScale(18)}
                        color="#FFFFFF"
                      />
                      <Text style={styles.punchOutButtonText}>Punch Out</Text>
                    </>
                  )}
                </TouchableOpacity>
                {todayAttendance?.in_location && (
                  <Text
                    style={[
                      styles.locationText,
                      { color: theme.sub },
                    ]}
                  >
                    📍 {todayAttendance.in_location}
                  </Text>
                )}
              </View>
            ) : todayAttendance?.out_time ? (
              // ── Completed shift card ──
              <View
                style={[
                  styles.completedSummarySection,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.completedSummaryHeader}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: '#10B98120' },
                    ]}
                  >
                    <AppIcon
                      name="CheckCircle"
                      size={moderateScale(14)}
                      color="#10B981"
                      style={{ marginRight: scale(4) }}
                    />
                    <Text style={[styles.badgeText, { color: '#10B981' }]}>
                      SHIFT COMPLETED
                    </Text>
                  </View>
                  <View style={styles.totalHoursPill}>
                    <Text
                      style={[
                        styles.timeItemLabel,
                        { color: theme.sub },
                      ]}
                    >
                      TOTAL
                    </Text>
                    <Text
                      style={[
                        styles.completedTotalHours,
                        { color: theme.text },
                      ]}
                    >
                      {getTotalHours()}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.divider,
                    { borderBottomColor: theme.border },
                  ]}
                />
                <View style={styles.timeRow}>
                  {[
                    {
                      label: 'IN TIME',
                      value: todayAttendance?.in_time || 'N/A',
                    },
                    {
                      label: 'OUT TIME',
                      value: todayAttendance?.out_time || 'N/A',
                    },
                  ].map(t => (
                    <View
                      key={t.label}
                      style={[
                        styles.completedTimeItem,
                        {
                          backgroundColor: theme.bg,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeItemLabel,
                          { color: theme.sub },
                        ]}
                      >
                        {t.label}
                      </Text>
                      <Text
                        style={[
                          styles.timeItemValue,
                          { color: theme.text },
                        ]}
                      >
                        {t.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* ── Recent Activity ── */}
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text
                  style={[
                    styles.recentTitle,
                    { color: theme.sub },
                  ]}
                >
                  RECENT ACTIVITY
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AttendanceFilter', {
                      monthYear,
                      onMonthChange: (newMonth: string) =>
                        setMonthYear(newMonth),
                    })
                  }
                >
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      color: theme.primary,
                      fontWeight: '600',
                    }}
                  >
                    View Calendar →
                  </Text>
                </TouchableOpacity>
              </View>
              {filterJobData.length === 0 ? (
                <View style={[styles.noDataContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <AppIcon
                    name="Inbox"
                    size={moderateScale(56)}
                    color="#CBD5E1"
                  />
                  <Text
                    style={[
                      styles.noDataText,
                      { color: theme.text },
                    ]}
                  >
                    No Attendance Data
                  </Text>
                </View>
              ) : (
                filterJobData
                  .slice(0, 5)
                  .map((item, index) => (
                    <AttendanceCard
                      key={item.id || index}
                      attendanceData={item}
                      isDarkMode={isDarkMode}
                      navigation={navigation}
                    />
                  ))
              )}
            </View>
          </ScrollView>
        )}

        {/* ── Completed Modal ── */}
        <Modal
          visible={showCompletedModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCompletedModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              {/* Modal header */}
              <View
                style={[
                  styles.headerRow,
                  {
                    marginBottom: verticalScale(17),
                    justifyContent: 'space-between',
                  },
                ]}
              >
                <View
                  style={[styles.badge, { backgroundColor: '#10B98120' }]}
                >
                  <AppIcon
                    name="CheckCircle"
                    size={moderateScale(18)}
                    color="#10B981"
                    style={{ marginRight: scale(4) }}
                  />
                  <Text style={[styles.badgeText, { color: '#10B981' }]}>
                    SHIFT COMPLETED
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ padding: scale(4) }}
                  onPress={() => setShowCompletedModal(false)}
                >
                  <AppIcon
                    name="X"
                    size={moderateScale(22)}
                    color={theme.sub}
                  />
                </TouchableOpacity>
              </View>
              {/* Divider */}
              <View
                style={[
                  styles.divider,
                  { borderBottomColor: theme.border },
                ]}
              />
              <Text
                style={[
                  styles.currentTimeLabel,
                  { textAlign: 'center', color: theme.sub },
                ]}
              >
                Today's Summary
              </Text>
              <Text
                style={[
                  styles.completedTotalHours,
                  { textAlign: 'center', marginBottom: verticalScale(20), color: theme.text },
                ]}
              >
                Total Hours: {getTotalHours()}
              </Text>
              <View style={styles.timeRow}>
                {[
                  {
                    label: 'IN TIME',
                    value: todayAttendance?.in_time || 'N/A',
                  },
                  {
                    label: 'OUT TIME',
                    value: todayAttendance?.out_time || 'N/A',
                  },
                ].map(t => (
                  <View key={t.label} style={{ alignItems: 'center' }}>
                    <Text
                      style={[
                        styles.timeItemLabel,
                        { color: theme.sub },
                      ]}
                    >
                      {t.label}
                    </Text>
                    <Text
                      style={[
                        styles.timeItemValue,
                        { color: theme.text },
                      ]}
                    >
                      {t.value}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.okButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowCompletedModal(false)}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    </ScreenWrapper>
  );
};

export default Attendancelist;

// ─── Local-only styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  dateSelector: {
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(14),
    borderWidth: 1,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(16),
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: verticalScale(14),
    gap: scale(10),
  },
  summaryPanel: {
    marginTop: verticalScale(4),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
    justifyContent: 'space-between',
  },
  summaryMetric: {
    width: '48%',
    minHeight: verticalScale(74),
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: moderateScale(16),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(2),
  },
  statSubtext: { fontSize: moderateScale(10), fontWeight: '500' },
  // Punch section
  activePunchSection: {
    alignItems: 'stretch',
    marginTop: verticalScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    borderRadius: moderateScale(16),
  },
  activePunchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(10),
    marginBottom: verticalScale(14),
  },
  currentTimeCompact: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  completedSummarySection: {
    alignItems: 'stretch',
    marginTop: verticalScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    borderRadius: moderateScale(16),
  },
  completedSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(10),
  },
  totalHoursPill: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  punchedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98120',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
  },
  punchedInDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#10B981',
    marginRight: scale(6),
  },
  punchedInText: {
    fontSize: moderateScale(10),
    color: '#10B981',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
  },
  badgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  currentTimeLabel: {
    fontSize: moderateScale(10),
    marginBottom: verticalScale(2),
  },
  currentTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentTime: {
    fontSize: moderateScale(24, 0.4),
    fontWeight: '700',
  },
  currentTimePeriod: {
    fontSize: moderateScale(13, 0.4),
    fontWeight: '600',
    marginLeft: scale(4),
  },
  contentBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
    width: '100%',
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursWorkedLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
    textTransform: 'uppercase',
  },
  hoursWorkedValue: { fontSize: moderateScale(16), fontWeight: '700' },
  punchOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    height: verticalScale(50),
    borderRadius: moderateScale(12),
    width: '100%',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  punchOutButtonText: {
    fontSize: moderateScale(15),
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: scale(7),
  },
  locationText: {
    fontSize: moderateScale(11),
    fontStyle: 'italic',
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  completedTotalHours: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    width: '100%',
    gap: scale(10),
  },
  completedTimeItem: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(10),
  },
  timeItemLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
  },
  timeItemValue: { fontSize: moderateScale(15), fontWeight: '600' },
  // Recent activity
  recentSection: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(24),
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  recentTitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  noDataContainer: {
    padding: moderateScale(40),
    alignItems: 'center',
    gap: verticalScale(12),
    borderWidth: 1,
    borderRadius: moderateScale(16),
  },
  noDataText: { 
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  divider: {
    width: '100%',
    borderBottomWidth: 1,
    marginVertical: verticalScale(14),
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  modalContent: {
    width: '100%',
    maxWidth: scale(400),
    padding: moderateScale(24),
    borderRadius: moderateScale(16),
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  okButton: {
    height: verticalScale(50),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(16),
  },
  okButtonText: {
    fontSize: moderateScale(15),
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

