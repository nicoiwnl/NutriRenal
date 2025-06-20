import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { BASE_URL, ENDPOINTS } from '../../../config/apiConfig';
import api from '../../../api';

const useAnalisisIngredientes = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const isWeb = Platform.OS === 'web';
  
  // Función para abrir la cámara
  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere permiso para acceder a la cámara');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
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

  // Función para abrir la galería
  const handleOpenGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Se requiere permiso para acceder a la galería');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
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
      
      // 3. Enviar la imagen para analizar ingredientes
      const response = await api.post(ENDPOINTS.ANALIZAR_INGREDIENTES, {
        imagen: `data:image/jpeg;base64,${base64Image}`,
        id_persona: userId,
        persona_id: userId,
        userId: userId,
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId || 'anonymous',
          'X-Persona-ID': userId || 'anonymous'
        }
      });
      
      const responseData = response.data;
      console.log("Respuesta recibida exitosamente:", responseData);
      
      // 4. Navegar a la pantalla de resultados - navegar a IngredientesResultScreen
      navigation.navigate('IngredientesResultScreen', {
        imageUri: capturedImage,
        results: responseData,
        userId: userId
      });
      
    } catch (error) {
      console.error('Error al analizar los ingredientes:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      
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

export default useAnalisisIngredientes;
