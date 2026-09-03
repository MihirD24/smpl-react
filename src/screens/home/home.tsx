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
  const metricItems = loginuserRole === 'Employee'
    ? [
        { label: 'Pending visits', value: dashboardCounts.pendingServiceVisits, icon: 'MapPin', tone: '#2563EB' },
        { label: 'Reminders', value: dashboardCounts.reminderCount, icon: 'Bell', tone: '#7C3AED' },
        { label: 'Open points', value: dashboardCounts.remainPointCount, icon: 'ClipboardList', tone: '#059669' },
      ]
    : [
        { label: 'Employees', value: dashboardCounts.employeesCount, icon: 'Users', tone: '#2563EB' },
        { label: 'Departments', value: dashboardCounts.departmentsCount, icon: 'Network', tone: '#7C3AED' },
        { label: 'Pending visits', value: dashboardCounts.pendingServiceVisits, icon: 'MapPin', tone: '#D97706' },
      ];

  return (
    <View style={[styles.page, { backgroundColor: t.bg }]}> 
      <NetInfoComponent onReconnect={onRefresh} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} colors={[t.primary]} />}
      >
        <View style={styles.appHeader}>
          <View style={styles.brandCluster}>
            <View style={styles.brandLogo}><Text style={styles.brandLogoText}>SM</Text></View>
            <View>
              <Text style={[styles.brandNameTop, { color: t.text }]}>Shantinath Motors</Text>
              <Text style={[styles.brandMeta, { color: t.sub }]}>Employee workspace</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.avatar, { backgroundColor: '#E9F1FF', borderColor: t.border }]} activeOpacity={0.8}>
            <Text style={[styles.avatarText, { color: t.primary }]}>{(loginuserName || 'U').charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.overline, { color: t.sub }]}>OVERVIEW</Text>
            <Text numberOfLines={1} style={[styles.greetingTitle, { color: t.text }]}>Hi, {loginuserName || 'there'} 👋</Text>
            <Text style={[styles.greetingDate, { color: t.sub }]}>{moment().format('dddd, DD MMM YYYY')}</Text>
          </View>
          <View style={styles.liveBadge}><Animated.View style={[styles.liveDot, { opacity: livePulse }]} /><Text style={styles.liveBadgeText}>LIVE</Text></View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroOrbOne} />
          <View style={styles.heroOrbTwo} />
          <Text style={styles.heroOverline}>{loginuserRole || 'EMPLOYEE'} WORKSPACE</Text>
          <Text style={styles.heroTitle}>Everything important, in one place.</Text>
          <Text style={styles.heroSub}>Attendance, field work and team activity—at a glance.</Text>
          <View style={styles.heroFooter}>
            <Text style={styles.heroFooterText}>Today</Text>
            <Text style={styles.heroFooterDate}>{moment().format('03 MMM YYYY').replace('03 MMM YYYY', moment().format('DD MMM YYYY'))}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View>
            <Text style={[styles.sectionOverline, { color: t.sub }]}>AT A GLANCE</Text>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Your workspace</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ServiceVisitList')} style={styles.viewLink}>
            <Text style={[styles.viewLinkText, { color: t.primary }]}>View all</Text>
            <AppIcon name="ChevronRight" size={15} color={t.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsGrid}>
          {isLoading ? metricItems.map((m, i) => <View key={i} style={[styles.metricCard, { backgroundColor: t.card, borderColor: t.border }]}><SkeletonBox width={38} height={38} borderRadius={12} isDark={isDarkMode} /><SkeletonBox width="40%" height={22} style={{ marginTop: 12 }} isDark={isDarkMode} /><SkeletonBox width="65%" height={10} style={{ marginTop: 7 }} isDark={isDarkMode} /></View>) : metricItems.map((m, i) => (
            <TouchableOpacity key={m.label} activeOpacity={0.82} onPress={() => m.label === 'Pending visits' && navigation.navigate('ServiceVisitList')} style={[styles.metricCard, { backgroundColor: t.card, borderColor: t.border }] }>
              <View style={[styles.metricIcon, { backgroundColor: m.tone + '12' }]}><AppIcon name={m.icon as any} size={19} color={m.tone} /></View>
              <Text style={[styles.metricValue, { color: t.text }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: t.sub }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <View><Text style={[styles.sectionOverline, { color: t.sub }]}>SHORTCUTS</Text><Text style={[styles.sectionTitle, { color: t.text }]}>Quick actions</Text></View>
          <TouchableOpacity onPress={openQuickActions} style={styles.viewLink}><Text style={[styles.viewLinkText, { color: t.primary }]}>More</Text><AppIcon name="Plus" size={14} color={t.primary} /></TouchableOpacity>
        </View>

        <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickTile, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => navigation.navigate('Punch')} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: '#EEF4FF' }]}><AppIcon name="Clock" size={20} color="#2563EB" /></View><Text style={[styles.quickTitle,{color:t.text}]}>Punch</Text><Text style={[styles.quickSub,{color:t.sub}]}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickTile, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => navigation.navigate('LeaveList')} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: '#F3EEFF' }]}><AppIcon name="Calendar" size={20} color="#7C3AED" /></View><Text style={[styles.quickTitle,{color:t.text}]}>Leave</Text><Text style={[styles.quickSub,{color:t.sub}]}>Time off</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickTile, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => navigation.navigate('ServiceVisitList')} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: '#ECFDF5' }]}><AppIcon name="MapPin" size={20} color="#059669" /></View><Text style={[styles.quickTitle,{color:t.text}]}>Visits</Text><Text style={[styles.quickSub,{color:t.sub}]}>Field work</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickTile, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => navigation.navigate('StaffSalary')} activeOpacity={0.8}>
            <View style={[styles.quickIcon, { backgroundColor: '#FFF7E8' }]}><AppIcon name="IndianRupee" size={20} color="#D97706" /></View><Text style={[styles.quickTitle,{color:t.text}]}>Salary</Text><Text style={[styles.quickSub,{color:t.sub}]}>Payroll</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.securityNote, { backgroundColor: isDarkMode ? '#14213D' : '#EFF6FF', borderColor: isDarkMode ? '#1D4ED8' : '#DBEAFE' }]}>
          <View style={styles.securityIcon}><AppIcon name="ShieldCheck" size={17} color={t.primary} /></View>
          <View style={{ flex:1 }}><Text style={[styles.securityTitle,{color:t.text}]}>Secure employee workspace</Text><Text style={[styles.securitySub,{color:t.sub}]}>Your activity and attendance data stay protected.</Text></View>
          <AppIcon name="ChevronRight" size={16} color={t.sub} />
        </View>

        <Text style={[styles.footerBrand, { color: t.sub }]}>Shantinath Motors Pvt Ltd</Text>
      </ScrollView>

      <BottomSheet ref={quickActionsBottomSheetRef} index={-1} snapPoints={quickActionsSnapPoints} enablePanDownToClose backdropComponent={renderBackdrop} backgroundStyle={[styles.bottomSheetBackground,{backgroundColor:t.card}]} handleIndicatorStyle={styles.bottomSheetIndicator}>
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.quickActionsHeader}><View><Text style={[styles.sheetOverline,{color:t.sub}]}>WORKSPACE</Text><Text style={[styles.quickActionsTitle,{color:t.text}]}>Quick actions</Text></View><TouchableOpacity style={styles.closeBtn} onPress={closeQuickActions}><AppIcon name="X" size={16} color={t.text}/></TouchableOpacity></View>
          <View style={styles.quickActionsContainer}>{quickActionItems.map((item,index)=><TouchableOpacity key={index} style={[styles.quickActionItem,{backgroundColor:t.bg,borderColor:t.border}]} onPress={item.onPress} activeOpacity={0.8}><View style={[styles.quickActionIconWrap,{backgroundColor:item.iconBg}]}><AppIcon name={item.icon} size={18} color="#FFF"/></View><Text style={[styles.quickActionLabel,{color:t.text}]}>{item.label}</Text><AppIcon name="ChevronRight" size={17} color={t.sub}/></TouchableOpacity>)}</View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page:{flex:1},
  scrollContent:{paddingHorizontal:moderateScale(18),paddingTop:verticalScale(8),paddingBottom:verticalScale(38)},
  appHeader:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:verticalScale(16)},
  brandCluster:{flexDirection:'row',alignItems:'center',gap:10},
  brandLogo:{width:38,height:38,borderRadius:12,backgroundColor:'#2563EB',alignItems:'center',justifyContent:'center'},
  brandLogoText:{color:'#FFF',fontSize:13,fontWeight:'900'}, brandNameTop:{fontSize:12,fontWeight:'800'}, brandMeta:{fontSize:9,marginTop:2,fontWeight:'600'},
  avatar:{width:40,height:40,borderRadius:14,borderWidth:1,alignItems:'center',justifyContent:'center'}, avatarText:{fontSize:16,fontWeight:'900'},
  greetingRow:{flexDirection:'row',alignItems:'flex-end',marginBottom:verticalScale(14)}, overline:{fontSize:8,fontWeight:'900',letterSpacing:1.8}, greetingTitle:{fontSize:25,fontWeight:'900',letterSpacing:-0.8,marginTop:3}, greetingDate:{fontSize:10.5,fontWeight:'600',marginTop:4},
  liveBadge:{flexDirection:'row',alignItems:'center',paddingHorizontal:10,paddingVertical:6,borderRadius:99,backgroundColor:'#ECFDF5',marginBottom:2}, liveDot:{width:6,height:6,borderRadius:3,backgroundColor:'#16A34A',marginRight:5}, liveBadgeText:{fontSize:8,fontWeight:'900',letterSpacing:1,color:'#15803D'},
  heroCard:{minHeight:172,borderRadius:26,backgroundColor:'#2563EB',padding:20,overflow:'hidden',marginBottom:verticalScale(22),position:'relative'}, heroOrbOne:{position:'absolute',width:170,height:170,borderRadius:85,backgroundColor:'rgba(255,255,255,0.07)',right:-55,top:-65}, heroOrbTwo:{position:'absolute',width:110,height:110,borderRadius:55,backgroundColor:'rgba(255,255,255,0.06)',right:75,bottom:-55}, heroOverline:{color:'#CFE0FF',fontSize:8,fontWeight:'900',letterSpacing:1.8}, heroTitle:{color:'#FFF',fontSize:22,fontWeight:'900',lineHeight:27,letterSpacing:-0.5,maxWidth:'88%',marginTop:8}, heroSub:{color:'#DBEAFE',fontSize:10.5,lineHeight:16,maxWidth:'90%',marginTop:8,fontWeight:'500'}, heroFooter:{flexDirection:'row',alignItems:'center',gap:10,marginTop:17}, heroFooterText:{color:'#FFF',fontSize:9,fontWeight:'800'}, heroFooterDate:{color:'#BFDBFE',fontSize:9,fontWeight:'600'},
  sectionRow:{flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',marginBottom:verticalScale(10)}, sectionOverline:{fontSize:8,fontWeight:'900',letterSpacing:1.7}, sectionTitle:{fontSize:18,fontWeight:'900',letterSpacing:-0.3,marginTop:4}, viewLink:{flexDirection:'row',alignItems:'center',gap:2,paddingBottom:2}, viewLinkText:{fontSize:10,fontWeight:'800'},
  metricsGrid:{flexDirection:'row',gap:9,marginBottom:verticalScale(20)}, metricCard:{flex:1,minHeight:116,borderRadius:18,borderWidth:1,padding:12,shadowColor:'#0F172A',shadowOpacity:.035,shadowRadius:12,shadowOffset:{width:0,height:5},elevation:1}, metricIcon:{width:36,height:36,borderRadius:12,alignItems:'center',justifyContent:'center'}, metricValue:{fontSize:24,fontWeight:'900',marginTop:12,letterSpacing:-.5}, metricLabel:{fontSize:9,fontWeight:'700',marginTop:2,lineHeight:13},
  quickGrid:{flexDirection:'row',flexWrap:'wrap',gap:9,marginBottom:verticalScale(18)}, quickTile:{width:'48.5%',minHeight:94,borderWidth:1,borderRadius:17,padding:12}, quickIcon:{width:36,height:36,borderRadius:12,alignItems:'center',justifyContent:'center',marginBottom:8}, quickTitle:{fontSize:12,fontWeight:'900'}, quickSub:{fontSize:9,fontWeight:'600',marginTop:2},
  securityNote:{flexDirection:'row',alignItems:'center',borderRadius:16,borderWidth:1,padding:12,gap:10}, securityIcon:{width:32,height:32,borderRadius:11,backgroundColor:'#FFF',alignItems:'center',justifyContent:'center'}, securityTitle:{fontSize:10.5,fontWeight:'800'}, securitySub:{fontSize:9,lineHeight:13,marginTop:2}, footerBrand:{fontSize:9,fontWeight:'700',textAlign:'center',marginTop:22,opacity:.65},
  bottomSheetBackground:{borderTopLeftRadius:26,borderTopRightRadius:26},bottomSheetIndicator:{backgroundColor:'#CBD5E1',width:42,height:4},bottomSheetContent:{flex:1,paddingHorizontal:20,paddingTop:5},sheetOverline:{fontSize:8,fontWeight:'900',letterSpacing:1.6},quickActionsHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingBottom:14,borderBottomWidth:1,borderBottomColor:'#EEF2F7',marginBottom:14},quickActionsTitle:{fontSize:19,fontWeight:'900',marginTop:3},closeBtn:{width:32,height:32,borderRadius:16,backgroundColor:'#F1F5F9',alignItems:'center',justifyContent:'center'},quickActionsContainer:{gap:9},quickActionItem:{flexDirection:'row',alignItems:'center',padding:12,borderRadius:15,borderWidth:1,gap:12},quickActionIconWrap:{width:34,height:34,borderRadius:11,alignItems:'center',justifyContent:'center'},quickActionLabel:{flex:1,fontSize:12,fontWeight:'800'},
});
export default Home;
