import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crearPublicacion } from '../services/comunidadService';

export default function NuevaPublicacionScreen({ route, navigation }) {
  // Safe handling of route params
  const personaIdFromRoute = route?.params?.personaId || null;
  
  const [asunto, setAsunto] = useState('');
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [personaId, setPersonaId] = useState(personaIdFromRoute);
  const [initializing, setInitializing] = useState(true);
  
  // Try to load personaId if not provided in route params
  useEffect(() => {
    if (!personaId) {
      const loadPersonaId = async () => {
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.persona_id) {
              setPersonaId(parsed.persona_id);
            }
          }
        } catch (error) {
          console.error('Error loading personaId:', error);
        } finally {
          setInitializing(false); // Set initializing to false when done
        }
      };
      
      loadPersonaId();
    } else {
      setInitializing(false); // Set initializing to false if personaId is already available
    }
  }, [personaId]);
  
  const handlePublicar = async () => {
    // Validar campos
    if (!asunto.trim()) {
      Alert.alert('Error', 'Por favor ingrese un asunto para la publicación');
      return;
    }

    if (!contenido.trim()) {
      Alert.alert('Error', 'Por favor ingrese el contenido de la publicación');
      return;
    }

    if (!personaId) {
      console.error('Error: No personaId available');
      Alert.alert(
        'Error', 
        'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.',
        [{ text: 'Volver', onPress: () => navigation?.goBack() }]
      );
      return;
    }

    setLoading(true);
    try {
      console.log('Creating publication with data:', {
        asunto: asunto.trim(),
        contenido: contenido.trim(),
        id_persona: personaId
      });
      
      const publicacionData = {
        asunto: asunto.trim(),
        contenido: contenido.trim(),
        id_persona: personaId
      };

      await crearPublicacion(publicacionData);
      
      // Navigate without showing alert in NuevaPublicacionScreen
      // We'll show the alert only in ComunidadScreen to avoid duplicates
      console.log('Publication created successfully, navigating back');
      
      // Navigate with a success parameter that will trigger the alert in ComunidadScreen
      if (Platform.OS === 'web') {
        // Web requires special handling - create a direct navigation with no alert
        console.log('Using web-specific navigation with direct success param');
        navigation.navigate('Home', {
          screen: 'Comunidad',
          params: {
            publicacionCreada: true,
            refreshTimestamp: Date.now(),
            skipAlert: false
          }
        });
      } else {
        // On mobile, we can use the normal navigation pattern
        navigation.navigate('Home', {
          screen: 'Comunidad',
          params: {
            publicacionCreada: true,
            refreshTimestamp: Date.now(),
            skipAlert: false
          }
        });
      }
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      Alert.alert('Error', 'No se pudo crear la publicación. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading indicator while initializing
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

  // Show error if no personaId available after initialization
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

          <View style={styles.formContainer}>
            <Text style={styles.label}>Asunto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el asunto de su publicación"
              value={asunto}
              onChangeText={setAsunto}
              maxLength={100}
            />

            <Text style={styles.label}>Contenido *</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Escriba el contenido de su publicación aquí..."
              value={contenido}
              onChangeText={setContenido}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.publishButton, (!asunto.trim() || !contenido.trim()) && styles.publishButtonDisabled]}
              onPress={handlePublicar}
              disabled={loading || !asunto.trim() || !contenido.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="send" size={20} color="#fff" />
                  <Text style={styles.publishButtonText}>Publicar</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation?.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#690B22',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contentInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  publishButton: {
    backgroundColor: '#690B22',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  publishButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#690B22',
  },
  cancelButtonText: {
    color: '#690B22',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#690B22',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#690B22',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#690B22',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
