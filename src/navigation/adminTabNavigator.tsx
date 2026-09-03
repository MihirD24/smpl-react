import React from 'react';
import {Platform,StatusBar} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ServiceVisitList from '../screens/serviceVisit/serviceVisitList';
import ProfilePage from '../screens/profile/profile';
import AdminDashboard from '../screens/attandance/admin/adminDashboard';
import staffSalary from '../screens/accounts/staffSalary';
import AppIcon from '../components/appIcon';
import ErpNavTitle from '../components/ErpNavTitle';
import {useAppTheme} from '../constant/theme';
const Tab=createBottomTabNavigator();
export default function AdminTabNavigator(){const {theme,dark}=useAppTheme();const insets=useSafeAreaInsets();const opts=(title:string,eyebrow:string)=>({headerShown:true,headerTitle:()=> <ErpNavTitle title={title} eyebrow={eyebrow}/>,headerTitleAlign:'left' as const,headerStyle:{backgroundColor:theme.surface,height:Platform.OS==='ios'?96:70},headerShadowVisible:false});return <><StatusBar translucent backgroundColor="transparent" barStyle={dark?'light-content':'dark-content'}/><Tab.Navigator screenOptions={({route})=>({sceneStyle:{backgroundColor:theme.background},tabBarActiveTintColor:theme.primary,tabBarInactiveTintColor:theme.muted,tabBarLabelStyle:{fontSize:10,fontWeight:'800'},tabBarStyle:{height:Platform.OS==='ios'?72:62,paddingTop:6,paddingBottom:Math.max(8,insets.bottom?8:6),backgroundColor:theme.surface,borderTopWidth:1,borderTopColor:theme.border},tabBarIcon:({color,size})=><AppIcon name={route.name==='Admin Dashboard'?'LayoutDashboard':route.name==='Staff Salary'?'BadgeIndianRupee':route.name==='ServiceVisitList'?'MapPin':'UserRound'} color={color} size={size}/>,...opts(route.name==='Admin Dashboard'?'Admin Dashboard':route.name==='Staff Salary'?'Staff Salary':route.name==='ServiceVisitList'?'Service Visits':'My Profile',route.name==='Admin Dashboard'?'Command centre':route.name==='Staff Salary'?'Payroll':route.name==='ServiceVisitList'?'Operations':'Account')})}>
<Tab.Screen name="Admin Dashboard" component={AdminDashboard} options={{tabBarLabel:'Dashboard'}}/><Tab.Screen name="Staff Salary" component={staffSalary} options={{tabBarLabel:'Salary'}}/><Tab.Screen name="ServiceVisitList" component={ServiceVisitList} options={{tabBarLabel:'Visits'}}/><Tab.Screen name="Profile" component={ProfilePage} options={{tabBarLabel:'Profile'}}/>
</Tab.Navigator></>}
