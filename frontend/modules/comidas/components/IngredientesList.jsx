import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/recetaDetailStyles';

const IngredientesList = ({ ingredientes }) => {
  if (!ingredientes || ingredientes.length === 0) return null;
  
  return (
    <Card style={styles.sectionCard}>
      <Card.Title title="Ingredientes" left={(props) => <MaterialIcons name="restaurant" size={24} color="#690B22" />} />
      <Card.Content>
        {ingredientes.map((ingrediente, index) => (
          <View key={index} style={styles.ingredienteItem}>
            <Text style={styles.ingredienteText}>
              • {ingrediente.cantidad} {ingrediente.unidad?.nombre || ''} de {ingrediente.alimento?.nombre || ingrediente.nombre || 'ingrediente'}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
};

export default IngredientesList;
