import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Valida si un recurso pertenece al usuario actual
 * 
 * @param {string} resourceOwnerId - ID del propietario del recurso
 * @returns {Promise<boolean>} - true si pertenece al usuario, false en caso contrario
 */
export const validateResourceOwnership = async (resourceOwnerId) => {
  try {
    if (!resourceOwnerId) return false;
    
    // Obtener los datos del usuario actual
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return false;
    
    const { persona_id } = JSON.parse(userData);
    if (!persona_id) return false;
    
    // Normalizar ambos IDs para comparación
    const normalizedResourceId = String(resourceOwnerId).trim().toLowerCase().replace(/-/g, '');
    const normalizedUserId = String(persona_id).trim().toLowerCase().replace(/-/g, '');
    
    return normalizedResourceId === normalizedUserId;
  } catch (error) {
    console.error('Error validando propiedad de recurso:', error);
    return false;
  }
};

/**
 * Registra un intento de acceso no autorizado
 * 
 * @param {string} resourceType - Tipo de recurso (ej: "minuta", "perfil")
 * @param {string} resourceId - ID del recurso
 * @param {string} attemptedAction - Acción intentada (ej: "view", "edit")
 */
export const logUnauthorizedAccess = async (resourceType, resourceId, attemptedAction) => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    const userId = userData ? JSON.parse(userData).persona_id : 'unknown';
    
    console.error(`🚨 ALERTA DE SEGURIDAD: Usuario ${userId} intentó ${attemptedAction} en ${resourceType} ${resourceId} sin autorización`);
    
    // Aquí se podría implementar envío a servidor para auditoría
  } catch (error) {
    console.error('Error al registrar acceso no autorizado:', error);
  }
};

export default {
  validateResourceOwnership,
  logUnauthorizedAccess
};
