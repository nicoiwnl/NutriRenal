import React, { useEffect, useState } from 'react';
import { 
  View, 
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform, // Add missing Platform import
  Image // Add Image import since we're also using it for prefetching
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { getImageUrl, ENDPOINTS } from '../config/apiConfig';
import alimentosService from '../services/alimentosService';
import { formatEnergia, formatMacronutrientes, formatMinerales } from '../utils/formatUtils';

// Components
import LoadingView from '../modules/scanner/components/LoadingView';
import AlimentoSeleccionPrecisa from '../modules/scanner/components/AlimentoSeleccionPrecisa';
import AlimentoOptionsModal from '../modules/scanner/components/AlimentoOptionsModal';
import DetectionMessage from '../modules/scanner/components/DetectionMessage';
import MultipleMatchesAlert from '../modules/scanner/components/MultipleMatchesAlert';
import ScanResultHeader from '../modules/scanner/components/ScanResultHeader';
import RecomendacionesCard from '../modules/scanner/components/RecomendacionesCard';
import BottomActionButtons from '../modules/scanner/components/BottomActionButtons';
import LoadingOverlay from '../modules/scanner/components/LoadingOverlay';

// Import the redesigned component
import ScanResultView from '../modules/scanner/components/ScanResultView';

// Helpers
import { parseNumeric } from '../utils/numberUtils';
import { adaptarTerminoChileno } from '../utils/alimentosUtils';

// Styles
import styles from '../modules/scanner/styles/scanResultStyles';

export default function ScanResultScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAlimento, setSelectedAlimento] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  const [platoDetectado, setPlatoDetectado] = useState('');
  const [detectionLoading, setDetectionLoading] = useState(false);
  // Add the serverImageUrl state variable
  const [serverImageUrl, setServerImageUrl] = useState(null);
  const [valoresNutricionales, setValoresNutricionales] = useState({
    energia: 0,
    proteinas: 0,
    hidratos_carbono: 0,
    lipidos: 0,
    sodio: 0,
    potasio: 0,
    fosforo: 0
  });
  
  // Add the missing analisisId state
  const [analisisId, setAnalisisId] = useState(null);
  
  // Add the missing state variable for nutritional values source
  const [fuenteValoresNutricionales, setFuenteValoresNutricionales] = useState('base_datos');
  
  const [compatibilidad, setCompatibilidad] = useState({
    sodio: {
      compatible: false,
      valor: 0,
    },
    potasio: {
      compatible: false,
      valor: 0,
    },
    fosforo: {
      compatible: false,
      valor: 0,
    }
  });
  
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [alimentoSeleccionando, setAlimentoSeleccionando] = useState(null);
  const [alimentosActualizados, setAlimentosActualizados] = useState([]);
  const [seleccionesEspecificas, setSeleccionesEspecificas] = useState({});
  const [renderKey, setRenderKey] = useState(Date.now().toString());
  const [foodsWithUnits, setFoodsWithUnits] = useState({});
  
  // Add a new flag to track whether the user has made a selection
  const [userHasSelectedFood, setUserHasSelectedFood] = useState(false);
  
  // Añadir un estado para controlar si estamos iniciando desde cero
  const [hasInitialValues, setHasInitialValues] = useState(false);

  // Extract parameters from route
  const imageUri = route.params?.imageUri;
  const results = route.params?.results;
  const userId = route.params?.userId;
  // Add the isReadOnly parameter from route params, defaulting to false
  const isReadOnly = route.params?.isReadOnly || false;
  
  // NEW: Set analisisId from results when component mounts
  useEffect(() => {
    if (results && results.id) {
      console.log("Setting analisisId:", results.id);
      setAnalisisId(results.id);
    }
  }, [results]);

  // FIXED: URL path correction for API call
  useEffect(() => {
    const fetchSeleccionesEspecificas = async () => {
      if (!analisisId || !isReadOnly) return;
      
      try {
        console.log(`Realizando consulta directa para cargar selecciones del análisis: ${analisisId}`);
        
        // FIXED: Use the correct URL format without duplicating "api/" prefix
        const response = await api.get(`selecciones-analisis/?analisis=${analisisId}`);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Éxito! Se encontraron ${response.data.length} selecciones específicas:`, 
            JSON.stringify(response.data));
          
          // Create mappings for selections and units
          const selecciones = {};
          const unidades = {};
          
          // Array to hold nutritional values from specific foods
          let totalNutritionalValues = {
            energia: 0,
            proteinas: 0,
            hidratos_carbono: 0,
            lipidos: 0,
            sodio: 0,
            potasio: 0,
            fosforo: 0
          };
          
          // Process each selection entry
          for (const seleccion of response.data) {
            // Debug each selection
            console.log(`Selección encontrada: ${seleccion.alimento_original} -> ${seleccion.alimento_nombre}`);
            
            // Map original food to specific food
            selecciones[seleccion.alimento_original] = seleccion.alimento_nombre;
            
            // Format unit text
            const unidadTexto = `${seleccion.cantidad} ${seleccion.unidad_nombre}`;
            unidades[seleccion.alimento_nombre] = unidadTexto;
            
            // ADDED: Fetch nutritional values for this specific food
            try {
              // Get the specific food nutritional data
              const foodResponse = await api.get(`alimentos/${seleccion.alimento_seleccionado}/`);
              if (foodResponse.data) {
                const food = foodResponse.data;
                
                // Calculate factor based on quantity and unit
                const cantidad = parseFloat(seleccion.cantidad) || 1;
                
                // Get unit information if available
                const unidadMedidaResponse = await api.get(`unidades-medida/${seleccion.unidad_medida}/`);
                const unidad = unidadMedidaResponse.data || {};
                
                const esLiquido = food.nombre.toLowerCase().includes('leche') || 
                                 food.nombre.toLowerCase().includes('jugo') || 
                                 food.es_liquido;
                
                // Determine conversion factor
                let factor = 1;
                if (esLiquido && unidad.equivalencia_ml) {
                  factor = (unidad.equivalencia_ml * cantidad) / 100;
                  console.log(`Usando factor líquido: ${factor} basado en ${unidad.equivalencia_ml}ml × ${cantidad}`);
                } else if (!esLiquido && unidad.equivalencia_g) {
                  factor = (unidad.equivalencia_g * cantidad) / 100;
                  console.log(`Usando factor sólido: ${factor} basado en ${unidad.equivalencia_g}g × ${cantidad}`);
                } else if (unidad.equivalencia_g) {
                  factor = (unidad.equivalencia_g * cantidad) / 100;
                  console.log(`Usando factor genérico: ${factor} basado en ${unidad.equivalencia_g}g × ${cantidad}`);
                } else if (unidad.equivalencia_ml) {
                  factor = (unidad.equivalencia_ml * cantidad) / 100;
                  console.log(`Usando factor genérico: ${factor} basado en ${unidad.equivalencia_ml}ml × ${cantidad}`);
                } else {
                  console.log("No se encontró factor de conversión, usando 1.0");
                }
                
                console.log(`Aplicando factor ${factor} para ${seleccion.alimento_nombre}`);
                console.log("Valores nutricionales base:", {
                  energia: food.energia,
                  proteinas: food.proteinas,
                  hidratos_carbono: food.hidratos_carbono,
                  lipidos: food.lipidos || food.lipidos_totales,
                  sodio: food.sodio,
                  potasio: food.potasio,
                  fosforo: food.fosforo
                });
                
                // Add this food's nutritional values to the total
                totalNutritionalValues.energia += (parseNumeric(food.energia) || 0) * factor;
                totalNutritionalValues.proteinas += (parseNumeric(food.proteinas) || 0) * factor;
                totalNutritionalValues.hidratos_carbono += (parseNumeric(food.hidratos_carbono) || 0) * factor;
                totalNutritionalValues.lipidos += (parseNumeric(food.lipidos_totales || food.lipidos) || 0) * factor;
                totalNutritionalValues.sodio += (parseNumeric(food.sodio) || 0) * factor;
                totalNutritionalValues.potasio += (parseNumeric(food.potasio) || 0) * factor;
                totalNutritionalValues.fosforo += (parseNumeric(food.fosforo) || 0) * factor;
                
                console.log(`Valores nutricionales actualizados para ${seleccion.alimento_nombre}:`, totalNutritionalValues);
              }
            } catch (foodError) {
              console.error(`Error al obtener datos nutricionales para ${seleccion.alimento_nombre}:`, foodError);
            }
          }
          
          if (Object.keys(selecciones).length > 0) {
            console.log("Aplicando selecciones específicas:", JSON.stringify(selecciones));
            setSeleccionesEspecificas(selecciones);
            setFoodsWithUnits(unidades);
            setUserHasSelectedFood(true);
            
            // ADDED: Update nutritional values with the calculated totals
            console.log("Estableciendo valores nutricionales calculados:", totalNutritionalValues);
            setValoresNutricionales(totalNutritionalValues);
            
            // Update compatibility based on new values
            setCompatibilidad({
              sodio: {
                compatible: totalNutritionalValues.sodio < 375,
                valor: totalNutritionalValues.sodio,
              },
              potasio: {
                compatible: totalNutritionalValues.potasio < 500,
                valor: totalNutritionalValues.potasio,
              },
              fosforo: {
                compatible: totalNutritionalValues.fosforo < 250,
                valor: totalNutritionalValues.fosforo,
              }
            });
            
            // Force refresh by updating the render key
            setRenderKey(`selections-loaded-${Date.now()}`);
          }
        } else {
          console.log("No se encontraron selecciones específicas para este análisis.");
        }
      } catch (error) {
        console.error("Error al cargar selecciones específicas:", error);
        // Log more details about the error
        console.error("Detalles:", JSON.stringify({
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          method: error.config?.method,
          url: error.config?.url
        }));
      }
    };
    
    // Fetch selections immediately when we have an analysis ID in read-only mode
    if (analisisId) {
      console.log(`Intentando cargar selecciones para análisis ${analisisId}, isReadOnly: ${isReadOnly}`);
      fetchSeleccionesEspecificas();
    }
  }, [analisisId, isReadOnly]);

  // NEW: Update serverImageUrl when results are available
  useEffect(() => {
    if (results) {
      // Check all possible locations for image URL
      const imageSource = results.url_imagen || 
                          results.imagen_analizada || 
                          (results.texto_original && results.texto_original.imagen_analizada);
      
      if (imageSource) {
        console.log("Imagen analizada encontrada:", imageSource);
        // Make sure we're using the full URL with domain
        const imageUrl = getImageUrl(imageSource);
        console.log("URL de imagen procesada:", imageUrl);
        setServerImageUrl(imageUrl);
        
        // Prefetch image to verify it loads
        if (Platform.OS !== 'web') {
          Image.prefetch(imageUrl)
            .then(() => console.log("✓ Imagen precargada con éxito"))
            .catch(error => console.error("✗ Error precargando imagen:", error));
        }
      } else {
        console.log("No se encontró imagen en el análisis:", JSON.stringify(results, null, 2));
      }
    }
  }, [results]);

  // Cargar el token de autenticación al inicio
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);
      } catch (e) {
        console.error('Error loading authentication token:', e);
      }
    };
    
    loadToken();
  }, []);
  
  // Adaptar los nombres de alimentos a términos chilenos, incluyendo las selecciones específicas
  const alimentosChilenos = React.useMemo(() => {
    let alimentos = [];
    
    if (results?.texto_original?.alimentos_detectados) {
      alimentos = results.texto_original.alimentos_detectados.map(adaptarTerminoChileno);
    } else if (results?.alimentos_detectados) {
      alimentos = results.alimentos_detectados.map(adaptarTerminoChileno);
    }
    
    // Reemplazar con selecciones específicas si existen
    return alimentos.map(alimento => {
      return seleccionesEspecificas[alimento] || alimento;
    });
  }, [results, seleccionesEspecificas]);

  // Al cargar la pantalla, comenzamos la "detección"
  useEffect(() => {
    if (results) {
      setDetectionLoading(true);
      
      // UPDATED: First check if we already have a specific name from the backend
      setTimeout(() => {
        if (results.nombre) {
          // If we already have a specific name from the backend, use it
          setPlatoDetectado(results.nombre);
        } else {
          // Otherwise use the existing logic
          const alimentos = alimentosChilenos.length > 0 ? alimentosChilenos : [];
          
          // ENHANCEMENT: First check if there's a predefined dish name from the API
          if (results.plato_detectado) {
            setPlatoDetectado(results.plato_detectado);
          } 
          // If we have a dish type specified in the texto_original
          else if (results.texto_original?.tipo_plato) {
            setPlatoDetectado(results.texto_original.tipo_plato);
          }
          else if (alimentos.length > 0) {
            // Improved dish name generation logic - ADDED
            const ingredientesOrdenados = [...alimentos]; 
            
            // Common Chilean dish patterns
            const patronesPlatos = {
              'pollo': (ingredientes) => {
                if (ingredientes.some(i => i.toLowerCase().includes('pure') || i.toLowerCase().includes('puré')))
                  return 'Plato de puré con pollo';
                if (ingredientes.some(i => i.toLowerCase().includes('arroz')))
                  return 'Plato de arroz con pollo';
                if (ingredientes.some(i => i.toLowerCase().includes('papas') || i.toLowerCase().includes('papa')))
                  return 'Plato de papas con pollo';
                return 'Plato de pollo';
              },
              'carne': (ingredientes) => {
                if (ingredientes.some(i => i.toLowerCase().includes('pure') || i.toLowerCase().includes('puré')))
                  return 'Plato de puré con carne';
                if (ingredientes.some(i => i.toLowerCase().includes('arroz')))
                  return 'Plato de arroz con carne';
                if (ingredientes.some(i => i.toLowerCase().includes('papas') || i.toLowerCase().includes('papa')))
                  return 'Plato de papas con carne';
                return 'Plato de carne';
              },
              'pescado': (ingredientes) => {
                if (ingredientes.some(i => i.toLowerCase().includes('arroz')))
                  return 'Plato de arroz con pescado';
                if (ingredientes.some(i => i.toLowerCase().includes('pure') || i.toLowerCase().includes('puré')))
                  return 'Plato de puré con pescado';
                return 'Plato de pescado';
              },
              'leche': () => 'Vaso de leche',
              'pan': () => 'Pan',
              'huevo': (ingredientes) => {
                if (ingredientes.some(i => i.toLowerCase().includes('tomate')))
                  return 'Huevo con tomate';
                return 'Huevo';
              },
              'tomate': (ingredientes) => {
                if (ingredientes.some(i => i.toLowerCase().includes('lechuga')))
                  return 'Ensalada de tomate y lechuga';
                return 'Tomate';
              },
              'arroz': () => 'Plato de arroz',
              'sopa': () => 'Sopa',
              'cazuela': () => 'Cazuela',
              'ensalada': () => 'Ensalada',
            };
            
            // Check if any of our patterns match the detected foods
            let nombrePlato = null;
            
            // Look for pattern matches
            for (const [clave, generadorNombre] of Object.entries(patronesPlatos)) {
              if (ingredientesOrdenados.some(ingrediente => 
                  ingrediente.toLowerCase().includes(clave.toLowerCase()))) {
                nombrePlato = generadorNombre(ingredientesOrdenados.map(i => i.toLowerCase()));
                break;
              }
            }
            
            // If no pattern matches, fallback to the original logic
            if (!nombrePlato) {
              if (alimentos.length === 1) {
                nombrePlato = alimentos[0]; // Single item
              } else {
                // Create a combined name for multiple items
                const nombresPlato = alimentos.slice(0, Math.min(3, alimentos.length));
                nombrePlato = nombresPlato.join(', ');
              }
            }
            
            setPlatoDetectado(nombrePlato);
          } else {
            setPlatoDetectado('Plato no identificado');
          }
        }
        
        setDetectionLoading(false);
      }, 1500); // Simulamos un pequeño delay para dar sensación de procesamiento
    }
  }, [results]);

  // Actualizar valores nutricionales desde la base de datos al cargar
  useEffect(() => {
    // Skip this effect if the user has already selected a specific food
    if (userHasSelectedFood) {
      console.log("Skipping initial value load because user has made a selection");
      return;
    }

    if (results && alimentosChilenos.length > 0) {
      const actualizarValores = async () => {
        try {
          console.log("Loading initial nutritional values from service...");
          const resultadoActualizacion = await alimentosService.actualizarValoresNutricionales({
            alimentos_detectados: alimentosChilenos,
            totales: results.totales // Pasar los totales de la IA como respaldo
          });
          
          if (resultadoActualizacion.alimentosActualizados.length > 0 || resultadoActualizacion.fuenteValores === 'estimacion_ia') {
            // MODIFICACIÓN: Convertir todos los valores a números antes de actualizar el estado
            const valoresConvertidos = {
              energia: parseFloat(resultadoActualizacion.valoresNutricionales.energia) || 0,
              proteinas: parseFloat(resultadoActualizacion.valoresNutricionales.proteinas) || 0,
              hidratos_carbono: parseFloat(resultadoActualizacion.valoresNutricionales.hidratos_carbono) || 0,
              lipidos: parseFloat(resultadoActualizacion.valoresNutricionales.lipidos) || 0,
              sodio: parseFloat(resultadoActualizacion.valoresNutricionales.sodio) || 0,
              potasio: parseFloat(resultadoActualizacion.valoresNutricionales.potasio) || 0,
              fosforo: parseFloat(resultadoActualizacion.valoresNutricionales.fosforo) || 0
            };
            
            console.log("Valores iniciales convertidos a números:", valoresConvertidos);
            
            // Solo actualizar el estado con valores numéricos
            setValoresNutricionales(valoresConvertidos);
            setHasInitialValues(true); // Marcar que tenemos valores iniciales
            
            // Actualizar la compatibilidad con valores numéricos garantizados y NUEVOS LÍMITES
            setCompatibilidad({
              sodio: {
                compatible: valoresConvertidos.sodio < 375, // Actualizado de 800 a 375
                valor: valoresConvertidos.sodio,
              },
              potasio: {
                compatible: valoresConvertidos.potasio < 500, // Actualizado de 1000 a 500
                valor: valoresConvertidos.potasio,
              },
              fosforo: {
                compatible: valoresConvertidos.fosforo < 250, // Actualizado de 700 a 250
                valor: valoresConvertidos.fosforo,
              }
            });
            
            // Guardar la fuente de los datos nutricionales
            setFuenteValoresNutricionales(resultadoActualizacion.fuenteValores);
          }
        } catch (error) {
          console.error('Error al actualizar valores nutricionales:', error);
        }
      };
      
      actualizarValores();
    }
  }, [results, alimentosChilenos, userHasSelectedFood]); // Added userHasSelectedFood dependency

  // Función para agregar un alimento actualizado a la lista
  const addToAlimentosActualizados = (alimento) => {
    setAlimentosActualizados(prev => {
      const index = prev.findIndex(a => a.nombreOriginal === alimentoSeleccionando);
      if (index >= 0) {
        const newAlimentos = [...prev];
        newAlimentos[index] = {
          nombreOriginal: alimentoSeleccionando,
          nombre: alimento.nombre,
          info: alimento
        };
        return newAlimentos;
      } else {
        return [...prev, {
          nombreOriginal: alimentoSeleccionando,
          nombre: alimento.nombre,
          info: alimento
        }];
      }
    });
  };

  // Función para seleccionar un alimento
  const handleSelectAlimento = async (alimento) => {
    // NEW: Don't allow selection if in read-only mode
    if (isReadOnly) {
      return;
    }
    
    setAlimentoSeleccionando(alimento);
    setShowVariantSelector(true);
  };
  
  // Nueva función para manejar la selección de una variante específica
  const handleSelectVarianteEspecifica = (varianteSeleccionada) => {
    setShowVariantSelector(false);
    
    if (varianteSeleccionada) {
      if (varianteSeleccionada.id) {
        // Set the flag to true when user selects a specific food
        const isFirstSelection = !userHasSelectedFood;
        setUserHasSelectedFood(true);
        
        // Debug log para verificar valores
        console.log("VALORES DEL ALIMENTO SELECCIONADO:", 
          JSON.stringify(varianteSeleccionada, null, 2));
        
        // Actualizar la selección específica para este alimento
        setSeleccionesEspecificas(prev => {
          const updatedSelections = {
            ...prev,
            [alimentoSeleccionando]: varianteSeleccionada.nombre
          };
          
          // Save selections to the analysis if we have an ID
          if (analisisId) {
            saveSelectionsToPastAnalysis(updatedSelections, foodsWithUnits);
          }
          
          return updatedSelections;
        });

        // Track selected units and quantities for display - FIXED to handle undefined abreviacion
        let unidadTexto = "100g/ml"; // Default fallback
        
        if (varianteSeleccionada.unidad_seleccionada) {
          const cantidad = varianteSeleccionada.cantidad_seleccionada || 1;
          const unidadNombre = varianteSeleccionada.unidad_seleccionada.abreviacion || 
                              varianteSeleccionada.unidad_seleccionada.nombre || 
                              "unidades";
          
          unidadTexto = `${cantidad} ${unidadNombre}`;
        }
        
        // Store the quantity and unit information with the food
        setFoodsWithUnits(prev => {
          const updatedFoodsWithUnits = {
            ...prev,
            [varianteSeleccionada.nombre]: unidadTexto
          };
          
          // Also save the updated units
          if (analisisId) {
            saveSelectionsToPastAnalysis(seleccionesEspecificas, updatedFoodsWithUnits);
          }
          
          return updatedFoodsWithUnits;
        });
        
        // IMPROVED: Use the adjusted values directly if available
        let nuevosValores;
        
        if (varianteSeleccionada.valores_ajustados) {
          // Use pre-calculated values based on selected quantity and unit
          nuevosValores = {
            energia: parseNumeric(varianteSeleccionada.valores_ajustados.energia || varianteSeleccionada.energia),
            proteinas: parseNumeric(varianteSeleccionada.valores_ajustados.proteinas || varianteSeleccionada.proteinas),
            hidratos_carbono: parseNumeric(varianteSeleccionada.valores_ajustados.hidratos_carbono || varianteSeleccionada.hidratos_carbono),
            lipidos: parseNumeric(varianteSeleccionada.valores_ajustados.lipidos || varianteSeleccionada.lipidos_totales || varianteSeleccionada.lipidos),
            sodio: parseNumeric(varianteSeleccionada.valores_ajustados.sodio),
            potasio: parseNumeric(varianteSeleccionada.valores_ajustados.potasio),
            fosforo: parseNumeric(varianteSeleccionada.valores_ajustados.fosforo)
          };
          
          console.log("Using adjusted values with unit and quantity:", nuevosValores);
        } else {
          // Fallback to direct values (which shouldn't happen since we always add adjusted values)
          nuevosValores = {
            energia: parseNumeric(varianteSeleccionada.energia),
            proteinas: parseNumeric(varianteSeleccionada.proteinas),
            hidratos_carbono: parseNumeric(varianteSeleccionada.hidratos_carbono),
            lipidos: parseNumeric(varianteSeleccionada.lipidos_totales || varianteSeleccionada.lipidos),
            sodio: parseNumeric(varianteSeleccionada.sodio),
            potasio: parseNumeric(varianteSeleccionada.potasio),
            fosforo: parseNumeric(varianteSeleccionada.fosforo)
          };
        }
        
        // CRITICAL FIX: Create a direct snapshot of previous state to avoid closure issues
        const prevState = { ...valoresNutricionales };
        
        // Find if this is a replacement
        const alimentoAnterior = alimentosActualizados.find(a => a.nombreOriginal === alimentoSeleccionando);
        
        // *** SOLUCIÓN DETERMINANTE: Si es la primera selección, SIEMPRE reemplazamos por completo 
        // los valores iniciales, sin importar nada más ***
        let newValues;
        
        if (isFirstSelection) {
          // SOLUCIÓN DEFINITIVA: En la primera selección SIEMPRE usar solo los valores del alimento seleccionado
          newValues = { ...nuevosValores };
          console.log("PRIMERA SELECCIÓN: Reemplazando valores iniciales con:", nuevosValores);
        } else {
          // Para selecciones posteriores, aplicar lógica normal de reemplazo
          if (alimentoAnterior && alimentoAnterior.info && alimentoAnterior.info.valores_ajustados) {
            // Subtract previous values and add new ones
            newValues = {
              energia: prevState.energia - parseNumeric(alimentoAnterior.info.valores_ajustados.energia || 0) + nuevosValores.energia,
              proteinas: prevState.proteinas - parseNumeric(alimentoAnterior.info.valores_ajustados.proteinas || 0) + nuevosValores.proteinas,
              hidratos_carbono: prevState.hidratos_carbono - parseNumeric(alimentoAnterior.info.valores_ajustados.hidratos_carbono || 0) + nuevosValores.hidratos_carbono,
              lipidos: prevState.lipidos - parseNumeric(alimentoAnterior.info.valores_ajustados.lipidos || 0) + nuevosValores.lipidos,
              sodio: prevState.sodio - parseNumeric(alimentoAnterior.info.valores_ajustados.sodio || 0) + nuevosValores.sodio,
              potasio: prevState.potasio - parseNumeric(alimentoAnterior.info.valores_ajustados.potasio || 0) + nuevosValores.potasio,
              fosforo: prevState.fosforo - parseNumeric(alimentoAnterior.info.valores_ajustados.fosforo || 0) + nuevosValores.fosforo
            };
            console.log("Reemplazando alimento existente - restando valores anteriores y sumando nuevos");
          } else {
            // Just add the new values to existing total
            newValues = {
              energia: prevState.energia + nuevosValores.energia,
              proteinas: prevState.proteinas + nuevosValores.proteinas,
              hidratos_carbono: prevState.hidratos_carbono + nuevosValores.hidratos_carbono,
              lipidos: prevState.lipidos + nuevosValores.lipidos,
              sodio: prevState.sodio + nuevosValores.sodio,
              potasio: prevState.potasio + nuevosValores.potasio,
              fosforo: prevState.fosforo + nuevosValores.fosforo
            };
            console.log("Agregando nuevo alimento a los existentes");
          }
        }
        
        // FIX: Ensure values are always numeric with parseNumeric
        const safeNewValues = {
          energia: parseNumeric(newValues.energia),
          proteinas: parseNumeric(newValues.proteinas),
          hidratos_carbono: parseNumeric(newValues.hidratos_carbono),
          lipidos: parseNumeric(newValues.lipidos),
          sodio: parseNumeric(newValues.sodio),
          potasio: parseNumeric(newValues.potasio),
          fosforo: parseNumeric(newValues.fosforo)
        };
        
        // Set the new values directly (avoiding functional update pattern to ensure immediate update)
        setValoresNutricionales(safeNewValues);
        
        // Update renderKey to force component refresh - make it more unique with all values
        const newKey = `nutrition-${Date.now()}-${safeNewValues.sodio}-${safeNewValues.potasio}-${safeNewValues.fosforo}`;
        setRenderKey(newKey);
        console.log("Updated renderKey to:", newKey);
        
        // IMPORTANT: Update compatibilidad immediately with a direct object (not functional update)
        const newCompatibilidad = {
          sodio: { 
            compatible: safeNewValues.sodio < 375, // Actualizado de 800 a 375
            valor: safeNewValues.sodio,
          },
          potasio: {
            compatible: safeNewValues.potasio < 500, // Actualizado de 1000 a 500
            valor: safeNewValues.potasio,
          },
          fosforo: {
            compatible: safeNewValues.fosforo < 250, // Actualizado de 700 a 250
            valor: safeNewValues.fosforo,
          }
        };
        
        // Set directly instead of using updateCompatibilidadSafely for immediate update
        setCompatibilidad(newCompatibilidad);
        console.log("Direct compatibilidad update:", JSON.stringify(newCompatibilidad, null, 2));

        // Log the updated values for debugging
        console.log("UPDATED nutritional values:", safeNewValues);
        
        // Save the modified food with updated adjusted values
        const alimentoConValores = {
          ...varianteSeleccionada,
          valores_ajustados: nuevosValores
        };
        
        // Store this in our updated foods
        addToAlimentosActualizados(alimentoConValores);
        
        // Opcional: Mostrar confirmación con los valores actualizados
        Alert.alert(
          'Alimento actualizado',
          `Se ha actualizado a "${varianteSeleccionada.nombre}" con sus valores nutricionales específicos.`,
          [
            { 
              text: 'Ver detalles', 
              onPress: () => Alert.alert(
                'Valores nutricionales',
                `Energía: ${formatEnergia(nuevosValores.energia)}\n` +
                `Proteínas: ${formatMacronutrientes(nuevosValores.proteinas)}\n` +
                `Sodio: ${formatMinerales(nuevosValores.sodio)}\n` +
                `Potasio: ${formatMinerales(nuevosValores.potasio)}\n` +
                `Fósforo: ${formatMinerales(nuevosValores.fosforo)}`
              )
            },
            { text: 'Aceptar' }
          ]
        );
      } else {
        // Es un alimento genérico, mostrar opciones
        // CHANGE: Use the actual name of the selected food instead of generic text
        setSelectedAlimento(varianteSeleccionada.nombre || alimentoSeleccionando);
        setShowOptions(true);
      }
    }
  };
  
  // Función para buscar información del alimento - mejorada con manejo de errores
  const handleBuscarInfo = async () => {
    setShowOptions(false);
    setLoading(true);
    
    try {
      // Usando un endpoint correcto y query params adecuados
      const response = await api.get(`${ENDPOINTS.ALIMENTOS}?search=${encodeURIComponent(selectedAlimento)}`);
      
      if (response.data && response.data.length > 0) {
        navigation.navigate('AlimentoDetailScreen', { 
          alimento: response.data[0],
          alimentoId: response.data[0].id 
        });
      } else {
        Alert.alert(
          'Alimento no encontrado',
          `No se encontró información detallada para "${selectedAlimento}". ¿Desea buscar en todos los alimentos?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Buscar',
              onPress: () => navigation.navigate('Alimentos', { searchQuery: selectedAlimento })
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error al buscar alimento:', error);
      Alert.alert(
        'Error',
        'No se pudo buscar el alimento. Por favor intente de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Función para registrar consumo - mejorada con manejo de errores
  const handleRegistrarConsumo = async () => {
    setShowOptions(false);
    
    if (!userToken) {
      Alert.alert('Aviso', 'Necesitas iniciar sesión para registrar consumo');
      return;
    }
    
    setLoading(true);
    
    try {
      // Fecha actual en formato YYYY-MM-DD
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Primero buscar el alimento
      const searchResponse = await api.get(`${ENDPOINTS.ALIMENTOS}?search=${encodeURIComponent(selectedAlimento)}`);
      
      if (searchResponse.data && searchResponse.data.length > 0) {
        const alimento = searchResponse.data[0];
        
        // Asegurarnos de enviar el ID de persona en múltiples formatos para compatibilidad
        await api.post(ENDPOINTS.REGISTRAR_CONSUMO, {
          alimento_id: alimento.id,
          id_alimento: alimento.id,
          cantidad: 1,
          unidad_medida_id: 1,
          persona_id: userId,
          id_persona: userId,
          id_persona_id: userId,
          usuario_id: userId,
          fecha: currentDate
        });
        
        Alert.alert(
          'Consumo registrado',
          `Se ha registrado el consumo de ${selectedAlimento} exitosamente.`
        );
      } else {
        Alert.alert(
          'Alimento no encontrado',
          `No se pudo encontrar "${selectedAlimento}" en la base de datos para registrar el consumo.`
        );
      }
    } catch (error) {
      console.error('Error al registrar consumo:', error);
      Alert.alert(
        'Error',
        'No se pudo registrar el consumo. Por favor intente de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Función para obtener información nutricional desde la base de datos
  const obtenerInfoNutricionalDesdeDB = async (alimento) => {
    setLoading(true);
    try {
      // Buscar el alimento en la base de datos
      const response = await api.get(`${ENDPOINTS.ALIMENTOS}?search=${encodeURIComponent(alimento)}`);
      
      if (response.data && response.data.length > 0) {
        // Usar los valores nutricionales de la base de datos
        const alimentoDB = response.data[0];
        
        // Actualizar los valores de compatibilidad con los datos reales
        const nuevaCompatibilidad = {
          sodio: {
            compatible: (alimentoDB.sodio || 0) < 800,
            valor: alimentoDB.sodio || 0,
          },
          potasio: {
            compatible: (alimentoDB.potasio || 0) < 1000,
            valor: alimentoDB.potasio || 0,
          },
          fosforo: {
            compatible: (alimentoDB.fosforo || 0) < 700,
            valor: alimentoDB.fosforo || 0,
          }
        };
        
        // Aquí podrías actualizar el state para mostrar estos valores
        // Por ahora solo alertamos que se encontró información
        Alert.alert(
          'Información nutricional',
          `Se ha actualizado la información nutricional de ${alimento} con datos científicos precisos de nuestra base de datos.`,
          [{ text: 'Ver detalles', onPress: () => handleBuscarInfo() }]
        );
        
        return nuevaCompatibilidad;
      } else {
        Alert.alert('Alimento no encontrado', `No tenemos información científica precisa sobre "${alimento}" en nuestra base de datos.`);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener información nutricional:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add this function definition (missing function that's causing the error)
  const saveSelectionsToPastAnalysis = async (selections, units) => {
    if (!analisisId || isReadOnly || !userToken) {
      return; // Don't save if no ID, in read-only mode, or not logged in
    }
    
    try {
      console.log(`Saving selections for analysis ${analisisId}...`);
      
      // Get the current state of selections and units to ensure we're not losing data
      const currentSelections = { ...seleccionesEspecificas };
      const currentUnits = { ...foodsWithUnits };
      
      // Create a payload with both the selections and units (merged with current state)
      const payload = {
        id: analisisId,
        seleccionesEspecificas: { ...currentSelections, ...selections },
        foodsWithUnits: { ...currentUnits, ...units }
      };
      
      // Check if endpoint is defined before trying to use it
      if (!ENDPOINTS.ANALISIS_IMAGEN) {
        console.warn("ANALISIS_IMAGEN endpoint is not defined, cannot save selections");
        return;
      }
      
      // Use the correct endpoint format
      const url = `${ENDPOINTS.ANALISIS_IMAGEN}/${analisisId}/`;
      console.log("Saving to URL:", url);
      
      // Log the payload for debugging
      console.log("With payload:", JSON.stringify(payload));
      
      // Send the update request
      await api.patch(url, payload);
      console.log("Selections saved successfully");
    } catch (error) {
      console.error("Failed to save food selections:", error);
      console.error("Error details:", JSON.stringify({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      }));
      // Don't show an error to the user as this is a background operation
    }
  };

  // Helpers para navegación
  const handleScanAgain = () => navigation.navigate('QRScanner');
  const handleGoHome = () => navigation.navigate('Home');

  // Mostrar pantallas de carga o error si corresponde
  if (loading) {
    return <LoadingView message="Procesando resultados..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!results || (!results.texto_original && !alimentosChilenos.length)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyResultContainer}>
          <Text style={styles.emptyResultTitle}>Sin resultados</Text>
          <Text style={styles.emptyResultMessage}>
            No se pudieron detectar alimentos en la imagen. Intenta con otra foto.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get the text analysis results
  const analisisTexto = results?.texto_original || {};

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <ScanResultView
        results={results}
        imageUri={imageUri}
        serverImageUrl={serverImageUrl}
        onScanAgain={handleScanAgain}
        compatibilidad={compatibilidad}
        onSelectAlimento={handleSelectAlimento}
        isReadOnly={isReadOnly}
        seleccionesEspecificas={seleccionesEspecificas}
        foodsWithUnits={foodsWithUnits}
        fuenteValores={fuenteValoresNutricionales}
        key={renderKey}
      />
      
      {/* Bottom buttons - MODIFIED to show different options in read-only mode */}
      {isReadOnly ? (
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.backButton]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.scanAgainButton]}
            onPress={handleScanAgain}
          >
            <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Nuevo Análisis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <BottomActionButtons 
          onScanAgain={handleScanAgain}
          onGoHome={handleGoHome}
        />

      )}
      
      {/* Modals - ONLY shown when not in read-only mode */}
      {!isReadOnly && (
        <>
          <AlimentoOptionsModal 
            visible={showOptions}
            alimento={selectedAlimento}
            onClose={() => setShowOptions(false)}
            onBuscarInfo={handleBuscarInfo}
            onRegistrarConsumo={handleRegistrarConsumo}
          />
          
          <AlimentoSeleccionPrecisa
            visible={showVariantSelector}
            onClose={() => setShowVariantSelector(false)}
            alimentoGenerico={alimentoSeleccionando}
            onSelectAlimento={handleSelectVarianteEspecifica}
            titulo="Seleccionar tipo específico"
            analisisId={analisisId} // Pass the properly initialized analisisId
          />
        </>
      )}
      
      {/* Overlay de carga */}
      {loading && <LoadingOverlay />}
    </SafeAreaView>
  );
}
