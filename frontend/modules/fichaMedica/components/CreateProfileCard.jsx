import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import styles from '../styles/fichaMedicaStyles';

const CreateProfileCard = ({ tempValues, setTempValues, guardarEdicion }) => {
  const handleGuardarPerfil = () => {
    if (!tempValues.tipo_dialisis) {
      setTempValues(prev => ({
        ...prev, 
        tipo_dialisis: 'hemodialisis'
      }));
    }
    
    if (!tempValues.nivel_actividad) {
      setTempValues(prev => ({
        ...prev,
        nivel_actividad: 'sedentario'
      }));
    }
    
    if (!tempValues.peso || !tempValues.altura) {
      Alert.alert('Datos incompletos', 'Por favor ingrese su peso y altura para continuar');
      return;
    }
    
    guardarEdicion('tipo_dialisis');
  };

  return (
    <Card style={[styles.card, styles.createProfileCard]}>
      <Card.Title title="Crear Perfil Médico" titleStyle={styles.createProfileTitle} />
      <Card.Content>
        <Text style={styles.createProfileText}>
          Para acceder a todas las funcionalidades y recibir recomendaciones personalizadas,
          es necesario completar su perfil médico con la siguiente información básica:
        </Text>
        
        <View style={styles.initialProfileFields}>
          <Text style={styles.fieldHeader}>Tipo de diálisis:</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempValues.tipo_dialisis === 'hemodialisis' && styles.optionButtonSelected
              ]}
              onPress={() => setTempValues(prev => ({ ...prev, tipo_dialisis: 'hemodialisis' }))}
            >
              <Text style={tempValues.tipo_dialisis === 'hemodialisis' ? styles.optionTextSelected : styles.optionText}>
                Hemodiálisis
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempValues.tipo_dialisis === 'dialisis_peritoneal' && styles.optionButtonSelected
              ]}
              onPress={() => setTempValues(prev => ({ ...prev, tipo_dialisis: 'dialisis_peritoneal' }))}
            >
              <Text style={tempValues.tipo_dialisis === 'dialisis_peritoneal' ? styles.optionTextSelected : styles.optionText}>
                Diálisis Peritoneal
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.fieldHeader}>Peso (kg):</Text>
          <TextInput
            style={styles.createProfileInput}
            placeholder="Ingrese su peso en kg"
            value={tempValues.peso}
            onChangeText={(text) => setTempValues(prev => ({ ...prev, peso: text }))}
            keyboardType="numeric"
          />
          
          <Text style={styles.fieldHeader}>Altura (m):</Text>
          <TextInput
            style={styles.createProfileInput}
            placeholder="Ingrese su altura en metros (ej: 1.70)"
            value={tempValues.altura}
            onChangeText={(text) => {
              const normalizedText = text.replace(',', '.').replace(/[^\d.]/g, '');
              setTempValues(prev => ({ ...prev, altura: normalizedText }))
            }}
            keyboardType="numeric"
          />
          
          <Text style={styles.fieldHeader}>Nivel de Actividad:</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempValues.nivel_actividad === 'sedentario' && styles.optionButtonSelected
              ]}
              onPress={() => setTempValues(prev => ({ ...prev, nivel_actividad: 'sedentario' }))}
            >
              <Text style={tempValues.nivel_actividad === 'sedentario' ? styles.optionTextSelected : styles.optionText}>
                Sedentario
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempValues.nivel_actividad === 'ligera' && styles.optionButtonSelected
              ]}
              onPress={() => setTempValues(prev => ({ ...prev, nivel_actividad: 'ligera' }))}
            >
              <Text style={tempValues.nivel_actividad === 'ligera' ? styles.optionTextSelected : styles.optionText}>
                Ligera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempValues.nivel_actividad === 'moderada' && styles.optionButtonSelected
              ]}
              onPress={() => setTempValues(prev => ({ ...prev, nivel_actividad: 'moderada' }))}
            >
              <Text style={tempValues.nivel_actividad === 'moderada' ? styles.optionTextSelected : styles.optionText}>
                Moderada
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempValues.nivel_actividad === 'alta' && styles.optionButtonSelected
              ]}
              onPress={() => setTempValues(prev => ({ ...prev, nivel_actividad: 'alta' }))}
            >
              <Text style={tempValues.nivel_actividad === 'alta' ? styles.optionTextSelected : styles.optionText}>
                Alta
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.fullWidthButton]}
            onPress={handleGuardarPerfil}
          >
            <Text style={styles.actionButtonText}>Guardar Perfil Médico</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

export default CreateProfileCard;
