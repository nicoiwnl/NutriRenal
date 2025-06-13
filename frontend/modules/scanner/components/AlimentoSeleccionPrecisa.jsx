import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';
import { ENDPOINTS } from '../../../config/apiConfig';
import { formatEnergia, formatMacronutrientes, formatMinerales } from '../../../utils/formatUtils';

// Definición de unidades de medida predeterminadas como respaldo
const UNIDADES_MEDIDA_DEFAULT = [
  {
    id: 1,
    nombre: "Taza",
    abreviacion: "taza",
    equivalencia_ml: 200,
    equivalencia_g: 200,
    es_volumen: true
  },
  {
    id: 2,
    nombre: "Vaso",
    abreviacion: "vaso",
    equivalencia_ml: 180,
    equivalencia_g: 180,
    es_volumen: true
  },
  {
    id: 3,
    nombre: "Cucharada",
    abreviacion: "cdas",
    equivalencia_ml: 15,
    equivalencia_g: 15,
    es_volumen: true
  },
  {
    id: 4,
    nombre: "Cucharadita",
    abreviacion: "cdta",
    equivalencia_ml: 5, 
    equivalencia_g: 5,
    es_volumen: true
  },
  {
    id: 5,
    nombre: "Unidad mediana",
    abreviacion: "ud",
    equivalencia_ml: 100,
    equivalencia_g: 100,
    es_volumen: false
  },
  {
    id: 6,
    nombre: "Gramos",
    abreviacion: "g",
    equivalencia_ml: null,
    equivalencia_g: 1,
    es_volumen: false
  },
  {
    id: 7,
    nombre: "Mililitros",
    abreviacion: "ml",
    equivalencia_ml: 1,
    equivalencia_g: null,
    es_volumen: true
  }
];

/**
 * Componente para seleccionar una variante específica de un alimento
 */
const AlimentoSeleccionPrecisa = ({ 
  visible, 
  onClose, 
  alimentoGenerico, 
  onSelectAlimento,
  titulo = "Seleccionar tipo específico",
  analisisId = null,
  // Añadir prop para recibir unidades desde componente padre
  unidadesMedidaProp = null 
}) => {
  const [loading, setLoading] = useState(true);
  const [variantes, setVariantes] = useState([]);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select-food'); // 'select-food', 'select-unit'
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [cantidad, setCantidad] = useState('1');
  const [ajustedNutrientes, setAjustedNutrientes] = useState(null);
  // Inicializar con el valor por defecto
  const [unidadesMedida, setUnidadesMedida] = useState(unidadesMedidaProp || UNIDADES_MEDIDA_DEFAULT);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  
  // Add refs to track mounting state and API requests
  const isMounted = useRef(true);
  const controllerRef = useRef(null);
  const searchPerformed = useRef(false);
  
  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Cancel any in-flight requests
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);
  
  // Función para cerrar el teclado - Added definition for the missing function
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Cargar unidades de medida y variantes cuando el modal se abre
  useEffect(() => {
    if (visible && alimentoGenerico) {
      // Reset state for new search
      setStep('select-food');
      setSelectedFood(null);
      setSelectedUnit(null);
      setCantidad('1');
      searchPerformed.current = false;
      
      // Only search if we haven't already
      if (!searchPerformed.current) {
        buscarVariantesAlimento();
        searchPerformed.current = true;
      }
    }
  }, [visible, alimentoGenerico]);

  // Función para buscar variantes específicas del alimento
  const buscarVariantesAlimento = async () => {
    if (!alimentoGenerico) return;
    
    setLoading(true);
    setError(null);
    
    // Cancel any existing request
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    
    // Create a new abort controller
    controllerRef.current = new AbortController();
    
    try {
      // Buscar alimentos que contengan el término genérico
      const response = await api.get(
        `/alimentos/?search=${encodeURIComponent(alimentoGenerico)}`,
        { signal: controllerRef.current.signal }
      );
      
      // Only update state if component is still mounted
      if (isMounted.current) {
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
        setLoading(false);
      }
    } catch (err) {
      // If the request was aborted, don't update state
      if (err.name === 'AbortError') {
        console.log('Search request was canceled');
        return;
      }
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        console.error('Error buscando variantes de alimento:', err);
        setError('No se pudieron cargar las variantes del alimento');
        setLoading(false);
      }
    }
  };

  // Determinar qué unidades mostrar según el tipo de alimento
  useEffect(() => {
    if (selectedFood && unidadesMedida.length > 0) {
      // Determinar si es líquido o sólido
      const esLiquido = selectedFood.nombre.toLowerCase().includes('leche') || 
                        selectedFood.nombre.toLowerCase().includes('jugo') || 
                        selectedFood.nombre.toLowerCase().includes('bebida') ||
                        selectedFood.nombre.toLowerCase().includes('agua') ||
                        selectedFood.nombre.toLowerCase().includes('sopa') ||
                        selectedFood.es_liquido;
      
      // Filtrar unidades según tipo (líquido o sólido)
      const unidadesFiltradas = unidadesMedida.filter(unidad => {
        // Para líquidos, preferir unidades de volumen
        if (esLiquido) return unidad.es_volumen;
        // Para panes, permitir unidades especiales como "marraqueta" si existe
        if (selectedFood.nombre.toLowerCase().includes('pan'))
          return (unidad.nombre?.toLowerCase().includes('marraqueta') || !unidad.es_volumen);
        // Para el resto, mostrar unidades no volumétricas o universales
        return !unidad.es_volumen || unidad.nombre?.toLowerCase().includes('cucharada') || unidad.nombre?.toLowerCase().includes('cucharadita');
      });
      
      // Si el filtro dejó algunas unidades, usarlas; si no, usar todas
      const unidadesFinales = unidadesFiltradas.length > 0 ? unidadesFiltradas : unidadesMedida;
      
      // Establecer las unidades filtradas y seleccionar la primera
      setUnidadesMedida(unidadesFinales);
      setSelectedUnit(unidadesFinales[0]);
    }
  }, [selectedFood, unidadesMedida.length]);

  // Función para cargar dinámicamente las unidades de medida desde la base de datos
  const loadUnidadesMedida = async () => {
    // Si ya tenemos unidades pasadas como prop, usarlas directamente
    if (unidadesMedidaProp && unidadesMedidaProp.length > 0) {
      console.log("Usando unidades de medida proporcionadas por el componente padre:", unidadesMedidaProp.length);
      return unidadesMedidaProp;
    }
    
    setLoadingUnidades(true);
    try {
      // CORREGIDO: Usar la ruta correcta sin duplicar el prefijo "api/"
      const endpoint = ENDPOINTS.UNIDADES_MEDIDA || "unidades-medida/";
      
      console.log("Intentando cargar unidades de medida desde:", endpoint);
      
      const response = await api.get(endpoint);
      
      if (response.data && response.data.length > 0) {
        console.log(`Unidades cargadas desde la base de datos: ${response.data.length} unidades`);
        return response.data;
      } else {
        console.log("Usando unidades por defecto porque la API devolvió una lista vacía");
        return UNIDADES_MEDIDA_DEFAULT;
      }
    } catch (error) {
      console.log("Error cargando unidades de medida:", error);
      console.log("Detalles del error:", {
        mensaje: error.message,
        url: error.config?.url,
        metodo: error.config?.method,
        headers: error.config?.headers
      });
      // No mostrar alerta para evitar interrupción al usuario
      return UNIDADES_MEDIDA_DEFAULT;
    } finally {
      setLoadingUnidades(false);
    }
  };

  // Usar un efecto para cargar las unidades de medida al montar el componente
  useEffect(() => {
    const fetchUnidades = async () => {
      const unidades = await loadUnidadesMedida();
      if (isMounted.current) {
        console.log("Estableciendo unidades de medida:", unidades.length);
        setUnidadesMedida(unidades);
      }
    };
    
    fetchUnidades();
  }, [unidadesMedidaProp]); // Añadir dependencia para actualizar si cambia la prop

  // Función para seleccionar un alimento específico
  const handleSelectFood = (item) => {
    // Añadir logging para ver qué se está seleccionando
    console.log("Alimento seleccionado:", item);
    
    if (!item.id) {
      // Si es el genérico sin ID, cierra directamente
      console.log("Usando alimento genérico sin ID");
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
    
    // Utilizar el mismo método que RegistroItem para calcular factores de conversión
    if (esLiquido && unidad.equivalencia_ml) {
      factorConversion = (Number(unidad.equivalencia_ml) * cantidadValue) / 100;
    } else if (!esLiquido && unidad.equivalencia_g) {
      factorConversion = (Number(unidad.equivalencia_g) * cantidadValue) / 100;
    } else if (unidad.equivalencia_ml) {
      // Fallback a ml si es la única equivalencia disponible
      factorConversion = (Number(unidad.equivalencia_ml) * cantidadValue) / 100;
    } else {
      // Para unidades sin equivalencia, usar la cantidad directamente
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
  
  // Función para guardar la selección específica en la BD
  const guardarSeleccionEspecifica = async (alimentoSeleccionado) => {
    // Add a safety check to prevent errors
    if (!analisisId || typeof analisisId !== 'string') {
      console.log("No se puede guardar la selección: ID de análisis no válido", analisisId);
      return null;
    }
    
    try {
      // Obtener ID de usuario
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        console.log("No se encontró información del usuario");
        return;
      }
      
      const { persona_id } = JSON.parse(userData);
      if (!persona_id) {
        console.log("No se encontró ID de persona");
        return;
      }
      
      // Crear objeto de selección específica
      const seleccion = {
        analisis: analisisId,
        persona: persona_id,
        alimento_original: alimentoGenerico,
        alimento_nombre: alimentoSeleccionado.nombre,
        alimento_seleccionado: alimentoSeleccionado.id,
        unidad_nombre: selectedUnit?.nombre || "porción",
        unidad_medida: selectedUnit?.id || 1,
        cantidad: cantidad || "1.00"
      };
      
      console.log("Guardando selección específica:", seleccion);
      
      // Use ENDPOINTS.SELECCIONES_ANALISIS or fallback to relative path
      const endpoint = ENDPOINTS.SELECCIONES_ANALISIS || '/selecciones-analisis/';
      
      // Enviar a la API usando path relativo (no URL absoluta)
      const response = await api.post(endpoint, seleccion);
      
      console.log("Selección guardada exitosamente:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("Error al guardar selección específica:", error);
      console.error("Detalles:", error.response?.data);
      return null;
    }
  };

  // Confirmar selección con la cantidad y unidad
  const confirmarSeleccion = async () => {
    if (!selectedFood || !selectedUnit) {
      console.error("No se puede confirmar: falta alimento o unidad");
      return;
    }
    
    // Añadir información de cantidad y unidad al objeto del alimento
    const alimentoFinal = {
      ...selectedFood,
      cantidad_seleccionada: parseFloat(cantidad) || 1,
      unidad_seleccionada: selectedUnit,
      valores_ajustados: ajustedNutrientes
    };
    
    console.log("Confirmando selección de alimento:", alimentoFinal);
    
    // Guardar la selección en la BD si hay analisisId
    if (analisisId) {
      try {
        await guardarSeleccionEspecifica(alimentoFinal);
      } catch (error) {
        console.error("Error al guardar selección:", error);
        // Continuar aunque falle el guardado
      }
    }
    
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
    
    // Create the equivalence text based on the available properties
    let equivalenciaText = '';
    
    if (item.equivalencia_ml && esLiquido) {
      // For liquids, use ml equivalence
      equivalenciaText = `(${item.equivalencia_ml} ml)`;
    } else if (item.equivalencia_g && !esLiquido) {
      // For solids, use g equivalence if available
      equivalenciaText = `(${item.equivalencia_g} g)`;
    } else if (item.equivalencia_ml && !esLiquido) {
      // If only ml equivalence is available for solids, still show it
      equivalenciaText = `(${item.equivalencia_ml} ml)`;
    }
    
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
          {equivalenciaText ? (
            <Text style={[
              styles.equivalenciaText,
              selectedUnit?.id === item.id ? styles.equivalenciaTextSelected : {}
            ]}>
              {equivalenciaText}
            </Text>
          ) : null}
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

    // Mostrar vista estándar sin mensaje de carga ya que tenemos unidades por defecto
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
              
              {/* Replace horizontal FlatList with vertical ScrollView */}
              <ScrollView 
                style={styles.unidadesList}
                contentContainerStyle={styles.unidadesListContent}
                showsVerticalScrollIndicator={true}
              >
                {unidadesMedida.map((item) => {
                  // Get equivalence text based on unit properties
                  let equivalenciaText = '';
                  
                  if (item.equivalencia_ml && esLiquido) {
                    equivalenciaText = `(${item.equivalencia_ml} ml)`;
                  } else if (item.equivalencia_g && !esLiquido) {
                    equivalenciaText = `(${item.equivalencia_g} g)`;
                  } else if (item.equivalencia_ml && !esLiquido) {
                    equivalenciaText = `(${item.equivalencia_ml} ml)`;
                  }
                  
                  return (
                    <TouchableOpacity
                      key={item.id.toString()}
                      style={[
                        styles.verticalUnitItem,
                        selectedUnit?.id === item.id && styles.verticalUnitItemSelected
                      ]}
                      onPress={() => {
                        setSelectedUnit(item);
                        calcularNutrientesAjustados(selectedFood, item, parseFloat(cantidad) || 1);
                      }}
                    >
                      <Text style={[
                        styles.verticalUnitText,
                        selectedUnit?.id === item.id && styles.verticalUnitTextSelected
                      ]}>
                        {item.nombre}
                      </Text>
                      {equivalenciaText && (
                        <Text style={[
                          styles.verticalEquivalenciaText,
                          selectedUnit?.id === item.id && styles.verticalEquivalenciaTextSelected
                        ]}>
                          {equivalenciaText}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              
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
    maxHeight: 200,
    width: '100%',
    paddingHorizontal: 16,
  },
  unidadesListContent: {
    paddingBottom: 8,
  },
  verticalUnitItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  verticalUnitItemSelected: {
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  verticalUnitText: {
    fontSize: 16,
    color: '#333',
  },
  verticalUnitTextSelected: {
    fontWeight: 'bold',
    color: '#690B22',
  },
  verticalEquivalenciaText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  verticalEquivalenciaTextSelected: {
    color: '#690B22',
    opacity: 0.7,
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
  resumenBase: {
    fontWeight: 'normal',
    fontStyle: 'italic',
    fontSize: 12,
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
