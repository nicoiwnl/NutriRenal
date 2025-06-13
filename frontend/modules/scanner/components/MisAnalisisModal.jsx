import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getImageUrl, ENDPOINTS } from '../../../config/apiConfig';
import api from '../../../api';

/**
 * Modal para mostrar los análisis previos del usuario
 */
const MisAnalisisModal = ({ 
  visible, 
  onClose, 
  onSelectAnalisis, 
  analisis = [], 
  loading = false 
}) => {
  const [analisisConSelecciones, setAnalisisConSelecciones] = useState({});
  const [loadingSelecciones, setLoadingSelecciones] = useState(false);

  // Cargar selecciones específicas para los análisis
  useEffect(() => {
    const cargarSeleccionesEspecificas = async () => {
      if (!analisis || analisis.length === 0) return;
      
      setLoadingSelecciones(true);
      const selecciones = {};
      
      try {
        // Primero, obtener todas las selecciones de la API
        const response = await api.get('http://127.0.0.1:8000/api/selecciones-analisis/');
        
        if (response.data && Array.isArray(response.data)) {
          // Organizar las selecciones por análisis ID para fácil acceso
          response.data.forEach(seleccion => {
            const analisisId = seleccion.analisis;
            
            if (!selecciones[analisisId]) {
              selecciones[analisisId] = [];
            }
            
            selecciones[analisisId].push({
              alimentoOriginal: seleccion.alimento_original,
              alimentoSeleccionado: seleccion.alimento_nombre,
              unidad: seleccion.unidad_nombre,
              cantidad: seleccion.cantidad,
              fecha: seleccion.fecha_seleccion
            });
          });
          
          setAnalisisConSelecciones(selecciones);
        }
      } catch (error) {
        console.error('Error al cargar selecciones específicas:', error);
      } finally {
        setLoadingSelecciones(false);
      }
    };
    
    if (visible && analisis.length > 0) {
      cargarSeleccionesEspecificas();
    }
  }, [analisis, visible]);

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mis Análisis Previos</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#690B22" />
            </TouchableOpacity>
          </View>
          
          {loading || loadingSelecciones ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#690B22" />
              <Text style={styles.loadingText}>Cargando análisis...</Text>
            </View>
          ) : (
            <>
              {analisis.length > 0 ? (
                <FlatList
                  data={analisis}
                  keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                  renderItem={({ item }) => {
                    // Verificar si el item tiene los campos necesarios antes de renderizar
                    const hasRequiredFields = item && item.id;
                    if (!hasRequiredFields) {
                      return null; // No renderizar items incorrectos
                    }
                    
                    // Obtener selecciones específicas para este análisis
                    const seleccionesEspecificas = analisisConSelecciones[item.id] || [];
                    const tieneSeleccionesEspecificas = seleccionesEspecificas.length > 0;
                    
                    // Extraer información sobre alimentos detectados
                    const alimentosDetectados = item.alimentos_detectados || 
                                              (item.resultado && item.resultado.alimentos_detectados) || 
                                              [];
                    
                    // Crear descripción de alimentos basada en selecciones o detecciones
                    let descripcionAlimentos = "";
                    if (tieneSeleccionesEspecificas) {
                      // Mostrar las selecciones específicas con unidades si están disponibles
                      const seleccionesTexto = seleccionesEspecificas
                        .slice(0, 2)
                        .map(s => `${s.cantidad} ${s.unidad} de ${s.alimentoSeleccionado}`)
                        .join(", ");
                      const tienesMas = seleccionesEspecificas.length > 2;
                      descripcionAlimentos = seleccionesTexto + (tienesMas ? ", ..." : "");
                    } else if (alimentosDetectados.length > 0) {
                      // Mostrar alimentos detectados si no hay selecciones
                      descripcionAlimentos = alimentosDetectados
                        .slice(0, 2)
                        .join(", ");
                      const tienesMas = alimentosDetectados.length > 2;
                      descripcionAlimentos += tienesMas ? ", ..." : "";
                    }
                    
                    return (
                      <TouchableOpacity 
                        style={styles.analisisItem}
                        onPress={() => onSelectAnalisis(item, seleccionesEspecificas)}
                      >
                        <View style={styles.analisisImageContainer}>
                          {/* Verificar si hay imagen antes de intentar mostrarla */}
                          {(item.url_imagen || item.imagen_analizada) ? (
                            <Image 
                              source={{ uri: getImageUrl(item.url_imagen || item.imagen_analizada) }}
                              style={styles.analisisImage}
                              resizeMode="cover"
                              onError={() => console.log("Error cargando miniatura:", item.url_imagen || item.imagen_analizada)}
                            />
                          ) : (
                            <View style={styles.noImagePlaceholder}>
                              <MaterialIcons name="image-not-supported" size={24} color="#999" />
                            </View>
                          )}
                        </View>
                        
                        <View style={styles.analisisInfo}>
                          {/* Mostrar fecha solo si existe */}
                          {item.fecha_analisis && (
                            <Text style={styles.analisisFecha}>
                              {formatDate(item.fecha_analisis)}
                            </Text>
                          )}
                          
                          <Text style={styles.analisisConclusion} numberOfLines={2}>
                            {item.nombre || item.conclusion || "Análisis de alimentos"}
                          </Text>
                          
                          {/* Mostrar alimentos detectados/seleccionados */}
                          {descripcionAlimentos && (
                            <Text style={styles.analisisAlimentos} numberOfLines={1}>
                              {tieneSeleccionesEspecificas ? "Seleccionado: " : "Detectado: "}
                              <Text style={styles.alimentosText}>{descripcionAlimentos}</Text>
                            </Text>
                          )}
                          
                          {/* Solo mostrar badge si tenemos datos de compatibilidad */}
                          {item.compatible_con_perfil !== undefined && (
                            <View style={[
                              styles.compatibilidadBadge,
                              { backgroundColor: item.compatible_con_perfil ? '#E8F5E9' : '#FFEBEE' }
                            ]}>
                              <MaterialIcons 
                                name={item.compatible_con_perfil ? 'check-circle' : 'warning'} 
                                size={16} 
                                color={item.compatible_con_perfil ? '#4CAF50' : '#F44336'} 
                              />
                              <Text style={[
                                styles.compatibilidadText,
                                { color: item.compatible_con_perfil ? '#2E7D32' : '#C62828' }
                              ]}>
                                {item.compatible_con_perfil ? 'Compatible' : 'No recomendado'}
                              </Text>
                            </View>
                          )}
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#999" />
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="search" size={48} color="#690B22" />
                  <Text style={styles.emptyText}>
                    No tienes análisis previos
                  </Text>
                  <Text style={styles.emptySubText}>
                    Escanea algún alimento para comenzar
                  </Text>
                </View>
              )}
            </>
          )}
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#690B22',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#690B22',
  },
  analisisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  analisisImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  analisisImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analisisInfo: {
    flex: 1,
  },
  analisisFecha: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  analisisConclusion: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  analisisAlimentos: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  alimentosText: {
    fontWeight: 'bold',
  },
  compatibilidadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  compatibilidadText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#690B22',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#690B22',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MisAnalisisModal;
