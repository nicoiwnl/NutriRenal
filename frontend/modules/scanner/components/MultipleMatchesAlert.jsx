import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MultipleMatchesAlert = ({ alimentos, onSelectAlimento }) => {
  const [expanded, setExpanded] = useState(false);

  // Only show this alert if there are multiple alimentos
  if (!alimentos || alimentos.length <= 1) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <MaterialIcons 
          name="info-outline" 
          size={20} 
          color="#1B4D3E" 
        />
        <Text style={styles.headerText}>
          Detectamos múltiples coincidencias ({alimentos.length})
        </Text>
        <MaterialIcons 
          name={expanded ? "expand-less" : "expand-more"} 
          size={24} 
          color="#1B4D3E" 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.content}>
          <Text style={styles.instruction}>
            Seleccione un alimento específico para ver sus detalles:
          </Text>
          {alimentos.map((alimento, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.itemButton}
              onPress={() => onSelectAlimento(alimento)}
            >
              <MaterialIcons name="restaurant" size={18} color="#690B22" />
              <Text style={styles.itemText}>{alimento}</Text>
              <MaterialIcons name="arrow-forward-ios" size={14} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginLeft: 8,
  },
  content: {
    marginTop: 8,
    width: '100%',
  },
  instruction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginBottom: 8,
    elevation: 1,
  },
  itemText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
});

export default MultipleMatchesAlert;
