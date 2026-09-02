import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
  Linking,
  useColorScheme,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import CustomDropdown from '../../components/formComponent/customDropdown';
import CustomInput from '../../components/formComponent/customInput';
import CustomButton from '../../components/button/customButton';
import CalendarPickerModal from '../../components/formComponent/calendarpickermodal';
import { addLeave } from '../../services';
import { getDevelopersList, Developer } from '../../services/salaryService';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AppIcon from '../../components/appIcon';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ToastUtil from '../../utils/toastAndroid';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import CustomRadioGroup from '../../components/formComponent/customRadioGroup';
import FormLabel from '../../components/formComponent/formLabel';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import { formatDate } from '../../utils/dateUtils';
import ScreenWrapper from '../../components/screenWrapper';
import moment from 'moment';
import NetInfoComponent from '../../components/netinfoComponent';

const AddLeave: React.FC<AppStackScreenProps<'AddLeave'>> = ({
  navigation,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { colors } = useTheme();
  
  const theme = {
    bg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    primary: '#2563EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    overlay: 'rgba(0,0,0,0.5)',
  };

  const [leaveFor, setLeaveFor] = useState<'0' | '1'>('0');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startDateDisplay, setStartDateDisplay] = useState(
    moment().format('DD/MM/YYYY'),
  );
  const [startDateServer, setStartDateServer] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endDateDisplay, setEndDateDisplay] = useState(
    moment().format('DD/MM/YYYY'),
  );
  const [endDateServer, setEndDateServer] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [reason, setReason] = useState('');
  const [disableBtn, setDisableBtn] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState<Developer[]>([]);
  const [attachment, setAttachment] = useState<any>(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const result = await getDevelopersList();
      if (result.success) {
        setEmployees(result.data);
      }
    };
    fetchEmployees();
  }, []);

  const leaveOptions = [
    { id: 'Paternity Leave', name: 'Paternity Leave', icon: 'Baby' },
    { id: 'Optional Leave', name: 'Optional Leave', icon: 'Coffee' },
    { id: 'Paid Leave', name: 'Paid Leave', icon: 'DollarSign' },
    { id: 'NH/FHH', name: 'NH/FHH', icon: 'Calendar' },
    { id: 'Occupational Leave', name: 'Occupational Leave', icon: 'Briefcase' },
  ];

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setStartDateDisplay(formatDate(date, 'display'));
    setStartDateServer(formatDate(date, 'server'));
    setShowStartPicker(false);
  };
  
  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    setEndDateDisplay(formatDate(date, 'display'));
    setEndDateServer(formatDate(date, 'server'));
    setShowEndPicker(false);
  };

  // Handle leave for change
  const handleLeaveForChange = (value: '0' | '1') => {
    setLeaveFor(value);

    if (value === '1') {
      const today = new Date();
      setStartDate(today);
      setStartDateDisplay(formatDate(today, 'display'));
      setStartDateServer(formatDate(today, 'server'));
      setEndDate(null);
      setEndDateDisplay('');
      setEndDateServer('');
    } else {
      setStartDate(null);
      setStartDateDisplay('');
      setStartDateServer('');
      setEndDate(null);
      setEndDateDisplay('');
      setEndDateServer('');
    }
  };

  const handleCameraLaunch = async () => {
    setShowAttachmentModal(false);
    try {
      const permission =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.CAMERA
          : PERMISSIONS.IOS.CAMERA;

      let permissionStatus = await check(permission);
      if (permissionStatus === RESULTS.DENIED) {
        permissionStatus = await request(permission);
      }
      if (
        permissionStatus === RESULTS.BLOCKED ||
        permissionStatus === RESULTS.DENIED
      ) {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is required to take photos. Please enable it from settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const result = await launchCamera({
        mediaType: 'photo' as const,
        quality: 0.8 as const,
        saveToPhotos: false,
      });

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open camera');
      } else if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAttachment({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'camera_photo.jpg',
        });
        ToastUtil.success('Photo captured successfully');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handleGalleryLaunch = async () => {
    setShowAttachmentModal(false);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo' as const,
        quality: 0.8 as const,
        selectionLimit: 1,
      });

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to open gallery');
      } else if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAttachment({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || 'gallery_photo.jpg',
        });
        ToastUtil.success('Image selected successfully');
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const handleAddLeave = async () => {
    try {
      setDisableBtn(true);
      if (!employeeId) {
        ToastUtil.info('Please select an employee');
        return;
      }
      if (!leaveType) {
        ToastUtil.info('Please select leave type');
        return;
      }
      if (!startDateServer) {
        ToastUtil.info(
          leaveFor === '1' ? 'Please select date' : 'Please select start date',
        );
        return;
      }

      if (leaveFor === '0' && !endDateServer) {
        ToastUtil.info('Please select end date');
        return;
      }
      if (!reason.trim()) {
        ToastUtil.info('Please provide a reason');
        return;
      }

      let formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('type', leaveType);
      formData.append('mode', leaveFor);
      formData.append('from_date', startDateServer);

      // For half day, end date is same as start date
      formData.append(
        'to_date',
        leaveFor === '1' ? startDateServer : endDateServer,
      );
      formData.append('reason', reason);

      if (attachment) {
        formData.append('attachment', {
          uri: attachment.uri,
          type: attachment.type || 'image/jpeg',
          name: attachment.name || 'attachment.jpg',
        });
      }

      const { success, message } = await addLeave(formData);

      if (success) {
        navigation.goBack();
        ToastUtil.success(message);
      } else {
        ToastUtil.error(message);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error adding leave:', error.message);
        ToastUtil.error('An error occurred while submitting leave request');
      }
    } finally {
      setDisableBtn(false);
    }
  };

  const renderDropdownItem = (item: any) => (
    <View style={styles.dropdownItemContainer}>
      <AppIcon
        name={item.icon}
        size={moderateScale(18)}
        color={theme.textSecondary}
        style={styles.dropdownItemIcon}
      />
      <Text style={[styles.dropdownItemText, { color: theme.textPrimary }]}>{item.name}</Text>
    </View>
  );

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={theme.bg}
    >
      <NetInfoComponent onReconnect={handleAddLeave} />
      <KeyboardAvoidingView
        style={[styles.keyboardContainer, { backgroundColor: theme.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? verticalScale(80) : verticalScale(120)}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: theme.bg }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.formCard,
              { 
                backgroundColor: theme.card, 
                borderColor: theme.border,
                shadowColor: isDarkMode ? 'transparent' : '#000',
              },
            ]}
          >
            <View style={styles.formHeader}>
              <View style={[styles.headerAccent, { backgroundColor: theme.primary }]} />
              <View>
                <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
                  LEAVE REQUEST
                </Text>
                <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>
                  Add your leave details and attach proof if needed.
                </Text>
              </View>
            </View>

            {/* ── Employee ────────────────────────────────────────────────── */}
            <View style={styles.fieldContainer}>
              <FormLabel label="Employee" required color={theme.textPrimary} />
              <CustomDropdown
                data={employees}
                value={employeeId}
                placeholder="Select employee..."
                searchPlaceholder="Search employee..."
                onChange={item => setEmployeeId(item.id.toString())}
                labelField="name"
                valueField="id"
                colors={colors}
                label=""
              />
            </View>

            {/* ── Leave For ──────────────────────────────────────────────── */}
            <View style={styles.fieldContainer}>
              <FormLabel label="Leave For" color={theme.textPrimary} required />
              <CustomRadioGroup
                options={[
                  { label: 'Full Day', value: '0' },
                  { label: 'Half Day', value: '1' },
                ]}
                value={leaveFor}
                onChange={val => handleLeaveForChange(val as '0' | '1')}
              />
            </View>

            {/* ── Leave Type ─────────────────────────────────────────────── */}
            <View style={styles.fieldContainer}>
              <FormLabel label="Leave Type" required color={theme.textPrimary} />
              <CustomDropdown
                data={leaveOptions}
                value={leaveType}
                placeholder="Select type..."
                searchPlaceholder="Search leave type..."
                onChange={item => setLeaveType(item.id)}
                labelField="name"
                valueField="id"
                iconField="icon"
                renderItem={renderDropdownItem}
                colors={colors}
                label=""
              />
            </View>

            {/* ── Dates (conditional Full / Half) ────────────────────────── */}
            {leaveFor === '0' ? (
              <View style={styles.dateRow}>
                {/* Start Date */}
                <View style={styles.dateFieldHalf}>
                  <FormLabel label="Start Date" required color={theme.textPrimary} />
                  <TouchableOpacity
                    style={[
                      styles.dateInput,
                      {
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setShowStartPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dateInputText,
                        { color: startDateDisplay ? theme.textPrimary : theme.textSecondary },
                      ]}
                    >
                      {startDateDisplay || 'DD/MM/YYYY'}
                    </Text>
                    <AppIcon
                      name="Calendar"
                      size={moderateScale(18)}
                      color={theme.textSecondary}
                      style={styles.calendarIcon}
                    />
                  </TouchableOpacity>
                </View>
                {/* End Date */}
                <View style={styles.dateFieldHalf}>
                  <FormLabel label="End Date" required color={theme.textPrimary} />
                  <TouchableOpacity
                    style={[
                      styles.dateInput,
                      {
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setShowEndPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dateInputText,
                        { color: endDateDisplay ? theme.textPrimary : theme.textSecondary },
                      ]}
                    >
                      {endDateDisplay || 'DD/MM/YYYY'}
                    </Text>
                    <AppIcon
                      name="Calendar"
                      size={moderateScale(18)}
                      color={theme.textSecondary}
                      style={styles.calendarIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Half Day — single date picker
              <View style={styles.fieldContainer}>
                <FormLabel label="Date" required color={theme.textPrimary} />
                <TouchableOpacity
                  style={[
                    styles.dateInputFull,
                    {
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setShowStartPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateInputText,
                      { color: startDateDisplay ? theme.textPrimary : theme.textSecondary },
                    ]}
                  >
                    {startDateDisplay || 'DD/MM/YYYY'}
                  </Text>
                  <AppIcon
                    name="Calendar"
                    size={moderateScale(18)}
                    color={theme.textSecondary}
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* ── Reason ─────────────────────────────────────────────────── */}
            <View style={styles.fieldContainer}>
              <FormLabel label="Reason" required color={theme.textPrimary} />
              <CustomInput
                value={reason}
                onChangeText={setReason}
                placeholder="Provide a brief explanation..."
                isMultiline
                numberOfLines={4}
              />
            </View>

            {/* ── Attachment ─────────────────────────────────────────────── */}
            <View style={styles.fieldContainer}>
              <FormLabel label="Attachment" color={theme.textPrimary} optional />
              <TouchableOpacity
                style={[
                  styles.attachmentContainer,
                  {
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setShowAttachmentModal(true)}
                activeOpacity={0.7}
              >
                <View style={styles.attachmentContent}>
                  <View
                    style={[
                      styles.attachmentIconContainer,
                      { backgroundColor: theme.border },
                    ]}
                  >
                    <AppIcon
                      name="Paperclip"
                      size={moderateScale(20)}
                      color={theme.textSecondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.attachmentText,
                      { color: attachment ? theme.primary : theme.textSecondary },
                      attachment && styles.attachmentTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {attachment
                      ? attachment.name
                      : 'Upload medical certificate or proof'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <View style={styles.submitContainer}>
              <CustomButton
                label="Submit Request"
                onPress={handleAddLeave}
                disabled={disableBtn}
                style={styles.submitButton}
              />
            </View>
          </View>

          {/* ── Calendar Pickers ───────────────────────────────────────────── */}
          <CalendarPickerModal
            visible={showStartPicker}
            onClose={() => setShowStartPicker(false)}
            onSelectDate={handleStartDateSelect}
            selectedDate={startDate || undefined}
            minimumDate={new Date()}
          />
          <CalendarPickerModal
            visible={showEndPicker}
            onClose={() => setShowEndPicker(false)}
            onSelectDate={handleEndDateSelect}
            selectedDate={endDate || undefined}
            minimumDate={startDate || new Date()}
          />

          {/* ── Attachment Bottom Sheet Modal ──────────────────────────────── */}
          <Modal
            visible={showAttachmentModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowAttachmentModal(false)}
          >
            <TouchableOpacity
              style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}
              activeOpacity={1}
              onPress={() => setShowAttachmentModal(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={e => e.stopPropagation()}
                style={styles.modalContentWrapper}
              >
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: theme.card },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                      Upload Attachment
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: theme.bg }]}
                    onPress={handleCameraLaunch}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.modalOptionIconContainer, { backgroundColor: `${theme.primary}20` }]}>
                      <AppIcon name="Camera" size={moderateScale(22)} color={theme.primary} />
                    </View>
                    <View style={styles.modalOptionTextContainer}>
                      <Text style={[styles.modalOptionText, { color: theme.textPrimary }]}>
                        Take Photo
                      </Text>
                      <Text style={[styles.modalOptionSubtext, { color: theme.textSecondary }]}>
                        Use camera to capture document
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />
                  
                  <TouchableOpacity
                    style={[styles.modalOption, { backgroundColor: theme.bg }]}
                    onPress={handleGalleryLaunch}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.modalOptionIconContainer, { backgroundColor: `${theme.primary}20` }]}>
                      <AppIcon name="Image" size={moderateScale(22)} color={theme.primary} />
                    </View>
                    <View style={styles.modalOptionTextContainer}>
                      <Text style={[styles.modalOptionText, { color: theme.textPrimary }]}>
                        Choose from Gallery
                      </Text>
                      <Text style={[styles.modalOptionSubtext, { color: theme.textSecondary }]}>
                        Select from your photos
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalCancelButton, { backgroundColor: theme.border }]}
                    onPress={() => setShowAttachmentModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalCancelText, { color: theme.textPrimary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
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
    borderRadius: moderateScale(16),
    borderWidth: 1,
    padding: moderateScale(16),
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(12),
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  headerAccent: {
    width: moderateScale(4),
    height: '100%',
    borderRadius: moderateScale(2),
    marginRight: moderateScale(12),
  },
  formTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: verticalScale(4),
  },
  formSubtitle: {
    fontSize: moderateScale(13),
  },
  fieldContainer: {
    marginBottom: verticalScale(20),
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
  },
  dateFieldHalf: {
    width: '48%',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    height: verticalScale(50),
  },
  dateInputFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    height: verticalScale(50),
  },
  dateInputText: {
    fontSize: moderateScale(14),
  },
  calendarIcon: {
    marginLeft: moderateScale(8),
  },
  attachmentContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  attachmentIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  attachmentText: {
    fontSize: moderateScale(14),
    flex: 1,
  },
  attachmentTextActive: {
    fontWeight: '500',
  },
  submitContainer: {
    marginTop: verticalScale(12),
  },
  submitButton: {
    height: verticalScale(50),
    borderRadius: moderateScale(12),
  },
  dropdownItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
  },
  dropdownItemIcon: {
    marginRight: moderateScale(12),
  },
  dropdownItemText: {
    fontSize: moderateScale(14),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    padding: moderateScale(24),
    paddingBottom: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(24),
  },
  modalHeader: {
    marginBottom: verticalScale(20),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
  },
  modalOptionIconContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(16),
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(4),
  },
  modalOptionSubtext: {
    fontSize: moderateScale(13),
  },
  modalDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: verticalScale(16),
  },
  modalCancelButton: {
    marginTop: verticalScale(24),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});

export default AddLeave;
