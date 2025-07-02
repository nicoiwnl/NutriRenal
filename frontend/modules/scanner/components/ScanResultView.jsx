import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Platform,
  StyleSheet
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ResumenNutricionalCard from './ResumenNutricionalCard';
import styles from '../styles/scannerStyles';
import RecomendacionesCard from './RecomendacionesCard';
import AlimentoItemList from './AlimentoItemList';
import RegistroConsumoScanModal from './RegistroConsumoScanModal';

const ScanResultView = ({ 
  results, 
  imageUri, 
  serverImageUrl, 
  onScanAgain, 
  compatibilidad, 
  onSelectAlimento,
  isReadOnly = false,
  seleccionesEspecificas = {}, 
  foodsWithUnits = {},
  fuenteValores = 'base_datos',
  children,
  alimentosActualizados = [] 
}) => {
  // Estado para el modal de registro de consumo
  const [registroModalVisible, setRegistroModalVisible] = useState(false);
  const [alimentoRegistrando, setAlimentoRegistrando] = useState('');
  const [unidadRegistrando, setUnidadRegistrando] = useState('');
  const [alimentoObjetoRegistrando, setAlimentoObjetoRegistrando] = useState(null);
  
  // Estado para llevar registro de alimentos ya registrados (consumidos)
  const [alimentosRegistrados, setAlimentosRegistrados] = useState({});
  
  // Extraer alimentos_detectados desde los resultados
  const alimentosDetectados = results?.alimentos_detectados || 
                             results?.texto_original?.alimentos_detectados || 
                             [];
  
  // Usar la URL de la imagen del servidor si está disponible, de lo contrario usar la local
  const displayImageUri = serverImageUrl || imageUri;
  
  // Valores de compatibilidad seguros
  const safeCompatibilidad = compatibilidad || {
    sodio: { compatible: false, valor: 0 },
    potasio: { compatible: false, valor: 0 },
    fosforo: { compatible: false, valor: 0 }
  };
  
  // Función para manejar el registro de consumo y marcar como registrado
  const handleRegistrarConsumo = (nombreAlimento, unidad, objetoAlimento) => {
    // Extraer información de cantidad de la unidad si está disponible
    let cantidad = 1;
    let unidadNombre = unidad;
    
    // Si la unidad tiene formato "2.50 tazas", extraer cantidad y unidad
    if (unidad && typeof unidad === 'string') {
      const match = unidad.match(/^(\d*\.?\d+)\s+(.+)$/);
      if (match) {
        cantidad = parseFloat(match[1]) || 1;
        unidadNombre = match[2];
      }
    }
    
    setAlimentoRegistrando(nombreAlimento);
    setUnidadRegistrando(unidadNombre);
    setAlimentoObjetoRegistrando({
      ...objetoAlimento,
      cantidad_seleccionada: cantidad
    });
    setRegistroModalVisible(true);
  };

  // Función para manejar finalización exitosa del registro
  const handleRegistroExitoso = (alimentoId) => {
    // Marcar el alimento como registrado
    if (alimentoId) {
      setAlimentosRegistrados(prev => ({
        ...prev,
        [alimentoId]: true
      }));
    }
  };

  // Estilos locales para elementos específicos como la imagen
  const localStyles = StyleSheet.create({
    noImageContainer: {
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center'
    }
  });

  return (
    <ScrollView 
      style={styles.resultContainer} 
      contentContainerStyle={[styles.resultContent, { paddingBottom: 75 }]}
    >
      {/* Sección de imagen y resultado */}
      {displayImageUri ? (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: displayImageUri }} 
            style={styles.resultImage}
            resizeMode="cover"
            key={`img-${String(displayImageUri).split('/').pop()}`}
          />
        </View>
      ) : (
        <View style={[styles.imageContainer, localStyles.noImageContainer]}>
          <MaterialIcons name="image-not-supported" size={40} color="#ccc" />
          <Text style={{color: '#999', marginTop: 8}}>Sin imagen</Text>
        </View>
      )}

      {/* Título de resultados */}
      <Text style={styles.resultTitle}>
        {results.nombre || results.plato_detectado || "Resultado del análisis"}
      </Text>
      
      {/* Lista de alimentos detectados con el manejo de registro */}
      <Text style={styles.resultTitle}>Alimentos Detectados</Text>
      
      <AlimentoItemList 
        alimentos={alimentosDetectados}
        results={results}
        seleccionesEspecificas={seleccionesEspecificas}
        foodsWithUnits={foodsWithUnits}
        onSelectAlimento={onSelectAlimento}
        alimentosRegistrados={alimentosRegistrados} // Pasar el estado de registros
        alimentosActualizados={alimentosActualizados}
        onRegistrarConsumo={(nombre, unidad) => {
            // Buscar el objeto completo del alimento en alimentosActualizados
            let alimentoObjeto = null;
            
            if (Array.isArray(alimentosActualizados) && alimentosActualizados.length > 0) {
              // Buscar por nombre específico
              const alimento = alimentosActualizados.find(a => 
                (a && a.nombre === nombre) || 
                (a && a.info && a.info.nombre === nombre)
              );
              if (alimento) {
                alimentoObjeto = alimento.info || alimento;
                
                // Verificar si el alimento ya fue registrado
                if (alimentoObjeto.id && alimentosRegistrados[alimentoObjeto.id]) {
                  return;
                }
              }
            }
            
            // Llamar a handleRegistrarConsumo con todos los datos
            handleRegistrarConsumo(nombre, unidad, alimentoObjeto);
          }}
        isReadOnly={isReadOnly}
      />
      
      {/* Información nutricional */}
      <Text style={styles.resultTitle}>Información Nutricional</Text>
      <ResumenNutricionalCard 
        totales={results.totales} 
        compatibilidad={safeCompatibilidad}
        fuenteValores={fuenteValores}
      />
      
      {/* Recomendaciones */}
      <RecomendacionesCard 
        analisisTexto={results.texto_original}
        resultadoCompleto={results}
      />
      
      {children}
      
      {/* Modal para registrar consumo */}
      <RegistroConsumoScanModal 
        visible={registroModalVisible}
        onClose={() => setRegistroModalVisible(false)}
        nombreAlimento={alimentoRegistrando}
        unidadTexto={unidadRegistrando}
        nombreAnalisis={results?.nombre || results?.plato_detectado || "Análisis de alimentos"}
        alimentoSeleccionado={alimentoObjetoRegistrando} // Pasar el objeto completo al modal
        onSuccess={handleRegistroExitoso}
      />
    </ScrollView>
  );
};

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
  
  // Nuevos estilos para el panel de detección mejorada
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

