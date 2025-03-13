import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPublicacionesByUsuario, eliminarPublicacion } from '../services/comunidadService';
import { getImageUrl } from '../utils/imageHelper';
import { useFocusEffect } from '@react-navigation/native';

export default function MisPublicacionesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [personaId, setPersonaId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.persona_id) {
            setPersonaId(parsed.persona_id);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (personaId) {
        cargarMisPublicaciones();
      }
    }, [personaId])
  );

  const cargarMisPublicaciones = async () => {
    if (!personaId) return;
    
    setLoading(true);
    try {
      const data = await getPublicacionesByUsuario(personaId);
      setPublicaciones(data);
    } catch (error) {
      console.error('Error al cargar publicaciones:', error);
      Alert.alert('Error', 'No se pudieron cargar tus publicaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeletePublicacion = (publicacionId) => {
    if (!publicacionId) {
      console.error('Error: publicationId is undefined or null');
      Alert.alert('Error', 'No se pudo identificar la publicación');
      return;
    }
  
    console.log(`Iniciando eliminación de publicación: ${publicacionId}`);
    
    // Different handling for web vs mobile
    if (Platform.OS === 'web') {
      // On web, use window.confirm instead of Alert
      const confirmDelete = window.confirm('¿Estás seguro que deseas eliminar esta publicación?');
      
      if (confirmDelete) {
        handleConfirmDelete(publicacionId);
      }
    } else {
      // On mobile, use React Native Alert
      Alert.alert(
        'Eliminar publicación',
        '¿Estás seguro que deseas eliminar esta publicación?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: () => handleConfirmDelete(publicacionId)
          }
        ]
      );
    }
  };

  // Separate function to handle delete confirmation
  const handleConfirmDelete = async (publicacionId) => {
    console.log('Usuario confirmó eliminación');
    setDeleteLoading(true);
    
    try {
      console.log(`Llamando a eliminarPublicacion con ID: ${publicacionId}`);
      const resultado = await eliminarPublicacion(publicacionId);
      console.log('Resultado de eliminación:', resultado);
      
      // Refrescar la lista de publicaciones
      await cargarMisPublicaciones();
      
      // Show different alerts based on platform
      if (Platform.OS === 'web') {
        alert('La publicación ha sido eliminada');
      } else {
        Alert.alert('Éxito', 'La publicación ha sido eliminada');
      }
    } catch (error) {
      console.error('Error detallado al eliminar publicación:', error);
      let mensajeError = 'No se pudo eliminar la publicación';
      
      // Show more specific error if available
      if (error.response?.data?.detail) {
        mensajeError += `: ${error.response.data.detail}`;
      }
      
      if (Platform.OS === 'web') {
        alert(`Error: ${mensajeError}`);
      } else {
        Alert.alert('Error', mensajeError);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarMisPublicaciones();
  };

  const renderPublicacion = ({ item }) => {
    const fechaFormateada = new Date(item.fecha_creacion).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: getImageUrl(item.autor_foto, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png') }}
              style={styles.authorImage}
              resizeMode="cover"
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{item.autor_nombre || 'Usuario'}</Text>
              <Text style={styles.publicationDate}>{fechaFormateada}</Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteButton, deleteLoading && styles.deleteButtonDisabled]}
              onPress={() => handleDeletePublicacion(item.id)}
              disabled={deleteLoading}
              // Add explicit role button for web accessibility
              accessibilityRole="button"
              accessibilityLabel="Eliminar publicación"
            >
              {deleteLoading ? (
                <ActivityIndicator size="small" color="#690B22" />
              ) : (
                <MaterialIcons name="delete" size={24} color="#690B22" />
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('PublicacionDetail', { publicacionId: item.id })}
          >
            <Text style={styles.asunto}>{item.asunto}</Text>
            <Text style={styles.contenido} numberOfLines={3}>
              {item.contenido}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="comment" size={16} color="#666" />
                <Text style={styles.statText}>{item.comentarios_count || 0} comentarios</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Publicaciones</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('NuevaPublicacion', { personaId })}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.newButtonText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      {publicaciones.length > 0 ? (
        <FlatList
          data={publicaciones}
          renderItem={renderPublicacion}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="article" size={60} color="#690B22" />
          <Text style={styles.emptyText}>No tienes publicaciones</Text>
          <Text style={styles.emptySubText}>¡Comparte algo con la comunidad!</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('NuevaPublicacion', { personaId })}
          >
            <Text style={styles.emptyButtonText}>Crear publicación</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#690B22',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 10,
  },
  authorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  publicationDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  asunto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1B4D3E',
  },
  contenido: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
