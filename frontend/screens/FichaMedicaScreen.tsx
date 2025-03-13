import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  TextInput,
  Platform,
  FlatList
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPacienteDashboard, actualizarPerfilMedico, crearPerfilMedico, verificarPerfilMedico, 
  getCondicionesMedicas, vincularCondicionMedica, eliminarCondicionMedica, crearCondicionMedica } from '../services/patientService';
import { formatearRut } from '../utils/rutHelper';
import { getImageUrl } from '../utils/imageHelper'; // Importamos el nuevo helper
import { getUserRoles, determinePrimaryRole } from '../services/userService';
import { getPatientsList, linkWithPatient } from '../services/caregiverService';

// Función para normalizar la entrada decimal - añadir esta función antes del componente principal
const normalizarDecimal = (valor) => {
  if (!valor) return '';
  // Reemplazar comas por puntos y eliminar caracteres no numéricos
  return valor.replace(',', '.').replace(/[^\d.]/g, '');
};

// Función para formatear la altura con dos decimales
const formatearAltura = (altura) => {
  if (!altura) return '0.00';
  const alturaNum = parseFloat(altura);
  return alturaNum.toFixed(2);
};

export const options = {
  title: 'Ficha Médica'
};

const SHOW_DEBUG_UI = false; // Set to false to hide development debug panels

export default function FichaMedicaScreen({ navigation, route }) {
  // Update state variables to support caregiver functionality
  const { selectedPatientId: routeSelectedPatientId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pacienteData, setPacienteData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState({
    tipo_dialisis: false,
    peso: false,
    altura: false
  });
  const [tempValues, setTempValues] = useState({
    tipo_dialisis: '',
    peso: '',
    altura: ''
  });
  const [condicionesDisponibles, setCondicionesDisponibles] = useState([]);
  const [condicionesSeleccionadas, setCondicionesSeleccionadas] = useState([]);
  const [mostrarSelectorCondiciones, setMostrarSelectorCondiciones] = useState(false);
  const [nuevaCondicion, setNuevaCondicion] = useState('');
  const [crearCondicionMode, setCrearCondicionMode] = useState(false);
  const [nuevasCondicionesSeleccionadas, setNuevasCondicionesSeleccionadas] = useState([]);
  const [currentPersonaId, setCurrentPersonaId] = useState(null);
  
  // New state variables for caregiver functionality
  const [userRole, setUserRole] = useState(null);
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(routeSelectedPatientId);
  const [newPatientCode, setNewPatientCode] = useState('');
  const [linkingError, setLinkingError] = useState('');
  const [linkingSuccess, setLinkingSuccess] = useState('');
  
  // Function to get user role from AsyncStorage
  const getUserRole = async () => {
    try {
      setLoading(true);
      console.log('🔍 ROLE CHECK: Initiating user role detection...');
      
      // Get userData from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        console.log('🔍 ROLE CHECK: No userData found in AsyncStorage');
        setLoading(false);
        return 'paciente'; // Default to patient role
      }
      
      const parsedData = JSON.parse(userData);
      console.log('🔍 ROLE CHECK: userData found:', parsedData);
      
      // Check if we have a persona_id
      if (!parsedData.persona_id) {
        console.log('🔍 ROLE CHECK: No persona_id in userData');
        setLoading(false);
        return 'paciente';
      }
      
      setCurrentPersonaId(parsedData.persona_id);
      
      // CRITICAL FIX: Inspect what's stored first
      console.log(`🔍 ROLE CHECK: Stored role in AsyncStorage: ${parsedData.role || 'undefined'}`);
      
      // First, get the stored role from AsyncStorage - USE THIS AS INITIAL VALUE
      const storedRole = parsedData.role || 'paciente';
      
      // Set userRole state immediately with stored value for faster UI rendering
      setUserRole(storedRole);
      console.log(`🔍 ROLE CHECK: Set initial userRole state to: ${storedRole}`);
      
      // Now verify with API to ensure consistency - this will update if needed
      try {
        console.log(`🔍 ROLE CHECK: Verifying role from API for persona_id: ${parsedData.persona_id}`);
        const roles = await getUserRoles(parsedData.persona_id);
        
        // CRITICAL FIX: Verify we only have roles for this specific user
        const correctUserRoles = roles.filter(role => {
          const rolePersonId = String(role.id_persona).trim();
          const thisPersonId = String(parsedData.persona_id).trim();
          return rolePersonId === thisPersonId;
        });
        
        if (correctUserRoles.length !== roles.length) {
          console.error(`🚨 CRITICAL ERROR: Received ${roles.length} roles but only ${correctUserRoles.length} belong to this user!`);
        }
        
        // Only proceed with roles that actually belong to this user
        if (correctUserRoles && Array.isArray(correctUserRoles) && correctUserRoles.length > 0) {
          // Log each role for debugging
          correctUserRoles.forEach((role, index) => {
            if (role && role.rol) {
              console.log(`🔍 ROLE CHECK: Role #${index+1} from API: ID=${role.rol.id}, Name=${role.rol.nombre}`);
            } else {
              console.log(`🔍 ROLE CHECK: Role #${index+1} from API has invalid structure:`, role);
            }
          });
          
          // Check for cuidador role (ID 2) directly - most reliable method
          const hasCuidadorRole = correctUserRoles.some(role => role.rol?.id === 2);
          console.log(`🔍 ROLE CHECK: Has cuidador role (ID 2): ${hasCuidadorRole}`);
          
          // Same for paciente role (ID 1)
          const hasPacienteRole = correctUserRoles.some(role => role.rol?.id === 1);
          console.log(`🔍 ROLE CHECK: Has paciente role (ID 1): ${hasPacienteRole}`);
          
          if (hasCuidadorRole) {
            console.log('🔍 ROLE CHECK: Setting role to "cuidador" based on role ID 2');
            
            if (storedRole !== 'cuidador') {
              console.log(`⚠️ INCONSISTENCY DETECTED: AsyncStorage=${storedRole}, API=cuidador`);
              console.log('🔧 Updating AsyncStorage with correct role from API...');
              
              // Create a new object to avoid direct mutation
              const updatedData = { ...parsedData, role: 'cuidador' };
              await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
              
              console.log(`✅ AsyncStorage updated, new role: cuidador`);
            }
            
            setUserRole('cuidador');
            return 'cuidador';
          } else if (hasPacienteRole) {
            // IMPROVED: If no cuidador role, explicitly check for paciente role (ID 1)
            console.log(`🔍 ROLE CHECK: Has paciente role (ID 1): ${hasPacienteRole}`);
            
            // Update AsyncStorage if needed
            if (storedRole !== 'paciente') {
              console.log(`⚠️ INCONSISTENCY DETECTED: AsyncStorage=${storedRole}, API=paciente`);
              console.log('🔧 Updating AsyncStorage with correct role from API...');
              
              // Create a new object to avoid direct mutation
              const updatedData = { ...parsedData, role: 'paciente' };
              await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
              
              console.log(`✅ AsyncStorage updated, new role: paciente`);
            }
            
            setUserRole('paciente');
            return 'paciente';
          }
        } else {
          console.log('🔍 ROLE CHECK: No valid roles found from API for this user, keeping stored role:', storedRole);
        }
      } catch (apiError) {
        console.error('Error verifying role from API:', apiError);
        // Continue with stored role if API check fails
        console.log('🔍 ROLE CHECK: API error, using stored role:', storedRole);
      }
      
      // Set and return the role (either verified or from AsyncStorage)
      console.log(`🔍 ROLE CHECK: Final role being used: ${storedRole}`);
      return storedRole;
    } catch (error) {
      console.error('General error in getUserRole:', error);
      setLoading(false);
      return 'paciente'; // Default to patient role on error
    }
  };

  // Function to load linked patients if user is a caregiver
  const loadLinkedPatients = async (cuidadorId) => {
    if (!cuidadorId) return;
    
    try {
      setLoading(true);
      const patients = await getPatientsList(cuidadorId);
      console.log('Linked patients loaded:', patients);
      setLinkedPatients(patients);
    } catch (error) {
      console.error('Error loading linked patients:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes vinculados');
    } finally {
      setLoading(false);
    }
  };

  // Function to link with a new patient
  const handleLinkPatient = async () => {
    if (!newPatientCode || newPatientCode.trim() === '') {
      setLinkingError('Por favor ingrese un código de paciente válido');
      return;
    }

    try {
      setLoading(true);
      setLinkingError('');
      setLinkingSuccess('');
      
      // Call API to link patient with caregiver
      await linkWithPatient(newPatientCode, currentPersonaId);
      
      // Refresh the list of linked patients
      await loadLinkedPatients(currentPersonaId);
      
      // Show success message and clear input
      setLinkingSuccess('Paciente vinculado correctamente');
      setNewPatientCode('');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setLinkingSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error linking with patient:', error);
      setLinkingError(error.message || 'No se pudo vincular con el paciente');
    } finally {
      setLoading(false);
    }
  };

  // Function to select a patient to view their data
  const selectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    // Reset patient data to force a reload
    setPacienteData(null);
  };

  // Function to go back to patient list (for caregiver)
  const goBackToPatientList = () => {
    setSelectedPatientId(null);
    setPacienteData(null);
  };

  // Modified cargarDatosPaciente to handle either current user or selected patient
  const cargarDatosPaciente = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        console.log('No se encontró userData en AsyncStorage');
        Alert.alert('Error', 'No se encontró información del usuario');
        setLoading(false);
        return null;
      }

      console.log('userData encontrado:', userData);
      const userDataObj = JSON.parse(userData);
      console.log('userData parseado:', userDataObj);

      // Determine which person ID to use - either current user or selected patient
      const personaId = selectedPatientId || userDataObj.persona_id;
      
      if (!personaId) {
        console.log('No se encontró persona_id');
        Alert.alert('Error', 'No se encontró el ID del paciente');
        setLoading(false);
        return null;
      }

      // Set the current persona ID for reference
      setCurrentPersonaId(userDataObj.persona_id); // Always keep track of logged in user's ID

      console.log('Realizando petición con persona_id:', personaId);
      // Get patient data using the service
      const data = await getPacienteDashboard(personaId);
      
      // Only perform this check for the current user's data, not when viewing another patient
      if (!selectedPatientId && data?.paciente?.id !== userDataObj.persona_id) {
        console.error('ERROR DE SEGURIDAD: Los datos recibidos no corresponden al usuario actual');
        console.error(`ID esperado: ${userDataObj.persona_id}, ID recibido: ${data?.paciente?.id}`);
        Alert.alert(
          'Error de seguridad',
          'Los datos recibidos no corresponden a su cuenta. Por favor, cierre sesión e inténtelo de nuevo.',
          [{ text: 'Cerrar sesión', onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }}]
        );
        setLoading(false);
        return null;
      }
      
      // Verificar explícitamente el perfil médico
      if (!data.perfil_medico) {
        console.log('No se detectó perfil médico en la respuesta inicial. Verificando directamente...');
        try {
          const perfilMedico = await verificarPerfilMedico(personaId);
          if (perfilMedico) {
            // Verificación adicional de seguridad
            if (perfilMedico.id_persona === personaId || 
                String(perfilMedico.id_persona) === String(personaId)) {
              console.log('Perfil médico encontrado mediante verificación directa:', perfilMedico);
              // Actualizar los datos con el perfil encontrado
              data.perfil_medico = perfilMedico;
            } else {
              console.error('ERROR DE SEGURIDAD: El perfil médico pertenece a otra persona');
              console.error(`ID esperado: ${personaId}, ID recibido: ${perfilMedico.id_persona}`);
            }
          }
        } catch (verifyError) {
          console.error('Error verificando perfil médico:', verifyError);
        }
      } else {
        // Verificar que el perfil médico existente pertenece al usuario actual
        if (data.perfil_medico.id_persona && 
            data.perfil_medico.id_persona !== personaId && 
            String(data.perfil_medico.id_persona) !== String(personaId)) {
          console.error('ERROR DE SEGURIDAD: El perfil médico recibido pertenece a otra persona');
          console.error(`ID esperado: ${personaId}, ID recibido: ${data.perfil_medico.id_persona}`);
          // Eliminar el perfil incorrecto
          data.perfil_medico = null;
        }
      }
      
      // Verificar valores calculados si hay perfil médico
      if (data?.perfil_medico) {
        console.log('ID del perfil médico:', data.perfil_medico.id);
        console.log('IMC calculado:', data.perfil_medico.imc);
        console.log('Nivel de actividad calculado:', data.perfil_medico.nivel_actividad);
        console.log('Calorías diarias calculadas:', data.perfil_medico.calorias_diarias);
      } else {
        console.warn('No se encontró perfil médico para este paciente');
      }
      
      setPacienteData(data);
      return data;  // Retornar los datos para uso en otras funciones
    } catch (err) {
      console.error('Error al cargar datos del paciente:', err);
      
      let errorMessage = 'Error al obtener datos del paciente';
      
      // Extraer mensaje de error más específico si está disponible
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      console.error('Mensaje de error:', errorMessage);
      setError(errorMessage);
      
      Alert.alert(
        'Error de conexión', 
        'No se pudieron cargar los datos. El servidor respondió con un error. Por favor, contacte al soporte técnico.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      return null;  // Retornar null en caso de error
    }
  };

  const cargarCondicionesMedicas = async () => {
    try {
      const data = await getCondicionesMedicas();
      console.log('Condiciones médicas disponibles:', data);
      setCondicionesDisponibles(data || []);
    } catch (error) {
      console.error('Error al cargar condiciones médicas:', error);
      Alert.alert('Error', 'No se pudieron cargar las condiciones médicas');
    }
  };

  const crearNuevaCondicion = async () => {
    if (!nuevaCondicion.trim()) {
      Alert.alert('Error', 'Por favor ingrese un nombre para la condición');
      return;
    }

    try {
      setLoading(true);
      const condicionCreada = await crearCondicionMedica({ nombre: nuevaCondicion.trim() });
      console.log('Condición creada:', condicionCreada);
      
      // Actualizar la lista de condiciones
      await cargarCondicionesMedicas();
      
      // Añadir la nueva condición a las seleccionadas
      if (condicionCreada && condicionCreada.id) {
        setCondicionesSeleccionadas(prev => [...prev, condicionCreada]);
      }
      
      // Limpiar y ocultar el formulario
      setNuevaCondicion('');
      setCrearCondicionMode(false);
      
      Alert.alert('Éxito', 'Condición médica creada correctamente');
    } catch (error) {
      console.error('Error al crear condición médica:', error);
      Alert.alert('Error', 'No se pudo crear la condición médica');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userRole === 'cuidador' && !selectedPatientId) {
      loadLinkedPatients(currentPersonaId);
    } else {
      cargarDatosPaciente();
    }
  };

  useEffect(() => {
    const initializeScreen = async () => {
      try {
        console.log('FichaMedicaScreen initializing with route params:', route.params);
        
        // Set loading to true at the start to prevent premature rendering
        setLoading(true);
        
        // Get user role - this sets userRole state internally
        const role = await getUserRole();
        console.log(`✅ INITIALIZATION: Role detected: ${role}`);
        
        // If role is caregiver and no patient is selected, load the linked patients
        if (role === 'cuidador' && !selectedPatientId && currentPersonaId) {
          console.log('✅ INITIALIZATION: Loading linked patients for caregiver');
          await loadLinkedPatients(currentPersonaId);
        } else if ((role === 'paciente' || selectedPatientId) && currentPersonaId) {
          console.log('✅ INITIALIZATION: Loading patient data');
          await cargarDatosPaciente();
          await cargarCondicionesMedicas();
        }
      } catch (error) {
        console.error('Error during screen initialization:', error);
      } finally {
        // Always set loading to false when done, regardless of outcome
        setLoading(false);
      }
    };
    
    initializeScreen();
  }, [route.params]);

  // When user role changes or a patient is selected, load appropriate data
  // This effect runs AFTER initialization, so don't set loading here
  useEffect(() => {
    console.log('userRole or selectedPatientId changed. Role:', userRole, 'Selected patient:', selectedPatientId);
    
    // Only proceed if we have a defined role and currentPersonaId
    if (userRole && currentPersonaId) {
      if (userRole === 'cuidador' && !selectedPatientId) {
        // Load linked patients for caregiver when no specific patient is selected
        console.log('Loading linked patients based on role/patient change');
        loadLinkedPatients(currentPersonaId);
      } else if ((userRole === 'paciente' || selectedPatientId) && currentPersonaId) {
        // Load patient data for patient role or when a specific patient is selected
        console.log('Loading patient data based on role/patient change');
        cargarDatosPaciente();
        cargarCondicionesMedicas();
      }
    }
  }, [userRole, selectedPatientId, currentPersonaId]);

  useEffect(() => {
    if (pacienteData?.condiciones) {
      // Formatear las condiciones del paciente al formato que espera condicionesSeleccionadas
      const condicionesExistentes = pacienteData.condiciones.map(c => ({
        id: c.id,
        nombre: c.nombre,
        // Añadir el ID de usuario_condicion si lo tuviéramos para poder eliminar después
        usuario_condicion_id: c.usuario_condicion_id
      }));
      setCondicionesSeleccionadas(condicionesExistentes);
      setNuevasCondicionesSeleccionadas([...condicionesExistentes]); // Copia para edición
    }
  }, [pacienteData?.condiciones]);

  // Función para activar el modo de edición para un campo específico
  const activarEdicion = (campo) => {
    // Guardar el valor actual en el estado temporal
    if (pacienteData?.perfil_medico && pacienteData.perfil_medico[campo]) {
      setTempValues(prev => ({
        ...prev,
        [campo]: campo === 'altura' 
          ? formatearAltura(pacienteData.perfil_medico[campo])
          : pacienteData.perfil_medico[campo].toString()
      }));
    }
    
    // Activar el modo de edición para este campo
    setEditMode(prev => ({
      ...prev,
      [campo]: true
    }));
  };

  // Función para cancelar la edición de un campo
  const cancelarEdicion = (campo) => {
    setEditMode(prev => ({
      ...prev,
      [campo]: false
    }));
  };

  // Función para guardar la edición de un campo con verificación de perfil médico
  const guardarEdicion = async (campo) => {
    try {
      // Verificar si tenemos persona_id
      if (!pacienteData?.paciente?.id) {
        Alert.alert('Error', 'No se pudo identificar al paciente');
        return;
      }

      // Validar que el valor no esté vacío
      if (!tempValues[campo] || tempValues[campo].trim() === '') {
        Alert.alert('Error', 'El valor no puede estar vacío');
        return;
      }

      // Validaciones específicas según el campo
      if (campo === 'peso' || campo === 'altura') {
        // Normalizar el valor para aceptar tanto comas como puntos
        const valorNormalizado = normalizarDecimal(tempValues[campo]);
        setTempValues(prev => ({...prev, [campo]: valorNormalizado}));
        
        const valor = parseFloat(valorNormalizado);
        if (isNaN(valor) || valor <= 0) {
          Alert.alert('Error', `Por favor ingrese un valor válido para ${campo}`);
          return;
        }
        
        // Validaciones adicionales
        if (campo === 'peso' && (valor < 20 || valor > 300)) {
          Alert.alert('Error', 'El peso debe estar entre 20 y 300 kg');
          return;
        }
        
        if (campo === 'altura' && (valor < 0.5 || valor > 2.5)) {
          Alert.alert('Error', 'La altura debe estar entre 0.5 y 2.5 metros');
          return;
        }
      }

      // Crear objeto de datos para actualizar con valor normalizado
      const datosActualizados = {
        [campo]: campo === 'tipo_dialisis' 
          ? tempValues[campo] 
          : parseFloat(normalizarDecimal(tempValues[campo]))
      };

      console.log(`Actualizando ${campo} con valor:`, datosActualizados[campo]);

      // Mostrar indicador de carga
      setLoading(true);

      try {
        // Verificar si el perfil médico ya existe
        if (!pacienteData?.perfil_medico) {
          // Si no existe, crear uno nuevo con valores predeterminados
          const datosIniciales = {
            peso: campo === 'peso' ? parseFloat(tempValues.peso) : 70,
            altura: campo === 'altura' ? parseFloat(tempValues.altura) : 1.70,
            tipo_dialisis: campo === 'tipo_dialisis' ? tempValues.tipo_dialisis : 'hemodialisis',
          };
          
          console.log('Creando nuevo perfil médico con datos iniciales:', datosIniciales);
          const perfilCreado = await crearPerfilMedico(pacienteData.paciente.id, datosIniciales);
          console.log('Perfil médico creado:', perfilCreado);
          
          // Recargar datos y forzar actualización del estado
          const nuevosDatos = await cargarDatosPaciente();
          if (nuevosDatos) {
            console.log('Nuevos datos cargados después de crear perfil:', nuevosDatos);
            setPacienteData(nuevosDatos);
          }
          
          Alert.alert(
            'Perfil Médico Creado', 
            'Se ha creado su perfil médico exitosamente.'
          );
          
        } else {
          // Si el perfil ya existe, actualizarlo
          const datosActualizados = {
            [campo]: campo === 'tipo_dialisis' ? tempValues[campo] : parseFloat(tempValues[campo])
          };

          // Add id_persona to ensure it's included in the update
          if (pacienteData.paciente && pacienteData.paciente.id) {
            datosActualizados.id_persona = pacienteData.paciente.id;
          }
          
          console.log(`Actualizando perfil médico ${pacienteData.perfil_medico.id} con:`, datosActualizados);
          const perfilActualizado = await actualizarPerfilMedico(pacienteData.perfil_medico.id, datosActualizados);
          console.log('Respuesta de actualización:', perfilActualizado);
          
          // Recargar datos y forzar actualización del estado
          const nuevosDatos = await cargarDatosPaciente();
          if (nuevosDatos) {
            console.log('Nuevos datos cargados después de actualizar perfil:', nuevosDatos);
            setPacienteData(nuevosDatos);
          }
        }
        
        // Desactivar modo edición
        setEditMode(prev => ({
          ...prev,
          [campo]: false
        }));
        
        if (campo !== 'tipo_dialisis') {
          Alert.alert('Actualización exitosa', 
            'La información ha sido actualizada. Los valores de IMC, nivel de actividad y calorías diarias se han recalculado automáticamente.'
          );
        } else {
          Alert.alert('Actualización exitosa', 'La información ha sido actualizada.');
        }
      } catch (error) {
        console.error(`Error al procesar datos médicos:`, error);
        
        // Enhanced error message with more details
        let errorMsg = 'No se pudo procesar la información médica. Verifique su conexión e intente nuevamente.';
        
        if (error.response) {
          console.error('Detalles del error:', error.response.data);
          if (error.response.data && typeof error.response.data === 'object') {
            // Format validation errors if available
            const validationErrors = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            
            errorMsg = `Error de validación: ${validationErrors || 'Datos inválidos'}`;
          }
        }
        
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error('Error al procesar la edición:', error);
      Alert.alert('Error', 'No se pudo actualizar la información. Por favor revise los datos ingresados.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selección de condición médica
  const toggleCondicionMedica = (condicion) => {
    setNuevasCondicionesSeleccionadas(prevSeleccionadas => {
      // Verificar si la condición ya está seleccionada
      const yaSeleccionada = prevSeleccionadas.some(c => c.id === condicion.id);
      
      if (yaSeleccionada) {
        // Remover condición
        return prevSeleccionadas.filter(c => c.id !== condicion.id);
      } else {
        // Añadir condición
        return [...prevSeleccionadas, condicion];
      }
    });
  };

  // Guardar condiciones médicas seleccionadas
  const guardarCondicionesMedicas = async () => {
    if (!pacienteData?.paciente?.id) {
      Alert.alert('Error', 'No se pudo identificar al paciente');
      return;
    }
    
    setLoading(true);
    try {
      // Identificar condiciones a añadir (las nuevas que no estaban antes)
      const condicionesACrear = nuevasCondicionesSeleccionadas.filter(
        nueva => !condicionesSeleccionadas.some(actual => actual.id === nueva.id)
      );
      
      console.log('Condiciones a añadir:', condicionesACrear);
      
      // Identificar condiciones a eliminar (las que estaban antes pero ya no están)
      const condicionesAEliminar = condicionesSeleccionadas.filter(
        actual => !nuevasCondicionesSeleccionadas.some(nueva => nueva.id === actual.id)
      );
      
      console.log('Condiciones a eliminar:', condicionesAEliminar);
      
      // Crear nuevas vinculaciones
      const promesasCreacion = condicionesACrear.map(condicion => 
        vincularCondicionMedica(pacienteData.paciente.id, condicion.id)
      );
      
      // Eliminar vinculaciones existentes
      const promesasEliminacion = condicionesAEliminar
        .filter(c => c.usuario_condicion_id) // Solo las que tienen ID de vinculación
        .map(condicion => eliminarCondicionMedica(condicion.usuario_condicion_id));
      
      // Ejecutar todas las operaciones
      await Promise.all([...promesasCreacion, ...promesasEliminacion]);
      
      // Actualizar los datos del paciente para mostrar las nuevas condiciones
      await cargarDatosPaciente();
      
      // Ocultar el selector de condiciones
      setMostrarSelectorCondiciones(false);
      
      Alert.alert(
        'Condiciones guardadas', 
        'Las condiciones médicas han sido actualizadas correctamente.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error al guardar condiciones:', error);
      Alert.alert('Error', 'No se pudieron guardar las condiciones médicas');
    } finally {
      setLoading(false);
    }
  };

  // Función para restablecer las selecciones al cancelar
  const cancelarSeleccionCondiciones = () => {
    // Restaurar las condiciones seleccionadas originales
    setNuevasCondicionesSeleccionadas(condicionesSeleccionadas);
    setMostrarSelectorCondiciones(false);
  };

  // Update the dialysis type selector component for better mobile display
  const renderDialysisTypeSelector = () => {
    return (
      <View style={styles.formGroup}>
        <Text style={styles.inputLabel}>Tipo de Diálisis</Text>
        <View style={[
          styles.dialysisTypeContainer,
          Platform.OS !== 'web' && styles.mobileDialysisContainer
        ]}>
          <TouchableOpacity
            style={[
              styles.dialysisOption,
              tipoDialisis === 'hemodialisis' && styles.dialysisOptionSelected,
              Platform.OS !== 'web' && styles.mobileDialysisOption
            ]}
            onPress={() => setTipoDialisis('hemodialisis')}
          >
            <Text 
              style={[
                styles.dialysisOptionText,
                tipoDialisis === 'hemodialisis' && styles.dialysisOptionTextSelected,
                Platform.OS !== 'web' && styles.mobileDialysisOptionText
              ]}
              numberOfLines={1}
            >
              Hemodiálisis
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.dialysisOption,
              tipoDialisis === 'dialisis_peritoneal' && styles.dialysisOptionSelected,
              Platform.OS !== 'web' && styles.mobileDialysisOption
            ]}
            onPress={() => setTipoDialisis('dialisis_peritoneal')}
          >
            <Text 
              style={[
                styles.dialysisOptionText,
                tipoDialisis === 'dialisis_peritoneal' && styles.dialysisOptionTextSelected,
                Platform.OS !== 'web' && styles.mobileDialysisOptionText
              ]}
              numberOfLines={1}
            >
              Diálisis Peritoneal
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Update the action buttons to be more compact on mobile
  const renderActionButtons = () => {
    return (
      <View style={[
        styles.actionButtons,
        Platform.OS !== 'web' && styles.mobileActionButtonsContainer
      ]}>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.cancelButton,
            Platform.OS !== 'web' && styles.mobileActionButton
          ]}
          onPress={() => setModoEdicion(false)}
        >
          <MaterialIcons 
            name="close" 
            size={Platform.OS === 'web' ? 24 : 18} 
            color="#fff" 
          />
          <Text style={[
            styles.actionButtonText,
            Platform.OS !== 'web' && styles.mobileActionButtonText
          ]}>
            Cancelar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.saveButton,
            Platform.OS !== 'web' && styles.mobileActionButton
          ]}
          onPress={guardarEdicion}
        >
          <MaterialIcons 
            name="check" 
            size={Platform.OS === 'web' ? 24 : 18} 
            color="#fff" 
          />
          <Text style={[
            styles.actionButtonText,
            Platform.OS !== 'web' && styles.mobileActionButtonText
          ]}>
            Guardar
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#690B22" />
        <Text style={styles.loaderText}>Cargando datos médicos...</Text>
        
        {/* Add more debug info, but only when debug UI is enabled */}
        {SHOW_DEBUG_UI && (
          <View style={{marginTop: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8}}>
            <Text style={{fontWeight: 'bold', textAlign: 'center'}}>Información de depuración</Text>
            <Text>Rol actual: {userRole || 'No detectado'}</Text>
            <Text>ID persona actual: {currentPersonaId || 'No disponible'}</Text>
            <Text>pacienteID seleccionado: {selectedPatientId || 'Ninguno'}</Text>
          </View>
        )}
        
        {/* Botón de diagnóstico - keep this for emergencies but make it less prominent */}
        {!SHOW_DEBUG_UI ? (
          <TouchableOpacity 
            style={[styles.diagnosticButton, {opacity: 0.7, marginTop: 50}]}
            onPress={() => navigation.navigate('RoleDiagnostic')} 
          >
            <Text style={styles.diagnosticButtonText}>Asistencia técnica</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.diagnosticButton}
            onPress={() => navigation.navigate('RoleDiagnostic')} 
          >
            <Text style={styles.diagnosticButtonText}>Diagnosticar Problema</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#690B22" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargarDatosPaciente}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Caregiver view - Patient Listclude a role toggle button
  if (userRole === 'cuidador' && !selectedPatientId) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Debug tools - only shown when SHOW_DEBUG_UI is true */}
          {SHOW_DEBUG_UI && (
            <Card style={styles.debugCard}>
              <Card.Content>
                <Text style={styles.debugTitle}>Modo de desarrollo</Text>
                <Text style={styles.debugText}>
                  Usuario detectado como: <Text style={styles.debugHighlight}>{userRole}</Text>
                </Text>
                <Text style={styles.debugText}>
                  ID de persona: <Text style={styles.debugHighlight}>{currentPersonaId}</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.debugButton}
                  onPress={async () => {
                    // Toggle role between cuidador and paciente
                    const newRole = userRole === 'cuidador' ? 'paciente' : 'cuidador';
                    const userData = await AsyncStorage.getItem('userData');
                    if (userData) {
                      const parsed = JSON.parse(userData);
                      parsed.role = newRole;
                      await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                      setUserRole(newRole);
                      Alert.alert('Rol cambiado', `Ahora viendo como: ${newRole}`);
                    }
                  }}
                >
                  <Text style={styles.debugButtonText}>
                    Cambiar a modo {userRole === 'cuidador' ? 'paciente' : 'cuidador'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.diagnosticButton}
                  onPress={() => navigation.navigate('RoleDiagnostic')}
                >
                  <Text style={styles.diagnosticButtonText}>Ver diagnóstico completo</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          )}
          
          {/* Add a hidden diagnostic access if needed - long press on title */}
          <Card style={styles.caregiverHeaderCard}>
            <Card.Title 
              title="Panel de Cuidador" 
              titleStyle={styles.caregiverCardTitle}
              onLongPress={() => {
                if (!SHOW_DEBUG_UI) {
                  // Only provide access to diagnostics when debug UI is off
                  navigation.navigate('RoleDiagnostic');
                }
              }}
            />
            <Card.Content>
              <Text style={styles.caregiverInstructions}>
                Como cuidador, puede vincular nuevos pacientes ingresando su código y acceder a 
                la información médica de sus pacientes vinculados.
              </Text>

              {/* Form to link new patient */}
              <View style={styles.patientCodeInputContainer}>
                <TextInput
                  style={styles.patientCodeInput}
                  placeholder="Ingrese código de paciente"
                  value={newPatientCode}
                  onChangeText={setNewPatientCode}
                />
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={handleLinkPatient}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.linkButtonText}>Vincular</Text>
                  )}
                </TouchableOpacity>
              </View>

              {linkingError ? (
                <Text style={styles.linkingErrorText}>{linkingError}</Text>
              ) : null}
              
              {linkingSuccess ? (
                <Text style={styles.linkingSuccessText}>{linkingSuccess}</Text>
              ) : null}
              
              {/* List of linked patients */}
              <Text style={styles.linkedPatientsTitle}>Mis Pacientes</Text>
              {linkedPatients.length > 0 ? (
                <View style={styles.linkedPatientsContainer}>
                  {linkedPatients.map((patient, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.patientCard}
                      onPress={() => selectPatient(patient.paciente_id)}
                    >
                      <Image 
                        source={{ 
                          uri: getImageUrl(
                            patient.foto_perfil,
                            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                          )
                        }}
                        style={styles.patientCardImage}
                        resizeMode="cover"
                      />
                      <View style={styles.patientCardInfo}>
                        <Text style={styles.patientCardName}>{patient.nombre}</Text>
                        <Text style={styles.patientCardDetail}>Edad: {patient.edad} años</Text>
                        <Text style={styles.patientCardDetail}>Género: {patient.genero || 'No especificado'}</Text>
                        <View style={[
                          styles.patientCardStatusBadge,
                          {backgroundColor: patient.activo ? '#4CAF50' : '#F44336'}
                        ]}>
                          <Text style={styles.patientCardStatusText}>
                            {patient.activo ? 'Activo' : 'Inactivo'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noLinkedPatientsContainer}>
                  <MaterialIcons name="people" size={48} color="#690B22" />
                  <Text style={styles.noLinkedPatientsText}>
                    No tiene pacientes vinculados. Vincule pacientes usando sus códigos de paciente.
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Caregiver view - Viewing specific patient
  if (userRole === 'cuidador' && selectedPatientId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.patientViewHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={goBackToPatientList}
          >
            <MaterialIcons name="arrow-back" size={24} color="#690B22" />
            <Text style={styles.backButtonText}>Volver a Lista</Text>
          </TouchableOpacity>
          <Text style={styles.patientViewTitle}>Ficha de Paciente</Text>
        </View>
        
        {/* Display regular patient data, but in read-only mode */}
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Use the existing patient UI components, with disabled editing */}
          {/* Patient Header Card */}
          {pacienteData && (
            <>
              <Card style={styles.headerCard}>
                <View style={styles.headerRow}>
                  <Image 
                    source={{ 
                      uri: getImageUrl(
                        pacienteData?.paciente?.foto_perfil,
                        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                      )
                    }}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                  <View style={styles.headerInfo}>
                    {/* RUT destacado */}
                    <View style={styles.rutContainer}>
                      <Text style={styles.rutLabel}>RUT</Text>
                      <Text style={styles.rutValue}>
                        {pacienteData?.paciente?.rut ? 
                          formatearRut(pacienteData.paciente.rut) : 
                          'No disponible'}
                      </Text>
                    </View>
                    
                    <Text style={styles.nombreLabel}>Nombres:</Text>
                    <Text style={styles.nombreValue}>{pacienteData?.paciente?.nombres || 'No disponible'}</Text>
                    
                    <Text style={styles.nombreLabel}>Apellidos:</Text>
                    <Text style={styles.nombreValue}>{pacienteData?.paciente?.apellidos || 'No disponible'}</Text>
                    
                    <View style={[styles.statusBadge, {backgroundColor: pacienteData?.paciente?.activo ? '#4CAF50' : '#F44336'}]}>
                      <Text style={styles.statusText}>{pacienteData?.paciente?.activo ? 'Activo' : 'Inactivo'}</Text>
                    </View>
                  </View>
                </View>
              </Card>

              {/* Personal data card */}
              <Card style={styles.card}>
                <Card.Title title="Datos Personales" titleStyle={styles.cardTitle} />
                <Card.Content>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
                    <Text style={styles.infoValue}>
                      {pacienteData?.paciente?.fecha_nacimiento ? 
                        new Date(pacienteData.paciente.fecha_nacimiento).toLocaleDateString('es-ES') : 
                        'No disponible'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Edad:</Text>
                    <Text style={styles.infoValue}>{pacienteData?.paciente?.edad} años</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Género:</Text>
                    <Text style={styles.infoValue}>{pacienteData?.paciente?.genero || 'No especificado'}</Text>
                  </View>
                </Card.Content>
              </Card>

              {/* Medical information card - Read-only for caregiver */}
              <Card style={styles.card}>
                <Card.Title title="Información Médica" titleStyle={styles.cardTitle} />
                <Card.Content>
                  {pacienteData?.perfil_medico ? (
                    <>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tipo de diálisis:</Text>
                        <Text style={styles.infoValue}>
                          {pacienteData.perfil_medico.tipo_dialisis === 'hemodialisis' ? 'Hemodiálisis' : 'Diálisis Peritoneal'}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Peso:</Text>
                        <Text style={styles.infoValue}>{pacienteData.perfil_medico.peso} kg</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Altura:</Text>
                        <Text style={styles.infoValue}>
                          {formatearAltura(pacienteData.perfil_medico.altura)} m
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>IMC:</Text>
                        <Text style={styles.calculatedValue}>
                          {pacienteData.perfil_medico.imc || 'No disponible'} kg/m²
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nivel de Actividad:</Text>
                        <Text style={styles.calculatedValue}>
                          {pacienteData.perfil_medico.nivel_actividad ? 
                            pacienteData.perfil_medico.nivel_actividad.charAt(0).toUpperCase() + 
                            pacienteData.perfil_medico.nivel_actividad.slice(1) : 
                            'No disponible'}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Calorías diarias:</Text>
                        <Text style={styles.calculatedValue}>
                          {pacienteData.perfil_medico.calorias_diarias ? 
                            Math.round(pacienteData.perfil_medico.calorias_diarias) + ' kcal' : 
                            'No disponible'}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.emptyText}>
                      Este paciente aún no ha completado su perfil médico
                    </Text>
                  )}
                </Card.Content>
              </Card>

              {/* Medical conditions - Read-only for caregiver */}
              <Card style={styles.card}>
                <Card.Title title="Condiciones Médicas" titleStyle={styles.cardTitle} />
                <Card.Content>
                  {pacienteData?.condiciones && pacienteData.condiciones.length > 0 ? (
                    <View style={styles.condicionesContainer}>
                      {pacienteData.condiciones.map((condicion, index) => (
                        <View key={index} style={styles.condicionBadge}>
                          <Text style={styles.condicionText}>{condicion.nombre}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>No hay condiciones médicas registradas</Text>
                  )}
                </Card.Content>
              </Card>

              {/* Nutrition stats - Read-only for caregiver */}
              <Card style={styles.card}>
                <Card.Title 
                  title="Estadísticas Nutricionales" 
                  subtitle="Basado en los últimos 7 registros" 
                  titleStyle={styles.cardTitle}
                />
                <Card.Content>
                  {pacienteData?.estadisticas ? (
                    <>
                      <View style={styles.statContainer}>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>
                            {pacienteData.estadisticas.sodio_total.toFixed(0)}
                          </Text>
                          <Text style={styles.statLabel}>Sodio (mg)</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>
                            {pacienteData.estadisticas.potasio_total.toFixed(0)}
                          </Text>
                          <Text style={styles.statLabel}>Potasio (mg)</Text>
                        </View>
                      </View>
                      <View style={styles.statContainer}>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>
                            {pacienteData.estadisticas.fosforo_total ? 
                              pacienteData.estadisticas.fosforo_total.toFixed(0) : 
                              '0'}
                          </Text>
                          <Text style={styles.statLabel}>Fósforo (mg)</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.emptyText}>
                      No hay suficientes datos para mostrar estadísticas
                    </Text>
                  )}
                </Card.Content>
              </Card>

              {/* Food records - Read-only for caregiver */}
              <Card style={styles.card}>
                <Card.Title title="Alimentos Recientes" titleStyle={styles.cardTitle} />
                <Card.Content>
                  {pacienteData?.registros_comida && pacienteData.registros_comida.length > 0 ? (
                    pacienteData.registros_comida.map((registro, index) => (
                      <View key={index} style={styles.alimentoItem}>
                        <View style={styles.alimentoHeader}>
                          <Text style={styles.alimentoNombre}>{registro.alimento.nombre}</Text>
                          <Text style={styles.alimentoFecha}>
                            {new Date(registro.fecha_consumo).toLocaleDateString('es-ES')}
                          </Text>
                        </View>
                        <View style={styles.alimentoInfo}>
                          <Text style={styles.alimentoInfoText}>
                            {registro.porcion ? `${registro.porcion.cantidad} ${registro.porcion.unidad}` : '1 porción'}
                          </Text>
                          <Text style={styles.alimentoInfoText}>
                            {registro.alimento.energia} kcal | {registro.alimento.proteinas} g proteína
                          </Text>
                          {registro.alimento.categoria && (
                            <View style={styles.categoriaBadge}>
                              <Text style={styles.categoriaText}>{registro.alimento.categoria}</Text>
                            </View>
                          )}
                        </View>
                        {registro.notas && <Text style={styles.notasText}>Notas: {registro.notas}</Text>}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No hay registros de alimentos</Text>
                  )}
                </Card.Content>
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Default UI (for patients or for caregivers viewing a patient)
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cabecera del Paciente - Información personal destacada */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Image 
              source={{ 
                uri: getImageUrl(
                  pacienteData?.paciente?.foto_perfil,
                  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                )
              }}
              style={styles.profileImage}
              resizeMode="cover"
              onError={(e) => console.log('Error cargando imagen:', e.nativeEvent.error)}
            />
            <View style={styles.headerInfo}>
              {/* RUT destacado */}
              <View style={styles.rutContainer}>
                <Text style={styles.rutLabel}>RUT</Text>
                <Text style={styles.rutValue}>
                  {pacienteData?.paciente?.rut ? 
                    formatearRut(pacienteData.paciente.rut) : 
                    'No disponible'}
                </Text>
              </View>
              
              {/* Nombres y apellidos destacados */}
              <Text style={styles.nombreLabel}>Nombres:</Text>
              <Text style={styles.nombreValue}>{pacienteData?.paciente?.nombres || 'No disponible'}</Text>
              
              <Text style={styles.nombreLabel}>Apellidos:</Text>
              <Text style={styles.nombreValue}>{pacienteData?.paciente?.apellidos || 'No disponible'}</Text>
              
              {/* Estado del paciente */}
              <View style={[styles.statusBadge, {backgroundColor: pacienteData?.paciente?.activo ? '#4CAF50' : '#F44336'}]}>
                <Text style={styles.statusText}>{pacienteData?.paciente?.activo ? 'Activo' : 'Inactivo'}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Rest of the patient UI */}
        <Card style={styles.card}>
          <Card.Title title="Datos Personales" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
              <Text style={styles.infoValue}>
                {pacienteData?.paciente?.fecha_nacimiento ? 
                  new Date(pacienteData.paciente.fecha_nacimiento).toLocaleDateString('es-ES') : 
                  'No disponible'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Edad:</Text>
              <Text style={styles.infoValue}>{pacienteData?.paciente?.edad} años</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Género:</Text>
              <Text style={styles.infoValue}>{pacienteData?.paciente?.genero || 'No especificado'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Mostrar prominentemente la sección para crear perfil médico si no existe */}
        {!pacienteData?.perfil_medico && (
          <Card style={[styles.card, styles.createProfileCard]}>
            <Card.Title title="Crear Perfil Médico" titleStyle={styles.createProfileTitle} />
            <Card.Content>
              <Text style={styles.createProfileText}>
                Para acceder a todas las funcionalidades y recibir recomendaciones personalizadas,
                es necesario completar su perfil médico con la siguiente información básica:
              </Text>
              
              <View style={styles.initialProfileFields}>
                <Text style={styles.fieldHeader}>Tipo de diálisis:</Text>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      tempValues.tipo_dialisis === 'hemodialisis' && styles.optionButtonSelected
                    ]}
                    onPress={() => setTempValues(prev => ({ ...prev, tipo_dialisis: 'hemodialisis' }))}
                  >
                    <Text style={tempValues.tipo_dialisis === 'hemodialisis' ? styles.optionTextSelected : styles.optionText}>
                      Hemodiálisis
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      tempValues.tipo_dialisis === 'dialisis_peritoneal' && styles.optionButtonSelected
                    ]}
                    onPress={() => setTempValues(prev => ({ ...prev, tipo_dialisis: 'dialisis_peritoneal' }))}
                  >
                    <Text style={tempValues.tipo_dialisis === 'dialisis_peritoneal' ? styles.optionTextSelected : styles.optionText}>
                      Diálisis Peritoneal
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.fieldHeader}>Peso (kg):</Text>
                <TextInput
                  style={styles.createProfileInput}
                  placeholder="Ingrese su peso en kg"
                  value={tempValues.peso}
                  onChangeText={(text) => setTempValues(prev => ({ ...prev, peso: text }))}
                  keyboardType="numeric"
                />
                
                <Text style={styles.fieldHeader}>Altura (m):</Text>
                <TextInput
                  style={styles.createProfileInput}
                  placeholder="Ingrese su altura en metros (ej: 1.70)"
                  value={tempValues.altura}
                  onChangeText={(text) => {
                    const normalizedText = normalizarDecimal(text);
                    setTempValues(prev => ({ ...prev, altura: normalizedText }))
                  }}
                  keyboardType="numeric"
                />
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.fullWidthButton]}
                  onPress={() => {
                    // Verificar datos antes de crear el perfil
                    if (!tempValues.tipo_dialisis) {
                      setTempValues(prev => ({
                        ...prev, 
                        tipo_dialisis: 'hemodialisis'
                      }));
                    }
                    
                    if (!tempValues.peso || !tempValues.altura) {
                      Alert.alert('Datos incompletos', 'Por favor ingrese su peso y altura para continuar');
                      return;
                    }
                    
                    // Crear el perfil con los datos ingresados
                    guardarEdicion('tipo_dialisis');
                  }}
                >
                  <Text style={styles.actionButtonText}>Guardar Perfil Médico</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Información Médica - Versión simplificada cuando no hay perfil */}
        <Card style={styles.card}>
          <Card.Title title="Información Médica" titleStyle={styles.cardTitle} />
          <Card.Content>
            {pacienteData?.perfil_medico && typeof pacienteData.perfil_medico === 'object' && 'id' in pacienteData.perfil_medico ? (
              // Si existe perfil médico con ID válido, mostrar todos los datos
              <>
                {console.log('Renderizando perfil médico con ID:', pacienteData.perfil_medico.id)}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tipo de diálisis:</Text>
                  {editMode.tipo_dialisis ? (
                    <View style={styles.editableValueContainer}>
                      <View style={styles.optionsContainer}>
                        <TouchableOpacity
                          style={[
                            styles.optionButton,
                            tempValues.tipo_dialisis === 'hemodialisis' && styles.optionButtonSelected
                          ]}
                          onPress={() => setTempValues(prev => ({ ...prev, tipo_dialisis: 'hemodialisis' }))}
                        >
                          <Text style={tempValues.tipo_dialisis === 'hemodialisis' ? styles.optionTextSelected : styles.optionText}>
                            Hemodiálisis
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.optionButton,
                            tempValues.tipo_dialisis === 'dialisis_peritoneal' && styles.optionButtonSelected
                          ]}
                          onPress={() => setTempValues(prev => ({ ...prev, tipo_dialisis: 'dialisis_peritoneal' }))}
                        >
                          <Text style={tempValues.tipo_dialisis === 'dialisis_peritoneal' ? styles.optionTextSelected : styles.optionText}>
                            Diálisis Peritoneal
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.editActionsContainer}>
                        <TouchableOpacity 
                          style={[styles.editActionButton, styles.saveButton]}
                          onPress={() => guardarEdicion('tipo_dialisis')}
                        >
                          <MaterialIcons name="check" size={18} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.editActionButton, styles.cancelButton]}
                          onPress={() => cancelarEdicion('tipo_dialisis')}
                        >
                          <MaterialIcons name="close" size={18} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.infoValue}>
                        {pacienteData?.perfil_medico?.tipo_dialisis === 'hemodialisis' ? 'Hemodiálisis' : 'Diálisis Peritoneal'}
                      </Text>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => activarEdicion('tipo_dialisis')}
                      >
                        <MaterialIcons name="edit" size={18} color="#690B22" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Peso:</Text>
                  {editMode.peso ? (
                    <View style={styles.editableValueContainer}>
                      <TextInput
                        style={styles.editableInput}
                        value={tempValues.peso}
                        onChangeText={(text) => setTempValues(prev => ({ ...prev, peso: text }))}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <Text style={styles.unitText}>kg</Text>
                      <View style={styles.editActionsContainer}>
                        <TouchableOpacity 
                          style={[styles.editActionButton, styles.saveButton]}
                          onPress={() => guardarEdicion('peso')}
                        >
                          <MaterialIcons name="check" size={18} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.editActionButton, styles.cancelButton]}
                          onPress={() => cancelarEdicion('peso')}
                        >
                          <MaterialIcons name="close" size={18} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.infoValue}>
                        {`${pacienteData.perfil_medico.peso} kg`}
                      </Text>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => activarEdicion('peso')}
                      >
                        <MaterialIcons name="edit" size={18} color="#690B22" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Altura:</Text>
                  {editMode.altura ? (
                    <View style={styles.editableValueContainer}>
                      <TextInput
                        style={styles.editableInput}
                        value={tempValues.altura}
                        onChangeText={(text) => {
                          const normalizedText = normalizarDecimal(text);
                          setTempValues(prev => ({ ...prev, altura: normalizedText }))
                        }}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <Text style={styles.unitText}>m</Text>
                      <View style={styles.editActionsContainer}>
                        <TouchableOpacity 
                          style={[styles.editActionButton, styles.saveButton]}
                          onPress={() => guardarEdicion('altura')}
                        >
                          <MaterialIcons name="check" size={18} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.editActionButton, styles.cancelButton]}
                          onPress={() => cancelarEdicion('altura')}
                        >
                          <MaterialIcons name="close" size={18} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.infoValue}>
                        {`${formatearAltura(pacienteData.perfil_medico.altura)} m`}
                      </Text>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => activarEdicion('altura')}
                      >
                        <MaterialIcons name="edit" size={18} color="#690B22" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Los campos calculados automáticamente resaltan los valores calculados */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>IMC:</Text>
                  <Text style={[
                    styles.infoValue,
                    pacienteData?.perfil_medico?.imc ? styles.calculatedValue : styles.placeholderValue
                  ]}>
                    {pacienteData?.perfil_medico?.imc && pacienteData.perfil_medico.imc > 0 ? 
                      `${pacienteData.perfil_medico.imc} kg/m²` : 
                      'Calculando...'}
                  </Text>
                  <View style={styles.autoCalcIcon}>
                    <MaterialIcons name="calculate" size={18} color="#888" />
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nivel de Actividad:</Text>
                  <Text style={[
                    styles.infoValue,
                    pacienteData?.perfil_medico?.nivel_actividad ? styles.calculatedValue : styles.placeholderValue
                  ]}>
                    {pacienteData?.perfil_medico?.nivel_actividad ? 
                      pacienteData.perfil_medico.nivel_actividad.charAt(0).toUpperCase() + 
                      pacienteData.perfil_medico.nivel_actividad.slice(1) : 
                      'Calculando...'}
                  </Text>
                  <View style={styles.autoCalcIcon}>
                    <MaterialIcons name="calculate" size={18} color="#888" />
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Calorías diarias:</Text>
                  <Text style={[
                    styles.infoValue,
                    pacienteData?.perfil_medico?.calorias_diarias ? styles.calculatedValue : styles.placeholderValue
                  ]}>
                    {pacienteData?.perfil_medico?.calorias_diarias && pacienteData.perfil_medico.calorias_diarias > 0 ? 
                      `${Math.round(pacienteData.perfil_medico.calorias_diarias)} kcal` : 
                      'Calculando...'}
                  </Text>
                  <View style={styles.autoCalcIcon}>
                    <MaterialIcons name="calculate" size={18} color="#888" />
                  </View>
                </View>
              </>
            ) : (
              // Si no existe perfil médico o no tiene ID válido
              <>
                {console.log('No hay perfil médico válido para renderizar:', pacienteData?.perfil_medico)}
                <View style={styles.noProfileContainer}>
                  <MaterialIcons name="warning" size={40} color="#E07A5F" style={styles.warningIcon} />
                  <Text style={styles.noProfileText}>
                    No se ha encontrado información médica. 
                    Por favor, complete su perfil médico para poder visualizar y gestionar su información.
                  </Text>
                  <TouchableOpacity 
                    style={styles.scrollToCreateButton}
                    onPress={() => {
                      // Check if running in web environment before using window.scrollTo
                      if (Platform.OS === 'web' && typeof window !== 'undefined') {
                        // Find element with createProfileCard class and scroll to it
                        const element = document.querySelector('.createProfileCard');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                  >
                    <Text style={styles.scrollToCreateButtonText}>Ir a Crear Perfil</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Condiciones Médicas */}
        <Card style={styles.card}>
          <Card.Title title="Condiciones Médicas" titleStyle={styles.cardTitle} />
          <Card.Content>
            {pacienteData?.condiciones && pacienteData.condiciones.length > 0 ? (
              <>
                <View style={styles.condicionesContainer}>
                  {pacienteData.condiciones.map((condicion, index) => (
                    <View key={index} style={styles.condicionBadge}>
                      <Text style={styles.condicionText}>{condicion.nombre}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setMostrarSelectorCondiciones(true)}
                >
                  <Text style={styles.actionButtonText}>Editar condiciones</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.noCondicionesContainer}>
                <MaterialIcons name="medical-information" size={40} color="#E07A5F" style={styles.warningIcon} />
                <Text style={styles.noCondicionesText}>
                  No hay condiciones médicas registradas. Agregar sus condiciones médicas ayudará a personalizar mejor sus recomendaciones nutricionales.
                </Text>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setMostrarSelectorCondiciones(true);
                    setCondicionesSeleccionadas([]); // Reset selecciones
                  }}
                >
                  <Text style={styles.actionButtonText}>Agregar condiciones</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Selector de Condiciones Médicas */}
            {mostrarSelectorCondiciones && (
              <View style={styles.selectorCondiciones}>
                <Text style={styles.selectorTitle}>Seleccione sus condiciones médicas:</Text>
                
                {condicionesDisponibles.length > 0 ? (
                  condicionesDisponibles.map(condicion => (
                    <TouchableOpacity
                      key={condicion.id}
                      style={[
                        styles.condicionOption,
                        nuevasCondicionesSeleccionadas.some(c => c.id === condicion.id) && 
                        styles.condicionOptionSelected
                      ]}
                      onPress={() => toggleCondicionMedica(condicion)}
                    >
                      <Text style={[
                        styles.condicionOptionText,
                        nuevasCondicionesSeleccionadas.some(c => c.id === condicion.id) && 
                        styles.condicionOptionTextSelected
                      ]}>
                        {condicion.nombre}
                      </Text>
                      {nuevasCondicionesSeleccionadas.some(c => c.id === condicion.id) && (
                        <MaterialIcons name="check" size={20} color="white" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyCondicionesContainer}>
                    <Text style={styles.emptyText}>No hay condiciones médicas disponibles.</Text>
                    <Text style={styles.emptySubText}>Contacte con el equipo médico para añadir nuevas condiciones.</Text>
                  </View>
                )}
                
                <View style={styles.selectorButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={cancelarSeleccionCondiciones}
                  >
                    <Text style={styles.actionButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={guardarCondicionesMedicas}
                  >
                    <Text style={styles.actionButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Estadísticas Nutricionales */}
        <Card style={styles.card}>
          <Card.Title 
            title="Estadísticas Nutricionales" 
            subtitle="Basado en los últimos 7 registros" 
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            {pacienteData?.estadisticas ? (
              <>
                <View style={styles.statContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{pacienteData.estadisticas.sodio_total.toFixed(0)}</Text>
                    <Text style={styles.statLabel}>Sodio (mg)</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{pacienteData.estadisticas.potasio_total.toFixed(0)}</Text>
                    <Text style={styles.statLabel}>Potasio (mg)</Text>
                  </View>
                </View>
                <View style={styles.statContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{pacienteData.estadisticas.fosforo_total ? pacienteData.estadisticas.fosforo_total.toFixed(0) : '0'}</Text>
                    <Text style={styles.statLabel}>Fósforo (mg)</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total de registros:</Text>
                  <Text style={styles.infoValue}>{pacienteData.estadisticas.registros_totales}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>No hay suficientes datos para mostrar estadísticas</Text>
            )}
          </Card.Content>
        </Card>

        {/* Registros de Comida Recientes */}
        <Card style={styles.card}>
          <Card.Title title="Alimentos Recientes" titleStyle={styles.cardTitle} />
          <Card.Content>
            {pacienteData?.registros_comida && pacienteData.registros_comida.length > 0 ? (
              pacienteData.registros_comida.map((registro, index) => (
                <View key={index} style={styles.alimentoItem}>
                  <View style={styles.alimentoHeader}>
                    <Text style={styles.alimentoNombre}>{registro.alimento.nombre}</Text>
                    <Text style={styles.alimentoFecha}>
                      {new Date(registro.fecha_consumo).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  <View style={styles.alimentoInfo}>
                    <Text style={styles.alimentoInfoText}>
                      {registro.porcion ? `${registro.porcion.cantidad} ${registro.porcion.unidad}` : '1 porción'}
                    </Text>
                    <Text style={styles.alimentoInfoText}>
                      {registro.alimento.energia} kcal | {registro.alimento.proteinas} g proteína
                    </Text>
                    {registro.alimento.categoria && (
                      <View style={styles.categoriaBadge}>
                        <Text style={styles.categoriaText}>{registro.alimento.categoria}</Text>
                      </View>
                    )}
                  </View>
                  {registro.notas && <Text style={styles.notasText}>Notas: {registro.notas}</Text>}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay registros de alimentos</Text>
            )}
          </Card.Content>
          <Card.Actions>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Alimentos')}
            >
              <Text style={styles.actionButtonText}>Registrar Comida</Text>
            </TouchableOpacity>
          </Card.Actions>
        </Card>

        {/* Cuidadores - Only show for patient role */}
        <Card style={styles.card}>
          <Card.Title title="Cuidadores" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.patientCodeContainer}>
              <Text style={styles.patientCodeTitle}>Tu código de paciente:</Text>
              <View style={styles.codeBox}>
                <Text style={styles.patientCodeValue}>{currentPersonaId}</Text>
              </View>
              <Text style={styles.patientCodeInstructions}>
                Comparte este código con una persona de confianza o quien te ayude para que puedan acceder
                a tu información médica.
              </Text>
              
              {/* Botón para copiar al portapapeles en plataformas que lo soportan */}
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => {
                    navigator.clipboard.writeText(currentPersonaId);
                    Alert.alert('Copiado', 'Código copiado al portapapeles');
                  }}
                >
                  <MaterialIcons name="content-copy" size={18} color="#FFFFFF" />
                  <Text style={styles.copyButtonText}>Copiar código</Text>
                </TouchableOpacity>
              )}
            </View>
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#690B22',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerCard: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  rutContainer: {
    backgroundColor: '#F8F0E8',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  rutLabel: {
    fontSize: 12,
    color: '#690B22',
    fontWeight: 'bold',
  },
  rutValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
  },
  nombreLabel: {
    fontSize: 14,
    color: '#690B22',
    fontWeight: 'bold',
    marginTop: 5,
  },
  nombreValue: {
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    color: '#690B22',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
    flex: 0.4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1B4D3E',
    flex: 0.5,
    textAlign: 'right',
  },
  editButton: {
    padding: 5,
    marginLeft: 5,
    flex: 0.1,
    alignItems: 'center',
  },
  autoCalcIcon: {
    padding: 5,
    marginLeft: 5,
    flex: 0.1,
    alignItems: 'center',
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    padding: 10,
  },
  condicionesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  condicionBadge: {
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  condicionText: {
    color: '#0288D1',
    fontSize: 14,
  },
  categoriaBadge: {
    backgroundColor: '#FFECB3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  categoriaText: {
    color: '#FF8F00',
    fontSize: 12,
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  statItem: {
    alignItems: 'center',
    padding: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#690B22',
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  alimentoItem: {
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#690B22',
  },
  alimentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alimentoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    color: '#1B4D3E',
  },
  alimentoFecha: {
    fontSize: 12,
    color: '#888',
  },
  alimentoInfo: {
    marginVertical: 4,
  },
  alimentoInfoText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 1,
  },
  notasText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 4,
  },
  cuidadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cuidadorNombre: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
    color: '#1B4D3E',
  },
  actionButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  editableValueContainer: {
    flex: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  editableInput: {
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'right',
    minWidth: 60,
    color: '#1B4D3E',
    fontSize: 14,
  },
  unitText: {
    marginLeft: 5,
    color: '#555',
    fontSize: 14,
  },
  pickerContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 4,
    minWidth: 100,
    maxWidth: 150,
  },
  picker: {
    height: 30,
    width: '100%',
  },
  editActionsContainer: {
    flexDirection: 'row',
    marginLeft: 5,
  },
  editActionButton: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 2,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  optionsContainer: {
    flexDirection: 'column',
    marginRight: 10,
    flex: 1,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 4,
    backgroundColor: '#f1f1f1',
  },
  optionButtonSelected: {
    backgroundColor: '#690B22',
  },
  optionText: {
    color: '#1B4D3E',
    fontSize: 14,
  },
  optionTextSelected: {
    color: 'white',
    fontSize: 14,
  },
  calculatedValue: {
    color: '#1B4D3E',
    fontWeight: 'bold',
  },
  placeholderValue: {
    color: '#888',
    fontStyle: 'italic',
  },
  fullWidthButton: {
    alignSelf: 'center',
    width: '100%',
    marginVertical: 15,
  },
  createProfileInput: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: '#1B4D3E',
    fontSize: 16,
  },
  fieldHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#690B22',
    marginBottom: 8,
  },
  initialProfileFields: {
    marginTop: 15,
  },
  createProfileCard: {
    backgroundColor: '#F8F4E3',
    borderLeftWidth: 5,
    borderLeftColor: '#690B22',
  },
  createProfileTitle: {
    fontSize: 20,
    color: '#690B22',
    fontWeight: 'bold',
  },
  createProfileText: {
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 20,
    lineHeight: 22,
  },
  noProfileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  warningIcon: {
    marginBottom: 15,
  },
  noProfileText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 20,
    lineHeight: 24,
  },
  scrollToCreateButton: {
    backgroundColor: '#690B22',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  scrollToCreateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  noCondicionesContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCondicionesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 20,
    lineHeight: 24,
  },
  selectorCondiciones: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F4E3',
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#690B22',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  condicionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 8,
  },
  condicionOptionSelected: {
    backgroundColor: '#690B22',
  },
  condicionOptionText: {
    fontSize: 16,
    color: '#1B4D3E',
  },
  condicionOptionTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  selectorButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#777',
    flex: 0.48,
  },
  saveButton: {
    backgroundColor: '#690B22',
    flex: 0.48,
  },
  crearCondicionContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  crearCondicionInput: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  crearCondicionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crearCondicionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  crearCondicionText: {
    marginLeft: 8,
    color: '#690B22',
    fontWeight: '500',
  },
  emptyCondicionesContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 10,
  },
  emptySubText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  patientCodeContainer: {
    alignItems: 'center',
    padding: 15,
  },
  patientCodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
    textAlign: 'center',
  },
  codeBox: {
    backgroundColor: '#F1E3D3',
    borderWidth: 1,
    borderColor: '#690B22',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 15,
    width: '100%',
  },
  patientCodeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#690B22',
    textAlign: 'center',
    letterSpacing: 1,
  },
  patientCodeInstructions: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#690B22',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  copyButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  // New styles for caregiver functionality
  caregiverHeaderCard: {
    margin: 8,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  caregiverCardTitle: {
    color: '#690B22',
    fontWeight: 'bold',
    fontSize: 24,
  },
  caregiverInstructions: {
    fontSize: 16,
    color: '#1B4D3E',
    marginBottom: 20,
    lineHeight: 22,
  },
  patientCodeInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  patientCodeInput: {
    flex: 1,
    backgroundColor: '#F1E3D3',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  linkButton: {
    backgroundColor: '#690B22',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  linkButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkingErrorText: {
    color: '#F44336',
    marginBottom: 15,
  },
  linkedPatientsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 15,
  },
  linkedPatientsContainer: {
    marginBottom: 20,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  patientCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  patientCardInfo: {
    flex: 1,
  },
  patientCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B4D3E',
    marginBottom: 5,
  },
  patientCardDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  patientCardStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  patientCardStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noLinkedPatientsContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  noLinkedPatientsText: {
    fontSize: 16,
    color: '#1B4D3E',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 22,
  },
  patientViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 5,
    color: '#690B22',
    fontSize: 16,
    fontWeight: '500',
  },
  patientViewTitle: {
    flex: 1,
    color: '#1B4D3E',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  diagnosticButton: {
    marginTop: 20,
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  diagnosticButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  linkingSuccessText: {
    color: '#4CAF50',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  // Debug tools
  debugCard: {
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#FFECB3',
    borderWidth: 1,
    borderColor: '#FFB300',
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F00',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  debugHighlight: {
    fontWeight: 'bold',
    color: '#FF6F00',
  },
  debugButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignSelf: 'center',
    marginVertical: 10,
  },
  debugButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Enhanced mobile dialysis container
  dialysisTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  
  mobileDialysisContainer: {
    flexDirection: 'column',  // Stack vertically on mobile
    marginBottom: 15,
  },
  
  dialysisOption: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: Platform.OS === 'web' ? 0.48 : undefined,
    width: Platform.OS === 'web' ? undefined : '100%',
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 0 : 8,
  },
  
  mobileDialysisOption: {
    padding: 10,  // Smaller padding
    height: 44,   // Fixed height for consistency
    justifyContent: 'center',
    marginBottom: 10,
  },
  
  dialysisOptionSelected: {
    backgroundColor: '#690B22',
    borderColor: '#690B22',
  },
  
  dialysisOptionText: {
    color: '#1B4D3E',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  mobileDialysisOptionText: {
    fontSize: 14,  // Smaller font size for mobile
  },
  
  dialysisOptionTextSelected: {
    color: '#FFFFFF',
  },
  
  // Enhanced mobile action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: Platform.OS === 'web' ? 0 : 10,
  },
  
  mobileActionButtonsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(241, 227, 211, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    zIndex: 1000,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    width: '48%',
  },
  
  mobileActionButton: {
    padding: 8,  // Smaller padding
    width: '48%',
  },
  
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  
  mobileActionButtonText: {
    fontSize: 12,  // Smaller font on mobile
    marginLeft: 4,
  },
  
  cancelButton: {
    backgroundColor: '#888',
  },
  
  saveButton: {
    backgroundColor: '#690B22',
  },
  
  // Improve input containers for mobile
  inputRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  
  inputContainer: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    marginBottom: 10,
  },
  
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: Platform.OS === 'web' ? 12 : 10,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
  
  // Content container improvements for scrolling
  contentContainer: {
    paddingBottom: Platform.OS === 'web' ? 20 : 80, // Extra padding at bottom on mobile for action buttons
  },
});