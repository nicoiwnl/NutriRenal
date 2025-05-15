import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crearPublicacion } from '../../../services/comunidadService';
import api from '../../../api';

export default function useNuevaPublicacion(route, navigation) {
  // Manejar de forma segura los parámetros de la ruta
  const personaIdFromRoute = route?.params?.personaId || null;
  const preselectedForoId = route?.params?.foroId || null;
  
  const [asunto, setAsunto] = useState('');
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [personaId, setPersonaId] = useState(personaIdFromRoute);
  const [initializing, setInitializing] = useState(true);
  
  // Añadir estados para manejar foros
  const [foros, setForos] = useState([]);
  const [foroSeleccionado, setForoSeleccionado] = useState(null);
  const [loadingForos, setLoadingForos] = useState(true);
  
  // Cargar datos de usuario y foros al iniciar
  useEffect(() => {
    const inicializar = async () => {
      try {
        // Cargar ID de la persona si no se proporcionó en los parámetros de la ruta
        let userId = personaId;
        if (!userId) {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.persona_id) {
              userId = parsed.persona_id;
              setPersonaId(parsed.persona_id);
            }
          }
        }
        
        if (userId) {
          // Cargar lista de foros suscritos
          await cargarForosSuscritos(userId);
        } else {
          console.error('No se pudo obtener el ID de usuario');
        }
        
      } catch (error) {
        console.error('Error en inicialización:', error);
      } finally {
        setInitializing(false);
      }
    };
    
    inicializar();
  }, [personaId]);

  // Función para cargar foros suscritos por el usuario
  const cargarForosSuscritos = async (userId) => {
    if (!userId) return;
    
    try {
      setLoadingForos(true);
      console.log(`Cargando foros suscritos para usuario ${userId}...`);
      
      // Primero, obtener todos los foros disponibles
      const allForosResponse = await api.get('/foros/');
      const todosLosForos = allForosResponse.data || [];
      
      // Buscar el foro general (siempre debe estar disponible)
      const foroGeneral = todosLosForos.find(f => 
        f.es_general === true || f.id === '76b6de3f-89af-46b1-9874-147f8cbe0391'
      );
      
      // Obtener las suscripciones del usuario
      const suscripcionesResponse = await api.get('/foro-suscripciones/', {
        params: { persona: userId }
      });
      
      const suscripciones = suscripcionesResponse.data || [];
      const forosSuscritosIds = suscripciones.map(s => s.foro);
      
      console.log(`IDs de foros suscritos: ${forosSuscritosIds.join(', ')}`);
      
      // Filtrar los foros para incluir solo aquellos a los que el usuario está suscrito
      let forosSuscritos = todosLosForos.filter(foro => 
        forosSuscritosIds.includes(foro.id) || (foroGeneral && foro.id === foroGeneral.id)
      );
      
      // Asegurarnos de que el foro general siempre esté disponible
      if (foroGeneral && !forosSuscritos.some(f => f.id === foroGeneral.id)) {
        forosSuscritos.unshift(foroGeneral);
      }
      
      console.log(`Total foros disponibles para el usuario: ${forosSuscritos.length}`);
      setForos(forosSuscritos);
      
      // Seleccionar foro inicial
      if (preselectedForoId) {
        const foroPreseleccionado = forosSuscritos.find(f => f.id === preselectedForoId);
        if (foroPreseleccionado) {
          setForoSeleccionado(foroPreseleccionado);
        } else if (forosSuscritos.length > 0) {
          setForoSeleccionado(forosSuscritos[0]);
        }
      } else if (foroGeneral) {
        setForoSeleccionado(foroGeneral);
      } else if (forosSuscritos.length > 0) {
        setForoSeleccionado(forosSuscritos[0]);
      }
      
    } catch (error) {
      console.error('Error al cargar foros suscritos:', error);
      if (error.response) {
        console.log('Respuesta de error:', error.response.status, error.response.data);
      }
      
      // Si hay error, intentar al menos cargar el foro general
      try {
        const fallbackResponse = await api.get('/foros/');
        const fallbackForos = fallbackResponse.data || [];
        const foroGeneral = fallbackForos.find(f => f.es_general === true);
        
        if (foroGeneral) {
          setForos([foroGeneral]);
          setForoSeleccionado(foroGeneral);
        }
      } catch (fallbackError) {
        console.error('Error en fallback de foros:', fallbackError);
      }
      
    } finally {
      setLoadingForos(false);
    }
  };
  
  // Función para cambiar el foro seleccionado
  const handleSelectForo = (foro) => {
    setForoSeleccionado(foro);
  };
  
  // Función para publicar (actualizada)
  const handlePublicar = async () => {
    // Validar campos
    if (!asunto.trim()) {
      Alert.alert('Error', 'Por favor ingrese un asunto para la publicación');
      return;
    }

    if (!contenido.trim()) {
      Alert.alert('Error', 'Por favor ingrese el contenido de la publicación');
      return;
    }

    if (!personaId) {
      console.error('Error: No personaId available');
      Alert.alert(
        'Error', 
        'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.',
        [{ text: 'Volver', onPress: () => navigation?.goBack() }]
      );
      return;
    }
    
    if (!foroSeleccionado) {
      Alert.alert('Error', 'Por favor seleccione un foro para su publicación');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating publication with data:', {
        asunto: asunto.trim(),
        contenido: contenido.trim(),
        id_persona: personaId,
        foro: foroSeleccionado.id
      });
      
      const publicacionData = {
        asunto: asunto.trim(),
        contenido: contenido.trim(),
        id_persona: personaId,
        foro: foroSeleccionado.id
      };

      await crearPublicacion(publicacionData);
      
      // Navegar sin mostrar alerta en NuevaPublicacionScreen
      // Mostraremos la alerta solo en ComunidadScreen para evitar duplicados
      console.log('Publication created successfully, navigating back');
      
      // Navegar con un parámetro de éxito que activará la alerta en ComunidadScreen
      if (Platform.OS === 'web') {
        // Web requiere un manejo especial - crear una navegación directa sin alerta
        console.log('Using web-specific navigation with direct success param');
        navigation.navigate('Home', {
          screen: 'Comunidad',
          params: {
            publicacionCreada: true,
            refreshTimestamp: Date.now(),
            skipAlert: false
          }
        });
      } else {
        // En móvil, podemos usar el patrón de navegación normal
        navigation.navigate('Home', {
          screen: 'Comunidad',
          params: {
            publicacionCreada: true,
            refreshTimestamp: Date.now(),
            skipAlert: false
          }
        });
      }
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      Alert.alert('Error', 'No se pudo crear la publicación. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return {
    asunto,
    setAsunto,
    contenido,
    setContenido,
    loading,
    setLoading,
    personaId,
    initializing,
    foros,
    foroSeleccionado,
    handleSelectForo,
    loadingForos,
    handlePublicar
  };
}
