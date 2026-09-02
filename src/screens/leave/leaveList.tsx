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
const LeaveList: React.FC<AppStackScreenProps<'LeaveList'>> = ({
  navigation,
}) => {
  const isFocused = useIsFocused();
  const { userInfo } = useContext(AuthContext);
  const MainStyles = MainStyle();
  const isDarkMode = useColorScheme() === 'dark';

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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={[
            MainStyles.mainContainer,
            { backgroundColor: theme.screenBg, paddingHorizontal: 0 },
          ]}
        >
          <View style={styles.leaveHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.leaveKicker, { color: theme.muted }]}>TIME OFF</Text>
              <Text style={[styles.leaveTitle, { color: theme.text }]}>Leave requests</Text>
              <Text style={[styles.leaveSubtitle, { color: theme.muted }]}>Review, search and track your time off</Text>
            </View>
            <View style={[styles.leaveCount, { backgroundColor: isDarkMode ? '#172554' : '#EFF6FF' }]}>
              <Text style={[styles.leaveCountValue, { color: isDarkMode ? '#BFDBFE' : '#2563EB' }]}>{filterJobData.length}</Text>
              <Text style={[styles.leaveCountLabel, { color: theme.muted }]}>TOTAL</Text>
            </View>
          </View>
          <View style={[styles.statusRail, { backgroundColor: theme.softBg, borderColor: theme.border }]}>
            {[['Pending', '#F59E0B'], ['Approved', '#10B981'], ['Rejected', '#EF4444']].map(([label,color]) => (
              <View key={label} style={styles.statusRailItem}>
                <View style={[styles.statusRailDot, { backgroundColor: color }]} />
                <View><Text style={[styles.statusRailValue, { color: theme.text }]}>{filterJobData.filter(x => x.status === (label === 'Pending' ? 0 : label === 'Approved' ? 1 : 2)).length}</Text><Text style={[styles.statusRailLabel, { color: theme.muted }]}>{label}</Text></View>
              </View>
            ))}
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
                    borderColor: hasActiveFilters ? '#3B82F6' : theme.border,
                    backgroundColor: hasActiveFilters
                      ? '#3B82F6'
                      : theme.softBg,
                  },
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
            )}
          </View>

          {/* ── Active filter chips (reusable component) ── */}
          <ActiveFilterChips chips={activeChips} onClearAll={resetFilters} />

          {/* ── List / skeletons / empty state ── */}
          <View style={styles.content}>
            {!loading && filterJobData.length === 0 && (
              <View style={styles.noDataContainer}>
                <AppIcon name="Inbox" color="#CBD5E1" size={64} />
                <Text style={[styles.noDataText, { color: theme.text }]}>
                  No Leave Requests
                </Text>
                <Text
                  style={[commonFilterStyles.noDataSub, { color: theme.muted }]}
                >
                  {search
                    ? 'No results found for your search'
                    : 'All caught up! No pending requests.'}
                </Text>
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
                    tintColor="#3B82F6"
                    colors={['#3B82F6']}
                  />
                }
              />
            )}
          </View>
        </View>

        {/* ── FAB (employee only) ── */}
        {loginType === 'Employee' && (
          <AddButton
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
  leaveHeader: { paddingHorizontal: moderateScale(16), paddingTop: verticalScale(14), paddingBottom: verticalScale(11), flexDirection: 'row', alignItems: 'center' },
  leaveKicker: { fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.3 },
  leaveTitle: { fontSize: moderateScale(22), fontWeight: '800', letterSpacing: -0.3, marginTop: verticalScale(2) },
  leaveSubtitle: { fontSize: moderateScale(11), marginTop: verticalScale(3), fontWeight: '500' },
  leaveCount: { width: moderateScale(58), height: moderateScale(58), borderRadius: moderateScale(17), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DBEAFE' },
  leaveCountValue: { fontSize: moderateScale(19), fontWeight: '800', lineHeight: moderateScale(21) },
  leaveCountLabel: { fontSize: moderateScale(7), fontWeight: '800', letterSpacing: 0.7, marginTop: verticalScale(1) },
  statusRail: { marginHorizontal: moderateScale(16), marginBottom: verticalScale(8), paddingHorizontal: moderateScale(12), paddingVertical: verticalScale(11), borderRadius: moderateScale(16), borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between' },
  statusRailItem: { flexDirection: 'row', alignItems: 'center', minWidth: moderateScale(75) },
  statusRailDot: { width: moderateScale(7), height: moderateScale(7), borderRadius: 4, marginRight: moderateScale(7) },
  statusRailValue: { fontSize: moderateScale(16), fontWeight: '800' },
  statusRailLabel: { fontSize: moderateScale(8.5), fontWeight: '600', marginTop: verticalScale(1) },
  content: { flex: 1 },
  listContent: { paddingHorizontal: moderateScale(13), paddingTop: moderateScale(10), paddingBottom: scale(90) },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(40),
    paddingTop: scale(60),
  },
  noDataText: { fontSize: moderateScale(16), fontWeight: '700', marginTop: scale(14), marginBottom: scale(7) },
});

export default LeaveList;
