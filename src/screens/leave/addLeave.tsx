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
import { formStyles, getFormTheme } from '../../assets/style/formStyles';
import { moderateScale } from 'react-native-size-matters';
import { formatDate } from '../../utils/dateUtils';
import ScreenWrapper from '../../components/screenWrapper';
import moment from 'moment';
import NetInfoComponent from '../../components/netinfoComponent';
const AddLeave: React.FC<AppStackScreenProps<'AddLeave'>> = ({
  navigation,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { colors } = useTheme();
  const theme = getFormTheme(isDarkMode);
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
    <View style={formStyles.dropdownItemContainer}>
      <AppIcon
        name={item.icon}
        size={moderateScale(18)}
        color="#6B7280"
        style={formStyles.dropdownItemIcon}
      />
      <Text style={formStyles.dropdownItemText}>{item.name}</Text>
    </View>
  );

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={handleAddLeave} />
      <KeyboardAvoidingView
        style={[
          formStyles.keyboardContainer,
          { backgroundColor: theme.background },
        ]}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 120}
      >
        <ScrollView
          style={[formStyles.container, { backgroundColor: theme.background }]}
          contentContainerStyle={formStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              formStyles.formCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={formStyles.formHeader}>
              <Text style={[formStyles.formTitle, { color: theme.label }]}>
                Leave Request
              </Text>
              <Text style={[formStyles.formSubtitle, { color: theme.subText }]}>
                Add your leave details and attach proof if needed.
              </Text>
            </View>
            {/* ── Employee ────────────────────────────────────────────────── */}
            <View style={formStyles.fieldContainer}>
              <FormLabel label="Employee" required color={theme.label} />
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
            <View style={formStyles.fieldContainer}>
              <FormLabel label="Leave For" color={theme.label} required />
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
            <View style={formStyles.fieldContainer}>
              <FormLabel label="Leave Type" required color={theme.label} />
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
              <View style={formStyles.dateRow}>
                {/* Start Date */}
                <View style={formStyles.dateFieldHalf}>
                  <FormLabel label="Start Date" required color={theme.label} />
                  <TouchableOpacity
                    style={[
                      formStyles.dateInput,
                      {
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setShowStartPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        formStyles.dateInputText,
                        {
                          color: startDateDisplay
                            ? theme.inputText
                            : theme.placeholder,
                        },
                      ]}
                    >
                      {startDateDisplay || 'DD/MM/YYYY'}
                    </Text>
                    <AppIcon
                      name="Calendar"
                      size={moderateScale(18)}
                      color={theme.placeholder}
                      style={formStyles.calendarIcon}
                    />
                  </TouchableOpacity>
                </View>
                {/* End Date */}
                <View style={formStyles.dateFieldHalf}>
                  <FormLabel label="End Date" required color={theme.label} />
                  <TouchableOpacity
                    style={[
                      formStyles.dateInput,
                      {
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.border,
                      },
                    ]}
                    onPress={() => setShowEndPicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        formStyles.dateInputText,
                        {
                          color: endDateDisplay
                            ? theme.inputText
                            : theme.placeholder,
                        },
                      ]}
                    >
                      {endDateDisplay || 'DD/MM/YYYY'}
                    </Text>
                    <AppIcon
                      name="Calendar"
                      size={moderateScale(18)}
                      color={theme.placeholder}
                      style={formStyles.calendarIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Half Day — single date picker
              <View style={formStyles.fieldContainer}>
                <FormLabel label="Date" required color={theme.label} />
                <TouchableOpacity
                  style={[
                    formStyles.dateInputFull,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setShowStartPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      formStyles.dateInputText,
                      {
                        color: startDateDisplay
                          ? theme.inputText
                          : theme.placeholder,
                      },
                    ]}
                  >
                    {startDateDisplay || 'DD/MM/YYYY'}
                  </Text>
                  <AppIcon
                    name="Calendar"
                    size={moderateScale(18)}
                    color={theme.placeholder}
                    style={formStyles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>
            )}
            {/* ── Reason ─────────────────────────────────────────────────── */}
            <View style={formStyles.fieldContainer}>
              <FormLabel label="Reason" required color={theme.label} />
              <CustomInput
                value={reason}
                onChangeText={setReason}
                placeholder="Provide a brief explanation..."
                isMultiline
                numberOfLines={4}
              />
            </View>
            {/* ── Attachment ─────────────────────────────────────────────── */}
            <View style={formStyles.fieldContainer}>
              <FormLabel label="Attachment" color={theme.label} optional />
              <TouchableOpacity
                style={[
                  formStyles.attachmentContainer,
                  {
                    backgroundColor: theme.attachmentBackground,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setShowAttachmentModal(true)}
                activeOpacity={0.7}
              >
                <View style={formStyles.attachmentContent}>
                  <View
                    style={[
                      formStyles.attachmentIconContainer,
                      { backgroundColor: theme.attachmentIconBackground },
                    ]}
                  >
                    <AppIcon
                      name="Paperclip"
                      size={moderateScale(24)}
                      color={theme.placeholder}
                    />
                  </View>
                  <Text
                    style={[
                      formStyles.attachmentText,
                      { color: attachment ? '#3B82F6' : theme.subText },
                      attachment && formStyles.attachmentTextActive,
                    ]}
                  >
                    {attachment
                      ? attachment.name
                      : 'Upload medical certificate or proof'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {/* ── Submit ─────────────────────────────────────────────────── */}
            <CustomButton
              label="Submit Request"
              onPress={handleAddLeave}
              disabled={disableBtn}
            />
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
              style={formStyles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowAttachmentModal(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={e => e.stopPropagation()}
              >
                <View
                  style={[
                    formStyles.modalContent,
                    { backgroundColor: theme.modalBackground },
                  ]}
                >
                  {/* Modal Header */}
                  <View style={formStyles.modalHeader}>
                    <Text
                      style={[formStyles.modalTitle, { color: theme.label }]}
                    >
                      Upload Attachment
                    </Text>
                  </View>
                  {/* Camera option */}
                  <TouchableOpacity
                    style={[
                      formStyles.modalOption,
                      { backgroundColor: theme.modalOptionBackground },
                    ]}
                    onPress={handleCameraLaunch}
                    activeOpacity={0.7}
                  >
                    <View style={formStyles.modalOptionIconContainer}>
                      <AppIcon
                        name="Camera"
                        size={moderateScale(22)}
                        color="#3B82F6"
                      />
                    </View>
                    <View style={formStyles.modalOptionTextContainer}>
                      <Text
                        style={[
                          formStyles.modalOptionText,
                          { color: theme.label },
                        ]}
                      >
                        Take Photo
                      </Text>
                      <Text
                        style={[
                          formStyles.modalOptionSubtext,
                          { color: theme.subText },
                        ]}
                      >
                        Use camera to capture document
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View
                    style={[
                      formStyles.modalDivider,
                      { backgroundColor: theme.modalDivider },
                    ]}
                  />
                  {/* Gallery option */}
                  <TouchableOpacity
                    style={[
                      formStyles.modalOption,
                      { backgroundColor: theme.modalOptionBackground },
                    ]}
                    onPress={handleGalleryLaunch}
                    activeOpacity={0.7}
                  >
                    <View style={formStyles.modalOptionIconContainer}>
                      <AppIcon name="Image" size={22} color="#3B82F6" />
                    </View>
                    <View style={formStyles.modalOptionTextContainer}>
                      <Text
                        style={[
                          formStyles.modalOptionText,
                          { color: theme.label },
                        ]}
                      >
                        Choose from Gallery
                      </Text>
                      <Text
                        style={[
                          formStyles.modalOptionSubtext,
                          { color: theme.subText },
                        ]}
                      >
                        Select from your photos
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {/* Cancel */}
                  <TouchableOpacity
                    style={[
                      formStyles.modalCancelButton,
                      { backgroundColor: theme.cancelBackground },
                    ]}
                    onPress={() => setShowAttachmentModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        formStyles.modalCancelText,
                        { color: theme.subText },
                      ]}
                    >
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

export default AddLeave;
