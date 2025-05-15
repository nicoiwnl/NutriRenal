import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  FlatList, 
  StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../styles/nuevaPublicacionStyles';

const PublicacionForm = ({ 
  asunto, 
  setAsunto, 
  contenido, 
  setContenido, 
  onPublicar, 
  onCancel, 
  loading,
  // Nuevas props
  foros = [],
  foroSeleccionado,
  onSelectForo,
  loadingForos = false
}) => {
  // Estado para manejar la visibilidad del modal selector de foro
  const [foroModalVisible, setForoModalVisible] = useState(false);

  return (
    <View style={styles.formContainer}>
      {/* Selector de foro */}
      <Text style={styles.label}>Foro *</Text>
      <TouchableOpacity
        style={styles.foroSelector}
        onPress={() => setForoModalVisible(true)}
        disabled={loadingForos}
      >
        {loadingForos ? (
          <View style={styles.foroSelectorContent}>
            <ActivityIndicator size="small" color="#690B22" />
            <Text style={styles.foroSelectorText}>Cargando foros...</Text>
          </View>
        ) : (
          <View style={styles.foroSelectorContent}>
            <MaterialIcons 
              name={foroSeleccionado?.es_general ? "public" : "forum"} 
              size={16} 
              color="#1B4D3E" 
            />
            <Text style={styles.foroSelectorText}>
              {foroSeleccionado?.nombre || "Seleccionar foro"}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#1B4D3E" />
          </View>
        )}
      </TouchableOpacity>

      {/* Campo de asunto */}
      <Text style={styles.label}>Asunto *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese el asunto de su publicación"
        value={asunto}
        onChangeText={setAsunto}
        maxLength={100}
      />

      {/* Campo de contenido */}
      <Text style={styles.label}>Contenido *</Text>
      <TextInput
        style={styles.contentInput}
        placeholder="Escriba el contenido de su publicación aquí..."
        value={contenido}
        onChangeText={setContenido}
        multiline
        textAlignVertical="top"
      />

      {/* Botón de publicar */}
      <TouchableOpacity
        style={[
          styles.publishButton, 
          (!asunto.trim() || !contenido.trim() || !foroSeleccionado) && styles.publishButtonDisabled
        ]}
        onPress={onPublicar}
        disabled={loading || !asunto.trim() || !contenido.trim() || !foroSeleccionado}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialIcons name="send" size={20} color="#fff" />
            <Text style={styles.publishButtonText}>Publicar</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Botón de cancelar */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>

      {/* Modal para seleccionar foro */}
      <Modal
        visible={foroModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setForoModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Seleccionar Foro</Text>
              <TouchableOpacity onPress={() => setForoModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={foros}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    modalStyles.foroItem,
                    foroSeleccionado?.id === item.id && modalStyles.foroItemSelected
                  ]}
                  onPress={() => {
                    onSelectForo(item);
                    setForoModalVisible(false);
                  }}
                >
                  <MaterialIcons 
                    name={item.es_general ? "public" : "forum"} 
                    size={20} 
                    color={foroSeleccionado?.id === item.id ? "#FFFFFF" : "#1B4D3E"} 
                  />
                  <Text 
                    style={[
                      modalStyles.foroItemText,
                      foroSeleccionado?.id === item.id && modalStyles.foroItemTextSelected
                    ]}
                    numberOfLines={1}
                  >
                    {item.nombre}
                  </Text>
                  {item.es_general && (
                    <View style={modalStyles.generalBadge}>
                      <Text style={modalStyles.generalBadgeText}>General</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={modalStyles.emptyText}>No hay foros disponibles</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos adicionales para el modal
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '100%',
    maxHeight: '80%',
    maxWidth: 500,
  },
  modalHeader: {
    backgroundColor: '#690B22',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  foroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  foroItemSelected: {
    backgroundColor: '#690B22',
  },
  foroItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  foroItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
  },
  generalBadge: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  generalBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PublicacionForm;
