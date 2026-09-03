import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../constant/theme';
import AnimatedPressable from './AnimatedPressable';

export default function AppCard({children,style,padded=true,onPress,accessibilityLabel}:{children:React.ReactNode;style?:StyleProp<ViewStyle>;padded?:boolean;onPress?:()=>void;accessibilityLabel?:string}){
  const {theme,spacing,radius,shadows}=useAppTheme();
  const card=[styles.base,{backgroundColor:theme.surface,borderColor:theme.border,borderRadius:radius.lg,padding:padded?spacing.md:0},shadows.card,style];
  if(!onPress) return <View style={card}>{children}</View>;
  return <AnimatedPressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={card as any}>{children}</AnimatedPressable>;
}
const styles=StyleSheet.create({base:{borderWidth:StyleSheet.hairlineWidth,overflow:'hidden'}});
