import React, { useContext, useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
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
import { BRAND } from '../assets/style/brandTheme';

const Tab = createBottomTabNavigator();

// ─── Home Header Component ───────────────────────────────────────────────────
interface HomeHeaderProps {
  navigation: any;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ navigation }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
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
    bg: isDarkMode ? '#1E2028' : '#FFFFFF',
    border: isDarkMode ? '#2A2D38' : '#F0F3FF',
    text: isDarkMode ? '#F0F0F0' : '#1A1D2E',
    sub: '#9098B1',
    primary: BRAND.yellow,
  };

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: t.bg,
          borderBottomColor: t.border,
        },
      ]}
    >
      <View style={styles.headerBrand}>
        <View style={styles.headerLogoWrap}>
          <BrandLogo width={86} height={31} compact />
        </View>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerGreeting, { color: t.sub }]}>WELCOME BACK</Text>
          <Text style={[styles.headerName, { color: t.text }]} numberOfLines={1}>
            {userName || 'Employee'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('NotificationScreen')}
        style={[styles.notifBtn, { backgroundColor: isDarkMode ? '#2A2D38' : '#FFF8D9' }]}
        activeOpacity={0.75}
      >
        <AppIcon name="Bell" color={isDarkMode ? BRAND.yellow : BRAND.black} size={20} />
        <View style={styles.notifDot} />
      </TouchableOpacity>
    </View>
  );
};

// ─── Tab Navigator ───────────────────────────────────────────────────────────
export default function TabNavigator() {
  const { userInfo } = useContext(AuthContext);
  const isDarkMode = useColorScheme() === 'dark';
  const tabTheme = {
    active: BRAND.black,
    inactive: isDarkMode ? '#94A3B8' : '#94A3B8',
    background: isDarkMode ? '#111827' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E5E7EB',
    headerBackground: isDarkMode ? '#111827' : '#FFFFFF',
    headerText: isDarkMode ? '#F8FAFC' : '#0F172A',
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
          },
          headerTintColor: tabTheme.headerText,
          tabBarActiveTintColor: tabTheme.active,
          tabBarInactiveTintColor: tabTheme.inactive,
          tabBarStyle: {
            backgroundColor: tabTheme.background,
            borderTopColor: tabTheme.border,
            borderTopWidth: 1,
            paddingBottom: 10,
            height: 68,
            paddingTop: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerBrand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  headerLogoWrap: {
    width: 92,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerLeft: {
    flex: 1,
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
