import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import styles from '../styles/fichaMedicaStyles';

const DatosPersonalesCard = ({ pacienteData }) => {
  return (
    <Card style={styles.card}>
      <Card.Title title="Datos Personales" titleStyle={styles.cardTitle} />
      <Card.Content>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
          <Text style={styles.infoValue}>
            {pacienteData?.paciente?.fecha_nacimiento ? 
              new Date(pacienteData.paciente.fecha_nacimiento).toLocaleDateString('es-ES') : 
              'No disponible'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Edad:</Text>
          <Text style={styles.infoValue}>{pacienteData?.paciente?.edad} años</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Género:</Text>
          <Text style={styles.infoValue}>{pacienteData?.paciente?.genero || 'No especificado'}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

export default DatosPersonalesCard;
