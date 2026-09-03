import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import CustomDropdown from '../../components/formComponent/customDropdown';
import CustomInput from '../../components/formComponent/customInput';
import CustomButton from '../../components/button/customButton';
import CalendarPickerModal from '../../components/formComponent/calendarpickermodal';
import FormLabel from '../../components/formComponent/formLabel';
import ScreenWrapper from '../../components/screenWrapper';
import { getFormTheme, formStyles } from '../../assets/style/formStyles';
import { getDevelopersList, calculateSalary, Developer } from '../../services/salaryService';
import ToastUtil from '../../utils/toastAndroid';
import moment from 'moment';
import { formatDate } from '../../utils/dateUtils';
import { moderateScale } from 'react-native-size-matters';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AppIcon from '../../components/appIcon';

const CalculateSalary = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { colors } = useTheme();
  const theme = getFormTheme(isDarkMode);

  const [employees, setEmployees] = useState<Developer[]>([]);
  const [employeeId, setEmployeeId] = useState<string>('');
  
  const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  
  const [additionalAmt, setAdditionalAmt] = useState('');
  const [loading, setLoading] = useState(false);
  const [calcResult, setCalcResult] = useState<any>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await getDevelopersList();
      if (res.success) setEmployees(res.data);
    };
    fetchEmployees();
  }, []);

  const handleCalculate = async () => {
    if (!employeeId) {
      ToastUtil.info('Please select an employee');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('entry_date', formatDate(entryDate, 'server'));
      if (additionalAmt) {
        formData.append('additional_amt', additionalAmt);
      }
      
      const res = await calculateSalary(formData);
      if (res.success) {
        setCalcResult(res.data);
      } else {
        ToastUtil.error('Failed to calculate salary');
        setCalcResult(null);
      }
    } catch (err) {
      ToastUtil.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <ScrollView
        style={[formStyles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={formStyles.scrollContent}
      >
        <View style={[formStyles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={formStyles.formHeader}>
            <Text style={[formStyles.formTitle, { color: theme.label }]}>Salary Calculation</Text>
            <Text style={[formStyles.formSubtitle, { color: theme.subText }]}>Calculate payroll summary for an employee.</Text>
          </View>

          <View style={formStyles.fieldContainer}>
            <FormLabel label="Employee" required color={theme.label} />
            <CustomDropdown
              data={employees}
              value={employeeId}
              placeholder="Select Employee..."
              searchPlaceholder="Search Employee..."
              onChange={(item) => setEmployeeId(item.id.toString())}
              labelField="name"
              valueField="id"
              colors={colors}
              label=""
            />
          </View>

          <View style={formStyles.fieldContainer}>
            <FormLabel label="Entry Date" required color={theme.label} />
            <TouchableOpacity
              style={[
                formStyles.dateInputFull,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
              ]}
              onPress={() => setShowEntryDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[formStyles.dateInputText, { color: theme.inputText }]}>
                {formatDate(entryDate, 'display')}
              </Text>
              <AppIcon name="Calendar" size={moderateScale(18)} color={theme.placeholder} style={formStyles.calendarIcon} />
            </TouchableOpacity>
          </View>

          <View style={formStyles.fieldContainer}>
            <FormLabel label="Additional Amount" color={theme.label} />
            <CustomInput
              value={additionalAmt}
              onChangeText={setAdditionalAmt}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <CustomButton
            label="Calculate Salary"
            onPress={handleCalculate}
            disabled={loading}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
        ) : calcResult ? (
          <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.resultTitle, { color: theme.label }]}>Calculation Summary</Text>
            <View style={styles.resultRow}>
              <Text style={{ color: theme.subText }}>Salary</Text>
              <Text style={[styles.resultValue, { color: theme.label }]}>₹{calcResult.salary}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={{ color: theme.subText }}>Working Days</Text>
              <Text style={[styles.resultValue, { color: theme.label }]}>{calcResult.working_days}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={{ color: theme.subText }}>Leave Days</Text>
              <Text style={[styles.resultValue, { color: theme.label }]}>{calcResult.leave_days}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={{ color: theme.subText }}>Gross Amount</Text>
              <Text style={[styles.resultValue, { color: theme.label }]}>₹{calcResult.gross_amount}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={{ color: theme.subText }}>Deduction</Text>
              <Text style={[styles.resultValue, { color: '#EF4444' }]}>₹{calcResult.deduction_amount}</Text>
            </View>
            <View style={[styles.resultRow, styles.totalRow, { borderTopColor: theme.border }]}>
              <Text style={styles.totalText}>Net Amount</Text>
              <Text style={[styles.totalValue, { color: '#10B981' }]}>₹{calcResult.net_amount}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <CalendarPickerModal
        visible={showEntryDatePicker}
        onClose={() => setShowEntryDatePicker(false)}
        onSelectDate={(date) => {
          setEntryDate(date);
          setShowEntryDatePicker(false);
        }}
        selectedDate={entryDate}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  resultCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  resultValue: {
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CalculateSalary;
