import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ResumenNutricionalCard from './ResumenNutricionalCard';
import styles from '../styles/scannerStyles';
import RecomendacionesCard from './RecomendacionesCard';

// Added onSelectAlimento prop to make food items interactive
const ScanResultView = ({ 
  results, 
  imageUri, 
  serverImageUrl, 
  onScanAgain, 
  compatibilidad, 
  onSelectAlimento,
  isReadOnly = false,
  seleccionesEspecificas = {}, // Accept the new props with defaults
  foodsWithUnits = {},
  children,
}) => {
  // Extract alimentos_detectados from results
  const alimentosDetectados = results?.alimentos_detectados || 
                             results?.texto_original?.alimentos_detectados || 
                             [];
  
  // If there are no results, show error message
  if (!results || !alimentosDetectados.length) {
    // Simple version for error case
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.errorMessage}>No se pudieron detectar alimentos en la imagen.</Text>
        <Image 
          source={{ uri: displayImageUri }} 
          style={styles.resultImageSmall}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={onScanAgain}
        >
          <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
          <Text style={styles.scanAgainButtonText}>Escanear de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Extract all necessary data
  const displayImageUri = serverImageUrl || imageUri;
  
  const safeCompatibilidad = compatibilidad || {
    sodio: { compatible: false, valor: 0 },
    potasio: { compatible: false, valor: 0 },
    fosforo: { compatible: false, valor: 0 }
  };

  // Use ScrollView instead of FlatList for better content rendering
  return (
    <ScrollView 
      style={styles.resultContainer} 
      contentContainerStyle={[styles.resultContent, { paddingBottom: 75 }]}
    >
      {/* Display the food image */}
      <Image 
        source={{ uri: displayImageUri }} 
        style={styles.resultImage}
        resizeMode="cover"
      />
      
      {/* Alimentos Detectados section */}
      <Text style={styles.resultTitle}>Alimentos Detectados</Text>
      
      {/* Show instruction banner */}
      {!isReadOnly && (
        <View style={localStyles.instructionBanner}>
          <MaterialIcons name="touch-app" size={22} color="#1B4D3E" />
          <Text style={localStyles.instructionText}>
            Toca cada alimento para seleccionar la versión correcta y obtener información nutricional precisa
          </Text>
        </View>
      )}
      
      {/* Show detected foods */}
      {alimentosDetectados.map((alimento, index) => {
        // Get specific selection info
        const nombreEspecifico = seleccionesEspecificas[alimento] || alimento;
        const unidadTexto = foodsWithUnits[nombreEspecifico];
        const isUpdated = seleccionesEspecificas[alimento] && seleccionesEspecificas[alimento] !== alimento;
        
        return (
          <TouchableOpacity
            key={`alimento-${index}`}
            style={[
              localStyles.alimentoItem,
              isUpdated ? localStyles.alimentoItemUpdated : {}
            ]}
            onPress={() => onSelectAlimento(alimento)}
            disabled={isReadOnly}
          >
            <View style={localStyles.alimentoContent}>
              <View style={[
                localStyles.iconContainer,
                isUpdated ? localStyles.iconContainerUpdated : {}
              ]}>
                <MaterialIcons 
                  name={isUpdated ? "check-circle" : "restaurant"} 
                  size={20} 
                  color={isUpdated ? "#FFFFFF" : "#690B22"} 
                />
              </View>
              
              <View style={localStyles.alimentoTextContainer}>
                <Text style={localStyles.alimentoNombre}>
                  {nombreEspecifico}
                  {unidadTexto ? ` (${unidadTexto})` : ''}
                </Text>
                
                {nombreEspecifico !== alimento && (
                  <Text style={localStyles.detectedAs}>
                    Detectado como: <Text style={localStyles.detectedTerm}>{alimento}</Text>
                  </Text>
                )}
                
                {isUpdated && (
                  <View style={localStyles.updatedBadge}>
                    <Text style={localStyles.updatedBadgeText}>Actualizado</Text>
                  </View>
                )}
              </View>
            </View>
            
            {!isReadOnly && (
              <View style={localStyles.actionContainer}>
                <MaterialIcons name="edit" size={24} color="#690B22" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
      
      {/* Nutritional information section */}
      <Text style={styles.resultTitle}>Información Nutricional</Text>
      <ResumenNutricionalCard 
        totales={results.totales} 
        compatibilidad={safeCompatibilidad}
      />
      
      {/* Recommendations section */}
      <RecomendacionesCard 
        analisisTexto={results.texto_original}
        resultadoCompleto={results}
      />
      
      {/* Any additional children */}
      {children}
    </ScrollView>
  );
};

// Local styles for the component
const localStyles = StyleSheet.create({
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1B4D3E',
    marginLeft: 8,
    lineHeight: 18,
  },
  alimentoItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  alimentoItemUpdated: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  alimentoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1E3D3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerUpdated: {
    backgroundColor: '#4CAF50',
  },
  alimentoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  alimentoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  detectedAs: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detectedTerm: {
    fontStyle: 'italic',
    color: '#999',
  },
  updatedBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  updatedBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  actionContainer: {
    padding: 6,
    backgroundColor: '#F9F9F9',
    borderRadius: 20,
  }
});

export default ScanResultView;
