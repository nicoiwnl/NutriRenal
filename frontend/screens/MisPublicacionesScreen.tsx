import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import PublicacionCard from '../modules/comunidad/components/PublicacionCard';
import { MaterialIcons } from '@expo/vector-icons';

export default function MisPublicacionesScreen({ navigation }) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [personaId, setPersonaId] = useState(null);

  // Cargar el ID de la persona al iniciar
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          console.log('Usuario ID obtenido:', parsed.persona_id);
          setPersonaId(parsed.persona_id);
        } else {
          console.warn('No se encontró userData en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      }
    };
    
    fetchUserData();
  }, []);

  // Cargar mis publicaciones
  const cargarMisPublicaciones = async () => {
    if (!personaId) {
      console.log("No hay personaId, no se pueden cargar publicaciones");
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Intentando cargar publicaciones para el usuario: ${personaId}`);
      
      // Probar diferentes métodos de búsqueda
      let publicacionesEncontradas = [];
      
      // Método 1: Usando parámetro id_persona
      try {
        console.log("Intento 1: Buscando por id_persona");
        const response1 = await api.get('/publicaciones/', { 
          params: { id_persona: personaId } 
        });
        
        if (response1.data && Array.isArray(response1.data) && response1.data.length > 0) {
          console.log(`Encontradas ${response1.data.length} publicaciones con id_persona`);
          publicacionesEncontradas = response1.data;
        }
      } catch (e) {
        console.log("Error en búsqueda por id_persona:", e.message);
      }
      
      // Método 2: Si el anterior no encontró nada, probar con autor
      if (publicacionesEncontradas.length === 0) {
        try {
          console.log("Intento 2: Buscando por autor");
          const response2 = await api.get('/publicaciones/', { 
            params: { autor: personaId } 
          });
          
          if (response2.data && Array.isArray(response2.data) && response2.data.length > 0) {
            console.log(`Encontradas ${response2.data.length} publicaciones con autor`);
            publicacionesEncontradas = response2.data;
          }
        } catch (e) {
          console.log("Error en búsqueda por autor:", e.message);
        }
      }
      
      // Método 3: Último recurso, traer todas y filtrar manualmente
      if (publicacionesEncontradas.length === 0) {
        console.log("Intento 3: Trayendo todas las publicaciones y filtrando manualmente");
        const allResponse = await api.get('/publicaciones/');
        
        if (allResponse.data && Array.isArray(allResponse.data)) {
          console.log(`Analizando ${allResponse.data.length} publicaciones totales`);
          
          // Mostrar primeras 3 publicaciones para revisar su estructura
          if (allResponse.data.length > 0) {
            const samplePub = allResponse.data[0];
            console.log("Ejemplo de publicación:", JSON.stringify({
              id: samplePub.id,
              autor_id: samplePub.autor_id,
              autor: samplePub.autor,
              id_persona: samplePub.id_persona,
              persona: samplePub.persona,
              asunto: samplePub.asunto
            }));
          }
          
          // Filtro ampliado para detectar cualquier campo que pueda contener el ID
          publicacionesEncontradas = allResponse.data.filter(pub => {
            const autorMatch = pub.autor === personaId || 
                              pub.autor_id === personaId || 
                              pub.id_persona === personaId || 
                              pub.persona === personaId || 
                              pub.autor?.id === personaId || 
                              pub.id_autor === personaId;
                              
            if (autorMatch) {
              console.log(`Publicación encontrada por filtro manual: ${pub.id} - ${pub.asunto}`);
            }
            return autorMatch;
          });
          
          console.log(`Encontradas ${publicacionesEncontradas.length} publicaciones por filtro manual`);
        }
      }
      
      // Verificar la estructura antes de asignar
      if (publicacionesEncontradas.length > 0) {
        // Comprobar si tienen un ID válido para evitar errores de keyExtractor
        publicacionesEncontradas = publicacionesEncontradas.map(pub => {
          if (!pub.id && pub._id) pub.id = pub._id;  // MongoDB a veces usa _id
          return pub;
        });

        // NUEVO: Obtener información de foros para enriquecer publicaciones
        try {
          const forosResponse = await api.get('/foros/');
          const forosData = forosResponse.data || [];
          
          // Crear un mapa de IDs de foro a nombres para búsqueda rápida
          const forosMap = {};
          forosData.forEach(foro => {
            forosMap[foro.id] = foro.nombre;
          });
          
          // Enriquecer cada publicación con el nombre del foro
          publicacionesEncontradas = publicacionesEncontradas.map(pub => {
            const foroId = pub.foro || pub.id_foro || pub.foro_id;
            return {
              ...pub,
              foro_nombre: forosMap[foroId] || 'General'
            };
          });
          
          console.log("Publicaciones enriquecidas con información de foros");
        } catch (error) {
          console.error("Error al obtener información de foros:", error);
        }
      }
      
      console.log(`Total publicaciones encontradas: ${publicacionesEncontradas.length}`);
      setPublicaciones(publicacionesEncontradas);
      
    } catch (error) {
      console.error('Error al cargar mis publicaciones:', error);
      if (error.response) {
        console.log('Respuesta de error:', error.response.status, error.response.data);
      }
      Alert.alert('Error', 'No se pudieron cargar tus publicaciones. Intenta nuevamente.');
      setPublicaciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Actualizar cuando la pantalla gana foco o cambia personaId
  useFocusEffect(
    React.useCallback(() => {
      if (personaId) {
        console.log("Screen enfocada o personaId actualizado, recargando publicaciones");
        cargarMisPublicaciones();
      }
    }, [personaId])
  );

  // Función para manejar el refresh pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    cargarMisPublicaciones();
  };

  // Función para eliminar una publicación
  const handleDeletePublicacion = (publicacionId) => {
    Alert.alert(
      'Eliminar Publicación',
      '¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`Intentando eliminar publicación: ${publicacionId}`);
              await api.delete(`/publicaciones/${publicacionId}/`);
              setPublicaciones(prev => prev.filter(p => p.id !== publicacionId));
              Alert.alert('Éxito', 'Publicación eliminada correctamente.');
            } catch (error) {
              console.error('Error al eliminar publicación:', error);
              Alert.alert('Error', 'No se pudo eliminar la publicación. Intenta nuevamente.');
            }
          }
        },
      ]
    );
  };

  // Log para depuración justo antes de renderizar
  useEffect(() => {
    console.log(`Renderizando con ${publicaciones.length} publicaciones`);
  }, [publicaciones]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>

        <Text style={styles.subtitle}>Administra tus publicaciones</Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando tus publicaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={publicaciones}
          renderItem={({ item }) => {
            console.log(`Renderizando publicación: ${item.id} - ${item.asunto}`);
            return (
              <PublicacionCard
                publicacion={item}
                onPress={() => navigation.navigate('PublicacionDetail', { publicacionId: item.id })}
                showDeleteButton={true}
                onDelete={handleDeletePublicacion}
              />
            );
          }}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={publicaciones.length ? styles.listContainer : [styles.listContainer, styles.emptyListContainer]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#690B22"]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="article" size={60} color="#690B22" opacity={0.7} />
              <Text style={styles.emptyText}>
                No has creado ninguna publicación aún
              </Text>
              <Text style={styles.emptySubText}>
                Las publicaciones que crees aparecerán aquí
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3', // Cambio a color cálido como el resto de la app
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5D3C3', // Color más suave para el borde
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
  },
  subtitle: {
    fontSize: 14,
    color: '#8D6A5F', // Color más cálido para el subtítulo
    marginTop: 4,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F1EA', // Un tono suave para el fondo de carga
  },
  loadingText: {
    marginTop: 10,
    color: '#8D6A5F', // Color más cálido para el texto
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#5F4B44', // Color más oscuro para mejor legibilidad
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#8D6A5F', // Color cálido que hace juego
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  }
});
