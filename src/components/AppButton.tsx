import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {useAppTheme} from '../constant/theme';
import AnimatedPressable from './AnimatedPressable';
export default function AppButton({label,onPress,loading=false,disabled=false,variant='primary',icon}:{label:string;onPress:()=>void;loading?:boolean;disabled?:boolean;variant?:'primary'|'secondary'|'ghost'|'danger';icon?:React.ReactNode}){
 const {theme,radius,spacing,shadows}=useAppTheme(); const palette=variant==='primary'?{bg:theme.primary,fg:'#fff',border:theme.primary}:variant==='danger'?{bg:theme.danger,fg:'#fff',border:theme.danger}:variant==='secondary'?{bg:theme.surface,fg:theme.text,border:theme.border}:{bg:'transparent',fg:theme.primary,border:'transparent'};
 const body=<Pressable disabled={disabled||loading} onPress={onPress} android_ripple={{color:'rgba(255,255,255,.12)'}} style={({pressed})=>[styles.button,{backgroundColor:palette.bg,borderColor:palette.border,borderRadius:radius.md,paddingHorizontal:spacing.lg},variant==='primary'&&shadows.blue,pressed&&!disabled&&styles.pressed,(disabled||loading)&&styles.disabled]}>{loading?<ActivityIndicator color={palette.fg}/>:<>{icon}<Text style={[styles.text,{color:palette.fg}]}>{label}</Text></>}</Pressable>;
 return variant==='ghost'?body:<AnimatedPressable disabled={disabled||loading}>{body}</AnimatedPressable>;
}
const styles=StyleSheet.create({button:{minHeight:moderateScale(52),width:'100%',borderWidth:1,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:8,overflow:'hidden'},text:{fontSize:moderateScale(15),fontWeight:'800'},pressed:{opacity:.92},disabled:{opacity:.45}});
