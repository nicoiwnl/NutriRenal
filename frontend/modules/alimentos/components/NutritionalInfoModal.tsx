import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Modal, Portal, Divider } from 'react-native-paper';

interface NutritionalInfoModalProps {
  visible: boolean;
  onDismiss: () => void;
  alimento: any;
  selectedUnit: any;
  sodioColor: string;
  potasioColor: string;
  fosforoColor: string;
  formatNumber: (value: any, decimals?: number) => string;
}

const NutritionalInfoModal: React.FC<NutritionalInfoModalProps> = ({
  visible,
  onDismiss,
  alimento,
  selectedUnit,
  sodioColor,
  potasioColor,
  fosforoColor,
  formatNumber
}) => {
  // Si no hay alimento, no mostrar nada
  if (!alimento) return null;
  
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
        style={styles.modalWrapper}>
        <View style={styles.modalInner}>
          <Text style={styles.modalTitle}>Información Nutricional Completa</Text>
          <Text style={styles.modalSubtitle}>
            Por {selectedUnit?.id === 0 ? '100ml/g' : selectedUnit?.nombre}
          </Text>
          
          <ScrollView 
            style={styles.modalScroll}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={true}>
            <NutrientItem label="Energía" value={`${formatNumber(alimento.energia, 1)} kcal`} />
            <NutrientItem label="Humedad" value={`${formatNumber(alimento.humedad, 1)} g`} />
            <NutrientItem label="Cenizas" value={`${formatNumber(alimento.cenizas, 1)} g`} />
            <NutrientItem label="Proteínas" value={`${formatNumber(alimento.proteinas, 1)} g`} />
            <NutrientItem label="Carbohidratos" value={`${formatNumber(alimento.hidratos_carbono, 1)} g`} />
            <NutrientItem label="Azúcares" value={`${formatNumber(alimento.azucares_totales, 1)} g`} />
            <NutrientItem label="Fibra dietética" value={`${formatNumber(alimento.fibra_dietetica, 1)} g`} />
            <NutrientItem label="Lípidos totales" value={`${formatNumber(alimento.lipidos_totales, 1)} g`} />
            <NutrientItem label="Ác. grasos saturados" value={`${formatNumber(alimento.acidos_grasos_saturados, 1)} g`} />
            <NutrientItem label="Ác. grasos monoinsaturados" value={`${formatNumber(alimento.acidos_grasos_monoinsaturados, 1)} g`} />
            <NutrientItem label="Ác. grasos poliinsaturados" value={`${formatNumber(alimento.acidos_grasos_poliinsaturados, 1)} g`} />
            <NutrientItem label="Ác. grasos trans" value={`${formatNumber(alimento.acidos_grasos_trans, 1)} g`} />
            <NutrientItem label="Colesterol" value={`${formatNumber(alimento.colesterol, 1)} mg`} />
            
            <Divider style={styles.modalDivider} />
            <Text style={styles.sectionHeader}>Minerales</Text>

            <NutrientItem 
              label="Sodio" 
              value={`${formatNumber(alimento.sodio, 1)} mg`} 
              color={sodioColor}
              highlight 
            />
            <NutrientItem 
              label="Potasio" 
              value={`${formatNumber(alimento.potasio, 1)} mg`} 
              color={potasioColor}
              highlight 
            />
            <NutrientItem 
              label="Fósforo" 
              value={`${formatNumber(alimento.fosforo, 1)} mg`} 
              color={fosforoColor}
              highlight 
            />
            <NutrientItem label="Calcio" value={`${formatNumber(alimento.calcio, 1) || 'N/D'} mg`} />
            <NutrientItem label="Hierro" value={`${formatNumber(alimento.hierro, 1) || 'N/D'} mg`} />
            <NutrientItem label="Magnesio" value={`${formatNumber(alimento.magnesio, 1) || 'N/D'} mg`} />
            <NutrientItem label="Zinc" value={`${formatNumber(alimento.zinc, 1) || 'N/D'} mg`} />
            <NutrientItem label="Cobre" value={`${formatNumber(alimento.cobre, 1) || 'N/D'} mg`} />
            <NutrientItem label="Selenio" value={`${formatNumber(alimento.selenio, 1) || 'N/D'} µg`} />

            <Divider style={styles.modalDivider} />
            <Text style={styles.sectionHeader}>Vitaminas</Text>
            
            <NutrientItem label="Vitamina A" value={`${formatNumber(alimento.vitamina_A, 1) || 'N/D'} μg`} />
            <NutrientItem label="Vitamina C" value={`${formatNumber(alimento.vitamina_C, 1) || 'N/D'} mg`} />
            <NutrientItem label="Vitamina D" value={`${formatNumber(alimento.vitamina_D, 1) || 'N/D'} μg`} />
            <NutrientItem label="Vitamina E" value={`${formatNumber(alimento.vitamina_E, 1) || 'N/D'} mg`} />
            <NutrientItem label="Vitamina K" value={`${formatNumber(alimento.vitamina_K, 1) || 'N/D'} μg`} />
            <NutrientItem label="Vitamina B1 (Tiamina)" value={`${formatNumber(alimento.vitamina_B1, 1) || 'N/D'} mg`} />
            <NutrientItem label="Vitamina B2 (Riboflavina)" value={`${formatNumber(alimento.vitamina_B2, 1) || 'N/D'} mg`} />
            <NutrientItem label="Niacina" value={`${formatNumber(alimento.niacina, 1) || 'N/D'} mg`} />
            <NutrientItem label="Vitamina B6" value={`${formatNumber(alimento.vitamina_B6, 1) || 'N/D'} mg`} />
            <NutrientItem label="Ácido pantoténico" value={`${formatNumber(alimento.acido_pantotenico, 1) || 'N/D'} mg`} />
            <NutrientItem label="Vitamina B12" value={`${formatNumber(alimento.vitamina_B12, 1) || 'N/D'} μg`} />
            <NutrientItem label="Folatos" value={`${formatNumber(alimento.folatos, 1) || 'N/D'} μg`} />
            
            {alimento.alcohol > 0 && (
              <>
                <Divider style={styles.modalDivider} />
                <Text style={styles.sectionHeader}>Otros</Text>
                <NutrientItem label="Alcohol" value={`${formatNumber(alimento.alcohol, 1)} g`} />
              </>
            )}
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

// Componente para cada ítem de nutriente
const NutrientItem = ({ label, value, color, highlight = false }) => (
  <View style={[styles.nutritionItem, highlight && styles.highlightItem]}>
    <Text style={styles.nutrientLabel}>{label}</Text>
    <Text style={[
      styles.nutrientValue, 
      color && { color }
    ]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'transparent',
    margin: 0,
    padding: 0,
    borderRadius: 20,
  },
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
    width: Platform.OS === 'web' ? '65%' : '95%',
    maxWidth: 550,
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
  modalTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 20,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#1B4D3E',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    maxHeight: Platform.OS === 'web' ? '60vh' : '60%',
    paddingRight: 5,
    marginVertical: 8,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  highlightItem: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  nutrientLabel: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#333',
    flex: 1,
  },
  nutrientValue: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
    paddingLeft: 10,
    textAlign: 'right',
  },
  modalDivider: {
    marginVertical: 12,
    backgroundColor: '#E07A5F',
    height: 1.5,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 10,
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

export default NutritionalInfoModal;
