import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { modalStyles } from '../styles/scanResultStyles';

const AlimentoOptionsModal = ({ visible, onClose, alimento, onBuscarInfo, onRegistrarConsumo }) => {
  // Si no hay alimento seleccionado, no mostrar nada
  if (!alimento) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalTitle}>¿Qué deseas hacer con este alimento?</Text>
          <Text style={modalStyles.alimentoSelected}>{alimento}</Text>
          
          <TouchableOpacity
            style={[modalStyles.button, modalStyles.buttonBuscar]}
            onPress={onBuscarInfo}
          >
            <MaterialIcons name="search" size={20} color="#FFFFFF" />
            <Text style={modalStyles.textStyle}>Buscar información nutricional</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[modalStyles.button, modalStyles.buttonRegistrar]}
            onPress={onRegistrarConsumo}
          >
            <MaterialIcons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={modalStyles.textStyle}>Registrar consumo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[modalStyles.button, modalStyles.buttonClose]}
            onPress={onClose}
          >
            <Text style={modalStyles.textStyle}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AlimentoOptionsModal;
