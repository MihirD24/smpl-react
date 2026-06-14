import { useTheme } from '@react-navigation/native';
import { StyleSheet, useColorScheme } from 'react-native';

const DateScrollDarSeperateMonth = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { colors } = useTheme();
  return StyleSheet.create({
    container: {
      paddingVertical: 10,
      backgroundColor: 'transparent',
    },
    picker: {
      borderColor: '#232323',
      borderWidth: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    monthYearText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    modalContainer: {
      flex: 1,
      width: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    pickerContainer: {
      backgroundColor: '#FFF',
      margin: 20,
      padding: 20,
      borderRadius: 10,
    },
    pickerLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#232323',
    },
    dateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 15,
      paddingVertical: 5,
      borderRadius: 50,
      marginHorizontal: 5,
    },
    selectedDateContainer: {
      backgroundColor: isDarkMode ? '#FFFFFF' : '#3B82F6',
    },
    dayText: {
      fontSize: 14,
      color: '#6b7280',
    },
    dateText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#6b7280',
    },
    selectedDayText: {
      color: isDarkMode ? '#000000' : '#FFFFFF',
    },
    selectedDateText: {
      color: isDarkMode ? '#000000' : '#FFFFFF',
    },
  });
};

export default DateScrollDarSeperateMonth;
