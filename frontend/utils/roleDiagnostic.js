import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { getUserRoles, determinePrimaryRole } from '../services/userService';

/**
 * Ejecuta un diagnóstico completo del sistema de roles
 * @returns {Promise<Object>} Resultado del diagnóstico
 */
export const runRoleDiagnostic = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    asyncStorage: null,
    apiRoles: null,
    inconsistencies: [],
    recommendedFixes: []
  };
  
  try {
    console.log('=== DIAGNÓSTICO COMPLETO DE ROLES ===');
    
    // 1. Verificar AsyncStorage
    console.log('1. Verificando datos en AsyncStorage...');
    const userData = await AsyncStorage.getItem('userData');
    
    if (!userData) {
      console.log('❌ No hay datos en userData');
      results.asyncStorage = { status: 'missing', data: null };
      results.inconsistencies.push('No hay datos de usuario en AsyncStorage');
      results.recommendedFixes.push('Es necesario iniciar sesión nuevamente');
      return results;
    }
    
    // Datos encontrados en AsyncStorage
    const userDataObj = JSON.parse(userData);
    results.asyncStorage = { 
      status: 'found', 
      data: userDataObj,
      hasRole: !!userDataObj.role,
      role: userDataObj.role,
      personaId: userDataObj.persona_id
    };
    
    console.log(`AsyncStorage tiene rol: ${userDataObj.role || 'NO'}`);
    
    // 2. Verificar roles en API
    if (userDataObj.persona_id) {
      console.log(`2. Consultando roles en API para persona_id: ${userDataObj.persona_id}`);
      try {
        const rolesResponse = await getUserRoles(userDataObj.persona_id);
        
        results.apiRoles = {
          status: 'fetched',
          count: rolesResponse?.length || 0,
          roles: rolesResponse,
          hasCaregiverRole: rolesResponse.some(r => 
            r.rol?.id === 2 || r.rol?.nombre?.toLowerCase() === 'cuidador'
          ),
          determinedRole: determinePrimaryRole(rolesResponse)
        };
        
        // 3. Verificar inconsistencias
        if (results.asyncStorage.role !== results.apiRoles.determinedRole) {
          const message = `Inconsistencia: AsyncStorage tiene rol "${results.asyncStorage.role}" pero API determina "${results.apiRoles.determinedRole}"`;
          console.log(`❌ ${message}`);
          results.inconsistencies.push(message);
          results.recommendedFixes.push(`Actualizar AsyncStorage con rol "${results.apiRoles.determinedRole}"`);
        } else {
          console.log('✅ Roles consistentes entre AsyncStorage y API');
        }
      } catch (error) {
        console.error('Error consultando API:', error);
        results.apiRoles = { 
          status: 'error', 
          error: error.message 
        };
        results.inconsistencies.push(`Error al consultar API de roles: ${error.message}`);
      }
    } else {
      console.log('❌ No hay persona_id en userData');
      results.inconsistencies.push('AsyncStorage no tiene persona_id');
      results.recommendedFixes.push('Es necesario iniciar sesión nuevamente');
    }
  } catch (error) {
    console.error('Error en diagnóstico:', error);
    results.asyncStorage = { status: 'error', error: error.message };
    results.inconsistencies.push(`Error general: ${error.message}`);
  }
  
  // Recomendación final
  if (results.inconsistencies.length > 0) {
    if (!results.recommendedFixes.includes('Reiniciar la aplicación')) {
      results.recommendedFixes.push('Reiniciar la aplicación después de aplicar correcciones');
    }
  }
  
  return results;
};

/**
 * Aplica correcciones automáticas a problemas conocidos con los roles
 */
export const fixRoleIssues = async () => {
  try {
    const diagnostic = await runRoleDiagnostic();
    console.log('Diagnóstico completado, aplicando correcciones...');
    
    // Si tenemos inconsistencia entre AsyncStorage y API, actualizar AsyncStorage
    if (
      diagnostic.asyncStorage?.status === 'found' &&
      diagnostic.apiRoles?.status === 'fetched' &&
      diagnostic.asyncStorage.role !== diagnostic.apiRoles.determinedRole
    ) {
      console.log(`Actualizando rol en AsyncStorage de "${diagnostic.asyncStorage.role}" a "${diagnostic.apiRoles.determinedRole}"`);
      
      const userData = JSON.parse(await AsyncStorage.getItem('userData'));
      userData.role = diagnostic.apiRoles.determinedRole;
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      return {
        fixed: true,
        message: `Rol actualizado a "${diagnostic.apiRoles.determinedRole}"`,
        requiresRestart: true
      };
    }
    
    return {
      fixed: false,
      message: 'No se encontraron problemas para corregir automáticamente'
    };
  } catch (error) {
    console.error('Error aplicando correcciones:', error);
    return {
      fixed: false,
      error: error.message
    };
  }
};

export default {
  runRoleDiagnostic,
  fixRoleIssues
};
