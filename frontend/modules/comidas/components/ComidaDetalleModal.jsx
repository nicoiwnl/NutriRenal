import React from 'react';
import { View, Text, Modal, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/minutaStyles';

const ComidaDetalleModal = ({ visible, comida, onClose }) => {
  // Función para procesar la URL de la imagen correctamente
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // Si ya es una URL completa, usarla directamente
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Si es una ruta relativa, construir URL completa
    return `http://192.168.1.24:8000/media/${imageUrl}`;
  };
  
  // Comprobar si tenemos una imagen válida
  const hasValidImage = comida && comida.image && typeof comida.image === 'string';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {comida?.tipoComida || "Detalle de la comida"}
            </Text>
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {comida ? (
            <>
              {/* Imagen con mejor manejo de errores y logging para depuración */}
              {hasValidImage ? (
                <Image 
                  source={{ uri: getImageUrl(comida.image) }}
                  style={styles.modalImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Error cargando imagen:', error.nativeEvent.error);
                    console.log('URL de imagen:', getImageUrl(comida.image));
                  }}
                />
              ) : (
                <View style={styles.modalNoImage}>
                  <MaterialIcons name="image-not-supported" size={48} color="#ddd" />
                  <Text style={styles.modalNoImageText}>Sin imagen disponible</Text>
                </View>
              )}
              
              <ScrollView style={styles.modalScroll}>
                <View style={styles.modalContent}>
                  {/* Eliminamos el badge de tipo de comida ya que ahora está en el título */}
                  
                  <Text style={styles.modalSectionTitle}>{comida.name}</Text>
                  
                  <View style={styles.modalSection}>
                    <Text style={styles.modalDescription}>{comida.desc}</Text>
                  </View>
                  
                  <View style={styles.modalTips}>
                    <MaterialIcons name="lightbulb" size={20} color="#E07A5F" />
                    <Text style={styles.modalTipsText}>
                      Este plato ha sido seleccionado específicamente para tu plan alimentario personalizado.
                    </Text>
                  </View>
                </View>
              </ScrollView>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={onClose}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.modalContent, { padding: 20, alignItems: 'center' }]}>
              <MaterialIcons name="error-outline" size={48} color="#690B22" />
              <Text style={{ textAlign: 'center', marginTop: 10 }}>
                No se pudo cargar la información de esta comida.
              </Text>
              <TouchableOpacity 
                style={[styles.modalButton, { marginTop: 20 }]}
                onPress={onClose}
              >
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ComidaDetalleModal;
