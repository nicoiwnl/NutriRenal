import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Callout } from 'react-native-maps';

const CentroMap = ({ 
  mapRef, 
  mapRegion, 
  centros, 
  onOpenMaps, 
  onCallPhone, 
  onCenterMap, 
  onCenterUserLocation,
  onChangeViewMode
}) => {
  // Plataformas nativas: Renderizar el mapa
  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion || {
          latitude: -33.4489,
          longitude: -70.6693,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
      >
        {centros.map(centro => {
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
                      onPress={() => onOpenMaps(centro.latitud, centro.longitud, centro.nombre)}
                    >
                      <MaterialIcons name="directions" size={12} color="#FFF" />
                      <Text style={styles.calloutButtonText}>Ruta</Text>
                    </TouchableOpacity>
                    
                    {centro.telefono && (
                      <TouchableOpacity
                        style={styles.calloutButton}
                        onPress={() => onCallPhone(centro.telefono)}
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
        onPress={onCenterMap}
      >
        <MaterialIcons name="place" size={24} color="#FFF" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.mapButton, styles.centerUserButton]}
        onPress={onCenterUserLocation}
      >
        <MaterialIcons name="my-location" size={24} color="#FFF" />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.mapButton, { top: 16, left: 16 }]}
        onPress={() => onChangeViewMode('list')}
      >
        <MaterialIcons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
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
});

export default CentroMap;