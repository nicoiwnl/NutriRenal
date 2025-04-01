import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  ActivityIndicator,
  Platform,
  Switch,
  Dimensions
} from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../api';

// Import map-related modules only on mobile platforms
let MapView, Marker, Callout, Location;
if (Platform.OS !== 'web') {
  // Dynamic imports to prevent web from loading these modules
  MapView = require('react-native-maps').default;
  Marker = require('react-native-maps').Marker;
  Callout = require('react-native-maps').Callout;
  Location = require('expo-location');
}

// Get window dimensions for map sizing
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function CentrosMedicosScreen({ navigation }: { navigation: any }) {
  const [loading, setLoading] = useState(true);
  const [centrosMedicos, setCentrosMedicos] = useState<{ id: number; nombre: string; direccion: string; servicio_dialisis: boolean; latitud: string; longitud: string; tipo_centro?: string; telefono?: string; horario?: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialisis, setFilterDialisis] = useState(false);
  
  // Siempre iniciar en modo lista, especialmente en web
  const [viewMode, setViewMode] = useState('list');
  
  // Map references and state - only used on mobile
  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: -33.4489,
    longitude: -70.6693,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [hasAdjustedMap, setHasAdjustedMap] = useState(false);
  
  useEffect(() => {
    fetchCentrosMedicos();
    
    // Comprobar permisos de ubicación solo en móvil
    if (Platform.OS !== 'web') {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          console.log(`Permiso de ubicación: ${status}`);
        } catch (error) {
          console.error('Error al solicitar permisos de ubicación:', error);
        }
      })();
    }
  }, []);
  
  useEffect(() => {
    // Centrar el mapa cuando tenemos centros médicos y estamos en modo mapa (solo en móvil)
    if (Platform.OS !== 'web' && centrosMedicos.length > 0 && viewMode === 'map' && !hasAdjustedMap) {
      centerMapOnCenters();
      setHasAdjustedMap(true);
    }
  }, [centrosMedicos, viewMode]);
  
  const fetchCentrosMedicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/centros-medicos/');
      setCentrosMedicos(response.data);
    } catch (error) {
      console.error('Error al cargar centros médicos:', error);
      // Datos de ejemplo para mostrar la interfaz
      setCentrosMedicos([
        {
          id: 1,
          nombre: 'Hospital Regional de Temuco',
          direccion: 'Manuel Montt 115, Temuco, Chile',
          telefono: '+56 45 2559000',
          horario: 'Abierto 24 horas',
          tipo_centro: 'Hospital Público',
          latitud: '-38.7359',
          longitud: '-72.5904',
          servicio_dialisis: true
        },
        {
          id: 2,
          nombre: 'Clínica Alemana Temuco',
          direccion: 'Senador Estébanez 645, Temuco',
          telefono: '+56 45 2201201',
          horario: 'Lunes a Viernes: 8:00 - 20:00, Sábado: 9:00 - 14:00',
          tipo_centro: 'Clínica Privada',
          latitud: '-38.7356',
          longitud: '-72.6023',
          servicio_dialisis: false
        },
        {
          id: 3,
          nombre: 'Centro de Diálisis NefroSur',
          direccion: 'Av. Alemania 0945, Temuco',
          telefono: '+56 45 2213344',
          horario: 'Lunes a Sábado: 7:00 - 19:00',
          tipo_centro: 'Centro Especializado',
          latitud: '-38.7401',
          longitud: '-72.6112',
          servicio_dialisis: true
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar centros médicos según búsqueda y filtro de diálisis
  const filteredCentros = centrosMedicos.filter(centro => {
    const matchesSearch = centro.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         centro.direccion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDialisis = !filterDialisis || centro.servicio_dialisis === true;
    return matchesSearch && matchesDialisis;
  });

  // Function to center map on all medical centers - only for mobile
  const centerMapOnCenters = () => {
    if (Platform.OS === 'web' || filteredCentros.length === 0 || !mapRef.current) return;
    
    try {
      // Calculate bounds for all centers
      let minLat = Number.MAX_VALUE;
      let maxLat = Number.MIN_VALUE;
      let minLng = Number.MAX_VALUE;
      let maxLng = Number.MIN_VALUE;
      
      filteredCentros.forEach(centro => {
        const lat = parseFloat(centro.latitud);
        const lng = parseFloat(centro.longitud);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        }
      });
      
      // Check if we have valid bounds
      if (minLat !== Number.MAX_VALUE) {
        // Calculate center and delta
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        
        // Add some padding
        const latDelta = (maxLat - minLat) * 1.5;
        const lngDelta = (maxLng - minLng) * 1.5;
        
        // Update map region
        const newRegion = {
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: Math.max(latDelta, 0.01), // Minimum zoom
          longitudeDelta: Math.max(lngDelta, 0.01), // Minimum zoom
        };
        
        mapRef.current.animateToRegion(newRegion, 1000);
        setHasAdjustedMap(true);
      }
    } catch (error) {
      console.error('Error centrando el mapa:', error);
    }
  };

  // Function to center map on user's location - only for mobile
  const centerMapOnUserLocation = async () => {
    if (Platform.OS === 'web' || !mapRef.current) return;
    
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Se necesitan permisos de ubicación para acceder a esta función.');
        return;
      }
      
      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const { latitude, longitude } = location.coords;
      
      // Animate map to user location
      const region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      mapRef.current.animateToRegion(region, 1000);
      console.log(`Mapa centrado en: ${latitude}, ${longitude}`);
      
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      alert('No se pudo obtener tu ubicación. Verifica los permisos.');
    }
  };

  const openMaps = (latitud: string, longitud: string, nombre: string) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
      web: 'https://maps.google.com/?q='
    });
    
    const latLng = `${latitud},${longitud}`;
    const label = encodeURI(nombre);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
      web: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  const callPhone = (phone: string) => {
    let phoneNumber = phone;
    if (Platform.OS !== 'android') {
      phoneNumber = `telprompt:${phone}`;
    } else {
      phoneNumber = `tel:${phone}`;
    }
    
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (!supported) {
          console.log('No se puede realizar llamadas desde este dispositivo');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch(err => console.error('Error al intentar llamar:', err));
  };

  const renderCentroMedicoItem = ({ item }: { item: { id: number; nombre: string; direccion: string; servicio_dialisis: boolean; latitud: string; longitud: string; tipo_centro?: string; telefono?: string; horario?: string } }) => (
    <Card style={styles.centroCard}>
      <Card.Content>
        <View style={styles.centroHeader}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.centroTitle}>{item.nombre}</Text>
            <Text style={styles.centroType}>{item.tipo_centro || 'Centro Médico'}</Text>
          </View>
          {item.servicio_dialisis && (
            <View style={styles.dialisisBadge}>
              <MaterialIcons name="water-drop" size={14} color="#FFFFFF" />
              <Text style={styles.dialisisText}>Diálisis</Text>
            </View>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.infoItem}>
          <MaterialIcons name="location-on" size={18} color="#690B22" />
          <Text style={styles.infoText}>{item.direccion}</Text>
        </View>
        
        {item.telefono && (
          <View style={styles.infoItem}>
            <MaterialIcons name="phone" size={18} color="#690B22" />
            <Text style={styles.infoText}>{item.telefono}</Text>
          </View>
        )}
        
        {item.horario && (
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={18} color="#690B22" />
            <Text style={styles.infoText}>{item.horario}</Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          {item.telefono && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.callButton]}
              onPress={() => callPhone(item.telefono)}
            >
              <MaterialIcons name="phone" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Llamar</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.verMapaButton}
            onPress={() => openMaps(item.latitud, item.longitud, item.nombre)}
          >
            <MaterialIcons name="place" size={20} color="#690B22" />
            <Text style={styles.verMapaButtonText}>Ver Mapa</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
  
  // Completely rewritten and fixed renderMapView function
  const renderMapView = () => {
    // Si estamos en web, mostrar mensaje que no está disponible
    if (Platform.OS === 'web') {
      return (
        <View style={styles.webMapFallback}>
          <MaterialIcons name="map" size={64} color="#690B22" />
          <Text style={styles.webMapFallbackText}>
            La vista de mapa no está disponible en el navegador web
          </Text>
          <Text style={styles.webMapFallbackSubtext}>
            Para acceder a los mapas, por favor utilice la aplicación móvil
          </Text>
          <TouchableOpacity 
            style={styles.webMapFallbackButton}
            onPress={() => setViewMode('list')}
          >
            <MaterialIcons name="view-list" size={24} color="#FFFFFF" />
            <Text style={styles.webMapFallbackButtonText}>Ver Lista</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Si estamos en móvil pero algo falló con la carga de MapView
    if (!MapView) {
      return (
        <View style={styles.webMapFallback}>
          <MaterialIcons name="error" size={64} color="#690B22" />
          <Text style={styles.webMapFallbackText}>
            No se pudo cargar el mapa
          </Text>
          <TouchableOpacity 
            style={styles.webMapFallbackButton}
            onPress={() => setViewMode('list')}
          >
            <MaterialIcons name="view-list" size={24} color="#FFFFFF" />
            <Text style={styles.webMapFallbackButtonText}>Ver Lista</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Plataformas nativas: Renderizar el mapa
    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          showsUserLocation={true}
        >
          {filteredCentros.map(centro => {
            // Validar coordenadas
            if (!centro.latitud || !centro.longitud) return null;
            
            const lat = parseFloat(centro.latitud);
            const lng = parseFloat(centro.longitud);
            
            // Validar que no sean NaN
            if (isNaN(lat) || isNaN(lng)) return null;
            
            // Devolver marcador
            return (
              <Marker
                key={centro.id}
                coordinate={{
                  latitude: lat,
                  longitude: lng
                }}
                title={centro.nombre}
                description={centro.direccion}
                pinColor={centro.servicio_dialisis ? '#990000' : '#1a75ff'}
              >
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{centro.nombre}</Text>
                    <Text style={styles.calloutText}>{centro.direccion}</Text>
                    
                    {centro.servicio_dialisis && (
                      <View style={styles.calloutBadge}>
                        <Text style={styles.calloutBadgeText}>Servicio de Diálisis</Text>
                      </View>
                    )}
                    
                    {centro.telefono && (
                      <Text style={styles.calloutText}>Tel: {centro.telefono}</Text>
                    )}
                    
                    <View style={styles.calloutButtons}>
                      <TouchableOpacity
                        style={styles.calloutButton}
                        onPress={() => openMaps(centro.latitud, centro.longitud, centro.nombre)}
                      >
                        <MaterialIcons name="directions" size={12} color="#FFF" />
                        <Text style={styles.calloutButtonText}>Ruta</Text>
                      </TouchableOpacity>
                      
                      {centro.telefono && (
                        <TouchableOpacity
                          style={styles.calloutButton}
                          onPress={() => callPhone(centro.telefono)}
                        >
                          <MaterialIcons name="phone" size={12} color="#FFF" />
                          <Text style={styles.calloutButtonText}>Llamar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
        
        {/* Botones de control del mapa */}
        <TouchableOpacity
          style={[styles.mapButton, styles.centerMarkersButton]}
          onPress={centerMapOnCenters}
        >
          <MaterialIcons name="place" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mapButton, styles.centerUserButton]}
          onPress={centerMapOnUserLocation}
        >
          <MaterialIcons name="my-location" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mapButton, { top: 16, left: 16 }]}
          onPress={() => setViewMode('list')}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  // Mejor función para cambiar el modo de vista - garantiza bloqueo en web
  const changeViewMode = (mode) => {
    if (Platform.OS === 'web' && mode === 'map') {
      // En web, mostrar un mensaje que el mapa no está disponible
      alert('La vista de mapa no está disponible en el navegador web. Para usar esta función, descargue la aplicación móvil.');
      return;
    }
    
    setViewMode(mode);
    
    // Reset map adjustment when switching to map
    if (mode === 'map') {
      setHasAdjustedMap(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar centro médico..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <MaterialIcons name="search" size={24} color="#999" style={styles.searchIcon} />
        </View>
        
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Solo centros con servicio de diálisis</Text>
          <Switch
            value={filterDialisis}
            onValueChange={setFilterDialisis}
            trackColor={{ false: "#ccc", true: "#690B22" }}
            thumbColor={filterDialisis ? "#fff" : "#f4f3f4"}
          />
        </View>
        
        {/* Mostrar aviso para versión web sobre limitaciones */}
        {Platform.OS === 'web' && (
          <View style={styles.webNoticeContainer}>
            <MaterialIcons name="info" size={20} color="#690B22" />
            <Text style={styles.webNoticeText}>
              La vista de mapa está disponible solo en la aplicación móvil
            </Text>
          </View>
        )}
        
        {/* Botones de modo de vista - solo mostrar en móvil si corresponde */}
        {Platform.OS !== 'web' && (
          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'list' && styles.viewModeButtonActive
              ]}
              onPress={() => changeViewMode('list')}
            >
              <MaterialIcons 
                name="view-list" 
                size={20} 
                color={viewMode === 'list' ? '#FFFFFF' : '#1B4D3E'} 
              />
              <Text style={[
                styles.viewModeText,
                viewMode === 'list' && styles.viewModeTextActive
              ]}>
                Lista
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                viewMode === 'map' && styles.viewModeButtonActive
              ]}
              onPress={() => changeViewMode('map')}
            >
              <MaterialIcons 
                name="map" 
                size={20} 
                color={viewMode === 'map' ? '#FFFFFF' : '#1B4D3E'} 
              />
              <Text style={[
                styles.viewModeText,
                viewMode === 'map' && styles.viewModeTextActive
              ]}>
                Mapa
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando centros médicos...</Text>
        </View>
      ) : (
        <>
          {viewMode === 'list' ? (
            <FlatList
              data={filteredCentros}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCentroMedicoItem}
              style={styles.listContainer}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="location-off" size={48} color="#690B22" />
                  <Text style={styles.emptyText}>
                    No se encontraron centros médicos con los criterios de búsqueda.
                  </Text>
                </View>
              }
            />
          ) : (
            renderMapView()
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8E8D8',
  },
  header: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  filterLabel: {
    fontSize: 16,
    color: '#1B4D3E',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  centroCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
  },
  centroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  centroTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 3,
  },
  centroType: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  dialisisBadge: {
    backgroundColor: '#690B22',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  dialisisText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#E0E0E0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  mapButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    textAlign: 'center',
    color: '#1B4D3E',
  },
  // Add map-related styles
  viewModeContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1B4D3E',
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  viewModeButtonActive: {
    backgroundColor: '#1B4D3E',
  },
  viewModeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#1B4D3E',
    fontWeight: '500',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutBadge: {
    backgroundColor: '#F8D7DA',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  calloutBadgeText: {
    color: '#721C24',
    fontSize: 10,
    fontWeight: 'bold',
  },
  calloutButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  calloutButton: {
    backgroundColor: '#690B22',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  calloutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  // Restaurar el estilo original del botón central
  centerMapButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#690B22',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Eliminar estilos de los botones que ya no se usan
  mapButton: {
    position: 'absolute',
    backgroundColor: '#690B22',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  centerMarkersButton: {
    bottom: 80,
    right: 16,
  },
  centerUserButton: {
    bottom: 16,
    right: 16,
  },
  // Add web fallback styles
  webMapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  webMapFallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: '#1B4D3E',
  },
  webMapFallbackSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    marginBottom: 20,
  },
  webMapFallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  webMapFallbackButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  mapMessage: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapMessageText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
  },
  // Nuevo estilo para el botón Ver Mapa en la lista
  verMapaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#690B22',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  verMapaButtonText: {
    color: '#690B22',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  webNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8E8D8',
    borderWidth: 1,
    borderColor: '#E07A5F',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  webNoticeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#690B22',
    flex: 1,
  },
});
