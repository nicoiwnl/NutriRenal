import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface ReferenceInfoModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const ReferenceInfoModal: React.FC<ReferenceInfoModalProps> = ({
  visible,
  onDismiss
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
        style={styles.modalWrapper}>
        <View style={styles.modalInner}>
          <Text style={styles.modalTitle}>Valores de Referencia</Text>
          <Text style={styles.modalSubtitle}>
            Umbrales para el semáforo nutricional en dieta renal
          </Text>
          
          <ScrollView 
            style={styles.modalScroll}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}>
            
            {/* Información sobre el semáforo */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>¿Cómo interpretar el semáforo?</Text>
              <Text style={styles.sectionDescription}>
                Los colores indican qué tan apropiado es el alimento para personas con enfermedad renal crónica:
              </Text>
              
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.colorCircle, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>Verde: Consumo libre</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.colorCircle, { backgroundColor: '#FFC107' }]} />
                  <Text style={styles.legendText}>Amarillo: Consumo moderado</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.colorCircle, { backgroundColor: '#F44336' }]} />
                  <Text style={styles.legendText}>Rojo: Consumo limitado</Text>
                </View>
              </View>
            </View>

            {/* Sodio */}
            <View style={styles.nutrientSection}>
              <View style={styles.nutrientHeader}>
                <MaterialIcons name="scatter-plot" size={24} color="#690B22" />
                <Text style={styles.nutrientTitle}>Sodio (mg por 100g/ml)</Text>
              </View>
              <View style={styles.thresholdContainer}>
                <View style={[styles.thresholdItem, styles.greenThreshold]}>
                  <Text style={styles.thresholdText}>Verde: Menos de 120 mg</Text>
                </View>
                <View style={[styles.thresholdItem, styles.yellowThreshold]}>
                  <Text style={styles.thresholdText}>Amarillo: 120 - 250 mg</Text>
                </View>
                <View style={[styles.thresholdItem, styles.redThreshold]}>
                  <Text style={styles.thresholdText}>Rojo: Más de 250 mg</Text>
                </View>
              </View>
              <Text style={styles.nutrientNote}>
                El exceso de sodio puede aumentar la presión arterial y retener líquidos.
              </Text>
            </View>

            {/* Potasio */}
            <View style={styles.nutrientSection}>
              <View style={styles.nutrientHeader}>
                <MaterialIcons name="scatter-plot" size={24} color="#690B22" />
                <Text style={styles.nutrientTitle}>Potasio (mg por 100g/ml)</Text>
              </View>
              <View style={styles.thresholdContainer}>
                <View style={[styles.thresholdItem, styles.greenThreshold]}>
                  <Text style={styles.thresholdText}>Verde: Menos de 200 mg</Text>
                </View>
                <View style={[styles.thresholdItem, styles.yellowThreshold]}>
                  <Text style={styles.thresholdText}>Amarillo: 200 - 350 mg</Text>
                </View>
                <View style={[styles.thresholdItem, styles.redThreshold]}>
                  <Text style={styles.thresholdText}>Rojo: Más de 350 mg</Text>
                </View>
              </View>
              <Text style={styles.nutrientNote}>
                Los riñones dañados pueden no eliminar el potasio correctamente.
              </Text>
            </View>

            {/* Fósforo */}
            <View style={styles.nutrientSection}>
              <View style={styles.nutrientHeader}>
                <MaterialIcons name="scatter-plot" size={24} color="#690B22" />
                <Text style={styles.nutrientTitle}>Fósforo (mg por 100g/ml)</Text>
              </View>
              <View style={styles.thresholdContainer}>
                <View style={[styles.thresholdItem, styles.greenThreshold]}>
                  <Text style={styles.thresholdText}>Verde: Menos de 100 mg</Text>
                </View>
                <View style={[styles.thresholdItem, styles.yellowThreshold]}>
                  <Text style={styles.thresholdText}>Amarillo: 100 - 170 mg</Text>
                </View>
                <View style={[styles.thresholdItem, styles.redThreshold]}>
                  <Text style={styles.thresholdText}>Rojo: Más de 170 mg</Text>
                </View>
              </View>
              <Text style={styles.nutrientNote}>
                El exceso de fósforo puede debilitar los huesos y calcificar los vasos sanguíneos.
              </Text>
            </View>

            {/* Recomendaciones generales */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Recomendaciones</Text>
              <View style={styles.recommendationItem}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.recommendationText}>
                  Priorice alimentos con semáforo verde
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <MaterialIcons name="warning" size={16} color="#FFC107" />
                <Text style={styles.recommendationText}>
                  Consuma con moderación alimentos amarillos
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <MaterialIcons name="cancel" size={16} color="#F44336" />
                <Text style={styles.recommendationText}>
                  Limite alimentos rojos a ocasiones especiales
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <MaterialIcons name="medical-services" size={16} color="#690B22" />
                <Text style={styles.recommendationText}>
                  Siempre consulte con su nefrólogo o nutricionista
                </Text>
              </View>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
          >
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
    padding: Platform.OS === 'web' ? 20 : 10,
  },
  modalInner: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 12,
    paddingHorizontal: 15,
    width: Platform.OS === 'web' ? '45%' : '90%',
    maxWidth: Platform.OS === 'web' ? 450 : 350,
    maxHeight: '85%',
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
  modalContent: {
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    borderRadius: 20,
  },
  modalTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 20,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    color: '#1B4D3E',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 5,
  },
  modalScroll: {
    maxHeight: Platform.OS === 'web' ? '65vh' : '65%',
    paddingRight: 5,
    marginVertical: 8,
  },
  scrollContentContainer: {
    paddingBottom: 15,
  },
  infoSection: {
    marginBottom: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 12,
  },
  legendContainer: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#333',
  },
  nutrientSection: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nutrientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nutrientTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 6,
    flex: 1,
  },
  thresholdContainer: {
    marginBottom: 8,
  },
  thresholdItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 3,
    borderLeftWidth: 3,
  },
  greenThreshold: {
    backgroundColor: '#E8F5E8',
    borderLeftColor: '#4CAF50',
  },
  yellowThreshold: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#FFC107',
  },
  redThreshold: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#F44336',
  },
  thresholdText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  nutrientNote: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 14,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  closeButton: {
    backgroundColor: '#690B22',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 0,
    marginHorizontal: -15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ReferenceInfoModal;
