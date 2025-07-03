import { useState, useEffect } from 'react';
import { Alert, Platform, ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';
import { getPacienteDashboard, actualizarPerfilMedico, crearPerfilMedico, verificarPerfilMedico, getCondicionesMedicas, vincularCondicionMedica, eliminarCondicionMedica, crearCondicionMedica } from '../../../services/patientService';
import { getUserRoles } from '../../../services/userService';
import { getPatientsList, linkWithPatient } from '../../../services/caregiverService';

const normalizarDecimal = (valor) => {
  if (!valor) return '';
  return valor.replace(',', '.').replace(/[^\d.]/g, '');
};

const formatearAltura = (altura) => {
  if (!altura) return '0.00';
  const alturaNum = parseFloat(altura);
  return alturaNum.toFixed(2);
};

export default function useFichaMedica(navigation, route) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pacienteData, setPacienteData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState({
    tipo_dialisis: false,
    peso: false,
    altura: false,
    nivel_actividad: false // Añadimos nivel_actividad al editMode
  });
  const [tempValues, setTempValues] = useState({
    tipo_dialisis: '',
    peso: '',
    altura: '',
    nivel_actividad: '' // Añadimos nivel_actividad a tempValues
  });
  const [condicionesDisponibles, setCondicionesDisponibles] = useState([]);
  const [condicionesSeleccionadas, setCondicionesSeleccionadas] = useState([]);
  const [mostrarSelectorCondiciones, setMostrarSelectorCondiciones] = useState(false);
  const [nuevaCondicion, setNuevaCondicion] = useState('');
  const [crearCondicionMode, setCrearCondicionMode] = useState(false);
  const [nuevasCondicionesSeleccionadas, setNuevasCondicionesSeleccionadas] = useState([]);
  const [currentPersonaId, setCurrentPersonaId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [newPatientCode, setNewPatientCode] = useState('');
  const [linkingError, setLinkingError] = useState('');
  const [linkingSuccess, setLinkingSuccess] = useState('');
  const [registrosAlimenticios, setRegistrosAlimenticios] = useState([]);
  const [estadisticasNutricionales, setEstadisticasNutricionales] = useState({
    caloriasDiarias: 0,
    sodioPromedio: 0,
    potasioPromedio: 0,
    fosforoPromedio: 0,
  });
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [unidadesMedida, setUnidadesMedida] = useState([]);

  const getUserRole = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        setLoading(false);
        return 'paciente';
      }
      const parsedData = JSON.parse(userData);
      if (!parsedData.persona_id) {
        setLoading(false);
        return 'paciente';
      }
      setCurrentPersonaId(parsedData.persona_id);
      const storedRole = parsedData.role || 'paciente';
      setUserRole(storedRole);
      try {
        const roles = await getUserRoles(parsedData.persona_id);
        const correctUserRoles = roles.filter(role => {
          const rolePersonId = String(role.id_persona).trim();
          const thisPersonId = String(parsedData.persona_id).trim();
          return rolePersonId === thisPersonId;
        });
        if (correctUserRoles.length !== roles.length) {
          console.error(`Received ${roles.length} roles but only ${correctUserRoles.length} belong to this user!`);
        }
        if (correctUserRoles && Array.isArray(correctUserRoles) && correctUserRoles.length > 0) {
          const hasCuidadorRole = correctUserRoles.some(role => role.rol?.id === 2);
          const hasPacienteRole = correctUserRoles.some(role => role.rol?.id === 1);
          if (hasCuidadorRole) {
            if (storedRole !== 'cuidador') {
              const updatedData = { ...parsedData, role: 'cuidador' };
              await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
            }
            setUserRole('cuidador');
            return 'cuidador';
          } else if (hasPacienteRole) {
            if (storedRole !== 'paciente') {
              const updatedData = { ...parsedData, role: 'paciente' };
              await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
            }
            setUserRole('paciente');
            return 'paciente';
          }
        }
      } catch (apiError) {
        console.error('Error verifying role from API:', apiError);
      }
      return storedRole;
    } catch (error) {
      console.error('General error in getUserRole:', error);
      setLoading(false);
      return 'paciente';
    }
  };

  const loadLinkedPatients = async (cuidadorId) => {
    if (!cuidadorId) return;
    try {
      setLoading(true);
      const patients = await getPatientsList(cuidadorId);
      setLinkedPatients(patients);
    } catch (error) {
      console.error('Error loading linked patients:', error);
      Alert.alert('Error', 'No se pudieron cargar los pacientes vinculados');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPatient = async () => {
    if (!newPatientCode || newPatientCode.trim() === '') {
      setLinkingError('Por favor ingrese un código de paciente válido');
      return;
    }
    try {
      setLoading(true);
      setLinkingError('');
      setLinkingSuccess('');
      await linkWithPatient(newPatientCode, currentPersonaId);
      await loadLinkedPatients(currentPersonaId);
      setLinkingSuccess('Paciente vinculado correctamente');
      setNewPatientCode('');
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

  const selectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setPacienteData(null);
  };

  const goBackToPatientList = () => {
    setSelectedPatientId(null);
    setPacienteData(null);
  };

  const cargarDatosPaciente = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Error', 'No se encontró información del usuario');
        setLoading(false);
        return null;
      }
      const userDataObj = JSON.parse(userData);
      const personaId = selectedPatientId || userDataObj.persona_id;
      if (!personaId) {
        Alert.alert('Error', 'No se encontró el ID del paciente');
        setLoading(false);
        return null;
      }
      setCurrentPersonaId(userDataObj.persona_id);
      const data = await getPacienteDashboard(personaId);
      if (!selectedPatientId && data?.paciente?.id !== userDataObj.persona_id) {
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
      if (!data.perfil_medico) {
        try {
          const perfilMedico = await verificarPerfilMedico(personaId);
          if (perfilMedico) {
            if (perfilMedico.id_persona === personaId || 
                String(perfilMedico.id_persona) === String(personaId)) {
              data.perfil_medico = perfilMedico;
            }
          }
        } catch (verifyError) {
          console.error('Error verificando perfil médico:', verifyError);
        }
      } else {
        if (data.perfil_medico.id_persona && 
            data.perfil_medico.id_persona !== personaId && 
            String(data.perfil_medico.id_persona) !== String(personaId)) {
          data.perfil_medico = null;
        }
      }
      setPacienteData(data);
      await fetchAlimentosRecientes(personaId);
      return data;
    } catch (err) {
      let errorMessage = 'Error al obtener datos del paciente';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
      Alert.alert(
        'Error de conexión', 
        'No se pudieron cargar los datos. El servidor respondió con un error. Por favor, contacte al soporte técnico.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      return null;
    }
  };

  const cargarCondicionesMedicas = async () => {
    try {
      const data = await getCondicionesMedicas();
      setCondicionesDisponibles(data || []);
    } catch (error) {
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
      await cargarCondicionesMedicas();
      if (condicionCreada && condicionCreada.id) {
        setCondicionesSeleccionadas(prev => [...prev, condicionCreada]);
      }
      setNuevaCondicion('');
      setCrearCondicionMode(false);
      Alert.alert('Éxito', 'Condición médica creada correctamente');
    } catch (error) {
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
        setLoading(true);
        const role = await getUserRole();
        if (role === 'cuidador' && !selectedPatientId && currentPersonaId) {
          await loadLinkedPatients(currentPersonaId);
        } else if ((role === 'paciente' || selectedPatientId) && currentPersonaId) {
          await cargarDatosPaciente();
          await cargarCondicionesMedicas();
        }
      } catch (error) {
        console.error('Error during screen initialization:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeScreen();
  }, []);

  useEffect(() => {
    if (userRole && currentPersonaId) {
      if (userRole === 'cuidador' && !selectedPatientId) {
        loadLinkedPatients(currentPersonaId);
      } else if ((userRole === 'paciente' || selectedPatientId) && currentPersonaId) {
        cargarDatosPaciente();
        cargarCondicionesMedicas();
      }
    }
  }, [userRole, selectedPatientId, currentPersonaId]);

  useEffect(() => {
    if (pacienteData?.condiciones) {
      const condicionesExistentes = pacienteData.condiciones.map(c => ({
        id: c.id,
        nombre: c.nombre,
        usuario_condicion_id: c.usuario_condicion_id
      }));
      setCondicionesSeleccionadas(condicionesExistentes);
      setNuevasCondicionesSeleccionadas([...condicionesExistentes]);
    }
  }, [pacienteData?.condiciones]);

  useEffect(() => {
    const cargarUnidadesMedida = async () => {
      try {
        const response = await api.get('/unidades-medida/');
        if (response.data && Array.isArray(response.data)) {
          setUnidadesMedida(response.data);
        }
      } catch (error) {
        console.error('Error al cargar unidades de medida:', error);
      }
    };
    
    cargarUnidadesMedida();
  }, []);

  const activarEdicion = (campo) => {
    if (pacienteData?.perfil_medico && pacienteData.perfil_medico[campo]) {
      setTempValues(prev => ({
        ...prev,
        [campo]: campo === 'altura' 
          ? formatearAltura(pacienteData.perfil_medico[campo])
          : pacienteData.perfil_medico[campo].toString()
      }));
    }
    setEditMode(prev => ({
      ...prev,
      [campo]: true
    }));
  };

  const cancelarEdicion = (campo) => {
    setEditMode(prev => ({
      ...prev,
      [campo]: false
    }));
  };

  const guardarEdicion = async (campo) => {
    try {
      if (!pacienteData?.paciente?.id) {
        Alert.alert('Error', 'No se pudo identificar al paciente');
        return;
      }
      if (!tempValues[campo] || tempValues[campo].trim() === '') {
        Alert.alert('Error', 'El valor no puede estar vacío');
        return;
      }
      if (campo === 'peso' || campo === 'altura') {
        const valorNormalizado = normalizarDecimal(tempValues[campo]);
        setTempValues(prev => ({...prev, [campo]: valorNormalizado}));
        const valor = parseFloat(valorNormalizado);
        if (isNaN(valor) || valor <= 0) {
          Alert.alert('Error', `Por favor ingrese un valor válido para ${campo}`);
          return;
        }
        if (campo === 'peso' && (valor < 20 || valor > 300)) {
          Alert.alert('Error', 'El peso debe estar entre 20 y 300 kg');
          return;
        }
        if (campo === 'altura' && (valor < 0.5 || valor > 2.5)) {
          Alert.alert('Error', 'La altura debe estar entre 0.5 y 2.5 metros');
          return;
        }
      }
      const datosActualizados = {
        [campo]: campo === 'tipo_dialisis' 
          ? tempValues[campo] 
          : parseFloat(normalizarDecimal(tempValues[campo]))
      };
      setLoading(true);
      try {
        if (!pacienteData?.perfil_medico) {
          const datosIniciales = {
            peso: campo === 'peso' ? parseFloat(tempValues.peso) : 70,
            altura: campo === 'altura' ? parseFloat(tempValues.altura) : 1.70,
            tipo_dialisis: campo === 'tipo_dialisis' ? tempValues.tipo_dialisis : 'hemodialisis',
            nivel_actividad: campo === 'nivel_actividad' ? tempValues.nivel_actividad : 'sedentario',
          };
          const perfilCreado = await crearPerfilMedico(pacienteData.paciente.id, datosIniciales);
          const nuevosDatos = await cargarDatosPaciente();
          if (nuevosDatos) {
            setPacienteData(nuevosDatos);
          }
          Alert.alert(
            'Perfil Médico Creado', 
            'Se ha creado su perfil médico exitosamente.'
          );
        } else {
          const datosActualizados = {
            [campo]: campo === 'tipo_dialisis' || campo === 'nivel_actividad' 
              ? tempValues[campo] 
              : parseFloat(tempValues[campo])
          };
          if (pacienteData.paciente && pacienteData.paciente.id) {
            datosActualizados.id_persona = pacienteData.paciente.id;
          }
          const perfilActualizado = await actualizarPerfilMedico(pacienteData.perfil_medico.id, datosActualizados);
          const nuevosDatos = await cargarDatosPaciente();
          if (nuevosDatos) {
            setPacienteData(nuevosDatos);
          }
        }
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
        let errorMsg = 'No se pudo procesar la información médica. Verifique su conexión e intente nuevamente.';
        if (error.response) {
          if (error.response.data && typeof error.response.data === 'object') {
            const validationErrors = Object.entries(error.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            errorMsg = `Error de validación: ${validationErrors || 'Datos inválidos'}`;
          }
        }
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la información. Por favor revise los datos ingresados.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCondicionMedica = (condicion) => {
    setNuevasCondicionesSeleccionadas(prevSeleccionadas => {
      const yaSeleccionada = prevSeleccionadas.some(c => c.id === condicion.id);
      if (yaSeleccionada) {
        return prevSeleccionadas.filter(c => c.id !== condicion.id);
      } else {
        return [...prevSeleccionadas, condicion];
      }
    });
  };

  const guardarCondicionesMedicas = async () => {
    if (!pacienteData?.paciente?.id) {
      Alert.alert('Error', 'No se pudo identificar al paciente');
      return;
    }
    setLoading(true);
    try {
      const condicionesACrear = nuevasCondicionesSeleccionadas.filter(
        nueva => !condicionesSeleccionadas.some(actual => actual.id === nueva.id)
      );
      const condicionesAEliminar = condicionesSeleccionadas.filter(
        actual => !nuevasCondicionesSeleccionadas.some(nueva => nueva.id === actual.id)
      );
      const promesasCreacion = condicionesACrear.map(condicion => 
        vincularCondicionMedica(pacienteData.paciente.id, condicion.id)
      );
      const promesasEliminacion = condicionesAEliminar
        .filter(c => c.usuario_condicion_id)
        .map(condicion => eliminarCondicionMedica(condicion.usuario_condicion_id));
      await Promise.all([...promesasCreacion, ...promesasEliminacion]);
      await cargarDatosPaciente();
      setMostrarSelectorCondiciones(false);
      Alert.alert(
        'Condiciones guardadas', 
        'Las condiciones médicas han sido actualizadas correctamente.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las condiciones médicas');
    } finally {
      setLoading(false);
    }
  };

  const cancelarSeleccionCondiciones = () => {
    setNuevasCondicionesSeleccionadas(condicionesSeleccionadas);
    setMostrarSelectorCondiciones(false);
  };

  const fetchAlimentosRecientes = async (personaId) => {
    try {
      if (!personaId) {
        return;
      }
      const response = await api.get(`/registros-comida/?id_persona=${personaId}`);
      if (response.data && Array.isArray(response.data)) {
        // Ordenar los registros por fecha (más reciente primero)
        const registrosOrdenados = response.data.sort((a, b) => {
          const fechaA = new Date(a.fecha_consumo);
          const fechaB = new Date(b.fecha_consumo);
          return fechaB - fechaA; // Orden descendente
        }).slice(0, 5); // Tomar solo los 10 más recientes para procesar

        const registrosProcesados = await Promise.all(registrosOrdenados.map(async (registro) => {
          if (registro.alimento && (typeof registro.alimento === 'string' || typeof registro.alimento === 'number')) {
            try {
              const alimentoResponse = await api.get(`/alimentos/${registro.alimento}/`);
              let alimentoConCategoria = alimentoResponse.data;
              if (alimentoConCategoria.categoria && (typeof alimentoConCategoria.categoria === 'string' || typeof alimentoConCategoria.categoria === 'number')) {
                try {
                  const categoriaResponse = await api.get(`/categorias-alimento/${alimentoConCategoria.categoria}/`);
                  if (categoriaResponse.data && categoriaResponse.data.nombre) {
                    alimentoConCategoria.categoria = categoriaResponse.data;
                  }
                } catch (catError) {
                }
              }
              return {
                ...registro,
                alimento: alimentoConCategoria
              };
            } catch (error) {
              return registro;
            }
          }
          return registro;
        }));
        setRegistrosAlimenticios(registrosProcesados);
        calcularEstadisticasNutricionales(registrosProcesados);
      } else {
        setRegistrosAlimenticios([]);
      }
    } catch (error) {
      setRegistrosAlimenticios([]);
    }
  };

  const calcularEstadisticasNutricionales = (registros) => {
    if (!registros || registros.length === 0) return;
    const registrosPorFecha = registros.reduce((acc, registro) => {
      const fecha = registro.fecha_consumo.split('T')[0];
      if (!acc[fecha]) acc[fecha] = [];
      acc[fecha].push(registro);
      return acc;
    }, {});
    const fechas = Object.keys(registrosPorFecha);
    const cantidadDias = Math.min(fechas.length, 7);
    let totalCalorias = 0;
    let totalSodio = 0;
    let totalPotasio = 0;
    let totalFosforo = 0;
    fechas.slice(0, 7).forEach(fecha => {
      const registrosDia = registrosPorFecha[fecha];
      registrosDia.forEach(registro => {
        if (registro.alimento) {
          const alimento = typeof registro.alimento === 'object' 
            ? registro.alimento 
            : { energia: 0, sodio: 0, potasio: 0, fosforo: 0 };
          totalCalorias += alimento.energia || 0;
          totalSodio += alimento.sodio || 0;
          totalPotasio += alimento.potasio || 0;
          totalFosforo += alimento.fosforo || 0;
        }
      });
    });
    setEstadisticasNutricionales({
      caloriasDiarias: cantidadDias > 0 ? Math.round(totalCalorias / cantidadDias) : 0,
      sodioPromedio: cantidadDias > 0 ? Math.round(totalSodio / cantidadDias) : 0,
      potasioPromedio: cantidadDias > 0 ? Math.round(totalPotasio / cantidadDias) : 0,
      fosforoPromedio: cantidadDias > 0 ? Math.round(totalFosforo / cantidadDias) : 0,
    });
  };

  const getNivelNutriente = (valor, tipo) => {
    if (tipo === 'sodio') {
      if (valor < 1300) return { 
        nivel: 'Bajo', 
        color: '#4CAF50',  // Color original
        colorPastel: '#C8E6C9'  // Verde pastel
      };
      if (valor < 1700) return { 
        nivel: 'Medio', 
        color: '#FFC107',  // Color original
        colorPastel: '#FFF9C4'  // Amarillo pastel
      };
      return { 
        nivel: 'Alto', 
        color: '#F44336',  // Color original
        colorPastel: '#FFCDD2'  // Rojo pastel
      };
    }
    if (tipo === 'potasio') {
      if (valor < 1800) return { 
        nivel: 'Bajo', 
        color: '#4CAF50', 
        colorPastel: '#C8E6C9'  // Verde pastel
      };
      if (valor < 2000) return { 
        nivel: 'Medio', 
        color: '#FFC107', 
        colorPastel: '#FFF9C4'  // Amarillo pastel
      };
      return { 
        nivel: 'Alto', 
        color: '#F44336', 
        colorPastel: '#FFCDD2'  // Rojo pastel
      };
    }
    if (tipo === 'fosforo') {
      if (valor < 800) return { 
        nivel: 'Bajo', 
        color: '#4CAF50', 
        colorPastel: '#C8E6C9'  // Verde pastel
      };
      if (valor < 1000) return { 
        nivel: 'Medio', 
        color: '#FFC107', 
        colorPastel: '#FFF9C4'  // Amarillo pastel
      };
      return { 
        nivel: 'Alto', 
        color: '#F44336', 
        colorPastel: '#FFCDD2'  // Rojo pastel
      };
    }
    return { 
      nivel: 'Normal', 
      color: '#4CAF50', 
      colorPastel: '#C8E6C9'  // Verde pastel por defecto
    };
  };

  const computeAdjustedValues = (alimento, unidadId) => {
    if (!alimento) return { energia: 0, sodio: 0, potasio: 0, fosforo: 0 };
    const unidad = unidadesMedida.find(u => u.id === unidadId);
    let factor = 1;
    if (unidad) {
      if (unidad.es_volumen && unidad.equivalencia_ml) {
        factor = Number(unidad.equivalencia_ml) / 100;
      } else if (!unidad.es_volumen && unidad.equivalencia_g) {
        factor = Number(unidad.equivalencia_g) / 100;
      }
    }
    return {
      energia: alimento.energia ? Math.round(alimento.energia * factor) : 0,
      sodio: alimento.sodio ? Math.round(alimento.sodio * factor) : 0,
      potasio: alimento.potasio ? Math.round(alimento.potasio * factor) : 0,
      fosforo: alimento.fosforo ? Math.round(alimento.fosforo * factor) : 0,
    };
  };

  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tus fotos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoPreview(result.assets[0].uri);
        setShowPhotoOptions(false);
        uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Intente nuevamente.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para usar la cámara.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotoPreview(result.assets[0].uri);
        setShowPhotoOptions(false);
        uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto. Intente nuevamente.');
    }
  };

  const uploadProfileImage = async (imageUri) => {
    if (!pacienteData?.paciente?.id) {
      Alert.alert('Error', 'No se pudo identificar al usuario.');
      return;
    }
    if (!imageUri.startsWith('file://')) {
      Alert.alert("Imagen inválida", "Seleccione una imagen válida diferente a la predeterminada.");
      return;
    }
    try {
      setUploadingPhoto(true);
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageData = {
        id_persona: pacienteData.paciente.id,
        imagen: `data:image/jpeg;base64,${base64Image}`
      };
      const response = await api.post('/actualizar-foto-perfil/', imageData);
      await cargarDatosPaciente();
      Alert.alert('Éxito', 'La foto de perfil se ha actualizado correctamente.');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          Alert.alert('Error de permisos', 'No tiene autorización para cambiar esta foto de perfil.');
        } else if (error.response.status === 401) {
          Alert.alert('Sesión expirada', 'Por favor, inicie sesión nuevamente.');
        } else {
          Alert.alert('Error', error.response.data.error || 'No se pudo actualizar la foto de perfil.');
        }
      } else {
        Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. Verifique su conexión a internet.');
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const showPhotoOptionsMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tomar foto', 'Seleccionar de la galería'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleTakePhoto();
          else if (buttonIndex === 2) handleSelectImage();
        }
      );
    } else {
      setShowPhotoOptions(true);
    }
  };

  return {
    loading,
    error,
    refreshing,
    userRole,
    pacienteData,
    editMode,
    tempValues,
    condicionesDisponibles,
    condicionesSeleccionadas,
    mostrarSelectorCondiciones,
    nuevaCondicion,
    crearCondicionMode,
    nuevasCondicionesSeleccionadas,
    linkedPatients,
    selectedPatientId,
    newPatientCode,
    linkingError,
    linkingSuccess,
    registrosAlimenticios,
    estadisticasNutricionales,
    showPhotoOptions,
    uploadingPhoto,
    photoPreview,
    unidadesMedida,
    currentPersonaId,
    onRefresh,
    cargarDatosPaciente,
    activarEdicion,
    cancelarEdicion,
    guardarEdicion,
    toggleCondicionMedica,
    guardarCondicionesMedicas,
    cancelarSeleccionCondiciones,
    setMostrarSelectorCondiciones,
    setNuevaCondicion,
    setCrearCondicionMode,
    crearNuevaCondicion,
    handleLinkPatient,
    setNewPatientCode,
    selectPatient,
    goBackToPatientList,
    getNivelNutriente,
    computeAdjustedValues,
    handleSelectImage,
    handleTakePhoto,
    showPhotoOptionsMenu,
    setShowPhotoOptions,
    setTempValues  // Añadimos setTempValues al objeto de retorno
  };
}