import React, {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../../navigation/navigationTypes';
import { getTaskByStatus } from '../../../../services/taskServices';
import TaskCard from '../../../task/taskCard';
import { TaskData } from '../../../../types/taskData';
import AppIcon from '../../../../components/appIcon';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import SearchBarComponent from '../../../../components/searchBarComponent';
import MainStyle from '../../../../assets/style/maincss';
import ModuleCardSkeleton from '../../../../skeletonview/moduleCardSkeleton';
import commonFilterStyles from '../../../../assets/style/commonFilter';
import ScreenWrapper from '../../../../components/screenWrapper';
import FilterBottomSheet, {
  FilterBottomSheetHandle,
  ChipSection,
} from '../../../../components/filterBottomSheet/filterBottomSheet';
import ActiveFilterChips, {
  ActiveChip,
} from '../../../../components/filterBottomSheet/activeFilterChips';
import NetInfoComponent from '../../../../components/netinfoComponent';

type Props = NativeStackScreenProps<AppStackParamList, 'ModuleTaskList'>;

const PAGE_SIZE = 10;

// ─── Filter constants ──────────────────────────────────────────────────────────
const PRIORITY_OPTIONS = [
  {
    label: 'High',
    value: 'High',
    color: '#E8640A',
    bg: '#FFF0E6',
    border: '#FFD5B0',
  },
  {
    label: 'Medium',
    value: 'Medium',
    color: '#F9A825',
    bg: '#FFF8E1',
    border: '#FFE082',
  },
  {
    label: 'Low',
    value: 'Low',
    color: '#43A047',
    bg: '#E8F5E9',
    border: '#C8E6C9',
  },
] as const;

const WORK_TYPE_OPTIONS = ['New Development', 'Bug Fix', 'Client Changes'];

const TIME_STATUS_OPTIONS = [
  {
    label: 'Target Met',
    value: 'target_met',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
  },
  {
    label: 'Over Time',
    value: 'over_time',
    color: '#DC2626',
    bg: '#FFF1F2',
    border: '#FECDD3',
  },
] as const;

type PriorityValue = 'High' | 'Medium' | 'Low';
type TimeStatusValue = 'target_met' | 'over_time';

interface ActiveFilters {
  priorities: PriorityValue[];
  workTypes: string[];
  timeStatuses: TimeStatusValue[];
}

const EMPTY_FILTERS: ActiveFilters = {
  priorities: [],
  workTypes: [],
  timeStatuses: [],
};

const countFilters = (f: ActiveFilters) =>
  f.priorities.length + f.workTypes.length + f.timeStatuses.length;

// ─── Client-side filter fn ─────────────────────────────────────────────────────
const applyClientFilters = (
  data: TaskData[],
  search: string,
  filters: ActiveFilters,
): TaskData[] => {
  let result = data;

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      t =>
        (t.project_work_module_name ?? '').toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q), // ← search by description too
    );
  }

  if (filters.priorities.length > 0) {
    result = result.filter(t =>
      filters.priorities.includes(t.priority as PriorityValue),
    );
  }

  if (filters.workTypes.length > 0) {
    result = result.filter(t => filters.workTypes.includes(t.work_type ?? ''));
  }

  if (filters.timeStatuses.length > 0) {
    result = result.filter(t => {
      if (t.status === 'Pending') return false;
      const isOver = (t.total_minutes ?? 0) - (t.estimated_minutes ?? 0) > 0;
      return (
        (filters.timeStatuses.includes('over_time') && isOver) ||
        (filters.timeStatuses.includes('target_met') && !isOver)
      );
    });
  }

  return result;
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function ModuleTaskList({ route, navigation }: Props) {
  const MainStyles = MainStyle();
  const { module_id } = route.params;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [taskCount, setTaskCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [masterData, setMasterData] = useState<TaskData[]>([]);
  const [displayData, setDisplayData] = useState<TaskData[]>([]);
  const [activeFilters, setActiveFilters] =
    useState<ActiveFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] =
    useState<ActiveFilters>(EMPTY_FILTERS);

  const filterSheetRef = useRef<FilterBottomSheetHandle>(null);

  // ── Core fetch (same logic as before, now also saves masterData) ────────────
  const fetchTasks = useCallback(
    async (opts: { reset?: boolean; searchVal?: string } = {}) => {
      const { reset = false, searchVal = search } = opts;
      const start = reset ? 0 : taskCount;

      if (reset) {
        setLoading(true);
        setTasks([]);
        setMasterData([]);
        setTaskCount(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const result = await getTaskByStatus('', {
          module_id,
        });

        if (result.success && Array.isArray(result.data)) {
          const incoming: TaskData[] = result.data;

          setTasks(prev => (reset ? incoming : [...prev, ...incoming]));

          // keep a full master copy for client-side filtering
          const nextMaster = reset ? incoming : [...masterData, ...incoming];
          setMasterData(nextMaster);
          setDisplayData(
            applyClientFilters(nextMaster, searchVal, activeFilters),
          );

          setTaskCount(prev =>
            reset ? incoming.length : prev + incoming.length,
          );
          setHasMore(incoming.length >= PAGE_SIZE);
        } else {
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [module_id, search, taskCount, activeFilters],
  );

  // Initial load (unchanged)
  useEffect(() => {
    fetchTasks({ reset: true });
  }, [module_id]);

  // Search debounce — client-side on masterData (also searches description)
  useEffect(() => {
    const t = setTimeout(() => {
      setDisplayData(applyClientFilters(masterData, search, activeFilters));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ── handlers (unchanged) ───────────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks({ reset: true });
  };
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) fetchTasks();
  };

  // ── Filter sheet helpers ────────────────────────────────────────────────────
  const openFilterSheet = () => {
    setPendingFilters({ ...activeFilters });
    filterSheetRef.current?.expand();
  };

  const applySheetFilters = () => {
    filterSheetRef.current?.close();
    setActiveFilters(pendingFilters);
    setDisplayData(applyClientFilters(masterData, search, pendingFilters));
  };

  const resetSheetFilters = () => {
    filterSheetRef.current?.close();
    setPendingFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setDisplayData(applyClientFilters(masterData, search, EMPTY_FILTERS));
  };

  // ── Pending toggles ─────────────────────────────────────────────────────────
  const togglePriority = (v: PriorityValue) =>
    setPendingFilters(p => ({
      ...p,
      priorities: p.priorities.includes(v)
        ? p.priorities.filter(x => x !== v)
        : [...p.priorities, v],
    }));

  const toggleWorkType = (v: string) =>
    setPendingFilters(p => ({
      ...p,
      workTypes: p.workTypes.includes(v)
        ? p.workTypes.filter(x => x !== v)
        : [...p.workTypes, v],
    }));

  const toggleTimeStatus = (v: TimeStatusValue) =>
    setPendingFilters(p => ({
      ...p,
      timeStatuses: p.timeStatuses.includes(v)
        ? p.timeStatuses.filter(x => x !== v)
        : [...p.timeStatuses, v],
    }));

  const chipSections: ChipSection[] = [
    {
      title: 'Priority',
      items: PRIORITY_OPTIONS.map(p => ({
        id: p.value,
        name: p.label,
      })),
      selectedIds: pendingFilters.priorities,
      onToggle: (id: string) => togglePriority(id as PriorityValue),
    },
    {
      title: 'Work Type',
      items: WORK_TYPE_OPTIONS.map(w => ({
        id: w,
        name: w,
      })),
      selectedIds: pendingFilters.workTypes,
      onToggle: toggleWorkType,
    },
    {
      title: 'Time Status',
      items: TIME_STATUS_OPTIONS.map(t => ({
        id: t.value,
        name: t.label,
      })),
      selectedIds: pendingFilters.timeStatuses,
      onToggle: (id: string) => toggleTimeStatus(id as TimeStatusValue),
    },
  ];

  // ── Remove individual active chip ───────────────────────────────────────────
  const removeFilter = (key: keyof ActiveFilters, value: string) => {
    const next: ActiveFilters = {
      ...activeFilters,
      [key]: (activeFilters[key] as string[]).filter(x => x !== value),
    };
    setActiveFilters(next);
    setDisplayData(applyClientFilters(masterData, search, next));
  };

  const totalActive = countFilters(activeFilters);
  const hasActive = totalActive > 0;

  // ── Empty / Footer (unchanged) ──────────────────────────────────────────────
  const ListEmpty = () =>
    loading ? null : (
      <View style={styles.emptyContainer}>
        <AppIcon
          name="ClipboardList"
          size={moderateScale(48)}
          color={isDarkMode ? '#444' : '#CCC'}
        />
        <Text style={[styles.emptyTitle, isDarkMode && styles.textDark]}>
          No tasks found
        </Text>
        <Text style={[styles.emptySubtitle, isDarkMode && styles.subtitleDark]}>
          {search || hasActive
            ? 'Try adjusting your search or filters.'
            : 'No work logs have been added to this module yet.'}
        </Text>
      </View>
    );

  const ListFooter = () =>
    loadingMore ? (
      <ActivityIndicator
        style={{ marginVertical: verticalScale(16) }}
        color={isDarkMode ? '#FFF' : '#000'}
      />
    ) : null;

  const chips: ActiveChip[] = [
    ...activeFilters.priorities.map(v => {
      const meta = PRIORITY_OPTIONS.find(p => p.value === v)!;
      return {
        key: `p-${v}`,
        label: v,
        color: meta.color,
        onRemove: () => removeFilter('priorities', v),
      };
    }),

    ...activeFilters.workTypes.map(v => ({
      key: `w-${v}`,
      label: v,
      color: '#7C3AED',
      onRemove: () => removeFilter('workTypes', v),
    })),

    ...activeFilters.timeStatuses.map(v => {
      const meta = TIME_STATUS_OPTIONS.find(t => t.value === v)!;
      return {
        key: `t-${v}`,
        label: meta.label,
        color: meta.color,
        onRemove: () => removeFilter('timeStatuses', v),
      };
    }),
  ];

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={fetchTasks} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={MainStyles.mainContainer}>
          {/* ── Search row + Filter button (same as StaffSalary pattern) ── */}
          <View style={commonFilterStyles.searchRow}>
            <View style={styles.searchFlex}>
              <SearchBarComponent onChangeText={setSearch} value={search} />
            </View>
            <TouchableOpacity
              style={[styles.filterBtn, hasActive && styles.filterBtnActive]}
              onPress={openFilterSheet}
              activeOpacity={0.8}
            >
              <AppIcon
                name="ListFilter"
                size={moderateScale(20)}
                color={hasActive ? '#FFFFFF' : '#3B82F6'}
              />
              {totalActive > 0 && (
                <View style={commonFilterStyles.filterBadge}>
                  <Text style={commonFilterStyles.filterBadgeText}>
                    {totalActive}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Active filter chips (same as StaffSalary pattern) ── */}
          <ActiveFilterChips chips={chips} onClearAll={resetSheetFilters} />

          {/* ── Content (same as before) ── */}
          {loading ? (
            <FlatList
              contentContainerStyle={{ padding: moderateScale(3), flex: 1 }}
              data={[1, 2, 3, 4]}
              keyExtractor={(_, index) => index.toString()}
              renderItem={() => <ModuleCardSkeleton />}
            />
          ) : (
            <FlatList
              data={displayData}
              keyExtractor={item =>
                String(item.work_log_id ?? item.id ?? Math.random())
              }
              renderItem={({ item }) => (
                <TaskCard
                  taskData={item}
                  navigation={navigation}
                  role="member"
                />
              )}
              ListEmptyComponent={ListEmpty}
              ListFooterComponent={ListFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.4}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <FilterBottomSheet
          ref={filterSheetRef}
          chipSections={chipSections}
          onApply={applySheetFilters}
          onReset={resetSheetFilters}
        />
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  searchFlex: { flex: 1 },
  filterBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(8),
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(10),
    paddingHorizontal: scale(40),
    paddingTop: verticalScale(200),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontFamily: 'PTSans-Bold',
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: verticalScale(8),
  },
  emptySubtitle: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
  textDark: { color: '#F0F0F0' },
  subtitleDark: { color: '#6B7280' },
});
