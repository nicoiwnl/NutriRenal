import React, { useState } from 'react';
import { TouchableOpacity, Text, Platform, View, Modal, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/loginStyles';

const CrossPlatformDatePicker = ({ value, onChange, maximumDate, formatDateToDDMMYYYY }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Separamos el renderizado del icono para que permanezca visible
  const renderCalendarIcon = () => (
    <MaterialIcons name="calendar-today" size={24} color="#690B22" />
  );

  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    // Versión optimizada para móvil
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateButtonText}>
            {value ? formatDateToDDMMYYYY(value) : 'Seleccionar fecha de nacimiento'}
          </Text>
          {renderCalendarIcon()}
        </TouchableOpacity>
        
        {/* En Android, usamos un Modal para mostrar el DatePicker y evitar problemas de layout */}
        {Platform.OS === 'android' && showPicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={value || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (event.type !== 'dismissed' && selectedDate) {
                onChange(selectedDate);
              }
            }}
            maximumDate={maximumDate}
          />
        )}
        
        {/* Para iOS, usamos un Modal personalizado para mejor control del layout */}
        {Platform.OS === 'ios' && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showPicker}
            onRequestClose={() => setShowPicker(false)}
          >
            <View style={localStyles.modalContainer}>
              <View style={localStyles.pickerContainer}>
                <View style={localStyles.pickerHeader}>
                  <TouchableOpacity 
                    onPress={() => setShowPicker(false)}
                    style={localStyles.cancelButton}
                  >
                    <Text style={localStyles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => {
                      setShowPicker(false);
                      // Usamos el valor actual ya que iOS actualiza el valor mientras se navega
                      onChange(value);
                    }}
                    style={localStyles.doneButton}
                  >
                    <Text style={localStyles.doneText}>Listo</Text>
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={value || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      onChange(selectedDate);
                    }
                  }}
                  style={localStyles.iOSPicker}
                  maximumDate={maximumDate}
                  textColor="#1B4D3E"
                  accentColor="#690B22"
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
    );
  } else {
    // Versión para web
    return (
      <input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          if (e.target.value) {
            onChange(new Date(e.target.value));
          }
        }}
        max={maximumDate ? maximumDate.toISOString().split('T')[0] : undefined}
        style={{
          padding: '12px',
          borderRadius: '8px',
          borderColor: '#E07A5F',
          borderWidth: '1px',
          backgroundColor: '#F1E3D3',
          width: '100%',
          marginBottom: '15px',
          fontSize: '16px',
          color: '#1B4D3E'
        }}
      />
    );
  }
};

// Estilos locales para el modal y picker en iOS
const localStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 15,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  cancelButton: {
    padding: 5,
  },
  cancelText: {
    color: '#999',
    fontSize: 16,
  },
  doneButton: {
    padding: 5,
  },
  doneText: {
    color: '#690B22',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iOSPicker: {
    height: 200,
  }
});

export default CrossPlatformDatePicker;
