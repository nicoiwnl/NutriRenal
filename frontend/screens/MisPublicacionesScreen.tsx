import React from 'react';
import { View, ActivityIndicator, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Importar componentes modularizados
import PublicacionCard from '../modules/comunidad/components/PublicacionCard';
import EmptyMyPublicationsView from '../modules/comunidad/components/EmptyMyPublicationsView';
import useMyPublications from '../modules/comunidad/hooks/useMyPublications';
import styles from '../modules/comunidad/styles/comunidadStyles';

export default function MisPublicacionesScreen({ navigation }) {
  // Usar el hook personalizado para la lógica
  const {
    loading,
    refreshing,
    publicaciones,
    personaId,
    onRefresh,
    handleNavigateToNewPublication,
    handlePublicacionPress,
    handleBackToComunidad
  } = useMyPublications(navigation);

  return (
    <SafeAreaView style={styles.container}>
      {/* Solo botón flotante para nueva publicación */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#690B22',
          borderRadius: 50,
          width: 60,
          height: 60,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          zIndex: 10
        }}
        onPress={handleNavigateToNewPublication}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Contenido principal */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando sus publicaciones...</Text>
        </View>
      ) : publicaciones.length > 0 ? (
        <FlatList
          data={publicaciones}
          renderItem={({ item }) => (
            <PublicacionCard 
              item={item} 
              onPress={() => handlePublicacionPress(item.id)} 
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <EmptyMyPublicationsView 
          onCreatePress={handleNavigateToNewPublication}
        />
      )}
    </SafeAreaView>
  );
}
