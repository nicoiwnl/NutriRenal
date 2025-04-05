import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/registrosStyles';

const RegisterButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.registrarConsumoButton}
      onPress={onPress}
    >
      <View style={styles.registrarButtonContent}>
        <MaterialIcons name="add-circle" size={22} color="#FFFFFF" />
        <Text style={styles.registrarConsumoText}>Registrar consumo</Text>
      </View>
    </TouchableOpacity>
  );
};

export default RegisterButton;
