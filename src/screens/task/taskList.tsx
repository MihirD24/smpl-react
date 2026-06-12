import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  FlatList,
  View,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TaskCard from './taskCard';
import MainStyle from '../../assets/style/maincss';
import { getTaskByStatus } from '../../services';
import SearchBarComponent from '../../components/searchBarComponent';
import WorkLogCardSkeleton from '../../skeletonview/workLogSkeleton';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import AppIcon from '../../components/appIcon';
import AddButton from '../../components/button/addButton';
import FilterBottomSheet, {
  FilterBottomSheetHandle,
  ChipSection,
} from '../../components/filterBottomSheet/filterBottomSheet';
import ActiveFilterChips, {
  ActiveChip,
} from '../../components/filterBottomSheet/activeFilterChips';
import commonFilterStyles from '../../assets/style/commonFilter';
import ScreenWrapper from '../../components/screenWrapper';
import NetInfoComponent from '../../components/netinfoComponent';

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Working', value: 'Working' },
  { label: 'Completed', value: 'Completed By Developer' },
  { label: 'Re Open', value: 'Re Open' },
];

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

const applyClientFilters = (data: any[], filters: ActiveFilters): any[] => {
  let result = data;

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

const TaskList: React.FC<AppStackScreenProps<'TaskList'>> = ({
  navigation,
  route,
}) => {
  const MainStyles = MainStyle();
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const initialStatus = route.params?.task_status ?? 'Pending';
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);

  const [masterData, setMasterData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [loginUserRole, setLoginUserRole] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [activeFilters, setActiveFilters] =
    useState<ActiveFilters>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] =
    useState<ActiveFilters>(EMPTY_FILTERS);

  const filterSheetRef = useRef<FilterBottomSheetHandle>(null);
  const isFetchingRef = useRef(false);
  const fetchIdRef = useRef(0);

  const loadUserRole = async () => {
    const raw = await AsyncStorage.getItem('userInfo');
    if (raw) setLoginUserRole(JSON.parse(raw).role);
  };

  const chips: ActiveChip[] = [
    ...activeFilters.priorities.map(v => ({
      key: `p-${v}`,
      label: v,
      color: PRIORITY_OPTIONS.find(p => p.value === v)?.color,
      onRemove: () => removeFilter('priorities', v),
    })),

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

  const fetchTasks = useCallback(
    async (
      status: string,
      searchQuery: string,
      start: number,
      isRefresh: boolean,
      filtersToApply: ActiveFilters,
    ) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      const currentId = ++fetchIdRef.current;

      try {
        const { success, data } = await getTaskByStatus('byStatus', {
          status: status || undefined,
          search: searchQuery,
          taskCount: start,
        });

        if (currentId !== fetchIdRef.current) return;

        if (success && Array.isArray(data)) {
          const nextMaster = isRefresh ? data : [...masterData, ...data];

          if (isRefresh) {
            setMasterData(data);
            setCurrentOffset(data.length);
          } else {
            setMasterData(nextMaster);
            setCurrentOffset(prev => prev + data.length);
          }

          setDisplayData(applyClientFilters(nextMaster, filtersToApply));
          setHasMore(data.length >= PAGE_SIZE);
        } else {
          if (isRefresh) {
            setMasterData([]);
            setDisplayData([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        console.log('Error fetching tasks:', error);
        if (isRefresh) {
          setMasterData([]);
          setDisplayData([]);
        }
        setHasMore(false);
      } finally {
        if (currentId === fetchIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setIsLoadingMore(false);
          isFetchingRef.current = false;
        }
      }
    },
    [masterData],
  );

  const resetAndFetch = useCallback(
    (
      status: string,
      searchQuery: string,
      filtersToApply: ActiveFilters = activeFilters,
    ) => {
      fetchIdRef.current++;
      isFetchingRef.current = false;

      setLoading(true);
      setMasterData([]);
      setDisplayData([]);
      setCurrentOffset(0);
      setHasMore(true);

      fetchTasks(status, searchQuery, 0, true, filtersToApply);
    },
    [fetchTasks, activeFilters],
  );

  useEffect(() => {
    loadUserRole();
    resetAndFetch(initialStatus, '', EMPTY_FILTERS);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabNavigator', params: { screen: 'Home' } }],
        });
        return true;
      };
      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => sub.remove();
    }, [navigation]),
  );

  const handleTabChange = (status: string) => {
    if (status === selectedStatus) return;
    setSelectedStatus(status);
    setSearch('');
    setActiveFilters(EMPTY_FILTERS);
    setPendingFilters(EMPTY_FILTERS);
    resetAndFetch(status, '', EMPTY_FILTERS);
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.length >= 3 || text.length === 0) {
      resetAndFetch(selectedStatus, text);
    }
  };

  const handleLoadMore = () => {
    if (
      loading ||
      isLoadingMore ||
      isFetchingRef.current ||
      !hasMore ||
      masterData.length === 0
    )
      return;
    setIsLoadingMore(true);
    fetchTasks(selectedStatus, search, currentOffset, false, activeFilters);
  };

  const onRefresh = () => {
    if (isFetchingRef.current) return;
    setRefreshing(true);
    setCurrentOffset(0);
    setHasMore(true);
    fetchTasks(selectedStatus, search, 0, true, activeFilters);
  };

  const openFilterSheet = () => {
    setPendingFilters({ ...activeFilters });
    filterSheetRef.current?.expand();
  };

  const applySheetFilters = () => {
    filterSheetRef.current?.close();
    setActiveFilters(pendingFilters);
    setDisplayData(applyClientFilters(masterData, pendingFilters));
  };

  const resetSheetFilters = () => {
    filterSheetRef.current?.close();
    setPendingFilters(EMPTY_FILTERS);
    setActiveFilters(EMPTY_FILTERS);
    setDisplayData(applyClientFilters(masterData, EMPTY_FILTERS));
  };

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
      onToggle: togglePriority,
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
      onToggle: toggleTimeStatus,
    },
  ];

  const removeFilter = (key: keyof ActiveFilters, value: string) => {
    const next: ActiveFilters = {
      ...activeFilters,
      [key]: (activeFilters[key] as string[]).filter(x => x !== value),
    };
    setActiveFilters(next);
    setDisplayData(applyClientFilters(masterData, next));
  };

  const totalActive = countFilters(activeFilters);
  const hasActive = totalActive > 0;

  const renderItem = ({ item }: any) => (
    <TaskCard taskData={item} navigation={navigation} role={loginUserRole} />
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <AppIcon
          name="ClipboardList"
          size={moderateScale(48)}
          color="#CCCCCC"
        />
        <Text style={[MainStyles.noDataText, { marginTop: verticalScale(12) }]}>
          {search || hasActive
            ? 'Try adjusting your search or filters.'
            : 'No Data Found'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };
  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={fetchTasks} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[MainStyles.mainContainer, styles.root]}>
          {/* ── Search Bar + Filter Button ── */}
          <View style={commonFilterStyles.searchRow}>
            <View style={styles.searchFlex}>
              <SearchBarComponent onChangeText={handleSearch} value={search} />
            </View>
            <TouchableOpacity
              style={[
                commonFilterStyles.filterIconBtn,
                hasActive && commonFilterStyles.filterIconBtnActive,
              ]}
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
          <View style={styles.tabOuterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabWrapper}
              contentContainerStyle={styles.tabScroll}
            >
              {STATUS_TABS.map(tab => {
                const isActive = selectedStatus === tab.value;
                return (
                  <Pressable
                    key={tab.value}
                    onPress={() => handleTabChange(tab.value)}
                    style={[
                      styles.tab,
                      isActive
                        ? { backgroundColor: '#3B82F6' }
                        : isDarkMode
                        ? styles.tabInactiveDark
                        : styles.tabInactiveLight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        isDarkMode && !isActive && styles.tabLabelDark,
                        isActive && styles.tabLabelActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <ActiveFilterChips chips={chips} onClearAll={resetSheetFilters} />
          {loading && (
            <FlatList
              data={[1, 1, 1, 1, 1, 1]}
              keyExtractor={(_, i) => i.toString()}
              renderItem={() => <WorkLogCardSkeleton />}
              showsVerticalScrollIndicator={false}
            />
          )}
          {!loading && (
            <FlatList
              data={displayData}
              keyExtractor={(item, index) =>
                item?.work_log_id?.toString() ?? index.toString()
              }
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.4}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={renderEmpty}
              ListFooterComponent={renderFooter}
            />
          )}
          <AddButton onPress={() => navigation.navigate('AddTask')} />
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
};
export default TaskList;

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchFlex: { flex: 1 },
  tabOuterWrapper: {
    marginTop: verticalScale(1),
    marginBottom: verticalScale(10),
  },
  tabWrapper: { flexGrow: 0 },
  tabScroll: {
    paddingVertical: verticalScale(4),
    gap: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
  },
  tabInactiveLight: { backgroundColor: '#EEF2FF' },
  tabInactiveDark: { backgroundColor: '#2A2A3E' },
  tabLabel: {
    fontSize: moderateScale(13),
    fontFamily: 'PTSans-Regular',
    color: '#555',
    fontWeight: '500',
  },
  tabLabelDark: { color: '#AAA' },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'PTSans-Bold',
  },

  // listContent: { margin: moderateScale(-13) },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(200),
  },
  footerLoader: {
    paddingVertical: verticalScale(16),
    alignItems: 'center',
  },
});
