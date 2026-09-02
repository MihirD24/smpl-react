import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Animated,
  RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  getDashboardCount,
} from '../../services/adminDashboardServices';
import AppIcon, { IconName } from '../../components/appIcon';
import {
  moderateScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { TabWithStackNavProp } from '../../navigation/navigationTypes';
import moment from 'moment';
import AddButton from '../../components/button/addButton';
import {
  getPartyLists,
  getReminderTypeList,
} from '../../services/projectReminderService';
import NetInfoComponent from '../../components/netinfoComponent';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  const [loginuserName, setLoginuserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [dashboardCounts, setDashboardCounts] = useState({
    remainPointCount: 0,
    reminderCount: 0,
    pendingServiceVisits: 0,
    departmentsCount: 0,
    designationsCount: 0,
    employeesCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

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

  // ── Theme ─────────────────────────────────────────────────────────────────
  const t = {
    bg: isDarkMode ? '#111318' : '#F8FAFC',
    card: isDarkMode ? '#1E2028' : '#FFFFFF',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    sub: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#2E323E' : '#E2E8F0',
    primary: '#3B6FD4',
    headerBg: isDarkMode ? '#1E2028' : '#FFFFFF',
    headerBorder: isDarkMode ? '#2E323E' : '#F1F5F9',
    shadow: isDarkMode ? '#000000' : '#0F172A',
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDisplayDate = (raw: string | undefined): string => {
    if (!raw) return '--';
    const m = moment(raw, ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601], true);
    return m.isValid() ? m.format('MMMM Do YYYY') : raw;
  };

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchUserDetails = async (): Promise<void> => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      const p = JSON.parse(userInfo);
      setLoginuserRole(p.role || '');
      setLoginuserName(p.name || '');
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
          pendingServiceVisits: response?.pendingServiceVisits ?? response?.pending_service_visits ?? 0,
          departmentsCount: response?.departmentsCount ?? response?.departments_count ?? 0,
          designationsCount: response?.designationsCount ?? response?.designations_count ?? 0,
          employeesCount: response?.employeesCount ?? response?.employees_count ?? 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard counts');
    }
  };

  // ── Init — runs on every focus, shows skeleton until ALL calls settle ─────
  useEffect(() => {
    if (!isFocused) return;

    const init = async () => {
      setIsLoading(true);
      await fetchUserDetails();
      await Promise.allSettled([
        fetchCounts(),
      ]);
      setIsLoading(false);
    };

    init();
  }, [isFocused]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.allSettled([
        fetchCounts(),
        fetchUserDetails(),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

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
          {/* Product-style dashboard header */}
          <View style={styles.dashboardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.dashboardKicker, { color: t.sub }]}>OVERVIEW</Text>
              <Text numberOfLines={1} style={[styles.dashboardTitle, { color: t.text }]}>Hi, {loginuserName || 'there'} 👋</Text>
              <Text style={[styles.dashboardDate, { color: t.sub }]}>{moment().format('dddd, D MMMM YYYY')}</Text>
            </View>
            <TouchableOpacity style={[styles.profileButton, { backgroundColor: t.card, borderColor: t.border }]} activeOpacity={0.8}>
              <Text style={[styles.profileInitial, { color: t.primary }]}>{(loginuserName || 'U').charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.focusCard, { backgroundColor: t.primary }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.focusLabel}>{loginuserRole || 'EMPLOYEE'} WORKSPACE</Text>
              <Text style={styles.focusTitle}>Everything important, in one place.</Text>
              <Text style={styles.focusSub}>Stay on top of attendance, service work and team activity.</Text>
            </View>
            <View style={styles.focusIcon}>
              <AppIcon name="LayoutDashboard" size={moderateScale(24)} color={t.primary} />
            </View>
          </View>
          <View style={styles.sectionHeader}>
            <View><Text style={[styles.sectionKicker, { color: t.sub }]}>AT A GLANCE</Text><Text style={[styles.sectionTitle, { color: t.text }]}>Workforce overview</Text></View>
            <View style={[styles.liveTag, { backgroundColor: isDarkMode ? '#052E16' : '#ECFDF5' }]}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
          </View>
          {/* Counts Grid */}
          <View style={styles.gridContainer}>
            {isLoading ? (
              <>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: t.card,
                      borderColor: t.border,
                      width: loginuserRole === 'Employee' ? '100%' : '48%',
                    },
                  ]}
                >
                  <SkeletonBox width={40} height={40} borderRadius={10} isDark={isDarkMode} />
                  <SkeletonBox width="60%" height={24} style={{ marginTop: 12 }} isDark={isDarkMode} />
                  <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} isDark={isDarkMode} />
                </View>
                {loginuserRole !== 'Employee' && (
                  <>
                    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
                      <SkeletonBox width={40} height={40} borderRadius={10} isDark={isDarkMode} />
                      <SkeletonBox width="60%" height={24} style={{ marginTop: 12 }} isDark={isDarkMode} />
                      <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} isDark={isDarkMode} />
                    </View>
                    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
                      <SkeletonBox width={40} height={40} borderRadius={10} isDark={isDarkMode} />
                      <SkeletonBox width="60%" height={24} style={{ marginTop: 12 }} isDark={isDarkMode} />
                      <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} isDark={isDarkMode} />
                    </View>
                    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
                      <SkeletonBox width={40} height={40} borderRadius={10} isDark={isDarkMode} />
                      <SkeletonBox width="60%" height={24} style={{ marginTop: 12 }} isDark={isDarkMode} />
                      <SkeletonBox width="40%" height={14} style={{ marginTop: 8 }} isDark={isDarkMode} />
                    </View>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Pending Service Visits Card */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ServiceVisitList')}
                  style={[
                    styles.card,
                    {
                      backgroundColor: t.card,
                      borderColor: t.border,
                      shadowColor: t.shadow,
                      width: loginuserRole === 'Employee' ? '100%' : '48%',
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBg, { backgroundColor: '#FEE2E2' }]}>
                      <AppIcon name="Clock" size={20} color="#EF4444" />
                    </View>
                    <AppIcon name="ChevronRight" size={16} color={t.sub} />
                  </View>
                  <Text style={[styles.cardValue, { color: t.text }]}>
                    {dashboardCounts.pendingServiceVisits}
                  </Text>
                  <Text style={[styles.cardLabel, { color: t.sub }]}>
                    Pending Service Visits
                  </Text>
                </TouchableOpacity>

                {loginuserRole !== 'Employee' && (
                  <>
                    {/* Departments Card */}
                    <View
                      style={[
                        styles.card,
                        {
                          backgroundColor: t.card,
                          borderColor: t.border,
                          shadowColor: t.shadow,
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.iconBg, { backgroundColor: '#DBEAFE' }]}>
                          <AppIcon name="Network" size={20} color="#3B82F6" />
                        </View>
                      </View>
                      <Text style={[styles.cardValue, { color: t.text }]}>
                        {dashboardCounts.departmentsCount}
                      </Text>
                      <Text style={[styles.cardLabel, { color: t.sub }]}>
                        Departments
                      </Text>
                    </View>

                    {/* Designations Card */}
                    <View
                      style={[
                        styles.card,
                        {
                          backgroundColor: t.card,
                          borderColor: t.border,
                          shadowColor: t.shadow,
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.iconBg, { backgroundColor: '#D1FAE5' }]}>
                          <AppIcon name="Briefcase" size={20} color="#10B981" />
                        </View>
                      </View>
                      <Text style={[styles.cardValue, { color: t.text }]}>
                        {dashboardCounts.designationsCount}
                      </Text>
                      <Text style={[styles.cardLabel, { color: t.sub }]}>
                        Designations
                      </Text>
                    </View>

                    {/* Total Employees Card */}
                    <View
                      style={[
                        styles.card,
                        {
                          backgroundColor: t.card,
                          borderColor: t.border,
                          shadowColor: t.shadow,
                        },
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <View style={[styles.iconBg, { backgroundColor: '#E0E7FF' }]}>
                          <AppIcon name="Users" size={20} color="#6366F1" />
                        </View>
                      </View>
                      <Text style={[styles.cardValue, { color: t.text }]}>
                        {dashboardCounts.employeesCount}
                      </Text>
                      <Text style={[styles.cardLabel, { color: t.sub }]}>
                        Total Employees
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>

          {/* Branding */}
          <Text style={[styles.brandName, { color: isDarkMode ? '#2A2D38' : '#EAEDFF' }]}>
            Shantinath Motors Pvt Ltd
          </Text>
        </ScrollView>

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
      </GestureHandlerRootView>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: moderateScale(16), paddingTop: verticalScale(14), paddingBottom: verticalScale(100) },
  dashboardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(14) },
  dashboardKicker: { fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.5, marginBottom: verticalScale(3) },
  dashboardTitle: { fontSize: moderateScale(23), fontWeight: '800', letterSpacing: -0.5 },
  dashboardDate: { fontSize: moderateScale(11), marginTop: verticalScale(4), fontWeight: '500' },
  profileButton: { width: moderateScale(46), height: moderateScale(46), borderRadius: moderateScale(15), borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: moderateScale(18), fontWeight: '800' },
  focusCard: { minHeight: verticalScale(126), borderRadius: moderateScale(20), padding: moderateScale(18), flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(18), overflow: 'hidden' },
  focusLabel: { color: '#BFDBFE', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.4, marginBottom: verticalScale(6) },
  focusTitle: { color: '#FFFFFF', fontSize: moderateScale(17), lineHeight: moderateScale(22), fontWeight: '800', maxWidth: '82%' },
  focusSub: { color: '#CBD5E1', fontSize: moderateScale(10.5), lineHeight: moderateScale(16), marginTop: verticalScale(4), maxWidth: '84%' },
  focusIcon: { position: 'absolute', right: moderateScale(14), top: moderateScale(14), width: moderateScale(48), height: moderateScale(48), borderRadius: moderateScale(16), backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: verticalScale(10) },
  sectionKicker: { fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.3 },
  sectionTitle: { fontSize: moderateScale(16), fontWeight: '800', marginTop: verticalScale(3) },
  liveTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: moderateScale(9), paddingVertical: verticalScale(5), borderRadius: 99 },
  liveDot: { width: moderateScale(6), height: moderateScale(6), borderRadius: 3, backgroundColor: '#10B981', marginRight: moderateScale(5) },
  liveText: { fontSize: moderateScale(8), fontWeight: '800', color: '#059669', letterSpacing: 0.8 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: verticalScale(8),
  },
  card: { width: '48%', borderRadius: moderateScale(17), padding: moderateScale(14), borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 7, elevation: 1, marginBottom: verticalScale(12), minHeight: scale(108), justifyContent: 'space-between' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBg: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardValue: { fontSize: moderateScale(22), fontWeight: '800', marginTop: verticalScale(10) },
  cardLabel: { fontSize: moderateScale(11), fontWeight: '600', marginTop: verticalScale(3) },
  brandName: { fontSize: moderateScale(24), fontWeight: '800', lineHeight: moderateScale(30), marginTop: verticalScale(20), marginBottom: verticalScale(6), textAlign: 'right' },

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
});
export default Home;
