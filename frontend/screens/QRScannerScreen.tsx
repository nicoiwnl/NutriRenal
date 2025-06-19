import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Image,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar componentes, hooks, estilos y configuración
import WebPlaceholder from '../modules/scanner/components/WebPlaceholder';
import CameraGalleryOptions from '../modules/scanner/components/CameraGalleryOptions';
import ImagePreview from '../modules/scanner/components/ImagePreview';
import useScanner from '../modules/scanner/hooks/useScanner';
import styles from '../modules/scanner/styles/scannerStyles';
import api from '../api';
import { ENDPOINTS, getImageUrl } from '../config/apiConfig';

// Definir los estilos de análisis aquí en lugar de usar los estilos de alimento
const analisisStyles = StyleSheet.create({
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

// Componente para la lista de análisis previos
const MisAnalisisModal = ({ visible, onClose, onSelectAnalisis, analisis, loading }) => {
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
      <View style={analisisStyles.modalContainer}>
        <View style={analisisStyles.modalContent}>
          <View style={analisisStyles.modalHeader}>
            <Text style={analisisStyles.modalTitle}>Mis Análisis Previos</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#690B22" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={analisisStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#690B22" />
              <Text style={analisisStyles.loadingText}>Cargando análisis...</Text>
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
                    
                    return (
                      <TouchableOpacity 
                        style={analisisStyles.analisisItem}
                        onPress={() => onSelectAnalisis(item)}
                      >
                        <View style={analisisStyles.analisisImageContainer}>
                          {/* Verificar si hay imagen antes de intentar mostrarla */}
                          {(item.url_imagen || item.imagen_analizada) ? (
                            <Image 
                              source={{ uri: getImageUrl(item.url_imagen || item.imagen_analizada) }}
                              style={analisisStyles.analisisImage}
                              resizeMode="cover"
                              onError={() => console.log("Error cargando miniatura:", item.url_imagen || item.imagen_analizada)}
                            />
                          ) : (
                            <View style={analisisStyles.noImagePlaceholder}>
                              <MaterialIcons name="image-not-supported" size={24} color="#999" />
                            </View>
                          )}
                        </View>
                        
                        <View style={analisisStyles.analisisInfo}>
                          {/* Mostrar fecha solo si existe */}
                          {item.fecha_analisis && (
                            <Text style={analisisStyles.analisisFecha}>
                              {formatDate(item.fecha_analisis)}
                            </Text>
                          )}
                          
                          {/* ACTUALIZADO: Mostrar nombre específico del análisis cuando está disponible, o usar conclusión o texto genérico */}
                          <Text style={analisisStyles.analisisConclusion} numberOfLines={2}>
                            {item.nombre || item.conclusion || "Análisis de alimentos"}
                          </Text>
                          
                          {/* Solo mostrar badge si tenemos datos de compatibilidad */}
                          {item.compatible_con_perfil !== undefined && (
                            <View style={[
                              analisisStyles.compatibilidadBadge,
                              { backgroundColor: item.compatible_con_perfil ? '#E8F5E9' : '#FFEBEE' }
                            ]}>
                              <MaterialIcons 
                                name={item.compatible_con_perfil ? 'check-circle' : 'warning'} 
                                size={16} 
                                color={item.compatible_con_perfil ? '#4CAF50' : '#F44336'} 
                              />
                              <Text style={[
                                analisisStyles.compatibilidadText,
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
                <View style={analisisStyles.emptyContainer}>
                  <MaterialIcons name="search" size={48} color="#690B22" />
                  <Text style={analisisStyles.emptyText}>
                    No tienes análisis previos
                  </Text>
                  <Text style={analisisStyles.emptySubText}>
                    Escanea algún alimento para comenzar
                  </Text>
                </View>
              )}
            </>
          )}
          
          <TouchableOpacity 
            style={analisisStyles.closeButton}
            onPress={onClose}
          >
            <Text style={analisisStyles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const options = {
  title: 'Escanear Alimento'
};

export default function QRScannerScreen({ navigation }) {
  const [showAnalisisModal, setShowAnalisisModal] = useState(false);
  const [analisisPrevios, setAnalisisPrevios] = useState([]);
  const [loadingAnalisis, setLoadingAnalisis] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const {
    capturedImage,
    loading,
    handleOpenCamera,
    handleOpenGallery,
    handleProcessImage,
    handleDeleteImage,
    handleGoBack,
    isWeb
  } = useScanner();

  // Cargar ID de usuario al inicio
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserId(parsed.persona_id || parsed.id);
        }
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    };
    
    loadUserId();
  }, []);

  // Función para cargar análisis previos
  const loadAnalisisPrevios = async () => {
    if (!userId) {
      Alert.alert('Aviso', 'Necesitas iniciar sesión para ver tus análisis previos');
      return;
    }
    
    try {
      setLoadingAnalisis(true);
      
      // Obtener endpoint desde la configuración
      const endpointUrl = ENDPOINTS.MIS_ANALISIS(userId);
      
      // Usar el endpoint configurado
      const response = await api.get(ENDPOINTS.MIS_ANALISIS(userId), {
        headers: {
          'X-User-Filter': 'true',
          'X-User-ID': userId,
          'X-Persona-ID': userId
        }
      });
      
      if (response.data) {
        let filteredAnalysis = [];
        
        if (Array.isArray(response.data)) {
          // Filtrar análisis por usuario
          filteredAnalysis = response.data.filter(analysis => {
            const analysisUserId = 
              analysis.persona_id || 
              analysis.id_persona || 
              analysis.usuario_id || 
              analysis.id_usuario;
            
            return String(analysisUserId) === String(userId);
          });
          
          // Ordenar análisis desde el más reciente al más antiguo
          filteredAnalysis.sort((a, b) => {
            // Manejar casos donde fecha_analisis es null o undefined
            if (!a.fecha_analisis) return 1;  // Mover al final los que no tienen fecha
            if (!b.fecha_analisis) return -1; // Mover al final los que no tienen fecha
            
            const fechaA = new Date(a.fecha_analisis).getTime();
            const fechaB = new Date(b.fecha_analisis).getTime();
            return fechaB - fechaA; // Orden descendente (más reciente primero)
          });
        }
        
        setAnalisisPrevios(filteredAnalysis);
      }
    } catch (error) {
      console.error('Error cargando análisis previos:', error);
      
      // Si el endpoint principal falla, intentamos con alternativas
      try {
        // Probamos diferentes endpoints y formatos de parámetros
        const endpoints = [
          // Variante 1: Con querystring
          { url: `${api.defaults.baseURL}/analisis-imagen/?persona_id=${userId}` },
          
          // Variante 2: Con id en la URL
          { url: `${api.defaults.baseURL}/analisis-persona/${userId}/` },
          
          // Variante 3: Con id_persona como parámetro
          { url: `${api.defaults.baseURL}/analisis-imagen/`, params: { id_persona: userId } },
          
          // Variante 4: Original como fallback
          { url: `${api.defaults.baseURL}/historial-analisis/`, params: { persona_id: userId } }
        ];
        
        // Intentar cada endpoint secuencialmente
        let success = false;
        for (const endpoint of endpoints) {
          if (success) break; // Si ya tuvimos éxito, salimos del ciclo
          
          try {
            const alternativeResponse = await api.get(endpoint.url, 
              endpoint.params ? { params: endpoint.params } : undefined
            );
            
            if (alternativeResponse.data && Array.isArray(alternativeResponse.data)) {
              // Ordenar análisis desde el más reciente al más antiguo
              const ordenados = [...alternativeResponse.data].sort((a, b) => {
                // Manejar casos donde fecha_analisis es null o undefined
                if (!a.fecha_analisis) return 1;
                if (!b.fecha_analisis) return -1;
                
                const fechaA = new Date(a.fecha_analisis).getTime();
                const fechaB = new Date(b.fecha_analisis).getTime();
                return fechaB - fechaA; // Orden descendente
              });
              
              setAnalisisPrevios(ordenados);
              success = true;
            }
          } catch (err) {
            // Continuar con el siguiente endpoint
          }
        }
        
        if (!success) {
          // Si ningún endpoint funcionó
          setAnalisisPrevios([]);
        }
      } catch (err) {
        console.error("Error en proceso de intento con endpoints alternativos:", err);
        setAnalisisPrevios([]);
      }
    } finally {
      setLoadingAnalisis(false);
    }
  };

  // Abrir modal y cargar análisis
  const handleShowAnalisisModal = () => {
    setShowAnalisisModal(true);
    loadAnalisisPrevios();
  };

  // Navegar a la pantalla de resultados con un análisis seleccionado
  const handleSelectAnalisis = async (analisis, seleccionesEspecificas = {}, unidadesRegistradas = {}) => {
    setShowAnalisisModal(false);
    
    // Asegurar que se pasa correctamente el ID
    const analisisConId = {
      ...analisis,
      id: analisis.id || Date.now().toString(),
      id_persona: analisis.id_persona || analisis.persona_id || userId,
      persona_id: analisis.persona_id || analisis.id_persona || userId,
    };
    
    // Añadir las selecciones específicas y unidades al objeto de análisis
    const procesado = processAnalysisData(analisisConId);
    procesado.seleccionesEspecificas = seleccionesEspecificas || {};
    procesado.foodsWithUnits = unidadesRegistradas || {};
    
    navigation.navigate('ScanResult', {
      results: procesado,
      userId: userId,
      isReadOnly: true
    });
  };

  // Procesar datos de análisis para adaptarlos al formato esperado
  const processAnalysisData = (data) => {
    // Crear un formato consistente independientemente de la fuente
    const processed = {
      id: data.id || Date.now().toString(),
      id_persona: data.id_persona || data.persona_id || userId,
      persona_id: data.persona_id || data.id_persona || userId,
      imagen_analizada: data.url_imagen || data.imagen_analizada || (data.resultado?.imagen_analizada || null),
      fecha_analisis: data.fecha_analisis || new Date().toISOString(),
      nombre: data.nombre || data.conclusion || "Análisis de alimentos",
      conclusion: data.conclusion,
      compatible_con_perfil: data.compatible_con_perfil,
      // Incluir selecciones específicas almacenadas si están disponibles
      seleccionesEspecificas: data.seleccionesEspecificas || {},
      foodsWithUnits: data.foodsWithUnits || {}
    };
    
    // Extraer alimentos_detectados - verificar todas las ubicaciones posibles
    let alimentos = [];
    let totales = {
      energia: 0, proteinas: 0, hidratos_carbono: 0, 
      lipidos: 0, sodio: 0, potasio: 0, fosforo: 0
    };
    
    // Extraer datos del campo resultado si está disponible
    if (data.resultado) {
      // Intentar primero con texto_original
      if (data.resultado.texto_original) {
        if (typeof data.resultado.texto_original === 'string') {
          // Si es una cadena, intentar analizarla como JSON
          try {
            const parsed = JSON.parse(data.resultado.texto_original);
            if (parsed.alimentos_detectados) {
              alimentos = parsed.alimentos_detectados;
            }
            if (parsed.totales) {
              totales = { ...totales, ...parsed.totales };
            }
          } catch (e) {
            console.log("No se pudo analizar texto_original como JSON");
          }
        } else if (typeof data.resultado.texto_original === 'object') {
          // Si ya es un objeto
          if (data.resultado.texto_original.alimentos_detectados) {
            alimentos = data.resultado.texto_original.alimentos_detectados;
          }
          if (data.resultado.texto_original.totales) {
            totales = { ...totales, ...data.resultado.texto_original.totales };
          }
        }
        processed.texto_original = data.resultado.texto_original;
      }
      
      // Si no se encontraron alimentos aún, intentar con resultado directamente
      if (alimentos.length === 0 && data.resultado.alimentos_detectados) {
        alimentos = data.resultado.alimentos_detectados;
      }
      
      // Si no se encontraron totales aún, intentar con resultado directamente
      if (!totales.energia && data.resultado.totales) {
        totales = { ...totales, ...data.resultado.totales };
      }
      
      // Si tenemos recomendaciones en resultado, úsalas
      if (data.resultado.recomendaciones) {
        processed.recomendaciones = data.resultado.recomendaciones;
      }
    }
    
    // Fallback a campos de datos directamente si no se encuentran en resultado
    if (alimentos.length === 0 && data.alimentos_detectados) {
      alimentos = data.alimentos_detectados;
    }
    
    // Fallback final para texto_original
    if (!processed.texto_original && typeof data.texto_original === 'object') {
      processed.texto_original = data.texto_original;
    }
    
    // Asegurarse de que tenemos campos alimentos_detectados y totales
    processed.alimentos_detectados = alimentos;
    processed.totales = totales;
    
    // También asegurar información de compatibilidad renal
    if (data.compatibilidad_renal !== undefined) {
      processed.compatibilidad_renal = data.compatibilidad_renal;
    } else if (data.resultado?.compatibilidad_renal !== undefined) {
      processed.compatibilidad_renal = data.resultado.compatibilidad_renal;
    } else if (processed.texto_original?.compatibilidad_renal !== undefined) {
      processed.compatibilidad_renal = processed.texto_original.compatibilidad_renal;
    }
    
    console.log("Processed analysis data:", JSON.stringify(processed, null, 2));
    return processed;
  };

  // Versión web simplificada
  if (isWeb) {
    return <WebPlaceholder />;
  }

  // Si ya hay una imagen capturada, mostrar la vista previa
  if (capturedImage) {
    return (
      <ImagePreview
        imageUri={capturedImage}
        onProcess={handleProcessImage}
        onDelete={handleDeleteImage}
        loading={loading}
      />
    );
  }
  
  // Vista normal para seleccionar cámara o galería
  return (
    <SafeAreaView style={styles.container}>
      <View style={scannerStyles.header}>
        
        {/* Botón para ver análisis previos */}
        <TouchableOpacity 
          style={scannerStyles.historyButton}
          onPress={handleShowAnalisisModal}
        >
          <MaterialIcons name="history" size={24} color="#690B22" />
          <Text style={scannerStyles.historyButtonText}>Mis Análisis</Text>
        </TouchableOpacity>
      </View>
      
      <CameraGalleryOptions
        onCameraPress={handleOpenCamera}
        onGalleryPress={handleOpenGallery}
      />
      
      {/* Modal para mostrar análisis previos */}
      <MisAnalisisModal 
        visible={showAnalisisModal}
        onClose={() => setShowAnalisisModal(false)}
        onSelectAnalisis={handleSelectAnalisis}
        analisis={analisisPrevios}
        loading={loadingAnalisis}
      />
    </SafeAreaView>
  );
}

// Estilos adicionales
const scannerStyles = StyleSheet.create({
  header: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 16,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  historyButtonText: {
    marginLeft: 8,
    color: '#690B22',
    fontWeight: 'bold',
  },
});