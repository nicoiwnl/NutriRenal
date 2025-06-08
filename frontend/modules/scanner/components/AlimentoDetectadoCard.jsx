import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getImageUrl } from '../../../config/apiConfig';

const AlimentoDetectadoCard = ({ alimento }) => {
  const navigation = useNavigation();
  
  // Función para navegar al detalle del alimento
  const verDetalle = () => {
    navigation.navigate('AlimentoDetailScreen', { id: alimento.id });
  };
  
  // Función para registrar consumo (pendiente de implementación)
  const registrarConsumo = () => {
    // Esta función podría navegar a una pantalla de registro o llamar a una API
    alert(`Registrar consumo: ${alimento.nombre}`);
  };
  
  return (
    <View style={styles.card}>
      {/* Imagen del alimento */}
      <View style={styles.imageContainer}>
        {alimento.imagen ? (
          <Image 
            source={{ uri: getImageUrl(alimento.imagen) }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <MaterialIcons name="restaurant" size={30} color="#ddd" />
          </View>
        )}
      </View>
      
      {/* Información del alimento */}
      <View style={styles.infoContainer}>
        <Text style={styles.nombre}>{alimento.nombre}</Text>
        
        <View style={styles.categoriaRow}>
          <Text style={styles.categoriaLabel}>Categoría:</Text>
          <Text style={styles.categoria}>{alimento.categoria}</Text>
        </View>
        
        <View style={styles.terminoRow}>
          <Text style={styles.terminoLabel}>Detectado como:</Text>
          <Text style={styles.termino}>{alimento.termino_busqueda}</Text>
        </View>
        
        <View style={styles.cantidadRow}>
          <Text style={styles.cantidadLabel}>Cantidad estimada:</Text>
          <Text style={styles.cantidad}>{alimento.cantidad_sugerida}</Text>
        </View>
      </View>
      
      {/* Botones de acción */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.detalleButton]}
          onPress={verDetalle}
        >
          <MaterialIcons name="info-outline" size={16} color="#fff" />
          <Text style={styles.buttonText}>Detalle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.registrarButton]}
          onPress={registrarConsumo}
        >
          <MaterialIcons name="playlist-add" size={16} color="#fff" />
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  categoriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoriaLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  categoria: {
    fontSize: 12,
    color: '#690B22',
    fontWeight: '500',
  },
  terminoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  terminoLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  termino: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  cantidadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cantidadLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  cantidad: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingLeft: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginVertical: 4,
  },
  detalleButton: {
    backgroundColor: '#690B22',
  },
  registrarButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default AlimentoDetectadoCard;
