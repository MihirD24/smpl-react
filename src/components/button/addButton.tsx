import React from 'react';
import {Platform,StyleSheet,TouchableOpacity,ViewStyle} from 'react-native';
import {scale} from 'react-native-size-matters'; import AppIcon from '../appIcon';
export default function AddButton({onPress,iconName='Plus',size=24,color='#fff',style}:{onPress:()=>void;iconName?:string;size?:number;color?:string;style?:ViewStyle}){return <TouchableOpacity accessibilityRole="button" onPress={onPress} activeOpacity={.82} style={[styles.fab,style]}><AppIcon name={iconName} size={scale(size)} color={color}/></TouchableOpacity>}
const styles=StyleSheet.create({fab:{position:'absolute',right:scale(18),bottom:Platform.OS==='ios'?scale(92):scale(78),width:scale(60),height:scale(60),borderRadius:scale(30),backgroundColor:'#2563EB',alignItems:'center',justifyContent:'center',shadowColor:'#0B1728',shadowOffset:{width:0,height:8},shadowOpacity:.2,shadowRadius:14,elevation:8}});
