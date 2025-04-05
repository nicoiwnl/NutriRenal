import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/registrosStyles';

const CalendarHeader = ({ calendarView, onToggleCalendarView }) => {
  return (
    <View style={styles.calendarHeader}>
      <Text style={styles.calendarTitle}>
        {calendarView === 'week' ? 'Vista Semanal' : 'Vista Mensual'}
      </Text>
      <TouchableOpacity 
        style={styles.calendarToggle}
        onPress={onToggleCalendarView}
      >
        <MaterialIcons 
          name={calendarView === 'week' ? 'calendar-month' : 'view-week'} 
          size={22} 
          color="#690B22" 
        />
        <Text style={styles.calendarToggleText}>
          {calendarView === 'week' ? 'Ver Mes' : 'Ver Semana'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CalendarHeader;
