import React, { useRef } from 'react';
import { View, FlatList, TextInput, ActivityIndicator, Text, Platform, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Importar componentes modularizados
import CentroCard from '../modules/centrosMedicos/components/CentroCard';
import useCentrosMedicos from '../modules/centrosMedicos/hooks/useCentrosMedicos';
import styles from '../modules/centrosMedicos/styles/centrosMedicosStyles';

// Importar directamente - el bundler resolverá la versión correcta según la plataforma
import CentroMap from '../modules/centrosMedicos/components/CentroMap';

// Componente de filtro simplificado que no depende de MapView
const CentroFilter = ({ filterDialisis, setFilterDialisis, viewMode, onChangeViewMode, isWebView }) => {
  return (
    <View style={styles.filterContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons
          name={filterDialisis ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color="#690B22"
          onPress={() => setFilterDialisis(!filterDialisis)}
        />
        <Text style={{ marginLeft: 8, color: '#333' }}>
          Solo centros con servicio de diálisis
        </Text>
      </View>
      
      {/* Controles de vista de mapa solo para móvil */}
      {!isWebView && (
        <View style={{ flexDirection: 'row' }}>
          <MaterialIcons
            name="list"
            size={28}
            color={viewMode === 'list' ? '#690B22' : '#666'}
            style={{ marginRight: 15 }}
            onPress={() => onChangeViewMode('list')}
          />
          <MaterialIcons
            name="map"
            size={28}
            color={viewMode === 'map' ? '#690B22' : '#666'}
            onPress={() => onChangeViewMode('map')}
          />
        </View>
      )}
    </View>
  );
};

export default function CentrosMedicosScreen({ navigation }) {
  // El ref para el mapa solo es relevante en móvil
  const mapRef = Platform.OS !== 'web' ? useRef(null) : null;
  
  // Usar nuestro hook personalizado
  const {
    loading,
    filteredCentros,
    searchQuery,
    setSearchQuery,
    filterDialisis,
    setFilterDialisis,
    viewMode,
    setViewMode,
    openMaps,
    callPhone,
    centerMapOnCenters,
    centerMapOnUserLocation
  } = useCentrosMedicos();
  
  // En web, nos aseguramos que siempre sea vista de lista
  React.useEffect(() => {
    if (Platform.OS === 'web' && viewMode !== 'list') {
      setViewMode('list');
    }
  }, [viewMode, setViewMode]);
  
  // Función para cambiar el modo de vista solo en móvil
  const changeViewMode = (mode) => {
    // En web, siempre mantener en 'list'
    if (Platform.OS === 'web') {
      return;
    }
    
    setViewMode(mode);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando centros médicos...</Text>
      </View>
    );
  }

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
        
        {/* Componente de filtros */}
        <CentroFilter 
          filterDialisis={filterDialisis}
          setFilterDialisis={setFilterDialisis}
          viewMode={viewMode}
          onChangeViewMode={changeViewMode}
          isWebView={Platform.OS === 'web'}
        />
      </View>
      
      {/* En web o si el modo es 'list', mostrar la lista */}
      {(Platform.OS === 'web' || viewMode === 'list') && (
        <FlatList
          data={filteredCentros}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CentroCard 
              item={item} 
              onOpenMaps={openMaps}
              onCallPhone={callPhone}
            />
          )}
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
      )}
      
      {/* Solo renderizar el mapa si el modo es 'map' */}
      {viewMode === 'map' && (
        <CentroMap 
          mapRef={mapRef}
          mapRegion={null}
          centros={filteredCentros}
          onOpenMaps={openMaps}
          onCallPhone={callPhone}
          onCenterMap={() => centerMapOnCenters(mapRef)}
          onCenterUserLocation={() => centerMapOnUserLocation(mapRef)}
          onChangeViewMode={changeViewMode}
        />
      )}
    </SafeAreaView>
  );
}
