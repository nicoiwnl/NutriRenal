import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/loginStyles';

const GenderSelector = ({ selectedGender, setSelectedGender }) => {
  return (
    <View style={styles.genderContainer}>
      <Text style={styles.genderTitle}>Género:</Text>
      <View style={styles.genderOptions}>
        <TouchableOpacity
          style={[
            styles.genderOption,
            selectedGender === 'Masculino' && styles.genderOptionSelected
          ]}
          onPress={() => setSelectedGender('Masculino')}
        >
          <MaterialIcons 
            name="male" 
            size={24} 
            color={selectedGender === 'Masculino' ? "white" : "#690B22"} 
          />
          <Text style={[
            styles.genderText,
            selectedGender === 'Masculino' && styles.genderTextSelected
          ]}>
            Masculino
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.genderOption,
            selectedGender === 'Femenino' && styles.genderOptionSelected
          ]}
          onPress={() => setSelectedGender('Femenino')}
        >
          <MaterialIcons 
            name="female" 
            size={24} 
            color={selectedGender === 'Femenino' ? "white" : "#690B22"} 
          />
          <Text style={[
            styles.genderText,
            selectedGender === 'Femenino' && styles.genderTextSelected
          ]}>
            Femenino
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GenderSelector;
