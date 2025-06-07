import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/scannerStyles';

const LoadingView = ({ message = 'Cargando...' }) => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingAnimation}>
        <MaterialIcons name="restaurant" size={50} color="#690B22" />
        <ActivityIndicator size="large" color="#690B22" style={{ marginTop: 20 }} />
      </View>
      <Text style={styles.loadingText}>{message}</Text>
      <Text style={styles.loadingSubtext}>Esto tomará un momento</Text>
    </View>
  );
};

export default LoadingView;
