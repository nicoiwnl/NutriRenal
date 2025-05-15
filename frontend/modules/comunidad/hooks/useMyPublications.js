import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';
import { getPublicacionesByUsuario } from '../../../services/comunidadService';
import { useFocusEffect } from '@react-navigation/native';

export default function useMyPublications(navigation) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [personaId, setPersonaId] = useState(null);

  // Cargar datos de usuario desde AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setPersonaId(parsed.persona_id);
          console.log("ID de persona obtenido:", parsed.persona_id);
          fetchPublicaciones(parsed.persona_id);
        } else {
          Alert.alert('Error', 'No se pudo identificar su usuario. Por favor, inicie sesión nuevamente.');
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Función mejorada para cargar publicaciones desde API
  const fetchPublicaciones = async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando publicaciones para persona:', id);
      
      // Primer intento: usar parámetro autor
      let response = await api.get('/publicaciones/', { params: { autor: id } });
      
      // Si no hay resultados, intentar con id_persona
      if (!response.data || response.data.length === 0) {
        console.log('No se encontraron publicaciones con parámetro autor, intentando con id_persona');
        response = await api.get('/publicaciones/', { params: { id_persona: id } });
      }
      
      // Si aún no hay resultados, intentar con filtro manual
      if (!response.data || response.data.length === 0) {
        console.log('No se encontraron publicaciones con parámetros, obteniendo todas y filtrando');
        const allResponse = await api.get('/publicaciones/');
        if (allResponse.data && Array.isArray(allResponse.data)) {
          // Filtrar manualmente por cualquier campo que pueda contener el ID de autor
          const filtered = allResponse.data.filter(pub => 
            pub.autor === id || 
            pub.autor_id === id || 
            pub.id_persona === id || 
            pub.persona === id
          );
          console.log(`Se encontraron ${filtered.length} publicaciones mediante filtrado manual`);
          setPublicaciones(filtered);
        } else {
          setPublicaciones([]);
        }
      } else {
        console.log(`Se encontraron ${response.data.length} publicaciones del usuario`);
        setPublicaciones(response.data);
      }
    } catch (error) {
      console.error('Error al cargar mis publicaciones:', error);
      console.log('Detalles del error:', error.response?.status, error.response?.data);
      Alert.alert('Error', 'No se pudieron cargar sus publicaciones. Intente nuevamente.');
      setPublicaciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Actualizar cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      if (personaId) {
        console.log("Pantalla enfocada: recargando publicaciones del usuario");
        fetchPublicaciones(personaId);
      }
    }, [personaId])
  );

  // Función para manejar actualización mediante pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPublicaciones(personaId);
  };
  
  // Función para manejar navegación a nueva publicación
  const handleNavigateToNewPublication = () => {
    if (!personaId) {
      Alert.alert('Error', 'No se pudo identificar su usuario.');
      return;
    }
    navigation.navigate('NuevaPublicacion', { personaId });
  };
  
  // Navegar al detalle de una publicación
  const handlePublicacionPress = (publicacionId) => {
    navigation.navigate('PublicacionDetail', { publicacionId });
  };

  // Navegar de regreso a la comunidad general
  const handleBackToComunidad = () => {
    navigation.navigate('Comunidad');
  };

  return {
    loading,
    refreshing,
    publicaciones,
    personaId,
    onRefresh,
    handleNavigateToNewPublication,
    handlePublicacionPress,
    handleBackToComunidad
  };
}
