import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import moment from 'moment';
import AppIcon from './appIcon';

interface MonthSelectorProps {
  selectedMonthYear: string; // "YYYY-MM"
  onMonthChange: (monthYear: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonthYear,
  onMonthChange,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const changeMonthYear = (direction: number): void => {
    const newMonthYear = moment(selectedMonthYear, 'YYYY-MM')
      .add(direction, 'month')
      .format('YYYY-MM');

    onMonthChange(newMonthYear);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => changeMonthYear(-1)}>
        <AppIcon
          name="ChevronLeft"
          size={24}
          color={isDarkMode ? '#FFFFFF' : '#232323'}
        />
      </TouchableOpacity>

      <Text
        style={
          isDarkMode ? styles.monthYearTextDark : styles.monthYearTextLight
        }
      >
        {moment(selectedMonthYear, 'YYYY-MM').format('MMMM YYYY')}
      </Text>

      <TouchableOpacity onPress={() => changeMonthYear(1)}>
        <AppIcon
          name="ChevronRight"
          size={24}
          color={isDarkMode ? '#FFFFFF' : '#232323'}
        />
      </TouchableOpacity>
    </View>
  );
};

export default MonthSelector;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  monthYearTextLight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#232323',
  },
  monthYearTextDark: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
