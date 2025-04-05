import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/loginStyles';

const LoginMethodSelector = ({ loginMethod, setLoginMethod }) => {
  return (
    <View style={styles.loginMethodContainer}>
      <TouchableOpacity 
        style={[styles.methodButton, loginMethod === 'rut' && styles.methodButtonActive]}
        onPress={() => setLoginMethod('rut')}
      >
        <MaterialIcons name="credit-card" size={20} color={loginMethod === 'rut' ? '#F1E3D3' : '#690B22'} />
        <Text style={[styles.methodText, loginMethod === 'rut' && styles.methodTextActive]}>RUT</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.methodButton, loginMethod === 'email' && styles.methodButtonActive]}
        onPress={() => setLoginMethod('email')}
      >
        <MaterialIcons name="email" size={20} color={loginMethod === 'email' ? '#F1E3D3' : '#690B22'} />
        <Text style={[styles.methodText, loginMethod === 'email' && styles.methodTextActive]}>Email</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginMethodSelector;
