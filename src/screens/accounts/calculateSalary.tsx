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
import { moderateScale, verticalScale } from 'react-native-size-matters';
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
      withHeader={false}
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <View style={[styles.payrollHeader, { backgroundColor: isDarkMode ? '#111827' : '#0F2B5B' }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.payrollKicker}>PAYROLL</Text>
          <Text style={styles.payrollTitle}>Salary calculator</Text>
          <Text style={styles.payrollSub}>Generate a clear payroll estimate before processing.</Text>
        </View>
        <View style={styles.payrollIcon}><AppIcon name="Wallet" size={moderateScale(21)} color="#2563EB" /></View>
      </View>
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
            <View style={styles.resultHeadingRow}><View><Text style={[styles.resultEyebrow, { color: theme.subText }]}>PAYROLL RESULT</Text><Text style={[styles.resultTitle, { color: theme.label }]}>Calculation summary</Text></View><AppIcon name="CircleCheck" size={moderateScale(20)} color="#10B981" /></View>
            <View style={[styles.netHero, { backgroundColor: isDarkMode ? '#052E16' : '#ECFDF5' }]}><Text style={[styles.netLabel, { color: isDarkMode ? '#86EFAC' : '#059669' }]}>ESTIMATED NET PAY</Text><Text style={[styles.netValue, { color: isDarkMode ? '#DCFCE7' : '#047857' }]}>₹{calcResult.net_amount}</Text></View>
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
            <View style={[styles.resultRow, styles.totalRow, { borderTopColor: theme.border }]}><Text style={styles.totalText}>Net Amount</Text><Text style={[styles.totalValue, { color: '#10B981' }]}>₹{calcResult.net_amount}</Text></View>
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
  payrollHeader: { marginHorizontal: 0, marginTop: 0, marginBottom: verticalScale(8), paddingHorizontal: moderateScale(19), paddingVertical: verticalScale(15), borderRadius: 0, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  payrollKicker: { color: '#A9C6FF', fontSize: moderateScale(8.5), fontWeight: '800', letterSpacing: 1.6, marginBottom: verticalScale(5) },
  payrollTitle: { color: '#FFFFFF', fontSize: moderateScale(23), fontWeight: '800', letterSpacing: -0.5 },
  payrollSub: { color: '#CAD4E2', fontSize: moderateScale(10.5), lineHeight: moderateScale(16), marginTop: verticalScale(5), maxWidth: moderateScale(280) },
  payrollIcon: { width: moderateScale(48), height: moderateScale(48), borderRadius: moderateScale(16), backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  resultCard: { marginTop: verticalScale(18), padding: moderateScale(17), borderRadius: moderateScale(19), borderWidth: 1, shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  resultHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: verticalScale(12) },
  resultEyebrow: { fontSize: moderateScale(8), fontWeight: '800', letterSpacing: 1.25 },
  resultTitle: { fontSize: moderateScale(18), fontWeight: '800', marginTop: verticalScale(2), letterSpacing: -0.2 },
  netHero: { paddingHorizontal: moderateScale(16), paddingVertical: verticalScale(16), borderRadius: moderateScale(17), marginBottom: verticalScale(11) },
  netLabel: { fontSize: moderateScale(8), fontWeight: '800', letterSpacing: 1.2 },
  netValue: { fontSize: moderateScale(30), fontWeight: '800', marginTop: verticalScale(3), letterSpacing: -0.8 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: verticalScale(9) },
  resultValue: { fontWeight: '700' },
  totalRow: { marginTop: verticalScale(8), paddingTop: verticalScale(12), borderTopWidth: 1 },
  totalText: { fontSize: moderateScale(14), fontWeight: '800', color: '#334155' },
  totalValue: { fontSize: moderateScale(17), fontWeight: '800' },
});

export default CalculateSalary;
