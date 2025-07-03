import React, { useEffect, useState } from 'react';
import { 
  View, 
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { getImageUrl, ENDPOINTS } from '../config/apiConfig';
import alimentosService from '../services/alimentosService';
import { formatEnergia, formatMacronutrientes, formatMinerales } from '../utils/formatUtils';

// Componentes
import LoadingView from '../modules/scanner/components/LoadingView';
import AlimentoSeleccionPrecisa from '../modules/scanner/components/AlimentoSeleccionPrecisa';
import AlimentoOptionsModal from '../modules/scanner/components/AlimentoOptionsModal';
import DetectionMessage from '../modules/scanner/components/DetectionMessage';
import MultipleMatchesAlert from '../modules/scanner/components/MultipleMatchesAlert';
import ScanResultHeader from '../modules/scanner/components/ScanResultHeader';
import RecomendacionesCard from '../modules/scanner/components/RecomendacionesCard';
import BottomActionButtons from '../modules/scanner/components/BottomActionButtons';
import LoadingOverlay from '../modules/scanner/components/LoadingOverlay';

// Importar el componente rediseñado
import ScanResultView from '../modules/scanner/components/ScanResultView';

// Utilidades
import { parseNumeric } from '../utils/numberUtils';
import { adaptarTerminoChileno } from '../utils/alimentosUtils';

// Estilos
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
  // Variable de estado para la URL de la imagen del servidor
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
  
  // Estado para el ID del análisis
  const [analisisId, setAnalisisId] = useState(null);
  
  // Variable de estado para la fuente de valores nutricionales
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
  
  // Indicador para saber si el usuario ha seleccionado un alimento específico
  const [userHasSelectedFood, setUserHasSelectedFood] = useState(false);
  
  // Estado para controlar si tenemos valores iniciales
  const [hasInitialValues, setHasInitialValues] = useState(false);

  // Extraer parámetros de la ruta
  const imageUri = route.params?.imageUri;
  const results = route.params?.results;
  const userId = route.params?.userId;
  // Parámetro de solo lectura, por defecto es falso
  const isReadOnly = route.params?.isReadOnly || false;
  
  // Establecer el ID del análisis cuando el componente se monta
  useEffect(() => {
    if (results && results.id) {
      setAnalisisId(results.id);
    }
  }, [results]);

  // Corrección de ruta para llamada a API
  useEffect(() => {
    const fetchSeleccionesEspecificas = async () => {
      if (!analisisId || !isReadOnly) return;
      
      try {
        
        const response = await api.get(`selecciones-analisis/?analisis=${analisisId}`);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          console.log(`Éxito! Se encontraron ${response.data.length} selecciones específicas:`, 
            JSON.stringify(response.data));
          
          // Crear mapeos para selecciones y unidades
          const selecciones = {};
          const unidades = {};
          
          // Array para almacenar los valores nutricionales de los alimentos específicos
          let totalNutritionalValues = {
            energia: 0,
            proteinas: 0,
            hidratos_carbono: 0,
            lipidos: 0,
            sodio: 0,
            potasio: 0,
            fosforo: 0
          };
          
          // Procesar cada entrada de selección
          for (const seleccion of response.data) {
            // Depurar cada selección
            console.log(`Selección encontrada: ${seleccion.alimento_original} -> ${seleccion.alimento_nombre}`);
            
            // Mapear alimento original a alimento específico
            selecciones[seleccion.alimento_original] = seleccion.alimento_nombre;
            
            // Formatear texto de unidad
            const unidadTexto = `${seleccion.cantidad} ${seleccion.unidad_nombre}`;
            unidades[seleccion.alimento_nombre] = unidadTexto;
            
            // Obtener valores nutricionales para este alimento específico
            try {
              // Obtener los datos nutricionales del alimento específico
              const foodResponse = await api.get(`alimentos/${seleccion.alimento_seleccionado}/`);
              if (foodResponse.data) {
                const food = foodResponse.data;
                
                // Calcular factor basado en cantidad y unidad
                const cantidad = parseFloat(seleccion.cantidad) || 1;
                
                // Obtener información de unidad si está disponible
                const unidadMedidaResponse = await api.get(`unidades-medida/${seleccion.unidad_medida}/`);
                const unidad = unidadMedidaResponse.data || {};
                
                const esLiquido = food.nombre.toLowerCase().includes('leche') || 
                                 food.nombre.toLowerCase().includes('jugo') || 
                                 food.es_liquido;
                
                // Determinar factor de conversión
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
                
                // Sumar los valores nutricionales de este alimento a los totales
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
            
            console.log("Estableciendo valores nutricionales calculados:", totalNutritionalValues);
            setValoresNutricionales(totalNutritionalValues);
            
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
            
            setRenderKey(`selections-loaded-${Date.now()}`);
          }
        } else {
          console.log("No se encontraron selecciones específicas para este análisis.");
        }
      } catch (error) {
        console.error("Error al cargar selecciones específicas:", error);
        console.error("Detalles:", JSON.stringify({
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          method: error.config?.method,
          url: error.config?.url
        }));
      }
    };
    
    if (analisisId) {
      console.log(`Intentando cargar selecciones para análisis ${analisisId}, isReadOnly: ${isReadOnly}`);
      fetchSeleccionesEspecificas();
    }
  }, [analisisId, isReadOnly]);

  // Actualizar la URL de la imagen cuando los resultados están disponibles
  useEffect(() => {
    if (results) {
      // Verificar todas las posibles ubicaciones para la URL de la imagen
      const imageSource = results.url_imagen || 
                          results.imagen_analizada || 
                          (results.texto_original && results.texto_original.imagen_analizada);
      
      if (imageSource) {
        console.log("Imagen analizada encontrada:", imageSource);
        // Asegurarse de usar la URL completa con dominio
        const imageUrl = getImageUrl(imageSource);
        console.log("URL de imagen procesada:", imageUrl);
        setServerImageUrl(imageUrl);
        
        // Precargar imagen para verificar que se carga correctamente
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
      
      // Primero verificar si ya tenemos un nombre específico del backend
      setTimeout(() => {
        if (results.nombre) {
          // Si ya tenemos un nombre específico del backend, usarlo
          setPlatoDetectado(results.nombre);
        } else {
          // De lo contrario, usar la lógica existente
          const alimentos = alimentosChilenos.length > 0 ? alimentosChilenos : [];
          
          // Primero verificar si hay un nombre de plato predefinido de la API
          if (results.plato_detectado) {
            setPlatoDetectado(results.plato_detectado);
          } 
          // Si tenemos un tipo de plato especificado en el texto_original
          else if (results.texto_original?.tipo_plato) {
            setPlatoDetectado(results.texto_original.tipo_plato);
          }
          else if (alimentos.length > 0) {
            // Lógica mejorada para generar nombre de plato 
            const ingredientesOrdenados = [...alimentos]; 
            
            // Patrones comunes de platos chilenos
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
            
            // Verificar si alguno de nuestros patrones coincide con los alimentos detectados
            let nombrePlato = null;
            
            // Buscar coincidencias de patrones
            for (const [clave, generadorNombre] of Object.entries(patronesPlatos)) {
              if (ingredientesOrdenados.some(ingrediente => 
                  ingrediente.toLowerCase().includes(clave.toLowerCase()))) {
                nombrePlato = generadorNombre(ingredientesOrdenados.map(i => i.toLowerCase()));
                break;
              }
            }
            
            // Si ningún patrón coincide, volver a la lógica original
            if (!nombrePlato) {
              if (alimentos.length === 1) {
                nombrePlato = alimentos[0]; // Elemento único
              } else {
                // Crear un nombre combinado para múltiples elementos
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
    // Omitir este efecto si el usuario ya ha seleccionado un alimento específico
    if (userHasSelectedFood) {
      console.log("Omitiendo carga de valores iniciales porque el usuario ya ha hecho una selección");
      return;
    }

    if (results && alimentosChilenos.length > 0) {
      const actualizarValores = async () => {
        try {
          console.log("Cargando valores nutricionales iniciales desde el servicio...");
          const resultadoActualizacion = await alimentosService.actualizarValoresNutricionales({
            alimentos_detectados: alimentosChilenos,
            totales: results.totales // Pasar los totales de la IA como respaldo
          });
          
          if (resultadoActualizacion.alimentosActualizados.length > 0 || resultadoActualizacion.fuenteValores === 'estimacion_ia') {
            // Convertir todos los valores a números antes de actualizar el estado
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
            
            // Actualizar la compatibilidad con valores numéricos garantizados y límites
            setCompatibilidad({
              sodio: {
                compatible: valoresConvertidos.sodio < 570,
                valor: valoresConvertidos.sodio,
              },
              potasio: {
                compatible: valoresConvertidos.potasio < 700,
                valor: valoresConvertidos.potasio,
              },
              fosforo: {
                compatible: valoresConvertidos.fosforo < 330,
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
  }, [results, alimentosChilenos, userHasSelectedFood]);

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
    // No permitir selección en modo de solo lectura
    if (isReadOnly) {
      return;
    }
    
    setAlimentoSeleccionando(alimento);
    setShowVariantSelector(true);
  };
  
  // Función para manejar la selección de una variante específica
  const handleSelectVarianteEspecifica = (varianteSeleccionada) => {
    setShowVariantSelector(false);
    
    if (varianteSeleccionada) {
      if (varianteSeleccionada.id) {
        // Establecer el indicador a verdadero cuando el usuario selecciona un alimento específico
        const isFirstSelection = !userHasSelectedFood;
        setUserHasSelectedFood(true);
        
        // Cuando se selecciona un alimento específico con ID, actualizamos la fuente a 'base_datos'
        // ya que proviene directamente de la base de datos
        setFuenteValoresNutricionales('base_datos');
        
        // Debug log para verificar valores
        console.log("VALORES DEL ALIMENTO SELECCIONADO:", 
          JSON.stringify(varianteSeleccionada, null, 2));
        
        // Actualizar la selección específica para este alimento
        setSeleccionesEspecificas(prev => {
          const updatedSelections = {
            ...prev,
            [alimentoSeleccionando]: varianteSeleccionada.nombre
          };
          
          // Guardar selecciones en el análisis si tenemos un ID
          if (analisisId) {
            saveSelectionsToPastAnalysis(updatedSelections, foodsWithUnits);
          }
          
          return updatedSelections;
        });

        // Rastrear unidades y cantidades seleccionadas para mostrar
        let unidadTexto = "100g/ml"; // Valor por defecto
        
        if (varianteSeleccionada.unidad_seleccionada) {
          const cantidad = varianteSeleccionada.cantidad_seleccionada || 1;
          const unidadNombre = varianteSeleccionada.unidad_seleccionada.abreviacion || 
                              varianteSeleccionada.unidad_seleccionada.nombre || 
                              "unidades";
          
          // Formatear cantidad sin decimales innecesarios
          const cantidadFormateada = cantidad % 1 === 0 ? cantidad.toString() : cantidad.toFixed(2).replace(/\.?0+$/, '');
          unidadTexto = `${cantidadFormateada} ${unidadNombre}`;
        }
        
        // Almacenar la información de cantidad y unidad con el alimento
        setFoodsWithUnits(prev => {
          const updatedFoodsWithUnits = {
            ...prev,
            [varianteSeleccionada.nombre]: unidadTexto
          };
          
          // También guardar las unidades actualizadas
          if (analisisId) {
            saveSelectionsToPastAnalysis(seleccionesEspecificas, updatedFoodsWithUnits);
          }
          
          return updatedFoodsWithUnits;
        });
        
        // Usar los valores ajustados directamente si están disponibles
        let nuevosValores;
        
        if (varianteSeleccionada.valores_ajustados) {
          // Usar valores precalculados basados en cantidad y unidad seleccionada
          nuevosValores = {
            energia: parseNumeric(varianteSeleccionada.valores_ajustados.energia || varianteSeleccionada.energia),
            proteinas: parseNumeric(varianteSeleccionada.valores_ajustados.proteinas || varianteSeleccionada.proteinas),
            hidratos_carbono: parseNumeric(varianteSeleccionada.valores_ajustados.hidratos_carbono || varianteSeleccionada.hidratos_carbono),
            lipidos: parseNumeric(varianteSeleccionada.valores_ajustados.lipidos || varianteSeleccionada.lipidos_totales || varianteSeleccionada.lipidos),
            sodio: parseNumeric(varianteSeleccionada.valores_ajustados.sodio),
            potasio: parseNumeric(varianteSeleccionada.valores_ajustados.potasio),
            fosforo: parseNumeric(varianteSeleccionada.valores_ajustados.fosforo)
          };
          
          console.log("Usando valores ajustados con unidad y cantidad:", nuevosValores);
        } else {
          // Fallback a valores directos (que no debería ocurrir ya que siempre agregamos valores ajustados)
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
        
        // Crear una instantánea directa del estado anterior para evitar problemas de cierre
        const prevState = { ...valoresNutricionales };
        
        // Verificar si es un reemplazo
        const alimentoAnterior = alimentosActualizados.find(a => a.nombreOriginal === alimentoSeleccionando);
        
        // Si es la primera selección, siempre reemplazamos por completo los valores iniciales
        let newValues;
        
        if (isFirstSelection) {
          // En la primera selección siempre usar solo los valores del alimento seleccionado
          newValues = { ...nuevosValores };
          console.log("PRIMERA SELECCIÓN: Reemplazando valores iniciales con:", nuevosValores);
        } else {
          // Para selecciones posteriores, aplicar lógica normal de reemplazo
          if (alimentoAnterior && alimentoAnterior.info && alimentoAnterior.info.valores_ajustados) {
            // Restar valores anteriores y agregar nuevos
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
            // Solo agregar los nuevos valores al total existente
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
        
        // Asegurar que los valores siempre sean numéricos con parseNumeric
        const safeNewValues = {
          energia: parseNumeric(newValues.energia),
          proteinas: parseNumeric(newValues.proteinas),
          hidratos_carbono: parseNumeric(newValues.hidratos_carbono),
          lipidos: parseNumeric(newValues.lipidos),
          sodio: parseNumeric(newValues.sodio),
          potasio: parseNumeric(newValues.potasio),
          fosforo: parseNumeric(newValues.fosforo)
        };
        
        // Establecer los nuevos valores directamente (evitando el patrón de actualización funcional para garantizar actualización inmediata)
        setValoresNutricionales(safeNewValues);
        
        // Actualizar renderKey para forzar la actualización del componente - hacerlo más único con todos los valores
        const newKey = `nutrition-${Date.now()}-${safeNewValues.sodio}-${safeNewValues.potasio}-${safeNewValues.fosforo}`;
        setRenderKey(newKey);
        console.log("Updated renderKey to:", newKey);
        
        // Actualizar compatibilidad inmediatamente con un objeto directo (no actualización funcional)
        const newCompatibilidad = {
          sodio: { 
            compatible: safeNewValues.sodio < 570,
            valor: safeNewValues.sodio,
          },
          potasio: {
            compatible: safeNewValues.potasio < 700,
            valor: safeNewValues.potasio,
          },
          fosforo: {
            compatible: safeNewValues.fosforo < 330,
            valor: safeNewValues.fosforo,
          }
        };
        
        // Establecer directamente en lugar de usar updateCompatibilidadSafely para actualización inmediata
        setCompatibilidad(newCompatibilidad);
        console.log("Actualización directa de compatibilidad:", JSON.stringify(newCompatibilidad, null, 2));

        // Registrar los valores actualizados para depuración
        console.log("Valores nutricionales ACTUALIZADOS:", safeNewValues);
        
        // Guardar el alimento modificado con valores ajustados actualizados
        const alimentoConValores = {
          ...varianteSeleccionada,
          valores_ajustados: nuevosValores
        };
        
        // Almacenar esto en nuestros alimentos actualizados
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
        // Usar el nombre real del alimento seleccionado en lugar de texto genérico
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

  // Función para guardar selecciones en análisis previos
  const saveSelectionsToPastAnalysis = async (selections, units) => {
    if (!analisisId || isReadOnly || !userToken) {
      return; // No guardar si no hay ID, está en modo de solo lectura, o no se ha iniciado sesión
    }
    
    try {
      console.log(`Guardando selecciones para análisis ${analisisId}...`);
      
      // Obtener el estado actual de selecciones y unidades para asegurarnos de no perder datos
      const currentSelections = { ...seleccionesEspecificas };
      const currentUnits = { ...foodsWithUnits };
      
      // Crear una carga útil con ambas selecciones y unidades (fusionadas con el estado actual)
      const payload = {
        id: analisisId,
        seleccionesEspecificas: { ...currentSelections, ...selections },
        foodsWithUnits: { ...currentUnits, ...units }
      };
      
      // Verificar si el endpoint está definido antes de intentar usarlo
      if (!ENDPOINTS.ANALISIS_IMAGEN) {
        console.warn("Endpoint ANALISIS_IMAGEN no está definido, no se pueden guardar las selecciones");
        return;
      }
      
      // Usar el formato correcto de endpoint
      const url = `${ENDPOINTS.ANALISIS_IMAGEN}/${analisisId}/`;
      console.log("Guardando en URL:", url);
      
      // Registrar la carga útil para depuración
      console.log("Con carga útil:", JSON.stringify(payload));
      
      // Enviar la solicitud de actualización
      await api.patch(url, payload);
    } catch (error) {
      console.error("Error al guardar selecciones de alimentos:", error);
      console.error("Detalles del error:", JSON.stringify({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      }));
      // No mostrar un error al usuario ya que esta es una operación en segundo plano
    }
  };

  // Helpers para navegación
  const handleScanAgain = () => navigation.navigate('Home', { screen: 'QRScanner' });
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

  // Obtener los resultados del análisis de texto
  const analisisTexto = results?.texto_original || {};

  // Renderizado principal
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
        alimentosActualizados={alimentosActualizados}
      />
      
      {/* Botones inferiores - Mostrar diferentes opciones en modo de solo lectura */}
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
      
      {/* Modales - Solo se muestran cuando no está en modo de solo lectura */}
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
            analisisId={analisisId}
          />
        </>
      )}
      
      {/* Overlay de carga */}
      {loading && <LoadingOverlay />}
    </SafeAreaView>
  );
}

// Actualizar la función para verificar compatibilidad con los límites por comida
const updateCompatibilidadSafely = (safeNewValues) => {
  return {
    sodio: {
      compatible: safeNewValues.sodio < 570, // Umbral de sodio por comida
      valor: safeNewValues.sodio,
      porcentajeUmbral: Math.min(100, Math.round((safeNewValues.sodio / 570) * 100))
    },
    potasio: {
      compatible: safeNewValues.potasio < 700, // Umbral de potasio por comida
      valor: safeNewValues.potasio,
      porcentajeUmbral: Math.min(100, Math.round((safeNewValues.potasio / 700) * 100))
    },
    fosforo: {
      compatible: safeNewValues.fosforo < 330, // Umbral de fósforo por comida
      valor: safeNewValues.fosforo,
      porcentajeUmbral: Math.min(100, Math.round((safeNewValues.fosforo / 330) * 100))
    }
  };
};

