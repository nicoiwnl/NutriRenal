import React, { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

// Importar componentes y hooks
import ForoCard from '../modules/comunidad/components/ForoCard';
import useForosManagement from '../modules/comunidad/hooks/useForosManagement';
import styles from '../modules/comunidad/styles/comunidadStyles';

export default function ForosScreen({ navigation }) {
  // Logging para verificar renderización
  useEffect(() => {
    console.log("🟢 ForosScreen está siendo renderizada");
    return () => console.log("🔴 ForosScreen está siendo desmontada");
  }, []);

  // Usar el hook de foros
  const {
    loading,
    refreshing,
    foros,
    isSuscritoAForo,
    toggleSuscripcionForo,
    onRefresh
  } = useForosManagement();

  // Manejar errores en la carga de foros
  useEffect(() => {
    if (!loading && !refreshing && (!foros || foros.length === 0)) {
      console.log("⚠️ No se encontraron foros");
    }
  }, [loading, refreshing, foros]);

  // Manejador para cuando se presiona un foro
  const handleForoPress = (foro) => {
    if (!foro || !foro.id) {
      console.error('Error: Datos del foro incompletos', foro);
      Alert.alert('Error', 'No se pudo procesar el foro seleccionado.');
      return;
    }
    
    // Verificar si es el foro general (siempre accesible)
    const isGeneralForum = foro.id === '76b6de3f-89af-46b1-9874-147f8cbe0391' || foro.es_general === true;
    
    console.log(`Foro seleccionado: ${foro.id} (${foro.nombre}), Es general: ${isGeneralForum}`);
    
    // Verificar si ya está suscrito
    const suscrito = isGeneralForum || isSuscritoAForo(foro.id);
    
    if (suscrito) {
      // Si ya está suscrito, preguntar si desea ver el foro
      Alert.alert(
        isGeneralForum ? 'Foro General' : 'Foro Suscrito',
        `${isGeneralForum ? 'Todos tienen acceso al' : 'Estás suscrito al'} foro "${foro.nombre}". ¿Deseas ver sus publicaciones?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ver Foro',
            onPress: () => {
              navigation.navigate('Home', { 
                screen: 'Comunidad',
                params: {
                  foroId: foro.id,
                  foroNombre: foro.nombre,
                  foroUpdated: true // Add this flag to trigger refresh
                }
              });
            }
          }
        ]
      );
    } else {
      // Si no está suscrito, preguntar si desea suscribirse
      Alert.alert(
        'Suscripción a Foro',
        `¿Deseas suscribirte al foro "${foro.nombre}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Suscribirme',
            onPress: async () => {
              try {
                // Mostrar indicador de procesamiento
                Alert.alert(
                  'Procesando',
                  'Suscribiéndote al foro, por favor espera...'
                );
                
                const success = await toggleSuscripcionForo(foro.id);
                
                if (success) {
                  // Mostrar confirmación después de suscribirse
                  handleSuccessfulSubscription(foro);
                }
              } catch (error) {
                console.error('Error en suscripción:', error);
                Alert.alert(
                  'Error',
                  'No se pudo completar la suscripción. Por favor intenta nuevamente.'
                );
              }
            }
          }
        ]
      );
    }
  };

  // Add handler for successful subscription
  const handleSuccessfulSubscription = async (foro) => {
    // Refresh the forum list after subscription changes
    await onRefresh();
    
    // Now navigate with the flag to trigger update in ComunidadScreen
    setTimeout(() => {
      Alert.alert(
        'Suscripción Exitosa',
        `Te has suscrito al foro "${foro.nombre}". Ahora puedes ver sus publicaciones.`,
        [
          { text: 'Ver Más Tarde', style: 'cancel' },
          {
            text: 'Ver Ahora',
            onPress: () => {
              navigation.navigate('Home', { 
                screen: 'Comunidad',
                params: {
                  foroId: foro.id,
                  foroNombre: foro.nombre,
                  foroUpdated: true // Add flag to trigger refresh
                }
              });
            }
          }
        ]
      );
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Foros Disponibles</Text>
        <Text style={styles.headerSubtitle}>Suscríbete para ver publicaciones</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando foros...</Text>
        </View>
      ) : (
        <FlatList
          data={foros}
          renderItem={({ item }) => (
            <ForoCard
              foro={item}
              isSuscrito={isSuscritoAForo(item.id)}
              onPress={() => handleForoPress(item)}
              onToggleSuscripcion={toggleSuscripcionForo}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="forum" size={60} color="#690B22" />
              <Text style={styles.emptyText}>No hay foros disponibles</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
