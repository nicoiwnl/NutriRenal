import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import styles from '../styles/registrosStyles';

const LoadingView = ({ message = "Cargando registros..." }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#690B22" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

export default LoadingView;
