import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { getUserRoles, determinePrimaryRole } from '../services/userService';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const SHOW_DEBUG_UI = false; // Set to false to hide development debug panels

export default function HomeScreen({ navigation }) {
  const [personaId, setPersonaId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  // Recuperar el ID del usuario y su rol al cargar la pantalla
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          setPersonaId(parsed.persona_id);
          
          // Obtener información del usuario para mostrarlo en la bienvenida
          try {
            const personaResponse = await api.get(`/personas/${parsed.persona_id}/`);
            if (personaResponse.data?.nombres) {
              setUserName(personaResponse.data.nombres);
            }
          } catch (personaError) {
            console.error('Error al obtener datos de persona:', personaError);
          }
          
          // DIAGNÓSTICO DE ROLES: Verificar consistencia entre AsyncStorage y API
          console.log('==== VERIFICANDO CONSISTENCIA DE ROLES ====');
          console.log(`1. Rol almacenado en AsyncStorage: ${parsed.role || 'No definido'}`);
          
          // More detailed logging of userData for debugging
          console.log('Full userData from AsyncStorage:', parsed);
          
          // Estamos en HomeScreen y ya tenemos un rol en AsyncStorage
          // Primero confiamos en ese rol para mostrar UI inmediatamente
          if (parsed.role) {
            console.log(`2. Usando rol desde AsyncStorage: ${parsed.role}`);
            setUserRole(parsed.role);
          } else {
            console.log('2. No role found in userData, will check API');
          }
          
          // Obtener los roles del usuario desde API para verificar consistencia
          if (parsed.persona_id) {
            try {
              console.log(`3. Verificando roles desde API para persona_id: ${parsed.persona_id}`);
              const rolesResponse = await getUserRoles(parsed.persona_id);
              console.log(`4. API devolvió ${rolesResponse?.length || 0} roles`);
              
              // Log detailed role information for better debugging
              if (rolesResponse && rolesResponse.length > 0) {
                console.log('Roles detallados recibidos:');
                rolesResponse.forEach((role, idx) => {
                  console.log(`- Rol #${idx+1}: ID=${role.rol?.id || 'undefined'}, Nombre=${role.rol?.nombre || 'undefined'}`);
                });
                
                // Check for cuidador role explicitly by ID - this is more reliable
                const cuidadorRole = rolesResponse.find(r => r.rol?.id === 2);
                if (cuidadorRole) {
                  console.log('✓ CUIDADOR ROLE DETECTED (ID 2)');
                  
                  // If user has a cuidador role, ensure AsyncStorage reflects this
                  if (parsed.role !== 'cuidador') {
                    console.log(`⚠️ INCONSISTENCY - Stored role: ${parsed.role}, Detected: cuidador`);
                    parsed.role = 'cuidador';
                    await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                    console.log('AsyncStorage updated with cuidador role');
                  }
                  
                  // Update UI with cuidador role
                  setUserRole('cuidador');
                } else {
                  console.log('✓ No cuidador role detected, assuming PACIENTE');
                  
                  // If AsyncStorage has wrong role, update it
                  if (parsed.role !== 'paciente') {
                    console.log(`⚠️ INCONSISTENCY - Stored role: ${parsed.role}, Detected: paciente`);
                    parsed.role = 'paciente';
                    await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                    console.log('AsyncStorage updated with paciente role');
                  }
                  
                  setUserRole('paciente');
                }
              } else {
                console.log('5. No roles found in API, defaulting to "paciente"');
                
                // If no roles found but we had a role stored, use it
                if (!parsed.role) {
                  parsed.role = 'paciente';
                  await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                  console.log('AsyncStorage updated with default paciente role');
                }
                
                setUserRole(parsed.role || 'paciente');
              }
            } catch (rolesError) {
              console.error('6. Error al obtener roles del usuario:', rolesError);
              // On error, just use whatever role was stored or default to paciente
              setUserRole(parsed.role || 'paciente');
            }
          }
        } else {
          console.log('No se encontró userData en AsyncStorage');
          Alert.alert('Error', 'No se encontró información del usuario. Intente iniciar sesión nuevamente.');
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Error al recuperar datos del usuario:', error);
        Alert.alert('Error', 'Hubo un problema al cargar sus datos. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    navigation.navigate('Login');
  };

  const navigateToDashboard = () => {
    if (personaId) {
      // Ahora siempre navegamos a FichaMedica, independientemente del rol
      // Pasamos el rol como parámetro para que FichaMedica pueda mostrar la interfaz adecuada
      navigation.navigate('FichaMedica', { 
        personaId,
        userRole  // Pasar el rol del usuario a la pantalla de FichaMedica
      });
    } else {
      Alert.alert('Error', 'No se pudo recuperar la información del usuario. Intente iniciar sesión nuevamente.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#F1E3D3', '#fff']}
        style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>
              Bienvenido{userName ? `, ${userName}` : ''}
            </Text>
            <Text style={styles.appName}>NutriRenal</Text>
            {userRole && (
              <View>
                <View style={styles.roleBadge}>
                  <MaterialIcons 
                    name={userRole === 'cuidador' ? 'medical-services' : 'person'} 
                    size={14} 
                    color="#fff" 
                  />
                  <Text style={styles.roleText}>
                    {userRole === 'cuidador' ? 'Cuidador' : 'Paciente'}
                  </Text>
                </View>
                
                {/* Debug buttons for role testing - only show in debug mode */}
                {SHOW_DEBUG_UI && (
                  <View style={styles.debugRoleButtons}>
                    <Text style={styles.debugWarning}>⚠️ SOLO PARA PRUEBAS</Text>
                    <TouchableOpacity 
                      style={[styles.debugRoleButton, userRole === 'paciente' ? styles.activeRoleButton : null]}
                      onPress={async () => {
                        Alert.alert(
                          'Modo de Prueba',
                          'Esto forzará el rol a "paciente" solo para pruebas. ¿Desea continuar?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Continuar', onPress: async () => {
                              const userData = await AsyncStorage.getItem('userData');
                              if (userData) {
                                const parsed = JSON.parse(userData);
                                parsed.role = 'paciente';
                                parsed._roleForced = true; // Flag to indicate this is a forced role
                                await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                                setUserRole('paciente');
                                Alert.alert('Rol forzado', 'Ahora viendo como PACIENTE (SOLO PRUEBAS)');
                              }
                            }}
                          ]
                        );
                      }}
                    >
                      <Text style={styles.debugRoleText}>Test Paciente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.debugRoleButton, userRole === 'cuidador' ? styles.activeRoleButton : null]}
                      onPress={async () => {
                        Alert.alert(
                          'Modo de Prueba',
                          'Esto forzará el rol a "cuidador" solo para pruebas. ¿Desea continuar?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Continuar', onPress: async () => {
                              const userData = await AsyncStorage.getItem('userData');
                              if (userData) {
                                const parsed = JSON.parse(userData);
                                parsed.role = 'cuidador';
                                parsed._roleForced = true; // Flag to indicate this is a forced role
                                await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                                setUserRole('cuidador');
                                Alert.alert('Rol forzado', 'Ahora viendo como CUIDADOR (SOLO PRUEBAS)');
                              }
                            }}
                          ]
                        );
                      }}
                    >
                      <Text style={styles.debugRoleText}>Test Cuidador</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.resetRoleButton}
                      onPress={async () => {
                        Alert.alert(
                          'Restablecer Rol',
                          '¿Desea restablecer su rol a la configuración original de la API?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Restablecer', onPress: async () => {
                              const userData = await AsyncStorage.getItem('userData');
                              if (userData) {
                                const parsed = JSON.parse(userData);
                                // Remove the role and force flag to allow it to be detected again
                                delete parsed.role;
                                delete parsed._roleForced;
                                await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                                
                                // Force a refresh to detect the role again
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: 'Home' }],
                                });
                              }
                            }}
                          ]
                        );
                      }}
                    >
                      <Text style={styles.resetRoleText}>Restablecer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={navigateToDashboard}>
            <MaterialIcons name="account-circle" size={40} color="#690B22" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Health Dashboard Card */}
          <TouchableOpacity 
            style={styles.dashboardCard}
            onPress={navigateToDashboard}>
            <View style={styles.dashboardCardContent}>
              <View>
                <Text style={styles.dashboardTitle}>
                  {userRole === 'cuidador' ? 'Panel de Cuidador' : 'Mi Dashboard'}
                </Text>
                <Text style={styles.dashboardSubtitle}>
                  {userRole === 'cuidador' 
                    ? 'Administre y visualice a sus pacientes'
                    : 'Ver mi perfil médico y nutricional'}
                </Text>
              </View>
              <MaterialIcons 
                name={userRole === 'cuidador' ? 'people' : 'dashboard'} 
                size={48} 
                color="#690B22" 
              />
            </View>
          </TouchableOpacity>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialIcons name="trending-up" size={24} color="#E07A5F" />
              <Text style={styles.statValue}>80%</Text>
              <Text style={styles.statLabel}>Progreso</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="today" size={24} color="#E07A5F" />
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Días seguidos</Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.actionGrid}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={navigateToDashboard}>
                <MaterialIcons name="assignment" size={32} color="#E07A5F" />
                <Text style={styles.actionText}>Mis Registros</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <MaterialIcons name="restaurant-menu" size={32} color="#E07A5F" />
                <Text style={styles.actionText}>Plan Nutricional</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <MaterialIcons name="insert-chart" size={32} color="#E07A5F" />
                <Text style={styles.actionText}>Progreso</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionCard}>
                <MaterialIcons name="notifications" size={32} color="#E07A5F" />
                <Text style={styles.actionText}>Recordatorios</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
            <View style={styles.activityCard}>
              <MaterialIcons name="water-drop" size={24} color="#690B22" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Registro de Agua</Text>
                <Text style={styles.activityTime}>Hace 2 horas</Text>
              </View>
            </View>
            <View style={styles.activityCard}>
              <MaterialIcons name="restaurant" size={24} color="#690B22" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Almuerzo Registrado</Text>
                <Text style={styles.activityTime}>Hace 4 horas</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1E3D3',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#1B4D3E',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
  },
  profileButton: {
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    width: isWeb ? Math.min(800, width) : undefined,
    alignSelf: 'center',
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    boxShadow: Platform.OS === 'web' ? '0px 4px 5px rgba(0, 0, 0, 0.1)' : undefined,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#690B22',
    marginVertical: 5,
  },
  statLabel: {
    color: '#1B4D3E',
    fontSize: 14,
  },
  quickActions: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: isWeb ? Math.min(800, width) : undefined,
    alignSelf: 'center',
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    boxShadow: Platform.OS === 'web' ? '0px 4px 5px rgba(0, 0, 0, 0.1)' : undefined,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    color: '#1B4D3E',
    fontSize: 14,
    textAlign: 'center',
  },
  recentActivity: {
    padding: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    boxShadow: Platform.OS === 'web' ? '0px 4px 5px rgba(0, 0, 0, 0.1)' : undefined,
    elevation: 3,
  },
  activityInfo: {
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    color: '#1B4D3E',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dashboardCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  dashboardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#690B22',
    padding: 12,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1E3D3',
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  debugRoleButtons: {
    flexDirection: 'row',
    marginTop: 5,
  },
  debugRoleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
    marginRight: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activeRoleButton: {
    backgroundColor: '#E07A5F',
    borderColor: '#690B22',
  },
  debugRoleText: {
    fontSize: 10,
    color: '#333',
  },
  debugWarning: {
    fontSize: 10,
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    width: '100%'
  },
  resetRoleButton: {
    marginTop: 5,
    backgroundColor: '#607D8B',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '100%'
  },
  resetRoleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
});