import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useColorScheme,
  StatusBar,
  Button,
  Modal,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import DateTimePicker from '@react-native-community/datetimepicker';

import CustomDropdown from '../../../components/formComponent/customDropdown';
import CustomInput from '../../../components/formComponent/customInput';
import CustomButton from '../../../components/button/customButton';
import CalendarPickerModal from '../../../components/formComponent/calendarpickermodal';
import AppIcon from '../../../components/appIcon';
import ToastUtil from '../../../utils/toastAndroid';
import {
  addReminder,
  getUsersList,
} from '../../../services/projectReminderService';
import { Party, ReminderType, ReminderStatus } from './reminderCard';
import CustomRadioGroup from '../../../components/formComponent/customRadioGroup';
import FormLabel from '../../../components/formComponent/formLabel';
import { formStyles, getFormTheme } from '../../../assets/style/formStyles';
import { moderateScale } from 'react-native-size-matters';
import { formatDate } from '../../../utils/dateUtils';
import { Developer } from '../../../services/salaryService';
import NetInfoComponent from '../../../components/netinfoComponent';

const AddProjectReminderScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getFormTheme(isDarkMode);
  const parties: Party[] = route.params?.parties ?? [];
  const reminderTypes: ReminderType[] = route.params?.reminderTypes ?? [];
  const [party, setParty] = useState<string | number | null>(null);
  const [reminderType, setReminderType] = useState<string | number | null>(
    null,
  );
  const [status, setStatus] = useState<ReminderStatus>('Pending');
  const [remarks, setRemarks] = useState('');
  const [disableBtn, setDisableBtn] = useState(false);

  // ─────────────────────────────────────────────
  // Start Date & Time
  // ─────────────────────────────────────────────

  const [showStartPicker, setShowStartPicker] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);

  const [startDateDisplay, setStartDateDisplay] = useState('');

  // ─────────────────────────────────────────────
  // End Date & Time
  // ─────────────────────────────────────────────

  const [showEndPicker, setShowEndPicker] = useState(false);

  const [endDate, setEndDate] = useState<Date | null>(null);

  const [endDateDisplay, setEndDateDisplay] = useState('');

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());

  const [startTimeDisplay, setStartTimeDisplay] = useState('');
  const [endTimeDisplay, setEndTimeDisplay] = useState('');

  // ─────────────────────────────────────────────
  // Employees
  // ─────────────────────────────────────────────

  const [users, setUsers] = useState<Developer[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // ─────────────────────────────────────────────
  // Date Handlers
  // ─────────────────────────────────────────────

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    setStartDateDisplay(formatDate(date, 'display'));
    setShowStartPicker(false);
  };

  const handleEndDateSelect = (date: Date) => {
    setEndDate(date);
    setEndDateDisplay(formatDate(date, 'display'));
    setShowEndPicker(false);
  };

  // ─────────────────────────────────────────────
  // Time Handlers
  // ─────────────────────────────────────────────

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }

    if (selectedDate) {
      setStartTime(selectedDate);
      setStartTimeDisplay(formatTime(selectedDate));
    }
  };

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }

    if (selectedDate) {
      setEndTime(selectedDate);
      setEndTimeDisplay(formatTime(selectedDate));
    }
  };

  // ─────────────────────────────────────────────
  // Load Employees
  // ─────────────────────────────────────────────

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);

      const { success, data } = await getUsersList();

      if (success) {
        // Ensure correct dropdown format

        setUsers(data);
      } else {
        ToastUtil.error('Failed to load employees');
      }
    } catch (error) {
      console.error('Employee list error:', error);
      ToastUtil.error('Something went wrong');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // ─────────────────────────────────────────────
  // Combine Date & Time
  // ─────────────────────────────────────────────

  const combineDateAndTime = (
    date: Date | null,
    time: Date | null,
  ): string | null => {
    if (!date || !time) return null;

    const finalDate = new Date(date);

    finalDate.setHours(time.getHours());
    finalDate.setMinutes(time.getMinutes());
    finalDate.setSeconds(0);

    const year = finalDate.getFullYear();

    const month = String(finalDate.getMonth() + 1).padStart(2, '0');

    const day = String(finalDate.getDate()).padStart(2, '0');

    const hours = String(finalDate.getHours()).padStart(2, '0');

    const minutes = String(finalDate.getMinutes()).padStart(2, '0');

    const seconds = String(finalDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  // ─────────────────────────────────────────────
  // Save
  // ─────────────────────────────────────────────

  const handleSave = async () => {
    if (!party) {
      ToastUtil.info('Please select a party');
      return;
    }
    if (!reminderType) {
      ToastUtil.info('Please select a reminder type');
      return;
    }

    if (selectedUsers.length === 0) {
      ToastUtil.info('Please select at least one employee');
      return;
    }
    if (!remarks.trim()) {
      ToastUtil.info('Please provide remarks');
      return;
    }

    // ── Date/time is optional — only validate if one side is partially filled ─
    const startCombined = combineDateAndTime(startDate, startTime);
    const endCombined = combineDateAndTime(endDate, endTime);

    if (startCombined && endCombined && endCombined < startCombined) {
      ToastUtil.info('End date/time cannot be before start date/time');
      return;
    }

    try {
      setDisableBtn(true);

      const formData = new FormData();
      formData.append('party_id', String(party));
      formData.append('reminder_type_id', String(reminderType));
      formData.append('status', status);
      // Send each user id as separate entries so the server receives an array
      selectedUsers.forEach(uid => formData.append('user_ids[]', uid));
      formData.append('remarks', remarks);
      if (startCombined) formData.append('start_date', startCombined);
      if (endCombined) formData.append('end_date', endCombined);

      console.log('Payload for API:', {
        party_id: party,
        reminder_type_id: reminderType,
        status,
        user_ids: selectedUsers,
        remarks,
        start_date: startCombined,
        end_date: endCombined,
      });

      const { success, message } = await addReminder(formData);

      if (success) {
        ToastUtil.success(message ?? 'Reminder added successfully');
        // ── FIX: just go back; the list screen reloads via useIsFocused ──────
        navigation.goBack();
      } else {
        ToastUtil.error(message ?? 'Failed to add reminder');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Add reminder error:', error.message);
      }
      ToastUtil.error('An error occurred while saving the reminder');
    } finally {
      setDisableBtn(false);
    }
  };

  // ── Dropdown item renderer ───────────
  const renderDropdownItem = (item: any) => (
    <View style={formStyles.dropdownItemContainer}>
      {item.icon && (
        <AppIcon
          name={item.icon}
          size={moderateScale(18)}
          color="#6B7280"
          style={formStyles.dropdownItemIcon}
        />
      )}
      <Text style={formStyles.dropdownItemText}>{item.name}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[
        formStyles.keyboardContainer,
        { backgroundColor: theme.background },
      ]}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 120}
    >
      <StatusBar
        translucent
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <NetInfoComponent onReconnect={loadEmployees} />

      <ScrollView
        style={formStyles.container}
        contentContainerStyle={formStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={formStyles.formContainer}>
          {/* ── Party ───────*/}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Party" required color={theme.label} />
            <CustomDropdown
              data={parties}
              value={party}
              search
              placeholder="Choose Party"
              searchPlaceholder="Search party..."
              onChange={item => setParty(item.id)}
              labelField="name"
              valueField="id"
              renderItem={renderDropdownItem}
              colors={colors}
              label=""
            />
          </View>
          {/* ── Reminder Type ───────*/}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Reminder Type" required color={theme.label} />
            <CustomDropdown
              data={reminderTypes}
              value={reminderType}
              placeholder="Choose Reminder Type"
              onChange={item => setReminderType(item.id)}
              labelField="name"
              valueField="id"
              renderItem={renderDropdownItem}
              colors={colors}
              label=""
            />
          </View>
          {/* ── Employees ───────*/}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Employee" required color={theme.label} />
            <CustomDropdown
              data={users}
              value={selectedUsers}
              placeholder={loadingEmployees ? 'Loading...' : 'Select Employee'}
              onChange={selectedValues => setSelectedUsers(selectedValues)}
              labelField="name"
              valueField="id"
              colors={colors}
              multiselect
              label=""
              searchPlaceholder="Search employee..."
              renderItem={renderDropdownItem}
              search
            />
          </View>

          {/* START DATE */}
          {/* START DATE & TIME ROW */}
          <View style={formStyles.dateRow}>
            {/* Start Date */}
            <View style={formStyles.dateFieldHalf}>
              <FormLabel label="Start Date" color={theme.label} />

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
                  {startDateDisplay || 'Select Date'}
                </Text>

                <AppIcon
                  name="Calendar"
                  size={moderateScale(18)}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>

            {/* Start Time */}
            <View style={formStyles.dateFieldHalf}>
              <FormLabel label="Start Time" color={theme.label} />

              <TouchableOpacity
                style={[
                  formStyles.dateInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setShowStartTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    formStyles.dateInputText,
                    {
                      color: startTimeDisplay
                        ? theme.inputText
                        : theme.placeholder,
                    },
                  ]}
                >
                  {startTimeDisplay || 'Select Time'}
                </Text>

                <AppIcon
                  name="Clock3"
                  size={moderateScale(18)}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* END DATE */}
          {/* END DATE & TIME ROW */}
          <View style={formStyles.dateRow}>
            {/* End Date */}
            <View style={formStyles.dateFieldHalf}>
              <FormLabel label="End Date" color={theme.label} />

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
                  {endDateDisplay || 'Select Date'}
                </Text>

                <AppIcon
                  name="Calendar"
                  size={moderateScale(18)}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>

            {/* End Time */}
            <View style={formStyles.dateFieldHalf}>
              <FormLabel label="End Time" color={theme.label} />

              <TouchableOpacity
                style={[
                  formStyles.dateInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => setShowEndTimePicker(true)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    formStyles.dateInputText,
                    {
                      color: endTimeDisplay
                        ? theme.inputText
                        : theme.placeholder,
                    },
                  ]}
                >
                  {endTimeDisplay || 'Select Time'}
                </Text>

                <AppIcon
                  name="Clock3"
                  size={moderateScale(18)}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Status */}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Status" required color={theme.label} />
            <CustomRadioGroup
              options={[
                { label: 'Pending', value: 'Pending' },
                { label: 'Completed', value: 'Completed' },
              ]}
              value={status}
              onChange={val => setStatus(val as ReminderStatus)}
            />
          </View>
          {/* ── Remarks ───────── */}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Remarks" required color={theme.label} />
            <CustomInput
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Provide a brief explanation..."
              isMultiline
              numberOfLines={4}
            />
          </View>
          {/* ── Submit ───────*/}
          <View style={formStyles.submitWrapper}>
            <CustomButton
              label="SAVE"
              onPress={handleSave}
              disabled={disableBtn}
            />
          </View>
        </View>
        {/* ── Calendar Pickers ───────*/}
        <CalendarPickerModal
          visible={showStartPicker}
          onClose={() => setShowStartPicker(false)}
          onSelectDate={handleStartDateSelect}
          selectedDate={startDate || undefined}
        />
        <CalendarPickerModal
          visible={showEndPicker}
          onClose={() => setShowEndPicker(false)}
          onSelectDate={handleEndDateSelect}
          selectedDate={endDate || undefined}
          minimumDate={startDate || undefined}
        />

        {/* Time Pickers */}
        {Platform.OS === 'android' && showStartTimePicker && (
          <DateTimePicker
            value={startTime || new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleStartTimeChange}
          />
        )}

        {Platform.OS === 'android' && showEndTimePicker && (
          <DateTimePicker
            value={endTime || new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleEndTimeChange}
          />
        )}

        {Platform.OS === 'ios' && (
          <>
            <Modal
              visible={showStartTimePicker}
              transparent
              animationType="slide"
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
              >
                <View
                  style={{
                    backgroundColor: '#fff',
                    paddingBottom: 30,
                  }}
                >
                  <Button
                    title="Done"
                    onPress={() => setShowStartTimePicker(false)}
                  />

                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="spinner"
                    onChange={handleStartTimeChange}
                  />
                </View>
              </View>
            </Modal>

            <Modal
              visible={showEndTimePicker}
              transparent
              animationType="slide"
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}
              >
                <View
                  style={{
                    backgroundColor: '#fff',
                    paddingBottom: 30,
                  }}
                >
                  <Button
                    title="Done"
                    onPress={() => setShowEndTimePicker(false)}
                  />

                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="spinner"
                    onChange={handleEndTimeChange}
                  />
                </View>
              </View>
            </Modal>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddProjectReminderScreen;
