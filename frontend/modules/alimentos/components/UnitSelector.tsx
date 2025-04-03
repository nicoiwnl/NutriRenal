import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface UnitSelectorProps {
  selectedUnit: any;
  onPress: () => void;
}

const UnitSelector: React.FC<UnitSelectorProps> = ({ selectedUnit, onPress }) => {
  return (
    <View style={styles.unitsContainer}>
      <Text style={styles.unitsLabel}>Unidad de medida:</Text>
      <TouchableOpacity 
        style={styles.dropdownSelector}
        onPress={onPress}>
        <Text style={styles.dropdownText}>
          {selectedUnit ? selectedUnit.nombre : 'Seleccione unidad'}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#690B22" />
      </TouchableOpacity>
      
      {selectedUnit && selectedUnit.id !== 0 && (
        <View style={styles.selectedUnitInfo}>
          <Text style={styles.unitEquivalenceText}>
            {selectedUnit.es_volumen
              ? `Equivale a ${selectedUnit.equivalencia_ml} ml`
              : `Equivale a ${selectedUnit.equivalencia_g} g`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  unitsContainer: {
    marginVertical: 12,
  },
  unitsLabel: {
    fontSize: 16,
    color: '#1B4D3E',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E07A5F',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: Platform.OS === 'web' ? 12 : 10,
    marginVertical: 5,
  },
  dropdownText: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#333',
  },
  selectedUnitInfo: {
    backgroundColor: '#F8E8D8',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  unitEquivalenceText: {
    color: '#1B4D3E',
    fontStyle: 'italic',
  },
});

export default UnitSelector;
