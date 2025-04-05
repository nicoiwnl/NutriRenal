import React from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styles from '../styles/registrosStyles';

const MonthCalendar = ({ markedDates, selectedDate, onDateSelect }) => {
  const markedDatesWithSelection = {
    ...markedDates,
    [selectedDate || '']: {
      selected: true,
      selectedColor: '#690B22',
      marked: markedDates[selectedDate || '']?.marked || false,
      dotColor: 'white'
    }
  };

  return (
    <View style={styles.monthCalendarContainer}>
      <Calendar
        onDayPress={(day) => onDateSelect(day.dateString)}
        markedDates={markedDatesWithSelection}
        theme={{
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#1B4D3E',
          selectedDayBackgroundColor: '#690B22',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#E07A5F',
          dayTextColor: '#333333',
          arrowColor: '#690B22',
          monthTextColor: '#1B4D3E',
          textMonthFontWeight: 'bold',
          textDayFontSize: 14,
          textMonthFontSize: 16,
        }}
      />
    </View>
  );
};

export default MonthCalendar;
