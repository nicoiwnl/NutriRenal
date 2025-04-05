import React from 'react';
import { Text } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/recetaDetailStyles';

const MaterialesSection = ({ materiales }) => {
  if (!materiales) return null;
  
  return (
    <Card style={styles.sectionCard}>
      <Card.Title title="Materiales" left={(props) => <MaterialIcons name="kitchen" size={24} color="#690B22" />} />
      <Card.Content>
        <Text style={styles.materialesText}>{materiales}</Text>
      </Card.Content>
    </Card>
  );
};

export default MaterialesSection;
