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
            paddingBottom: 16,
            height: 70,
            paddingTop: 10,
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
