import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
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
  // Estado para almacenar el centro seleccionado para mostrar opciones
  const [selectedCentro, setSelectedCentro] = useState(null);
  
  // Función para manejar el toque en el callout
  const handleCalloutPress = (centro) => {
    // Mostrar un diálogo con opciones
    Alert.alert(
      centro.nombre,
      centro.direccion,
      [
        {
          text: "Cómo llegar",
          onPress: () => onOpenMaps(centro.latitud, centro.longitud, centro.nombre)
        },
        centro.telefono ? {
          text: "Llamar",
          onPress: () => onCallPhone(centro.telefono)
        } : null,
        { text: "Cancelar", style: "cancel" }
      ].filter(Boolean) // Eliminar elementos null
    );
  };

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
              // Manejar el toque en el marcador directamente
              onCalloutPress={() => {
                // Mostrar opciones en un Alert
                Alert.alert(
                  centro.nombre,
                  centro.direccion,
                  [
                    {
                      text: "Cómo llegar",
                      onPress: () => onOpenMaps(centro.latitud, centro.longitud, centro.nombre),
                      style: "default"
                    },
                    centro.telefono ? {
                      text: "Llamar",
                      onPress: () => onCallPhone(centro.telefono),
                      style: "default"
                    } : null,
                    { text: "Cancelar", style: "cancel" }
                  ].filter(Boolean) // Eliminar elementos null
                );
              }}
            >
              <Callout tooltip style={{padding: 0, margin: 0}}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{centro.nombre}</Text>
                  
                  {centro.servicio_dialisis && (
                    <View style={styles.calloutBadge}>
                      <MaterialIcons name="water-drop" size={14} color="#721C24" />
                      <Text style={styles.calloutBadgeText}>Servicio de Diálisis</Text>
                    </View>
                  )}
                  
                  <Text style={styles.calloutText}>{centro.direccion}</Text>
                  
                  {centro.telefono && (
                    <Text style={styles.calloutText}>Tel: {centro.telefono}</Text>
                  )}
                  
                  <View style={styles.callToActionContainer}>
                    <Text style={styles.callToActionText}>
                      Toca para opciones
                    </Text>
                    <MaterialIcons name="touch-app" size={20} color="#690B22" />
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
    width: 240,
    // Eliminar alignItems para permitir mejor alineación de elementos internos
    // alignItems: 'center', 
    justifyContent: 'center',
    // Mejorar las sombras para que sea más visible
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 6,
    textAlign: 'center',
  },
  
  calloutBadge: {
    backgroundColor: '#F8D7DA',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'center',
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  calloutBadgeText: {
    color: '#721C24',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  calloutText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    textAlign: 'center',
  },
  
  callToActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    backgroundColor: '#F1E3D3',
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E07A5F',
  },
  callToActionText: {
    color: '#690B22',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#1a75ff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
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