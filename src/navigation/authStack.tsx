import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignIn from '../screens/signIn/signIn'; import OtpScreen from '../screens/signIn/OtpScreen';
const Stack=createNativeStackNavigator();
export default function AuthStack(){return <Stack.Navigator screenOptions={{headerShown:false,animation:'slide_from_right'}}><Stack.Screen name="signIn" component={SignIn}/><Stack.Screen name="otp" component={OtpScreen}/></Stack.Navigator>}
