import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPublicaciones } from '../services/comunidadService';
import { getImageUrl } from '../utils/imageHelper';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

export const options = {
  title: 'Comunidad'
};

export default function ComunidadScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [publicaciones, setPublicaciones] = useState([]);
  const [personaId, setPersonaId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Add a ref to track if alert has been shown
  const alertShownRef = React.useRef(false);

  useFocusEffect(
    useCallback(() => {
      const isFocused = navigation.isFocused();
      console.log(`ComunidadScreen focus status: ${isFocused ? 'FOCUSED' : 'NOT FOCUSED'}`);
      console.log('Route params:', route.params);
      
      if (isFocused) {
        console.log('ComunidadScreen focused, refreshing data...');
        cargarPublicaciones();
        
        const hasRefreshParam = route.params?.refreshTimestamp;
        const wasPublicationCreated = route.params?.publicacionCreada;
        const shouldSkipAlert = route.params?.skipAlert === true;
        
        // Only show alert if we haven't shown it yet for these params
        // and we're not explicitly skipping the alert
        if (hasRefreshParam && !shouldSkipAlert && !alertShownRef.current) {
          console.log(`Showing alert for timestamp: ${route.params.refreshTimestamp}`);
          alertShownRef.current = true; // Mark alert as shown
          
          // If there's a publication created flag, show specific message
          if (wasPublicationCreated) {
            Alert.alert(
              'Publicación Exitosa',
              'Su publicación ha sido añadida a la comunidad'
            );
          } else {
            // Generic refresh message
            Alert.alert(
              'Actualizado',
              'Las publicaciones se han actualizado correctamente'
            );
          }
        }
        
        // Clear parameters to avoid repeated alerts on future focuses
        if (hasRefreshParam) {
          // Set skipAlert to true to prevent showing alert again
          navigation.setParams({ 
            refreshTimestamp: null,
            publicacionCreada: null,
            skipAlert: true
          });
        }
      } else {
        // Reset the alert shown ref when screen is not focused
        alertShownRef.current = false;
      }
    }, [navigation.isFocused(), route.params?.refreshTimestamp, route.params?.publicacionCreada])
  );

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

  const onRefresh = () => {
    setRefreshing(true);
    cargarPublicaciones();
  };

  const renderPublicacion = ({ item }) => {
    const fechaFormateada = new Date(item.fecha_creacion).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PublicacionDetail', { publicacionId: item.id })}
      >
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
            </View>
            
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
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const handleNavigateToNewPublication = () => {
    if (!personaId) {
      Alert.alert('Error', 'No se pudo identificar tu usuario. Por favor, cierra sesión y vuelve a iniciar sesión.');
      return;
    }
    
    navigation.getParent()?.navigate('NuevaPublicacion', { personaId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}></Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.misPublicacionesButton}
            onPress={() => navigation.navigate('MisPublicaciones')}
          >
            <MaterialIcons name="person" size={20} color="#690B22" />
            <Text style={styles.misPublicacionesText}>Mis Publicaciones</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.newButton}
            onPress={handleNavigateToNewPublication}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.newButtonText}>Nueva</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando publicaciones...</Text>
        </View>
      ) : publicaciones.length > 0 ? (
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
          <MaterialIcons name="forum" size={60} color="#690B22" />
          <Text style={styles.emptyText}>Aún no hay publicaciones</Text>
          <Text style={styles.emptySubText}>¡Sé el primero en compartir algo con la comunidad!</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => {
              if (!personaId) {
                Alert.alert('Error', 'No se pudo identificar tu usuario. Por favor, cierra sesión y vuelve a iniciar sesión.');
                return;
              }
              navigation.getParent()?.navigate('NuevaPublicacion', { personaId });
            }}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  misPublicacionesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#690B22',
  },
  misPublicacionesText: {
    color: '#690B22',
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 12,
  },
});