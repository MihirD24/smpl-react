import React,{useContext} from 'react';
import {Platform,StatusBar} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Home from '../screens/home/home';
import Punch from '../screens/attandance/punch';
import ProfilePage from '../screens/profile/profile';
import ServiceVisitList from '../screens/serviceVisit/serviceVisitList';
import {AuthContext} from '../context/authContext';
import AppIcon from '../components/appIcon';
import ErpNavTitle from '../components/ErpNavTitle';
import {useAppTheme} from '../constant/theme';
const Tab=createBottomTabNavigator();
export default function TabNavigator(){const {userInfo}=useContext(AuthContext);const {theme,dark}=useAppTheme();const insets=useSafeAreaInsets();
 const header=(title:string,eyebrow:string)=>( {headerTitle:()=> <ErpNavTitle title={title} eyebrow={eyebrow}/>,headerTitleAlign:'left' as const,headerStyle:{backgroundColor:theme.surface,height:Platform.OS==='ios'?96:70},headerShadowVisible:false,headerRight:undefined});
 return <><StatusBar translucent backgroundColor="transparent" barStyle={dark?'light-content':'dark-content'}/><Tab.Navigator screenOptions={({route})=>({headerShown:true,sceneStyle:{backgroundColor:theme.background},tabBarActiveTintColor:theme.primary,tabBarInactiveTintColor:theme.muted,tabBarLabelStyle:{fontSize:10,fontWeight:'800',marginBottom:Platform.OS==='ios'?0:1},tabBarIconStyle:{marginTop:2},tabBarStyle:{height:Platform.OS==='ios'?72:62,paddingTop:6,paddingBottom:Math.max(8,insets.bottom?8:6),backgroundColor:theme.surface,borderTopWidth:1,borderTopColor:theme.border},tabBarIcon:({color,size,focused})=><AppIcon name={route.name==='Home'?'House':route.name==='Punch'?'ScanLine':route.name==='ServiceVisitList'?'MapPin':'UserRound'} color={color} size={size}/>,...header(route.name==='Home'?'Dashboard':route.name==='Punch'?'Punch In / Out':route.name==='ServiceVisitList'?'Service Visits':'My Profile',route.name==='Home'?'Today at a glance':route.name==='Punch'?'Attendance':route.name==='ServiceVisitList'?'Field operations':'Account')})}>
  <Tab.Screen name="Home" component={Home} options={({navigation})=>({tabBarLabel:'Home',headerRight:()=> <AppIcon name="Bell" color={theme.primary} size={20} style={{marginRight:16}}/>})}/>
  {userInfo?.role==='Employee'&&<Tab.Screen name="Punch" component={Punch} options={{tabBarLabel:'Punch'}}/>}
  <Tab.Screen name="ServiceVisitList" component={ServiceVisitList} options={{tabBarLabel:'Visits'}}/>
  <Tab.Screen name="Profile" component={ProfilePage} options={{tabBarLabel:'Profile'}}/>
 </Tab.Navigator></>;
}
