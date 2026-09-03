import { useColorScheme } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export const colors = {
  blue: '#2563EB',
  blue2: '#3B82F6',
  blueSoft: '#EAF2FF',
  navy: '#071522',
  navy2: '#0D2033',
  yellow: '#F4B400',
  yellowSoft: '#FFF4CC',
  green: '#0FBA83',
  greenSoft: '#DCF8EE',
  red: '#EF4444',
  redSoft: '#FDE7E7',
  orange: '#F59E0B',
  orangeSoft: '#FFF0CC',
  white: '#FFFFFF',
  bg: '#F4F7FB',
  text: '#0B1728',
  muted: '#687B94',
  border: '#DCE5F0',
  slate: '#EEF3F8',
};

export const lightTheme = {
  background: colors.bg,
  surface: colors.white,
  surface2: '#F8FAFD',
  text: colors.text,
  muted: colors.muted,
  border: colors.border,
  primary: colors.blue,
  primarySoft: colors.blueSoft,
  success: colors.green,
  danger: colors.red,
  warning: colors.orange,
};

export const darkTheme = {
  background: '#08121E',
  surface: '#102236',
  surface2: '#142A40',
  text: '#F4F8FC',
  muted: '#A1B0C2',
  border: '#263F59',
  primary: colors.blue2,
  primarySoft: '#18335E',
  success: '#19C58F',
  danger: '#FF625F',
  warning: '#F8B84A',
};

export const spacing = {
  xxs: moderateScale(4), xs: moderateScale(8), sm: moderateScale(12),
  md: moderateScale(16), lg: moderateScale(20), xl: moderateScale(24),
  xxl: moderateScale(32), section: verticalScale(24),
};
export const radius = {
  sm: moderateScale(9), md: moderateScale(12), lg: moderateScale(16),
  xl: moderateScale(22), pill: moderateScale(999),
};
export const typography = {
  h1: {fontSize: moderateScale(26), lineHeight: moderateScale(32), fontWeight: '800' as const},
  h2: {fontSize: moderateScale(20), lineHeight: moderateScale(26), fontWeight: '800' as const},
  h3: {fontSize: moderateScale(17), lineHeight: moderateScale(23), fontWeight: '700' as const},
  body: {fontSize: moderateScale(14), lineHeight: moderateScale(20), fontWeight: '400' as const},
  small: {fontSize: moderateScale(11), lineHeight: moderateScale(15), fontWeight: '700' as const},
};
export const shadows = {
  card: {shadowColor:'#0B1728', shadowOffset:{width:0,height:8}, shadowOpacity:0.075, shadowRadius:20, elevation:3},
  floating: {shadowColor:'#0B1728', shadowOffset:{width:0,height:10}, shadowOpacity:0.14, shadowRadius:22, elevation:7},
  blue: {shadowColor:'#2563EB', shadowOffset:{width:0,height:7}, shadowOpacity:0.2, shadowRadius:14, elevation:5},
};
export function useAppTheme(){ const dark=useColorScheme()==='dark'; return {dark, theme:dark?darkTheme:lightTheme, colors, spacing, radius, typography, shadows}; }
