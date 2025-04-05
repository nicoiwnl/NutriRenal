import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { getPublicaciones } from '../../../services/comunidadService';

export default function useComunidad(navigation, route) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [personaId, setPersonaId] = useState(null);
  const alertShownRef = useRef(false);

  // Cargar datos de usuario desde AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data from AsyncStorage...');
        const userData = await AsyncStorage.getItem('userData');
        console.log('userData from AsyncStorage:', userData);
        
        if (userData) {
          const parsed = JSON.parse(userData);
          console.log('Parsed userData:', parsed);
          
          if (parsed.persona_id) {
            console.log('Setting personaId to:', parsed.persona_id);
            setPersonaId(parsed.persona_id);
          } else {
            console.warn('Warning: persona_id not found in userData');
          }
        } else {
          console.warn('Warning: No userData found in AsyncStorage');
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
    cargarPublicaciones();
  }, []);

  // Función para cargar publicaciones desde API
  const cargarPublicaciones = async () => {
    setLoading(true);
    try {
      const data = await getPublicaciones();
      console.log('Publicaciones cargadas:', data.length);
      setPublicaciones(data);
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para manejar actualización mediante pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    cargarPublicaciones();
  };
  
  // Función para manejar navegación a nueva publicación
  const handleNavigateToNewPublication = () => {
    if (!personaId) {
      Alert.alert('Error', 'No se pudo identificar tu usuario. Por favor, cierra sesión y vuelve a iniciar sesión.');
      return;
    }
    
    navigation.getParent()?.navigate('NuevaPublicacion', { personaId });
  };
  
  // Función para verificar alertas desde parámetros de navegación
  const checkRouteForAlerts = (isFocused) => {
    if (isFocused && route.params) {
      console.log('Route params:', route.params);
      
      const hasRefreshParam = route.params?.refreshTimestamp;
      const wasPublicationCreated = route.params?.publicacionCreada;
      const shouldSkipAlert = route.params?.skipAlert === true;
      
      // Solo mostrar alerta si no la hemos mostrado aún para estos parámetros
      // y no estamos explícitamente saltando la alerta
      if (hasRefreshParam && !shouldSkipAlert && !alertShownRef.current) {
        console.log(`Showing alert for timestamp: ${route.params.refreshTimestamp}`);
        alertShownRef.current = true; // Marcar la alerta como mostrada
        
        // Si hay una bandera de publicación creada, mostrar mensaje específico
        if (wasPublicationCreated) {
          Alert.alert(
            'Publicación Exitosa',
            'Su publicación ha sido añadida a la comunidad'
          );
        } else {
          // Mensaje genérico de actualización
          Alert.alert(
            'Actualizado',
            'Las publicaciones se han actualizado correctamente'
          );
        }
      }
      
      // Limpiar parámetros para evitar alertas repetidas en futuros focuses
      if (hasRefreshParam) {
        // Establecer skipAlert a true para evitar mostrar la alerta nuevamente
        navigation.setParams({ 
          refreshTimestamp: null,
          publicacionCreada: null,
          skipAlert: true
        });
      }
      
      // Siempre actualizar datos cuando se enfoca la pantalla
      if (isFocused) {
        cargarPublicaciones();
      }
    }
  };
  
  // Función para restablecer la referencia de alerta mostrada
  const resetAlertShown = () => {
    alertShownRef.current = false;
  };

  return {
    loading,
    refreshing,
    publicaciones,
    personaId,
    onRefresh,
    handleNavigateToNewPublication,
    checkRouteForAlerts,
    resetAlertShown
  };
}
