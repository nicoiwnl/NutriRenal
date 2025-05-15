import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ForoSelector = ({ foros, foroSeleccionado, visible, onSelectForo, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Seleccionar Foro</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={foros}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.foroItem,
                  foroSeleccionado?.id === item.id && styles.foroItemSelected,
                ]}
                onPress={() => {
                  onSelectForo(item);
                  onClose();
                }}
              >
                <Text 
                  style={[
                    styles.foroItemText,
                    foroSeleccionado?.id === item.id && styles.foroItemTextSelected
                  ]}
                >
                  {item.nombre}
                </Text>
                {item.es_general && (
                  <View style={styles.generalBadge}>
                    <Text style={styles.generalBadgeText}>General</Text>
                  </View>
                )}
                {foroSeleccionado?.id === item.id && (
                  <MaterialIcons name="check" size={20} color="#690B22" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  closeButton: {
    padding: 4,
  },
  foroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  foroItemSelected: {
    backgroundColor: '#F8F8F8',
  },
  foroItemText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  foroItemTextSelected: {
    fontWeight: 'bold',
    color: '#690B22',
  },
  generalBadge: {
    backgroundColor: '#1B4D3E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  generalBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ForoSelector;
