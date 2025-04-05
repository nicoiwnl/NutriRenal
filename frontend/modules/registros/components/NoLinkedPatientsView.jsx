import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/registrosStyles';

const NoLinkedPatientsView = ({ onBackPress }) => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="people" size={48} color="#690B22" />
      <Text style={styles.noLinkedPatientsText}>
        No tiene pacientes vinculados. Vincule pacientes desde la pantalla de Ficha Médica.
      </Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
      >
        <MaterialIcons name="arrow-back" size={20} color="white" />
        <Text style={styles.backButtonText}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NoLinkedPatientsView;
