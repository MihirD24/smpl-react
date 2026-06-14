import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StatusBar, useColorScheme } from 'react-native';
import SignIn from '../screens/signIn/signIn';



const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#111827' : '#F6FAFF';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="signIn"
          component={SignIn}
          options={{
            headerShown: false,
            headerBackTitleVisible: false,
            contentStyle: { backgroundColor },
          }}
        />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default AuthStack;
           
