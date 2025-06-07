import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { BASE_URL, ENDPOINTS, getImageUrl } from '../../../config/apiConfig';
import api from '../../../api';

const useScanner = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const isWeb = Platform.OS === 'web';
  
  // Función para abrir la cámara - corregida para usar la API correctamente
  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere permiso para acceder a la cámara');
        return;
      }
      
      // Usar la API correcta para expo-image-picker (sin MediaType)
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Dejarlo como estaba originalmente
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  // Función para abrir la galería - corregida para usar la API correctamente
  const handleOpenGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere permiso para acceder a la galería');
        return;
      }
      
      // Usar la API correcta para expo-image-picker (sin MediaType)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Dejarlo como estaba originalmente
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al abrir la galería:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  // Función para convertir la imagen a base64
  const convertImageToBase64 = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error al convertir imagen a base64:', error);
      throw error;
    }
  };

  // Función para procesar la imagen con la API de análisis
  const handleProcessImage = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'No hay imagen para procesar');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Convertir imagen a base64
      const base64Image = await convertImageToBase64(capturedImage);
      
      // 2. Obtener el token y datos del usuario
      const userData = await AsyncStorage.getItem('userData');
      let userId = null;
      
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          userId = parsedUserData.persona_id || 
                  parsedUserData.id_persona || 
                  parsedUserData.id || 
                  parsedUserData.user_id;
                  
          console.log("Enviando análisis con ID de usuario:", userId);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      // IMPROVED ERROR HANDLING: Agregar timeout más largo
      const response = await api.post(ENDPOINTS.ANALIZAR_IMAGEN, {
        imagen: `data:image/jpeg;base64,${base64Image}`,
        region: 'chile',
        id_persona: userId,
        persona_id: userId,
        userId: userId
      }, {
        timeout: 30000, // 30 segundos de timeout
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId || 'anonymous',
          'X-Persona-ID': userId || 'anonymous'
        }
      });
      
      const responseData = response.data;
      console.log("Respuesta recibida exitosamente:", responseData);
      
      // 4. Procesar la data para adaptarla a la estructura esperada
      const processedData = processResponseData(responseData);
      
      // 5. Navegación a la pantalla de resultados
      setTimeout(() => {
        navigation.navigate('ScanResult', {
          imageUri: capturedImage,
          results: processedData,
          userId: userId
        });
      }, 300);
      
    } catch (error) {
      console.error('Error al analizar la imagen:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      
      // Más información sobre el error para debugging
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      };
      
      console.log('Detalles completos del error:', JSON.stringify(errorDetails, null, 2));
      
      Alert.alert(
        'Error al analizar', 
        `No fue posible procesar la imagen. ${error.response?.status === 500 ? 
          'Error en el servidor. Intente más tarde.' : 
          'Verifique su conexión e intente nuevamente.'}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar la estructura de respuesta
  const processResponseData = (data) => {
    // Si recibimos un array, tomamos el primer elemento
    if (Array.isArray(data) && data.length > 0) {
      data = data[0];
    }
    
    // Si tenemos estructura anidada dentro de "resultado", la extraemos
    if (data.resultado) {
      // Asegurarnos de capturar todos los posibles campos de ID
      const processed = {
        id: data.id || Date.now().toString(), // Asignar un ID temporal si falta
        id_persona: data.id_persona || data.persona_id || data.id_persona_id || data.usuario_id,
        persona_id: data.id_persona || data.persona_id || data.id_persona_id || data.usuario_id, // Duplicamos para asegurar
        imagen_analizada: data.url_imagen || data.resultado.imagen_analizada,
        fecha_analisis: data.fecha_analisis || new Date().toISOString(),
        conclusion: data.conclusion,
        compatible_con_perfil: data.compatible_con_perfil,
        plato_detectado: data.plato_detectado || data.resultado.plato_detectado || data.nombre_plato || ''
      };
      
      // Extraer datos del texto_original si existe
      if (data.resultado.texto_original) {
        processed.texto_original = data.resultado.texto_original;
        processed.alimentos_detectados = data.resultado.texto_original.alimentos_detectados || [];
        processed.totales = data.resultado.texto_original.totales || {
          energia: 0, proteinas: 0, hidratos_carbono: 0, 
          lipidos: 0, sodio: 0, potasio: 0, fosforo: 0
        };
      } else {
        // Fallback a los campos principales
        processed.alimentos_detectados = data.resultado.alimentos_detectados || data.alimentos_detectados || [];
        processed.totales = data.resultado.totales || {
          energia: 0, proteinas: 0, hidratos_carbono: 0, 
          lipidos: 0, sodio: 0, potasio: 0, fosforo: 0
        };
      }
      
      return processed;
    }
    
    // Si no tiene esa estructura, devolvemos los datos como están
    return data;
  };

  // Función para eliminar la imagen capturada
  const handleDeleteImage = () => {
    setCapturedImage(null);
  };

  // Función para volver atrás
  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    capturedImage,
    loading,
    handleOpenCamera,
    handleOpenGallery,
    handleProcessImage,
    handleDeleteImage,
    handleGoBack,
    isWeb
  };
};

export default useScanner;
