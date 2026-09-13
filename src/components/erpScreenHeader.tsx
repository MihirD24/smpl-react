import React from 'react';
import { Text, TouchableOpacity, useColorScheme, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppIcon from './appIcon';
import BrandLogo from './brandLogo';
import { BRAND } from '../assets/style/brandTheme';
import { moderateScale, verticalScale } from 'react-native-size-matters';

interface Props {
  title: string;
  navigation: any;
  canGoBack?: boolean;
  eyebrow?: string;
}

const ERP_SCREEN_TITLES: Record<string, string> = {
  'Attendance List': 'WORKFORCE / ATTENDANCE',
  'Attendance Calendar': 'WORKFORCE / CALENDAR',
  'Leave Requests': 'WORKFORCE / LEAVE',
  Salary: 'PAYROLL / SALARY',
  'Service Visits': 'FIELD OPERATIONS / SERVICE',
  'New Service Visit': 'FIELD OPERATIONS / NEW VISIT',
  Notifications: 'WORKFORCE / NOTIFICATIONS',
  'Holiday List': 'WORKFORCE / HOLIDAYS',
  Profile: 'EMPLOYEE / PROFILE',
};

const ERPScreenHeader: React.FC<Props> = ({ title, navigation, canGoBack = true, eyebrow }) => {
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const bg = dark ? '#111315' : '#FFFFFF';
  const text = dark ? '#F8FAFC' : BRAND.ink;
  const muted = dark ? '#9CA3AF' : '#64748B';

  return (
    <View style={[styles.container, { backgroundColor: bg, borderBottomColor: dark ? '#2A2D30' : '#E7EAED', paddingTop: insets.top + verticalScale(5) }]}>
      <View style={styles.row}>
        {canGoBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.75}>
            <AppIcon name="ArrowLeft" size={moderateScale(20)} color={text} />
          </TouchableOpacity>
        ) : <View style={styles.backPlaceholder} />}

        <View style={styles.brandWrap}>
          <BrandLogo width={moderateScale(108)} height={moderateScale(30)} compact />
        </View>

        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: muted }]} numberOfLines={1}>{eyebrow || ERP_SCREEN_TITLES[title] || 'SHANTINATH JCB / HRMS'}</Text>
          <Text style={[styles.title, { color: text }]} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.accent} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, paddingHorizontal: moderateScale(12), paddingBottom: verticalScale(10) },
  row: { minHeight: verticalScale(48), flexDirection: 'row', alignItems: 'center' },
  backButton: { width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(12), alignItems: 'center', justifyContent: 'center', marginRight: moderateScale(5) },
  backPlaceholder: { width: moderateScale(38), marginRight: moderateScale(5) },
  brandWrap: { width: moderateScale(108), alignItems: 'flex-start', justifyContent: 'center', marginRight: moderateScale(8) },
  copy: { flex: 1, justifyContent: 'center' },
  eyebrow: { fontSize: moderateScale(8.5), fontWeight: '700', letterSpacing: 1.1, marginBottom: 2 },
  title: { fontSize: moderateScale(18), fontWeight: '800', letterSpacing: -0.2 },
  accent: { width: moderateScale(4), height: moderateScale(34), borderRadius: 2, backgroundColor: BRAND.yellow, marginLeft: moderateScale(8) },
});

export default ERPScreenHeader;
