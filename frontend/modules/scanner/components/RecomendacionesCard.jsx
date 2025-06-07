import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const RecomendacionesCard = ({ analisisTexto, resultadoCompleto }) => {
  // Find recommendations from all possible sources
  const getRecomendaciones = () => {
    // Check all possible places where recommendations might be stored
    if (resultadoCompleto?.recomendaciones) {
      // First priority: top-level recomendaciones field
      return resultadoCompleto.recomendaciones;
    } else if (analisisTexto?.recomendaciones) {
      // Second priority: inside texto_original object
      return analisisTexto.recomendaciones;
    } else if (typeof analisisTexto === 'string' && analisisTexto.includes('recomienda')) {
      // Third priority: directly in the texto_original if it's a string containing recommendations
      return analisisTexto;
    }
    
    // No recommendations found
    return null;
  };

  // Find compatibility status from all possible sources
  const isCompatible = () => {
    // Check all possible places where compatibility might be stored
    if (resultadoCompleto?.compatibilidad_renal !== undefined) {
      return resultadoCompleto.compatibilidad_renal;
    } else if (analisisTexto?.compatibilidad_renal !== undefined) {
      return analisisTexto.compatibilidad_renal;
    } else if (resultadoCompleto?.compatible_con_perfil !== undefined) {
      return resultadoCompleto.compatible_con_perfil;
    }
    return null; // Unknown compatibility
  };

  const recomendaciones = getRecomendaciones();
  const compatible = isCompatible();
  
  // Skip rendering if no recommendations are found
  if (!recomendaciones) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialIcons 
          name={compatible === false ? "warning" : "check-circle"} 
          size={24} 
          color={compatible === false ? "#F44336" : "#4CAF50"} 
        />
        <Text style={styles.cardTitle}>Recomendaciones</Text>
      </View>
      
      <View style={[
        styles.statusBadge,
        { backgroundColor: compatible === false ? "#FFEBEE" : "#E8F5E9" }
      ]}>
        <Text style={[
          styles.statusText,
          { color: compatible === false ? "#C62828" : "#2E7D32" }
        ]}>
          {compatible === false 
            ? "No recomendado para pacientes renales" 
            : "Compatible con su perfil renal"}
        </Text>
      </View>
      
      <Text style={styles.recomendacionText}>
        {recomendaciones}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 8,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recomendacionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  }
});

export default RecomendacionesCard;
