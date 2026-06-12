import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
}

const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  minimumDate,
  maximumDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(
    selectedDate || new Date(),
  );

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  useEffect(() => {
  if (visible) {
    const today = new Date();

    setCurrentMonth(selectedDate || today);
    setTempSelectedDate(selectedDate || today);
  }
}, [visible, selectedDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const handleDayPress = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );

    // Check if date is within allowed range
    if (minimumDate && newDate < minimumDate) return;
    if (maximumDate && newDate > maximumDate) return;

    setTempSelectedDate(newDate);
  };

  const handleConfirm = () => {
    if (tempSelectedDate) {
      onSelectDate(tempSelectedDate);
      onClose();
    }
  };

  const handleCancel = () => {
    setTempSelectedDate(selectedDate || null);
    onClose();
  };

  const isDateSelected = (day: number) => {
    if (!tempSelectedDate) return false;
    return (
      tempSelectedDate.getDate() === day &&
      tempSelectedDate.getMonth() === currentMonth.getMonth() &&
      tempSelectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    if (minimumDate && date < minimumDate) return true;
    if (maximumDate && date > maximumDate) return true;
    return false;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handlePreviousMonth}
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.monthYearText}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>

            <TouchableOpacity
              onPress={handleNextMonth}
              style={styles.navButton}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day, index) => (
              <View key={index} style={styles.dayOfWeekCell}>
                <Text style={styles.dayOfWeekText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const selected = isDateSelected(day);
              const disabled = isDateDisabled(day);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    selected && styles.selectedDayCell,
                    disabled && styles.disabledDayCell,
                  ]}
                  onPress={() => !disabled && handleDayPress(day)}
                  disabled={disabled}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selected && styles.selectedDayText,
                      disabled && styles.disabledDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleConfirm}
            >
              <Text style={styles.selectButtonText}>Select Date</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    color: 'black',
    fontSize: 28,
    fontWeight: '300',
  },
  monthYearText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayOfWeekText: {
    color: 'black',
    fontSize: 11,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectedDayCell: {
    backgroundColor: '#3B82F6',
    borderRadius: 50,
  },
  disabledDayCell: {
    opacity: 0.3,
  },
  dayText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '400',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledDayText: {
    color: '#64748B',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default CalendarPickerModal;
