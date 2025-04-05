import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../styles/minutaStyles';

const MinutaSelector = ({ minutas, selectedMinuta, onSelect }) => {
  if (minutas.length <= 1) return null;
  
  return (
    <View style={styles.minutaSelector}>
      <Text style={styles.selectorLabel}>Seleccione una minuta:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {minutas.map(minuta => (
          <TouchableOpacity
            key={minuta.id}
            style={[
              styles.minutaTab,
              selectedMinuta?.id === minuta.id && styles.selectedMinutaTab
            ]}
            onPress={() => onSelect(minuta)}
          >
            <Text style={[
              styles.minutaTabText,
              selectedMinuta?.id === minuta.id && styles.selectedMinutaTabText
            ]}>
              {`Plan ${new Date(minuta.fecha_creacion).toLocaleDateString()}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MinutaSelector;
