import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';
import { getUserRoles, determinePrimaryRole } from '../../../services/userService';

export default function useHome(navigation) {
  const [personaId, setPersonaId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [showDebugUI, setShowDebugUI] = useState(false); // Para opciones de desarrollo

  // Recuperar datos del usuario y su rol al cargar la pantalla
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setPersonaId(parsed.persona_id);
          
          // Obtener información del usuario para mostrarlo en la bienvenida
          try {
            const personaResponse = await api.get(`/personas/${parsed.persona_id}/`);
            if (personaResponse.data?.nombres) {
              setUserName(personaResponse.data.nombres);
            }
          } catch (personaError) {
            console.error('Error al obtener datos de persona:', personaError);
          }
          
          // DIAGNÓSTICO DE ROLES: Verificar consistencia entre AsyncStorage y API
          console.log('==== VERIFICANDO CONSISTENCIA DE ROLES ====');
          console.log(`1. Rol almacenado en AsyncStorage: ${parsed.role || 'No definido'}`);
          
          // Más información detallada de userData para depuración
          console.log('Full userData from AsyncStorage:', parsed);
          
          // Estamos en HomeScreen y ya tenemos un rol en AsyncStorage
          // Primero confiamos en ese rol para mostrar UI inmediatamente
          if (parsed.role) {
            console.log(`2. Usando rol desde AsyncStorage: ${parsed.role}`);
            setUserRole(parsed.role);
          } else {
            console.log('2. No role found in userData, will check API');
          }
          
          // Obtener los roles del usuario desde API para verificar consistencia
          if (parsed.persona_id) {
            try {
              console.log(`3. Verificando roles desde API para persona_id: ${parsed.persona_id}`);
              const rolesResponse = await getUserRoles(parsed.persona_id);
              console.log(`4. API devolvió ${rolesResponse?.length || 0} roles`);
              
              // Información detallada de rol para mejor depuración
              if (rolesResponse && rolesResponse.length > 0) {
                console.log('Roles detallados recibidos:');
                rolesResponse.forEach((role, idx) => {
                  console.log(`- Rol #${idx+1}: ID=${role.rol?.id || 'undefined'}, Nombre=${role.rol?.nombre || 'undefined'}`);
                });
                
                // Verificar rol de cuidador explícitamente por ID - esto es más confiable
                const cuidadorRole = rolesResponse.find(r => r.rol?.id === 2);
                if (cuidadorRole) {
                  console.log('✓ CUIDADOR ROLE DETECTED (ID 2)');
                  
                  // Si el usuario tiene rol de cuidador, asegurar que AsyncStorage lo refleje
                  if (parsed.role !== 'cuidador') {
                    console.log(`⚠️ INCONSISTENCY - Stored role: ${parsed.role}, Detected: cuidador`);
                    parsed.role = 'cuidador';
                    await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                    console.log('AsyncStorage updated with cuidador role');
                  }
                  
                  // Actualizar UI con rol de cuidador
                  setUserRole('cuidador');
                } else {
                  console.log('✓ No cuidador role detected, assuming PACIENTE');
                  
                  // Si AsyncStorage tiene rol incorrecto, actualizarlo
                  if (parsed.role !== 'paciente') {
                    console.log(`⚠️ INCONSISTENCY - Stored role: ${parsed.role}, Detected: paciente`);
                    parsed.role = 'paciente';
                    await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                    console.log('AsyncStorage updated with paciente role');
                  }
                  
                  setUserRole('paciente');
                }
              } else {
                console.log('5. No roles found in API, defaulting to "paciente"');
                
                // Si no se encuentran roles pero teníamos un rol almacenado, usarlo
                if (!parsed.role) {
                  parsed.role = 'paciente';
                  await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                  console.log('AsyncStorage updated with default paciente role');
                }
                
                setUserRole(parsed.role || 'paciente');
              }
            } catch (rolesError) {
              console.error('6. Error al obtener roles del usuario:', rolesError);
              // En caso de error, usar cualquier rol que estuviera almacenado o predeterminar a paciente
              setUserRole(parsed.role || 'paciente');
            }
          }
        } else {
          console.log('No se encontró userData en AsyncStorage');
          Alert.alert('Error', 'No se encontró información del usuario. Intente iniciar sesión nuevamente.');
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error al recuperar datos del usuario:', error);
        Alert.alert('Error', 'Hubo un problema al cargar sus datos. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión. Intente nuevamente.');
    }
  };

  // Navegar al Dashboard
  const navigateToDashboard = () => {
    if (personaId) {
      // Siempre navegar a FichaMedica, independientemente del rol
      // Pasar el rol como parámetro para que FichaMedica pueda mostrar la interfaz adecuada
      navigation.navigate('FichaMedica', { 
        personaId,
        userRole  // Pasar el rol del usuario a la pantalla de FichaMedica
      });
    } else {
      Alert.alert('Error', 'No se pudo recuperar la información del usuario. Intente iniciar sesión nuevamente.');
    }
  };

  // Forzar rol para pruebas (solo en modo debug)
  const forceRole = async (role) => {
    if (role !== 'paciente' && role !== 'cuidador') return;
    
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.role = role;
        parsed._roleForced = true; // Bandera para indicar que es un rol forzado
        await AsyncStorage.setItem('userData', JSON.stringify(parsed));
        setUserRole(role);
        Alert.alert('Rol forzado', `Ahora viendo como ${role.toUpperCase()} (SOLO PRUEBAS)`);
      }
    } catch (error) {
      console.error('Error al forzar rol:', error);
      Alert.alert('Error', 'No se pudo cambiar el rol. Intente nuevamente.');
    }
  };

  // Restablecer rol a la configuración original
  const resetRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        // Eliminar el rol y la bandera de forzado para permitir que se detecte nuevamente
        delete parsed.role;
        delete parsed._roleForced;
        await AsyncStorage.setItem('userData', JSON.stringify(parsed));
        
        // Forzar una actualización para detectar el rol nuevamente
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error) {
      console.error('Error al restablecer rol:', error);
      Alert.alert('Error', 'No se pudo restablecer el rol. Intente nuevamente.');
    }
  };

  return {
    loading,
    personaId,
    userRole,
    userName,
    showDebugUI,
    handleLogout,
    navigateToDashboard,
    forceRole,
    resetRole
  };
}
