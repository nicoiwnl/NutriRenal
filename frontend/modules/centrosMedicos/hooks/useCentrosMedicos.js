import { useState, useEffect } from 'react';
import { Platform, Linking, Alert } from 'react-native';
import api from '../../../api';

// Solo importar Location en plataformas móviles
let Location = null;
if (Platform.OS !== 'web') {
  try {
    Location = require('expo-location');
  } catch (error) {
    console.warn('Error loading expo-location:', error);
  }
}

export default function useCentrosMedicos() {
  const [loading, setLoading] = useState(true);
  const [centrosMedicos, setCentrosMedicos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialisis, setFilterDialisis] = useState(false);
  // En web, siempre iniciar en modo 'list'
  const [viewMode, setViewMode] = useState(Platform.OS === 'web' ? 'list' : 'list');
  const [mapRegion, setMapRegion] = useState({
    latitude: -33.4489,
    longitude: -70.6693,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [hasAdjustedMap, setHasAdjustedMap] = useState(false);

  // Cargar centros médicos
  useEffect(() => {
    fetchCentrosMedicos();
    
    // Comprobar permisos de ubicación solo en móvil
    if (Platform.OS !== 'web' && Location) {
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

  // Función para cargar centros médicos
  const fetchCentrosMedicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/centros-medicos/');
      setCentrosMedicos(response.data);
    } catch (error) {
      console.error('Error al cargar centros médicos:', error);
      // Datos de ejemplo para mostrar la interfaz
      setCentrosMedicos([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar centros médicos según búsqueda y filtro de diálisis
  const filteredCentros = centrosMedicos.filter(centro => {
    const matchesSearch = centro.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         centro.direccion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDialisis = !filterDialisis || centro.servicio_dialisis === true;
    return matchesSearch && matchesDialisis;
  });

  // Función para centrar el mapa en la ubicación actual (solo móvil)
  const centerMapOnUserLocation = async (mapRef) => {
    if (Platform.OS === 'web' || !Location || !mapRef) return;
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Se necesitan permisos de ubicación para acceder a esta función.');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const { latitude, longitude } = location.coords;
      
      const region = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      mapRef.current?.animateToRegion(region, 1000);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      alert('No se pudo obtener tu ubicación. Verifica los permisos.');
    }
  };

  // Función para centrar mapa en todos los centros (solo móvil)
  const centerMapOnCenters = (mapRef) => {
    if (Platform.OS === 'web' || !mapRef || filteredCentros.length === 0) return;
    
    try {
      // Calcular límites para todos los centros
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
      
      if (minLat !== Number.MAX_VALUE) {
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        
        const latDelta = (maxLat - minLat) * 1.5;
        const lngDelta = (maxLng - minLng) * 1.5;
        
        const newRegion = {
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lngDelta, 0.01),
        };
        
        mapRef.current?.animateToRegion(newRegion, 1000);
        setHasAdjustedMap(true);
      }
    } catch (error) {
      console.error('Error centrando el mapa:', error);
    }
  };

  // Funciones mejoradas para abrir mapas y llamar
  const openMaps = (latitud, longitud, nombre) => {
    try {
      console.log('Abriendo mapa para:', nombre, 'en', latitud, longitud);
      
      // Asegurarnos de que son números
      const lat = parseFloat(latitud);
      const lng = parseFloat(longitud);
      
      if (isNaN(lat) || isNaN(lng)) {
        Alert.alert('Error', 'Coordenadas no válidas');
        return;
      }
      
      // Estrategia específica por plataforma
      if (Platform.OS === 'android') {
        // En Android, intentar primero con Google Maps directamente
        const googleMapsUrl = `google.navigation:q=${lat},${lng}`;
        const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        
        Linking.canOpenURL(googleMapsUrl).then(supported => {
          if (supported) {
            return Linking.openURL(googleMapsUrl);
          } else {
            // Intentar abrir web si la app no está disponible
            return Linking.openURL(googleMapsWebUrl);
          }
        }).catch(() => {
          // Si falla, intentar con geo:
          const geoUrl = `geo:${lat},${lng}?q=${encodeURIComponent(nombre)}`;
          Linking.openURL(geoUrl).catch(err => {
            Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
          });
        });
      } else {
        // iOS y Web
        const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'https://maps.google.com/?q=';
        const label = encodeURIComponent(nombre);
        const url = `${scheme}${label}@${lat},${lng}`;
        
        Linking.canOpenURL(url).then(supported => {
          if (!supported) {
            Alert.alert('Error', 'No se puede abrir el mapa en este dispositivo');
          } else {
            return Linking.openURL(url);
          }
        });
      }
    } catch (error) {
      console.error('Error al abrir mapas:', error);
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
    }
  };

  const callPhone = (phone) => {
    try {
      console.log('Llamando a:', phone);
      
      // Verificar que el teléfono tenga un formato válido
      const phoneNumber = phone.replace(/\s+/g, ''); // Eliminar espacios
      
      if (!phoneNumber || phoneNumber.length < 5) {
        Alert.alert('Error', 'Número de teléfono no válido');
        return;
      }
      
      let phoneUrl = Platform.select({
        ios: `telprompt:${phoneNumber}`,
        android: `tel:${phoneNumber}`,
        web: `tel:${phoneNumber}`
      });
      
      console.log('Opening phone URL:', phoneUrl);
      
      Linking.canOpenURL(phoneUrl)
        .then(supported => {
          if (!supported) {
            Alert.alert('Error', 'Las llamadas telefónicas no están soportadas en este dispositivo');
            console.log('Cannot make phone calls on this device');
          } else {
            return Linking.openURL(phoneUrl);
          }
        })
        .catch(err => {
          console.error('Error al intentar llamar:', err);
          Alert.alert('Error', 'No se pudo realizar la llamada');
        });
    } catch (error) {
      console.error('Error general al llamar:', error);
      Alert.alert('Error', 'No se pudo acceder a la función de llamada');
    }
  };

  return {
    loading,
    filteredCentros,
    searchQuery,
    setSearchQuery,
    filterDialisis,
    setFilterDialisis,
    viewMode,
    setViewMode,
    mapRegion,
    hasAdjustedMap,
    setHasAdjustedMap,
    fetchCentrosMedicos,
    centerMapOnUserLocation,
    centerMapOnCenters,
    openMaps,
    callPhone
  };
}
