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

export default function AlimentoDetailScreen({ route, navigation }) {
  const { alimentoId } = route.params;
  const [loading, setLoading] = useState(true);
  const [alimento, setAlimento] = useState(null);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnidadMedida | null>(null);
  const [baseValues, setBaseValues] = useState<NutritionalValues>({});
  const [adjustedValues, setAdjustedValues] = useState<NutritionalValues>({});
  const [showNutritionalInfo, setShowNutritionalInfo] = useState(false);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  // Add state for category name
  const [categoryName, setCategoryName] = useState<string>('');
  
  // Valor por defecto (default unit for 100ml/g)
  const defaultUnit: UnidadMedida = {
    id: 0,  // This will be converted to string in the Picker
    nombre: '100ml/g (valor por defecto)',
    equivalencia_ml: 100,
    equivalencia_g: 100,
    es_volumen: true
  };

  // Agregar estos nuevos estados para el registro de consumo
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [notasConsumo, setNotasConsumo] = useState('');
  const [fechaConsumo, setFechaConsumo] = useState(new Date());
  const [registrando, setRegistrando] = useState(false);
  const [consumptionDate, setConsumptionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState(null); // Unidad de medida elegida
  const [nutritionSummary, setNutritionSummary] = useState({
    calorias: 0,
    sodio: 0,
    potasio: 0,
    fosforo: 0,
  });

  // Agregar estado para el modal de información de referencia
  const [showReferenceInfo, setShowReferenceInfo] = useState(false);

  useEffect(() => {
    // Fetch food details
    const fetchAlimento = async () => {
      try {
        console.log(`Fetching alimento with ID: ${alimentoId}`);
        
        // Check if alimentoId is valid
        if (!alimentoId) {
          console.error('Error: alimentoId is undefined or null');
          Alert.alert('Error', 'ID de alimento no válido');
          setLoading(false);
          return;
        }
        
        // Log the full URL for debugging
        console.log(`API Request URL: ${api.defaults.baseURL}/alimentos/${alimentoId}/`);
        
        const response = await api.get(`/alimentos/${alimentoId}/`);
        console.log('API Response:', response.status);
        setAlimento(response.data);
        setBaseValues(response.data);
      } catch (error) {
        console.error('Error al obtener datos del alimento:', error);
        
        // Add more detailed error information
        if (error.response) {
          console.error('Error response status:', error.response.status);
          console.error('Error response data:', error.response.data);
          
          // Show more specific error message based on status code
          if (error.response.status === 404) {
            Alert.alert('Error', 'El alimento solicitado no fue encontrado. Verifique que el ID sea correcto.');
          } else {
            Alert.alert('Error', `No se pudieron cargar los datos del alimento (${error.response.status})`);
          }
        } else {
          Alert.alert('Error', 'No se pudieron cargar los datos del alimento. Compruebe su conexión.');
        }
      }
    };

    // Fetch units of measure
    const fetchUnidades = async () => {
      try {
        const response = await api.get('/unidades-medida/');
        
        // Log the response to see what we're getting
        console.log('Unidades medida from API:', response.data.slice(0, 3)); // Log first 3 for brevity
        
        // Make sure all units have proper ID types
        const processedUnits = response.data.map(unit => ({
          ...unit,
          id: typeof unit.id === 'string' ? parseInt(unit.id, 10) : unit.id
        }));
        
        // Add default unit at the top
        setUnidadesMedida([defaultUnit, ...processedUnits]);
        setSelectedUnit(defaultUnit);
      } catch (error) {
        console.error('Error al obtener unidades de medida:', error);
        // Still add the default unit even if API fails
        setUnidadesMedida([defaultUnit]);
        setSelectedUnit(defaultUnit);
      } finally {
        setLoading(false);
      }
    };

    fetchAlimento();
    fetchUnidades();
  }, [alimentoId]);

  // New effect to fetch category name when alimento changes
  useEffect(() => {
    if (alimento && alimento.categoria) {
      // Check if the category is just an ID
      if (typeof alimento.categoria === 'number' || typeof alimento.categoria === 'string') {
        // Fetch category by ID
        const fetchCategory = async () => {
          try {
            setCategoryName('Cargando categoría...');
            const response = await api.get(`/categorias-alimento/${alimento.categoria}/`);
            if (response.data && response.data.nombre) {
              setCategoryName(response.data.nombre);
            } else {
              setCategoryName('Categoría desconocida');
            }
          } catch (error) {
            console.error('Error fetching category:', error);
            setCategoryName('Categoría desconocida');
          }
        };
        fetchCategory();
      } else if (typeof alimento.categoria === 'object' && alimento.categoria.nombre) {
        // Category object already has a name
        setCategoryName(alimento.categoria.nombre);
      } else {
        setCategoryName('Sin categoría');
      }
    } else {
      setCategoryName('Sin categoría');
    }
  }, [alimento]);

  // Function to safely convert a value to a number and format it
  const formatNumber = (value: any, decimals = 0) => {
    if (value === null || value === undefined) return '0';
    // Convert string to number if necessary
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    // Check if it's a valid number
    if (isNaN(numValue)) return '0';
    return numValue.toFixed(decimals);
  };

  // Calculate adjusted nutritional values based on selected unit
  useEffect(() => {
    if (alimento && selectedUnit && selectedUnit.id !== 0) {
      const adjusted = calculateAdjustedValues(alimento, selectedUnit);
      setAdjustedValues(adjusted);
    } else {
      // If default unit is selected, use base values
      setAdjustedValues(baseValues);
    }
  }, [selectedUnit, alimento, baseValues]);

  // Function to calculate adjusted nutritional values
  const calculateAdjustedValues = (food: any, unit: UnidadMedida) => {
    console.log(`Calculating values for unit: ${unit.nombre} (ID: ${unit.id})`);
    
    // Determine if food is primarily liquid or solid (for choosing the correct conversion factor)
    const humedad = typeof food?.humedad === 'string' ? parseFloat(food.humedad) : (food?.humedad || 0);
    const isLiquidFood = humedad > 50; // Assumption: foods with >50% moisture are liquids
    
    // Calculate the conversion factor based on unit type
    let conversionFactor = 1;
    
    if (unit.es_volumen && unit.equivalencia_ml) {
      // Volume-based unit (ml)
      const equiv_ml = typeof unit.equivalencia_ml === 'string' ? 
        parseFloat(unit.equivalencia_ml) : unit.equivalencia_ml;
      conversionFactor = equiv_ml / 100;
      console.log(`Using volume conversion: ${equiv_ml}ml / 100 = ${conversionFactor}`);
    } else if (!unit.es_volumen && unit.equivalencia_g) {
      // Mass-based unit (g)
      const equiv_g = typeof unit.equivalencia_g === 'string' ? 
        parseFloat(unit.equivalencia_g) : unit.equivalencia_g;
      conversionFactor = equiv_g / 100;
      console.log(`Using mass conversion: ${equiv_g}g / 100 = ${conversionFactor}`);
    } else {
      console.log(`No valid conversion for unit ${unit.nombre}, using default factor 1}`);
    }

    console.log(`Final conversion factor: ${conversionFactor}`);
    
    // Create a new object with adjusted values
    const adjusted: NutritionalValues = {};
    
    // Apply conversion to all numeric values
    Object.keys(food).forEach(key => {
      if (typeof food[key] === 'number' || typeof food[key] === 'string') {
        // Try to convert to number and multiply
        const numValue = typeof food[key] === 'string' ? parseFloat(food[key]) : food[key];
        if (!isNaN(numValue)) {
          adjusted[key] = numValue * conversionFactor;
        } else {
          adjusted[key] = food[key]; // Keep as is if not a valid number
        }
      } else {
        adjusted[key] = food[key];
      }
    });

    // Log a sample calculation for verification
    if (food.sodio) {
      const originalSodio = typeof food.sodio === 'string' ? parseFloat(food.sodio) : food.sodio;
      console.log(`Sample calculation - Sodio: ${originalSodio} * ${conversionFactor} = ${adjusted.sodio}`);
    }
    
    return adjusted;
  };

  // Determine semaphore color based on value and threshold
  const getSemaphoreColor = (value: number, lowThreshold: number, highThreshold: number) => {
    if (value < lowThreshold) return '#4CAF50'; // Green
    if (value > highThreshold) return '#F44336'; // Red
    return '#FFC107'; // Yellow
  };

  // Función para registrar el consumo del alimento
  const registrarConsumo = async () => {
    try {
      setRegistrando(true);
      
      // Obtener ID de persona del usuario actual
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Error', 'No se encontró información del usuario');
        setRegistrando(false);
        return;
      }
      
      const { persona_id } = JSON.parse(userData);
      
      if (!selectedPortion) {
        Alert.alert('Error', 'Por favor seleccione la porción (unidad de medida) correcta.');
        setRegistrando(false);
        return;
      }
      
      // Crear objeto de registro
      const registroData = {
        id_persona: persona_id,
        alimento: alimentoId,
        fecha_consumo: fechaConsumo.toISOString(),
        notas: notasConsumo,
        unidad_medida: selectedPortion.id, // <-- Ahora se envía como unidad_medida
        // Incluir resumen nutricional en caso de ser necesario o calcularlo del alimento
        calorias: nutritionSummary.calorias,
        sodio: nutritionSummary.sodio,
        potasio: nutritionSummary.potasio,
        fosforo: nutritionSummary.fosforo,
      };
      
      console.log('Enviando registro:', registroData);
      
      // Enviar a la API
      const response = await api.post('/registros-comida/', registroData);
      
      console.log('Registro creado:', response.data);
      
      // Mostrar confirmación
      Alert.alert(
        'Registro exitoso',
        `${alimento.nombre} ha sido registrado en tu historial de consumo.`,
        [{ text: 'OK', onPress: () => setShowRegistroModal(false) }]
      );
      
    } catch (error) {
      console.error('Error al registrar consumo:', error);
      Alert.alert('Error', 'No se pudo registrar el consumo. Intente nuevamente.');
    } finally {
      setRegistrando(false);
    }
  };

  // Datos de referencia para pacientes renales
  const referenceData = {
    sodio: {
      normal: "Menos de 2,300 mg/día",
      renal: "1,500-2,000 mg/día",
      description: "El sodio es un mineral que afecta la presión arterial y el equilibrio de líquidos. Los pacientes renales deben limitarlo para controlar la presión arterial y reducir la retención de líquidos.",
      tips: "• Lee las etiquetas de los alimentos\n• Evita alimentos procesados\n• Usa hierbas y especias en lugar de sal"
    },
    potasio: {
      normal: "3,500-4,700 mg/día",
      renal: "2,000-3,000 mg/día",
      description: "El potasio es esencial para la función muscular y nerviosa. Niveles muy altos o bajos pueden causar problemas cardíacos. Los riñones sanos regulan el potasio, pero en enfermedad renal puede acumularse.",
      tips: "• Hierve verduras para reducir el potasio\n• Limita frutas como plátano y naranja\n• Consulta con tu nutricionista sobre sustitutos de sal"
    },
    fosforo: {
      normal: "700-1,250 mg/día",
      renal: "800-1,000 mg/día",
      description: "El fósforo trabaja con el calcio para mantener los huesos fuertes. En enfermedad renal, puede acumularse en la sangre y causar problemas óseos y cardiovasculares.",
      tips: "• Evita bebidas gaseosas oscuras\n• Limita productos lácteos\n• Sigue las indicaciones sobre ligantes de fósforo"
    }
  };

  // Añadir una nueva sección explicativa para valores de referencia con información de los umbrales del semáforo
  const explanationData = {
    standard: {
      title: "Valores por 100ml/g",
      explanation: "La información nutricional se presenta por cada 100ml (para líquidos) o 100g (para sólidos) como estándar internacional. Esto permite comparar fácilmente el valor nutricional entre diferentes alimentos y calcular con precisión las cantidades consumidas.",
      note: "Las cantidades reales consumidas se ajustan según el tamaño de la porción que selecciones arriba."
    },
    thresholds: {
      title: "Valores del semáforo nutricional",
      description: "El código de colores de la aplicación se basa en rangos específicos por cada 100ml/g:",
      nutrients: [
        {
          name: "Sodio",
          low: "Verde: < 120mg (bajo)",
          medium: "Amarillo: 120-500mg (medio)",
          high: "Rojo: > 500mg (alto)",
          icon: "water-drop"
        },
        {
          name: "Potasio",
          low: "Verde: < 200mg (bajo)",
          medium: "Amarillo: 200-800mg (medio)",
          high: "Rojo: > 800mg (alto)",
          icon: "bolt"
        },
        {
          name: "Fósforo",
          low: "Verde: < 100mg (bajo)",
          medium: "Amarillo: 100-300mg (medio)",
          high: "Rojo: > 300mg (alto)",
          icon: "science"
        }
      ]
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando información del alimento...</Text>
      </View>
    );
  }

  if (!alimento) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color="#690B22" />
        <Text style={styles.errorText}>No se pudo cargar la información del alimento</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get values from adjusted or base values
  const currentValues = Object.keys(adjustedValues).length > 0 ? adjustedValues : alimento;
  
  // Get nutritional key values
  const sodio = currentValues.sodio || 0;
  const potasio = currentValues.potasio || 0;
  const fosforo = currentValues.fosforo || 0;
  
  // Determine semaphore colors
  const sodioColor = getSemaphoreColor(sodio, 120, 500);
  const potasioColor = getSemaphoreColor(potasio, 200, 800);
  const fosforoColor = getSemaphoreColor(fosforo, 100, 300);

  // Function to render the category info - simplified to not use hooks
  const renderCategory = () => {
    return <Text style={styles.category}>{categoryName}</Text>;
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.header}>
                <Text style={styles.title}>{alimento.nombre}</Text>
                {/* Use the renderCategory function to display category properly */}
                {renderCategory()}
              </View>

              {/* Mobile-friendly dropdown using a clickable field that opens a modal */}
              <View style={styles.unitsContainer}>
                <Text style={styles.unitsLabel}>Unidad de medida:</Text>
                <TouchableOpacity 
                  style={styles.dropdownSelector}
                  onPress={() => setShowUnitSelector(true)}>
                  <Text style={styles.dropdownText}>
                    {selectedUnit ? selectedUnit.nombre : 'Seleccione unidad'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#690B22" />
                </TouchableOpacity>
              </View>
              
              {/* Selected unit info */}
              {selectedUnit && selectedUnit.id !== 0 && (
                <View style={styles.selectedUnitInfo}>
                  <Text style={styles.unitEquivalenceText}>
                    {selectedUnit.es_volumen
                      ? `Equivale a ${selectedUnit.equivalencia_ml} ml`
                      : `Equivale a ${selectedUnit.equivalencia_g} g`}
                  </Text>
                </View>
              )}

              <Divider style={styles.divider} />

              {/* Energy content */}
              <View style={styles.energyContainer}>
                <MaterialIcons name="bolt" size={24} color="#690B22" />
                <View>
                  <Text style={styles.energyLabel}>Energía</Text>
                  <Text style={styles.energyValue}>
                    {formatNumber(currentValues.energia, 0)} kcal
                  </Text>
                </View>
              </View>

              <View style={styles.macroGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{formatNumber(currentValues.proteinas, 1)}g</Text>
                  <Text style={styles.macroLabel}>Proteínas</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{formatNumber(currentValues.hidratos_carbono, 1)}g</Text>
                  <Text style={styles.macroLabel}>Carbohidratos</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{formatNumber(currentValues.lipidos_totales, 1)}g</Text>
                  <Text style={styles.macroLabel}>Grasas</Text>
                </View>
              </View>
              
              <Divider style={styles.divider} />

              {/* Kidney-relevant nutrients with semaphore indicators */}
              <Text style={styles.sectionTitle}>Relevante en dieta renal:</Text>
              
              <View style={styles.semaphoreContainer}>
                <View style={styles.semaphoreItem}>
                  <View style={[styles.semaphoreCircle, { backgroundColor: sodioColor }]}>
                    <Text style={styles.semaphoreValue}>{formatNumber(sodio, 0)}</Text>
                  </View>
                  <Text style={styles.semaphoreLabel}>Sodio (mg)</Text>
                </View>
                
                <View style={styles.semaphoreItem}>
                  <View style={[styles.semaphoreCircle, { backgroundColor: potasioColor }]}>
                    <Text style={styles.semaphoreValue}>{formatNumber(potasio, 0)}</Text>
                  </View>
                  <Text style={styles.semaphoreLabel}>Potasio (mg)</Text>
                </View>
                
                <View style={styles.semaphoreItem}>
                  <View style={[styles.semaphoreCircle, { backgroundColor: fosforoColor }]}>
                    <Text style={styles.semaphoreValue}>{formatNumber(fosforo, 0)}</Text>
                  </View>
                  <Text style={styles.semaphoreLabel}>Fósforo (mg)</Text>
                </View>
              </View>

              {/* Botón para registrar consumo - enhanced styling */}
              <TouchableOpacity
                style={[styles.actionButton, styles.registrarButton]}
                onPress={() => setShowRegistroModal(true)}
              >
                <View style={styles.registrarButtonContent}>
                  <MaterialIcons name="add-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.registrarButtonText}>Registrar consumo</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.fullInfoButton}
                onPress={() => setShowNutritionalInfo(true)}
              >
                <Text style={styles.fullInfoButtonText}>Ver información nutricional completa</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Botón flotante de información */}
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => setShowReferenceInfo(true)}
        >
          <MaterialIcons name="help" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Modal for unit selection - mobile friendly option */}
        <Portal>
          <Modal 
            visible={showUnitSelector} 
            onDismiss={() => setShowUnitSelector(false)}
            contentContainerStyle={styles.unitModalContent}
            style={styles.modalWrapper}>
            <View style={styles.modalInner}>
              <Text style={styles.modalTitle}>Seleccionar unidad de medida</Text>
              <ScrollView 
                style={styles.unitList} 
                contentContainerStyle={styles.unitListContent}>
                {unidadesMedida.map((unit) => (
                  <TouchableOpacity
                    key={unit.id.toString()}
                    style={[
                      styles.unitItem,
                      selectedUnit?.id === unit.id && styles.selectedUnitItem
                    ]}
                    onPress={() => {
                      setSelectedUnit(unit);
                      setSelectedPortion(unit); // <-- Aseguramos que selectedPortion se actualice
                      setShowUnitSelector(false);
                      if (alimento) {
                        const adjusted = calculateAdjustedValues(alimento, unit);
                        setAdjustedValues(adjusted);
                      }
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
                onPress={() => setShowUnitSelector(false)}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        {/* Modal for full nutritional information - Fixed for mobile */}
        <Portal>
          <Modal
            visible={showNutritionalInfo}
            onDismiss={() => setShowNutritionalInfo(false)}
            contentContainerStyle={styles.modalContent}
            style={styles.modalWrapper}>
            <View style={[
              styles.modalInner, 
              Platform.OS === 'web' ? styles.modalInnerWeb : styles.modalInnerMobile
            ]}>
              <Text style={styles.modalTitle}>Información Nutricional Completa</Text>
              <Text style={styles.modalSubtitle}>
                Por {selectedUnit?.id === 0 ? '100ml/g' : selectedUnit?.nombre}
              </Text>
              
              <ScrollView 
                style={styles.modalScroll}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={true}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Energía</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.energia, 1)} kcal</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Proteínas</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.proteinas, 1)} g</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Carbohidratos</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.hidratos_carbono, 1)} g</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Azúcares</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.azucares_totales, 1)} g</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Fibra dietética</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.fibra_dietetica, 1)} g</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Lípidos totales</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.lipidos_totales, 1)} g</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Ác. grasos saturados</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.acidos_grasos_saturados, 1)} g</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Ác. grasos monoinsaturados</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.acidos_grasos_monoinsaturados, 1)} g</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Ác. grasos poliinsaturados</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.acidos_grasos_poliinsaturados, 1)} g</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Colesterol</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.colesterol, 1)} mg</Text>
                </View>
                
                <Divider style={styles.modalDivider} />
                <Text style={styles.sectionHeader}>Minerales</Text>

                <View style={[styles.nutritionItem, styles.highlightItem]}>
                  <Text style={styles.nutrientLabel}>Sodio</Text>
                  <Text style={[styles.nutrientValue, { color: sodioColor }]}>
                    {formatNumber(currentValues.sodio, 1)} mg
                  </Text>
                </View>
                
                <View style={[styles.nutritionItem, styles.highlightItem]}>
                  <Text style={styles.nutrientLabel}>Potasio</Text>
                  <Text style={[styles.nutrientValue, { color: potasioColor }]}>
                    {formatNumber(currentValues.potasio, 1)} mg
                  </Text>
                </View>
                
                <View style={[styles.nutritionItem, styles.highlightItem]}>
                  <Text style={styles.nutrientLabel}>Fósforo</Text>
                  <Text style={[styles.nutrientValue, { color: fosforoColor }]}>
                    {formatNumber(currentValues.fosforo, 1)} mg
                  </Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Calcio</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.calcio, 1) || 'N/D'} mg</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Hierro</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.hierro, 1) || 'N/D'} mg</Text>
                </View>

                <Divider style={styles.modalDivider} />
                <Text style={styles.sectionHeader}>Vitaminas</Text>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Vitamina A</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.vitamina_A, 1) || 'N/D'} μg</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Vitamina C</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.vitamina_C, 1) || 'N/D'} mg</Text>
                </View>
                
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutrientLabel}>Vitamina D</Text>
                  <Text style={styles.nutrientValue}>{formatNumber(currentValues.vitamina_D, 1) || 'N/D'} μg</Text>
                </View>
                
              </ScrollView>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowNutritionalInfo(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>

        {/* Modal para el registro de consumo */}
        <Portal>
          <Modal
            visible={showRegistroModal}
            onDismiss={() => setShowRegistroModal(false)}
            contentContainerStyle={styles.modalContent}
            style={styles.modalWrapper}>
            <View style={[
              styles.modalInner, 
              Platform.OS === 'web' ? styles.modalInnerWeb : styles.modalInnerMobile
            ]}>
              <Text style={styles.modalTitle}>Registrar Consumo</Text>
              <Text style={styles.modalSubtitle}>{alimento?.nombre}</Text>
              
              <ScrollView style={styles.registroFormScroll}>
                <View style={styles.registroForm}>
                  {/* Unidad de medida seleccionada */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Porción</Text>
                    <View style={styles.unitBox}>
                      <Text style={styles.unitBoxText}>
                        {selectedUnit ? selectedUnit.nombre : 'Seleccionar porción'}
                      </Text>
                      <TouchableOpacity 
                        style={styles.unitChangeButton}
                        onPress={() => setShowUnitSelector(true)}>
                        <MaterialIcons name="edit" size={18} color="#690B22" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Resumen nutricional */}
                  <View style={styles.consumoSummary}>
                    <Text style={styles.summaryTitle}>Resumen nutricional de la porción</Text>
                    <View style={styles.summaryGrid}>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                          {Math.round(currentValues.energia || 0)}
                        </Text>
                        <Text style={styles.summaryLabel}>Calorías</Text>
                      </View>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                          {Math.round(currentValues.sodio || 0)}
                        </Text>
                        <Text style={styles.summaryLabel}>Sodio mg</Text>
                      </View>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                          {Math.round(currentValues.potasio || 0)}
                        </Text>
                        <Text style={styles.summaryLabel}>Potasio mg</Text>
                      </View>
                      <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>
                          {Math.round(currentValues.fosforo || 0)}
                        </Text>
                        <Text style={styles.summaryLabel}>Fósforo mg</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Fecha de consumo */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Fecha y hora de consumo</Text>
                    <TouchableOpacity 
                      style={styles.dateSelector}
                      onPress={() => Platform.OS !== 'web' && setShowDatePicker(true)}
                    >
                      <Text style={styles.dateSelectorText}>
                        {fechaConsumo.toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      <MaterialIcons name="event" size={20} color="#690B22" />
                    </TouchableOpacity>
                    <Text style={styles.helperText}>Por defecto se usa la fecha y hora actual</Text>
                    
                    {/* Date picker para móvil */}
                    {Platform.OS !== 'web' && showDatePicker && (
                      <DateTimePicker
                        value={fechaConsumo}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setFechaConsumo(selectedDate);
                            setConsumptionDate(selectedDate);
                          }
                        }}
                      />
                    )}
                    
                    {/* Input específico para web */}
                    {Platform.OS === 'web' && (
                      <input 
                        type="datetime-local"
                        value={fechaConsumo.toISOString().slice(0,16)}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          setFechaConsumo(newDate);
                          setConsumptionDate(newDate);
                        }}
                        style={{
                          marginTop: 8,
                          padding: 10,
                          borderRadius: 8,
                          borderColor: '#ccc',
                          borderWidth: 1,
                          width: '100%'
                        }}
                      />
                    )}
                  </View>
                  
                  {/* Notas */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Notas (opcional)</Text>
                    <TextInput
                      style={styles.notasInput}
                      placeholder="Añadir notas sobre este consumo..."
                      value={notasConsumo}
                      onChangeText={setNotasConsumo}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowRegistroModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.confirmButton, 
                    registrando && styles.disabledButton
                  ]}
                  onPress={registrarConsumo}
                  disabled={registrando}>
                  {registrando ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirmar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Portal>

        {/* Modal para mostrar información de referencia */}
        <Portal>
          <Modal
            visible={showReferenceInfo}
            onDismiss={() => setShowReferenceInfo(false)}
            contentContainerStyle={styles.modalContent}
            style={styles.modalWrapper}>
            <View style={[
              styles.modalInner, 
              Platform.OS === 'web' ? styles.modalInnerWeb : styles.modalInnerMobile
            ]}>
              <Text style={styles.modalTitle}>Valores de Referencia</Text>
              <Text style={styles.modalSubtitle}>
                Información importante para pacientes renales
              </Text>
              
              <ScrollView 
                style={styles.modalScroll}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={true}>
                
                {/* Nueva sección explicativa sobre 100ml/g */}
                <View style={styles.referenceSection}>
                  <View style={styles.referenceTitleContainer}>
                    <MaterialIcons name="info-outline" size={22} color="#1B4D3E" />
                    <Text style={styles.referenceTitle}>{explanationData.standard.title}</Text>
                  </View>
                  
                  <View style={styles.infoContainer}>
                    <Text style={styles.referenceDescription}>
                      {explanationData.standard.explanation}
                    </Text>
                    <Text style={[styles.referenceDescription, styles.noteText]}>
                      {explanationData.standard.note}
                    </Text>
                  </View>
                </View>
                
                {/* NUEVA SECCIÓN: Añadir explicación de los umbrales del semáforo */}
                <View style={styles.referenceSection}>
                  <View style={styles.referenceTitleContainer}>
                    <MaterialIcons name="traffic" size={22} color="#1B4D3E" />
                    <Text style={styles.referenceTitle}>{explanationData.thresholds.title}</Text>
                  </View>
                  
                  <Text style={styles.referenceDescription}>
                    {explanationData.thresholds.description}
                  </Text>
                  
                  {explanationData.thresholds.nutrients.map((nutrient, index) => (
                    <View key={index} style={styles.nutrientThresholdContainer}>
                      <View style={styles.nutrientTitleContainer}>
                        <MaterialIcons name={nutrient.icon} size={18} color="#690B22" />
                        <Text style={styles.nutrientThresholdTitle}>{nutrient.name}</Text>
                      </View>
                      
                      <View style={styles.thresholdValues}>
                        <Text style={[styles.thresholdText, styles.thresholdGreen]}>
                          {nutrient.low}
                        </Text>
                        <Text style={[styles.thresholdText, styles.thresholdYellow]}>
                          {nutrient.medium}
                        </Text>
                        <Text style={[styles.thresholdText, styles.thresholdRed]}>
                          {nutrient.high}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                <Divider style={styles.referenceDivider} />
                
                {/* Sodio */}
                <View style={styles.referenceSection}>
                  <View style={styles.referenceTitleContainer}>
                    <MaterialIcons name="water-drop" size={22} color="#F44336" />
                    <Text style={styles.referenceTitle}>Sodio</Text>
                  </View>
                  
                  <View style={styles.referenceTable}>
                    <View style={styles.referenceRow}>
                      <Text style={styles.referenceLabel}>Recomendación general:</Text>
                      <Text style={styles.referenceValue}>{referenceData.sodio.normal}</Text>
                    </View>
                    <View style={styles.referenceRow}>
                      <Text style={styles.referenceLabel}>Para pacientes renales:</Text>
                      <Text style={[styles.referenceValue, styles.emphasizedValue]}>
                        {referenceData.sodio.renal}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.referenceDescription}>
                    {referenceData.sodio.description}
                  </Text>
                  
                  <View style={styles.tipContainer}>
                    <Text style={styles.tipTitle}>Consejos:</Text>
                    <Text style={styles.tipText}>{referenceData.sodio.tips}</Text>
                  </View>
                </View>
                
                <Divider style={styles.referenceDivider} />
                
                {/* Potasio */}
                <View style={styles.referenceSection}>
                  <View style={styles.referenceTitleContainer}>
                    <MaterialIcons name="bolt" size={22} color="#FFC107" />
                    <Text style={styles.referenceTitle}>Potasio</Text>
                  </View>
                  
                  <View style={styles.referenceTable}>
                    <View style={styles.referenceRow}>
                      <Text style={styles.referenceLabel}>Recomendación general:</Text>
                      <Text style={styles.referenceValue}>{referenceData.potasio.normal}</Text>
                    </View>
                    <View style={styles.referenceRow}>
                      <Text style={styles.referenceLabel}>Para pacientes renales:</Text>
                      <Text style={[styles.referenceValue, styles.emphasizedValue]}>
                        {referenceData.potasio.renal}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.referenceDescription}>
                    {referenceData.potasio.description}
                  </Text>
                  
                  <View style={styles.tipContainer}>
                    <Text style={styles.tipTitle}>Consejos:</Text>
                    <Text style={styles.tipText}>{referenceData.potasio.tips}</Text>
                  </View>
                </View>
                
                <Divider style={styles.referenceDivider} />
                
                {/* Fósforo */}
                <View style={styles.referenceSection}>
                  <View style={styles.referenceTitleContainer}>
                    <MaterialIcons name="science" size={22} color="#4CAF50" />
                    <Text style={styles.referenceTitle}>Fósforo</Text>
                  </View>
                  
                  <View style={styles.referenceTable}>
                    <View style={styles.referenceRow}>
                      <Text style={styles.referenceLabel}>Recomendación general:</Text>
                      <Text style={styles.referenceValue}>{referenceData.fosforo.normal}</Text>
                    </View>
                    <View style={styles.referenceRow}>
                      <Text style={styles.referenceLabel}>Para pacientes renales:</Text>
                      <Text style={[styles.referenceValue, styles.emphasizedValue]}>
                        {referenceData.fosforo.renal}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.referenceDescription}>
                    {referenceData.fosforo.description}
                  </Text>
                  
                  <View style={styles.tipContainer}>
                    <Text style={styles.tipTitle}>Consejos:</Text>
                    <Text style={styles.tipText}>{referenceData.fosforo.tips}</Text>
                  </View>
                </View>
                
                <View style={styles.disclaimerContainer}>
                  <MaterialIcons name="info" size={18} color="#666" />
                  <Text style={styles.disclaimerText}>
                    Estos valores son orientativos. Siempre sigue las recomendaciones específicas de tu médico o nutricionista.
                  </Text>
                </View>
              </ScrollView>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReferenceInfo(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal>
        
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
