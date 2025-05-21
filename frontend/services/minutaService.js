import api from '../api';

/**
 * Obtiene las minutas asignadas a un paciente
 * @param {string} personaId - ID de la persona
 * @param {string} estado - Estado de las minutas ('activa', 'inactiva', o vacío para todas)
 * @returns {Promise<Array>} - Lista de minutas
 */
export const getMinutasNutricionales = async (personaId, estado = '') => {
  try {
    if (!personaId) {
      console.error('Error: No se proporcionó ID de persona para consultar minutas');
      return [];
    }
    
    let url = `/minutas-nutricionales/?id_persona=${personaId}&exact_match=true`;
    if (estado) {
      url += `&estado=${estado}`;
    }
    console.log(`🔍 Consultando minutas nutricionales: ${url}`);
    const response = await api.get(url);
    
    // Registrar la cantidad de minutas encontradas para este usuario específico
    console.log(`📊 Encontradas ${response.data.length} minutas para persona ${personaId}`);
    
    // Verificación adicional: comprobar si todas las minutas realmente pertenecen a esta persona
    const minutasVerificadas = response.data.filter(minuta => 
      minuta.id_persona === personaId
    );
    
    if (minutasVerificadas.length !== response.data.length) {
      console.error(`🚨 ALERTA CRÍTICA: Se encontraron ${response.data.length - minutasVerificadas.length} minutas que NO pertenecen a la persona ${personaId}`);
      
      // Log detallado de las minutas problemáticas
      response.data.forEach(minuta => {
        if (minuta.id_persona !== personaId) {
          console.error(`🚨 Minuta ID ${minuta.id} asignada a persona ${minuta.id_persona}, no a ${personaId}`);
        }
      });
    }
    
    return minutasVerificadas; // Devolver solo las minutas que pertenecen a esta persona
  } catch (error) {
    console.error('Error obteniendo minutas nutricionales:', error);
    throw error;
  }
};

/**
 * Obtiene los tipos de comida disponibles
 * @returns {Promise<Array>} - Lista de tipos de comida
 */
export const getTiposComida = async () => {
  try {
    const response = await api.get('/comidas-tipo/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tipos de comida:', error);
    throw error;
  }
};

/**
 * Obtiene las comidas para un día específico de una minuta
 * @param {string} minutaId - ID de la minuta
 * @param {number} dia - Día de la semana (1-7)
 * @returns {Promise<Array>} - Lista de comidas para el día
 */
export const getComidasPorDia = async (minutaId, dia) => {
  try {
    if (!minutaId) {
      console.error('Error: No se proporcionó ID de minuta para consultar comidas');
      return [];
    }
    
    console.log(`Consultando comidas para minuta ${minutaId}, día ${dia}`);
    const response = await api.get(`/detalles-minuta/?minuta_id=${minutaId}&dia_semana=${dia}`);
    
    // Verificar que las comidas corresponden al día solicitado
    const comidasFiltradas = response.data.filter(comida => 
      String(comida.dia_semana) === String(dia)
    );
    
    if (comidasFiltradas.length !== response.data.length) {
      console.warn(`⚠️ ALERTA: API devolvió comidas para días diferentes del solicitado (${dia})`);
    }
    
    return comidasFiltradas;
  } catch (error) {
    console.error(`Error obteniendo comidas para el día ${dia}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las minutas disponibles en el sistema
 * @returns {Promise<Array>} - Lista de minutas disponibles
 */
export const getMinutasDisponibles = async () => {
  try {
    console.log('Consultando todas las minutas disponibles');
    const response = await api.get('/minutas/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo minutas disponibles:', error);
    throw error;
  }
};

/**
 * Crea una nueva asignación de minuta para un paciente
 * @param {Object} minutaNutricional - Datos de la minuta nutricional
 * @returns {Promise<Object>} - Minuta nutricional creada
 */
export const crearMinutaNutricional = async (minutaNutricional) => {
  try {
    console.log('Creando nueva minuta nutricional:', minutaNutricional);
    const response = await api.post('/minutas-nutricionales/', minutaNutricional);
    return response.data;
  } catch (error) {
    console.error('Error creando minuta nutricional:', error);
    throw error;
  }
};

/**
 * Actualiza el estado de una minuta nutricional
 * @param {string} minutaId - ID de la minuta nutricional
 * @param {string} nuevoEstado - Nuevo estado ('activa' o 'inactiva')
 * @returns {Promise<Object>} - Minuta nutricional actualizada
 */
export const actualizarEstadoMinuta = async (minutaId, nuevoEstado) => {
  try {
    console.log(`Actualizando estado de minuta ${minutaId} a ${nuevoEstado}`);
    const response = await api.patch(`/minutas-nutricionales/${minutaId}/`, {
      estado: nuevoEstado
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando estado de minuta:', error);
    throw error;
  }
};

/**
 * Obtiene los detalles de una comida específica
 * @param {string} comidaId - ID de la comida
 * @returns {Promise<Object>} - Detalles de la comida
 */
export const getDetalleComida = async (comidaId) => {
  try {
    console.log(`Consultando detalle de comida ${comidaId}`);
    const response = await api.get(`/detalles-minuta/${comidaId}/`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo detalles de comida:', error);
    throw error;
  }
};

export default {
  getMinutasNutricionales,
  getTiposComida,
  getComidasPorDia,
  getMinutasDisponibles,
  crearMinutaNutricional,
  actualizarEstadoMinuta,
  getDetalleComida
};
