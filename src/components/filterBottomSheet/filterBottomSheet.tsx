import React, {
  useRef,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { moderateScale } from 'react-native-size-matters';
import AppIcon from '../appIcon';
import { Dropdown } from 'react-native-element-dropdown';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusOption<T extends string = string> = {
  label: T;
  color: string;
};

export type ChipSection = {
  title: string;
  items: { id: string; name: string }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

 type DropdownSection = {
  title: string;
  items: { id: string; name: string }[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placeholder?: string;
};

 type FilterBottomSheetProps = {
  snapPoints?: string[];
  statusOptions?: StatusOption[];
  selectedStatuses?: string[];
  onToggleStatus?: (val: string) => void;
  chipSections?: ChipSection[];
  dropdownSections?: DropdownSection[];
  onApply: () => void;
  onReset: () => void;
};

export type FilterBottomSheetHandle = {
  expand: () => void;
  close: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

const FilterBottomSheet = forwardRef<FilterBottomSheetHandle, FilterBottomSheetProps>(
  (
    {
      snapPoints = ['75%'],
      statusOptions = [],
      selectedStatuses = [],
      onToggleStatus,
      chipSections = [],
      dropdownSections = [], // ✅ destructured here
      onApply,
      onReset,
    },
    ref,
  ) => {
    const isDark = useColorScheme() === 'dark';
    const sheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => ({
      expand: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
    }));

    const resolvedSnapPoints = useMemo(() => snapPoints, []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    );

    // Dark tokens
    const sheetBg        = isDark ? '#1A1A1A' : '#FFFFFF';
    const titleColor     = isDark ? '#F3F4F6' : '#1E293B';
    const sectionColor   = isDark ? '#D1D5DB' : '#1E293B';
    const chipBg         = isDark ? '#2A2A2A' : '#F1F5F9';
    const chipBorder     = isDark ? '#3A3A3A' : '#E2E8F0';
    const chipTextColor  = isDark ? '#9CA3AF' : '#64748B';
    const dividerColor   = isDark ? '#2E2E2E' : '#F1F5F9';
    const resetBg        = isDark ? '#2A2A2A' : '#F8FAFC';
    const resetBorder    = isDark ? '#3A3A3A' : '#E2E8F0';
    const resetTextColor = isDark ? '#9CA3AF' : '#64748B';

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={resolvedSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={[s.sheetBg, { backgroundColor: sheetBg }]}
        handleIndicatorStyle={{
          width: 40,
          backgroundColor: isDark ? '#3A3A3A' : '#E2E8F0',
        }}
      >
        <BottomSheetView style={s.sheetContent}>
          {/* Header */}
          <View style={[s.sheetHeader, { borderBottomColor: dividerColor }]}>
            <Text style={[s.sheetTitle, { color: titleColor }]}>Filter By</Text>
            <TouchableOpacity onPress={() => sheetRef.current?.close()}>
              <AppIcon name="X" size={24} color={titleColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.sheetScroll} showsVerticalScrollIndicator={false}>
            {/* Status */}
            {statusOptions.length > 0 && (
              <View style={s.filterSection}>
                <Text style={[s.filterSectionTitle, { color: sectionColor }]}>
                  Status
                </Text>
                <View style={s.statusGrid}>
                  {statusOptions.map(opt => {
                    const active = selectedStatuses.includes(opt.label);
                    return (
                      <TouchableOpacity
                        key={opt.label}
                        style={[
                          s.statusButton,
                          { backgroundColor: chipBg, borderColor: chipBorder },
                          active && {
                            backgroundColor: opt.color + '18',
                            borderColor: opt.color,
                          },
                        ]}
                        onPress={() => onToggleStatus?.(opt.label)}
                        activeOpacity={0.8}
                      >
                        <View style={s.statusButtonContent}>
                          <View style={[s.statusDot, { backgroundColor: opt.color }]} />
                          <Text
                            style={[
                              s.statusButtonText,
                              { color: chipTextColor },
                              active && { color: opt.color, fontWeight: '600' },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Dropdown Sections (e.g. Party) */}
            {dropdownSections.map(section => (
              <View key={section.title} style={s.filterSection}>
                <Text style={[s.filterSectionTitle, { color: sectionColor }]}>
                  {section.title}
                </Text>

                <Dropdown
                  style={[
                    s.dropdown,
                    {
                      backgroundColor: chipBg,
                      borderColor: chipBorder,
                    },
                  ]}
                  placeholderStyle={{
                    color: chipTextColor,
                    fontSize: moderateScale(13),
                  }}
                  selectedTextStyle={{
                    color: titleColor,
                    fontSize: moderateScale(13),
                  }}
                  inputSearchStyle={{
                    color: titleColor,
                    fontSize: moderateScale(13),
                    backgroundColor: chipBg,
                    borderRadius: moderateScale(8),
                  }}
                  containerStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderRadius: moderateScale(10),
                    borderColor: chipBorder,
                    borderWidth: 1,
                    elevation: 5,
                  }}
                  itemTextStyle={{
                    color: isDark ? '#CBD5E1' : '#374151',
                    fontSize: moderateScale(13),
                  }}
                  activeColor={isDark ? '#1E3A8A' : '#EFF6FF'}
                  data={section.items}
                  labelField="name"
                  valueField="id"
                  placeholder={section.placeholder ?? `Select ${section.title}`}
                  search
                  searchPlaceholder={`Search ${section.title.toLowerCase()}...`}
                  value={section.selectedId}
                  onChange={item => section.onSelect(item.id)}
                  renderRightIcon={() => (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: moderateScale(4),
                      }}
                    >
                      {section.selectedId && (
                        <TouchableOpacity
                          onPress={() => section.onSelect(null)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <AppIcon
                            name="X"
                            size={moderateScale(14)}
                            color={chipTextColor}
                          />
                        </TouchableOpacity>
                      )}
                      <AppIcon
                        name="ChevronDown"
                        size={moderateScale(16)}
                        color={chipTextColor}
                      />
                    </View>
                  )}
                />
              </View>
            ))}

            {/* Chip Sections */}
            {chipSections.map(section =>
              section.items.length === 0 ? null : (
                <View key={section.title} style={s.filterSection}>
                  <Text style={[s.filterSectionTitle, { color: sectionColor }]}>
                    {section.title}
                  </Text>
                  <View style={s.chipsContainer}>
                    {section.items.map(item => {
                      const active = section.selectedIds.includes(item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            s.chip,
                            { backgroundColor: chipBg, borderColor: chipBorder },
                            active && s.chipSelected,
                          ]}
                          onPress={() => section.onToggle(item.id)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              s.chipText,
                              { color: chipTextColor },
                              active && s.chipTextSelected,
                            ]}
                          >
                            {item.name}
                          </Text>
                          {active && (
                            <AppIcon
                              name="X"
                              size={moderateScale(12)}
                              color="#3B82F6"
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ),
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[s.sheetFooter, { borderTopColor: dividerColor }]}>
            <TouchableOpacity
              style={[s.resetButton, { backgroundColor: resetBg, borderColor: resetBorder }]}
              onPress={onReset}
            >
              <AppIcon name="RotateCcw" size={18} color={resetTextColor} />
              <Text style={[s.resetButtonText, { color: resetTextColor }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyButton} onPress={onApply}>
              <AppIcon name="Check" size={18} color="#FFFFFF" />
              <Text style={s.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

export default FilterBottomSheet;

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  sheetBg: {
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
  },
  sheetContent: { flex: 1, paddingHorizontal: moderateScale(18) },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: moderateScale(16),
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: moderateScale(18), fontWeight: '600' },
  sheetScroll: { flex: 1, paddingTop: moderateScale(16) },
  sheetFooter: {
    flexDirection: 'row',
    gap: moderateScale(12),
    paddingTop: moderateScale(16),
    paddingBottom: moderateScale(20),
    borderTopWidth: 1,
  },
  filterSection: { marginBottom: moderateScale(24) },
  filterSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: moderateScale(12),
  },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(10) },
  statusButton: {
    width: '48%',
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(14),
    borderWidth: 1.5,
  },
  statusButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  statusButtonText: { fontSize: moderateScale(14), fontWeight: '500' },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(8) },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
    borderWidth: 1,
  },
  chipSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  chipText: { fontSize: moderateScale(13), fontWeight: '500' },
  chipTextSelected: { color: '#3B82F6' },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: moderateScale(14),
    borderRadius: moderateScale(12),
    borderWidth: 1,
  },
  resetButtonText: { fontSize: moderateScale(14), fontWeight: '600' },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: moderateScale(14),
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(12),
  },
  applyButtonText: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    height: moderateScale(44),
  },
});