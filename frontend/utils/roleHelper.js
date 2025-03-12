import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserRoles, determinePrimaryRole } from '../services/userService';

/**
 * Función para corregir problemas de rol sin borrar todos los datos
 */
export const fixRoleIssue = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) {
      console.log('No hay datos de usuario');
      return { success: false, message: 'No hay datos de usuario' };
    }
    
    const parsedData = JSON.parse(userData);
    if (!parsedData.persona_id) {
      console.log('No hay ID de persona');
      return { success: false, message: 'No hay ID de persona' };
    }
    
    // Forzar consulta de roles desde API
    const roles = await getUserRoles(parsedData.persona_id);
    
    if (roles && Array.isArray(roles)) {
      // Determinar rol
      const roleFromAPI = determinePrimaryRole(roles);
      
      // Actualizar userData
      parsedData.role = roleFromAPI;
      await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
      
      console.log(`Rol corregido a: ${roleFromAPI}`);
      return { 
        success: true, 
        message: `Rol actualizado a: ${roleFromAPI}`,
        newRole: roleFromAPI
      };
    } else {
      console.log('No se pudieron obtener roles');
      return { success: false, message: 'No se pudieron obtener roles desde la API' };
    }
  } catch (error) {
    console.error('Error corrigiendo problema de rol:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
};

/**
 * Función para limpiar solo los datos de rol sin cerrar sesión
 */
export const clearRoleData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) {
      return false;
    }
    
    const parsedData = JSON.parse(userData);
    // Eliminar la propiedad role
    delete parsedData.role;
    
    await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
    console.log('Datos de rol eliminados');
    return true;
  } catch (error) {
    console.error('Error eliminando datos de rol:', error);
    return false;
  }
};
