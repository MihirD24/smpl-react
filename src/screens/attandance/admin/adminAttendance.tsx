import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import {
  Text,
  RefreshControl,
  FlatList,
  View,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { moderateScale, scale } from 'react-native-size-matters';
import moment from 'moment';
import MainStyle from '../../../assets/style/maincss';
import AdminAttendanceCard from './adminAttendanceCard';
import AttandanceCardSkeleton from '../../../skeletonview/attandanceCardSkeleton';
import { getAttendance, getCount } from '../../../services';
import { AppStackScreenProps } from '../../../navigation/navigationTypes';
import {
  AttendanceCount,
  AttendanceItem,
} from '../../../types/adminAttendance';
import AppIcon from '../../../components/appIcon';
import FilterBottomSheet, {
  FilterBottomSheetHandle,
  StatusOption,
} from '../../../components/filterBottomSheet/filterBottomSheet';
import ActiveFilterChips, {
  ActiveChip,
} from '../../../components/filterBottomSheet/activeFilterChips';
import ScreenWrapper from '../../../components/screenWrapper';
import NetInfoComponent from '../../../components/netinfoComponent';
const ATTENDANCE_STATUS_OPTIONS: StatusOption[] = [
  { label: 'Present', color: '#10B981' },
  { label: 'Absent', color: '#EF4444' },
  { label: 'Half Day', color: '#F59E0B' },
  { label: 'Late', color: '#EAB308' },
  { label: 'On Leave', color: '#3B82F6' },
];
const STAFF_LIST_ITEMS = [
  { id: 'Mihir Vora', name: 'Mihir Vora' },
  { id: 'Chirag Sharma', name: 'Chirag Sharma' },
  { id: 'Rahul Mehta', name: 'Rahul Mehta' },
];

// ─── Theme helper ─────────────────────────────────────────────────────────────
const getTheme = (isDark: boolean) => ({
  // Page backgrounds
  pageBg: isDark ? '#0F172A' : '#F8FAFC',
  // Top card
  cardBg: isDark ? '#1E293B' : '#FFFFFF',
  cardBorder: isDark ? '#334155' : 'transparent',
  cardShadow: isDark ? 'transparent' : '#000',
  // Grid dividers inside card
  gridDivider: isDark ? '#334155' : '#E2E8F0',
  // Text
  dayText: isDark ? '#94A3B8' : '#64748B',
  dateText: isDark ? '#F1F5F9' : '#0F172A',
  sectionTitle: isDark ? '#94A3B8' : '#64748B',
  // Stats label
  statLabel: isDark ? '#94A3B8' : '#64748B',
  // List area
  listBg: isDark ? '#0F172A' : '#F8FAFC',
});

const AdminAttendancelist: React.FC<
  AppStackScreenProps<'AdminAttendancelist'>
> = ({ navigation }) => {
  const MainStyles = MainStyle();
  const isFocused = useIsFocused();
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  const [loginuserrole, setLoginuserrole] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(true);
  const [masterJobData, setMasterJobData] = useState<AttendanceItem[]>([]);
  const [filterJobData, setFilterJobData] = useState<AttendanceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [attandanceCount, setAttandanceCount] = useState<AttendanceCount>({
    total_present: 0,
    total_absent: 0,
    total_halfday: 0,
    total_paidleave: 0,
    total_late_time_in_min: 0,
    total_extra_time_in_min: 0,
    total_late_entry_count: 0,
    total_early_exit_count: 0,
    total_halfday_count: 0,
  });

  // ── Filter state ──
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  // ── Bottom sheet ref ──
  const filterSheetRef = useRef<FilterBottomSheetHandle>(null);

  // ─── Header button ────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => filterSheetRef.current?.expand()}
        >
          <AppIcon name="ListFilter" size={scale(18)} color="#3B82F6" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // ─── Data fetching ────────────────────────────────────────────────────────
  const loginUser = async () => {
    const userdata = await AsyncStorage.getItem('userInfo');
    if (userdata) {
      const parsed = JSON.parse(userdata);
      setLoginuserrole(parsed.role);
    }
  };

  const handleCheckAttandance = async (date: string) => {
    try {
      const data = await getAttendance(null, null, 'admin', date);
      setMasterJobData(data);
      setFilterJobData(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCheckCount = async (date: string) => {
    try {
      const data = await getCount(null, null, 'admin', date);
      setAttandanceCount(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAll = useCallback((date: moment.Moment) => {
    const formatted = date.format('YYYY-MM-DD');
    handleCheckAttandance(formatted);
    handleCheckCount(formatted);
  }, []);

  useEffect(() => {
    if (isFocused) {
      loginUser();
      loadAll(moment());
    }
  }, [isFocused]);

  // ─── Date navigation ──────────────────────────────────────────────────────
  const handleDateSelected = (date: moment.Moment) => {
    setSelectedDate(date);
    loadAll(date);
  };

  // ─── Filter helpers ───────────────────────────────────────────────────────
  const applyAllFilters = useCallback(
    (statuses: string[], staff: string[], data: AttendanceItem[]) => {
      let result = data;
      if (statuses.length > 0)
        result = result.filter(item =>
          statuses.includes(item.attendance_status),
        );
      if (staff.length > 0)
        result = result.filter(item =>
          staff.includes(item.get_user_detail?.name),
        );
      setFilterJobData(result);
    },
    [],
  );

  const toggleStatus = (val: string) => {
    setSelectedStatuses(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val],
    );
  };

  const toggleStaff = (id: string) => {
    setSelectedStaff(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id],
    );
  };

  const applyFilters = () => {
    let filtered = masterJobData;
    if (selectedStatuses.length > 0)
      filtered = filtered.filter(item =>
        selectedStatuses.includes(item.status),
      );
    if (selectedStaff.length > 0)
      filtered = filtered.filter(item =>
        selectedStaff.includes(item?.employee?.name),
      );
    setFilterJobData(filtered);
    filterSheetRef.current?.close();
  };

  const resetFilters = () => {
    setSelectedStatuses([]);
    setSelectedStaff([]);
    setFilterJobData(masterJobData);
    filterSheetRef.current?.close();
  };

  // ─── Active chips ──────────────────────────────────────────────────────────
  const activeChips: ActiveChip[] = [
    ...selectedStatuses.map(label => {
      const opt = ATTENDANCE_STATUS_OPTIONS.find(o => o.label === label);
      return {
        key: `status-${label}`,
        label,
        color: opt?.color,
        onRemove: () => {
          const next = selectedStatuses.filter(s => s !== label);
          setSelectedStatuses(next);
          applyAllFilters(next, selectedStaff, masterJobData);
        },
      };
    }),
    ...selectedStaff.map(name => ({
      key: `staff-${name}`,
      label: name,
      onRemove: () => {
        const next = selectedStaff.filter(s => s !== name);
        setSelectedStaff(next);
        applyAllFilters(selectedStatuses, next, masterJobData);
      },
    })),
  ];

  // ─── Render ────────────────────────────────────────────────────────────────
  const renderJobInfo: ListRenderItem<AttendanceItem> = ({ item }) => (
    <AdminAttendanceCard
      attendanceData={item}
      key={item.id}
      navigation={navigation}
      userrole={loginuserrole}
    />
  );

  // ── Stats grid config ──
  const statsGrid = [
    {
      label: 'PRESENT',
      value: attandanceCount?.total_present || 0,
      color: '#16A34A',
    },
    {
      label: 'LEAVE',
      value: attandanceCount?.total_paidleave || 0,
      color: '#EF4444',
    },
    {
      label: 'HALF DAY',
      value: attandanceCount?.total_halfday || 0,
      color: '#F97316',
    },
    {
      label: 'LATE',
      value: attandanceCount?.total_late_entry_count || 0,
      color: '#F59E0B',
    },
    {
      label: 'OVER TIME',
      value: attandanceCount?.total_over_time_count || 0,
      color: '#2563EB',
    },
    {
      label: 'EARLY EXIT',
      value: attandanceCount?.total_early_exit_count || 0,
      color: '#E11D48',
    },
  ];

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={theme.pageBg}
    >
        <NetInfoComponent onReconnect={handleCheckAttandance} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.root, { backgroundColor: theme.pageBg }]}>
          {/* ── Top section ── */}
          <View style={[styles.topSection, { backgroundColor: theme.pageBg }]}>
            {/* Date + Stats card */}
            <View
              style={[
                styles.attendanceCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                  borderWidth: isDark ? 1 : 0,
                  shadowColor: theme.cardShadow,
                  shadowOpacity: isDark ? 0 : 0.05,
                  elevation: isDark ? 0 : 4,
                },
              ]}
            >
              {/* Date navigation */}
              <View style={styles.dateHeader}>
                <TouchableOpacity
                  onPress={() =>
                    handleDateSelected(moment(selectedDate).subtract(1, 'day'))
                  }
                >
                  <AppIcon name="ChevronLeft" size={22} color="#3B82F6" />
                </TouchableOpacity>

                <View style={styles.dateCenter}>
                  <Text style={[styles.dayText, { color: theme.dayText }]}>
                    {selectedDate.format('dddd').toUpperCase()}
                  </Text>
                  <Text
                    style={[styles.dateTextMain, { color: theme.dateText }]}
                  >
                    {selectedDate.format('DD MMM, YYYY')}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    handleDateSelected(moment(selectedDate).add(1, 'day'))
                  }
                >
                  <AppIcon name="ChevronRight" size={22} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              {/* Stats grid */}
              <View
                style={[
                  styles.gridContainer,
                  { borderTopColor: theme.gridDivider },
                ]}
              >
                {statsGrid.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.gridItem,
                      { borderColor: theme.gridDivider },
                    ]}
                  >
                    <Text
                      style={[styles.gridLabel, { color: theme.statLabel }]}
                    >
                      {item.label}
                    </Text>
                    <Text style={[styles.gridValue, { color: item.color }]}>
                      {String(item.value).padStart(2, '0')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Section title */}
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: theme.sectionTitle }]}
              >
                STAFF ATTENDANCE
              </Text>
            </View>
          </View>

          {/* ── Active filter chips ── */}
          <ActiveFilterChips chips={activeChips} onClearAll={resetFilters} />

          {/* ── List ── */}
          <View style={[styles.bottomView, { backgroundColor: theme.listBg }]}>
            {loading && (
              <FlatList
                data={[1, 1, 1, 1, 1]}
                showsVerticalScrollIndicator={false}
                renderItem={() => <AttandanceCardSkeleton />}
              />
            )}
            {!loading && filterJobData.length === 0 && (
              <View style={MainStyles.noDataContainer}>
                <Text style={MainStyles.noDataText}>No Data</Text>
              </View>
            )}
            {!loading && filterJobData.length > 0 && (
              <FlatList
                data={filterJobData}
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderJobInfo}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => {
                      setRefreshing(true);
                      loadAll(selectedDate);
                    }}
                  />
                }
              />
            )}
          </View>
        </View>

        {/* ── Filter bottom sheet ── */}
        <FilterBottomSheet
          ref={filterSheetRef}
          snapPoints={['85%']}
          statusOptions={ATTENDANCE_STATUS_OPTIONS}
          selectedStatuses={selectedStatuses}
          onToggleStatus={toggleStatus}
          chipSections={[
            {
              title: 'Select Staff',
              items: STAFF_LIST_ITEMS,
              selectedIds: selectedStaff,
              onToggle: toggleStaff,
            },
          ]}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
  },
  topSection: {
    padding: moderateScale(13),
  },
  attendanceCard: {
    borderRadius: moderateScale(22),
    paddingVertical: moderateScale(20),
    shadowRadius: 10,
    elevation: 4,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(18),
  },
  dateCenter: { alignItems: 'center' },
  dayText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    letterSpacing: 1,
  },
  dateTextMain: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginTop: moderateScale(4),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
  },
  gridItem: {
    width: '33.33%',
    paddingVertical: moderateScale(18),
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  gridLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  gridValue: {
    fontSize: moderateScale(20),
    fontWeight: '700',
  },
  sectionHeader: { paddingTop: moderateScale(18) },
  sectionTitle: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: 1,
  },
  bottomView: {
    flex: 1,
  },
  listContent: {
    padding: moderateScale(18),
  },
});

export default AdminAttendancelist;
