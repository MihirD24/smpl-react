import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {moderateScale} from 'react-native-size-matters';
import {useAppTheme} from '../constant/theme';
export default function ErpNavTitle({title,eyebrow}:{title:string;eyebrow?:string}){const {theme}=useAppTheme();return <View style={styles.wrap}>{eyebrow&&<Text style={[styles.eyebrow,{color:theme.muted}]}>{eyebrow.toUpperCase()}</Text>}<Text style={[styles.title,{color:theme.text}]} numberOfLines={1}>{title}</Text></View>}
const styles=StyleSheet.create({wrap:{justifyContent:'center',paddingVertical:2},eyebrow:{fontSize:9,fontWeight:'800',letterSpacing:1.2,marginBottom:1},title:{fontSize:19,fontWeight:'800'}});
