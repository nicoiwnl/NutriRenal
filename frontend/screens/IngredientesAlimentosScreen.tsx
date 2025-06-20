import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Utilizar el hook específico para análisis de ingredientes
import useAnalisisIngredientes from '../modules/analisis_ingredientes/hooks/useAnalisisIngredientes';

// Reutilizando componentes del módulo de scanner pero con propósito específico
import WebPlaceholder from '../modules/scanner/components/WebPlaceholder';
import ImagePreview from '../modules/scanner/components/ImagePreview';
import MisAnalisisIngredientesModal from '../modules/analisis_ingredientes/components/MisAnalisisIngredientesModal';
import api from '../api';
import { ENDPOINTS, getImageUrl } from '../config/apiConfig';

export const options = {
  title: '¿Qué estoy comiendo?'
};

// Componente específico para escanear empaques de alimentos e ingredientes
export default function IngredientesAlimentosScreen({ navigation }) {
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
  } = useAnalisisIngredientes();

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
      
      // Corregir esta línea: usar el endpoint de la configuración en lugar de API_BASE
      const response = await api.get(ENDPOINTS.MIS_ANALISIS_INGREDIENTES(userId));
      
      if (response.data && Array.isArray(response.data)) {
        // Ordenar análisis desde el más reciente al más antiguo
        const sortedAnalysis = [...response.data].sort((a, b) => {
          if (!a.fecha_analisis) return 1;
          if (!b.fecha_analisis) return -1;
          
          const fechaA = new Date(a.fecha_analisis).getTime();
          const fechaB = new Date(b.fecha_analisis).getTime();
          return fechaB - fechaA; // Orden descendente
        });
        
        setAnalisisPrevios(sortedAnalysis);
      }
    } catch (error) {
      console.error('Error cargando análisis previos:', error);
      setAnalisisPrevios([]);
    } finally {
      setLoadingAnalisis(false);
    }
  };
  
  // Abrir modal y cargar análisis previos
  const handleShowAnalisisModal = () => {
    setShowAnalisisModal(true);
    loadAnalisisPrevios();
  };
  
  // Navegar a la pantalla de resultados con un análisis seleccionado
  const handleSelectAnalisis = (analisis) => {
    setShowAnalisisModal(false);
    
    navigation.navigate('IngredientesResultScreen', {
      imageUri: getImageUrl(analisis.url_imagen),
      results: analisis.resultado,
      userId: userId,
      isHistorical: true
    });
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
  
  // Vista rediseñada para seleccionar cámara o galería
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header con botón de historial */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>
              Analiza los ingredientes de un producto para saber si es adecuado para tu salud renal
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={handleShowAnalisisModal}
          >
            <MaterialIcons name="history" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Icono ilustrativo en vez de imagen */}
        <View style={styles.illustrationContainer}>

        </View>

        {/* Instrucciones con tarjetas */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>
          
          <View style={styles.instructionCard}>
            <View style={[styles.instructionIconContainer, {backgroundColor: '#F9D9E5'}]}>
              <MaterialIcons name="photo-camera" size={28} color="#690B22" />
            </View>
            <View style={styles.instructionTextContainer}>
              <Text style={styles.instructionTitle}>Toma una foto clara</Text>
              <Text style={styles.instructionText}>
                Enfoca bien la lista de ingredientes del empaque
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionCard}>
            <View style={[styles.instructionIconContainer, {backgroundColor: '#F9E4D9'}]}>
              <MaterialIcons name="description" size={28} color="#690B22" />
            </View>
            <View style={styles.instructionTextContainer}>
              <Text style={styles.instructionTitle}>Obtén información útil</Text>
              <Text style={styles.instructionText}>
                Te mostraremos cuáles ingredientes son problemáticos para tu salud renal
              </Text>
            </View>
          </View>
          
          <View style={styles.instructionCard}>
            <View style={[styles.instructionIconContainer, {backgroundColor: '#D9F9E4'}]}>
              <MaterialIcons name="check-circle" size={28} color="#690B22" />
            </View>
            <View style={styles.instructionTextContainer}>
              <Text style={styles.instructionTitle}>Decisión informada</Text>
              <Text style={styles.instructionText}>
                Toma mejores decisiones sobre lo que consumes
              </Text>
            </View>
          </View>
        </View>
        
        {/* Contenedor de acciones */}
        <View style={styles.actionContainer}>
          <Text style={styles.sectionTitle}>¡Comencemos!</Text>
          
          <TouchableOpacity 
            style={styles.mainButton}
            onPress={handleOpenCamera}
          >
            <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Tomar foto ahora</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleOpenGallery}
          >
            <MaterialIcons name="photo-library" size={22} color="#690B22" />
            <Text style={styles.secondaryButtonText}>Seleccionar de la galería</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Modal para mostrar análisis previos */}
      <MisAnalisisIngredientesModal 
        visible={showAnalisisModal}
        onClose={() => setShowAnalisisModal(false)}
        onSelectAnalisis={handleSelectAnalisis}
        analisis={analisisPrevios}
        loading={loadingAnalisis}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    backgroundColor: '#690B22',
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  historyButton: {
    width: 40,
    height: 40, 
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 22,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#690B22',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  instructionsContainer: {
    marginVertical: 10,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  instructionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  instructionTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 8,
    marginBottom: 15,
  },
  mainButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#690B22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // Reduced from 16 to 12
    shadowColor: "#690B22",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    paddingVertical: 12, // Reduced from 16 to 12
    borderWidth: 1,
    borderColor: '#690B22',
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#690B22',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
