import React from 'react';
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import MainStyle from '../../assets/style/maincss';
import AppIcon from '../appIcon';

/** Generic item type */
type DropdownItem = Record<string, any>;

/** Helper function to get nested field value */
const getNestedValue = (obj: DropdownItem, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

interface CustomDropdownProps {
  label: string;
  data: DropdownItem[];
  value: string | number | null;
  placeholder?: string;
  disable?: boolean;
  searchPlaceholder?: string;
  onChange: (item: DropdownItem) => void;
  labelField: string;
  valueField: string;
  iconField?: string;
  renderLeftIconName?: string;
  maxHeight?: number;
  colors: {
    background: string;
    notification: string;
  };
  style?: StyleProp<ViewStyle>;
  search?: boolean;
  multiselect?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  data,
  value,
  placeholder,
  search = false,
  disable = false,
  searchPlaceholder,
  onChange,
  labelField,
  valueField,
  iconField,
  renderLeftIconName,
  maxHeight = 250,
  colors,
  style,
  multiselect,
}) => {
  const MainStyles = MainStyle();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = {
    fieldBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    fieldBorder: isDarkMode ? '#334155' : '#E5E7EB',
    fieldText: isDarkMode ? '#F8FAFC' : colors.text,
    fieldPlaceholder: isDarkMode ? '#64748B' : '#C0C0C0',
    selectedBg: isDarkMode ? '#1E3A8A' : '#EFF6FF',
    selectedBorder: '#3B82F6',
    iconBg: isDarkMode ? '#0F172A' : '#F3F4F6',
    iconBgSelected: isDarkMode ? '#172554' : '#DBEAFE',
    itemText: isDarkMode ? '#CBD5E1' : '#374151',
    itemTextSelected: isDarkMode ? '#EFF6FF' : '#1F2937',
    popupBg: isDarkMode ? '#1F2937' : colors.background,
    popupBorder: isDarkMode ? '#334155' : '#E2E8F0',
  };

  /** Get selected item */
  // const selectedItem = data.find(
  //   item => String(getNestedValue(item, valueField)) === String(value),
  // );
  const Component = multiselect ? MultiSelect : Dropdown;

  const isSelected = (item: DropdownItem) => {
    const itemValue = String(getNestedValue(item, valueField));

    if (multiselect && Array.isArray(value)) {
      return value.map(String).includes(itemValue);
    }

    return String(itemValue) === String(value);
  };
  const MAX_VISIBLE = 3; // Max number of selected items to show in the dropdown
  return (
    <View>
      {/* Label */}
      {label ? <Text style={MainStyles.formlabel}>{label}</Text> : null}

      {/* Dropdown */}
      <Component
        style={[
          MainStyles.dropdown,
          {
            backgroundColor: theme.fieldBg,
            borderColor: theme.fieldBorder,
            opacity: disable ? 0.55 : 1,
          },
          style,
        ]}
        placeholderStyle={[
          MainStyles.placeholderStyle,
          { color: theme.fieldPlaceholder },
        ]}
        selectedTextStyle={[
          MainStyles.selectedTextStyle,
          { color: theme.fieldText },
        ]}
        inputSearchStyle={[
          MainStyles.inputSearchStyle,
          {
            color: theme.fieldText,
            backgroundColor: theme.popupBg,
            borderRadius: moderateScale(8),
          },
        ]}
        itemTextStyle={MainStyles.itemTextStyle}
        iconStyle={MainStyles.iconStyle}
        data={data}
        maxHeight={maxHeight}
        labelField={labelField}
        valueField={valueField}
        placeholder={placeholder}
        search={search}
        searchPlaceholder={searchPlaceholder}
        value={value}
        onChange={onChange}
        disable={disable}
        showsVerticalScrollIndicator={false}
        renderItem={(item: DropdownItem) => {
          const displayValue =
            getNestedValue(item, labelField)?.toString() || '';
          const iconName = iconField ? getNestedValue(item, iconField) : null;

          const selected = isSelected(item);

          return (
            <View
              style={[
                styles.dropdownItemContainer,
                selected && styles.dropdownItemSelected,
                selected && {
                  backgroundColor: theme.selectedBg,
                  borderLeftColor: theme.selectedBorder,
                },
              ]}
            >
              {iconName && (
                <View
                  style={[
                    styles.iconWrapper,
                    selected && styles.iconWrapperSelected,
                    {
                      backgroundColor: selected
                        ? theme.iconBgSelected
                        : theme.iconBg,
                    },
                  ]}
                >
                  <AppIcon
                    name={iconName}
                    size={moderateScale(18)}
                    color={selected ? '#3B82F6' : '#6B7280'}
                  />
                </View>
              )}

              <Text
                style={[
                  styles.dropdownItemText,
                  selected && styles.dropdownItemTextSelected,
                  {
                    color: selected ? theme.itemTextSelected : theme.itemText,
                  },
                ]}
              >
                {displayValue || 'No label available'}
              </Text>

              {selected && (
                <AppIcon
                  name="Check"
                  size={moderateScale(16)}
                  color="#3B82F6"
                  style={styles.checkIcon}
                />
              )}
            </View>
          );
        }}
        renderSelectedItem={
          multiselect
            ? (item, unSelect, index) => {
                if (index >= MAX_VISIBLE) return null;

                return (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {getNestedValue(item, labelField)}
                    </Text>
                    <AppIcon
                      name="X"
                      size={16}
                      color="#fff"
                      onPress={() => unSelect?.(item)}
                    />
                  </View>
                );
              }
            : undefined
        }
        containerStyle={{
          backgroundColor: theme.popupBg,
          borderRadius: moderateScale(8),
          marginTop: verticalScale(4),
          borderWidth: 1,
          borderColor: theme.popupBorder,
          elevation: 5,
        }}
        selectedStyle={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(7),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(6),
    marginHorizontal: moderateScale(4),
    marginVertical: verticalScale(1),
  },
  dropdownItemSelected: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: moderateScale(3),
    borderLeftColor: '#3B82F6',
  },
  iconWrapper: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  iconWrapperSelected: {
    backgroundColor: '#DBEAFE',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#374151',
  },
  dropdownItemTextSelected: {
    color: '#1F2937',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: moderateScale(8),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    marginRight: moderateScale(6),
    // marginBottom: verticalScale(4),
    marginTop: verticalScale(6),
  },

  chipText: {
    color: '#fff',
    fontSize: moderateScale(12),
    paddingRight: moderateScale(6),
  },

  chipIcon: {
    marginLeft: moderateScale(2),
  },
});

export default CustomDropdown;
