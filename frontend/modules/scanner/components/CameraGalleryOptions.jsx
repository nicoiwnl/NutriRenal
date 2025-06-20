import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Actualización completa del componente para eliminar textos fijos
const CameraGalleryOptions = ({ 
  onCameraPress, 
  onGalleryPress, 
  cameraTitle = "Tomar foto de alimento",
  galleryTitle = "Seleccionar de galería",
  mainTitle = null, 
  mainDescription = null
}) => {
  return (
    <View style={styles.container}>
      {/* Solo mostrar título si se proporciona explícitamente */}
      {mainTitle !== null && mainTitle !== "" && (
        <Text style={styles.title}>{mainTitle}</Text>
      )}
      
      {/* Solo mostrar descripción si se proporciona explícitamente */}
      {mainDescription !== null && mainDescription !== "" && (
        <Text style={styles.description}>{mainDescription}</Text>
      )}
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.option} 
          onPress={onCameraPress}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="camera-alt" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.optionTitle}>{cameraTitle}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.option} 
          onPress={onGalleryPress}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="photo-library" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.optionTitle}>{galleryTitle}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 20,
  },
  option: {
    alignItems: 'center',
    width: 150,
  },
  iconContainer: {
    backgroundColor: '#690B22',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionTitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  }
});

export default CameraGalleryOptions;
