import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import styles from '../styles/scannerStyles';

const LoadingView = ({ message = 'Analizando alimento...' }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#690B22" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

export default LoadingView;
