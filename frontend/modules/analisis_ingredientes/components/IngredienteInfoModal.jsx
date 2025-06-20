import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const IngredienteInfoModal = ({ 
  visible, 
  onClose, 
  ingrediente 
}) => {
  // Si no hay ingrediente o el modal no es visible, no renderizar nada
  if (!visible || !ingrediente) return null;

  // Determinar si es un objeto o un string
  const nombre = typeof ingrediente === 'string' ? ingrediente : ingrediente.nombre;
  const descripcion = typeof ingrediente === 'object' ? ingrediente.descripcion : '';
  const impactoRenal = typeof ingrediente === 'object' ? ingrediente.impacto_renal : '';
  const alternativas = typeof ingrediente === 'object' ? ingrediente.alternativas : [];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{nombre}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#690B22" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {descripcion ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <MaterialIcons name="description" size={20} color="#690B22" />
                  <Text style={styles.sectionTitle}>¿Qué es?</Text>
                </View>
                <Text style={styles.sectionText}>{descripcion}</Text>
              </View>
            ) : null}
            
            {impactoRenal ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <MaterialIcons name="warning" size={20} color="#690B22" />
                  <Text style={styles.sectionTitle}>Impacto en la salud renal</Text>
                </View>
                <Text style={styles.sectionText}>{impactoRenal}</Text>
              </View>
            ) : null}
            
            {alternativas && alternativas.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionTitleContainer}>
                  <MaterialIcons name="swap-horiz" size={20} color="#690B22" />
                  <Text style={styles.sectionTitle}>Alternativas recomendadas</Text>
                </View>
                {alternativas.map((alternativa, index) => (
                  <View key={index} style={styles.alternativaItem}>
                    <MaterialIcons name="check-circle" size={16} color="#4CAF50" style={styles.checkIcon} />
                    <Text style={styles.alternativaText}>{alternativa}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            
            {/* Si no hay información detallada */}
            {!descripcion && !impactoRenal && (!alternativas || alternativas.length === 0) && (
              <View style={styles.noInfoContainer}>
                <MaterialIcons name="info-outline" size={40} color="#999" />
                <Text style={styles.noInfoText}>
                  No hay información detallada disponible para este ingrediente.
                </Text>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
    flex: 1
  },
  closeButton: {
    padding: 5
  },
  content: {
    maxHeight: '70%'
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 8
  },
  sectionText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22
  },
  alternativaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 8,
  },
  alternativaText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
  },
  noInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noInfoText: {
    fontSize: 15,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16
  },
  button: {
    backgroundColor: '#690B22',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    marginTop: 16
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default IngredienteInfoModal;
