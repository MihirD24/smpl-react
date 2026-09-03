import React from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  useColorScheme,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ServiceVisitList from '../screens/serviceVisit/serviceVisitList';
import ProfilePage from '../screens/profile/profile';
import AdminDashboard from '../screens/attandance/admin/adminDashboard';
import AppIcon from '../components/appIcon';
import staffSalary from '../screens/accounts/staffSalary';
import moment from 'moment';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  const isDarkMode = useColorScheme() === 'dark';
  const tabTheme = {
    active: isDarkMode ? '#F8FAFC' : '#000000',
    inactive: isDarkMode ? '#94A3B8' : '#999999',
    background: isDarkMode ? '#111827' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E5E7EB',
    headerBackground: isDarkMode ? '#111827' : '#FFFFFF',
    headerText: isDarkMode ? '#F8FAFC' : '#1E293B',
    headerSubtext: isDarkMode ? '#94A3B8' : '#64748B',
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
        <Tab.Screen
          name="Admin Dashboard"
          component={AdminDashboard}
          options={{
            tabBarLabel: 'Dashboard',
            headerTitleAlign: 'left',
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="Home" color={color} size={size} />
            ),
            headerTitle: () => (
              <>
                <View style={styles.header}>
                  <Text
                    style={[styles.headerTitle, { color: tabTheme.headerText }]}
                  >
                    Admin Dashboard
                  </Text>
                  <Text
                    style={[
                      styles.headerSubtitle,
                      { color: tabTheme.headerSubtext },
                    ]}
                  >
                    {moment().format('dddd, MMMM Do YYYY')}
                  </Text>
                </View>
              </>
            ),
          }}
        />

        <Tab.Screen
          name="Staff Salary"
          component={staffSalary}
          options={{
            tabBarLabel: 'Staff Salary',
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="BadgeIndianRupee" color={color} size={size} />
            ),
          }}
        />

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

        <Tab.Screen
          name="Profile"
          component={ProfilePage}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <AppIcon name="User" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: verticalScale(40),
  },

  headerTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1E293B',
  },

  headerSubtitle: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: '#64748B',
    marginTop: verticalScale(2),
  },
});
