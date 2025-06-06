import React from 'react';
import { SafeAreaView, View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

// Importar componentes y hooks del módulo
import PublicacionForm from '../modules/comunidad/components/PublicacionForm';
import useNuevaPublicacion from '../modules/comunidad/hooks/useNuevaPublicacion';
import styles from '../modules/comunidad/styles/nuevaPublicacionStyles';

export default function NuevaPublicacionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Usar el hook personalizado para manejar la creación de publicaciones
  const {
    asunto,
    setAsunto,
    contenido,
    setContenido,
    loading,
    personaId,
    initializing,
    foros,
    foroSeleccionado,
    handleSelectForo,
    loadingForos,
    handlePublicar
  } = useNuevaPublicacion(route, navigation);

  // Mostrar pantalla de carga mientras se inicializa
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Preparando formulario...</Text>
      </View>
    );
  }

  // Verificar que tengamos personaId antes de mostrar el formulario
  if (!personaId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo identificar su usuario. Por favor, inicie sesión nuevamente.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          
        </View>
        
        <PublicacionForm 
          asunto={asunto}
          setAsunto={setAsunto}
          contenido={contenido}
          setContenido={setContenido}
          onPublicar={handlePublicar}
          onCancel={() => navigation.goBack()}
          loading={loading}
          // Nuevas props para selector de foro
          foros={foros}
          foroSeleccionado={foroSeleccionado}
          onSelectForo={handleSelectForo}
          loadingForos={loadingForos}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
