import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const FoodStatistics = ({ nutritionData }) => {
  // Calculate average values from nutrition data
  const calculateAverage = (nutrient) => {
    if (!nutritionData || nutritionData.length === 0) return 0;
    
    const sum = nutritionData.reduce((acc, item) => {
      // Handle both string and number formats
      const value = typeof item[nutrient] === 'string' ? 
        parseFloat(item[nutrient]) : (item[nutrient] || 0);
      return acc + (isNaN(value) ? 0 : value);
    }, 0);
    
    return Math.round(sum / nutritionData.length);
  };
  
  // Get semaphore color based on value thresholds for daily averages
  const getSemaphoreColor = (nutrient, value) => {
    if (nutrient === 'sodio') {
      if (value > 1700) return '#F44336'; // Red - Above daily maximum
      if (value > 1300) return '#FFC107'; // Yellow - Above daily minimum
      return '#4CAF50'; // Green - Below daily minimum
    } 
    else if (nutrient === 'potasio') {
      if (value > 2000) return '#F44336'; // Red - Above daily maximum
      if (value > 1800) return '#FFC107'; // Yellow - Above daily minimum
      return '#4CAF50'; // Green - Below daily minimum
    }
    else if (nutrient === 'fosforo') {
      if (value > 1000) return '#F44336'; // Red - Above daily maximum
      if (value > 800) return '#FFC107'; // Yellow - Above daily minimum
      return '#4CAF50'; // Green - Below daily minimum
    }
    return '#9E9E9E'; // Default gray
  };
  
  // Calculate averages
  const avgSodio = calculateAverage('sodio');
  const avgPotasio = calculateAverage('potasio');
  const avgFosforo = calculateAverage('fosforo');
  
  // Get colors based on values
  const sodioColor = getSemaphoreColor('sodio', avgSodio);
  const potasioColor = getSemaphoreColor('potasio', avgPotasio);
  const fosforoColor = getSemaphoreColor('fosforo', avgFosforo);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Estadísticas Nutricionales</Text>
        <Text style={styles.subtitle}>Consumo promedio diario</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: sodioColor }]}>
              <Text style={styles.statValue}>{avgSodio}</Text>
            </View>
            <Text style={styles.statLabel}>Sodio (mg)</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: potasioColor }]}>
              <Text style={styles.statValue}>{avgPotasio}</Text>
            </View>
            <Text style={styles.statLabel}>Potasio (mg)</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statCircle, { backgroundColor: fosforoColor }]}>
              <Text style={styles.statValue}>{avgFosforo}</Text>
            </View>
            <Text style={styles.statLabel}>Fósforo (mg)</Text>
          </View>
        </View>
        
        <Text style={styles.note}>
          * Valores promedio basados en sus registros recientes
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  note: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default FoodStatistics;
