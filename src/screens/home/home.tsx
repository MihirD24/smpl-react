import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Animated,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  getDashboardCount,
} from '../../services/adminDashboardServices';
import { getCount } from '../../services/attendanceServices';
import { checkPunch } from '../../services/punchServices';
import AppIcon, { IconName } from '../../components/appIcon';
import {
  moderateScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { TabWithStackNavProp } from '../../navigation/navigationTypes';
import moment from 'moment';
import AddButton from '../../components/button/addButton';
import {
  getPartyLists,
  getReminderTypeList,
} from '../../services/projectReminderService';
import NetInfoComponent from '../../components/netinfoComponent';
import BrandLogo from '../../components/brandLogo';
import { BRAND, isTabletWidth, contentMaxWidth } from '../../assets/style/brandTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

type HomeScreenNav = TabWithStackNavProp<'Home'>;

const SkeletonBox: React.FC<{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  dark?: boolean;
  isDark?: boolean;
}> = ({
  width = '100%',
  height = scale(14),
  borderRadius = scale(6),
  style,
  dark = false,
  isDark = false,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  const bgColor = dark ? '#3B6AC4' : isDark ? '#334155' : '#CBD5E1';

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: bgColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ─── No Data ──────────────────────────────────────────────────────────────────

const NoData: React.FC<{
  message?: string;
  icon?: string;
  darkBg?: boolean;
  isDark?: boolean;
}> = ({
  message = 'No data available',
  icon = 'Inbox',
  darkBg = false,
  isDark = false,
}) => {
  const iconBg = darkBg ? '#1D3D8A' : isDark ? '#0F172A' : '#F1F5F9';
  const iconColor = darkBg ? '#3B6AC4' : isDark ? '#475569' : '#CBD5E1';
  const textColor = darkBg ? '#93C5FD' : isDark ? '#64748B' : '#94A3B8';

  return (
    <View style={noDataStyles.container}>
      <View style={[noDataStyles.iconWrap, { backgroundColor: iconBg }]}>
        <AppIcon name={icon as any} size={scale(26)} color={iconColor} />
      </View>
      <Text style={[noDataStyles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
};

const noDataStyles = StyleSheet.create({
  container: {
    paddingVertical: scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
  },
  iconWrap: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    textAlign: 'center',
  },
});

// ─── Component ────────────────────────────────────────────────────────────────

const Home: React.FC<{ navigation: HomeScreenNav }> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const isFocused = useIsFocused();
  const { width: screenWidth } = useWindowDimensions();
  const tabletLayout = isTabletWidth(screenWidth);

  // ── Live-pulse animation ──────────────────────────────────────────────────
  const [livePulse] = useState(new Animated.Value(1));
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(livePulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [livePulse]);

  // ── State ─────────────────────────────────────────────────────────────────
  const [loginuserRole, setLoginuserRole] = useState('');
  const [loginuserName, setLoginuserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [dashboardCounts, setDashboardCounts] = useState({
    remainPointCount: 0,
    reminderCount: 0,
    pendingServiceVisits: 0,
    departmentsCount: 0,
    designationsCount: 0,
    employeesCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState({
    present: 0,
    absent: 0,
    halfday: 0,
    paidleave: 0,
  });
  const [todayPunch, setTodayPunch] = useState<{
    status: 'BEFORE_PUNCH_IN' | 'AFTER_PUNCH_IN' | 'AFTER_PUNCH_OUT' | 'ON_LEAVE';
    label: string;
    inTime: string;
    outTime: string;
    attendanceStatus: string;
  }>({
    status: 'BEFORE_PUNCH_IN',
    label: 'Punch In',
    inTime: '',
    outTime: '',
    attendanceStatus: '',
  });


  // ── Quick Actions Bottom Sheet ────────────────────────────────────────────
  const quickActionsBottomSheetRef = useRef<BottomSheet>(null);
  const quickActionsSnapPoints = useMemo(() => ['40%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const openQuickActions = () => {
    quickActionsBottomSheetRef.current?.expand();
  };

  const closeQuickActions = () => {
    quickActionsBottomSheetRef.current?.close();
  };

  // ── Theme ─────────────────────────────────────────────────────────────────
  const t = {
    bg: isDarkMode ? '#111318' : '#F8FAFC',
    card: isDarkMode ? '#1E2028' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    sub: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#2E323E' : '#E2E8F0',
    primary: BRAND.yellow,
    headerBg: isDarkMode ? '#1E2028' : '#FFFFFF',
    headerBorder: isDarkMode ? '#2E323E' : '#F1F5F9',
    shadow: isDarkMode ? '#000000' : '#0F172A',
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDisplayDate = (raw: string | undefined): string => {
    if (!raw) return '--';
    const m = moment(raw, ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601], true);
    return m.isValid() ? m.format('MMMM Do YYYY') : raw;
  };

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchUserDetails = async (): Promise<void> => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      const p = JSON.parse(userInfo);
      setLoginuserRole(p.role || '');
      setLoginuserName(p.name || '');
    }
  };

  const fetchAttendanceSnapshot = async () => {
    try {
      const month = moment().format('MM');
      const year = moment().format('YYYY');
      const [count, punch] = await Promise.all([
        getCount(month, year, 'user', null),
        checkPunch(moment().format('YYYY-MM-DD')),
      ]);

      setAttendanceSummary({
        present: Number(count?.total_present ?? 0),
        absent: Number(count?.total_absent ?? 0),
        halfday: Number(count?.total_halfday ?? 0),
        paidleave: Number(count?.total_paidleave ?? 0),
      });

      if (punch && typeof punch === 'object') {
        const inTime = punch?.in_time || '';
        const outTime = punch?.out_time || '';
        const attendanceStatus = punch?.today_attendance_status || '';
        const status = attendanceStatus === 'Absent'
          ? 'ON_LEAVE'
          : !inTime
            ? 'BEFORE_PUNCH_IN'
            : !outTime
              ? 'AFTER_PUNCH_IN'
              : 'AFTER_PUNCH_OUT';
        setTodayPunch({
          status,
          label: punch?.show_label || (status === 'AFTER_PUNCH_IN' ? 'Punch Out' : status === 'AFTER_PUNCH_OUT' ? 'Completed' : 'Punch In'),
          inTime,
          outTime,
          attendanceStatus,
        });
      }
    } catch (error) {
      console.error('Failed to fetch attendance snapshot:', error);
    }
  };

  const fetchCounts = async () => {
    try {
      const response = await getDashboardCount();

      if (response) {
        setDashboardCounts(prev => ({
          ...prev,
          remainPointCount: response?.project_remain_points_count ?? 0,
          reminderCount: response?.reminder_count ?? 0,
          pendingServiceVisits: response?.pendingServiceVisits ?? response?.pending_service_visits ?? 0,
          departmentsCount: response?.departmentsCount ?? response?.departments_count ?? 0,
          designationsCount: response?.designationsCount ?? response?.designations_count ?? 0,
          employeesCount: response?.employeesCount ?? response?.employees_count ?? 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard counts');
    }
  };

  // ── Init — runs on every focus, shows skeleton until ALL calls settle ─────
  useEffect(() => {
    if (!isFocused) return;

    const init = async () => {
      setIsLoading(true);
      await fetchUserDetails();
      await Promise.allSettled([
        fetchCounts(),
        fetchAttendanceSnapshot(),
      ]);
      setIsLoading(false);
    };

    init();
  }, [isFocused]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.allSettled([
        fetchCounts(),
        fetchAttendanceSnapshot(),
        fetchUserDetails(),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const openAddReminder = async () => {
    const [partyRes, typeRes] = await Promise.all([
      getPartyLists(),
      getReminderTypeList(),
    ]);
    closeQuickActions();

    navigation.navigate('AddProjectReminder', {
      parties: partyRes.data,
      reminderTypes: typeRes.data,
    });
  };

  // ── Quick Action Items ────────────────────────────────────────────────────
  const quickActionItems = [
    {
      label: 'Add Project Reminder',
      icon: 'BellPlus' as IconName,
      iconBg: '#3B6FD4',
      onPress: openAddReminder,
    },
    {
      label: 'Add Project Remaining',
      icon: 'ClipboardList' as IconName,
      iconBg: '#22C55E',
      onPress: () => {
        closeQuickActions();
        navigation.navigate('AddProjectRemainingScreen');
      },
    },
  ];

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <NetInfoComponent onReconnect={onRefresh} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: t.bg }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.primary} // iOS
              colors={[t.primary]} // Android
              progressBackgroundColor={isDarkMode ? '#1E2028' : '#FFFFFF'}
            />
          }
        >
          <View style={styles.pageContent}>
            <View style={styles.sectionIntro}>
              <View style={styles.introAccent} />
              <View style={styles.introCopy}>
                <Text style={[styles.sectionEyebrow, { color: t.sub }]}>WORKFORCE OVERVIEW</Text>
                <Text style={[styles.sectionTitle, { color: t.text }]}>Today at a glance</Text>
              </View>
              <View style={[styles.liveBadge, { backgroundColor: isDarkMode ? '#1E2420' : BRAND.successSoft }]}>
                <Animated.View style={[styles.liveDot, { opacity: livePulse }]} />
                <Text style={[styles.liveText, { color: BRAND.success }]}>LIVE</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Punch')}
              style={[styles.attendanceHero, { backgroundColor: isDarkMode ? '#17191D' : '#111214', borderColor: isDarkMode ? '#2A2D30' : '#111214' }]}
            >
              <View style={styles.attendanceHeroTop}>
                <View style={styles.attendanceHeroTitleWrap}>
                  <View style={styles.attendanceHeroIcon}>
                    <AppIcon name="CalendarCheck" size={19} color={BRAND.black} />
                  </View>
                  <View>
                    <Text style={styles.attendanceHeroEyebrow}>TODAY'S ATTENDANCE</Text>
                    <Text style={styles.attendanceHeroTitle}>
                      {todayPunch.status === 'AFTER_PUNCH_OUT' ? 'Attendance completed' : todayPunch.status === 'AFTER_PUNCH_IN' ? 'You are working' : todayPunch.status === 'ON_LEAVE' ? 'Leave / absent' : 'Ready to start'}
                    </Text>
                  </View>
                </View>
                <View style={styles.attendanceStatusBadge}>
                  <View style={[styles.attendanceStatusDot, { backgroundColor: todayPunch.status === 'AFTER_PUNCH_IN' ? BRAND.success : todayPunch.status === 'ON_LEAVE' ? '#F59E0B' : BRAND.yellow }]} />
                  <Text style={styles.attendanceStatusText}>
                    {todayPunch.status === 'AFTER_PUNCH_IN' ? 'WORKING' : todayPunch.status === 'AFTER_PUNCH_OUT' ? 'DONE' : todayPunch.status === 'ON_LEAVE' ? 'LEAVE' : 'READY'}
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceHeroMiddle}>
                <View>
                  <Text style={styles.attendanceHeroTimeLabel}>PUNCH IN</Text>
                  <Text style={styles.attendanceHeroTime}>{todayPunch.inTime || '--:--'}</Text>
                </View>
                <View style={styles.attendanceHeroDivider} />
                <View>
                  <Text style={styles.attendanceHeroTimeLabel}>PUNCH OUT</Text>
                  <Text style={styles.attendanceHeroTime}>{todayPunch.outTime || '--:--'}</Text>
                </View>
                <View style={styles.attendanceHeroCta}>
                  <Text style={styles.attendanceHeroCtaText}>{todayPunch.status === 'AFTER_PUNCH_IN' ? 'Punch Out' : todayPunch.status === 'AFTER_PUNCH_OUT' ? 'View' : 'Punch In'}</Text>
                  <AppIcon name="ArrowUpRight" size={16} color={BRAND.black} />
                </View>
              </View>

              <View style={styles.attendanceSummaryRow}>
                <Text style={styles.attendanceSummaryText}>This month</Text>
                <Text style={styles.attendanceSummaryValue}>{attendanceSummary.present} Present</Text>
                <Text style={styles.attendanceSummaryMuted}>{attendanceSummary.absent} Absent</Text>
                <Text style={styles.attendanceSummaryMuted}>{attendanceSummary.paidleave} Leave</Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.actionStrip, { backgroundColor: t.card, borderColor: t.border }]}>
              {[
                { label: 'Attendance', icon: 'CalendarCheck', route: 'Attendancelist' as const },
                { label: 'Leave', icon: 'CalendarDays', route: 'LeaveList' as const },
                { label: 'Salary', icon: 'WalletCards', route: 'Salary' as const },
                { label: 'Holidays', icon: 'CalendarHeart', route: 'HolidayList' as const },
              ].map(item => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.actionItem}
                  activeOpacity={0.75}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#2B2D30' : BRAND.yellowSoft }]}>
                    <AppIcon name={item.icon as any} size={18} color={isDarkMode ? BRAND.yellow : BRAND.black} />
                  </View>
                  <Text style={[styles.actionLabel, { color: t.text }]} numberOfLines={1}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

          {/* Counts Grid */}
          <View style={styles.gridContainer}>
            {isLoading ? (
              <>
                <View
                  style={[
                    styles.card,
                    {
                      width: loginuserRole === 'Employee' ? '100%' : tabletLayout ? '23.5%' : '48.5%',
                      backgroundColor: t.card,
                      borderColor: t.border,
                    },
                  ]}
                >
                  <SkeletonBox width={40} height={40} borderRadius={10} isDark={isDarkMode} />
                  <SkeletonBox width="60%" height={24} style={{ marginTop: 12 }} isDark={isDarkMode} />
                  <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} isDark={isDarkMode} />
                </View>
                {loginuserRole !== 'Employee' && (
                  <>
                    <View style={[styles.card, { width: tabletLayout ? '23.5%' : '48.5%', backgroundColor: t.card, borderColor: t.border }]}>
                      <SkeletonBox width={40} height={40} borderRadius={10} isDark={isDarkMode} />
                      <SkeletonBox width="60%" height={24} style={{ marginTop: 12 }} isDark={isDarkMode} />
                      <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} isDark={isDarkMode} />
                    </View>
                    <View style={[styles.card, { width: tabletLayout ? '23.5%' : '48.5%', backgroundColor: t.card, borderColor: t.border }]}>
                      <SkeletonBox width={40} height={40} borderRadius={10} isDark={isDarkMode} />
                      <SkeletonBox width="60%" height={24} style={{ marginTop: 12 }} isDark={isDarkMode} />
                      <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} isDark={isDarkMode} />
                    </View>
                    <View style={[styles.card, { width: tabletLayout ? '23.5%' : '48.5%', backgroundColor: t.card, borderColor: t.border }]}>
                      <SkeletonBox width={40} height={40} borderRadius={10} isDark={isDarkMode} />
                      <SkeletonBox width="60%" height={24} style={{ marginTop: 12 }} isDark={isDarkMode} />
                      <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} isDark={isDarkMode} />
                    </View>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Pending Service Visits Card */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ServiceVisitList')}
                  style={[
                    styles.card,
                    {
                      backgroundColor: t.card,
                      borderColor: t.border,
                      shadowColor: t.shadow,
                      width: loginuserRole === 'Employee' ? '100%' : tabletLayout ? '23.5%' : '48.5%',
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBg, { backgroundColor: '#FEE2E2' }]}>
                      <AppIcon name="Clock" size={20} color="#EF4444" />
                    </View>
                    <AppIcon name="ChevronRight" size={16} color={t.sub} />
                  </View>
                  <Text style={[styles.cardValue, { color: t.text }]}>
                    {dashboardCounts.pendingServiceVisits}
                  </Text>
                  <Text style={[styles.cardLabel, { color: t.sub }]}>
                    Pending Service Visits
                  </Text>
                </TouchableOpacity>

                {loginuserRole !== 'Employee' && (
                  <>
                    {/* Departments Card */}
                    <View
                      style={[
                        styles.card,
                        {
                          width: tabletLayout ? '23.5%' : '48.5%',
                          backgroundColor: t.card,
                          borderColor: t.border,
                          shadowColor: t.shadow,
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.iconBg, { backgroundColor: '#DBEAFE' }]}>
                          <AppIcon name="Network" size={20} color="#3B82F6" />
                        </View>
                      </View>
                      <Text style={[styles.cardValue, { color: t.text }]}>
                        {dashboardCounts.departmentsCount}
                      </Text>
                      <Text style={[styles.cardLabel, { color: t.sub }]}>
                        Departments
                      </Text>
                    </View>

                    {/* Designations Card */}
                    <View
                      style={[
                        styles.card,
                        {
                          width: tabletLayout ? '23.5%' : '48.5%',
                          backgroundColor: t.card,
                          borderColor: t.border,
                          shadowColor: t.shadow,
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.iconBg, { backgroundColor: '#D1FAE5' }]}>
                          <AppIcon name="Briefcase" size={20} color="#10B981" />
                        </View>
                      </View>
                      <Text style={[styles.cardValue, { color: t.text }]}>
                        {dashboardCounts.designationsCount}
                      </Text>
                      <Text style={[styles.cardLabel, { color: t.sub }]}>
                        Designations
                      </Text>
                    </View>

                    {/* Total Employees Card */}
                    <View
                      style={[
                        styles.card,
                        {
                          width: tabletLayout ? '23.5%' : '48.5%',
                          backgroundColor: t.card,
                          borderColor: t.border,
                          shadowColor: t.shadow,
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.iconBg, { backgroundColor: '#E0E7FF' }]}>
                          <AppIcon name="Users" size={20} color="#6366F1" />
                        </View>
                      </View>
                      <Text style={[styles.cardValue, { color: t.text }]}>
                        {dashboardCounts.employeesCount}
                      </Text>
                      <Text style={[styles.cardLabel, { color: t.sub }]}>
                        Total Employees
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>

          <View style={[styles.enterpriseFooter, { borderTopColor: t.border }]}>
            <BrandLogo width={isTabletWidth(760) ? 260 : 210} height={34} compact />
            <Text style={[styles.footerCaption, { color: t.sub }]}>Employee & Workforce Management</Text>
          </View>
          </View>
        </ScrollView>

        {/* ── Quick Actions Bottom Sheet ── */}
        <BottomSheet
          ref={quickActionsBottomSheetRef}
          index={-1}
          snapPoints={quickActionsSnapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={[
            styles.bottomSheetBackground,
            { backgroundColor: isDarkMode ? '#1E2028' : '#FFFFFF' },
          ]}
          handleIndicatorStyle={styles.bottomSheetIndicator}
        >
          <BottomSheetView style={styles.bottomSheetContent}>
            {/* Header */}
            <View style={styles.quickActionsHeader}>
              <Text
                style={[
                  styles.quickActionsTitle,
                  { color: isDarkMode ? '#F0F0F0' : '#1A1D2E' },
                ]}
              >
                Quick Actions
              </Text>
              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  { backgroundColor: isDarkMode ? '#2A2D38' : '#F1F5F9' },
                ]}
                onPress={closeQuickActions}
              >
                <AppIcon
                  name="X"
                  size={16}
                  color={isDarkMode ? '#F0F0F0' : '#1A1D2E'}
                />
              </TouchableOpacity>
            </View>

            {/* Action Items */}
            <View style={styles.quickActionsContainer}>
              {quickActionItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickActionItem,
                    { backgroundColor: isDarkMode ? '#2A2D38' : '#F8FAFC' },
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.quickActionIconWrap,
                      { backgroundColor: item.iconBg },
                    ]}
                  >
                    <AppIcon name={item.icon} size={20} color="#FFFFFF" />
                  </View>
                  <Text
                    style={[
                      styles.quickActionLabel,
                      { color: isDarkMode ? '#F0F0F0' : '#1A1D2E' },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <AppIcon name="ChevronRight" size={18} color="#9098B1" />
                </TouchableOpacity>
              ))}
            </View>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(110),
  },
  pageContent: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  sectionIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  introAccent: {
    width: 5,
    height: 38,
    borderRadius: 3,
    backgroundColor: BRAND.yellow,
    marginRight: 10,
  },
  introCopy: { flex: 1 },
  sectionEyebrow: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  sectionTitle: {
    fontSize: moderateScale(21),
    fontWeight: '800',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND.success,
    marginRight: 6,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  attendanceHero: {
    borderRadius: moderateScale(20),
    borderWidth: 1,
    padding: moderateScale(16),
    marginBottom: verticalScale(14),
    overflow: 'hidden',
  },
  attendanceHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendanceHeroTitleWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  attendanceHeroIcon: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: BRAND.yellow,
    alignItems: 'center', justifyContent: 'center', marginRight: 11,
  },
  attendanceHeroEyebrow: { color: '#A1A1AA', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  attendanceHeroTitle: { color: '#FFFFFF', fontSize: moderateScale(15), fontWeight: '800', marginTop: 2 },
  attendanceStatusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#25272B', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  attendanceStatusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  attendanceStatusText: { color: '#E4E4E7', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  attendanceHeroMiddle: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 18 },
  attendanceHeroTimeLabel: { color: '#71717A', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  attendanceHeroTime: { color: '#FFFFFF', fontSize: moderateScale(18), fontWeight: '800', marginTop: 2 },
  attendanceHeroDivider: { width: 1, height: 30, backgroundColor: '#303236', marginHorizontal: 16, marginBottom: 2 },
  attendanceHeroCta: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND.yellow, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 10 },
  attendanceHeroCtaText: { color: BRAND.black, fontSize: 10, fontWeight: '900', marginRight: 5 },
  attendanceSummaryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingTop: 11, borderTopWidth: 1, borderTopColor: '#2B2D31' },
  attendanceSummaryText: { color: '#A1A1AA', fontSize: 9, fontWeight: '700', marginRight: 'auto' },
  attendanceSummaryValue: { color: '#E4E4E7', fontSize: 9, fontWeight: '800', marginLeft: 10 },
  attendanceSummaryMuted: { color: '#71717A', fontSize: 9, fontWeight: '700', marginLeft: 10 },
  actionStrip: {
    flexDirection: 'row',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: verticalScale(16),
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.055,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: verticalScale(12),
    minHeight: scale(118),
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBg: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: moderateScale(24),
    fontWeight: '900',
    marginTop: verticalScale(12),
  },
  cardLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginTop: verticalScale(4),
  },
  enterpriseFooter: {
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerCaption: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 5,
  },
  bottomSheetBackground: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
  },
  bottomSheetIndicator: {
    backgroundColor: '#BFC4C9',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: moderateScale(20),
    paddingTop: verticalScale(4),
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    marginBottom: verticalScale(16),
  },
  quickActionsTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  closeBtn: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: { gap: 10, paddingBottom: verticalScale(14) },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(14),
  },
  quickActionIconWrap: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(11),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    flex: 1,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
});
export default Home;
