import React, { useContext, useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from '../screens/home/home';
import Punch from '../screens/attandance/punch';
import ProfilePage from '../screens/profile/profile';
import ServiceVisitList from '../screens/serviceVisit/serviceVisitList';
import { AuthContext } from '../context/authContext';
import AppIcon from '../components/appIcon';
import BrandLogo from '../components/brandLogo';
import { BRAND, getBrandTheme, isTabletWidth } from '../assets/style/brandTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

// ─── Home Header Component ───────────────────────────────────────────────────
interface HomeHeaderProps {
  navigation: any;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tablet = isTabletWidth(width);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          setUserName(parsed.name ?? '');
        }
      } catch (_) {}
    };
    fetchUser();
  }, []);

  const t = {
    bg: isDarkMode ? '#151719' : '#FFFFFF',
    border: isDarkMode ? '#292C30' : '#E9EDF1',
    text: isDarkMode ? '#F7F7F8' : '#111827',
    sub: isDarkMode ? '#A5ABB3' : '#64748B',
  };

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: t.bg,
          borderBottomColor: t.border,
          paddingTop: Math.max(insets.top, 8),
        },
      ]}
    >
      {tablet ? (
        <View style={styles.tabletHeaderRow}>
          <View style={styles.headerLogoWrapTablet}>
            <BrandLogo width={142} height={43} compact />
          </View>
          <View style={styles.headerLeftTablet}>
            <Text style={[styles.headerGreeting, { color: t.sub }]}>WELCOME BACK</Text>
            <Text style={[styles.headerName, { color: t.text }]} numberOfLines={1}>
              {userName || 'Employee'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationScreen')}
            style={[styles.notifBtn, { backgroundColor: isDarkMode ? '#25282C' : '#FFF7CC' }]}
            activeOpacity={0.75}
          >
            <AppIcon name="Bell" color={isDarkMode ? BRAND.yellow : BRAND.black} size={21} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.mobileHeaderTop}>
            <View style={styles.headerLogoWrapMobile}>
              <BrandLogo width={142} height={42} compact />
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationScreen')}
              style={[styles.notifBtn, { backgroundColor: isDarkMode ? '#25282C' : '#FFF7CC' }]}
              activeOpacity={0.75}
            >
              <AppIcon name="Bell" color={isDarkMode ? BRAND.yellow : BRAND.black} size={21} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
          <View style={styles.mobileWelcomeRow}>
            <View style={styles.welcomeAccent} />
            <View style={styles.headerLeftMobile}>
              <Text style={[styles.headerGreeting, { color: t.sub }]}>WELCOME BACK</Text>
              <Text style={[styles.headerName, { color: t.text }]} numberOfLines={1}>
                {userName || 'Employee'}
              </Text>
            </View>
            <View style={styles.systemBadge}>
              <Text style={styles.systemBadgeText}>HRMS</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

// ─── Tab Navigator ───────────────────────────────────────────────────────────
export default function TabNavigator() {
  const { userInfo } = useContext(AuthContext);
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getBrandTheme(isDarkMode);
  const tabTheme = {
    active: theme.tabActive,
    inactive: theme.tabInactive,
    background: theme.tabBar,
    border: theme.border,
    headerBackground: theme.tabBar,
    headerText: theme.text,
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => null,
          headerStyle: {
            backgroundColor: tabTheme.headerBackground,
          },
          headerTitleStyle: {
            color: tabTheme.headerText,
            fontFamily: 'Poppins-SemiBold',
            fontSize: 17,
          },
          headerTintColor: tabTheme.headerText,
          tabBarLabelStyle: {
            fontFamily: 'Poppins-Medium',
            fontSize: 11,
          },
          tabBarActiveTintColor: tabTheme.active,
          tabBarInactiveTintColor: tabTheme.inactive,
          tabBarStyle: {
            backgroundColor: tabTheme.background,
            borderTopColor: tabTheme.border,
            borderTopWidth: 1,
            paddingBottom: 10,
            height: 68,
            paddingTop: 8,
            paddingHorizontal: 2,
          },
        }}
      >
        {/* Home — custom Welcome Back header */}
        <Tab.Screen
          name="Home"
          component={Home}
          options={({ navigation }) => ({
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="Home" color={color} size={size} />
            ),
            // Fully custom header for Home tab only
            header: () => <HomeHeader navigation={navigation} />,
          })}
        />

        {/* Admin - Transaction List */}
        {/* {userInfo?.role === 'Owner' && (
          <Tab.Screen
            name="TransactionList"
            component={TransactionList}
            options={{
              tabBarLabel: 'Account',
              tabBarIcon: ({ color, size }) => (
                <AppIcon name="Book" color={color} size={size} />
              ),
              headerTitle: 'Transaction List',
            }}
          />
        )} */}

        {/* Employee - Punch */}
        {userInfo?.role === 'Employee' && (
          <Tab.Screen
            name="Punch"
            component={Punch}
            options={{
              tabBarLabel: 'Punch',
              tabBarIcon: ({ color, size }) => (
                <AppIcon name="Camera" color={color} size={size} />
              ),
              headerTitle: 'Punch',
            }}
          />
        )}

        {/* Service Visit */}
        <Tab.Screen
          name="ServiceVisitList"
          component={ServiceVisitList}
          options={{
            tabBarLabel: 'Service Visit',
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="MapPin" color={color} size={size} />
            ),
            headerTitle: 'Service Visits',
          }}
        />

        {/* Profile */}
        <Tab.Screen
          name="Profile"
          component={ProfilePage}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="User" color={color} size={size} />
            ),
            headerTitle: 'Profile',
          }}
        />
      </Tab.Navigator>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  headerContainer: {
    minHeight: 100,
    paddingHorizontal: 16,
    paddingBottom: 11,
    borderBottomWidth: 1,
  },
  tabletHeaderRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileHeaderTop: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogoWrapMobile: {
    width: 150,
    height: 43,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerLogoWrapTablet: {
    width: 150,
    height: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 18,
  },
  headerLeftTablet: {
    flex: 1,
  },
  mobileWelcomeRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  welcomeAccent: {
    width: 4,
    height: 30,
    borderRadius: 2,
    backgroundColor: BRAND.yellow,
    marginRight: 9,
  },
  headerLeftMobile: {
    flex: 1,
    minWidth: 0,
  },
  systemBadge: {
    marginLeft: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: BRAND.black,
  },
  systemBadgeText: {
    color: BRAND.yellow,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerGreeting: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D92D20',
  },
});
