import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CentroMap = ({ onChangeViewMode }) => {
  return (
    <View style={styles.webMapFallback}>
      <MaterialIcons name="map" size={64} color="#690B22" />
      <Text style={styles.webMapFallbackText}>
        La vista de mapa no está disponible en el navegador web
      </Text>
      <Text style={styles.webMapFallbackSubtext}>
        Para acceder a los mapas, por favor utilice la aplicación móvil
      </Text>
      <TouchableOpacity 
        style={styles.webMapFallbackButton}
        onPress={() => onChangeViewMode('list')}
      >
        <MaterialIcons name="view-list" size={24} color="#FFFFFF" />
        <Text style={styles.webMapFallbackButtonText}>Ver Lista</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  webMapFallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: '#1B4D3E',
  },
  webMapFallbackSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    marginBottom: 20,
  },
  webMapFallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  webMapFallbackButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CentroMap;
