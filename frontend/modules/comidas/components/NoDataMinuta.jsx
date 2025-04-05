import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';

const NoDataMinuta = () => {
  return (
    <View style={styles.noDataContainer}>
      <MaterialIcons name="event-busy" size={48} color="#690B22" />
      <Text style={styles.noDataText}>
        No tiene minutas nutricionales asignadas.
      </Text>
      <Text style={styles.noDataSubtext}>
        Consulte con su nutricionista o especialista para crear una.
      </Text>
    </View>
  );
};

export default NoDataMinuta;
