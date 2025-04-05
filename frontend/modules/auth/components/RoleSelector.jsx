import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/loginStyles';

const RoleSelector = ({ selectedRole, setSelectedRole }) => {
  return (
    <View style={styles.roleContainer}>
      <Text style={styles.roleTitle}>Seleccione su rol:</Text>
      <View style={styles.roleOptions}>
        <TouchableOpacity
          style={[
            styles.roleOption,
            selectedRole === 'paciente' && styles.roleOptionSelected
          ]}
          onPress={() => setSelectedRole('paciente')}
        >
          <MaterialIcons 
            name="person" 
            size={24} 
            color={selectedRole === 'paciente' ? "white" : "#690B22"} 
          />
          <Text style={[
            styles.roleText,
            selectedRole === 'paciente' && styles.roleTextSelected
          ]}>
            Paciente
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.roleOption,
            selectedRole === 'cuidador' && styles.roleOptionSelected
          ]}
          onPress={() => setSelectedRole('cuidador')}
        >
          <MaterialIcons 
            name="medical-services" 
            size={24} 
            color={selectedRole === 'cuidador' ? "white" : "#690B22"} 
          />
          <Text style={[
            styles.roleText,
            selectedRole === 'cuidador' && styles.roleTextSelected
          ]}>
            Cuidador
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoleSelector;
