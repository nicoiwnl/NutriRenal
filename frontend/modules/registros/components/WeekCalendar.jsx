import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/registrosStyles';

const WeekCalendar = ({ weekDates, selectedDate, onDateSelect, markedDates }) => {
  return (
    <View style={styles.weekCalendarContainer}>
      <View style={styles.weekDaysRow}>
        {weekDates.map((dateInfo) => {
          const isSelected = selectedDate === dateInfo.dateString;
          const isMarked = markedDates[dateInfo.dateString]?.marked;
          
          return (
            <TouchableOpacity 
              key={dateInfo.dateString}
              style={[
                styles.weekDay,
                isSelected && styles.selectedWeekDay,
                dateInfo.isToday && styles.todayWeekDay
              ]}
              onPress={() => onDateSelect(dateInfo.dateString)}
            >
              <Text style={[
                styles.weekDayName, 
                isSelected && styles.selectedWeekDayText
              ]}>
                {dateInfo.dayName}
              </Text>
              <Text style={[
                styles.weekDayNumber,
                isSelected && styles.selectedWeekDayText,
                dateInfo.isToday && styles.todayWeekDayText
              ]}>
                {dateInfo.day}
              </Text>
              {isMarked && (
                <View style={[
                  styles.dotMarker,
                  isSelected && styles.selectedDotMarker
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default WeekCalendar;
