import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../../api';
import { getImageUrl } from '../../../config/apiConfig';
import { formatEnergia, formatMacronutrientes, formatMinerales } from '../../../utils/formatUtils';

// Usar las unidades de medida específicas de la base de datos
const UNIDADES_MEDIDA = [
  { id: 1, nombre: 'Taza', abreviacion: 'taza', equivalencia_ml: 200.00, es_volumen: true },
  { id: 2, nombre: 'Vaso', abreviacion: 'vaso', equivalencia_ml: 180.00, es_volumen: true },
  { id: 3, nombre: 'Plato hondo', abreviacion: 'plato', equivalencia_ml: 250.00, es_volumen: true },
  { id: 4, nombre: 'Plato normal', abreviacion: 'plato', equivalencia_ml: null, es_volumen: false },
  { id: 5, nombre: 'Cucharada sopera', abreviacion: 'cdas', equivalencia_ml: 10.00, es_volumen: true },
  { id: 6, nombre: 'Cucharadita de té', abreviacion: 'cdta', equivalencia_ml: 5.00, es_volumen: true },
  { id: 7, nombre: 'Cajita de fósforos', abreviacion: 'caja', equivalencia_ml: 30.00, es_volumen: false },
  { id: 8, nombre: 'Marraqueta', abreviacion: 'unidad', equivalencia_ml: 50.00, es_volumen: false }
];

/**
 * Componente para seleccionar una variante específica de un alimento
 */
const AlimentoSeleccionPrecisa = ({ 
  visible, 
  onClose, 
  alimentoGenerico, 
  onSelectAlimento,
  titulo = "Seleccionar tipo específico"
}) => {
  const [loading, setLoading] = useState(true);
  const [variantes, setVariantes] = useState([]);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select-food'); // 'select-food', 'select-unit'
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [cantidad, setCantidad] = useState('1');
  const [ajustedNutrientes, setAjustedNutrientes] = useState(null);
  const [unidadesMedida, setUnidadesMedida] = useState(UNIDADES_MEDIDA);
  
  // Función para cerrar el teclado - Added definition for the missing function
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Cargar unidades de medida y variantes cuando el modal se abre
  useEffect(() => {
    if (visible && alimentoGenerico) {
      buscarVariantesAlimento();
      setStep('select-food');
      setSelectedFood(null);
      setSelectedUnit(null);
      setCantidad('1');
    }
  }, [visible, alimentoGenerico]);

  // Función para buscar variantes específicas del alimento
  const buscarVariantesAlimento = async () => {
    if (!alimentoGenerico) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Buscar alimentos que contengan el término genérico
      const response = await api.get(`/alimentos/?search=${encodeURIComponent(alimentoGenerico)}`);
      
      if (response.data && response.data.length > 0) {
        // Ordenar por relevancia (los que contienen exactamente el término primero)
        const sortedData = response.data.sort((a, b) => {
          const aMatch = a.nombre.toLowerCase().includes(alimentoGenerico.toLowerCase());
          const bMatch = b.nombre.toLowerCase().includes(alimentoGenerico.toLowerCase());
          
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
        
        setVariantes(sortedData);
      } else {
        setVariantes([]);
      }
    } catch (err) {
      console.error('Error buscando variantes de alimento:', err);
      setError('No se pudieron cargar las variantes del alimento');
    } finally {
      setLoading(false);
    }
  };

  // Determinar qué unidades mostrar según el tipo de alimento
  useEffect(() => {
    if (selectedFood) {
      // Determinar si es líquido o sólido
      const esLiquido = selectedFood.nombre.toLowerCase().includes('leche') || 
                        selectedFood.nombre.toLowerCase().includes('jugo') || 
                        selectedFood.nombre.toLowerCase().includes('bebida') ||
                        selectedFood.nombre.toLowerCase().includes('agua') ||
                        selectedFood.nombre.toLowerCase().includes('sopa') ||
                        selectedFood.es_liquido;
      
      // Filtrar unidades según tipo (líquido o sólido)
      const unidadesFiltradas = UNIDADES_MEDIDA.filter(unidad => {
        // Para líquidos, preferir unidades de volumen
        if (esLiquido) return unidad.es_volumen;
        // Para panes, permitir marraqueta
        if (selectedFood.nombre.toLowerCase().includes('pan'))
          return unidad.id === 8 || !unidad.es_volumen;
        // Para el resto, mostrar unidades no volumétricas o universales
        return !unidad.es_volumen || unidad.id === 5 || unidad.id === 6;
      });
      
      // Establecer las unidades filtradas y seleccionar la primera
      setUnidadesMedida(unidadesFiltradas);
      setSelectedUnit(unidadesFiltradas[0]);
    }
  }, [selectedFood]);

  // Cuando el usuario selecciona un alimento específico
  const handleSelectFood = (item) => {
    if (!item.id) {
      // Si es el genérico sin ID, cierra directamente
      onSelectAlimento(item);
      return;
    }
    
    setSelectedFood(item);
    setStep('select-unit');
  };
  
  // Calcular nutrientes ajustados basados en la cantidad y unidad
  const calcularNutrientesAjustados = (alimento, unidad, cantidadValue) => {
    if (!alimento || !unidad) return;
    
    // Determinar si es líquido o sólido
    const esLiquido = alimento.nombre.toLowerCase().includes('leche') || 
                      alimento.nombre.toLowerCase().includes('jugo') || 
                      alimento.nombre.toLowerCase().includes('bebida') ||
                      alimento.nombre.toLowerCase().includes('agua') ||
                      alimento.nombre.toLowerCase().includes('sopa') ||
                      alimento.es_liquido;
    
    // Determinar factor de conversión según unidad de medida y tipo de alimento
    let factorConversion = 1;
    
    if (unidad.equivalencia_ml) {
      // Para líquidos y unidades con equivalencia en ml
      if (esLiquido) {
        // Base estándar es 100ml para líquidos
        factorConversion = (unidad.equivalencia_ml * cantidadValue) / 100;
      } else {
        // Para sólidos medidos en unidades volumétricas, usar densidad aproximada
        // La porción estándar es 100g, y asumimos densidad media
        factorConversion = (unidad.equivalencia_ml * cantidadValue) / 100;
      }
    } else {
      // Para unidades sin equivalencia ml (como unidad, porción)
      // Usar la cantidad directamente, asumiendo que cada unidad es aproximadamente 100g
      factorConversion = cantidadValue;
    }
    
    // Calcular valores nutricionales ajustados - solo enfocados en minerales
    const nutAjustados = {
      sodio: alimento.sodio * factorConversion,
      potasio: alimento.potasio * factorConversion,
      fosforo: alimento.fosforo * factorConversion
    };
    
    // Guardar la lógica de cálculo y la referencia de unidad base para referencia
    setAjustedNutrientes({
      ...nutAjustados,
      base_calculo: esLiquido ? '100ml' : '100g',
      factor_aplicado: factorConversion,
      es_liquido: esLiquido
    });
  };
  
  // Al cambiar la unidad o cantidad, recalcular
  useEffect(() => {
    if (selectedFood && selectedUnit) {
      calcularNutrientesAjustados(selectedFood, selectedUnit, parseFloat(cantidad) || 1);
    }
  }, [selectedFood, selectedUnit, cantidad]);
  
  // Confirmar selección con la cantidad y unidad
  const confirmarSeleccion = () => {
    if (!selectedFood || !selectedUnit) return;
    
    // Añadir información de cantidad y unidad al objeto del alimento
    const alimentoFinal = {
      ...selectedFood,
      cantidad_seleccionada: parseFloat(cantidad) || 1,
      unidad_seleccionada: selectedUnit,
      valores_ajustados: ajustedNutrientes
    };
    
    // Retornar el alimento con la nueva información
    onSelectAlimento(alimentoFinal);
  };

  // Modificar cualquier elemento de la lista que pueda mostrar un texto genérico
  const renderAlimentoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.alimentoItem} 
      onPress={() => handleSelectFood(item)}
    >
      <MaterialIcons 
        name="restaurant" 
        size={24} 
        color="#690B22" 
      />
      
      <Text style={styles.alimentoText}>
        {item.nombre}
      </Text>
      
      <MaterialIcons 
        name="chevron-right" 
        size={24} 
        color="#999" 
      />
    </TouchableOpacity>
  );

  // Render unit selection item with clear ml/g equivalence
  const renderUnidadItem = ({ item }) => {
    // Determine if the selected food is liquid
    const esLiquido = selectedFood?.nombre.toLowerCase().includes('leche') || 
                      selectedFood?.nombre.toLowerCase().includes('jugo') || 
                      selectedFood?.nombre.toLowerCase().includes('bebida') ||
                      selectedFood?.nombre.toLowerCase().includes('agua') ||
                      selectedFood?.nombre.toLowerCase().includes('sopa') ||
                      selectedFood?.es_liquido;
    
    // Reference unit for display
    const unidadReferencia = esLiquido ? 'ml' : 'g';
    
    // Create the equivalence text
    const equivalenciaText = item.equivalencia_ml 
      ? `(${item.equivalencia_ml} ${unidadReferencia})` 
      : '';
    
    return (
      <TouchableOpacity 
        style={[
          styles.unidadItem,
          selectedUnit?.id === item.id ? styles.unidadItemSelected : {}
        ]} 
        onPress={() => {
          setSelectedUnit(item);
          calcularNutrientesAjustados(selectedFood, item, parseFloat(cantidad) || 1);
        }}
      >
        <View style={styles.unidadItemContent}>
          <Text style={[
            styles.unidadText,
            selectedUnit?.id === item.id ? styles.unidadTextSelected : {}
          ]}>
            {item.nombre}
          </Text>
          <Text style={[
            styles.equivalenciaText,
            selectedUnit?.id === item.id ? styles.equivalenciaTextSelected : {}
          ]}>
            {equivalenciaText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // En el pie de página, si hay una opción genérica, cambiar su texto
  const renderFooter = () => (
    <TouchableOpacity
      style={styles.genericOption}
      onPress={() => handleSelectFood({ nombre: alimentoGenerico })}
    >
      <MaterialIcons name="add-circle" size={24} color="#690B22" />
      <Text style={styles.genericText}>
        Usar "{alimentoGenerico}" como está
      </Text>
    </TouchableOpacity>
  );
  
  // Mostrar la vista según el paso actual
  if (step === 'select-unit' && selectedFood) {
    // Determine if the selected food is liquid for displaying the reference unit
    const esLiquido = selectedFood.nombre.toLowerCase().includes('leche') || 
                      selectedFood.nombre.toLowerCase().includes('jugo') || 
                      selectedFood.nombre.toLowerCase().includes('bebida') ||
                      selectedFood.nombre.toLowerCase().includes('agua') ||
                      selectedFood.nombre.toLowerCase().includes('sopa') ||
                      selectedFood.es_liquido;
    
    // Reference unit for display
    const unidadReferencia = esLiquido ? 'ml' : 'g';

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Especificar cantidad</Text>
                <TouchableOpacity onPress={() => setStep('select-food')} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.selectedFoodContainer}>
                <Text style={styles.selectedFoodLabel}>Alimento seleccionado:</Text>
                <Text style={styles.selectedFoodName}>{selectedFood.nombre}</Text>
                <Text style={styles.baseReferenceText}>
                  Valores base por 100{unidadReferencia}
                </Text>
              </View>
              
              <View style={styles.cantidadContainer}>
                <Text style={styles.cantidadLabel}>Cantidad:</Text>
                <View style={styles.cantidadInputContainer}>
                  <TextInput
                    style={styles.cantidadInput}
                    value={cantidad}
                    onChangeText={(text) => {
                      setCantidad(text);
                      const cantidadValue = parseFloat(text) || 1;
                      calcularNutrientesAjustados(selectedFood, selectedUnit, cantidadValue);
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                    // Add blur on submit to dismiss keyboard after pressing Enter/Done
                    blurOnSubmit={true}
                  />
                  <Text style={styles.cantidadUnidad}>
                    {selectedUnit?.abreviacion}
                  </Text>
                </View>
                {selectedUnit?.equivalencia_ml && (
                  <View style={styles.equivalenciaContainer}>
                    <Text style={styles.equivalenciaLabel}>
                      Equivale a {selectedUnit.equivalencia_ml} {unidadReferencia}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.unidadesTitle}>Unidad de medida:</Text>
              <FlatList
                data={unidadesMedida}
                renderItem={renderUnidadItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal={true}
                style={styles.unidadesList}
                showsHorizontalScrollIndicator={false}
              />
              
              {ajustedNutrientes && (
                <View style={styles.resumenNutricional}>
                  <Text style={styles.resumenTitle}>
                    Valores nutricionales estimados:
                    <Text style={styles.resumenBase}> (base: 100{unidadReferencia})</Text>
                  </Text>
                  <View style={styles.resumenItem}>
                    <Text style={styles.resumenLabel}>Sodio:</Text>
                    <Text style={styles.resumenValue}>{formatMinerales(ajustedNutrientes.sodio)}</Text>
                  </View>
                  <View style={styles.resumenItem}>
                    <Text style={styles.resumenLabel}>Potasio:</Text>
                    <Text style={styles.resumenValue}>{formatMinerales(ajustedNutrientes.potasio)}</Text>
                  </View>
                  <View style={styles.resumenItem}>
                    <Text style={styles.resumenLabel}>Fósforo:</Text>
                    <Text style={styles.resumenValue}>{formatMinerales(ajustedNutrientes.fosforo)}</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setStep('select-food')}
                >
                  <Text style={styles.cancelButtonText}>Atrás</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton}
                  onPress={confirmarSeleccion}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{titulo}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.alimentoGenerico}>
              Alimento detectado: <Text style={styles.alimentoGenericoHighlight}>{alimentoGenerico}</Text>
            </Text>
            
            <View style={styles.instructionContainer}>
              <MaterialIcons name="info-outline" size={20} color="#1B4D3E" />
              <Text style={styles.instructionText}>
                Selecciona el tipo específico para obtener información nutricional precisa
              </Text>
            </View>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#690B22" />
                <Text style={styles.loadingText}>Buscando tipos de {alimentoGenerico}...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error-outline" size={40} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : variantes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={40} color="#9E9E9E" />
                <Text style={styles.emptyText}>No se encontraron variantes específicas</Text>
                <TouchableOpacity 
                  style={styles.genericButton}
                  onPress={() => handleSelectFood({ nombre: alimentoGenerico })}
                >
                  <Text style={styles.genericButtonText}>
                    Usar "{alimentoGenerico}" como está
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={variantes}
                keyExtractor={(item) => item.id.toString()}
                style={styles.list}
                renderItem={renderAlimentoItem}
                ListFooterComponent={renderFooter}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#F1E3D3',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
  },
  closeButton: {
    padding: 5,
  },
  alimentoGenerico: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    paddingHorizontal: 20,
    color: '#333',
  },
  alimentoGenericoHighlight: {
    fontWeight: 'bold',
    color: '#690B22',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  instructionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1B4D3E',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#690B22',
    fontSize: 16,
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#F44336',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#666',
    marginBottom: 20,
  },
  list: {
    maxHeight: 400,
    paddingHorizontal: 16,
  },
  varianteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  varianteImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 16,
  },
  varianteImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  varianteInfo: {
    flex: 1,
  },
  varianteNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  varianteData: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  genericButton: {
    backgroundColor: '#F1E3D3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  genericButtonText: {
    color: '#690B22',
    fontWeight: 'bold',
    fontSize: 16,
  },
  alimentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alimentoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  genericOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#F9F9F9',
  },
  genericText: {
    fontSize: 16,
    color: '#690B22',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Styles for unit selection step
  backButton: {
    padding: 5,
  },
  selectedFoodContainer: {
    padding: 16,
    backgroundColor: '#F1E3D3',
    borderRadius: 8,
    margin: 16,
  },
  selectedFoodLabel: {
    fontSize: 14,
    color: '#666',
  },
  selectedFoodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#690B22',
    marginTop: 4,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cantidadLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  cantidadInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 5,
  },
  cantidadInput: {
    fontSize: 16,
    color: '#333',
    width: 50,
    textAlign: 'center',
    padding: 5,
  },
  cantidadUnidad: {
    fontSize: 16,
    color: '#690B22',
    marginLeft: 5,
  },
  unidadesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  unidadesList: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  unidadItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginHorizontal: 4,
    minWidth: 100,
  },
  unidadItemSelected: {
    backgroundColor: '#690B22',
    borderColor: '#690B22',
    // Add shadow for more emphasis
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  unidadText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  unidadTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold', // Make the text bold when selected
  },
  equivalenciaText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  equivalenciaTextSelected: {
    color: '#FFD0D0', // Lighter pink that contrasts better with burgundy background
  },
  equivalenciaContainer: {
    marginLeft: 10,
  },
  equivalenciaLabel: {
    fontSize: 12,
    color: '#690B22',
    fontStyle: 'italic',
  },
  baseReferenceText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  resumenNutricional: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    margin: 16,
  },
  resumenTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resumenLabel: {
    fontSize: 14,
    color: '#333',
  },
  resumenValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#690B22',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#690B22',
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AlimentoSeleccionPrecisa;
