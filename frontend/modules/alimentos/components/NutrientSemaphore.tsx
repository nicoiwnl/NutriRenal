import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface NutrientSemaphoreProps {
  sodio: number;
  potasio: number;
  fosforo: number;
  sodioColor: string;
  potasioColor: string;
  fosforoColor: string;
  formatNumber: (value: any, decimals?: number) => string;
}

const NutrientSemaphore: React.FC<NutrientSemaphoreProps> = ({
  sodio,
  potasio,
  fosforo,
  sodioColor,
  potasioColor,
  fosforoColor,
  formatNumber
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Relevante en dieta renal:</Text>
      
      <View style={styles.semaphoreContainer}>
        <View style={styles.semaphoreItem}>
          <View style={[styles.semaphoreCircle, { backgroundColor: sodioColor }]}>
            <Text style={styles.semaphoreValue}>{formatNumber(sodio, 0)}</Text>
          </View>
          <Text style={styles.semaphoreLabel}>Sodio (mg)</Text>
        </View>
        
        <View style={styles.semaphoreItem}>
          <View style={[styles.semaphoreCircle, { backgroundColor: potasioColor }]}>
            <Text style={styles.semaphoreValue}>{formatNumber(potasio, 0)}</Text>
          </View>
          <Text style={styles.semaphoreLabel}>Potasio (mg)</Text>
        </View>
        
        <View style={styles.semaphoreItem}>
          <View style={[styles.semaphoreCircle, { backgroundColor: fosforoColor }]}>
            <Text style={styles.semaphoreValue}>{formatNumber(fosforo, 0)}</Text>
          </View>
          <Text style={styles.semaphoreLabel}>Fósforo (mg)</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  semaphoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  semaphoreItem: {
    alignItems: 'center',
  },
  semaphoreCircle: {
    width: Platform.OS === 'web' ? 70 : 60,
    height: Platform.OS === 'web' ? 70 : 60,
    borderRadius: Platform.OS === 'web' ? 35 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  semaphoreValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
  semaphoreLabel: {
    fontSize: Platform.OS === 'web' ? 12 : 11,
    color: '#666',
  }
});

export default NutrientSemaphore;
