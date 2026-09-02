import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  useColorScheme,
} from 'react-native';
import MainStyle from '../../../assets/style/maincss';
import AppIcon from '../../../components/appIcon';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import ToastUtil from '../../../utils/toastAndroid';
import { AppStackScreenProps } from '../../../navigation/navigationTypes';
import SearchBarComponent from '../../../components/searchBarComponent';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ProjectRemainingCard, {
  ProjectRemaining,
  ProjectOption,
  ProjectRemainingStatus,
} from './projectRemainingCard';
import { getProjectRemainPoint } from '../../../services/projectRemainingService';
import { useIsFocused } from '@react-navigation/native';
import AddButton from '../../../components/button/addButton';
import FilterBottomSheet, {
  FilterBottomSheetHandle,
  StatusOption,
} from '../../../components/filterBottomSheet/filterBottomSheet';
import ActiveFilterChips, {
  ActiveChip,
} from '../../../components/filterBottomSheet/activeFilterChips';
import commonFilterStyles from '../../../assets/style/commonFilter';
import ScreenWrapper from '../../../components/screenWrapper';
import { updateStatusByType } from '../../../services/projectReminderService';
import NetInfoComponent from '../../../components/netinfoComponent';

// ─── Filter constants ─────────────────────────────────────────────────────────

const STATUS_OPTIONS: StatusOption<ProjectRemainingStatus>[] = [
  { label: 'Pending', color: '#F59E0B' },
  { label: 'Completed', color: '#10B981' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const CardSkeleton: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <View style={[sk.card, isDarkMode ? sk.cardDark : sk.cardLight]}>
    <View style={sk.row}>
      <View style={[sk.circle, isDarkMode ? sk.boneDark : sk.boneLight]} />
      <View style={{ flex: 1, marginLeft: moderateScale(10) }}>
        <View
          style={[
            sk.line,
            { width: '60%' },
            isDarkMode ? sk.boneDark : sk.boneLight,
          ]}
        />
        <View
          style={[
            sk.line,
            { width: '35%', marginTop: verticalScale(6) },
            isDarkMode ? sk.boneDark : sk.boneLight,
          ]}
        />
      </View>
      <View
        style={[
          sk.line,
          { width: moderateScale(70) },
          isDarkMode ? sk.boneDark : sk.boneLight,
        ]}
      />
    </View>
    <View style={[sk.divider, isDarkMode ? sk.boneDark : sk.boneLight]} />
    <View
      style={[
        sk.line,
        { width: '85%' },
        isDarkMode ? sk.boneDark : sk.boneLight,
      ]}
    />
    <View
      style={[
        sk.line,
        { width: '60%', marginTop: verticalScale(6) },
        isDarkMode ? sk.boneDark : sk.boneLight,
      ]}
    />
  </View>
);

const sk = StyleSheet.create({
  card: {
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    elevation: 2,
  },
  cardLight: { backgroundColor: '#FFFFFF', borderColor: '#F3F4F6' },
  cardDark: { backgroundColor: '#1E1E1E', borderColor: '#2E2E2E' },
  row: { flexDirection: 'row', alignItems: 'center' },
  circle: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
  },
  line: { height: verticalScale(12), borderRadius: moderateScale(6) },
  divider: { height: 1, marginVertical: verticalScale(10) },
  boneLight: { backgroundColor: '#E1E9EE' },
  boneDark: { backgroundColor: '#2A2A2A' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

const ProjectRemainingScreen: React.FC<
  AppStackScreenProps<'ProjectRemainingScreen'>
> = ({ navigation, route }) => {
  const MainStyles = MainStyle();
  const isDarkMode = useColorScheme() === 'dark';
  const isFocused = useIsFocused();

  // ── State ──────────────────────────────────────────────────────────────────
  const [masterData, setMasterData] = useState<ProjectRemaining[]>([]);
  const [filteredData, setFilteredData] = useState<ProjectRemaining[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<
    ProjectRemainingStatus[]
  >([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const filterSheetRef = useRef<FilterBottomSheetHandle>(null);

  const hasActiveFilters =
    selectedStatuses.length > 0 || selectedProjects.length > 0;
  const totalActiveFilters = selectedStatuses.length + selectedProjects.length;

  const handleMarkCompleted = async (
    projectRemainingPointId: number | string,
  ) => {
    try {
      const response = await updateStatusByType(
        projectRemainingPointId,
        'Completed',
        'ProjectRemainPoints',
      );
      if (response.success) {
        ToastUtil.success('Project remaining point marked as completed');
        loadData();
      } else
        ToastUtil.error(
          response.message ??
            'Failed to mark project remaining point as completed',
        );
    } catch (e) {
      console.error(e);
      ToastUtil.error('Failed to mark project remaining point as completed');
    }
  };

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      const response = await getProjectRemainPoint();
       console.log('API Response:', response);
      const list: ProjectRemaining[] = (response?.data ?? response ?? []).map(
        (item: any) => ({
          id: item.id,
          project: {
            id: item.project_id,
            name: item?.project?.project_name || '',
          },
          status: item.status,
          details: item.details,
          createdAt: item.created_at ?? item.createdAt ?? '',
          employees: (item.employees || item.employee_list || []).map(
            (emp: any) => ({
              id: emp.id,
              name: emp.name || emp.employee_name,
            }),
          ),
        }),
      );

      const uniqueProjects: ProjectOption[] = [];
      list.forEach(item => {
        if (
          !uniqueProjects.find(p => String(p.id) === String(item.project.id))
        ) {
          uniqueProjects.push(item.project);
        }
      });

      setMasterData(list);
      setFilteredData(list);
      setProjects(uniqueProjects);
    } catch (e) {
      console.error(e);
      ToastUtil.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [isFocused]);

  useEffect(() => {
    const newItem = route.params?.newItem as ProjectRemaining | undefined;
    if (newItem) {
      const updated = [newItem, ...masterData];
      setMasterData(updated);
      applyAllFilters(updated, search, selectedStatuses, selectedProjects);
      if (!projects.find(p => String(p.id) === String(newItem.project.id))) {
        setProjects(prev => [...prev, newItem.project]);
      }
      navigation.setParams({ newItem: undefined });
    }
  }, [route.params?.newItem]);

  // ── Filter logic ────────────────────────────────────────────────────────────
  const applyAllFilters = (
    data: ProjectRemaining[],
    searchText: string,
    statuses: ProjectRemainingStatus[],
    projectIds: string[],
  ) => {
    let result = data;
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        item =>
          item.project?.name?.toLowerCase().includes(q) ||
          item.status?.toLowerCase().includes(q) ||
          item.details?.toLowerCase().includes(q),
      );
    }
    if (statuses.length > 0)
      result = result.filter(item => statuses.includes(item.status));
    if (projectIds.length > 0)
      result = result.filter(item =>
        projectIds.includes(String(item.project?.id)),
      );
    setFilteredData(result);
  };

  const searchFilter = (text: string) => {
    setSearch(text);
    applyAllFilters(masterData, text, selectedStatuses, selectedProjects);
  };

  const toggleStatus = (val: string) => {
    const v = val as ProjectRemainingStatus;
    setSelectedStatuses(prev => {
      const next = prev.includes(v) ? prev.filter(s => s !== v) : [...prev, v];
      applyAllFilters(masterData, search, next, selectedProjects);
      return next;
    });
  };

  const toggleProject = (id: string) => {
    setSelectedProjects(prev => {
      const next = prev.includes(id)
        ? prev.filter(p => p !== id)
        : [...prev, id];
      applyAllFilters(masterData, search, selectedStatuses, next);
      return next;
    });
  };

  const applyFilters = () => {
    applyAllFilters(masterData, search, selectedStatuses, selectedProjects);
    filterSheetRef.current?.close();
  };

  const resetFilters = () => {
    setSelectedStatuses([]);
    setSelectedProjects([]);
    setFilteredData(masterData);
    filterSheetRef.current?.close();
  };

  // ── Active chips ────────────────────────────────────────────────────────────
  const activeChips: ActiveChip[] = [
    ...selectedStatuses.map(s => {
      const cfg = STATUS_OPTIONS.find(x => x.label === s)!;
      return {
        key: `status-${s}`,
        label: s,
        color: cfg.color,
        onRemove: () => {
          const next = selectedStatuses.filter(x => x !== s);
          setSelectedStatuses(next);
          applyAllFilters(masterData, search, next, selectedProjects);
        },
      };
    }),
    ...selectedProjects.map(id => {
      const p = projects.find(x => String(x.id) === id)!;
      return {
        key: `proj-${id}`,
        label: p?.name ?? id,
        onRemove: () => {
          const next = selectedProjects.filter(x => x !== id);
          setSelectedProjects(next);
          applyAllFilters(masterData, search, selectedStatuses, next);
        },
      };
    }),
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'}
    >
      <NetInfoComponent onReconnect={loadData} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={MainStyles.mainContainer}>
          {/* Search + Filter button */}
          <View style={commonFilterStyles.searchRow}>
            <View style={commonFilterStyles.searchWrapper}>
              <SearchBarComponent onChangeText={searchFilter} value={search} />
            </View>
            <TouchableOpacity
              style={[
                commonFilterStyles.filterIconBtn,
                isDarkMode
                  ? commonFilterStyles.filterIconBtnDark
                  : commonFilterStyles.filterIconBtnLight,
                hasActiveFilters && commonFilterStyles.filterIconBtnActive,
              ]}
              onPress={() => filterSheetRef.current?.expand()}
              activeOpacity={0.8}
            >
              <AppIcon
                name="ListFilter"
                size={moderateScale(20)}
                color={hasActiveFilters ? '#FFFFFF' : '#3B82F6'}
              />
              {totalActiveFilters > 0 && (
                <View style={commonFilterStyles.filterBadge}>
                  <Text style={commonFilterStyles.filterBadgeText}>
                    {totalActiveFilters}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Active filter chips bar */}
          <ActiveFilterChips chips={activeChips} onClearAll={resetFilters} />
          {/* List / Skeleton / Empty */}
          {loading ? (
            <FlatList
              contentContainerStyle={{
                padding: moderateScale(3),
                paddingBottom: verticalScale(90),
              }}
              data={[1, 2, 3]}
              keyExtractor={(_, i) => i.toString()}
              renderItem={() => <CardSkeleton isDarkMode={isDarkMode} />}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          ) : filteredData.length === 0 ? (
            <View style={MainStyles.noDataContainer}>
              <AppIcon
                name="FolderOpen"
                size={moderateScale(48)}
                color="#D1D5DB"
              />
              <Text
                style={[
                  MainStyles.noDataText,
                  { marginTop: verticalScale(12) },
                ]}
              >
                No Project Remaining Found
              </Text>
              <Text
                style={[
                  commonFilterStyles.noDataSub,
                  { color: isDarkMode ? '#6B7280' : '#9CA3AF' },
                ]}
              >
                {search || hasActiveFilters
                  ? 'No results match your filters'
                  : 'Tap the + button to add a new entry'}
              </Text>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={{
                padding: moderateScale(3),
                paddingBottom: verticalScale(90),
              }}
              data={filteredData}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <ProjectRemainingCard
                  item={item}
                  onMarkCompleted={handleMarkCompleted}
                />
              )}
              showsVerticalScrollIndicator={false}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
        </View>

        {/* FAB */}
        <AddButton
          onPress={() => navigation.navigate('AddProjectRemainingScreen')}
        />

        {/* Filter Bottom Sheet */}
        <FilterBottomSheet
          ref={filterSheetRef}
          snapPoints={['85%']}
          statusOptions={STATUS_OPTIONS}
          selectedStatuses={selectedStatuses}
          onToggleStatus={toggleStatus}
          chipSections={[
            {
              title: 'Project',
              items: projects.map(p => ({ id: String(p.id), name: p.name })),
              selectedIds: selectedProjects,
              onToggle: toggleProject,
            },
          ]}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
};

export default ProjectRemainingScreen;
