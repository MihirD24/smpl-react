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
  const t = {bg: isDarkMode ? '#08121E' : '#F4F7FB', card: isDarkMode ? '#102236' : '#FFFFFF', text: isDarkMode ? '#F4F8FC' : '#0B1728', sub: isDarkMode ? '#A1B0C2' : '#687B94', border: isDarkMode ? '#263F59' : '#DCE5F0', primary: '#2563EB', shadow: isDarkMode ? '#000' : '#0B1728', surfaceAlt: isDarkMode ? '#142A40' : '#F7FAFD'};

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

  const heroScale = useRef(new Animated.Value(.97)).current;
  useEffect(() => { Animated.spring(heroScale,{toValue:1,useNativeDriver:true,friction:7,tension:70}).start(); }, [isLoading, heroScale]);
  const now = moment();

  return (
    <>
      <NetInfoComponent onReconnect={onRefresh} />
      <GestureHandlerRootView style={{flex:1}}>
        <ScrollView
          style={{flex:1,backgroundColor:t.bg}}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} colors={[t.primary]} />}
        >
          <Animated.View style={[styles.hero,{transform:[{scale:heroScale}],backgroundColor:isDarkMode?'#102B45':'#0B2032'}]}>
            <View style={styles.heroGlow}/>
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>WORKFORCE CONTROL</Text>
                <Text style={styles.heroTitle}>{loginuserName ? `Good day, ${loginuserName}` : 'Good day'}</Text>
                <Text style={styles.heroDate}>{now.format('dddd, D MMMM')} • {now.format('hh:mm A')}</Text>
              </View>
              <View style={styles.liveBadge}><View style={styles.liveDot}/><Text style={styles.liveText}>LIVE</Text></View>
            </View>
            <View style={styles.heroBottom}>
              <View><Text style={styles.heroMeta}>TODAY'S OPERATIONS</Text><Text style={styles.heroMetric}>{dashboardCounts.pendingServiceVisits}</Text><Text style={styles.heroMetricLabel}>pending service visits</Text></View>
              <TouchableOpacity onPress={openQuickActions} style={styles.heroAction} activeOpacity={0.82}><AppIcon name="Plus" size={18} color="#08111C"/><Text style={styles.heroActionText}>Quick actions</Text></TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.sectionHead}><Text style={[styles.sectionTitle,{color:t.text}]}>Quick access</Text><Text style={[styles.sectionHint,{color:t.sub}]}>Most used</Text></View>
          <View style={styles.quickGrid}>
            {[
              {label:'Attendance',icon:'CalendarCheck',bg:'#EAF2FF',fg:'#2563EB',go:'Attendancelist'},
              {label:'Leave',icon:'CalendarDays',bg:'#E8F8F0',fg:'#0FBA83',go:'LeaveList'},
              {label:'Service',icon:'MapPin',bg:'#FFF3D6',fg:'#D97706',go:'ServiceVisitList'},
              {label:'Profile',icon:'UserRound',bg:'#EEEAFE',fg:'#7257E8',go:'Profile'},
            ].map(item=><TouchableOpacity key={item.label} onPress={()=>navigation.navigate(item.go as any)} activeOpacity={0.82} style={[styles.quickItem,{backgroundColor:t.card,borderColor:t.border}]}><View style={[styles.quickIcon,{backgroundColor:item.bg}]}><AppIcon name={item.icon as any} size={18} color={item.fg}/></View><Text style={[styles.quickLabel,{color:t.text}]}>{item.label}</Text><AppIcon name="ChevronRight" size={15} color={t.sub}/></TouchableOpacity>)}
          </View>

          <View style={styles.sectionHead}><Text style={[styles.sectionTitle,{color:t.text}]}>Operational snapshot</Text><Text style={[styles.sectionHint,{color:t.sub}]}>Updated now</Text></View>
          <View style={styles.grid}>
            <View style={[styles.statCard,{backgroundColor:t.card,borderColor:t.border}]}><View style={[styles.statIcon,{backgroundColor:'#EAF2FF'}]}><AppIcon name="MapPin" size={18} color="#2563EB"/></View><Text style={[styles.statValue,{color:t.text}]}>{dashboardCounts.pendingServiceVisits}</Text><Text style={[styles.statLabel,{color:t.sub}]}>Pending visits</Text></View>
            {loginuserRole!=='Employee' && <>
              <View style={[styles.statCard,{backgroundColor:t.card,borderColor:t.border}]}><View style={[styles.statIcon,{backgroundColor:'#E8F8F0'}]}><AppIcon name="UsersRound" size={18} color="#0FBA83"/></View><Text style={[styles.statValue,{color:t.text}]}>{dashboardCounts.employeesCount}</Text><Text style={[styles.statLabel,{color:t.sub}]}>Employees</Text></View>
              <View style={[styles.statCard,{backgroundColor:t.card,borderColor:t.border}]}><View style={[styles.statIcon,{backgroundColor:'#FFF3D6'}]}><AppIcon name="Network" size={18} color="#D97706"/></View><Text style={[styles.statValue,{color:t.text}]}>{dashboardCounts.departmentsCount}</Text><Text style={[styles.statLabel,{color:t.sub}]}>Departments</Text></View>
              <View style={[styles.statCard,{backgroundColor:t.card,borderColor:t.border}]}><View style={[styles.statIcon,{backgroundColor:'#EEEAFE'}]}><AppIcon name="BriefcaseBusiness" size={18} color="#7257E8"/></View><Text style={[styles.statValue,{color:t.text}]}>{dashboardCounts.designationsCount}</Text><Text style={[styles.statLabel,{color:t.sub}]}>Designations</Text></View>
            </>}
          </View>

          <View style={[styles.infoCard,{backgroundColor:t.card,borderColor:t.border}]}><View style={styles.infoIcon}><AppIcon name="ShieldCheck" size={19} color={t.primary}/></View><View style={{flex:1}}><Text style={[styles.infoTitle,{color:t.text}]}>Workday status</Text><Text style={[styles.infoText,{color:t.sub}]}>Your dashboard is synced with the latest attendance and field activity.</Text></View><View style={styles.infoArrow}><AppIcon name="ChevronRight" size={17} color={t.sub}/></View></View>
        </ScrollView>

        <BottomSheet ref={quickActionsBottomSheetRef} index={-1} snapPoints={quickActionsSnapPoints} enablePanDownToClose backdropComponent={renderBackdrop} backgroundStyle={{backgroundColor:t.card,borderTopLeftRadius:24,borderTopRightRadius:24}} handleIndicatorStyle={{backgroundColor:t.border,width:42}}>
          <BottomSheetView style={styles.sheet}><View style={styles.sheetHeader}><View><Text style={[styles.sheetTitle,{color:t.text}]}>Quick actions</Text><Text style={[styles.sheetSub,{color:t.sub}]}>Jump straight into project operations</Text></View><TouchableOpacity onPress={closeQuickActions} style={[styles.close,{backgroundColor:t.surfaceAlt}]}><AppIcon name="X" size={16} color={t.text}/></TouchableOpacity></View>{quickActionItems.map((item)=><TouchableOpacity key={item.label} style={[styles.actionRow,{backgroundColor:t.surfaceAlt}]} onPress={item.onPress} activeOpacity={0.78}><View style={[styles.actionIcon,{backgroundColor:item.iconBg}]}><AppIcon name={item.icon} size={18} color="#fff"/></View><Text style={[styles.actionText,{color:t.text}]}>{item.label}</Text><AppIcon name="ChevronRight" size={17} color={t.sub}/></TouchableOpacity>)}</BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </>
  );
};

const styles=StyleSheet.create({
 scroll:{padding:16,paddingBottom:28},hero:{minHeight:212,borderRadius:24,padding:18,overflow:'hidden',marginBottom:18,shadowColor:'#0B1728',shadowOpacity:.18,shadowRadius:24,shadowOffset:{width:0,height:12},elevation:6},heroGlow:{position:'absolute',right:-45,top:-50,width:160,height:160,borderRadius:80,backgroundColor:'rgba(37,99,235,.24)'},heroTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},heroCopy:{flex:1},heroEyebrow:{color:'#AFC2D7',fontSize:9,fontWeight:'900',letterSpacing:1.4},heroTitle:{color:'#fff',fontSize:24,fontWeight:'900',marginTop:5},heroDate:{color:'#A9BACC',fontSize:11,fontWeight:'700',marginTop:6},liveBadge:{flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:9,paddingVertical:6,borderRadius:99,backgroundColor:'rgba(255,255,255,.10)',borderWidth:1,borderColor:'rgba(255,255,255,.12)'},liveDot:{width:7,height:7,borderRadius:4,backgroundColor:'#18D79A'},liveText:{color:'#DDF7EE',fontSize:9,fontWeight:'900'},heroBottom:{marginTop:'auto',flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between'},heroMeta:{color:'#7C94AB',fontSize:9,fontWeight:'900',letterSpacing:1.1},heroMetric:{color:'#F7C542',fontSize:32,fontWeight:'900',marginTop:2},heroMetricLabel:{color:'#CAD8E7',fontSize:11,fontWeight:'700'},heroAction:{flexDirection:'row',alignItems:'center',gap:7,paddingHorizontal:13,paddingVertical:10,borderRadius:12,backgroundColor:'#F4B400'},heroActionText:{fontSize:11,fontWeight:'900',color:'#08111C'},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10},sectionTitle:{fontSize:16,fontWeight:'900'},sectionHint:{fontSize:10.5,fontWeight:'700'},quickGrid:{gap:9,marginBottom:18},quickItem:{minHeight:58,borderRadius:15,borderWidth:1,flexDirection:'row',alignItems:'center',paddingHorizontal:11},quickIcon:{width:36,height:36,borderRadius:11,alignItems:'center',justifyContent:'center',marginRight:10},quickLabel:{flex:1,fontSize:13,fontWeight:'800'},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginBottom:18},statCard:{width:'48.6%',minHeight:125,borderWidth:1,borderRadius:16,padding:14,marginBottom:9},statIcon:{width:36,height:36,borderRadius:11,alignItems:'center',justifyContent:'center'},statValue:{fontSize:25,fontWeight:'900',marginTop:12},statLabel:{fontSize:11.5,fontWeight:'700',marginTop:3},infoCard:{borderWidth:1,borderRadius:16,padding:13,flexDirection:'row',alignItems:'center'},infoIcon:{width:40,height:40,borderRadius:12,backgroundColor:'#EAF2FF',alignItems:'center',justifyContent:'center',marginRight:10},infoTitle:{fontSize:13,fontWeight:'900'},infoText:{fontSize:10.5,lineHeight:16,fontWeight:'600',marginTop:3},infoArrow:{marginLeft:8},sheet:{padding:18},sheetHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingBottom:14,marginBottom:13,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:'#E2E8F0'},sheetTitle:{fontSize:18,fontWeight:'900'},sheetSub:{fontSize:10.5,fontWeight:'600',marginTop:3},close:{width:34,height:34,borderRadius:11,alignItems:'center',justifyContent:'center'},actionRow:{minHeight:60,borderRadius:14,marginBottom:9,paddingHorizontal:12,flexDirection:'row',alignItems:'center'},actionIcon:{width:38,height:38,borderRadius:11,alignItems:'center',justifyContent:'center',marginRight:11},actionText:{flex:1,fontSize:13,fontWeight:'800'}
});
export default Home;
