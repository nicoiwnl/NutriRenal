import React from 'react';
import { Text } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/recetaDetailStyles';

const PreparacionSection = ({ preparacion }) => {
  return (
    <Card style={styles.sectionCard}>
      <Card.Title title="Preparación" left={(props) => <MaterialIcons name="menu-book" size={24} color="#690B22" />} />
      <Card.Content>
        <Text style={styles.preparacionText}>{preparacion}</Text>
      </Card.Content>
    </Card>
  );
};

export default PreparacionSection;
