import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Role constants
export const ROLES = {
  PATIENT: 'paciente',
  CAREGIVER: 'cuidador'
};

// Eliminamos por completo el forzado de rol de cuidador
const FORCE_CAREGIVER_ROLE = false; // Ya no se usará para forzar el rol

/**
 * Mapping de IDs de roles a nombres de roles
 * IMPORTANTE: Actualizar estos valores para que coincidan con su base de datos
 */
const ROLE_MAPPING = {
  1: 'paciente',
  2: 'cuidador'
};

/**
 * Configuración global para priorización de roles
 * IMPORTANT: Set this to the role you want to prioritize
 * 'paciente' - Paciente role will be prioritized over cuidador
 * 'cuidador' - Cuidador role will be prioritized over paciente (default)
 * 'first' - First role in the array will be used (order from API)
 * 'last' - Last role in the array will be used (order from API)
 */
const ROLE_PRIORITY = 'cuidador'; // Changed to prioritize cuidador role by default

/**
 * Obtiene todos los roles disponibles en el sistema
 * @returns {Promise<Array>} - Lista de roles disponibles
 */
export const getRoles = async () => {
  try {
    const response = await api.get('/roles/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    throw error;
  }
};

/**
 * Vincula un rol a una persona
 * @param {string} personaId - ID de la persona
 * @param {number} rolId - ID del rol a vincular
 * @returns {Promise<Object>} - Datos de la vinculación creada
 */
export const vincularRol = async (personaId, rolId) => {
  try {
    const response = await api.post('/usuario-roles/', {
      id_persona: personaId,
      rol: rolId
    });
    return response.data;
  } catch (error) {
    console.error('Error vinculando rol:', error);
    throw error;
  }
};

/**
 * Get roles for a user from API
 * @param {string} personaId - The persona ID to check roles for
 * @returns {Promise<Array>} - List of roles
 */
export const getUserRoles = async (personaId) => {
  try {
    console.log(`🔍 ROLE CHECK: Fetching roles for personaId: ${personaId}`);
    const url = `/usuario-roles/?id_persona=${personaId}`;
    console.log(`🔍 ROLE CHECK: API URL: ${url}`);
    
    const response = await api.get(url);
    
    console.log(`🔍 ROLE CHECK: Received ${response.data?.length || 0} roles from API`);
    console.log(`🔍 ROLE CHECK: Raw API response:`, JSON.stringify(response.data));
    
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('🔍 ROLE CHECK: No roles found in API response');
      // If API returned no roles, try fallback detection methods
      return await attemptRoleFallbackDetection(personaId);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting roles:', error);
    // If API call failed, try fallback detection methods
    return await attemptRoleFallbackDetection(personaId);
  }
};

/**
 * Fallback method to detect user role when API fails
 * @param {string} personaId - The persona ID to check
 * @returns {Promise<Array>} - Simulated role data
 */
export const attemptRoleFallbackDetection = async (personaId) => {
  console.log('🔍 ROLE FALLBACK: Attempting alternative role detection methods');
  
  try {
    // Method 1: Check if user has any assigned patients (suggesting they're a caregiver)
    console.log('🔍 ROLE FALLBACK: Checking for assigned patients...');
    const patientsResponse = await api.get(`/pacientes-cuidador/${personaId}/`);
    
    if (patientsResponse.data && 
        Array.isArray(patientsResponse.data.pacientes) && 
        patientsResponse.data.pacientes.length > 0) {
      console.log(`🔍 ROLE FALLBACK: User has ${patientsResponse.data.pacientes.length} patients assigned, likely a caregiver`);
      
      // Return simulated role data for a caregiver
      return [{ rol: { id: 2, nombre: 'cuidador' } }];
    }
  } catch (patientsError) {
    console.log('🔍 ROLE FALLBACK: Patient check failed, not a caregiver or API error');
  }
  
  try {
    // Method 2: Check if user has a medical profile (suggesting they're a patient)
    console.log('🔍 ROLE FALLBACK: Checking for medical profile...');
    const profileResponse = await api.get(`/perfiles-medicos/?id_persona=${personaId}`);
    
    if (profileResponse.data && 
        Array.isArray(profileResponse.data) && 
        profileResponse.data.length > 0) {
      console.log(`🔍 ROLE FALLBACK: User has a medical profile, likely a patient`);
      
      // Return simulated role data for a patient
      return [{ rol: { id: 1, nombre: 'paciente' } }];
    }
  } catch (profileError) {
    console.log('🔍 ROLE FALLBACK: Medical profile check failed, API error');
  }
  
  // If all fallbacks fail, check if there's a manual override
  console.log('🔍 ROLE FALLBACK: All detection methods failed, checking for manual override');
  
  try {
    const overrideRole = await AsyncStorage.getItem('overrideRole');
    if (overrideRole) {
      console.log(`🔍 ROLE FALLBACK: Found manual override: ${overrideRole}`);
      const roleId = overrideRole === 'cuidador' ? 2 : 1;
      return [{ rol: { id: roleId, nombre: overrideRole } }];
    }
  } catch (overrideError) {
    console.log('🔍 ROLE FALLBACK: Override check failed', overrideError);
  }
  
  // Last resort: return empty array to indicate failure
  console.log('🔍 ROLE FALLBACK: All detection methods failed, returning empty array');
  return [];
};

/**
 * Determina si un usuario es cuidador basado en sus roles
 * Mejorado con detección más precisa y diagnóstico
 */
export const isCaregiverRole = (roles) => determinePrimaryRole(roles) === 'cuidador';

// Function to determine primary role based on configuration
export const determinePrimaryRole = (roles) => {
  console.log('🔍 DETERMINING PRIMARY ROLE FROM ROLES:', roles);
  
  if (Array.isArray(roles) && roles.length > 0) {
    // Log all detected roles first for better diagnosis
    console.log('🔍 All roles detected:');
    roles.forEach((role, idx) => {
      if (role && role.rol) {
        console.log(`  Role #${idx+1}: ID=${role.rol.id || 'undefined'}, Name=${role.rol.nombre || 'undefined'}`);
      } else {
        console.log(`  Role #${idx+1}: Invalid structure`);
      }
    });
    
    // Check if user has both roles
    const hasCuidadorRole = roles.some(role => role?.rol?.id === 2);
    const hasPacienteRole = roles.some(role => role?.rol?.id === 1);
    
    console.log(`🔍 Has cuidador role: ${hasCuidadorRole}, Has paciente role: ${hasPacienteRole}`);
    console.log(`🔍 ROLE PRIORITY configured to: ${ROLE_PRIORITY}`);
    
    // Apply role priority based on configuration
    if (hasCuidadorRole && hasPacienteRole) {
      // User has both roles, apply prioritization
      if (ROLE_PRIORITY === 'paciente') {
        console.log('🔍 User has both roles. Prioritizing PACIENTE role as configured.');
        return 'paciente';
      } else {
        console.log('🔍 User has both roles. Prioritizing CUIDADOR role as configured.');
        return 'cuidador';
      }
    }
    
    // If user only has one of the roles, return that one
    if (hasPacienteRole) {
      console.log('🏆 PRIMARY ROLE DETERMINED: paciente (ID 1)');
      return 'paciente';
    }
    
    if (hasCuidadorRole) {
      console.log('🏆 PRIMARY ROLE DETERMINED: cuidador (ID 2)');
      return 'cuidador';
    }
    
    // If no direct ID match, try name-based detection as fallback
    console.log('⚠️ No direct role ID match, trying name-based detection...');
    const roleByCuidadorName = roles.some(r => 
      r.rol && typeof r.rol.nombre === 'string' && 
      r.rol.nombre.toLowerCase().includes('cuida')
    );
    
    if (roleByCuidadorName) {
      console.log('🏆 PRIMARY ROLE DETERMINED: cuidador (by name)');
      return 'cuidador';
    }
  } else {
    console.log('⚠️ No roles provided or empty roles array');
  }
  
  console.log('⚠️ DEFAULT ROLE ASSIGNED: paciente');
  return 'paciente'; // Default to patient if no specific role found
};

// Function to update stored user role
export const updateStoredUserRole = async (role) => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      // Eliminar código de forzado
      parsedData.role = role;
      await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating stored user role:', error);
    return false;
  }
};

/**
 * Función de diagnóstico para verificar consistencia de roles
 * Compara roles en API y AsyncStorage e imprime diagnóstico detallado
 */
export const diagnosisRoles = async () => {
  try {
    // 1. Obtener userData de AsyncStorage
    const userData = await AsyncStorage.getItem('userData');
    const userDataObj = userData ? JSON.parse(userData) : null;
    console.log('=== DIAGNÓSTICO DE ROLES ===');
    console.log('1. Datos en AsyncStorage:', JSON.stringify(userDataObj, null, 2));
    
    if (!userDataObj || !userDataObj.persona_id) {
      console.log('❌ No hay datos de usuario o persona_id en AsyncStorage');
      return false;
    }
    
    // 2. Consultar roles en la API
    try {
      console.log(`2. Consultando roles en API para persona_id: ${userDataObj.persona_id}`);
      const rolesResponse = await getUserRoles(userDataObj.persona_id);
      console.log('3. Roles desde API:', JSON.stringify(rolesResponse, null, 2));
      
      // Clear diagnostics data
      let diagnosticData = {
        storedRole: userDataObj.role || 'No definido',
        apiRoles: [],
        sourceOfTruth: null,
        inconsistency: false
      };
      
      // Mostrar el mapeo de roles para depuración
      if (rolesResponse && rolesResponse.length > 0) {
        diagnosticData.apiRoles = rolesResponse.map(role => {
          if (role.rol && role.rol.id) {
            const mappedRole = ROLE_MAPPING[role.rol.id] || 'unknown';
            console.log(`4. Role ID ${role.rol.id} maps to "${mappedRole}" (DB name: ${role.rol.nombre})`);
            return {
              id: role.rol.id,
              name: role.rol.nombre,
              mappedTo: mappedRole
            };
          }
          return { id: 'unknown', name: 'unknown', mappedTo: 'unknown' };
        });
      }
      
      // 5. Determinar rol primario basado en API (source of truth)
      const primaryRoleFromAPI = determinePrimaryRole(rolesResponse);
      console.log(`5. Rol primario según API (fuente de verdad): ${primaryRoleFromAPI}`);
      diagnosticData.sourceOfTruth = primaryRoleFromAPI;
      
      // 6. Comparar con rol en AsyncStorage
      const storedRole = userDataObj.role;
      console.log(`6. Rol guardado en AsyncStorage: ${storedRole}`);
      
      if (storedRole !== primaryRoleFromAPI) {
        console.log('⚠️ INCONSISTENCIA: El rol en AsyncStorage no coincide con el determinado por la API');
        console.log('Recomendación: Actualizar AsyncStorage con el rol correcto');
        diagnosticData.inconsistency = true;
        
        // Sugerir actualización
        return {
          hasInconsistency: true,
          storedRole,
          apiRole: primaryRoleFromAPI,
          shouldUpdate: true,
          diagnosticData
        };
      }
      
      console.log('✅ CONSISTENCIA: Los roles coinciden correctamente');
      return {
        hasInconsistency: false,
        storedRole,
        apiRole: primaryRoleFromAPI,
        diagnosticData
      };
    } catch (error) {
      console.error('Error consultando API de roles:', error);
      return {
        hasInconsistency: true,
        error: error.message
      };
    }
  } catch (error) {
    console.error('Error general en diagnóstico:', error);
    return {
      hasInconsistency: true,
      error: error.message
    };
  }
};

/**
 * Set a temporary role override (for emergency use when role detection fails)
 */
export const setRoleOverride = async (role) => {
  try {
    // First, store the override role
    await AsyncStorage.setItem('overrideRole', role);
    
    // Then update the user data with this role
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      parsedData.role = role;
      await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
      console.log(`🔧 ROLE OVERRIDE: Role manually set to ${role}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting role override:', error);
    return false;
  }
};

/**
 * Clear any role overrides that have been set
 */
export const clearRoleOverride = async () => {
  try {
    await AsyncStorage.removeItem('overrideRole');
    console.log('🔧 ROLE OVERRIDE: Manual override cleared');
    return true;
  } catch (error) {
    console.error('Error clearing role override:', error);
    return false;
  }
};

// Exportar funciones diagnóstico
export default {
  getRoles,
  vincularRol,
  getUserRoles,
  determinePrimaryRole,
  isCaregiverRole,
  updateStoredUserRole,
  diagnosisRoles,
  setRoleOverride,
  clearRoleOverride
};
