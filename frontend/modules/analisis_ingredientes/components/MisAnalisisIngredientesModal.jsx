import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getImageUrl } from '../../../config/apiConfig';

const MisAnalisisIngredientesModal = ({ 
  visible, 
  onClose, 
  onSelectAnalisis,
  analisis,
  loading
}) => {

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Función auxiliar para mostrar un nombre significativo
  const getNombreProducto = (item) => {
    // Si hay un nombre específico, usarlo
    if (item.nombre_producto && item.nombre_producto !== "No disponible") {
      return item.nombre_producto;
    }
    
    // Si no hay nombre o es "No disponible", intentar crear uno a partir de ingredientes
    if (item.resultado && item.resultado.ingredientes_detectados && 
        item.resultado.ingredientes_detectados.length > 0) {
      const ingredientes = item.resultado.ingredientes_detectados;
      if (ingredientes.length <= 2) {
        return `Alimento con ${ingredientes.map(i => i.nombre || '').join(', ')}`;
      } else {
        return `Alimento con ${ingredientes[0].nombre} y ${ingredientes.length-1} ingredientes más`;
      }
    }
    
    // Si no hay información de ingredientes
    return "Análisis de Alimento no Identificado";
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mis Análisis de Ingredientes</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#690B22" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#690B22" />
              <Text style={styles.loadingText}>Cargando análisis...</Text>
            </View>
          ) : (
            <>
              {analisis.length > 0 ? (
                <FlatList
                  data={analisis}
                  keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.analisisItem}
                      onPress={() => onSelectAnalisis(item)}
                    >
                      <View style={styles.analisisImageContainer}>
                        {item.url_imagen ? (
                          <Image 
                            source={{ uri: getImageUrl(item.url_imagen) }}
                            style={styles.analisisImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.noImagePlaceholder}>
                            <MaterialIcons name="image-not-supported" size={24} color="#999" />
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.analisisInfo}>
                        <Text style={styles.analisisFecha}>
                          {formatDate(item.fecha_analisis)}
                        </Text>
                        
                        <Text style={styles.analisisNombre} numberOfLines={2}>
                          {getNombreProducto(item)}
                        </Text>
                        
                        <View style={[
                          styles.recomendacionBadge,
                          { backgroundColor: item.resultado?.es_recomendado ? '#E8F5E9' : '#FFEBEE' }
                        ]}>
                          <MaterialIcons 
                            name={item.resultado?.es_recomendado ? 'check-circle' : 'warning'} 
                            size={16} 
                            color={item.resultado?.es_recomendado ? '#4CAF50' : '#F44336'} 
                          />
                          <Text style={[
                            styles.recomendacionText,
                            { color: item.resultado?.es_recomendado ? '#2E7D32' : '#C62828' }
                          ]}>
                            {item.resultado?.es_recomendado ? 'Recomendado' : 'No recomendado'}
                          </Text>
                        </View>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color="#999" />
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="search" size={48} color="#690B22" />
                  <Text style={styles.emptyText}>
                    No tienes análisis previos
                  </Text>
                  <Text style={styles.emptySubText}>
                    Escanea algún producto para comenzar
                  </Text>
                </View>
              )}
            </>
          )}
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#690B22',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#690B22',
  },
  analisisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  analisisImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 16,
  },
  analisisImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analisisInfo: {
    flex: 1,
  },
  analisisFecha: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  analisisNombre: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  recomendacionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  recomendacionText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#690B22',
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#690B22',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MisAnalisisIngredientesModal;
