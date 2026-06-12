import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
  Animated,
  RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-gifted-charts';
import CurrentTaskCard from './currentTaskCard';
import { BlurView } from '@react-native-community/blur';
import messaging from '@react-native-firebase/messaging';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  getCurrentTask,
  getPerformanceReport,
  getTaskCount,
  getTodayStaffPerformance,
  updateTaskStatus,
} from '../../services';
import { convertMinutesToReadableFormat } from '../../utils';
import AppIcon, { IconName } from '../../components/appIcon';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { TabWithStackNavProp } from '../../navigation/navigationTypes';
import { AppStackParamList } from '../../navigation/navigationTypes';
import moment from 'moment';
import ToastUtil from '../../utils/toastAndroid';
import AddButton from '../../components/button/addButton';
import {
  getPartyLists,
  getReminderTypeList,
} from '../../services/projectReminderService';
import { getDashboardCount } from '../../services/adminDashboardServices';
import NetInfoComponent from '../../components/netinfoComponent';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PerformanceReportItem {
  actual_minuties: number;
  working_minuties: number;
  date: string;
}

interface TodayStaffPerformance {
  work_date?: string;
  date?: string;
  actual_minuties: number;
  working_minuties: number;
}

interface CurrentTaskData {
  work_log_id: string | number;
  [key: string]: any;
}

interface ChartDataItem {
  value: number;
  displayValue: string;
  frontColor: string;
  gradientColor: string;
  spacing?: number;
  label?: string;
}

type FeedbackModalAction = 'complete' | 'All Stop' | '';

interface TaskCardProps {
  count: number;
  title: string;
  accentColor: string;
  icon: IconName;
  onPress: () => void;
}

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

// ─── Task Count Section Skeleton ─────────────────────────────────────────────

// ─── Current Task Card Skeleton ──────────────────────────────────────────────

const CurrentTaskCardSkeleton: React.FC<{
  isDark: boolean;
}> = ({ isDark }) => {
  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderWidth: 1,
        borderColor: isDark ? '#334155' : '#E2E8F0',
        borderRadius: scale(18),
        padding: scale(16),
        marginBottom: scale(16),

        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* ─── Header Row ───────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: scale(14),
        }}
      >
        {/* Left */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          {/* Avatar */}
          <SkeletonBox
            width={moderateScale(40)}
            height={moderateScale(40)}
            borderRadius={scale(21)}
            isDark={isDark}
          />

          {/* Name + Project */}
          <View
            style={{
              flex: 1,
              marginLeft: scale(10),
            }}
          >
            <SkeletonBox
              width="68%"
              height={scale(11)}
              borderRadius={scale(6)}
              isDark={isDark}
            />

            <SkeletonBox
              width="42%"
              height={scale(10)}
              borderRadius={scale(6)}
              style={{
                marginTop: scale(6),
              }}
              isDark={isDark}
            />
          </View>
        </View>

        {/* Live badge */}
        <SkeletonBox
          width={moderateScale(56)}
          height={moderateScale(20)}
          borderRadius={scale(20)}
          isDark={isDark}
        />
      </View>

      {/* ─── Task Title ───────────────────────────── */}
      <SkeletonBox
        width="92%"
        height={verticalScale(11)}
        borderRadius={scale(8)}
        isDark={isDark}
      />

      <SkeletonBox
        width="75%"
        height={verticalScale(10)}
        borderRadius={scale(8)}
        style={{
          marginTop: scale(8),
        }}
        isDark={isDark}
      />
    </View>
  );
};

const TaskCountSectionSkeleton: React.FC<{
  isDark: boolean;
}> = ({ isDark }) => {
  return (
    <View style={{ marginBottom: scale(20) }}>
      {/* ─── Section Header ───────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: scale(14),
        }}
      >
        <SkeletonBox
          width={scale(120)}
          height={scale(14)}
          borderRadius={scale(8)}
          isDark={isDark}
        />

        <SkeletonBox
          width={moderateScale(86)}
          height={moderateScale(20)}
          borderRadius={scale(20)}
          isDark={isDark}
        />
      </View>

      {/* ─── Task Cards Grid ─────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          rowGap: scale(10),
        }}
      >
        {[1, 2, 3, 4, 5, 6].map(item => (
          <View
            key={item}
            style={{
              width: '31.5%',
              borderRadius: scale(14),
              paddingHorizontal: scale(10),
              paddingVertical: scale(12),
              borderWidth: 1,
              borderTopWidth: 3,

              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',

              borderColor: isDark ? '#334155' : '#E2E8F0',

              borderTopColor: isDark ? '#3B82F6' : '#93C5FD',

              minHeight: scale(82),

              justifyContent: 'space-between',

              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            {/* ─── Top Row ───────────────────── */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              {/* Icon */}
              <SkeletonBox
                width={scale(28)}
                height={scale(28)}
                borderRadius={scale(9)}
                isDark={isDark}
              />

              {/* Count */}
              <SkeletonBox
                width={scale(30)}
                height={scale(18)}
                borderRadius={scale(6)}
                isDark={isDark}
              />
            </View>

            {/* ─── Bottom Label ─────────────── */}
            <View style={{ marginTop: scale(12) }}>
              <SkeletonBox
                width="82%"
                height={scale(10)}
                borderRadius={scale(5)}
                isDark={isDark}
              />

              <SkeletonBox
                width="58%"
                height={scale(10)}
                borderRadius={scale(5)}
                style={{
                  marginTop: scale(5),
                }}
                isDark={isDark}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─── Today's Work Section Skeleton ───────────────────────────────────────────

// ─── Today's Work Section Skeleton ───────────────────────────────────────────

const TodayWorkSectionSkeleton: React.FC<{
  isDark: boolean;
}> = ({ isDark }) => {
  return (
    <View
      style={{
        borderRadius: scale(18),
        padding: scale(18),
        marginBottom: scale(18),

        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',

        borderWidth: 1,
        borderColor: isDark ? '#334155' : '#E2E8F0',

        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* ─── Top Row ─────────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: scale(18),
        }}
      >
        {/* Left Side */}
        <View style={{ flex: 1 }}>
          <SkeletonBox
            width={scale(90)}
            height={scale(10)}
            borderRadius={scale(5)}
            isDark={isDark}
          />

          <SkeletonBox
            width="72%"
            height={scale(12)}
            borderRadius={scale(8)}
            style={{
              marginTop: scale(10),
            }}
            isDark={isDark}
          />
        </View>

        {/* Calendar Icon */}
        <SkeletonBox
          width={scale(40)}
          height={scale(38)}
          borderRadius={scale(12)}
          isDark={isDark}
        />
      </View>

      {/* ─── Hours Row ───────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          gap: scale(10),
          marginBottom: scale(16),
        }}
      >
        {[1, 2].map(item => (
          <View
            key={item}
            style={{
              flex: 1,
              borderRadius: scale(12),
              padding: scale(14),

              backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            }}
          >
            {/* Label */}
            <SkeletonBox
              width={scale(70)}
              height={scale(10)}
              borderRadius={scale(5)}
              isDark={isDark}
            />

            {/* Time */}
            <SkeletonBox
              width={scale(90)}
              height={scale(12)}
              borderRadius={scale(8)}
              style={{
                marginTop: scale(10),
              }}
              isDark={isDark}
            />
          </View>
        ))}
      </View>

      {/* ─── Comparison Row ─────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: scale(14),
        }}
      >
        {/* Left Text */}
        <View style={{ flex: 1 }}>
          <SkeletonBox
            width={scale(110)}
            height={scale(10)}
            borderRadius={scale(5)}
            isDark={isDark}
          />

          <SkeletonBox
            width={scale(150)}
            height={scale(12)}
            borderRadius={scale(6)}
            style={{
              marginTop: scale(8),
            }}
            isDark={isDark}
          />
        </View>

        {/* Badge */}
        <SkeletonBox
          width={scale(84)}
          height={scale(20)}
          borderRadius={scale(20)}
          isDark={isDark}
        />
      </View>

      {/* ─── Progress Bar ───────────────────────── */}
      <View
        style={{
          height: scale(8),
          borderRadius: scale(999),
          overflow: 'hidden',

          backgroundColor: isDark ? '#0F172A' : '#E2E8F0',
        }}
      >
        <View
          style={{
            width: '58%',
            height: '100%',
          }}
        >
          <SkeletonBox
            width="100%"
            height={scale(8)}
            borderRadius={scale(999)}
            isDark={isDark}
          />
        </View>
      </View>
    </View>
  );
};

// ─── Analytics Section Skeleton ──────────────────────────────────────────────

// ─── Analytics Chart Skeleton ────────────────────────────────────────────────

const AnalyticsChartSkeleton: React.FC<{
  isDark: boolean;
}> = ({ isDark }) => {
  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',

        borderWidth: 1,
        borderColor: isDark ? '#334155' : '#E2E8F0',

        borderRadius: scale(18),

        padding: scale(18),

        marginBottom: scale(18),

        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* ─── Header ───────────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: scale(18),
        }}
      >
        <View>
          <SkeletonBox
            width={scale(130)}
            height={scale(16)}
            borderRadius={scale(6)}
            isDark={isDark}
          />

          <SkeletonBox
            width={scale(90)}
            height={scale(10)}
            borderRadius={scale(5)}
            style={{
              marginTop: scale(8),
            }}
            isDark={isDark}
          />
        </View>

        <SkeletonBox
          width={scale(38)}
          height={scale(38)}
          borderRadius={scale(12)}
          isDark={isDark}
        />
      </View>

      {/* ─── Legend Row ───────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(18),
          marginBottom: scale(22),
        }}
      >
        {[1, 2].map(item => (
          <View
            key={item}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <SkeletonBox
              width={scale(12)}
              height={scale(12)}
              borderRadius={scale(6)}
              isDark={isDark}
            />

            <SkeletonBox
              width={scale(60)}
              height={scale(9)}
              borderRadius={scale(4)}
              style={{
                marginLeft: scale(8),
              }}
              isDark={isDark}
            />
          </View>
        ))}
      </View>

      {/* ─── Chart Area ───────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          height: scale(170),
          marginBottom: scale(14),
        }}
      >
        {/* Y Axis Labels */}
        <View
          style={{
            height: '100%',
            justifyContent: 'space-between',
            marginRight: scale(10),
            paddingBottom: scale(6),
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(item => (
            <SkeletonBox
              key={item}
              width={scale(20)}
              height={scale(8)}
              borderRadius={scale(4)}
              isDark={isDark}
            />
          ))}
        </View>

        {/* Bars */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '100%',
          }}
        >
          {[
            { h1: 118, h2: 145 },
            { h1: 70, h2: 95 },
            { h1: 98, h2: 125 },
            { h1: 82, h2: 112 },
            { h1: 122, h2: 150 },
          ].map((pair, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
              }}
            >
              {/* First Bar */}
              <SkeletonBox
                width={scale(14)}
                height={scale(pair.h1)}
                borderRadius={scale(5)}
                style={{
                  marginRight: scale(6),
                }}
                isDark={isDark}
              />

              {/* Second Bar */}
              <SkeletonBox
                width={scale(14)}
                height={scale(pair.h2)}
                borderRadius={scale(5)}
                isDark={isDark}
              />
            </View>
          ))}
        </View>
      </View>

      {/* ─── X Axis Labels ────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: scale(6),
          marginBottom: scale(16),
        }}
      >
        {[1, 2, 3, 4, 5].map(item => (
          <SkeletonBox
            key={item}
            width={scale(38)}
            height={scale(8)}
            borderRadius={scale(4)}
            isDark={isDark}
          />
        ))}
      </View>

      {/* ─── Footer Stats ─────────────────────── */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',

          paddingTop: scale(14),

          borderTopWidth: 1,
          borderTopColor: isDark ? '#334155' : '#E2E8F0',
        }}
      >
        <SkeletonBox
          width={scale(130)}
          height={scale(12)}
          borderRadius={scale(5)}
          isDark={isDark}
        />

        <SkeletonBox
          width={scale(60)}
          height={scale(12)}
          borderRadius={scale(5)}
          isDark={isDark}
        />
      </View>
    </View>
  );
};
// ─── Component ────────────────────────────────────────────────────────────────

const Home: React.FC<{ navigation: HomeScreenNav }> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const isFocused = useIsFocused();

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

  const [weeklyAvgHours, setWeeklyAvgHours] = useState(0);
  const [dashboardCounts, setDashboardCounts] = useState({
    remainPointCount: 0,
    reminderCount: 0,
    pendingTaskCount: 0,
    workingTaskCount: 0,
    completedByDeveloperCount: 0,
    reOpenTaskCount: 0,
  });
  const [performanceReportData, setPerformanceReportData] = useState<
    PerformanceReportItem[]
  >([]);
  const [todayStaffPerformance, setTodayStaffPerformance] = useState<
    TodayStaffPerformance[]
  >([]);
  const [currentTask, setCurrentTask] = useState<any>([]);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [developerFeedback, setDeveloperFeedback] = useState('');
  const [feedbackModalAction, setFeedbackModalAction] =
    useState<FeedbackModalAction>('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingCurrentTask, setLoadingCurrentTask] = useState(true);
  const [loadingTaskCount, setLoadingTaskCount] = useState(true);
  const [loadingTodayWork, setLoadingTodayWork] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
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

  // ── Navigation ────────────────────────────────────────────────────────────
  const openTaskList = (
    taskStatus: 'Pending' | 'Working' | 'Completed By Developer' | 'Re Open',
  ) => {
    const parentNavigation =
      navigation.getParent<NativeStackNavigationProp<AppStackParamList>>();

    if (parentNavigation) {
      parentNavigation.navigate('TaskList', { task_status: taskStatus });
      return;
    }

    navigation.navigate('TaskList', { task_status: taskStatus });
  };

  // ── Theme ─────────────────────────────────────────────────────────────────
  const t = {
    bg: isDarkMode ? '#141518' : '#F5F7FB',
    card: isDarkMode ? '#1E2028' : '#FFFFFF',
    text: isDarkMode ? '#F0F0F0' : '#1A1D2E',
    sub: '#9098B1',
    border: isDarkMode ? '#2A2D38' : '#EAEDFF',
    primary: '#3B6FD4',
    headerBg: isDarkMode ? '#1E2028' : '#FFFFFF',
    headerBorder: isDarkMode ? '#2A2D38' : '#F0F3FF',
  };

  const Y_AXIS_LABELS = [
    '0h',
    '1h',
    '2h',
    '3h',
    '4h',
    '5h',
    '6h',
    '7h',
    '8h',
    '9h',
    '10h',
    '11h',
    '12h',
    '13h',
  ];

  // ── Inner TaskCard ────────────────────────────────────────────────────────
  const TaskCard: React.FC<TaskCardProps> = ({
    count,
    title,
    accentColor,
    icon,
    onPress,
  }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.taskCard,
        {
          backgroundColor: t.card,
          borderColor: t.border,
          borderTopColor: accentColor,
        },
      ]}
    >
      {/* Top Row */}
      <View style={styles.taskCardTopRow}>
        <View
          style={[
            styles.taskIconWrapper,
            {
              backgroundColor: `${accentColor}15`,
            },
          ]}
        >
          <AppIcon name={icon} color={accentColor} size={14} />
        </View>

        <Text style={[styles.taskCount, { color: t.text }]}>
          {String(count).padStart(2, '0')}
        </Text>
      </View>

      {/* Bottom Title */}
      <Text style={[styles.taskTitle, { color: t.sub }]} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDisplayDate = (raw: string | undefined): string => {
    if (!raw) return '--';
    const m = moment(raw, ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601], true);
    return m.isValid() ? m.format('MMMM Do YYYY') : raw;
  };

  const formatHours = (min: number) => min / 60;
  const formatMinutes = (minutes?: number | null) => {
    if (minutes === null || minutes === undefined) return '—';
    const isNeg = minutes < 0;
    const abs = Math.abs(minutes);
    if (abs < 60) return `${isNeg ? '-' : ''}${abs} min`;
    const hrs = Math.floor(abs / 60);
    const mins = abs % 60;
    return `${isNeg ? '-' : ''}${hrs} hr${hrs > 1 ? 's' : ''}${
      mins ? ` ${mins} min` : ''
    }`;
  };

  const getWeeklyAvgHours = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0) return 0;
    const totalMinutes = data.reduce(
      (sum, item) => sum + Number(item?.actual_minuties || 0),
      0,
    );
    return totalMinutes / data.length / 60;
  };

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchUserDetails = async (): Promise<void> => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      const p = JSON.parse(userInfo);
      setLoginuserRole(p.role);
    }
  };

  const handleCurrentTaskData = async (): Promise<void> => {
    try {
      const data = await getCurrentTask();
      setCurrentTask(data);
    } catch (error) {
      console.error('Error fetching current task:', error);
      ToastUtil.error('Failed to load current task');
    } finally {
      setLoadingCurrentTask(false);
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
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard counts');
    }
  };

  const handleTaskCount = async (): Promise<void> => {
    try {
      const data = await getTaskCount();

      setDashboardCounts(prev => ({
        ...prev,

        pendingTaskCount: data?.pending_cnt ?? 0,

        workingTaskCount: data?.working_cnt ?? 0,

        completedByDeveloperCount: data?.completed_by_developer_cnt ?? 0,

        reOpenTaskCount: data?.re_open_cnt ?? 0,
      }));
    } catch (error) {
      console.error('Error fetching task counts:', error);

      ToastUtil.error('Failed to load task counts');
    } finally {
      setLoadingTaskCount(false);
    }
  };
  const handlePerformanceReport = async (): Promise<void> => {
    try {
      const data = await getPerformanceReport();
      setPerformanceReportData(data.final_array);
      setWeeklyAvgHours(getWeeklyAvgHours(data.final_array));
    } catch (error) {
      console.error('Error fetching performance report:', error);
      ToastUtil.error('Failed to load performance report');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchTodayStaffPerformance = async (): Promise<void> => {
    try {
      const data = await getTodayStaffPerformance();
      setTodayStaffPerformance(data ?? []);
    } catch {
      console.error("Error fetching today's performance");
    } finally {
      setLoadingTodayWork(false);
    }
  };

  // ── Init — runs on every focus, shows skeleton until ALL calls settle ─────
  useEffect(() => {
    if (!isFocused) return;

    const init = async () => {
      await fetchUserDetails();

      // Run all four data calls in parallel; wait for every one to settle
      await Promise.allSettled([
        handleTaskCount(),
        handlePerformanceReport(),
        handleCurrentTaskData(),
        fetchTodayStaffPerformance(),
        fetchCounts(),
      ]);
    };

    init();
  }, [isFocused]);

  // ── Firebase notification listener (runs once) ────────────────────────────
  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage?.data) {
        const { screen } = remoteMessage.data;
        navigation.navigate(
          screen === 'LeaveList' ? 'LeaveList' : 'NotificationScreen',
        );
      }
    });
    return unsubscribe;
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      await Promise.allSettled([
        handleTaskCount(),
        handlePerformanceReport(),
        handleCurrentTaskData(),
        fetchTodayStaffPerformance(),
        fetchCounts(),
        fetchUserDetails(),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Chart data ────────────────────────────────────────────────────────────
  const performanceReport = useMemo(() => {
    if (!Array.isArray(performanceReportData)) return [];
    return performanceReportData.map(item => [
      {
        value: formatHours(Number(item?.actual_minuties)),
        displayValue: convertMinutesToReadableFormat(
          Number(item?.actual_minuties),
        ),
        frontColor: isDarkMode ? '#5B8DF5' : '#93B4FF',
        gradientColor: isDarkMode ? '#5B8DF5' : '#93B4FF',
        spacing: 6,
        label: item?.date,
      },
      {
        value: formatHours(Number(item?.working_minuties)),
        displayValue: convertMinutesToReadableFormat(
          Number(item?.working_minuties),
        ),
        frontColor: '#3B6FD4',
        gradientColor: '#3B6FD4',
      },
    ]);
  }, [performanceReportData, isDarkMode]);

  // ── Action handlers ───────────────────────────────────────────────────────
  const updateTaskStatusHandler = async (taskStatus: string): Promise<void> => {
    const response = await updateTaskStatus(
      (currentTask as CurrentTaskData).work_log_id,
      developerFeedback,
      taskStatus,
    );
    if (response?.success) {
      ToastUtil.success(`Work ${taskStatus} successfully`);
      await Promise.all([
        handleCurrentTaskData(),
        handleTaskCount(),
        fetchTodayStaffPerformance(),
      ]);
      toggleFeedbackModal('');
    } else {
      ToastUtil.error(response?.message);
    }
  };

  const toggleFeedbackModal = (action: FeedbackModalAction = ''): void => {
    setFeedbackModalAction(action);
    setDeveloperFeedback('');
    setIsFeedbackModalVisible(prev => !prev);
  };

  const handleCountsOnlyRefresh = async (): Promise<void> => {
    await Promise.all([handleTaskCount(), fetchTodayStaffPerformance()]);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const hasActiveTask =
    currentTask && !Array.isArray(currentTask)
      ? true
      : Array.isArray(currentTask)
      ? currentTask.length > 0
      : false;

  const todayDateRaw =
    todayStaffPerformance?.work_date ?? todayStaffPerformance?.date;
  const todayActualMinutes = Number(
    todayStaffPerformance?.actual_minuties || 0,
  );
  const todayWorkingMinutes = Number(
    todayStaffPerformance?.working_minuties || 0,
  );
  const todayComparisonPercent =
    todayActualMinutes > 0
      ? Math.min(
          Math.round((todayWorkingMinutes / todayActualMinutes) * 100),
          100,
        )
      : todayWorkingMinutes > 0
      ? 100
      : 0;
  const todayMinuteDifference = todayWorkingMinutes - todayActualMinutes;
  const todayDifferenceLabel =
    todayMinuteDifference === 0
      ? 'On track'
      : `${formatMinutes(Math.abs(todayMinuteDifference))} ${
          todayMinuteDifference > 0 ? 'extra' : 'less'
        }`;

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
    {
      label: 'Add Task',
      icon: 'Plus' as IconName,
      iconBg: '#F59E0B',
      onPress: () => {
        closeQuickActions();
        navigation.navigate('AddTask');
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
        {/* ── Skeleton shown until isReady ── */}

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
          {/* Current Running Task */}

          {loadingCurrentTask ? (
            <CurrentTaskCardSkeleton isDark={isDarkMode} />
          ) : (
            <>
              {hasActiveTask ? (
                <TouchableOpacity
                  style={[styles.section, { marginBottom: verticalScale(7) }]}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('TaskDetail', {
                      data: currentTask,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: t.text, marginBottom: verticalScale(4) },
                    ]}
                  >
                    Current Running Task
                  </Text>
                  <CurrentTaskCard
                    currentTaskData={
                      Array.isArray(currentTask) ? currentTask[0] : currentTask
                    }
                    onCountsRefresh={handleCountsOnlyRefresh}
                    onTaskComplete={async () => {
                      // Re-fetch everything so hasActiveTask flips to false → empty state shows
                      await Promise.allSettled([
                        handleCurrentTaskData(),
                        handleTaskCount(),
                        fetchTodayStaffPerformance(),
                      ]);
                    }}
                  />
                </TouchableOpacity>
              ) : (
                <Animated.View
                  style={[
                    styles.emptyTaskCard,
                    {
                      backgroundColor: t.card,
                      borderColor: t.border,
                      transform: [
                        {
                          scale: pulseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.02],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {/* Decorative Glow */}
                  <View
                    style={[
                      styles.emptyTaskGlow,
                      {
                        backgroundColor: isDarkMode
                          ? 'rgba(59,111,212,0.12)'
                          : 'rgba(59,111,212,0.08)',
                      },
                    ]}
                  />

                  {/* Floating Icon */}
                  <Animated.View
                    style={[
                      styles.emptyTaskIconWrap,
                      {
                        // backgroundColor: isDarkMode ? '#16213E' : '#EEF4FF',

                        transform: [
                          {
                            translateY: floatAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -6],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <AppIcon name="Coffee" color={t.primary} size={26} />
                  </Animated.View>

                  {/* Main Title */}
                  <Text
                    style={[
                      styles.emptyTaskTitle,
                      {
                        color: t.text,
                      },
                    ]}
                  >
                    Nothing in progress right now
                  </Text>

                  {/* Subtitle */}
                  <Text
                    style={[
                      styles.emptyTaskSubtitle,
                      {
                        color: t.sub,
                      },
                    ]}
                  >
                    Enjoy your free moment or pick a task below to start
                    tracking your work.
                  </Text>

                  {/* Bottom Chips */}
                  <View style={styles.emptyTaskTagsRow}>
                    <View
                      style={[
                        styles.emptyTaskTag,
                        {
                          backgroundColor: isDarkMode ? '#1A2540' : '#EEF4FF',
                        },
                      ]}
                    >
                      <AppIcon name="Clock3" size={13} color={t.primary} />

                      <Text
                        style={[
                          styles.emptyTaskTagText,
                          {
                            color: t.primary,
                          },
                        ]}
                      >
                        No running timer
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.emptyTaskTag,
                        {
                          backgroundColor: isDarkMode ? '#1B2A1F' : '#ECFDF3',
                        },
                      ]}
                    >
                      <AppIcon name="Sparkles" size={13} color="#22C55E" />

                      <Text
                        style={[
                          styles.emptyTaskTagText,
                          {
                            color: '#22C55E',
                          },
                        ]}
                      >
                        Ready to start
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              )}
            </>
          )}

          {/* Your Tasks */}
          <View style={styles.section}>
            <View style={styles.compactSectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  styles.compactSectionTitle,
                  {
                    color: t.text,
                  },
                ]}
              >
                Your Tasks
              </Text>

              {!loadingTaskCount && (
                <View
                  style={[
                    styles.liveBadge,
                    {
                      backgroundColor: isDarkMode ? '#1A2540' : '#EEF4FF',
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.liveDot,
                      {
                        opacity: livePulse,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.liveBadgeText,
                      {
                        color: t.primary,
                      },
                    ]}
                  >
                    LIVE UPDATES
                  </Text>
                </View>
              )}
            </View>

            {loadingTaskCount ? (
              <TaskCountSectionSkeleton isDark={isDarkMode} />
            ) : (
              <>
                <View style={styles.taskGrid}>
                  <TaskCard
                    count={dashboardCounts.pendingTaskCount}
                    title="Pending"
                    accentColor="#FFA000"
                    icon="Clock"
                    onPress={() => openTaskList('Pending')}
                  />

                  <TaskCard
                    count={dashboardCounts.workingTaskCount}
                    title="Working"
                    accentColor="#3B6FD4"
                    icon="Play"
                    onPress={() => openTaskList('Working')}
                  />

                  <TaskCard
                    count={dashboardCounts.completedByDeveloperCount}
                    title="Completed"
                    accentColor="#22C55E"
                    icon="CheckCircle"
                    onPress={() => openTaskList('Completed By Developer')}
                  />

                  <TaskCard
                    count={dashboardCounts.reOpenTaskCount}
                    title="Re Open"
                    accentColor="#EF4444"
                    icon="RefreshCw"
                    onPress={() => openTaskList('Re Open')}
                  />

                  <TaskCard
                    count={dashboardCounts.remainPointCount}
                    title="Remain"
                    accentColor="#3B82F6"
                    icon="Star"
                    onPress={() =>
                      navigation.navigate('ProjectRemainingScreen')
                    }
                  />

                  <TaskCard
                    count={dashboardCounts.reminderCount}
                    title="Reminder"
                    accentColor="#8B5CF6"
                    icon="Bell"
                    onPress={() => navigation.navigate('ProjectReminder')}
                  />
                </View>
              </>
            )}
          </View>

          {/* Today's Work */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Today's Work
            </Text>

            {loadingTodayWork ? (
              <TodayWorkSectionSkeleton isDark={isDarkMode} />
            ) : todayStaffPerformance.length === 0 ? (
              <NoData
                message="Today's work data not available"
                icon="CalendarX2"
                isDark={isDarkMode}
              />
            ) : (
              <View style={styles.todayCard}>
                <View style={styles.todayTopRow}>
                  <View>
                    <Text style={styles.todayDateLabel}>CURRENT DATE</Text>

                    <Text style={styles.todayDateValue}>
                      {formatDisplayDate(todayDateRaw)}
                    </Text>
                  </View>

                  <View style={styles.calendarIcon}>
                    <AppIcon name="Calendar" color="#fff" size={16} />
                  </View>
                </View>

                <View style={styles.hoursRow}>
                  <View style={styles.hoursBox}>
                    <Text style={styles.hoursLabel}>Actual Time</Text>

                    <Text style={styles.hoursValue}>
                      {formatMinutes(todayStaffPerformance?.actual_minuties)}
                    </Text>
                  </View>

                  <View style={styles.hoursBox}>
                    <Text style={styles.hoursLabel}>Working Time</Text>

                    <Text style={styles.hoursValue}>
                      {formatMinutes(todayStaffPerformance?.working_minuties)}
                    </Text>
                  </View>
                </View>

                <View style={styles.todayComparisonRow}>
                  <View style={styles.todayComparisonTextWrap}>
                    <Text style={styles.todayComparisonLabel}>
                      Working vs Actual
                    </Text>

                    <Text style={styles.todayComparisonValue}>
                      {todayComparisonPercent}% of actual time
                    </Text>
                  </View>

                  <View style={styles.todayDeltaBadge}>
                    <Text style={styles.todayDeltaText}>
                      {todayDifferenceLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.todayProgressTrack}>
                  <View
                    style={[
                      styles.todayProgressFill,
                      {
                        width: `${todayComparisonPercent}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* User Working Analytics */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              User Working Analytics
            </Text>

            {loadingAnalytics ? (
              <AnalyticsChartSkeleton isDark={isDarkMode} />
            ) : !performanceReport ||
              !performanceReport.length ||
              !performanceReport.flat()?.length ? (
              <NoData
                message="Analytics data not available"
                icon="BarChart3"
                isDark={isDarkMode}
              />
            ) : (
              <View
                style={[
                  styles.chartCard,
                  {
                    backgroundColor: t.card,
                  },
                ]}
              >
                <>
                  {/* ─── Legends ───────────────────────── */}
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          {
                            backgroundColor: isDarkMode ? '#5B8DF5' : '#93B4FF',
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.legendText,
                          {
                            color: t.sub,
                          },
                        ]}
                      >
                        Actual Time
                      </Text>
                    </View>

                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          {
                            backgroundColor: '#3B6FD4',
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.legendText,
                          {
                            color: t.sub,
                          },
                        ]}
                      >
                        Working Time
                      </Text>
                    </View>
                  </View>

                  {/* ─── Chart ─────────────────────────── */}
                  <View style={styles.chartWrapper}>
                    <BarChart
                      data={performanceReport.flat()}
                      barWidth={14}
                      spacing={18}
                      roundedTop
                      roundedBottom
                      hideRules
                      noOfSections={10}
                      maxValue={10}
                      yAxisLabelTexts={Y_AXIS_LABELS}
                      yAxisTextStyle={{
                        color: t.sub,
                        fontSize: 10,
                      }}
                      xAxisLabelTextStyle={{
                        color: t.sub,
                        fontSize: 9,
                        width: 40,
                        textAlign: 'center',
                      }}
                      renderTooltip={(item: ChartDataItem) => (
                        <View style={styles.tooltip}>
                          <Text style={styles.tooltipText}>
                            {item.displayValue}
                          </Text>
                        </View>
                      )}
                    />
                  </View>

                  {/* ─── Footer ───────────────────────── */}
                  <View
                    style={[
                      styles.weeklyRow,
                      {
                        borderTopColor: t.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.weeklyText,
                        {
                          color: t.sub,
                        },
                      ]}
                    >
                      Weekly Avg :{' '}
                      <Text
                        style={{
                          color: t.primary,
                          fontWeight: '700',
                        }}
                      >
                        {weeklyAvgHours.toFixed(2)}hr
                      </Text>
                    </Text>

                    <TouchableOpacity
                      onPress={() => navigation.navigate('PerformanceReport')}
                    >
                      <Text
                        style={{
                          color: t.primary,
                          fontSize: 12,
                        }}
                      >
                        Details →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              </View>
            )}
          </View>
          {/* Branding */}
          <Text style={[styles.brandName, { color: t.border }]}>
            JATAYU{'\n'}Technologies
          </Text>
        </ScrollView>

        {/* FAB — always visible even during skeleton */}
        {loginuserRole === 'Employee' && (
          <AddButton onPress={openQuickActions} />
        )}

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

        {/* ── Feedback Modal ── */}
        <Modal
          visible={isFeedbackModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => toggleFeedbackModal('')}
        >
          <TouchableWithoutFeedback onPress={() => toggleFeedbackModal('')}>
            <View style={styles.modalOverlay}>
              {Platform.OS === 'ios' && (
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="dark"
                  blurAmount={4}
                />
              )}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              >
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />

                    <Text style={styles.modalTitle}>Developer Feedback</Text>
                    <Text style={styles.modalSub}>
                      {feedbackModalAction === 'complete'
                        ? 'Add notes before marking this task as completed.'
                        : 'Add notes before stopping all tasks.'}
                    </Text>

                    <TextInput
                      style={styles.modalInput}
                      multiline
                      placeholder="Add your feedback here..."
                      placeholderTextColor="#9098B1"
                      value={developerFeedback}
                      onChangeText={setDeveloperFeedback}
                    />

                    <View style={styles.modalBtns}>
                      <TouchableOpacity
                        onPress={() => {
                          if (feedbackModalAction === 'complete') {
                            updateTaskStatusHandler('Completed By Developer');
                          } else if (feedbackModalAction === 'All Stop') {
                            // hnadleStopAllTask();
                          } else {
                            toggleFeedbackModal('');
                          }
                        }}
                        style={[styles.modalBtn, styles.modalBtnPrimary]}
                      >
                        <Text style={styles.modalBtnPrimaryText}>Submit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => toggleFeedbackModal('')}
                        style={[styles.modalBtn, styles.modalBtnSecondary]}
                      >
                        <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </GestureHandlerRootView>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(100),
  },
  section: { marginBottom: verticalScale(22) },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    marginBottom: verticalScale(12),
    letterSpacing: 0.1,
  },
  compactSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  compactSectionTitle: {
    marginBottom: 0,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(20),
  },
  liveDot: {
    width: moderateScale(7),
    height: moderateScale(7),
    borderRadius: moderateScale(4),
    backgroundColor: '#3B6FD4',
  },
  liveBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  taskGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: verticalScale(8),
  },

  taskCard: {
    width: '31.6%',
    height: verticalScale(60),
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderWidth: 1,
    borderTopWidth: 3,
    justifyContent: 'space-between',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  taskCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  taskIconWrapper: {
    width: moderateScale(20),
    height: moderateVerticalScale(20, 0.3),
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  taskCount: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  taskTitle: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    lineHeight: moderateScale(14),
  },
  emptyTaskCard: {
    width: '100%',
    alignSelf: 'center',

    borderRadius: moderateScale(12),

    borderWidth: 1,

    alignItems: 'center',

    paddingTop: verticalScale(28),
    paddingBottom: verticalScale(12),
    paddingHorizontal: scale(22),

    marginBottom: verticalScale(20),

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  todayCard: {
    borderRadius: moderateScale(12),
    backgroundColor: '#3B6FD4',
    padding: moderateScale(16),
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  todayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(14),
  },
  todayDateLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(9),
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: verticalScale(4),
  },
  todayDateValue: {
    color: '#FFFFFF',
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  calendarIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(7),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hoursRow: { flexDirection: 'row', gap: 10 },
  hoursBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
  },
  hoursLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(11),
    fontWeight: '600',
    marginBottom: verticalScale(5),
  },
  hoursValue: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '900',
  },
  todayComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  todayComparisonTextWrap: {
    flex: 1,
    paddingRight: moderateScale(10),
  },
  todayComparisonLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  todayComparisonValue: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontWeight: '800',
    marginTop: verticalScale(2),
  },
  todayDeltaBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(5),
    maxWidth: '48%',
  },
  todayDeltaText: {
    color: '#FFFFFF',
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  todayProgressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    marginBottom: verticalScale(12),
  },
  todayProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  chartCard: {
    borderRadius: 18,
    padding: moderateScale(16),
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  legendRow: {
    flexDirection: 'row',
    gap: moderateScale(16),
    marginBottom: verticalScale(12),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: moderateScale(11), fontWeight: '500' },
  chartWrapper: { marginLeft: moderateScale(-8) },
  tooltip: {
    backgroundColor: '#3B6FD4',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: 8,
    marginBottom: verticalScale(4),
  },
  tooltipText: {
    color: '#fff',
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(12),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
  },
  weeklyText: { fontSize: moderateScale(12) },
  brandName: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: moderateScale(38),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(8),
    textAlign: 'right',
  },

  // ── Bottom Sheet ──────────────────────────────────────────────────────────
  bottomSheetBackground: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
  },
  bottomSheetIndicator: {
    backgroundColor: '#E0E4EF',
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
    borderBottomColor: '#F0F3FF',
    marginBottom: verticalScale(16),
  },
  quickActionsTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsContainer: {
    gap: 10,
    paddingBottom: verticalScale(14),
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(14),
  },
  quickActionIconWrap: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    flex: 1,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },

  // ── Feedback Modal ────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    padding: moderateScale(24),
    paddingBottom:
      Platform.OS === 'ios' ? moderateScale(40) : moderateScale(24),
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E4EF',
    alignSelf: 'center',
    marginBottom: verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '800',
    color: '#1A1D2E',
    marginBottom: verticalScale(5),
  },
  modalSub: {
    fontSize: moderateScale(13),
    color: '#9098B1',
    marginBottom: verticalScale(16),
    lineHeight: 19,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#EEF2FF',
    borderRadius: 14,
    padding: moderateScale(14),
    fontSize: moderateScale(14),
    color: '#1A1D2E',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F8FAFF',
    marginBottom: verticalScale(20),
  },
  modalBtns: { gap: 10 },
  modalBtn: {
    paddingVertical: verticalScale(14),
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnPrimary: { backgroundColor: '#3B6FD4' },
  modalBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  modalBtnSecondary: { backgroundColor: '#F0F3FB' },
  modalBtnSecondaryText: {
    color: '#1A1D2E',
    fontSize: moderateScale(15),
    fontWeight: '700',
  },

  emptyTaskGlow: {
    position: 'absolute',

    width: moderateScale(150),
    height: moderateScale(150),

    borderRadius: scale(90),

    top: -verticalScale(90),
  },

  emptyTaskIconWrap: {
    borderRadius: moderateScale(32),

    alignItems: 'center',
    justifyContent: 'center',

    // marginBottom: verticalScale(14),
  },

  emptyTaskTitle: {
    fontWeight: '800',

    fontSize: moderateScale(14),

    textAlign: 'center',

    marginBottom: verticalScale(8),
  },

  emptyTaskSubtitle: {
    fontSize: moderateScale(12),

    textAlign: 'center',

    width: '86%',

    lineHeight: moderateScale(16),
  },

  emptyTaskTagsRow: {
    flexDirection: 'row',

    alignItems: 'center',

    marginTop: verticalScale(12),

    gap: scale(10),

    flexWrap: 'wrap',

    justifyContent: 'center',
  },

  emptyTaskTag: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),

    borderRadius: moderateScale(20),

    gap: scale(6),
  },

  emptyTaskTagText: {
    fontSize: moderateScale(11),

    fontWeight: '700',
  },
});
export default Home;
