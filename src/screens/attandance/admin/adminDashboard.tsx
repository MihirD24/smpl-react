import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppIcon from '../../../components/appIcon';
import {
  getDashboardPurchaseData,
  getDashboardSalesData,
  getRunningTask,
  getStaffAttendanceData,
  updateTaskStopPunchOutByType,
  EmergencyActionType,
  getDashboardCount,
} from '../../../services/adminDashboardServices';
import NetInfoComponent from '../../../components/netinfoComponent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DESIGN_WIDTH = 375;

const scale = (size: number): number => (SCREEN_WIDTH / DESIGN_WIDTH) * size;
const moderateScale = (size: number, factor: number = 0.5): number =>
  size + (scale(size) - size) * factor;

// ─── Dark Mode Theme Hook ─────────────────────────────────────────────────────

const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    colors: {
      // Backgrounds
      pageBg: isDark ? '#0F172A' : '#F8FAFC',
      cardBg: isDark ? '#1E293B' : '#FFFFFF',
      cardBorder: isDark ? '#334155' : '#E2E8F0',
      subCardBg: isDark ? '#0F172A' : '#F1F5F9',

      // Text
      textPrimary: isDark ? '#F1F5F9' : '#1E293B',
      textSecondary: isDark ? '#94A3B8' : '#64748B',
      textMuted: isDark ? '#64748B' : '#94A3B8',
      textDeepPrimary: isDark ? '#F8FAFC' : '#0F172A',

      // Links / Accent
      accent: '#3B82F6',

      // Avatar
      avatarBg: isDark ? '#1D4ED8' : '#3B82F6',

      // Timeline
      timelineLine: isDark ? '#334155' : '#E2E8F0',

      // Stat card icon bg
      statIconBg: isDark ? '#0F172A' : '#F1F5F9',

      // Emergency buttons
      stopBtnBg: isDark ? '#1E293B' : '#FFFFFF',
      stopBtnBorder: '#DC2626',

      // Modal
      overlayBg: 'rgba(0,0,0,0.65)',
      modalBg: isDark ? '#1E293B' : '#FFFFFF',
      cancelBtnBg: isDark ? '#0F172A' : '#F1F5F9',
      cancelBtnText: isDark ? '#94A3B8' : '#475569',

      // Skeleton
      skeletonBase: isDark ? '#334155' : '#CBD5E1',
      skeletonDark: isDark ? '#1D4ED8' : '#3B6AC4',

      // Financial
      upcomingCardBg: isDark ? '#0F172A' : '#F1F5F9',
      pendingCardBg: '#1546A0',

      // Badge backgrounds (status) — same in both modes, readable
      badgePresent: '#DCFCE7',
      badgeLate: '#FEF3C7',
      badgeEarlyExit: '#FFE4E6',
      badgeLeave: '#DBEAFE',
      badgeWorking: '#DBEAFE',

      // Task card
      taskCardBg: isDark ? '#1E293B' : '#FFFFFF',
      taskCardBorder: isDark ? '#334155' : '#E2E8F0',
    },
  };
};

// ─── Shimmer Skeleton ─────────────────────────────────────────────────────────

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

// ─── Skeleton: Stats Cards Row ────────────────────────────────────────────────

const StatsCardsSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
      paddingRight: scale(10),
      gap: scale(12),
      paddingBottom: scale(4),
    }}
  >
    {[1, 2, 3, 4].map(i => (
      <View
        key={i}
        style={[
          {
            width: scale(135),
            borderWidth: 1,
            borderRadius: scale(16),
            padding: scale(12),
            gap: scale(6),
            marginBottom: scale(12),
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          },
        ]}
      >
        <SkeletonBox
          width={scale(30)}
          height={scale(30)}
          borderRadius={scale(10)}
          isDark={isDark}
        />
        <SkeletonBox
          width={scale(60)}
          height={scale(20)}
          style={{ marginTop: scale(4) }}
          isDark={isDark}
        />
        <SkeletonBox
          width={scale(90)}
          height={scale(11)}
          style={{ marginTop: scale(4) }}
          isDark={isDark}
        />
      </View>
    ))}
  </ScrollView>
);

// ─── Skeleton: Attendance Snapshot ───────────────────────────────────────────

const AttendanceSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <View
    style={{
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: scale(16),
      padding: scale(20),
      marginBottom: scale(16),
    }}
  >
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(16),
      }}
    >
      <SkeletonBox width={scale(120)} height={scale(12)} isDark={isDark} />
      <SkeletonBox width={scale(50)} height={scale(12)} isDark={isDark} />
    </View>
    <View
      style={{
        flexDirection: 'row',
        gap: scale(8),
        marginBottom: scale(12),
      }}
    >
      {[1, 2, 3, 4].map(i => (
        <View
          key={i}
          style={{
            flex: 1,
            alignItems: 'center',
            borderRadius: scale(10),
            paddingVertical: scale(8),
            backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
          }}
        >
          <SkeletonBox width={scale(18)} height={scale(16)} isDark={isDark} />
          <SkeletonBox
            width={scale(34)}
            height={scale(9)}
            style={{ marginTop: scale(4) }}
            isDark={isDark}
          />
        </View>
      ))}
    </View>
    <View>
      {[1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={{
            minHeight: scale(38),
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#334155' : '#E2E8F0',
            paddingVertical: scale(6),
            gap: scale(6),
          }}
        >
          <View style={{ flex: 2 }}>
            <SkeletonBox width="88%" height={scale(12)} isDark={isDark} />
          </View>
          <View style={{ flex: 0.52 }}>
            <SkeletonBox width="80%" height={scale(10)} isDark={isDark} />
            <SkeletonBox
              width="92%"
              height={scale(8)}
              style={{ marginTop: scale(4) }}
              isDark={isDark}
            />
          </View>
          <View style={{ flex: 0.52 }}>
            <SkeletonBox width="80%" height={scale(10)} isDark={isDark} />
            <SkeletonBox
              width="92%"
              height={scale(8)}
              style={{ marginTop: scale(4) }}
              isDark={isDark}
            />
          </View>
        </View>
      ))}
    </View>
  </View>
);

// ─── Skeleton: Running Tasks ──────────────────────────────────────────────────

const RunningTasksSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <View
    style={{
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: scale(16),
      padding: scale(20),
      marginBottom: scale(16),
    }}
  >
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(16),
      }}
    >
      <SkeletonBox width={scale(130)} height={scale(16)} isDark={isDark} />
      <SkeletonBox width={scale(50)} height={scale(12)} isDark={isDark} />
    </View>
    {[1, 2, 3, 4].map(i => (
      <View
        key={i}
        style={{
          minHeight: scale(52),
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#334155' : '#E2E8F0',
          paddingVertical: scale(8),
          gap: scale(8),
        }}
      >
        <View style={{ flex: 1.05 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <SkeletonBox
              width={scale(26)}
              height={scale(26)}
              borderRadius={scale(13)}
              style={{ marginRight: scale(7) }}
              isDark={isDark}
            />
            <View style={{ flex: 1 }}>
              <SkeletonBox width="86%" height={scale(11)} isDark={isDark} />
              <SkeletonBox
                width="52%"
                height={scale(8)}
                style={{ marginTop: scale(5) }}
                isDark={isDark}
              />
            </View>
          </View>
        </View>
        <View style={{ flex: 1.45 }}>
          <SkeletonBox width="92%" height={scale(11)} isDark={isDark} />
          <SkeletonBox
            width="72%"
            height={scale(9)}
            style={{ marginTop: scale(5) }}
            isDark={isDark}
          />
        </View>
        <View style={{ flex: 0.7, alignItems: 'flex-end' }}>
          <SkeletonBox width="72%" height={scale(11)} isDark={isDark} />
          <SkeletonBox
            width="94%"
            height={scale(8)}
            style={{ marginTop: scale(5) }}
            isDark={isDark}
          />
        </View>
      </View>
    ))}
  </View>
);

// ─── Skeleton: Financial Summary ──────────────────────────────────────────────

const FinancialSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <View
    style={{
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: scale(16),
      padding: scale(20),
      marginBottom: scale(16),
    }}
  >
    <SkeletonBox width={scale(140)} height={scale(16)} isDark={isDark} />
    <View
      style={{
        backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
        borderRadius: scale(16),
        padding: scale(16),
        marginTop: scale(12),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: scale(12),
        }}
      >
        <SkeletonBox width={scale(130)} height={scale(10)} isDark={isDark} />
        <SkeletonBox
          width={scale(36)}
          height={scale(36)}
          borderRadius={scale(8)}
          isDark={isDark}
        />
      </View>
      {[1, 2].map(i => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: scale(14),
          }}
        >
          <View style={{ flex: 1, gap: scale(5) }}>
            <SkeletonBox
              width={scale(110)}
              height={scale(11)}
              isDark={isDark}
            />
            <SkeletonBox width={scale(80)} height={scale(16)} isDark={isDark} />
            <SkeletonBox width={scale(60)} height={scale(10)} isDark={isDark} />
          </View>
          <View style={{ alignItems: 'flex-end', gap: scale(6) }}>
            <SkeletonBox width={scale(60)} height={scale(9)} isDark={isDark} />
            <SkeletonBox width={scale(50)} height={scale(12)} isDark={isDark} />
          </View>
        </View>
      ))}
    </View>
    <View
      style={{
        backgroundColor: '#1546A0',
        borderRadius: scale(16),
        padding: scale(16),
        marginTop: scale(16),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: scale(12),
        }}
      >
        <SkeletonBox
          width={scale(120)}
          height={scale(10)}
          style={{ backgroundColor: '#3B6AC4' }}
        />
        <SkeletonBox
          width={scale(36)}
          height={scale(36)}
          borderRadius={scale(8)}
          style={{ backgroundColor: '#3B6AC4' }}
        />
      </View>
      {[1, 2].map(i => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: scale(14),
          }}
        >
          <View style={{ flex: 1, gap: scale(5) }}>
            <SkeletonBox
              width={scale(100)}
              height={scale(11)}
              style={{ backgroundColor: '#3B6AC4' }}
            />
            <SkeletonBox
              width={scale(80)}
              height={scale(15)}
              style={{ backgroundColor: '#3B6AC4' }}
            />
            <SkeletonBox
              width={scale(55)}
              height={scale(10)}
              style={{ backgroundColor: '#3B6AC4' }}
            />
          </View>
          <View style={{ alignItems: 'flex-end', gap: scale(6) }}>
            <SkeletonBox
              width={scale(60)}
              height={scale(9)}
              style={{ backgroundColor: '#3B6AC4' }}
            />
            <SkeletonBox
              width={scale(50)}
              height={scale(12)}
              style={{ backgroundColor: '#3B6AC4' }}
            />
          </View>
        </View>
      ))}
    </View>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = ({ navigation }: any) => {
  const { isDark, colors } = useTheme();

  const [showAllAttendance, setShowAllAttendance] = useState(false);
  const [emergencyModal, setEmergencyModal] = useState<{
    visible: boolean;
    type: EmergencyActionType | null;
  }>({ visible: false, type: null });
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [attendanceData, setAttendanceData] = useState([]);
  const [runningTaskData, setRunningTaskData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [showAllSales, setShowAllSales] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [statsCards, setStatsCards] = useState([]);

  // Per-section loading
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingFinancial, setLoadingFinancial] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Helpers
  const formatMinutes = (value: string) => {
    const minutes = parseInt(value);
    if (isNaN(minutes)) return value;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0 && mins > 0) return `${hrs}hr ${mins}min`;
    if (hrs > 0) return `${hrs}hr`;
    return `${mins}min`;
  };

  const hasPositiveTime = (value: any) => Number(value || 0) > 0;

  const formatPunchTime = (value?: string) => {
    if (!value) return '--';
    const timeMatch = String(value).match(
      /\d{1,2}:\d{2}(?::\d{2})?\s?(AM|PM|am|pm)?/,
    );
    return timeMatch ? timeMatch[0] : value;
  };

  // ── Fetch functions
  const fetchAttendanceData = async () => {
    setLoadingAttendance(true);
    try {
      const response = await getStaffAttendanceData();
      if (response?.attendance?.length) {
        const formattedData = response.attendance.map(
          (item: any, index: number) => {
            const status: string[] = [];
            const time: string[] = [];
            if (item.status?.toUpperCase() === 'PRESENT') {
              status.push('PRESENT');
              time.push(item.in_time || '');
            }
            if (item.late_entry > 0) {
              status.push('LATE');
              time.push(`${item.late_entry} min`);
            }
            if (item.early_exit > 0) {
              status.push('EARLY EXIT');
              time.push(`${item.early_exit} min`);
            }
            if (item.status?.toUpperCase() === 'ON LEAVE') {
              status.push('ON LEAVE');
              time.push('');
            }
            return {
              id: `${item.employee_id}-${index}`,
              employeeId: item.employee_id,
              name: item.employee_name,
              avatar: item.employee_name
                ?.split(' ')
                ?.map((n: string) => n[0])
                ?.join('')
                ?.toUpperCase(),
              date: item.date,
              inTime: item.in_time,
              outTime: item.out_time,
              lateEntry: item.late_entry,
              earlyExit: item.early_exit,
              extraTime: item.extra_time,
              status,
              time,
            };
          },
        );
        setAttendanceData(formattedData);
      } else {
        setAttendanceData([]);
      }
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await getDashboardSalesData();
      if (response?.sales?.length) {
        const formattedSales = response.sales.map((item: any) => {
          const dueStatus = item.due_status?.toLowerCase();
          return {
            id: item.id,
            label: item.ledger_name,
            type: item.sale_type,
            amount: `₹ ${Number(item.pending_amount).toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}`,
            expectedIn:
              dueStatus === 'overdue'
                ? 'OVERDUE'
                : dueStatus === 'today'
                ? 'TODAY'
                : dueStatus === 'no_date'
                ? 'NO DATE'
                : item.due_date,
            expectedLabel:
              dueStatus === 'overdue'
                ? 'PENDING'
                : dueStatus === 'today'
                ? 'RECEIVE TODAY'
                : dueStatus === 'no_date'
                ? 'FOLLOW UP'
                : 'UPCOMING',
            overdue: dueStatus === 'overdue',
            dueStatus,
          };
        });
        setSalesData(formattedSales);
      } else {
        setSalesData([]);
      }
    } catch {
      setSalesData([]);
    }
  };

  const fetchPurchaseData = async () => {
    try {
      const response = await getDashboardPurchaseData();
      if (response?.purchases?.length) {
        const formattedPurchases = response.purchases.map((item: any) => {
          const dueStatus = item.due_status?.toLowerCase();
          return {
            id: item.id,
            label: item.ledger_name,
            type: item.record_type,
            amount: `₹ ${Number(item.unsettled_amount).toLocaleString(
              'en-IN',
            )}`,
            dueIn:
              dueStatus === 'overdue'
                ? 'OVERDUE'
                : dueStatus === 'today'
                ? 'TODAY'
                : item.due_date,
            dueLabel:
              dueStatus === 'overdue'
                ? 'PAY NOW'
                : dueStatus === 'today'
                ? 'DUE TODAY'
                : 'UPCOMING',
            urgent: dueStatus === 'overdue' || dueStatus === 'today',
            dueStatus,
          };
        });
        setPurchaseData(formattedPurchases);
      } else {
        setPurchaseData([]);
      }
    } catch {
      setPurchaseData([]);
    }
  };

  const fetchRunningTaskData = async () => {
    setLoadingTasks(true);
    try {
      const response = await getRunningTask();
      setRunningTaskData(response?.length ? response : []);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchDashboardCount = async () => {
    setLoadingStats(true);
    try {
      const response = await getDashboardCount();
      if (response) {
        setStatsCards([
          // {
          //   id: 1,
          //   label: 'Remain',
          //   value: response?.project_remain_points_count,
          //   icon: 'Target',
          //   color: 'orange',
          //   bg: '#FFF7ED',
          //   screen: 'ProjectRemainingScreen',
          // },
          // {
          //   id: 2,
          //   label: 'Reminders',
          //   value: response?.reminder_count,
          //   icon: 'Bell',
          //   color: 'red',
          //   bg: '#FEF2F2',
          //   screen: 'ProjectReminder',
          // },
          {
            id: 3,
            label: 'Employees',
            value: response?.total_employees_count,
            icon: 'Users',
            color: 'blue',
            bg: '#EFF6FF',
          }
          // {
          //   id: 4,
          //   label: 'Projects',
          //   value: response?.running_projects_count,
          //   icon: 'Rocket',
          //   color: 'green',
          //   bg: '#F0FDF4',
          // },
        ]);
      }
    } finally {
      setLoadingStats(false);
    }
  };

  // ── fetchAllData: plain async — no useCallback wrapping.
  // useCallback with [] captures stale function references on mount,
  // causing APIs to silently do nothing on first login navigation.
  // Instead we use a ref so useEffect and onRefresh always call the
  // latest version without any dependency array issues.
  const fetchAllData = async () => {
    setLoadingFinancial(true);
    try {
      await Promise.all([
        fetchAttendanceData(),
        fetchRunningTaskData(),
        fetchDashboardCount(),
        Promise.all([fetchSalesData(), fetchPurchaseData()]),
      ]);
    } finally {
      setLoadingFinancial(false);
    }
  };

  const fetchAllDataRef = useRef(fetchAllData);
  // Keep ref current on every render so it never holds a stale closure
  useEffect(() => {
    fetchAllDataRef.current = fetchAllData;
  });

  // ── Initial load — runs exactly once on mount
  useEffect(() => {
    fetchAllDataRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pull to Refresh — uses ref so no dependency array needed
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllDataRef.current();
    setRefreshing(false);
  };

  const handleEmergencyAction = async () => {
    if (!emergencyModal.type) {
      Alert.alert('Error', 'No action type selected.');
      return;
    }
    setEmergencyLoading(true);
    const result = await updateTaskStopPunchOutByType(emergencyModal.type);
    setEmergencyLoading(false);
    if (result.success) {
      setEmergencyModal({ visible: false, type: null });
      Alert.alert(
        'Success',
        result.message || 'Action completed successfully.',
      );
    } else {
      Alert.alert('Failed', result.message || 'Something went wrong.');
    }
  };

  const statCardIconColor = (color: string) => {
    switch (color) {
      case 'blue':
        return '#2563EB';
      case 'orange':
        return '#EA580C';
      case 'red':
        return '#DC2626';
      case 'green':
        return '#16A34A';
      default:
        return '#64748B';
    }
  };

  const statCardBorderColor = (color: string) => {
    if (isDark) {
      switch (color) {
        case 'blue':
          return '#1D4ED8';
        case 'orange':
          return '#C2410C';
        case 'red':
          return '#B91C1C';
        case 'green':
          return '#15803D';
        default:
          return '#334155';
      }
    }
    switch (color) {
      case 'blue':
        return '#BFDBFE';
      case 'orange':
        return '#FDE68A';
      case 'red':
        return '#FECACA';
      case 'green':
        return '#A7F3D0';
      default:
        return '#E2E8F0';
    }
  };

  const attendanceSummary = {
    present: attendanceData.filter((item: any) =>
      item.status.includes('PRESENT'),
    ).length,
    late: attendanceData.filter((item: any) => item.status.includes('LATE'))
      .length,
    leave: attendanceData.filter((item: any) =>
      item.status.includes('ON LEAVE'),
    ).length,
    earlyExit: attendanceData.filter((item: any) =>
      item.status.includes('EARLY EXIT'),
    ).length,
  };

  const visibleAttendance = showAllAttendance
    ? attendanceData
    : attendanceData.slice(0, 8);
  const displayedTasks = showAllTasks
    ? runningTaskData
    : runningTaskData.slice(0, 5);
  const overTimeTaskCount = runningTaskData.filter(
    (task: any) =>
      Number(task.total_minutes) > parseInt(task.estimated_minutes),
  ).length;

  // Dynamic styles
  const dynCard = {
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBorder,
  };

  return (
    <GestureHandlerRootView
      style={[styles.container, { backgroundColor: colors.pageBg }]}
    >
      <NetInfoComponent onReconnect={onRefresh} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
            progressBackgroundColor={colors.cardBg}
          />
        }
      >
        <View style={styles.maxWidth}>
          {/* ── STATS CARDS ─────────────────────────────────────────────────── */}
          {loadingStats ? (
            <StatsCardsSkeleton isDark={isDark} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
            >
              {statsCards.map((card: any) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.statCardHorizontal,
                    {
                      backgroundColor: colors.cardBg,
                      borderColor: statCardBorderColor(card.color),
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    card.screen && navigation.navigate(card.screen)
                  }
                >
                  {/* Top Row */}
                  <View style={styles.statCardTopRow}>
                    <View
                      style={[
                        styles.statCardIconWrap,
                        { backgroundColor: colors.statIconBg },
                      ]}
                    >
                      <AppIcon
                        name={card.icon as any}
                        size={scale(18)}
                        color={statCardIconColor(card.color)}
                      />
                    </View>

                    <Text
                      style={[
                        styles.statCardValue,
                        { color: colors.textPrimary },
                      ]}
                    >
                      {card.value}
                    </Text>
                  </View>

                  {/* Label Below */}
                  <Text
                    style={[
                      styles.statCardLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {card.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* ── EMERGENCY CONTROL CENTER ─────────────────────────────────────── */}
          {/* <View style={[styles.controlCard, dynCard]}>
            <View style={styles.controlHeader}>
              <View style={styles.controlTitleRow}>
                <View style={styles.controlIconWrap}>
                  <AppIcon
                    name="ShieldAlert"
                    size={scale(15)}
                    color="#DC2626"
                  />
                </View>
                <View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Emergency Controls
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Site-wide actions
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.stopBtn,
                  {
                    backgroundColor: colors.stopBtnBg,
                    borderColor: colors.stopBtnBorder,
                  },
                ]}
                activeOpacity={0.75}
                onPress={() =>
                  setEmergencyModal({ visible: true, type: 'taskStop' })
                }
              >
                <AppIcon name="OctagonX" size={scale(14)} color="#DC2626" />
                <Text style={styles.stopBtnText}>Stop Tasks</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.punchBtn}
                activeOpacity={0.75}
                onPress={() =>
                  setEmergencyModal({ visible: true, type: 'puchOut' })
                }
              >
                <AppIcon name="LogOut" size={scale(14)} color="#FFFFFF" />
                <Text style={styles.punchBtnText}>Punch Out</Text>
              </TouchableOpacity>
            </View>
          </View> */}

          {/* ── RUNNING TASKS ────────────────────────────────────────────────── */}
          {/* {loadingTasks ? (
            <RunningTasksSkeleton isDark={isDark} />
          ) : (
            <View style={[styles.card, dynCard]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text
                    style={[styles.cardTitle, { color: colors.textPrimary }]}
                  >
                    Running Tasks
                  </Text>
                  <Text
                    style={[
                      styles.runningTaskSummary,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {runningTaskData.length} active
                    {overTimeTaskCount > 0
                      ? ` • ${overTimeTaskCount} over time`
                      : ''}
                  </Text>
                </View>
                {runningTaskData.length > 5 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowAllTasks(prev => !prev)}
                  >
                    <Text style={[styles.linkText, { color: colors.accent }]}>
                      {showAllTasks ? 'Show Less' : 'View All'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {displayedTasks.length > 0 ? (
                displayedTasks.map((task: any, index: number) => {
                  const isOverTime =
                    Number(task.total_minutes) >
                    parseInt(task.estimated_minutes);
                  const priorityStyle =
                    task.priority === 'High'
                      ? styles.highText
                      : task.priority === 'Medium'
                      ? styles.mediumText
                      : styles.lowText;
                  const priorityDotStyle =
                    task.priority === 'High'
                      ? styles.highDot
                      : task.priority === 'Medium'
                      ? styles.mediumDot
                      : styles.lowDot;

                  return (
                    <View
                      key={index}
                      style={[
                        styles.runningTaskRow,
                        { borderBottomColor: colors.cardBorder },
                      ]}
                    >
                      <View style={styles.runningTaskTopRow}>
                        <View style={styles.runningEmployeeLine}>
                          <View
                            style={[
                              styles.runningAvatar,
                              { backgroundColor: colors.avatarBg },
                            ]}
                          >
                            <Text style={styles.runningAvatarText}>
                              {task.employee?.charAt(0)}
                            </Text>
                          </View>

                          <View style={styles.runningEmployeeTextWrap}>
                            <Text
                              style={[
                                styles.runningEmployeeName,
                                { color: colors.textDeepPrimary },
                              ]}
                              numberOfLines={1}
                            >
                              {task.employee}
                            </Text>
                            <View style={styles.runningPriorityRow}>
                              <View
                                style={[
                                  styles.runningPriorityDot,
                                  priorityDotStyle,
                                ]}
                              />
                              <Text
                                style={[
                                  styles.runningPriorityText,
                                  priorityStyle,
                                ]}
                                numberOfLines={1}
                              >
                                {task.priority}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.runningTimeCell}>
                          <Text
                            style={[
                              styles.runningTimeValue,
                              { color: colors.textPrimary },
                            ]}
                            numberOfLines={1}
                          >
                            {formatMinutes(task.total_minutes)}
                          </Text>
                          <Text
                            style={[
                              styles.runningTimeStatus,
                              isOverTime
                                ? styles.overTimeText
                                : styles.remainingTimeText,
                            ]}
                            numberOfLines={1}
                          >
                            {isOverTime
                              ? `${formatMinutes(task.time_status)} over`
                              : `${formatMinutes(task.time_status)} left`}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.runningTaskCell}>
                        <Text
                          style={[styles.runningProjectName, { color: 'blue' }]}
                          numberOfLines={2}
                        >
                          {task.project} • {task.module}
                        </Text>
                        <Text
                          style={[
                            styles.runningTaskTitle,
                            { color: isDark ? '#CBD5E1' : '#334155' },
                          ]}
                          numberOfLines={2}
                        >
                          {task.task}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <NoData
                  message="No tasks are currently running"
                  icon="ClipboardList"
                  isDark={isDark}
                />
              )}
            </View>
          )} */}
          {/* ── ATTENDANCE SNAPSHOT ──────────────────────────────────────────── */}
          {loadingAttendance ? (
            <AttendanceSkeleton isDark={isDark} />
          ) : (
            <View style={[styles.card, dynCard]}>
              <View style={styles.cardHeader}>
                <Text
                  style={[styles.sectionTitle, { color: colors.textMuted }]}
                >
                  Today's Attendance
                </Text>
                {attendanceData.length > 8 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowAllAttendance(prev => !prev)}
                  >
                    <Text style={[styles.linkText, { color: colors.accent }]}>
                      {showAllAttendance ? 'Show Less' : 'View All'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.attendanceSummaryGrid}>
                {[
                  {
                    label: 'Present',
                    value: attendanceSummary.present,
                    valueStyle: styles.textPresent,
                    bg: isDark ? '#052E1B' : '#F0FDF4',
                  },
                  {
                    label: 'Late',
                    value: attendanceSummary.late,
                    valueStyle: styles.textLate,
                    bg: isDark ? '#3F2E05' : '#FFFBEB',
                  },
                  {
                    label: 'Leave',
                    value: attendanceSummary.leave,
                    valueStyle: styles.textLeave,
                    bg: isDark ? '#082F49' : '#EFF6FF',
                  },
                  {
                    label: 'Early',
                    value: attendanceSummary.earlyExit,
                    valueStyle: styles.textEarlyExit,
                    bg: isDark ? '#4C0519' : '#FFF1F2',
                  },
                ].map(item => (
                  <View
                    key={item.label}
                    style={[
                      styles.attendanceSummaryItem,
                      { backgroundColor: item.bg },
                    ]}
                  >
                    <Text
                      style={[styles.attendanceSummaryValue, item.valueStyle]}
                    >
                      {item.value}
                    </Text>
                    <Text
                      style={[
                        styles.attendanceSummaryLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.attendanceSnapshotTable}>
                {visibleAttendance.length > 0 ? (
                  visibleAttendance.map((item: any) => {
                    const isLeave = item.status.includes('ON LEAVE');
                    const isLate = item.status.includes('LATE');
                    const isEarlyExit = item.status.includes('EARLY EXIT');
                    const hasExtraTime = hasPositiveTime(item.extraTime);
                    const inNote = isLeave
                      ? 'Leave'
                      : isLate
                      ? `Late ${formatMinutes(`${item.lateEntry}`)}`
                      : 'On time';
                    const outNote = isLeave
                      ? '--'
                      : isEarlyExit
                      ? `Early ${formatMinutes(`${item.earlyExit}`)}`
                      : hasExtraTime
                      ? `Extra ${formatMinutes(`${item.extraTime}`)}`
                      : item.outTime
                      ? 'On time'
                      : '--';
                    const inNoteStyle = isLeave
                      ? styles.textLeave
                      : isLate
                      ? styles.textLate
                      : styles.textPresent;
                    const outNoteStyle = isLeave
                      ? styles.textLeave
                      : isEarlyExit
                      ? styles.textEarlyExit
                      : hasExtraTime
                      ? styles.textPresent
                      : styles.textPresent;

                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.attendanceSnapshotRow,
                          {
                            borderBottomColor: colors.cardBorder,
                          },
                        ]}
                      >
                        <View style={styles.attendancePersonCell}>
                          <View
                            style={[
                              styles.attendanceMiniAvatar,
                              { backgroundColor: colors.avatarBg },
                            ]}
                          >
                            <Text style={styles.attendanceMiniAvatarText}>
                              {item.avatar || item.name?.charAt(0)}
                            </Text>
                          </View>
                          <View style={styles.attendanceNameBlock}>
                            <Text
                              style={[
                                styles.attendanceName,
                                { color: colors.textPrimary },
                              ]}
                              numberOfLines={2}
                            >
                              {item.name}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.attendancePunchCell}>
                          <Text
                            style={[
                              styles.attendanceTimeValue,
                              { color: colors.textPrimary },
                            ]}
                            numberOfLines={1}
                          >
                            {formatPunchTime(item.inTime)}
                          </Text>
                          <Text
                            style={[styles.attendanceSnapshotNote, inNoteStyle]}
                            numberOfLines={1}
                          >
                            {inNote}
                          </Text>
                        </View>

                        <View style={styles.attendancePunchCell}>
                          <Text
                            style={[
                              styles.attendanceTimeValue,
                              { color: colors.textPrimary },
                            ]}
                            numberOfLines={1}
                          >
                            {formatPunchTime(item.outTime)}
                          </Text>
                          <Text
                            style={[
                              styles.attendanceSnapshotNote,
                              outNoteStyle,
                            ]}
                            numberOfLines={1}
                          >
                            {outNote}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <NoData
                    message="No attendance records for today"
                    icon="CalendarX2"
                    isDark={isDark}
                  />
                )}
              </View>
            </View>
          )}

          {/* ── FINANCIAL SUMMARY ────────────────────────────────────────────── */}
          {/* {loadingFinancial ? (
            <FinancialSkeleton isDark={isDark} />
          ) : (
            <View style={[styles.card, dynCard]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Financial Summary
              </Text>
              <View
                style={[
                  styles.upcomingCard,
                  { backgroundColor: colors.upcomingCardBg },
                ]}
              >
                <View style={styles.financialHeaderRow}>
                  <Text
                    style={[
                      styles.financialSectionLabel,
                      { color: colors.textMuted },
                    ]}
                  >
                    UPCOMING PAYMENTS
                  </Text>
                  <AppIcon
                    name="Wallet"
                    size={scale(36)}
                    color={isDark ? '#475569' : '#CBD5F5'}
                  />
                </View>
                {purchaseData.length > 0 ? (
                  <>
                    {purchaseData
                      .slice(0, showAllPayments ? purchaseData.length : 2)
                      .map((p: any) => (
                        <View key={p.id} style={styles.financialRowClean}>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.financialItemLabel,
                                { color: colors.textSecondary },
                              ]}
                            >
                              {p.label}
                            </Text>
                            <Text
                              style={[
                                styles.financialAmount,
                                { color: colors.textPrimary },
                              ]}
                            >
                              {p.amount}
                            </Text>
                            <Text
                              style={[
                                styles.purchaseType,
                                { color: colors.textMuted },
                              ]}
                            >
                              {p.type.replace('_', ' ').toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.financialRight}>
                            <Text
                              style={[
                                styles.financialDueLabel,
                                { color: colors.textMuted },
                              ]}
                            >
                              {p.dueLabel}
                            </Text>
                            <Text
                              style={[
                                styles.financialDueValue,
                                { color: isDark ? '#94A3B8' : '#1E293B' },
                                p.dueStatus === 'overdue' &&
                                  styles.financialDueUrgent,
                                p.dueStatus === 'today' &&
                                  styles.financialDueToday,
                              ]}
                            >
                              {p.dueIn}
                            </Text>
                          </View>
                        </View>
                      ))}
                    {purchaseData.length > 2 && (
                      <TouchableOpacity
                        style={styles.viewMoreBtn}
                        activeOpacity={0.7}
                        onPress={() => setShowAllPayments(prev => !prev)}
                      >
                        <Text
                          style={[
                            styles.viewMoreText,
                            { color: colors.accent },
                          ]}
                        >
                          {showAllPayments ? 'SHOW LESS' : 'VIEW MORE'}
                        </Text>
                        <AppIcon
                          name={showAllPayments ? 'ChevronUp' : 'ChevronDown'}
                          size={scale(14)}
                          color={colors.accent}
                        />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <NoData
                    message="No upcoming payments"
                    icon="WalletCards"
                    isDark={isDark}
                  />
                )}
              </View>
            
              <View style={styles.pendingReceiptsCard}>
                <View style={styles.financialHeaderRow}>
                  <Text style={styles.pendingReceiptsLabel}>
                    PENDING RECEIPTS
                  </Text>
                  <AppIcon name="Wallet" size={scale(36)} color="#3B82F6" />
                </View>
                {salesData.length > 0 ? (
                  <>
                    {salesData
                      .slice(0, showAllSales ? salesData.length : 2)
                      .map((r: any) => (
                        <View key={r.id} style={styles.financialRowClean}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.pendingReceiptItemLabel}>
                              {r.label}
                            </Text>
                            <Text style={styles.pendingReceiptAmount}>
                              {r.amount}
                            </Text>
                            <Text style={styles.saleType}>
                              {r.type.toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.pendingRight}>
                            <Text style={styles.pendingExpectedLabel}>
                              {r.expectedLabel}
                            </Text>
                            <Text
                              style={[
                                styles.pendingExpectedValue,
                                r.dueStatus === 'overdue' &&
                                  styles.pendingOverdue,
                                r.dueStatus === 'today' && styles.pendingToday,
                                r.dueStatus === 'no_date' &&
                                  styles.pendingNoDate,
                              ]}
                            >
                              {r.expectedIn}
                            </Text>
                          </View>
                        </View>
                      ))}
                    {salesData.length > 2 && (
                      <TouchableOpacity
                        style={styles.viewMoreBtnDark}
                        activeOpacity={0.7}
                        onPress={() => setShowAllSales(prev => !prev)}
                      >
                        <Text style={styles.viewMoreTextDark}>
                          {showAllSales ? 'SHOW LESS' : 'VIEW MORE'}
                        </Text>
                        <AppIcon
                          name={showAllSales ? 'ChevronUp' : 'ChevronDown'}
                          size={scale(14)}
                          color="#93C5FD"
                        />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <NoData
                    message="No pending receipts"
                    icon="ReceiptText"
                    darkBg
                  />
                )}
              </View>
            </View>
          )} */}
        </View>
      </ScrollView>

      {/* ── EMERGENCY MODAL ──────────────────────────────────────────────────── */}
      <Modal
        transparent
        animationType="fade"
        visible={emergencyModal.visible}
        onRequestClose={() => {
          if (!emergencyLoading)
            setEmergencyModal({ visible: false, type: null });
        }}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlayBg }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.modalBg }]}>
            <View style={styles.iconWrap}>
              <AppIcon name="TriangleAlert" size={scale(28)} color="#DC2626" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {emergencyModal.type === 'taskStop'
                ? 'Stop All Tasks?'
                : 'Punch Out All Staff?'}
            </Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              {emergencyModal.type === 'taskStop'
                ? 'This will immediately stop every running task across the platform. This action cannot be undone.'
                : 'This will punch out all currently checked-in staff. They will need to check in again manually.'}
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.cancelBtnBg },
                ]}
                disabled={emergencyLoading}
                onPress={() =>
                  setEmergencyModal({ visible: false, type: null })
                }
              >
                <Text
                  style={[
                    styles.cancelBtnText,
                    { color: colors.cancelBtnText },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  emergencyLoading && styles.confirmBtnDisabled,
                ]}
                disabled={emergencyLoading}
                onPress={handleEmergencyAction}
              >
                {emergencyLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    {emergencyModal.type === 'taskStop'
                      ? 'Yes, Stop All'
                      : 'Yes, Punch Out'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  maxWidth: {
    maxWidth: 448,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: scale(16),
    paddingTop: scale(12),
  },

  // Stats
  statsRow: {
    paddingRight: scale(10),
    gap: scale(12),
    paddingBottom: scale(4),
  },

  statCardHorizontal: {
    width: scale(122),
    borderWidth: 1,
    borderRadius: scale(12),
    padding: scale(10),
    marginBottom: scale(10),
    gap: scale(8),
  },

  statCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statCardIconWrap: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(9),
    justifyContent: 'center',
    alignItems: 'center',
  },

  statCardValue: {
    fontSize: moderateScale(22),
    fontWeight: '700',
  },

  statCardLabel: {
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
    fontWeight: '500',
  },

  // Card
  card: {
    borderWidth: 1,
    borderRadius: scale(16),
    padding: scale(20),
    marginBottom: scale(16),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(16),
  },
  sectionTitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  linkText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },

  // Emergency
  controlCard: {
    borderWidth: 1,
    borderRadius: scale(14),
    padding: scale(12),
    marginBottom: scale(16),
  },
  controlHeader: {
    marginBottom: scale(10),
  },
  controlTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlIconWrap: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginRight: scale(9),
  },
  title: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  subtitle: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(14),
    marginTop: scale(1),
  },
  buttonRow: { flexDirection: 'row', gap: scale(8) },
  stopBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingVertical: scale(8),
    borderRadius: scale(8),
    borderWidth: 1.5,
  },
  stopBtnText: {
    color: '#DC2626',
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  punchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    paddingVertical: scale(8),
    borderRadius: scale(8),
    backgroundColor: '#1E3A8A',
  },
  punchBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Attendance
  attendanceSummaryGrid: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: scale(12),
  },
  attendanceSummaryItem: {
    flex: 1,
    borderRadius: scale(10),
    paddingVertical: scale(8),
    alignItems: 'center',
  },
  attendanceSummaryValue: {
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  attendanceSummaryLabel: {
    fontSize: moderateScale(9),
    fontWeight: '700',
    marginTop: scale(2),
  },
  attendanceSnapshotTable: {
    marginTop: scale(2),
  },
  attendanceSnapshotRow: {
    minHeight: scale(42),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: scale(6),
    gap: scale(6),
  },
  attendancePersonCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  attendanceMiniAvatar: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(5),
  },
  attendanceMiniAvatarText: {
    color: '#FFFFFF',
    fontSize: moderateScale(7),
    fontWeight: '800',
  },
  attendancePunchCell: {
    flex: 0.52,
    minWidth: scale(48),
  },
  attendanceSnapshotNote: {
    fontSize: moderateScale(7.5),
    fontWeight: '800',
    marginTop: scale(1),
  },
  attendanceNameBlock: {
    flex: 1,
    minWidth: 0,
  },
  attendanceTimeValue: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginTop: scale(1),
  },
  attendanceName: { fontSize: moderateScale(12), fontWeight: '600' },
  textPresent: { color: '#16A34A' },
  textLate: { color: '#D97706' },
  textEarlyExit: { color: '#E11D48' },
  textLeave: { color: '#2563EB' },

  // Tasks
  runningTaskSummary: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    marginTop: scale(2),
  },
  runningTaskRow: {
    borderBottomWidth: 1,
    paddingVertical: scale(10),
    gap: scale(8),
  },
  runningTaskTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(10),
  },
  runningEmployeeLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  runningAvatar: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  runningAvatarText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: '800',
  },
  runningEmployeeTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  runningEmployeeName: {
    fontSize: moderateScale(12),
    fontWeight: '800',
  },
  runningPriorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(2),
  },
  runningPriorityDot: {
    width: scale(5),
    height: scale(5),
    borderRadius: scale(3),
    marginRight: scale(4),
  },
  highDot: { backgroundColor: '#DC2626' },
  mediumDot: { backgroundColor: '#D97706' },
  lowDot: { backgroundColor: '#16A34A' },
  runningPriorityText: {
    fontSize: moderateScale(9),
    fontWeight: '800',
  },
  runningTaskCell: {
    width: '100%',
    paddingLeft: scale(36), // aligns with text after avatar
  },
  runningTaskTitle: {
    fontSize: moderateScale(12),
    fontWeight: '800',
    lineHeight: moderateScale(16),
  },
  runningProjectName: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    marginTop: scale(3),
    lineHeight: moderateScale(14),
    textTransform: 'none', // remove if API sends all-caps
  },
  runningTimeCell: {
    alignItems: 'flex-end',
    flexShrink: 0,
    minWidth: scale(68),
  },
  runningTimeValue: {
    fontSize: moderateScale(12),
    fontWeight: '800',
  },
  runningTimeStatus: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    marginTop: scale(2),
  },
  highText: { color: '#DC2626' },
  mediumText: { color: '#D97706' },
  lowText: { color: '#16A34A' },
  overTimeText: { color: '#DC2626' },
  remainingTimeText: { color: '#16A34A' },

  // Financial
  upcomingCard: {
    borderRadius: scale(16),
    padding: scale(16),
    marginTop: scale(12),
  },
  pendingReceiptsCard: {
    backgroundColor: '#1546A0',
    borderRadius: scale(16),
    padding: scale(16),
    marginTop: scale(16),
  },
  financialHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  financialSectionLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: scale(12),
  },
  financialRowClean: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(14),
  },
  financialItemLabel: { fontSize: moderateScale(11) },
  financialAmount: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginTop: scale(2),
  },
  financialRight: { alignItems: 'flex-end' },
  financialDueLabel: {
    fontSize: moderateScale(9),
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  financialDueValue: { fontSize: moderateScale(12), fontWeight: '700' },
  financialDueUrgent: { color: '#EF4444' },
  financialDueToday: { color: '#F59E0B' },
  purchaseType: {
    fontSize: moderateScale(10),
    marginTop: scale(3),
    fontWeight: '600',
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
    paddingVertical: scale(4),
  },
  viewMoreText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  pendingReceiptsLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.8,
    marginBottom: scale(12),
  },
  pendingReceiptItemLabel: { fontSize: moderateScale(11), color: '#93C5FD' },
  pendingReceiptAmount: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pendingRight: { alignItems: 'flex-end' },
  pendingExpectedLabel: {
    fontSize: moderateScale(9),
    fontWeight: '600',
    color: '#93C5FD',
    letterSpacing: 0.4,
  },
  pendingExpectedValue: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pendingOverdue: { color: '#FCA5A5' },
  pendingToday: { color: '#FBBF24' },
  pendingNoDate: { color: '#93C5FD' },
  saleType: {
    fontSize: moderateScale(10),
    color: '#93C5FD',
    marginTop: scale(3),
    fontWeight: '600',
  },
  viewMoreBtnDark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(4),
    paddingVertical: scale(4),
  },
  viewMoreTextDark: {
    color: '#93C5FD',
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  // Modal
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  modalCard: {
    width: '100%',
    borderRadius: scale(20),
    padding: scale(24),
    alignItems: 'center',
    gap: scale(10),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: scale(8) },
    shadowOpacity: 0.18,
    shadowRadius: scale(24),
    elevation: 16,
  },
  iconWrap: {
    width: scale(58),
    height: scale(58),
    borderRadius: scale(29),
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(4),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: moderateScale(13),
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: scale(12),
    width: '100%',
    marginTop: scale(8),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(10),
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: moderateScale(14), fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    paddingVertical: scale(12),
    borderRadius: scale(10),
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(44),
  },
  confirmBtnDisabled: { opacity: 0.65 },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
});

export default AdminDashboard;
