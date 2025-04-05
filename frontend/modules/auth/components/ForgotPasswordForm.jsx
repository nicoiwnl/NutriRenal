import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/forgotPasswordStyles';

const ForgotPasswordForm = ({ email, setEmail, onSubmit, loading }) => {
  return (
    <View>
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={24} color="#690B22" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
        onPress={onSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#F1E3D3" />
        ) : (
          <Text style={styles.resetButtonText}>Recuperar Contraseña</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordForm;
