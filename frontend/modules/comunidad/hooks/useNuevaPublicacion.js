import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crearPublicacion } from '../../../services/comunidadService';

export default function useNuevaPublicacion(route, navigation) {
  // Manejar de forma segura los parámetros de la ruta
  const personaIdFromRoute = route?.params?.personaId || null;
  
  const [asunto, setAsunto] = useState('');
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [personaId, setPersonaId] = useState(personaIdFromRoute);
  const [initializing, setInitializing] = useState(true);
  
  // Intentar cargar personaId si no se proporciona en los parámetros de la ruta
  useEffect(() => {
    if (!personaId) {
      const loadPersonaId = async () => {
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.persona_id) {
              setPersonaId(parsed.persona_id);
            }
          }
        } catch (error) {
          console.error('Error loading personaId:', error);
        } finally {
          setInitializing(false); // Establecer initializing en false cuando termine
        }
      };
      
      loadPersonaId();
    } else {
      setInitializing(false); // Establecer initializing en false si personaId ya está disponible
    }
  }, [personaId]);
  
  // Función para publicar
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

    setLoading(true);
    try {
      console.log('Creating publication with data:', {
        asunto: asunto.trim(),
        contenido: contenido.trim(),
        id_persona: personaId
      });
      
      const publicacionData = {
        asunto: asunto.trim(),
        contenido: contenido.trim(),
        id_persona: personaId
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
    personaId,
    initializing,
    handlePublicar
  };
}
