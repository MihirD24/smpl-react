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
import ReminderCard, {
  ProjectReminder,
  Party,
  ReminderType,
  ReminderStatus,
} from './reminderCard';
import {
  getReminderList,
  getReminderTypeList,
  getPartyLists,
  updateStatusByType,
} from '../../../services/projectReminderService';
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
import NetInfoComponent from '../../../components/netinfoComponent';

// ─── Filter constants ─────────────────────────────────────────────────────────

const STATUS_OPTIONS: StatusOption<ReminderStatus>[] = [
  { label: 'Pending', color: '#F59E0B' },
  { label: 'Completed', color: '#10B981' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ReminderCardSkeleton: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <View style={[sk.card, isDark ? sk.cardDark : sk.cardLight]}>
    <View style={sk.row}>
      <View style={[sk.circle, isDark ? sk.boneDark : sk.boneLight]} />
      <View style={{ flex: 1, marginLeft: moderateScale(10) }}>
        <View
          style={[
            sk.line,
            { width: '60%' },
            isDark ? sk.boneDark : sk.boneLight,
          ]}
        />
        <View
          style={[
            sk.line,
            { width: '40%', marginTop: verticalScale(6) },
            isDark ? sk.boneDark : sk.boneLight,
          ]}
        />
      </View>
      <View
        style={[
          sk.line,
          { width: moderateScale(60) },
          isDark ? sk.boneDark : sk.boneLight,
        ]}
      />
    </View>
    <View style={[sk.divider, isDark ? sk.boneDark : sk.boneLight]} />
    <View
      style={[sk.line, { width: '80%' }, isDark ? sk.boneDark : sk.boneLight]}
    />
    <View
      style={[
        sk.line,
        { width: '55%', marginTop: verticalScale(6) },
        isDark ? sk.boneDark : sk.boneLight,
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

const ProjectReminderScreen: React.FC<
  AppStackScreenProps<'ProjectReminder'>
> = ({ navigation, route }) => {
  const MainStyles = MainStyle();
  const isDark = useColorScheme() === 'dark';
  const isFocused = useIsFocused();

  // ── State ──────────────────────────────────────────────────────────────────
  const [masterData, setMasterData] = useState<ProjectReminder[]>([]);
  const [filteredData, setFilteredData] = useState<ProjectReminder[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [reminderTypes, setReminderTypes] = useState<ReminderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ReminderStatus[]>(
    [],
  );
const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [selectedReminderTypes, setSelectedReminderTypes] = useState<string[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState(false);

  const filterSheetRef = useRef<FilterBottomSheetHandle>(null);

  const hasActiveFilters =
    selectedStatuses.length > 0 ||
     !!selectedParty ||
    selectedReminderTypes.length > 0;

  const totalActiveFilters =
    selectedStatuses.length +
     (selectedParty ? 1 : 0) +
    selectedReminderTypes.length;

  const handleMarkCompleted = async (reminderId: number | string) => {
    try {
      const response = await updateStatusByType(
        reminderId,
        'Completed',
        'Reminder',
      );
      if (response.success) {
        ToastUtil.success('Reminder marked as completed');
        loadData();
      } else
        ToastUtil.error(
          response.message ?? 'Failed to mark reminder as completed',
        );
    } catch (e) {
      console.error(e);
      ToastUtil.error('Failed to mark reminder as completed');
    }
  };

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      const [remRes, partyRes, typeRes] = await Promise.all([
        getReminderList(),
        getPartyLists(),
        getReminderTypeList(),
      ]);
      if (remRes.success) {
        setMasterData(remRes.data);
        setFilteredData(remRes.data);
      } else ToastUtil.error(remRes.message ?? 'Failed to load reminders');
      if (partyRes.success) setParties(partyRes.data);
      if (typeRes.success) setReminderTypes(typeRes.data);
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
    const newReminder = route.params?.newReminder as
      | ProjectReminder
      | undefined;
    if (newReminder) {
      const updated = [newReminder, ...masterData];
      setMasterData(updated);
      applyAllFilters(
        updated,
        search,
        selectedStatuses,
        selectedParty,
        selectedReminderTypes,
      );
      navigation.setParams({ newReminder: undefined });
    }
  }, [route.params?.newReminder]);

  // ── Filter logic ────────────────────────────────────────────────────────────
  const applyAllFilters = (
    data: ProjectReminder[],
    searchText: string,
    statuses: ReminderStatus[],
    partyIds: string | null, 
    typeIds: string[],
  ) => {
    let result = data;
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        item =>
          item.party?.name?.toLowerCase().includes(q) ||
          item.reminderType?.name?.toLowerCase().includes(q) ||
          item.status?.toLowerCase().includes(q) ||
          item.remarks?.toLowerCase().includes(q),
      );
    }
    if (statuses.length > 0)
      result = result.filter(item => statuses.includes(item.status));
    if (partyIds)
      result = result.filter(item => String(item.party?.id) === partyIds);
    if (typeIds.length > 0)
      result = result.filter(item =>
        typeIds.includes(String(item.reminderType?.id)),
      );
    setFilteredData(result);
  };

const searchFilter = (text: string) => {
  setSearch(text);
  applyAllFilters(masterData, text, selectedStatuses, selectedParty, selectedReminderTypes);
};

 const toggleStatus = (val: string) => {
  const v = val as ReminderStatus;
  setSelectedStatuses(prev => {
    const next = prev.includes(v) ? prev.filter(s => s !== v) : [...prev, v];
    applyAllFilters(masterData, search, next, selectedParty, selectedReminderTypes);
    return next;
  });
};

  const toggleParty = (id: string) => {
    setSelectedParty(prev => {  
      const next = prev === id
        ? null : id;  
      applyAllFilters(
        masterData,
        search,
        selectedStatuses,
        next,
        selectedReminderTypes,
      );
      return next;
    });
  };

 const toggleReminderType = (id: string) => {
  setSelectedReminderTypes(prev => {
    const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id];
    applyAllFilters(masterData, search, selectedStatuses, selectedParty, next);
    return next;
  });
};

  const applyFilters = () => {
  applyAllFilters(masterData, search, selectedStatuses, selectedParty, selectedReminderTypes);
  filterSheetRef.current?.close();
};
  const resetFilters = () => {
    setSelectedStatuses([]);
    setSelectedParty(null);
    setSelectedReminderTypes([]);
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
          applyAllFilters(
            masterData,
            search,
            next,
            selectedParty,
            selectedReminderTypes,
          );
        },
      };
    }),
      ...(selectedParty
    ? [{
        key: `party-${selectedParty}`,
        label: parties.find(p => String(p.id) === selectedParty)?.name ?? selectedParty,
        onRemove: () => setSelectedParty(null),
      }]
    : []),
   ...selectedReminderTypes.map(id => {
    const t = reminderTypes.find(x => String(x.id) === id)!;
    return {
      key: `type-${id}`,
      label: t?.name ?? id,
      onRemove: () => {
        const next = selectedReminderTypes.filter(x => x !== id);
        setSelectedReminderTypes(next);
        applyAllFilters(masterData, search, selectedStatuses, selectedParty, next);
      },
    };
  }),
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        translucent
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <NetInfoComponent onReconnect={loadData} />
      <View style={MainStyles.mainContainer}>
        {/* Search + Filter button */}
        <View style={commonFilterStyles.searchRow}>
          <View style={commonFilterStyles.searchWrapper}>
            <SearchBarComponent onChangeText={searchFilter} value={search} />
          </View>
          <TouchableOpacity
            style={[
              commonFilterStyles.filterIconBtn,
              isDark
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
            renderItem={() => <ReminderCardSkeleton isDark={isDark} />}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : filteredData.length === 0 ? (
          <View style={MainStyles.noDataContainer}>
            <AppIcon name="BellOff" size={moderateScale(48)} color="#D1D5DB" />
            <Text
              style={[MainStyles.noDataText, { marginTop: verticalScale(12) }]}
            >
              No Reminders Found
            </Text>
            <Text
              style={[
                commonFilterStyles.noDataSub,
                { color: isDark ? '#6B7280' : '#9CA3AF' },
              ]}
            >
              {search || hasActiveFilters
                ? 'No results match your filters'
                : 'Tap the + button to add a new reminder'}
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
              <ReminderCard item={item} onMarkCompleted={handleMarkCompleted} />
            )}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>

      {/* FAB */}
      <AddButton
        onPress={() =>
          navigation.navigate('AddProjectReminder', { parties, reminderTypes })
        }
      />

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        ref={filterSheetRef}
        snapPoints={['90%']}
        statusOptions={STATUS_OPTIONS}
        selectedStatuses={selectedStatuses}
        onToggleStatus={toggleStatus}
        dropdownSections={[          // ✅ NEW
    {
      title: 'Party',
      items: parties.map(p => ({ id: String(p.id), name: p.name })),
      selectedId: selectedParty,
      onSelect: setSelectedParty,
      placeholder: 'Search & select party...',
    },
  ]}
  chipSections={[              // ✅ Party removed
    {
      title: 'Reminder Type',
      items: reminderTypes.map(t => ({ id: String(t.id), name: t.name })),
      selectedIds: selectedReminderTypes,
      onToggle: toggleReminderType,
    },
  ]}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </GestureHandlerRootView>
  );
};

export default ProjectReminderScreen;
