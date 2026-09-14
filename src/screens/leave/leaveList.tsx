import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  View,
  StyleSheet,
  Dimensions,
  BackHandler,
  useColorScheme,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LeaveRequestCard from './leaveRquestCard';
import { AuthContext } from '../../context/authContext';
import SearchBarComponent from '../../components/searchBarComponent';
import LeaveCardSkeleton from '../../skeletonview/leaveCardSkeleton';
import { getLeaveRequest } from '../../services';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import AppIcon from '../../components/appIcon';
import { LeaveData } from '../../types/leave';
import MainStyle from '../../assets/style/maincss';
import AddButton from '../../components/button/addButton';
import FilterBottomSheet, {
  FilterBottomSheetHandle,
  StatusOption,
} from '../../components/filterBottomSheet/filterBottomSheet';
import ActiveFilterChips, {
  ActiveChip,
} from '../../components/filterBottomSheet/activeFilterChips';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import commonFilterStyles from '../../assets/style/commonFilter';
import ScreenWrapper from '../../components/screenWrapper';
import NetInfoComponent from '../../components/netinfoComponent';
import ModuleIntro from '../../components/moduleIntro';
import { BRAND } from '../../assets/style/brandTheme';

// ─── Responsive scaling ──────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const scale = (size: number): number => (SCREEN_WIDTH / DESIGN_WIDTH) * size;

// ─── Constants ───────────────────────────────────────────────────────────────
const LEAVE_STATUS_OPTIONS: StatusOption[] = [
  { label: 'Pending', color: '#F59E0B' },
  { label: 'Approved', color: '#10B981' },
  { label: 'Rejected', color: '#EF4444' },
];

// Map label → numeric value expected by the API
const STATUS_LABEL_TO_VALUE: Record<string, number> = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
};
const LEAVE_TYPE_ITEMS = [
  'Sick leave',
  'Casual leave',
  'Study leave',
  'Maternity leave',
].map(t => ({ id: t, name: t }));

// ─── Component ───────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, icon, tone, dark }: {
  label: string; value: number; icon: string; tone: string; dark: boolean;
}) => (
  <View style={[styles.summaryCard, { backgroundColor: dark ? '#172033' : '#FFFFFF', borderColor: dark ? '#273449' : '#E2E8F0' }]}>
    <View style={[styles.summaryIcon, { backgroundColor: `${tone}18` }]}>
      <AppIcon name={icon} size={moderateScale(16)} color={tone} />
    </View>
    <View style={styles.summaryCopy}>
      <Text style={[styles.summaryValue, { color: dark ? '#F8FAFC' : '#0F172A' }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: dark ? '#94A3B8' : '#64748B' }]}>{label}</Text>
    </View>
  </View>
);

const LeaveList: React.FC<AppStackScreenProps<'LeaveList'>> = ({
  navigation,
}) => {
  const isFocused = useIsFocused();
  const { userInfo } = useContext(AuthContext);
  const MainStyles = MainStyle();
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    text: isDarkMode ? '#F9FAFB' : '#1E293B',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
    softBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    border: isDarkMode ? '#334155' : '#E2E8F0',
  };


  const [loginType, setLoginType] = useState(userInfo.role);
  const [loginuserrole, setLoginuserrole] = useState(userInfo.role);
  const [loginuserId, setLoginuserId] = useState(userInfo.id);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [masterJobData, setMasterJobData] = useState<LeaveData[]>([]);
  const [filterJobData, setFilterJobData] = useState<LeaveData[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState<string[]>([]);
  const filterSheetRef = useRef<FilterBottomSheetHandle>(null);

  const isAdmin = loginuserrole === 'Owner';
  const hasActiveFilters =
    selectedStatuses.length > 0 || selectedLeaveTypes.length > 0;
  const totalActiveFilters =
    selectedStatuses.length + selectedLeaveTypes.length;

  // ── Data fetching ─────────────────────────────────────────────────────────
  const handleLeaveData = async (userId?: string) => {
    try {
      setRefreshing(true);
      const userdata = await AsyncStorage.getItem('userInfo');
      if (!userdata) return;
      const parsed = JSON.parse(userdata);
      const userIdToUse = userId || parsed.id;
      const leaveData = await getLeaveRequest(userIdToUse);
      setMasterJobData(leaveData);
      applyAllFilters(leaveData, search, selectedStatuses, selectedLeaveTypes);
    } catch (e) {
      console.error('Error fetching leave data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loginUser = async () => {
    try {
      const userdata = await AsyncStorage.getItem('userInfo');
      if (!userdata) return;
      const parsed = JSON.parse(userdata);
      setLoginuserrole(parsed.role);
      setLoginuserId(parsed.id);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  };

  useEffect(() => {
    loginUser();
  }, []);
  useEffect(() => {
    if (isFocused && loginuserId) handleLeaveData(loginuserId);
  }, [isFocused, loginuserId]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          const tabNavigator =
            loginuserrole === 'Owner' ? 'AdminTabNavigator' : 'TabNavigator';
          navigation.reset({
            index: 0,
            routes: [{ name: tabNavigator, params: { screen: 'Profile' } }],
          });
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => sub.remove();
    }, [navigation, userInfo.role]),
  );

  // ── Filter logic ──────────────────────────────────────────────────────────
  const applyAllFilters = (
    data: LeaveData[],
    searchText: string,
    statuses: string[], // label strings e.g. 'Pending'
    leaveTypes: string[],
  ) => {
    let result = data;

    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        item =>
          (item.reason || '').toLowerCase().includes(q) ||
          (item?.get_staff_detail?.name || '').toLowerCase().includes(q) ||
          (item?.type || '').toLowerCase().includes(q),
      );
    }

    if (statuses.length > 0) {
      const numericStatuses = statuses.map(s => STATUS_LABEL_TO_VALUE[s]);
      result = result.filter(item =>
        numericStatuses.includes(item.status),
      );
    }

    if (leaveTypes.length > 0) {
      result = result.filter(item => leaveTypes.includes(item.type));
    }

    setFilterJobData(result);
  };

  const searchFilter = (text: string) => {
    setSearch(text);
    applyAllFilters(masterJobData, text, selectedStatuses, selectedLeaveTypes);
  };

  const toggleStatus = (val: string) =>
    setSelectedStatuses(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val],
    );

  const toggleLeaveType = (id: string) =>
    setSelectedLeaveTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id],
    );

  const resetFilters = () => {
    setSelectedStatuses([]);
    setSelectedLeaveTypes([]);
    setFilterJobData(masterJobData);
    filterSheetRef.current?.close();
  };

  const applyFilters = () => {
    applyAllFilters(
      masterJobData,
      search,
      selectedStatuses,
      selectedLeaveTypes,
    );
    filterSheetRef.current?.close();
  };

  // ── Build ActiveChip array for the chip bar ───────────────────────────────
  const activeChips: ActiveChip[] = [
    ...selectedStatuses.map(label => {
      const opt = LEAVE_STATUS_OPTIONS.find(o => o.label === label);
      return {
        key: `status-${label}`,
        label,
        color: opt?.color,
        onRemove: () => {
          const next = selectedStatuses.filter(s => s !== label);
          setSelectedStatuses(next);
          applyAllFilters(masterJobData, search, next, selectedLeaveTypes);
        },
      };
    }),
    ...selectedLeaveTypes.map(t => ({
      key: `type-${t}`,
      label: t,
      onRemove: () => {
        const next = selectedLeaveTypes.filter(x => x !== t);
        setSelectedLeaveTypes(next);
        applyAllFilters(masterJobData, search, selectedStatuses, next);
      },
    })),
  ];

  const leaveSummary = {
    total: masterJobData.length,
    pending: masterJobData.filter(item => item.status === 0).length,
    approved: masterJobData.filter(item => item.status === 1).length,
    rejected: masterJobData.filter(item => item.status === 2).length,
  };

  const onRefresh = () => handleLeaveData(loginuserId);

  const renderJobInfo = ({ item }: { item: LeaveData }) => (
    <LeaveRequestCard
      leaveData={item}
      key={item.id}
      role={loginuserrole}
      navigation={navigation}
      onApprovalChange={() => handleLeaveData(loginuserId)}
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={handleLeaveData} />
      <ModuleIntro
        eyebrow="WORKFORCE / LEAVE"
        title="Leave management"
        description="Plan time off, track requests and keep approvals organized."
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={[
            MainStyles.mainContainer,
            { backgroundColor: theme.screenBg, paddingHorizontal: 0 },
            isTablet && { alignSelf: 'center', width: '100%', maxWidth: 980 },
          ]}
        >
          <View style={styles.sectionLabelRow}>
            <View style={styles.sectionBar} />
            <Text style={[styles.sectionLabel, { color: theme.muted }]}>LEAVE OVERVIEW</Text>
          </View>
          <View style={styles.summaryRow}>
            <SummaryCard label="Total" value={leaveSummary.total} icon="CalendarDays" tone={BRAND.black} dark={isDarkMode} />
            <SummaryCard label="Pending" value={leaveSummary.pending} icon="Clock3" tone={BRAND.yellow} dark={isDarkMode} />
            <SummaryCard label="Approved" value={leaveSummary.approved} icon="CircleCheck" tone="#16A34A" dark={isDarkMode} />
            <SummaryCard label="Rejected" value={leaveSummary.rejected} icon="CircleX" tone="#DC2626" dark={isDarkMode} />
          </View>

          {/* ── Search + Filter button ── */}
          <View
            style={[
              commonFilterStyles.searchRow,
              { paddingHorizontal: 15, paddingTop: 10 },
            ]}
          >
            <View style={commonFilterStyles.searchWrapper}>
              <SearchBarComponent onChangeText={searchFilter} value={search} />
            </View>

            {isAdmin && (
              <TouchableOpacity
                style={[
                  commonFilterStyles.filterIconBtn,
                  {
                    borderColor: hasActiveFilters ? BRAND.yellow : theme.border,
                    backgroundColor: hasActiveFilters
                      ? BRAND.yellow
                      : theme.softBg,
                  },
                ]}
                onPress={() => filterSheetRef.current?.expand()}
                activeOpacity={0.8}
              >
                <AppIcon
                  name="ListFilter"
                  size={moderateScale(20)}
                  color={hasActiveFilters ? '#111111' : BRAND.black}
                />
                {totalActiveFilters > 0 && (
                  <View style={commonFilterStyles.filterBadge}>
                    <Text style={commonFilterStyles.filterBadgeText}>
                      {totalActiveFilters}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* ── Active filter chips (reusable component) ── */}
          <ActiveFilterChips chips={activeChips} onClearAll={resetFilters} />

          {/* ── List / skeletons / empty state ── */}
          <View style={styles.content}>
            {!loading && filterJobData.length === 0 && (
              <View style={styles.noDataContainer}>
                <AppIcon name="Inbox" color="#CBD5E1" size={64} />
                <View style={[styles.emptyIconWrap, { backgroundColor: isDarkMode ? '#2A2410' : '#FFF8D8' }]}>
                  <AppIcon name="CalendarDays" color={'#B88900'} size={34} />
                </View>
                <Text style={[styles.noDataText, { color: theme.text }]}>
                  No leave requests yet
                </Text>
                <Text
                  style={[commonFilterStyles.noDataSub, { color: theme.muted }]}
                >
                  {search
                    ? 'Try another employee, leave type or reason.'
                    : 'Your approved, pending and rejected leave requests will appear here.'}
                </Text>
                {loginType === 'Employee' && !search && !hasActiveFilters && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('AddLeave', { enquiryID: '', customerID: '', customerName: '' })}
                    style={[styles.emptyAction, { backgroundColor: BRAND.yellow }]}
                  >
                    <AppIcon name="Plus" size={moderateScale(17)} color="#111111" />
                    <Text style={styles.emptyActionText}>Apply for Leave</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {loading && (
              <FlatList
                data={[1, 2, 3, 4, 5]}
                showsVerticalScrollIndicator={false}
                renderItem={() => <LeaveCardSkeleton />}
                contentContainerStyle={styles.listContent}
              />
            )}

            {!loading && filterJobData.length > 0 && (
              <FlatList
                data={filterJobData}
                keyExtractor={item => item.id.toString()}
                renderItem={renderJobInfo}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={BRAND.yellow}
                    colors={[BRAND.yellow]}
                  />
                }
              />
            )}
          </View>
        </View>

        {/* ── FAB (employee only) ── */}
        {loginType === 'Employee' && (
          <AddButton
            style={styles.yellowFab}
            onPress={() =>
              navigation.navigate('AddLeave', {
                enquiryID: '',
                customerID: '',
                customerName: '',
              })
            }
          />
        )}

        <FilterBottomSheet
          ref={filterSheetRef}
          snapPoints={['80%']}
          statusOptions={LEAVE_STATUS_OPTIONS}
          selectedStatuses={selectedStatuses}
          onToggleStatus={toggleStatus}
          chipSections={[
            {
              title: 'Leave Type',
              items: LEAVE_TYPE_ITEMS,
              selectedIds: selectedLeaveTypes,
              onToggle: toggleLeaveType,
            },
          ]}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(14),
    paddingTop: moderateScale(4),
    paddingBottom: moderateScale(8),
    gap: moderateScale(8),
  },
  summaryCard: {
    flex: 1,
    minHeight: moderateScale(68),
    borderWidth: 1,
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(9),
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(9),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(7),
  },
  summaryCopy: { flex: 1 },
  summaryValue: { fontSize: moderateScale(19), fontWeight: '800', lineHeight: moderateScale(21) },
  summaryLabel: { fontSize: moderateScale(9), fontWeight: '700', marginTop: moderateScale(2) },
  content: { flex: 1 },
  listContent: {
    padding: moderateScale(13),
    paddingBottom: scale(90),
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
    paddingTop: scale(60),
  },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: moderateScale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(6) },
  sectionBar: { width: moderateScale(4), height: moderateScale(16), borderRadius: 3, backgroundColor: BRAND.yellow, marginRight: moderateScale(8) },
  sectionLabel: { fontSize: moderateScale(10), fontWeight: '900', letterSpacing: 1.4 },
  emptyIconWrap: { width: moderateScale(70), height: moderateScale(70), borderRadius: moderateScale(22), alignItems: 'center', justifyContent: 'center', marginBottom: moderateScale(4) },
  emptyAction: { marginTop: moderateScale(18), minHeight: moderateScale(46), paddingHorizontal: moderateScale(20), borderRadius: moderateScale(13), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: moderateScale(7) },
  emptyActionText: { color: '#111111', fontSize: moderateScale(13), fontWeight: '900' },
  yellowFab: { backgroundColor: BRAND.yellow },
  noDataText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginTop: scale(16),
    marginBottom: scale(8),
  },
});

export default LeaveList;
