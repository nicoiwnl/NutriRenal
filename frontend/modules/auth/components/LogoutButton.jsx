import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from '../styles/homeStyles';

const LogoutButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={onPress}>
      <Text style={styles.logoutText}>Cerrar Sesión</Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;
