import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { getPublicaciones } from '../../../services/comunidadService';

export default function useComunidad(navigation, route) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [publicacionesFiltradas, setPublicacionesFiltradas] = useState([]);
  const [personaId, setPersonaId] = useState(null);
  const [foroActual, setForoActual] = useState(null);
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
  const cargarPublicaciones = async (foroId = null) => {
    setLoading(true);
    try {
      console.log(`Cargando publicaciones${foroId ? ` para el foro ${foroId}` : ' generales'}...`);
      // Llamar a la API con el ID del foro para filtrar en el backend
      const data = await getPublicaciones(foroId);
      console.log('Publicaciones cargadas:', data.length);
      
      // Guardamos todas las publicaciones en el estado
      setPublicaciones(data);
      
      // También actualizamos las publicaciones filtradas
      if (foroId) {
        // Filtrar en el frontend para asegurar consistencia
        filtrarPublicacionesPorForo(data, foroId);
      } else {
        setPublicacionesFiltradas(data);
      }
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
      setPublicacionesFiltradas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para filtrar publicaciones por foro
  const filtrarPublicacionesPorForo = (publicacionesData, foroId) => {
    if (!foroId) {
      // Si no hay foro seleccionado, no mostrar nada
      console.log('No hay foro seleccionado, no se muestran publicaciones');
      setPublicacionesFiltradas([]);
      return;
    }
    
    // Filtrar solo las publicaciones del foro seleccionado, incluyendo el foro general
    console.log(`Filtrando publicaciones para foro ${foroId}`);
    const filtradas = publicacionesData.filter(pub => {
      // Consideramos las diferentes formas en que el ID del foro podría estar almacenado
      const pubForoId = pub.foro || pub.id_foro || pub.foro_id;
      return pubForoId === foroId;
    });
    
    console.log(`Encontradas ${filtradas.length} publicaciones para este foro`);
    setPublicacionesFiltradas(filtradas);
  };

  // Función para seleccionar un foro y filtrar publicaciones
  const handleSelectForo = (foro) => {
    console.log('Foro seleccionado:', foro?.nombre || 'ninguno', 'ID:', foro?.id);
    
    // Si no hay cambio real de foro, no hacer nada
    if (foroActual && foro && foroActual.id === foro.id) {
      console.log('El foro seleccionado es el mismo que el actual, no se realizan cambios');
      return;
    }
    
    // Actualizar estado del foro actual
    setForoActual(foro);
    
    // Mostrar indicador de carga
    setLoading(true);
    
    // Recargar publicaciones específicamente para este foro
    if (foro) {
      console.log(`Cargando publicaciones para foro: ${foro.nombre} (${foro.id})`);
      cargarPublicaciones(foro.id);
    } else {
      console.log('No se proporcionó un foro válido');
      setPublicacionesFiltradas([]);
      setLoading(false);
    }
  };

  // Función para manejar actualización mediante pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    cargarPublicaciones(foroActual?.id);
  };
  
  // Función para manejar navegación a nueva publicación
  const handleNavigateToNewPublication = () => {
    if (!personaId) {
      Alert.alert('Error', 'No se pudo identificar tu usuario. Por favor, cierra sesión y vuelve a iniciar sesión.');
      return;
    }
    
    // Pasar también el foro seleccionado para preseleccionarlo en nueva publicación
    navigation.getParent()?.navigate('NuevaPublicacion', { 
      personaId, 
      foroId: foroActual?.id 
    });
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
        cargarPublicaciones(foroActual?.id);
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
    publicaciones: publicacionesFiltradas, // Devolver las publicaciones filtradas
    allPublicaciones: publicaciones, // Mantener todas las publicaciones por si acaso
    personaId,
    foroActual,
    onRefresh,
    handleNavigateToNewPublication,
    handleSelectForo,
    checkRouteForAlerts,
    resetAlertShown
  };
}
