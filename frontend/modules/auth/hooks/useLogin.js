import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native'; // Agregar Platform
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../api';
import { getUserRoles, determinePrimaryRole, assignRoleToUser } from '../../../services/userService';

export default function useLogin(navigation) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loginMethod, setLoginMethod] = useState('rut');
  const [selectedRole, setSelectedRole] = useState('paciente');
  const [selectedGender, setSelectedGender] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    rut: '',
    password: '',
    nombres: '',
    apellidos: '',
    edad: '',
    genero: '',
    fecha_nacimiento: new Date(),
    foto_perfil: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
  });

  // Verificar si el usuario ya tiene una sesión activa
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('userToken');
      console.log('Token:', token);
      if (token) {
        navigation.navigate('Home');
      }
    };
    checkToken();
  }, []);

  // Actualizar el género en formData cuando cambia selectedGender
  useEffect(() => {
    if (selectedGender) {
      setFormData(prev => ({
        ...prev,
        genero: selectedGender
      }));
    }
  }, [selectedGender]);

  // Manejar cambio de fecha de nacimiento
  const handleDateChange = (selectedDate) => {
    const currentDate = selectedDate || formData.fecha_nacimiento;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({...formData, fecha_nacimiento: currentDate});

    // Calcular edad automáticamente
    if (selectedDate) {
      const today = new Date();
      let age = today.getFullYear() - selectedDate.getFullYear();
      const monthDiff = today.getMonth() - selectedDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
        age--;
      }
      setFormData(prev => ({...prev, edad: age.toString()}));
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (isLogin) {
      if (loginMethod === 'email') {
        if (!formData.email || !formData.password) {
          Alert.alert('Error', 'Por favor ingrese email y contraseña');
          return false;
        }
        // Validación básica de email
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          Alert.alert('Error', 'Por favor ingrese un email válido');
          return false;
        }
      } else { // loginMethod === 'rut'
        if (!formData.rut || !formData.password) {
          Alert.alert('Error', 'Por favor ingrese RUT y contraseña');
          return false;
        }
        // Validación básica de RUT (solo números)
        if (!/^\d+$/.test(formData.rut)) {
          Alert.alert('Error', 'El RUT debe contener solo números');
          return false;
        }
      }
    } else { // registro
      // Solo validar campos esenciales: email, password y rut
      if (!formData.email || !formData.password || !formData.rut || !formData.nombres || !formData.apellidos) {
        Alert.alert('Error', 'Por favor complete los campos obligatorios: email, contraseña, RUT, nombres y apellidos');
        return false;
      }
      
      // Validación básica de RUT (solo números)
      if (!/^\d+$/.test(formData.rut)) {
        Alert.alert('Error', 'El RUT debe contener solo números');
        return false;
      }
      
      // Validación básica de email
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        Alert.alert('Error', 'Por favor ingrese un email válido');
        return false;
      }
    }
    return true;
  };

  // Manejar acción de envío (login o registro)
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Preparar datos de login según el método seleccionado
        const loginData = {
          password: formData.password
        };
        
        // Añadir email o rut según el método seleccionado
        if (loginMethod === 'email') {
          loginData.email = formData.email;
        } else {
          loginData.rut = formData.rut;
        }
        
        // Enviar solicitud de login
        console.log('Sending login request with:', loginData);
        const response = await api.post('/token/', loginData);
        
        // Guardar token y datos de usuario
        await AsyncStorage.setItem('userToken', response.data.token);
        
        // Crear objeto de datos de usuario sin rol (se determinará después)
        const userData = {
          user_id: response.data.user_id,
          email: response.data.email,
          persona_id: response.data.persona_id,
          // El rol se establecerá después de la verificación
        };
        
        // Procedimiento mejorado para detección de roles
        console.log('🔍 INITIATING ROLE DETECTION PROCEDURE');
        if (response.data.persona_id) {
          try {
            console.log(`🔍 Step 1: Getting roles for persona_id: ${response.data.persona_id}`);
            const rolesResponse = await getUserRoles(response.data.persona_id);
            console.log(`🔍 Step 2: API returned ${rolesResponse?.length || 0} roles`);
            
            if (rolesResponse && Array.isArray(rolesResponse) && rolesResponse.length > 0) {
              console.log('🔍 Step 3: Analyzing received roles:');
              
              // Registrar cada rol para depuración
              rolesResponse.forEach((role, index) => {
                if (role && role.rol) {
                  console.log(`🔍 Role #${index+1}: ID=${role.rol.id}, Name=${role.rol.nombre || 'undefined'}`);
                } else {
                  console.log(`🔍 Role #${index+1} has invalid structure:`, role);
                }
              });
              
              // Verificar si el usuario tiene ambos roles y obtener preferencia guardada
              const hasCuidadorRole = rolesResponse.some(role => role?.rol?.id === 2);
              const hasPacienteRole = rolesResponse.some(role => role?.rol?.id === 1);
              
              if (hasCuidadorRole && hasPacienteRole) {
                console.log('🔍 User has both paciente and cuidador roles');
                
                // Verificar si el usuario tiene una preferencia de prioridad de rol guardada
                const savedPriority = await AsyncStorage.getItem('rolePriority');
                if (savedPriority) {
                  console.log(`🔍 Found saved role priority: ${savedPriority}`);
                  
                  // Anular el comportamiento predeterminado con la preferencia del usuario
                  userData.role = savedPriority;
                  console.log(`🔍 Using saved priority: ${savedPriority}`);
                } else {
                  // Usar determinación predeterminada
                  userData.role = determinePrimaryRole(rolesResponse);
                  console.log(`🔍 Using default priority: ${userData.role}`);
                }
              } else {
                // Solo un rol, usar determinación estándar
                userData.role = determinePrimaryRole(rolesResponse);
              }
              
              console.log(`🔍 Step 4: Final role determined: "${userData.role}"`);
            } else {
              console.log('🔍 Step 3: No valid roles found, defaulting to "paciente"');
              userData.role = 'paciente';
            }
          } catch (roleError) {
            console.error('Error getting roles:', roleError);
            console.error('Error stack trace:', roleError.stack);
            userData.role = 'paciente';  // Rol predeterminado en caso de error
          }
        }
        
        // Guardar el rol en AsyncStorage y confirmar lo que se guardó
        console.log(`🔍 Step 6: FINAL ROLE BEING SAVED: "${userData.role}" for user ${userData.user_id}`);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        // Verificar lo que se guardó
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          const parsedData = JSON.parse(savedUserData);
          console.log('🔍 VERIFICATION - userData saved in AsyncStorage:', parsedData);
          console.log(`🔍 VERIFICATION - Saved role: "${parsedData.role}"`);
        }
        
        // Navegar a Home
        navigation.navigate('Home');
      } else {
        // Lógica de registro modificada para incluir el rol
        const registerData = {
          ...formData,
          rut: parseInt(formData.rut)
        };
        
        // Agregar la fecha solo si se ha seleccionado
        if (formData.fecha_nacimiento) {
          registerData.fecha_nacimiento = formatDateToDDMMYYYY(formData.fecha_nacimiento);
        }
        
        // Convertir la edad a número solo si está presente
        if (formData.edad) {
          registerData.edad = parseInt(formData.edad);
        }
        
        console.log('Sending registration data:', registerData);
        console.log('Selected role:', selectedRole);
        
        const response = await api.post('/register/', registerData);
        
        console.log('Registration success:', response.data);
        
        // Vincular el rol seleccionado con mejor manejo de errores y verificación
        if (response.data.persona_id) {
          try {
            // Obtener todos los roles disponibles
            console.log('Fetching available roles...');
            const rolResponse = await api.get('/roles/');
            console.log('Available roles:', rolResponse.data);
            const roles = rolResponse.data;
            
            // Buscar el rol de forma más robusta (insensible a mayúsculas/minúsculas)
            const rolSeleccionado = roles.find(r => 
              r.nombre.toLowerCase() === selectedRole.toLowerCase()
            );
            
            console.log('Selected role object:', rolSeleccionado);
            
            if (rolSeleccionado) {
              // Usar la función assignRoleToUser en lugar de la llamada a API directa
              await assignRoleToUser(response.data.persona_id, rolSeleccionado.id);
              console.log(`Usuario vinculado exitosamente como ${selectedRole} (ID: ${rolSeleccionado.id})`);
            } else {
              console.error('No se encontró el rol seleccionado:', selectedRole);
              console.error('Roles disponibles:', roles.map(r => r.nombre));
              
              // Intento de recuperación - asignar rol por ID directo según el seleccionado
              const defaultRolId = selectedRole === 'cuidador' ? 2 : 1;
              
              console.log(`Intentando asignar rol por ID directo: ${defaultRolId}`);
              
              await api.post('/usuario-roles/', {
                id_persona: response.data.persona_id,
                rol: defaultRolId
              });
            }
          } catch (rolError) {
            console.error('Error detallado al vincular el rol:', rolError);
            console.error('Response data if available:', rolError.response?.data);
          }
        }
        
        // Mostrar alerta de éxito y luego iniciar sesión automáticamente
        Alert.alert(
          'Registro Exitoso', 
          '¡Su cuenta ha sido creada correctamente!',
          [{ 
            text: 'Continuar', 
            onPress: async () => {
              try {
                // Iniciar sesión automáticamente usando el RUT y contraseña proporcionados
                const loginResponse = await api.post('/token/', {
                  rut: registerData.rut,
                  password: registerData.password
                });
                
                // Guardar token y datos del usuario
                await AsyncStorage.setItem('userToken', loginResponse.data.token);
                
                // Guardar datos adicionales del usuario incluyendo el rol explícitamente
                const userData = {
                  user_id: loginResponse.data.user_id,
                  email: loginResponse.data.email,
                  persona_id: loginResponse.data.persona_id,
                  role: selectedRole // Agregar el rol explícitamente
                };
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                
                console.log('Saved user data with explicit role:', userData);
                
                // Redireccionar al Home
                navigation.navigate('Home');
              } catch (loginError) {
                console.error('Error en inicio de sesión automático:', loginError);
                // Si falla el inicio de sesión automático, regresar a la pantalla de login
                setIsLogin(true);
              }
            }
          }]
        );
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Ha ocurrido un error. Por favor intente nuevamente.';
      
      if (error.response) {
        console.log('Error data:', error.response.data);
        if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          errorMessage = 'Datos de registro inválidos. Por favor verifique la información ingresada.';
        } else if (error.response.status === 409) {
          errorMessage = 'Este usuario ya existe. Por favor intente con otro email o RUT.';
        }
      }
      
      Alert.alert(isLogin ? 'Error de inicio de sesión' : 'Error de registro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha a DD-MM-YYYY
  const formatDateToDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return {
    isLogin,
    setIsLogin,
    loading,
    showDatePicker,
    setShowDatePicker,
    loginMethod,
    setLoginMethod,
    selectedRole,
    setSelectedRole,
    selectedGender,
    setSelectedGender,
    formData,
    setFormData,
    handleDateChange,
    handleSubmit,
    formatDateToDDMMYYYY
  };
}
