import React from 'react';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../../api';

export default function useForosManagement() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [foros, setForos] = useState([]);
  const [forosSuscritos, setForosSuscritos] = useState([]);
  const [foroSeleccionado, setForoSeleccionado] = useState(null);
  const [personaId, setPersonaId] = useState(null);

  // Función auxiliar para facilitar el debugging de URLs de API
  const debugApiCall = (method, url, data = null) => {
    console.log(`[API ${method}] ${url}`, data ? JSON.stringify(data) : '');
    return { method, url, data };
  };

  // Cargar datos de usuario y foros al inicializar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        debugApiCall('GET', '/foros/');
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setPersonaId(parsed.persona_id);
          
          // Una vez que tenemos el personaId, cargamos los foros y suscripciones
          if (parsed.persona_id) {
            await cargarForos();
            await cargarForosSuscritos(parsed.persona_id);
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Función para cargar todos los foros disponibles
  const cargarForos = async () => {
    try {
      const response = await api.get('/foros/');
      if (response.data && Array.isArray(response.data)) {
        console.log(`Cargados ${response.data.length} foros del servidor`);
        setForos(response.data);
      } else {
        console.warn('Respuesta de foros no es un array:', response.data);
        setForos([]);
      }
    } catch (error) {
      console.error('Error al cargar foros:', error);
      Alert.alert('Error', 'No se pudieron cargar los foros disponibles.');
      setForos([]);
    }
  };

  // Función para cargar los foros a los que está suscrito el usuario
  const cargarForosSuscritos = async (userId) => {
    if (!userId) {
      console.warn('cargarForosSuscritos: No se proporcionó userId');
      return [];
    }
    
    try {
      console.log(`Cargando foros suscritos para usuario ${userId}...`);
      
      // Usar el endpoint correcto y los parámetros correctos
      const response = await api.get('/foro-suscripciones/', { 
        params: { persona: userId } // Aseguramos que usamos el parámetro correcto
      });
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Cargados ${response.data.length} foros suscritos del servidor`);
        // Debug para ver exactamente qué IDs están suscritos
        const forumIds = response.data.map(fs => fs.foro).join(', ');
        console.log(`IDs de foros suscritos: ${forumIds}`);
        
        setForosSuscritos(response.data);
        return response.data;
      } else {
        console.warn('Respuesta de foros suscritos no es un array:', response.data);
        setForosSuscritos([]);
        return [];
      }
    } catch (error) {
      console.error('Error al cargar foros suscritos:', error);
      console.log('Detalles del error:', error.response?.status, error.response?.data);
      
      // Si hay error 404, asumimos que no hay suscripciones y continuamos con array vacío
      if (error.response?.status === 404) {
        console.log('No se encontraron suscripciones para este usuario');
        setForosSuscritos([]);
      } else {
        // Para otros errores, mostramos alerta
        Alert.alert('Error', 'No se pudieron cargar tus foros suscritos. Algunos foros pueden no estar disponibles.');
        setForosSuscritos([]);
      }
      
      return [];
    }
  };

  // Función mejorada para verificar si está suscrito a un foro
  const isSuscritoAForo = (foroId) => {
    if (!foroId) return false;
    
    // El foro general siempre está disponible
    if (foroId === '76b6de3f-89af-46b1-9874-147f8cbe0391') {
      return true;
    }
    
    // Verificar en la lista de suscripciones
    if (!forosSuscritos || forosSuscritos.length === 0) {
      console.log(`No hay foros suscritos para el usuario`);
      return false;
    }
    
    // Debuggear
    console.log(`Verificando suscripción para foro: ${foroId}`);
    console.log(`Foros suscritos: ${JSON.stringify(forosSuscritos.map(fs => ({id: fs.id, foro: fs.foro})))}`);
    
    // Buscar en diferentes propiedades posibles
    const suscrito = forosSuscritos.some(fs => 
      fs.foro === foroId || 
      fs.id_foro === foroId || 
      fs.foro?.id === foroId
    );
    
    console.log(`¿Está suscrito al foro ${foroId}? ${suscrito}`);
    return suscrito;
  };

  // Función para cambiar suscripción a un foro
  const toggleSuscripcionForo = async (foroId) => {
    // Validación del ID de foro
    if (!foroId) {
      console.error('Error: foroId es null o undefined');
      Alert.alert('Error', 'ID de foro inválido. No se pudo procesar la solicitud.');
      return false;
    }

    // Validación del ID de persona
    if (!personaId) {
      console.error('Error: personaId es null o undefined');
      Alert.alert('Error', 'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.');
      return false;
    }

    try {
      const suscrito = isSuscritoAForo(foroId);
      
      if (foroId === '76b6de3f-89af-46b1-9874-147f8cbe0391') {
        Alert.alert('Foro General', 'No puedes cambiar la suscripción al foro general.');
        return false;
      }

      console.log(`${suscrito ? 'Cancelando suscripción' : 'Suscribiendo'} persona ${personaId} al foro ${foroId}...`);

      if (suscrito) {
        // Eliminar suscripción existente
        const suscripcion = forosSuscritos.find(fs => 
          (fs.id_foro === foroId) || (fs.foro === foroId)
        );
        
        if (suscripcion && suscripcion.id) {
          console.log(`Eliminando suscripción con ID ${suscripcion.id}`);
          
          await api.delete(`/foro-suscripciones/${suscripcion.id}/`);
          
          // Actualizar estado local inmediatamente
          setForosSuscritos(prev => prev.filter(fs => fs.id !== suscripcion.id));
          
          // Forzar recarga para asegurar que se muestre correctamente
          await cargarForosSuscritos(personaId);
          
          // Notificar éxito
          console.log('Suscripción eliminada con éxito');
        } else {
          console.error('No se encontró el ID de la suscripción a eliminar');
          return false;
        }
      } else {
        // Crear nueva suscripción
        // IMPORTANTE: Cambiamos los nombres de los campos según lo que espera la API
        const suscripcionData = {
          persona: personaId,  // Cambiado de id_persona a persona
          foro: foroId         // Cambiado de id_foro a foro
        };
        
        console.log('Datos de suscripción:', suscripcionData);
        
        const response = await api.post('/foro-suscripciones/', suscripcionData);
        console.log('Respuesta de suscripción:', response.data);
        
        if (response.data) {
          setForosSuscritos(prev => [...prev, response.data]);
        }
      }
      
      // Actualizar la lista de foros suscritos
      await cargarForosSuscritos(personaId);
      
      // After unsubscribing, force a refresh of the forums list
      await cargarForos();
      await cargarForosSuscritos(personaId);
      
      return true; // Indicar éxito
    } catch (error) {
      console.error('Error al cambiar suscripción:', error);
      console.log('Detalles del error:', error.response?.status, error.response?.data);
      
      let errorMessage = 'No se pudo procesar la suscripción. Intente nuevamente.';
      
      if (error.response) {
        console.error('Respuesta de error:', error.response.data);
        
        if (error.response.data && typeof error.response.data === 'object') {
          const errorDetails = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
            
          if (errorDetails) {
            errorMessage = `Error en el servidor: ${errorDetails}`;
          }
        }
      }
      
      Alert.alert('Error', errorMessage);
      return false; // Indicar fallo
    }
  };

  // Función para seleccionar un foro
  const handleSelectForo = (foro) => {
    setForoSeleccionado(foro);
  };

  // Función para actualizar datos
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarForos();
    if (personaId) {
      await cargarForosSuscritos(personaId);
    }
    setRefreshing(false);
  };

  // Ensure getForosSuscritosConGeneral always returns fresh data
  const getForosSuscritosConGeneral = () => {
    try {
      console.log(`Getting subscribed forums for user ${personaId}`);
      console.log(`Current subscriptions count: ${forosSuscritos.length}`);
      
      // Find the general forum (always available)
      const foroGeneral = foros.find(f => 
        f.id === '76b6de3f-89af-46b1-9874-147f8cbe0391' || f.es_general === true
      );
      
      // Get other forums that user is subscribed to
      const otrosForos = foros.filter(foro => 
        foro.id !== '76b6de3f-89af-46b1-9874-147f8cbe0391' && 
        !foro.es_general && 
        isSuscritoAForo(foro.id)
      );
      
      // Log which forums user is subscribed to for debugging
      console.log(`User is subscribed to: ${otrosForos.map(f => f.nombre).join(', ')}`);
      
      // Combine general forum with other subscribed forums
      const resultado = foroGeneral ? [foroGeneral, ...otrosForos] : otrosForos;
      console.log(`Total forums available for selection: ${resultado.length}`);
      
      return resultado;
    } catch (error) {
      console.error('Error al obtener foros suscritos:', error);
      return [];
    }
  };

  // Add an effect to refresh subscribed forums whenever the component is mounted
  useFocusEffect(
    React.useCallback(() => {
      if (personaId) {
        console.log("Screen focused: refreshing forum subscriptions");
        cargarForosSuscritos(personaId);
      }
    }, [personaId])
  );

  // Forzar actualización después de cambios en suscripciones
  useEffect(() => {
    console.log('Estado de suscripciones actualizado:', forosSuscritos.length);
  }, [forosSuscritos]);

  // Add function to refresh foros that can be exported
  const refreshForos = async () => {
    console.log('Refreshing foros list manually');
    await cargarForos();
    if (personaId) {
      await cargarForosSuscritos(personaId);
    }
  };

  return {
    loading,
    refreshing,
    foros,
    forosSuscritos,
    foroSeleccionado,
    handleSelectForo,
    isSuscritoAForo,
    toggleSuscripcionForo,
    onRefresh,
    getForosSuscritosConGeneral,
    refreshForos // Export the new function
  };
}
