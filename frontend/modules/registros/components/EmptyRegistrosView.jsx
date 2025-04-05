import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/registrosStyles';

const EmptyRegistrosView = ({ onExplorarAlimentos }) => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="no-meals" size={60} color="#690B22" />
      <Text style={styles.emptyText}>No hay registros en este periodo</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={onExplorarAlimentos}
      >
        <MaterialIcons name="restaurant" size={20} color="white" />
        <Text style={styles.emptyButtonText}>Explorar Alimentos</Text>
      </TouchableOpacity>
      {/* Eliminamos el botón duplicado */}
    </View>
  );
};

export default EmptyRegistrosView;
