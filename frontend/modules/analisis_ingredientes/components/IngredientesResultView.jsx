import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const IngredientesResultView = ({ 
  imageUri, 
  serverImageUrl,
  ingredientesDetectados,
  ingredientesRiesgo,
  recomendacion,
  esRecomendado,
  onScanAgain,
  onGoHome,
  onVerMasIngrediente
}) => {
  const displayImageUri = serverImageUrl || imageUri;
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header con badge de recomendación, pero sin el nombre del producto */}
      <View style={styles.headerContainer}>
        <View style={[
          styles.recomendacionBadge, 
          {backgroundColor: esRecomendado ? '#E8F5E9' : '#FFEBEE'}
        ]}>
          <MaterialIcons 
            name={esRecomendado ? 'check-circle' : 'warning'} 
            size={20} 
            color={esRecomendado ? '#4CAF50' : '#F44336'} 
          />
          <Text style={[
            styles.recomendacionText, 
            {color: esRecomendado ? '#4CAF50' : '#F44336'}
          ]}>
            {esRecomendado ? 'Recomendado' : 'No recomendado'}
          </Text>
        </View>
        {/* Elimino la línea que muestra el título/nombre del producto */}
      </View>

      {/* Imagen del producto */}
      {displayImageUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayImageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Resumen de recomendación */}
      <View style={styles.recomendacionContainer}>
        <Text style={styles.sectionTitle}>Recomendación</Text>
        <Text style={styles.recomendacionContent}>{recomendacion}</Text>
      </View>

      {/* Lista de ingredientes */}
      <View style={styles.ingredientesContainer}>
        <Text style={styles.sectionTitle}>Ingredientes detectados</Text>
        {ingredientesDetectados.length > 0 ? (
          ingredientesDetectados.map((ingrediente, index) => {
            const esRiesgoso = ingredientesRiesgo.some(item => 
              item.nombre === ingrediente.nombre || item === ingrediente
            );
            
            return (
              <View key={index} style={styles.ingredienteItem}>
                <View style={styles.ingredienteHeader}>
                  <Text style={[
                    styles.ingredienteNombre,
                    esRiesgoso ? styles.ingredienteRiesgoso : {}
                  ]}>
                    {typeof ingrediente === 'string' ? ingrediente : ingrediente.nombre}
                    {esRiesgoso && ' ⚠️'}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => onVerMasIngrediente(ingrediente)}
                    style={styles.infoButton}
                  >
                    <MaterialIcons name="info-outline" size={20} color="#690B22" />
                  </TouchableOpacity>
                </View>
                
                {typeof ingrediente !== 'string' && ingrediente.descripcion && (
                  <Text style={styles.ingredienteDescripcion}>
                    {ingrediente.descripcion}
                  </Text>
                )}
                
                {esRiesgoso && (
                  <View style={styles.advertenciaContainer}>
                    <MaterialIcons name="error-outline" size={16} color="#F44336" style={styles.warningIcon} />
                    <Text style={styles.advertencia}>
                      {typeof ingredientesRiesgo.find(item => 
                        item.nombre === ingrediente.nombre || item === ingrediente
                      ) === 'object' ? 
                        ingredientesRiesgo.find(item => 
                          item.nombre === ingrediente.nombre || item === ingrediente
                        ).motivo : 
                        'Este ingrediente puede ser problemático para la salud renal.'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <Text style={styles.noIngredientes}>No se detectaron ingredientes</Text>
        )}
      </View>

      {/* Texto informativo */}
      <View style={styles.infoContainer}>
        <MaterialIcons name="info" size={24} color="#690B22" />
        <Text style={styles.infoText}>
          Este análisis es orientativo. Consulta siempre con tu médico o nutricionista
          antes de consumir un alimento si tienes dudas sobre su compatibilidad con tu condición.
        </Text>
      </View>
    </ScrollView>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centrar el badge de recomendación
  },
  recomendacionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'center',
  },
  recomendacionText: {
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  recomendacionContainer: {
    backgroundColor: '#F9F5F1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 10,
  },
  recomendacionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  ingredientesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  ingredienteItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  ingredienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredienteNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
  },
  ingredienteRiesgoso: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  ingredienteDescripcion: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  infoButton: {
    padding: 8,
  },
  advertenciaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  warningIcon: {
    marginRight: 6,
  },
  advertencia: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#F44336',
    flex: 1,
  },
  noIngredientes: {
    fontSize: 16,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F5F1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 12,
    flex: 1,
  }
});

export default IngredientesResultView;
