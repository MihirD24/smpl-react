import { Platform } from 'react-native';

export const BRAND = {
  yellow: '#F9C900',
  yellowSoft: '#FFF7CC',
  black: '#111111',
  charcoal: '#1C1C1C',
  ink: '#171717',
  slate: '#5F6368',
  muted: '#8A8F98',
  background: '#F5F6F7',
  surface: '#FFFFFF',
  border: '#E4E6E8',
  success: '#16803C',
  successSoft: '#E8F6ED',
  danger: '#C62828',
  dangerSoft: '#FDECEC',
  info: '#1F5EFF',
  infoSoft: '#EAF0FF',
  shadow: '#000000',
} as const;

export const darkBrand = {
  background: '#101112',
  surface: '#1A1C1E',
  surfaceElevated: '#222528',
  border: '#303438',
  text: '#F5F5F5',
  muted: '#A6ADB5',
};

export const lightBrand = {
  background: BRAND.background,
  surface: BRAND.surface,
  surfaceElevated: '#FFFFFF',
  border: BRAND.border,
  text: BRAND.ink,
  muted: BRAND.slate,
};

export const isTabletWidth = (width: number) => width >= 768;

export const contentMaxWidth = (width: number) =>
  width >= 1200 ? 1120 : width >= 768 ? 980 : width;

export const platformFont = Platform.select({
  ios: 'Poppins-Regular',
  android: 'Poppins-Regular',
  default: 'Poppins-Regular',
});
