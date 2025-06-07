import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Add this import

const DetectionMessage = ({ isLoading, platoDetectado }) => {
  return (
    <View style={styles.detectionContainer}>
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="#690B22" style={styles.loader} />
          <Text style={styles.detectionText}>Detectando alimentos...</Text>
        </>
      ) : (
        <>
          <Text style={styles.detectionComplete}>Alimentos detectados</Text>
          <Text style={styles.platoDetectado}>{platoDetectado}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  detectionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loader: {
    marginBottom: 8,
  },
  detectionText: {
    fontSize: 16,
    color: '#690B22',
    fontWeight: '500',
  },
  detectionComplete: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  platoDetectado: {
    fontSize: 20,
    color: '#1B4D3E',
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
});

export default DetectionMessage;
