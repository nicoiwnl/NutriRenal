import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

import IngredientesResultView from '../modules/analisis_ingredientes/components/IngredientesResultView';
import IngredienteInfoModal from '../modules/analisis_ingredientes/components/IngredienteInfoModal';
import useIngredientesResult from '../modules/analisis_ingredientes/hooks/useIngredientesResult';

export default function IngredientesResultScreen({ navigation }) {
  const route = useRoute();
  const [selectedIngrediente, setSelectedIngrediente] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  
  const {
    loading,
    error,
    results,
    imageUri,
    serverImageUrl,
    ingredientesDetectados,
    ingredientesRiesgo,
    recomendacion,
    esRecomendado,
    nombreProducto,
    handleScanAgain,
    handleGoHome
  } = useIngredientesResult(route);

  const handleVerMasIngrediente = (ingrediente) => {
    setSelectedIngrediente(ingrediente);
    setInfoModalVisible(true);
  };

  // Función auxiliar para mostrar un nombre de producto significativo
  const getNombreProducto = (results) => {
    // Si hay un nombre específico y no es "No disponible", usarlo
    if (results.nombre_producto && results.nombre_producto !== "No disponible") {
      return results.nombre_producto;
    }
    
    // Si no hay nombre o es "No disponible", intentar crear uno a partir de ingredientes
    if (results.ingredientes_detectados && results.ingredientes_detectados.length > 0) {
      const ingredientes = results.ingredientes_detectados;
      if (ingredientes.length <= 2) {
        // Mostrar hasta 2 ingredientes en el nombre
        return `Alimento con ${ingredientes.map(i => i.nombre || '').join(', ')}`;
      } else {
        // Mostrar el primero y contar los demás
        return `Alimento con ${ingredientes[0].nombre} y ${ingredientes.length-1} ingredientes más`;
      }
    }
    
    // Si no hay información de ingredientes
    return "Análisis de Alimento no Identificado";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Pasar todos los props correctamente */}
      <IngredientesResultView
        imageUri={imageUri}
        serverImageUrl={serverImageUrl}
        nombreProducto={getNombreProducto(results)}
        ingredientesDetectados={ingredientesDetectados}
        ingredientesRiesgo={ingredientesRiesgo}
        recomendacion={recomendacion}
        esRecomendado={esRecomendado}
        onScanAgain={handleScanAgain}
        onGoHome={handleGoHome}
        onVerMasIngrediente={handleVerMasIngrediente}
      />
      
      {/* Botones inferiores */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.scanAgainButton]}
          onPress={handleScanAgain}
        >
          <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Nuevo Análisis</Text>
        </TouchableOpacity>
      </View>
      
      {/* Modal de información de ingredientes */}
      <IngredienteInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        ingrediente={selectedIngrediente}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 8,
  },
  backButton: {
    backgroundColor: '#1B4D3E',
  },
  scanAgainButton: {
    backgroundColor: '#690B22',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});
