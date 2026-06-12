import { StyleSheet, Platform } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

export const getFormTheme = (isDarkMode: boolean) => ({
  background: isDarkMode ? '#111827' : '#F8FAFC',
  card: isDarkMode ? '#1F2937' : '#FFFFFF',
  border: isDarkMode ? '#334155' : '#E2E8F0',
  label: isDarkMode ? '#F8FAFC' : '#1F2937',
  subText: isDarkMode ? '#94A3B8' : '#6B7280',
  inputBackground: isDarkMode ? '#0F172A' : '#FFFFFF',
  inputText: isDarkMode ? '#F8FAFC' : '#1F2937',
  placeholder: isDarkMode ? '#64748B' : '#9CA3AF',
  radioGroup: isDarkMode ? '#0F172A' : '#F9FAFB',
  radioSelected: isDarkMode ? '#1E3A8A' : '#FFFFFF',
  attachmentBackground: isDarkMode ? '#0F172A' : '#FAFAFA',
  attachmentIconBackground: isDarkMode ? '#1F2937' : '#F3F4F6',
  modalBackground: isDarkMode ? '#1F2937' : '#FFFFFF',
  modalOptionBackground: isDarkMode ? '#111827' : '#F9FAFB',
  modalDivider: isDarkMode ? '#334155' : '#F3F4F6',
  cancelBackground: isDarkMode ? '#111827' : '#F3F4F6',
});

export const formStyles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(40),
  },
  formCard: {
    flexDirection: 'column',
    borderWidth: 1,
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
  },
  formContainer: {
    flexDirection: 'column',
  },
  formHeader: {
    marginBottom: verticalScale(20),
  },
  formTitle: {
    fontSize: moderateScale(20),
    fontFamily: 'PTSans-Bold',
    marginBottom: verticalScale(4),
  },
  formSubtitle: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
    fontFamily: 'PTSans-Regular',
  },
  fieldContainer: {
    marginBottom: verticalScale(20),
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
    gap: moderateScale(12),
  },
  dateFieldHalf: {
    flex: 1,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    minHeight: moderateScale(46),
  },
  dateInputFull: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    minHeight: moderateScale(46),
  },
  dateInputText: {
    fontSize: moderateScale(13),
    fontWeight: '400',
    flex: 1,
  },
  placeholderText: {
    fontWeight: '400',
  },
  calendarIcon: {
    marginLeft: moderateScale(8),
  },
  dropdownItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(12),
  },
  dropdownItemIcon: {
    marginRight: moderateScale(12),
  },
  dropdownItemText: {
    fontSize: moderateScale(14),
    color: '#374151',
    fontWeight: '400',
  },
  row: {
    flexDirection: 'row',
    gap: moderateScale(10),
    marginBottom: verticalScale(16),
  },
  half: {
    flex: 1,
  },
  attachmentContainer: {
    borderWidth: moderateScale(1.5),
    borderStyle: 'dashed',
    borderRadius: moderateScale(8),
    padding: moderateScale(20),
    alignItems: 'center',
  },
  attachmentContent: {
    alignItems: 'center',
  },
  attachmentIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  attachmentText: {
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
  attachmentTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingTop: verticalScale(20),
    paddingHorizontal: moderateScale(20),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(34) : verticalScale(20),
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
  },
  modalOptionIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(14),
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    marginBottom: verticalScale(3),
  },
  modalOptionSubtext: {
    fontSize: moderateScale(12),
  },
  modalDivider: {
    height: moderateScale(1),
    marginVertical: verticalScale(6),
  },
  modalCancelButton: {
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(10),
  },
  modalCancelText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: moderateScale(12),
    marginTop: moderateScale(2),
    marginBottom: moderateScale(6),
    marginLeft: moderateScale(4),
  },
  bottomSpacer: {
    height: verticalScale(120),
  },
  submitWrapper: {
    marginTop: verticalScale(-20),

  },
});
