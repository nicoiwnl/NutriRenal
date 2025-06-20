import { useState, useEffect, useMemo } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';

/**
 * Hook personalizado para manejar la lógica del detalle de Alimento
 */
export default function useAlimentoDetail(alimentoId) {
  const [loading, setLoading] = useState(true);
  const [alimento, setAlimento] = useState(null);
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [baseValues, setBaseValues] = useState({});
  const [adjustedValues, setAdjustedValues] = useState({});
  const [showNutritionalInfo, setShowNutritionalInfo] = useState(false);
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  
  // Estados para registro de consumo
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [notasConsumo, setNotasConsumo] = useState('');
  const [fechaConsumo, setFechaConsumo] = useState(new Date());
  const [registrando, setRegistrando] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [nutritionSummary, setNutritionSummary] = useState({
    calorias: 0,
    sodio: 0,
    potasio: 0,
    fosforo: 0,
  });
  const [showReferenceInfo, setShowReferenceInfo] = useState(false);

  // Efecto para cargar datos del alimento
  useEffect(() => {
    const fetchAlimento = async () => {
      try {
        if (!alimentoId) {
          setLoading(false);
          return;
        }

        const response = await api.get(`/alimentos/${alimentoId}/`);
        setAlimento(response.data);
        setBaseValues(response.data);
      } catch (error) {
        console.error('Error al obtener datos del alimento:', error);
        
        if (error.response) {
          Alert.alert('Error', `No se pudieron cargar los datos del alimento (${error.response.status})`);
        } else {
          Alert.alert('Error', 'No se pudieron cargar los datos del alimento. Compruebe su conexión.');
        }
      }
    };

    const fetchUnidades = async () => {
      try {
        const response = await api.get('/unidades-medida/');
        
        const processedUnits = response.data.map(unit => ({
          ...unit,
          id: typeof unit.id === 'string' ? parseInt(unit.id, 10) : unit.id
        }));
        
        setUnidadesMedida(processedUnits);
        
        // Buscar la unidad "Plato Normal" (ID 4) para establecerla como predeterminada
        const platoNormal = processedUnits.find(unit => unit.id === 4);
        
        // Establecer la unidad predeterminada: Plato Normal si existe, o la primera unidad disponible
        if (platoNormal) {
          console.log('Usando Plato Normal como unidad predeterminada');
          setSelectedUnit(platoNormal);
          setSelectedPortion(platoNormal);
        } else if (processedUnits.length > 0) {
          console.log('No se encontró Plato Normal, usando primera unidad como predeterminada');
          setSelectedUnit(processedUnits[0]);
          setSelectedPortion(processedUnits[0]);
        }
      } catch (error) {
        console.error('Error al obtener unidades de medida:', error);
        
        // Si hay error, intentar crear una unidad básica como fallback
        const fallbackUnit = {
          id: 4,
          nombre: 'Plato Normal',
          equivalencia_ml: 250,
          equivalencia_g: 250,
          es_volumen: false
        };
        
        setUnidadesMedida([fallbackUnit]);
        setSelectedUnit(fallbackUnit);
        setSelectedPortion(fallbackUnit);
      } finally {
        setLoading(false);
      }
    };

    fetchAlimento();
    fetchUnidades();
  }, [alimentoId]);

  // Efecto para determinar el nombre de la categoría
  useEffect(() => {
    if (alimento && alimento.categoria) {
      if (typeof alimento.categoria === 'number' || typeof alimento.categoria === 'string') {
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
        setCategoryName(alimento.categoria.nombre);
      } else {
        setCategoryName('Sin categoría');
      }
    } else {
      setCategoryName('Sin categoría');
    }
  }, [alimento]);

  // Efecto para calcular valores nutricionales ajustados
  useEffect(() => {
    if (alimento && selectedUnit && selectedUnit.id !== 0) {
      const adjusted = calculateAdjustedValues(alimento, selectedUnit);
      setAdjustedValues(adjusted);
    } else {
      setAdjustedValues(baseValues);
    }
  }, [selectedUnit, alimento, baseValues]);

  // Función para calcular valores nutricionales ajustados
  const calculateAdjustedValues = (food, unit) => {
    if (!food || !unit) return {};
    
    let conversionFactor = 1;
    
    if (unit.es_volumen && unit.equivalencia_ml) {
      const equiv_ml = typeof unit.equivalencia_ml === 'string' ? 
        parseFloat(unit.equivalencia_ml) : unit.equivalencia_ml;
      conversionFactor = equiv_ml / 100;
    } else if (!unit.es_volumen && unit.equivalencia_g) {
      const equiv_g = typeof unit.equivalencia_g === 'string' ? 
        parseFloat(unit.equivalencia_g) : unit.equivalencia_g;
      conversionFactor = equiv_g / 100;
    }
    
    const adjusted = {};
    
    Object.keys(food).forEach(key => {
      if (typeof food[key] === 'number' || typeof food[key] === 'string') {
        const numValue = typeof food[key] === 'string' ? parseFloat(food[key]) : food[key];
        if (!isNaN(numValue)) {
          adjusted[key] = numValue * conversionFactor;
        } else {
          adjusted[key] = food[key];
        }
      } else {
        adjusted[key] = food[key];
      }
    });
    
    return adjusted;
  };

  // Función para formatear números
  const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined) return '0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    return numValue.toFixed(decimals);
  };

  // Función para determinar el color del semáforo
  const getSemaphoreColor = (value, lowThreshold, highThreshold) => {
    if (value < lowThreshold) return '#4CAF50'; // Verde
    if (value > highThreshold) return '#F44336'; // Rojo
    return '#FFC107'; // Amarillo
  };

  // Función para registrar consumo
  const registrarConsumo = async () => {
    try {
      setRegistrando(true);
      
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
      
      const registroData = {
        id_persona: persona_id,
        alimento: alimentoId,
        fecha_consumo: fechaConsumo.toISOString(),
        notas: notasConsumo,
        unidad_medida: selectedPortion.id,
        calorias: nutritionSummary.calorias,
        sodio: nutritionSummary.sodio,
        potasio: nutritionSummary.potasio,
        fosforo: nutritionSummary.fosforo,
      };
      
      const response = await api.post('/registros-comida/', registroData);
      
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

  // Seleccionar la primera unidad por defecto cuando se cargan 
  // Podemos eliminar este useEffect ya que ahora lo manejamos directamente en fetchUnidades
  /* useEffect(() => {
    if (unidadesMedida.length > 0 && !selectedUnit) {
      // Asegúrate de que haya un ID válido en la primera unidad
      const defaultUnit = unidadesMedida[0];
      if (defaultUnit && defaultUnit.id) {
        setSelectedUnit(defaultUnit);
        setSelectedPortion(defaultUnit);
      }
    }
  }, [unidadesMedida]); */

  // Objeto con valores actuales
  const currentValues = Object.keys(adjustedValues).length > 0 ? adjustedValues : alimento;
  
  return {
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
    showRegistroModal,
    setShowRegistroModal,
    notasConsumo,
    setNotasConsumo,
    fechaConsumo,
    setFechaConsumo,
    registrando,
    showDatePicker,
    setShowDatePicker,
    selectedPortion,
    setSelectedPortion,
    showReferenceInfo,
    setShowReferenceInfo,
    formatNumber,
    getSemaphoreColor,
    registrarConsumo,
    onSuccess: () => {
      // Verificar si estamos en web antes de usar window.scrollTo
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.scrollTo) {
        window.scrollTo(0, 0);
      }
    }
  };
}
