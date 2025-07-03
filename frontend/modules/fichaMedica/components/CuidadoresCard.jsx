import React from 'react';
import { View, Text, TouchableOpacity, Platform, Alert, Share } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/fichaMedicaStyles';

const CuidadoresCard = ({ currentPersonaId }) => {
  const handleCopyCode = () => {
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(currentPersonaId);
      Alert.alert('Copiado', 'Código copiado al portapapeles');
    }
  };
  
  const handleShareCode = async () => {
    if (Platform.OS !== 'web') {
      try {
        const result = await Share.share({
          message: `Mi código de paciente en NutriRenal es: ${currentPersonaId}`,
          title: 'Compartir código de paciente'
        });
      } catch (error) {
        Alert.alert('Error', 'No se pudo compartir el código');
      }
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="Cuidadores" titleStyle={styles.cardTitle} />
      <Card.Content>
        <View style={styles.patientCodeContainer}>
          <Text style={styles.patientCodeTitle}>Tu código de paciente:</Text>
          <View style={styles.codeBox}>
            <Text style={styles.patientCodeValue}>{currentPersonaId}</Text>
          </View>
          <Text style={styles.patientCodeInstructions}>
            Comparte este código con una persona de confianza o quien te ayude para que puedan acceder
            a tu información médica.
          </Text>
          
          {Platform.OS === 'web' ? (
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
            >
              <MaterialIcons name="content-copy" size={18} color="#FFFFFF" />
              <Text style={styles.copyButtonText}>Copiar código</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleShareCode}
            >
              <MaterialIcons name="share" size={18} color="#FFFFFF" />
              <Text style={styles.copyButtonText}>Compartir código</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

export default CuidadoresCard;
