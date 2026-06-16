import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  useColorScheme,
  Animated,
  Easing,
} from 'react-native';
import { useAuth } from '../../context/authContext';
import { userDetails } from '../../services';
import AppIcon from '../../components/appIcon';
import { TabWithStackNavProp } from '../../navigation/navigationTypes';
import VersionCheck from 'react-native-version-check';
import ProfileSkeleton from '../../skeletonview/profileSkeleton';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { useFocusEffect } from '@react-navigation/native';
import { MoreHorizontal } from 'lucide-react-native';
import NetInfoComponent from '../../components/netinfoComponent';

type ProfileScreenNav = TabWithStackNavProp<'Profile'>;

type UserProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  user_type: string;
  mobile_no: string;
  staff_time_diff: number;
  allowed_paid_leave: number;
  remaining_paid_leave: number;
  profile_pic: string | null;
  doj: string | null;
  designation_id: number | null;
  department_id: number | null;
  site_id: number | null;
};

// ─── Animated Section Label ────────────────────────────────────
const SectionLabel = ({
  title,
  color,
  delay = 0,
}: {
  title: string;
  color: string;
  delay?: number;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
        marginBottom: 8,
        marginTop: 6,
        gap: 8,
      }}
    >
      <View style={[styles.sectionAccent, { backgroundColor: color }]} />
      <Text style={[styles.sectionLabel, { color }]}>{title}</Text>
    </Animated.View>
  );
};

// ─── Animated Menu Row ─────────────────────────────────────────
interface MenuRowProps {
  iconName: string;
  label: string;
  textColor: string;
  iconBoxBackgroundColor: string;
  chevronColor: string;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  hasDot?: boolean;
  onPress: () => void;
  delay?: number;
}

const MenuRow: React.FC<MenuRowProps> = ({
  iconName,
  label,
  textColor,
  iconBoxBackgroundColor,
  chevronColor,
  badge,
  badgeColor = '#DBEAFE',
  badgeTextColor = '#1D4ED8',
  hasDot = false,
  onPress,
  delay = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.menuRow}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          style={[
            styles.menuIconBox,
            { backgroundColor: iconBoxBackgroundColor },
          ]}
        >
          <AppIcon name={iconName} size={19} color="#2563EB" />
        </View>
        <Text style={[styles.menuLabel, { color: textColor }]}>{label}</Text>
        {badge && (
          <View style={[styles.menuBadge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.menuBadgeText, { color: badgeTextColor }]}>
              {badge}
            </Text>
          </View>
        )}
        {hasDot && <View style={styles.notifDot} />}
        <View style={styles.chevronWrapper}>
          <AppIcon name="ChevronRight" size={16} color={chevronColor} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RowDivider = ({ color }: { color: string }) => (
  <View style={[styles.rowDivider, { backgroundColor: color }]} />
);

// ─── Animated Card Wrapper ─────────────────────────────────────
const AnimatedCard: React.FC<{
  children: React.ReactNode;
  style?: any;
  delay?: number;
}> = ({ children, style, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[{ opacity: fadeAnim, transform: [{ translateY }] }, style]}
    >
      {children}
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────
const ProfileScreen: React.FC<{ navigation: ProfileScreenNav }> = ({
  navigation,
}) => {
  const { logout } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Avatar animations
  const avatarScale = useRef(new Animated.Value(0.6)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    cardBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    cardBorder: isDarkMode ? '#334155' : '#E2E8F0',
    sectionLabel: isDarkMode ? '#64748B' : '#94A3B8',
    title: isDarkMode ? '#F9FAFB' : '#0F172A',
    text: isDarkMode ? '#E5E7EB' : '#1E293B',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
    subMuted: isDarkMode ? '#64748B' : '#CBD5E1',
    quickIconBg: isDarkMode ? '#172554' : '#EFF6FF',
    divider: isDarkMode ? '#334155' : '#F1F5F9',
    signOutBg: isDarkMode ? '#172554' : '#FFFFFF',
    signOutBorder: isDarkMode ? '#1D4ED8' : '#DBEAFE',
    heroBg1: isDarkMode ? '#172554' : '#EFF6FF',
    heroBg2: isDarkMode ? '#1e3a5f' : '#DBEAFE',
  };

  const startEntryAnimations = () => {
    // Avatar pops in
    Animated.parallel([
      Animated.spring(avatarScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.timing(avatarOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Header text slides up
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        delay: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Pulse the verified badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    ).start();
  };

  const fetchProfile = async () => {
    try {
      const data = await userDetails();
      setProfile(data);
    } catch (e) {
      console.error('Profile fetch failed', e);
    } finally {
      setIsReady(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  useEffect(() => {
    if (isReady) {
      startEntryAnimations();
    }
  }, [isReady]);

  const getRoleLabel = (user_type: string) => {
    switch (user_type) {
      case 'Owner':
        return 'Owner';
      case 'Employee':
        return 'Employee';
      default:
        return 'Party';
    }
  };

  const formatMinutes = (minutes: number) => {
    if (minutes === null || minutes === undefined) return '—';
    const isNegative = minutes < 0;
    const absMinutes = Math.abs(minutes);
    if (absMinutes < 60) return `${isNegative ? '-' : ''}${absMinutes}`;
    const hrs = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return `${isNegative ? '-' : ''}${hrs} hr${hrs > 1 ? 's' : ''} ${
      mins ? (mins > 1 ? `${mins} mins` : `${mins} mins`) : ''
    }`;
  };

  const isAdmin = profile?.user_type === 'Owner';

  if (!isReady) {
    return <ProfileSkeleton />;
  }

  const timeDiff = profile?.staff_time_diff ?? 0;
  const isPositive = timeDiff > 0;
  const isNegative = timeDiff < 0;

  const statusConfig = isNegative
    ? {
        title: 'EXTRA TIME',
        iconBg: isDarkMode ? '#052E16' : '#DCFCE7',
        iconColor: isDarkMode ? '#4ADE80' : '#16A34A',
        titleColor: isDarkMode ? '#86EFAC' : '#15803D',
        valueColor: isDarkMode ? '#38ec77' : '#166534',
        unitColor: isDarkMode ? '#4ADE80' : '#22C55E',
        label: `${formatMinutes(Math.abs(timeDiff))}`,
      }
    : isPositive
    ? {
        title: 'TIME SHORT',
        iconBg: isDarkMode ? '#450A0A' : '#FEE2E2',
        iconColor: isDarkMode ? '#F87171' : '#DC2626',
        titleColor: isDarkMode ? '#FCA5A5' : '#B91C1C',
        valueColor: isDarkMode ? '#ee4646' : '#991B1B',
        unitColor: isDarkMode ? '#F87171' : '#EF4444',
        label: `${formatMinutes(timeDiff)}`,
      }
    : {
        title: 'ON TIME',
        iconBg: isDarkMode ? '#172554' : '#DBEAFE',
        iconColor: isDarkMode ? '#60A5FA' : '#2563EB',
        titleColor: isDarkMode ? '#BFDBFE' : '#64748B',
        valueColor: isDarkMode ? '#F8FAFC' : '#0F172A',
        unitColor: isDarkMode ? '#94A3B8' : '#94A3B8',
        label: `${formatMinutes(timeDiff)}`,
      };

  return (
    <>
      <NetInfoComponent onReconnect={fetchProfile} />

      <ScrollView
        style={[styles.container, { backgroundColor: theme.screenBg }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          translucent
          backgroundColor="transparent"
        />

        {/* ── Hero Header ── */}
        <View style={[styles.heroBlock, { backgroundColor: theme.heroBg1 }]}>
          {/* Decorative circles */}
          <View
            style={[
              styles.decCircle1,
              { backgroundColor: isDarkMode ? '#1e3a8a' : '#BFDBFE' },
            ]}
          />
          <View
            style={[
              styles.decCircle2,
              { backgroundColor: isDarkMode ? '#1e3358' : '#DBEAFE' },
            ]}
          />

          {/* Avatar */}
          <Animated.View
            style={[
              styles.avatarWrapper,
              {
                opacity: avatarOpacity,
                transform: [{ scale: avatarScale }],
              },
            ]}
          >
            <View style={styles.avatarRing}>
              <Image
                source={
                  profile?.profile_pic
                    ? { uri: profile.profile_pic }
                    : require('../../assets/images/profile.png')
                }
                style={styles.avatar}
              />
            </View>
            <Animated.View
              style={[
                styles.verifiedBadge,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <AppIcon name="BadgeCheck" size={16} color="#2563EB" />
            </Animated.View>
          </Animated.View>

          {/* Name + info */}
          <Animated.View
            style={{
              opacity: headerFade,
              transform: [{ translateY: headerSlide }],
              alignItems: 'center',
            }}
          >
            <Text style={[styles.userName, { color: theme.title }]}>
              {profile?.name ?? '—'}
            </Text>

            <View style={styles.rolePill}>
              <AppIcon name="Briefcase" size={11} color="#2563EB" />
              <Text style={styles.rolePillText}>
                {getRoleLabel(profile?.user_type ?? 'Employee')} • Smpl
              </Text>
            </View>

            <View style={styles.locationRow}>
              <AppIcon name="MapPin" size={12} color="#64748B" />
              <Text style={[styles.locationText, { color: theme.muted }]}>
                Gandhidham, India
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* ── Stats Grid (Employee only) ── */}
        {!isAdmin && (
          <AnimatedCard delay={100}>
            <View style={styles.statsGrid}>
              {/* My Leaves */}
              {/* <View
                style={[
                  styles.statGridCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.statGridHeader}>
                  <View style={styles.statGridIconBox}>
                    <AppIcon name="CalendarX" size={17} color="#2563EB" />
                  </View>
                  <Text style={[styles.statGridTitle, { color: theme.muted }]}>
                    MY LEAVES
                  </Text>
                </View>
                <View style={styles.statGridValueRow}>
                  <Text style={[styles.statGridNumber, { color: theme.title }]}>
                    {profile?.remaining_paid_leave ?? '—'}
                  </Text>
                  <Text style={[styles.statGridUnit, { color: theme.muted }]}>
                    left
                  </Text>
                </View>
              </View> */}

              {/* Time Difference */}
              {/* <View
                style={[
                  styles.statGridCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.statGridHeader}>
                  <View
                    style={[
                      styles.statGridIconBox,
                      { backgroundColor: statusConfig.iconBg },
                    ]}
                  >
                    <AppIcon
                      name="FileExclamationPoint"
                      size={17}
                      color={statusConfig.iconColor}
                    />
                  </View>
                  <Text
                    style={[
                      styles.statGridTitle,
                      { color: statusConfig.titleColor },
                    ]}
                  >
                    {statusConfig.title}
                  </Text>
                </View>
                <View style={styles.statGridValueRow}>
                  <Text
                    style={[
                      styles.statGridNumber,
                      {
                        color: statusConfig.valueColor,
                        fontSize: moderateScale(15),
                      },
                    ]}
                  >
                    {statusConfig.label}
                  </Text>
                </View>
              </View> */}
            </View>
          </AnimatedCard>
        )}

        {/* ── Quick Access ── */}
        <SectionLabel
          title="QUICK ACCESS"
          color={theme.sectionLabel}
          delay={180}
        />
        <AnimatedCard delay={220}>
          <View style={styles.quickGrid}>
            {[
              {
                icon: 'CalendarCheck',
                label: 'Attendance',
                onPress: () =>
                  isAdmin
                    ? navigation.navigate('AdminAttendancelist')
                    : navigation.navigate('Attendancelist'),
              },
              {
                icon: 'Umbrella',
                label: isAdmin ? 'Leaves Approval' : 'Apply Leave',
                onPress: () => navigation.navigate('LeaveList'),
              },
              {
                icon: 'PartyPopper',
                label: 'Holidays',
                onPress: () => navigation.navigate('HolidayList'),
              },
            ].map((item, index) => (
              <QuickCard
                key={item.label}
                icon={item.icon}
                label={item.label}
                onPress={item.onPress}
                cardBg={theme.cardBg}
                cardBorder={theme.cardBorder}
                iconBg={theme.quickIconBg}
                textColor={theme.text}
                delay={index * 60}
              />
            ))}
          </View>
        </AnimatedCard>

        {/* ── Operations ── */}
        <SectionLabel
          title="OPERATIONS"
          color={theme.sectionLabel}
          delay={300}
        />
        <AnimatedCard
          delay={340}
          style={[
            styles.menuCard,
            { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
          ]}
        >
          {/* <MenuRow
            iconName="ClipboardList"
            label="Work Logs"
            textColor={theme.text}
            iconBoxBackgroundColor={theme.quickIconBg}
            chevronColor={theme.muted}
            onPress={() => navigation.navigate('WorkLog')}
          /> */}
          <RowDivider color={theme.divider} />
          {!isAdmin && (
            <>
              <MenuRow
                iconName="IndianRupee"
                label="Salary"
                textColor={theme.text}
                iconBoxBackgroundColor={theme.quickIconBg}
                chevronColor={theme.muted}
                onPress={() => navigation.navigate('Salary')}
              />
              <RowDivider color={theme.divider} />
            </>
          )}
          {/* <MenuRow
            iconName="Laptop"
            label="Projects"
            textColor={theme.text}
            iconBoxBackgroundColor={theme.quickIconBg}
            chevronColor={theme.muted}
            onPress={() => navigation.navigate('Project')}
          />
          <RowDivider color={theme.divider} />
          <MenuRow
            iconName="AlarmClock"
            label="Reminder"
            onPress={() => navigation.navigate('ProjectReminder')}
            textColor={theme.text}
            iconBoxBackgroundColor={theme.quickIconBg}
            chevronColor={theme.muted}
          />
          <RowDivider color={theme.divider} />
          <MenuRow
            iconName="FolderClock"
            label="Project Remaining"
            onPress={() => navigation.navigate('ProjectRemainingScreen')}
            textColor={theme.text}
            iconBoxBackgroundColor={theme.quickIconBg}
            chevronColor={theme.muted}
          /> */}
        </AnimatedCard>

        {/* ── System ── */}
        <SectionLabel title="SYSTEM" color={theme.sectionLabel} delay={420} />
        <AnimatedCard
          delay={460}
          style={[
            styles.menuCard,
            { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
          ]}
        >
          <MenuRow
            iconName="Bell"
            label="Notifications"
            textColor={theme.text}
            iconBoxBackgroundColor={theme.quickIconBg}
            chevronColor={theme.muted}
            onPress={() => navigation.navigate('NotificationScreen')}
          />
        </AnimatedCard>

        {/* ── Sign Out ── */}
        <AnimatedCard delay={520}>
          <SignOutButton
            onPress={logout}
            bg={theme.signOutBg}
            border={theme.signOutBorder}
          />
        </AnimatedCard>

        {/* Footer */}
        <Text style={[styles.versionText, { color: theme.subMuted }]}>
          JATAYU TECHNOLOGIES {VersionCheck.getCurrentVersion()}
        </Text>
      </ScrollView>
    </>
  );
};

// ─── Quick Card with press animation ──────────────────────────
const QuickCard: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  textColor: string;
  delay?: number;
}> = ({ icon, label, onPress, cardBg, cardBorder, iconBg, textColor }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  return (
    <Animated.View
      style={[styles.quickCardWrap, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[
          styles.quickCard,
          { backgroundColor: cardBg, borderColor: cardBorder },
        ]}
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.quickIconBox, { backgroundColor: iconBg }]}>
          <AppIcon name={icon} size={22} color="#2563EB" />
        </View>
        <Text style={[styles.quickLabel, { color: textColor }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Sign Out Button ───────────────────────────────────────────
const SignOutButton: React.FC<{
  onPress: () => void;
  bg: string;
  border: string;
}> = ({ onPress, bg, border }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.signOutBtn,
          { backgroundColor: bg, borderColor: border },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <AppIcon name="LogOut" size={17} color="#2563EB" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: verticalScale(40) },

  // ── Hero ──────────────────────────────────────────────────────
  heroBlock: {
    alignItems: 'center',
    paddingTop: verticalScale(50),
    paddingBottom: verticalScale(32),
    marginBottom: verticalScale(20),
    overflow: 'hidden',
    borderBottomLeftRadius: moderateScale(34),
    borderBottomRightRadius: moderateScale(34),
  },
  decCircle1: {
    position: 'absolute',
    width: moderateScale(200),
    height: moderateVerticalScale(200),
    borderRadius: moderateScale(110),
    top: verticalScale(-60),
    right: scale(-68),
    opacity: 0.6,
  },
  decCircle2: {
    position: 'absolute',
    width: moderateScale(140),
    height: moderateVerticalScale(140),
    borderRadius: moderateScale(70),
    bottom: verticalScale(-40),
    left: scale(-50),
    opacity: 0.5,
  },

  // ── Avatar ────────────────────────────────────────────────────
  avatarWrapper: {
    position: 'relative',
    marginBottom: verticalScale(16),
  },
  avatarRing: {
    padding: moderateScale(3),
    borderRadius: moderateScale(50),
    backgroundColor: '#FFFFFF',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: moderateScale(80),
    height: moderateVerticalScale(80, 0.3),
    borderRadius: moderateScale(44),
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(10),
    padding: moderateScale(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  // ── Name / Role ───────────────────────────────────────────────
  userName: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: verticalScale(8),
    letterSpacing: -0.3,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(5),
    backgroundColor: '#DBEAFE',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(8),
  },
  rolePillText: {
    fontSize: moderateScale(11),
    color: '#2563EB',
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: { fontSize: moderateScale(11), color: '#64748B' },

  // ── Stats ─────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: moderateScale(14),
    gap: moderateScale(12),
    marginBottom: verticalScale(22),
  },
  statGridCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statGridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(12),
  },
  statGridIconBox: {
    width: moderateScale(30),
    height: moderateVerticalScale(30, 0.3),
    borderRadius: moderateScale(7),
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGridTitle: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  statGridValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: moderateScale(5),
    marginBottom: verticalScale(4),
  },
  statGridNumber: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#0F172A',
  },
  statGridUnit: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: '#94A3B8',
  },

  // ── Quick Access ──────────────────────────────────────────────
  quickGrid: {
    flexDirection: 'row',
    marginHorizontal: moderateScale(12),
    gap: moderateScale(10),
    marginBottom: verticalScale(20),
  },
  quickCardWrap: { flex: 1 },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(7),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    gap: 10,
  },
  quickIconBox: {
    width: moderateScale(40),
    height: moderateVerticalScale(40, 0.3),
    borderRadius: moderateScale(12),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },

  // ── Section Label ─────────────────────────────────────────────
  sectionAccent: {
    width: 3,
    height: moderateVerticalScale(12),
    borderRadius: 2,
  },
  sectionLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },

  // ── Menu Card ─────────────────────────────────────────────────
  menuCard: {
    marginHorizontal: moderateScale(16),
    borderRadius: moderateScale(18),
    marginBottom: verticalScale(18),
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(14),
    gap: 12,
  },
  menuIconBox: {
    width: moderateScale(38),
    height: moderateVerticalScale(38),
    borderRadius: moderateScale(11),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#1E293B',
  },
  menuBadge: {
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(6),
    paddingVertical: verticalScale(3),
  },
  menuBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  notifDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#2563EB',
    marginRight: scale(4),
  },
  chevronWrapper: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(37,99,235,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: scale(20),
  },

  // ── Sign Out ──────────────────────────────────────────────────
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: moderateScale(14),
    paddingVertical: verticalScale(14),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    gap: 8,
    marginBottom: verticalScale(20),
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.2,
  },

  // ── Footer ────────────────────────────────────────────────────
  versionText: {
    textAlign: 'center',
    fontSize: moderateScale(10),
    color: '#CBD5E1',
    letterSpacing: 1,
    fontWeight: '500',
    marginBottom: verticalScale(8),
  },
});
