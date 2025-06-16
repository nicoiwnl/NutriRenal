import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  StyleSheet,
  Platform
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
  fuenteValores = 'base_datos',
  children,
}) => {
  // Extract alimentos_detectados from results
  const alimentosDetectados = results?.alimentos_detectados || 
                             results?.texto_original?.alimentos_detectados || 
                             [];
  
  // ADDED: Better logging for debugging selections
  useEffect(() => {
    console.log("ScanResultView renderizando con:", {
      totalAlimentos: alimentosDetectados.length,
      alimentos: alimentosDetectados,
      tieneSelecciones: Object.keys(seleccionesEspecificas || {}).length > 0,
      selecciones: JSON.stringify(seleccionesEspecificas),
      unidades: JSON.stringify(foodsWithUnits)
    });
  }, [alimentosDetectados, seleccionesEspecificas, foodsWithUnits]);

  // Extract all necessary data
  const displayImageUri = serverImageUrl || imageUri;
  
  // FIXED: Define safeCompatibilidad to prevent the ReferenceError
  const safeCompatibilidad = compatibilidad || {
    sodio: { compatible: false, valor: 0 },
    potasio: { compatible: false, valor: 0 },
    fosforo: { compatible: false, valor: 0 }
  };
  
  // ADDED: Debug image URL handling
  useEffect(() => {
    console.log("ScanResultView - image display details:", {
      serverImageUrl: serverImageUrl,
      imageUri: imageUri,
      finalDisplayUrl: displayImageUri
    });
  }, [serverImageUrl, imageUri, displayImageUri]);

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

  // Add debugging useEffect to log selection data
  useEffect(() => {
    if (seleccionesEspecificas && Object.keys(seleccionesEspecificas).length > 0) {
      console.log("ScanResultView - Mostrando selecciones específicas:", 
        JSON.stringify(seleccionesEspecificas));
      console.log("ScanResultView - Con unidades:", 
        JSON.stringify(foodsWithUnits));
    }
  }, [seleccionesEspecificas, foodsWithUnits]);

  // Use ScrollView instead of FlatList for better content rendering
  return (
    <ScrollView 
      style={styles.resultContainer} 
      contentContainerStyle={[styles.resultContent, { paddingBottom: 75 }]}
    >
      {/* Display the food image with improved error handling */}
      {displayImageUri ? (
        <Image 
          source={{ uri: displayImageUri }} 
          style={styles.resultImage}
          resizeMode="cover"
          onError={(e) => console.error("Error en la carga de imagen:", e.nativeEvent.error)}
          onLoad={() => console.log("✓ Imagen cargada correctamente")}
          // Add a key to force reload when URL changes
          key={`img-${String(displayImageUri).split('/').pop()}`}
        />
      ) : (
        <View style={[styles.resultImage, localStyles.noImageContainer]}>
          <MaterialIcons name="image-not-supported" size={40} color="#ddd" />
          <Text style={localStyles.noImageText}>No hay imagen disponible</Text>
        </View>
      )}
      
      {/* Banner simple para alimentos detectados */}
      <View style={localStyles.detectadoBanner}>
        <MaterialIcons name="restaurant" size={20} color="#690B22" />
        <View style={localStyles.detectadoTexto}>
          <Text style={localStyles.detectadoLabel}>Detectado:</Text>
          <Text style={localStyles.detectadoValor}>
            {results?.plato_detectado || results?.nombre || alimentosDetectados.join(", ")}
          </Text>
        </View>
      </View>
      
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
        
        // ADDED: Log each food item for debugging
        console.log(`Renderizando alimento #${index}: ${alimento} -> ${nombreEspecifico} (${isUpdated ? 'actualizado' : 'original'})`);
        
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
        fuenteValores={fuenteValores}
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
  },
  
  // Nuevos estilos para el panel de detección mejorado
  detectionPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginTop: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  detectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  detectionTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginLeft: 8,
  },
  detectionDetailsContainer: {
    padding: 12,
  },
  detectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detectionLabel: {
    fontSize: 14,
    color: '#666',
    width: 70,
  },
  detectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  detectionEnergyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  mineralGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
  },
  mineralItem: {
    width: '50%',
    paddingVertical: 4,
  },
  mineralName: {
    fontSize: 12,
    color: '#666',
  },
  mineralValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  mineralWarning: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  compatibilityBar: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  compatibilityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start', 
  },
  compatibleIndicator: {
    backgroundColor: '#4CAF50',
  },
  notCompatibleIndicator: {
    backgroundColor: '#F44336',
  },
  compatibilityText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },

  // Estilos para el banner simple
  detectadoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F0E8',
    borderRadius: 8,
    padding: 10,
    margin: 16,
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  detectadoTexto: {
    marginLeft: 10,
    flex: 1,
  },
  detectadoLabel: {
    fontSize: 12,
    color: '#666',
  },
  detectadoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },

  // Add missing styles referenced in the component
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  noImageText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  }
});

export default ScanResultView;
