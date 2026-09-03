import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import AppIcon, { IconName } from '../appIcon';
import { moderateScale, verticalScale } from 'react-native-size-matters';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: IconName;
  rightLabel?: string;
  rightIcon?: IconName;
  onRightPress?: () => void;
  dark?: boolean;
  style?: ViewStyle;
};

const ModernTopBar: React.FC<Props> = ({
  eyebrow, title, subtitle, icon, rightLabel, rightIcon, onRightPress, dark = false, style,
}) => {
  const text = dark ? '#F8FAFC' : '#0F172A';
  const muted = dark ? '#94A3B8' : '#64748B';
  return (
    <View style={[styles.root, style]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: dark ? '#172554' : '#EAF1FF' }]}>
          <AppIcon name={icon} size={moderateScale(20)} color="#2563EB" />
        </View>
      ) : null}
      <View style={styles.copy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: muted }]}>{eyebrow}</Text> : null}
        <Text numberOfLines={1} style={[styles.title, { color: text }]}>{title}</Text>
        {subtitle ? <Text numberOfLines={1} style={[styles.subtitle, { color: muted }]}>{subtitle}</Text> : null}
      </View>
      {(rightLabel || rightIcon) ? (
        <TouchableOpacity disabled={!onRightPress} onPress={onRightPress} activeOpacity={0.8} style={[styles.action, { backgroundColor: dark ? '#182132' : '#FFFFFF', borderColor: dark ? '#2F3A4E' : '#E4EAF3' }]}>
          {rightIcon ? <AppIcon name={rightIcon} size={moderateScale(18)} color="#2563EB" /> : null}
          {rightLabel ? <Text style={[styles.actionText, { color: text }]}>{rightLabel}</Text> : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), paddingHorizontal: moderateScale(18), paddingTop: verticalScale(8), paddingBottom: verticalScale(12) },
  copy: { flex: 1 },
  iconWrap: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: moderateScale(8), fontWeight: '800', letterSpacing: 1.5, marginBottom: verticalScale(3) },
  title: { fontSize: moderateScale(22), fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { marginTop: verticalScale(3), fontSize: moderateScale(10.5), fontWeight: '500' },
  action: { minWidth: moderateScale(46), height: moderateScale(42), paddingHorizontal: moderateScale(12), borderRadius: moderateScale(14), borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: moderateScale(6) },
  actionText: { fontSize: moderateScale(10), fontWeight: '700' },
});

export default ModernTopBar;
