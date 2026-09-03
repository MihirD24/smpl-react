import React,{useState} from 'react';
import {StyleSheet,Text,TextInput,TextInputProps,View} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import * as Icons from 'lucide-react-native';
import {useAppTheme} from '../constant/theme';
export default function AppInput({label,value,onChangeText,placeholder,error,iconName,multiline=false,required=false,...rest}:{label?:string;value:string;onChangeText:(t:string)=>void;placeholder?:string;error?:string;iconName?:keyof typeof Icons;multiline?:boolean;required?:boolean}&Omit<TextInputProps,'style'|'value'|'onChangeText'| 'multiline'>){
 const {theme}=useAppTheme(); const [focus,setFocus]=useState(false); const Icon=iconName?Icons[iconName] as any:null;
 return <View style={styles.field}>{label&&<Text style={[styles.label,{color:focus?theme.primary:theme.muted}]}>{label}{required&&<Text style={{color:theme.danger}}> *</Text>}</Text>}<View style={[styles.box,{backgroundColor:theme.surface,borderColor:error?theme.danger:focus?theme.primary:theme.border,borderRadius:12,minHeight:multiline?110:52}]}>{Icon&&<Icon size={18} color={focus?theme.primary:theme.muted}/>}<TextInput {...rest} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.muted} multiline={multiline} numberOfLines={multiline?4:1} onFocus={e=>{setFocus(true);rest.onFocus?.(e)}} onBlur={e=>{setFocus(false);rest.onBlur?.(e)}} style={[styles.input,{color:theme.text},multiline&&styles.area]}/></View>{error&&<Text style={[styles.error,{color:theme.danger}]}>{error}</Text>}</View>
}
const styles=StyleSheet.create({field:{marginBottom:14},label:{fontSize:moderateScale(12),fontWeight:'800',marginBottom:7},box:{borderWidth:1,flexDirection:'row',alignItems:'center',paddingHorizontal:12,gap:8},input:{flex:1,minHeight:48,fontSize:moderateScale(14),paddingVertical:3},area:{paddingTop:11,textAlignVertical:'top'},error:{fontSize:11,fontWeight:'700',marginTop:4}});
