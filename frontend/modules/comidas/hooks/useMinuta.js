import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import api from '../../../api';
import { calcularCalorias } from '../../../utils/calculosNutricionales';

export default function useMinuta() {
  const [loading, setLoading] = useState(true);
  const [minutas, setMinutas] = useState([]);
  const [selectedMinuta, setSelectedMinuta] = useState(null);
  const [error, setError] = useState(null);
  const [tienePerfil, setTienePerfil] = useState(true);
  const [pacienteData, setPacienteData] = useState(null);
  const [minutasDisponibles, setMinutasDisponibles] = useState([]);
  
  // Inicializar currentDay con el día actual de la semana (1-7)
  const today = new Date();
  let dayOfWeek = today.getDay();
  dayOfWeek = dayOfWeek === 0 ? "7" : String(dayOfWeek); // Convertir domingo (0) a "7"
  const [currentDay, setCurrentDay] = useState(dayOfWeek);
  
  const [comidas, setComidas] = useState([]);
  const [tiposComida, setTiposComida] = useState([]);
  const [mostrarSolicitud, setMostrarSolicitud] = useState(false);
  const [restricciones, setRestricciones] = useState({
    bajo_en_sodio: false,
    bajo_en_potasio: false,
    bajo_en_fosforo: false,
    bajo_en_proteinas: false
  });
  
  // Para manejar la vista de detalles de comida
  const [comidaSeleccionada, setComidaSeleccionada] = useState(null);
  const [mostrarDetalleComida, setMostrarDetalleComida] = useState(false);

  useEffect(() => {
    fetchMinutas();
    fetchTiposComida();
  }, []);

  useEffect(() => {
    // Cuando cambia el día seleccionado O la minuta seleccionada, actualizar las comidas
    if (selectedMinuta) {
      console.log(`Efecto detectado: cambio de día (${currentDay}) o minuta (${selectedMinuta.id})`);
      fetchComidasPorDia(selectedMinuta.minuta, currentDay.toString()); // Convertir a string para coincidir con el formato de la API
    }
  }, [currentDay, selectedMinuta]);

  const fetchTiposComida = async () => {
    try {
      const response = await api.get('/comidas-tipo/');
      setTiposComida(response.data);
    } catch (error) {
      console.error('Error al cargar tipos de comida:', error);
      setTiposComida([]);
    }
  };

  const fetchMinutas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener ID de persona del usuario actual
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        setError('No se pudo identificar al usuario');
        setLoading(false);
        return;
      }
      
      const { persona_id } = JSON.parse(userData);
      
      // Primero, verificar si el usuario tiene perfil médico
      try {
        const perfilResponse = await api.get(`/perfiles-medicos/?id_persona=${persona_id}`);
        
        if (perfilResponse.data.length === 0) {
          setTienePerfil(false);
          setLoading(false);
          return;
        }
        
        setPacienteData(perfilResponse.data[0]);
      } catch (error) {
        console.error('Error verificando perfil médico:', error);
        setTienePerfil(false);
        setLoading(false);
        return;
      }
      
      // Cargar minutas activas del usuario desde minutas-nutricionales
      const response = await api.get(`/minutas-nutricionales/?id_persona=${persona_id}&estado=activa`);
      const minutasActivas = response.data;
      
      console.log(`Se encontraron ${minutasActivas.length} minutas activas para el paciente`);
      
      // Si hay minutas, verificar vigencia
      if (minutasActivas.length > 0) {
        const minutaVigente = verificarVigenciaMinutas(minutasActivas);
        
        if (minutaVigente) {
          console.log(`Minuta vigente encontrada: ${minutaVigente.id} (${minutaVigente.minuta_nombre})`);
          setMinutas(minutasActivas);
          setSelectedMinuta(minutaVigente);
          fetchComidasPorDia(minutaVigente.minuta, currentDay);
        } else {
          console.log('No hay minutas vigentes, buscando una nueva minuta apropiada');
          // Buscar una nueva minuta apropiada
          await asignarNuevaMinuta(persona_id);
        }
      } else {
        // No tiene minutas asignadas
        console.log('No se encontraron minutas asignadas, cargando minutas disponibles');
        await cargarMinutasDisponibles();
        setMinutas([]);
      }
    } catch (error) {
      console.error('Error al cargar minutas:', error);
      setError('No se pudieron cargar las minutas nutricionales');
    } finally {
      setLoading(false);
    }
  };

  const verificarVigenciaMinutas = (minutas) => {
    const today = new Date();
    
    // Encontrar la primera minuta vigente
    for (const minuta of minutas) {
      const fechaVigencia = new Date(minuta.fecha_vigencia);
      if (fechaVigencia >= today) {
        return minuta;
      }
    }
    
    return null; // No hay minutas vigentes
  };

  const asignarNuevaMinuta = async (personaId) => {
    try {
      // Cargar minutas disponibles si no se han cargado ya
      if (minutasDisponibles.length === 0) {
        await cargarMinutasDisponibles();
      }
      
      // Obtener perfil médico si no lo tenemos
      if (!pacienteData) {
        const perfilResponse = await api.get(`/perfiles-medicos/?id_persona=${personaId}`);
        if (perfilResponse.data && perfilResponse.data.length > 0) {
          setPacienteData(perfilResponse.data[0]);
        } else {
          setTienePerfil(false);
          return;
        }
      }
      
      // Buscar una minuta apropiada basada en el perfil médico y restricciones
      const minutaApropiada = encontrarMinutaApropiada();
      
      if (minutaApropiada) {
        console.log(`Minuta apropiada encontrada: ${minutaApropiada.id} (${minutaApropiada.nombre})`);
        
        // Asignar la minuta al paciente usando la tabla minutas-nutricionales
        const today = new Date();
        const vigencia = new Date();
        vigencia.setDate(today.getDate() + 7); // 7 días de vigencia
        
        const nuevaMinutaNutricional = {
          minuta_nombre: minutaApropiada.nombre,
          fecha_creacion: today.toISOString().split('T')[0],
          fecha_vigencia: vigencia.toISOString().split('T')[0],
          estado: 'activa',
          id_persona: personaId,
          minuta: minutaApropiada.id
        };
        
        console.log('Creando nueva asignación de minuta nutricional:', nuevaMinutaNutricional);
        const response = await api.post('/minutas-nutricionales/', nuevaMinutaNutricional);
        
        // Actualizar estado
        setSelectedMinuta(response.data);
        setMinutas([response.data]);
        fetchComidasPorDia(response.data.minuta, currentDay);
        
        return response.data;
      } else {
        console.log('No se encontró una minuta apropiada');
        // No se encontró minuta apropiada
        setError('No se encontró una minuta que cumpla con sus requerimientos nutricionales');
        return null;
      }
    } catch (error) {
      console.error('Error al asignar nueva minuta:', error);
      setError('No se pudo asignar una nueva minuta');
      throw error;
    }
  };

  const cargarMinutasDisponibles = async () => {
    try {
      const response = await api.get('/minutas/');
      console.log(`Minutas disponibles cargadas: ${response.data.length}`);
      setMinutasDisponibles(response.data);
      return response.data;
    } catch (error) {
      console.error('Error cargando minutas disponibles:', error);
      setError('No se pudieron cargar las minutas disponibles');
      return [];
    }
  };

  const calcularCaloriasPaciente = () => {
    if (!pacienteData) {
      console.log("Error: No hay datos del paciente disponibles");
      return 1600; // Valor por defecto si no hay datos del paciente
    }

    // Asegurarnos de que tenemos todos los datos necesarios
    const genero = pacienteData.genero || 'Masculino';
    const peso = parseFloat(pacienteData.peso) || 70;
    const altura = parseFloat(pacienteData.altura) || 1.70;
    const edad = pacienteData.edad || 40;
    const nivelActividad = pacienteData.nivel_actividad || 'moderado';
    
    console.log(`Calculando calorías para: genero=${genero}, peso=${peso}, altura=${altura}, edad=${edad}, nivel=${nivelActividad}`);
    
    // Usar la función común de cálculo de calorías con ajuste renal y categorización
    return calcularCalorias(genero, peso, altura, edad, nivelActividad, true, true);
  };

  const encontrarMinutaApropiada = () => {
    if (!pacienteData || minutasDisponibles.length === 0) {
      console.log('No hay datos de paciente o minutas disponibles para hacer la selección');
      return null;
    }
    
    console.log('Buscando minuta apropiada para el paciente con estas restricciones:', restricciones);
    
    try {
      // Calcular calorías necesarias para el paciente
      const caloriasPaciente = calcularCaloriasPaciente();
      console.log(`Calorías calculadas para el paciente: ${caloriasPaciente}`);
      
      // Buscar la minuta más cercana a las calorías necesarias que cumpla con restricciones
      let mejorMinuta = null;
      let menorDiferencia = Infinity;
      
      for (const minuta of minutasDisponibles) {
        // Verificar restricciones dietéticas
        if (restricciones.bajo_en_sodio && !minuta.bajo_en_sodio) {
          console.log(`Minuta ${minuta.id} descartada: requiere bajo en sodio`);
          continue;
        }
        if (restricciones.bajo_en_potasio && !minuta.bajo_en_potasio) {
          console.log(`Minuta ${minuta.id} descartada: requiere bajo en potasio`);
          continue;
        }
        if (restricciones.bajo_en_fosforo && !minuta.bajo_en_fosforo) {
          console.log(`Minuta ${minuta.id} descartada: requiere bajo en fósforo`);
          continue;
        }
        if (restricciones.bajo_en_proteinas && !minuta.bajo_en_proteinas) {
          console.log(`Minuta ${minuta.id} descartada: requiere bajo en proteínas`);
          continue;
        }
        
        // Verificar tipo de diálisis si está disponible en los datos del paciente
        if (pacienteData.tipo_dialisis && 
            minuta.tipo_dialisis !== 'ambas' && 
            minuta.tipo_dialisis !== pacienteData.tipo_dialisis) {
          console.log(`Minuta ${minuta.id} descartada: tipo de diálisis incompatible`);
          continue;
        }
        
        // Calcular diferencia de calorías
        const minutaCalorias = parseFloat(minuta.calorias);
        const difCalorias = Math.abs(minutaCalorias - caloriasPaciente);
        
        console.log(`Minuta ${minuta.id}: ${minutaCalorias} cal, diferencia: ${difCalorias} cal`);
        
        // Si está dentro del rango ±300 calorías y es mejor que la anterior (aumentamos la tolerancia)
        if (difCalorias <= 300 && difCalorias < menorDiferencia) {
          mejorMinuta = minuta;
          menorDiferencia = difCalorias;
          console.log(`Nueva mejor minuta: ${minuta.id} con diferencia de ${difCalorias} cal`);
        }
      }
      
      return mejorMinuta;
    } catch (error) {
      console.error("Error en encontrarMinutaApropiada:", error);
      return null;
    }
  };

  const fetchComidasPorDia = async (minutaId, dia) => {
    try {
      console.log(`🍽️ Cargando comidas para minuta ${minutaId}, día ${dia}`);
      setLoading(true);
      
      // Asegurar que el día sea un string para coincidir con el formato de la API
      const diaParam = String(dia);
      
      // Obtener todas las comidas de la minuta para el día específico
      const response = await api.get(`/detalles-minuta/?minuta_id=${minutaId}&dia_semana=${diaParam}`);
      
      const comidasDia = response.data;
      console.log(`🍽️ Se encontraron ${comidasDia.length} comidas para el día ${dia}`);
      
      // Verificar si todas las comidas son para el día correcto
      const comidasFiltradas = comidasDia.filter(comida => comida.dia_semana === diaParam);
      
      if (comidasFiltradas.length !== comidasDia.length) {
        console.warn(`⚠️ API devolvió comidas para días diferentes. Filtrando solo día ${diaParam}`);
      }
      
      console.log(`📊 Distribución de comidas por tipo:`);
      const tipoCount = {};
      comidasFiltradas.forEach(comida => {
        tipoCount[comida.comida_tipo] = (tipoCount[comida.comida_tipo] || 0) + 1;
      });
      
      Object.entries(tipoCount).forEach(([tipo, count]) => {
        console.log(`   Tipo ${tipo}: ${count} comida(s)`);
      });
      
      setComidas(comidasFiltradas);
    } catch (error) {
      console.error('Error al cargar comidas por día:', error);
      setComidas([]);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Filtra las comidas para mostrar solo una opción por tipo
   * Si hay restricciones, selecciona la que mejor se adapte
   */
  const filtrarMejoresOpcionesComida = (comidas) => {
    if (!comidas || comidas.length === 0) return [];
    
    const tipoComidaMap = {};
    const restriccionesActivas = Object.entries(restricciones)
      .filter(([key, value]) => value)
      .map(([key]) => key);
      
    console.log(`🥗 Filtrando con restricciones activas: ${restriccionesActivas.join(', ') || 'ninguna'}`);
    
    // Agrupar comidas por tipo
    comidas.forEach(comida => {
      const tipoId = comida.comida_tipo;
      
      if (!tipoComidaMap[tipoId]) {
        tipoComidaMap[tipoId] = [];
      }
      
      tipoComidaMap[tipoId].push(comida);
    });
    
    // Seleccionar la mejor opción para cada tipo
    const mejoresOpciones = [];
    
    Object.entries(tipoComidaMap).forEach(([tipoId, comidasDelTipo]) => {
      if (comidasDelTipo.length === 1) {
        // Si solo hay una opción, usar esa
        mejoresOpciones.push(comidasDelTipo[0]);
      } else if (comidasDelTipo.length > 1) {
        // Si hay múltiples opciones y tenemos restricciones, seleccionar la primera
        // En una implementación futura, podríamos elegir la más adecuada según restricciones
        console.log(`NOTA: Se encontraron ${comidasDelTipo.length} opciones para el tipo ${tipoId}. Mostrando solo la primera.`);
        mejoresOpciones.push(comidasDelTipo[0]);
      }
    });
    
    return mejoresOpciones;
  };

  const handleSelectMinuta = (minuta) => {
    console.log(`Minuta seleccionada: ${minuta.id}`);
    setSelectedMinuta(minuta);
    fetchComidasPorDia(minuta.minuta, currentDay);
  };

  const handleVerDetalleComida = (comida) => {
    console.log(`Ver detalle de comida: ${comida.id || comida.name}`);
    setComidaSeleccionada(comida);
    setMostrarDetalleComida(true);
  };

  const handleCerrarDetalleComida = () => {
    setMostrarDetalleComida(false);
    setComidaSeleccionada(null);
  };

  const handleSolicitarMinuta = () => {
    console.log('Solicitando nueva minuta');
    setMostrarSolicitud(true);
  };

  const handleCancelarSolicitud = () => {
    setMostrarSolicitud(false);
    // Restaurar las restricciones a valores iniciales
    setRestricciones({
      bajo_en_sodio: false,
      bajo_en_potasio: false,
      bajo_en_fosforo: false,
      bajo_en_proteinas: false
    });
  };

  const handleCambiarRestriccion = (restriccion, valor) => {
    console.log(`Cambiando restricción ${restriccion}: ${valor}`);
    setRestricciones(prev => ({
      ...prev,
      [restriccion]: valor
    }));
  };

  const handleConfirmarSolicitud = async () => {
    try {
      setLoading(true);
      
      // Obtener los datos del usuario
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        throw new Error("No se encontró información del usuario");
      }
      
      const { persona_id } = JSON.parse(userData);
      if (!persona_id) {
        throw new Error("ID de persona no disponible");
      }
      
      console.log('Confirmando solicitud de minuta con restricciones:', restricciones);
      
      // Intentar asignar una minuta apropiada basada en las restricciones seleccionadas
      const minutaAsignada = await asignarNuevaMinuta(persona_id);
      
      if (minutaAsignada) {
        setMostrarSolicitud(false);
        Alert.alert('Éxito', 'Se ha asignado una nueva minuta nutricional adaptada a tus necesidades');
      } else {
        Alert.alert('Error', 'No se encontró una minuta que cumpla con tus requisitos. Por favor, contacta a tu nutricionista o selecciona menos restricciones.');
      }
    } catch (error) {
      console.error('Error al solicitar minuta:', error);
      Alert.alert('Error', 'No se pudo asignar la minuta nutricional');
    } finally {
      setLoading(false);
    }
  };

  // Restauramos la función para cambiar de día y aseguramos que actualice las comidas
  const handleChangeDay = (newDay) => {
    console.log(`🔄 Cambiando al día: ${newDay}`);
    setCurrentDay(newDay);
    
    // Forzamos la recarga de comidas para el nuevo día
    if (selectedMinuta) {
      fetchComidasPorDia(selectedMinuta.minuta, newDay);
    }
  };

  return {
    loading,
    minutas,
    selectedMinuta,
    error,
    tienePerfil,
    pacienteData,
    currentDay,
    comidas,
    tiposComida,
    mostrarSolicitud,
    restricciones,
    comidaSeleccionada,
    mostrarDetalleComida,
    handleSelectMinuta,
    handleChangeDay, // Volvemos a exportar esta función
    handleVerDetalleComida,
    handleCerrarDetalleComida,
    handleSolicitarMinuta,
    handleCancelarSolicitud,
    handleCambiarRestriccion,
    handleConfirmarSolicitud,
    refreshMinutas: fetchMinutas
  };
}
