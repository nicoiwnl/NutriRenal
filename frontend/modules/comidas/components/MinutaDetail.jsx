import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';

const MinutaDetail = ({ minuta, onPrint }) => {
  return (
    <View style={styles.minutaDetails}>
      <Text style={styles.detailsHeader}>
        Minuta creada: {new Date(minuta.fecha_creacion).toLocaleDateString()}
      </Text>
      <Text style={styles.detailsSubheader}>
        Vigente hasta: {new Date(minuta.fecha_vigencia).toLocaleDateString()}
      </Text>
      
      <Divider style={styles.divider} />
      
      {/* Ejemplo de contenido - Aquí se mostrarían los detalles reales */}
      <MealGroup 
        title="Desayuno" 
        items={[
          { 
            name: 'Avena con leche descremada', 
            desc: '1 taza de avena cocida con leche descremada' 
          },
          { 
            name: 'Tostada integral', 
            desc: '1 rebanada con queso fresco bajo en sodio' 
          }
        ]} 
      />
      
      <Divider style={styles.divider} />
      
      <MealGroup 
        title="Almuerzo" 
        items={[
          { 
            name: 'Pollo a la plancha', 
            desc: '120g de filete de pollo con especias naturales' 
          },
          { 
            name: 'Arroz blanco', 
            desc: '1/2 taza de arroz cocido sin sal' 
          },
          { 
            name: 'Ensalada verde', 
            desc: 'Lechuga, pepino y tomate con aceite de oliva' 
          }
        ]} 
      />
      
      <TouchableOpacity style={styles.printButton} onPress={onPrint}>
        <MaterialIcons name="print" size={20} color="#FFFFFF" />
        <Text style={styles.printButtonText}>Imprimir Minuta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MinutaDetail;
