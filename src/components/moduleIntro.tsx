import React from 'react';
import { Text, View, StyleSheet, useColorScheme } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { BRAND } from '../assets/style/brandTheme';

interface Props { eyebrow: string; title: string; description?: string; right?: React.ReactNode; }
const ModuleIntro: React.FC<Props> = ({ eyebrow, title, description, right }) => {
  const dark = useColorScheme() === 'dark';
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <View style={styles.eyebrowRow}><View style={styles.bar} /><Text style={[styles.eyebrow,{color:dark?'#A7AFBA':BRAND.slate}]}>{eyebrow}</Text></View>
        <Text style={[styles.title,{color:dark?'#F8FAFC':BRAND.ink}]}>{title}</Text>
        {!!description && <Text style={[styles.description,{color:dark?'#94A3B8':BRAND.slate}]}>{description}</Text>}
      </View>
      {right}
    </View>
  );
};
const styles=StyleSheet.create({row:{paddingHorizontal:moderateScale(16),paddingTop:verticalScale(14),paddingBottom:verticalScale(8),flexDirection:'row',alignItems:'flex-start'},copy:{flex:1},eyebrowRow:{flexDirection:'row',alignItems:'center',marginBottom:verticalScale(3)},bar:{width:moderateScale(3),height:moderateScale(12),borderRadius:2,backgroundColor:BRAND.yellow,marginRight:moderateScale(7)},eyebrow:{fontSize:moderateScale(9),fontWeight:'800',letterSpacing:1.2},title:{fontSize:moderateScale(23),fontWeight:'800',letterSpacing:-0.4},description:{fontSize:moderateScale(11),lineHeight:verticalScale(16),marginTop:verticalScale(3),maxWidth:620}});
export default ModuleIntro;
