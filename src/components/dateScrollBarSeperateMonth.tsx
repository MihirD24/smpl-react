import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import moment, { Moment } from 'moment';
import { Picker } from '@react-native-picker/picker';
import Maincss from '../assets/style/maincss';
import DateScrollDarSeperateMonth from '../assets/style/dateScrollBarSeperateMonth';
import { useTheme } from '@react-navigation/native';
import AppIcon from './appIcon';

interface DateItem {
  day: string;
  date: string; // "DD"
}

interface DateScrollBarProps {
  initialMonthYear?: string; // "YYYY-MM"
  selectedDate?: string; // "DD"
  onDateSelected?: (fullDate: string) => void; // "YYYY-MM-DD"
  onSelectedDateChange?: (day: string) => void;
}

const DateScrollBar: React.FC<DateScrollBarProps> = ({
  initialMonthYear = moment().format('YYYY-MM'),
  selectedDate: parentSelectedDate,
  onDateSelected,
  onSelectedDateChange,
}) => {
  const mainStyles = Maincss();
  const { colors } = useTheme();
  const styles = DateScrollDarSeperateMonth();

  const [monthYear, setMonthYear] = useState<string>(initialMonthYear);
  const [dates, setDates] = useState<DateItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    parentSelectedDate || moment().format('DD'),
  );
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    moment().format('MM'),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    moment().format('YYYY'),
  );

  const flatListRef = useRef<FlatList<DateItem>>(null);

  /** Build dates when month/year changes */
  useEffect(() => {
    const [year, month] = monthYear.split('-');
    const daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
    const dateArray: DateItem[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD');
      dateArray.push({
        day: date.format('ddd'),
        date: date.format('DD'),
      });
    }

    setDates(dateArray);

    const today = moment().format('DD');
    const currentMonthYear = moment().format('YYYY-MM');

    let defaultScrollIndex = dateArray.findIndex(d => d.date === selectedDate);

    if (monthYear === currentMonthYear && defaultScrollIndex === -1) {
      defaultScrollIndex = dateArray.findIndex(d => d.date === today);
    }

    setTimeout(() => {
      if (defaultScrollIndex !== -1) {
        flatListRef.current?.scrollToIndex({
          animated: true,
          index: defaultScrollIndex,
          viewPosition: 0.5,
        });
      }
    }, 150);
  }, [monthYear, selectedDate]);

  /** Change month via arrows */
  const changeMonthYear = (direction: number): void => {
    const newMonthYear = moment(monthYear, 'YYYY-MM')
      .add(direction, 'month')
      .format('YYYY-MM');

    setMonthYear(newMonthYear);

    if (newMonthYear === moment().format('YYYY-MM')) {
      const today = moment().format('DD');
      setSelectedDate(today);
      onSelectedDateChange?.(today);
    } else {
      setSelectedDate('');
      onSelectedDateChange?.('');
    }
  };

  /** Date press handler */
  const handleDatePress = (day: string): void => {
    if (day === selectedDate) return;

    setSelectedDate(day);
    onSelectedDateChange?.(day);

    const index = dates.findIndex(d => d.date === day);
    if (index !== -1) {
      flatListRef.current?.scrollToIndex({
        animated: true,
        index,
        viewPosition: 0.5,
      });
    }

    const [year, month] = monthYear.split('-');
    onDateSelected?.(`${year}-${month}-${day}`);
  };

  const renderDate = ({ item }: { item: DateItem }) => (
    <TouchableOpacity
      style={[
        styles.dateContainer,
        item.date === selectedDate && styles.selectedDateContainer,
      ]}
      onPress={() => handleDatePress(item.date)}
    >
      <Text
        style={[
          styles.dayText,
          item.date === selectedDate && styles.selectedDayText,
        ]}
      >
        {item.day}
      </Text>
      <Text
        style={[
          styles.dateText,
          item.date === selectedDate && styles.selectedDateText,
        ]}
      >
        {item.date}
      </Text>
    </TouchableOpacity>
  );

  const initialScrollIndex =
    dates.length > 0
      ? Math.max(
          dates.findIndex(d => d.date === selectedDate),
          0,
        )
      : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonthYear(-1)}>
          <AppIcon name="ChevronLeft" size={24} color={colors.notification} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.monthYearText}>
            {moment(monthYear, 'YYYY-MM').format('MMMM YYYY')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeMonthYear(1)}>
          <AppIcon name="ChevronRight" size={24} color={colors.notification} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.date}
        renderItem={renderDate}
        getItemLayout={(_, index) => ({
          length: 60,
          offset: 65 * index,
          index,
        })}
        initialScrollIndex={initialScrollIndex}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
            });
          }, 50);
        }}
      />

      {/* Month / Year Picker */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Select Month</Text>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(value: string) => setSelectedMonth(value)}
              >
                {moment.months().map((month, index) => (
                  <Picker.Item
                    key={index}
                    label={month}
                    value={String(index + 1).padStart(2, '0')}
                  />
                ))}
              </Picker>

              <Text style={styles.pickerLabel}>Select Year</Text>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(value: string) => setSelectedYear(value)}
              >
                {Array.from(
                  { length: 20 },
                  (_, i) => moment().year() - 10 + i,
                ).map(year => (
                  <Picker.Item
                    key={year}
                    label={String(year)}
                    value={String(year)}
                  />
                ))}
              </Picker>

              <TouchableOpacity
                onPress={() => {
                  const today = moment().format('DD');
                  const currentMonthYear = moment().format('YYYY-MM');
                  const newMonthYear = `${selectedYear}-${selectedMonth}`;

                  setMonthYear(newMonthYear);
                  setModalVisible(false);

                  if (newMonthYear === currentMonthYear) {
                    setSelectedDate(today);
                    onSelectedDateChange?.(today);
                    onDateSelected?.(moment().format('YYYY-MM-DD'));
                  } else {
                    setSelectedDate('');
                    onSelectedDateChange?.('');
                  }
                }}
                style={[
                  mainStyles.button,
                  mainStyles.buttonBlack,
                  { marginTop: 10 },
                ]}
              >
                <Text style={mainStyles.buttonLable}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default DateScrollBar;
