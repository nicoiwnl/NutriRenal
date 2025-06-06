import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import RegistroModal from '../../alimentos/components/RegistroModal';
import styles from '../styles/minutaStyles';

const AlimentosDetectadosLista = ({ alimentosDetectados, unidadesMedida, loading, error }) => {
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(null);
  const [mostrarRegistroModal, setMostrarRegistroModal] = useState(false);
  
  // Manejar selección de alimento para registro
  const handleRegistrarAlimento = (alimento) => {
    setAlimentoSeleccionado(alimento);
    setMostrarRegistroModal(true);
  };
  
  // Cerrar modal y limpiar selección
  const handleCerrarModal = () => {
    setMostrarRegistroModal(false);
    setAlimentoSeleccionado(null);
  };
  
  // Si no hay alimentos detectados, no mostrar nada
  if (!loading && alimentosDetectados.length === 0) {
    return null;
  }
  
  return (
    <View style={localStyles.container}>
      <View style={localStyles.headerContainer}>
        <MaterialIcons name="local-grocery-store" size={20} color="#690B22" />
        <Text style={localStyles.headerText}>
          Alimentos detectados en esta comida
        </Text>
        {loading && <ActivityIndicator size="small" color="#690B22" style={{marginLeft: 10}} />}
      </View>
      
      {error ? (
        <Text style={localStyles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={alimentosDetectados}
          keyExtractor={item => item.id.toString()}
          horizontal={false}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={localStyles.alimentoItem}>
              <View style={localStyles.alimentoInfo}>
                {item.imagen ? (
                  <Image 
                    source={{ uri: item.imagen.startsWith('http') ? 
                      item.imagen : 
                      `http://192.168.1.24:8000/media/${item.imagen}` 
                    }} 
                    style={localStyles.alimentoImagen}
                  />
                ) : (
                  <View style={localStyles.alimentoImagenPlaceholder}>
                    <MaterialIcons name="restaurant" size={20} color="#ddd" />
                  </View>
                )}
                <View>
                  <Text style={localStyles.alimentoNombre}>{item.nombre}</Text>
                  <Text style={localStyles.alimentoMatch}>
                    Detectado: "{item.termino_busqueda}"
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={localStyles.registrarButton}
                onPress={() => handleRegistrarAlimento(item)}
              >
                <MaterialIcons name="add-circle-outline" size={18} color="#fff" />
                <Text style={localStyles.registrarButtonText}>Registrar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      
      {/* Modal para registrar el consumo del alimento - ahora con unidades reales */}
      {alimentoSeleccionado && (
        <RegistroModal
          visible={mostrarRegistroModal}
          onDismiss={handleCerrarModal}
          alimento={alimentoSeleccionado}
          selectedUnit={unidadesMedida && unidadesMedida.length > 0 ? unidadesMedida[0] : {
            id: 0,
            nombre: 'Porción estándar',
            equivalencia_ml: 100,
            equivalencia_g: 100,
            es_volumen: true
          }}
          onSuccess={handleCerrarModal}
          unidadesMedida={unidadesMedida && unidadesMedida.length > 0 ? unidadesMedida : [{
            id: 0,
            nombre: 'Porción estándar',
            equivalencia_ml: 100,
            equivalencia_g: 100,
            es_volumen: true
          }]}
        />
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    marginTop: 16,
    backgroundColor: '#F8F0E8',
    borderRadius: 8,
    padding: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginLeft: 8,
  },
  errorText: {
    color: '#F44336',
    fontStyle: 'italic',
  },
  alimentoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  alimentoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alimentoImagen: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  alimentoImagenPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alimentoNombre: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  alimentoMatch: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  registrarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  registrarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default AlimentosDetectadosLista;
