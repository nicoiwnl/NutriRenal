import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export const options = {
  title: 'Escanear'
};

// Una versión simple para dispositivos web
function QRScannerWeb() {
  return (
    <SafeAreaView style={styles.webContainer}>
      <Text style={styles.webText}>La funcionalidad de cámara no está disponible en la web.</Text>
    </SafeAreaView>
  );
}

// La versión para dispositivos móviles - ahora con funcionalidad directa de cámara
function QRScannerApp() {
  const navigation = useNavigation();
  // Nuevo estado para manejar la imagen capturada
  const [capturedImage, setCapturedImage] = useState(null);
  
  // Función para abrir la cámara directamente
  const handleOpenCamera = async () => {
    try {
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Se necesitan permisos de cámara para esta función');
        return;
      }
      
      // Lanzar la cámara
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Guardar la imagen capturada en el estado
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo abrir la cámara. Por favor, inténtelo de nuevo.');
    }
  };
  
  // Función para abrir la galería
  const handleOpenGallery = async () => {
    try {
      // Solicitar permisos de galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Se necesitan permisos de galería para esta función');
        return;
      }
      
      // Lanzar el selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Guardar la imagen seleccionada en el estado
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al acceder a la galería:', error);
      alert('No se pudo abrir la galería. Por favor, inténtelo de nuevo.');
    }
  };

  // Función para procesar la imagen (actualmente sin funcionalidad real)
  const handleProcessImage = () => {
    alert('Esta función procesará la imagen con IA en el futuro.');
    // Aquí iría el código para enviar la imagen a la API de IA
  };

  // Función para eliminar la imagen capturada
  const handleDeleteImage = () => {
    setCapturedImage(null);
  };
  
  // Si ya hay una imagen capturada, mostrar la vista previa con botones
  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.imagePreviewContainer}>
          <Image 
            source={{ uri: capturedImage }} 
            style={styles.previewImage}
            resizeMode="contain"
          />
          
          <View style={styles.previewButtonsContainer}>
            <TouchableOpacity
              style={[styles.previewButton, styles.processButton]}
              onPress={handleProcessImage}
            >
              <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
              <Text style={styles.previewButtonText}>Procesar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.previewButton, styles.deleteButton]}
              onPress={handleDeleteImage}
            >
              <MaterialIcons name="delete" size={24} color="#FFFFFF" />
              <Text style={styles.previewButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Vista normal para seleccionar cámara o galería
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Escaneo de alimentos</Text>
        
        <Text style={styles.instructions}>
          Toca la cámara para tomar una foto o selecciona una imagen de tu galería.
        </Text>
        
        <View style={styles.actionButtons}>
          {/* Botón de la cámara */}
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleOpenCamera}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name="camera-alt" size={50} color="#690B22" />
            </View>
            <Text style={styles.buttonLabel}>Tomar foto</Text>
          </TouchableOpacity>
          
          {/* Botón de la galería */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleOpenGallery}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name="photo-library" size={45} color="#1B4D3E" />
            </View>
            <Text style={styles.buttonLabel}>Galería</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default Platform.OS === 'web' ? QRScannerWeb : QRScannerApp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#F8E8D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webText: {
    color: '#690B22',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  cameraButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  galleryButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    position: 'absolute',
    bottom: 30,
  },
  backButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  // Nuevos estilos para la vista previa de la imagen
  imagePreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewImage: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').width * 0.9,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  previewButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 150,
  },
  processButton: {
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    marginLeft: 10,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});