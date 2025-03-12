import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { getUserRoles, determinePrimaryRole, updateStoredUserRole, setRoleOverride, clearRoleOverride } from '../services/userService';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoleDiagnosticScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [asyncStorageData, setAsyncStorageData] = useState(null);
  const [apiRolesData, setApiRolesData] = useState(null);
  const [inconsistencyFound, setInconsistencyFound] = useState(false);
  const [fixInProgress, setFixInProgress] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState(null);

  const ROLE_MAPPING = {
    1: 'paciente',
    2: 'cuidador'
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      // 1. Revisar AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      const parsedUserData = userData ? JSON.parse(userData) : null;
      setAsyncStorageData(parsedUserData);

      if (!parsedUserData || !parsedUserData.persona_id) {
        console.log('No hay datos de usuario o ID de persona');
        setLoading(false);
        return;
      }

      // 2. Consultar API de roles con diagnóstico mejorado
      const diagnosis = await diagnosisRoles();
      setDiagnosticData(diagnosis.diagnosticData);
      
      // 3. Get detailed role data from API
      const rolesResponse = await getUserRoles(parsedUserData.persona_id);
      setApiRolesData(rolesResponse);

      // 4. Verificar si hay inconsistencia
      if (diagnosis.hasInconsistency) {
        setInconsistencyFound(true);
        console.log(`Inconsistencia encontrada: AsyncStorage=${parsedUserData.role}, API=${diagnosis.apiRole}`);
      }
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      Alert.alert('Error', 'Ocurrió un error durante el diagnóstico');
    } finally {
      setLoading(false);
    }
  };

  const fixRoleInconsistency = async () => {
    setFixInProgress(true);
    try {
      const apiRole = determinePrimaryRole(apiRolesData);
      
      // Actualizar el rol en AsyncStorage
      if (asyncStorageData) {
        const updatedUserData = {...asyncStorageData, role: apiRole};
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        setAsyncStorageData(updatedUserData);
        setInconsistencyFound(false);
        
        Alert.alert(
          'Éxito', 
          `Rol actualizado correctamente a: ${apiRole}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error corrigiendo inconsistencia:', error);
      Alert.alert('Error', 'No se pudo corregir la inconsistencia');
    } finally {
      setFixInProgress(false);
    }
  };

  const clearOnlyRoleData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        // Eliminar solo la propiedad del rol
        delete parsedData.role;
        await AsyncStorage.setItem('userData', JSON.stringify(parsedData));
        
        Alert.alert(
          'Datos de rol eliminados', 
          'Se ha eliminado el rol guardado. Al volver a la pantalla de FichaMedica se detectará nuevamente.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error al limpiar datos de rol:', error);
      Alert.alert('Error', 'No se pudieron limpiar los datos de rol');
    }
  };

  const resetAllData = async () => {
    Alert.alert(
      'Confirmar',
      'Esto cerrará tu sesión y borrará todos los datos guardados. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: async () => {
          try {
            await AsyncStorage.clear();
            Alert.alert('Éxito', 'Todos los datos han sido borrados', [
              { text: 'OK', onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }}
            ]);
          } catch (error) {
            console.error('Error al borrar datos:', error);
            Alert.alert('Error', 'No se pudieron borrar los datos');
          }
        }}
      ]
    );
  };

  // Add a new function to inspect and audit the user data
  const performDeepRoleAudit = async () => {
    setLoading(true);
    try {
      // 1. Get the current userData from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      const parsedUserData = userData ? JSON.parse(userData) : null;
      setAsyncStorageData(parsedUserData);
      
      if (!parsedUserData || !parsedUserData.persona_id) {
        Alert.alert('Error', 'No user data found in AsyncStorage');
        setLoading(false);
        return;
      }
      
      console.log('🔍 DEEP ROLE AUDIT:');
      console.log('Step 1: Current userData in AsyncStorage:', parsedUserData);
      
      // 2. Check if the role was forced for testing
      const wasForced = parsedUserData._roleForced === true;
      console.log(`Step 2: Role forced flag: ${wasForced ? 'YES ⚠️' : 'NO'}`);
      
      // 3. Get roles directly from API
      console.log(`Step 3: Fetching roles from API for persona_id: ${parsedUserData.persona_id}`);
      const rolesResponse = await getUserRoles(parsedUserData.persona_id);
      setApiRolesData(rolesResponse);
      
      console.log(`Step 4: API returned ${rolesResponse?.length || 0} roles:`, rolesResponse);
      
      // 4. Determine the primary role that should be used
      const correctRole = determinePrimaryRole(rolesResponse);
      console.log(`Step 5: Correct role based on API data: ${correctRole}`);
      
      // 5. Check for inconsistency
      if (parsedUserData.role !== correctRole) {
        setInconsistencyFound(true);
        console.log(`⚠️ INCONSISTENCY: AsyncStorage=${parsedUserData.role}, API=${correctRole}`);
        
        // Show alert with fix option
        Alert.alert(
          'Role Inconsistency Detected',
          `Your current role (${parsedUserData.role}) doesn't match what's in the database (${correctRole}).`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Fix Now', 
              style: 'default',
              onPress: async () => {
                // Update AsyncStorage with correct role
                const updatedData = { ...parsedUserData, role: correctRole };
                delete updatedData._roleForced; // Remove forced flag if present
                await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
                
                // Update UI and show success
                setAsyncStorageData(updatedData);
                setInconsistencyFound(false);
                Alert.alert('Success', `Role updated to ${correctRole}`);
              }
            }
          ]
        );
      } else {
        console.log('✅ CONSISTENT: AsyncStorage role matches API role');
      }
      
    } catch (error) {
      console.error('Error in deep role audit:', error);
      Alert.alert('Error', 'Could not complete role audit');
    } finally {
      setLoading(false);
    }
  };

  // Add a new function to allow role selection and prioritization
  const changePrioritySettings = () => {
    Alert.alert(
      'Configuración de Prioridad de Roles',
      'Selecciona qué rol debe tener prioridad cuando un usuario tiene múltiples roles',
      [
        {
          text: 'Priorizar Paciente',
          onPress: async () => {
            try {
              // Store preference
              await AsyncStorage.setItem('rolePriority', 'paciente');
              Alert.alert('Configuración actualizada', 'Se priorizará el rol de paciente');
            } catch (error) {
              console.error('Error saving role priority:', error);
            }
          }
        },
        {
          text: 'Priorizar Cuidador',
          onPress: async () => {
            try {
              // Store preference
              await AsyncStorage.setItem('rolePriority', 'cuidador');
              Alert.alert('Configuración actualizada', 'Se priorizará el rol de cuidador');
            } catch (error) {
              console.error('Error saving role priority:', error);
            }
          }
        },
        { 
          text: 'Cancelar', 
          style: 'cancel'
        }
      ]
    );
  };

  // Add new functions to force roles
  const forceRoleCuidador = async () => {
    try {
      await setRoleOverride('cuidador');
      Alert.alert(
        'Rol Forzado',
        'El rol ha sido forzado a CUIDADOR. Este es un ajuste temporal para usuarios con problemas de detección de rol.',
        [{ text: 'OK', onPress: () => runDiagnostic() }]
      );
    } catch (error) {
      console.error('Error forcing role:', error);
      Alert.alert('Error', 'No se pudo forzar el rol');
    }
  };

  const forceRolePaciente = async () => {
    try {
      await setRoleOverride('paciente');
      Alert.alert(
        'Rol Forzado',
        'El rol ha sido forzado a PACIENTE. Este es un ajuste temporal para usuarios con problemas de detección de rol.',
        [{ text: 'OK', onPress: () => runDiagnostic() }]
      );
    } catch (error) {
      console.error('Error forcing role:', error);
      Alert.alert('Error', 'No se pudo forzar el rol');
    }
  };

  const clearRoleForce = async () => {
    try {
      await clearRoleOverride();
      Alert.alert(
        'Ajuste Eliminado',
        'El ajuste manual de rol ha sido eliminado. El sistema volverá a detectar automáticamente el rol.',
        [{ text: 'OK', onPress: () => runDiagnostic() }]
      );
    } catch (error) {
      console.error('Error clearing role force:', error);
      Alert.alert('Error', 'No se pudo eliminar el ajuste de rol');
    }
  };

  // Modify renderControlPanel to include the new option
  const renderControlPanel = () => (
    <View style={styles.controlPanel}>
      <Text style={styles.sectionTitle}>Role Control Panel</Text>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.auditButton]} 
        onPress={performDeepRoleAudit}
      >
        <MaterialIcons name="search" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Run Deep Role Audit</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.priorityButton]} 
        onPress={changePrioritySettings}
      >
        <MaterialIcons name="priority-high" size={20} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>Cambiar Prioridad de Roles</Text>
      </TouchableOpacity>
      
      {/* ...existing buttons... */}

      <View style={styles.emergencyControls}>
        <Text style={styles.emergencyTitle}>CONTROLES DE EMERGENCIA</Text>
        <Text style={styles.emergencyText}>
          Use estos controles SOLO si la detección automática de roles no funciona correctamente.
        </Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.roleCuidadorButton]} 
          onPress={forceRoleCuidador}
        >
          <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Forzar Rol: CUIDADOR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rolePacienteButton]} 
          onPress={forceRolePaciente}
        >
          <MaterialIcons name="person" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Forzar Rol: PACIENTE</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.clearForceButton]} 
          onPress={clearRoleForce}
        >
          <MaterialIcons name="restore" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Eliminar Ajuste Manual</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Title 
            title="Diagnóstico de Roles" 
            subtitle="Verifica y corrige problemas de detección de roles" 
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#690B22" />
                <Text style={styles.loadingText}>Analizando datos...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Datos en AsyncStorage:</Text>
                {asyncStorageData ? (
                  <View style={styles.dataContainer}>
                    <Text style={styles.dataLabel}>ID de usuario: <Text style={styles.dataValue}>{asyncStorageData.user_id || 'No disponible'}</Text></Text>
                    <Text style={styles.dataLabel}>Email: <Text style={styles.dataValue}>{asyncStorageData.email || 'No disponible'}</Text></Text>
                    <Text style={styles.dataLabel}>ID de persona: <Text style={styles.dataValue}>{asyncStorageData.persona_id || 'No disponible'}</Text></Text>
                    <Text style={styles.dataLabel}>Rol guardado: 
                      <Text style={[
                        styles.dataValue, 
                        asyncStorageData.role === 'cuidador' ? styles.roleHighlightCuidador : styles.roleHighlightPaciente
                      ]}>
                        {asyncStorageData.role || 'No definido'}
                      </Text>
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noDataText}>No hay datos de usuario en AsyncStorage</Text>
                )}

                <Text style={styles.sectionTitle}>Roles desde API:</Text>
                {apiRolesData ? (
                  <View style={styles.dataContainer}>
                    <Text style={styles.dataLabel}>Cantidad de roles: <Text style={styles.dataValue}>{apiRolesData.length}</Text></Text>
                    
                    {apiRolesData.map((roleItem, index) => (
                      <View key={index} style={styles.roleItem}>
                        <Text style={styles.roleItemText}>
                          <Text style={styles.bold}>Rol #{index + 1}: </Text> 
                          ID: {roleItem.rol?.id}, 
                          Nombre: {roleItem.rol?.nombre || 'No definido'},
                          {roleItem.rol?.id && (
                            <>
                              {"\n"}
                              <Text style={styles.roleItemNote}>
                                El ID {roleItem.rol.id} corresponde a: <Text style={styles.bold}>
                                  {ROLE_MAPPING[roleItem.rol.id] || "desconocido"}
                                </Text>
                              </Text>
                            </>
                          )}
                        </Text>
                      </View>
                    ))}
                    
                    <Text style={styles.dataLabel}>Rol determinado: 
                      <Text style={[
                        styles.dataValue,
                        determinePrimaryRole(apiRolesData) === 'cuidador' ? styles.roleHighlightCuidador : styles.roleHighlightPaciente
                      ]}>
                        {determinePrimaryRole(apiRolesData)}
                      </Text>
                    </Text>

                    <View style={styles.explanationContainer}>
                      <Text style={styles.explanationTitle}>Posibles problemas:</Text>
                      <Text style={styles.explanationText}>
                        • Si su rol en la BD es ID:1, debería ser "paciente"{"\n"}
                        • Si su rol en la BD es ID:2, debería ser "cuidador"{"\n"}
                        • Si hay una discrepancia, el mapeo de roles necesita ser corregido
                      </Text>
                    </View>
                    
                    {inconsistencyFound && (
                      <View style={styles.inconsistencyContainer}>
                        <MaterialIcons name="warning" size={24} color="#FF9800" />
                        <Text style={styles.inconsistencyText}>
                          Se detectó una inconsistencia entre el rol guardado y los roles de la API
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Text style={styles.noDataText}>No se pudieron obtener roles desde la API</Text>
                )}

                {diagnosticData && (
                  <View style={styles.dataContainer}>
                    <Text style={styles.sectionTitle}>Diagnóstico Detallado:</Text>
                    
                    <View style={styles.detailedDiagnostic}>
                      <Text style={styles.diagnosticLabel}>Rol en AsyncStorage: 
                        <Text style={[styles.diagnosticValue, diagnosticData.storedRole === 'cuidador' ? 
                          styles.roleHighlightCuidador : styles.roleHighlightPaciente]}>
                          {diagnosticData.storedRole}
                        </Text>
                      </Text>
                      
                      <Text style={styles.diagnosticLabel}>Fuente de Verdad (API): 
                        <Text style={[styles.diagnosticValue, diagnosticData.sourceOfTruth === 'cuidador' ? 
                          styles.roleHighlightCuidador : styles.roleHighlightPaciente]}>
                          {diagnosticData.sourceOfTruth}
                        </Text>
                      </Text>
                      
                      <Text style={styles.diagnosticLabel}>Estado de sincronización: 
                        <Text style={[styles.diagnosticValue, 
                          diagnosticData.inconsistency ? styles.inconsistentValue : styles.consistentValue]}>
                          {diagnosticData.inconsistency ? 'INCONSISTENTE ⚠️' : 'SINCRONIZADO ✅'}
                        </Text>
                      </Text>
                      
                      {/* Add a clear explanation of the issue */}
                      <View style={styles.explanationBox}>
                        <Text style={styles.explanationTitle}>Explicación Técnica:</Text>
                        <Text style={styles.explanationText}>
                          Los roles en la base de datos (ID=1 para paciente, ID=2 para cuidador) son la fuente
                          definitiva de verdad. Si hay una discrepancia entre estos roles y lo que muestra la aplicación,
                          podría deberse a:
                          {"\n\n"}
                          1. Datos en conflicto en AsyncStorage
                          {"\n"}
                          2. Un error en la consulta de roles desde la API
                          {"\n"}
                          3. Cambios manuales de rol mediante botones de depuración
                          {"\n"}
                          4. Un error en el mapeo de IDs a nombres de roles
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.refreshButton]} 
                    onPress={runDiagnostic}
                  >
                    <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Actualizar diagnóstico</Text>
                  </TouchableOpacity>

                  {inconsistencyFound && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.fixButton]}
                      onPress={fixRoleInconsistency}
                      disabled={fixInProgress}
                    >
                      {fixInProgress ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <MaterialIcons name="build" size={20} color="#FFFFFF" />
                          <Text style={styles.actionButtonText}>Corregir inconsistencia</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.clearRoleButton]}
                    onPress={clearOnlyRoleData}
                  >
                    <MaterialIcons name="delete-sweep" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Borrar solo datos de rol</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.resetButton]}
                    onPress={resetAllData}
                  >
                    <MaterialIcons name="delete-forever" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Borrar todos los datos</Text>
                  </TouchableOpacity>
                </View>

                {renderControlPanel()}
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
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
  card: {
    margin: 10,
    elevation: 2,
  },
  cardTitle: {
    color: '#690B22',
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginTop: 20,
    marginBottom: 10,
  },
  dataContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  dataLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  dataValue: {
    fontWeight: '500',
    color: '#1B4D3E',
  },
  roleHighlightCuidador: {
    color: '#690B22',
    fontWeight: 'bold',
  },
  roleHighlightPaciente: {
    color: '#1B4D3E',
    fontWeight: 'bold',
  },
  roleItem: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#690B22',
  },
  roleItemText: {
    fontSize: 14,
    color: '#333',
  },
  bold: {
    fontWeight: 'bold',
  },
  inconsistencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  inconsistencyText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 10,
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    padding: 15,
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
  },
  fixButton: {
    backgroundColor: '#4CAF50',
  },
  clearRoleButton: {
    backgroundColor: '#FF9800',
  },
  resetButton: {
    backgroundColor: '#F44336',
  },
  roleItemNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#555',
  },
  explanationContainer: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#FFA000',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 5,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  detailedDiagnostic: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  diagnosticLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  diagnosticValue: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  consistentValue: {
    color: '#4CAF50',
  },
  inconsistentValue: {
    color: '#F44336',
  },
  explanationBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#388E3C',
  },
  controlPanel: {
    marginTop: 20,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#673AB7',
  },
  auditButton: {
    backgroundColor: '#673AB7',
  },
  priorityButton: {
    backgroundColor: '#9C27B0',
    marginTop: 10,
  },
  emergencyControls: {
    marginTop: 20,
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 10,
  },
  emergencyText: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 15,
  },
  roleCuidadorButton: {
    backgroundColor: '#2196F3',
    marginBottom: 10,
  },
  rolePacienteButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 10,
  },
  clearForceButton: {
    backgroundColor: '#9E9E9E',
  },
});
