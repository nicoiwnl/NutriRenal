import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/fichaMedicaStyles';

const PhotoOptionsModal = ({ 
  visible, 
  onDismiss, 
  onTakePhoto, 
  onSelectImage 
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.photoOptionsContainer}>
            <Text style={styles.photoOptionsTitle}>Foto de perfil</Text>
            
            <TouchableOpacity 
              style={styles.photoOption}
              onPress={onTakePhoto}
            >
              <MaterialIcons name="camera-alt" size={24} color="#690B22" />
              <Text style={styles.photoOptionText}>Tomar foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.photoOption}
              onPress={onSelectImage}
            >
              <MaterialIcons name="photo-library" size={24} color="#690B22" />
              <Text style={styles.photoOptionText}>Seleccionar de la galería</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.photoOption, styles.cancelOption]}
              onPress={onDismiss}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

export default PhotoOptionsModal;
