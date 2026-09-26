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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  badgeColor = '#FFF7CC',
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
          <AppIcon name={iconName} size={19} color="#111111" />
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
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Avatar animations
  const avatarScale = useRef(new Animated.Value(0.6)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const theme = {
    screenBg: isDarkMode ? '#111111' : '#F5F6F7',
    cardBg: isDarkMode ? '#1C1C1C' : '#FFFFFF',
    cardBorder: isDarkMode ? '#333333' : '#E4E6E8',
    sectionLabel: isDarkMode ? '#A3A3A3' : '#6B7280',
    title: isDarkMode ? '#FFFFFF' : '#171717',
    text: isDarkMode ? '#F3F4F6' : '#242424',
    muted: isDarkMode ? '#A3A3A3' : '#5F6368',
    subMuted: isDarkMode ? '#737373' : '#8A8F98',
    quickIconBg: isDarkMode ? '#2A260F' : '#FFF7CC',
    divider: isDarkMode ? '#333333' : '#EDEDED',
    signOutBg: isDarkMode ? '#1C1C1C' : '#FFFFFF',
    signOutBorder: isDarkMode ? '#5A4A00' : '#E7C000',
    heroBg1: isDarkMode ? '#1C1C1C' : '#111111',
    heroBg2: isDarkMode ? '#2A2A2A' : '#1C1C1C',
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
      console.log('data',data)
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
        iconBg: isDarkMode ? '#2A260F' : '#FFF7CC',
        iconColor: isDarkMode ? '#F9C900' : '#111111',
        titleColor: isDarkMode ? '#FDE68A' : '#64748B',
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
              { backgroundColor: isDarkMode ? '#3A3300' : '#F9C900' },
            ]}
          />
          <View
            style={[
              styles.decCircle2,
              { backgroundColor: isDarkMode ? '#2A260F' : '#FFF7CC' },
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
              <AppIcon name="BadgeCheck" size={16} color="#111111" />
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
              <AppIcon name="Briefcase" size={11} color="#111111" />
              <Text style={styles.rolePillText}>
                {getRoleLabel(profile?.user_type ?? 'Employee')} • Smpl
              </Text>
            </View>

            <View style={styles.locationRow}>
              <AppIcon name="MapPin" size={12} color="#64748B" />
              <Text style={[styles.locationText, { color: theme.muted }]}>
                Employee Profile
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* ── Employee Information ── */}
        <AnimatedCard
          delay={80}
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View style={styles.infoHeader}>
            <View style={styles.infoHeaderIcon}>
              <AppIcon name="UserRound" size={18} color="#111111" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: theme.title }]}>Employee Information</Text>
              <Text style={[styles.infoSubtitle, { color: theme.muted }]}>Your registered account details</Text>
            </View>
          </View>

          <InfoRow label="Employee ID" value={profile?.employee?.employee_code ? String(profile?.employee?.employee_code) : '—'} textColor={theme.text} mutedColor={theme.muted} dividerColor={theme.divider} />
          <InfoRow label="Mobile" value={profile?.mobile_no || '—'} textColor={theme.text} mutedColor={theme.muted} dividerColor={theme.divider} />
          <InfoRow label="Email" value={profile?.email || '—'} textColor={theme.text} mutedColor={theme.muted} dividerColor={theme.divider} />
          <InfoRow label="Date of Joining" value={profile?.employee?.date_of_joining || '—'} textColor={theme.text} mutedColor={theme.muted} dividerColor={theme.divider} last />
        </AnimatedCard>

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
                    <AppIcon name="CalendarX" size={17} color="#111111" />
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
        <AnimatedCard delay={220} style={styles.quickAccessAnimatedCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            directionalLockEnabled
            contentContainerStyle={styles.quickScrollContent}
          >
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
          </ScrollView>
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
            </>
          )}
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
            textColor={theme.text}
          />
        </AnimatedCard>

        {/* Footer */}
        <Text style={[styles.versionText, { color: theme.subMuted }]}>
          Shantinath Motors Pvt Ltd {VersionCheck.getCurrentVersion()}
        </Text>
      </ScrollView>
    </>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
  dividerColor?: string;
  last?: boolean;
}> = ({ label, value, textColor, mutedColor, dividerColor = '#EEEEEE', last }) => (
  <View
    style={[
      styles.infoRow,
      { borderBottomColor: dividerColor },
      last && { borderBottomWidth: 0 },
    ]}
  >
    <Text style={[styles.infoLabel, { color: mutedColor }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: textColor }]} numberOfLines={2}>{value}</Text>
  </View>
);

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
          <AppIcon
            name={icon}
            size={22}
            color={iconBg === '#2A260F' ? '#F9C900' : '#111111'}
          />
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
  textColor: string;
}> = ({ onPress, bg, border, textColor }) => {
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
        <AppIcon name="LogOut" size={17} color={textColor} />
        <Text style={[styles.signOutText, { color: textColor }]}>Sign Out</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: verticalScale(40), width: '100%', alignItems: 'center' },

  // ── Hero ──────────────────────────────────────────────────────
  heroBlock: {
    width: '100%',
    maxWidth: 1120,
    alignItems: 'center',
    paddingTop: verticalScale(34),
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
    shadowColor: '#F9C900',
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
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
    marginBottom: verticalScale(8),
    letterSpacing: -0.3,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(5),
    backgroundColor: '#FFF7CC',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(8),
  },
  rolePillText: {
    fontSize: moderateScale(11),
    color: '#111111',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: { fontSize: moderateScale(11), fontFamily: 'Poppins-Regular', color: '#64748B' },

  // ── Employee Info ────────────────────────────────────────────
  infoCard: {
    width: '92%',
    maxWidth: 980,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(18),
    borderWidth: 1,
    marginHorizontal: moderateScale(16),
    marginBottom: verticalScale(20),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) },
  infoHeaderIcon: {
    width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(11),
    alignItems: 'center', justifyContent: 'center', marginRight: moderateScale(10),
  },
  infoTitle: { fontSize: moderateScale(14), fontWeight: '800', fontFamily: 'Poppins-SemiBold' },
  infoSubtitle: { fontSize: moderateScale(10), marginTop: 2, fontFamily: 'Poppins-Regular' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', minHeight: verticalScale(38),
    paddingVertical: verticalScale(7), borderBottomWidth: 1,
  },
  infoLabel: { width: moderateScale(105), fontSize: moderateScale(11), fontWeight: '600', fontFamily: 'Poppins-Medium' },
  infoValue: { flex: 1, textAlign: 'right', fontSize: moderateScale(12), fontWeight: '600', fontFamily: 'Poppins-Medium' },

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
    backgroundColor: '#FFF7CC',
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
    fontFamily: 'Poppins-SemiBold',
    color: '#0F172A',
  },
  statGridUnit: {
    fontSize: moderateScale(11),
    fontWeight: '500',
    color: '#94A3B8',
  },

  // ── Quick Access ──────────────────────────────────────────────
  quickAccessAnimatedCard: {
    width: '100%',
    marginBottom: verticalScale(20),
  },
  quickScrollContent: {
    paddingHorizontal: moderateScale(16),
  },
  quickGrid: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  quickCardWrap: {
    width: moderateScale(118),
  },
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
    backgroundColor: '#FFF7CC',
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
    fontFamily: 'Poppins-SemiBold',
    color: '#94A3B8',
    letterSpacing: 1,
  },

  // ── Menu Card ─────────────────────────────────────────────────
  menuCard: {
    width: '92%',
    maxWidth: 980,
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
    backgroundColor: '#FFF7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: moderateScale(14),
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
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
    backgroundColor: '#F9C900',
    marginRight: scale(4),
  },
  chevronWrapper: {
    width: moderateScale(26),
    height: moderateScale(26),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(249,201,0,0.14)',
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
    backgroundColor: '#E7C000',
    borderRadius: moderateScale(16),
    borderWidth: 1.5,
    borderColor: '#E7C000',
    gap: 8,
    marginBottom: verticalScale(20),
    shadowColor: '#F9C900',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  signOutText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
    color: '#5e5c5c',
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
