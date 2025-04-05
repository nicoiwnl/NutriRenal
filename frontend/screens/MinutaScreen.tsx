import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importar componentes y hooks del módulo
import MinutaSelector from '../modules/comidas/components/MinutaSelector';
import MinutaDetail from '../modules/comidas/components/MinutaDetail';
import NoDataMinuta from '../modules/comidas/components/NoDataMinuta';
import MealGroup from '../modules/comidas/components/MealGroup';
import useMinuta from '../modules/comidas/hooks/useMinuta';
import styles from '../modules/comidas/styles/minutaStyles';

export default function MinutaScreen() {
  // Usar el hook personalizado
  const {
    loading,
    minutas,
    selectedMinuta,
    error,
    handleSelectMinuta,
    handlePrintMinuta
  } = useMinuta();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando su minuta nutricional...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Text style={styles.subtitle}>Plan alimentario personalizado</Text>
            </View>
            
            {minutas.length === 0 ? (
              <NoDataMinuta />
            ) : (
              <>
                {/* Selector de minuta si hay más de una */}
                <MinutaSelector 
                  minutas={minutas}
                  selectedMinuta={selectedMinuta}
                  onSelect={handleSelectMinuta}
                />
                
                {/* Detalles de la minuta seleccionada */}
                {selectedMinuta && (
                  <MinutaDetail 
                    minuta={selectedMinuta}
                    onPrint={handlePrintMinuta}
                  />
                )}
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
