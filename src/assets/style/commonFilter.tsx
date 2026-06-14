import { StyleSheet } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const commonFilterStyles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },

  searchWrapper: {
    flex: 1,
  },

  filterIconBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#BFDBFE',
  },

  filterBadge: {
    position: 'absolute',
    top: -moderateScale(4),
    right: -moderateScale(4),
    minWidth: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(3),
  },

  filterBadgeText: {
    fontSize: moderateScale(9),
    color: '#FFFFFF',
    fontWeight: '800',
    lineHeight: moderateScale(12),
  },
  noDataSub: {
    fontSize: moderateScale(13),
    marginTop: verticalScale(6),
    textAlign: 'center',
  },
  filterIconBtnActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  filterIconBtnDark: { borderColor: '#1D4ED8', backgroundColor: '#1A1A1A' },
  filterIconBtnLight: { borderColor: '#BFDBFE', backgroundColor: '#FFFFFF' },
});

export default commonFilterStyles;
