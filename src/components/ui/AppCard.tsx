import React from 'react';
import { View, ViewProps, StyleSheet, useColorScheme } from 'react-native';
import { getTheme, radius, elevation } from '../../theme';
export default function AppCard({style,...props}:ViewProps){const dark=useColorScheme()==='dark'; const t=getTheme(dark); return <View {...props} style={[styles.card,{backgroundColor:t.surface,borderColor:t.border},style]}/>}
const styles=StyleSheet.create({card:{borderWidth:1,borderRadius:radius.lg,padding:16,...elevation}});
