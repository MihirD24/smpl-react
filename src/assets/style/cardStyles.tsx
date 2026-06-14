import { StyleSheet } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

export const getCardTheme = (isDark: boolean) => ({
  // Text
  textPrimary: isDark ? '#F3F4F6' : '#1F2937',
  textSecondary: isDark ? '#9CA3AF' : '#6B7280',
  textMuted: isDark ? '#6B7280' : '#9CA3AF',

  // Surfaces
  cardBg: isDark ? '#1E1E1E' : '#FFFFFF',
  cardBorder: isDark ? '#2E2E2E' : '#F3F4F6',

  // Divider
  divider: isDark ? '#2E2E2E' : '#F3F4F6',

  // Icon box
  iconBoxBg: isDark ? '#1A2A3A' : '#EFF6FF',

  // Remarks / Details block
  contentBlockBg: isDark ? '#2A2A2A' : '#F9FAFB',

  // Separator (vertical line)
  separator: isDark ? '#3A3A3A' : '#E5E7EB',
});

export const cardStyles = StyleSheet.create({
  card: {
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginBottom: verticalScale(10),
    borderWidth: 1,
  },
  cardWithMargin: {
    borderRadius: moderateScale(14),
    marginHorizontal: scale(10),
    marginBottom: verticalScale(10),
    padding: moderateScale(14),
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
    borderColor: '#2E2E2E',
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  iconBoxLight: { backgroundColor: '#EFF6FF' },
  iconBoxDark: { backgroundColor: '#1A2A3A' },
  headerText: { flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
  },
  badgeIcon: { marginRight: moderateScale(3) },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: verticalScale(10),
  },
  dividerLight: { backgroundColor: '#F3F4F6' },
  dividerDark: { backgroundColor: '#2E2E2E' },
  contentBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
  },
  contentBlockLight: { backgroundColor: '#F9FAFB' },
  contentBlockDark: { backgroundColor: '#2A2A2A' },
  contentBlockIcon: {
    marginRight: moderateScale(6),
    marginTop: verticalScale(1),
  },
  contentBlockText: {
    flex: 1,
    fontSize: moderateScale(12),
    fontStyle: 'italic',
    lineHeight: moderateScale(17),
  },
  seeMoreText: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(11),
    color: '#3B82F6',
    fontWeight: '600',
  },

  textPrimaryLight: { color: '#1F2937' },
  textPrimaryDark: { color: '#F3F4F6' },
  textSecondaryLight: { color: '#6B7280' },
  textSecondaryDark: { color: '#9CA3AF' },
  textMutedLight: { color: '#9CA3AF' },
  textMutedDark: { color: '#6B7280' },
});
