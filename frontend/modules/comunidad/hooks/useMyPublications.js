import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';

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

  // Función para cargar publicaciones desde API
  const fetchPublicaciones = async (id) => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/publicaciones/?id_persona=${id}`);
      console.log('Mis publicaciones obtenidas:', response.data);
      setPublicaciones(response.data);
    } catch (error) {
      console.error('Error al cargar mis publicaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar sus publicaciones. Intente nuevamente.');
      setPublicaciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
