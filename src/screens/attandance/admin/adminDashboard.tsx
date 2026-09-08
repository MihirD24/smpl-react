import React, {
  useState,
  useEffect,
  useRef,
} from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppIcon from '../../../components/appIcon';

import {
  getStaffAttendanceData,
  getDashboardCount,
} from '../../../services/adminDashboardServices';

import NetInfoComponent from '../../../components/netinfoComponent';

/* =========================================================
   TYPES
   ========================================================= */

interface AttendanceItem {
  id: string;
  employeeId?: string | number;
  name?: string;
  avatar?: string;
  date?: string;
  inTime?: string;
  outTime?: string;
  lateEntry?: number;
  earlyExit?: number;
  extraTime?: string | number;
  status: string[];
  time: string[];
}

interface StatCard {
  id: number;
  label: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'orange' | 'red' | 'green';
  screen?: string;
}

/* =========================================================
   THEME
   ========================================================= */

const useTheme = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,

    colors: {
      pageBg: isDark ? '#0F172A' : '#F8FAFC',

      cardBg: isDark ? '#1E293B' : '#FFFFFF',

      cardBorder: isDark
        ? '#334155'
        : '#E2E8F0',

      subCardBg: isDark
        ? '#0F172A'
        : '#F1F5F9',

      textPrimary: isDark
        ? '#F1F5F9'
        : '#1E293B',

      textSecondary: isDark
        ? '#94A3B8'
        : '#64748B',

      textMuted: isDark
        ? '#64748B'
        : '#94A3B8',

      textDeepPrimary: isDark
        ? '#F8FAFC'
        : '#0F172A',

      accent: '#2563EB',

      avatarBg: '#3B82F6',

      statIconBg: isDark
        ? '#0F172A'
        : '#F1F5F9',

      badgePresent: '#DCFCE7',
      badgeLate: '#FEF3C7',
      badgeEarlyExit: '#FFE4E6',
      badgeLeave: '#DBEAFE',
      badgeWorking: '#DBEAFE',

      warning: '#F59E0B',
    },
  };
};

/* =========================================================
   HELPERS
   ========================================================= */

const formatMinutes = (
  value: string,
): string => {
  const minutes = parseInt(value, 10);

  if (Number.isNaN(minutes)) {
    return value;
  }

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hrs > 0 && mins > 0) {
    return `${hrs}hr ${mins}min`;
  }

  if (hrs > 0) {
    return `${hrs}hr`;
  }

  return `${mins}min`;
};

const formatPunchTime = (
  value?: string,
): string => {
  if (!value) {
    return '--';
  }

  const timeMatch = String(value).match(
    /\d{1,2}:\d{2}(?::\d{2})?\s?(AM|PM|am|pm)?/,
  );

  return timeMatch?.[0] ?? value;
};

const hasPositiveTime = (
  value: string | number | undefined,
): boolean => {
  return Number(value || 0) > 0;
};

/* =========================================================
   SKELETON
   ========================================================= */

const SkeletonBox: React.FC<{
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  isDark?: boolean;
}> = ({
  width = '100%',
  height = 14,
  borderRadius = 6,
  style,
  isDark = false,
}) => {
  const shimmer = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    const animation = Animated.loop(
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

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.75],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark
            ? '#334155'
            : '#CBD5E1',
          opacity,
        },
        style,
      ]}
    />
  );
};

/* =========================================================
   NO DATA
   ========================================================= */

const NoData: React.FC<{
  message?: string;
  icon?: string;
  isDark?: boolean;
}> = ({
  message = 'No data available',
  icon = 'Inbox',
  isDark = false,
}) => {
  return (
    <View style={styles.noDataContainer}>
      <View
        style={[
          styles.noDataIconWrap,
          {
            backgroundColor: isDark
              ? '#0F172A'
              : '#F1F5F9',
          },
        ]}
      >
        <AppIcon
          name={icon as any}
          size={26}
          color={
            isDark
              ? '#64748B'
              : '#94A3B8'
          }
        />
      </View>

      <Text
        style={[
          styles.noDataText,
          {
            color: isDark
              ? '#94A3B8'
              : '#94A3B8',
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

const AdminDashboard: React.FC = ({
  navigation,
}: any) => {
  const {
    isDark,
    colors,
  } = useTheme();

  const { width } =
    useWindowDimensions();

  /**
   * Responsive breakpoints
   */
  const isTablet = width >= 768;
  const isLargeTablet = width >= 1100;

  const [
    showAllAttendance,
    setShowAllAttendance,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    attendanceData,
    setAttendanceData,
  ] = useState<AttendanceItem[]>([]);

  const [
    statsCards,
    setStatsCards,
  ] = useState<StatCard[]>([]);

  const [
    loadingAttendance,
    setLoadingAttendance,
  ] = useState(true);

  const [
    loadingStats,
    setLoadingStats,
  ] = useState(true);

  /* =======================================================
     FETCH ATTENDANCE
     ======================================================= */

  const fetchAttendanceData =
    async () => {
      setLoadingAttendance(true);

      try {
        const response =
          await getStaffAttendanceData();

        console.log(
          'Attendance response:',
          response,
        );

        if (
          response?.attendance?.length
        ) {
          const formattedData: AttendanceItem[] =
            response.attendance.map(
              (
                item: any,
                index: number,
              ) => {
                const status: string[] =
                  [];

                const time: string[] =
                  [];

                if (
                  item.status
                    ?.toUpperCase() ===
                  'PRESENT'
                ) {
                  status.push(
                    'PRESENT',
                  );

                  time.push(
                    item.in_time || '',
                  );
                }

                if (
                  Number(
                    item.late_entry,
                  ) > 0
                ) {
                  status.push('LATE');

                  time.push(
                    `${item.late_entry} min`,
                  );
                }

                if (
                  Number(
                    item.early_exit,
                  ) > 0
                ) {
                  status.push(
                    'EARLY EXIT',
                  );

                  time.push(
                    `${item.early_exit} min`,
                  );
                }

                if (
                  item.status
                    ?.toUpperCase() ===
                  'ON LEAVE'
                ) {
                  status.push(
                    'ON LEAVE',
                  );

                  time.push('');
                }

                return {
                  id: `${item.employee_id}-${index}`,

                  employeeId:
                    item.employee_id,

                  name:
                    item.employee_name,

                  avatar:
                    item.employee_name
                      ?.split(' ')
                      ?.map(
                        (n: string) =>
                          n[0],
                      )
                      ?.join('')
                      ?.toUpperCase(),

                  date: item.date,

                  inTime:
                    item.in_time,

                  outTime:
                    item.out_time,

                  lateEntry:
                    item.late_entry,

                  earlyExit:
                    item.early_exit,

                  extraTime:
                    item.extra_time,

                  status,

                  time,
                };
              },
            );

          setAttendanceData(
            formattedData,
          );
        } else {
          setAttendanceData([]);
        }
      } catch (error) {
        console.error(
          'Attendance fetch error:',
          error,
        );

        setAttendanceData([]);
      } finally {
        setLoadingAttendance(
          false,
        );
      }
    };

  /* =======================================================
     FETCH DASHBOARD STATS
     ======================================================= */

  const fetchDashboardCount =
    async () => {
      setLoadingStats(true);

      try {
        const response =
          await getDashboardCount();

        console.log(
          'Dashboard response:',
          response,
        );

        if (response) {
          setStatsCards([
            {
              id: 1,
              label:
                'Pending Service Visits',
              value:
                response?.pendingServiceVisits ??
                0,
              icon: 'Users',
              color: 'blue',
            },

            {
              id: 2,
              label: 'Departments',
              value:
                response?.departmentsCount ??
                0,
              icon: 'Users',
              color: 'blue',
            },

            {
              id: 3,
              label: 'Designation',
              value:
                response?.designationsCount ??
                0,
              icon: 'Users',
              color: 'blue',
            },

            {
              id: 4,
              label: 'Employees',
              value:
                response?.employeesCount ??
                0,
              icon: 'Users',
              color: 'blue',
            },
          ]);
        } else {
          setStatsCards([]);
        }
      } catch (error) {
        console.error(
          'Dashboard count error:',
          error,
        );

        setStatsCards([]);
      } finally {
        setLoadingStats(false);
      }
    };

  /* =======================================================
     FETCH ALL DATA
     ======================================================= */

  const fetchAllData =
    async () => {
      await Promise.all([
        fetchAttendanceData(),
        fetchDashboardCount(),
      ]);
    };

  /**
   * Ref is used to avoid stale function
   * references in effects / refresh.
   */
  const fetchAllDataRef =
    useRef(fetchAllData);

  useEffect(() => {
    fetchAllDataRef.current =
      fetchAllData;
  });

  /**
   * Initial dashboard load
   */
  useEffect(() => {
    fetchAllDataRef.current();
  }, []);

  /* =======================================================
     REFRESH
     ======================================================= */

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchAllDataRef.current();
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     CARD COLORS
     ======================================================= */

  const getIconColor = (
    color: string,
  ): string => {
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

  const getBorderColor = (
    color: string,
  ): string => {
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

  /* =======================================================
     ATTENDANCE SUMMARY
     ======================================================= */

  const attendanceSummary = {
    present:
      attendanceData.filter(
        item =>
          item.status.includes(
            'PRESENT',
          ),
      ).length,

    late:
      attendanceData.filter(
        item =>
          item.status.includes(
            'LATE',
          ),
      ).length,

    leave:
      attendanceData.filter(
        item =>
          item.status.includes(
            'ON LEAVE',
          ),
      ).length,

    earlyExit:
      attendanceData.filter(
        item =>
          item.status.includes(
            'EARLY EXIT',
          ),
      ).length,
  };

  const visibleAttendance =
    showAllAttendance
      ? attendanceData
      : attendanceData.slice(0, 8);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <GestureHandlerRootView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.pageBg,
        },
      ]}
    >
      <NetInfoComponent
        onReconnect={onRefresh}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isTablet &&
            styles.scrollContentTablet,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
            progressBackgroundColor={
              colors.cardBg
            }
          />
        }
      >
        {/* =================================================
            MAIN RESPONSIVE CONTAINER
        ================================================= */}

        <View
          style={[
            styles.pageContainer,
            isTablet &&
              styles.pageContainerTablet,
            isLargeTablet &&
              styles.pageContainerLarge,
          ]}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.pageHeader}>
            <View>
              <Text
                style={[
                  styles.pageTitle,
                  {
                    color:
                      colors.textPrimary,
                  },
                ]}
              >
                Admin Dashboard
              </Text>

              <Text
                style={[
                  styles.pageDate,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {new Date().toLocaleDateString(
                  'en-US',
                  {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  },
                )}
              </Text>
            </View>
          </View>

          {/* =================================================
              STATS
          ================================================= */}

          {loadingStats ? (
            <View
              style={[
                styles.statsGrid,
                isTablet &&
                  styles.statsGridTablet,
              ]}
            >
              {[1, 2, 3, 4].map(
                item => (
                  <View
                    key={item}
                    style={[
                      styles.statCard,
                      isTablet &&
                        styles.statCardTablet,
                      {
                        backgroundColor:
                          colors.cardBg,

                        borderColor:
                          colors.cardBorder,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.statTopRow
                      }
                    >
                      <SkeletonBox
                        width={
                          isTablet
                            ? 48
                            : 44
                        }
                        height={
                          isTablet
                            ? 48
                            : 44
                        }
                        borderRadius={14}
                        isDark={
                          isDark
                        }
                      />

                      <SkeletonBox
                        width={48}
                        height={26}
                        borderRadius={6}
                        isDark={
                          isDark
                        }
                      />
                    </View>

                    <SkeletonBox
                      width="76%"
                      height={14}
                      borderRadius={5}
                      isDark={
                        isDark
                      }
                    />
                  </View>
                ),
              )}
            </View>
          ) : (
            <View
              style={[
                styles.statsGrid,
                isTablet &&
                  styles.statsGridTablet,
              ]}
            >
              {statsCards.map(
                (card: StatCard) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.statCard,
                      isTablet &&
                        styles.statCardTablet,
                      {
                        backgroundColor:
                          colors.cardBg,

                        borderColor:
                          getBorderColor(
                            card.color,
                          ),
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (
                        card.screen
                      ) {
                        navigation.navigate(
                          card.screen,
                        );
                      }
                    }}
                  >
                    <View
                      style={
                        styles.statTopRow
                      }
                    >
                      <View
                        style={[
                          styles.statIconWrap,
                          {
                            backgroundColor:
                              colors.statIconBg,
                          },
                        ]}
                      >
                        <AppIcon
                          name={
                            card.icon as any
                          }
                          size={
                            isTablet
                              ? 24
                              : 20
                          }
                          color={getIconColor(
                            card.color,
                          )}
                        />
                      </View>

                      <Text
                        style={[
                          styles.statValue,
                          {
                            color:
                              colors.textPrimary,
                          },
                        ]}
                      >
                        {card.value}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.statLabel,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {card.label}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          )}

          {/* =================================================
              ATTENDANCE CARD
          ================================================= */}

          {loadingAttendance ? (
            <View
              style={[
                styles.card,
                isTablet &&
                  styles.cardTablet,
                {
                  backgroundColor:
                    colors.cardBg,

                  borderColor:
                    colors.cardBorder,
                },
              ]}
            >
              <View
                style={
                  styles.cardHeader
                }
              >
                <View>
                  <SkeletonBox
                    width={
                      isTablet
                        ? 220
                        : 170
                    }
                    height={20}
                    isDark={
                      isDark
                    }
                  />

                  <SkeletonBox
                    width={140}
                    height={12}
                    style={{
                      marginTop: 7,
                    }}
                    isDark={
                      isDark
                    }
                  />
                </View>

                <SkeletonBox
                  width={60}
                  height={18}
                  isDark={
                    isDark
                  }
                />
              </View>

              <View
                style={[
                  styles.summaryGrid,
                  isTablet &&
                    styles.summaryGridTablet,
                ]}
              >
                {[1, 2, 3, 4].map(
                  item => (
                    <View
                      key={item}
                      style={[
                        styles.summaryItem,
                        isTablet &&
                          styles.summaryItemTablet,
                        {
                          backgroundColor:
                            colors.subCardBg,
                        },
                      ]}
                    >
                      <SkeletonBox
                        width={28}
                        height={24}
                        borderRadius={5}
                        isDark={
                          isDark
                        }
                      />

                      <SkeletonBox
                        width={48}
                        height={12}
                        borderRadius={4}
                        style={{
                          marginTop: 8,
                        }}
                        isDark={
                          isDark
                        }
                      />
                    </View>
                  ),
                )}
              </View>

              {[1, 2, 3].map(
                item => (
                  <View
                    key={item}
                    style={[
                      styles.skeletonRow,
                      {
                        borderBottomColor:
                          colors.cardBorder,
                      },
                    ]}
                  >
                    <SkeletonBox
                      width={44}
                      height={44}
                      borderRadius={22}
                      isDark={
                        isDark
                      }
                    />

                    <View
                      style={
                        styles.skeletonName
                      }
                    >
                      <SkeletonBox
                        width="68%"
                        height={14}
                        isDark={
                          isDark
                        }
                      />

                      <SkeletonBox
                        width="38%"
                        height={10}
                        style={{
                          marginTop: 5,
                        }}
                        isDark={
                          isDark
                        }
                      />
                    </View>

                    <SkeletonBox
                      width={72}
                      height={14}
                      isDark={
                        isDark
                      }
                    />

                    <SkeletonBox
                      width={72}
                      height={14}
                      isDark={
                        isDark
                      }
                    />
                  </View>
                ),
              )}
            </View>
          ) : (
            <View
              style={[
                styles.card,
                isTablet &&
                  styles.cardTablet,
                {
                  backgroundColor:
                    colors.cardBg,
                  borderColor:
                    colors.cardBorder,
                },
              ]}
            >
              {/* =================================================
                  CARD HEADER
              ================================================= */}

              <View
                style={
                  styles.cardHeader
                }
              >
                <View
                  style={
                    styles.cardHeaderText
                  }
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color:
                          colors.textPrimary,
                      },
                    ]}
                  >
                    Today's Attendance
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Attendance overview
                  </Text>
                </View>

                {attendanceData.length >
                  8 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      setShowAllAttendance(
                        previous =>
                          !previous,
                      )
                    }
                    style={
                      styles.viewAllButton
                    }
                  >
                    <Text
                      style={[
                        styles.viewAllText,
                        {
                          color:
                            colors.accent,
                        },
                      ]}
                    >
                      {showAllAttendance
                        ? 'Show Less'
                        : 'View All'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* =================================================
                  SUMMARY GRID
              ================================================= */}

              <View
                style={[
                  styles.summaryGrid,
                  isTablet &&
                    styles.summaryGridTablet,
                ]}
              >
                {[
                  {
                    label: 'Present',
                    value:
                      attendanceSummary.present,
                    color: '#16A34A',
                    bg: isDark
                      ? '#052E1B'
                      : '#F0FDF4',
                  },

                  {
                    label: 'Late',
                    value:
                      attendanceSummary.late,
                    color: '#D97706',
                    bg: isDark
                      ? '#3F2E05'
                      : '#FFFBEB',
                  },

                  {
                    label: 'Leave',
                    value:
                      attendanceSummary.leave,
                    color: '#2563EB',
                    bg: isDark
                      ? '#082F49'
                      : '#EFF6FF',
                  },

                  {
                    label: 'Early',
                    value:
                      attendanceSummary.earlyExit,
                    color: '#E11D48',
                    bg: isDark
                      ? '#4C0519'
                      : '#FFF1F2',
                  },
                ].map(item => (
                  <View
                    key={
                      item.label
                    }
                    style={[
                      styles.summaryItem,
                      isTablet &&
                        styles.summaryItemTablet,
                      {
                        backgroundColor:
                          item.bg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color:
                            item.color,
                        },
                      ]}
                    >
                      {item.value}
                    </Text>

                    <Text
                      style={[
                        styles.summaryLabel,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.85}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* =================================================
                  TABLE HEADER
              ================================================= */}

              {visibleAttendance.length >
                0 && (
                <View
                  style={[
                    styles.tableHeader,
                    {
                      borderBottomColor:
                        colors.cardBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tableHeaderText,
                      styles.employeeHeader,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Employee
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderText,
                      styles.timeHeader,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Check In
                  </Text>

                  <Text
                    style={[
                      styles.tableHeaderText,
                      styles.timeHeader,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    Check Out
                  </Text>
                </View>
              )}

              {/* =================================================
                  ATTENDANCE TABLE
              ================================================= */}

              <View
                style={
                  styles.attendanceTable
                }
              >
                {visibleAttendance.length >
                0 ? (
                  visibleAttendance.map(
                    item => {
                      const isLeave =
                        item.status.includes(
                          'ON LEAVE',
                        );

                      const isLate =
                        item.status.includes(
                          'LATE',
                        );

                      const isEarlyExit =
                        item.status.includes(
                          'EARLY EXIT',
                        );

                      const hasExtraTime =
                        hasPositiveTime(
                          item.extraTime,
                        );

                      const inNote =
                        isLeave
                          ? 'Leave'
                          : isLate
                          ? `Late ${formatMinutes(
                              String(
                                item.lateEntry ??
                                  0,
                              ),
                            )}`
                          : 'On time';

                      const outNote =
                        isLeave
                          ? '--'
                          : isEarlyExit
                          ? `Early ${formatMinutes(
                              String(
                                item.earlyExit ??
                                  0,
                              ),
                            )}`
                          : hasExtraTime
                          ? `Extra ${formatMinutes(
                              String(
                                item.extraTime ??
                                  0,
                              ),
                            )}`
                          : item.outTime
                          ? 'On time'
                          : '--';

                      const inNoteColor =
                        isLeave
                          ? '#2563EB'
                          : isLate
                          ? '#D97706'
                          : '#16A34A';

                      const outNoteColor =
                        isLeave
                          ? '#2563EB'
                          : isEarlyExit
                          ? '#E11D48'
                          : '#16A34A';

                      return (
                        <View
                          key={
                            item.id
                          }
                          style={[
                            styles.attendanceRow,
                            isTablet &&
                              styles.attendanceRowTablet,
                            {
                              borderBottomColor:
                                colors.cardBorder,
                            },
                          ]}
                        >
                          {/* Employee */}

                          <View
                            style={[
                              styles.employeeCell,
                              isTablet &&
                                styles.employeeCellTablet,
                            ]}
                          >
                            <View
                              style={[
                                styles.avatar,
                                isTablet &&
                                  styles.avatarTablet,
                                {
                                  backgroundColor:
                                    colors.avatarBg,
                                },
                              ]}
                            >
                              <Text
                                style={
                                  styles.avatarText
                                }
                              >
                                {item.avatar ||
                                  item.name?.charAt(
                                    0,
                                  ) ||
                                  '?'}
                              </Text>
                            </View>

                            <View
                              style={
                                styles.employeeInfo
                              }
                            >
                              <Text
                                style={[
                                  styles.employeeName,
                                  {
                                    color:
                                      colors.textPrimary,
                                  },
                                ]}
                                numberOfLines={1}
                              >
                                {item.name ||
                                  'Employee'}
                              </Text>

                              {item.employeeId !==
                                undefined &&
                                item.employeeId !==
                                  null && (
                                  <Text
                                    style={[
                                      styles.employeeId,
                                      {
                                        color:
                                          colors.textMuted,
                                      },
                                    ]}
                                    numberOfLines={
                                      1
                                    }
                                  >
                                    ID:{' '}
                                    {
                                      item.employeeId
                                    }
                                  </Text>
                                )}
                            </View>
                          </View>

                          {/* Check In */}

                          <View
                            style={
                              styles.timeCell
                            }
                          >
                            <Text
                              style={[
                                styles.timeValue,
                                {
                                  color:
                                    colors.textPrimary,
                                },
                              ]}
                              numberOfLines={
                                1
                              }
                            >
                              {formatPunchTime(
                                item.inTime,
                              )}
                            </Text>

                            <Text
                              style={[
                                styles.timeNote,
                                {
                                  color:
                                    inNoteColor,
                                },
                              ]}
                              numberOfLines={
                                1
                              }
                            >
                              {inNote}
                            </Text>
                          </View>

                          {/* Check Out */}

                          <View
                            style={
                              styles.timeCell
                            }
                          >
                            <Text
                              style={[
                                styles.timeValue,
                                {
                                  color:
                                    colors.textPrimary,
                                },
                              ]}
                              numberOfLines={
                                1
                              }
                            >
                              {formatPunchTime(
                                item.outTime,
                              )}
                            </Text>

                            <Text
                              style={[
                                styles.timeNote,
                                {
                                  color:
                                    outNoteColor,
                                },
                              ]}
                              numberOfLines={
                                1
                              }
                            >
                              {outNote}
                            </Text>
                          </View>
                        </View>
                      );
                    },
                  )
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
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     CONTAINER
  ======================================================= */

  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },

  scrollContentTablet: {
    paddingBottom: 48,
  },

  /* =======================================================
     PAGE
  ======================================================= */

  pageContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  pageContainerTablet: {
    maxWidth: 1024,
    paddingHorizontal: 32,
    paddingTop: 24,
  },

  pageContainerLarge: {
    maxWidth: 1200,
    paddingHorizontal: 40,
    paddingTop: 28,
  },

  /* =======================================================
     PAGE HEADER
  ======================================================= */

  pageHeader: {
    width: '100%',
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  pageDate: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 4,
  },

  /* =======================================================
     STATS GRID
  ======================================================= */

  statsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  statsGridTablet: {
    gap: 16,
    marginBottom: 24,
  },

  /* =======================================================
     STAT CARD
  ======================================================= */

  statCard: {
    width: '48%',
    minHeight: 132,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'space-between',
  },

  statCardTablet: {
    width: '48.7%',
    minHeight: 148,
    borderRadius: 20,
    padding: 20,
  },

  statTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statValue: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
  },

  statLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    paddingRight: 8,
  },

  /* =======================================================
     MAIN CARD
  ======================================================= */

  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },

  cardTablet: {
    borderRadius: 24,
    padding: 24,
  },

  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  cardHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
  },

  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 3,
  },

  viewAllButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginLeft: 12,
  },

  viewAllText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },

  /* =======================================================
     ATTENDANCE SUMMARY
  ======================================================= */

  summaryGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },

  summaryGridTablet: {
    gap: 12,
  },

  summaryItem: {
    flex: 1,
    minHeight: 74,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryItemTablet: {
    minHeight: 92,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  summaryValue: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },

  summaryLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 5,
    textAlign: 'center',
  },

  /* =======================================================
     TABLE HEADER
  ======================================================= */

  tableHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 2,
  },

  tableHeaderText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  employeeHeader: {
    flex: 2.2,
    paddingLeft: 56,
  },

  timeHeader: {
    flex: 1,
    textAlign: 'center',
  },

  /* =======================================================
     ATTENDANCE TABLE
  ======================================================= */

  attendanceTable: {
    width: '100%',
  },

  attendanceRow: {
    width: '100%',
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 9,
  },

  attendanceRowTablet: {
    minHeight: 78,
    paddingVertical: 12,
  },

  /* =======================================================
     EMPLOYEE CELL
  ======================================================= */

  employeeCell: {
    flex: 2.2,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },

  employeeCellTablet: {
    paddingRight: 20,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarTablet: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },

  employeeInfo: {
    flex: 1,
    minWidth: 0,
  },

  employeeName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },

  employeeId: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 2,
  },

  /* =======================================================
     TIME CELLS
  ======================================================= */

  timeCell: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  timeValue: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
  },

  timeNote: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'center',
  },

  /* =======================================================
     SKELETON
  ======================================================= */

  skeletonRow: {
    width: '100%',
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 10,
  },

  skeletonName: {
    flex: 1,
    minWidth: 0,
  },

  /* =======================================================
     NO DATA
  ======================================================= */

  noDataContainer: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },

  noDataIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  noDataText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AdminDashboard;