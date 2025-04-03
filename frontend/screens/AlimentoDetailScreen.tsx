import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Divider, Modal, Portal, Provider, List } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Keep @react-native-picker/picker for iOS
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// Interface for nutritional values
interface NutritionalValues {
  [key: string]: number | null;
}

// Interface for unit of measure
interface UnidadMedida {
  id: number;
  nombre: string;
  equivalencia_ml: number | null;
  equivalencia_g: number | null;
  es_volumen: boolean;
}

import AlimentoHeader from '../modules/alimentos/components/AlimentoHeader';
import UnitSelector from '../modules/alimentos/components/UnitSelector';
import NutrientSemaphore from '../modules/alimentos/components/NutrientSemaphore';
import RegistroButton from '../modules/alimentos/components/RegistroButton';
import UnitSelectorModal from '../modules/alimentos/components/UnitSelectorModal';
import NutritionalInfoModal from '../modules/alimentos/components/NutritionalInfoModal';
import useAlimentoDetail from '../modules/alimentos/hooks/useAlimentoDetail';

export default function AlimentoDetailScreen({ route, navigation }) {
  const { alimentoId } = route.params;
  
  // Usar el hook personalizado para toda la lógica
  const {
    loading,
    alimento,
    unidadesMedida,
    selectedUnit,
    setSelectedUnit,
    currentValues,
    categoryName,
    showNutritionalInfo,
    setShowNutritionalInfo,
    showUnitSelector,
    setShowUnitSelector,
    setSelectedPortion,
    showRegistroModal,
    setShowRegistroModal,
    formatNumber,
    getSemaphoreColor
  } = useAlimentoDetail(alimentoId);

  // Si está cargando, mostrar pantalla de carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8E8D8' }}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={{ marginTop: 10, color: '#690B22' }}>Cargando información del alimento...</Text>
      </View>
    );
  }

  // Si no se encontró el alimento, mostrar error
  if (!alimento) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F8E8D8' }}>
        <MaterialIcons name="error-outline" size={60} color="#690B22" />
        <Text style={{ fontSize: 16, color: '#1B4D3E', marginTop: 10, textAlign: 'center' }}>
          No se pudo cargar la información del alimento
        </Text>
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#690B22', 
            paddingHorizontal: 20, 
            paddingVertical: 10, 
            borderRadius: 8, 
            marginTop: 20 
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Obtener nutrientes importantes y sus colores
  const sodio = currentValues.sodio || 0;
  const potasio = currentValues.potasio || 0;
  const fosforo = currentValues.fosforo || 0;
  
  const sodioColor = getSemaphoreColor(sodio, 120, 500);
  const potasioColor = getSemaphoreColor(potasio, 200, 800);
  const fosforoColor = getSemaphoreColor(fosforo, 100, 300);

  return (
    <Provider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8E8D8' }}>
        <ScrollView>
          <Card style={{ margin: 10, elevation: 3, backgroundColor: '#FFFFFF', borderRadius: 10 }}>
            <Card.Content>
              {/* Cabecera del alimento */}
              <AlimentoHeader
                nombre={alimento.nombre}
                categoryName={categoryName}
                energia={currentValues.energia}
                proteinas={currentValues.proteinas}
                hidratos_carbono={currentValues.hidratos_carbono}
                lipidos_totales={currentValues.lipidos_totales}
                formatNumber={formatNumber}
              />
              
              {/* Selector de unidad */}
              <UnitSelector
                selectedUnit={selectedUnit}
                onPress={() => setShowUnitSelector(true)}
              />
              
              <Divider style={{ marginVertical: 15, height: 1 }} />

              {/* Semáforo de nutrientes */}
              <NutrientSemaphore
                sodio={sodio}
                potasio={potasio}
                fosforo={fosforo}
                sodioColor={sodioColor}
                potasioColor={potasioColor}
                fosforoColor={fosforoColor}
                formatNumber={formatNumber}
              />

              {/* Botón para registrar consumo */}
              <RegistroButton
                onPress={() => {
                  // Al abrir el modal, establecer la porción seleccionada actual
                  if (selectedUnit) {
                    setSelectedPortion(selectedUnit);
                  }
                  setShowRegistroModal(true);
                }}
              />

              {/* Botón para ver información nutricional completa */}
              <TouchableOpacity
                style={{ 
                  backgroundColor: '#690B22', 
                  padding: 12, 
                  borderRadius: 8, 
                  alignItems: 'center', 
                  marginTop: 15 
                }}
                onPress={() => setShowNutritionalInfo(true)}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  Ver información nutricional completa
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Botón flotante de información */}
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: 15,
            right: 15,
            backgroundColor: '#690B22',
            width: Platform.OS === 'web' ? 44 : 40,
            height: Platform.OS === 'web' ? 44 : 40,
            borderRadius: Platform.OS === 'web' ? 22 : 20,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            zIndex: 999,
          }}
          onPress={() => setShowReferenceInfo(true)}
        >
          <MaterialIcons name="help" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Modal de selección de unidad */}
        <UnitSelectorModal
          visible={showUnitSelector}
          onDismiss={() => setShowUnitSelector(false)}
          units={unidadesMedida}
          selectedUnit={selectedUnit}
          onSelectUnit={(unit) => {
            setSelectedUnit(unit);
            setSelectedPortion(unit);
          }}
        />

        {/* Modal de información nutricional */}
        <NutritionalInfoModal
          visible={showNutritionalInfo}
          onDismiss={() => setShowNutritionalInfo(false)}
          alimento={currentValues}
          selectedUnit={selectedUnit}
          sodioColor={sodioColor}
          potasioColor={potasioColor}
          fosforoColor={fosforoColor}
          formatNumber={formatNumber}
        />

        {/* Aquí van los demás modales (registro de consumo, información de referencia) */}
        {/* Se pueden implementar como componentes separados similares a los anteriores */}
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8', // Lighter skin tone background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8E8D8', // Match container background
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8E8D8', // Match container background
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
  },
  errorText: {
    fontSize: 16,
    color: '#1B4D3E',
    marginTop: 10,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    margin: 10,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 24 : 20, // Tamaño más pequeño en móvil
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  category: {
    fontSize: 16,
    color: '#690B22',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 15,
    height: 1,
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  energyLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  energyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginLeft: 10,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  semaphoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  semaphoreItem: {
    alignItems: 'center',
  },
  semaphoreCircle: {
    width: Platform.OS === 'web' ? 70 : 60,
    height: Platform.OS === 'web' ? 70 : 60,
    borderRadius: Platform.OS === 'web' ? 35 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  semaphoreValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
  semaphoreLabel: {
    fontSize: Platform.OS === 'web' ? 12 : 11,
    color: '#666',
  },
  fullInfoButton: {
    backgroundColor: '#690B22',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  fullInfoButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: 'transparent', // Transparente para usar el color del modalInner
    margin: 0, // Sin margen adicional
    padding: 0, // Sin padding adicional
    borderRadius: 20, // Coincidir con modalInner
  },
  
  // Add content container style for scroll view
  scrollContentContainer: {
    paddingBottom: 20, // More padding to ensure all content is visible
  },
  
  modalTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 20, // Título un poco más grande
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    marginTop: 10, // Espacio en la parte superior
    marginBottom: 15,
  },
  
  modalSubtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#1B4D3E',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  modalScroll: {
    maxHeight: Platform.OS === 'web' ? '60vh' : '60%', // Explicit height for iOS
    paddingRight: 5,
    marginVertical: 8,
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
    padding: 14, // Botón más alto
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12, // Más espacio antes del botón
    marginBottom: 0,
    marginHorizontal: -15, // Extender a los bordes de modalInner
    borderBottomLeftRadius: 20, // Coincidir con el modalInner
    borderBottomRightRadius: 20,
  },
  closeButtonText: {
    color: '#FFFFFF', // Ensure text color is explicitly white
    fontWeight: 'bold',
    fontSize: 16, // Slightly larger for better visibility
  },
  unitsContainer: {
    marginVertical: 12,
  },
  unitsLabel: {
    fontSize: 16,
    color: '#1B4D3E',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E07A5F',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: Platform.OS === 'web' ? 12 : 10,
    marginVertical: 5,
  },
  
  dropdownText: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#333',
  },
  
  unitModalContent: {
    margin: 0,
    padding: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center', 
    maxWidth: '100%',
  },
  
  unitList: {
    maxHeight: 300,
    width: '100%', // Ancho completo dentro de modalInner
  },
  
  // Add content container style for unit list
  unitListContent: {
    paddingBottom: 0, // No padding at the bottom
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
  
  selectedUnitInfo: {
    backgroundColor: '#F8E8D8', // Match container background instead of #F1E3D3
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  unitEquivalenceText: {
    color: '#1B4D3E',
    fontStyle: 'italic',
  },
  modalWrapper: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    padding: Platform.OS === 'web' ? 0 : 10, // Padding solo en móvil
  },
  
  modalInner: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 12,
    paddingHorizontal: 15,
    // Base styles for all platforms
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
  
  // Estilo específico para web
  modalInnerWeb: {
    width: '65%',
    minWidth: 400,
    maxWidth: 550,
  },
  
  // Nuevo: estilo específico para móvil
  modalInnerMobile: {
    width: '95%', // Casi ancho completo en móvil
    maxWidth: 400, // Limitar ancho máximo
    maxHeight: '85%', // Limitar altura para que no ocupe toda la pantalla
  },
  
  // Ajustar scroll para móvil
  modalScroll: {
    maxHeight: Platform.OS === 'web' ? '60vh' : '60%',
    paddingRight: 5,
    marginVertical: 8,
  },
  
  // Ajustar tamaños de texto para móvil
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
  
  // Adaptar las unidades para pantalla más pequeña
  unitsContainer: {
    marginVertical: 12,
  },
  
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E07A5F',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: Platform.OS === 'web' ? 12 : 10,
    marginVertical: 5,
  },
  
  dropdownText: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#333',
  },
  
  // Ajustar los íconos circulares para que sean proporcionales en móvil
  semaphoreCircle: {
    width: Platform.OS === 'web' ? 70 : 60,
    height: Platform.OS === 'web' ? 70 : 60,
    borderRadius: Platform.OS === 'web' ? 35 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  semaphoreValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
  
  semaphoreLabel: {
    fontSize: Platform.OS === 'web' ? 12 : 11,
    color: '#666',
  },
  
  // Ajustar referencia para modal de información
  referenceTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 8,
  },
  
  referenceDescription: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    color: '#333',
    lineHeight: Platform.OS === 'web' ? 20 : 18,
    marginBottom: 12,
  },
  
  // Mejorar la visualización de filas en la tabla de referencia
  referenceRow: {
    flexDirection: 'row', // Cambiado a row para todos los dispositivos
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  // Ajustar los botones para que sean más accesibles en móvil
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Platform.OS === 'web' ? 12 : 10,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 10,
  },
  
  // Hacer el botón flotante más pequeño en móvil para que no estorbe
  infoButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 15 : 15,
    right: Platform.OS === 'web' ? 15 : 15,
    backgroundColor: '#690B22',
    width: Platform.OS === 'web' ? 44 : 40,
    height: Platform.OS === 'web' ? 44 : 40,
    borderRadius: Platform.OS === 'web' ? 22 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
  },
  
  // Nuevos estilos para la sección de umbrales del semáforo
  nutrientThresholdContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  
  nutrientTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  nutrientThresholdTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginLeft: 8,
  },
  
  thresholdValues: {
    marginLeft: 26, // Alineado con el texto del título
  },
  
  thresholdText: {
    fontSize: 14,
    marginVertical: 2,
    paddingVertical: 2,
    paddingLeft: 8,
  },
  
  thresholdGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    color: '#2E7D32',
  },
  
  thresholdYellow: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    color: '#F57F17',
  },
  
  thresholdRed: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    color: '#C62828',
  },
  
  // ...existing styles...
  // Styles for the food consumption registration form
  registroFormScroll: {
    maxHeight: 400,
  },
  registroForm: {
    marginTop: 15,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  unitBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F0E8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  unitBoxText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  unitChangeButton: {
    backgroundColor: '#F1E3D3',
    padding: 8,
    borderRadius: 20,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F0E8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  notasInput: {
    backgroundColor: '#F8F0E8',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E07A5F',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  consumoSummary: {
    backgroundColor: '#F1E3D3',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    backgroundColor: '#999',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registrarButton: {
    backgroundColor: '#4CAF50',
    marginVertical: 16,
    width: '100%',
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 0,
  },
  
  registrarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  registrarButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    textAlign: 'center',
  },
});
