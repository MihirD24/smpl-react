import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from '../appIcon';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';

export const PRO = {
  blue: '#246BFD',
  blueDark: '#1754D1',
  bg: '#F6F8FC',
  card: '#FFFFFF',
  text: '#152238',
  muted: '#718096',
  line: '#E7ECF3',
  green: '#16A56B',
  greenSoft: '#E9F8F1',
  orange: '#D88900',
  orangeSoft: '#FFF5DE',
  red: '#E64A4A',
  redSoft: '#FFF0F0',
};

export const ProTopBar: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actionIcon?: string;
  onAction?: () => void;
}> = ({ title, subtitle, onBack, actionIcon, onAction }) => {
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const bg = dark ? '#101722' : PRO.bg;
  const text = dark ? '#F7FAFC' : PRO.text;
  const sub = dark ? '#A6B3C6' : PRO.muted;
  return (
    <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 10) + 8, backgroundColor: bg }]}> 
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconButton} activeOpacity={0.8}>
            <AppIcon name="ChevronLeft" size={22} color={text} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.center}>
        <Text style={[styles.title, { color: text }]} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { color: sub }]} numberOfLines={1}>{subtitle}</Text>}
      </View>
      <View style={styles.side}>
        {actionIcon && (
          <TouchableOpacity onPress={onAction} style={styles.iconButton} activeOpacity={0.8}>
            <AppIcon name={actionIcon as any} size={19} color={PRO.blue} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const ProPill: React.FC<{ label: string; tone?: 'blue'|'green'|'orange'|'red'|'neutral' }> = ({ label, tone='neutral' }) => {
  const tones = {
    blue: { bg:'#EAF1FF', fg:PRO.blue }, green:{ bg:PRO.greenSoft, fg:PRO.green },
    orange:{ bg:PRO.orangeSoft, fg:PRO.orange }, red:{ bg:PRO.redSoft, fg:PRO.red }, neutral:{ bg:'#EEF2F7', fg:PRO.muted }
  } as const;
  const t=tones[tone];
  return <View style={[styles.pill,{backgroundColor:t.bg}]}><Text style={[styles.pillText,{color:t.fg}]}>{label}</Text></View>;
};

export const ProMetric: React.FC<{ value: string|number; label: string; tone?: 'blue'|'green'|'orange'|'red' }> = ({value,label,tone='blue'}) => {
  const map={blue:PRO.blue,green:PRO.green,orange:PRO.orange,red:PRO.red};
  return <View style={styles.metric}><Text style={[styles.metricValue,{color:map[tone]}]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
};

export const ProDivider=()=> <View style={styles.divider}/>;

const styles=StyleSheet.create({
  topBar:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingBottom:12},
  side:{width:44,alignItems:'flex-start'}, center:{flex:1,alignItems:'center'},
  iconButton:{width:40,height:40,borderRadius:14,backgroundColor:'#FFFFFF',borderWidth:1,borderColor:'#E6EBF3',alignItems:'center',justifyContent:'center'},
  title:{fontSize:moderateScale(19),fontWeight:'800',letterSpacing:-0.25}, subtitle:{fontSize:moderateScale(11),fontWeight:'500',marginTop:2},
  pill:{paddingHorizontal:10,paddingVertical:6,borderRadius:999},pillText:{fontSize:moderateScale(10),fontWeight:'800',letterSpacing:.2},
  metric:{flex:1,minWidth:0,paddingVertical:12,paddingHorizontal:9},metricValue:{fontSize:moderateScale(20),fontWeight:'900'},metricLabel:{fontSize:moderateScale(10.5),color:PRO.muted,fontWeight:'600',marginTop:3},
  divider:{height:1,backgroundColor:PRO.line},
});
