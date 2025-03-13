import axios from 'axios';
import api from '../api';
import { logApiRequest, logApiResponse } from '../utils/logUtils';

// Funciones para interactuar con la API de pacientes
// Mejorado para debugging más detallado y validación de seguridad
export const getPacienteDashboard = async (personaId) => {
  try {
    // Changed from axios to api and updated endpoint path to match backend
    const response = await api.get(`/paciente-dashboard/${personaId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching paciente dashboard:', error);
    throw error;
  }
};

export const getAlimentos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key]) params.append(key, filtros[key]);
    });
    
    const response = await api.get(`/alimentos/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error en getAlimentos:', error);
    throw error;
  }
};

export const registrarComida = async (datosComida) => {
  try {
    const response = await api.post('/registros-comida/', datosComida);
    return response.data;
  } catch (error) {
    console.error('Error en registrarComida:', error);
    throw error;
  }
};

// New functions for caregiver-patient linking

// Function to get linked patients for a caregiver
export const getLinkedPatients = async (cuidadorId) => {
  try {
    const response = await api.get(`/pacientes-cuidador/${cuidadorId}/`);
    return response.data.pacientes || [];
  } catch (error) {
    console.error('Error getting linked patients:', error);
    throw error;
  }
};

// Function to link a caregiver with a patient
export const linkPatientWithCaregiver = async (pacienteId, cuidadorId) => {
  try {
    const response = await api.post('/vincular-paciente-cuidador/', {
      paciente_id: pacienteId,
      cuidador_id: cuidadorId
    });
    return response.data;
  } catch (error) {
    console.error('Error linking patient with caregiver:', error);
    throw error;
  }
};

export const vincularCuidador = async (pacienteId, cuidadorId) => {
  try {
    const data = {
      paciente: pacienteId,
      cuidador: cuidadorId
    };
    const response = await api.post('/vinculos-paciente-cuidador/', data);
    return response.data;
  } catch (error) {
    console.error('Error en vincularCuidador:', error);
    throw error;
  }
};

export const actualizarPerfilMedico = async (perfilId, data) => {
  try {
    console.log(`Actualizando perfil médico ${perfilId} con:`, data);
    
    // First, get the current profile to include required fields
    const endpoint = `/perfiles-medicos/${perfilId}/`;
    
    // Only proceed with the update if we have all required fields
    let updatedData = { ...data };
    
    // Check if we're missing peso or altura
    if (!updatedData.peso || !updatedData.altura) {
      try {
        // Get the current medical profile
        const currentProfile = await api.get(endpoint);
        
        // Add missing required fields from current profile
        if (!updatedData.peso && currentProfile.data.peso) {
          updatedData.peso = currentProfile.data.peso;
          console.log(`Added peso=${updatedData.peso} from current profile`);
        }
        
        if (!updatedData.altura && currentProfile.data.altura) {
          updatedData.altura = currentProfile.data.altura;
          console.log(`Added altura=${updatedData.altura} from current profile`);
        }
      } catch (fetchError) {
        console.error('Error fetching current profile:', fetchError);
        // Continue with the update attempt even if this fails
      }
    }
    
    // Check if we still don't have required fields
    if (!updatedData.peso) {
      console.warn('Warning: Missing peso in profile update data');
    }
    
    if (!updatedData.altura) {
      console.warn('Warning: Missing altura in profile update data');
    }
    
    console.log('Sending updated data:', updatedData);
    logApiRequest('PUT', endpoint, updatedData);
    
    const response = await api.put(endpoint, updatedData);
    logApiResponse('PUT', endpoint, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating perfil medico:', error);
    console.error('Server responded with:', error.response?.status);
    console.error('Response data:', error.response?.data);
    
    // Log with the correct endpoint
    logApiResponse('PUT', `/perfiles-medicos/${perfilId}/`, error.response || error, true);
    throw error;
  }
};

export const obtenerPerfilMedico = async (personaId) => {
  try {
    // Fix: Use the correct plural endpoint
    const endpoint = `/perfiles-medicos/?id_persona=${personaId}`;
    
    logApiRequest('GET', endpoint);
    
    const response = await api.get(endpoint);
    logApiResponse('GET', endpoint, response.data);
    
    // If the endpoint returns an array, take the first element
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error obteniendo perfil médico:', error);
    logApiResponse('GET', `/perfiles-medicos/?id_persona=${personaId}`, error.response || error, true);
    throw error;
  }
};

// Mejorado para mejor feedback
export const crearPerfilMedico = async (personaId, data) => {
  try {
    // Changed from axios to api
    const response = await api.post(`/perfiles-medicos/`, {
      ...data,
      id_persona: personaId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating perfil medico:', error);
    throw error;
  }
};

// Función para verificar el perfil médico - mejorada para verificar correspondencia de ID
export const verificarPerfilMedico = async (personaId) => {
  try {
    // Changed from axios to api and updated endpoint
    const response = await api.get(`/perfiles-medicos/?id_persona=${personaId}`);
    // Return the first perfil if found
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error('Error verifying perfil medico:', error);
    throw error;
  }
};

// Función para obtener todas las condiciones médicas disponibles
export const getCondicionesMedicas = async () => {
  try {
    // Changed from axios to api and updated endpoint
    const response = await api.get('/condiciones-previas/');
    return response.data;
  } catch (error) {
    console.error('Error fetching condiciones medicas:', error);
    throw error;
  }
};

// Función para vincular una condición médica a un paciente
export const vincularCondicionMedica = async (pacienteId, condicionId) => {
  try {
    // Changed from axios to api and updated endpoint
    const response = await api.post(`/usuario-condiciones/`, {
      id_persona: pacienteId,
      condicion: condicionId
    });
    return response.data;
  } catch (error) {
    console.error('Error linking condicion medica:', error);
    throw error;
  }
};

// Función para eliminar una condición médica de un paciente
export const eliminarCondicionMedica = async (usuarioCondicionId) => {
  try {
    // Changed from axios to api
    const response = await api.delete(`/usuario-condiciones/${usuarioCondicionId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting condicion medica:', error);
    throw error;
  }
};

// Función para crear una nueva condición médica
export const crearCondicionMedica = async (data) => {
  try {
    // Changed from axios to api and updated endpoint
    const response = await api.post('/condiciones-previas/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating condicion medica:', error);
    throw error;
  }
};

export default {
  getPacienteDashboard,
  getAlimentos,
  registrarComida,
  getLinkedPatients,
  linkPatientWithCaregiver,
  vincularCuidador,
  actualizarPerfilMedico,
  obtenerPerfilMedico,
  crearPerfilMedico, // Añadimos la nueva función
  verificarPerfilMedico,
  getCondicionesMedicas,
  vincularCondicionMedica,
  eliminarCondicionMedica,
  crearCondicionMedica,
};
