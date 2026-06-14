import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, useColorScheme,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import AppIcon from '../appIcon';

export type ActiveChip = {
  key: string;
  label: string;
  color?: string;
  onRemove: () => void;
};

type Props = {
  chips: ActiveChip[];
  onClearAll: () => void;
};

const ActiveFilterChips: React.FC<Props> = ({ chips, onClearAll }) => {
  const isDark = useColorScheme() === 'dark';

  if (chips.length === 0) return null;

  return (
    <View style={[s.wrapper, isDark ? s.wrapperDark : s.wrapperLight]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}
        bounces={false}
      >
        {chips.map(chip => (
          <TouchableOpacity
            key={chip.key}
            style={[
              s.chip,
              chip.color
                ? { borderColor: chip.color, backgroundColor: chip.color + '18' }
                : undefined,
            ]}
            onPress={chip.onRemove}
            activeOpacity={0.7}
          >
            {chip.color && (
              <View style={[s.dot, { backgroundColor: chip.color }]} />
            )}
            <Text style={[s.label, { color: chip.color ?? '#3B82F6' }]}>
              {chip.label}
            </Text>
            <AppIcon
              name="X"
              size={moderateScale(9)}
              color={chip.color ?? '#3B82F6'}
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[s.clearChip, isDark ? s.clearChipDark : s.clearChipLight]}
          onPress={onClearAll}
          activeOpacity={0.7}
        >
          <Text style={[s.clearText, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
            Clear all
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ActiveFilterChips;

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  wrapper: {
    height: moderateScale(44),
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  wrapperLight: { backgroundColor: '#F8FAFC', borderBottomColor: '#E2E8F0' },
  wrapperDark:  { backgroundColor: '#161616', borderBottomColor: '#2E2E2E' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(12),
    gap: moderateScale(6),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    backgroundColor: '#EFF6FF',
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  dot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    lineHeight: moderateScale(15),
  },
  clearChip: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(20),
    borderWidth: 1.5,
  },
  clearChipLight: { borderColor: '#CBD5E1', backgroundColor: '#FFFFFF' },
  clearChipDark:  { borderColor: '#3A3A3A', backgroundColor: '#2A2A2A' },
  clearText: { fontSize: moderateScale(11), fontWeight: '600', lineHeight: moderateScale(15) },
});