import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/recetasStyles';

const EmptyRecetas = () => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="no-meals" size={64} color="#690B22" />
      <Text style={styles.emptyText}>No se encontraron recetas</Text>
    </View>
  );
};

export default EmptyRecetas;
