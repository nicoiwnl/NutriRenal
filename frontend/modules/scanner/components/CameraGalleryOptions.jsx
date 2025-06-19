import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/scannerStyles';

const CameraGalleryOptions = ({ onCameraPress, onGalleryPress }) => {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>Escanear Alimento</Text>
      <Text style={styles.instructions}>
        Tome una foto de un alimento para obtener información nutricional y 
        recomendaciones específicas para su dieta.
      </Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={onCameraPress}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="camera-alt" size={40} color="#690B22" />
          </View>
          <Text style={styles.buttonLabel}>Cámara</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={onGalleryPress}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="photo-library" size={40} color="#690B22" />
          </View>
          <Text style={styles.buttonLabel}>Galería</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraGalleryOptions;
