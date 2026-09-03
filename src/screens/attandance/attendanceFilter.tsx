import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import { AttendanceItem } from '../../types/adminAttendance';
import { getAttendance } from '../../services';
import AppIcon from '../../components/appIcon';
import MonthSelector from '../../components/monthSelector';
import ScreenWrapper from '../../components/screenWrapper';
import AttendanceCard from '../attandance/attendanceCard';
import { cardStyles, getCardTheme } from '../../assets/style/cardStyles'; // adjust path as needed
import NetInfoComponent from '../../components/netinfoComponent';

// ─── Scaling ───────────────────────────────────────────────────────────────────
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

type FilterType =
  | 'All'
  | 'Present'
  | 'Late'
  | 'Leave'
  | 'Overtime'
  | 'EarlyExit';

// ─── List Skeleton ─────────────────────────────────────────────────────────────
const ListSkeleton: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#2A2D38' : '#E1E9EE';
  const hlColor = isDark ? '#3A3D4A' : '#F2F8FC';
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(24),
      }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      <SkeletonPlaceholder
        backgroundColor={bgColor}
        highlightColor={hlColor}
        speed={1200}
      >
        {[0, 1, 2, 3, 4].map(i => (
          <SkeletonPlaceholder.Item
            key={i}
            marginHorizontal={scale(16)}
            marginBottom={verticalScale(10)}
            borderRadius={moderateScale(14)}
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
                  borderRadius={5}
                  marginBottom={verticalScale(6)}
                />
                <SkeletonPlaceholder.Item
                  width="75%"
                  height={moderateScale(12)}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
              <SkeletonPlaceholder.Item alignItems="flex-end">
                <SkeletonPlaceholder.Item
                  width={scale(32)}
                  height={moderateScale(9)}
                  borderRadius={3}
                  marginBottom={verticalScale(4)}
                />
                <SkeletonPlaceholder.Item
                  width={scale(64)}
                  height={moderateScale(12)}
                  borderRadius={4}
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
                width={scale(90)}
                height={verticalScale(22)}
                borderRadius={moderateScale(6)}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder>
    </ScrollView>
  );
};

// ─── Calendar Skeleton ─────────────────────────────────────────────────────────
const CalendarSkeleton: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const bgColor = isDark ? '#2A2D38' : '#E1E9EE';
  const hlColor = isDark ? '#3A3D4A' : '#F2F8FC';
  return (
    <ScrollView style={{ flex: 1 }} scrollEnabled={false}>
      <SkeletonPlaceholder
        backgroundColor={bgColor}
        highlightColor={hlColor}
        speed={1200}
      >
        <SkeletonPlaceholder.Item
          margin={scale(14)}
          borderRadius={moderateScale(14)}
          padding={moderateScale(14)}
        >
          <SkeletonPlaceholder.Item
            flexDirection="row"
            justifyContent="space-around"
            marginBottom={verticalScale(12)}
            paddingBottom={verticalScale(10)}
          >
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonPlaceholder.Item
                key={i}
                width={scale(28)}
                height={moderateScale(11)}
                borderRadius={3}
              />
            ))}
          </SkeletonPlaceholder.Item>
          {[0, 1, 2, 3, 4].map(wi => (
            <SkeletonPlaceholder.Item
              key={wi}
              flexDirection="row"
              justifyContent="space-around"
              marginBottom={verticalScale(6)}
            >
              {[0, 1, 2, 3, 4, 5, 6].map(di => (
                <SkeletonPlaceholder.Item
                  key={di}
                  width={scale(40)}
                  height={scale(44)}
                  borderRadius={moderateScale(7)}
                />
              ))}
            </SkeletonPlaceholder.Item>
          ))}
          <SkeletonPlaceholder.Item
            marginTop={verticalScale(17)}
            paddingTop={verticalScale(14)}
          >
            <SkeletonPlaceholder.Item
              width={scale(50)}
              height={moderateScale(11)}
              borderRadius={3}
              marginBottom={verticalScale(10)}
            />
            <SkeletonPlaceholder.Item flexDirection="row" flexWrap="wrap">
              {[0, 1, 2, 3].map(i => (
                <SkeletonPlaceholder.Item
                  key={i}
                  flexDirection="row"
                  alignItems="center"
                  width="45%"
                  marginBottom={verticalScale(8)}
                >
                  <SkeletonPlaceholder.Item
                    width={scale(14)}
                    height={scale(14)}
                    borderRadius={moderateScale(3)}
                    marginRight={scale(5)}
                  />
                  <SkeletonPlaceholder.Item
                    width={scale(44)}
                    height={moderateScale(11)}
                    borderRadius={3}
                  />
                </SkeletonPlaceholder.Item>
              ))}
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder>
    </ScrollView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AttendanceFilter: React.FC<AppStackScreenProps<'AttendanceFilter'>> = ({
  navigation,
  route,
}) => {
  const isFocused = useIsFocused();
  const onMonthChange = route.params?.onMonthChange;
  const isDarkMode = useColorScheme() === 'dark';

  const [monthYear, setMonthYear] = useState(
    route.params?.monthYear ?? moment().format('YYYY-MM'),
  );

  const handleMonthChange = (newMonth: string) => {
    setMonthYear(newMonth);
    onMonthChange?.(newMonth);
  };

  const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Use shared theme
  const theme = getCardTheme(isDarkMode);

  // Screen-level tokens not in shared theme
  const screenBg = isDarkMode ? '#111827' : '#F3F4F6';
  const sectionBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const legendSoft = isDarkMode ? '#0F172A' : '#F3F4F6';
  const calendarNumber = isDarkMode ? '#4d617e' : '#111827';

  const filters: FilterType[] = [
    'All',
    'Present',
    'Late',
    'Leave',
    'Overtime',
    'EarlyExit',
  ];

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={s.headerViewToggle}
          onPress={() =>
            setViewMode(v => (v === 'calendar' ? 'list' : 'calendar'))
          }
        >
          <AppIcon
            name={viewMode === 'calendar' ? 'List' : 'Calendar'}
            size={moderateScale(22)}
            color={isDarkMode ? '#93C5FD' : '#3B82F6'}
          />
        </TouchableOpacity>
      ),
    });
  }, [isDarkMode, navigation, viewMode]);

  const fetchAttendanceData = useCallback(async () => {
    setIsReady(false);
    try {
      const month = moment(monthYear, 'YYYY-MM').format('MM');
      const year = moment(monthYear, 'YYYY-MM').format('YYYY');
      const data = await getAttendance(month, year, 'user', null);
      const seen = new Set<string>();
      const deduped = data.filter((item: AttendanceItem) => {
        if (seen.has(item.date)) return false;
        seen.add(item.date);
        return true;
      });
      setAttendanceData(deduped);
    } catch {
      setAttendanceData([]);
    } finally {
      setIsReady(true);
    }
  }, [monthYear]);

  useEffect(() => {
    if (isFocused) fetchAttendanceData();
  }, [fetchAttendanceData, isFocused]);

  const getFilteredData = (): AttendanceItem[] => {
    if (selectedFilter === 'All') return attendanceData;
    return attendanceData.filter(item => {
      switch (selectedFilter) {
        case 'Present':
          return item.status === 'Present';
        case 'Late':
          return (
            item.status === 'Half Day' ||
            (item.status === 'Present' && (item.late_entry ?? 0) !== 0)
          );
        case 'Leave':
          return item.status === 'Paid Leave' || item.status === 'Leave';
        case 'Overtime':
          return (item.extra_time ?? 0) > 0;
        case 'EarlyExit':
          return (item.early_exit ?? 0) > 0;
        default:
          return true;
      }
    });
  };

  const getFilterColor = (f: FilterType): string =>
    ((
      {
        Present: '#10B981',
        Late: '#F59E0B',
        Leave: '#EF4444',
        Overtime: '#8B5CF6',
        EarlyExit: '#F97316',
      } as any
    )[f] ?? '#374151');

  const getFilterIcon = (f: FilterType): string =>
    ((
      {
        Present: 'CheckCircle',
        Late: 'Clock',
        Leave: 'Calendar',
        Overtime: 'TrendingUp',
        EarlyExit: 'LogOut',
      } as any
    )[f] ?? 'List');

  const getFilterLabel = (f: FilterType): string =>
    f === 'EarlyExit' ? 'Early Exit' : f;

  const getFilterCount = (f: FilterType): number => {
    if (f === 'All') return attendanceData.length;
    return attendanceData.filter(item => {
      switch (f) {
        case 'Present':
          return item.status === 'Present';
        case 'Late':
          return (
            item.status === 'Half Day' ||
            (item.status === 'Present' && (item.late_entry ?? 0) !== 0)
          );
        case 'Leave':
          return item.status === 'Paid Leave';
        case 'Overtime':
          return (item.extra_time ?? 0) > 0;
        case 'EarlyExit':
          return (item.early_exit ?? 0) > 0;
        default:
          return false;
      }
    }).length;
  };

  const getDaysInMonth = () => {
    const start = moment(monthYear, 'YYYY-MM').startOf('month');
    const end = moment(monthYear, 'YYYY-MM').endOf('month');
    const days: moment.Moment[] = [];
    for (let d = start.clone(); d.isSameOrBefore(end); d.add(1, 'day'))
      days.push(d.clone());
    return days;
  };

  const getAttendanceForDate = (date: moment.Moment) =>
    attendanceData.find(item => item.date === date.format('YYYY-MM-DD'));

  const getDayBgColor = (a?: AttendanceItem): string => {
    if (!a) return 'transparent';
    switch (a.status) {
      case 'Present':
        return '#D1FAE5';
      case 'Absent':
        return '#FEE2E2';
      case 'Half Day':
        return '#FEF3C7';
      case 'Paid Leave':
        return '#FEE2E2';
      default:
        return 'transparent';
    }
  };

  const getDayBorderColor = (a?: AttendanceItem): string => {
    if (!a) return theme.cardBorder;
    switch (a.status) {
      case 'Present':
        return '#10B981';
      case 'Absent':
        return '#EF4444';
      case 'Half Day':
        return '#F59E0B';
      case 'Paid Leave':
        return '#EF4444';
      default:
        return theme.cardBorder;
    }
  };

  const getDayIndicatorDots = (a?: AttendanceItem): string[] => {
    if (!a || a.status !== 'Present') return [];
    const dots: string[] = [];
    if ((a.late_entry ?? 0) !== 0) dots.push('#F59E0B');
    if ((a.extra_time ?? 0) > 0) dots.push('#8B5CF6');
    if ((a.early_exit ?? 0) > 0) dots.push('#F97316');
    return dots;
  };

  const renderCalendarView = () => {
    if (!isReady) return <CalendarSkeleton />;

    const days = getDaysInMonth();
    const weeks: moment.Moment[][] = [];
    let week: moment.Moment[] = [];

    for (let i = 0; i < days[0].day(); i++)
      week.push(moment().subtract(100, 'years'));
    days.forEach((day, idx) => {
      week.push(day);
      if (week.length === 7 || idx === days.length - 1) {
        while (week.length < 7) week.push(moment().add(100, 'years'));
        weeks.push(week);
        week = [];
      }
    });

    return (
      <ScrollView style={s.scrollContainer}>
      
        {/* ── Calendar Card uses shared cardStyles ── */}
        <View
          style={[
            cardStyles.cardWithMargin,
            isDarkMode ? cardStyles.cardDark : cardStyles.cardLight,
          ]}
        >
          {/* Weekday header */}
          <View style={s.weekDaysContainer}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <View key={d} style={s.weekDayCell}>
                <Text
                  style={[
                    s.weekDayText,
                    isDarkMode
                      ? cardStyles.textSecondaryDark
                      : cardStyles.textSecondaryLight,
                  ]}
                >
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          {weeks.map((wk, wi) => (
            <View key={wi} style={s.weekRow}>
              {wk.map((day, di) => {
                const isPlaceholder = day.year() < 2000 || day.year() > 2050;
                const attendance = !isPlaceholder
                  ? getAttendanceForDate(day)
                  : undefined;
                const isToday = day.isSame(moment(), 'day');
                const isFuture = day.isAfter(moment(), 'day');
                const dots = getDayIndicatorDots(attendance);
                return (
                  <TouchableOpacity
                    key={di}
                    style={[s.calendarDay, isPlaceholder && s.emptyDay]}
                    disabled={isPlaceholder || isFuture}
                    activeOpacity={0.7}
                  >
                    {!isPlaceholder && (
                      <View style={s.dayCell}>
                        <View
                          style={[
                            s.dayCircle,
                            {
                              backgroundColor: isToday
                                ? '#2563EB'
                                : isFuture
                                ? theme.cardBg
                                : getDayBgColor(attendance),
                              borderColor: isToday
                                ? '#2563EB'
                                : isFuture
                                ? theme.cardBorder
                                : getDayBorderColor(attendance),
                              borderWidth: attendance && !isToday ? 2 : 1,
                              opacity: isFuture ? 0.4 : 1,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              s.dayNumber,
                              { color: calendarNumber },
                              isFuture && s.futureDayText,
                              isToday && s.todayText,
                            ]}
                          >
                            {day.format('D')}
                          </Text>
                        </View>
                        {dots.length > 0 ? (
                          <View style={s.dotsRow}>
                            {dots.map((color, di2) => (
                              <View
                                key={di2}
                                style={[s.dot, { backgroundColor: color }]}
                              />
                            ))}
                          </View>
                        ) : (
                          <View style={s.dotsSpacer} />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Legend — uses shared divider */}
          <View
            style={[
              s.legendContainer,
              isDarkMode ? cardStyles.dividerDark : cardStyles.dividerLight,
            ]}
          >
            <Text
              style={[
                s.legendTitle,
                isDarkMode
                  ? cardStyles.textPrimaryDark
                  : cardStyles.textPrimaryLight,
              ]}
            >
              Legend
            </Text>
            <Text
              style={[
                s.legendSubtitle,
                isDarkMode
                  ? cardStyles.textMutedDark
                  : cardStyles.textMutedLight,
              ]}
            >
              Status
            </Text>
            <View style={s.legendGrid}>
              {[
                { label: 'Present', bg: '#D1FAE5', border: '#10B981' },
                { label: 'Leave', bg: '#FEE2E2', border: '#EF4444' },
              ].map(l => (
                <View key={l.label} style={s.legendItem}>
                  <View
                    style={[
                      s.legendDot,
                      { backgroundColor: l.bg, borderColor: l.border },
                    ]}
                  />
                  <Text
                    style={[
                      s.legendText,
                      isDarkMode
                        ? cardStyles.textSecondaryDark
                        : cardStyles.textSecondaryLight,
                    ]}
                  >
                    {l.label}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              style={[
                s.legendSubtitle,
                { marginTop: verticalScale(10) },
                isDarkMode
                  ? cardStyles.textMutedDark
                  : cardStyles.textMutedLight,
              ]}
            >
              Indicators
            </Text>
            <View style={s.legendGrid}>
              {[
                { label: 'Late arrival', color: '#F59E0B' },
                { label: 'Overtime', color: '#8B5CF6' },
                { label: 'Early exit', color: '#F97316' },
              ].map(l => (
                <View key={l.label} style={s.legendItem}>
                  <View
                    style={[s.legendIndicatorDot, { backgroundColor: l.color }]}
                  />
                  <Text
                    style={[
                      s.legendText,
                      isDarkMode
                        ? cardStyles.textSecondaryDark
                        : cardStyles.textSecondaryLight,
                    ]}
                  >
                    {l.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderListView = () => {
    if (!isReady) return <ListSkeleton />;
    const filteredData = getFilteredData();
    if (filteredData.length === 0) {
      return (
        <View style={s.centerContainer}>
          <AppIcon name="Calendar" size={moderateScale(56)} color="#D1D5DB" />
          <Text
            style={[
              s.emptyText,
              isDarkMode
                ? cardStyles.textPrimaryDark
                : cardStyles.textPrimaryLight,
            ]}
          >
            No records found
          </Text>
          <Text
            style={[
              s.emptySubtext,
              isDarkMode
                ? cardStyles.textSecondaryDark
                : cardStyles.textSecondaryLight,
            ]}
          >
            {selectedFilter !== 'All'
              ? `No ${getFilterLabel(
                  selectedFilter,
                ).toLowerCase()} records this month`
              : 'No attendance data available'}
          </Text>
        </View>
      );
    }
    return (
      <ScrollView
        style={s.listContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: verticalScale(10),
          paddingBottom: verticalScale(24),
        }}
      >
        {filteredData.map((item, index) => (
          <AttendanceCard
            key={item.id || index}
            attendanceData={item}
            isDarkMode={isDarkMode}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
        <NetInfoComponent onReconnect={fetchAttendanceData} />
      <View style={[s.container, { backgroundColor: screenBg }]}>
        {/* Month Selector */}
        <View
          style={[
            s.dateSelector,
            { backgroundColor: sectionBg, borderBottomColor: theme.cardBorder },
          ]}
        >
          <MonthSelector
            selectedMonthYear={monthYear}
            onMonthChange={handleMonthChange}
          />
        </View>

        {/* Filter chips (list mode only) */}
        {viewMode === 'list' && (
          <View
            style={[
              s.filterContainer,
              {
                backgroundColor: sectionBg,
                borderBottomColor: theme.cardBorder,
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterScrollContent}
            >
              {filters.map(filter => {
                const active = selectedFilter === filter;
                const color = getFilterColor(filter);
                const count = getFilterCount(filter);
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      s.filterChip,
                      active
                        ? { backgroundColor: color, borderColor: color }
                        : {
                            borderColor: theme.cardBorder,
                            backgroundColor: theme.cardBg,
                          },
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <AppIcon
                      name={getFilterIcon(filter)}
                      size={moderateScale(13)}
                      color={active ? '#FFFFFF' : color}
                    />
                    <Text
                      style={[
                        s.filterChipText,
                        active
                          ? { color: '#FFFFFF', fontWeight: '700' }
                          : isDarkMode
                          ? cardStyles.textSecondaryDark
                          : cardStyles.textSecondaryLight,
                      ]}
                    >
                      {getFilterLabel(filter)}
                    </Text>
                    {count > 0 && (
                      <View
                        style={[
                          s.filterBadge,
                          {
                            backgroundColor: active
                              ? 'rgba(255,255,255,0.3)'
                              : legendSoft,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.filterBadgeText,
                            active
                              ? { color: '#FFFFFF' }
                              : isDarkMode
                              ? cardStyles.textSecondaryDark
                              : cardStyles.textSecondaryLight,
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
      </View>
    </ScreenWrapper>
  );
};

export default AttendanceFilter;

// ─── Local-only styles (layout/structure that isn't in shared cardStyles) ─────
const s = StyleSheet.create({
  container: { flex: 1 },
  headerViewToggle: { padding: scale(7), marginRight: scale(7) },
  dateSelector: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(14),
    borderBottomWidth: 1,
  },
  filterContainer: {
    paddingVertical: verticalScale(9),
    borderBottomWidth: 1,
  },
  filterScrollContent: { paddingHorizontal: scale(16), gap: scale(7) },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(11),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(18),
    borderWidth: 1.5,
    gap: scale(4),
  },
  filterChipText: { fontSize: moderateScale(12), fontWeight: '600' },
  filterBadge: {
    minWidth: scale(17),
    height: scale(17),
    borderRadius: scale(8.5),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(3),
  },
  filterBadgeText: { fontSize: moderateScale(9.5), fontWeight: '700' },
  listContainer: { flex: 1 },
  scrollContainer: { flex: 1 },
  // Calendar-specific
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: verticalScale(10),
    paddingBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekDayCell: { flex: 1, alignItems: 'center' },
  weekDayText: { fontSize: moderateScale(11), fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginBottom: verticalScale(4) },
  calendarDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: verticalScale(2),
    paddingHorizontal: scale(1),
  },
  emptyDay: { opacity: 0 },
  dayCell: { alignItems: 'center', width: '100%' },
  dayCircle: {
    width: scale(34),
    height: scale(34),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayNumber: { fontSize: moderateScale(13), fontWeight: '600' },
  futureDayText: { color: '#9CA3AF' },
  todayText: { color: '#FFFFFF', fontWeight: '800' },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(2),
    marginTop: verticalScale(3),
    height: verticalScale(6),
  },
  dot: { width: scale(5), height: scale(5), borderRadius: scale(3) },
  dotsSpacer: { height: verticalScale(9) },
  legendContainer: {
    marginTop: verticalScale(17),
    paddingTop: verticalScale(14),
    borderTopWidth: 1,
   paddingHorizontal: scale(16),
  },
  legendTitle: {
    fontSize: moderateScale(12),
    fontWeight: '800',
    marginBottom: verticalScale(8),
  },
  legendSubtitle: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: verticalScale(6),
  },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(10) },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    width: '45%',
    marginBottom: verticalScale(4),
  },
  legendDot: {
    width: scale(14),
    height: scale(14),
    borderRadius: moderateScale(3),
    borderWidth: 2,
  },
  legendIndicatorDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  legendText: { fontSize: moderateScale(11) },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(34),
  },
  emptyText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginTop: verticalScale(13),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: moderateScale(13),
    marginTop: verticalScale(6),
    textAlign: 'center',
  },
});
