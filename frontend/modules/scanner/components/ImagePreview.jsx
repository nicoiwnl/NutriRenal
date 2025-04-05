import React from 'react';
import { View, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/scannerStyles';

const ImagePreview = ({ 
  imageUri, 
  onProcess, 
  onDelete, 
  loading 
}) => {
  return (
    <View style={styles.imagePreviewContainer}>
      <Image 
        source={{ uri: imageUri }} 
        style={styles.previewImage} 
        resizeMode="cover"
      />
      
      <View style={styles.previewButtonsContainer}>
        <TouchableOpacity 
          style={[styles.previewButton, styles.processButton]}
          onPress={onProcess}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
              <Text style={styles.previewButtonText}>Procesar</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.previewButton, styles.deleteButton]}
          onPress={onDelete}
          disabled={loading}
        >
          <MaterialIcons name="delete" size={20} color="#FFFFFF" />
          <Text style={styles.previewButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImagePreview;
