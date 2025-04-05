import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function useScanner() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  
  // Función para abrir la cámara
  const handleOpenCamera = async () => {
    try {
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Se necesita acceso a la cámara para escanear elementos.'
        );
        return;
      }
      
      // Lanzar la cámara
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara. Intente nuevamente.');
    }
  };
  
  // Función para abrir la galería
  const handleOpenGallery = async () => {
    try {
      // Solicitar permisos de galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Se necesita acceso a la galería para seleccionar imágenes.'
        );
        return;
      }
      
      // Lanzar la galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al abrir la galería:', error);
      Alert.alert('Error', 'No se pudo abrir la galería. Intente nuevamente.');
    }
  };

  // Función para procesar la imagen
  const handleProcessImage = () => {
    setLoading(true);
    
    // Simulamos procesamiento por 2 segundos
    setTimeout(() => {
      setLoading(false);
      
      // Aquí iría la lógica real para enviar la imagen a la API de procesamiento
      // Por ahora, simplemente navegamos a una pantalla de resultados simulados
      navigation.navigate('ScanResult', { imageUri: capturedImage });
    }, 2000);
  };

  // Función para eliminar la imagen capturada
  const handleDeleteImage = () => {
    setCapturedImage(null);
  };
  
  // Función para volver a la pantalla anterior
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
    isWeb: Platform.OS === 'web'
  };
}
