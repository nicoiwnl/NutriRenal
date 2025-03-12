import api from '../api';

/**
 * Obtiene la lista de pacientes vinculados a un cuidador
 * @param {string} cuidadorId - ID del cuidador
 * @returns {Promise<Array>} - Lista de pacientes vinculados
 */
export const getPatientsList = async (cuidadorId) => {
  try {
    const response = await api.get(`/pacientes-cuidador/${cuidadorId}/`);
    return response.data.pacientes || [];
  } catch (error) {
    console.error('Error obteniendo pacientes vinculados:', error);
    throw error;
  }
};

/**
 * Vincula un cuidador con un paciente mediante su código
 * @param {string} pacienteId - ID del paciente
 * @param {string} cuidadorId - ID del cuidador
 * @returns {Promise<Object>} - Datos de la vinculación creada
 */
export const linkWithPatient = async (pacienteId, cuidadorId) => {
  try {
    console.log(`Intentando vincular cuidador ${cuidadorId} con paciente ${pacienteId}`);
    const response = await api.post('/vincular-paciente-cuidador/', {
      paciente_id: pacienteId,
      cuidador_id: cuidadorId
    });
    return response.data;
  } catch (error) {
    console.error('Error vinculando con paciente:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      throw new Error(error.response.data.error || 'Error en la vinculación');
    }
    throw error;
  }
};

/**
 * Elimina la vinculación entre un cuidador y un paciente
 * @param {string} vinculoId - ID de la vinculación
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const unlinkPatient = async (vinculoId) => {
  try {
    const response = await api.delete(`/vinculos-paciente-cuidador/${vinculoId}/`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando vinculación:', error);
    throw error;
  }
};

export default {
  getPatientsList,
  linkWithPatient,
  unlinkPatient
};
