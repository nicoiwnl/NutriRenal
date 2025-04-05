import React from 'react';
import { View, ActivityIndicator, Text, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// Importar componentes modularizados
import PublicacionCard from '../modules/comunidad/components/PublicacionCard';
import EmptyPublicacionesView from '../modules/comunidad/components/EmptyPublicacionesView';
import ComunidadHeader from '../modules/comunidad/components/ComunidadHeader';
import useComunidad from '../modules/comunidad/hooks/useComunidad';
import styles from '../modules/comunidad/styles/comunidadStyles';

export const options = {
  title: 'Comunidad'
};

export default function ComunidadScreen({ navigation, route }) {
  // Usar el hook personalizado para la lógica de comunidad
  const {
    loading,
    refreshing,
    publicaciones,
    personaId,
    onRefresh,
    handleNavigateToNewPublication,
    checkRouteForAlerts,
    resetAlertShown
  } = useComunidad(navigation, route);

  // Verificar alertas cuando la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      const isFocused = navigation.isFocused();
      checkRouteForAlerts(isFocused);
      
      return () => {
        // Restablecer cuando la pantalla pierde el foco
        resetAlertShown();
      };
    }, [navigation.isFocused(), route.params])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado con botones para Mis Publicaciones y Nueva Publicación */}
      <ComunidadHeader 
        onMyPublicationsPress={() => navigation.navigate('MisPublicaciones')}
        onNewPublicationPress={handleNavigateToNewPublication}
      />

      {/* Contenido principal */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando publicaciones...</Text>
        </View>
      ) : publicaciones.length > 0 ? (
        <FlatList
          data={publicaciones}
          renderItem={({ item }) => (
            <PublicacionCard 
              item={item} 
              onPress={() => navigation.navigate('PublicacionDetail', { publicacionId: item.id })} 
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <EmptyPublicacionesView 
          onCreatePress={() => {
            if (!personaId) {
              Alert.alert('Error', 'No se pudo identificar tu usuario. Por favor, cierra sesión y vuelve a iniciar sesión.');
              return;
            }
            navigation.getParent()?.navigate('NuevaPublicacion', { personaId });
          }}
        />
      )}
    </SafeAreaView>
  );
}