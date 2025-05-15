import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity, 
  RefreshControl,
  Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Componentes y hooks
import PublicacionCard from '../modules/comunidad/components/PublicacionCard';
import ComunidadHeader from '../modules/comunidad/components/ComunidadHeader';
import EmptyPublicacionesView from '../modules/comunidad/components/EmptyPublicacionesView';
import useComunidad from '../modules/comunidad/hooks/useComunidad';
import useForosManagement from '../modules/comunidad/hooks/useForosManagement';
import styles from '../modules/comunidad/styles/comunidadStyles';

export const options = {
  title: 'Comunidad'
};

export default function ComunidadScreen({ navigation, route }) {
  // Estado para controlar modal de selección de foro
  const [foroModalVisible, setForoModalVisible] = useState(false);
  
  // Usar hook personalizado para manejar lógica de foros
  const forosManagement = useForosManagement();
  
  // Usar hook personalizado para manejar lógica de comunidad
  const {
    loading,
    refreshing,
    publicaciones, // Ya filtradas por foro
    personaId,
    foroActual, // Estado del foro actual seleccionado
    onRefresh,
    handleNavigateToNewPublication,
    handleSelectForo,
    checkRouteForAlerts,
    resetAlertShown
  } = useComunidad(navigation, route);

  // Verificar alertas y recargar datos cuando la pantalla gana foco
  useFocusEffect(
    React.useCallback(() => {
      checkRouteForAlerts(true);
      return () => resetAlertShown();
    }, [])
  );

  // Manejar clic en una publicación
  const handlePublicacionPress = (publicacion) => {
    navigation.navigate('PublicacionDetail', { publicacionId: publicacion.id });
  };

  // Manejar navegación a pantalla de foros
  const handleForosPress = () => {
    navigation.navigate('Foro');
  };

  // Manejar navegación a mis publicaciones
  const handleMisPublicacionesPress = () => {
    navigation.navigate('MisPublicaciones');
  };
  
  // Mostrar el modal de selección de foro
  const handleSelectForoFromHeader = () => {
    // Obtener foros disponibles para el usuario
    const forosDisponibles = forosManagement.getForosSuscritosConGeneral();
    
    if (forosDisponibles?.length > 0) {
      setForoModalVisible(true);
    } else {
      alert('No hay foros disponibles. Suscríbete a algún foro en la sección de foros.');
    }
  };
  
  // Cuando se selecciona un foro del modal
  const onForoSelected = (foro) => {
    handleSelectForo(foro);
    setForoModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header personalizado */}
      <ComunidadHeader
        onMyPublicationsPress={handleMisPublicacionesPress}
        onNewPublicationPress={handleNavigateToNewPublication}
        onForosPress={handleForosPress}
        foroActual={foroActual}
        onSelectForo={handleSelectForoFromHeader}
      />
      
      {/* Información del foro actual */}
      {foroActual && (
        <View style={styles.foroHeaderContainer}>
          <Text style={styles.foroHeaderText}>
            {foroActual.nombre || "General"}
          </Text>
          <Text style={styles.foroDescriptionText}>
            {foroActual.descripcion || "Publicaciones generales de la comunidad"}
          </Text>
        </View>
      )}

      {/* Lista de publicaciones */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando publicaciones...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={publicaciones}
            renderItem={({ item }) => (
              <PublicacionCard
                publicacion={item}
                onPress={handlePublicacionPress}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={
              publicaciones.length === 0 ? { flex: 1 } : styles.listContainer
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#690B22"]}
              />
            }
            ListEmptyComponent={
              <EmptyPublicacionesView onCreatePress={handleNavigateToNewPublication} />
            }
          />
          
          {/* Botón flotante para nueva publicación */}
          <TouchableOpacity
            style={styles.fabButton}
            onPress={handleNavigateToNewPublication}
          >
            <MaterialIcons name="add" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
      
      {/* Modal para selección de foro */}
      <Modal
        visible={foroModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setForoModalVisible(false)}
      >
        <View style={styles.foroSelectorModalOverlay}>
          <View style={styles.foroSelectorModalContent}>
            <View style={styles.foroSelectorModalHeader}>
              <Text style={styles.foroSelectorModalTitle}>Seleccionar Foro</Text>
              <TouchableOpacity onPress={() => setForoModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={forosManagement.getForosSuscritosConGeneral()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.foroItem,
                    foroActual?.id === item.id && styles.foroItemSelected
                  ]}
                  onPress={() => onForoSelected(item)}
                >
                  <MaterialIcons 
                    name={item.es_general ? "public" : "forum"} 
                    size={20} 
                    color={foroActual?.id === item.id ? "#FFFFFF" : "#1B4D3E"} 
                  />
                  <Text 
                    style={[
                      styles.foroItemText,
                      foroActual?.id === item.id && styles.foroItemTextSelected
                    ]}
                    numberOfLines={1}
                  >
                    {item.nombre}
                  </Text>
                  {item.es_general && (
                    <View style={styles.generalBadge}>
                      <Text style={styles.generalBadgeText}>General</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No hay foros disponibles</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
