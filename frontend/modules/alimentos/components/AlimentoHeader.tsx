import React from 'react';
import { View, Text, StyleSheet, Platform} from 'react-native';
import { Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface AlimentoHeaderProps {
  nombre: string;
  categoryName: string;
  energia?: number;
  proteinas?: number;
  hidratos_carbono?: number;
  lipidos_totales?: number;
  formatNumber: (value: any, decimals?: number) => string;
}

const AlimentoHeader: React.FC<AlimentoHeaderProps> = ({
  nombre,
  categoryName,
  energia,
  proteinas,
  hidratos_carbono,
  lipidos_totales,
  formatNumber
}) => {
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{nombre}</Text>
        <Text style={styles.category}>{categoryName}</Text>
      </View>

      <Divider style={styles.divider} />

      {/* Energy content */}
      <View style={styles.energyContainer}>
        <MaterialIcons name="bolt" size={24} color="#690B22" />
        <View>
          <Text style={styles.energyLabel}>Energía</Text>
          <Text style={styles.energyValue}>
            {formatNumber(energia, 0)} kcal
          </Text>
        </View>
      </View>

      <View style={styles.macroGrid}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{formatNumber(proteinas, 1)}g</Text>
          <Text style={styles.macroLabel}>Proteínas</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{formatNumber(hidratos_carbono, 1)}g</Text>
          <Text style={styles.macroLabel}>Carbohidratos</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{formatNumber(lipidos_totales, 1)}g</Text>
          <Text style={styles.macroLabel}>Grasas</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  category: {
    fontSize: 16,
    color: '#690B22',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 15,
    height: 1,
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  energyLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  energyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginLeft: 10,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default AlimentoHeader;
