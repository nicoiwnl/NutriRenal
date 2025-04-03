import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet , Platform} from 'react-native';
import { Modal, Portal } from 'react-native-paper';

interface UnitSelectorModalProps {
  visible: boolean;
  onDismiss: () => void;
  units: any[];
  selectedUnit: any;
  onSelectUnit: (unit: any) => void;
}

const UnitSelectorModal: React.FC<UnitSelectorModalProps> = ({
  visible,
  onDismiss,
  units,
  selectedUnit,
  onSelectUnit
}) => {
  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss}
        contentContainerStyle={styles.unitModalContent}
        style={styles.modalWrapper}>
        <View style={styles.modalInner}>
          <Text style={styles.modalTitle}>Seleccionar unidad de medida</Text>
          <ScrollView 
            style={styles.unitList} 
            contentContainerStyle={styles.unitListContent}>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit.id.toString()}
                style={[
                  styles.unitItem,
                  selectedUnit?.id === unit.id && styles.selectedUnitItem
                ]}
                onPress={() => {
                  onSelectUnit(unit);
                  onDismiss();
                }}
              >
                <Text style={[
                  styles.unitItemText,
                  selectedUnit?.id === unit.id && styles.selectedUnitItemText
                ]}>
                  {unit.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onDismiss}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalWrapper: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: Platform.OS === 'web' ? 0 : 10,
  },
  modalInner: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 12,
    paddingHorizontal: 15,
    width: Platform.OS === 'web' ? '50%' : '90%',
    maxWidth: 500,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  unitModalContent: {
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  unitList: {
    maxHeight: 300,
    width: '100%',
  },
  unitListContent: {
    paddingBottom: 0,
  },
  unitItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedUnitItem: {
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  unitItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedUnitItemText: {
    fontWeight: 'bold',
    color: '#690B22',
  },
  closeButton: {
    backgroundColor: '#690B22',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 0,
    marginHorizontal: -15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UnitSelectorModal;
