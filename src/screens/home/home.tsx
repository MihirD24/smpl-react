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
import { ProTopBar, ProPill, ProMetric, PRO } from '../../components/modern/ProScreen';

import AppScreen from '../../components/ui/AppScreen';

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
    <AppScreen padding={false}>
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
          <View style={styles.homeHeaderWrap}>
            <View style={styles.homeIdentity}>
              <View style={styles.logoMini}><Text style={styles.logoMiniText}>SM</Text></View>
              <View style={{flex:1}}>
                <Text style={styles.companyLabel}>SHANTINATH MOTORS</Text>
                <Text style={[styles.homeTitle,{color:t.text}]} numberOfLines={1}>Hi, {loginuserName || 'there'} 👋</Text>
                <Text style={[styles.homeDate,{color:t.sub}]}>{moment().format('dddd, DD MMMM YYYY')}</Text>
              </View>
              <TouchableOpacity style={styles.notifyBtn} onPress={()=>navigation.navigate('NotificationScreen')}>
                <AppIcon name="Bell" size={19} color={t.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.workspaceBanner}>
              <View style={{flex:1}}>
                <Text style={styles.bannerEyebrow}>EMPLOYEE WORKSPACE</Text>
                <Text style={styles.bannerTitle}>Everything important, in one place.</Text>
                <Text style={styles.bannerSub}>Attendance, visits, leaves and payroll at a glance.</Text>
              </View>
              <View style={styles.bannerIcon}><AppIcon name="LayoutGrid" size={24} color="#FFFFFF" /></View>
            </View>
          </View>

          <View style={styles.sectionHead}>
            <View><Text style={[styles.sectionEyebrow,{color:t.sub}]}>AT A GLANCE</Text><Text style={[styles.sectionTitle,{color:t.text}]}>Workforce overview</Text></View>
            <ProPill label="LIVE" tone="green" />
          </View>
          <View style={styles.summaryStrip}>
            <ProMetric value={dashboardCounts.pendingServiceVisits} label="Pending visits" tone="orange" />
            <ProMetric value={dashboardCounts.departmentsCount} label="Departments" tone="blue" />
            <ProMetric value={dashboardCounts.designationsCount} label="Designations" tone="green" />
            <ProMetric value={dashboardCounts.employeesCount} label="Employees" tone="red" />
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
    </AppScreen>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(100),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  welcomeText: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  dateText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginTop: verticalScale(2),
  },
  quickActionsTrigger: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: verticalScale(8),
  },
  card: {
    width: '48%',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: verticalScale(16),
    minHeight: scale(120),
    justifyContent: 'space-between',
  },
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
  cardValue: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    marginTop: verticalScale(12),
  },
  cardLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginTop: verticalScale(4),
  },
  brandName: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: moderateScale(38),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(8),
    textAlign: 'right',
  },

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

  homeHeaderWrap:{paddingBottom:verticalScale(8)},
  homeIdentity:{flexDirection:'row',alignItems:'center',paddingHorizontal:2,paddingTop:4,paddingBottom:16},
  logoMini:{width:42,height:42,borderRadius:14,backgroundColor:PRO.blue,alignItems:'center',justifyContent:'center',marginRight:11},
  logoMiniText:{color:'#fff',fontWeight:'900',fontSize:14},
  companyLabel:{fontSize:10,fontWeight:'900',letterSpacing:1.5,color:'#7890AE'},
  homeTitle:{fontSize:20,fontWeight:'900',letterSpacing:-.4,marginTop:2},
  homeDate:{fontSize:11,fontWeight:'500',marginTop:3},
  notifyBtn:{width:42,height:42,borderRadius:14,backgroundColor:'#fff',borderWidth:1,borderColor:'#E5EAF2',alignItems:'center',justifyContent:'center'},
  workspaceBanner:{backgroundColor:PRO.blue,borderRadius:24,padding:20,flexDirection:'row',alignItems:'flex-start',shadowColor:PRO.blue,shadowOffset:{width:0,height:10},shadowOpacity:.18,shadowRadius:20,elevation:6},
  bannerEyebrow:{color:'#DCE8FF',fontSize:10,fontWeight:'900',letterSpacing:2}, bannerTitle:{color:'#fff',fontSize:23,fontWeight:'900',lineHeight:29,marginTop:8}, bannerSub:{color:'#DCE8FF',fontSize:12,fontWeight:'500',lineHeight:18,marginTop:8},
  bannerIcon:{width:50,height:50,borderRadius:17,backgroundColor:'rgba(255,255,255,.18)',alignItems:'center',justifyContent:'center',marginLeft:12},
  sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end',marginTop:22,marginBottom:10}, sectionEyebrow:{fontSize:10,fontWeight:'900',letterSpacing:1.8}, sectionTitle:{fontSize:20,fontWeight:'900',letterSpacing:-.4,marginTop:3},
  summaryStrip:{backgroundColor:'#fff',borderRadius:20,borderWidth:1,borderColor:'#E7ECF3',flexDirection:'row',paddingHorizontal:4,marginBottom:16},
  card:{borderRadius:18,padding:15,borderWidth:1,minHeight:104,marginBottom:10,shadowOpacity:.03,elevation:1}, cardValue:{fontSize:25,fontWeight:'900',marginTop:8}, cardLabel:{fontSize:10.5,fontWeight:'700',marginTop:2},

  brandName:{display:'none'},
  gridContainer:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginVertical:4},
});
export default Home;
