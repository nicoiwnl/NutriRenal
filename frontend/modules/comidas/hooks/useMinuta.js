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
  const [compatibilidadMinuta, setCompatibilidadMinuta] = useState(null);

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
      console.log(`👤 Verificando minutas para persona_id: ${persona_id}`);
      
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
      // Añadiendo parámetro exacto para filtrado preciso y validación
      console.log(`📋 Solicitando minutas para persona_id=${persona_id} con filtrado exacto`);
      const response = await api.get(`/minutas-nutricionales/?id_persona=${persona_id}&estado=activa&exact_match=true`);
      const minutasActivas = response.data;
      
      console.log(`🔍 Se encontraron ${minutasActivas.length} minutas activas para el paciente ${persona_id}`);
      
      // Validación adicional: verificar que las minutas realmente pertenecen a esta persona
      const minutasFiltradas = minutasActivas.filter(minuta => 
        minuta.id_persona && minuta.id_persona === persona_id
      );
      
      if (minutasFiltradas.length !== minutasActivas.length) {
        console.warn(`⚠️ ADVERTENCIA: Se filtraron ${minutasActivas.length - minutasFiltradas.length} minutas que no pertenecen al usuario`);
      }
      
      console.log(`✅ Después del filtrado manual, quedan ${minutasFiltradas.length} minutas válidas`);
      
      // Si hay minutas, verificar vigencia
      if (minutasFiltradas.length > 0) {
        const minutaVigente = verificarVigenciaMinutas(minutasFiltradas);
        
        if (minutaVigente) {
          console.log(`📋 Minuta vigente encontrada: ${minutaVigente.id} (${minutaVigente.minuta_nombre})`);
          // Verificación adicional: confirmar que la minuta pertenece al usuario actual
          if (minutaVigente.id_persona !== persona_id) {
            console.error(`🚫 ERROR DE SEGURIDAD: La minuta ${minutaVigente.id} no pertenece al usuario ${persona_id}`);
            setError('Error de seguridad: la minuta no pertenece al usuario actual');
            setMinutas([]);
            setSelectedMinuta(null);
            setComidas([]);
          } else {
            console.log(`✅ Verificación de propiedad correcta para minuta ${minutaVigente.id}`);
            setMinutas(minutasFiltradas);
            setSelectedMinuta(minutaVigente);
            fetchComidasPorDia(minutaVigente.minuta, currentDay);
          }
        } else {
          console.log('No hay minutas vigentes, buscando una nueva minuta apropiada');
          // Buscar una nueva minuta apropiada
          await asignarNuevaMinuta(persona_id);
        }
      } else {
        // No tiene minutas asignadas - LIMPIAR TODOS LOS ESTADOS RELACIONADOS
        console.log(`Usuario ${persona_id} no tiene minutas asignadas, limpiando estados`);
        await cargarMinutasDisponibles();
        setMinutas([]);
        setSelectedMinuta(null);
        setComidas([]);
      }
    } catch (error) {
      console.error('Error al cargar minutas:', error);
      setError('No se pudieron cargar las minutas nutricionales');
      // También limpiar estados en caso de error
      setMinutas([]);
      setSelectedMinuta(null);
      setComidas([]);
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
      const minutaApropiada = await encontrarMinutaApropiada();
      
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

  // Convertir esta función a async
  const encontrarMinutaApropiada = async () => {
    // Añadir más logs para entender el problema
    console.log(`DEBUG: Estado de pacienteData:`, pacienteData ? 'disponible' : 'no disponible');
    console.log(`DEBUG: minutasDisponibles.length = ${minutasDisponibles.length}`);
    
    if (!pacienteData) {
      console.log('No hay datos de paciente para hacer la selección');
      return null;
    }
    
    if (minutasDisponibles.length === 0) {
      console.log('No hay minutas disponibles para hacer la selección');
      return null;
    }
    
    console.log(`Buscando minuta apropiada para el paciente con estas restricciones:`, restricciones);
    
    try {
      // Calcular calorías necesarias para el paciente
      const caloriasPaciente = calcularCaloriasPaciente();
      console.log(`Calorías calculadas para el paciente: ${caloriasPaciente}`);
      
      // CORRECCIÓN: Obtener el género directamente del perfil médico y los datos de la API
      // Fuente 1: Perfil médico - intentar acceder a la información completa del paciente
      let generoPaciente = '';
      
      // Verificar en pacienteData (del perfil médico)
      if (pacienteData?.genero) {
        generoPaciente = pacienteData.genero;
        console.log(`Obtenido género del paciente desde perfil médico: ${generoPaciente}`);
      }
      // Si no está en el perfil médico, intentar obtenerlo de los datos guardados en AsyncStorage
      else {
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const { persona_id } = JSON.parse(userData);
            
            // Hacer una solicitud adicional para obtener la información de la persona
            const personaResponse = await api.get(`/personas/${persona_id}/`);
            if (personaResponse.data?.genero) {
              generoPaciente = personaResponse.data.genero;
              console.log(`Obtenido género del paciente desde API personas: ${generoPaciente}`);
            }
          }
        } catch (asyncError) {
          console.error("Error obteniendo género del AsyncStorage:", asyncError);
        }
      }
      
      // Normalizar el género para comparación (a minúsculas)
      const generoPacienteNormalizado = generoPaciente.toLowerCase();
      console.log(`Género del paciente: ${generoPaciente} (normalizado: ${generoPacienteNormalizado})`);
      
      if (!generoPacienteNormalizado) {
        console.log("⚠️ ADVERTENCIA: No se pudo determinar el género del paciente. Se considerarán todas las minutas disponibles.");
      }
      
      // Buscar la minuta más cercana a las calorías necesarias que cumpla con restricciones
      let mejorMinuta = null;
      let menorDiferencia = Infinity;
      let compatibilidadInfo = {
        compatible: false,
        razon: "No hay minutas disponibles",
        porcentaje: 0,
        criteriosFallidos: []
      };
      
      // Mostrar información de todas las minutas disponibles para depuración
      console.log("Evaluando minutas disponibles:");
      minutasDisponibles.forEach((minuta, index) => {
        console.log(`[${index}] ID: ${minuta.id}, Nombre: ${minuta.nombre}, Calorías: ${minuta.calorias}, Tipo: ${minuta.tipo_dialisis}, Género: ${minuta.genero || 'No especificado'}`);
      });
      
      // CORRECCIÓN: Si solo hay 1 minuta disponible y el sistema tiene pocos datos, ser más flexible
      const soloUnaMinutaDisponible = minutasDisponibles.length === 1;
      
      // CORRECCIÓN: Primero filtrar minutas por género compatible, pero ser más flexible si hay pocas opciones
      let minutasGeneroCompatible = minutasDisponibles.filter(minuta => {
        const generoMinuta = (minuta.genero || '').toLowerCase();
        
        // Una minuta es compatible si:
        // - No especifica género (null/vacío)
        // - Indica "ambos" géneros
        // - Coincide con el género del paciente
        const esCompatibleGenero = !generoMinuta || 
                               generoMinuta === 'ambos' || 
                               generoMinuta === generoPacienteNormalizado;
        
        // Log más detallado para depuración
        if (!esCompatibleGenero) {
          console.log(`🚫 Minuta ${minuta.id} (${minuta.nombre}) descartada por incompatibilidad de género: ${minuta.genero} ≠ ${generoPaciente}`);
        } else {
          console.log(`✅ Minuta ${minuta.id} (${minuta.nombre}) es compatible por género: ${minuta.genero || 'No especificado'} con ${generoPaciente || 'No especificado'}`);
        }
        
        return esCompatibleGenero;
      });
      
      console.log(`Filtro inicial: ${minutasGeneroCompatible.length} de ${minutasDisponibles.length} minutas son compatibles con el género ${generoPaciente || 'No especificado'}`);
      
      // CORRECCIÓN: Si no hay minutas compatibles con el género pero solo hay 1 minuta disponible, usarla de todos modos
      if (minutasGeneroCompatible.length === 0 && soloUnaMinutaDisponible) {
        console.log("⚠️ No hay minutas compatibles con el género, pero solo hay una minuta disponible. Se usará como último recurso.");
        minutasGeneroCompatible = minutasDisponibles;
        
        // Actualizar información de compatibilidad para mostrar advertencia
        compatibilidadInfo = {
          compatible: false,
          razon: `Esta minuta no fue diseñada para tu género (${generoPaciente}), pero es la única disponible en este momento.`,
          porcentaje: 50,
          criteriosFallidos: ["genero"]
        };
      }
      // Si no hay minutas compatibles con el género, informar y retornar null
      else if (minutasGeneroCompatible.length === 0) {
        console.log("🚫 No hay minutas compatibles con el género del paciente");
        setCompatibilidadMinuta({
          compatible: false,
          razon: `No hay minutas disponibles para pacientes de género ${generoPaciente || 'No especificado'}`,
          porcentaje: 0,
          criteriosFallidos: ["genero"]
        });
        return null;
      }
      
      // Continuar evaluando SOLO las minutas de género compatible
      for (const minuta of minutasGeneroCompatible) {
        console.log(`Evaluando minuta: ${minuta.nombre} (${minuta.id})`);
        
        // Sistema de puntuación para calificar la compatibilidad (0-100%)
        let puntuacionTotal = 100;
        const criteriosFallidos = [];
        const puntosRestar = {
          bajo_en_sodio: 20,
          bajo_en_potasio: 20,
          bajo_en_fosforo: 20,
          bajo_en_proteinas: 20,
          tipo_dialisis: 30,
          calorias: 10
        };
        
        // Verificar restricciones dietéticas
        if (restricciones.bajo_en_sodio && !minuta.bajo_en_sodio) {
          puntuacionTotal -= puntosRestar.bajo_en_sodio;
          criteriosFallidos.push("bajo_en_sodio");
          console.log(`Minuta ${minuta.id} no es óptima: necesita restricción de sodio`);
        }
        if (restricciones.bajo_en_potasio && !minuta.bajo_en_potasio) {
          puntuacionTotal -= puntosRestar.bajo_en_potasio;
          criteriosFallidos.push("bajo_en_potasio");
          console.log(`Minuta ${minuta.id} no es óptima: necesita restricción de potasio`);
        }
        if (restricciones.bajo_en_fosforo && !minuta.bajo_en_fosforo) {
          puntuacionTotal -= puntosRestar.bajo_en_fosforo;
          criteriosFallidos.push("bajo_en_fosforo");
          console.log(`Minuta ${minuta.id} no es óptima: necesita restricción de fósforo`);
        }
        if (restricciones.bajo_en_proteinas && !minuta.bajo_en_proteinas) {
          puntuacionTotal -= puntosRestar.bajo_en_proteinas;
          criteriosFallidos.push("bajo_en_proteinas");
          console.log(`Minuta ${minuta.id} no es óptima: necesita restricción de proteínas`);
        }
        
        // Verificar tipo de diálisis si está disponible en los datos del paciente
        if (pacienteData.tipo_dialisis && 
            minuta.tipo_dialisis !== 'ambas' && 
            minuta.tipo_dialisis !== pacienteData.tipo_dialisis) {
          puntuacionTotal -= puntosRestar.tipo_dialisis;
          criteriosFallidos.push("tipo_dialisis");
          console.log(`Minuta ${minuta.id} no es óptima: tipo de diálisis incompatible`);
          console.log(`  Paciente: ${pacienteData.tipo_dialisis}, Minuta: ${minuta.tipo_dialisis}`);
        }
        
        // Calcular diferencia de calorías y convertirla en puntuación
        const minutaCalorias = parseFloat(minuta.calorias || 0);
        const difCalorias = Math.abs(minutaCalorias - caloriasPaciente);
        
        // MODIFICADO - Tolerancia reducida a ±100 calorías (antes ±500)
        if (difCalorias > 100) {
          puntuacionTotal -= puntosRestar.calorias;
          criteriosFallidos.push("calorias");
          console.log(`Minuta ${minuta.id} no es óptima: diferencia calórica de ${difCalorias} cal (tolerancia: 100 cal)`);
        }
        
        console.log(`Minuta ${minuta.id}: puntuación de compatibilidad ${puntuacionTotal}%`);
        
        // Decidimos selección basados en puntuación y diferencia calórica combinados
        const esCompatible = puntuacionTotal >= 70; // 70% o más se considera aceptable
        
        // NUEVO ALGORITMO: Seleccionamos la minuta con mayor puntuación de compatibilidad
        // En caso de empate, seleccionamos la de menor diferencia calórica
        if (mejorMinuta === null || 
            puntuacionTotal > compatibilidadInfo.porcentaje || 
            (puntuacionTotal === compatibilidadInfo.porcentaje && difCalorias < menorDiferencia)) {
          mejorMinuta = minuta;
          menorDiferencia = difCalorias;
          compatibilidadInfo = {
            compatible: esCompatible,
            razon: esCompatible 
              ? "Esta minuta es compatible con sus necesidades" 
              : `Esta minuta no es ideal (${puntuacionTotal}% compatible)`,
            porcentaje: puntuacionTotal,
            criteriosFallidos: criteriosFallidos
          };
          console.log(`Nueva mejor minuta: ${minuta.id} con puntuación ${puntuacionTotal}% y diferencia de ${difCalorias} cal`);
        }
      }
      
      // MODIFICADO - No devolver minuta si la compatibilidad es baja, EXCEPTO si es la única opción
      if (compatibilidadInfo.porcentaje < 50 && !soloUnaMinutaDisponible) {
        console.log("No se encontró minuta adecuada - la mejor opción tiene menos del 50% de compatibilidad.");
        setCompatibilidadMinuta(compatibilidadInfo);
        return null;
      }
      
      // Guardar información de compatibilidad para mostrar alertas
      setCompatibilidadMinuta(compatibilidadInfo);
      
      // Verificación final de género para mayor seguridad (omitir si solo hay una minuta)
      if (mejorMinuta && !soloUnaMinutaDisponible) {
        const generoMinuta = mejorMinuta.genero?.toLowerCase() || '';
        if (generoMinuta && generoMinuta !== 'ambos' && generoMinuta !== generoPacienteNormalizado && generoPacienteNormalizado) {
          console.log(`🚨 ALERTA DE SEGURIDAD: Minuta seleccionada con género incompatible: ${mejorMinuta.genero} ≠ ${generoPaciente}`);
          return null;
        }
      } else if (soloUnaMinutaDisponible && mejorMinuta) {
        console.log(`⚠️ Se utiliza la única minuta disponible (${mejorMinuta.nombre}) aunque no sea ideal para este paciente`);
      }
      
      return mejorMinuta;
    } catch (error) {
      console.error("Error en encontrarMinutaApropiada:", error);
      return null;
    }
  };

  const fetchComidasPorDia = async (minutaId, dia) => {
    try {
      // Verificar que realmente tenemos una minuta válida para este usuario
      if (!minutaId) {
        console.log('⚠️ Intento de cargar comidas sin una minuta válida');
        setComidas([]);
        return;
      }
      
      // Validación adicional: verificar que el usuario tiene permitido acceder a esta minuta
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        console.error('🚫 No hay datos de usuario disponibles para validar acceso a la minuta');
        setComidas([]);
        return;
      }
      
      const { persona_id } = JSON.parse(userData);
      console.log(`🔒 Verificando acceso: Usuario ${persona_id} solicitando comidas de minuta ${minutaId}`);
      
      // Verificar si esta minuta está realmente asignada a este usuario
      if (selectedMinuta && selectedMinuta.id_persona !== persona_id) {
        console.error(`🚫 ERROR DE SEGURIDAD: Intento de acceder a minuta ${minutaId} que no pertenece al usuario ${persona_id}`);
        setComidas([]);
        setError('No tiene permiso para acceder a esta minuta');
        return;
      }
      
      console.log(`🍽️ Cargando comidas para minuta ${minutaId}, día ${dia}`);
      setLoading(true);
      
      // Asegurar que el día sea un string para coincidir con el formato de la API
      const diaParam = String(dia);
      
      // CORREGIDO: Eliminamos cualquier caracteres adicionales del ID (como el 9 extra)
      const minutaIdLimpio = minutaId.replace(/[^a-zA-Z0-9\-]/g, '');
      
      // Obtener todas las comidas de la minuta para el día específico
      const response = await api.get(`/detalles-minuta/?minuta_id=${minutaIdLimpio}&dia_semana=${diaParam}`);
      
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
        
        // Mostrar mensaje diferente según compatibilidad
        if (compatibilidadMinuta?.compatible) {
          Alert.alert('Éxito', 'Se ha asignado una minuta nutricional adaptada a tus necesidades');
        } else {
          // MEJORADO: Mensaje más específico cuando la minuta no es ideal
          let mensaje = 'Se ha asignado la minuta más cercana a tus necesidades, pero no es completamente ideal para tu condición. ';
          
          // Si hay criterios fallidos específicos, mencionarlos
          if (compatibilidadMinuta?.criteriosFallidos?.includes('genero')) {
            mensaje += 'Esta minuta no fue diseñada específicamente para tu género. ';
          }
          
          mensaje += 'Por favor consulta con tu nutricionista para ajustes personalizados.';
          
          Alert.alert(
            'Minuta asignada con advertencias', 
            mensaje
          );
        }
      } else {
        const genero = generoPaciente || pacienteData?.genero || 'paciente';
        
        // MODIFICADO - Mensaje mejorado cuando no se encuentra minuta adecuada
        Alert.alert(
          'No hay minutas disponibles', 
          `No se encontró ninguna minuta que cumpla con los requisitos mínimos para ${genero.toLowerCase()}. ` +
          'Por favor, contacta a tu nutricionista para que te asigne una minuta personalizada o cree una compatible con tus necesidades.'
        );
      }
    } catch (error) {
      console.error('Error al solicitar minuta:', error);
      Alert.alert('Error', 'No se pudo asignar la minuta nutricional');
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para revocar el plan alimentario
  const handleRevocarMinuta = async () => {
    try {
      setLoading(true);
      
      if (!selectedMinuta) {
        Alert.alert('Error', 'No hay un plan alimentario seleccionado para revocar');
        return;
      }
      
      console.log(`🗑️ Revocando minuta ${selectedMinuta.id}`);
      
      // Cambiar el estado de la minuta a "inactiva" mediante la API
      await api.patch(`/minutas-nutricionales/${selectedMinuta.id}/`, {
        estado: 'inactiva'
      });
      
      // Éxito - limpiar estados locales
      setSelectedMinuta(null);
      setMinutas([]);
      setComidas([]);
      
      // Pre-cargar los datos para la siguiente minuta
      await cargarMinutasDisponibles();
      
      // Mostrar mensaje de éxito
      Alert.alert(
        'Plan revocado', 
        'Tu plan alimentario ha sido revocado correctamente. Ahora puedes solicitar uno nuevo.',
        [
          { 
            text: 'Solicitar nuevo plan', 
            onPress: handleSolicitarMinuta 
          },
          {
            text: 'Más tarde',
            style: 'cancel'
          }
        ]
      );
      
    } catch (error) {
      console.error('Error al revocar minuta:', error);
      Alert.alert('Error', 'No se pudo revocar el plan alimentario. Intenta de nuevo más tarde.');
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
    compatibilidadMinuta, // Exportar esta información
    handleSelectMinuta,
    handleChangeDay,
    handleVerDetalleComida,
    handleCerrarDetalleComida,
    handleSolicitarMinuta,
    handleCancelarSolicitud,
    handleCambiarRestriccion,
    handleConfirmarSolicitud,
    handleRevocarMinuta,
    refreshMinutas: fetchMinutas
  };
}
