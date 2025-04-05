import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importar componentes y hooks del módulo
import PublicacionForm from '../modules/comunidad/components/PublicacionForm';
import useNuevaPublicacion from '../modules/comunidad/hooks/useNuevaPublicacion';
import styles from '../modules/comunidad/styles/nuevaPublicacionStyles';

export default function NuevaPublicacionScreen({ route, navigation }) {
  // Usar el hook personalizado
  const {
    asunto,
    setAsunto,
    contenido,
    setContenido,
    loading,
    personaId,
    initializing,
    handlePublicar
  } = useNuevaPublicacion(route, navigation);

  // Mostrar indicador de carga mientras se inicializa
  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#690B22" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar error si no hay personaId disponible después de la inicialización
  if (!personaId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color="#690B22" />
          <Text style={styles.errorText}>No se pudo identificar al usuario</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Nueva Publicación</Text>
          </View>

          <PublicacionForm
            asunto={asunto}
            setAsunto={setAsunto}
            contenido={contenido}
            setContenido={setContenido}
            onPublicar={handlePublicar}
            onCancel={() => navigation?.goBack()}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
