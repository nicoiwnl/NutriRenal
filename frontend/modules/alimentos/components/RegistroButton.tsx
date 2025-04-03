import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RegistroButtonProps {
  onPress: () => void;
}

const RegistroButton: React.FC<RegistroButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.registrarButton}
      onPress={onPress}
    >
      <View style={styles.registrarButtonContent}>
        <MaterialIcons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.registrarButtonText}>Registrar consumo</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  registrarButton: {
    backgroundColor: '#4CAF50',
    marginVertical: 16,
    width: '100%',
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 0,
  },
  registrarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registrarButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    textAlign: 'center',
  }
});

export default RegistroButton;
