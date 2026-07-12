import React, { useEffect, JSX } from 'react';
import { AppState, useColorScheme } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { setupNotificationListeners } from './src/helper/notificationHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { requestNotificationPermission } from './src/utils';
import { AuthProvider } from './src/context/authContext';
import AppNav from './src/navigation/appNav';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import RNBootSplash from 'react-native-bootsplash';
import { NetInfoProvider } from './src/context/NetInfoContext';
export const navigationRef = createNavigationContainerRef();

const CustomDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: '#0F172A',
    primary: '#3B82F6',
    card: '#1E293B',
    text: '#F8FAFC',
    border: '#334155',
    notification: '#F87171',
  },
};

const CustomDefaultTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: '#F8FAFC',
    primary: '#2563EB',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    notification: '#EF4444',
  },
};
function App(): JSX.Element {
  const theme = useColorScheme();
  const getToken = async () => {
    let fcmToken = await AsyncStorage.getItem('fcmToken');

    // if (fcmToken === null) {
    //   try {
    //     await messaging().registerDeviceForRemoteMessages();
    //     const fcmToken = await messaging().getToken();

    //     if (fcmToken) {
    //       await AsyncStorage.setItem('fcmToken', fcmToken);
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  };

  useEffect(() => {
    getToken();
    // Request permissions and setup listeners once
    const initializeNotifications = async () => {
      const permissionGranted = await requestNotificationPermission();

      if (permissionGranted) {
        setupNotificationListeners();
        notifee.setBadgeCount(0).then(() => console.log('Badge count removed'));
      }
    };

    initializeNotifications();

    // App state listener
    const appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        if (nextAppState === 'active') {
          notifee.cancelAllNotifications();
        }
      },
    );

    // Cleanup function
    return () => {
      appStateListener.remove();
    };
  }, []);

  return (
    <NavigationContainer
      // onReady={() => {
      //   RNBootSplash.hide({ fade: true });
      // }}
      theme={theme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}
      ref={navigationRef}
    >
      <NetInfoProvider>
        <AuthProvider>
          <KeyboardProvider>
            <AppNav />
          </KeyboardProvider>
        </AuthProvider>
      </NetInfoProvider>
      <FlashMessage duration={3000} position="top" floating />
    </NavigationContainer>
  );
}

export default App;
