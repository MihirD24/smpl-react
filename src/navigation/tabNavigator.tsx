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
    primary: '#3B6FD4',
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
      {/* Left: Welcome text */}
      <View style={styles.headerLeft}>
        <Text style={[styles.headerGreeting, { color: t.sub }]}>
          Welcome Back,
        </Text>
        <Text style={[styles.headerName, { color: t.text }]} numberOfLines={1}>
          {userName || 'User'}
        </Text>
        <Text style={[styles.headerSub, { color: t.sub }]}>
          Here is your progress for today.
        </Text>
      </View>

      {/* Right: Notification bell */}
      <TouchableOpacity
        onPress={() => navigation.navigate('NotificationScreen')}
        style={[
          styles.notifBtn,
          { backgroundColor: isDarkMode ? '#2A2D38' : '#EEF2FF' },
        ]}
        activeOpacity={0.75}
      >
        <AppIcon name="Bell" color={t.primary} size={20} />
      </TouchableOpacity>
    </View>
  );
};

// ─── Tab Navigator ───────────────────────────────────────────────────────────
export default function TabNavigator() {
  const { userInfo } = useContext(AuthContext);
  const isDarkMode = useColorScheme() === 'dark';
  const tabTheme = {
    active: '#3B82F6',
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
          headerShown: false,
          headerBackVisible: false,
          headerLeft: () => null,
          headerStyle: {
            backgroundColor: tabTheme.background,
          },
          headerTitleStyle: {
            color: tabTheme.headerText,
            fontSize: 17,
            fontWeight: '800',
          },
          headerTintColor: tabTheme.headerText,
          headerShadowVisible: false,
          tabBarActiveTintColor: tabTheme.active,
          tabBarInactiveTintColor: tabTheme.inactive,
          tabBarStyle: {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 14,
            height: 64,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? '#26334A' : '#E7EDF6',
            borderRadius: 20,
            backgroundColor: isDarkMode ? '#111827' : '#FFFFFF',
            paddingTop: 5,
            paddingBottom: 5,
            shadowColor: '#0B1220',
            shadowOpacity: isDarkMode ? 0 : 0.08,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: 7,
          },
          tabBarItemStyle: { paddingVertical: 1 },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 1 },
        }}
      >
        {/* Home — custom Welcome Back header */}
        <Tab.Screen
          name="Home"
          component={Home}
          options={({ navigation }) => ({
            headerShown: false,
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="Home" color={color} size={size} />
            ),
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
              headerShown: false,
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
    paddingHorizontal: 20,
    paddingTop: 52, // account for status bar
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerGreeting: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  headerSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
